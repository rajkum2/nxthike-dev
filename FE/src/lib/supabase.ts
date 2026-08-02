import { createClient } from '@supabase/supabase-js';
import { isSupabaseMode } from '../config/dataSource';

// Mock Supabase client for JSON/development mode
const mockClient = {
  auth: {
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  },
  from: (_table: string) => ({
    select: (..._args: any[]) => ({
      eq: (..._args2: any[]) => ({
        single: async () => ({ data: null, error: null }),
        order: async () => ({ data: [], error: null }),
      }),
      order: (_col: string, _opts?: any) => ({
        data: [] as any[],
        error: null,
      }),
      data: [] as any[],
      error: null,
    }),
    insert: async (_data: any) => ({ data: null, error: null }),
    update: (_data: any) => ({
      eq: async (_col: string, _val: any) => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: async (_col: string, _val: any) => ({ data: null, error: null }),
    }),
  }),
  storage: {
    from: (_bucket: string) => ({
      upload: async () => ({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } }),
    }),
  },
};

let supabase: ReturnType<typeof createClient> | typeof mockClient;

if (isSupabaseMode()) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    supabase = createClient(url, key);
  } else {
    console.warn('Supabase credentials missing, falling back to mock client');
    supabase = mockClient;
  }
} else {
  supabase = mockClient;
}

export { supabase };
