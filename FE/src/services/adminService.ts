import { apiFetch } from './apiClient';
import { isApiMode } from '../config/dataSource';

export interface AdminStats {
  jobs: number;
  internships: number;
  fulltime: number;
  pendingJobs: number;
  events: number;
  courses: number;
  companies: number;
  users: number;
  admins: number;
  candidates: number;
  hiringRoles: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  if (!isApiMode()) {
    return {
      jobs: 0,
      internships: 0,
      fulltime: 0,
      pendingJobs: 0,
      events: 0,
      courses: 0,
      companies: 0,
      users: 0,
      admins: 0,
      candidates: 0,
      hiringRoles: 0,
    };
  }
  return apiFetch<AdminStats>('/api/dashboard/stats');
}

export async function adminListJobs(page = 1, perPage = 50, status = 'all') {
  return apiFetch<{
    items: any[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
  }>(`/api/jobs?status=${encodeURIComponent(status)}&page=${page}&per_page=${perPage}`);
}

export async function adminCreateJob(body: Record<string, unknown>) {
  return apiFetch<any>('/api/jobs', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateJob(id: string, body: Record<string, unknown>) {
  return apiFetch<any>(`/api/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteJob(id: string) {
  return apiFetch<void>(`/api/jobs/${id}`, { method: 'DELETE' });
}

export async function adminListEvents(page = 1, perPage = 50) {
  return apiFetch<{ items: any[]; total: number }>(
    `/api/events?page=${page}&per_page=${perPage}`,
  );
}

export async function adminCreateEvent(body: Record<string, unknown>) {
  return apiFetch<any>('/api/events', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateEvent(id: string, body: Record<string, unknown>) {
  return apiFetch<any>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteEvent(id: string) {
  return apiFetch<void>(`/api/events/${id}`, { method: 'DELETE' });
}

export async function adminListCourses(page = 1, perPage = 50) {
  return apiFetch<{ items: any[]; total: number }>(
    `/api/courses?page=${page}&per_page=${perPage}`,
  );
}

export async function adminCreateCourse(body: Record<string, unknown>) {
  return apiFetch<any>('/api/courses', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateCourse(id: string, body: Record<string, unknown>) {
  return apiFetch<any>(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteCourse(id: string) {
  return apiFetch<void>(`/api/courses/${id}`, { method: 'DELETE' });
}

export async function adminListCompanies() {
  return apiFetch<any[]>('/api/companies');
}

export async function adminCreateCompany(body: Record<string, unknown>) {
  return apiFetch<any>('/api/companies', { method: 'POST', body: JSON.stringify(body) });
}

export async function adminUpdateCompany(id: string, body: Record<string, unknown>) {
  return apiFetch<any>(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function adminDeleteCompany(id: string) {
  return apiFetch<void>(`/api/companies/${id}`, { method: 'DELETE' });
}
