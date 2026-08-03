import { API_URL } from '../config/dataSource';
import { getToken } from './apiClient';

export interface UploadResult {
  url: string;
  key?: string;
  filename: string;
  backend?: string;
  size?: number;
}

export async function uploadResume(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/uploads/resume`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/uploads/image`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getStorageStatus(): Promise<{
  backend: string;
  maxUploadMb?: number;
  bucket?: string;
  publicUrl?: string;
}> {
  const res = await fetch(`${API_URL}/api/uploads/status`);
  if (!res.ok) throw new Error('Failed to get storage status');
  return res.json();
}
