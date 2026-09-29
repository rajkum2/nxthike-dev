-- NxtHike Sales CRM Phase 1 (additive)
-- New tables only. Does NOT alter candidates, companies, or hiring_roles.
-- Accounts reuse public.companies (no new accounts table).

create table if not exists public.sales_contacts (
  id text primary key,
  company_id text references public.companies (id) on delete set null,
  name text not null,
  title text,
  email text,
  phone text,
  linkedin_url text,
  is_primary boolean not null default false,
  notes text not null default '',
  owner_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ix_sales_contacts_company_id on public.sales_contacts (company_id);
create index if not exists ix_sales_contacts_owner_id on public.sales_contacts (owner_id);
create index if not exists ix_sales_contacts_email on public.sales_contacts (email);

create table if not exists public.sales_leads (
  id text primary key,
  company_id text references public.companies (id) on delete set null,
  contact_id text references public.sales_contacts (id) on delete set null,
  name text not null,
  source text,
  status text not null default 'new',
  product_line text not null default 'staffing'
    check (product_line in ('staffing', 'platform', 'hybrid')),
  score integer,
  notes text not null default '',
  owner_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ix_sales_leads_company_id on public.sales_leads (company_id);
create index if not exists ix_sales_leads_status on public.sales_leads (status);
create index if not exists ix_sales_leads_owner_id on public.sales_leads (owner_id);
create index if not exists ix_sales_leads_product_line on public.sales_leads (product_line);

create table if not exists public.sales_opportunities (
  id text primary key,
  company_id text references public.companies (id) on delete set null,
  contact_id text references public.sales_contacts (id) on delete set null,
  lead_id text references public.sales_leads (id) on delete set null,
  name text not null,
  product_line text not null default 'staffing'
    check (product_line in ('staffing', 'platform', 'hybrid')),
  stage text not null default 'qualify'
    check (stage in (
      'qualify', 'discovery', 'proposal', 'negotiation', 'won', 'lost', 'on_hold'
    )),
  amount numeric,
  currency text not null default 'INR',
  probability integer,
  expected_close date,
  hiring_role_ids jsonb not null default '[]'::jsonb,
  notes text not null default '',
  owner_id text,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ix_sales_opportunities_company_id on public.sales_opportunities (company_id);
create index if not exists ix_sales_opportunities_stage on public.sales_opportunities (stage);
create index if not exists ix_sales_opportunities_owner_id on public.sales_opportunities (owner_id);
create index if not exists ix_sales_opportunities_product_line on public.sales_opportunities (product_line);

-- Optional minimal activity log (calls, emails, notes, meetings)
create table if not exists public.sales_activities (
  id text primary key,
  opportunity_id text references public.sales_opportunities (id) on delete cascade,
  lead_id text references public.sales_leads (id) on delete set null,
  contact_id text references public.sales_contacts (id) on delete set null,
  company_id text references public.companies (id) on delete set null,
  activity_type text not null default 'note'
    check (activity_type in ('note', 'call', 'email', 'meeting', 'task')),
  subject text,
  body text not null default '',
  occurred_at timestamptz not null default now(),
  owner_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ix_sales_activities_opportunity_id on public.sales_activities (opportunity_id);
create index if not exists ix_sales_activities_occurred_at on public.sales_activities (occurred_at);

alter table public.sales_contacts enable row level security;
alter table public.sales_leads enable row level security;
alter table public.sales_opportunities enable row level security;
alter table public.sales_activities enable row level security;

-- Service role bypasses RLS. Authenticated workspace users get CRUD via API (service role).
drop policy if exists "sales_contacts_auth_all" on public.sales_contacts;
create policy "sales_contacts_auth_all" on public.sales_contacts
  for all to authenticated using (true) with check (true);

drop policy if exists "sales_leads_auth_all" on public.sales_leads;
create policy "sales_leads_auth_all" on public.sales_leads
  for all to authenticated using (true) with check (true);

drop policy if exists "sales_opportunities_auth_all" on public.sales_opportunities;
create policy "sales_opportunities_auth_all" on public.sales_opportunities
  for all to authenticated using (true) with check (true);

drop policy if exists "sales_activities_auth_all" on public.sales_activities;
create policy "sales_activities_auth_all" on public.sales_activities
  for all to authenticated using (true) with check (true);
