import React, { useEffect, useState } from 'react';
import { T } from '../../desk/tokens';
import { salesApi, type SalesPipeline } from '../api';
import { useSales } from '../store';

export function PipelineScreen() {
  const go = useSales((s) => s.go);
  const [pipe, setPipe] = useState<SalesPipeline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);

  const load = () => {
    salesApi.pipeline()
      .then(setPipe)
      .catch((e: Error) => setError(e.message || 'Failed to load pipeline'));
  };

  useEffect(() => { load(); }, []);

  const move = async (id: string, stage: string) => {
    setMoving(id);
    try {
      await salesApi.updateOpportunity(id, { stage: stage as never });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Move failed');
    } finally {
      setMoving(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Sales pipeline</h1>
      <p style={{ margin: '6px 0 0', color: T.inkMuted, fontSize: 13 }}>
        Open {pipe?.totalOpen ?? '—'} · Won {pipe?.totalWon ?? '—'} · Lost {pipe?.totalLost ?? '—'}
      </p>
      {error && <div style={{ marginTop: 12, color: T.red, fontSize: 13 }}>{error}</div>}

      <div style={{
        marginTop: 16, display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
        alignItems: 'flex-start',
      }}
      >
        {(pipe?.columns || []).map((col) => (
          <div
            key={col.stage}
            style={{
              minWidth: 220, maxWidth: 260, flex: '0 0 220px', borderRadius: 14,
              border: `1px solid ${T.border}`, background: T.surfaceAlt, padding: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 4px 10px' }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{col.label}</span>
              <span style={{ fontSize: 11, color: T.inkFaint }}>{col.count}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {col.items.length === 0 && (
                <div style={{
                  padding: 14, borderRadius: 10, border: `1px dashed ${T.borderStrong}`,
                  color: T.inkGhost, fontSize: 12, textAlign: 'center',
                }}
                >
                  Empty
                </div>
              )}
              {col.items.map((o) => (
                <div
                  key={o.id}
                  style={{
                    padding: 12, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`,
                    opacity: moving === o.id ? 0.5 : 1,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => go('opp', o.id)}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      fontWeight: 600, fontSize: 13, color: T.ink, textAlign: 'left',
                    }}
                  >
                    {o.name}
                  </button>
                  <div style={{ marginTop: 4, fontSize: 11, color: T.inkFaint, textTransform: 'capitalize' }}>
                    {o.productLine}{o.companyName ? ` · ${o.companyName}` : ''}
                  </div>
                  {o.amount != null && (
                    <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600 }}>
                      {(o.currency || 'INR')} {o.amount.toLocaleString()}
                    </div>
                  )}
                  <select
                    value={o.stage}
                    onChange={(e) => move(o.id, e.target.value)}
                    style={{
                      marginTop: 8, width: '100%', height: 30, borderRadius: 8,
                      border: `1px solid ${T.borderInput}`, fontSize: 12, background: T.fill,
                    }}
                  >
                    {(pipe?.columns || []).map((c) => (
                      <option key={c.stage} value={c.stage}>{c.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
