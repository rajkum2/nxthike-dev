import { create } from 'zustand';
import {
  signIn as signInService,
  signUp as signUpService,
  signOut as signOutService,
  fetchUser as fetchUserService,
} from '../services/authService';
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
      const user = await signInService(email, password);
      if (user) {
        set({ user });
      } else {
        const fetchedUser = await fetchUserService();
        set({ user: fetchedUser });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ isLoading: true, error: null });
      const user = await signUpService(email, password, userData);
      if (user) {
        set({ user });
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
      await signOutService();
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
      const user = await fetchUserService();
      set({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ error: (error as Error).message, user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
