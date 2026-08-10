/**
 * Workspace session and navigation state.
 *
 * Capabilities come from the server (`/api/workspace/session`) rather than
 * being decided here — the browser shapes navigation with them, but the API
 * re-checks every one before returning data.
 */

import { create } from 'zustand';
import { deskApi, type Caps, type Session } from './api';

export type ScreenKey =
  | 'home' | 'notifs' | 'tasks'
  | 'queue' | 'callbacks' | 'history' | 'summary'
  | 'cands' | 'addcand' | 'merge' | 'resume' | 'tags'
  | 'jobs' | 'job' | 'newjob' | 'kanban' | 'clients' | 'client' | 'subs'
  | 'composer' | 'templates'
  | 'intcal' | 'intsched' | 'intkit' | 'scorecard'
  | 'offers' | 'offer' | 'offerletter' | 'approvals'
  | 'feed' | 'perf' | 'team'
  | 'settings' | 'users' | 'callwindow' | 'roles' | 'compliance' | 'audit' | 'taxonomy'
  | 'sync' | 'states'
  | 'portalOverview' | 'portalJobs' | 'portalEvents' | 'portalCourses' | 'portalCompanies' | 'portalRoles';

export type ModalKey =
  | 'disposition' | 'callback' | 'dnc' | 'consent' | 'erasure'
  | 'stage' | 'dropreason' | 'filters' | 'personas' | 'invite' | 'newtask'
  | 'addcand' | 'composer' | null;

export interface ScreenMeta { id: string; name: string; purpose: string }

