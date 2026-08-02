-- NxtHike Hiring CRM tables (Supabase / Postgres)
-- Apply via Supabase SQL editor or: supabase db push

create table if not exists public.hiring_roles (
  id text primary key,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id text primary key,
  role_id text not null references public.hiring_roles (id) on delete restrict,
  role_name text not null default '',
  status text not null default 'new',
  tags jsonb not null default '[]'::jsonb,
  notes text not null default '',
  starred boolean not null default false,

  name text,
  application_link text,
  phone text,
  email text,
  city text,
  gender text,
  other_skills text,
  ai_resume_match text,

  institute text,
  degree text,
  stream text,
  graduation_year text,
  performance_pg text,
  performance_ug text,
  performance_12 text,
  performance_10 text,

  chat_link text,
  resume_link text,
  download_link text,
  applied_at text,

  has_work_experience text,
  total_roles text,
  internship_count text,
  fulltime_count text,
  companies text,
  job_titles text,
  work_experience_detail text,
  experience_duration text,
  latest_role text,
  latest_company text,

  career_objective text,
  languages text,
  certifications text,
  projects text,
  extra_curricular text,
  additional_details text,
  relevant_skills text,
  education_from_pdf text,
  stream_from_pdf text,
  pdf_file text,
  availability text,

  ai_interview_scores jsonb not null default '{}'::jsonb,
  skill_flags jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ix_candidates_role_id on public.candidates (role_id);
create index if not exists ix_candidates_status on public.candidates (status);
create index if not exists ix_candidates_city on public.candidates (city);
create index if not exists ix_candidates_starred on public.candidates (starred);
create index if not exists ix_candidates_email on public.candidates (email);
create index if not exists ix_candidates_name on public.candidates (name);

-- Optional: allow API (service role) full access; tighten RLS for anon as needed
alter table public.hiring_roles enable row level security;
alter table public.candidates enable row level security;

-- Service role bypasses RLS. Policies for authenticated dashboard users:
drop policy if exists "hiring_roles_read" on public.hiring_roles;
create policy "hiring_roles_read" on public.hiring_roles
  for select to authenticated using (true);

drop policy if exists "candidates_read" on public.candidates;
create policy "candidates_read" on public.candidates
  for select to authenticated using (true);

drop policy if exists "candidates_write" on public.candidates;
create policy "candidates_write" on public.candidates
  for all to authenticated using (true) with check (true);

drop policy if exists "hiring_roles_write" on public.hiring_roles;
create policy "hiring_roles_write" on public.hiring_roles
  for all to authenticated using (true) with check (true);

-- Public read for demo (optional; remove in production if private)
drop policy if exists "hiring_roles_anon_read" on public.hiring_roles;
create policy "hiring_roles_anon_read" on public.hiring_roles
  for select to anon using (true);

drop policy if exists "candidates_anon_read" on public.candidates;
create policy "candidates_anon_read" on public.candidates
  for select to anon using (true);
