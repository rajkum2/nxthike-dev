# TalentDialer — NxtHike Android

Native Android recruiting desk, rebuilt to the **TalentDialer** Claude Design spec
(`TalentDialer.dc.html`) and wired to the existing FastAPI backend under `BE/`.
No backend changes were made: every screen reads and writes the same `/api/*`
routes the previous app used.

## The spine

The app is organised around one loop, and everything else supports it:

```
Call queue → Pre-call card → ACTION_DIAL handoff → return → Disposition sheet → next
```

**Duration without permissions.** The app declares no `READ_CALL_LOG`. It times
the gap between firing the dial intent and the app regaining focus, and pre-fills
that as an editable estimate — which is why every logged duration is labelled
`ESTIMATED`.

**The calling window is a gate, not a warning.** TRAI TCCCPR 2018 permits
commercial calls 09:00–21:00 only. Outside the window the dial affordance is
disabled everywhere (queue FAB, pre-call, row buttons), and callback slots
outside it render disabled rather than hidden. Editable under More → Calling
window.

**Nothing is lost offline.** A disposition logged without signal goes to a
durable outbox with its real `calledAt`, the sheet still closes, and the flow
advances. More → Offline & sync shows exactly what is pending and retries.

## Screens

| Area | Screens |
|------|---------|
| Onboarding | Login, Register, Workspace mode, Permission priming, Degraded mode, DPDP consent |
| Home | Dashboard, Notifications, Tasks, Global search, Quick add |
| Calls | Queue, Pre-call, Handoff, Disposition sheet, Callback scheduler, DND block, Queue summary, Callbacks, History |
| Candidates | Search & list, Filter sheet, Profile (5 tabs), Add/edit with live dedupe, Compare & merge, Resume, Consent, Erasure |
| Requisitions | List, Detail, Create, Pipeline board, Pipeline list, Stage-change sheet, Job postings |
| Comms | Message composer, Template library |
| Interviews | Calendar, Schedule, Interview kit, Scorecard |
| Offers | List, Detail, Approvals |
| Clients | List, Client 360, Submissions |
| Team | Activity feed, My performance, Team dashboard |
| Admin | More hub, Settings, Calling window, Roles matrix, Compliance centre, Audit log, Disposition taxonomy, Offline & sync, State gallery |
| Portal | Events, Courses (kept from the previous app; no design counterpart) |

## Design → API mapping

The spec's vocabulary and the API's schema differ in wording only for the two
things that matter most:

| Spec | API | Notes |
|------|-----|-------|
| 11 disposition codes | `CALL_DISPOSITIONS` | Identical sets. `Dispositions` adds label/colour/icon/next-action. |
| Sourced / Screening / Submitted / Interview / Offer / Hired / Dropped | `new` / `reviewing` / `shortlisted` / `interview` / `offer` / `hired` / `rejected` | `Stages` maps them; `on_hold` is handled off-board. |
| Requisition | `HiringRole` | Roles own the pipeline, so they are what a call queue is built from. |
| Client | `/api/companies` | |
| Submission | Candidate at Submitted or beyond | |

Where the API has no field, the app shows what the record *does* know rather
than inventing data. Concretely, there is no CTC / bill-rate / offer table, so:

- The candidate fact grid shows experience, availability, source and institute.
- Requisition commercials come from a matching public posting on `/api/jobs`, or
  the card is omitted.
- Offers, interviews and scorecards are derived from pipeline stage, and write
  back as structured note lines on the candidate.
- The roles matrix is a local model — the API enforces `admin`/`user` only, and
  the screen says so.

## Architecture

```
core/model/       Dispositions, Stages, CallingWindow, CandidateTags
core/util/        Fmt (dates, durations, masking, counts)
data/local/       TokenStore, WorkspaceStore (mode, window, toggles), OutboxStore
data/remote/      Retrofit APIs + Moshi DTOs
data/repository/  AppResult-returning repositories
presentation/
  designsystem/   Tokens (T), Type, Theme, Components
  session/        SessionViewModel — auth, mode, window, outbox
  talent/         one package per screen area
  navigation/     R (routes) + TalentNavHost (graph, bottom bar, sheets)
```

