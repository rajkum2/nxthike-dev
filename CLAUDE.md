# NxtHike - Project Guide

## Overview
NxtHike is a job/internship/courses/events portal plus **Hiring CRM**, split into:

```
FE/     — React 18 + TypeScript + Vite + Tailwind + Zustand
BE/     — FastAPI + SQLAlchemy (async) + Supabase Postgres or SQLite
mobile/ — TalentDialer: native Android (Kotlin + Compose), same BE APIs
supabase/ — SQL migrations for Postgres/Supabase
```

Deployed FE on Netlify (`FE/netlify.toml`).

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend**: FastAPI, SQLAlchemy 2 async, uvicorn
- **Database**: Supabase Postgres (production) or SQLite (local)
- **Optional**: Supabase JS client for direct FE reads (`VITE_DATA_SOURCE=supabase`)

## Structure
```
FE/src/
├── components/     # home, layout, ui
├── config/         # dataSource (json | supabase | api)
├── data/           # static seed arrays (json mode)
├── hiring/         # Hiring CRM UI + store + styles
├── pages/          # routes including HiringTrackerPage
├── services/       # API clients (jobs, hiring, …)
└── store/          # Zustand domain stores

BE/app/
├── api/            # FastAPI routers (jobs, events, hiring, …)
├── models/         # SQLAlchemy models (incl. Candidate, HiringRole)
├── schemas/        # Pydantic DTOs
├── services/       # auth helpers
├── seed_hiring.py  # load FE/public/seed into DB
└── main.py
```

## Hiring CRM
- FE routes: `/hiring`, `/hiring/dashboard`, `/hiring/candidates`, `/hiring/pipeline`
- BE prefix: `/api/hiring`
  - `GET /roles`, `POST /roles`, `PATCH/DELETE /roles/{id}`
  - `GET /dashboard`
  - `GET/POST /candidates`, `GET/PUT/PATCH/DELETE /candidates/{id}`
  - `POST /candidates/bulk-status`, `/bulk-delete`, `/bulk-import`
- Seed: `cd BE && python -m app.seed_hiring`
- Nav menu: **Dashboard**

## Environment
### FE (`FE/.env`)
- `VITE_DATA_SOURCE` — `json` | `supabase` | `api` (use **api** for BE-backed data)
- `VITE_API_URL` — e.g. `http://localhost:8010` (must be NxtHike FastAPI, not another app)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

### BE (`BE/.env`)
- `DATABASE_URL` or `SUPABASE_DB_URL` — Postgres URI (asyncpg) or SQLite
- `SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `CORS_ORIGINS` — include FE origin
- `SEED_DIR` — default `../FE/public/seed`
- **Storage:** `STORAGE_BACKEND=local|r2` plus R2 keys when using Cloudflare R2
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Mobile — TalentDialer (`mobile/`)
Kotlin + Jetpack Compose recruiting desk built to the TalentDialer design spec.
Consumes the **same** `/api/*` routes as FE — no mobile-only backend.
- Spine: call queue → pre-call → `ACTION_DIAL` handoff → disposition sheet → next
- Dispositions map 1:1 to `CALL_DISPOSITIONS`; stages map to `Candidate.status`
- Requisition = `HiringRole`; Client = `/api/companies`
- TCCCPR calling window (09:00–21:00) hard-disables dialling outside it
- Offline dispositions queue in a DataStore outbox and replay on reconnect
- Full detail in `mobile/README.md`

## Commands
```bash
# Frontend
cd FE && npm run dev
cd FE && npm run build

# Backend
cd BE && source venv/bin/activate
uvicorn app.main:app --reload --port 8000
python -m app.seed_hiring

# Mobile
cd mobile && ./gradlew assembleDebug        # APK → app/build/outputs/apk/debug/
cd mobile && ./gradlew installDebug         # to a running device/emulator
```

## Data flow
```
Pages → Zustand → services → FastAPI → Supabase/SQLite
Hiring UI → hiring/store → hiringService → /api/hiring
```

If the API is down, hiring falls back to `public/seed/*.json`.
