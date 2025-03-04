import { create } from 'zustand';
import { supabase } from '../lib/supabase';
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
  createJob: (job: Omit<Job, 'id' | 'postedAt' | 'status' | 'applicants'>) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  applyToJob: (jobId: string, userId: string) => Promise<void>;
  saveJob: (jobId: string, userId: string) => Promise<void>;
  unsaveJob: (jobId: string, userId: string) => Promise<void>;
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
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved')
        .order('posted_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match our frontend model
      const transformedData = data.map(job => ({
        ...job,
        postedAt: job.posted_at,
        isRemote: job.is_remote
      }));
      
      set({ jobs: transformedData as Job[], filteredJobs: transformedData as Job[] });
      
      // Apply any existing filters
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
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Transform the data to match our frontend model
      const transformedData = {
        ...data,
        postedAt: data.posted_at,
        isRemote: data.is_remote
      };
      
      set({ selectedJob: transformedData as Job });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createJob: async (job) => {
    try {
      set({ isLoading: true, error: null });
      
      // Transform the job data to match the database schema
      const dbJob = {
        ...job,
        posted_at: new Date().toISOString(),
        is_remote: job.isRemote,
        status: 'pending',
        applicants: [],
      };
      
      const { error } = await supabase
        .from('jobs')
        .insert(dbJob);
        
      if (error) throw error;
      
      // Refresh the job list
      await get().fetchJobs();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateJob: async (id, job) => {
    try {
      set({ isLoading: true, error: null });
      
      // Transform the job data to match the database schema
      const dbJob = {
        ...job,
        is_remote: job.isRemote,
      };
      
      const { error } = await supabase
        .from('jobs')
        .update(dbJob)
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh the job list and selected job
      await get().fetchJobs();
      if (get().selectedJob?.id === id) {
        await get().fetchJobById(id);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteJob: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh the job list
      await get().fetchJobs();
      if (get().selectedJob?.id === id) {
        set({ selectedJob: null });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  applyToJob: async (jobId, userId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('applicants')
        .eq('id', jobId)
        .single();
        
      if (jobError) throw jobError;
      
      // Update the job's applicants list
      const applicants = [...(job.applicants || []), userId];
      
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ applicants })
        .eq('id', jobId);
        
      if (updateError) throw updateError;
      
      // Update the user's applied jobs list
      const { error: userError } = await supabase
        .from('students')
        .select('applied_jobs')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      const { data: userData } = await supabase
        .from('students')
        .select('applied_jobs')
        .eq('id', userId)
        .single();
      
      const appliedJobs = [...(userData?.applied_jobs || []), jobId];
      
      const { error: updateUserError } = await supabase
        .from('students')
        .update({ applied_jobs: appliedJobs })
        .eq('id', userId);
        
      if (updateUserError) throw updateUserError;
      
      // Refresh the job list and selected job
      await get().fetchJobs();
      if (get().selectedJob?.id === jobId) {
        await get().fetchJobById(jobId);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveJob: async (jobId, userId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the user's saved jobs
      const { data: userData, error: userError } = await supabase
        .from('students')
        .select('saved_jobs')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      // Update the user's saved jobs list
      const savedJobs = [...(userData?.saved_jobs || []), jobId];
      
      const { error: updateError } = await supabase
        .from('students')
        .update({ saved_jobs: savedJobs })
        .eq('id', userId);
        
      if (updateError) throw updateError;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  unsaveJob: async (jobId, userId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the user's saved jobs
      const { data: userData, error: userError } = await supabase
        .from('students')
        .select('saved_jobs')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      // Update the user's saved jobs list
      const savedJobs = (userData?.saved_jobs || []).filter(id => id !== jobId);
      
      const { error: updateError } = await supabase
        .from('students')
        .update({ saved_jobs: savedJobs })
        .eq('id', userId);
        
      if (updateError) throw updateError;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setFilters: (filters) => {
    const { jobs } = get();
    let filtered = [...jobs];
    
    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(job => 
        job.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    
    // Apply job type filter
    if (filters.type) {
      filtered = filtered.filter(job => job.type === filters.type);
    }
    
    // Apply remote filter
    if (filters.isRemote !== undefined) {
      filtered = filtered.filter(job => job.isRemote === filters.isRemote);
    }
    
    // Apply search filter
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