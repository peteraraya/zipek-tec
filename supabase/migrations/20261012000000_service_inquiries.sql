create type public.service_inquiry_source as enum ('web', 'whatsapp');
create type public.service_inquiry_status as enum (
  'new',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed'
);

create table public.service_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_number text not null unique,
  source public.service_inquiry_source not null,
  status public.service_inquiry_status not null default 'new',
  topic text not null,
  message text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  contact_consent boolean not null default false,
  created_by uuid references public.admin_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(topic) between 3 and 100),
  check (length(message) between 10 and 3000),
  check (contact_name is null or length(contact_name) <= 160),
  check (contact_phone is null or length(contact_phone) between 6 and 40),
  check (contact_email is null or length(contact_email) <= 254),
  check (
    (contact_consent and (contact_phone is not null or contact_email is not null))
    or (
      not contact_consent
      and contact_name is null
      and contact_phone is null
      and contact_email is null
    )
  ),
  check (
    (source = 'web' and created_by is null)
    or (source = 'whatsapp' and created_by is not null)
  )
);

create index service_inquiries_updated_idx
  on public.service_inquiries (updated_at desc);

create table public.service_inquiry_events (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.service_inquiries (id) on delete cascade,
  event_type text not null check (event_type in ('created', 'status_changed', 'note_added')),
  previous_status public.service_inquiry_status,
  new_status public.service_inquiry_status,
  summary text not null check (length(summary) between 1 and 3000),
  created_by uuid references public.admin_profiles (id),
  created_at timestamptz not null default now()
);

create index service_inquiry_events_timeline_idx
  on public.service_inquiry_events (inquiry_id, created_at desc);

create trigger service_inquiries_set_updated_at
before update on public.service_inquiries
for each row execute function public.set_updated_at();

