import { API_URL } from '../config/dataSource';
import type { Candidate, PipelineStatus, RoleMeta } from '../hiring/types';
import { getToken } from './apiClient';

const BASE = `${API_URL}/api/hiring`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let detail = text || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j.detail) detail = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail);
    } catch {
      /* keep text */
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error('Admin login required to access hiring data.');
    }
    throw new Error(detail);
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

  createRole: (body: {
    id: string;
    name: string;
    description?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }) => request<RoleMeta>('/roles', { method: 'POST', body: JSON.stringify(body) }),

  updateRole: (
    id: string,
    body: Partial<{ name: string; description: string | null; is_active: boolean; sort_order: number }>,
  ) => request<RoleMeta>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  deleteRole: (id: string) => request<void>(`/roles/${id}`, { method: 'DELETE' }),

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
