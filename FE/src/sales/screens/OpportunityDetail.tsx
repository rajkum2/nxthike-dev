import React, { useCallback, useEffect, useState } from 'react';
import { T } from '../../desk/tokens';
import {
  salesApi,
  type ActivityType,
  type OppStage,
  type ProductLine,
  type SalesActivity,
  type SalesOpportunity,
} from '../api';
import { useSales } from '../store';

const STAGES: OppStage[] = ['qualify', 'discovery', 'proposal', 'negotiation', 'won', 'lost', 'on_hold'];
const PRODUCT_LINES: ProductLine[] = ['staffing', 'platform', 'hybrid'];

function fmtWhen(iso?: string | null) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusColor(status: string) {
  if (status === 'pending_approval') return { bg: T.amberTint, ink: T.amberInk };
  if (status === 'approved') return { bg: T.tealTint, ink: T.tealInk };
  if (status === 'rejected') return { bg: T.redTint, ink: T.red };
  if (status === 'sent') return { bg: T.greenTint, ink: T.green };
  return { bg: T.fill, ink: T.inkMuted };
}

export function OpportunityDetailScreen() {
  const go = useSales((s) => s.go);
  const oppId = useSales((s) => s.oppId);
  const [opp, setOpp] = useState<SalesOpportunity | null>(null);
  const [roleStub, setRoleStub] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<SalesActivity[]>([]);
  const [tlLoading, setTlLoading] = useState(false);
  const [noteType, setNoteType] = useState<'note' | 'call'>('note');
  const [noteBody, setNoteBody] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const loadTimeline = useCallback(async (id: string) => {
    setTlLoading(true);
    try {
      const rows = await salesApi.timeline(id);
      setTimeline(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Timeline failed');
    } finally {
      setTlLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!oppId) return;
    salesApi.opportunity(oppId)
      .then((o) => {
        setOpp(o);
        setRoleStub((o.hiringRoleIds || []).join(', '));
      })
      .catch((e: Error) => setError(e.message || 'Failed to load'));
    loadTimeline(oppId);
  }, [oppId, loadTimeline]);

  if (!oppId) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: T.inkMuted }}>No opportunity selected.</p>
        <button type="button" onClick={() => go('opps')} style={{ color: T.indigo, background: 'none', border: 'none', cursor: 'pointer' }}>
          Back to list
        </button>
      </div>
    );
  }

  const patch = async (body: Partial<SalesOpportunity>) => {
    if (!opp) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await salesApi.updateOpportunity(opp.id, body);
      setOpp(updated);
      setRoleStub((updated.hiringRoleIds || []).join(', '));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveRoles = async () => {
    const ids = roleStub.split(',').map((s) => s.trim()).filter(Boolean);
    await patch({ hiringRoleIds: ids });
  };

  const addActivity = async () => {
    if (!noteBody.trim()) return;
    setBusy('add');
    setError(null);
    try {
      await salesApi.createActivity({
        opportunityId: oppId,
        activityType: noteType as ActivityType,
        subject: noteSubject.trim() || (noteType === 'call' ? 'Call log' : 'Note'),
        body: noteBody.trim(),
        status: 'done',
        direction: noteType === 'call' ? 'outbound' : 'internal',
        channel: noteType === 'call' ? 'phone' : undefined,
      });
      setNoteBody('');
      setNoteSubject('');
      await loadTimeline(oppId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add activity');
    } finally {
      setBusy(null);
    }
  };

  const draftOutreach = async () => {
    setBusy('draft');
    setError(null);
    try {
      await salesApi.draftOutreach(oppId, { channel: 'email' });
      await loadTimeline(oppId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Draft failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 820 }}>
      <button
        type="button"
        onClick={() => go('opps')}
        style={{ background: 'none', border: 'none', color: T.indigo, cursor: 'pointer', padding: 0, fontSize: 13 }}
      >
        ← Opportunities
      </button>
      {!opp && !error && <p style={{ marginTop: 16, color: T.inkMuted }}>Loading…</p>}
      {error && <p style={{ marginTop: 16, color: T.red }}>{error}</p>}
      {opp && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{opp.name}</h1>
              <p style={{ margin: '6px 0 0', color: T.inkMuted, fontSize: 13 }}>
                {opp.companyName || 'No account linked'} · {saving ? 'Saving…' : 'Ready'}
              </p>
            </div>
            <button
              type="button"
              onClick={draftOutreach}
              disabled={busy === 'draft'}
              style={{
                height: 36, padding: '0 14px', borderRadius: 10, border: 'none',
                background: T.indigo, color: '#fff', fontWeight: 600, cursor: 'pointer',
                fontSize: 13, whiteSpace: 'nowrap',
              }}
            >
              {busy === 'draft' ? 'Drafting…' : 'Draft outreach'}
            </button>
          </div>

          <div style={{
            marginTop: 20, display: 'grid', gap: 14, padding: 16, borderRadius: 14,
            border: `1px solid ${T.border}`, background: T.surface,
          }}
          >
            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: T.inkMuted }}>
              Product line
              <select
                value={opp.productLine}
                onChange={(e) => patch({ productLine: e.target.value as ProductLine })}
                style={{ height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: '0 10px' }}
              >
                {PRODUCT_LINES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: T.inkMuted }}>
              Stage
              <select
                value={opp.stage}
                onChange={(e) => patch({ stage: e.target.value as OppStage })}
                style={{ height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: '0 10px' }}
              >
                {STAGES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: T.inkMuted }}>
              Amount ({opp.currency || 'INR'})
              <input
                type="number"
                defaultValue={opp.amount ?? ''}
                onBlur={(e) => {
                  const v = e.target.value === '' ? null : Number(e.target.value);
                  if (v !== opp.amount) patch({ amount: v });
                }}
                style={{ height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: '0 12px' }}
              />
            </label>

            <div style={{
              padding: 12, borderRadius: 12, background: T.indigoTintSoft, border: `1px solid ${T.indigoEdge}`,
            }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: T.indigoInk }}>Link hiring roles (stub)</div>
              <p style={{ margin: '6px 0 10px', fontSize: 12, color: T.inkMuted, lineHeight: 1.5 }}>
                Paste comma-separated <code>hiring_roles.id</code> values for staffing / hybrid deals.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={roleStub}
                  onChange={(e) => setRoleStub(e.target.value)}
                  placeholder="role_id_1, role_id_2"
                  style={{
                    flex: 1, height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`,
                    padding: '0 12px', background: T.surface,
                  }}
                />
                <button
                  type="button"
                  onClick={saveRoles}
                  style={{
                    height: 36, padding: '0 14px', borderRadius: 10, border: 'none',
                    background: T.indigo, color: '#fff', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Save links
                </button>
              </div>
              {(opp.hiringRoleIds || []).length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: T.inkBody }}>
                  Linked: {(opp.hiringRoleIds || []).join(', ')}
                </div>
              )}
            </div>

            <label style={{ display: 'grid', gap: 6, fontSize: 12, color: T.inkMuted }}>
              Notes
              <textarea
                defaultValue={opp.notes || ''}
                rows={4}
                onBlur={(e) => {
                  if (e.target.value !== (opp.notes || '')) patch({ notes: e.target.value });
                }}
                style={{
                  borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: 12, resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </label>
          </div>

          {/* Activities timeline */}
          <section style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Activities</h2>
              {tlLoading && <span style={{ fontSize: 12, color: T.inkFaint }}>Refreshing…</span>}
            </div>

            <div style={{
              padding: 14, borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface,
              marginBottom: 14, display: 'grid', gap: 10,
            }}
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['note', 'call'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNoteType(t)}
                    style={{
                      height: 30, padding: '0 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      border: `1px solid ${noteType === t ? T.indigo : T.borderStrong}`,
                      background: noteType === t ? T.indigoTint : T.surface,
                      color: noteType === t ? T.indigoInk : T.inkMuted,
                    }}
                  >
                    {t === 'note' ? 'Add note' : 'Log call'}
                  </button>
                ))}
              </div>
              <input
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value)}
                placeholder="Subject (optional)"
                style={{ height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: '0 12px' }}
              />
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={3}
                placeholder={noteType === 'call' ? 'Call summary…' : 'Note…'}
                style={{
                  borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: 12, resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              <div>
                <button
                  type="button"
                  onClick={addActivity}
                  disabled={!noteBody.trim() || busy === 'add'}
                  style={{
                    height: 34, padding: '0 14px', borderRadius: 10, border: 'none',
                    background: noteBody.trim() ? T.indigo : T.disabled,
                    color: noteBody.trim() ? '#fff' : T.disabledInk,
                    fontWeight: 600, cursor: noteBody.trim() ? 'pointer' : 'default', fontSize: 13,
                  }}
                >
                  {busy === 'add' ? 'Saving…' : 'Save activity'}
                </button>
              </div>
            </div>

            {timeline.length === 0 && !tlLoading && (
              <p style={{ color: T.inkMuted, fontSize: 13 }}>No activities yet. Add a note or draft outreach.</p>
            )}

            <div style={{ display: 'grid', gap: 10 }}>
              {timeline.map((a) => {
                const sc = statusColor(String(a.status));
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em',
                        color: T.indigoInk,
                      }}
                      >
                        {String(a.activityType).replace(/_/g, ' ')}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                        background: sc.bg, color: sc.ink,
                      }}
                      >
                        {String(a.status).replace(/_/g, ' ')}
                      </span>
                      {a.channel && (
                        <span style={{ fontSize: 11, color: T.inkFaint }}>{a.channel}</span>
                      )}
                      <span style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: T.inkFaint }}>{fmtWhen(a.occurredAt || a.createdAt)}</span>
                    </div>
                    {a.subject && (
                      <div style={{ marginTop: 6, fontWeight: 600, fontSize: 13, color: T.ink }}>{a.subject}</div>
                    )}
                    {a.body && (
                      <pre style={{
                        margin: '8px 0 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit',
                        fontSize: 12.5, lineHeight: 1.5, color: T.inkBody,
                      }}
                      >
                        {a.body}
                      </pre>
                    )}
                    {a.status === 'pending_approval' && (
                      <button
                        type="button"
                        onClick={() => go('approve')}
                        style={{
                          marginTop: 10, background: 'none', border: 'none', color: T.indigo,
                          cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600,
                        }}
                      >
                        Review in approve queue →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
