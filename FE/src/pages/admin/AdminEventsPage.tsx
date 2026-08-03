import React, { useEffect, useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminListEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent } from '../../services/adminService';

const empty = {
  title: '',
  description: '',
  type: 'webinar',
  date: new Date().toISOString().slice(0, 10),
  time: '10:00',
  location: '',
  isOnline: true,
  organizer: 'NxtHike',
  link: '',
};

const AdminEventsPage: React.FC = () => {
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
      const data = await adminListEvents(1, 100);
      setItems(data.items || []);
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
      const body = { ...form, agenda: [], speakers: [], sponsors: [] };
      if (editId) await adminUpdateEvent(editId, body);
      else await adminCreateEvent(body);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await adminDeleteEvent(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-surface-500">{items.length} events</p>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ ...empty }); setShowForm(true); }}>+ Add event</Button>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? <p className="p-6 text-sm text-surface-500">Loading…</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b bg-surface-50">
                  <th className="px-4 py-2.5 font-medium">Title</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((ev) => (
                  <tr key={ev.id} className="border-b border-surface-100">
                    <td className="px-4 py-3 font-medium">{ev.title}</td>
                    <td className="px-4 py-3">{ev.type}</td>
                    <td className="px-4 py-3 text-surface-600">{ev.date} {ev.time}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button type="button" className="text-brand-600 text-xs font-medium hover:underline" onClick={() => {
                        setEditId(ev.id);
                        setForm({
                          title: ev.title || '',
                          description: ev.description || '',
                          type: ev.type || 'webinar',
                          date: (ev.date || '').slice(0, 10),
                          time: ev.time || '10:00',
                          location: ev.location || '',
                          isOnline: !!ev.isOnline,
                          organizer: ev.organizer || 'NxtHike',
                          link: ev.link || '',
                        });
                        setShowForm(true);
                      }}>Edit</button>
                      <button type="button" className="text-red-600 text-xs font-medium hover:underline" onClick={() => void onDelete(ev.id)}>Delete</button>
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
            <h3 className="font-semibold mb-3">{editId ? 'Edit event' : 'New event'}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea className="w-full border border-surface-300 rounded-md px-3 py-2.5 text-sm min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Type</label>
                  <select className="w-full border border-surface-300 rounded-md px-3 py-2.5 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="webinar">webinar</option>
                    <option value="workshop">workshop</option>
                    <option value="hackathon">hackathon</option>
                    <option value="networking">networking</option>
                  </select>
                </div>
                <Input label="Organizer" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                <Input label="Time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input label="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isOnline} onChange={(e) => setForm({ ...form, isOnline: e.target.checked })} /> Online</label>
              <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;
