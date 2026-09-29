import React, { useEffect, useState } from 'react';
import { T } from '../../desk/tokens';
import { salesApi, type SalesHomeStats } from '../api';
import { useSales } from '../store';

export function HomeScreen() {
  const go = useSales((s) => s.go);
  const [stats, setStats] = useState<SalesHomeStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    salesApi.home()
      .then(setStats)
      .catch((e: Error) => setError(e.message || 'Failed to load sales home'));
  }, []);

  const cards = [
    { label: 'Open pipeline', value: stats?.openPipeline ?? '—', screen: 'pipeline' as const },
    { label: 'Opportunities', value: stats?.opportunities ?? '—', screen: 'opps' as const },
    { label: 'Won', value: stats?.won ?? '—', screen: 'opps' as const },
    { label: 'Leads', value: stats?.leads ?? '—', screen: 'home' as const },
    { label: 'Contacts', value: stats?.contacts ?? '—', screen: 'home' as const },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.ink }}>Sales desk</h1>
      <p style={{ margin: '8px 0 0', color: T.inkMuted, fontSize: 13, lineHeight: 1.5 }}>
        Phase 1 skeleton — opportunities, pipeline, and accounts (companies).
        Hiring roles link is stubbed on opportunity detail.
      </p>
      {error && (
        <div style={{
          marginTop: 16, padding: 12, borderRadius: 10, background: T.redTint, color: T.red, fontSize: 13,
        }}
        >
          {error}
        </div>
      )}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12, marginTop: 20,
      }}
      >
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => go(c.screen)}
            style={{
              textAlign: 'left', padding: 16, borderRadius: 14, border: `1px solid ${T.border}`,
              background: T.surface, cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 11, color: T.inkFaint, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {c.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, color: T.ink }}>{c.value}</div>
          </button>
        ))}
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
          <div style={{ padding: 16, borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>By product line</div>
            {Object.keys(stats.byProductLine).length === 0 && (
              <div style={{ color: T.inkFaint, fontSize: 13 }}>No opportunities yet</div>
            )}
            {Object.entries(stats.byProductLine).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                <span style={{ textTransform: 'capitalize' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>By stage</div>
            {Object.keys(stats.byStage).length === 0 && (
              <div style={{ color: T.inkFaint, fontSize: 13 }}>No opportunities yet</div>
            )}
            {Object.entries(stats.byStage).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                <span style={{ textTransform: 'capitalize' }}>{k.replace('_', ' ')}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
