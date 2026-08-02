import { create } from 'zustand';
import type { Candidate, PipelineStatus, RoleMeta, ViewMode } from './types';
import { hiringService } from '../services/hiringService';

const THEME_KEY = 'nxthike-hiring-crm-theme';

export type ThemeMode = 'dark' | 'light';

function loadTheme(): ThemeMode {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* ignore */
  }
  return 'dark';
}

export function applyTheme(theme: ThemeMode) {
  document.querySelectorAll('.hiring-tracker').forEach((el) => {
    (el as HTMLElement).dataset.theme = theme;
  });
  localStorage.setItem(THEME_KEY, theme);
}

interface Filters {
  search: string;
  status: PipelineStatus | 'all';
  city: string;
  experience: 'all' | 'yes' | 'no';
  aiMatch: string;
  starredOnly: boolean;
  hasNotes: boolean;
}

interface AppState {
  roles: RoleMeta[];
  candidates: Candidate[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  apiMode: boolean;
  activeRoleId: string | 'all';
  view: ViewMode;
  filters: Filters;
  selectedIds: Set<string>;
  detailId: string | null;
  formOpen: boolean;
  formMode: 'create' | 'edit';
  formCandidate: Candidate | null;
  page: number;
  pageSize: number;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  theme: ThemeMode;
  stats: {
    total: number;
    starred: number;
    withExp: number;
    byStatus: Record<string, number>;
  } | null;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  setActiveRole: (roleId: string | 'all') => void;
  setView: (v: ViewMode) => void;
  setFilters: (f: Partial<Filters>) => void;
  setPage: (p: number) => void;
  setSort: (key: string) => void;
  toggleSelect: (id: string) => void;
  selectAllVisible: (ids: string[]) => void;
  clearSelection: () => void;
  openDetail: (id: string | null) => void;
  openCreate: () => void;
  openEdit: (c: Candidate) => void;
  closeForm: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  getCandidates: () => Candidate[];
  getCandidate: (id: string) => Candidate | undefined;
  upsertCandidate: (c: Candidate) => Promise<void>;
  patchCandidate: (id: string, patch: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
  bulkStatus: (status: PipelineStatus) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  importCandidates: (list: Candidate[]) => Promise<void>;
  resetLocalChanges: () => void;
  loadAllRoles: () => Promise<void>;
  loadRole: (roleId: string) => Promise<void>;
}

function emptyCandidate(roleId: string, roleName: string): Candidate {
  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  return {
    id,
    roleId,
    roleName,
    status: 'new',
    tags: [],
    notes: '',
    starred: false,
    createdAt: now,
    updatedAt: now,
    name: '',
    applicationLink: null,
    phone: null,
    email: null,
    city: null,
    gender: null,
    otherSkills: null,
    aiResumeMatch: null,
    institute: null,
    degree: null,
    stream: null,
    graduationYear: null,
    performancePg: null,
    performanceUg: null,
    performance12: null,
    performance10: null,
    chatLink: null,
    resumeLink: null,
    downloadLink: null,
    appliedAt: now,
    hasWorkExperience: null,
    totalRoles: null,
    internshipCount: null,
    fulltimeCount: null,
    companies: null,
    jobTitles: null,
    workExperienceDetail: null,
    experienceDuration: null,
    latestRole: null,
    latestCompany: null,
    careerObjective: null,
    languages: null,
    certifications: null,
    projects: null,
    extraCurricular: null,
    additionalDetails: null,
    relevantSkills: null,
    educationFromPdf: null,
    streamFromPdf: null,
    pdfFile: null,
    availability: null,
    aiInterviewScores: {},
    skillFlags: {},
  };
}

/** Fallback: load seed JSON from public/seed when API is offline */
async function loadSeedFallback(roleId?: string): Promise<{ roles: RoleMeta[]; candidates: Candidate[] }> {
  const rolesRes = await fetch('/seed/roles.json');
  if (!rolesRes.ok) throw new Error('Failed to load seed roles.json');
  const rolesData = await rolesRes.json();
  const roles: RoleMeta[] = (rolesData.roles || []).map((r: RoleMeta & { file?: string }) => ({
    id: r.id,
    name: r.name,
    count: r.count,
    file: (r as { file?: string }).file || `${r.id}.json`,
  }));

  const toLoad = roleId && roleId !== 'all' ? roles.filter((r) => r.id === roleId) : roles;
  let candidates: Candidate[] = [];
  for (const r of toLoad) {
    const file = (r as RoleMeta & { file?: string }).file || `${r.id}.json`;
    const res = await fetch(`/seed/${file}`);
    if (!res.ok) continue;
    const data = await res.json();
    candidates = candidates.concat((data.candidates || []) as Candidate[]);
  }
  return { roles, candidates };
}

export const useStore = create<AppState>((set, get) => ({
  roles: [],
  candidates: [],
  total: 0,
  totalPages: 1,
  loading: false,
  error: null,
  apiMode: true,
  activeRoleId: 'all',
  view: 'dashboard',
  filters: {
    search: '',
    status: 'all',
    city: '',
    experience: 'all',
    aiMatch: '',
    starredOnly: false,
    hasNotes: false,
  },
  selectedIds: new Set(),
  detailId: null,
  formOpen: false,
  formMode: 'create',
  formCandidate: null,
  page: 1,
  pageSize: 50,
  sortKey: 'name',
  sortDir: 'asc',
  theme: loadTheme(),
  stats: null,

  init: async () => {
    applyTheme(get().theme);
    set({ loading: true, error: null });
    const online = await hiringService.health();
    set({ apiMode: online });
    try {
      if (online) {
        const roles = await hiringService.listRoles();
        set({ roles: roles.map((r) => ({ ...r, file: `${r.id}.json`, count: r.count ?? 0 })) });
        await get().refresh();
        await get().loadDashboard();
      } else {
        const { roles, candidates } = await loadSeedFallback();
        set({
          roles,
          candidates,
          total: candidates.length,
          totalPages: Math.max(1, Math.ceil(candidates.length / get().pageSize)),
          apiMode: false,
          error: 'API offline — using local seed data (read-only fallback for edits via local memory)',
        });
        await get().loadDashboard();
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    const { filters, activeRoleId, page, pageSize, sortKey, sortDir, apiMode } = get();
    set({ loading: true, error: null });
    try {
      if (apiMode) {
        const data = await hiringService.listCandidates({
          search: filters.search,
          roleId: activeRoleId === 'all' ? undefined : activeRoleId,
          status: filters.status,
          city: filters.city || undefined,
          experience: filters.experience,
          aiMatch: filters.aiMatch || undefined,
          starredOnly: filters.starredOnly,
          hasNotes: filters.hasNotes,
          sortKey,
          sortDir,
          page,
          pageSize,
        });
        set({
          candidates: data.items,
          total: data.total,
          totalPages: data.totalPages,
          page: data.page,
        });
      } else {
        const { candidates } = await loadSeedFallback(
          activeRoleId === 'all' ? undefined : activeRoleId,
        );
        set({
          candidates,
          total: candidates.length,
          totalPages: Math.max(1, Math.ceil(candidates.length / pageSize)),
        });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  loadDashboard: async () => {
    const { activeRoleId, apiMode, candidates } = get();
    try {
      if (apiMode) {
        const stats = await hiringService.dashboard(
          activeRoleId === 'all' ? undefined : activeRoleId,
        );
        set({
          stats: {
            total: stats.total,
            starred: stats.starred,
            withExp: stats.withExp,
            byStatus: stats.byStatus,
          },
          roles: stats.roles.map((r) => ({ ...r, file: `${r.id}.json`, count: r.count ?? 0 })),
        });
      } else {
        const byStatus: Record<string, number> = {};
        let starred = 0;
        let withExp = 0;
        for (const c of candidates) {
          byStatus[c.status] = (byStatus[c.status] || 0) + 1;
          if (c.starred) starred += 1;
          if ((c.hasWorkExperience || '').toLowerCase() === 'yes') withExp += 1;
        }
        set({ stats: { total: candidates.length, starred, withExp, byStatus } });
      }
    } catch {
      /* non-fatal */
    }
  },

  loadAllRoles: async () => {
    set({ activeRoleId: 'all', page: 1 });
    await get().refresh();
    await get().loadDashboard();
  },

  loadRole: async (roleId: string) => {
    set({ activeRoleId: roleId, page: 1 });
    await get().refresh();
    await get().loadDashboard();
  },

  setActiveRole: (roleId) => {
    set({ activeRoleId: roleId, page: 1, selectedIds: new Set(), detailId: null });
    void get().refresh().then(() => get().loadDashboard());
  },

  setView: (v) => set({ view: v }),

  setFilters: (f) => {
    set({ filters: { ...get().filters, ...f }, page: 1 });
    void get().refresh();
  },

  setPage: (p) => {
    set({ page: p });
    void get().refresh();
  },

  setSort: (key) => {
    const { sortKey, sortDir } = get();
    if (sortKey === key) set({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' });
    else set({ sortKey: key, sortDir: 'asc' });
    void get().refresh();
  },

  toggleSelect: (id) => {
    const s = new Set(get().selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    set({ selectedIds: s });
  },
  selectAllVisible: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),
  openDetail: (id) => set({ detailId: id }),
  openCreate: () => {
    const roleId = get().activeRoleId === 'all' ? get().roles[0]?.id || 'custom' : get().activeRoleId;
    const roleName = get().roles.find((r) => r.id === roleId)?.name || 'Custom';
    set({ formOpen: true, formMode: 'create', formCandidate: emptyCandidate(roleId, roleName) });
  },
  openEdit: (c) => set({ formOpen: true, formMode: 'edit', formCandidate: { ...c } }),
  closeForm: () => set({ formOpen: false, formCandidate: null }),

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },

  getCandidates: () => get().candidates,
  getCandidate: (id) => get().candidates.find((c) => c.id === id),

  upsertCandidate: async (c) => {
    const { apiMode, formMode } = get();
    if (apiMode) {
      if (formMode === 'create') {
        await hiringService.createCandidate(c);
      } else {
        await hiringService.replaceCandidate(c.id, c);
      }
      set({ formOpen: false, formCandidate: null, detailId: c.id });
      await get().refresh();
      await get().loadDashboard();
    } else {
      const list = [...get().candidates];
      const idx = list.findIndex((x) => x.id === c.id);
      if (idx >= 0) list[idx] = c;
      else list.push(c);
      set({ candidates: list, formOpen: false, formCandidate: null, detailId: c.id });
    }
  },

  patchCandidate: async (id, patch) => {
    const { apiMode } = get();
    if (apiMode) {
      await hiringService.updateCandidate(id, patch);
      await get().refresh();
      await get().loadDashboard();
    } else {
      const list = get().candidates.map((c) => (c.id === id ? { ...c, ...patch } : c));
      set({ candidates: list });
    }
  },

  deleteCandidate: async (id) => {
    const { apiMode } = get();
    if (apiMode) {
      await hiringService.deleteCandidate(id);
    }
    set({
      candidates: get().candidates.filter((c) => c.id !== id),
      detailId: get().detailId === id ? null : get().detailId,
    });
    await get().refresh();
    await get().loadDashboard();
  },

  deleteSelected: async () => {
    const ids = [...get().selectedIds];
    const { apiMode } = get();
    if (apiMode) {
      await hiringService.bulkDelete(ids);
    }
    set({ selectedIds: new Set(), detailId: null });
    await get().refresh();
    await get().loadDashboard();
  },

  bulkStatus: async (status) => {
    const ids = [...get().selectedIds];
    const { apiMode } = get();
    if (apiMode) {
      await hiringService.bulkStatus(ids, status);
    } else {
      set({
        candidates: get().candidates.map((c) =>
          ids.includes(c.id) ? { ...c, status } : c,
        ),
      });
    }
    await get().refresh();
    await get().loadDashboard();
  },

  toggleStar: async (id) => {
    const c = get().getCandidate(id);
    if (!c) return;
    await get().patchCandidate(id, { starred: !c.starred });
  },

  importCandidates: async (list) => {
    const { apiMode } = get();
    if (apiMode) {
      await hiringService.bulkImport(list);
      await get().refresh();
      await get().loadDashboard();
    } else {
      set({ candidates: [...get().candidates, ...list] });
    }
  },

  resetLocalChanges: () => {
    void get().refresh();
    void get().loadDashboard();
  },
}));
