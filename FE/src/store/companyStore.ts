import { create } from 'zustand';
import { fetchAllCompanies, fetchCompanyById as fetchCompanyByIdService } from '../services/companyService';
import type { Company } from '../types';

interface CompanyState {
  companies: Company[];
  filteredCompanies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  search: string;

  fetchCompanies: () => Promise<void>;
  fetchCompanyById: (id: string) => Promise<void>;
  setSearch: (search: string) => void;
  clearSearch: () => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  filteredCompanies: [],
  selectedCompany: null,
  isLoading: false,
  error: null,
  search: '',

  fetchCompanies: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchAllCompanies();
      set({ companies: data, filteredCompanies: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCompanyById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchCompanyByIdService(id);
      set({ selectedCompany: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setSearch: (search) => {
    const { companies } = get();
    if (!search) {
      set({ filteredCompanies: companies, search });
      return;
    }
    const term = search.toLowerCase();
    const filtered = companies.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.industry.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term)
    );
    set({ filteredCompanies: filtered, search });
  },

  clearSearch: () => {
    set({ filteredCompanies: get().companies, search: '' });
  },
}));
