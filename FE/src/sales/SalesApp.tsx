/**
 * Sales desk shell — Phase 1 + Phase 2 (approve queue) under /sales/*.
 * Mirrors the hiring desk chrome (rail + top bar).
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../desk/desk.css';
import { T } from '../desk/tokens';
import { useAuthStore } from '../store/authStore';
import { salesApi, type SalesMeta } from './api';
import { useSales, type SalesScreen } from './store';
import { HomeScreen } from './screens/Home';
import { OpportunitiesScreen } from './screens/Opportunities';
import { OpportunityDetailScreen } from './screens/OpportunityDetail';
import { PipelineScreen } from './screens/Pipeline';
import { ApproveQueueScreen } from './screens/ApproveQueue';

const NAV: { id: SalesScreen; label: string; icon: string; path: string }[] = [
  { id: 'home', label: 'Home', icon: 'home', path: '/sales' },
  { id: 'opps', label: 'Opportunities', icon: 'work', path: '/sales/opportunities' },
  { id: 'pipeline', label: 'Pipeline', icon: 'view_kanban', path: '/sales/pipeline' },
  { id: 'approve', label: 'Approve queue', icon: 'fact_check', path: '/sales/approve' },
];

function pathToScreen(pathname: string, id?: string): { screen: SalesScreen; oppId: string | null } {
  if (pathname.includes('/approve') || pathname.includes('/queue')) return { screen: 'approve', oppId: null };
  if (pathname.includes('/pipeline')) return { screen: 'pipeline', oppId: null };
  if (pathname.includes('/opportunities/') && id) return { screen: 'opp', oppId: id };
  if (pathname.includes('/opportunities')) return { screen: 'opps', oppId: null };
  return { screen: 'home', oppId: null };
}

function SalesShell({ children, pendingCount }: { children: React.ReactNode; pendingCount: number }) {
  const navigate = useNavigate();
  const { screen, go } = useSales();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const [meta, setMeta] = useState<SalesMeta | null>(null);

  useEffect(() => {
    salesApi.meta().then(setMeta).catch(() => setMeta(null));
  }, []);

  const onNav = (id: SalesScreen, path: string) => {
    go(id);
    navigate(path);
  };

  return (
    <div className="desk" style={{ minHeight: '100vh', display: 'flex', background: T.appBg }}>
      <aside style={{
        width: 220, flexShrink: 0, background: T.rail, color: T.railInk,
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}
      >
        <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: T.indigo,
            display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700,
          }}
          >
            S
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>NxtHike</div>
            <div style={{ fontSize: 9, color: T.railFaint, letterSpacing: '.05em' }}>SALES DESK · PHASE 2</div>
          </div>
        </div>

        <nav style={{ padding: '8px 10px', display: 'grid', gap: 2, flex: 1 }}>
          {NAV.map((item) => {
            const active = screen === item.id || (item.id === 'opps' && screen === 'opp');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id, item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, height: 38, padding: '0 12px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? T.railActive : 'transparent',
                  color: active ? '#fff' : T.railMuted, fontWeight: active ? 600 : 500, fontSize: 13,
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'approve' && pendingCount > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
                    background: T.amber, color: '#fff', fontSize: 10, fontWeight: 700,
                    display: 'grid', placeItems: 'center',
                  }}
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </button>
            );
          })}
          <div style={{ height: 1, background: T.railBorder, margin: '12px 4px' }} />
          <button
            type="button"
            onClick={() => navigate('/hiring')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, height: 38, padding: '0 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: 'transparent', color: T.railFaint, fontSize: 12,
            }}
          >
            ← Hiring workspace
          </button>
        </nav>

        <div style={{ padding: 14, borderTop: `1px solid ${T.railBorder}` }}>
          <div style={{ fontSize: 12, color: T.railMuted, marginBottom: 6 }}>
            {meta?.persona?.name || user?.email || 'Workspace'}
          </div>
          <button
            type="button"
            onClick={async () => { await signOut(); navigate('/login'); }}
            style={{
              background: 'none', border: 'none', color: T.railFaint, cursor: 'pointer',
              fontSize: 12, padding: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 52, borderBottom: `1px solid ${T.border}`, background: T.surface,
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
        }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>Sales CRM</div>
          <div style={{ flex: 1 }} />
          <span style={{
            fontSize: 11, padding: '4px 8px', borderRadius: 999, background: T.indigoTint,
            color: T.indigoInk, fontWeight: 600,
          }}
          >
            Accounts = companies
          </span>
        </header>
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}

function BootError({ message }: { message: string }) {
  const denied = /403|forbidden|no workspace/i.test(message);
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: T.appBg }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{denied ? 'No workspace access' : 'Cannot open Sales'}</h2>
        <p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.5 }}>{message}</p>
        <a href="/login" style={{ color: T.indigo, fontSize: 13 }}>Sign in</a>
        {' · '}
        <a href="/hiring" style={{ color: T.indigo, fontSize: 13 }}>Hiring desk</a>
      </div>
    </div>
  );
}

export default function SalesApp() {
  const location = useLocation();
  const params = useParams();
  const { go, screen } = useSales();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const id = (params as { id?: string }).id;
    const mapped = pathToScreen(location.pathname, id);
    go(mapped.screen, mapped.oppId);
  }, [location.pathname, params, go]);

  useEffect(() => {
    salesApi.meta()
      .then(() => { setReady(true); setError(null); })
      .catch((e: Error) => {
        setError(e.message || 'Sales API unavailable');
        setReady(true);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      salesApi.home()
        .then((h) => { if (!cancelled) setPendingCount(h.pendingApprovals || 0); })
        .catch(() => { /* ignore */ });
    };
    tick();
    const t = window.setInterval(tick, 30000);
    return () => { cancelled = true; window.clearInterval(t); };
  }, [screen, location.pathname]);

  useEffect(() => {
    document.title = `Sales · NxtHike`;
  }, [screen]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: T.appBg }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: T.indigo }} />
      </div>
    );
  }

  if (error && /401|403|unauthor|forbidden|workspace/i.test(error)) {
    return <BootError message={error} />;
  }

  let body: React.ReactNode = <HomeScreen />;
  if (screen === 'opps') body = <OpportunitiesScreen />;
  if (screen === 'opp') body = <OpportunityDetailScreen />;
  if (screen === 'pipeline') body = <PipelineScreen />;
  if (screen === 'approve') body = <ApproveQueueScreen />;

  return <SalesShell pendingCount={pendingCount}>{body}</SalesShell>;
}
