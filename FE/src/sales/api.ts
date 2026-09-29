/**
 * Sales CRM client — `/api/sales/*` (Phase 1 + Phase 2 activities / approve queue).
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

export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'meeting'
  | 'task'
  | 'outreach_draft'
  | 'outreach_sent'
  | 'stage_change';

export type ActivityStatus =
  | 'planned'
  | 'done'
  | 'cancelled'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sent';

export type ActivityChannel = 'email' | 'phone' | 'linkedin' | 'whatsapp' | 'other';

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

export interface SalesActivity {
  id: string;
  opportunityId?: string | null;
  opportunityName?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  activityType: ActivityType | string;
  status: ActivityStatus | string;
  direction?: string | null;
  channel?: string | null;
  subject?: string | null;
  body: string;
  bodyHtml?: string | null;
  occurredAt?: string | null;
  scheduledAt?: string | null;
  completedAt?: string | null;
  ownerId?: string | null;
  createdBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedReason?: string | null;
  metadata?: Record<string, unknown>;
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
  pendingApprovals?: number;
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
  activityStatuses?: string[];
  activityDirections?: string[];
  activityChannels?: string[];
  persona: { id: string; name: string; mode: string };
  caps: { sales: boolean; accounts: string; approveQueue?: boolean };
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

export interface MarkSentResult {
  activity: SalesActivity;
  wouldSend: boolean;
  logMessage: string;
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
  timeline: (oppId: string) =>
    req<SalesActivity[]>(`/api/sales/opportunities/${oppId}/timeline`),
  draftOutreach: (oppId: string, body: { channel?: ActivityChannel; contactId?: string } = {}) =>
    req<SalesActivity>(`/api/sales/opportunities/${oppId}/draft-outreach`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  activities: (p: { opportunityId?: string; status?: string; type?: string } = {}) =>
    req<SalesActivity[]>(`/api/sales/activities${qs({
      opportunity_id: p.opportunityId,
      status: p.status,
      type: p.type,
    })}`),
  createActivity: (body: {
    opportunityId?: string;
    activityType?: ActivityType;
    status?: ActivityStatus;
    direction?: string;
    channel?: ActivityChannel;
    subject?: string;
    body?: string;
  }) =>
    req<SalesActivity>('/api/sales/activities', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateActivity: (id: string, body: Partial<SalesActivity>) =>
    req<SalesActivity>(`/api/sales/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  approveQueue: () => req<SalesActivity[]>('/api/sales/approve-queue'),
  approve: (id: string) =>
    req<SalesActivity>(`/api/sales/activities/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: string) =>
    req<SalesActivity>(`/api/sales/activities/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  markSent: (id: string) =>
    req<MarkSentResult>(`/api/sales/activities/${id}/mark-sent`, { method: 'POST' }),
};

export type SalesApi = typeof salesApi;
