alter table public.service_inquiries
  add column if not exists request_details jsonb not null default '{}'::jsonb;

alter table public.service_inquiries
  drop constraint if exists service_inquiries_request_details_object;
alter table public.service_inquiries
  add constraint service_inquiries_request_details_object
  check (jsonb_typeof(request_details) = 'object');

alter table public.service_documents
  add column if not exists source_inquiry_id uuid
    references public.service_inquiries(id) on delete set null;

create index if not exists service_documents_source_inquiry_idx
  on public.service_documents(source_inquiry_id)
  where source_inquiry_id is not null;

create table if not exists public.service_proposal_approvals (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null unique
    references public.service_documents(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  expires_on date not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  signer_name text,
  responded_at timestamptz,
  created_by uuid references public.admin_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'pending' and signer_name is null and responded_at is null)
    or (status in ('accepted', 'declined') and signer_name is not null and responded_at is not null)
  )
);

create index if not exists service_proposal_approvals_token_idx
  on public.service_proposal_approvals(token_hash, status);

alter table public.service_proposal_approvals enable row level security;
revoke all on public.service_proposal_approvals from public, anon, authenticated;
drop trigger if exists audit_service_proposal_approvals on public.service_proposal_approvals;
create trigger audit_service_proposal_approvals
after insert or update on public.service_proposal_approvals
for each row execute function public.audit_admin_row_change();

