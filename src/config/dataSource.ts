export type DataSource = 'json' | 'supabase' | 'api';

export const DATA_SOURCE: DataSource =
  (import.meta.env.VITE_DATA_SOURCE as DataSource) || 'json';

export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const isJsonMode = (): boolean => DATA_SOURCE === 'json';
export const isSupabaseMode = (): boolean => DATA_SOURCE === 'supabase';
export const isApiMode = (): boolean => DATA_SOURCE === 'api';
