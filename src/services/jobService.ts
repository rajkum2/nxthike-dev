import { isJsonMode, isApiMode } from '../config/dataSource';
import { supabase } from '../lib/supabase';
import { apiFetch } from './apiClient';
import { jobs as jsonJobs } from '../data';
import type { Job } from '../types';

export async function fetchAllJobs(): Promise<Job[]> {
  if (isApiMode()) {
    const data = await apiFetch<{ items: Job[] }>('/api/jobs?per_page=100');
    return data.items;
  }

  if (isJsonMode()) {
    return jsonJobs.filter(j => j.status === 'approved');
  }

  const { data, error } = await (supabase as any)
    .from('jobs')
    .select('*')
    .eq('status', 'approved')
    .order('posted_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((job: any) => ({
    ...job,
    postedAt: job.posted_at,
    isRemote: job.is_remote,
  }));
}

export async function fetchJobById(id: string): Promise<Job | null> {
  if (isApiMode()) {
    try {
      return await apiFetch<Job>(`/api/jobs/${id}`);
    } catch {
      return null;
    }
  }

  if (isJsonMode()) {
    return jsonJobs.find(j => j.id === id) || null;
  }

  const { data, error } = await (supabase as any)
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  if (!data) return null;
  return {
    ...data,
    postedAt: data.posted_at,
    isRemote: data.is_remote,
  };
}

export async function createJob(job: Omit<Job, 'id' | 'postedAt' | 'status' | 'applicants'>): Promise<void> {
  if (isApiMode()) {
    await apiFetch('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
    return;
  }

  if (isJsonMode()) {
    return;
  }

  const dbJob = {
    ...job,
    posted_at: new Date().toISOString(),
    is_remote: job.isRemote,
    status: 'pending',
    applicants: [],
  };

  const { error } = await (supabase as any).from('jobs').insert(dbJob);
  if (error) throw error;
}

export async function updateJob(id: string, job: Partial<Job>): Promise<void> {
  if (isApiMode()) {
    await apiFetch(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    });
    return;
  }

  if (isJsonMode()) {
    return;
  }

  const dbJob = { ...job, is_remote: job.isRemote };
  const { error } = await (supabase as any).from('jobs').update(dbJob).eq('id', id);
  if (error) throw error;
}

export async function deleteJob(id: string): Promise<void> {
  if (isApiMode()) {
    await apiFetch(`/api/jobs/${id}`, { method: 'DELETE' });
    return;
  }

  if (isJsonMode()) {
    return;
  }

  const { error } = await (supabase as any).from('jobs').delete().eq('id', id);
  if (error) throw error;
}
