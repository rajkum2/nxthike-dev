import React, { useEffect, useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  adminListJobs,
  adminCreateJob,
  adminUpdateJob,
  adminDeleteJob,
} from '../../services/adminService';

const emptyForm = {
  title: '',
  company: '',
  location: '',
  isRemote: false,
  type: 'full-time',
  category: 'Software',
  description: '',
  applicationDeadline: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  status: 'approved',
};

const AdminJobsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListJobs(1, 100, 'all');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (job: any) => {
    setEditId(job.id);
    setForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      isRemote: !!job.isRemote,
      type: job.type || 'full-time',
      category: job.category || 'Software',
      description: job.description || '',
      applicationDeadline: (job.applicationDeadline || '').slice(0, 10),
      status: job.status || 'approved',
    });
    setShowForm(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const body = {
        ...form,
        requirements: [],
        responsibilities: [],
      };
      if (editId) await adminUpdateJob(editId, body);
      else await adminCreateJob(body);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    try {
      await adminDeleteJob(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const setStatus = async (job: any, status: string) => {
    try {
      await adminUpdateJob(job.id, { status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-surface-500">{total} jobs (all statuses)</p>
        <Button size="sm" onClick={openCreate}>
          + Add job
        </Button>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="p-6 text-sm text-surface-500">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b bg-surface-50">
                  <th className="px-4 py-2.5 font-medium">Title</th>
                  <th className="px-4 py-2.5 font-medium">Company</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((j) => (
                  <tr key={j.id} className="border-b border-surface-100">
                    <td className="px-4 py-3 font-medium">{j.title}</td>
                    <td className="px-4 py-3 text-surface-600">{j.company}</td>
                    <td className="px-4 py-3">{j.type}</td>
                    <td className="px-4 py-3">
                      <select
                        className="border border-surface-200 rounded-md px-2 py-1 text-xs"
                        value={j.status}
                        onChange={(e) => void setStatus(j, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                        <option value="closed">closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button type="button" className="text-brand-600 text-xs font-medium hover:underline" onClick={() => openEdit(j)}>
                        Edit
                      </button>
                      <button type="button" className="text-red-600 text-xs font-medium hover:underline" onClick={() => void onDelete(j.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && items.length === 0 && <p className="p-6 text-sm text-surface-500">No jobs yet.</p>}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-elevated max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">{editId ? 'Edit job' : 'New job'}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Type</label>
                  <select className="w-full border border-surface-300 rounded-md px-3 py-2.5 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="internship">internship</option>
                    <option value="full-time">full-time</option>
                    <option value="part-time">part-time</option>
                    <option value="contract">contract</option>
                  </select>
                </div>
                <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea className="w-full border border-surface-300 rounded-md px-3 py-2.5 text-sm min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <Input label="Deadline" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} /> Remote
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
