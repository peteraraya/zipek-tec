set search_path = public, extensions;

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

alter table public.service_documents
  add column if not exists search_text text not null default '';

create or replace function public.set_service_document_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select left(
    coalesce(string_agg(value, ' ' order by key), ''),
    4000
  )
  into new.search_text
  from jsonb_each_text(new.data) as fields(key, value);

  return new;
end;
$$;

do $$
begin
  execute 'alter table public.service_documents disable trigger service_documents_set_updated_at';
  update public.service_documents
  set search_text = left(
    coalesce((
      select string_agg(value, ' ' order by key)
      from jsonb_each_text(service_documents.data) as fields(key, value)
    ), ''),
    4000
  )
  where search_text is distinct from left(
    coalesce((
      select string_agg(value, ' ' order by key)
      from jsonb_each_text(service_documents.data) as fields(key, value)
    ), ''),
    4000
  );
  execute 'alter table public.service_documents enable trigger service_documents_set_updated_at';
end
$$;

drop trigger if exists service_documents_set_search_text on public.service_documents;
create trigger service_documents_set_search_text
before insert or update on public.service_documents
for each row execute function public.set_service_document_search_text();

create index if not exists clients_updated_cursor_idx
  on public.clients (updated_at desc, id desc);
create index if not exists clients_archive_cursor_idx
  on public.clients (archived_at, updated_at desc, id desc);
create index if not exists clients_name_trgm_idx
  on public.clients using gin (full_name gin_trgm_ops);
create index if not exists clients_rut_trgm_idx
  on public.clients using gin (rut gin_trgm_ops)
  where rut is not null;
create index if not exists clients_phone_trgm_idx
  on public.clients using gin (phone gin_trgm_ops);
create index if not exists clients_email_trgm_idx
  on public.clients using gin (email gin_trgm_ops)
  where email is not null;

create index if not exists service_orders_updated_cursor_idx
  on public.service_orders (updated_at desc, id desc);
create index if not exists service_orders_status_cursor_idx
  on public.service_orders (status, updated_at desc, id desc);
create index if not exists service_orders_priority_cursor_idx
  on public.service_orders (priority, updated_at desc, id desc);
create index if not exists service_orders_number_trgm_idx
  on public.service_orders using gin (order_number gin_trgm_ops);
create index if not exists service_orders_service_type_trgm_idx
  on public.service_orders using gin (service_type gin_trgm_ops);
create index if not exists service_orders_equipment_trgm_idx
  on public.service_orders using gin (
    (coalesce(equipment_brand, '') || ' ' || coalesce(equipment_model, '') || ' ' || coalesce(equipment_serial, ''))
    gin_trgm_ops
  );
create index if not exists service_orders_search_fts_idx
  on public.service_orders using gin (
    to_tsvector(
      'simple'::regconfig,
      coalesce(order_number, '') || ' ' || coalesce(service_type, '') || ' '
      || coalesce(equipment_brand, '') || ' ' || coalesce(equipment_model, '') || ' '
      || coalesce(equipment_serial, '')
    )
  );

create index if not exists service_documents_updated_cursor_idx
  on public.service_documents (updated_at desc, id desc);
create index if not exists service_documents_status_cursor_idx
  on public.service_documents (status, updated_at desc, id desc);
create index if not exists service_documents_template_cursor_idx
  on public.service_documents (template_id, updated_at desc, id desc);
create index if not exists service_documents_search_trgm_idx
  on public.service_documents using gin (search_text gin_trgm_ops);
create index if not exists service_documents_search_fts_idx
  on public.service_documents using gin (to_tsvector('simple'::regconfig, search_text));

create index if not exists service_inquiries_updated_cursor_idx
  on public.service_inquiries (updated_at desc, id desc);
create index if not exists service_inquiries_status_cursor_idx
  on public.service_inquiries (status, updated_at desc, id desc);
create index if not exists service_inquiries_source_cursor_idx
  on public.service_inquiries (source, updated_at desc, id desc);
create index if not exists service_inquiries_number_trgm_idx
  on public.service_inquiries using gin (inquiry_number gin_trgm_ops);
create index if not exists service_inquiries_topic_trgm_idx
  on public.service_inquiries using gin (topic gin_trgm_ops);
