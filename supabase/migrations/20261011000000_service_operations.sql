create type public.service_status as enum (
  'received',
  'diagnosis',
  'awaiting_approval',
  'in_progress',
  'ready',
  'delivered',
  'cancelled'
);

create type public.service_priority as enum ('standard', 'urgent');
create type public.event_visibility as enum ('internal', 'public');

create table public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role text not null default 'operator' check (role in ('admin', 'operator')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  rut text,
  phone text not null,
  email text,
  address text,
  notes text,
  archived_at timestamptz,
  created_by uuid not null references public.admin_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(full_name) between 2 and 160),
  check (length(phone) between 6 and 40),
  check (rut is null or length(rut) <= 20),
  check (email is null or length(email) <= 254),
  check (address is null or length(address) <= 300),
  check (notes is null or length(notes) <= 2000)
);

create index clients_full_name_idx on public.clients (full_name);
create unique index clients_rut_unique_idx on public.clients (rut) where rut is not null;

create sequence public.service_order_number_seq;

create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  client_id uuid not null references public.clients (id),
  service_type text not null,
  service_description text not null,
  status public.service_status not null default 'received',
  priority public.service_priority not null default 'standard',
  quoted_amount numeric(12, 2) check (quoted_amount is null or quoted_amount >= 0),
  payment_method text,
  equipment_brand text,
  equipment_model text,
  equipment_serial text,
  reported_problem text not null,
  diagnosis text,
  authorized_work text not null,
  backup_status text not null default 'pending'
    check (backup_status in ('pending', 'completed', 'declined', 'not_required')),
  backup_details text,
  initial_condition text,
  software_installed jsonb not null default '[]'::jsonb,
  recommendations text,
  warranty_days integer not null default 15 check (warranty_days between 0 and 365),
  public_message text,
  received_at timestamptz not null default now(),
  delivered_at timestamptz,
  created_by uuid not null references public.admin_profiles (id),
  updated_at timestamptz not null default now()
);

create index service_orders_client_id_idx on public.service_orders (client_id);
create index service_orders_status_updated_idx on public.service_orders (status, updated_at desc);

create table public.service_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders (id) on delete cascade,
  event_type text not null check (event_type in ('created', 'status_changed', 'task_logged', 'report_updated')),
  previous_status public.service_status,
  new_status public.service_status,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  visibility public.event_visibility not null default 'internal',
  created_by uuid references public.admin_profiles (id),
  created_at timestamptz not null default now()
);

create index service_order_events_order_created_idx
  on public.service_order_events (order_id, created_at desc);

create table public.service_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders (id) on delete cascade,
  description text not null,
  completed boolean not null default true,
  completed_at timestamptz,
  created_by uuid not null references public.admin_profiles (id),
  created_at timestamptz not null default now(),
  check ((completed and completed_at is not null) or (not completed and completed_at is null))
);

create index service_tasks_order_created_idx on public.service_tasks (order_id, created_at desc);

create table public.service_order_revisions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders (id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  snapshot jsonb not null,
  created_by uuid not null references public.admin_profiles (id),
  created_at timestamptz not null default now(),
  unique (order_id, revision_number)
);

create index service_order_revisions_order_created_idx
  on public.service_order_revisions (order_id, revision_number desc);

create table public.service_tracking_tokens (
  order_id uuid primary key references public.service_orders (id) on delete cascade,
  token_hash text not null unique,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.active
  );
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.active
      and p.role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger service_orders_set_updated_at
before update on public.service_orders
for each row execute function public.set_updated_at();

