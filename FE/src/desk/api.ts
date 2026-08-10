/**
 * Typed client for the recruiting workspace.
 *
 * Talks to `/api/workspace/*` for everything new, and reuses the existing
 * `/api/hiring/*` and `/api/calls/*` routes unchanged for candidates and calls.
 */

import { apiFetch } from '../services/apiClient';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  // Reuse the hardened client (timeout, 401 logout, credentials omit)
  return apiFetch<T>(path, init);
}

const qs = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

/* ------------------------------------------------------------------ *
 *  Types                                                             *
 * ------------------------------------------------------------------ */

export interface Caps {
  db: 'all' | 'yes' | 'assigned' | 'limitedPII' | 'ownReqs' | 'ownInterviews' | 'none';
  create: boolean;
  dial: boolean;
  log: boolean;
  reqs: 'all' | 'own' | 'view' | 'none';
  rates: boolean;
  stage: boolean;
  score: boolean | 'ifPanel';
  approve: boolean | 'config';
  eeo: boolean | 'gated';
  analytics: 'all' | 'team' | 'own' | 'none';
  admin: boolean | 'partial';
  erasure: boolean;
}

export interface PersonaDef {
  id: string;
  name: string;
  short: string;
  mode: 'AGENCY' | 'IN_HOUSE';
  landing: string;
  home: string;
  caps: Caps;
}

export interface CallingWindow {
  openHour: number;
  closeHour: number;
  days: number[];
  timezone: string;
  isOpen: boolean;
  label: string;
}

export interface WorkspaceSettings {
  orgName: string;
  mode: 'AGENCY' | 'IN_HOUSE';
  callingWindow: CallingWindow;
  retentionMonths: number;
  notificationToggles: Record<string, boolean>;
  roleMatrix: Record<string, Record<string, string>>;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: string;
  personaId: string;
  personaName: string;
  mode: 'AGENCY' | 'IN_HOUSE';
  landing: string;
  home: string;
  caps: Caps;
  nav: string[];
  settings: WorkspaceSettings;
  personas: PersonaDef[];
}

export interface Requisition {
  id: string;
  title: string;
  description?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  department?: string | null;
  priority: string;
  openings: number;
  filled: number;
  slaDue?: string | null;
  slaLabel?: string | null;
  slaBreached: boolean;
  compMin?: number | null;
  compMax?: number | null;
  compLabel?: string | null;
  billRate?: string | null;
  payRate?: string | null;
  ownerId?: string | null;
  location?: string | null;
  skills: string[];
  status: string;
  isActive: boolean;
  pipelineTotal: number;
  byStage: Record<string, number>;
}

export interface Client {
  id: string;
  name: string;
  industry?: string | null;
  location?: string | null;
  health: string;
  marginPct?: number | null;
  terms?: string | null;
  contacts: { name?: string; role?: string; phone?: string; email?: string }[];
  openRequisitions: number;
  submissions: number;
  placements: number;
  website?: string | null;
  logo?: string | null;
}

export interface Submission {
  id: string;
  candidateId: string;
  candidateName?: string | null;
  requisitionId?: string | null;
  requisitionName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  status: string;
  submittedCtc?: number | null;
  note: string;
  submittedByName?: string | null;
  submittedAt?: string | null;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName?: string | null;
  requisitionId?: string | null;
  requisitionName?: string | null;
  kind: string;
  roundLabel?: string | null;
  scheduledAt?: string | null;
  durationMinutes: number;
  mode?: string | null;
  location?: string | null;
  panel: { id?: string; name?: string; email?: string }[];
  status: string;
  hasScorecard: boolean;
}

export interface Scorecard {
  id: string;
  interviewId?: string | null;
  candidateId: string;
  panellistName?: string | null;
  scores: Record<string, number>;
  recommendation?: string | null;
  evidence: string;
  isDraft: boolean;
  createdAt?: string | null;
}

export interface ApprovalRow {
  id: string;
  kind: string;
  refId: string;
  refLabel?: string | null;
  detail?: string | null;
  requestedByName?: string | null;
  approverName?: string | null;
  approverRole?: string | null;
  status: string;
  comment: string;
  createdAt?: string | null;
  decidedAt?: string | null;
}

