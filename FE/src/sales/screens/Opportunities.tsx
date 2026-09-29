import React, { useEffect, useState } from 'react';
import { T } from '../../desk/tokens';
import { salesApi, type ProductLine, type SalesOpportunity } from '../api';
import { useSales } from '../store';

const PRODUCT_LINES: ProductLine[] = ['staffing', 'platform', 'hybrid'];

export function OpportunitiesScreen() {
  const go = useSales((s) => s.go);
  const [items, setItems] = useState<SalesOpportunity[]>([]);
  const [productLine, setProductLine] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [newPl, setNewPl] = useState<ProductLine>('staffing');

  const load = () => {
    salesApi.opportunities(productLine ? { productLine } : {})
      .then(setItems)
      .catch((e: Error) => setError(e.message || 'Failed to load opportunities'));
  };

  useEffect(() => { load(); }, [productLine]);

  const onCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await salesApi.createOpportunity({ name: name.trim(), productLine: newPl });
      setName('');
      go('opp', created.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Opportunities</h1>
          <p style={{ margin: '6px 0 0', color: T.inkMuted, fontSize: 13 }}>Staffing · Platform · Hybrid</p>
        </div>
        <select
          value={productLine}
          onChange={(e) => setProductLine(e.target.value)}
          style={{
            height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: '0 10px', background: T.surface,
          }}
        >
          <option value="">All product lines</option>
          {PRODUCT_LINES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{
        marginTop: 16, padding: 14, borderRadius: 14, border: `1px solid ${T.border}`,
        background: T.surface, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New opportunity name"
          style={{
            flex: 1, minWidth: 180, height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`,
            padding: '0 12px',
          }}
        />
        <select
          value={newPl}
          onChange={(e) => setNewPl(e.target.value as ProductLine)}
          style={{ height: 36, borderRadius: 10, border: `1px solid ${T.borderInput}`, padding: '0 10px' }}
        >
          {PRODUCT_LINES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          type="button"
          disabled={creating || !name.trim()}
          onClick={onCreate}
          style={{
            height: 36, padding: '0 14px', borderRadius: 10, border: 'none',
            background: T.indigo, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? 'Creating…' : 'Create'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: T.red, fontSize: 13 }}>{error}</div>
      )}

      <div style={{ marginTop: 16, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden', background: T.surface }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: T.surfaceAlt, textAlign: 'left' }}>
              {['Name', 'Account', 'Product', 'Stage', 'Amount'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', fontWeight: 600, color: T.inkMuted, borderBottom: `1px solid ${T.headBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, color: T.inkFaint, textAlign: 'center' }}>
                  No opportunities yet — create one above.
                </td>
              </tr>
            )}
            {items.map((o) => (
              <tr
                key={o.id}
                onClick={() => go('opp', o.id)}
                style={{ cursor: 'pointer', borderBottom: `1px solid ${T.divider}` }}
              >
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{o.name}</td>
                <td style={{ padding: '12px 14px', color: T.inkMuted }}>{o.companyName || '—'}</td>
                <td style={{ padding: '12px 14px', textTransform: 'capitalize' }}>{o.productLine}</td>
                <td style={{ padding: '12px 14px', textTransform: 'capitalize' }}>{String(o.stage).replace('_', ' ')}</td>
                <td style={{ padding: '12px 14px' }}>
                  {o.amount != null ? `${o.currency || 'INR'} ${o.amount.toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
