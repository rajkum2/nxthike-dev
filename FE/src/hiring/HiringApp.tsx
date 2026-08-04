import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutDashboard,
  Kanban,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  Users,
  X,
  RefreshCw,
  Edit3,
  ExternalLink,
  StarOff,
  Moon,
  Sun,
  Menu,
  UserCheck,
  Sparkles,
  Info,
  Eye,
  FileText,
} from 'lucide-react';
import { useStore, applyTheme } from './store';
import type { Candidate, PipelineStatus, ViewMode } from './types';
import { STATUS_COLORS, STATUS_LABELS } from './types';
import { exportToExcel, filterAndSort, parseImportedExcel, scoreSummary, s, uniqueCities } from './utils';
import './hiring.css';

function StatusBadge({ status }: { status: PipelineStatus }) {
  return (
    <span className="badge" style={{ background: STATUS_COLORS[status] }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function isPdfUrl(url: string): boolean {
  const u = url.toLowerCase().split('?')[0];
  return u.endsWith('.pdf') || u.includes('/resumes/');
}

function ResumeViewerModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const pdf = isPdfUrl(url);
  return (
    <div className="modal-backdrop resume-viewer-backdrop" onClick={onClose}>
      <div
        className="modal resume-viewer-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Resume viewer"
      >
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Resume</h3>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {title}
            </div>
          </div>
          <div className="toolbar">
            <a className="btn" href={url} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Open tab
            </a>
            <a className="btn" href={url} download>
              <Download size={14} /> Download
            </a>
            <button type="button" className="btn ghost" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="resume-viewer-body">
          {pdf ? (
            <iframe title={`Resume — ${title}`} src={url} className="resume-viewer-frame" />
          ) : (
            <div className="resume-viewer-fallback">
              <FileText size={40} />
              <p>This file type can’t be previewed inline.</p>
              <a className="btn primary" href={url} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> Open document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const VALID_VIEWS: ViewMode[] = ['dashboard', 'candidates', 'pipeline'];

export default function HiringApp({ initialView }: { initialView?: ViewMode }) {
  const navigate = useNavigate();
  const store = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resumeViewer, setResumeViewer] = useState<{ url: string; title: string } | null>(null);
  const {
    roles,
    loading,
    error,
    activeRoleId,
    view,
    filters,
    page,
    pageSize,
    sortKey,
    sortDir,
    selectedIds,
    detailId,
    formOpen,
    formMode,
    formCandidate,
    theme,
    apiMode,
    total,
    totalPages,
    stats: storeStats,
  } = store;

  const goView = (v: ViewMode) => {
    store.setView(v);
    navigate(`/hiring/${v}`);
    setSidebarOpen(false);
  };

  useEffect(() => {
    void store.init();
  }, []);

  useEffect(() => {
    if (initialView && VALID_VIEWS.includes(initialView) && initialView !== view) {
      store.setView(initialView);
    }
  }, [initialView]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const raw = store.getCandidates();
  // API already filters/sorts/paginates; seed fallback filters client-side
  const filtered = useMemo(() => {
    if (apiMode) return raw;
    return filterAndSort(raw, filters, sortKey, sortDir);
  }, [raw, filters, sortKey, sortDir, apiMode]);

  const effectiveTotal = apiMode ? total : filtered.length;
  const effectiveTotalPages = apiMode
    ? Math.max(1, totalPages)
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, effectiveTotalPages);
  const pageItems = apiMode
    ? filtered
    : filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);
  const cities = useMemo(() => uniqueCities(raw), [raw]);
  const detail = detailId ? store.getCandidate(detailId) : null;

  const stats = useMemo(() => {
    if (storeStats) return storeStats;
    const byStatus: Record<string, number> = {};
    let starred = 0;
    let withExp = 0;
    for (const c of raw) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      if (c.starred) starred += 1;
      if (s(c.hasWorkExperience).toLowerCase() === 'yes') withExp += 1;
    }
    return { total: raw.length, starred, withExp, byStatus };
  }, [raw, storeStats]);

  const activeRoleName =
    activeRoleId === 'all' ? 'All Roles' : roles.find((r) => r.id === activeRoleId)?.name || 'Candidates';

  const fileRef = useRef<HTMLInputElement>(null);

  const onImport = async (file: File) => {
    try {
      const list = await parseImportedExcel(file);
      await store.importCandidates(list);
      alert(`Imported ${list.length} candidates`);
    } catch (e) {
      alert(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="hiring-tracker" data-theme={theme}>
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden />
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon" aria-hidden>
            <Briefcase size={20} strokeWidth={2.25} />
          </div>
          <div>
            <h1>Hiring CRM</h1>
            <p>Candidate applications</p>
          </div>
        </div>

        <div className="nav-section">
          <h3>Views</h3>
          <button type="button" className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => goView('dashboard')}>
            <span className="nav-label"><LayoutDashboard size={16} /> Dashboard</span>
          </button>
          <button type="button" className={`nav-btn ${view === 'candidates' ? 'active' : ''}`} onClick={() => goView('candidates')}>
            <span className="nav-label"><Users size={16} /> Candidates</span>
          </button>
          <button type="button" className={`nav-btn ${view === 'pipeline' ? 'active' : ''}`} onClick={() => goView('pipeline')}>
            <span className="nav-label"><Kanban size={16} /> Pipeline</span>
          </button>
        </div>

        <div className="nav-section">
          <h3>Roles</h3>
          <button
            type="button"
            className={`nav-btn ${activeRoleId === 'all' ? 'active' : ''}`}
            onClick={() => { store.setActiveRole('all'); setSidebarOpen(false); }}
          >
            <span className="nav-label">All roles</span>
            <span className="count">{roles.reduce((a, r) => a + r.count, 0)}</span>
          </button>
          {roles.map((r) => (
            <button
              type="button"
              key={r.id}
              className={`nav-btn ${activeRoleId === r.id ? 'active' : ''}`}
              onClick={() => { store.setActiveRole(r.id); setSidebarOpen(false); }}
              title={r.name}
            >
              <span className="nav-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
              <span className="count">{r.count}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <h3>Data</h3>
          <button type="button" className="nav-btn" onClick={() => void store.loadAllRoles()}>
            <span className="nav-label"><RefreshCw size={16} /> Load all roles</span>
          </button>
          <button type="button" className="nav-btn" onClick={() => store.resetLocalChanges()}>
            <span className="nav-label">Reset local edits</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <Link to="/admin" className="text-inherit no-underline hover:underline">
            ← Admin console
          </Link>
          <div className="mt-1">NxtHike · Hiring workspace</div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn btn-icon mobile-menu-btn"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <h2>{activeRoleName}</h2>
              <div className="sub">
                {loading
                  ? 'Loading…'
                  : (
                    <>
                      <span>{pageItems.length.toLocaleString()} on page</span>
                      <span aria-hidden>·</span>
                      <span>{effectiveTotal.toLocaleString()} total</span>
                    </>
                  )}
                <span className={`mode-pill ${apiMode ? 'api' : 'seed'}`}>
                  {apiMode ? 'API' : 'Seed fallback'}
                </span>
                {error ? <span className="muted">· {error}</span> : null}
              </div>
            </div>
          </div>
          <div className="toolbar">
            <button
              type="button"
              className="btn"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => store.toggleTheme()}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hide-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button type="button" className="btn primary" onClick={() => store.openCreate()}>
              <Plus size={16} /> <span className="hide-sm">Add</span>
            </button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> <span className="hide-sm">Import Excel</span>
            </button>
            <button type="button" className="btn" onClick={() => exportToExcel(filtered, `candidates_${activeRoleId}.xlsx`)}>
              <Download size={16} /> <span className="hide-sm">Export</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        <div className="content">
          {error && <div className="alert">{error}</div>}

          {view === 'dashboard' && (
            <>
              <div className="cards">
                <div className="card stat">
                  <div className="stat-top">
                    <div className="label">Candidates</div>
                    <div className="stat-icon"><Users size={16} /></div>
                  </div>
                  <div className="value">{stats.total.toLocaleString()}</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">
                    <div className="label">With experience</div>
                    <div className="stat-icon success"><Briefcase size={16} /></div>
                  </div>
                  <div className="value">{stats.withExp.toLocaleString()}</div>
                  <div className="hint">
                    {stats.total ? Math.round((stats.withExp / stats.total) * 100) : 0}% of pool
                  </div>
                </div>
                <div className="card stat">
                  <div className="stat-top">
                    <div className="label">Starred</div>
                    <div className="stat-icon warning"><Star size={16} /></div>
                  </div>
                  <div className="value">{stats.starred.toLocaleString()}</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">
                    <div className="label">Shortlisted</div>
                    <div className="stat-icon purple"><UserCheck size={16} /></div>
                  </div>
                  <div className="value">{(stats.byStatus.shortlisted || 0).toLocaleString()}</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">
                    <div className="label">Interview</div>
                    <div className="stat-icon orange"><Sparkles size={16} /></div>
                  </div>
                  <div className="value">{(stats.byStatus.interview || 0).toLocaleString()}</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">
                    <div className="label">Hired</div>
                    <div className="stat-icon green"><UserCheck size={16} /></div>
                  </div>
                  <div className="value">{(stats.byStatus.hired || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Pipeline breakdown</h3>
                  <button type="button" className="btn ghost" onClick={() => goView('pipeline')}>
                    <Kanban size={14} /> Open board
                  </button>
                </div>
                <div className="panel-body">
                  <div className="cards" style={{ marginBottom: 0 }}>
                    {(Object.keys(STATUS_LABELS) as PipelineStatus[]).map((st) => (
                      <div
                        className="card pipeline-stat"
                        key={st}
                        style={{ ['--accent' as string]: STATUS_COLORS[st] }}
                      >
                        <div className="label">{STATUS_LABELS[st]}</div>
                        <div className="value" style={{ color: STATUS_COLORS[st] }}>
                          {(stats.byStatus[st] || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="tip-banner">
                    <Info size={16} className="tip-icon" />
                    <div>
                      Open <strong>Candidates</strong> to search, filter, and edit applications.
                      {apiMode
                        ? ' Changes sync to the server (API).'
                        : ' API is offline — edits are stored locally until the backend is available.'}
                      {' '}Use <strong>Export</strong> for an Excel of the current filtered list.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {view === 'pipeline' && (
            <div className="pipeline">
              {(Object.keys(STATUS_LABELS) as PipelineStatus[]).map((st) => {
                const col = filtered.filter((c) => c.status === st).slice(0, 40);
                const colTotal = filtered.filter((c) => c.status === st).length;
                return (
                  <div
                    className="pipeline-col"
                    key={st}
                    style={{ ['--col-accent' as string]: STATUS_COLORS[st] }}
                  >
                    <h4>
                      <span style={{ color: STATUS_COLORS[st] }}>{STATUS_LABELS[st]}</span>
                      <span className="count-pill">{colTotal}</span>
                    </h4>
                    {col.map((c) => (
                      <div className="pipe-card" key={c.id} onClick={() => store.openDetail(c.id)}>
                        <div className="name">
                          {c.name || 'Unnamed'}
                          {c.starred && <Star size={12} className="star" fill="currentColor" />}
                        </div>
                        <div className="meta">{c.city || '—'} · {c.latestRole || c.degree || '—'}</div>
                      </div>
                    ))}
                    {colTotal === 0 && (
                      <div className="pipeline-empty">No candidates in this stage</div>
                    )}
                    {colTotal > 40 && (
                      <div className="pipeline-empty">+{colTotal - 40} more — open Candidates</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'candidates' && (
            <div className="panel">
              <div className="filters">
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--muted)' }} />
                  <input
                    className="input"
                    style={{ width: '100%', paddingLeft: 30 }}
                    placeholder="Search name, email, skills, company…"
                    value={filters.search}
                    onChange={(e) => store.setFilters({ search: e.target.value })}
                  />
                </div>
                <select className="select" value={filters.status} onChange={(e) => store.setFilters({ status: e.target.value as PipelineStatus | 'all' })}>
                  <option value="all">All statuses</option>
                  {(Object.keys(STATUS_LABELS) as PipelineStatus[]).map((st) => (
                    <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                  ))}
                </select>
                <select className="select" value={filters.city} onChange={(e) => store.setFilters({ city: e.target.value })}>
                  <option value="">All cities</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="select" value={filters.experience} onChange={(e) => store.setFilters({ experience: e.target.value as 'all' | 'yes' | 'no' })}>
                  <option value="all">Any experience</option>
                  <option value="yes">Has experience</option>
                  <option value="no">No experience</option>
                </select>
                <select className="select" value={filters.aiMatch} onChange={(e) => store.setFilters({ aiMatch: e.target.value })}>
                  <option value="">Any AI match</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
                <div className="toolbar">
                  <button className={`btn ${filters.starredOnly ? 'primary' : ''}`} onClick={() => store.setFilters({ starredOnly: !filters.starredOnly })}>
                    <Star size={14} /> Starred
                  </button>
                  <button className={`btn ${filters.hasNotes ? 'primary' : ''}`} onClick={() => store.setFilters({ hasNotes: !filters.hasNotes })}>
                    Notes
                  </button>
                </div>
              </div>

              {selectedIds.size > 0 && (
                <div className="toolbar" style={{ padding: 10, borderBottom: '1px solid var(--border)' }}>
                  <span className="muted">{selectedIds.size} selected</span>
                  <select
                    className="select"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        store.bulkStatus(e.target.value as PipelineStatus);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Set status…</option>
                    {(Object.keys(STATUS_LABELS) as PipelineStatus[]).map((st) => (
                      <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                    ))}
                  </select>
                  <button className="btn danger" onClick={() => { if (confirm(`Delete ${selectedIds.size} candidates?`)) store.deleteSelected(); }}>
                    <Trash2 size={14} /> Delete
                  </button>
                  <button className="btn ghost" onClick={() => store.clearSelection()}>Clear</button>
                </div>
              )}

              <div className="table-wrap">
                {loading && pageItems.length === 0 ? (
                  <div className="loading">Loading candidates…</div>
                ) : pageItems.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><Users size={22} /></div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>No candidates match</div>
                    <div>Try another role or clear filters.</div>
                  </div>
                ) : (
                  <table className="candidates">
                    <thead>
                      <tr>
                        <th style={{ width: 36 }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={pageItems.length > 0 && pageItems.every((c) => selectedIds.has(c.id))}
                            onChange={(e) => {
                              if (e.target.checked) store.selectAllVisible(pageItems.map((c) => c.id));
                              else store.clearSelection();
                            }}
                          />
                        </th>
                        {[
                          ['name', 'Name'],
                          ['city', 'City'],
                          ['status', 'Status'],
                          ['aiResumeMatch', 'AI Match'],
                          ['hasWorkExperience', 'Exp'],
                          ['experienceDuration', 'Exp duration'],
                          ['latestRole', 'Latest role'],
                          ['companies', 'Companies'],
                          ['institute', 'Institute'],
                        ].map(([key, label]) => (
                          <th key={key} onClick={() => store.setSort(key)}>
                            {label}{sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                          </th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((c) => (
                        <tr
                          key={c.id}
                          className={selectedIds.has(c.id) ? 'selected' : ''}
                          onClick={() => store.openDetail(c.id)}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => store.toggleSelect(c.id)} />
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                type="button"
                                className={`star-btn ${c.starred ? 'on' : ''}`}
                                title={c.starred ? 'Unstar candidate' : 'Star candidate'}
                                aria-label={c.starred ? 'Unstar' : 'Star'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  store.toggleStar(c.id);
                                }}
                              >
                                {c.starred ? <Star size={15} className="star" fill="currentColor" /> : <Star size={15} />}
                              </button>
                              <span>{c.name || '—'}</span>
                            </div>
                            <div className="muted" style={{ fontSize: 12, paddingLeft: 24 }}>{c.email || c.phone || ''}</div>
                          </td>
                          <td>{c.city || '—'}</td>
                          <td><StatusBadge status={c.status} /></td>
                          <td>{c.aiResumeMatch || '—'}</td>
                          <td>{c.hasWorkExperience || '—'}</td>
                          <td className="muted">{c.experienceDuration || '—'}</td>
                          <td>
                            <div>{c.latestRole || '—'}</div>
                            <div className="muted" style={{ fontSize: 12 }}>{c.latestCompany || ''}</div>
                          </td>
                          <td style={{ maxWidth: 180 }} className="muted">{s(c.companies).slice(0, 80) || '—'}</td>
                          <td style={{ maxWidth: 160 }} className="muted">{s(c.institute).slice(0, 60) || '—'}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="toolbar">
                              {(c.resumeLink || c.downloadLink) && (
                                <button
                                  type="button"
                                  className="btn ghost"
                                  title="View resume"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = c.resumeLink || c.downloadLink!;
                                    setResumeViewer({ url, title: c.name || c.pdfFile || 'Candidate' });
                                  }}
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                className={`btn ghost star-action ${c.starred ? 'on' : ''}`}
                                title={c.starred ? 'Unstar' : 'Star'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  store.toggleStar(c.id);
                                }}
                              >
                                {c.starred ? <Star size={14} className="star" fill="currentColor" /> : <StarOff size={14} />}
                              </button>
                              <button
                                type="button"
                                className="btn ghost"
                                title="Edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  store.openEdit(c);
                                }}
                              >
                                <Edit3 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="pagination">
                <span>
                  Page {pageSafe} / {effectiveTotalPages} · {effectiveTotal} results
                </span>
                <div className="toolbar">
                  <button className="btn" disabled={pageSafe <= 1} onClick={() => store.setPage(pageSafe - 1)}><ChevronLeft size={16} /></button>
                  <button className="btn" disabled={pageSafe >= effectiveTotalPages} onClick={() => store.setPage(pageSafe + 1)}><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {detail && (
        <>
          <div className="drawer-backdrop" onClick={() => store.openDetail(null)} />
          <aside className="drawer">
            <div className="drawer-header">
              <div>
                <h3 style={{ margin: 0 }}>{detail.name || 'Candidate'}</h3>
                <div className="muted" style={{ fontSize: 13 }}>{detail.roleName}</div>
              </div>
              <div className="toolbar">
                <button className="btn" onClick={() => store.openEdit(detail)}><Edit3 size={14} /> Edit</button>
                <button className="btn danger" onClick={() => { if (confirm('Delete this candidate?')) store.deleteCandidate(detail.id); }}><Trash2 size={14} /></button>
                <button className="btn ghost" onClick={() => store.openDetail(null)}><X size={16} /></button>
              </div>
            </div>
            <div className="drawer-body">
              <div className="section">
                <div className="chip-row" style={{ marginBottom: 10 }}>
                  <StatusBadge status={detail.status} />
                  <button
                    type="button"
                    className={`btn ghost star-action ${detail.starred ? 'on' : ''}`}
                    onClick={() => store.toggleStar(detail.id)}
                    title={detail.starred ? 'Unstar' : 'Star'}
                  >
                    {detail.starred ? <Star size={14} className="star" fill="currentColor" /> : <StarOff size={14} />}
                    {detail.starred ? 'Starred' : 'Star'}
                  </button>
                  {(detail.tags || []).map((t) => <span className="chip" key={t}>{t}</span>)}
                </div>
                <div className="kv"><div className="k">Email</div><div className="v">{detail.email || '—'}</div></div>
                <div className="kv"><div className="k">Phone</div><div className="v">{detail.phone || '—'}</div></div>
                <div className="kv"><div className="k">City</div><div className="v">{detail.city || '—'}</div></div>
                <div className="kv"><div className="k">Gender</div><div className="v">{detail.gender || '—'}</div></div>
                <div className="kv"><div className="k">Applied</div><div className="v">{detail.appliedAt || '—'}</div></div>
                <div className="kv"><div className="k">Availability</div><div className="v">{detail.availability || '—'}</div></div>
              </div>

              <div className="section">
                <h4>Education</h4>
                <div className="kv"><div className="k">Institute</div><div className="v">{detail.institute || '—'}</div></div>
                <div className="kv"><div className="k">Degree</div><div className="v">{detail.degree || '—'}</div></div>
                <div className="kv"><div className="k">Stream</div><div className="v">{detail.stream || detail.streamFromPdf || '—'}</div></div>
                <div className="kv"><div className="k">Grad year</div><div className="v">{detail.graduationYear || '—'}</div></div>
                <div className="kv"><div className="k">UG / PG</div><div className="v">{[detail.performanceUg, detail.performancePg].filter(Boolean).join(' · ') || '—'}</div></div>
                {detail.educationFromPdf && <p className="muted" style={{ fontSize: 13 }}>{detail.educationFromPdf}</p>}
              </div>

              <div className="section">
                <h4>Experience</h4>
                <div className="kv"><div className="k">Has exp</div><div className="v">{detail.hasWorkExperience || '—'}</div></div>
                <div className="kv"><div className="k">Duration</div><div className="v">{detail.experienceDuration || '—'}</div></div>
                <div className="kv"><div className="k">Latest</div><div className="v">{[detail.latestRole, detail.latestCompany].filter(Boolean).join(' @ ') || '—'}</div></div>
                <div className="kv"><div className="k">Companies</div><div className="v">{detail.companies || '—'}</div></div>
                <div className="kv"><div className="k">Titles</div><div className="v">{detail.jobTitles || '—'}</div></div>
                {detail.workExperienceDetail && <p style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{detail.workExperienceDetail}</p>}
              </div>

              <div className="section">
                <h4>Skills & scores</h4>
                <div className="kv"><div className="k">AI match</div><div className="v">{detail.aiResumeMatch || '—'}</div></div>
                <div className="kv"><div className="k">AI scores</div><div className="v">{scoreSummary(detail) || '—'}</div></div>
                <div className="kv"><div className="k">Skills</div><div className="v">{detail.otherSkills || '—'}</div></div>
                <div className="kv"><div className="k">Languages</div><div className="v">{detail.languages || '—'}</div></div>
                <div className="kv"><div className="k">Certs</div><div className="v">{detail.certifications || '—'}</div></div>
                {Object.keys(detail.skillFlags || {}).length > 0 && (
                  <div className="chip-row" style={{ marginTop: 8 }}>
                    {Object.entries(detail.skillFlags).map(([k, v]) => (
                      <span className="chip" key={k}>{k}: {String(v)}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="section">
                <h4>Profile text</h4>
                {detail.careerObjective && <p style={{ fontSize: 13 }}><b>Objective:</b> {detail.careerObjective}</p>}
                {detail.projects && <p style={{ fontSize: 13 }}><b>Projects:</b> {detail.projects}</p>}
                {detail.additionalDetails && <p style={{ fontSize: 13 }}><b>Additional:</b> {detail.additionalDetails}</p>}
              </div>

              <div className="section">
                <h4>Links</h4>
                <div className="toolbar">
                  {detail.applicationLink && <a className="btn" href={detail.applicationLink} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Application</a>}
                  {(detail.resumeLink || detail.downloadLink) && (
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() =>
                        setResumeViewer({
                          url: (detail.resumeLink || detail.downloadLink)!,
                          title: detail.name || detail.pdfFile || 'Candidate',
                        })
                      }
                    >
                      <Eye size={14} /> View resume
                    </button>
                  )}
                  {detail.resumeLink && <a className="btn" href={detail.resumeLink} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open</a>}
                  {(detail.downloadLink || detail.resumeLink) && (
                    <a className="btn" href={detail.downloadLink || detail.resumeLink!} target="_blank" rel="noreferrer" download>
                      <Download size={14} /> Download PDF
                    </a>
                  )}
                  {detail.chatLink && <a className="btn" href={detail.chatLink} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Chat</a>}
                  {!detail.resumeLink && !detail.downloadLink && (
                    <span className="muted" style={{ fontSize: 13 }}>No resume file linked for this candidate.</span>
                  )}
                </div>
              </div>

              <div className="section">
                <h4>Internal notes</h4>
                <p style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{detail.notes || <span className="muted">No notes yet. Click Edit to add.</span>}</p>
              </div>
            </div>
          </aside>
        </>
      )}

      {formOpen && formCandidate && (
        <CandidateForm
          mode={formMode}
          candidate={formCandidate}
          roles={roles}
          onClose={() => store.closeForm()}
          onSave={(c) => { void store.upsertCandidate(c); }}
        />
      )}

      {resumeViewer && (
        <ResumeViewerModal
          url={resumeViewer.url}
          title={resumeViewer.title}
          onClose={() => setResumeViewer(null)}
        />
      )}
    </div>
    </div>
  );
}

function CandidateForm({
  mode,
  candidate,
  roles,
  onClose,
  onSave,
}: {
  mode: 'create' | 'edit';
  candidate: Candidate;
  roles: { id: string; name: string }[];
  onClose: () => void;
  onSave: (c: Candidate) => void;
}) {
  const [draft, setDraft] = useStateDraft(candidate);

  const set = (key: keyof Candidate, value: unknown) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{mode === 'create' ? 'Add candidate' : 'Edit candidate'}</h3>
          <button className="btn ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>Name *</label>
              <input className="input" value={s(draft.name)} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="select" value={draft.status} onChange={(e) => set('status', e.target.value)}>
                {(Object.keys(STATUS_LABELS) as PipelineStatus[]).map((st) => (
                  <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Role</label>
              <select
                className="select"
                value={draft.roleId}
                onChange={(e) => {
                  const id = e.target.value;
                  const name = roles.find((r) => r.id === id)?.name || draft.roleName;
                  setDraft((d) => ({ ...d, roleId: id, roleName: name }));
                }}
              >
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                <option value="imported">Imported / Other</option>
              </select>
            </div>
            <div className="field">
              <label>City</label>
              <input className="input" value={s(draft.city)} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" value={s(draft.email)} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={s(draft.phone)} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="field">
              <label>Institute</label>
              <input className="input" value={s(draft.institute)} onChange={(e) => set('institute', e.target.value)} />
            </div>
            <div className="field">
              <label>Degree</label>
              <input className="input" value={s(draft.degree)} onChange={(e) => set('degree', e.target.value)} />
            </div>
            <div className="field">
              <label>AI Resume Match</label>
              <select className="select" value={s(draft.aiResumeMatch)} onChange={(e) => set('aiResumeMatch', e.target.value || null)}>
                <option value="">—</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </select>
            </div>
            <div className="field">
              <label>Has work experience</label>
              <select className="select" value={s(draft.hasWorkExperience)} onChange={(e) => set('hasWorkExperience', e.target.value || null)}>
                <option value="">—</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="field full">
              <label>Companies</label>
              <input className="input" value={s(draft.companies)} onChange={(e) => set('companies', e.target.value)} />
            </div>
            <div className="field full">
              <label>Job titles</label>
              <input className="input" value={s(draft.jobTitles)} onChange={(e) => set('jobTitles', e.target.value)} />
            </div>
            <div className="field full">
              <label>Work experience detail</label>
              <textarea className="textarea" value={s(draft.workExperienceDetail)} onChange={(e) => set('workExperienceDetail', e.target.value)} />
            </div>
            <div className="field full">
              <label>Skills</label>
              <textarea className="textarea" value={s(draft.otherSkills)} onChange={(e) => set('otherSkills', e.target.value)} />
            </div>
            <div className="field full">
              <label>Tags (comma separated)</label>
              <input
                className="input"
                value={(draft.tags || []).join(', ')}
                onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              />
            </div>
            <div className="field full">
              <label>Internal notes</label>
              <textarea className="textarea" value={s(draft.notes)} onChange={(e) => set('notes', e.target.value)} />
            </div>
            <div className="field">
              <label>
                <input type="checkbox" checked={!!draft.starred} onChange={(e) => set('starred', e.target.checked)} /> Starred
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn primary"
            onClick={() => {
              if (!s(draft.name).trim()) {
                alert('Name is required');
                return;
              }
              onSave(draft);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function useStateDraft(initial: Candidate) {
  const [draft, setDraft] = useState<Candidate>(initial);
  useEffect(() => {
    setDraft(initial);
  }, [initial.id]);
  return [draft, setDraft] as const;
}
