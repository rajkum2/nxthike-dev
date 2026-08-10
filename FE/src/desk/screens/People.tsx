/**
 * Candidates (list + profile side by side), add, merge, resume and tags.
 *
 * PII masking is applied by the API for roles that may see a record but not how
 * to reach the person; the toggle here only affects roles that are allowed to
 * unmask, and says which case it is.
 */

import React, { useState } from 'react';
import { deskApi, type DeskCandidate } from '../api';
import { STAGES, T, disposition, stage } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Banner, Button, Card, Chip, EmptyState, ErrorState, Eyebrow,
  FactGrid, Icon, Input, Modal, Panel, Select, SkeletonRows, Textarea,
  maskEmail, maskPhone, num, shortDate, splitList, useLoad, useMediaQuery, whenLabel,
} from '../ui';
import { CallRow } from './Calls';

const STATUS_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'Sourced' },
  { key: 'reviewing', label: 'Screening' },
  { key: 'shortlisted', label: 'Submitted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'on_hold', label: 'On hold' },
];

type ViewMode = 'split' | 'table';

type ColId =
  | 'name' | 'status' | 'role' | 'phone' | 'email' | 'city' | 'latestRole' | 'company'
  | 'experience' | 'source' | 'currentCtc' | 'expectedCtc' | 'notice' | 'institute'
  | 'degree' | 'skills' | 'updatedAt' | 'starred' | 'dnc' | 'gender';

const ROW_ACTION_BTN: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 7,
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  cursor: 'pointer',
  padding: 0,
  margin: 0,
  flexShrink: 0,
  boxSizing: 'border-box',
  lineHeight: 0,
};

function phoneDigits(phone?: string | null) {
  return (phone || '').replace(/\D/g, '');
}

/** Normalize to a dialable digit string (strip leading 0). */
function normalizePhoneDigits(phone?: string | null) {
  let d = phoneDigits(phone);
  if (d.startsWith('0') && d.length >= 11) d = d.replace(/^0+/, '');
  return d;
}

/**
 * Heuristic: Indian mobiles (6–9 + 9 digits) are WhatsApp-eligible in our market.
 * We cannot query Meta for registration; this avoids landlines / junk numbers.
 */
function isLikelyWhatsAppMobile(phone?: string | null): boolean {
  const d = normalizePhoneDigits(phone);
  if (/^[6-9]\d{9}$/.test(d)) return true;
  if (/^91[6-9]\d{9}$/.test(d)) return true;
  return false;
}

type MsgChannel = 'whatsapp' | 'sms' | 'email' | 'none' | 'blocked';

function messagingChannel(opts: {
  phone?: string | null;
  email?: string | null;
  dnc?: boolean | null;
}): MsgChannel {
  if (opts.dnc) return 'blocked';
  if (isLikelyWhatsAppMobile(opts.phone)) return 'whatsapp';
  const d = normalizePhoneDigits(opts.phone);
  if (d.length >= 10) return 'sms';
  const em = (opts.email || '').trim();
  if (em.includes('@')) return 'email';
  return 'none';
}

function hasCallablePhone(phone?: string | null) {
  return normalizePhoneDigits(phone).length >= 10;
}

/** Open WhatsApp (Indian 10-digit → 91 prefix). */
function openWhatsApp(phone?: string | null, name?: string | null) {
  if (!isLikelyWhatsAppMobile(phone)) return;
  let d = normalizePhoneDigits(phone);
  if (/^[6-9]\d{9}$/.test(d)) d = `91${d}`;
  const text = encodeURIComponent(name ? `Hi ${name}` : 'Hi');
  window.open(`https://wa.me/${d}?text=${text}`, '_blank', 'noopener');
}

function openSms(phone?: string | null, name?: string | null) {
  const d = normalizePhoneDigits(phone);
  if (d.length < 10) return;
  const body = encodeURIComponent(name ? `Hi ${name}` : 'Hi');
  window.open(`sms:${d}?body=${body}`, '_self');
}

function openEmail(email?: string | null, name?: string | null) {
  const em = (email || '').trim();
  if (!em.includes('@')) return;
  const subject = encodeURIComponent('Hello');
  const body = encodeURIComponent(name ? `Hi ${name},` : 'Hi,');
  window.open(`mailto:${em}?subject=${subject}&body=${body}`, '_self');
}

function runMessagingChannel(
  channel: MsgChannel,
  contact: { phone?: string | null; email?: string | null; name?: string | null },
) {
  if (channel === 'whatsapp') openWhatsApp(contact.phone, contact.name);
  else if (channel === 'sms') openSms(contact.phone, contact.name);
  else if (channel === 'email') openEmail(contact.email, contact.name);
}

function messagingMeta(channel: MsgChannel): {
  icon: string;
  tone?: 'success';
  color?: string;
  title: string;
  enabled: boolean;
} {
  switch (channel) {
    // `chat` is the outline speech bubble; the tone colours the glyph and
    // border rather than filling the button.
    case 'whatsapp':
      return { icon: 'chat', tone: 'success', color: '#0F7B43', title: 'WhatsApp', enabled: true };
    case 'sms':
      return { icon: 'sms', color: T.inkMuted, title: 'SMS', enabled: true };
    case 'email':
      return { icon: 'mail', color: T.inkMuted, title: 'Email', enabled: true };
    case 'blocked':
      return { icon: 'chat', color: T.inkFaint, title: 'Blocked · DND', enabled: false };
    default:
      return { icon: 'chat', color: T.inkFaint, title: 'No phone or email', enabled: false };
  }
}

const COLUMN_DEFS: { id: ColId; label: string; defaultOn: boolean; minW?: number }[] = [
  { id: 'name', label: 'Name', defaultOn: true, minW: 160 },
  { id: 'status', label: 'Stage', defaultOn: true, minW: 100 },
  { id: 'role', label: 'Hiring role', defaultOn: true, minW: 140 },
  { id: 'phone', label: 'Phone', defaultOn: true, minW: 120 },
  { id: 'email', label: 'Email', defaultOn: false, minW: 180 },
  { id: 'city', label: 'City', defaultOn: true, minW: 100 },
  { id: 'latestRole', label: 'Latest role', defaultOn: true, minW: 140 },
  { id: 'company', label: 'Company', defaultOn: false, minW: 130 },
  { id: 'experience', label: 'Experience', defaultOn: true, minW: 100 },
  { id: 'source', label: 'Source', defaultOn: false, minW: 100 },
  { id: 'currentCtc', label: 'Current CTC', defaultOn: false, minW: 100 },
  { id: 'expectedCtc', label: 'Expected CTC', defaultOn: false, minW: 100 },
  { id: 'notice', label: 'Notice', defaultOn: false, minW: 70 },
  { id: 'institute', label: 'Institute', defaultOn: false, minW: 140 },
  { id: 'degree', label: 'Degree', defaultOn: false, minW: 100 },
  { id: 'skills', label: 'Skills', defaultOn: false, minW: 160 },
  { id: 'gender', label: 'Gender', defaultOn: false, minW: 80 },
  { id: 'updatedAt', label: 'Updated', defaultOn: true, minW: 100 },
  { id: 'starred', label: 'Starred', defaultOn: false, minW: 70 },
  { id: 'dnc', label: 'DND', defaultOn: false, minW: 60 },
];

const COLS_STORAGE_KEY = 'nxthike.candidates.visibleCols';
const VIEW_STORAGE_KEY = 'nxthike.candidates.viewMode';

