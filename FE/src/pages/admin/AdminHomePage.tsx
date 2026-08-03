import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  GraduationCap,
  Building2,
  Users,
  UserCheck,
  Tags,
  Kanban,
  AlertCircle,
} from 'lucide-react';
import Card, { CardContent } from '../../components/ui/Card';
import { fetchAdminStats, type AdminStats } from '../../services/adminService';
import { isApiMode } from '../../config/dataSource';

const AdminHomePage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await fetchAdminStats();
        if (!cancelled) setStats(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: 'Candidates', value: stats?.candidates ?? 0, icon: UserCheck, to: '/hiring/candidates', color: 'bg-brand-500' },
    { label: 'Hiring roles', value: stats?.hiringRoles ?? 0, icon: Tags, to: '/admin/hiring-roles', color: 'bg-indigo-500' },
    { label: 'Jobs', value: stats?.jobs ?? 0, icon: Briefcase, to: '/admin/jobs', color: 'bg-sky-500' },
    { label: 'Pending jobs', value: stats?.pendingJobs ?? 0, icon: AlertCircle, to: '/admin/jobs', color: 'bg-amber-500' },
    { label: 'Events', value: stats?.events ?? 0, icon: Calendar, to: '/admin/events', color: 'bg-violet-500' },
    { label: 'Courses', value: stats?.courses ?? 0, icon: GraduationCap, to: '/admin/courses', color: 'bg-emerald-500' },
    { label: 'Companies', value: stats?.companies ?? 0, icon: Building2, to: '/admin/companies', color: 'bg-rose-500' },
    { label: 'Users', value: stats?.users ?? 0, icon: Users, to: '/admin/users', color: 'bg-surface-700' },
  ];

  return (
    <div className="space-y-6">
      {!isApiMode() && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3">
          <strong>API mode off.</strong> Set <code className="text-xs bg-white/80 px-1 rounded">VITE_DATA_SOURCE=api</code> and{' '}
          <code className="text-xs bg-white/80 px-1 rounded">VITE_API_URL</code> so admin CRUD hits the backend.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {loading ? (
        <p className="text-surface-500 text-sm">Loading stats…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {cards.map((c) => (
            <Link key={c.label} to={c.to}>
              <Card hoverable className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-surface-500">{c.label}</p>
                      <p className="text-2xl font-bold text-surface-900 mt-1 tabular-nums">
                        {c.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`${c.color} rounded-lg p-2 text-white`}>
                      <c.icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold text-surface-900">Quick actions</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link className="text-brand-600 hover:underline inline-flex items-center gap-2" to="/hiring/dashboard">
                  <Kanban size={14} /> Review hiring pipeline
                </Link>
              </li>
              <li>
                <Link className="text-brand-600 hover:underline" to="/admin/jobs">
                  Approve / manage jobs
                </Link>
              </li>
              <li>
                <Link className="text-brand-600 hover:underline" to="/admin/users">
                  Manage user roles
                </Link>
              </li>
              <li>
                <Link className="text-brand-600 hover:underline" to="/admin/profile">
                  Edit my profile & password
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-2 text-sm text-surface-600">
            <h2 className="font-semibold text-surface-900">What you can manage</h2>
            <p>
              As <strong className="text-surface-800">admin</strong> you control hiring candidates, hiring roles,
              platform users, jobs, events, courses, and companies. Public visitors only browse approved content.
            </p>
            <p className="text-xs text-surface-400 pt-2">
              Internships in the portal are jobs with type <code className="bg-surface-100 px-1 rounded">internship</code>
              ({stats?.internships ?? 0} in DB).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHomePage;
