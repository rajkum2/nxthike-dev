import { API_URL } from '../config/dataSource';
import type { Candidate, PipelineStatus, RoleMeta } from '../hiring/types';

const BASE = `${API_URL}/api/hiring`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface HiringListParams {
  search?: string;
  roleId?: string;
  status?: PipelineStatus | 'all';
  city?: string;
  experience?: 'all' | 'yes' | 'no';
  aiMatch?: string;
  starredOnly?: boolean;
  hasNotes?: boolean;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedCandidates {
  items: Candidate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HiringDashboardStats {
  total: number;
  starred: number;
  withExp: number;
  byStatus: Record<string, number>;
  byRole: Record<string, number>;
  roles: RoleMeta[];
}

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const hiringService = {
  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  listRoles: () => request<RoleMeta[]>('/roles'),

  dashboard: (roleId?: string) =>
    request<HiringDashboardStats>(`/dashboard${qs({ roleId })}`),

  listCandidates: (params: HiringListParams = {}) =>
    request<PaginatedCandidates>(
      `/candidates${qs({
        search: params.search,
        roleId: params.roleId,
        status: params.status === 'all' ? undefined : params.status,
        city: params.city,
        experience: params.experience === 'all' ? undefined : params.experience,
        aiMatch: params.aiMatch,
        starredOnly: params.starredOnly || undefined,
        hasNotes: params.hasNotes || undefined,
        sortKey: params.sortKey,
        sortDir: params.sortDir,
        page: params.page,
        pageSize: params.pageSize,
      })}`,
    ),

  getCandidate: (id: string) => request<Candidate>(`/candidates/${id}`),

  createCandidate: (body: Partial<Candidate>) =>
    request<Candidate>('/candidates', { method: 'POST', body: JSON.stringify(body) }),

  updateCandidate: (id: string, body: Partial<Candidate>) =>
    request<Candidate>(`/candidates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  replaceCandidate: (id: string, body: Candidate) =>
    request<Candidate>(`/candidates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteCandidate: (id: string) =>
    request<void>(`/candidates/${id}`, { method: 'DELETE' }),

  bulkStatus: (ids: string[], status: PipelineStatus) =>
    request<{ updated: number }>('/candidates/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    }),

  bulkDelete: (ids: string[]) =>
    request<{ deleted: number }>('/candidates/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  bulkImport: (list: Candidate[]) =>
    request<{ created: number; updated: number; total: number }>('/candidates/bulk-import', {
      method: 'POST',
      body: JSON.stringify(list),
    }),
};
