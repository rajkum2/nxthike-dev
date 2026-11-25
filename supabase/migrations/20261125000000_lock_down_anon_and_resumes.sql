-- Lock down candidate PII and the resumes bucket.
--
-- The API connects as the database owner / service role and bypasses RLS, so
-- FastAPI hiring, workspace, and upload routes keep working. This migration
-- only closes the PostgREST / Storage paths that the anon key could use.
--
-- Avatars, company logos, event images, and course images stay public.
-- The portal renders those without a login (profile photos and marketing
-- images). Resumes are applicant documents and are not in that set.
-- Hiring resumes in production are stored on R2 (or local disk) via
-- /api/uploads, not in this Supabase bucket; making the bucket private does
-- not change those URLs.

-- ---------------------------------------------------------------------------
-- Candidates and hiring roles: no anonymous reads.
-- Authenticated Supabase users who are not in public.admins cannot read or
-- write these tables either. Staff use the API, which bypasses RLS.
-- ---------------------------------------------------------------------------

drop policy if exists "candidates_anon_read" on public.candidates;
drop policy if exists "hiring_roles_anon_read" on public.hiring_roles;

drop policy if exists "candidates_read" on public.candidates;
drop policy if exists "candidates_write" on public.candidates;
drop policy if exists "hiring_roles_read" on public.hiring_roles;
drop policy if exists "hiring_roles_write" on public.hiring_roles;

drop policy if exists "candidates_admin_all" on public.candidates;
create policy "candidates_admin_all" on public.candidates
  for all to authenticated
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "hiring_roles_admin_all" on public.hiring_roles;
create policy "hiring_roles_admin_all" on public.hiring_roles
  for all to authenticated
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

-- Defense in depth if RLS is later disabled on these tables.
revoke all on table public.candidates from anon;
revoke all on table public.hiring_roles from anon;

-- ---------------------------------------------------------------------------
-- Companies: the public directory is real clients only.
-- Prospects (is_client = false) stay invisible to the anon and authenticated
-- Supabase keys. The API enforces the same split and bypasses RLS.
-- ---------------------------------------------------------------------------

alter table if exists public.companies enable row level security;

drop policy if exists "companies_public_clients_read" on public.companies;
create policy "companies_public_clients_read" on public.companies
  for select to anon, authenticated
  using (coalesce(is_client, false) = true);

-- ---------------------------------------------------------------------------
-- Resumes bucket: private, owner or admin read.
-- ---------------------------------------------------------------------------

update storage.buckets
set public = false
where id = 'resumes';

drop policy if exists "Anyone can read resumes" on storage.objects;

drop policy if exists "Owners can read their resumes" on storage.objects;
create policy "Owners can read their resumes"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins can read resumes" on storage.objects;
create policy "Admins can read resumes"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and exists (select 1 from public.admins a where a.id = auth.uid())
  );
