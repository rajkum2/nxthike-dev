/**
 * Clients (search + list), mirroring the Candidates screen.
 *
 * The clients API returns every account in one response — a few hundred rows,
 * not the 27k candidates — so search, filters, sorting and paging all run here
 * rather than round-tripping. The toolbar, column picker and table markup are
 * deliberately the same shape as Candidates so the two screens read alike.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { deskApi, type Client } from '../api';
import { T } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Button, Card, EmptyState, ErrorState, Icon, Input, Select,
  SkeletonRows, num, useLoad,
} from '../ui';
import { clientExportFilename, downloadClientsXlsx } from '../exportExcel';
import { ClientDetailBody } from './ClientDetail';
import { isLikelyWhatsAppMobile, mapsHref, openWhatsApp } from '../messaging';

type ViewMode = 'cards' | 'table';

type ColId =
  | 'name' | 'category' | 'area' | 'phone' | 'whatsapp' | 'rating' | 'reviews' | 'website'
  | 'pincode' | 'address' | 'health' | 'openReqs' | 'submissions' | 'placements'
  | 'source' | 'hoursToday' | 'tags';

const COLUMN_DEFS: { id: ColId; label: string; defaultOn: boolean; minW?: number }[] = [
  { id: 'name', label: 'Client', defaultOn: true, minW: 200 },
  { id: 'category', label: 'Category', defaultOn: true, minW: 130 },
  { id: 'area', label: 'Area', defaultOn: true, minW: 140 },
  { id: 'phone', label: 'Phone', defaultOn: true, minW: 120 },
  { id: 'whatsapp', label: 'WhatsApp', defaultOn: false, minW: 110 },
  { id: 'rating', label: 'Rating', defaultOn: true, minW: 80 },
  { id: 'reviews', label: 'Reviews', defaultOn: false, minW: 80 },
  { id: 'website', label: 'Website', defaultOn: false, minW: 160 },
  { id: 'pincode', label: 'Pincode', defaultOn: false, minW: 80 },
  { id: 'address', label: 'Address', defaultOn: false, minW: 240 },
  { id: 'health', label: 'Health', defaultOn: true, minW: 90 },
  { id: 'openReqs', label: 'Open', defaultOn: true, minW: 70 },
  { id: 'submissions', label: 'Submitted', defaultOn: false, minW: 90 },
  { id: 'placements', label: 'Placed', defaultOn: false, minW: 80 },
  { id: 'source', label: 'Source', defaultOn: false, minW: 110 },
  { id: 'hoursToday', label: 'Open today', defaultOn: false, minW: 120 },
  { id: 'tags', label: 'Tags', defaultOn: false, minW: 160 },
];

const COLS_STORAGE_KEY = 'nxthike.clients.visibleCols';
const VIEW_STORAGE_KEY = 'nxthike.clients.viewMode';
const SEGMENT_STORAGE_KEY = 'nxthike.clients.segment';

/**
 * Accounts we work with vs leads imported from a directory. `isClient` is the
 * flag: true for a real client, false for a bulk-imported prospect.
 */
type Segment = 'all' | 'clients' | 'prospects';

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'clients', label: 'Clients' },
  { id: 'prospects', label: 'Prospects' },
];

const HEALTH: Record<string, { bg: string; fg: string; label: string }> = {
  good: { bg: T.greenTint, fg: T.green, label: 'Healthy' },
  watch: { bg: T.amberTint, fg: T.amber, label: 'Watch' },
  risk: { bg: T.redTint, fg: T.red, label: 'At risk' },
};

const RATING_BANDS: { value: string; label: string; test: (r?: number | null) => boolean }[] = [
  { value: '45', label: '4.5 and above', test: (r) => (r ?? -1) >= 4.5 },
  { value: '40', label: '4.0 – 4.4', test: (r) => (r ?? -1) >= 4 && (r ?? -1) < 4.5 },
  { value: '30', label: '3.0 – 3.9', test: (r) => (r ?? -1) >= 3 && (r ?? -1) < 4 },
  { value: 'lo', label: 'Below 3.0', test: (r) => r != null && r < 3 },
  { value: 'none', label: 'Not rated', test: (r) => r == null },
];

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Explicit WhatsApp number, else the main phone when it looks like a mobile. */
function waNumber(c: Client): string | null {
  if (c.whatsapp && isLikelyWhatsAppMobile(c.whatsapp)) return c.whatsapp;
  if (!c.whatsapp && isLikelyWhatsAppMobile(c.phone)) return c.phone || null;
  return c.whatsapp && c.whatsapp.trim() ? c.whatsapp : null;
}

