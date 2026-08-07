# NxtHike security model

**No application is completely “hack-proof.”** This document describes what is
enforced today, what was hardened in recent work, residual risks, and production
checklist items you must still configure.

## Threat model (honest)

| Threat | Mitigation | Residual risk |
|--------|------------|---------------|
| Anonymous access to CRM / candidates | JWT required; workspace persona required (`get_workspace_user`) | Stolen credentials or assigned persona still sees data they are allowed to |
| Self-signup → admin / CRM | Register only `student`/`employer`; **no persona** ⇒ no `/api/hiring` | If admin later assigns persona carelessly, access expands |
| Public registration abuse | `ALLOW_PUBLIC_REGISTER` (off by default in production) + rate limits | Brute-force against open register if left enabled |
| Password guessing | bcrypt (cost 12), generic login errors, rate limits | Offline cracks if DB dump + weak passwords |
| JWT theft (XSS / shared PC) | Shorter default TTL (12h), `no-store` on authenticated APIs | Token still in `localStorage` — XSS in FE can steal it |
| Scraping candidate list | Auth + persona; pageSize ≤ 100; rate limits on list/bulk | A **legitimate full-access admin** can still export data they are entitled to |
| Bulk wipe / mass edit | Cap `MAX_BULK_IDS` (200), import cap, admin for delete | Compromised admin account is full access by design |
| OpenAPI / Swagger recon | Docs off when `ENABLE_API_DOCS=false` (default prod) | If left on, schema is public |
| CORS abuse | Explicit `CORS_ORIGINS` only (never `*`) | Misconfigured origin list still risky |
| PII leak to limited roles | Server-side mask on candidate responses + dialer queue | Notes/resume links may still leak context; call logs store numbers |
| Anonymous file upload | Uploads require auth | Local `/uploads` mount is not JWT-gated if `STORAGE_BACKEND=local` |
| Call log delete by any workspace user | Admin-only delete; edit own logs only | — |
| Rate-limit spoof via `X-Forwarded-For` | Only trusted when `TRUST_PROXY=1` | Must enable correctly behind your reverse proxy |

## What is enforced server-side

1. **Authentication** — Bearer JWT (`sub`, `exp` required); suspended users blocked.
2. **Workspace gate** — Portal students/employers without a **persona** cannot hit hiring/calls/workspace APIs.
3. **Capability matrix** — Create / stage / dial / log / admin / rates checked per route where applied.
4. **PII masking** — Roles with `db` in `limitedPII` / `ownReqs` / `ownInterviews` get masked phone/email on the way out; they cannot write phone/email back.
5. **No self-admin registration** — `role=admin` on register is ignored.
6. **Rate limiting** — Login/register, bulk ops, candidate list, dialer queue, global API ceiling (in-process).
7. **Security headers** — `X-Frame-Options`, `nosniff`, COOP/CORP, HSTS in production, FE CSP via Netlify.
8. **Bulk guards** — Max IDs per bulk call; max import rows; delete requires admin.

## Production environment checklist

Set these on the **API** host (Railway / Fly / VPS / etc.):

```bash
ENVIRONMENT=production
SECRET_KEY=<long random 32+ bytes>
ADMIN_PASSWORD=<strong unique password>
ALLOW_PUBLIC_REGISTER=false          # or true only if public portal signup is needed
ENABLE_API_DOCS=false
CORS_ORIGINS=https://your-frontend.example.com
TRUST_PROXY=1                        # only if behind nginx/Cloudflare that sets X-Forwarded-For
ACCESS_TOKEN_EXPIRE_MINUTES=720      # 12h; lower if you want tighter sessions
DATABASE_URL=...                     # or SUPABASE_DB_URL
```

Frontend:

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=https://your-api.example.com
# Do NOT put service-role Supabase keys in VITE_* vars
```

Infrastructure (strongly recommended):

- TLS only (HTTPS) end-to-end  
- WAF / Cloudflare in front of API + FE  
- Redis-backed rate limits if you run multiple API instances  
- R2 with **private** objects + signed URLs for resumes (avoid public bucket + local `/uploads` for PII)  
- Rotate `SECRET_KEY` only with a planned logout of all sessions  
- Never commit `.env` with secrets  

## What “cannot scrape” means here

- **Unauthenticated** scrapers cannot pull the CRM (401/403 + rate limits).  
- **Authenticated full admins** *can* list and export candidates — that is product functionality, not a bug.  
- Prevent data exfiltration by **least-privilege personas**, offboarding, and monitoring — not by pretending admins cannot query the API.

## Residual / planned improvements

- Move JWT from `localStorage` to httpOnly secure cookies (requires CSRF tokens).  
- Refresh tokens + revocation list.  
- Row-level scope for `db: assigned` / `ownReqs` on every list query (today some list endpoints still return the full candidate table to any workspace user who can open the screen).  
- Audit log of bulk deletes and large list exports.  
- CAPTCHA on login/register if public.  
- Dependency scanning (Dependabot / `pip-audit` / `npm audit`) in CI.

## Reporting issues

Treat production PII breaches as high severity. Rotate `SECRET_KEY`, force password resets, and review workspace personas immediately after any suspected compromise.
