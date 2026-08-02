import { create } from 'zustand';
import { fetchAllJobs, fetchJobById as fetchJobByIdService } from '../services/jobService';
import type { Job } from '../types';

interface JobFilters {
  location?: string;
  category?: string;
  type?: 'internship' | 'full-time' | 'part-time' | 'contract';
  isRemote?: boolean;
  search?: string;
}

interface JobState {
  jobs: Job[];
  filteredJobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
  filters: JobFilters;

  fetchJobs: () => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  setFilters: (filters: JobFilters) => void;
  clearFilters: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  filteredJobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchJobs: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchAllJobs();
      set({ jobs: data, filteredJobs: data });

      const currentFilters = get().filters;
      if (Object.keys(currentFilters).length > 0) {
        get().setFilters(currentFilters);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchJobById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchJobByIdService(id);
      set({ selectedJob: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    const { jobs } = get();
    let filtered = [...jobs];

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(job =>
        job.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.type) {
      filtered = filtered.filter(job => job.type === filters.type);
    }

    if (filters.isRemote !== undefined) {
      filtered = filtered.filter(job => job.isRemote === filters.isRemote);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }

    set({ filteredJobs: filtered, filters });
  },

  clearFilters: () => {
    set({ filteredJobs: get().jobs, filters: {} });
  },
}));