const compactCtrl: React.CSSProperties = {
  height: 32,
  borderRadius: 8,
  border: `1px solid ${T.border}`,
  background: T.surface,
  padding: '0 8px',
  fontSize: 12,
};

function loadVisibleCols(): Record<ColId, boolean> {
  const base = Object.fromEntries(COLUMN_DEFS.map((c) => [c.id, c.defaultOn])) as Record<ColId, boolean>;
  try {
    const raw = localStorage.getItem(COLS_STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Record<string, boolean>;
    for (const c of COLUMN_DEFS) {
      if (typeof saved[c.id] === 'boolean') base[c.id] = saved[c.id];
    }
  } catch {
    /* first run, or storage blocked — defaults are fine */
  }
  return base;
}

/** Distinct values of one field, most common first, with a count each. */
function optsFor(list: Client[], pick: (cl: Client) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const cl of list) {
    const v = (pick(cl) || '').trim();
    if (v) counts.set(v, (counts.get(v) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: value, count }));
}

/** Local multi-select, same behaviour as the one on Candidates. */
function MultiSelect({
  label,
  values,
  options,
  onChange,
  width = 130,
}: {
  label: string;
  values: string[];
  options: { value: string; label: string; count?: number }[];
  onChange: (next: string[]) => void;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const selected = new Set(values);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return options;
    return options.filter((o) => o.label.toLowerCase().includes(t));
  }, [options, q]);

  const summary = values.length === 0
    ? label
    : values.length === 1
      ? (options.find((o) => o.value === values[0])?.label || values[0])
      : `${label} · ${values.length}`;

  return (
    <div style={{ position: 'relative', flex: `0 1 ${width}px`, minWidth: Math.min(width, 100) }}>
      <button
        type="button"
        title={values.length ? values.join(', ') : label}
        onClick={() => setOpen((v) => !v)}
        style={{
          ...compactCtrl,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: values.length ? T.indigoTint : T.surface,
          border: `1px solid ${values.length ? T.indigo : T.border}`,
          color: values.length ? T.indigoInk : T.inkBody,
          fontWeight: values.length ? 650 : 500,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
          {summary}
        </span>
        {values.length > 0 && (
          <span
            role="button"
            tabIndex={0}
            title="Clear"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onChange([]); }
            }}
            style={{ display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <Icon name="close" size={13} color={T.indigo} />
          </span>
        )}
        <Icon name="expand_more" size={14} color={values.length ? T.indigo : T.inkFaint} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute', left: 0, top: 36, zIndex: 50, width: Math.max(width, 210),
              maxHeight: 320, overflowY: 'auto', background: T.surface,
              border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(20,18,40,.14)',
              padding: 6,
            }}
          >
            {options.length > 8 && (
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                style={{
                  width: '100%', height: 30, borderRadius: 7, border: `1px solid ${T.borderInput}`,
                  padding: '0 8px', fontSize: 12, marginBottom: 6, boxSizing: 'border-box',
                }}
              />
            )}
            {!filtered.length && (
              <div style={{ padding: '8px 10px', fontSize: 12, color: T.inkFaint }}>No matches</div>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(selected.has(o.value) ? values.filter((x) => x !== o.value) : [...values, o.value])}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <Icon
                  name={selected.has(o.value) ? 'check_box' : 'check_box_outline_blank'}
                  size={17}
                  color={selected.has(o.value) ? T.indigo : T.borderInput}
                />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.label}
                </span>
                {o.count != null && (
                  <span className="mono" style={{ fontSize: 11, color: T.inkFaint }}>{o.count}</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ClientsScreen() {
  const { go, caps, words } = useDesk();
  const c = caps();
  const w = words();
  const load = useLoad(() => deskApi.clients(), []);

  const [segment, setSegment] = useState<Segment>('all');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [healths, setHealths] = useState<string[]>([]);
  const [ratings, setRatings] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [withPhone, setWithPhone] = useState(false);
  const [withWa, setWithWa] = useState(false);
  const [withSite, setWithSite] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);

  const [sortKey, setSortKey] = useState<ColId>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [visibleCols, setVisibleCols] = useState<Record<ColId, boolean>>(() => loadVisibleCols());
  const [showColsMenu, setShowColsMenu] = useState(false);

  /** Right-hand detail drawer; the expand button hands off to the full screen. */
  const [openId, setOpenId] = useState<string | null>(null);
  const closeDrawer = () => setOpenId(null);

  useEffect(() => {
    if (!openId) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId]);

  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_STORAGE_KEY);
      if (v === 'cards' || v === 'table') setViewMode(v);
      const sg = localStorage.getItem(SEGMENT_STORAGE_KEY);
      if (sg === 'all' || sg === 'clients' || sg === 'prospects') setSegment(sg);
    } catch { /* storage blocked */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(SEGMENT_STORAGE_KEY, segment); } catch { /* storage blocked */ }
  }, [segment]);

  useEffect(() => {
    try { localStorage.setItem(VIEW_STORAGE_KEY, viewMode); } catch { /* storage blocked */ }
  }, [viewMode]);

  useEffect(() => {
    try { localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(visibleCols)); } catch { /* storage blocked */ }
  }, [visibleCols]);

  const everything = useMemo(() => load.data || [], [load.data]);

  const segmentCounts = useMemo(() => ({
    all: everything.length,
    clients: everything.filter((cl) => cl.isClient).length,
    prospects: everything.filter((cl) => !cl.isClient).length,
  }), [everything]);

  /** Rows in the active segment; every filter below works within it. */
  const all = useMemo(() => {
    if (segment === 'clients') return everything.filter((cl) => cl.isClient);
    if (segment === 'prospects') return everything.filter((cl) => !cl.isClient);
    return everything;
  }, [everything, segment]);

  const categoryOpts = useMemo(() => optsFor(all, (cl) => cl.industry), [all]);
  const areaOpts = useMemo(() => optsFor(all, (cl) => cl.location), [all]);
  const pincodeOpts = useMemo(() => optsFor(all, (cl) => cl.pincode), [all]);
  const sourceOpts = useMemo(() => optsFor(all, (cl) => cl.source), [all]);
  const healthOpts = useMemo(
    () => ['good', 'watch', 'risk']
      .map((h) => ({ value: h, label: HEALTH[h].label, count: all.filter((cl) => (cl.health || 'good') === h).length }))
      .filter((o) => o.count > 0),
    [all],
  );

  const activeFilterCount =
    categories.length + areas.length + pincodes.length + healths.length +
    ratings.length + sources.length +
    (withPhone ? 1 : 0) + (withWa ? 1 : 0) + (withSite ? 1 : 0) + (openOnly ? 1 : 0);

  const clearFilters = () => {
    setCategories([]); setAreas([]); setPincodes([]); setHealths([]);
    setRatings([]); setSources([]);
    setWithPhone(false); setWithWa(false); setWithSite(false); setOpenOnly(false);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    return all.filter((cl) => {
      if (t) {
        const hay = [
          cl.name, cl.industry, cl.location, cl.phone, cl.whatsapp, cl.address, cl.pincode,
          cl.website, cl.source, (cl.tags || []).join(' '),
          (cl.contacts || []).map((p) => [p.name, p.phone].filter(Boolean).join(' ')).join(' '),
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(t)) return false;
      }
      if (categories.length && !categories.includes((cl.industry || '').trim())) return false;
      if (areas.length && !areas.includes((cl.location || '').trim())) return false;
      if (pincodes.length && !pincodes.includes((cl.pincode || '').trim())) return false;
      if (healths.length && !healths.includes(cl.health || 'good')) return false;
      if (sources.length && !sources.includes((cl.source || '').trim())) return false;
      if (ratings.length) {
        const bands = RATING_BANDS.filter((b) => ratings.includes(b.value));
        if (!bands.some((b) => b.test(cl.rating))) return false;
      }
      if (withPhone && !cl.phone) return false;
      if (withWa && !waNumber(cl)) return false;
      if (withSite && !cl.website) return false;
      if (openOnly && !(cl.openRequisitions > 0)) return false;
      return true;
    });
  }, [all, search, categories, areas, pincodes, healths, ratings, sources, withPhone, withWa, withSite, openOnly]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const valOf = (cl: Client): string | number => {
      switch (sortKey) {
        case 'category': return (cl.industry || '').toLowerCase();
        case 'area': return (cl.location || '').toLowerCase();
        case 'phone': return cl.phone || '';
        case 'whatsapp': return waNumber(cl) || '';
        case 'rating': return cl.rating ?? -1;
        case 'reviews': return cl.reviewsCount ?? -1;
        case 'website': return (cl.website || '').toLowerCase();
        case 'pincode': return cl.pincode || '';
        case 'address': return (cl.address || '').toLowerCase();
        case 'health': return cl.health || '';
        case 'openReqs': return cl.openRequisitions ?? 0;
        case 'submissions': return cl.submissions ?? 0;
        case 'placements': return cl.placements ?? 0;
        case 'source': return (cl.source || '').toLowerCase();
        default: return (cl.name || '').toLowerCase();
      }
    };
    return [...filtered].sort((a, b) => {
      const x = valOf(a); const y = valOf(b);
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x).localeCompare(String(y)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => { setPage(1); }, [segment, search, categories, areas, pincodes, healths, ratings, sources, withPhone, withWa, withSite, openOnly]);

  const activeCols = COLUMN_DEFS.filter((col) => visibleCols[col.id]);

  const toggleSort = (id: ColId) => {
    if (sortKey === id) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(id); setSortDir(id === 'rating' || id === 'reviews' || id === 'openReqs' ? 'desc' : 'asc'); }
  };

  const hoursToday = (cl: Client) => (cl.hours || {})[DAY_KEYS[new Date().getDay()]] || '—';

  const cell = (cl: Client, id: ColId): React.ReactNode => {
    switch (id) {
      case 'name':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <Avatar name={cl.name} id={cl.id} size={26} square />
            <span style={{ fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cl.name}
            </span>
          </div>
        );
      case 'category': return cl.industry || '—';
      case 'area': return cl.location || '—';
      case 'phone': return cl.phone || '—';
      case 'whatsapp': {
        const wa = waNumber(cl);
        if (!wa) return '—';
        return (
          <button
            type="button"
            title={`WhatsApp ${wa}`}
            onClick={(e) => { e.stopPropagation(); openWhatsApp(wa, cl.name); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none',
              background: 'transparent', cursor: 'pointer', padding: 0,
              color: '#25D366', fontSize: 12.5, fontWeight: 600,
            }}
          >
            <Icon name="chat" size={13} color="#25D366" />
            <span className="mono">{wa}</span>
          </button>
        );
      }
      case 'rating':
        return cl.rating == null ? '—' : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Icon name="star" size={13} color={T.amber} />
            <span className="mono">{cl.rating.toFixed(1)}</span>
          </span>
        );
      case 'reviews': return cl.reviewsCount == null ? '—' : num(cl.reviewsCount);
      case 'website':
        return cl.website ? (
          <a
            href={cl.website}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            style={{ color: T.indigo, textDecoration: 'none' }}
          >
            {cl.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        ) : '—';
      case 'pincode': return cl.pincode || '—';
      case 'address': return cl.address || '—';
      case 'health': {
        const h = HEALTH[cl.health] || HEALTH.good;
        return <Badge label={h.label} bg={h.bg} fg={h.fg} />;
      }
      case 'openReqs': return num(cl.openRequisitions || 0);
      case 'submissions': return num(cl.submissions || 0);
      case 'placements': return num(cl.placements || 0);
      case 'source': return cl.source || '—';
      case 'hoursToday': return hoursToday(cl);
      case 'tags': return (cl.tags || []).join(', ') || '—';
      default: return '—';
    }
  };

  const filterChip = (on: boolean, set: (v: boolean) => void, label: string, icon: string) => (
    <button
      type="button"
      onClick={() => set(!on)}
      style={{
        ...compactCtrl,
        display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
        background: on ? T.indigoTint : T.surface,
        border: `1px solid ${on ? T.indigo : T.border}`,
        color: on ? T.indigoInk : T.inkBody,
        fontWeight: on ? 650 : 500,
      }}
    >
      <Icon name={icon} size={14} color={on ? T.indigo : T.inkFaint} />
      {label}
    </button>
  );

  return (
    <div className="pad">
      {/* ---------------- segment ---------------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <div
          role="tablist"
          aria-label="Account segment"
          style={{
            display: 'inline-flex', border: `1px solid ${T.border}`,
            borderRadius: 9, overflow: 'hidden', height: 32, background: T.surface,
          }}
        >
          {SEGMENTS.map((sg) => {
            const on = segment === sg.id;
            return (
              <button
                key={sg.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setSegment(sg.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '0 12px', height: 32, border: 'none', cursor: 'pointer',
                  background: on ? T.indigo : 'transparent',
                  color: on ? '#fff' : T.inkBody,
                  fontSize: 12.5, fontWeight: on ? 700 : 550,
                }}
              >
                {sg.label}
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: on ? 'rgba(255,255,255,.82)' : T.inkFaint,
                  }}
                >
                  {num(segmentCounts[sg.id])}
                </span>
              </button>
            );
          })}
        </div>
        {segment === 'prospects' && (
          <span style={{ fontSize: 11.5, color: T.inkMuted }}>
            Imported leads — not shown on the public portal.
          </span>
        )}
      </div>

      {/* ---------------- toolbar ---------------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200, maxWidth: 360 }}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${w.clientPlural.toLowerCase()}, phone, area, pincode…`}
            style={{ height: 32, paddingLeft: 30, fontSize: 12 }}
          />
          <span style={{ position: 'absolute', left: 9, top: 8, pointerEvents: 'none' }}>
            <Icon name="search" size={15} color={T.inkFaint} />
          </span>
        </div>

        <MultiSelect label="Category" values={categories} options={categoryOpts} onChange={setCategories} width={140} />
        <MultiSelect label="Area" values={areas} options={areaOpts} onChange={setAreas} width={140} />
        <MultiSelect label="Pincode" values={pincodes} options={pincodeOpts} onChange={setPincodes} width={110} />
        <MultiSelect label="Rating" values={ratings} options={RATING_BANDS.map((b) => ({ value: b.value, label: b.label }))} onChange={setRatings} width={120} />
        {healthOpts.length > 1 && (
          <MultiSelect label="Health" values={healths} options={healthOpts} onChange={setHealths} width={110} />
        )}
        {sourceOpts.length > 1 && (
          <MultiSelect label="Source" values={sources} options={sourceOpts} onChange={setSources} width={120} />
        )}

        {filterChip(withPhone, setWithPhone, 'Has phone', 'call')}
        {filterChip(withWa, setWithWa, 'Has WhatsApp', 'chat')}
        {filterChip(withSite, setWithSite, 'Has site', 'language')}
        {filterChip(openOnly, setOpenOnly, 'Open roles', 'work')}

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
          <Select
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(':');
              setSortKey(k as ColId); setSortDir(d as 'asc' | 'desc');
            }}
            title="Sort by"
            style={{ ...compactCtrl, width: 150, flex: '0 0 150px' }}
          >
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
            <option value="rating:desc">Rating high–low</option>
            <option value="reviews:desc">Most reviewed</option>
            <option value="openReqs:desc">Most open roles</option>
            <option value="area:asc">Area</option>
            <option value="category:asc">Category</option>
          </Select>

          <Button
            variant="ghost"
            icon="download"
            title="Download Excel (rows matching current filters)"
            aria-label="Download Excel"
            onClick={() => downloadClientsXlsx(sorted, clientExportFilename())}
            disabled={!sorted.length}
            style={{ height: 32, width: 32, padding: 0, minWidth: 32 }}
          />

          <div style={{ display: 'inline-flex', border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', height: 32 }}>
            {([
              ['table', 'table_rows', 'Table view'],
              ['cards', 'grid_view', 'Card view'],
            ] as const).map(([mode, icon, label]) => (
              <button
                key={mode}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={viewMode === mode}
                onClick={() => setViewMode(mode)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, padding: 0, margin: 0, lineHeight: 0, boxSizing: 'border-box',
                  background: viewMode === mode ? T.indigoTint : 'transparent',
                  border: 'none', cursor: 'pointer',
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
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowColsMenu(false)} />
                  <div
                    style={{
                      position: 'absolute', right: 0, top: 36, zIndex: 50, width: 240,
                      maxHeight: 360, overflowY: 'auto', background: T.surface,
                      border: `1px solid ${T.border}`, borderRadius: 10,
                      boxShadow: '0 10px 30px rgba(20,18,40,.14)', padding: 6,
                    }}
                  >
                    {COLUMN_DEFS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setVisibleCols((v) => ({ ...v, [col.id]: !v[col.id] }))}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                          borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <Icon
                          name={visibleCols[col.id] ? 'check_box' : 'check_box_outline_blank'}
                          size={17}
                          color={visibleCols[col.id] ? T.indigo : T.borderInput}
                        />
                        <span style={{ fontSize: 12.5 }}>{col.label}</span>
                      </button>
                    ))}
                    <div style={{ display: 'flex', gap: 6, borderTop: `1px solid ${T.divider}`, marginTop: 6, paddingTop: 6 }}>
                      <Button
                        variant="ghost"
                        onClick={() => setVisibleCols(Object.fromEntries(COLUMN_DEFS.map((x) => [x.id, true])) as Record<ColId, boolean>)}
                        style={{ height: 28, fontSize: 12 }}
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setVisibleCols(Object.fromEntries(COLUMN_DEFS.map((x) => [x.id, x.defaultOn])) as Record<ColId, boolean>)}
                        style={{ height: 28, fontSize: 12 }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <span className="mono" style={{ fontSize: 11.5, color: T.inkMuted, whiteSpace: 'nowrap' }}>
            {num(sorted.length)}{sorted.length !== all.length ? ` / ${num(all.length)}` : ''}
          </span>
        </div>
      </div>

      {/* ---------------- body ---------------- */}
      {load.loading && <SkeletonRows rows={5} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !all.length && (
        <EmptyState
          icon="apartment"
          title={`No ${w.clientPlural.toLowerCase()} yet`}
          body="Companies added to the portal appear here as client accounts."
        />
      )}
      {load.data && !!all.length && !sorted.length && (
        <EmptyState icon="search_off" title={`No ${w.clientPlural.toLowerCase()} match`} body="Widen or clear filters." />
      )}

      {viewMode === 'cards' && !!rows.length && (
        <div className="grid-panels">
          {rows.map((cl) => {
            const h = HEALTH[cl.health] || HEALTH.good;
            return (
              <Card key={cl.id} onClick={() => setOpenId(cl.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={cl.name} id={cl.id} size={40} square />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>{cl.name}</div>
                    <div style={{ marginTop: 2, fontSize: 11.5, color: T.inkMuted }}>
                      {[cl.industry, cl.location].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                  <Badge label={h.label} bg={h.bg} fg={h.fg} />
                </div>

                {(cl.rating != null || cl.phone) && (
                  <div style={{ marginTop: 9, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 11.5, color: T.inkMuted }}>
                    {cl.rating != null && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Icon name="star" size={13} color={T.amber} />
                        <span className="mono" style={{ fontWeight: 700, color: T.inkBody }}>{cl.rating.toFixed(1)}</span>
                        {cl.reviewsCount != null && <span>({num(cl.reviewsCount)})</span>}
                      </span>
                    )}
                    {cl.phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="call" size={13} color={T.inkFaint} />
                        <span className="mono">{cl.phone}</span>
                      </span>
                    )}
                  </div>
                )}

                {(waNumber(cl) || mapsHref(cl)) && (
                  <div style={{ marginTop: 9, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {waNumber(cl) && (
                      <button
                        type="button"
                        title={`WhatsApp ${waNumber(cl)}`}
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(waNumber(cl), cl.name); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, height: 26,
                          padding: '0 9px', borderRadius: 7, cursor: 'pointer',
                          border: `1px solid ${T.border}`, background: T.surface,
                          color: '#25D366', fontSize: 11.5, fontWeight: 650,
                        }}
                      >
                        <Icon name="chat" size={13} color="#25D366" /> WhatsApp
                      </button>
                    )}
                    {mapsHref(cl) && (
                      <button
                        type="button"
                        title="Open on Google Maps"
                        onClick={(e) => { e.stopPropagation(); window.open(mapsHref(cl) as string, '_blank', 'noopener,noreferrer'); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, height: 26,
                          padding: '0 9px', borderRadius: 7, cursor: 'pointer',
                          border: `1px solid ${T.border}`, background: T.surface,
                          color: T.inkBody, fontSize: 11.5, fontWeight: 650,
                        }}
                      >
                        <Icon name="place" size={13} color={T.inkMuted} /> Map
                      </button>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700 }}>{cl.openRequisitions} open</span>
                  <span style={{ fontSize: 11.5, color: T.inkMuted }}>{cl.submissions} submitted</span>
                  <span style={{ fontSize: 11.5, color: T.inkMuted }}>{cl.placements} placed</span>
                  {c.rates && (
                    <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: cl.marginPct ? T.teal : T.inkGhost }}>
                      {cl.marginPct ? `${cl.marginPct}%` : '—'}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === 'table' && !!rows.length && (
        <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10, background: T.surface }}>
          <table className="tbl" style={{ width: '100%', minWidth: activeCols.length * 110, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {activeCols.map((col) => {
                  const active = sortKey === col.id;
                  return (
                    <th
                      key={col.id}
                      onClick={() => toggleSort(col.id)}
                      style={{
                        position: 'sticky', top: 0, zIndex: 2, background: T.surface,
                        padding: '8px 10px', textAlign: 'left', whiteSpace: 'nowrap',
                        borderBottom: `1px solid ${T.divider}`, fontSize: 11, fontWeight: 700,
                        color: active ? T.indigoInk : T.inkMuted, minWidth: col.minW,
                        letterSpacing: '0.02em', cursor: 'pointer', userSelect: 'none',
                      }}
                    >
                      {col.label}
                      {active && (
                        <Icon name={sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'} size={12} color={T.indigo} />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((cl) => (
                <tr
                  key={cl.id}
                  onClick={() => setOpenId(cl.id)}
                  style={{
                    cursor: 'pointer',
                    background: cl.id === openId ? T.indigoTint : 'transparent',
                  }}
                >
                  {activeCols.map((col) => (
                    <td
                      key={col.id}
                      style={{
                        padding: '7px 10px', borderBottom: `1px solid ${T.dividerFaint}`,
                        fontSize: 12.5, verticalAlign: 'middle',
                        maxWidth: col.id === 'address' ? 320 : 260,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                      title={col.id === 'address' ? (cl.address || '') : undefined}
                    >
                      {cell(cl, col.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {openId && (
        <>
          <div
            role="presentation"
            onClick={closeDrawer}
            style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(20, 18, 40, 0.32)' }}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${w.client} details`}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(460px, 100vw)', zIndex: 90,
              background: T.surface,
              boxShadow: '-16px 0 48px rgba(20, 18, 40, 0.2)',
              display: 'flex', flexDirection: 'column',
              animation: 'nxthikeDrawerIn .18s ease-out',
            }}
          >
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: 12 }}>
              <ClientDetailBody
                clientId={openId}
                compact
                showClose
                onClose={closeDrawer}
                onExpand={() => { const id = openId; setOpenId(null); go('client', { clientId: id }); }}
                onSaved={() => load.reload()}
              />
            </div>
          </aside>
        </>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <Button
            variant="ghost"
            icon="chevron_left"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            style={{ height: 30 }}
          >
            Prev
          </Button>
          <span className="mono" style={{ fontSize: 12, color: T.inkMuted }}>
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            icon="chevron_right"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            style={{ height: 30 }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
