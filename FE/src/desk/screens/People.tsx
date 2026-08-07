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
  FactGrid, Icon, Input, Panel, Select, SkeletonRows, Textarea,
  maskEmail, maskPhone, num, shortDate, splitList, useLoad, useMediaQuery, whenLabel,
} from '../ui';
import { CallRow } from './Calls';

const STATUS_CHIPS = [
  { key: 'all', label: 'All stages' },
  { key: 'new', label: 'Sourced' },
  { key: 'reviewing', label: 'Screening' },
  { key: 'shortlisted', label: 'Submitted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'on_hold', label: 'On hold' },
];

/* ------------------------------------------------------------------ *
 *  Candidates                                                        *
 * ------------------------------------------------------------------ */

export function CandidatesScreen() {
  const { candidateId, go, caps, session, openModal, selection, toggleSelect, clearSelection } = useDesk();
  const c = caps();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const isFullAdmin = c.admin === true;
  const canEdit = isFullAdmin || !!c.create;

  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState('all');
  const [roleId, setRoleId] = useState('all');
  const [experience, setExperience] = useState('all'); // all | yes | no
  const [starredOnly, setStarredOnly] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [dncOnly, setDncOnly] = useState(false);
  const [noConsent, setNoConsent] = useState(false);
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showList, setShowList] = useState(!candidateId);
  // Admins with full DB access start unmasked; restricted roles stay masked.
  const [unmask, setUnmask] = useState(() => c.db === 'all' || c.admin === true);
  const [editOpen, setEditOpen] = useState(false);

  // Debounce search so we don't hit the API on every keystroke (23k rows).
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(query.trim()), 320);
    return () => window.clearTimeout(t);
  }, [query]);

  React.useEffect(() => { setPage(1); }, [debouncedQ, status, roleId, experience, starredOnly, hasNotes, sortKey, sortDir]);

  const rolesLoad = useLoad(() => deskApi.hiringDashboard().then((d) => d.roles || []), []);

  const list = useLoad(
    () => deskApi.candidates({
      search: debouncedQ || undefined,
      status: status !== 'all' ? status : undefined,
      roleId: roleId !== 'all' ? roleId : undefined,
      experience: experience !== 'all' ? experience : undefined,
      starredOnly: starredOnly || undefined,
      hasNotes: hasNotes || undefined,
      sortKey,
      sortDir,
      page,
      pageSize: 60,
    }),
    [debouncedQ, status, roleId, experience, starredOnly, hasNotes, sortKey, sortDir, page],
  );

  let rows = list.data?.items || [];
  // Client-side filters for fields not (yet) on the list API
  if (dncOnly) rows = rows.filter((r) => r.dnc);
  if (hasPhone) rows = rows.filter((r) => !!(r.phone && String(r.phone).replace(/\D/g, '').length >= 8));
  if (hasResume) rows = rows.filter((r) => !!(r.resumeLink || r.downloadLink));
  if (noConsent) rows = rows.filter((r) => !r.consentAt);

  const selectedId = candidateId || rows[0]?.id || null;
  const detail = useLoad(async () => (selectedId ? deskApi.candidate(selectedId) : null), [selectedId]);

  /*
   * `piiMasked` comes from the API, which masks on the way out for these roles
   * — the real number never reaches this browser, so the toggle below cannot
   * reveal it and says so instead of pretending.
   */
  const lockedByRole = detail.data?.piiMasked
    ?? (c.db === 'limitedPII' || c.db === 'ownReqs' || c.db === 'ownInterviews');
  const masked = lockedByRole || !unmask;
  const selectedCount = Object.keys(selection).length;
  const totalPages = list.data?.totalPages || 1;
  const activeFilterCount = [
    status !== 'all', roleId !== 'all', experience !== 'all', starredOnly, hasNotes,
    hasPhone, hasResume, dncOnly, noConsent, !!debouncedQ,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery(''); setDebouncedQ(''); setStatus('all'); setRoleId('all');
    setExperience('all'); setStarredOnly(false); setHasNotes(false);
    setHasPhone(false); setHasResume(false); setDncOnly(false); setNoConsent(false);
    setSortKey('updatedAt'); setSortDir('desc'); setPage(1);
  };

  const toggleOpts = [
    [starredOnly, setStarredOnly, 'Starred', 'star'] as const,
    [hasNotes, setHasNotes, 'Has notes', 'note'] as const,
    [hasPhone, setHasPhone, 'Has phone', 'call'] as const,
    [hasResume, setHasResume, 'Has resume', 'description'] as const,
    [dncOnly, setDncOnly, 'DND flagged', 'block'] as const,
    [noConsent, setNoConsent, 'No consent', 'gpp_maybe'] as const,
  ];

  const fieldLabel: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: T.inkMuted,
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const filterBar = (
    <div
      className="card people-filter-bar"
      style={{
        flexShrink: 0,
        padding: isMobile ? 12 : '16px 18px',
        marginBottom: 14,
      }}
    >
      {/* Primary toolbar — full workspace width */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : 'minmax(0, 1.6fr) minmax(220px, 280px) minmax(160px, 200px) auto',
          gap: 12,
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'block', minWidth: 0 }}>
          <span style={fieldLabel}>Search</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: T.fill,
              borderRadius: 10,
              padding: '0 12px',
              height: 40,
              border: `1px solid ${T.border}`,
              minWidth: 0,
            }}
          >
            <Icon name="search" size={19} color={T.inkMuted} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, phone, email, city, skills…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, minWidth: 0,
              }}
            />
            {query ? (
              <button type="button" onClick={() => setQuery('')} title="Clear search" style={{ padding: 2 }}>
                <Icon name="close" size={16} color={T.inkFaint} />
              </button>
            ) : null}
          </div>
        </label>

        <label style={{ display: 'block', minWidth: 0 }}>
          <span style={fieldLabel}>Hiring role</span>
          <Select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            style={{ height: 40, fontSize: 13, width: '100%', minWidth: 0 }}
          >
            <option value="all">All roles</option>
            {(rolesLoad.data || []).map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.count})</option>
            ))}
          </Select>
        </label>

        <label style={{ display: 'block', minWidth: 0 }}>
          <span style={fieldLabel}>Experience</span>
          <Select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            style={{ height: 40, fontSize: 13, width: '100%' }}
          >
            <option value="all">Any</option>
            <option value="yes">Has experience</option>
            <option value="no">Fresher</option>
          </Select>
        </label>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            justifyContent: isMobile ? 'flex-start' : 'flex-end',
            paddingBottom: 0,
          }}
        >
          <Button
            variant={showMoreFilters || activeFilterCount > 0 ? 'soft' : 'ghost'}
            icon="tune"
            onClick={() => setShowMoreFilters((v) => !v)}
          >
            {showMoreFilters ? 'Less' : 'More'}
            {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" icon="filter_alt_off" onClick={clearFilters}>
              Clear
            </Button>
          )}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: isMobile ? 0 : 4,
              padding: '0 4px',
              height: 36,
              fontSize: 12,
              color: T.inkFaint,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontWeight: 600, color: T.inkMuted }}>
              {list.data
                ? `${num(list.data.total)} match${list.data.total === 1 ? '' : 'es'}`
                : '…'}
            </span>
            {totalPages > 1 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0, marginLeft: 4 }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ opacity: page <= 1 ? 0.35 : 1, padding: 2, borderRadius: 8 }}
                  title="Previous page"
                >
                  <Icon name="chevron_left" size={20} color={T.inkMuted} />
                </button>
                <span className="mono" style={{ minWidth: 40, textAlign: 'center', fontSize: 11 }}>
                  {page}/{totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ opacity: page >= totalPages ? 0.35 : 1, padding: 2, borderRadius: 8 }}
                  title="Next page"
                >
                  <Icon name="chevron_right" size={20} color={T.inkMuted} />
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline stages — full-width chip row */}
      <div style={{ marginTop: 14 }}>
        <span style={{ ...fieldLabel, marginBottom: 8 }}>Stage</span>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {STATUS_CHIPS.map((x) => (
            <Chip key={x.key} label={x.label} on={status === x.key} onClick={() => setStatus(x.key)} />
          ))}
        </div>
      </div>

      {/* Expanded filters — equal columns across the workspace */}
      {showMoreFilters && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${T.divider}`,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'repeat(2, minmax(0, 1fr))',
              gap: 14,
              maxWidth: 560,
            }}
          >
            <label style={{ display: 'block', minWidth: 0 }}>
              <span style={fieldLabel}>Sort by</span>
              <Select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                style={{ height: 40, fontSize: 13, width: '100%' }}
              >
                <option value="updatedAt">Recently updated</option>
                <option value="createdAt">Recently added</option>
                <option value="name">Name A–Z</option>
                <option value="status">Stage</option>
                <option value="city">City</option>
              </Select>
            </label>

            <label style={{ display: 'block', minWidth: 0 }}>
              <span style={fieldLabel}>Order</span>
              <Select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
                style={{ height: 40, fontSize: 13, width: '100%' }}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <span style={{ ...fieldLabel, marginBottom: 10 }}>Quick filters</span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(auto-fill, minmax(168px, 1fr))',
                gap: 10,
              }}
            >
              {toggleOpts.map(([on, set, label, icon]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => set(!on)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    minHeight: 44,
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    background: on ? T.indigoTint : T.fill,
                    color: on ? T.indigoInk : T.inkBody,
                    border: `1.5px solid ${on ? T.indigo : T.border}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background .12s, border-color .12s',
                  }}
                >
                  <Icon
                    name={on ? 'check_circle' : icon}
                    size={18}
                    color={on ? T.indigo : T.inkFaint}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter pills when advanced panel is collapsed */}
      {!showMoreFilters && activeFilterCount > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: T.inkFaint, fontWeight: 600 }}>Active:</span>
          {status !== 'all' && (
            <Chip label={`Stage: ${STATUS_CHIPS.find((x) => x.key === status)?.label || status}`} on onClick={() => setStatus('all')} />
          )}
          {roleId !== 'all' && (
            <Chip
              label={`Role: ${rolesLoad.data?.find((r) => r.id === roleId)?.name || roleId}`}
              on
              onClick={() => setRoleId('all')}
            />
          )}
          {experience !== 'all' && (
            <Chip label={experience === 'yes' ? 'With experience' : 'Fresher'} on onClick={() => setExperience('all')} />
          )}
          {toggleOpts.filter(([on]) => on).map(([, set, label]) => (
            <Chip key={label} label={label} on onClick={() => set(false)} />
          ))}
          {debouncedQ && (
            <Chip label={`“${debouncedQ}”`} on onClick={() => { setQuery(''); setDebouncedQ(''); }} />
          )}
        </div>
      )}
    </div>
  );

  const listPane = (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', height: '100%' }}>
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `1px solid ${T.divider}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.inkBody }}>Results</span>
        <span style={{ fontSize: 11, color: T.inkFaint }}>
          {list.data ? `${num(rows.length)} of ${num(list.data.total)}` : '…'}
        </span>
      </div>

      {selectedCount > 0 && (
        <div style={{ padding: '10px 14px', background: T.indigoTint, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.indigoInk }}>{selectedCount} selected</span>
          <Button variant="soft" onClick={() => openModal('filters')}>Tag / hand off</Button>
          <button type="button" onClick={clearSelection} style={{ marginLeft: 'auto', fontSize: 11.5, color: T.indigoInk }}>Clear</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {list.loading && <div style={{ padding: 12 }}><SkeletonRows rows={7} /></div>}
        {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
        {list.data && !rows.length && (
          <EmptyState
            icon="person_search"
            title="No candidates match"
            body="Widen or clear filters, or add this person to the database."
            actionLabel={c.create ? 'Add candidate' : undefined}
            onAction={() => go('addcand')}
          />
        )}
        {rows.map((r) => {
          const st = stage(r.status);
          const on = r.id === selectedId;
          return (
            <div
              key={r.id}
              onClick={() => { go('cands', { candidateId: r.id }); setShowList(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px',
                borderBottom: `1px solid ${T.dividerFaint}`, cursor: 'pointer',
                background: on ? T.indigoTint : 'transparent',
              }}
            >
              {c.create && (
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
            </div>
          );
        })}
      </div>
    </div>
  );

  const cand = detail.data;
  const detailPane = !cand ? (
    <Card><EmptyState icon="groups" title="No candidate selected" body="Pick someone from the list." /></Card>
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
        onReload={() => { detail.reload(); list.reload(); }}
        onBack={isMobile ? () => setShowList(true) : undefined}
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

  return (
    <div className="pad" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, boxSizing: 'border-box' }}>
      {/* Filters span the full content width — not the narrow list column */}
      {(isMobile ? showList : true) && filterBar}

      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{showList ? listPane : detailPane}</div>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
            gap: 16,
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
 *  Profile                                                           *
 * ------------------------------------------------------------------ */

const TABS = ['Overview', 'Timeline', 'Documents', 'Notes', 'Submissions', 'Calls'] as const;

function CandidateProfile({
  cand, masked, lockedByRole, canEdit, isAdmin, onToggleMask, onEdit, onReload, onBack,
}: {
  cand: DeskCandidate; masked: boolean; lockedByRole: boolean;
  canEdit: boolean; isAdmin: boolean;
  onToggleMask: () => void; onEdit: () => void; onReload: () => void; onBack?: () => void;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        {onBack && (
          <Button variant="ghost" icon="arrow_back" onClick={onBack} style={{ marginBottom: 12 }}>
            Back to list
          </Button>
        )}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Avatar name={cand.name} id={cand.id} size={52} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>{cand.name || 'Unnamed'}</div>
            <div style={{ marginTop: 3, fontSize: 12.5, color: T.inkMuted }}>
              {[cand.latestRole, cand.latestCompany].filter(Boolean).join(' · ') || cand.roleName}
            </div>
            <div style={{ marginTop: 9, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge label={st.label} bg={st.tint} fg={st.color} />
              <Badge
                label={cand.consentAt ? 'Consent on file' : 'No consent'}
                bg={cand.consentAt ? T.greenTint : T.amberTint}
                fg={cand.consentAt ? T.green : T.amberInk}
                icon={cand.consentAt ? 'verified_user' : 'gpp_maybe'}
              />
              {cand.dnc && <Badge label="DND · do not call" bg={T.maroonTint} fg={T.maroon} icon="block" />}
              {cand.source && <Badge label={cand.source} bg={T.fill} fg={T.inkMuted} />}
            </div>
          </div>
          <button
            onClick={onToggleMask}
            title={lockedByRole
              ? 'The API masked these before sending them — the full value is not in this browser.'
              : 'Toggle PII masking'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, borderRadius: 9, padding: '6px 10px',
              background: masked ? T.amberTint : T.fill, cursor: lockedByRole ? 'not-allowed' : 'pointer',
            }}
          >
            <Icon name={masked ? 'visibility_off' : 'visibility'} size={16} color={masked ? T.amberInk : T.inkMuted} />
            <span className="mono" style={{ fontSize: 9, color: masked ? T.amberInk : T.inkMuted }}>
              {lockedByRole ? 'PII LOCKED BY ROLE' : masked ? 'PII MASKED' : 'FULL VIEW'}
            </span>
          </button>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {c.dial && (
            <Button icon="call" onClick={() => go('queue', { candidateId: cand.id })} disabled={!!cand.dnc}>
              {cand.dnc ? 'Blocked · DND' : 'Call'}
            </Button>
          )}
          <Button variant="ghost" icon="chat" onClick={() => go('composer', { candidateId: cand.id })}>Message</Button>
          {c.stage && (
            <Select value={cand.status} onChange={(e) => setStage(e.target.value)} style={{ width: 'auto', height: 36 }}>
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              <option value="on_hold">On hold</option>
            </Select>
          )}
          {canEdit && (
            <Button variant={isAdmin ? 'primary' : 'soft'} icon="edit" onClick={onEdit}>
              {isAdmin ? 'Edit all details' : 'Edit'}
            </Button>
          )}
          <Button variant="ghost" icon="content_copy" onClick={() => go('merge', { candidateId: cand.id })}>
            Find duplicates
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${T.divider}`, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 12px', fontSize: 12.5, whiteSpace: 'nowrap',
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? T.indigo : T.inkMuted,
              borderBottom: `2.5px solid ${tab === t ? T.indigo : 'transparent'}`,
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

  const field = (label: string, key: keyof typeof form, opts?: { multiline?: boolean; type?: string }) => (
    <div key={String(key)}>
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

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="modal"
        style={{
          width: 'min(720px, calc(100vw - 24px))',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {field('Full name', 'name')}
            {field('Phone', 'phone')}
            {field('Email', 'email')}
            {field('City', 'city')}
            {field('Gender', 'gender')}
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
            {field('Institute', 'institute')}
            {field('Degree', 'degree')}
            {field('Stream', 'stream')}
            {field('Graduation year', 'graduationYear')}
            {field('Current CTC (LPA)', 'currentCtc', { type: 'number' })}
            {field('Expected CTC (LPA)', 'expectedCtc', { type: 'number' })}
            {field('Notice days', 'noticeDays', { type: 'number' })}
            {field('Availability', 'availability')}
            {field('Skills (other)', 'otherSkills', { multiline: true })}
            {field('Relevant skills', 'relevantSkills', { multiline: true })}
            {field('Resume URL', 'resumeLink')}
            {field('Download URL', 'downloadLink')}
            {field('Application link', 'applicationLink')}
            {field('Languages', 'languages')}
            {field('Certifications', 'certifications', { multiline: true })}
            {field('Projects', 'projects', { multiline: true })}
            {field('Companies history', 'companies', { multiline: true })}
            {field('Job titles history', 'jobTitles', { multiline: true })}
            {field('Career objective', 'careerObjective', { multiline: true })}
            {field('Notes', 'notes', { multiline: true })}
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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

export function AddCandidateScreen() {
  const { go } = useDesk();
  const roles = useLoad(() => deskApi.hiringDashboard(), []);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '', latestRole: '', latestCompany: '',
    roleId: '', source: 'Naukri', currentCtc: '', expectedCtc: '', noticeDays: '60',
  });
  const [dupe, setDupe] = useState<DeskCandidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Dedupe as you type, on the last ten digits.
  const checkDupe = async (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 6) { setDupe(null); return; }
    try {
      const res = await deskApi.candidates({ search: digits.slice(-10), pageSize: 5 });
      setDupe(res.items.find((c) => (c.phone || '').replace(/\D/g, '').slice(-10) === digits.slice(-10)) || null);
    } catch { setDupe(null); }
  };

  const valid = form.name.trim() && form.phone.trim() && form.roleId;

  const save = async () => {
    if (!valid) return;
    setSaving(true); setError(null);
    try {
      const created = await deskApi.createCandidate({
        roleId: form.roleId,
        roleName: roles.data?.roles.find((r) => r.id === form.roleId)?.name || '',
        name: form.name, phone: form.phone, email: form.email || null, city: form.city || null,
        latestRole: form.latestRole || null, latestCompany: form.latestCompany || null,
        status: 'new', tags: [form.source],
      });
      go('cands', { candidateId: created.id });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pad">
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
          <div>
            <label className="label">Full name *</label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ritu Malhotra" />
          </div>
          <div>
            <label className="label">Mobile number *</label>
            <Input value={form.phone} placeholder="98200 41562"
              onChange={(e) => { set('phone', e.target.value); checkDupe(e.target.value); }}
              style={dupe ? { borderColor: '#E0A83A' } : undefined} />
          </div>
          <div>
            <label className="label">Email</label>
            <Input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@company.com" />
          </div>
          <div>
            <label className="label">City</label>
            <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Pune" />
          </div>
          <div>
            <label className="label">Current role</label>
            <Input value={form.latestRole} onChange={(e) => set('latestRole', e.target.value)} placeholder="e.g. Senior Java Developer" />
          </div>
          <div>
            <label className="label">Current company</label>
            <Input value={form.latestCompany} onChange={(e) => set('latestCompany', e.target.value)} placeholder="e.g. Infosys" />
          </div>
          <div>
            <label className="label">Requisition *</label>
            <Select value={form.roleId} onChange={(e) => set('roleId', e.target.value)}>
              <option value="">Choose…</option>
              {(roles.data?.roles || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="label">Source</label>
            <Select value={form.source} onChange={(e) => set('source', e.target.value)}>
              {['Naukri', 'LinkedIn', 'Referral', 'Internshala', 'Apna', 'Walk-in'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>

        {dupe && (
          <div style={{ marginTop: 14 }}>
            <Banner icon="content_copy" tone="warn"
              action={<Button variant="soft" onClick={() => go('cands', { candidateId: dupe.id })}>Open existing</Button>}
            >
              <strong>Possible duplicate.</strong> {dupe.name} already has this number
              {dupe.roleName ? ` on ${dupe.roleName}` : ''}.
            </Banner>
          </div>
        )}

        {error && <div style={{ marginTop: 14 }}><Banner icon="error" tone="danger">{error}</Banner></div>}

        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <Button onClick={save} disabled={!valid || saving}>
            {saving ? 'Saving…' : valid ? 'Save candidate' : 'Name, number and requisition required'}
          </Button>
          <Button variant="ghost" onClick={() => go('cands')}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
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
              body="Filter the candidate list, then save it as a long-list to hand to a recruiter." />
          )}
          {(searches.data || []).map((s) => (
            <div key={s.id} className="row row-click" onClick={() => go('cands')}>
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
