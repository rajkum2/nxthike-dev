/**
 * Sales CRM Phase 1 client — `/api/sales/*`.
 * Accounts reuse companies; no destructive ops against hiring data.
 */

import { apiFetch } from '../services/apiClient';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, init);
}

const qs = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export type ProductLine = 'staffing' | 'platform' | 'hybrid';
export type OppStage =
  | 'qualify'
  | 'discovery'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'on_hold';

export interface SalesOpportunity {
  id: string;
  companyId?: string | null;
  companyName?: string | null;
  contactId?: string | null;
  leadId?: string | null;
  name: string;
  productLine: ProductLine | string;
  stage: OppStage | string;
  amount?: number | null;
  currency?: string;
  probability?: number | null;
  expectedClose?: string | null;
  hiringRoleIds: string[];
  notes?: string;
  ownerId?: string | null;
  lostReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SalesHomeStats {
  contacts: number;
  leads: number;
  opportunities: number;
  openPipeline: number;
  won: number;
  byProductLine: Record<string, number>;
  byStage: Record<string, number>;
}

export interface SalesPipelineColumn {
  stage: string;
  label: string;
  count: number;
  totalAmount: number;
  items: SalesOpportunity[];
}

export interface SalesPipeline {
  columns: SalesPipelineColumn[];
  totalOpen: number;
  totalWon: number;
  totalLost: number;
}

export interface SalesMeta {
  productLines: string[];
  stages: { id: string; label: string }[];
  leadStatuses: string[];
  activityTypes: string[];
  persona: { id: string; name: string; mode: string };
  caps: { sales: boolean; accounts: string };
}

export interface SalesAccount {
  id: string;
  name: string;
  industry: string;
  location: string;
  isClient: boolean;
  phone?: string | null;
  website?: string | null;
}

export const salesApi = {
  meta: () => req<SalesMeta>('/api/sales/meta'),
  home: () => req<SalesHomeStats>('/api/sales/home'),
  accounts: (q?: string) => req<SalesAccount[]>(`/api/sales/accounts${qs({ q })}`),
  opportunities: (p: { stage?: string; productLine?: string; companyId?: string } = {}) =>
    req<SalesOpportunity[]>(`/api/sales/opportunities${qs(p)}`),
  pipeline: (productLine?: string) =>
    req<SalesPipeline>(`/api/sales/opportunities/pipeline${qs({ productLine })}`),
  opportunity: (id: string) => req<SalesOpportunity>(`/api/sales/opportunities/${id}`),
  createOpportunity: (body: Partial<SalesOpportunity> & { name: string }) =>
    req<SalesOpportunity>('/api/sales/opportunities', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateOpportunity: (id: string, body: Partial<SalesOpportunity>) =>
    req<SalesOpportunity>(`/api/sales/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export type SalesApi = typeof salesApi;