create or replace function public.create_service_order(
  p_client_id uuid,
  p_service_type text,
  p_service_description text,
  p_priority public.service_priority,
  p_quoted_amount numeric,
  p_payment_method text,
  p_equipment_brand text,
  p_equipment_model text,
  p_equipment_serial text,
  p_reported_problem text,
  p_authorized_work text,
  p_backup_status text,
  p_initial_condition text,
  p_warranty_days integer,
  p_tracking_token_hash text
)
returns table (id uuid, order_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_staff_id uuid := (select auth.uid());
begin
  if not public.is_active_staff() then
    raise exception 'Not authorized';
  end if;

  if p_service_type is null or length(trim(p_service_type)) not between 2 and 100
     or p_service_description is null or length(trim(p_service_description)) not between 3 and 2000
     or p_reported_problem is null or length(trim(p_reported_problem)) not between 3 and 2000
     or p_authorized_work is null or length(trim(p_authorized_work)) not between 3 and 2000
     or (p_payment_method is not null and length(trim(p_payment_method)) > 80)
     or (p_equipment_brand is not null and length(trim(p_equipment_brand)) > 100)
     or (p_equipment_model is not null and length(trim(p_equipment_model)) > 100)
     or (p_equipment_serial is not null and length(trim(p_equipment_serial)) > 120)
     or (p_initial_condition is not null and length(trim(p_initial_condition)) > 2000)
     or (p_quoted_amount is not null and p_quoted_amount < 0)
     or p_warranty_days not between 0 and 365
     or p_backup_status not in ('pending', 'completed', 'declined', 'not_required') then
    raise exception 'Invalid service order data';
  end if;

  if p_tracking_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid tracking token hash';
  end if;

  if not exists (
    select 1
    from public.clients c
    where c.id = p_client_id and c.archived_at is null
  ) then
    raise exception 'Active client not found';
  end if;

  v_order_number := 'ZI-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.service_order_number_seq')::text, 5, '0');

  insert into public.service_orders (
    id, order_number, client_id, service_type, service_description, priority,
    quoted_amount, payment_method, equipment_brand, equipment_model,
    equipment_serial, reported_problem, authorized_work, backup_status,
    initial_condition, warranty_days, created_by
  ) values (
    v_order_id, v_order_number, p_client_id, trim(p_service_type),
    trim(p_service_description), p_priority, p_quoted_amount,
    nullif(trim(p_payment_method), ''), nullif(trim(p_equipment_brand), ''),
    nullif(trim(p_equipment_model), ''), nullif(trim(p_equipment_serial), ''),
    trim(p_reported_problem), trim(p_authorized_work), p_backup_status,
    nullif(trim(p_initial_condition), ''), p_warranty_days, v_staff_id
  );

  insert into public.service_tracking_tokens (order_id, token_hash)
  values (v_order_id, p_tracking_token_hash);

  insert into public.service_order_events (
    order_id, event_type, new_status, summary, visibility, created_by
  ) values (
    v_order_id, 'created', 'received', 'Orden de servicio recibida',
    'public', v_staff_id
  );

  insert into public.service_order_revisions (order_id, revision_number, snapshot, created_by)
  values (
    v_order_id,
    1,
    jsonb_build_object(
      'diagnosis', null,
      'backup_status', p_backup_status,
      'backup_details', null,
      'software_installed', '[]'::jsonb,
      'recommendations', null
    ),
    v_staff_id
  );

  return query select v_order_id, v_order_number;
end;
$$;

