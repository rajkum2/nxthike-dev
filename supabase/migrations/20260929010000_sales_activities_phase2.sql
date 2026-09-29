-- NxtHike Sales CRM Phase 2 (additive)
-- Extends sales_activities for timeline + outbound approve queue.
-- Does NOT alter candidates, companies, hiring_roles, or drop sales data.

-- Drop any existing activity_type CHECK so we can widen allowed values.
do $$
declare
  r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.conrelid = 'public.sales_activities'::regclass
      and c.contype = 'c'
      and a.attname = 'activity_type'
  loop
    execute format('alter table public.sales_activities drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.sales_activities add column if not exists status text;
alter table public.sales_activities add column if not exists direction text;
alter table public.sales_activities add column if not exists channel text;
alter table public.sales_activities add column if not exists body_html text;
alter table public.sales_activities add column if not exists created_by text;
alter table public.sales_activities add column if not exists approved_by text;
alter table public.sales_activities add column if not exists approved_at timestamptz;
alter table public.sales_activities add column if not exists rejected_reason text;
alter table public.sales_activities add column if not exists scheduled_at timestamptz;
alter table public.sales_activities add column if not exists completed_at timestamptz;
alter table public.sales_activities add column if not exists metadata jsonb;

-- Backfill defaults for existing / newly added nullables
update public.sales_activities set status = 'done' where status is null;
update public.sales_activities set metadata = '{}'::jsonb where metadata is null;

alter table public.sales_activities alter column status set default 'done';
alter table public.sales_activities alter column status set not null;
alter table public.sales_activities alter column metadata set default '{}'::jsonb;
alter table public.sales_activities alter column metadata set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.sales_activities'::regclass
      and conname = 'sales_activities_activity_type_check'
  ) then
    alter table public.sales_activities
      add constraint sales_activities_activity_type_check
      check (activity_type in (
        'note', 'call', 'email', 'meeting', 'task',
        'outreach_draft', 'outreach_sent', 'stage_change'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.sales_activities'::regclass
      and conname = 'sales_activities_status_check'
  ) then
    alter table public.sales_activities
      add constraint sales_activities_status_check
      check (status in (
        'planned', 'done', 'cancelled',
        'pending_approval', 'approved', 'rejected', 'sent'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.sales_activities'::regclass
      and conname = 'sales_activities_direction_check'
  ) then
    alter table public.sales_activities
      add constraint sales_activities_direction_check
      check (direction is null or direction in ('inbound', 'outbound', 'internal'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.sales_activities'::regclass
      and conname = 'sales_activities_channel_check'
  ) then
    alter table public.sales_activities
      add constraint sales_activities_channel_check
      check (channel is null or channel in ('email', 'phone', 'linkedin', 'whatsapp', 'other'));
  end if;
end $$;

create index if not exists ix_sales_activities_status on public.sales_activities (status);
create index if not exists ix_sales_activities_activity_type on public.sales_activities (activity_type);
create index if not exists ix_sales_activities_created_by on public.sales_activities (created_by);
create index if not exists ix_sales_activities_scheduled_at on public.sales_activities (scheduled_at);
