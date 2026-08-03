import React, { useEffect, useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { hiringService } from '../../services/hiringService';
import type { RoleMeta } from '../../hiring/types';

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || `role_${Date.now()}`;

const AdminHiringRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState<RoleMeta | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRoles(await hiringService.listRoles());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const roleId = id.trim() || slugify(name);
      await hiringService.createRole({
        id: roleId,
        name: name.trim(),
        description: description.trim() || null,
        is_active: true,
        sort_order: roles.length,
      });
      setName('');
      setId('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    try {
      await hiringService.updateRole(editing.id, {
        name: editing.name,
        description: editing.description ?? null,
        is_active: editing.is_active !== false,
        sort_order: editing.sort_order ?? 0,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onDelete = async (role: RoleMeta) => {
    if (!confirm(`Delete role “${role.name}”? Only empty roles can be deleted.`)) return;
    setError(null);
    try {
      await hiringService.deleteRole(role.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold text-surface-900 mb-1">Add hiring role</h2>
          <p className="text-xs text-surface-500 mb-4">
            These are job openings in the Hiring CRM (e.g. AI Agent Development), not user permission roles.
          </p>
          <form onSubmit={onCreate} className="grid sm:grid-cols-2 gap-3">
            <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="ID (slug)"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="auto from name if empty"
            />
            <div className="sm:col-span-2">
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Button type="submit">Create role</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-surface-100 font-semibold text-surface-900">
            All hiring roles {loading ? '' : `(${roles.length})`}
          </div>
          {loading ? (
            <p className="p-6 text-sm text-surface-500">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-surface-500 border-b bg-surface-50">
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">ID</th>
                    <th className="px-4 py-2.5 font-medium">Candidates</th>
                    <th className="px-4 py-2.5 font-medium">Active</th>
                    <th className="px-4 py-2.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id} className="border-b border-surface-100">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-surface-500 font-mono text-xs">{r.id}</td>
                      <td className="px-4 py-3 tabular-nums">{r.count ?? 0}</td>
                      <td className="px-4 py-3">{r.is_active === false ? 'No' : 'Yes'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-brand-600 hover:underline text-xs font-medium"
                            onClick={() => setEditing({ ...r })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:underline text-xs font-medium"
                            onClick={() => void onDelete(r)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-elevated max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Edit role</h3>
            <form onSubmit={onSaveEdit} className="space-y-3">
              <Input
                label="Name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
              <Input
                label="Description"
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm text-surface-700">
                <input
                  type="checkbox"
                  checked={editing.is_active !== false}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                Active
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHiringRolesPage;
