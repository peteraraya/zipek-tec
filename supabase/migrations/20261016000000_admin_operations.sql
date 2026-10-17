alter table public.admin_profiles
  alter column role set default 'technician';

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

update public.admin_profiles
set role = 'technician'
where role = 'operator';

alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role in ('admin', 'technician', 'support', 'auditor'));

alter table public.admin_profiles add column if not exists email text;
update public.admin_profiles profile
set email = users.email
from auth.users users
where users.id = profile.id
  and profile.email is null;
create unique index if not exists admin_profiles_email_unique_idx
  on public.admin_profiles (lower(email))
  where email is not null;

create index if not exists service_inquiries_new_created_idx
  on public.service_inquiries (created_at)
  where status = 'new';
create index if not exists service_orders_open_urgent_received_idx
  on public.service_orders (received_at)
  where priority = 'urgent' and status not in ('delivered', 'cancelled');
create index if not exists service_orders_open_updated_idx
  on public.service_orders (updated_at)
  where status not in ('delivered', 'cancelled');
create index if not exists service_inquiries_retention_created_idx
  on public.service_inquiries (created_at);
create index if not exists service_documents_retention_updated_idx
  on public.service_documents (created_at);
create index if not exists service_orders_retention_delivered_idx
  on public.service_orders (coalesce(delivered_at, updated_at));
create index if not exists service_orders_delivered_at_idx
  on public.service_orders (delivered_at)
  where delivered_at is not null;
create index if not exists clients_retention_archived_idx
  on public.clients (archived_at)
  where archived_at is not null;

create or replace function public.has_admin_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.id = (select auth.uid())
      and profile.active
      and case profile.role
        when 'admin' then true
        when 'technician' then p_permission in ('clients.read', 'orders.read', 'orders.manage', 'documents.read', 'documents.manage', 'inquiries.read', 'reports.read')
        when 'support' then p_permission in ('clients.read', 'clients.manage', 'orders.read', 'documents.read', 'documents.manage', 'inquiries.read', 'inquiries.manage', 'reports.read')
        when 'auditor' then p_permission in ('clients.read', 'orders.read', 'documents.read', 'inquiries.read', 'audit.read', 'settings.read', 'reports.read')
        else false
      end
  );
$$;

revoke all on function public.has_admin_permission(text) from public, anon;
grant execute on function public.has_admin_permission(text) to authenticated;
grant execute on function public.has_admin_permission(text) to service_role;

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

drop trigger if exists clients_permission_guard on public.clients;
create trigger clients_permission_guard
before insert or update or delete on public.clients
for each row execute function public.guard_admin_write();

drop trigger if exists service_orders_permission_guard on public.service_orders;
create trigger service_orders_permission_guard
before insert or update or delete on public.service_orders
for each row execute function public.guard_admin_write();

drop trigger if exists service_order_events_permission_guard on public.service_order_events;
create trigger service_order_events_permission_guard
before insert or update or delete on public.service_order_events
for each row execute function public.guard_admin_write();

drop trigger if exists service_tasks_permission_guard on public.service_tasks;
create trigger service_tasks_permission_guard
before insert or update or delete on public.service_tasks
for each row execute function public.guard_admin_write();

drop trigger if exists service_order_revisions_permission_guard on public.service_order_revisions;
create trigger service_order_revisions_permission_guard
before insert or update or delete on public.service_order_revisions
for each row execute function public.guard_admin_write();

drop trigger if exists service_tracking_tokens_permission_guard on public.service_tracking_tokens;
create trigger service_tracking_tokens_permission_guard
before insert or update or delete on public.service_tracking_tokens
for each row execute function public.guard_admin_write();

drop trigger if exists service_documents_permission_guard on public.service_documents;
create trigger service_documents_permission_guard
before insert or update or delete on public.service_documents
for each row execute function public.guard_admin_write();

drop trigger if exists service_inquiries_permission_guard on public.service_inquiries;
create trigger service_inquiries_permission_guard
before insert or update or delete on public.service_inquiries
for each row execute function public.guard_admin_write();

drop trigger if exists service_inquiry_events_permission_guard on public.service_inquiry_events;
create trigger service_inquiry_events_permission_guard
before insert or update or delete on public.service_inquiry_events
for each row execute function public.guard_admin_write();

