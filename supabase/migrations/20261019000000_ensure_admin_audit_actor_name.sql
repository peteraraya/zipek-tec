alter table public.admin_audit_log
  add column if not exists actor_name text;

update public.admin_audit_log audit
set actor_name = profile.display_name
from public.admin_profiles profile
where audit.actor_id = profile.id
  and audit.actor_name is null;

notify pgrst, 'reload schema';
