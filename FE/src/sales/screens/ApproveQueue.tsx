import React, { useCallback, useEffect, useState } from 'react';
import { T } from '../../desk/tokens';
import { salesApi, type SalesActivity } from '../api';
import { useSales } from '../store';

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

export function ApproveQueueScreen() {
  const go = useSales((s) => s.go);
  const [items, setItems] = useState<SalesActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await salesApi.approveQueue();
      setItems(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await salesApi.approve(id);
      setToast('Approved — use Mark sent when ready (no external send).');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    } finally {
      setBusyId(null);
    }
  };

  const markSent = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await salesApi.markSent(id);
      setToast(res.logMessage || 'Marked sent (stub — would send logged).');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mark sent failed');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setBusyId(id);
    setError(null);
    try {
      await salesApi.reject(id, rejectReason.trim());
      setRejectId(null);
      setRejectReason('');
      setToast('Rejected.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 860 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Approve queue</h1>
      <p style={{ margin: '8px 0 0', color: T.inkMuted, fontSize: 13, lineHeight: 1.5 }}>
        Outbound drafts wait here for a human gate. Approve first, then Mark sent
        (logs “would send” only — no email/SMS providers called).
      </p>

      {toast && (
        <div style={{
          marginTop: 14, padding: '10px 12px', borderRadius: 10, background: T.tealTint,
          color: T.tealInk, fontSize: 12, lineHeight: 1.4,
        }}
        >
          {toast}
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ marginLeft: 10, background: 'none', border: 'none', color: T.tealInk, cursor: 'pointer', fontWeight: 600 }}
          >
            Dismiss
          </button>
        </div>
      )}
      {error && <p style={{ marginTop: 12, color: T.red, fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ marginTop: 16, color: T.inkMuted }}>Loading…</p>}

      {!loading && items.length === 0 && (
        <div style={{
          marginTop: 24, padding: 24, borderRadius: 14, border: `1px dashed ${T.borderStrong}`,
          background: T.surface, textAlign: 'center', color: T.inkMuted, fontSize: 13,
        }}
        >
          Queue is empty. Draft outreach from an opportunity detail page.
        </div>
      )}

      <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
        {items.map((a) => {
          const open = expanded === a.id || rejectId === a.id;
          const busy = busyId === a.id;
          return (
            <div
              key={a.id}
              style={{
                borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface, padding: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>
                    {a.subject || '(no subject)'}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: T.inkMuted }}>
                    {a.opportunityName || a.opportunityId || 'No opportunity'}
                    {a.companyName ? ` · ${a.companyName}` : ''}
                    {' · '}
                    {a.channel || 'email'}
                    {' · '}
                    {fmtWhen(a.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setExpanded(open && rejectId !== a.id ? null : a.id)}
                    style={{
                      height: 32, padding: '0 12px', borderRadius: 8,
                      border: `1px solid ${T.borderStrong}`, background: T.surface,
                      cursor: 'pointer', fontSize: 12, fontWeight: 600, color: T.inkBody,
                    }}
                  >
                    {open && rejectId !== a.id ? 'Hide body' : 'View body'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => approve(a.id)}
                    style={{
                      height: 32, padding: '0 12px', borderRadius: 8, border: 'none',
                      background: T.green, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => { setRejectId(a.id); setRejectReason(''); setExpanded(a.id); }}
                    style={{
                      height: 32, padding: '0 12px', borderRadius: 8, border: 'none',
                      background: T.redTint, color: T.red, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    Reject
                  </button>
                  {a.opportunityId && (
                    <button
                      type="button"
                      onClick={() => go('opp', a.opportunityId)}
                      style={{
                        height: 32, padding: '0 12px', borderRadius: 8, border: 'none',
                        background: T.indigoTint, color: T.indigoInk, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      Open opp
                    </button>
                  )}
                </div>
              </div>

              {open && (
                <pre style={{
                  margin: '12px 0 0', padding: 12, borderRadius: 10, background: T.fill,
                  whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.5,
                  color: T.inkBody, maxHeight: 280, overflow: 'auto',
                }}
                >
                  {a.body || '(empty body)'}
                </pre>
              )}

              {rejectId === a.id && (
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="Rejection reason (required)"
                    style={{
                      borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: 10,
                      fontFamily: 'inherit', fontSize: 13,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      disabled={!rejectReason.trim() || busy}
                      onClick={() => reject(a.id)}
                      style={{
                        height: 32, padding: '0 12px', borderRadius: 8, border: 'none',
                        background: rejectReason.trim() ? T.red : T.disabled,
                        color: rejectReason.trim() ? '#fff' : T.disabledInk,
                        cursor: rejectReason.trim() ? 'pointer' : 'default', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      Confirm reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectId(null)}
                      style={{
                        height: 32, padding: '0 12px', borderRadius: 8,
                        border: `1px solid ${T.borderStrong}`, background: T.surface,
                        cursor: 'pointer', fontSize: 12, color: T.inkMuted,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approved-but-not-sent helpers: reload won't show them; note in copy above.
          Separate fetch for recently approved is optional — mark-sent from toast flow
          after approve: offer mark-sent on the toast path by keeping last approved id. */}
      <ApprovedSentHint onMarkSent={markSent} busyId={busyId} />
    </div>
  );
}

/** After approve, items leave the pending queue — offer mark-sent via a small session list. */
function ApprovedSentHint({
  onMarkSent,
  busyId,
}: {
  onMarkSent: (id: string) => Promise<void>;
  busyId: string | null;
}) {
  const [approved, setApproved] = useState<SalesActivity[]>([]);

  useEffect(() => {
    salesApi.activities({ status: 'approved', type: 'outreach_draft' })
      .then(setApproved)
      .catch(() => setApproved([]));
  }, [busyId]);

  if (approved.length === 0) return null;

  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Approved — ready to mark sent</h2>
      <p style={{ margin: '6px 0 12px', fontSize: 12, color: T.inkMuted }}>
        Human gate passed. Mark sent only logs a stub; nothing leaves the system.
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {approved.map((a) => (
          <div
            key={a.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 12,
              borderRadius: 12, border: `1px solid ${T.tealBorder}`, background: T.tealTint,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: T.tealInk }}>
              {a.subject || a.id}
            </div>
            <button
              type="button"
              disabled={busyId === a.id}
              onClick={() => onMarkSent(a.id)}
              style={{
                height: 30, padding: '0 12px', borderRadius: 8, border: 'none',
                background: T.teal, color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}
            >
              Mark sent (stub)
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
