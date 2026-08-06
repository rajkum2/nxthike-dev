-- TalentDialer recruiting workspace
--
-- Additive only. Every statement is idempotent, and none of them drop, rename
-- or retype anything that already exists.
--
-- The API applies the same changes automatically at startup
-- (`BE/app/migrations.py` plus `Base.metadata.create_all`); this file exists so
-- the schema is reviewable and reproducible outside the app.
--
-- Note on naming: this Supabase project is shared with another application that
-- already owns `audit_events`, `close_tasks`, `comments`, `recons`,
-- `recon_signoffs`, `variances` and `worklist_items`. Every table below is
-- therefore prefixed `workspace_` so the two can never collide.

-- ===========================================================================
-- 1. Additive columns on existing tables
-- ===========================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS persona          VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status           VARCHAR DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS title            VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS org              VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone            VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_at       TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at   TIMESTAMP;

-- hiring_roles doubles as the requisition table.
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS client_id   VARCHAR;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS department  VARCHAR;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS priority    VARCHAR DEFAULT 'P2';
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS openings    INTEGER DEFAULT 1;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS filled      INTEGER DEFAULT 0;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS sla_due     TIMESTAMP;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS comp_min    DOUBLE PRECISION;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS comp_max    DOUBLE PRECISION;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS bill_rate   VARCHAR;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS pay_rate    VARCHAR;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS owner_id    VARCHAR;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS location    VARCHAR;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS skills      JSONB;
ALTER TABLE hiring_roles ADD COLUMN IF NOT EXISTS status      VARCHAR DEFAULT 'open';

-- companies doubles as the client account table.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS health      VARCHAR DEFAULT 'good';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS margin_pct  DOUBLE PRECISION;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS terms       TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_id    VARCHAR;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_client   BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contacts    JSONB;

-- Recruiting facts the web design needs as real fields rather than free text.
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS owner_id         VARCHAR;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source           VARCHAR;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_ctc      DOUBLE PRECISION;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_ctc     DOUBLE PRECISION;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS notice_days      INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS buyout           BOOLEAN DEFAULT FALSE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS consent_at       TIMESTAMP;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS consent_channel  VARCHAR;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS dnc              BOOLEAN DEFAULT FALSE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS requisition_id   VARCHAR;

CREATE INDEX IF NOT EXISTS idx_candidates_owner   ON candidates (owner_id);
CREATE INDEX IF NOT EXISTS idx_candidates_dnc     ON candidates (dnc);
CREATE INDEX IF NOT EXISTS idx_candidates_req     ON candidates (requisition_id);
CREATE INDEX IF NOT EXISTS idx_users_persona      ON users (persona);
CREATE INDEX IF NOT EXISTS idx_hiring_roles_client ON hiring_roles (client_id);

-- ===========================================================================
-- 2. New tables
-- ===========================================================================

