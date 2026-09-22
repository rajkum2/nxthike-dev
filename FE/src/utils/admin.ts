import type { User } from '../types';

/**
 * Hiring CRM / Dashboard menu access.
 *
 * No hardcoded emails. Access is based on the user returned from login
 * (FastAPI → database / Supabase). Only users with role === "admin" see the menu.
 *
 * Create admins in the DB (e.g. BE seed ADMIN_EMAIL / ADMIN_PASSWORD), then
 * sign in on the FE with that email + password.
 */
export function isHiringAdmin(user: User | null | undefined): boolean {
  return !!user && user.role === 'admin';
}

/** Admin, or any account an admin has given a recruiting persona (recruiter, sourcer, …). */
export function isWorkspaceMember(user: User | null | undefined): boolean {
  return !!user && (user.role === 'admin' || !!user.persona);
}

/** Where that person should land inside /hiring. Recruiters open their candidate list. */
export function workspaceEntryScreen(user: User | null | undefined): 'home' | 'cands' {
  return user?.role === 'admin' ? 'home' : 'cands';
}
