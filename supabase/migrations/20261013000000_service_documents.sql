alter table public.service_orders
  add constraint service_orders_id_client_id_unique unique (id, client_id);

create table public.service_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id),
  order_id uuid,
  template_id text not null check (template_id in (
    'privacy-notice',
    'equipment-intake',
    'service-proposal',
    'intervention-authorization',
    'remote-access-consent',
    'work-report',
    'warranty-policy',
    'data-deletion-certificate',
    'data-processing-agreement',
    'asset-inventory'
  )),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'sent')),
  sent_to text,
  sent_at timestamptz,
  created_by uuid not null references public.admin_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (order_id, client_id)
    references public.service_orders (id, client_id),
  check (
    (status = 'draft' and sent_to is null and sent_at is null)
    or (status = 'sent' and sent_to is not null and sent_at is not null)
  )
);

create index service_documents_client_updated_idx
  on public.service_documents (client_id, updated_at desc);
create index service_documents_order_updated_idx
  on public.service_documents (order_id, updated_at desc)
  where order_id is not null;

create trigger service_documents_set_updated_at
before update on public.service_documents
for each row execute function public.set_updated_at();

alter table public.service_documents enable row level security;

create policy "Staff can read service documents"
  on public.service_documents for select to authenticated
  using (public.is_active_staff());

create policy "Staff can create service documents"
  on public.service_documents for insert to authenticated
  with check (public.is_active_staff() and created_by = (select auth.uid()));

create policy "Staff can update service documents"
  on public.service_documents for update to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

revoke all on public.service_documents from anon;
grant select, insert, update on public.service_documents to authenticated;