/** Screen ids mirror the spec's SCR-W-* codes so a route traces back to it. */
export const SCREENS: Record<ScreenKey, ScreenMeta> = {
  home: { id: 'SCR-W-HOME-01', name: 'Dashboard', purpose: 'Today at a glance.' },
  notifs: { id: 'SCR-W-HOME-02', name: 'Notifications', purpose: 'Callbacks, mentions, approvals and interviews.' },
  tasks: { id: 'SCR-W-HOME-03', name: 'Tasks', purpose: 'Assigned work with due dates.' },
  queue: { id: 'SCR-W-CALL-01', name: 'Call console', purpose: 'Queue, live call card and disposition in one view.' },
  callbacks: { id: 'SCR-W-CALL-02', name: 'Callbacks', purpose: 'Upcoming and overdue callbacks.' },
  history: { id: 'SCR-W-CALL-03', name: 'Call history', purpose: 'Every logged call, filterable by outcome.' },
  summary: { id: 'SCR-W-CALL-04', name: 'Queue summary', purpose: 'End-of-queue recap.' },
  cands: { id: 'SCR-W-CAND-01', name: 'Candidates', purpose: 'List and profile side by side.' },
  addcand: { id: 'SCR-W-CAND-02', name: 'Add candidate', purpose: 'Dedupe runs on phone as you type.' },
  merge: { id: 'SCR-W-CAND-03', name: 'Compare & merge', purpose: 'Field-by-field survivor selection.' },
  resume: { id: 'SCR-W-CAND-04', name: 'Resume', purpose: 'Inline document view.' },
  tags: { id: 'SCR-W-CAND-05', name: 'Tags & long-lists', purpose: 'Tag taxonomy, saved searches and hand-off.' },
  jobs: { id: 'SCR-W-JOB-01', name: 'Requisitions', purpose: 'Sortable table with SLA and pipeline health.' },
  job: { id: 'SCR-W-JOB-02', name: 'Requisition', purpose: 'Pipeline, candidates and gated commercials.' },
  newjob: { id: 'SCR-W-JOB-03', name: 'New requisition', purpose: 'Intake form with approvers.' },
  kanban: { id: 'SCR-W-PIPE-01', name: 'Pipeline', purpose: 'Move cards between stage columns.' },
  clients: { id: 'SCR-W-CLIENT-01', name: 'Clients', purpose: 'Accounts with health and margin.' },
  client: { id: 'SCR-W-CLIENT-02', name: 'Client 360', purpose: 'Contacts, job orders and submissions.' },
  subs: { id: 'SCR-W-CLIENT-03', name: 'Submissions', purpose: 'Every candidate submitted per account.' },
  composer: { id: 'SCR-W-COMM-01', name: 'Composer', purpose: 'WhatsApp, SMS and email with live variables.' },
  templates: { id: 'SCR-W-COMM-02', name: 'Templates', purpose: 'Library by channel and stage.' },
  intcal: { id: 'SCR-W-INT-01', name: 'Interviews', purpose: 'Schedule with panel and mode.' },
  intsched: { id: 'SCR-W-INT-02', name: 'Schedule interview', purpose: 'Panel, type and proposed slots.' },
  intkit: { id: 'SCR-W-INT-03', name: 'Interview kit', purpose: 'Agenda, competencies and prompts.' },
  scorecard: { id: 'SCR-W-INT-04', name: 'Scorecard', purpose: 'Competency ratings and recommendation.' },
  offers: { id: 'SCR-W-OFFER-01', name: 'Offers', purpose: 'Grouped by status.' },
  offer: { id: 'SCR-W-OFFER-02', name: 'Offer', purpose: 'CTC breakup, dates and approval chain.' },
  offerletter: { id: 'SCR-W-OFFER-04', name: 'Offer letter', purpose: 'Merge the approved offer into a letter.' },
  approvals: { id: 'SCR-W-OFFER-03', name: 'Approvals', purpose: 'Approve or reject with a comment.' },
  feed: { id: 'SCR-W-COLLAB-01', name: 'Activity', purpose: 'Team stream.' },
  perf: { id: 'SCR-W-RPT-01', name: 'My performance', purpose: 'Calls, connect rate and submissions.' },
  team: { id: 'SCR-W-RPT-02', name: 'Team dashboard', purpose: 'Per-recruiter activity and funnel.' },
  settings: { id: 'SCR-W-SET-01', name: 'Settings', purpose: 'Profile, notifications and appearance.' },
  users: { id: 'SCR-W-SET-05', name: 'Users', purpose: 'Invite, suspend and assign roles.' },
  callwindow: { id: 'SCR-W-SET-02', name: 'Calling window', purpose: 'Allowed hours and days.' },
  roles: { id: 'SCR-W-SET-03', name: 'Roles & permissions', purpose: 'Matrix editor.' },
  compliance: { id: 'SCR-W-SET-04', name: 'Compliance', purpose: 'Consent, retention and erasure queue.' },
  audit: { id: 'SCR-W-SET-06', name: 'Audit log', purpose: 'Immutable activity record.' },
  taxonomy: { id: 'SCR-W-SET-07', name: 'Disposition taxonomy', purpose: 'Outcome codes and next-action rules.' },
  sync: { id: 'SCR-W-GLOBAL-01', name: 'Offline & sync', purpose: 'Outbox with retry.' },
  states: { id: 'SCR-W-GLOBAL-02', name: 'State gallery', purpose: 'Loading, empty, error and denied states.' },
  portalOverview: { id: 'SCR-W-CAT-00', name: 'Portal overview', purpose: 'Public site catalog stats.' },
  portalJobs: { id: 'SCR-W-CAT-01', name: 'Portal jobs', purpose: 'Jobs and internships on the public site.' },
  portalEvents: { id: 'SCR-W-CAT-02', name: 'Portal events', purpose: 'Events on the public site.' },
  portalCourses: { id: 'SCR-W-CAT-03', name: 'Portal courses', purpose: 'Courses on the public site.' },
  portalCompanies: { id: 'SCR-W-CAT-04', name: 'Portal companies', purpose: 'Company directory on the public site.' },
  portalRoles: { id: 'SCR-W-CAT-05', name: 'Hiring roles', purpose: 'Candidate role buckets for the CRM.' },
};