create table if not exists public.admin_settings (
  id boolean primary key default true check (id),
  inquiry_response_sla_hours integer not null default 9 check (inquiry_response_sla_hours between 1 and 720),
  urgent_order_sla_hours integer not null default 4 check (urgent_order_sla_hours between 1 and 720),
  stale_order_hours integer not null default 18 check (stale_order_hours between 1 and 720),
  workday_start time not null default '09:00',
  workday_end time not null default '18:00',
  timezone text not null default 'America/Santiago',
  retention_clients_days integer check (retention_clients_days is null or retention_clients_days between 30 and 3650),
  retention_inquiries_days integer check (retention_inquiries_days is null or retention_inquiries_days between 30 and 3650),
  retention_documents_days integer check (retention_documents_days is null or retention_documents_days between 30 and 3650),
  retention_orders_days integer check (retention_orders_days is null or retention_orders_days between 30 and 3650),
  alert_email text check (alert_email is null or length(alert_email) <= 254),
  daily_alerts_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_profiles(id),
  check (workday_end > workday_start)
);

drop trigger if exists admin_settings_permission_guard on public.admin_settings;
insert into public.admin_settings (id) values (true)
on conflict (id) do nothing;

drop trigger if exists admin_settings_set_updated_at on public.admin_settings;
create trigger admin_settings_set_updated_at
before update on public.admin_settings
for each row execute function public.set_updated_at();

create trigger admin_settings_permission_guard
before insert or update or delete on public.admin_settings
for each row execute function public.guard_admin_write();

alter table public.admin_settings enable row level security;
drop policy if exists "Staff with settings access can read configuration" on public.admin_settings;
create policy "Staff with settings access can read configuration"
  on public.admin_settings for select to authenticated
  using (public.has_admin_permission('settings.read'));
drop policy if exists "Admins can manage configuration" on public.admin_settings;
create policy "Admins can manage configuration"
  on public.admin_settings for all to authenticated
  using (public.has_admin_permission('settings.manage'))
  with check (public.has_admin_permission('settings.manage'));
revoke all on public.admin_settings from anon;
grant select, update on public.admin_settings to authenticated;
grant select on public.admin_settings to service_role;
grant insert, update on public.admin_profiles to authenticated;

create table if not exists public.admin_holidays (
  holiday_date date primary key,
  name text not null default '' check (length(name) <= 120),
  created_at timestamptz not null default now()
);
alter table public.admin_holidays enable row level security;
drop policy if exists "Staff with reports access can read holidays" on public.admin_holidays;
create policy "Staff with reports access can read holidays"
  on public.admin_holidays for select to authenticated
  using (public.has_admin_permission('reports.read'));
revoke all on public.admin_holidays from anon, authenticated;
grant select on public.admin_holidays to authenticated, service_role;

drop trigger if exists admin_holidays_permission_guard on public.admin_holidays;
create trigger admin_holidays_permission_guard
before insert or update or delete on public.admin_holidays
for each row execute function public.guard_admin_write();

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_name text,
  action text not null,
  entity_type text not null,
  entity_id text,
  changed_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc, id desc);
create index if not exists admin_audit_log_entity_idx on public.admin_audit_log (entity_type, entity_id, created_at desc);
alter table public.admin_audit_log enable row level security;
drop policy if exists "Auditors and admins can read audit log" on public.admin_audit_log;
create policy "Auditors and admins can read audit log"
  on public.admin_audit_log for select to authenticated
  using (public.has_admin_permission('audit.read'));
revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;

create table if not exists public.admin_email_delivery_events (
  id bigint generated always as identity primary key,
  actor_id uuid,
  document_id uuid references public.service_documents(id) on delete set null,
  result text not null check (result in ('sent', 'failed')),
  error_code text check (error_code is null or length(error_code) <= 80),
  created_at timestamptz not null default now()
);
create index if not exists admin_email_delivery_events_created_idx
  on public.admin_email_delivery_events (created_at desc, id desc);
