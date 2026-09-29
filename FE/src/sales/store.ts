/**
 * Lightweight sales desk navigation store (mirrors desk screen pattern).
 */

import { create } from 'zustand';

export type SalesScreen = 'home' | 'opps' | 'opp' | 'pipeline' | 'approve';

export const SALES_SCREENS: Record<SalesScreen, { name: string; path: string }> = {
  home: { name: 'Sales home', path: '/sales' },
  opps: { name: 'Opportunities', path: '/sales/opportunities' },
  opp: { name: 'Opportunity', path: '/sales/opportunities/:id' },
  pipeline: { name: 'Pipeline', path: '/sales/pipeline' },
  approve: { name: 'Approve queue', path: '/sales/approve' },
};

interface SalesState {
  screen: SalesScreen;
  oppId: string | null;
  go: (screen: SalesScreen, oppId?: string | null) => void;
}

export const useSales = create<SalesState>((set) => ({
  screen: 'home',
  oppId: null,
  go: (screen, oppId = null) => set({ screen, oppId: oppId ?? null }),
}));