export interface NavItem { key: ScreenKey; label: string; icon: string }
export interface NavGroup { name: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  { name: 'TODAY', items: [
    { key: 'home', label: 'Dashboard', icon: 'space_dashboard' },
    { key: 'queue', label: 'Call console', icon: 'call' },
    { key: 'callbacks', label: 'Callbacks', icon: 'history' },
    { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
    { key: 'notifs', label: 'Notifications', icon: 'notifications' },
  ] },
  { name: 'PEOPLE', items: [
    { key: 'cands', label: 'Candidates', icon: 'groups' },
    // "Add candidate" lives on the Candidates screen (not a top-level nav item).
    { key: 'tags', label: 'Tags & long-lists', icon: 'label' },
    { key: 'history', label: 'Call history', icon: 'phone_in_talk' },
  ] },
  { name: 'DEMAND', items: [
    { key: 'jobs', label: 'Requisitions', icon: 'work' },
    { key: 'kanban', label: 'Pipeline', icon: 'view_kanban' },
    { key: 'clients', label: 'Clients', icon: 'apartment' },
    { key: 'subs', label: 'Submissions', icon: 'send' },
  ] },
  { name: 'PROCESS', items: [
    { key: 'composer', label: 'Composer', icon: 'chat' },
    { key: 'templates', label: 'Templates', icon: 'description' },
    { key: 'intcal', label: 'Interviews', icon: 'event' },
    { key: 'scorecard', label: 'Scorecards', icon: 'rate_review' },
    { key: 'offers', label: 'Offers', icon: 'contract' },
    { key: 'approvals', label: 'Approvals', icon: 'gavel' },
  ] },
  { name: 'INSIGHT', items: [
    { key: 'perf', label: 'My performance', icon: 'bar_chart' },
    { key: 'team', label: 'Team dashboard', icon: 'leaderboard' },
    { key: 'feed', label: 'Activity', icon: 'forum' },
  ] },
  { name: 'PORTAL', items: [
    { key: 'portalOverview', label: 'Portal overview', icon: 'dashboard' },
    { key: 'portalJobs', label: 'Portal jobs', icon: 'work_history' },
    { key: 'portalEvents', label: 'Events', icon: 'event_note' },
    { key: 'portalCourses', label: 'Courses', icon: 'school' },
    { key: 'portalCompanies', label: 'Companies', icon: 'storefront' },
    { key: 'portalRoles', label: 'Hiring roles', icon: 'sell' },
  ] },
  { name: 'ADMIN', items: [
    { key: 'settings', label: 'My profile & settings', icon: 'settings' },
    { key: 'users', label: 'Users', icon: 'manage_accounts' },
    { key: 'callwindow', label: 'Calling window', icon: 'schedule' },
    { key: 'roles', label: 'Personas & permissions', icon: 'admin_panel_settings' },
    { key: 'compliance', label: 'Compliance', icon: 'verified_user' },
    { key: 'audit', label: 'Audit log', icon: 'receipt_long' },
    { key: 'taxonomy', label: 'Taxonomy', icon: 'category' },
    { key: 'sync', label: 'Offline & sync', icon: 'sync' },
    { key: 'states', label: 'State gallery', icon: 'widgets' },
  ] },
];

interface DeskState {
  loading: boolean;
  error: string | null;
  session: Session | null;

  screen: ScreenKey;
  modal: ModalKey;
  palette: boolean;
  drawer: boolean;
  railOpen: boolean;

  /** Currently focused records, so screens can deep-link into one another. */
  candidateId: string | null;
  /** Hiring-role filter from the Candidates rail submenu (`null` = all roles). */
  candidateRoleId: string | null;
  requisitionId: string | null;
  clientId: string | null;
  offerId: string | null;
  interviewId: string | null;
  selection: Record<string, true>;
  /**
   * Bumped whenever a candidate is written from outside the Candidates screen
   * (the add-candidate modal opens over Today as well), so the list refetches
   * instead of showing a stale page behind the modal that just closed.
   */
  candidatesRev: number;

  boot: () => Promise<void>;
  go: (screen: ScreenKey, ctx?: Partial<Pick<DeskState,
    'candidateId' | 'candidateRoleId' | 'requisitionId' | 'clientId' | 'offerId' | 'interviewId'>>) => void;
  setCandidateRoleId: (roleId: string | null) => void;
  openModal: (m: ModalKey) => void;
  /** Open message composer over the current screen for a candidate. */
  openComposer: (candidateId: string) => void;
  closeModal: () => void;
  setPalette: (v: boolean) => void;
  setDrawer: (v: boolean) => void;
  toggleRail: () => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  bumpCandidates: () => void;