Sheets and dialogs are hosted above the nav graph so they survive navigation;
long-lived flows (call flow, candidates, pipeline, offers, clients, interviews)
are held at the host so state persists across tabs.

## Design system

`presentation/designsystem/Tokens.kt` holds every colour and radius from the
spec verbatim. The spec sets its UI in **Plus Jakarta Sans** and its numerics in
**Roboto Mono**; neither ships with Android, so the app uses the platform faces
and carries the spec's weight/size/tracking scale across. To get the exact
faces, drop the OFL `.ttf` files into `res/font/` and change the two
declarations at the top of `Theme.kt` — nothing else references a family.

## Setup

Default backend is production: `https://api.nxthike.com/`

```bash
cd mobile && ./gradlew assembleDebug
# APK → app/build/outputs/apk/debug/app-debug.apk  (also mobile/dist/)

# Local backend override
./gradlew assembleDebug -PapiBaseUrl=http://10.0.2.2:8010/     # emulator
./gradlew assembleDebug -PapiBaseUrl=http://192.168.x.x:8010/  # LAN
```

## Personas & access

Two independent things get called a "persona" here — don't conflate them.

**1. Server roles** (`User.role`, the only thing actually enforced):

| Role | Can use TalentDialer? | Why |
|------|----------------------|-----|
| `admin` | Yes — everything | `/api/hiring/*`, `/api/calls/*`, `/api/dashboard/*` all depend on `get_admin_user` |
| `employer` | No | 403 on every CRM route |
| `student` | No | 403 on every CRM route |

There is **no** `recruiter`, `sourcer` or `team lead` role on the server. A
signed-in non-admin is stopped at an access-pending screen naming the exact
promotion needed, rather than being dropped into twelve screens that each 403.

`POST /api/auth/register` refuses self-registration as admin (it forces
`student`/`employer`), so new accounts must be promoted by an existing admin:

```bash
# as an admin
curl -X PATCH https://api.nxthike.com/api/auth/users/<id>/role \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" -d '{"role":"admin"}'
```

**2. Workspace mode** (`WorkspaceStore`, on-device, no server equivalent):
`AGENCY` → Client / Requisition, rates visible. `IN_HOUSE` → Department /
Opening, rates hidden. Switchable any time under More → Settings.

The spec's Sourcer / Recruiter / Team lead / Admin matrix exists as the
**Roles & permissions** screen, which is explicitly a local model — the screen
says so, because the server only knows `admin` vs the rest.

### Seeded accounts

| Email | Password | Role | TalentDialer |
|-------|----------|------|--------------|
| `admin@nxthike.com` | *(from `ADMIN_PASSWORD` in `BE/.env`)* | `admin` | Full access |
| `employer@nxthike.com` | `password123` | `employer` | Access-pending screen |
| `student@nxthike.com` | `password123` | `student` | Access-pending screen |

Admin credentials come from `BE/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`); the two
demo accounts are hardcoded in `BE/app/seed.py`. **Change all three before any
real deployment** — they are committed defaults.

## Permissions

All four are optional and pre-explained before any OS dialog fires; each has a
stated fallback shown on the degraded-mode screen, which reads live grant state.

| Permission | Used for | Without it |
|------------|----------|------------|
| `CALL_PHONE` | one-tap dial | falls back to `ACTION_DIAL` |
| `READ_PHONE_STATE` | duration signal | handoff timing is used instead |
| `POST_NOTIFICATIONS` | post-call nudge | sheet opens on next resume |
| `READ_CONTACTS` | import a candidate | numbers typed manually |

`READ_CALL_LOG` is deliberately never declared.
