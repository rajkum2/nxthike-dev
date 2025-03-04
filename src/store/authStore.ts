import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // User data will be fetched by the fetchUser function
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error: signUpError, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      
      if (signUpError) throw signUpError;
      
      // Create profile in the appropriate table based on role
      if (data.user) {
        const { role = 'student' } = userData;
        const profileData = {
          id: data.user.id,
          email,
          ...userData,
        };
        
        const { error: profileError } = await supabase
          .from(role === 'employer' ? 'employers' : 'students')
          .insert(profileData);
          
        if (profileError) throw profileError;
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        set({ user: null });
        return;
      }
      
      // Get the user's role from auth metadata
      const role = authUser.user_metadata.role || 'student';
      
      // Fetch the complete user profile from the appropriate table
      const { data: profileData, error: profileError } = await supabase
        .from(role === 'employer' ? 'employers' : role === 'admin' ? 'admins' : 'students')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (profileError) throw profileError;
      
      set({ user: profileData as User });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ error: (error as Error).message, user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));