  caps: () => Caps;
  allowed: (key: ScreenKey) => boolean;
  /** Vocabulary swap — Client/Requisition in agency mode, Department/Opening in-house. */
  words: () => { client: string; clientPlural: string; req: string; reqPlural: string };
}

export const useDesk = create<DeskState>((set, get) => ({
  loading: true,
  error: null,
  session: null,

  screen: 'home',
  modal: null,
  palette: false,
  drawer: false,
  railOpen: true,

  candidateId: null,
  candidateRoleId: null,
  requisitionId: null,
  clientId: null,
  offerId: null,
  interviewId: null,
  selection: {},
  candidatesRev: 0,

  boot: async () => {
    set({ loading: true, error: null });
    try {
      const session = await deskApi.session();
      // Optional deep-link from /admin redirects (portal catalog screens).
      let preferred: ScreenKey | null = null;
      try {
        const raw = sessionStorage.getItem('nxthike_workspace_screen');
        if (raw && raw in SCREENS) preferred = raw as ScreenKey;
        sessionStorage.removeItem('nxthike_workspace_screen');
      } catch {
        /* ignore */
      }
      const landing = (session.landing as ScreenKey) in SCREENS ? (session.landing as ScreenKey) : 'home';
      const nav = session.nav || [];
      const screen =
        preferred && nav.includes(preferred) ? preferred : landing;
      set({
        session,
        loading: false,
        screen,
      });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  go: (screen, ctx) => set((s) => ({
    screen,
    modal: null,
    palette: false,
    drawer: false,
    // Use `in` so callers can clear a context key by passing null.
    candidateId: ctx && 'candidateId' in ctx ? (ctx.candidateId ?? null) : s.candidateId,
    candidateRoleId: ctx && 'candidateRoleId' in ctx ? (ctx.candidateRoleId ?? null) : s.candidateRoleId,
    requisitionId: ctx && 'requisitionId' in ctx ? (ctx.requisitionId ?? null) : s.requisitionId,
    clientId: ctx && 'clientId' in ctx ? (ctx.clientId ?? null) : s.clientId,
    offerId: ctx && 'offerId' in ctx ? (ctx.offerId ?? null) : s.offerId,
    interviewId: ctx && 'interviewId' in ctx ? (ctx.interviewId ?? null) : s.interviewId,
  })),

  setCandidateRoleId: (roleId) => set({ candidateRoleId: roleId }),

  openModal: (modal) => set({ modal }),
  openComposer: (candidateId) => set({ candidateId, modal: 'composer' }),
  closeModal: () => set({ modal: null }),
  bumpCandidates: () => set((s) => ({ candidatesRev: s.candidatesRev + 1 })),
  setPalette: (palette) => set({ palette }),
  setDrawer: (drawer) => set({ drawer }),
  toggleRail: () => set((s) => ({ railOpen: !s.railOpen })),

  toggleSelect: (id) => set((s) => {
    const next = { ...s.selection };
    if (next[id]) delete next[id]; else next[id] = true;
    return { selection: next };
  }),
  clearSelection: () => set({ selection: {} }),

  caps: () => get().session?.caps || ({} as Caps),

  allowed: (key) => {
    const nav = get().session?.nav;
    if (!nav) return false;
    // Screens without their own nav entry inherit their parent's visibility.
    const inherit: Partial<Record<ScreenKey, ScreenKey>> = {
      job: 'jobs', newjob: 'jobs', merge: 'cands', resume: 'cands', addcand: 'cands',
      offer: 'offers', offerletter: 'offers', intsched: 'intcal', intkit: 'intcal',
      summary: 'queue', client: 'clients',
    };
    return nav.includes(inherit[key] || key);
  },

  words: () => {
    const agency = get().session?.mode !== 'IN_HOUSE';
    return agency
      ? { client: 'Client', clientPlural: 'Clients', req: 'Requisition', reqPlural: 'Requisitions' }
      : { client: 'Department', clientPlural: 'Departments', req: 'Opening', reqPlural: 'Openings' };
  },
}));
