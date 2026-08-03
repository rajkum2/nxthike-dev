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

## Storage (Cloudflare R2)

Set in `BE/.env`:

```env
STORAGE_BACKEND=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=nxthike-uploads
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

- Resume / image uploads go to R2 when `STORAGE_BACKEND=r2`, otherwise local `./uploads`.
- Status: `GET /api/uploads/status`
- Presigned browser upload: `POST /api/uploads/presign` (auth required, R2 only)

## Data loading checklist

| Layer | What loads from where |
|-------|------------------------|
| Hiring CRM (`/hiring`) | Always tries `VITE_API_URL` → `/api/hiring/*`; falls back to `FE/public/seed/*.json` if API down |
| Jobs / courses / etc. | `VITE_DATA_SOURCE=api` → BE; `json` → `FE/src/data/*`; `supabase` → Supabase client |
| Resumes | BE `/api/uploads/resume` → R2 or local disk |

**Important:** seed JSON in git is **not** automatically in production DB. After configuring `SUPABASE_DB_URL` (or prod Postgres):

```bash
cd BE && source venv/bin/activate
python -m app.seed_hiring --seed-dir ../FE/public/seed
# optional portal data:
# python -m app.seed
```

Verify: `curl $VITE_API_URL/api/health` should show `"service":"nxthike-api"` and `counts.candidates` > 0.

## Health

- FE: http://localhost:5173  
- BE: http://localhost:8010/api/health  