CREATE TABLE IF NOT EXISTS workspace_settings (
  id                   VARCHAR PRIMARY KEY,
  org_name             VARCHAR,
  mode                 VARCHAR,
  window_open_hour     INTEGER,
  window_close_hour    INTEGER,
  window_days          JSONB,
  timezone             VARCHAR,
  retention_months     INTEGER,
  notification_toggles JSONB,
  role_matrix          JSONB,
  updated_at           TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_candidate_notes (
  id           VARCHAR PRIMARY KEY,
  candidate_id VARCHAR NOT NULL,
  author_id    VARCHAR,
  author_name  VARCHAR,
  body         TEXT,
  visibility   VARCHAR,          -- shared | private
  created_at   TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_notes_cand ON workspace_candidate_notes (candidate_id);

CREATE TABLE IF NOT EXISTS workspace_submissions (
  id                VARCHAR PRIMARY KEY,
  candidate_id      VARCHAR NOT NULL,
  candidate_name    VARCHAR,
  requisition_id    VARCHAR,
  requisition_name  VARCHAR,
  client_id         VARCHAR,
  client_name       VARCHAR,
  status            VARCHAR,
  submitted_ctc     DOUBLE PRECISION,
  note              TEXT,
  submitted_by      VARCHAR,
  submitted_by_name VARCHAR,
  submitted_at      TIMESTAMP,
  updated_at        TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_subs_client ON workspace_submissions (client_id);
CREATE INDEX IF NOT EXISTS idx_ws_subs_cand   ON workspace_submissions (candidate_id);

CREATE TABLE IF NOT EXISTS workspace_interviews (
  id               VARCHAR PRIMARY KEY,
  candidate_id     VARCHAR NOT NULL,
  candidate_name   VARCHAR,
  requisition_id   VARCHAR,
  requisition_name VARCHAR,
  kind             VARCHAR,
  round_label      VARCHAR,
  scheduled_at     TIMESTAMP,
  duration_minutes INTEGER,
  mode             VARCHAR,
  location         TEXT,
  panel            JSONB,
  status           VARCHAR,
  created_by       VARCHAR,
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_int_cand ON workspace_interviews (candidate_id);
CREATE INDEX IF NOT EXISTS idx_ws_int_when ON workspace_interviews (scheduled_at);

CREATE TABLE IF NOT EXISTS workspace_scorecards (
  id             VARCHAR PRIMARY KEY,
  interview_id   VARCHAR,
  candidate_id   VARCHAR NOT NULL,
  panellist_id   VARCHAR,
  panellist_name VARCHAR,
  scores         JSONB,
  recommendation VARCHAR,
  evidence       TEXT,
  is_draft       BOOLEAN,
  created_at     TIMESTAMP,
  updated_at     TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_score_cand ON workspace_scorecards (candidate_id);

CREATE TABLE IF NOT EXISTS workspace_offers (
  id               VARCHAR PRIMARY KEY,
  reference        VARCHAR,
  candidate_id     VARCHAR NOT NULL,
  candidate_name   VARCHAR,
  requisition_id   VARCHAR,
  requisition_name VARCHAR,
  client_id        VARCHAR,
  client_name      VARCHAR,
  status           VARCHAR,
  ctc_total        DOUBLE PRECISION,
  breakup          JSONB,
  band_note        VARCHAR,
  joining_date     TIMESTAMP,
  expires_at       TIMESTAMP,
  notice_days      INTEGER,
  buyout_cost      DOUBLE PRECISION,
  letter_body      TEXT,
  letter_sent_at   TIMESTAMP,
  signed_at        TIMESTAMP,
  created_by       VARCHAR,
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_offers_cand   ON workspace_offers (candidate_id);
CREATE INDEX IF NOT EXISTS idx_ws_offers_status ON workspace_offers (status);

CREATE TABLE IF NOT EXISTS workspace_approvals (
  id                VARCHAR PRIMARY KEY,
  kind              VARCHAR,      -- offer | requisition | rate_exception
  ref_id            VARCHAR NOT NULL,
  ref_label         VARCHAR,
  detail            TEXT,
  requested_by      VARCHAR,
  requested_by_name VARCHAR,
  approver_id       VARCHAR,
  approver_name     VARCHAR,
  approver_role     VARCHAR,
  sequence          INTEGER,
  status            VARCHAR,      -- pending | approved | rejected
  comment           TEXT,
  created_at        TIMESTAMP,
  decided_at        TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_apr_ref    ON workspace_approvals (ref_id);
CREATE INDEX IF NOT EXISTS idx_ws_apr_status ON workspace_approvals (status);

CREATE TABLE IF NOT EXISTS workspace_tags (
  id          VARCHAR PRIMARY KEY,
  name        VARCHAR NOT NULL,
  kind        VARCHAR,
  color       VARCHAR,
  description TEXT,
  created_by  VARCHAR,
  created_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_saved_searches (
  id         VARCHAR PRIMARY KEY,
  name       VARCHAR NOT NULL,
  owner_id   VARCHAR,
  owner_name VARCHAR,
  filters    JSONB,
  shared     BOOLEAN,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_message_templates (
  id         VARCHAR PRIMARY KEY,
  name       VARCHAR NOT NULL,
  channel    VARCHAR,
  stage      VARCHAR,
  subject    VARCHAR,
  body       TEXT,
  is_active  BOOLEAN,
  created_by VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_tasks (
  id             VARCHAR PRIMARY KEY,
  title          TEXT NOT NULL,
  detail         TEXT,
  due_at         TIMESTAMP,
  assignee_id    VARCHAR,
  assignee_name  VARCHAR,
  link_kind      VARCHAR,
  link_id        VARCHAR,
  link_label     VARCHAR,
  done           BOOLEAN,
  done_at        TIMESTAMP,
  snoozed_until  TIMESTAMP,
  created_by     VARCHAR,
  created_at     TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_assignee ON workspace_tasks (assignee_id);

CREATE TABLE IF NOT EXISTS workspace_notifications (
  id         VARCHAR PRIMARY KEY,
  user_id    VARCHAR,
  kind       VARCHAR,
  title      VARCHAR NOT NULL,
  detail     TEXT,
  ref_kind   VARCHAR,
  ref_id     VARCHAR,
  read_at    TIMESTAMP,
  created_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_notif_user ON workspace_notifications (user_id);

-- Deliberately NOT `audit_events` — that name is taken by another application
-- in this project, with an incompatible schema.
CREATE TABLE IF NOT EXISTS workspace_audit_events (
  id           VARCHAR PRIMARY KEY,
  actor_id     VARCHAR,
  actor_name   VARCHAR,
  actor_email  VARCHAR,
  action       VARCHAR NOT NULL,
  object_kind  VARCHAR,
  object_id    VARCHAR,
  object_label VARCHAR,
  meta         JSONB,
  created_at   TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ws_audit_when ON workspace_audit_events (created_at);

CREATE TABLE IF NOT EXISTS workspace_erasure_requests (
  id             VARCHAR PRIMARY KEY,
  candidate_id   VARCHAR NOT NULL,
  candidate_name VARCHAR,
  reason         TEXT,
  status         VARCHAR,
  raised_by      VARCHAR,
  raised_by_name VARCHAR,
  created_at     TIMESTAMP,
  resolved_at    TIMESTAMP,
  resolved_by    VARCHAR
);