export interface Offer {
  id: string;
  reference?: string | null;
  candidateId: string;
  candidateName?: string | null;
  requisitionId?: string | null;
  requisitionName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  status: string;
  ctcTotal?: number | null;
  breakup: { label: string; amount: number }[];
  bandNote?: string | null;
  joiningDate?: string | null;
  expiresAt?: string | null;
  noticeDays?: number | null;
  buyoutCost?: number | null;
  letterBody?: string | null;
  letterSentAt?: string | null;
  signedAt?: string | null;
  createdAt?: string | null;
  approvals: {
    id: string; approverName?: string | null; approverRole?: string | null;
    status: string; comment: string; sequence: number; decidedAt?: string | null;
  }[];
}

export interface Task {
  id: string;
  title: string;
  detail: string;
  dueAt?: string | null;
  assigneeName?: string | null;
  linkKind?: string | null;
  linkId?: string | null;
  linkLabel?: string | null;
  done: boolean;
  overdue: boolean;
  createdAt?: string | null;
}

export interface Notification {
  id: string;
  kind: string;
  title: string;
  detail: string;
  refKind?: string | null;
  refId?: string | null;
  read: boolean;
  createdAt?: string | null;
}

export interface WorkspaceUser {
  id: string;
  email: string;
  name: string;
  role: string;
  persona?: string | null;
  personaName?: string | null;
  status: string;
  title?: string | null;
  org?: string | null;
  createdAt?: string | null;
  lastActiveAt?: string | null;
  invitedAt?: string | null;
}

export interface Note {
  id: string;
  candidateId: string;
  authorName?: string | null;
  body: string;
  visibility: string;
  createdAt?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  kind: string;
  color?: string | null;
  description?: string | null;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  shared: boolean;
  ownerName?: string | null;
}

export interface Template {
  id: string;
  name: string;
  channel: string;
  stage?: string | null;
  subject?: string | null;
  body: string;
  isActive: boolean;
}

export interface AuditRow {
  id: string;
  actorName?: string | null;
  actorEmail?: string | null;
  action: string;
  objectKind?: string | null;
  objectId?: string | null;
  objectLabel?: string | null;
  createdAt?: string | null;
}

export interface Compliance {
  totalCandidates: number;
  withConsent: number;
  missingConsent: number;
  dncCount: number;
  retentionMonths: number;
  openErasures: number;
}

export interface Erasure {
  id: string;
  candidateId: string;
  candidateName?: string | null;
  reason: string;
  status: string;
  raisedByName?: string | null;
  createdAt?: string | null;
}

