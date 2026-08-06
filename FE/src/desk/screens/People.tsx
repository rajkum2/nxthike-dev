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

const CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'reviewing', label: 'In screening' },
  { key: 'interview', label: 'At interview' },
  { key: 'offer', label: 'At offer' },
  { key: 'starred', label: 'Starred' },
  { key: 'dnc', label: 'DND flagged' },
];

/* ------------------------------------------------------------------ *
 *  Candidates                                                        *
 * ------------------------------------------------------------------ */

export function CandidatesScreen() {
  const { candidateId, go, caps, session, openModal, selection, toggleSelect, clearSelection } = useDesk();
  const c = caps();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('all');
  const [showList, setShowList] = useState(!candidateId);
  const [unmask, setUnmask] = useState(false);

  const status = ['reviewing', 'interview', 'offer'].includes(chip) ? chip : undefined;

  const list = useLoad(
    () => deskApi.candidates({ search: query || undefined, status, page: 1, pageSize: 60 }),
    [query, status],
  );

  let rows = list.data?.items || [];
  if (chip === 'starred') rows = rows.filter((r) => r.starred);
  if (chip === 'dnc') rows = rows.filter((r) => r.dnc);

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

  const listPane = (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ padding: 14, borderBottom: `1px solid ${T.divider}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.fill, borderRadius: 10, padding: '0 12px', height: 40 }}>
          <Icon name="search" size={19} color={T.inkMuted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, phone, email, city"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13 }}
          />
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {CHIPS.map((x) => <Chip key={x.key} label={x.label} on={chip === x.key} onClick={() => setChip(x.key)} />)}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: T.inkFaint }}>
          {list.data ? `${num(rows.length)} shown of ${num(list.data.total)}` : 'Loading…'}
        </div>
      </div>

      {selectedCount > 0 && (
        <div style={{ padding: '10px 14px', background: T.indigoTint, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.indigoInk }}>{selectedCount} selected</span>
          <Button variant="soft" onClick={() => openModal('filters')}>Tag / hand off</Button>
          <button onClick={clearSelection} style={{ marginLeft: 'auto', fontSize: 11.5, color: T.indigoInk }}>Clear</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {list.loading && <div style={{ padding: 12 }}><SkeletonRows rows={7} /></div>}
        {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
        {list.data && !rows.length && (
          <EmptyState icon="person_search" title="No candidates match"
            body="Clear the filters, or add this person to the database."
            actionLabel={c.create ? 'Add candidate' : undefined}
            onAction={() => go('addcand')} />
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
                <button onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }} aria-label="Select">
                  <Icon name={selection[r.id] ? 'check_box' : 'check_box_outline_blank'} size={18}
                    color={selection[r.id] ? T.indigo : T.borderInput} />
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
    <CandidateProfile
      cand={cand}
      masked={masked}
      lockedByRole={lockedByRole}
      onToggleMask={() => setUnmask((u) => !u)}
      onReload={detail.reload}
      onBack={isMobile ? () => setShowList(true) : undefined}
    />
  );

  return (
    <div className="pad" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{showList ? listPane : detailPane}</div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '330px 1fr', gap: 16 }}>
          {listPane}
          <div style={{ overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>{detailPane}</div>
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
  cand, masked, lockedByRole, onToggleMask, onReload, onBack,
}: {
  cand: DeskCandidate; masked: boolean; lockedByRole: boolean;
  onToggleMask: () => void; onReload: () => void; onBack?: () => void;
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
    <div className="pad" style={{ maxWidth: 780 }}>
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
    <div className="pad" style={{ maxWidth: 860 }}>
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
    <div className="pad" style={{ maxWidth: 900 }}>
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