create index if not exists service_inquiries_message_trgm_idx
  on public.service_inquiries using gin (message gin_trgm_ops);
create index if not exists service_inquiries_search_fts_idx
  on public.service_inquiries using gin (
    to_tsvector('simple'::regconfig, coalesce(topic, '') || ' ' || coalesce(message, ''))
  );

drop function if exists public.search_admin_orders(text, text, text, date, date, timestamptz, uuid, integer);
drop function if exists public.search_admin_inquiries(text, text, text, date, date, timestamptz, uuid, integer);

create or replace function public.search_admin_clients(
  p_query text,
  p_archived text,
  p_from date,
  p_to date,
  p_before_updated_at timestamptz,
  p_before_id uuid,
  p_limit integer
)
returns table (
  id uuid,
  full_name text,
  rut text,
  phone text,
  email text,
  archived_at timestamptz,
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.id, c.full_name, c.rut, c.phone, c.email, c.archived_at,
    c.archived_at is not null, c.created_at, c.updated_at
  from public.clients c
  where (
      p_archived = 'all'
      or (p_archived = 'archived' and c.archived_at is not null)
      or (p_archived = 'active' and c.archived_at is null)
    )
    and (p_from is null or c.created_at >= (p_from::timestamp at time zone 'America/Santiago'))
    and (p_to is null or c.created_at < ((p_to + 1)::timestamp at time zone 'America/Santiago'))
    and (
      p_query = ''
      or c.full_name ilike '%' || p_query || '%'
      or coalesce(c.rut, '') ilike '%' || p_query || '%'
      or c.phone ilike '%' || p_query || '%'
      or coalesce(c.email, '') ilike '%' || p_query || '%'
    )
    and (
      p_before_updated_at is null
      or (c.updated_at, c.id) < (p_before_updated_at, p_before_id)
    )
  order by c.updated_at desc, c.id desc
  limit least(greatest(p_limit, 1), 101);
$$;

create or replace function public.search_admin_orders(
  p_query text,
  p_status public.service_status,
  p_priority public.service_priority,
  p_from date,
  p_to date,
  p_before_updated_at timestamptz,
  p_before_id uuid,
  p_limit integer
)
returns table (
  id uuid,
  order_number text,
  client_id uuid,
  client_name text,
  service_type text,
  status text,
  priority text,
  received_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select o.id, o.order_number, o.client_id, c.full_name, o.service_type,
    o.status::text, o.priority::text, o.received_at, o.updated_at
  from public.service_orders o
  join public.clients c on c.id = o.client_id
  where (p_status is null or o.status = p_status)
    and (p_priority is null or o.priority = p_priority)
    and (p_from is null or o.received_at >= (p_from::timestamp at time zone 'America/Santiago'))
    and (p_to is null or o.received_at < ((p_to + 1)::timestamp at time zone 'America/Santiago'))
    and (
      p_query = ''
      or to_tsvector(
        'simple',
        coalesce(o.order_number, '') || ' ' || coalesce(o.service_type, '') || ' '
        || coalesce(o.equipment_brand, '') || ' ' || coalesce(o.equipment_model, '') || ' '
        || coalesce(o.equipment_serial, '')
      ) @@ plainto_tsquery('simple'::regconfig, replace(p_query, E'\\', ''))
      or o.order_number ilike '%' || p_query || '%'
      or o.service_type ilike '%' || p_query || '%'
      or c.full_name ilike '%' || p_query || '%'
      or (coalesce(o.equipment_brand, '') || ' ' || coalesce(o.equipment_model, '') || ' ' || coalesce(o.equipment_serial, ''))
        ilike '%' || p_query || '%'
    )
    and (
      p_before_updated_at is null
      or (o.updated_at, o.id) < (p_before_updated_at, p_before_id)
    )
  order by o.updated_at desc, o.id desc
  limit least(greatest(p_limit, 1), 101);
$$;

create or replace function public.search_admin_documents(
  p_query text,
  p_status text,
  p_template text,
  p_from date,
  p_to date,
  p_before_updated_at timestamptz,
  p_before_id uuid,
  p_limit integer
)
returns table (
  id uuid,
  client_id uuid,
  client_name text,
  order_id uuid,
  order_number text,
  template_id text,
  status text,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select d.id, d.client_id, c.full_name, d.order_id, o.order_number,
    d.template_id, d.status, d.updated_at
  from public.service_documents d
  join public.clients c on c.id = d.client_id
  left join public.service_orders o on o.id = d.order_id
  where (p_status is null or d.status = p_status)
    and (p_template is null or d.template_id = p_template)
    and (p_from is null or d.updated_at >= (p_from::timestamp at time zone 'America/Santiago'))
    and (p_to is null or d.updated_at < ((p_to + 1)::timestamp at time zone 'America/Santiago'))
    and (
      p_query = ''
      or c.full_name ilike '%' || p_query || '%'
      or coalesce(o.order_number, '') ilike '%' || p_query || '%'
      or d.template_id ilike '%' || p_query || '%'
      or to_tsvector('simple'::regconfig, d.search_text)
        @@ plainto_tsquery('simple'::regconfig, replace(p_query, E'\\', ''))
      or d.search_text ilike '%' || p_query || '%'
    )
    and (
      p_before_updated_at is null
      or (d.updated_at, d.id) < (p_before_updated_at, p_before_id)
    )
  order by d.updated_at desc, d.id desc
  limit least(greatest(p_limit, 1), 101);
$$;

create or replace function public.search_admin_inquiries(
  p_query text,
  p_status public.service_inquiry_status,
  p_source public.service_inquiry_source,
  p_from date,
  p_to date,
  p_before_updated_at timestamptz,
  p_before_id uuid,
  p_limit integer
)
returns table (
  id uuid,
  inquiry_number text,
  source text,
  status text,
  topic text,
  contact_display text,
  contact_consent boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select i.id, i.inquiry_number, i.source::text, i.status::text, i.topic,
    case
      when i.contact_consent then coalesce(i.contact_name, i.contact_phone, i.contact_email)
      else null
    end,
    i.contact_consent, i.created_at, i.updated_at
  from public.service_inquiries i
  where (p_status is null or i.status = p_status)
    and (p_source is null or i.source = p_source)
    and (p_from is null or i.created_at >= (p_from::timestamp at time zone 'America/Santiago'))
    and (p_to is null or i.created_at < ((p_to + 1)::timestamp at time zone 'America/Santiago'))
    and (
      p_query = ''
      or to_tsvector(
        'simple'::regconfig,
        coalesce(i.topic, '') || ' ' || coalesce(i.message, '')
        ) @@ plainto_tsquery('simple'::regconfig, replace(p_query, E'\\', ''))
      or i.inquiry_number ilike '%' || p_query || '%'
      or i.topic ilike '%' || p_query || '%'
      or i.message ilike '%' || p_query || '%'
      or coalesce(i.contact_name, '') ilike '%' || p_query || '%'
      or coalesce(i.contact_phone, '') ilike '%' || p_query || '%'
      or coalesce(i.contact_email, '') ilike '%' || p_query || '%'
    )
    and (
      p_before_updated_at is null
      or (i.updated_at, i.id) < (p_before_updated_at, p_before_id)
    )
  order by i.updated_at desc, i.id desc
  limit least(greatest(p_limit, 1), 101);
$$;

revoke all on function public.search_admin_clients(text, text, date, date, timestamptz, uuid, integer) from public, anon;
revoke all on function public.search_admin_orders(text, public.service_status, public.service_priority, date, date, timestamptz, uuid, integer) from public, anon;
revoke all on function public.search_admin_documents(text, text, text, date, date, timestamptz, uuid, integer) from public, anon;
revoke all on function public.search_admin_inquiries(text, public.service_inquiry_status, public.service_inquiry_source, date, date, timestamptz, uuid, integer) from public, anon;

grant execute on function public.search_admin_clients(text, text, date, date, timestamptz, uuid, integer) to authenticated;
grant execute on function public.search_admin_orders(text, public.service_status, public.service_priority, date, date, timestamptz, uuid, integer) to authenticated;
grant execute on function public.search_admin_documents(text, text, text, date, date, timestamptz, uuid, integer) to authenticated;
grant execute on function public.search_admin_inquiries(text, public.service_inquiry_status, public.service_inquiry_source, date, date, timestamptz, uuid, integer) to authenticated;

notify pgrst, 'reload schema';
