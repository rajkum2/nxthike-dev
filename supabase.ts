// Mock Supabase client for development
const supabase = {
  auth: {
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  },
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
    }),
  },
};

export default supabase;

// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


// console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
// console.log('Supabase Key exists:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// if (!supabaseUrl || !supabaseAnonKey) {
//     throw new Error("Missing Supabase credentials. Please check your environment variables.");
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
