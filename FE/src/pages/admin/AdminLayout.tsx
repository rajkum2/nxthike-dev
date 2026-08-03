import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  GraduationCap,
  Building2,
  UserCircle,
  Kanban,
  Tags,
  ChevronRight,
} from 'lucide-react';
import RequireAdmin from '../../components/auth/RequireAdmin';
import { useAuthStore } from '../../store/authStore';

const nav = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/profile', end: false, label: 'My Profile', icon: UserCircle },
  { to: '/admin/users', end: false, label: 'Users', icon: Users },
  { to: '/admin/hiring-roles', end: false, label: 'Hiring Roles', icon: Tags },
  { to: '/hiring/dashboard', end: false, label: 'Hiring CRM', icon: Kanban, external: true },
  { to: '/admin/jobs', end: false, label: 'Jobs', icon: Briefcase },
  { to: '/admin/events', end: false, label: 'Events', icon: Calendar },
  { to: '/admin/courses', end: false, label: 'Courses', icon: GraduationCap },
  { to: '/admin/companies', end: false, label: 'Companies', icon: Building2 },
];

const AdminLayoutInner: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const title =
    nav.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to) && n.to !== '/admin',
    )?.label ||
    (location.pathname === '/admin' ? 'Overview' : 'Admin');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50">
      <div className="border-b border-surface-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Admin Console</p>
            <h1 className="text-xl font-bold text-surface-900 flex items-center gap-2">
              {title}
              <ChevronRight className="h-4 w-4 text-surface-300 hidden sm:inline" />
              <span className="text-sm font-normal text-surface-500 hidden sm:inline">
                {user?.firstName} {user?.lastName}
              </span>
            </h1>
          </div>
          <Link
            to="/hiring/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-2 rounded-lg shadow-sm"
          >
            <Kanban size={16} /> Open Hiring CRM
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white border border-surface-200 rounded-xl p-3 h-fit shadow-card sticky top-20">
          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => {
              const Icon = item.icon;
              if (item.external) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              }
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => (
  <RequireAdmin>
    <AdminLayoutInner />
  </RequireAdmin>
);

export default AdminLayout;