alter table public.admin_email_delivery_events enable row level security;
drop policy if exists "Auditors can read email delivery events" on public.admin_email_delivery_events;
create policy "Auditors can read email delivery events"
  on public.admin_email_delivery_events for select to authenticated
  using (public.has_admin_permission('reports.read'));
drop policy if exists "Document staff can register email delivery events" on public.admin_email_delivery_events;
create policy "Document staff can register email delivery events"
  on public.admin_email_delivery_events for insert to authenticated
  with check (
    public.has_admin_permission('documents.manage')
    and actor_id = (select auth.uid())
  );
revoke all on public.admin_email_delivery_events from anon, authenticated;
grant select on public.admin_email_delivery_events to authenticated;
grant insert on public.admin_email_delivery_events to authenticated;
grant usage on sequence public.admin_email_delivery_events_id_seq to authenticated;
grant select on public.clients, public.service_orders, public.service_inquiries,
  public.admin_email_delivery_events to service_role;

create or replace function public.lock_admin_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.active and new.role = 'admin' then
    perform pg_advisory_xact_lock(1647589, 1);
  end if;
  return new;
end;
$$;

drop trigger if exists admin_profiles_lock_admin_insert on public.admin_profiles;
create trigger admin_profiles_lock_admin_insert
before insert on public.admin_profiles
for each row execute function public.lock_admin_profile_insert();

create or replace function public.record_admin_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_changed_fields text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_label text;
begin
  if auth.uid() is null or not public.is_active_staff() then
    raise exception 'Active staff session required' using errcode = '42501';
  end if;
  if p_action <> 'export'
     or p_entity_id is not null
     or cardinality(coalesce(p_changed_fields, '{}')) <> 0 then
    raise exception 'Only export audit events can be recorded directly'
      using errcode = '42501';
  end if;
  if p_entity_type = 'admin_audit_log' then
    if not public.has_admin_permission('audit.read') then
      raise exception 'Insufficient administrative permission' using errcode = '42501';
    end if;
  elsif p_entity_type = 'admin_operational_report' then
    if not public.has_admin_permission('reports.read') then
      raise exception 'Insufficient administrative permission' using errcode = '42501';
    end if;
  else
    raise exception 'Invalid audit entity' using errcode = '22023';
  end if;
  if length(p_action) > 80 or length(p_entity_type) > 80
     or coalesce(length(p_entity_id), 0) > 120
     or cardinality(coalesce(p_changed_fields, '{}')) > 100 then
    raise exception 'Invalid audit data' using errcode = '22023';
  end if;

  select display_name into actor_label
  from public.admin_profiles
  where id = auth.uid();

  insert into public.admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, changed_fields)
  values (auth.uid(), actor_label, p_action, p_entity_type, p_entity_id, coalesce(p_changed_fields, '{}'));
end;
$$;

revoke all on function public.record_admin_audit(text, text, text, text[]) from public, anon;
grant execute on function public.record_admin_audit(text, text, text, text[]) to authenticated;

create or replace function public.audit_admin_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb;
  new_row jsonb;
  row_id text;
  actor_label text;
  changed text[];
  entity text := tg_table_name;
