/**
 * Requisitions, pipeline board, clients and submissions.
 *
 * Commercials (bill/pay rate, margin) are withheld by the API for roles without
 * the `rates` capability, so the absence here is genuine, not cosmetic.
 */

import React, { useState } from 'react';
import { deskApi, type DeskCandidate, type Requisition } from '../api';
import { ALL_STAGES, STAGES, T, stage } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Banner, Button, Card, Chip, EmptyState, ErrorState, Eyebrow,
  FactGrid, Icon, Input, Meter, Panel, Select, SkeletonRows, Stat, Textarea,
  num, pct, shortDate, useLoad, useMediaQuery,
} from '../ui';

/* ------------------------------------------------------------------ *
 *  Requisition list                                                  *
 * ------------------------------------------------------------------ */

type SortKey = 'sla' | 'pipeline' | 'title';

export function RequisitionsScreen() {
  const { go, caps, words } = useDesk();
  const c = caps();
  const w = words();
  const [sort, setSort] = useState<SortKey>('pipeline');
  const load = useLoad(() => deskApi.requisitions(), []);

  const rows = [...(load.data || [])].sort((a, b) => {
    if (sort === 'pipeline') return b.pipelineTotal - a.pipelineTotal;
    if (sort === 'title') return a.title.localeCompare(b.title);
    // SLA first: breached, then soonest, then everything without a date.
    if (a.slaBreached !== b.slaBreached) return a.slaBreached ? -1 : 1;
    if (a.slaDue && b.slaDue) return a.slaDue.localeCompare(b.slaDue);
    return a.slaDue ? -1 : b.slaDue ? 1 : 0;
  });

  return (
    <div className="pad">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Eyebrow>Sort by</Eyebrow>
        <Chip label="Pipeline size" on={sort === 'pipeline'} onClick={() => setSort('pipeline')} />
        <Chip label="SLA urgency" on={sort === 'sla'} onClick={() => setSort('sla')} />
        <Chip label="Title" on={sort === 'title'} onClick={() => setSort('title')} />
        {c.reqs === 'all' && (
          <Button icon="add" onClick={() => go('newjob')} style={{ marginLeft: 'auto' }}>
            New {w.req.toLowerCase()}
          </Button>
        )}
      </div>

      {load.loading && <SkeletonRows rows={6} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !rows.length && (
        <EmptyState icon="work" title={`No ${w.reqPlural.toLowerCase()} yet`}
          body="Create one to group candidates and build call queues from it."
          actionLabel={c.reqs === 'all' ? `New ${w.req.toLowerCase()}` : undefined}
          onAction={() => go('newjob')} />
      )}

      {rows.length > 0 && (
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{w.req}</th>
                  <th>{w.client}</th>
                  <th style={{ textAlign: 'right' }}>Pipeline</th>
                  <th style={{ textAlign: 'right' }}>Submitted</th>
                  <th>Progress</th>
                  <th>SLA</th>
                  <th>Comp</th>
                  {c.rates && <th>Bill rate</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const advanced = r.pipelineTotal
                    ? (r.pipelineTotal - (r.byStage.new || 0)) / r.pipelineTotal : 0;
                  return (
                    <tr key={r.id} className="clickable" onClick={() => go('job', { requisitionId: r.id })}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                        {r.location && <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{r.location}</div>}
                      </td>
                      <td style={{ color: T.inkMuted }}>{r.clientName || r.department || '—'}</td>
                      <td className="mono" style={{ textAlign: 'right' }}>{num(r.pipelineTotal)}</td>
                      <td className="mono" style={{ textAlign: 'right' }}>{num(r.byStage.shortlisted || 0)}</td>
                      <td style={{ minWidth: 120 }}>
                        <Meter value={advanced} />
                        <div className="mono" style={{ fontSize: 9.5, color: T.inkFaint, marginTop: 4 }}>
                          {Math.round(advanced * 100)}% past first contact
                        </div>
                      </td>
                      <td>
                        {r.slaLabel
                          ? <span style={{ fontWeight: r.slaBreached ? 700 : 500, color: r.slaBreached ? T.red : T.inkMuted }}>{r.slaLabel}</span>
                          : <span style={{ color: T.inkGhost }}>—</span>}
                      </td>
                      <td className="mono" style={{ color: r.compLabel ? T.ink : T.inkGhost }}>{r.compLabel || '—'}</td>
                      {c.rates && (
                        <td className="mono" style={{ color: r.billRate ? T.ink : T.inkGhost }}>{r.billRate || '—'}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Requisition detail                                                *
 * ------------------------------------------------------------------ */

export function RequisitionScreen() {
  const { requisitionId, go, caps, words } = useDesk();
  const c = caps();
  const w = words();
  const load = useLoad(async () => (requisitionId ? deskApi.requisition(requisitionId) : null), [requisitionId]);
  const cands = useLoad(
    async () => (requisitionId
      ? (await deskApi.candidates({ roleId: requisitionId, pageSize: 12 })).items : []),
    [requisitionId],
  );

  if (load.loading) return <div className="pad"><SkeletonRows rows={5} /></div>;
  if (load.error) return <div className="pad"><ErrorState message={load.error} onRetry={load.reload} /></div>;
  const r = load.data;
  if (!r) return <div className="pad"><EmptyState icon="work" title="Nothing selected" body={`Pick a ${w.req.toLowerCase()} from the list.`} /></div>;

  const missingCommercials = !r.compLabel && !r.billRate;

  return (
    <div className="pad">
      <Button variant="ghost" icon="arrow_back" onClick={() => go('jobs')}>All {w.reqPlural.toLowerCase()}</Button>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>{r.title}</h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: T.inkMuted }}>
            {[w.client, r.clientName || r.department, r.location].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {c.dial && <Button icon="play_arrow" onClick={() => go('queue')}>Start calling</Button>}
          <Button variant="ghost" icon="view_kanban" onClick={() => go('kanban', { requisitionId: r.id })}>Pipeline</Button>
          <Button variant="ghost" icon="send" onClick={() => go('subs', { requisitionId: r.id })}>Submissions</Button>
        </div>
      </div>

      <div className="grid-auto" style={{ marginTop: 16 }}>
        <Stat label="In pipeline" value={num(r.pipelineTotal)} icon="groups" color={T.indigo} tint={T.indigoTint} />
        <Stat label="Submitted" value={num(r.byStage.shortlisted || 0)} icon="send" color={T.blue} tint={T.blueTint} />
        <Stat label="At interview" value={num(r.byStage.interview || 0)} icon="event" color={T.purple} tint={T.purpleTint} />
        <Stat label="Hired" value={num(r.byStage.hired || 0)} icon="check_circle" color={T.green} tint={T.greenTint} />
      </div>

      {/* Commercials — role-gated at the API */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Icon name={c.rates ? 'payments' : 'lock'} size={17} color={T.amber} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Commercials {c.rates ? '' : '· hidden for your role'}
          </span>
        </div>
        {c.rates ? (
          <>
            <FactGrid
              columns={4}
              facts={[
                ['Compensation', r.compLabel || ''],
                ['Bill rate', r.billRate || ''],
                ['Pay rate', r.payRate || ''],
                ['Priority', r.priority],
              ]}
            />
            {missingCommercials && (
              <div style={{ marginTop: 12 }}>
                <Banner icon="edit_note" tone="warn">
                  No commercial terms recorded for this {w.req.toLowerCase()} yet. They are business facts,
                  so they were deliberately not seeded — add them here when you have them.
                </Banner>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 12.5, color: T.inkMuted }}>
            Bill and pay rates are withheld from your role by the API, not merely hidden in this view.
          </div>
        )}
      </Card>

      {/* Pipeline by stage */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Pipeline</span>
          <button onClick={() => go('kanban', { requisitionId: r.id })} style={{ fontSize: 12, fontWeight: 600, color: T.indigo }}>
            Open board
          </button>
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: 9 }}>
          {STAGES.map((s) => (
            <div key={s.id} style={{ background: s.tint, borderRadius: 11, padding: '11px 12px' }}>
              <div className="mono" style={{ fontSize: 19, fontWeight: 500, color: s.color }}>{num(r.byStage[s.id] || 0)}</div>
              <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 700, color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Panel title="Candidates in play" subtitle={`${num(r.pipelineTotal)} total`}>
        {(cands.data || []).map((cd) => {
          const st = stage(cd.status);
          return (
            <div key={cd.id} className="row row-click" onClick={() => go('cands', { candidateId: cd.id })}>
              <Avatar name={cd.name} id={cd.id} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{cd.name || 'Unnamed'}</div>
                <div style={{ fontSize: 11, color: T.inkMuted }}>
                  {[cd.latestRole, cd.city].filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              <Badge label={st.label} bg={st.tint} fg={st.color} />
            </div>
          );
        })}
        {cands.data && !cands.data.length && (
          <EmptyState icon="groups" title="Nothing sourced yet" body={`No candidates against this ${w.req.toLowerCase()}.`} />
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  New requisition                                                   *
 * ------------------------------------------------------------------ */

export function NewRequisitionScreen() {
  const { go, caps, words } = useDesk();
  const c = caps();
  const w = words();
  const clients = useLoad(() => deskApi.clients(), []);
  const [form, setForm] = useState({
    title: '', description: '', clientId: '', department: '', priority: 'P2',
    openings: '1', location: '', compMin: '', compMax: '', billRate: '', payRate: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return;
    setBusy(true); setError(null);
    try {
      const created = await deskApi.createRequisition({
        title: form.title,
        description: form.description || null,
        clientId: form.clientId || null,
        department: form.department || null,
        priority: form.priority,
        openings: Number(form.openings) || 1,
        location: form.location || null,
        compMin: form.compMin ? Number(form.compMin) : null,
        compMax: form.compMax ? Number(form.compMax) : null,
        billRate: form.billRate || null,
        payRate: form.payRate || null,
      });
      go('job', { requisitionId: created.id });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pad">
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Title *</label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Staff Site Reliability Engineer" />
          </div>
          <div>
            <label className="label">{w.client}</label>
            <Select value={form.clientId} onChange={(e) => set('clientId', e.target.value)}>
              <option value="">None</option>
              {(clients.data || []).map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="label">Department</label>
            <Input value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Platform Engineering" />
          </div>
          <div>
            <label className="label">Priority</label>
            <Select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {['P1', 'P2', 'P3'].map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <div>
            <label className="label">Openings</label>
            <Input type="number" min={1} value={form.openings} onChange={(e) => set('openings', e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Pune / Hybrid" />
          </div>
          <div>
            <label className="label">Comp min (LPA)</label>
            <Input type="number" value={form.compMin} onChange={(e) => set('compMin', e.target.value)} placeholder="24" />
          </div>
          <div>
            <label className="label">Comp max (LPA)</label>
            <Input type="number" value={form.compMax} onChange={(e) => set('compMax', e.target.value)} placeholder="32" />
          </div>
          {c.rates && (
            <>
              <div>
                <label className="label">Bill rate / month</label>
                <Input value={form.billRate} onChange={(e) => set('billRate', e.target.value)} placeholder="₹1,60,000" />
              </div>
              <div>
                <label className="label">Pay rate / month</label>
                <Input value={form.payRate} onChange={(e) => set('payRate', e.target.value)} placeholder="₹1,10,000" />
              </div>
            </>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Description</label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>

        {error && <div style={{ marginTop: 14 }}><Banner icon="error" tone="danger">{error}</Banner></div>}

        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <Button onClick={save} disabled={!form.title.trim() || busy}>
            {busy ? 'Creating…' : `Create ${w.req.toLowerCase()}`}
          </Button>
          <Button variant="ghost" onClick={() => go('jobs')}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Pipeline board                                                    *
 * ------------------------------------------------------------------ */

export function KanbanScreen() {
  const { requisitionId, go, caps } = useDesk();
  const c = caps();
  const [moving, setMoving] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const reqs = useLoad(() => deskApi.requisitions(), []);
  const load = useLoad(
    async () => (await deskApi.candidates({
      roleId: requisitionId || undefined, pageSize: 100,
    })).items,
    [requisitionId],
  );

  const move = async (id: string, statusId: string) => {
    setMoving(id);
    try {
      await deskApi.patchCandidate(id, { status: statusId });
      load.reload();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setMoving(null);
      setDragId(null);
    }
  };

  const byStage = (sid: string) => (load.data || []).filter((x) => x.status === sid);

  return (
    <div className="pad" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <Select
          value={requisitionId || ''}
          onChange={(e) => go('kanban', { requisitionId: e.target.value || undefined })}
          style={{ width: 'auto', minWidth: 220, height: 36 }}
        >
          <option value="">All requisitions</option>
          {(reqs.data || []).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </Select>
        <Banner icon={c.stage ? 'drag_indicator' : 'lock'} tone={c.stage ? 'info' : 'warn'}>
          {c.stage
            ? 'Drag a card to another column, or use the menu on the card.'
            : 'Read-only board — your role cannot move candidates between stages.'}
        </Banner>
      </div>

      {load.loading && <SkeletonRows rows={5} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}

      {load.data && (
        <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ display: 'flex', gap: 10, height: '100%' }}>
            {STAGES.map((s) => {
              const cards = byStage(s.id);
              return (
                <div
                  key={s.id}
                  onDragOver={(e) => { if (c.stage) e.preventDefault(); }}
                  onDrop={() => { if (c.stage && dragId) move(dragId, s.id); }}
                  style={{
                    width: 236, flexShrink: 0, background: T.surfaceAlt, borderRadius: 14,
                    border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', height: '100%',
                  }}
                >
                  <div style={{ padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: s.color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{s.label}</span>
                    <span className="mono" style={{ fontSize: 11, color: T.inkMuted }}>{cards.length}</span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 0 }}>
                    {cards.map((cd) => (
                      <div
                        key={cd.id}
                        draggable={c.stage}
                        onDragStart={() => setDragId(cd.id)}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => go('cands', { candidateId: cd.id })}
                        style={{
                          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: 10,
                          cursor: c.stage ? 'grab' : 'pointer', opacity: moving === cd.id || dragId === cd.id ? 0.5 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={cd.name} id={cd.id} size={26} />
                          <span style={{ fontSize: 11.5, fontWeight: 700, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cd.name || 'Unnamed'}
                          </span>
                        </div>
                        <div style={{ marginTop: 7, fontSize: 10.5, color: T.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cd.latestRole || cd.roleName}
                        </div>
                        {c.stage && (
                          <select
                            value={cd.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => { e.stopPropagation(); move(cd.id, e.target.value); }}
                            style={{
                              marginTop: 8, width: '100%', height: 26, fontSize: 10.5, borderRadius: 7,
                              border: `1px solid ${T.border}`, background: T.fill,
                            }}
                          >
                            {ALL_STAGES.map((x) => (
                              <option key={x.id} value={x.id}>{x.label}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                    {!cards.length && (
                      <div style={{ padding: 14, textAlign: 'center', fontSize: 11, color: T.inkGhost }}>Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Clients                                                           *
 * ------------------------------------------------------------------ */

export function ClientsScreen() {
  const { go, caps, words } = useDesk();
  const c = caps();
  const w = words();
  const load = useLoad(() => deskApi.clients(), []);

  const health: Record<string, { bg: string; fg: string; label: string }> = {
    good: { bg: T.greenTint, fg: T.green, label: 'Healthy' },
    watch: { bg: T.amberTint, fg: T.amber, label: 'Watch' },
    risk: { bg: T.redTint, fg: T.red, label: 'At risk' },
  };

  return (
    <div className="pad">
      {load.loading && <SkeletonRows rows={5} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !load.data.length && (
        <EmptyState icon="apartment" title={`No ${w.clientPlural.toLowerCase()} yet`}
          body="Companies added to the portal appear here as client accounts." />
      )}
      <div className="grid-panels">
        {(load.data || []).map((cl) => {
          const h = health[cl.health] || health.good;
          return (
            <Card key={cl.id} onClick={() => go('client', { clientId: cl.id })}>
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
    </div>
  );
}

export function ClientScreen() {
  const { clientId, go, caps, words } = useDesk();
  const c = caps();
  const w = words();
  const load = useLoad(async () => (clientId ? deskApi.client(clientId) : null), [clientId]);
  const reqs = useLoad(() => deskApi.requisitions(), []);
  const subs = useLoad(async () => (clientId ? deskApi.submissions({ clientId }) : []), [clientId]);

  if (load.loading) return <div className="pad"><SkeletonRows rows={4} /></div>;
  if (load.error) return <div className="pad"><ErrorState message={load.error} onRetry={load.reload} /></div>;
  const cl = load.data;
  if (!cl) return <div className="pad"><EmptyState icon="apartment" title="Nothing selected" body={`Pick a ${w.client.toLowerCase()}.`} /></div>;

  const clientReqs = (reqs.data || []).filter((r) => r.clientId === cl.id);

  return (
    <div className="pad">
      <Button variant="ghost" icon="arrow_back" onClick={() => go('clients')}>All {w.clientPlural.toLowerCase()}</Button>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Avatar name={cl.name} id={cl.id} size={48} square />
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>{cl.name}</h2>
          <div style={{ marginTop: 3, fontSize: 12.5, color: T.inkMuted }}>
            {[cl.industry, cl.location].filter(Boolean).join(' · ') || '—'}
          </div>
        </div>
        <Button variant="ghost" icon="send" onClick={() => go('subs', { clientId: cl.id })}>Submissions</Button>
      </div>

      <div className="grid-auto" style={{ marginTop: 16 }}>
        <Stat label="Open job orders" value={num(cl.openRequisitions)} icon="work" color={T.indigo} tint={T.indigoTint} />
        <Stat label="Submissions" value={num(cl.submissions)} icon="send" color={T.blue} tint={T.blueTint} />
        <Stat label="Placements" value={num(cl.placements)} icon="check_circle" color={T.green} tint={T.greenTint} />
        {c.rates && (
          <Stat label="Margin" value={cl.marginPct ? `${cl.marginPct}%` : '—'} sub={cl.marginPct ? '' : 'not recorded'}
            icon="percent" color={T.teal} tint={T.tealTint} />
        )}
      </div>

      {c.rates && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="lock" size={16} color={T.amber} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>Contract · role-gated</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 12.5, color: cl.terms ? T.inkBody : T.inkGhost, lineHeight: 1.55 }}>
            {cl.terms || 'No contract terms recorded yet.'}
          </div>
        </Card>
      )}

      <Panel title="Contacts">
        {(cl.contacts || []).map((p, i) => (
          <div key={i} className="row">
            <Avatar name={p.name} id={p.name || String(i)} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: T.inkMuted }}>{[p.role, p.phone].filter(Boolean).join(' · ')}</div>
            </div>
            {p.phone && (
              <Button variant="ghost" icon="call" onClick={() => { window.location.href = `tel:${p.phone}`; }}>Call</Button>
            )}
          </div>
        ))}
        {!(cl.contacts || []).length && (
          <EmptyState icon="contacts" title="No contacts recorded" body="Add the people you deal with at this account." />
        )}
      </Panel>

      <Panel title="Job orders" subtitle={`${clientReqs.length} linked`}>
        {clientReqs.map((r) => (
          <div key={r.id} className="row row-click" onClick={() => go('job', { requisitionId: r.id })}>
            <Icon name="work" size={18} color={T.indigo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: T.inkMuted }}>{num(r.pipelineTotal)} in pipeline</div>
            </div>
            <Badge label={r.priority} bg={T.fill} fg={T.inkMuted} />
          </div>
        ))}
        {!clientReqs.length && (
          <EmptyState icon="work" title="No job orders linked"
            body={`Link a ${w.req.toLowerCase()} to this account from its detail screen.`} />
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Submissions                                                       *
 * ------------------------------------------------------------------ */

export function SubmissionsScreen() {
  const { clientId, requisitionId, go } = useDesk();
  const load = useLoad(
    () => deskApi.submissions({ clientId: clientId || undefined, requisitionId: requisitionId || undefined }),
    [clientId, requisitionId],
  );

  const tone: Record<string, { bg: string; fg: string }> = {
    submitted: { bg: T.blueTint, fg: T.blue },
    client_review: { bg: T.purpleTint, fg: T.purple },
    interview_scheduled: { bg: T.amberTint, fg: T.amber },
    placed: { bg: T.greenTint, fg: T.green },
    rejected: { bg: T.redTint, fg: T.red },
    withdrawn: { bg: T.fill, fg: T.inkMuted },
  };

  return (
    <div className="pad">
      {load.loading && <SkeletonRows rows={5} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !load.data.length && (
        <EmptyState icon="send" title="Nothing submitted yet"
          body="Candidates put forward to a client appear here with their status." />
      )}
      {load.data && load.data.length > 0 && (
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Candidate</th><th>Requisition</th><th>Client</th>
                  <th>Status</th><th>Submitted at</th><th>By</th>
                </tr>
              </thead>
              <tbody>
                {load.data.map((s) => {
                  const t = tone[s.status] || tone.submitted;
                  return (
                    <tr key={s.id} className="clickable" onClick={() => go('cands', { candidateId: s.candidateId })}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <Avatar name={s.candidateName} id={s.candidateId} size={28} />
                          <span style={{ fontWeight: 700 }}>{s.candidateName || 'Candidate'}</span>
                        </div>
                      </td>
                      <td style={{ color: T.inkMuted }}>{s.requisitionName || '—'}</td>
                      <td style={{ color: T.inkMuted }}>{s.clientName || '—'}</td>
                      <td><Badge label={s.status.replace(/_/g, ' ')} bg={t.bg} fg={t.fg} /></td>
                      <td className="mono" style={{ fontSize: 11 }}>{shortDate(s.submittedAt)}</td>
                      <td style={{ color: T.inkMuted, fontSize: 11.5 }}>{s.submittedByName || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
