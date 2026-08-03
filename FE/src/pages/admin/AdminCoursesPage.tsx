import React, { useEffect, useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminListCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse } from '../../services/adminService';

const empty = {
  title: '',
  description: '',
  instructor: '',
  category: 'Web Development',
  level: 'beginner',
  duration: '4 weeks',
  priceAmount: 0,
};

const AdminCoursesPage: React.FC = () => {
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
      const data = await adminListCourses(1, 100);
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
      const body = {
        title: form.title,
        description: form.description,
        instructor: form.instructor,
        category: form.category,
        level: form.level,
        duration: form.duration,
        price: { amount: Number(form.priceAmount) || 0, currency: 'USD' },
        whatYouWillLearn: [],
        prerequisites: [],
        curriculum: [],
        reviews: [],
      };
      if (editId) await adminUpdateCourse(editId, body);
      else await adminCreateCourse(body);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      await adminDeleteCourse(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-surface-500">{items.length} courses</p>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ ...empty }); setShowForm(true); }}>+ Add course</Button>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? <p className="p-6 text-sm text-surface-500">Loading…</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b bg-surface-50">
                  <th className="px-4 py-2.5 font-medium">Title</th>
                  <th className="px-4 py-2.5 font-medium">Instructor</th>
                  <th className="px-4 py-2.5 font-medium">Level</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-surface-100">
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-surface-600">{c.instructor}</td>
                    <td className="px-4 py-3">{c.level}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button type="button" className="text-brand-600 text-xs font-medium hover:underline" onClick={() => {
                        setEditId(c.id);
                        setForm({
                          title: c.title || '',
                          description: c.description || '',
                          instructor: c.instructor || '',
                          category: c.category || 'Web Development',
                          level: c.level || 'beginner',
                          duration: c.duration || '4 weeks',
                          priceAmount: c.price?.amount ?? 0,
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
            <h3 className="font-semibold mb-3">{editId ? 'Edit course' : 'New course'}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea className="w-full border border-surface-300 rounded-md px-3 py-2.5 text-sm min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <Input label="Instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} required />
              <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Level</label>
                  <select className="w-full border border-surface-300 rounded-md px-3 py-2.5 text-sm" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    <option value="beginner">beginner</option>
                    <option value="intermediate">intermediate</option>
                    <option value="advanced">advanced</option>
                  </select>
                </div>
                <Input label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
              </div>
              <Input label="Price (USD)" type="number" value={String(form.priceAmount)} onChange={(e) => setForm({ ...form, priceAmount: Number(e.target.value) })} />
              <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesPage;
