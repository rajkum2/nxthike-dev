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

The spec's vocabulary and the API's schema differ in wording only:

| Spec | API | Notes |
|------|-----|-------|
| 11 disposition codes | `CALL_DISPOSITIONS` | Identical sets. `Dispositions` adds label/colour/icon/next-action. |
| Sourced / Screening / Submitted / Interview / Offer / Hired / Dropped | `new` / `reviewing` / `shortlisted` / `interview` / `offer` / `hired` / `rejected` | `Stages` maps them; `on_hold` is handled off-board. |
| Requisition | `GET /api/workspace/requisitions` | Requisition ids are `HiringRole` ids, so a call queue is still built per requisition. |
| Client | `GET /api/workspace/clients` | Account records — health, margin, terms, contacts. Not `/api/companies`. |
| Submission | `GET /api/workspace/submissions` | Real records: who was sent where, when, at what rate. |
| Interview / Scorecard / Offer / Approval | `/api/workspace/{interviews,scorecards,offers,approvals}` | Real tables, each with its own columns. |

Everything under `/api/workspace/…` is served by two FastAPI routers
(`workspace.py`, `recruiting.py`) but is one namespace over the wire, so it is
one Retrofit interface here: `data/remote/api/WorkspaceApi.kt`.

### Compliance fields go to columns, not tags

Consent, DNC and erasure are columns and a table — `Candidate.consent_at`,
`Candidate.consent_channel`, `Candidate.dnc`, and the `ErasureRequest` register.
This app writes all three there, which is what the web desk reads, what the
`dncOnly` / `noConsent` filters query and what `/api/workspace/compliance`
counts.

An earlier build wrote them as candidate *tags*, which no other surface could
see. Reads still fall back to those tags so nothing already captured disappears;
every write goes to the column, so the fallback drains over time.

Two details worth knowing:

- **DNC has two signals.** A `do_not_call` disposition blocks the dialer, but
  only while it remains the *latest* call. `Candidate.dnc` is the durable flag,
  and logging that disposition now sets it.
- **Consent timestamps are UTC instants** (`Instant.now()`), matching the web.
  A zone-less local time would be read back as UTC and shift by the device
  offset.

### What the server owns

- **Capabilities.** `GET /api/workspace/session` returns the persona, its `caps`
  map and a nav allow-list. `core/model/Caps.kt` mirrors `WorkspaceIdentity` in
  `BE/app/services/personas.py` exactly, including that `"none"` is falsy and
  that `admin` must be literally `true` (it can hold `"partial"`).
- **The calling window.** Hours, days and timezone come from
  `settings.callingWindow` and are cached to `WorkspaceStore` so the gate holds
  offline. Days are ISO weekday numbers (1 = Monday). Only an admin can move it;
  for anyone else the local edit is reverted from the server's copy.
- **Pipeline moves on scorecards.** `POST /scorecards` advances a `hire` to
  Offer and a `strong_no` to Dropped, and writes the audit line. The app does
  not also move the stage.
- **The roles matrix** is the live matrix the API enforces, shown read-only —
  most capabilities are enums, so a tap-to-cycle editor would write invalid
  levels. Editing is a web-admin action.

## Architecture

```
core/model/       Dispositions, Stages, CallingWindow, CandidateTags, Caps
core/util/        Fmt (dates, durations, masking, counts)
data/local/       TokenStore, WorkspaceStore (mode, window, toggles), OutboxStore
data/remote/      Retrofit APIs + Moshi DTOs
data/repository/  AppResult-returning repositories
presentation/
  designsystem/   Tokens (T), Type, Theme, Components
  session/        SessionViewModel — session, capabilities, window, outbox
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

Access to the recruiting workspace is a **persona**, not the portal role.

`/api/hiring/…` and `/api/calls/…` sit behind `get_workspace_user`, which admits
any account with a persona assigned (and any admin), then gates individual
actions with `require_cap("dial")`, `("log")`, `("create")`, `("stage")` and so
on. All eight personas can use this app:

| Persona | Short | Mode | Lands on |
|---------|-------|------|----------|
| Senior Recruiter (360) | Recruiter | AGENCY | Call queue |
| Sourcer | Sourcer | AGENCY | Candidates |
| In-house TA Specialist | In-house TA | IN_HOUSE | Pipeline board |
| Recruitment Team Lead | Team Lead | AGENCY | Team |
| Account Manager | Acct Mgr | AGENCY | Clients |
| Hiring Manager | Hiring Mgr | IN_HOUSE | Approvals |
| Interviewer / Panellist | Interviewer | IN_HOUSE | Interview calendar |
| Admin / Ops | Admin | AGENCY | Users |

A portal-only account (student, employer, or anyone with no persona) is refused
with a 403 that explains itself, and the access screen shows that message rather
than guessing. The remedy is a persona, not a promotion to admin:

```bash
# as an admin
curl -X PATCH https://api.nxthike.com/api/workspace/users/<id> \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" -d '{"persona":"p2"}'
```

**Workspace mode** (`AGENCY` → Client / Requisition, rates visible; `IN_HOUSE` →
Department / Opening, rates hidden) comes from the persona and the workspace
settings, and is cached on-device. An admin changing it changes it for everyone.

### Seeded accounts

| Email | Password | Role | TalentDialer |
|-------|----------|------|--------------|
| `admin@nxthike.com` | *(from `ADMIN_PASSWORD` in `BE/.env`)* | `admin` | Full access |
| `employer@nxthike.com` | `password123` | `employer` | No-access screen (no persona) |
| `student@nxthike.com` | `password123` | `student` | No-access screen (no persona) |

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