create or replace function public.update_service_order_status(
  p_order_id uuid,
  p_status public.service_status,
  p_public_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous_status public.service_status;
  v_staff_id uuid := (select auth.uid());
  v_summary text;
begin
  if not public.is_active_staff() then
    raise exception 'Not authorized';
  end if;

  select o.status into v_previous_status
  from public.service_orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Service order not found';
  end if;

  if p_public_message is not null and length(trim(p_public_message)) > 500 then
    raise exception 'Public message is too long';
  end if;

  if v_previous_status = p_status then
    raise exception 'Status has not changed';
  end if;

  update public.service_orders
  set status = p_status,
      public_message = nullif(trim(p_public_message), ''),
      delivered_at = case when p_status = 'delivered' then now() else delivered_at end
  where id = p_order_id;

  v_summary := case p_status
    when 'received' then 'Servicio recibido'
    when 'diagnosis' then 'Diagnóstico en curso'
    when 'awaiting_approval' then 'Esperando aprobación'
    when 'in_progress' then 'Trabajo en curso'
    when 'ready' then 'Equipo listo para entrega'
    when 'delivered' then 'Servicio entregado'
    when 'cancelled' then 'Servicio cancelado'
  end;

  insert into public.service_order_events (
    order_id, event_type, previous_status, new_status, summary,
    details, visibility, created_by
  ) values (
    p_order_id, 'status_changed', v_previous_status, p_status, v_summary,
    jsonb_build_object('public_message', nullif(trim(p_public_message), '')),
    'public', v_staff_id
  );
end;
$$;

create or replace function public.log_service_task(
  p_order_id uuid,
  p_description text,
  p_completed boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_task_id uuid := gen_random_uuid();
  v_staff_id uuid := (select auth.uid());
begin
  if not public.is_active_staff() then
    raise exception 'Not authorized';
  end if;

  if not exists (select 1 from public.service_orders o where o.id = p_order_id) then
    raise exception 'Service order not found';
  end if;

  if length(trim(p_description)) not between 3 and 1000 then
    raise exception 'Task description is required';
  end if;

  insert into public.service_tasks (
    id, order_id, description, completed, completed_at, created_by
  ) values (
    v_task_id, p_order_id, trim(p_description), p_completed,
    case when p_completed then now() else null end, v_staff_id
  );

  insert into public.service_order_events (
    order_id, event_type, summary, details, visibility, created_by
  ) values (
    p_order_id, 'task_logged',
    case when p_completed then 'Tarea completada' else 'Tarea registrada' end,
    jsonb_build_object('description', trim(p_description), 'completed', p_completed),
    'internal', v_staff_id
  );

  return v_task_id;
end;
$$;

create or replace function public.update_service_report(
  p_order_id uuid,
  p_diagnosis text,
  p_backup_status text,
  p_backup_details text,
  p_software_installed jsonb,
  p_recommendations text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_revision integer;
begin
  if not public.is_active_staff() then
    raise exception 'Not authorized';
  end if;

  if p_backup_status not in ('pending', 'completed', 'declined', 'not_required') then
    raise exception 'Invalid backup status';
  end if;

  if (p_diagnosis is not null and length(trim(p_diagnosis)) > 4000)
     or (p_backup_details is not null and length(trim(p_backup_details)) > 2000)
     or (p_recommendations is not null and length(trim(p_recommendations)) > 4000) then
    raise exception 'Report text is too long';
  end if;

  if p_software_installed is null
     or jsonb_typeof(p_software_installed) is distinct from 'array' then
    raise exception 'Invalid software list';
  end if;
  if jsonb_array_length(p_software_installed) > 50 or exists (
    select 1
    from jsonb_array_elements(p_software_installed) as item(program)
    where jsonb_typeof(program) is distinct from 'object'
      or jsonb_typeof(program -> 'name') is distinct from 'string'
      or jsonb_typeof(program -> 'license_type') is distinct from 'string'
      or jsonb_typeof(program -> 'notes') is distinct from 'string'
      or length(program ->> 'name') not between 1 and 120
      or length(program ->> 'license_type') > 80
      or length(program ->> 'notes') > 500
  ) then
    raise exception 'Invalid software list';
  end if;

  perform 1
  from public.service_orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Service order not found';
  end if;

  update public.service_orders
  set diagnosis = nullif(trim(p_diagnosis), ''),
      backup_status = p_backup_status,
      backup_details = nullif(trim(p_backup_details), ''),
      software_installed = p_software_installed,
      recommendations = nullif(trim(p_recommendations), '')
  where id = p_order_id;

  if not found then
    raise exception 'Service order not found';
  end if;

  select coalesce(max(r.revision_number), 0) + 1 into v_revision
  from public.service_order_revisions r
  where r.order_id = p_order_id;

  insert into public.service_order_revisions (order_id, revision_number, snapshot, created_by)
  select
    o.id,
    v_revision,
    jsonb_build_object(
      'diagnosis', o.diagnosis,
      'backup_status', o.backup_status,
      'backup_details', o.backup_details,
      'software_installed', o.software_installed,
      'recommendations', o.recommendations
    ),
    (select auth.uid())
  from public.service_orders o
  where o.id = p_order_id;

  insert into public.service_order_events (
    order_id, event_type, summary, visibility, created_by
  ) values (
    p_order_id, 'report_updated', 'Informe de servicio actualizado',
    'internal', (select auth.uid())
  );
end;
$$;

create or replace function public.get_public_tracking_status(p_token_hash text)
returns table (
  order_number text,
  service_type text,
  status public.service_status,
  public_message text,
  updated_at timestamptz,
  events jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    o.order_number,
    o.service_type,
    o.status,
    o.public_message,
    o.updated_at,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'summary', e.summary,
          'created_at', e.created_at
        ) order by e.created_at desc
      )
      from public.service_order_events e
      where e.order_id = o.id and e.visibility = 'public'
    ), '[]'::jsonb) as events
  from public.service_tracking_tokens t
  join public.service_orders o on o.id = t.order_id
  where t.token_hash = p_token_hash and t.enabled
  limit 1;
