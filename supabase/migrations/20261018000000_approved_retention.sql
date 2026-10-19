alter table public.service_inquiries
  add column if not exists closed_at timestamptz;

alter table public.service_inquiries disable trigger service_inquiries_permission_guard;
alter table public.service_inquiries disable trigger service_inquiries_set_updated_at;
alter table public.service_inquiries disable trigger audit_service_inquiries;

update public.service_inquiries
set closed_at = updated_at
where status in ('resolved', 'closed')
  and closed_at is null;

alter table public.service_inquiries enable trigger service_inquiries_permission_guard;
alter table public.service_inquiries enable trigger service_inquiries_set_updated_at;
alter table public.service_inquiries enable trigger audit_service_inquiries;

create index if not exists service_inquiries_closed_retention_idx
  on public.service_inquiries (closed_at, id)
  where status in ('resolved', 'closed');

create index if not exists service_documents_sent_retention_idx
  on public.service_documents (sent_at, id)
  where status = 'sent' and sent_at is not null;

create or replace function public.set_service_inquiry_closed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status in ('resolved', 'closed') then
      new.closed_at := coalesce(new.closed_at, new.created_at);
    else
      new.closed_at := null;
    end if;
    return new;
  end if;

  if old.status is distinct from new.status then
    if new.status in ('resolved', 'closed') then
      new.closed_at := case
        when old.status in ('resolved', 'closed') then coalesce(old.closed_at, old.updated_at)
        else now()
      end;
    else
      new.closed_at := null;
    end if;
  else
    new.closed_at := old.closed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists service_inquiries_set_closed_at on public.service_inquiries;
create trigger service_inquiries_set_closed_at
before insert or update on public.service_inquiries
for each row execute function public.set_service_inquiry_closed_at();

