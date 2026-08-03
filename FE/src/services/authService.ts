import { isJsonMode, isApiMode } from '../config/dataSource';
import { supabase } from '../lib/supabase';
import { apiFetch, setToken, clearToken } from './apiClient';
import type { User } from '../types';

const demoUsers: User[] = [
  {
    id: 'demo-student-1',
    email: 'student@nxthike.com',
    role: 'student',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'demo-employer-1',
    email: 'employer@nxthike.com',
    role: 'employer',
    firstName: 'Jane',
    lastName: 'Smith',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@nxthike.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const DEMO_PASSWORDS: Record<string, string> = {
  'student@nxthike.com': 'password123',
  'employer@nxthike.com': 'password123',
  'admin@nxthike.com': 'admin123',
};

export async function signIn(email: string, password: string): Promise<User | null> {
  if (isApiMode()) {
    const data = await apiFetch<{ access_token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    localStorage.setItem('nxthike_user', JSON.stringify(data.user));
    return data.user;
  }

  if (isJsonMode()) {
    const normalized = email.trim().toLowerCase();
    const user = demoUsers.find((u) => u.email.toLowerCase() === normalized);
    const expected = DEMO_PASSWORDS[user?.email || ''] || DEMO_PASSWORDS[normalized];
    if (user && expected && password === expected) {
      localStorage.setItem('nxthike_user', JSON.stringify(user));
      return user;
    }
    throw new Error(
      'Invalid email or password. Admin: admin@nxthike.com / admin123',
    );
  }

  const { error } = await (supabase as any).auth.signInWithPassword({ email, password });
  if (error) throw error;
  return null;
}

export async function signUp(
  email: string,
  password: string,
  userData: Partial<User>
): Promise<User | null> {
  if (isApiMode()) {
    const data = await apiFetch<{ access_token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        role: userData.role || 'student',
      }),
    });
    setToken(data.access_token);
    localStorage.setItem('nxthike_user', JSON.stringify(data.user));
    return data.user;
  }

  if (isJsonMode()) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      role: (userData.role as any) || 'student',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('nxthike_user', JSON.stringify(newUser));
    return newUser;
  }

  const { error: signUpError, data } = await (supabase as any).auth.signUp({
    email,
    password,
    options: { data: userData },
  });
  if (signUpError) throw signUpError;

  if (data.user) {
    const { role = 'student' } = userData;
    const profileData = {
      id: data.user.id,
      email,
      ...userData,
    };

    const { error: profileError } = await (supabase as any)
      .from(role === 'employer' ? 'employers' : 'students')
      .insert(profileData);

    if (profileError) throw profileError;
  }

  return null;
}

export async function signOut(): Promise<void> {
  if (isApiMode()) {
    clearToken();
    localStorage.removeItem('nxthike_user');
    return;
  }

  if (isJsonMode()) {
    localStorage.removeItem('nxthike_user');
    return;
  }

  const { error } = await (supabase as any).auth.signOut();
  if (error) throw error;
}

export async function fetchUser(): Promise<User | null> {
  if (isApiMode()) {
    const stored = localStorage.getItem('nxthike_user');
    if (stored) {
      try {
        // Verify token is still valid
        const user = await apiFetch<User>('/api/auth/me');
        localStorage.setItem('nxthike_user', JSON.stringify(user));
        return user;
      } catch {
        clearToken();
        localStorage.removeItem('nxthike_user');
        return null;
      }
    }
    return null;
  }

  if (isJsonMode()) {
    const stored = localStorage.getItem('nxthike_user');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  }

  const { data: { user: authUser } } = await (supabase as any).auth.getUser();
  if (!authUser) return null;

  const role = authUser.user_metadata?.role || 'student';
  const table = role === 'employer' ? 'employers' : role === 'admin' ? 'admins' : 'students';

  const { data: profileData, error: profileError } = await (supabase as any)
    .from(table)
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileError) throw profileError;
  return profileData;
}

export type ProfileUpdatePayload = {
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  companyName?: string | null;
  companyDescription?: string | null;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  resume?: string | null;
  skills?: string[];
};

export async function updateProfile(payload: ProfileUpdatePayload): Promise<User> {
  if (isApiMode()) {
    const user = await apiFetch<User>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('nxthike_user', JSON.stringify(user));
    return user;
  }

  if (isJsonMode()) {
    const stored = localStorage.getItem('nxthike_user');
    if (!stored) throw new Error('Not signed in');
    const current = JSON.parse(stored) as User;
    const next = { ...current, ...payload } as User;
    localStorage.setItem('nxthike_user', JSON.stringify(next));
    return next;
  }

  throw new Error('Profile update not supported in this data mode');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  if (isApiMode()) {
    await apiFetch<{ ok: boolean }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return;
  }
  if (isJsonMode()) {
    // Demo mode — accept any current password
    return;
  }
  throw new Error('Password change not supported in this data mode');
}

export async function listUsers(): Promise<User[]> {
  if (isApiMode()) {
    return apiFetch<User[]>('/api/auth/users');
  }
  if (isJsonMode()) {
    return demoUsers;
  }
  throw new Error('User list requires API mode');
}

export async function updateUserRole(userId: string, role: User['role']): Promise<User> {
  if (isApiMode()) {
    return apiFetch<User>(`/api/auth/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
  if (isJsonMode()) {
    const u = demoUsers.find((x) => x.id === userId);
    if (!u) throw new Error('User not found');
    u.role = role;
    return u;
  }
  throw new Error('Role update requires API mode');
}
