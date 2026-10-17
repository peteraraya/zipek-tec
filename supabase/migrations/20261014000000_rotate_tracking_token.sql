create or replace function public.rotate_service_tracking_token(
  p_order_id uuid,
  p_tracking_token_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_active_staff() then
    raise exception 'Not authorized';
  end if;

  if p_tracking_token_hash is null or p_tracking_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid tracking token hash';
  end if;

  if not exists (
    select 1
    from public.service_orders o
    where o.id = p_order_id
  ) then
    raise exception 'Service order not found';
  end if;

  insert into public.service_tracking_tokens (order_id, token_hash, enabled, created_at)
  values (p_order_id, p_tracking_token_hash, true, now())
  on conflict (order_id) do update
    set token_hash = excluded.token_hash,
        enabled = true,
        created_at = excluded.created_at;
end;
$$;

revoke all on function public.rotate_service_tracking_token(uuid, text) from public, anon;
grant execute on function public.rotate_service_tracking_token(uuid, text) to authenticated;
