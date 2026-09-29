import React, { useEffect, useState } from 'react';
import { T } from '../../desk/tokens';
import { salesApi, type OppStage, type ProductLine, type SalesOpportunity } from '../api';
import { useSales } from '../store';

const STAGES: OppStage[] = ['qualify', 'discovery', 'proposal', 'negotiation', 'won', 'lost', 'on_hold'];
const PRODUCT_LINES: ProductLine[] = ['staffing', 'platform', 'hybrid'];

export function OpportunityDetailScreen() {
  const go = useSales((s) => s.go);
  const oppId = useSales((s) => s.oppId);
  const [opp, setOpp] = useState<SalesOpportunity | null>(null);
  const [roleStub, setRoleStub] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!oppId) return;
    salesApi.opportunity(oppId)
      .then((o) => {
        setOpp(o);
        setRoleStub((o.hiringRoleIds || []).join(', '));
      })
      .catch((e: Error) => setError(e.message || 'Failed to load'));
  }, [oppId]);

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

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
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
          <h1 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 700 }}>{opp.name}</h1>
          <p style={{ margin: '6px 0 0', color: T.inkMuted, fontSize: 13 }}>
            {opp.companyName || 'No account linked'} · {saving ? 'Saving…' : 'Ready'}
          </p>

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
                Full picker is a Phase 2 follow-up.
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
        </>
      )}
    </div>
  );
}
