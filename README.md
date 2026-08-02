# NxtHike monorepo

Job / internship / courses portal + **Hiring CRM** (candidates dashboard).

```
nxthike-dev/
├── FE/          # React + Vite + TypeScript frontend
├── BE/          # FastAPI + SQLAlchemy backend
└── supabase/    # SQL migrations for Supabase Postgres
```

## Frontend (`FE/`)

```bash
cd FE
cp .env.example .env   # set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

Hiring CRM routes:

- `/hiring` / `/hiring/dashboard` — stats
- `/hiring/candidates` — table + filters + CRUD
- `/hiring/pipeline` — kanban board

Nav: **Dashboard** menu.

## Backend (`BE/`)

```bash
cd BE
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Local SQLite (default) — or set SUPABASE_DB_URL / DATABASE_URL
uvicorn app.main:app --reload --port 8000

# Seed hiring candidates from FE seed JSON (~3.6k)
python -m app.seed_hiring
```

API docs: http://localhost:8000/docs  

Hiring endpoints under `/api/hiring/*` (roles, dashboard, candidates CRUD, bulk status/delete/import).

## Supabase

1. Create a Supabase project.
2. Run SQL in `supabase/migrations/20260802000000_hiring_crm.sql` (SQL Editor).
3. In `BE/.env` set connection string:

```env
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

4. Seed:

```bash
cd BE && python -m app.seed_hiring --seed-dir ../FE/public/seed
```

FastAPI uses **SQLAlchemy + asyncpg** against Supabase Postgres (same schema as the migration). The service role / DB password is for the API only; do not expose it in the FE.

## Health

- FE: http://localhost:5173  
- BE: http://localhost:8000/api/health  