create or replace function public.guard_admin_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  required_permission text;
begin
  if tg_table_name = 'admin_settings' then
    if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
      raise exception 'Invalid timezone' using errcode = '22023';
    end if;
  end if;

  if coalesce(auth.role(), '') = 'service_role'
     and current_setting('zipek.approved_retention', true) = 'on'
     and (
       (tg_table_name in ('service_inquiries', 'service_inquiry_events') and tg_op = 'UPDATE')
       or (tg_table_name = 'service_documents' and tg_op = 'DELETE')
       or (tg_table_name = 'admin_email_delivery_events' and tg_op = 'UPDATE')
     ) then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT'
     and tg_table_name in ('service_inquiries', 'service_inquiry_events')
     and coalesce(auth.role(), '') = 'anon' then
    return new;
  end if;

  required_permission := case tg_table_name
    when 'clients' then 'clients.manage'
    when 'service_orders' then 'orders.manage'
    when 'service_order_events' then 'orders.manage'
    when 'service_tasks' then 'orders.manage'
    when 'service_order_revisions' then 'orders.manage'
    when 'service_tracking_tokens' then 'orders.manage'
    when 'service_documents' then 'documents.manage'
    when 'service_inquiries' then 'inquiries.manage'
    when 'service_inquiry_events' then 'inquiries.manage'
    when 'admin_email_delivery_events' then 'documents.manage'
    when 'admin_settings' then 'settings.manage'
    when 'admin_holidays' then 'settings.manage'
    else null
  end;

  if required_permission is null or not public.has_admin_permission(required_permission) then
    raise exception 'Insufficient administrative permission for %', tg_table_name
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.get_admin_retention_report()
returns table (
  category text,
  retention_days integer,
  candidate_count bigint,
  oldest_candidate timestamptz,
  automatic_deletion boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  config public.admin_settings%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and not public.has_admin_permission('reports.read') then
    raise exception 'Insufficient administrative permission' using errcode = '42501';
  end if;
  select * into config from public.admin_settings where id = true;

  return query
  with inquiry_candidates as (
    select inquiry.id, inquiry.closed_at
    from public.service_inquiries inquiry
    where inquiry.status in ('resolved', 'closed')
      and inquiry.closed_at < now() - interval '90 days'
      and (
        inquiry.contact_name is not null
        or inquiry.contact_phone is not null
        or inquiry.contact_email is not null
        or inquiry.contact_consent
        or inquiry.topic is distinct from 'Consulta anonimizada'
        or inquiry.message is distinct from 'Contenido de consulta anonimizado tras retención.'
        or inquiry.request_details - 'issue' - 'location' - 'brand_model' is distinct from inquiry.request_details
        or exists (
          select 1
          from public.service_inquiry_events event
          where event.inquiry_id = inquiry.id
            and event.event_type = 'note_added'
            and event.summary is distinct from 'Nota de consulta anonimizada tras 90 días de cierre.'
            and event.summary !~ '^Se generó el borrador de propuesta [[:alnum:]-]+\.$'
        )
      )
  ),
  document_candidates as (
    select document.id,
      greatest(
        document.sent_at,
        coalesce(service_order.delivered_at, service_order.updated_at, document.sent_at),
        coalesce(source_inquiry.closed_at, document.sent_at)
      ) as finalized_at
    from public.service_documents document
    left join public.service_orders service_order on service_order.id = document.order_id
    left join public.service_inquiries source_inquiry on source_inquiry.id = document.source_inquiry_id
    where document.status = 'sent'
      and (
        document.order_id is null
        or (
          service_order.status in ('delivered', 'cancelled')
          and greatest(
            document.sent_at,
            coalesce(service_order.delivered_at, service_order.updated_at)
          ) < now() - interval '5 years'
        )
      )
      and (
        document.source_inquiry_id is null
        or (
          source_inquiry.status in ('resolved', 'closed')
          and source_inquiry.closed_at is not null
          and greatest(document.sent_at, source_inquiry.closed_at) < now() - interval '5 years'
        )
      )
      and not exists (
        select 1
        from public.service_proposal_approvals approval
        where approval.document_id = document.id
          and approval.status = 'pending'
      )
  )
  select 'clients'::text, config.retention_clients_days,
    count(*) filter (
      where config.retention_clients_days is not null
        and archived_at < now() - make_interval(days => config.retention_clients_days)
    ),
    min(archived_at) filter (
      where config.retention_clients_days is not null
        and archived_at < now() - make_interval(days => config.retention_clients_days)
    ),
    false
  from public.clients
  union all
  select 'inquiries'::text, 90::integer, count(*), min(closed_at), true
  from inquiry_candidates
  union all
  select 'documents'::text, 1825::integer, count(*), min(finalized_at), true
  from document_candidates
  union all
  select 'orders'::text, config.retention_orders_days,
    count(*) filter (
      where config.retention_orders_days is not null
        and status in ('delivered', 'cancelled')
        and coalesce(delivered_at, updated_at) < now() - make_interval(days => config.retention_orders_days)
    ),
    min(coalesce(delivered_at, updated_at)) filter (
      where config.retention_orders_days is not null
        and status in ('delivered', 'cancelled')
        and coalesce(delivered_at, updated_at) < now() - make_interval(days => config.retention_orders_days)
    ),
    false
  from public.service_orders
  union all
  select 'audit_events'::text, 1825::integer,
    count(*) filter (where created_at < now() - interval '5 years'),
    min(created_at) filter (where created_at < now() - interval '5 years'),
    true
  from public.admin_audit_log;
end;
$$;

create or replace function public.run_approved_data_retention()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_inquiries_anonymized bigint := 0;
  v_notes_anonymized bigint := 0;
  v_documents_deleted bigint := 0;
  v_audit_events_deleted bigint := 0;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;

  perform set_config('zipek.approved_retention', 'on', true);

  with targets as materialized (
    select inquiry.id
    from public.service_inquiries inquiry
    where inquiry.status in ('resolved', 'closed')
      and inquiry.closed_at < v_now - interval '90 days'
      and (
        inquiry.contact_name is not null
        or inquiry.contact_phone is not null
        or inquiry.contact_email is not null
        or inquiry.contact_consent
        or inquiry.topic is distinct from 'Consulta anonimizada'
        or inquiry.message is distinct from 'Contenido de consulta anonimizado tras retención.'
        or inquiry.request_details - 'issue' - 'location' - 'brand_model' is distinct from inquiry.request_details
        or exists (
          select 1
          from public.service_inquiry_events event
          where event.inquiry_id = inquiry.id
            and event.event_type = 'note_added'
            and event.summary is distinct from 'Nota de consulta anonimizada tras 90 días de cierre.'
            and event.summary !~ '^Se generó el borrador de propuesta [[:alnum:]-]+\.$'
        )
      )
    order by inquiry.closed_at, inquiry.id
    limit 500
    for update of inquiry skip locked
  ),
  updated_inquiries as (
    update public.service_inquiries inquiry
    set contact_name = null,
        contact_phone = null,
        contact_email = null,
        contact_consent = false,
        topic = 'Consulta anonimizada',
        message = 'Contenido de consulta anonimizado tras retención.',
        request_details = inquiry.request_details - 'issue' - 'location' - 'brand_model'
    from targets
    where inquiry.id = targets.id
      and (
        inquiry.contact_name is not null
        or inquiry.contact_phone is not null
        or inquiry.contact_email is not null
        or inquiry.contact_consent
        or inquiry.topic is distinct from 'Consulta anonimizada'
        or inquiry.message is distinct from 'Contenido de consulta anonimizado tras retención.'
        or inquiry.request_details - 'issue' - 'location' - 'brand_model' is distinct from inquiry.request_details
      )
    returning inquiry.id
  ),
  updated_notes as (
    update public.service_inquiry_events event
    set summary = 'Nota de consulta anonimizada tras 90 días de cierre.'
    from targets
    where event.inquiry_id = targets.id
      and event.event_type = 'note_added'
      and event.summary is distinct from 'Nota de consulta anonimizada tras 90 días de cierre.'
      and event.summary !~ '^Se generó el borrador de propuesta [[:alnum:]-]+\.$'
    returning event.id
  )
  select
    (select count(*) from updated_inquiries),
    (select count(*) from updated_notes)
  into v_inquiries_anonymized, v_notes_anonymized;

  with candidates as (
    select document.id
    from public.service_documents document
    left join public.service_orders service_order on service_order.id = document.order_id
    left join public.service_inquiries source_inquiry on source_inquiry.id = document.source_inquiry_id
    where document.status = 'sent'
      and (
        document.order_id is null
        or (
          service_order.status in ('delivered', 'cancelled')
          and greatest(
            document.sent_at,
            coalesce(service_order.delivered_at, service_order.updated_at)
          ) < v_now - interval '5 years'
        )
      )
      and (
        document.source_inquiry_id is null
        or (
          source_inquiry.status in ('resolved', 'closed')
          and source_inquiry.closed_at is not null
          and greatest(document.sent_at, source_inquiry.closed_at) < v_now - interval '5 years'
        )
      )
      and not exists (
        select 1
        from public.service_proposal_approvals approval
        where approval.document_id = document.id
          and approval.status = 'pending'
      )
    order by document.sent_at, document.id
    limit 500
    for update of document skip locked
  )
  delete from public.service_documents document
  using candidates
  where document.id = candidates.id;
  get diagnostics v_documents_deleted = row_count;

  with candidates as (
    select event.id
    from public.admin_audit_log event
    where event.created_at < v_now - interval '5 years'
    order by event.created_at, event.id
    limit 1000
    for update of event skip locked
  )
  delete from public.admin_audit_log event
  using candidates
  where event.id = candidates.id;
  get diagnostics v_audit_events_deleted = row_count;

  perform set_config('zipek.approved_retention', 'off', true);

  insert into public.admin_audit_log (
    actor_id,
    actor_name,
    action,
    entity_type,
    entity_id,
    changed_fields
  )
  values (
    null,
    'Sistema',
    'retention_sweep',
    'approved_retention_job',
    to_char(v_now at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    array[
      'inquiries_anonymized=' || v_inquiries_anonymized,
      'inquiry_notes_anonymized=' || v_notes_anonymized,
      'documents_deleted=' || v_documents_deleted,
      'audit_events_deleted=' || v_audit_events_deleted,
      'inquiry_cutoff=' || to_char((v_now - interval '90 days') at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'documents_and_audit_cutoff=' || to_char((v_now - interval '5 years') at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    ]
  );

  return jsonb_build_object(
    'inquiries_anonymized', v_inquiries_anonymized,
    'inquiry_notes_anonymized', v_notes_anonymized,
    'documents_deleted', v_documents_deleted,
    'audit_events_deleted', v_audit_events_deleted,
    'inquiry_cutoff', v_now - interval '90 days',
    'documents_and_audit_cutoff', v_now - interval '5 years'
  );
end;
$$;

revoke all on function public.set_service_inquiry_closed_at() from public, anon, authenticated;
revoke all on function public.run_approved_data_retention() from public, anon, authenticated;
grant execute on function public.run_approved_data_retention() to service_role;
revoke all on function public.get_admin_retention_report() from public, anon;
grant execute on function public.get_admin_retention_report() to authenticated, service_role;
