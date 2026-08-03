import React, { useEffect, useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import { listUsers, updateUserRole } from '../../services/authService';
import type { User } from '../../types';
import { useAuthStore } from '../../store/authStore';

const AdminUsersPage: React.FC = () => {
  const me = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRole = async (id: string, role: User['role']) => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await updateUserRole(id, role);
      setUsers((list) => list.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-surface-900">Users</h2>
            <p className="text-xs text-surface-500">Promote or demote account roles (student / employer / admin)</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm text-brand-600 hover:underline"
          >
            Refresh
          </button>
        </div>
        {error && <div className="mx-4 mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
        {loading ? (
          <p className="p-6 text-sm text-surface-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-100 bg-surface-50">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50/80">
                    <td className="px-4 py-3 font-medium text-surface-900">
                      {u.firstName} {u.lastName}
                      {u.id === me?.id && (
                        <span className="ml-2 text-xs text-brand-600 font-normal">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-surface-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="border border-surface-200 rounded-md px-2 py-1.5 text-sm bg-white"
                        value={u.role}
                        disabled={busyId === u.id}
                        onChange={(e) => void onRole(u.id, e.target.value as User['role'])}
                      >
                        <option value="student">student</option>
                        <option value="employer">employer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-surface-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="p-6 text-sm text-surface-500">No users found.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersPage;
