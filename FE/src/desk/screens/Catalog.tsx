/**
 * Portal catalog management inside the NxtHike Workspace shell.
 *
 * Jobs, events, courses, companies and hiring-role buckets — same APIs as the
 * old Admin Console, restyled with desk components so everything shares one UX.
 */

import React, { useEffect, useState } from 'react';
import {
  adminListJobs, adminCreateJob, adminUpdateJob, adminDeleteJob,
  adminListEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent,
  adminListCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminListCompanies, adminCreateCompany, adminUpdateCompany, adminDeleteCompany,
  fetchAdminStats,
} from '../../services/adminService';
import { hiringService } from '../../services/hiringService';
import type { RoleMeta } from '../../hiring/types';
import { T } from '../tokens';
import { useDesk } from '../store';
import {
  Banner, Button, EmptyState, ErrorState, Input, Panel, Select,
  SkeletonRows, Textarea, num,
} from '../ui';

/* ------------------------------------------------------------------ */

function useAdminGate() {
  const { caps } = useDesk();
  return caps().admin === true;
}

function ShellGate({ children }: { children: React.ReactNode }) {
  const ok = useAdminGate();
  const { go, session } = useDesk();
  if (!ok) {
    return (
      <div className="pad">
        <EmptyState
          icon="lock"
          title="Admin catalog only"
          body="Portal catalog (jobs, events, courses, companies) is limited to full workspace admins."
          actionLabel="Back to dashboard"
          onAction={() => go((session?.landing as 'home') || 'home')}
        />
      </div>
    );
  }
  return <>{children}</>;
}