begin
  if tg_op <> 'INSERT' then old_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then new_row := to_jsonb(new); end if;
  row_id := coalesce(new_row ->> 'id', old_row ->> 'id');
  if row_id is null and entity = 'admin_settings' then row_id := 'global'; end if;

  if tg_op = 'INSERT' then
    select coalesce(array_agg(key order by key), '{}') into changed
    from jsonb_object_keys(new_row) as keys(key)
    where key not in ('created_at', 'updated_at');
  elsif tg_op = 'DELETE' then
    select coalesce(array_agg(key order by key), '{}') into changed
    from jsonb_object_keys(old_row) as keys(key)
    where key not in ('created_at', 'updated_at');
  else
    select coalesce(array_agg(key order by key), '{}') into changed
    from jsonb_object_keys(new_row) as keys(key)
    where key not in ('created_at', 'updated_at')
      and old_row -> key is distinct from new_row -> key;
  end if;

  if cardinality(changed) > 0 then
    if auth.uid() is not null then
      select display_name into actor_label
      from public.admin_profiles
      where id = auth.uid();
    end if;
    insert into public.admin_audit_log (actor_id, actor_name, action, entity_type, entity_id, changed_fields)
    values (
      auth.uid(),
      actor_label,
      lower(tg_op),
      entity,
      row_id,
      changed
    );
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists audit_admin_profiles on public.admin_profiles;
create trigger audit_admin_profiles
after insert or update or delete on public.admin_profiles
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_clients on public.clients;
create trigger audit_clients
after insert or update or delete on public.clients
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_service_orders on public.service_orders;
create trigger audit_service_orders
after insert or update or delete on public.service_orders
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_service_order_events on public.service_order_events;
create trigger audit_service_order_events
after insert or update or delete on public.service_order_events
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_service_documents on public.service_documents;
create trigger audit_service_documents
after insert or update or delete on public.service_documents
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_service_inquiries on public.service_inquiries;
create trigger audit_service_inquiries
after insert or update or delete on public.service_inquiries
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_service_inquiry_events on public.service_inquiry_events;
create trigger audit_service_inquiry_events
after insert or update or delete on public.service_inquiry_events
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_admin_email_delivery_events on public.admin_email_delivery_events;
create trigger audit_admin_email_delivery_events
after insert on public.admin_email_delivery_events
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_admin_settings on public.admin_settings;
create trigger audit_admin_settings
after insert or update or delete on public.admin_settings
for each row execute function public.audit_admin_row_change();
drop trigger if exists audit_admin_holidays on public.admin_holidays;
create trigger audit_admin_holidays
after insert or update or delete on public.admin_holidays
for each row execute function public.audit_admin_row_change();