/** Candidate as the existing hiring API returns it, plus the new columns. */
export interface DeskCandidate {
  id: string;
  roleId: string;
  roleName: string;
  status: string;
  tags: string[];
  notes: string;
  starred: boolean;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  source?: string | null;
  currentCtc?: number | null;
  expectedCtc?: number | null;
  noticeDays?: number | null;
  buyout?: boolean | null;
  consentAt?: string | null;
  consentChannel?: string | null;
  dnc?: boolean | null;
  ownerId?: string | null;
  requisitionId?: string | null;
  /**
   * Set by the API when it masked `phone` and `email` for this caller's role.
   * The masked value is what arrived over the wire — do not mask it again, and
   * do not assume the real one is available anywhere in the browser.
   */
  piiMasked?: boolean;
  latestRole?: string | null;
  latestCompany?: string | null;
  institute?: string | null;
  degree?: string | null;
  stream?: string | null;
  graduationYear?: string | null;
  gender?: string | null;
  relevantSkills?: string | null;
  otherSkills?: string | null;
  experienceDuration?: string | null;
  hasWorkExperience?: string | null;
  availability?: string | null;
  resumeLink?: string | null;
  downloadLink?: string | null;
  notes?: string;
  applicationLink?: string | null;
  companies?: string | null;
  jobTitles?: string | null;
  careerObjective?: string | null;
  languages?: string | null;
  certifications?: string | null;
  projects?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CallLog {
  id: string;
  candidateId: string;
  candidateName?: string | null;
  candidatePhone?: string | null;
  roleName?: string | null;
  userEmail?: string | null;
  disposition: string;
  note: string;
  durationSeconds?: number | null;
  callbackAt?: string | null;
  calledAt?: string | null;
}

export interface QueueItem {
  candidateId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  roleId: string;
  roleName: string;
  status: string;
  notes: string;
  lastDisposition?: string | null;
  lastCalledAt?: string | null;
  starred: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ *
 *  Endpoints                                                         *
 * ------------------------------------------------------------------ */

const W = '/api/workspace';

export const deskApi = {
  // Session & settings
  session: () => req<Session>(`${W}/session`),
  /**
   * Try on another persona. Separate from `updateUser` because that route is
   * gated on the *current* persona's admin capability — switching away from
   * Admin would otherwise be a one-way door.
   */
  switchPersona: (persona: string) =>
    req<Session>(`${W}/session/persona`, { method: 'PATCH', body: JSON.stringify({ persona }) }),
  personas: () => req<PersonaDef[]>(`${W}/personas`),
  settings: () => req<WorkspaceSettings>(`${W}/settings`),
  updateSettings: (body: Record<string, unknown>) =>
    req<WorkspaceSettings>(`${W}/settings`, { method: 'PATCH', body: JSON.stringify(body) }),
  taxonomy: () => req<{ dispositions: { id: string; label: string; category: string }[] }>(`${W}/taxonomy`),

  // Requisitions & clients
  requisitions: () => req<Requisition[]>(`${W}/requisitions`),
  requisition: (id: string) => req<Requisition>(`${W}/requisitions/${encodeURIComponent(id)}`),
  createRequisition: (body: Record<string, unknown>) =>
    req<Requisition>(`${W}/requisitions`, { method: 'POST', body: JSON.stringify(body) }),
  updateRequisition: (id: string, body: Record<string, unknown>) =>
    req<Requisition>(`${W}/requisitions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),

  clients: () => req<Client[]>(`${W}/clients`),
  client: (id: string) => req<Client>(`${W}/clients/${encodeURIComponent(id)}`),
  updateClient: (id: string, body: Record<string, unknown>) =>
    req<Client>(`${W}/clients/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Pipeline artefacts
  submissions: (p: { clientId?: string; requisitionId?: string; candidateId?: string } = {}) =>
    req<Submission[]>(`${W}/submissions${qs(p)}`),
  createSubmission: (body: Record<string, unknown>) =>
    req<Submission>(`${W}/submissions`, { method: 'POST', body: JSON.stringify(body) }),
  updateSubmission: (id: string, body: Record<string, unknown>) =>
    req<Submission>(`${W}/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  interviews: (p: { candidateId?: string; mine?: boolean } = {}) =>
    req<Interview[]>(`${W}/interviews${qs(p)}`),
  createInterview: (body: Record<string, unknown>) =>
    req<Interview>(`${W}/interviews`, { method: 'POST', body: JSON.stringify(body) }),
  updateInterview: (id: string, body: Record<string, unknown>) =>
    req<Interview>(`${W}/interviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  scorecards: (p: { candidateId?: string; interviewId?: string } = {}) =>
    req<Scorecard[]>(`${W}/scorecards${qs(p)}`),
  submitScorecard: (body: Record<string, unknown>) =>
    req<Scorecard>(`${W}/scorecards`, { method: 'POST', body: JSON.stringify(body) }),

  offers: (status?: string) => req<Offer[]>(`${W}/offers${qs({ status })}`),
  offer: (id: string) => req<Offer>(`${W}/offers/${id}`),
  createOffer: (body: Record<string, unknown>) =>
    req<Offer>(`${W}/offers`, { method: 'POST', body: JSON.stringify(body) }),
  updateOffer: (id: string, body: Record<string, unknown>) =>
    req<Offer>(`${W}/offers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  approvals: (p: { mine?: boolean; status?: string } = {}) =>
    req<ApprovalRow[]>(`${W}/approvals${qs(p)}`),
  decideApproval: (id: string, approve: boolean, comment = '') =>
    req<ApprovalRow>(`${W}/approvals/${id}/decide`, {
      method: 'POST', body: JSON.stringify({ approve, comment }),
    }),

  // Notes, tags, templates
  notes: (candidateId: string) => req<Note[]>(`${W}/notes${qs({ candidateId })}`),
  addNote: (candidateId: string, body: string, visibility: 'shared' | 'private') =>
    req<Note>(`${W}/notes`, { method: 'POST', body: JSON.stringify({ candidateId, body, visibility }) }),

  tags: () => req<Tag[]>(`${W}/tags`),
  createTag: (body: Record<string, unknown>) =>
    req<Tag>(`${W}/tags`, { method: 'POST', body: JSON.stringify(body) }),
  applyTags: (body: { candidateIds: string[]; add?: string[]; remove?: string[]; ownerId?: string }) =>
    req<{ updated: number }>(`${W}/tags/apply`, { method: 'POST', body: JSON.stringify(body) }),

  savedSearches: () => req<SavedSearch[]>(`${W}/saved-searches`),
  saveSearch: (body: Record<string, unknown>) =>
    req<SavedSearch>(`${W}/saved-searches`, { method: 'POST', body: JSON.stringify(body) }),
  deleteSavedSearch: (id: string) =>
    req<void>(`${W}/saved-searches/${id}`, { method: 'DELETE' }),

  templates: () => req<Template[]>(`${W}/templates`),
  createTemplate: (body: Record<string, unknown>) =>
    req<Template>(`${W}/templates`, { method: 'POST', body: JSON.stringify(body) }),
  updateTemplate: (id: string, body: Record<string, unknown>) =>
    req<Template>(`${W}/templates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Work management
  tasks: (p: { mine?: boolean; includeDone?: boolean } = {}) => req<Task[]>(`${W}/tasks${qs(p)}`),
  createTask: (body: Record<string, unknown>) =>
    req<Task>(`${W}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: string, body: Record<string, unknown>) =>
    req<Task>(`${W}/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  notifications: () => req<Notification[]>(`${W}/notifications`),
  markAllRead: () => req<void>(`${W}/notifications/read-all`, { method: 'POST' }),

  // Admin
  users: (search?: string) => req<WorkspaceUser[]>(`${W}/users${qs({ search })}`),
  inviteUser: (body: Record<string, unknown>) =>
    req<WorkspaceUser>(`${W}/users/invite`, { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id: string, body: Record<string, unknown>) =>
    req<WorkspaceUser>(`${W}/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  audit: (limit = 100) => req<AuditRow[]>(`${W}/audit${qs({ limit })}`),
  compliance: () => req<Compliance>(`${W}/compliance`),
  erasures: () => req<Erasure[]>(`${W}/erasures`),
  raiseErasure: (candidateId: string, reason: string) =>
    req<Erasure>(`${W}/erasures`, { method: 'POST', body: JSON.stringify({ candidateId, reason }) }),
  decideErasure: (id: string, status: string) =>
    req<Erasure>(`${W}/erasures/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Existing routes, reused unchanged
  candidates: (p: Record<string, unknown> = {}) =>
    req<Paginated<DeskCandidate>>(`/api/hiring/candidates${qs(p)}`),
  candidate: (id: string) => req<DeskCandidate>(`/api/hiring/candidates/${id}`),
  patchCandidate: (id: string, body: Record<string, unknown>) =>
    req<DeskCandidate>(`/api/hiring/candidates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createCandidate: (body: Record<string, unknown>) =>
    req<DeskCandidate>('/api/hiring/candidates', { method: 'POST', body: JSON.stringify(body) }),
  deleteCandidate: (id: string) =>
    req<void>(`/api/hiring/candidates/${id}`, { method: 'DELETE' }),
  bulkStatus: (ids: string[], status: string) =>
    req<{ updated: number }>('/api/hiring/candidates/bulk-status', {
      method: 'POST', body: JSON.stringify({ ids, status }),
    }),
  bulkRole: (ids: string[], roleId: string, roleName?: string) =>
    req<{ updated: number }>('/api/hiring/candidates/bulk-role', {
      method: 'POST', body: JSON.stringify({ ids, roleId, roleName }),
    }),
  bulkUpdate: (body: Record<string, unknown>) =>
    req<{ updated: number }>('/api/hiring/candidates/bulk-update', {
      method: 'POST', body: JSON.stringify(body),
    }),
  bulkDelete: (ids: string[]) =>
    req<{ deleted: number }>('/api/hiring/candidates/bulk-delete', {
      method: 'POST', body: JSON.stringify({ ids }),
    }),

  callQueue: (p: Record<string, unknown> = {}) =>
    req<Paginated<QueueItem>>(`/api/calls/queue${qs({ pageSize: 100, ...p })}`),
  callLogs: (p: Record<string, unknown> = {}) =>
    req<Paginated<CallLog>>(`/api/calls${qs({ pageSize: 100, ...p })}`),
  logCall: (body: Record<string, unknown>) =>
    req<CallLog>('/api/calls', { method: 'POST', body: JSON.stringify(body) }),
  callStats: () => req<{ todayCount: number; totalCount: number; byDisposition: Record<string, number>; callbacksDue: number }>('/api/calls/stats'),
  hiringDashboard: (roleId?: string) =>
    req<{ total: number; byStatus: Record<string, number>; byRole: Record<string, number>; roles: { id: string; name: string; count: number }[] }>(
      `/api/hiring/dashboard${qs({ roleId })}`,
    ),
};

export type DeskApi = typeof deskApi;