create or replace function public.submit_public_service_inquiry(
  p_topic text,
  p_message text,
  p_contact_name text default null,
  p_contact_phone text default null,
  p_contact_email text default null,
  p_contact_consent boolean default false
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inquiry_id uuid := gen_random_uuid();
  v_inquiry_number text := 'CONS-' || upper(replace(gen_random_uuid()::text, '-', ''));
  v_topic text := nullif(btrim(p_topic), '');
  v_message text := nullif(btrim(p_message), '');
  v_name text := nullif(btrim(p_contact_name), '');
  v_phone text := nullif(btrim(p_contact_phone), '');
  v_email text := nullif(lower(btrim(p_contact_email)), '');
begin
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') then
    raise exception 'No autorizado.';
  end if;

  if v_topic is null or length(v_topic) not between 3 and 100 then
    raise exception 'El tema debe tener entre 3 y 100 caracteres.';
  end if;
  if v_message is null or length(v_message) not between 10 and 3000 then
    raise exception 'La consulta debe tener entre 10 y 3000 caracteres.';
  end if;
  if v_name is not null and length(v_name) > 160 then
    raise exception 'El nombre supera el largo permitido.';
  end if;
  if v_phone is not null and length(v_phone) not between 6 and 40 then
    raise exception 'El teléfono no es válido.';
  end if;
  if v_email is not null and (
    length(v_email) > 254
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) then
    raise exception 'El correo no es válido.';
  end if;
  if (
    v_name is not null or v_phone is not null or v_email is not null
  ) and (
    p_contact_consent is distinct from true
    or (v_phone is null and v_email is null)
  ) then
    raise exception 'Para guardar datos de contacto se requiere autorización y un teléfono o correo.';
  end if;
  if p_contact_consent is true and v_phone is null and v_email is null then
    raise exception 'Indica un teléfono o correo para autorizar el contacto.';
  end if;
  if p_contact_consent is distinct from true then
    v_name := null;
    v_phone := null;
    v_email := null;
  end if;

  insert into public.service_inquiries (
    id,
    inquiry_number,
    source,
    topic,
    message,
    contact_name,
    contact_phone,
    contact_email,
    contact_consent
  )
  values (
    v_inquiry_id,
    v_inquiry_number,
    'web',
    v_topic,
    v_message,
    v_name,
    v_phone,
    v_email,
    coalesce(p_contact_consent, false)
  );

  insert into public.service_inquiry_events (inquiry_id, event_type, summary)
  values (v_inquiry_id, 'created', 'Consulta recibida desde el formulario web.');

  return v_inquiry_number;
end;
$$;

create or replace function public.create_whatsapp_service_inquiry(
  p_topic text,
  p_message text,
  p_contact_name text default null,
  p_contact_phone text default null,
  p_contact_email text default null,
  p_contact_consent boolean default false
)
returns table (id uuid, inquiry_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_inquiry_id uuid := gen_random_uuid();
  v_inquiry_number text := 'CONS-' || upper(replace(gen_random_uuid()::text, '-', ''));
  v_topic text := nullif(btrim(p_topic), '');
  v_message text := nullif(btrim(p_message), '');
  v_name text := nullif(btrim(p_contact_name), '');
  v_phone text := nullif(btrim(p_contact_phone), '');
  v_email text := nullif(lower(btrim(p_contact_email)), '');
begin
  if not public.is_active_staff() then
    raise exception 'No autorizado.';
  end if;
  if v_topic is null or length(v_topic) not between 3 and 100 then
    raise exception 'El tema debe tener entre 3 y 100 caracteres.';
  end if;
  if v_message is null or length(v_message) not between 10 and 3000 then
    raise exception 'La consulta debe tener entre 10 y 3000 caracteres.';
  end if;
  if v_name is not null and length(v_name) > 160 then
    raise exception 'El nombre supera el largo permitido.';
  end if;
  if v_phone is not null and length(v_phone) not between 6 and 40 then
    raise exception 'El teléfono no es válido.';
  end if;
  if v_email is not null and (
    length(v_email) > 254
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) then
    raise exception 'El correo no es válido.';
  end if;
  if (
    v_name is not null or v_phone is not null or v_email is not null
  ) and (
    p_contact_consent is distinct from true
    or (v_phone is null and v_email is null)
  ) then
    raise exception 'Confirma que la persona autorizó el uso de sus datos para responder esta consulta.';
  end if;
  if p_contact_consent is true and v_phone is null and v_email is null then
    raise exception 'Indica un teléfono o correo para confirmar la autorización.';
  end if;
  if p_contact_consent is distinct from true then
    v_name := null;
    v_phone := null;
    v_email := null;
  end if;

  insert into public.service_inquiries (
    id,
    inquiry_number,
    source,
    topic,
    message,
    contact_name,
    contact_phone,
    contact_email,
    contact_consent,
    created_by
  )
  values (
    v_inquiry_id,
    v_inquiry_number,
    'whatsapp',
    v_topic,
    v_message,
    v_name,
    v_phone,
    v_email,
    coalesce(p_contact_consent, false),
    v_actor_id
  );

  insert into public.service_inquiry_events (
    inquiry_id,
    event_type,
    summary,
    created_by
  )
  values (
    v_inquiry_id,
    'created',
    'Consulta de WhatsApp registrada manualmente.',
    v_actor_id
  );

  return query select v_inquiry_id, v_inquiry_number;
end;
$$;

create or replace function public.update_service_inquiry_status(
  p_inquiry_id uuid,
  p_status public.service_inquiry_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_previous_status public.service_inquiry_status;
begin
  if not public.is_active_staff() then
    raise exception 'No autorizado.';
  end if;

  select status into v_previous_status
  from public.service_inquiries
  where id = p_inquiry_id
  for update;

  if not found then
    raise exception 'La consulta no existe.';
  end if;
  if v_previous_status = p_status then
    return;
  end if;

  update public.service_inquiries
  set status = p_status
  where id = p_inquiry_id;

  insert into public.service_inquiry_events (
    inquiry_id,
    event_type,
    previous_status,
    new_status,
    summary,
    created_by
  )
  values (
    p_inquiry_id,
    'status_changed',
    v_previous_status,
    p_status,
    'Estado actualizado.',
    v_actor_id
  );
end;
$$;

create or replace function public.add_service_inquiry_note(
  p_inquiry_id uuid,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_note text := nullif(btrim(p_note), '');
begin
  if not public.is_active_staff() then
    raise exception 'No autorizado.';
  end if;
  if v_note is null or length(v_note) not between 3 and 3000 then
    raise exception 'La nota debe tener entre 3 y 3000 caracteres.';
  end if;
  if not exists (select 1 from public.service_inquiries where id = p_inquiry_id) then
    raise exception 'La consulta no existe.';
  end if;

  update public.service_inquiries
  set updated_at = now()
  where id = p_inquiry_id;

  insert into public.service_inquiry_events (
    inquiry_id,
    event_type,
    summary,
    created_by
  )
  values (p_inquiry_id, 'note_added', v_note, v_actor_id);
end;
$$;

alter table public.service_inquiries enable row level security;
alter table public.service_inquiry_events enable row level security;

create policy "Active staff can read service inquiries"
  on public.service_inquiries for select to authenticated
  using (public.is_active_staff());

create policy "Active staff can read inquiry events"
  on public.service_inquiry_events for select to authenticated
  using (public.is_active_staff());

revoke all on public.service_inquiries, public.service_inquiry_events from anon;
grant select on public.service_inquiries, public.service_inquiry_events to authenticated;

revoke all on function public.submit_public_service_inquiry(
  text, text, text, text, text, boolean
) from public;
revoke all on function public.create_whatsapp_service_inquiry(
  text, text, text, text, text, boolean
) from public, anon;
revoke all on function public.update_service_inquiry_status(
  uuid, public.service_inquiry_status
) from public, anon;
revoke all on function public.add_service_inquiry_note(uuid, text) from public, anon;

grant execute on function public.submit_public_service_inquiry(
  text, text, text, text, text, boolean
) to anon, authenticated;
grant execute on function public.create_whatsapp_service_inquiry(
  text, text, text, text, text, boolean
) to authenticated;
grant execute on function public.update_service_inquiry_status(
  uuid, public.service_inquiry_status
) to authenticated;
grant execute on function public.add_service_inquiry_note(uuid, text) to authenticated;