$$;

create or replace function public.can_receive_tracking_updates()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.service_tracking_tokens t
    where t.token_hash = split_part(realtime.topic(), 'service-tracking:', 2)
      and t.enabled
  );
$$;

create or replace function public.broadcast_service_tracking_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token_hash text;
begin
  if new.status is not distinct from old.status
     and new.public_message is not distinct from old.public_message then
    return new;
  end if;

  select t.token_hash into v_token_hash
  from public.service_tracking_tokens t
  where t.order_id = new.id and t.enabled;

  if v_token_hash is not null then
    perform realtime.send(
      jsonb_build_object('order_number', new.order_number, 'status', new.status),
      'status_update',
      'service-tracking:' || v_token_hash,
      true
    );
  end if;

  return new;
end;
$$;

create trigger service_orders_broadcast_tracking
after update on public.service_orders
for each row execute function public.broadcast_service_tracking_update();

alter table public.admin_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.service_orders enable row level security;
alter table public.service_order_events enable row level security;
alter table public.service_tasks enable row level security;
alter table public.service_order_revisions enable row level security;
alter table public.service_tracking_tokens enable row level security;

create policy "Staff can read their own profile"
  on public.admin_profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_active_admin());

create policy "Admins can manage profiles"
  on public.admin_profiles for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy "Staff can read clients"
  on public.clients for select to authenticated
  using (public.is_active_staff());

create policy "Staff can create clients"
  on public.clients for insert to authenticated
  with check (public.is_active_staff() and created_by = (select auth.uid()));

create policy "Staff can update clients"
  on public.clients for update to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

create policy "Staff can read service orders"
  on public.service_orders for select to authenticated
  using (public.is_active_staff());

create policy "Staff can read service events"
  on public.service_order_events for select to authenticated
  using (public.is_active_staff());

create policy "Staff can read service tasks"
  on public.service_tasks for select to authenticated
  using (public.is_active_staff());

create policy "Staff can read service revisions"
  on public.service_order_revisions for select to authenticated
  using (public.is_active_staff());

create policy "Staff can read tracking tokens"
  on public.service_tracking_tokens for select to authenticated
  using (public.is_active_staff());

create policy "Trackers can receive their private updates"
  on realtime.messages for select to anon, authenticated
  using (public.can_receive_tracking_updates());

revoke all on public.admin_profiles, public.clients, public.service_orders,
  public.service_order_events, public.service_tasks, public.service_order_revisions,
  public.service_tracking_tokens
  from anon;

grant select on public.admin_profiles, public.clients, public.service_orders,
  public.service_order_events, public.service_tasks, public.service_order_revisions,
  public.service_tracking_tokens
  to authenticated;
grant insert, update on public.clients to authenticated;

revoke all on function public.is_active_staff() from public, anon;
revoke all on function public.is_active_admin() from public, anon;
revoke all on function public.create_service_order(
  uuid, text, text, public.service_priority, numeric, text, text, text, text,
  text, text, text, text, integer, text
) from public, anon;
revoke all on function public.update_service_order_status(
  uuid, public.service_status, text
) from public, anon;
revoke all on function public.log_service_task(uuid, text, boolean) from public, anon;
revoke all on function public.update_service_report(
  uuid, text, text, text, jsonb, text
) from public, anon;
revoke all on function public.get_public_tracking_status(text) from public;
revoke all on function public.can_receive_tracking_updates() from public;
revoke all on function public.set_updated_at() from public;
revoke all on function public.broadcast_service_tracking_update() from public;

grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.create_service_order(
  uuid, text, text, public.service_priority, numeric, text, text, text, text,
  text, text, text, text, integer, text
) to authenticated;
grant execute on function public.update_service_order_status(
  uuid, public.service_status, text
) to authenticated;
grant execute on function public.log_service_task(uuid, text, boolean) to authenticated;
grant execute on function public.update_service_report(
  uuid, text, text, text, jsonb, text
) to authenticated;
grant execute on function public.get_public_tracking_status(text) to anon, authenticated;
grant execute on function public.can_receive_tracking_updates() to anon, authenticated;
