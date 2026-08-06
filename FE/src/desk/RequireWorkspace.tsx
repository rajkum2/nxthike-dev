/**
 * Route guard for the hiring workspace.
 *
 * The portal's `User` only carries student/employer/admin, so it cannot tell
 * whether an account has a workspace persona — a recruiter is `employer` with
 * persona `p2`. Gating on `role === 'admin'` here would lock every non-admin
 * recruiter out of a dashboard the API would happily serve them.
 *
 * So this guard checks only that someone is signed in, and lets
 * `/api/workspace/session` decide. That check is server-side and is the one
 * that actually protects the data; a denial renders as an explained state
 * rather than a silent redirect.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getToken } from '../services/apiClient';

const RequireWorkspace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  /*
   * The store starts as `{ user: null, isLoading: false }` and only fetches the
   * user from an effect in `App`, so the very first render of a hard load looks
   * identical to "signed out". Redirecting on that would bounce a signed-in
   * user to the login page every time they opened /hiring directly or hit
   * refresh. A stored token means the answer is still pending, not "no".
   */
  const authPending = isLoading || (!user && !!getToken());

  if (authPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-3" />
          <p className="text-sm text-surface-600">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

export default RequireWorkspace;