function Modal({
  title, onClose, children, footer,
}: {
  title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="modal"
        style={{ width: 'min(520px, calc(100vw - 32px))', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Overview (replaces Admin Overview)                                 *
 * ------------------------------------------------------------------ */

export function CatalogOverviewScreen() {
  return (
    <ShellGate>
      <OverviewInner />
    </ShellGate>
  );
}

function OverviewInner() {
  const { go } = useDesk();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchAdminStats();
        if (!cancelled) setStats(s);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="pad"><SkeletonRows rows={4} /></div>;
  if (error) return <div className="pad"><ErrorState message={error} /></div>;

  const cards = [
    { label: 'Candidates', value: stats?.candidates ?? 0, go: () => go('cands'), icon: 'groups' },
    { label: 'Hiring roles', value: stats?.hiringRoles ?? 0, go: () => go('portalRoles'), icon: 'sell' },
    { label: 'Jobs', value: stats?.jobs ?? 0, go: () => go('portalJobs'), icon: 'work' },
    { label: 'Pending jobs', value: stats?.pendingJobs ?? 0, go: () => go('portalJobs'), icon: 'hourglass_top' },
    { label: 'Events', value: stats?.events ?? 0, go: () => go('portalEvents'), icon: 'event' },
    { label: 'Courses', value: stats?.courses ?? 0, go: () => go('portalCourses'), icon: 'school' },
    { label: 'Companies', value: stats?.companies ?? 0, go: () => go('portalCompanies'), icon: 'apartment' },
    { label: 'Users', value: stats?.users ?? 0, go: () => go('users'), icon: 'manage_accounts' },
  ];

  return (
    <div className="pad">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.01em' }}>Portal catalog</div>
        <div style={{ marginTop: 4, fontSize: 13, color: T.inkMuted }}>
          Manage public site content and hiring buckets in the same workspace as recruiting.
        </div>
      </div>
      <div className="grid-auto">
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            className="card card-hover"
            onClick={c.go}
            style={{ padding: 16, textAlign: 'left', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 12, color: T.inkMuted, fontWeight: 600 }}>{c.label}</div>
            <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>
              {num(c.value)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Jobs                                                              *
 * ------------------------------------------------------------------ */

const jobEmpty = {
  title: '', company: '', location: '', isRemote: false, type: 'full-time',
  category: 'Software', description: '', status: 'approved',
  applicationDeadline: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
};

export function CatalogJobsScreen() {
  return <ShellGate><JobsInner /></ShellGate>;
}

function JobsInner() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...jobEmpty });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminListJobs(1, 100, 'all');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    try {
      const body = { ...form, requirements: [], responsibilities: [] };
      if (editId) await adminUpdateJob(editId, body);
      else await adminCreateJob(body);
      setOpen(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Jobs & internships</div>
          <div style={{ fontSize: 12.5, color: T.inkMuted }}>{num(total)} listings on the public portal</div>
        </div>
        <Button icon="add" onClick={() => { setEditId(null); setForm({ ...jobEmpty }); setOpen(true); }}>Add job</Button>
      </div>
      {error && <div style={{ marginBottom: 12 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
      <Panel title="All jobs" subtitle={loading ? 'Loading…' : `${items.length} on this page`}>
        {loading ? <SkeletonRows rows={6} /> : items.length === 0 ? (
          <EmptyState icon="work" title="No jobs" body="Create the first listing for the public site." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Title</th><th>Company</th><th>Type</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.title}</td>
                    <td>{j.company}</td>
                    <td>{j.type}</td>
                    <td>{j.status}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" style={{ color: T.indigo, fontWeight: 600, marginRight: 10 }} onClick={() => {
                        setEditId(j.id);
                        setForm({
                          title: j.title || '', company: j.company || '', location: j.location || '',
                          isRemote: !!j.isRemote, type: j.type || 'full-time', category: j.category || 'Software',
                          description: j.description || '', status: j.status || 'approved',
                          applicationDeadline: (j.applicationDeadline || '').slice(0, 10) || jobEmpty.applicationDeadline,
                        });
                        setOpen(true);
                      }}>Edit</button>
                      <button type="button" style={{ color: T.red, fontWeight: 600 }} onClick={async () => {
                        if (!confirm('Delete this job?')) return;
                        try { await adminDeleteJob(j.id); await load(); }
                        catch (e) { setError((e as Error).message); }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {open && (
        <Modal
          title={editId ? 'Edit job' : 'New job'}
          onClose={() => setOpen(false)}
          footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void save()}>Save</Button></>}
        >
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </Select>
          </Field>
          <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
          <Field label="Deadline"><Input type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Events                                                            *
 * ------------------------------------------------------------------ */

const eventEmpty = {
  title: '', description: '', type: 'webinar',
  date: new Date().toISOString().slice(0, 10), time: '10:00',
  location: '', isOnline: true, organizer: 'NxtHike', link: '',
};

export function CatalogEventsScreen() {
  return <ShellGate><EventsInner /></ShellGate>;
}

function EventsInner() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...eventEmpty });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminListEvents(1, 100);
      setItems(data.items || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    try {
      const body = { ...form, agenda: [], speakers: [], sponsors: [] };
      if (editId) await adminUpdateEvent(editId, body);
      else await adminCreateEvent(body);
      setOpen(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Events</div>
          <div style={{ fontSize: 12.5, color: T.inkMuted }}>{num(items.length)} events on the portal</div>
        </div>
        <Button icon="add" onClick={() => { setEditId(null); setForm({ ...eventEmpty }); setOpen(true); }}>Add event</Button>
      </div>
      {error && <div style={{ marginBottom: 12 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
      <Panel title="All events">
        {loading ? <SkeletonRows rows={5} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Title</th><th>Type</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600 }}>{ev.title}</td>
                    <td>{ev.type}</td>
                    <td>{ev.date} {ev.time}</td>
                    <td>
                      <button type="button" style={{ color: T.indigo, fontWeight: 600, marginRight: 10 }} onClick={() => {
                        setEditId(ev.id);
                        setForm({
                          title: ev.title || '', description: ev.description || '', type: ev.type || 'webinar',
                          date: (ev.date || '').slice(0, 10), time: ev.time || '10:00',
                          location: ev.location || '', isOnline: !!ev.isOnline,
                          organizer: ev.organizer || 'NxtHike', link: ev.link || '',
                        });
                        setOpen(true);
                      }}>Edit</button>
                      <button type="button" style={{ color: T.red, fontWeight: 600 }} onClick={async () => {
                        if (!confirm('Delete this event?')) return;
                        try { await adminDeleteEvent(ev.id); await load(); }
                        catch (e) { setError((e as Error).message); }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {open && (
        <Modal title={editId ? 'Edit event' : 'New event'} onClose={() => setOpen(false)}
          footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void save()}>Save</Button></>}>
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="hackathon">Hackathon</option>
              <option value="networking">Networking</option>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Time"><Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Organizer"><Input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></Field>
          <Field label="Link"><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Courses                                                           *
 * ------------------------------------------------------------------ */

const courseEmpty = {
  title: '', description: '', instructor: '', category: 'General',
  level: 'beginner', duration: '', price: 0, discount: 0, image: '',
};

export function CatalogCoursesScreen() {
  return <ShellGate><CoursesInner /></ShellGate>;
}

function CoursesInner() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...courseEmpty });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminListCourses(1, 100);
      setItems(data.items || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    try {
      const body = {
        ...form,
        price: Number(form.price) || 0,
        discount: Number(form.discount) || 0,
        whatYouWillLearn: [],
        prerequisites: [],
        curriculum: [],
      };
      if (editId) await adminUpdateCourse(editId, body);
      else await adminCreateCourse(body);
      setOpen(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Courses</div>
          <div style={{ fontSize: 12.5, color: T.inkMuted }}>{num(items.length)} courses on the portal</div>
        </div>
        <Button icon="add" onClick={() => { setEditId(null); setForm({ ...courseEmpty }); setOpen(true); }}>Add course</Button>
      </div>
      {error && <div style={{ marginBottom: 12 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
      <Panel title="All courses">
        {loading ? <SkeletonRows rows={5} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Title</th><th>Instructor</th><th>Level</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>{c.instructor}</td>
                    <td>{c.level}</td>
                    <td>
                      <button type="button" style={{ color: T.indigo, fontWeight: 600, marginRight: 10 }} onClick={() => {
                        setEditId(c.id);
                        setForm({
                          title: c.title || '', description: c.description || '', instructor: c.instructor || '',
                          category: c.category || 'General', level: c.level || 'beginner',
                          duration: c.duration || '', price: c.price ?? 0, discount: c.discount ?? 0, image: c.image || '',
                        });
                        setOpen(true);
                      }}>Edit</button>
                      <button type="button" style={{ color: T.red, fontWeight: 600 }} onClick={async () => {
                        if (!confirm('Delete this course?')) return;
                        try { await adminDeleteCourse(c.id); await load(); }
                        catch (e) { setError((e as Error).message); }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {open && (
        <Modal title={editId ? 'Edit course' : 'New course'} onClose={() => setOpen(false)}
          footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void save()}>Save</Button></>}>
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Instructor"><Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} /></Field>
          <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Level">
            <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </Field>
          <Field label="Duration"><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
          <Field label="Price"><Input type="number" value={String(form.price)} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Companies                                                         *
 * ------------------------------------------------------------------ */

const companyEmpty = {
  name: '', logo: '', industry: '', location: '', openPositions: 0, description: '', website: '',
};

export function CatalogCompaniesScreen() {
  return <ShellGate><CompaniesInner /></ShellGate>;
}

function CompaniesInner() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...companyEmpty });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      setItems(await adminListCompanies());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    try {
      const body = { ...form, openPositions: Number(form.openPositions) || 0 };
      if (editId) await adminUpdateCompany(editId, body);
      else await adminCreateCompany(body);
      setOpen(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Companies</div>
          <div style={{ fontSize: 12.5, color: T.inkMuted }}>{num(items.length)} companies on the portal</div>
        </div>
        <Button icon="add" onClick={() => { setEditId(null); setForm({ ...companyEmpty }); setOpen(true); }}>Add company</Button>
      </div>
      {error && <div style={{ marginBottom: 12 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
      <Panel title="Directory">
        {loading ? <SkeletonRows rows={5} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Name</th><th>Industry</th><th>Location</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.industry}</td>
                    <td>{c.location}</td>
                    <td>
                      <button type="button" style={{ color: T.indigo, fontWeight: 600, marginRight: 10 }} onClick={() => {
                        setEditId(c.id);
                        setForm({
                          name: c.name || '', logo: c.logo || '', industry: c.industry || '',
                          location: c.location || '', openPositions: c.openPositions ?? 0,
                          description: c.description || '', website: c.website || '',
                        });
                        setOpen(true);
                      }}>Edit</button>
                      <button type="button" style={{ color: T.red, fontWeight: 600 }} onClick={async () => {
                        if (!confirm('Delete this company?')) return;
                        try { await adminDeleteCompany(c.id); await load(); }
                        catch (e) { setError((e as Error).message); }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {open && (
        <Modal title={editId ? 'Edit company' : 'New company'} onClose={() => setOpen(false)}
          footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void save()}>Save</Button></>}>
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Industry"><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Website"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
          <Field label="Open positions"><Input type="number" value={String(form.openPositions)} onChange={(e) => setForm({ ...form, openPositions: Number(e.target.value) })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Hiring role buckets (portal/hiring roles, not persona matrix)       *
 * ------------------------------------------------------------------ */

const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `role_${Date.now()}`;

export function CatalogHiringRolesScreen() {
  return <ShellGate><HiringRolesInner /></ShellGate>;
}

function HiringRolesInner() {
  const [roles, setRoles] = useState<RoleMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      setRoles(await hiringService.listRoles());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hiringService.createRole({
        id: id.trim() || slugify(name),
        name: name.trim(),
        description: description.trim() || null,
        is_active: true,
        sort_order: roles.length,
      });
      setName(''); setId(''); setDescription('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="pad">
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Hiring roles</div>
        <div style={{ fontSize: 12.5, color: T.inkMuted }}>
          Buckets used for candidates (e.g. ReactJS Internship, Digital Marketing). Separate from persona permissions under Admin → Roles.
        </div>
      </div>
      {error && <div style={{ marginBottom: 12 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
      <div className="grid-panels">
        <Panel title="Create role">
          <form onSubmit={(e) => void onCreate(e)}>
            <Field label="Display name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="Id (slug)"><Input value={id} onChange={(e) => setId(e.target.value)} placeholder="auto from name" /></Field>
            <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></Field>
            <Button type="submit" icon="add">Create role</Button>
          </form>
        </Panel>
        <Panel title="Existing roles" subtitle={loading ? 'Loading…' : `${roles.length} roles`}>
          {loading ? <SkeletonRows rows={5} /> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr><th>Name</th><th>Id</th><th>Count</th><th>Actions</th></tr></thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{r.id}</td>
                      <td>{r.count ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          style={{ color: T.red, fontWeight: 600 }}
                          onClick={async () => {
                            if (!confirm(`Delete “${r.name}”? Only empty roles can be deleted.`)) return;
                            try {
                              await hiringService.deleteRole(r.id);
                              await load();
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
