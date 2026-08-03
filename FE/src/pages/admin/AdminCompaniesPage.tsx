import React, { useEffect, useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  adminListCompanies,
  adminCreateCompany,
  adminUpdateCompany,
  adminDeleteCompany,
} from '../../services/adminService';

const empty = {
  name: '',
  industry: '',
  location: '',
  openPositions: 0,
  description: '',
  website: '',
  logo: '',
};

const AdminCompaniesPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminListCompanies());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name: form.name,
        industry: form.industry,
        location: form.location,
        openPositions: Number(form.openPositions) || 0,
        description: form.description,
        website: form.website || null,
        logo: form.logo || null,
      };
      if (editId) await adminUpdateCompany(editId, body);
      else await adminCreateCompany(body);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this company?')) return;
    try {
      await adminDeleteCompany(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-surface-500">{items.length} companies</p>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ ...empty }); setShowForm(true); }}>+ Add company</Button>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? <p className="p-6 text-sm text-surface-500">Loading…</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b bg-surface-50">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Industry</th>
                  <th className="px-4 py-2.5 font-medium">Location</th>
                  <th className="px-4 py-2.5 font-medium">Open</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-surface-100">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.industry}</td>
                    <td className="px-4 py-3 text-surface-600">{c.location}</td>
                    <td className="px-4 py-3 tabular-nums">{c.openPositions}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button type="button" className="text-brand-600 text-xs font-medium hover:underline" onClick={() => {
                        setEditId(c.id);
                        setForm({
                          name: c.name || '',
                          industry: c.industry || '',
                          location: c.location || '',
                          openPositions: c.openPositions ?? 0,
                          description: c.description || '',
                          website: c.website || '',
                          logo: c.logo || '',
                        });
                        setShowForm(true);
                      }}>Edit</button>
                      <button type="button" className="text-red-600 text-xs font-medium hover:underline" onClick={() => void onDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-elevated max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">{editId ? 'Edit company' : 'New company'}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required />
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              <Input label="Open positions" type="number" value={String(form.openPositions)} onChange={(e) => setForm({ ...form, openPositions: Number(e.target.value) })} />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea className="w-full border border-surface-300 rounded-md px-3 py-2.5 text-sm min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <Input label="Logo URL" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
              <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesPage;