create or replace function public.set_admin_holidays(p_holidays jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_admin_permission('settings.manage') then
    raise exception 'Insufficient administrative permission' using errcode = '42501';
  end if;
  if p_holidays is null
     or jsonb_typeof(p_holidays) is distinct from 'array'
     or jsonb_array_length(p_holidays) > 40 then
    raise exception 'Invalid holiday list' using errcode = '22023';
  end if;

  delete from public.admin_holidays;
  insert into public.admin_holidays (holiday_date, name)
  select holiday_date::date, left(coalesce(name, ''), 120)
  from jsonb_to_recordset(p_holidays) as item(holiday_date text, name text)
  where holiday_date ~ '^\d{4}-\d{2}-\d{2}$'
    and to_char(holiday_date::date, 'YYYY-MM-DD') = holiday_date;

  if (select count(*) from public.admin_holidays) <> jsonb_array_length(p_holidays) then
    raise exception 'Invalid holiday date' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.set_admin_holidays(jsonb) from public, anon;
grant execute on function public.set_admin_holidays(jsonb) to authenticated;

create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(1647589, 1);
  if tg_op = 'UPDATE' and new.role = 'admin' and new.active then
    return new;
  end if;
  if not exists (
    select 1 from public.admin_profiles
    where active and role = 'admin' and id <> old.id
  ) then
    raise exception 'At least one active administrator must remain'
      using errcode = '23514';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists admin_profiles_keep_active_admin_on_update on public.admin_profiles;
create trigger admin_profiles_keep_active_admin_on_update
before update of role, active on public.admin_profiles
for each row
execute function public.prevent_last_admin_removal();

drop trigger if exists admin_profiles_keep_active_admin_on_delete on public.admin_profiles;
create trigger admin_profiles_keep_active_admin_on_delete
before delete on public.admin_profiles
for each row
execute function public.prevent_last_admin_removal();

create table if not exists public.admin_alert_runs (
  run_date date primary key,
  status text not null check (status in ('running', 'sent', 'no_alerts', 'failed')),
  metrics jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text check (error_code is null or length(error_code) <= 80)
);

alter table public.admin_alert_runs enable row level security;
drop policy if exists "Staff can view alert delivery runs" on public.admin_alert_runs;
create policy "Staff can view alert delivery runs"
  on public.admin_alert_runs for select to authenticated
  using (public.has_admin_permission('reports.read'));
revoke all on public.admin_alert_runs from anon, authenticated;
grant select on public.admin_alert_runs to authenticated;

create or replace function public.claim_admin_alert_run(p_run_date date)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;
  insert into public.admin_alert_runs (run_date, status)
  values (p_run_date, 'running')
  on conflict (run_date) do update
    set status = 'running',
        started_at = now(),
        completed_at = null,
        error_code = null
    where admin_alert_runs.status = 'failed'
         or (admin_alert_runs.status = 'running'
             and admin_alert_runs.started_at < now() - interval '1 hour');
  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

create or replace function public.finish_admin_alert_run(
  p_run_date date,
  p_status text,
  p_metrics jsonb,
  p_error_code text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     or p_status not in ('sent', 'no_alerts', 'failed') then
    raise exception 'Invalid alert run update' using errcode = '42501';
  end if;
  update public.admin_alert_runs
  set status = p_status,
      metrics = coalesce(p_metrics, '{}'::jsonb),
      error_code = left(p_error_code, 80),
      completed_at = now()
  where run_date = p_run_date and status = 'running';
  if not found then
    raise exception 'Alert run was not claimed' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.claim_admin_alert_run(date) from public, anon, authenticated;
revoke all on function public.finish_admin_alert_run(date, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.claim_admin_alert_run(date) to service_role;
grant execute on function public.finish_admin_alert_run(date, text, jsonb, text) to service_role;

create or replace function public.business_hours_between(
  p_start timestamptz,
  p_end timestamptz,
  p_workday_start time,
  p_workday_end time,
  p_timezone text
)
returns numeric
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(
    greatest(
      0,
      extract(epoch from (
        least(p_end, ((work_day + p_workday_end) at time zone p_timezone))
        - greatest(p_start, ((work_day + p_workday_start) at time zone p_timezone))
      )) / 3600
    )
  ), 0)
  from generate_series(
    (p_start at time zone p_timezone)::date,
    (p_end at time zone p_timezone)::date,
    interval '1 day'
  ) as days(work_day)
  where extract(isodow from work_day) between 1 and 5
    and not exists (
      select 1 from public.admin_holidays holiday
      where holiday.holiday_date = work_day::date
    )
    and p_end > p_start;
$$;

create or replace function public.get_admin_operational_metrics()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  config public.admin_settings%rowtype;
  metrics jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and not public.has_admin_permission('reports.read') then
    raise exception 'Insufficient administrative permission' using errcode = '42501';
  end if;

  select * into config from public.admin_settings where id = true;
  select jsonb_build_object(
    'active_clients', (select count(*) from public.clients where archived_at is null),
    'total_orders', (select count(*) from public.service_orders),
    'open_orders', (select count(*) from public.service_orders where status not in ('delivered', 'cancelled')),
    'urgent_open_orders', (select count(*) from public.service_orders where priority = 'urgent' and status not in ('delivered', 'cancelled')),
    'open_inquiries', (select count(*) from public.service_inquiries where status not in ('resolved', 'closed')),
    'overdue_inquiries', (
      select count(*) from public.service_inquiries
      where status = 'new'
        and public.business_hours_between(created_at, now(), config.workday_start, config.workday_end, config.timezone)
          >= config.inquiry_response_sla_hours
    ),
    'overdue_urgent_orders', (
      select count(*) from public.service_orders
      where priority = 'urgent' and status not in ('delivered', 'cancelled')
        and public.business_hours_between(received_at, now(), config.workday_start, config.workday_end, config.timezone)
          >= config.urgent_order_sla_hours
    ),
    'stale_orders', (
      select count(*) from public.service_orders
      where status not in ('delivered', 'cancelled')
        and public.business_hours_between(updated_at, now(), config.workday_start, config.workday_end, config.timezone)
          >= config.stale_order_hours
    ),
    'failed_document_emails_7d', (
      select count(*) from public.admin_email_delivery_events
      where result = 'failed' and created_at >= now() - interval '7 days'
    ),
    'avg_first_response_business_hours_90d', (
      select round(avg(public.business_hours_between(
        inquiry.created_at,
        first_response.response_at,
        config.workday_start,
        config.workday_end,
        config.timezone
      )), 1)
      from public.service_inquiries inquiry
      join lateral (
        select min(event.created_at) as response_at
        from public.service_inquiry_events event
        where event.inquiry_id = inquiry.id
          and event.event_type = 'status_changed'
          and event.previous_status = 'new'
      ) first_response on first_response.response_at is not null
      where inquiry.created_at >= now() - interval '90 days'
    ),
    'avg_order_completion_business_hours_90d', (
      select round(avg(public.business_hours_between(
        received_at,
        delivered_at,
        config.workday_start,
        config.workday_end,
        config.timezone
      )), 1)
      from public.service_orders
      where delivered_at >= now() - interval '90 days'
    )
  ) into metrics;
  return metrics;
end;
$$;

revoke all on function public.business_hours_between(timestamptz, timestamptz, time, time, text) from public, anon;
revoke all on function public.get_admin_operational_metrics() from public, anon;
grant execute on function public.business_hours_between(timestamptz, timestamptz, time, time, text) to authenticated, service_role;
grant execute on function public.get_admin_operational_metrics() to authenticated;
grant execute on function public.get_admin_operational_metrics() to service_role;

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
security invoker
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
  select 'clients'::text, config.retention_clients_days,
    count(*) filter (where config.retention_clients_days is not null and archived_at < now() - make_interval(days => config.retention_clients_days)),
    min(archived_at) filter (where config.retention_clients_days is not null and archived_at < now() - make_interval(days => config.retention_clients_days)),
    false
  from public.clients
  union all
  select 'inquiries'::text, config.retention_inquiries_days,
    count(*) filter (where config.retention_inquiries_days is not null and status in ('resolved', 'closed') and created_at < now() - make_interval(days => config.retention_inquiries_days)),
    min(created_at) filter (where config.retention_inquiries_days is not null and status in ('resolved', 'closed') and created_at < now() - make_interval(days => config.retention_inquiries_days)),
    false
  from public.service_inquiries
  union all
  select 'documents'::text, config.retention_documents_days,
    count(*) filter (where config.retention_documents_days is not null and created_at < now() - make_interval(days => config.retention_documents_days)),
    min(created_at) filter (where config.retention_documents_days is not null and created_at < now() - make_interval(days => config.retention_documents_days)),
    false
  from public.service_documents
  union all
  select 'orders'::text, config.retention_orders_days,
    count(*) filter (where config.retention_orders_days is not null and status in ('delivered', 'cancelled') and coalesce(delivered_at, updated_at) < now() - make_interval(days => config.retention_orders_days)),
    min(coalesce(delivered_at, updated_at)) filter (where config.retention_orders_days is not null and status in ('delivered', 'cancelled') and coalesce(delivered_at, updated_at) < now() - make_interval(days => config.retention_orders_days)),
    false
  from public.service_orders;
end;
$$;

revoke all on function public.get_admin_retention_report() from public, anon;
grant execute on function public.get_admin_retention_report() to authenticated;

drop policy if exists "Staff can create clients" on public.clients;
drop policy if exists "Staff can update clients" on public.clients;
drop policy if exists "Authorized staff can create clients" on public.clients;
drop policy if exists "Authorized staff can update clients" on public.clients;
create policy "Authorized staff can create clients"
  on public.clients for insert to authenticated
  with check (public.has_admin_permission('clients.manage') and created_by = (select auth.uid()));
create policy "Authorized staff can update clients"
  on public.clients for update to authenticated
  using (public.has_admin_permission('clients.manage'))
  with check (public.has_admin_permission('clients.manage'));

drop policy if exists "Staff can create service documents" on public.service_documents;
drop policy if exists "Staff can update service documents" on public.service_documents;
drop policy if exists "Authorized staff can create service documents" on public.service_documents;
drop policy if exists "Authorized staff can update service documents" on public.service_documents;
create policy "Authorized staff can create service documents"
  on public.service_documents for insert to authenticated
  with check (public.has_admin_permission('documents.manage') and created_by = (select auth.uid()));
create policy "Authorized staff can update service documents"
  on public.service_documents for update to authenticated
  using (public.has_admin_permission('documents.manage'))
  with check (public.has_admin_permission('documents.manage'));

revoke all on function public.guard_admin_write() from public, anon, authenticated;
revoke all on function public.audit_admin_row_change() from public, anon, authenticated;
revoke all on function public.prevent_last_admin_removal() from public, anon, authenticated;
revoke all on function public.lock_admin_profile_insert() from public, anon, authenticated;