function loadVisibleCols(): Record<ColId, boolean> {
  const base = Object.fromEntries(COLUMN_DEFS.map((c) => [c.id, c.defaultOn])) as Record<ColId, boolean>;
  try {
    const raw = localStorage.getItem(COLS_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Record<ColId, boolean>>;
    return { ...base, ...parsed, name: true };
  } catch {
    return base;
  }
}

function fmtCtc(v?: number | null) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  const n = Number(v);
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} L`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

const compactCtrl: React.CSSProperties = {
  height: 32,
  fontSize: 12,
  width: '100%',
  minWidth: 0,
  padding: '0 8px',
  borderRadius: 8,
};

/* ------------------------------------------------------------------ *
 *  Candidates                                                        *
 * ------------------------------------------------------------------ */

export function CandidatesScreen() {
  const {
    candidateId, candidateRoleId, go, caps, selection, toggleSelect, clearSelection,
    setCandidateRoleId, openModal, candidatesRev,
  } = useDesk();
  const c = caps();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const isFullAdmin = c.admin === true;
  const canEdit = isFullAdmin || !!c.create;
  const canStage = isFullAdmin || !!c.stage;
  const canSelect = canEdit || canStage || isFullAdmin;
  const canDelete = isFullAdmin;

  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState('all');
  // Seed from rail submenu (null → all roles).
  const [roleId, setRoleId] = useState(candidateRoleId || 'all');
  const [experience, setExperience] = useState('all');
  const [city, setCity] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');
  const [source, setSource] = useState('');
  const [debouncedSource, setDebouncedSource] = useState('');
  const [gender, setGender] = useState('all');
  const [graduationYear, setGraduationYear] = useState('all');
  const [expYears, setExpYears] = useState('all');
  const [starredOnly, setStarredOnly] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [dncOnly, setDncOnly] = useState(false);
  const [noConsent, setNoConsent] = useState(false);
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [savedMenuOpen, setSavedMenuOpen] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [showColsMenu, setShowColsMenu] = useState(false);
  const [showList, setShowList] = useState(!candidateId);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const v = localStorage.getItem(VIEW_STORAGE_KEY);
      return v === 'table' || v === 'split' ? v : 'table';
    } catch {
      return 'table';
    }
  });
  const [visibleCols, setVisibleCols] = useState<Record<ColId, boolean>>(loadVisibleCols);
  const [unmask, setUnmask] = useState(() => c.db === 'all' || c.admin === true);
  const [editOpen, setEditOpen] = useState(false);
  const [tableDetailOpen, setTableDetailOpen] = useState(!!candidateId);
  const [bulkPanel, setBulkPanel] = useState<null | 'stage' | 'role' | 'edit' | 'tags'>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  const selectedIds = Object.keys(selection);

  // Keep filters in sync when the user picks a role from the rail submenu.
  React.useEffect(() => {
    setRoleId(candidateRoleId || 'all');
    setPage(1);
  }, [candidateRoleId]);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(query.trim()), 320);
    return () => window.clearTimeout(t);
  }, [query]);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedCity(city.trim()), 320);
    return () => window.clearTimeout(t);
  }, [city]);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSource(source.trim()), 320);
    return () => window.clearTimeout(t);
  }, [source]);

  const filterDeps = [
    debouncedQ, status, roleId, experience, debouncedCity, debouncedSource, gender,
    graduationYear, expYears,
    starredOnly, hasNotes, hasPhone, hasEmail, hasResume, dncOnly, noConsent, sortKey, sortDir,
    candidatesRev,
  ];
  React.useEffect(() => { setPage(1); }, filterDeps); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    try { localStorage.setItem(VIEW_STORAGE_KEY, viewMode); } catch { /* ignore */ }
  }, [viewMode]);
  React.useEffect(() => {
    try { localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(visibleCols)); } catch { /* ignore */ }
  }, [visibleCols]);

  const rolesLoad = useLoad(() => deskApi.hiringDashboard().then((d) => d.roles || []), []);
  const savedLoad = useLoad(() => deskApi.savedSearches().catch(() => []), []);

  const snapshotFilters = (): Record<string, unknown> => ({
    query: debouncedQ || query,
    status,
    roleId,
    experience,
    city: debouncedCity || city,
    source: debouncedSource || source,
    gender,
    graduationYear,
    expYears,
    starredOnly,
    hasNotes,
    hasPhone,
    hasEmail,
    hasResume,
    dncOnly,
    noConsent,
    sortKey,
    sortDir,
  });

  const applyFilterSnapshot = (f: Record<string, unknown>) => {
    const s = (k: string, fallback = '') => (typeof f[k] === 'string' ? (f[k] as string) : fallback);
    const b = (k: string) => !!f[k];
    setQuery(s('query')); setDebouncedQ(s('query'));
    setStatus(s('status', 'all') || 'all');
    const nextRole = s('roleId', 'all') || 'all';
    setRoleId(nextRole);
    setCandidateRoleId(nextRole === 'all' ? null : nextRole);
    setExperience(s('experience', 'all') || 'all');
    setCity(s('city')); setDebouncedCity(s('city'));
    setSource(s('source')); setDebouncedSource(s('source'));
    setGender(s('gender', 'all') || 'all');
    setGraduationYear(s('graduationYear', 'all') || 'all');
    setExpYears(s('expYears', 'all') || 'all');
    setStarredOnly(b('starredOnly'));
    setHasNotes(b('hasNotes'));
    setHasPhone(b('hasPhone'));
    setHasEmail(b('hasEmail'));
    setHasResume(b('hasResume'));
    setDncOnly(b('dncOnly'));
    setNoConsent(b('noConsent'));
    setSortKey(s('sortKey', 'updatedAt') || 'updatedAt');
    setSortDir((s('sortDir', 'desc') as 'asc' | 'desc') || 'desc');
    setPage(1);
    setShowMoreFilters(true);
  };

  // Restore filters handed off from Tags / saved-search deep link
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('nxthike.pendingCandFilters');
      if (!raw) return;
      sessionStorage.removeItem('nxthike.pendingCandFilters');
      applyFilterSnapshot(JSON.parse(raw) as Record<string, unknown>);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCurrentSearch = async () => {
    const name = window.prompt('Name this saved search');
    if (!name?.trim()) return;
    setSaveBusy(true);
    try {
      await deskApi.saveSearch({ name: name.trim(), filters: snapshotFilters(), shared: false });
      await savedLoad.reload();
      setBulkMsg(`Saved “${name.trim()}”`);
      window.setTimeout(() => setBulkMsg(null), 2500);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaveBusy(false);
    }
  };

  const pageSize = viewMode === 'table' ? 100 : 60;
  const list = useLoad(
    () => deskApi.candidates({
      search: debouncedQ || undefined,
      status: status !== 'all' ? status : undefined,
      roleId: roleId !== 'all' ? roleId : undefined,
      experience: experience !== 'all' ? experience : undefined,
      city: debouncedCity || undefined,
      source: debouncedSource || undefined,
      gender: gender !== 'all' ? gender : undefined,
      graduationYear: graduationYear !== 'all' ? graduationYear : undefined,
      expYears: expYears !== 'all' ? expYears : undefined,
      starredOnly: starredOnly || undefined,
      hasNotes: hasNotes || undefined,
      hasPhone: hasPhone || undefined,
      hasEmail: hasEmail || undefined,
      hasResume: hasResume || undefined,
      dncOnly: dncOnly || undefined,
      noConsent: noConsent || undefined,
      sortKey,
      sortDir,
      page,
      pageSize,
    }),
    [...filterDeps, page, pageSize],
  );

  const rows = list.data?.items || [];
  const selectedId = candidateId || (viewMode === 'split' ? rows[0]?.id : null) || null;
  const detail = useLoad(async () => (selectedId ? deskApi.candidate(selectedId) : null), [selectedId]);

  const afterBulk = async (message: string) => {
    setBulkMsg(message);
    clearSelection();
    setBulkPanel(null);
    await list.reload();
    detail.reload();
    window.setTimeout(() => setBulkMsg(null), 3200);
  };

  const runBulkStatus = async (nextStatus: string) => {
    if (!selectedIds.length || !nextStatus) return;
    setBulkBusy(true);
    try {
      const r = await deskApi.bulkStatus(selectedIds, nextStatus);
      await afterBulk(`Updated stage for ${r.updated} candidate${r.updated === 1 ? '' : 's'}`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  };

  const runBulkRole = async (nextRoleId: string) => {
    if (!selectedIds.length || !nextRoleId) return;
    const role = (rolesLoad.data || []).find((r) => r.id === nextRoleId);
    setBulkBusy(true);
    try {
      const r = await deskApi.bulkRole(selectedIds, nextRoleId, role?.name);
      await afterBulk(`Moved ${r.updated} to ${role?.name || 'role'}`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  };

  const runBulkDelete = async () => {
    if (!selectedIds.length || !canDelete) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} candidate${selectedIds.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      const r = await deskApi.bulkDelete(selectedIds);
      await afterBulk(`Deleted ${r.deleted} candidate${r.deleted === 1 ? '' : 's'}`);
      go('cands', { candidateId: null });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  };

  const runBulkQuick = async (patch: Record<string, unknown>, label: string) => {
    if (!selectedIds.length) return;
    setBulkBusy(true);
    try {
      const r = await deskApi.bulkUpdate({ ids: selectedIds, ...patch });
      await afterBulk(`${label} · ${r.updated} updated`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  };

  const lockedByRole = detail.data?.piiMasked
    ?? (c.db === 'limitedPII' || c.db === 'ownReqs' || c.db === 'ownInterviews');
  const masked = lockedByRole || !unmask;
  const selectedCount = Object.keys(selection).length;
  const totalPages = list.data?.totalPages || 1;
  const activeCols = COLUMN_DEFS.filter((col) => visibleCols[col.id]);

  const activeFilterCount = [
    status !== 'all', roleId !== 'all', experience !== 'all', starredOnly, hasNotes,
    hasPhone, hasEmail, hasResume, dncOnly, noConsent, !!debouncedQ, !!debouncedCity,
    !!debouncedSource, gender !== 'all', graduationYear !== 'all', expYears !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery(''); setDebouncedQ(''); setStatus('all'); setRoleId('all');
    setCandidateRoleId(null);
    setExperience('all'); setCity(''); setDebouncedCity(''); setSource(''); setDebouncedSource('');
    setGender('all'); setGraduationYear('all'); setExpYears('all');
    setStarredOnly(false); setHasNotes(false);
    setHasPhone(false); setHasEmail(false); setHasResume(false); setDncOnly(false); setNoConsent(false);
    setSortKey('updatedAt'); setSortDir('desc'); setPage(1);
    setShowMoreFilters(false);
  };

  const GRAD_YEARS = React.useMemo(() => {
    const y = new Date().getFullYear() + 1;
    return Array.from({ length: 20 }, (_, i) => String(y - i));
  }, []);

  const toggleOpts = [
    [starredOnly, setStarredOnly, 'Starred', 'star'] as const,
    [hasNotes, setHasNotes, 'Notes', 'note'] as const,
    [hasPhone, setHasPhone, 'Phone', 'call'] as const,
    [hasEmail, setHasEmail, 'Email', 'mail'] as const,
    [hasResume, setHasResume, 'Resume', 'description'] as const,
    [dncOnly, setDncOnly, 'DND', 'block'] as const,
    [noConsent, setNoConsent, 'No consent', 'gpp_maybe'] as const,
  ];

  const toggleCol = (id: ColId) => {
    if (id === 'name') return;
    setVisibleCols((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllOnPage = () => {
    rows.forEach((r) => {
      if (!selection[r.id]) toggleSelect(r.id);
    });
  };

  const deselectAllOnPage = () => {
    rows.forEach((r) => {
      if (selection[r.id]) toggleSelect(r.id);
    });
  };

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selection[r.id]);

  const openRow = (id: string) => {
    go('cands', { candidateId: id });
    if (viewMode === 'table') {
      setTableDetailOpen(true);
    } else {
      setShowList(false);
    }
  };

  const cellValue = (r: DeskCandidate, col: ColId): React.ReactNode => {
    const st = stage(r.status);
    switch (col) {
      case 'name':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 650 }}>
            {r.name || 'Unnamed'}
            {r.dnc ? <Icon name="block" size={13} color={T.maroon} /> : null}
            {r.starred ? <Icon name="star" size={13} color="#E6A817" /> : null}
          </span>
        );
      case 'status':
        return <Badge label={st.label} bg={st.tint} fg={st.color} />;
      case 'role':
        return r.roleName || '—';
      case 'phone':
        return masked ? maskPhone(r.phone) : (r.phone || '—');
      case 'email':
        return masked ? maskEmail(r.email) : (r.email || '—');
      case 'city':
        return r.city || '—';
      case 'latestRole':
        return r.latestRole || '—';
      case 'company':
        return r.latestCompany || '—';
      case 'experience':
        return r.experienceDuration || (r.hasWorkExperience === 'yes' ? 'Exp' : r.hasWorkExperience === 'no' ? 'Fresher' : '—');
      case 'source':
        return r.source || '—';
      case 'currentCtc':
        return fmtCtc(r.currentCtc);
      case 'expectedCtc':
        return fmtCtc(r.expectedCtc);
      case 'notice':
        return r.noticeDays != null ? `${r.noticeDays}d` : '—';
      case 'institute':
        return r.institute || '—';
      case 'degree':
        return r.degree || '—';
      case 'skills': {
        const s = (r.relevantSkills || r.otherSkills || '').slice(0, 80);
        return s || '—';
      }
      case 'gender':
        return r.gender || '—';
      case 'updatedAt':
        return shortDate(r.updatedAt);
      case 'starred':
        return r.starred ? '★' : '—';
      case 'dnc':
        return r.dnc ? 'Yes' : '—';
      default:
        return '—';
    }
  };

  /* ---- Compact filter bar ---------------------------------------- */
  const filterBar = (
    <div
      className="card"
      style={{ flexShrink: 0, padding: isMobile ? '8px 10px' : '10px 12px', marginBottom: 10 }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flex: '1 1 200px',
            minWidth: isMobile ? '100%' : 180,
            maxWidth: isMobile ? '100%' : 320,
            background: T.fill,
            borderRadius: 8,
            padding: '0 8px',
            height: 32,
            border: `1px solid ${T.border}`,
          }}
        >
          <Icon name="search" size={16} color={T.inkMuted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, minWidth: 0 }}
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} style={{ padding: 1 }}>
              <Icon name="close" size={14} color={T.inkFaint} />
            </button>
          ) : null}
        </div>

        <Select
          value={roleId}
          onChange={(e) => {
            const v = e.target.value;
            setRoleId(v);
            setCandidateRoleId(v === 'all' ? null : v);
          }}
          style={{ ...compactCtrl, flex: '0 1 180px', maxWidth: 220 }}
        >
          <option value="all">All roles</option>
          {(rolesLoad.data || []).map((r) => (
            <option key={r.id} value={r.id}>{r.name} ({r.count})</option>
          ))}
        </Select>

        {/* No stage dropdown here — the chip row below owns `status`. */}

        <Select value={experience} onChange={(e) => setExperience(e.target.value)} style={{ ...compactCtrl, flex: '0 1 110px', maxWidth: 130 }}>
          <option value="all">Any exp</option>
          <option value="yes">Has exp</option>
          <option value="no">Fresher</option>
        </Select>

        <div style={{ position: 'relative' }}>
          <Button
            variant={showMoreFilters || activeFilterCount > 0 ? 'soft' : 'ghost'}
            icon="tune"
            title={activeFilterCount > 0 ? `Filters (${activeFilterCount} active)` : 'Filters'}
            aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} active)` : 'Filters'}
            onClick={() => setShowMoreFilters((v) => !v)}
            style={{ height: 32, width: 32, padding: 0, minWidth: 32 }}
          />
          {activeFilterCount > 0 && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 99,
                background: T.indigo,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: '16px',
                textAlign: 'center',
                pointerEvents: 'none',
                boxShadow: `0 0 0 1.5px ${T.surface}`,
              }}
            >
              {activeFilterCount > 9 ? '9+' : activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            icon="filter_alt_off"
            title="Clear filters"
            aria-label="Clear filters"
            onClick={clearFilters}
            style={{ height: 32, width: 32, padding: 0, minWidth: 32 }}
          />
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {canEdit && (
            <Button
              icon="person_add"
              title="Add candidate"
              aria-label="Add candidate"
              onClick={() => openModal('addcand')}
              style={{ height: 32, width: 32, padding: 0, minWidth: 32 }}
            />
          )}
          {/* View toggle — icon only */}
          <div
            style={{
              display: 'inline-flex',
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              overflow: 'hidden',
              height: 32,
            }}
          >
            {([
              ['table', 'table_rows', 'Table view'],
              ['split', 'view_sidebar', 'Split view'],
            ] as const).map(([mode, icon, label]) => (
              <button
                key={mode}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={viewMode === mode}
                onClick={() => setViewMode(mode)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  padding: 0,
                  margin: 0,
                  lineHeight: 0,
                  boxSizing: 'border-box',
                  background: viewMode === mode ? T.indigoTint : 'transparent',
                  color: viewMode === mode ? T.indigoInk : T.inkMuted,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon name={icon} size={16} color={viewMode === mode ? T.indigo : T.inkFaint} />
              </button>
            ))}
          </div>

          {viewMode === 'table' && (
            <div style={{ position: 'relative' }}>
              <Button
                variant="ghost"
                icon="view_column"
                title="Show columns"
                aria-label="Show columns"
                onClick={() => setShowColsMenu((v) => !v)}
                style={{ height: 32, width: 32, padding: 0, minWidth: 32 }}
              />
              {showColsMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowColsMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 36,
                      zIndex: 50,
                      width: 220,
                      maxHeight: 360,
                      overflowY: 'auto',
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      boxShadow: '0 8px 28px rgba(20,18,40,.14)',
                      padding: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, padding: '4px 8px 8px' }}>
                      SHOW COLUMNS
                    </div>
                    {COLUMN_DEFS.map((col) => (
                      <label
                        key={col.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 6,
                          cursor: col.id === 'name' ? 'default' : 'pointer',
                          fontSize: 12.5,
                          opacity: col.id === 'name' ? 0.6 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!visibleCols[col.id]}
                          disabled={col.id === 'name'}
                          onChange={() => toggleCol(col.id)}
                        />
                        {col.label}
                      </label>
                    ))}
                    <div style={{ borderTop: `1px solid ${T.divider}`, marginTop: 6, paddingTop: 6, display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        style={{ flex: 1, fontSize: 11, fontWeight: 650, color: T.indigo, padding: 6 }}
                        onClick={() => setVisibleCols(Object.fromEntries(COLUMN_DEFS.map((x) => [x.id, true])) as Record<ColId, boolean>)}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        style={{ flex: 1, fontSize: 11, fontWeight: 650, color: T.inkMuted, padding: 6 }}
                        onClick={() => setVisibleCols(Object.fromEntries(COLUMN_DEFS.map((x) => [x.id, x.defaultOn])) as Record<ColId, boolean>)}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <span style={{ fontSize: 11.5, fontWeight: 600, color: T.inkMuted, whiteSpace: 'nowrap' }}>
            {list.data ? `${num(list.data.total)}` : '…'}
          </span>
          {totalPages > 1 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ opacity: page <= 1 ? 0.35 : 1, padding: 2 }}
              >
                <Icon name="chevron_left" size={18} color={T.inkMuted} />
              </button>
              <span className="mono" style={{ fontSize: 11, minWidth: 36, textAlign: 'center' }}>{page}/{totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ opacity: page >= totalPages ? 0.35 : 1, padding: 2 }}
              >
                <Icon name="chevron_right" size={18} color={T.inkMuted} />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Dense advanced filters — one compact strip, no tall label stack */}
      {showMoreFilters && (
        <div
          style={{
            marginTop: 6,
            padding: '8px 10px',
            background: T.surfaceAlt,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <input
              className="field"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              title="City"
              style={{ ...compactCtrl, width: 110, flex: '0 1 110px' }}
            />
            <input
              className="field"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Source"
              title="Source"
              style={{ ...compactCtrl, width: 110, flex: '0 1 110px' }}
            />
            <Select value={gender} onChange={(e) => setGender(e.target.value)} title="Gender" style={{ ...compactCtrl, width: 100, flex: '0 0 100px' }}>
              <option value="all">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Select
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              title="Graduation year"
              style={{ ...compactCtrl, width: 100, flex: '0 0 100px' }}
            >
              <option value="all">Grad year</option>
              {GRAD_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
            <Select
              value={expYears}
              onChange={(e) => setExpYears(e.target.value)}
              title="Years of experience"
              style={{ ...compactCtrl, width: 110, flex: '0 0 110px' }}
            >
              <option value="all">Exp years</option>
              <option value="0-1">0–1 yr</option>
              <option value="1-3">1–3 yrs</option>
              <option value="3-5">3–5 yrs</option>
              <option value="5+">5+ yrs</option>
            </Select>
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)} title="Sort by" style={{ ...compactCtrl, width: 108, flex: '0 0 108px' }}>
              <option value="updatedAt">Updated</option>
              <option value="createdAt">Added</option>
              <option value="name">Name</option>
              <option value="status">Stage</option>
              <option value="city">City</option>
              <option value="latestRole">Latest role</option>
            </Select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              title={sortDir === 'desc' ? 'Descending' : 'Ascending'}
              style={{
                width: 28, height: 28, flexShrink: 0, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', borderRadius: 7,
                background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer',
              }}
            >
              <Icon name={sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward'} size={14} color={T.inkMuted} />
            </button>

            <div style={{ width: 1, height: 22, background: T.divider, margin: '0 2px' }} />

            {toggleOpts.map(([on, set, label, icon]) => (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => set(!on)}
                title={label}
                aria-label={label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  padding: 0,
                  borderRadius: 7,
                  background: on ? T.indigoTint : T.surface,
                  color: on ? T.indigoInk : T.inkBody,
                  border: `1px solid ${on ? T.indigo : T.border}`,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  lineHeight: 0,
                }}
              >
                <Icon name={icon} size={15} color={on ? T.indigo : T.inkFaint} />
              </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="bookmark"
                  title={
                    (savedLoad.data?.length || 0) > 0
                      ? `Saved searches (${savedLoad.data!.length})`
                      : 'Saved searches'
                  }
                  aria-label="Saved searches"
                  onClick={() => setSavedMenuOpen((v) => !v)}
                />
                {(savedLoad.data?.length || 0) > 0 && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute', top: -3, right: -3,
                      minWidth: 14, height: 14, padding: '0 3px', borderRadius: 99,
                      background: T.indigo, color: '#fff', fontSize: 9, fontWeight: 700,
                      lineHeight: '14px', textAlign: 'center', pointerEvents: 'none',
                    }}
                  >
                    {(savedLoad.data!.length > 9) ? '9+' : savedLoad.data!.length}
                  </span>
                )}
                {savedMenuOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setSavedMenuOpen(false)} />
                    <div
                      style={{
                        position: 'absolute', right: 0, top: 32, zIndex: 50, width: 260,
                        maxHeight: 280, overflowY: 'auto', background: T.surface,
                        border: `1px solid ${T.border}`, borderRadius: 10,
                        boxShadow: '0 8px 28px rgba(20,18,40,.14)', padding: 6,
                      }}
                    >
                      {(savedLoad.data || []).length === 0 && (
                        <div style={{ padding: 10, fontSize: 12, color: T.inkFaint }}>
                          No saved searches yet. Set filters, then Save.
                        </div>
                      )}
                      {(savedLoad.data || []).map((s) => (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            borderRadius: 7, padding: '2px 2px 2px 8px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              applyFilterSnapshot(s.filters || {});
                              setSavedMenuOpen(false);
                            }}
                            style={{
                              flex: 1, textAlign: 'left', minWidth: 0,
                              padding: '6px 4px', fontSize: 12.5, fontWeight: 600,
                            }}
                          >
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                            <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 500 }}>
                              {s.shared ? 'Shared' : 'Private'}
                            </div>
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!window.confirm(`Delete “${s.name}”?`)) return;
                              try {
                                await deskApi.deleteSavedSearch(s.id);
                                savedLoad.reload();
                              } catch (err) {
                                alert((err as Error).message);
                              }
                            }}
                            style={{ padding: 6, borderRadius: 6 }}
                          >
                            <Icon name="close" size={14} color={T.inkFaint} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="soft"
                size="sm"
                icon="bookmark_add"
                title={activeFilterCount === 0 ? 'Set filters before saving' : 'Save current filters'}
                aria-label="Save current filters"
                disabled={saveBusy || activeFilterCount === 0}
                onClick={saveCurrentSearch}
              />
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="restart_alt"
                  title="Reset filters"
                  aria-label="Reset filters"
                  onClick={clearFilters}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage chips — compact, single row scroll */}
      <div
        style={{
          marginTop: 6,
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 1,
        }}
      >
        {STATUS_CHIPS.map((x) => (
          <button
            key={x.key}
            type="button"
            aria-pressed={status === x.key}
            onClick={() => setStatus(x.key)}
            style={{
              height: 24,
              padding: '0 9px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 650,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              border: `1px solid ${status === x.key ? T.indigo : T.border}`,
              background: status === x.key ? T.indigoTint : T.surface,
              color: status === x.key ? T.indigoInk : T.inkBody,
              cursor: 'pointer',
            }}
          >
            {x.label}
          </button>
        ))}
      </div>
    </div>
  );

  /* ---- List (split) pane ----------------------------------------- */
  const listPane = (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', height: '100%' }}>
      <div
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${T.divider}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: T.inkBody }}>Results</span>
        <span style={{ fontSize: 11, color: T.inkFaint }}>
          {list.data ? `${num(rows.length)} of ${num(list.data.total)}` : '…'}
        </span>
      </div>

      {selectedCount > 0 && (
        <BulkActionBar
          count={selectedCount}
          busy={bulkBusy}
          canEdit={canEdit}
          canStage={canStage}
          canDelete={canDelete}
          onStage={() => setBulkPanel('stage')}
          onRole={() => setBulkPanel('role')}
          onEdit={() => setBulkPanel('edit')}
          onTags={() => setBulkPanel('tags')}
          onStar={() => runBulkQuick({ starred: true }, 'Starred')}
          onUnstar={() => runBulkQuick({ starred: false }, 'Unstarred')}
          onDnc={() => runBulkQuick({ dnc: true }, 'Flagged DND')}
          onDelete={runBulkDelete}
          onClear={clearSelection}
        />
      )}

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {list.loading && <div style={{ padding: 12 }}><SkeletonRows rows={7} /></div>}
        {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
        {list.data && !rows.length && (
          <EmptyState
            icon="person_search"
            title="No candidates match"
            body="Widen or clear filters, or add this person."
            actionLabel={c.create ? 'Add candidate' : undefined}
            onAction={() => openModal('addcand')}
          />
        )}
        {rows.map((r) => {
          const st = stage(r.status);
          const on = r.id === selectedId;
          return (
            <div
              key={r.id}
              onClick={() => openRow(r.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderBottom: `1px solid ${T.dividerFaint}`, cursor: 'pointer',
                background: on ? T.indigoTint : 'transparent',
              }}
            >
              {canSelect && (
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }} aria-label="Select">
                  <Icon
                    name={selection[r.id] ? 'check_box' : 'check_box_outline_blank'}
                    size={18}
                    color={selection[r.id] ? T.indigo : T.borderInput}
                  />
                </button>
              )}
              <Avatar name={r.name} id={r.id} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name || 'Unnamed'}
                  </span>
                  {r.dnc && <Icon name="block" size={14} color={T.maroon} title="Do not call" />}
                </div>
                <div style={{ marginTop: 2, fontSize: 11, color: T.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {[r.latestRole, r.latestCompany || r.roleName].filter(Boolean).join(' · ')}
                </div>
              </div>
              <Badge label={st.label} bg={st.tint} fg={st.color} />
              <div
                style={{ display: 'inline-flex', gap: 1, flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {c.dial && (
                  <button
                    type="button"
                    title={r.dnc ? 'Blocked · DND' : hasCallablePhone(r.phone) ? 'Call' : 'No phone'}
                    aria-label="Call"
                    disabled={!!r.dnc || !hasCallablePhone(r.phone)}
                    onClick={() => go('queue', { candidateId: r.id })}
                    style={{
                      ...ROW_ACTION_BTN,
                      opacity: !!r.dnc || !hasCallablePhone(r.phone) ? 0.35 : 1,
                      cursor: !!r.dnc || !hasCallablePhone(r.phone) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Icon name="call" size={15} color={T.indigo} />
                  </button>
                )}
                {(() => {
                  const ch = messagingChannel({ phone: r.phone, email: r.email, dnc: r.dnc });
                  const m = messagingMeta(ch);
                  return (
                    <button
                      type="button"
                      title={m.title}
                      aria-label={m.title}
                      disabled={!m.enabled}
                      onClick={() => runMessagingChannel(ch, r)}
                      style={{
                        ...ROW_ACTION_BTN,
                        opacity: m.enabled ? 1 : 0.35,
                        cursor: m.enabled ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Icon name={m.icon} size={15} color={m.color} />
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ---- Table pane ------------------------------------------------ */
  const tablePane = (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', height: '100%', flex: 1 }}>
      {selectedCount > 0 && (
        <BulkActionBar
          count={selectedCount}
          busy={bulkBusy}
          canEdit={canEdit}
          canStage={canStage}
          canDelete={canDelete}
          onStage={() => setBulkPanel('stage')}
          onRole={() => setBulkPanel('role')}
          onEdit={() => setBulkPanel('edit')}
          onTags={() => setBulkPanel('tags')}
          onStar={() => runBulkQuick({ starred: true }, 'Starred')}
          onUnstar={() => runBulkQuick({ starred: false }, 'Unstarred')}
          onDnc={() => runBulkQuick({ dnc: true }, 'Flagged DND')}
          onDelete={runBulkDelete}
          onClear={clearSelection}
        />
      )}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {list.loading && <div style={{ padding: 12 }}><SkeletonRows rows={10} /></div>}
        {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
        {list.data && !rows.length && (
          <EmptyState icon="person_search" title="No candidates match" body="Widen or clear filters." />
        )}
        {!!rows.length && (
          <table className="tbl" style={{ width: '100%', minWidth: activeCols.length * 110, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {canSelect && (
                  <th
                    style={{
                      position: 'sticky', top: 0, zIndex: 2, background: T.surface,
                      width: 40, padding: '8px 10px', textAlign: 'left',
                      borderBottom: `1px solid ${T.divider}`, fontSize: 11, fontWeight: 700, color: T.inkMuted,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => (allOnPageSelected ? deselectAllOnPage() : selectAllOnPage())}
                      aria-label="Select page"
                    >
                      <Icon
                        name={allOnPageSelected ? 'check_box' : 'check_box_outline_blank'}
                        size={18}
                        color={allOnPageSelected ? T.indigo : T.borderInput}
                      />
                    </button>
                  </th>
                )}
                {activeCols.map((col) => (
                  <th
                    key={col.id}
                    style={{
                      position: 'sticky', top: 0, zIndex: 2, background: T.surface,
                      padding: '8px 10px', textAlign: 'left', whiteSpace: 'nowrap',
                      borderBottom: `1px solid ${T.divider}`, fontSize: 11, fontWeight: 700,
                      color: T.inkMuted, minWidth: col.minW,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  style={{
                    position: 'sticky', top: 0, right: 0, zIndex: 3,
                    background: T.surface,
                    width: 132,
                    padding: '8px 8px',
                    textAlign: 'right',
                    borderBottom: `1px solid ${T.divider}`,
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.inkMuted,
                    letterSpacing: '0.02em',
                    boxShadow: '-6px 0 10px -8px rgba(20,18,40,.18)',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = r.id === selectedId && tableDetailOpen;
                const canCall = hasCallablePhone(r.phone) && !r.dnc;
                const msgCh = messagingChannel({ phone: r.phone, email: r.email, dnc: r.dnc });
                const msg = messagingMeta(msgCh);
                const rowBg = on ? T.indigoTint : selection[r.id] ? `${T.indigo}08` : T.surface;
                return (
                  <tr
                    key={r.id}
                    onClick={() => openRow(r.id)}
                    style={{
                      cursor: 'pointer',
                      background: on ? T.indigoTint : selection[r.id] ? `${T.indigo}08` : 'transparent',
                    }}
                  >
                    {canSelect && (
                      <td
                        style={{ padding: '7px 10px', borderBottom: `1px solid ${T.dividerFaint}`, verticalAlign: 'middle' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button type="button" onClick={() => toggleSelect(r.id)} aria-label="Select">
                          <Icon
                            name={selection[r.id] ? 'check_box' : 'check_box_outline_blank'}
                            size={18}
                            color={selection[r.id] ? T.indigo : T.borderInput}
                          />
                        </button>
                      </td>
                    )}
                    {activeCols.map((col) => (
                      <td
                        key={col.id}
                        style={{
                          padding: '7px 10px',
                          borderBottom: `1px solid ${T.dividerFaint}`,
                          fontSize: 12.5,
                          color: T.inkBody,
                          maxWidth: col.id === 'skills' || col.id === 'email' ? 220 : 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          verticalAlign: 'middle',
                        }}
                      >
                        {cellValue(r, col.id)}
                      </td>
                    ))}
                    <td
                      style={{
                        position: 'sticky',
                        right: 0,
                        zIndex: 1,
                        background: rowBg,
                        padding: '4px 6px',
                        borderBottom: `1px solid ${T.dividerFaint}`,
                        whiteSpace: 'nowrap',
                        textAlign: 'right',
                        verticalAlign: 'middle',
                        boxShadow: '-6px 0 10px -8px rgba(20,18,40,.14)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
                        {c.dial && (
                          <button
                            type="button"
                            title={r.dnc ? 'Blocked · DND' : canCall ? 'Call' : 'No phone'}
                            aria-label="Call"
                            disabled={!canCall}
                            onClick={() => go('queue', { candidateId: r.id })}
                            style={{
                              ...ROW_ACTION_BTN,
                              opacity: canCall ? 1 : 0.35,
                              cursor: canCall ? 'pointer' : 'not-allowed',
                            }}
                          >
                            <Icon name="call" size={16} color={T.indigo} />
                          </button>
                        )}
                        <button
                          type="button"
                          title={msg.title}
                          aria-label={msg.title}
                          disabled={!msg.enabled}
                          onClick={() => runMessagingChannel(msgCh, r)}
                          style={{
                            ...ROW_ACTION_BTN,
                            opacity: msg.enabled ? 1 : 0.35,
                            cursor: msg.enabled ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <Icon name={msg.icon} size={16} color={msg.color} />
                        </button>
                        <button
                          type="button"
                          title="Compose message"
                          aria-label="Compose message"
                          onClick={() => go('composer', { candidateId: r.id })}
                          style={ROW_ACTION_BTN}
                        >
                          <Icon name="edit_note" size={16} color={T.inkMuted} />
                        </button>
                        <button
                          type="button"
                          title="Open profile"
                          aria-label="Open profile"
                          onClick={() => openRow(r.id)}
                          style={ROW_ACTION_BTN}
                        >
                          <Icon name="open_in_new" size={16} color={T.inkMuted} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const cand = detail.data;
  const detailPane = !cand ? (
    <Card><EmptyState icon="groups" title="No candidate selected" body="Pick someone from the list or table." /></Card>
  ) : (
    <>
      <CandidateProfile
        cand={cand}
        masked={masked}
        lockedByRole={lockedByRole}
        canEdit={canEdit}
        isAdmin={isFullAdmin}
        onToggleMask={() => setUnmask((u) => !u)}
        onEdit={() => setEditOpen(true)}
        onDelete={canDelete ? async () => {
          if (!window.confirm(`Delete ${cand.name || 'this candidate'} permanently?`)) return;
          try {
            await deskApi.deleteCandidate(cand.id);
            go('cands', { candidateId: null });
            setTableDetailOpen(false);
            list.reload();
          } catch (e) {
            alert((e as Error).message);
          }
        } : undefined}
        onReload={() => { detail.reload(); list.reload(); }}
        onBack={
          isMobile || viewMode === 'table'
            ? () => {
              if (viewMode === 'table') setTableDetailOpen(false);
              else setShowList(true);
            }
            : undefined
        }
      />
      {editOpen && canEdit && (
        <EditCandidateModal
          cand={cand}
          roles={rolesLoad.data || []}
          isAdmin={isFullAdmin}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); detail.reload(); list.reload(); }}
        />
      )}
    </>
  );

  const showFilters = isMobile ? (viewMode === 'table' ? !tableDetailOpen : showList) : true;

  return (
    <div className="pad" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, boxSizing: 'border-box' }}>
      {showFilters && filterBar}
      {bulkMsg && (
        <div
          style={{
            flexShrink: 0,
            marginBottom: 8,
            padding: '8px 12px',
            borderRadius: 10,
            background: T.greenTint || T.indigoTint,
            color: T.green || T.indigoInk,
            fontSize: 12.5,
            fontWeight: 650,
          }}
        >
          {bulkMsg}
        </div>
      )}
      {bulkPanel && (
        <BulkActionModal
          kind={bulkPanel}
          count={selectedCount}
          busy={bulkBusy}
          roles={rolesLoad.data || []}
          onClose={() => setBulkPanel(null)}
          onStage={runBulkStatus}
          onRole={runBulkRole}
          onEdit={async (patch) => {
            setBulkBusy(true);
            try {
              const r = await deskApi.bulkUpdate({ ids: selectedIds, ...patch });
              await afterBulk(`Bulk edit · ${r.updated} updated`);
            } catch (e) {
              alert((e as Error).message);
            } finally {
              setBulkBusy(false);
            }
          }}
          onTags={async (add) => {
            setBulkBusy(true);
            try {
              await deskApi.applyTags({ candidateIds: selectedIds, add });
              await afterBulk(`Tags applied to ${selectedIds.length}`);
            } catch (e) {
              alert((e as Error).message);
            } finally {
              setBulkBusy(false);
            }
          }}
        />
      )}

      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {viewMode === 'table'
            ? (tableDetailOpen && selectedId ? detailPane : tablePane)
            : (showList ? listPane : detailPane)}
        </div>
      ) : viewMode === 'table' ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: tableDetailOpen && selectedId
              ? 'minmax(0, 1fr) minmax(340px, 420px)'
              : '1fr',
            gap: 12,
          }}
        >
          {tablePane}
          {tableDetailOpen && selectedId && (
            <div style={{ overflowY: 'auto', minHeight: 0, minWidth: 0 }}>{detailPane}</div>
          )}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 360px) minmax(0, 1fr)',
            gap: 14,
          }}
        >
          {listPane}
          <div style={{ overflowY: 'auto', minHeight: 0, paddingRight: 4, minWidth: 0 }}>{detailPane}</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Bulk actions                                                      *
 * ------------------------------------------------------------------ */

function BulkActionBar({
  count, busy, canEdit, canStage, canDelete,
  onStage, onRole, onEdit, onTags, onStar, onUnstar, onDnc, onDelete, onClear,
}: {
  count: number; busy: boolean;
  canEdit: boolean; canStage: boolean; canDelete: boolean;
  onStage: () => void; onRole: () => void; onEdit: () => void; onTags: () => void;
  onStar: () => void; onUnstar: () => void; onDnc: () => void;
  onDelete: () => void; onClear: () => void;
}) {
  const btn: React.CSSProperties = { height: 28, padding: '0 9px', fontSize: 11.5 };
  return (
    <div
      style={{
        padding: '8px 12px',
        background: T.indigoTint,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        flexWrap: 'wrap',
        borderBottom: `1px solid ${T.divider}`,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: T.indigoInk, marginRight: 4 }}>
        {count} selected
      </span>
      {canStage && (
        <Button variant="soft" icon="swap_horiz" onClick={onStage} disabled={busy} style={btn}>
          Stage
        </Button>
      )}
      {canEdit && (
        <Button variant="soft" icon="work" onClick={onRole} disabled={busy} style={btn}>
          Role
        </Button>
      )}
      {canEdit && (
        <Button variant="soft" icon="edit_note" onClick={onEdit} disabled={busy} style={btn}>
          Bulk edit
        </Button>
      )}
      {canEdit && (
        <Button variant="soft" icon="sell" onClick={onTags} disabled={busy} style={btn}>
          Tags
        </Button>
      )}
      {canEdit && (
        <Button variant="ghost" icon="star" onClick={onStar} disabled={busy} style={btn}>
          Star
        </Button>
      )}
      {canEdit && (
        <Button variant="ghost" icon="star_border" onClick={onUnstar} disabled={busy} style={btn}>
          Unstar
        </Button>
      )}
      {canEdit && (
        <Button variant="ghost" icon="block" onClick={onDnc} disabled={busy} style={btn}>
          DND
        </Button>
      )}
      {canDelete && (
        <Button variant="danger" icon="delete" onClick={onDelete} disabled={busy} style={btn}>
          Delete
        </Button>
      )}
      <button
        type="button"
        onClick={onClear}
        disabled={busy}
        style={{ marginLeft: 'auto', fontSize: 11.5, color: T.indigoInk, fontWeight: 650 }}
      >
        Clear
      </button>
    </div>
  );
}

function BulkActionModal({
  kind, count, busy, roles, onClose, onStage, onRole, onEdit, onTags,
}: {
  kind: 'stage' | 'role' | 'edit' | 'tags';
  count: number;
  busy: boolean;
  roles: { id: string; name: string; count?: number }[];
  onClose: () => void;
  onStage: (status: string) => void;
  onRole: (roleId: string) => void;
  onEdit: (patch: Record<string, unknown>) => void;
  onTags: (add: string[]) => void;
}) {
  const [stageVal, setStageVal] = useState('');
  const [roleVal, setRoleVal] = useState('');
  const [city, setCity] = useState('');
  const [source, setSource] = useState('');
  const [gender, setGender] = useState('');
  const [exp, setExp] = useState('');
  const [expDur, setExpDur] = useState('');
  const [notice, setNotice] = useState('');
  const [availability, setAvailability] = useState('');
  const [notesAppend, setNotesAppend] = useState('');
  const [starred, setStarred] = useState<'keep' | 'yes' | 'no'>('keep');
  const [dnc, setDnc] = useState<'keep' | 'yes' | 'no'>('keep');
  const [statusEdit, setStatusEdit] = useState('');
  const [roleEdit, setRoleEdit] = useState('');
  const tagsLoad = useLoad(() => deskApi.tags(), []);
  const [tagPick, setTagPick] = useState<string[]>([]);

  const title = {
    stage: 'Change stage',
    role: 'Change hiring role',
    edit: 'Bulk edit fields',
    tags: 'Apply tags',
  }[kind];

  const applyEdit = () => {
    const patch: Record<string, unknown> = {};
    if (statusEdit) patch.status = statusEdit;
    if (roleEdit) {
      patch.roleId = roleEdit;
      patch.roleName = roles.find((r) => r.id === roleEdit)?.name;
    }
    if (city.trim()) patch.city = city.trim();
    if (source.trim()) patch.source = source.trim();
    if (gender) patch.gender = gender;
    if (exp) patch.hasWorkExperience = exp;
    if (expDur.trim()) patch.experienceDuration = expDur.trim();
    if (notice !== '') patch.noticeDays = Number(notice);
    if (availability.trim()) patch.availability = availability.trim();
    if (notesAppend.trim()) patch.notesAppend = notesAppend.trim();
    if (starred === 'yes') patch.starred = true;
    if (starred === 'no') patch.starred = false;
    if (dnc === 'yes') patch.dnc = true;
    if (dnc === 'no') patch.dnc = false;
    if (!Object.keys(patch).length) {
      alert('Fill at least one field to update.');
      return;
    }
    onEdit(patch);
  };

  return (
    <Modal
      title={title}
      subtitle={`${count} candidate${count === 1 ? '' : 's'} selected · empty fields are left unchanged`}
      onClose={onClose}
      width={kind === 'edit' ? 560 : 440}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          {kind === 'stage' && (
            <Button onClick={() => onStage(stageVal)} disabled={!stageVal || busy}>
              {busy ? 'Updating…' : 'Update stage'}
            </Button>
          )}
          {kind === 'role' && (
            <Button onClick={() => onRole(roleVal)} disabled={!roleVal || busy}>
              {busy ? 'Updating…' : 'Change role'}
            </Button>
          )}
          {kind === 'edit' && (
            <Button onClick={applyEdit} disabled={busy}>
              {busy ? 'Saving…' : `Apply to ${count}`}
            </Button>
          )}
          {kind === 'tags' && (
            <Button onClick={() => onTags(tagPick)} disabled={!tagPick.length || busy}>
              {busy ? 'Applying…' : `Apply tags`}
            </Button>
          )}
        </>
      }
    >
      {kind === 'stage' && (
        <Select value={stageVal} onChange={(e) => setStageVal(e.target.value)}>
          <option value="">Select stage…</option>
          {STATUS_CHIPS.filter((x) => x.key !== 'all').map((x) => (
            <option key={x.key} value={x.key}>{x.label}</option>
          ))}
        </Select>
      )}
      {kind === 'role' && (
        <Select value={roleVal} onChange={(e) => setRoleVal(e.target.value)}>
          <option value="">Select hiring role…</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}{r.count != null ? ` (${r.count})` : ''}</option>
          ))}
        </Select>
      )}
      {kind === 'tags' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {(tagsLoad.data || []).map((t: { id: string; name: string; color?: string }) => {
            const on = tagPick.includes(t.name);
            return (
              <Chip
                key={t.id}
                label={t.name}
                on={on}
                onClick={() => setTagPick(on ? tagPick.filter((x) => x !== t.name) : [...tagPick, t.name])}
                accent={t.color || undefined}
              />
            );
          })}
          {tagsLoad.data && !tagsLoad.data.length && (
            <span style={{ fontSize: 12, color: T.inkFaint }}>No tags yet — create some on the Tags screen.</span>
          )}
        </div>
      )}
      {kind === 'edit' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Stage</label>
            <Select value={statusEdit} onChange={(e) => setStatusEdit(e.target.value)}>
              <option value="">No change</option>
              {STATUS_CHIPS.filter((x) => x.key !== 'all').map((x) => (
                <option key={x.key} value={x.key}>{x.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="label">Hiring role</label>
            <Select value={roleEdit} onChange={(e) => setRoleEdit(e.target.value)}>
              <option value="">No change</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="label">City</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Leave blank = no change" />
          </div>
          <div>
            <label className="label">Source</label>
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Leave blank = no change" />
          </div>
          <div>
            <label className="label">Gender</label>
            <Select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">No change</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div>
            <label className="label">Experience</label>
            <Select value={exp} onChange={(e) => setExp(e.target.value)}>
              <option value="">No change</option>
              <option value="yes">Has experience</option>
              <option value="no">Fresher</option>
            </Select>
          </div>
          <div>
            <label className="label">Exp. duration</label>
            <Input value={expDur} onChange={(e) => setExpDur(e.target.value)} placeholder="e.g. 2 years" />
          </div>
          <div>
            <label className="label">Notice (days)</label>
            <Input type="number" value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="No change" />
          </div>
          <div>
            <label className="label">Starred</label>
            <Select value={starred} onChange={(e) => setStarred(e.target.value as 'keep' | 'yes' | 'no')}>
              <option value="keep">No change</option>
              <option value="yes">Star all</option>
              <option value="no">Unstar all</option>
            </Select>
          </div>
          <div>
            <label className="label">DND</label>
            <Select value={dnc} onChange={(e) => setDnc(e.target.value as 'keep' | 'yes' | 'no')}>
              <option value="keep">No change</option>
              <option value="yes">Flag DND</option>
              <option value="no">Clear DND</option>
            </Select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Availability</label>
            <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Leave blank = no change" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Append note</label>
            <Textarea value={notesAppend} onChange={(e) => setNotesAppend(e.target.value)} rows={2} placeholder="Added to every selected candidate" />
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Profile                                                           *
 * ------------------------------------------------------------------ */

const TABS = ['Overview', 'Timeline', 'Documents', 'Notes', 'Submissions', 'Calls'] as const;

function CandidateProfile({
  cand, masked, lockedByRole, canEdit, isAdmin, onToggleMask, onEdit, onDelete, onReload, onBack,
}: {
  cand: DeskCandidate; masked: boolean; lockedByRole: boolean;
  canEdit: boolean; isAdmin: boolean;
  onToggleMask: () => void; onEdit: () => void; onDelete?: () => void; onReload: () => void; onBack?: () => void;
}) {
  const { go, caps, openModal } = useDesk();
  const c = caps();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [noteDraft, setNoteDraft] = useState('');
  const [shared, setShared] = useState(true);

  const notes = useLoad(() => deskApi.notes(cand.id), [cand.id, tab === 'Notes']);
  const calls = useLoad(async () => (await deskApi.callLogs({ candidateId: cand.id })).items, [cand.id]);
  const subs = useLoad(() => deskApi.submissions({ candidateId: cand.id }), [cand.id]);

  const st = stage(cand.status);
  const skills = splitList(cand.relevantSkills || cand.otherSkills);

  const addNote = async () => {
    if (!noteDraft.trim()) return;
    await deskApi.addNote(cand.id, noteDraft.trim(), shared ? 'shared' : 'private');
    setNoteDraft('');
    notes.reload();
  };

  const setStage = async (statusId: string) => {
    await deskApi.patchCandidate(cand.id, { status: statusId });
    onReload();
  };

  const phoneShown = cand.piiMasked
    ? (cand.phone || '')
    : masked
      ? maskPhone(cand.phone)
      : (cand.phone || '');
  const emailShown = cand.piiMasked
    ? (cand.email || '')
    : masked
      ? maskEmail(cand.email)
      : (cand.email || '');
  const metaBits = [
    cand.roleName,
    cand.city,
    phoneShown || null,
    emailShown || null,
  ].filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card pad={12}>
        {/* Header: back · avatar · identity · privacy */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              icon="arrow_back"
              title="Back to list"
              aria-label="Back to list"
              onClick={onBack}
            />
          )}
          <Avatar name={cand.name} id={cand.id} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cand.name || 'Unnamed'}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 11,
                color: T.inkMuted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={metaBits.join(' · ')}
            >
              {metaBits.join(' · ') || '—'}
            </div>
            <div style={{ marginTop: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Badge label={st.label} bg={st.tint} fg={st.color} />
              <Badge
                label={cand.consentAt ? 'Consent' : 'No consent'}
                bg={cand.consentAt ? T.greenTint : T.amberTint}
                fg={cand.consentAt ? T.green : T.amberInk}
                icon={cand.consentAt ? 'verified_user' : 'gpp_maybe'}
              />
              {cand.dnc && <Badge label="DND" bg={T.maroonTint} fg={T.maroon} icon="block" />}
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleMask}
            title={lockedByRole
              ? 'PII locked by role — full values are not available in this browser'
              : masked
                ? 'PII masked — click to show full view'
                : 'Full view — click to mask PII'}
            aria-label={lockedByRole ? 'PII locked by role' : masked ? 'Show full PII' : 'Mask PII'}
            disabled={lockedByRole}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              padding: 0,
              background: masked ? T.amberTint : T.fill,
              cursor: lockedByRole ? 'not-allowed' : 'pointer',
              border: 'none',
              flexShrink: 0,
              lineHeight: 0,
              boxSizing: 'border-box',
            }}
          >
            <Icon name={masked ? 'visibility_off' : 'visibility'} size={15} color={masked ? T.amberInk : T.inkMuted} />
          </button>
        </div>

        {/* Actions: Reach | Pipeline | Manage */}
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {c.dial && (
            <Button
              variant="ghost"
              size="sm"
              tone="brand"
              icon="call"
              title={cand.dnc ? 'Blocked · DND' : hasCallablePhone(cand.phone) ? 'Call' : 'No phone'}
              aria-label={cand.dnc ? 'Blocked · DND' : 'Call'}
              onClick={() => go('queue', { candidateId: cand.id })}
              disabled={!!cand.dnc || !hasCallablePhone(cand.phone)}
            />
          )}
          {(() => {
            const ch = messagingChannel({ phone: cand.phone, email: cand.email, dnc: cand.dnc });
            const m = messagingMeta(ch);
            return (
              <Button
                variant="ghost"
                size="sm"
                tone={m.tone}
                icon={m.icon}
                title={m.title}
                aria-label={m.title}
                onClick={() => runMessagingChannel(ch, cand)}
                disabled={!m.enabled}
                style={m.color && !m.tone ? { color: m.color } : undefined}
              />
            );
          })()}
          <Button
            variant="ghost"
            size="sm"
            icon="edit_note"
            title="Compose message"
            aria-label="Compose message"
            onClick={() => go('composer', { candidateId: cand.id })}
          />

          <span
            aria-hidden
            style={{ width: 1, height: 18, background: T.divider, margin: '0 2px', flexShrink: 0 }}
          />

          {c.stage && (
            <Select
              value={cand.status}
              onChange={(e) => setStage(e.target.value)}
              title="Pipeline stage"
              aria-label="Pipeline stage"
              style={{
                width: 'auto',
                minWidth: 96,
                maxWidth: 120,
                height: 28,
                fontSize: 11.5,
                padding: '0 8px',
                borderRadius: 8,
              }}
            >
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              <option value="on_hold">On hold</option>
            </Select>
          )}

          <span
            aria-hidden
            style={{ width: 1, height: 18, background: T.divider, margin: '0 2px', flexShrink: 0 }}
          />

          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              tone="brand"
              icon="edit"
              title={isAdmin ? 'Edit all details' : 'Edit'}
              aria-label={isAdmin ? 'Edit all details' : 'Edit'}
              onClick={onEdit}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            icon="content_copy"
            title="Find duplicates"
            aria-label="Find duplicates"
            onClick={() => go('merge', { candidateId: cand.id })}
          />
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              tone="danger"
              icon="delete"
              title="Delete"
              aria-label="Delete"
              onClick={onDelete}
            />
          )}
        </div>
      </Card>

      {/* Tabs — denser */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.divider}`, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '7px 10px',
              fontSize: 11.5,
              whiteSpace: 'nowrap',
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? T.indigo : T.inkMuted,
              borderBottom: `2px solid ${tab === t ? T.indigo : 'transparent'}`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          <Card>
            <FactGrid
              facts={[
                // Already masked upstream when `piiMasked` — masking twice
                // would mangle a value the server deliberately shaped.
                ['Phone', cand.piiMasked ? (cand.phone || '') : masked ? maskPhone(cand.phone) : cand.phone || ''],
                ['Email', cand.piiMasked ? (cand.email || '') : masked ? maskEmail(cand.email) : cand.email || ''],
                ['Location', cand.city || ''],
                ['Source', cand.source || ''],
                ['Current CTC', cand.currentCtc ? `₹${cand.currentCtc} LPA` : ''],
                ['Expected CTC', cand.expectedCtc ? `₹${cand.expectedCtc} LPA` : ''],
                ['Notice', cand.noticeDays ? `${cand.noticeDays} days${cand.buyout ? ' · buyout' : ''}` : (cand.availability || '')],
                ['Requisition', cand.roleName],
                ['Experience', cand.experienceDuration || ''],
                ['Institute', cand.institute || ''],
              ]}
            />
          </Card>

          {skills.length > 0 && (
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skills.map((s) => (
                  <span key={s} style={{ background: T.fill, borderRadius: 8, padding: '5px 10px', fontSize: 11.5, fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Compliance</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row label="Consent recorded" value={cand.consentAt ? whenLabel(cand.consentAt) : 'Not recorded'}
                tone={cand.consentAt ? T.green : T.amberInk} />
              <Row label="Do-not-call" value={cand.dnc ? 'Locked' : 'Not flagged'} tone={cand.dnc ? T.maroon : T.inkMuted} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <Button variant="ghost" icon="how_to_reg" onClick={() => openModal('consent')}>Record consent</Button>
                <Button variant="ghost" icon="delete_sweep" onClick={() => openModal('erasure')}>Raise erasure</Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {tab === 'Timeline' && (
        <Card>
          {calls.loading && <SkeletonRows rows={4} />}
          {!calls.loading && !(calls.data || []).length && (
            <EmptyState icon="timeline" title="Nothing recorded yet" body="Calls and notes build this timeline." />
          )}
          {(calls.data || []).map((l, i, arr) => {
            const d = disposition(l.disposition);
            return (
              <div key={l.id} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 10, background: d.tint, display: 'grid', placeItems: 'center' }}>
                    <Icon name={d.icon} size={16} color={d.color} />
                  </span>
                  {i < arr.length - 1 && <span style={{ flex: 1, width: 1.5, background: T.border, margin: '4px 0' }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>Call · {d.label}</span>
                    <span className="mono" style={{ fontSize: 9, color: T.inkFaint }}>{shortDate(l.calledAt)}</span>
                  </div>
                  {l.note && <div style={{ marginTop: 4, fontSize: 12, color: T.inkMuted, lineHeight: 1.5 }}>{l.note}</div>}
                  {l.userEmail && <div style={{ marginTop: 5, fontSize: 10.5, color: T.inkFaint }}>{l.userEmail}</div>}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {tab === 'Documents' && (
        <Card>
          {cand.resumeLink ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: 11, background: T.redTint, display: 'grid', placeItems: 'center' }}>
                <Icon name="picture_as_pdf" size={22} color={T.red} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Resume</div>
                <div className="mono" style={{ fontSize: 10, color: T.inkFaint, wordBreak: 'break-all' }}>{cand.resumeLink}</div>
              </div>
              <Button variant="ghost" icon="open_in_new"
                onClick={() => window.open(cand.resumeLink!, '_blank', 'noopener')}
              >
                Open
              </Button>
            </div>
          ) : (
            <EmptyState icon="description" title="No documents attached"
              body="A resume link on the candidate record shows up here." />
          )}
        </Card>
      )}

      {tab === 'Notes' && (
        <>
          <Card>
            <Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a note…" />
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setShared(!shared)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={shared ? 'group' : 'lock'} size={17} color={shared ? T.green : T.neutral} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: T.inkMuted }}>
                  {shared ? 'Shared with team' : 'Private to me'}
                </span>
              </button>
              <Button onClick={addNote} disabled={!noteDraft.trim()} style={{ marginLeft: 'auto' }}>Post</Button>
            </div>
          </Card>
          {(notes.data || []).map((n) => (
            <Card key={n.id} pad={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={n.authorName} id={n.authorName || 'x'} size={24} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{n.authorName}</span>
                <Badge label={n.visibility === 'shared' ? 'Shared' : 'Private'}
                  bg={n.visibility === 'shared' ? T.greenTint : T.fill}
                  fg={n.visibility === 'shared' ? T.green : T.neutral}
                  icon={n.visibility === 'shared' ? 'group' : 'lock'} />
                <span className="mono" style={{ marginLeft: 'auto', fontSize: 9.5, color: T.inkFaint }}>
                  {whenLabel(n.createdAt)}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.55 }}>{n.body}</div>
            </Card>
          ))}
          {notes.data && !notes.data.length && (
            <EmptyState icon="note" title="No notes yet" body="Add the first one above." />
          )}
        </>
      )}

      {tab === 'Submissions' && (
        <>
          {(subs.data || []).map((s) => (
            <Card key={s.id} pad={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.requisitionName || 'Requisition'}</div>
                  <div style={{ marginTop: 2, fontSize: 11.5, color: T.inkMuted }}>{s.clientName || '—'}</div>
                </div>
                <Badge label={s.status.replace(/_/g, ' ')} bg={T.blueTint} fg={T.blue} />
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 10, color: T.inkFaint }}>{shortDate(s.submittedAt)}</span>
                {s.submittedCtc && <span style={{ fontSize: 11, color: T.inkMuted }}>Submitted at ₹{s.submittedCtc} LPA</span>}
              </div>
            </Card>
          ))}
          {subs.data && !subs.data.length && (
            <EmptyState icon="send" title="Not submitted anywhere"
              body="Submissions to a client requisition appear here." />
          )}
        </>
      )}

      {tab === 'Calls' && (
        <>
          {(calls.data || []).map((l) => <CallRow key={l.id} log={l} showName={false} />)}
          {calls.data && !calls.data.length && (
            <EmptyState icon="call" title="No calls logged" body="Outcomes recorded from the console show up here." />
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ fontSize: 12, color: T.inkMuted }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: tone || T.ink }}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Full edit modal (admin / create-capable roles)                    *
 * ------------------------------------------------------------------ */

type RoleOpt = { id: string; name: string; count?: number };

function EditCandidateModal({
  cand, roles, isAdmin, onClose, onSaved,
}: {
  cand: DeskCandidate;
  roles: RoleOpt[];
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: cand.name || '',
    phone: cand.phone || '',
    email: cand.email || '',
    city: cand.city || '',
    gender: cand.gender || '',
    status: cand.status || 'new',
    roleId: cand.roleId || '',
    roleName: cand.roleName || '',
    source: cand.source || '',
    latestRole: cand.latestRole || '',
    latestCompany: cand.latestCompany || '',
    experienceDuration: cand.experienceDuration || '',
    hasWorkExperience: cand.hasWorkExperience || '',
    institute: cand.institute || '',
    degree: cand.degree || '',
    stream: cand.stream || '',
    graduationYear: cand.graduationYear || '',
    currentCtc: cand.currentCtc != null ? String(cand.currentCtc) : '',
    expectedCtc: cand.expectedCtc != null ? String(cand.expectedCtc) : '',
    noticeDays: cand.noticeDays != null ? String(cand.noticeDays) : '',
    buyout: !!cand.buyout,
    dnc: !!cand.dnc,
    starred: !!cand.starred,
    availability: cand.availability || '',
    otherSkills: cand.otherSkills || '',
    relevantSkills: cand.relevantSkills || '',
    resumeLink: cand.resumeLink || '',
    downloadLink: cand.downloadLink || '',
    applicationLink: cand.applicationLink || '',
    notes: cand.notes || '',
    careerObjective: cand.careerObjective || '',
    languages: cand.languages || '',
    certifications: cand.certifications || '',
    projects: cand.projects || '',
    companies: cand.companies || '',
    jobTitles: cand.jobTitles || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setError(null);
    try {
      const role = roles.find((r) => r.id === form.roleId);
      const body: Record<string, unknown> = {
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        city: form.city.trim() || null,
        gender: form.gender.trim() || null,
        status: form.status,
        roleId: form.roleId || cand.roleId,
        roleName: role?.name || form.roleName || cand.roleName,
        source: form.source.trim() || null,
        latestRole: form.latestRole.trim() || null,
        latestCompany: form.latestCompany.trim() || null,
        experienceDuration: form.experienceDuration.trim() || null,
        hasWorkExperience: form.hasWorkExperience || null,
        institute: form.institute.trim() || null,
        degree: form.degree.trim() || null,
        stream: form.stream.trim() || null,
        graduationYear: form.graduationYear.trim() || null,
        currentCtc: form.currentCtc === '' ? null : Number(form.currentCtc),
        expectedCtc: form.expectedCtc === '' ? null : Number(form.expectedCtc),
        noticeDays: form.noticeDays === '' ? null : Number(form.noticeDays),
        buyout: form.buyout,
        dnc: form.dnc,
        starred: form.starred,
        availability: form.availability.trim() || null,
        otherSkills: form.otherSkills.trim() || null,
        relevantSkills: form.relevantSkills.trim() || null,
        resumeLink: form.resumeLink.trim() || null,
        downloadLink: form.downloadLink.trim() || null,
        applicationLink: form.applicationLink.trim() || null,
        notes: form.notes,
        careerObjective: form.careerObjective.trim() || null,
        languages: form.languages.trim() || null,
        certifications: form.certifications.trim() || null,
        projects: form.projects.trim() || null,
        companies: form.companies.trim() || null,
        jobTitles: form.jobTitles.trim() || null,
      };
      await deskApi.patchCandidate(cand.id, body);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    opts?: { multiline?: boolean; type?: string; full?: boolean },
  ) => (
    <div key={String(key)} style={opts?.full ? { gridColumn: '1 / -1' } : undefined}>
      <label className="label">{label}</label>
      {opts?.multiline ? (
        <Textarea
          value={String(form[key] ?? '')}
          onChange={(e) => set(key, e.target.value)}
          rows={3}
        />
      ) : (
        <Input
          type={opts?.type || 'text'}
          value={String(form[key] ?? '')}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </div>
  );

  // Free-text fields run long (skills, histories, notes), so they get the full row
  // rather than a 210px cell with its own scrollbar.
  const section = (title: string, children: React.ReactNode) => (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
        <Eyebrow>{title}</Eyebrow>
        <div style={{ flex: 1, height: 1, background: T.divider }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
        {children}
      </div>
    </section>
  );

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="modal"
        style={{
          width: 'min(900px, calc(100vw - 24px))',
          maxHeight: '92vh',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Edit candidate</div>
            <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>
              {isAdmin ? 'Full admin edit — all profile fields' : 'Update candidate details'}
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ marginBottom: 12 }}>
              <Banner icon="error" tone="danger">{error}</Banner>
            </div>
          )}
          <div style={{ display: 'grid', gap: 22 }}>
            {section('Contact', (
              <>
                {field('Full name', 'name')}
                {field('Phone', 'phone')}
                {field('Email', 'email')}
                {field('City', 'city')}
                {field('Gender', 'gender')}
              </>
            ))}

            {section('Pipeline', (
              <>
                <div>
                  <label className="label">Stage / status</label>
                  <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                    {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    <option value="on_hold">On hold</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </Select>
                </div>
                <div>
                  <label className="label">Hiring role</label>
                  <Select
                    value={form.roleId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const r = roles.find((x) => x.id === id);
                      setForm((f) => ({ ...f, roleId: id, roleName: r?.name || f.roleName }));
                    }}
                  >
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    {!roles.find((r) => r.id === form.roleId) && form.roleId && (
                      <option value={form.roleId}>{form.roleName || form.roleId}</option>
                    )}
                  </Select>
                </div>
                {field('Source', 'source')}
              </>
            ))}

            {section('Current position', (
              <>
                {field('Latest role', 'latestRole')}
                {field('Latest company', 'latestCompany')}
                {field('Experience', 'experienceDuration')}
                <div>
                  <label className="label">Has work experience</label>
                  <Select value={form.hasWorkExperience} onChange={(e) => set('hasWorkExperience', e.target.value)}>
                    <option value="">—</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </div>
              </>
            ))}

            {section('Education', (
              <>
                {field('Institute', 'institute')}
                {field('Degree', 'degree')}
                {field('Stream', 'stream')}
                {field('Graduation year', 'graduationYear')}
              </>
            ))}

            {section('Compensation & availability', (
              <>
                {field('Current CTC (LPA)', 'currentCtc', { type: 'number' })}
                {field('Expected CTC (LPA)', 'expectedCtc', { type: 'number' })}
                {field('Notice days', 'noticeDays', { type: 'number' })}
                {field('Availability', 'availability')}
              </>
            ))}

            {section('Skills', (
              <>
                {field('Relevant skills', 'relevantSkills', { multiline: true, full: true })}
                {field('Skills (other)', 'otherSkills', { multiline: true, full: true })}
              </>
            ))}

            {section('Links', (
              <>
                {field('Resume URL', 'resumeLink')}
                {field('Download URL', 'downloadLink')}
                {field('Application link', 'applicationLink')}
              </>
            ))}

            {section('Background', (
              <>
                {field('Languages', 'languages')}
                {field('Certifications', 'certifications', { multiline: true, full: true })}
                {field('Projects', 'projects', { multiline: true, full: true })}
                {field('Companies history', 'companies', { multiline: true, full: true })}
                {field('Job titles history', 'jobTitles', { multiline: true, full: true })}
              </>
            ))}

            {section('Notes', (
              <>
                {field('Career objective', 'careerObjective', { multiline: true, full: true })}
                {field('Notes', 'notes', { multiline: true, full: true })}
              </>
            ))}

            {section('Flags', (
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {([
                  ['starred', 'Starred'],
                  ['buyout', 'Buyout available'],
                  ['dnc', 'Do not call (DND)'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set(key, !form[key])}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
                      padding: '8px 12px', borderRadius: 9,
                      background: form[key] ? T.indigoTint : T.fill,
                      color: form[key] ? T.indigoInk : T.inkMuted,
                      border: `1px solid ${form[key] ? T.indigo : T.border}`,
                    }}
                  >
                    <Icon name={form[key] ? 'check_box' : 'check_box_outline_blank'} size={16} color={form[key] ? T.indigo : T.borderInput} />
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save all changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Add candidate                                                     *
 * ------------------------------------------------------------------ */

/**
 * Kept so the SCR-W-CAND-02 route still resolves. The form itself now lives in
 * `AddCandidateModal` (see `Modals.tsx`) — this bounces to the list and opens it
 * there, so there is only ever one add-candidate form to maintain.
 */
export function AddCandidateScreen() {
  const { go, openModal } = useDesk();
  React.useEffect(() => {
    // `go` clears any open modal, so it has to run first.
    go('cands');
    openModal('addcand');
  }, [go, openModal]);
  return null;
}

/* ------------------------------------------------------------------ *
 *  Merge                                                             *
 * ------------------------------------------------------------------ */

export function MergeScreen() {
  const { candidateId, go } = useDesk();
  const [picks, setPicks] = useState<Record<string, 'a' | 'b'>>({});
  const [busy, setBusy] = useState(false);

  const load = useLoad(async () => {
    if (!candidateId) return null;
    const primary = await deskApi.candidate(candidateId);
    const digits = (primary.phone || '').replace(/\D/g, '').slice(-10);
    if (digits.length < 6) return { primary, dupe: null };
    const res = await deskApi.candidates({ search: digits, pageSize: 10 });
    const dupe = res.items.find((x) => x.id !== primary.id) || null;
    return { primary, dupe };
  }, [candidateId]);

  if (load.loading) return <div className="pad"><SkeletonRows rows={5} /></div>;
  if (load.error) return <div className="pad"><ErrorState message={load.error} onRetry={load.reload} /></div>;

  const primary = load.data?.primary;
  const dupe = load.data?.dupe;

  if (!primary) return <div className="pad"><EmptyState icon="person_search" title="No candidate selected" body="Open a profile first." /></div>;
  if (!dupe) {
    return (
      <div className="pad">
        <EmptyState icon="check_circle" tone="success" title="No duplicates found"
          body={`No other record shares ${primary.name}'s phone number.`}
          actionLabel="Back to profile" onAction={() => go('cands', { candidateId: primary.id })} />
      </div>
    );
  }

  const fields: [string, keyof DeskCandidate][] = [
    ['Full name', 'name'], ['Phone', 'phone'], ['Email', 'email'],
    ['City', 'city'], ['Current role', 'latestRole'], ['Current company', 'latestCompany'],
  ];

  const merge = async () => {
    setBusy(true);
    try {
      const patch: Record<string, unknown> = {};
      fields.forEach(([, key]) => {
        const pick = picks[key as string] || 'a';
        const value = pick === 'a' ? primary[key] : dupe[key];
        if (value) patch[key as string] = value;
      });
      patch.tags = Array.from(new Set([...(primary.tags || []), ...(dupe.tags || [])]));
      await deskApi.patchCandidate(primary.id, patch);
      go('cands', { candidateId: primary.id });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pad">
      <Banner icon="content_copy" tone="warn">
        Two records share this phone number. Pick the surviving value for each field.
        The duplicate record is left in place — nothing is deleted here.
      </Banner>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fields.map(([label, key]) => {
          const pick = picks[key as string] || 'a';
          return (
            <Card key={key as string} pad={12}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkFaint }}>{label}</div>
              <div style={{ marginTop: 8, display: 'grid', gap: 7 }}>
                {(['a', 'b'] as const).map((side) => {
                  const value = (side === 'a' ? primary[key] : dupe[key]) as string | null;
                  const on = pick === side;
                  return (
                    <button
                      key={side}
                      onClick={() => setPicks((p) => ({ ...p, [key as string]: side }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9, padding: 11, borderRadius: 10,
                        border: `1px solid ${on ? T.indigo : T.borderStrong}`,
                        background: on ? T.indigoTintSoft : T.surface, textAlign: 'left',
                      }}
                    >
                      <Icon name={on ? 'radio_button_checked' : 'radio_button_unchecked'} size={18}
                        color={on ? T.indigo : T.borderStrong} />
                      <span style={{ fontSize: 12.5 }}>{value || <span style={{ color: T.inkGhost }}>—</span>}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button onClick={merge} disabled={busy}>{busy ? 'Merging…' : 'Apply to surviving record'}</Button>
        <Button variant="ghost" onClick={() => go('cands', { candidateId: primary.id })}>Cancel</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Tags & long-lists                                                 *
 * ------------------------------------------------------------------ */

export function TagsScreen() {
  const { go } = useDesk();
  const tags = useLoad(() => deskApi.tags(), []);
  const searches = useLoad(() => deskApi.savedSearches(), []);

  return (
    <div className="pad">
      <div className="grid-panels">
        <Panel title="Tag registry" subtitle={`${tags.data?.length || 0} tags in use`}>
          {tags.loading && <div style={{ padding: 12 }}><SkeletonRows rows={5} /></div>}
          {tags.data && !tags.data.length && (
            <EmptyState icon="label" title="No tags yet" body="Tags applied to candidates are registered here." />
          )}
          <div style={{ padding: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(tags.data || []).map((t) => (
              <button
                key={t.id}
                onClick={() => go('cands')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px',
                  borderRadius: 9, border: `1px solid ${T.border}`, background: T.surface,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 99, background: t.color || T.inkGhost }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{t.name}</span>
                {t.description && (
                  <span className="mono" style={{ fontSize: 9.5, color: T.inkFaint }}>{t.description}</span>
                )}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Saved searches" subtitle="Long-lists you can hand off">
          {searches.data && !searches.data.length && (
            <EmptyState icon="bookmark" title="No saved searches"
              body="On Candidates, open Filters, set criteria, then Save." />
          )}
          {(searches.data || []).map((s) => (
            <div
              key={s.id}
              className="row row-click"
              onClick={() => {
                try {
                  sessionStorage.setItem('nxthike.pendingCandFilters', JSON.stringify(s.filters || {}));
                } catch { /* ignore */ }
                go('cands');
              }}
            >
              <Icon name="bookmark" size={18} color={T.indigo} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: T.inkMuted }}>{s.ownerName} · {s.shared ? 'Shared' : 'Private'}</div>
              </div>
              <Icon name="chevron_right" size={18} color={T.inkGhost} />
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Resume                                                            *
 * ------------------------------------------------------------------ */

export function ResumeScreen() {
  const { candidateId, go } = useDesk();
  const load = useLoad(async () => (candidateId ? deskApi.candidate(candidateId) : null), [candidateId]);
  const link = load.data?.resumeLink;

  return (
    <div className="pad">
      <Button variant="ghost" icon="arrow_back" onClick={() => go('cands', { candidateId: candidateId || undefined })}>
        Back to profile
      </Button>
      <Card style={{ marginTop: 14, minHeight: 360, display: 'grid', placeItems: 'center' }}>
        {link ? (
          <iframe title="Resume" src={link} style={{ width: '100%', height: 560, border: 'none', borderRadius: 12 }} />
        ) : (
          <EmptyState icon="description" title="No resume on file"
            body="Attach a resume link to this candidate to preview it here." />
        )}
      </Card>
    </div>
  );
}