create or replace function public.submit_public_quote_request(
  p_contact_name text,
  p_contact_phone text,
  p_contact_email text,
  p_contact_consent boolean,
  p_request_details jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := nullif(btrim(p_contact_name), '');
  v_phone text := nullif(btrim(p_contact_phone), '');
  v_email text := nullif(lower(btrim(p_contact_email)), '');
  v_type text := nullif(btrim(p_request_details ->> 'equipment_type'), '');
  v_model text := nullif(btrim(p_request_details ->> 'brand_model'), '');
  v_issue text := nullif(btrim(p_request_details ->> 'issue'), '');
  v_modality text := nullif(btrim(p_request_details ->> 'modality'), '');
  v_location text := nullif(btrim(p_request_details ->> 'location'), '');
  v_inquiry_id uuid := gen_random_uuid();
  v_inquiry_number text := 'CONS-' || upper(replace(gen_random_uuid()::text, '-', ''));
  v_topic text;
begin
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') then
    raise exception 'No autorizado.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_request_details) is distinct from 'object' then
    raise exception 'Revisa los datos de la solicitud de cotización.' using errcode = '22023';
  end if;
  if p_contact_consent is distinct from true then
    raise exception 'Autoriza el uso de tus datos para responder la solicitud.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_request_details -> 'tasks') is distinct from 'array' then
    raise exception 'Selecciona tareas para la solicitud.' using errcode = '22023';
  end if;
  if v_name is null or length(v_name) not between 2 and 160
     or v_phone is null or length(v_phone) not between 6 and 40
     or (v_email is not null and (
       length(v_email) > 254
       or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     ))
     or v_type is null
     or v_type not in ('Notebook', 'Computador de escritorio', 'Impresora o red', 'Otro equipo')
     or (v_model is not null and length(v_model) > 120)
     or v_issue is null or length(v_issue) not between 10 and 2000
     or v_modality is null
     or v_modality not in ('Por conversar', 'Remota', 'Presencial en Quillota', 'Fuera de Quillota')
     or (v_location is not null and length(v_location) > 120)
     or jsonb_array_length(p_request_details -> 'tasks') not between 1 and 5 then
    raise exception 'Revisa los datos de la solicitud de cotización.' using errcode = '22023';
  end if;
  if exists (
       select 1
       from jsonb_array_elements(p_request_details -> 'tasks') as task(value)
       where jsonb_typeof(task.value) is distinct from 'string'
          or btrim(task.value #>> '{}') not in (
            'Revisión y diagnóstico',
            'Respaldo o traslado de archivos',
            'Instalación o configuración de software',
            'Conectividad, Wi-Fi o impresora',
            'Orientación de seguridad'
          )
     ) then
    raise exception 'Revisa los datos de la solicitud de cotización.' using errcode = '22023';
  end if;

  v_topic := 'Solicitud de cotización · ' || v_type;
  if length(v_topic) > 100 then
    v_topic := left(v_topic, 100);
  end if;

  insert into public.service_inquiries (
    id, inquiry_number, source, topic, message, contact_name, contact_phone,
    contact_email, contact_consent, request_details
  )
  values (
    v_inquiry_id, v_inquiry_number, 'web', v_topic, v_issue, v_name, v_phone,
    v_email, p_contact_consent, jsonb_build_object(
      'equipment_type', v_type,
      'brand_model', v_model,
      'issue', v_issue,
      'modality', v_modality,
      'location', v_location,
      'tasks', p_request_details -> 'tasks'
    )
  );

  insert into public.service_inquiry_events (inquiry_id, event_type, summary)
  values (v_inquiry_id, 'created', 'Solicitud de cotización recibida desde el Centro digital.');

  return v_inquiry_number;
end;
$$;

revoke all on function public.submit_public_quote_request(text, text, text, boolean, jsonb) from public;
grant execute on function public.submit_public_quote_request(text, text, text, boolean, jsonb) to anon, authenticated;

create or replace function public.create_service_proposal_draft_from_inquiry(p_inquiry_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry public.service_inquiries%rowtype;
  client_id uuid;
  document_id uuid;
  proposal_number text;
  equipment_summary text;
  initial_data jsonb;
begin
  if not public.has_admin_permission('documents.manage')
     or not public.has_admin_permission('clients.manage')
     or not public.has_admin_permission('inquiries.manage') then
    raise exception 'Insufficient administrative permission' using errcode = '42501';
  end if;

  select * into inquiry
  from public.service_inquiries
  where id = p_inquiry_id
    and request_details <> '{}'::jsonb
    and contact_consent
  for update;

  if not found then
    raise exception 'Quote request not found or incomplete' using errcode = 'P0002';
  end if;

  select id into document_id
  from public.service_documents
  where source_inquiry_id = inquiry.id
    and template_id = 'service-proposal'
    and status = 'draft'
  limit 1;
  if document_id is not null then
    return document_id;
  end if;

  if inquiry.contact_name is null or inquiry.contact_phone is null then
    raise exception 'The quote request has no usable contact details' using errcode = '22023';
  end if;

  insert into public.clients (
    full_name, phone, email, notes, created_by
  )
  values (
    inquiry.contact_name,
    inquiry.contact_phone,
    inquiry.contact_email,
    'Cliente creado desde la solicitud ' || inquiry.inquiry_number,
    auth.uid()
  )
  returning id into client_id;

  proposal_number := 'PROP-' || upper(substr(replace(inquiry.id::text, '-', ''), 1, 10));
  equipment_summary := concat_ws(
    ' · ',
    nullif(inquiry.request_details ->> 'equipment_type', ''),
    nullif(inquiry.request_details ->> 'brand_model', '')
  );
  initial_data := jsonb_build_object(
    'numero_propuesta', proposal_number,
    'fecha', to_char(current_date, 'YYYY-MM-DD'),
    'valida_hasta', '',
    'cliente', inquiry.contact_name,
    'equipo_sistema', equipment_summary,
    'modalidad', coalesce(inquiry.request_details ->> 'modality', 'Por conversar'),
    'situacion', inquiry.message,
    'tareas', array_to_string(
      array(select jsonb_array_elements_text(inquiry.request_details -> 'tasks')),
      E'\n'
    ),
    'exclusiones', '',
    'mano_obra', '',
    'repuestos_licencias', '',
    'traslado', '',
    'total', '',
    'fecha_entrega', '',
    'forma_pago', '',
    'garantia', '',
    'tratamiento_tributario', ''
  );

  insert into public.service_documents (
    client_id, template_id, data, created_by, source_inquiry_id
  )
  values (
    client_id, 'service-proposal', initial_data, auth.uid(), inquiry.id
  )
  returning id into document_id;

  insert into public.service_inquiry_events (
    inquiry_id, event_type, summary, created_by
  )
  values (
    inquiry.id,
    'note_added',
    'Se generó el borrador de propuesta ' || proposal_number || '.',
    auth.uid()
  );

  return document_id;
end;
$$;

revoke all on function public.create_service_proposal_draft_from_inquiry(uuid) from public, anon;
grant execute on function public.create_service_proposal_draft_from_inquiry(uuid) to authenticated;

create or replace function public.create_service_proposal_approval(
  p_document_id uuid,
  p_token_hash text,
  p_expires_on date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  proposal public.service_documents%rowtype;
begin
  if not public.has_admin_permission('documents.manage') then
    raise exception 'Insufficient administrative permission' using errcode = '42501';
  end if;
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$'
     or p_expires_on is null or p_expires_on < current_date then
    raise exception 'Invalid proposal approval data' using errcode = '22023';
  end if;

  select * into proposal
  from public.service_documents
  where id = p_document_id
    and template_id = 'service-proposal'
    and status in ('draft', 'sent');
  if not found then
    raise exception 'Service proposal not found' using errcode = 'P0002';
  end if;
  if proposal.data ->> 'valida_hasta' is distinct from to_char(p_expires_on, 'YYYY-MM-DD') then
    raise exception 'Proposal expiry date does not match the document' using errcode = '22023';
  end if;

  insert into public.service_proposal_approvals (
    document_id, token_hash, expires_on, created_by
  )
  values (p_document_id, p_token_hash, p_expires_on, auth.uid())
  on conflict (document_id) do update
    set token_hash = excluded.token_hash,
        expires_on = excluded.expires_on,
        status = 'pending',
        signer_name = null,
        responded_at = null,
        created_by = excluded.created_by,
        updated_at = now();
end;
$$;

revoke all on function public.create_service_proposal_approval(uuid, text, date) from public, anon;
grant execute on function public.create_service_proposal_approval(uuid, text, date) to authenticated;

create or replace function public.get_public_service_proposal(p_token_hash text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'proposal_number', document.data ->> 'numero_propuesta',
    'date', document.data ->> 'fecha',
    'expires_on', approval.expires_on,
    'client_name', document.data ->> 'cliente',
    'equipment', document.data ->> 'equipo_sistema',
    'modality', document.data ->> 'modalidad',
    'situation', document.data ->> 'situacion',
    'tasks', document.data ->> 'tareas',
    'exclusions', document.data ->> 'exclusiones',
    'labor', document.data ->> 'mano_obra',
    'parts_licenses', document.data ->> 'repuestos_licencias',
    'travel', document.data ->> 'traslado',
    'total', document.data ->> 'total',
    'tax_treatment', document.data ->> 'tratamiento_tributario',
    'delivery_date', document.data ->> 'fecha_entrega',
    'payment_terms', document.data ->> 'forma_pago',
    'warranty', document.data ->> 'garantia',
    'approval_status', case
      when approval.status = 'pending' and approval.expires_on < current_date then 'expired'
      else approval.status
    end,
    'signer_name', approval.signer_name,
    'responded_at', approval.responded_at
  )
  from public.service_proposal_approvals approval
  join public.service_documents document on document.id = approval.document_id
  where p_token_hash ~ '^[a-f0-9]{64}$'
    and approval.token_hash = p_token_hash
    and document.template_id = 'service-proposal'
    and document.status = 'sent';
$$;

create or replace function public.respond_to_service_proposal(
  p_token_hash text,
  p_decision text,
  p_signer_name text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  approval public.service_proposal_approvals%rowtype;
  signer text := nullif(btrim(p_signer_name), '');
begin
  if p_token_hash is null
     or p_decision is null
     or p_signer_name is null
     or p_token_hash !~ '^[a-f0-9]{64}$'
     or p_decision not in ('accepted', 'declined')
     or signer is null
     or length(signer) not between 2 and 160 then
    raise exception 'Invalid proposal response' using errcode = '22023';
  end if;

  select * into approval
  from public.service_proposal_approvals
  where token_hash = p_token_hash
  for update;
  if not found then
    return 'not_found';
  end if;

  if approval.status <> 'pending' then
    return 'already_responded';
  end if;
  if approval.expires_on < current_date then
    return 'expired';
  end if;
  if not exists (
    select 1 from public.service_documents
    where id = approval.document_id
      and template_id = 'service-proposal'
      and status = 'sent'
  ) then
    return 'not_found';
  end if;

  update public.service_proposal_approvals
  set status = p_decision,
      signer_name = signer,
      responded_at = now(),
      updated_at = now()
  where id = approval.id;

  return p_decision;
end;
$$;

create or replace function public.get_service_proposal_approval_status(p_document_id uuid)
returns table (
  status text,
  expires_on date,
  signer_name text,
  responded_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_admin_permission('documents.read') then
    raise exception 'Insufficient administrative permission' using errcode = '42501';
  end if;

  return query
  select
    case when approval.status = 'pending' and approval.expires_on < current_date then 'expired'
      else approval.status end,
    approval.expires_on,
    approval.signer_name,
    approval.responded_at
  from public.service_proposal_approvals approval
  where approval.document_id = p_document_id;
end;
$$;

revoke all on function public.get_public_service_proposal(text) from public;
revoke all on function public.respond_to_service_proposal(text, text, text) from public;
revoke all on function public.get_service_proposal_approval_status(uuid) from public, anon;
grant execute on function public.get_public_service_proposal(text) to anon, authenticated;
grant execute on function public.respond_to_service_proposal(text, text, text) to anon, authenticated;
grant execute on function public.get_service_proposal_approval_status(uuid) to authenticated;
