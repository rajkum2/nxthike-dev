/**
 * Legacy Admin Console routes now live inside NxtHike Workspace.
 * Keep /admin/* URLs working via redirect so bookmarks and navbar links don't break.
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RequireAdmin from '../../components/auth/RequireAdmin';

/** Map old admin paths → workspace screen keys (handled by desk hash/query later if needed). */
const PATH_TO_SCREEN: Record<string, string> = {
  '/admin': 'portalOverview',
  '/admin/': 'portalOverview',
  '/admin/profile': 'settings',
  '/admin/users': 'users',
  '/admin/hiring-roles': 'portalRoles',
  '/admin/jobs': 'portalJobs',
  '/admin/events': 'portalEvents',
  '/admin/courses': 'portalCourses',
  '/admin/companies': 'portalCompanies',
};

const AdminLayoutInner: React.FC = () => {
  const location = useLocation();
  const screen = PATH_TO_SCREEN[location.pathname] || 'portalOverview';

  // Stash target screen for desk boot (desk reads session.landing by default).
  useEffect(() => {
    try {
      sessionStorage.setItem('nxthike_workspace_screen', screen);
    } catch {
      /* ignore */
    }
  }, [screen]);

  return <Navigate to="/hiring" replace />;
};

const AdminLayout: React.FC = () => (
  <RequireAdmin>
    <AdminLayoutInner />
  </RequireAdmin>
);

export default AdminLayout;
