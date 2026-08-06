/**
 * Activity feed, personal performance and team dashboard.
 *
 * Everything here is derived from data the API already returns — no metric is
 * invented client-side. Where a number cannot be computed honestly (e.g. call
 * duration on web, which the browser cannot observe), it is labelled as such.
 */

import React, { useMemo, useState } from 'react';
import { deskApi, type CallLog } from '../api';
import { DISPOSITIONS, STAGES, T, disposition } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Banner, Card, Chip, EmptyState, ErrorState, Eyebrow, Icon,
  Meter, Panel, SkeletonRows, Stat, num, pct, useLoad, whenLabel,
} from '../ui';

/* ------------------------------------------------------------------ *
 *  Activity feed                                                     *
 * ------------------------------------------------------------------ */

const ACTION_LOOK: Record<string, { icon: string; color: string; tint: string }> = {
  call: { icon: 'call', color: T.teal, tint: T.tealTint },
  candidate: { icon: 'person', color: T.indigo, tint: T.indigoTint },
  stage: { icon: 'swap_horiz', color: T.blue, tint: T.blueTint },
  submission: { icon: 'send', color: T.blue, tint: T.blueTint },
  interview: { icon: 'event', color: T.purple, tint: T.purpleTint },
  scorecard: { icon: 'rate_review', color: T.purple, tint: T.purpleTint },
  offer: { icon: 'contract', color: T.green, tint: T.greenTint },
  approval: { icon: 'gavel', color: T.amber, tint: T.amberTint },
  requisition: { icon: 'work', color: T.indigo, tint: T.indigoTint },
  user: { icon: 'manage_accounts', color: T.orange, tint: T.orangeTint },
  erasure: { icon: 'delete_forever', color: T.red, tint: T.redTint },
  settings: { icon: 'settings', color: T.inkMuted, tint: T.fill },
};

function look(action: string) {
  const head = action.split('.')[0];
  return ACTION_LOOK[head] || ACTION_LOOK.settings;
}

/** "offer.approve" → "Offer approve" — keeps the API's own vocabulary visible. */
function phrase(action: string) {
  const s = action.replace(/[._]/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function FeedScreen() {
  const load = useLoad(() => deskApi.audit(80), []);
  const [filter, setFilter] = useState<string | null>(null);

  const kinds = useMemo(() => {
    const set = new Set((load.data || []).map((r) => r.action.split('.')[0]));
    return [...set].sort();
  }, [load.data]);

  const rows = (load.data || []).filter((r) => !filter || r.action.startsWith(filter));

  return (
    <div className="pad" style={{ maxWidth: 800 }}>
      {kinds.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          <Chip label="Everything" on={!filter} onClick={() => setFilter(null)} />
          {kinds.map((k) => (
            <Chip key={k} label={phrase(k)} on={filter === k} onClick={() => setFilter(k)} accent={look(k).color} />
          ))}
        </div>
      )}

      {load.loading && <SkeletonRows rows={6} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !rows.length && (
        <EmptyState icon="forum" title="Nothing has happened yet"
          body="Calls, stage moves, submissions and approvals appear here as the team works." />
      )}

      <div style={{ position: 'relative' }}>
        {rows.length > 0 && (
          <div style={{ position: 'absolute', left: 17, top: 8, bottom: 8, width: 2, background: T.border }} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rows.map((r) => {
            const l = look(r.action);
            return (
              <div key={r.id} style={{ display: 'flex', gap: 12, padding: '9px 0', position: 'relative' }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 11, background: l.tint, display: 'grid',
                  placeItems: 'center', flexShrink: 0, zIndex: 1, border: `2px solid ${T.surface}`,
                }}>
                  <Icon name={l.icon} size={18} color={l.color} />
                </span>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 700 }}>{r.actorName || r.actorEmail || 'Someone'}</span>
                    <span style={{ color: T.inkMuted }}> · {phrase(r.action)}</span>
                    {r.objectLabel && <span style={{ fontWeight: 600 }}> {r.objectLabel}</span>}
                  </div>
                  <div className="mono" style={{ marginTop: 3, fontSize: 10, color: T.inkFaint }}>
                    {whenLabel(r.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  My performance                                                    *
 * ------------------------------------------------------------------ */

/** Dispositions the taxonomy classes as "Reached" — the candidate actually answered. */
const CONNECTED = new Set(DISPOSITIONS.filter((d) => d.category === 'Reached').map((d) => d.id));

function connectRate(logs: CallLog[]) {
  if (!logs.length) return 0;
  return logs.filter((l) => CONNECTED.has(l.disposition)).length / logs.length;
}

/** Local YYYY-MM-DD — toISOString() would shift the day across timezones. */
function dayKey(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function lastNDays(n: number, now: Date) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (n - 1 - i));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IN', { weekday: 'narrow' }),
    };
  });
}

function Bars({ series, color }: { series: { key: string; label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...series.map((s) => s.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 96 }}>
      {series.map((s) => (
        <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span className="mono" style={{ fontSize: 9.5, color: s.value ? T.inkBody : T.inkGhost }}>{s.value}</span>
          <div style={{
            width: '100%', height: `${Math.max(3, (s.value / max) * 62)}px`,
            background: s.value ? color : T.border, borderRadius: 6, transition: 'height .2s',
          }} />
          <span style={{ fontSize: 9.5, color: T.inkFaint, fontWeight: 600 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PerformanceScreen() {
  const { session, caps } = useDesk();
  const c = caps();
  const logs = useLoad(async () => (await deskApi.callLogs({ pageSize: 300 })).items, []);
  const subs = useLoad(() => deskApi.submissions(), []);
  const interviews = useLoad(() => deskApi.interviews({ mine: true }), []);
  const offers = useLoad(() => deskApi.offers(), []);

  if (c.analytics === 'none') {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Reporting is not part of your role"
          body="Ask an admin if you need visibility into activity numbers." />
      </div>
    );
  }

  const all = logs.data || [];
  const today = dayKey(new Date().toISOString());
  const todayLogs = all.filter((l) => dayKey(l.calledAt) === today);
  const days = lastNDays(7, new Date());
  const counts = days.map((d) => ({ ...d, value: all.filter((l) => dayKey(l.calledAt) === d.key).length }));

  const byDisp = DISPOSITIONS
    .map((d) => ({ ...d, count: all.filter((l) => l.disposition === d.id).length }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const funnel = [
    { label: 'Calls logged', value: all.length, color: T.teal },
    { label: 'Submitted', value: (subs.data || []).length, color: T.blue },
    { label: 'Interviewed', value: (interviews.data || []).length, color: T.purple },
    { label: 'Offers', value: (offers.data || []).length, color: T.green },
  ];
  const top = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="pad" style={{ maxWidth: 900 }}>
      <div className="grid-auto">
        <Stat label="Calls today" value={num(todayLogs.length)} icon="call" color={T.teal} tint={T.tealTint} />
        <Stat label="Calls all time" value={num(all.length)} icon="phone_in_talk" color={T.indigo} tint={T.indigoTint} />
        <Stat label="Connect rate" value={pct(connectRate(all))} sub="answered / dialled"
          icon="trending_up" color={T.green} tint={T.greenTint} />
        <Stat label="Submissions" value={num((subs.data || []).length)} icon="send" color={T.blue} tint={T.blueTint} />
      </div>

      <Card style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Calls · last 7 days</span>
          <span style={{ fontSize: 11, color: T.inkFaint }}>{session?.name}</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <Bars series={counts} color={T.indigo} />
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Funnel</span>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {funnel.map((f) => (
            <div key={f.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{f.label}</span>
                <span className="mono" style={{ fontSize: 12 }}>{num(f.value)}</span>
              </div>
              <Meter value={f.value / top} color={f.color} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <Banner icon="info" tone="info">
            Stages count everything visible to your role, not only records you created — so these are
            pipeline volumes, not a personal conversion rate.
          </Banner>
        </div>
      </Card>

      {byDisp.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Outcomes</span>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {byDisp.map((d) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: d.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12 }}>{d.label}</span>
                <div style={{ width: 110 }}><Meter value={d.count / all.length} color={d.color} /></div>
                <span className="mono" style={{ fontSize: 11.5, width: 42, textAlign: 'right' }}>{num(d.count)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="timer_off" size={17} color={T.amber} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Why there is no talk-time chart</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: T.inkMuted, lineHeight: 1.55 }}>
          A browser cannot observe the phone. Durations recorded from the web console come from the
          stopwatch you start and stop, so they are estimates and are not averaged into a metric here.
          The mobile app records true call duration.
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Team dashboard                                                    *
 * ------------------------------------------------------------------ */

export function TeamScreen() {
  const { caps, go } = useDesk();
  const c = caps();

  const users = useLoad(() => deskApi.users(), []);
  const logs = useLoad(async () => (await deskApi.callLogs({ pageSize: 400 })).items, []);
  const dash = useLoad(() => deskApi.hiringDashboard(), []);
  const reqs = useLoad(() => deskApi.requisitions(), []);

  if (c.analytics !== 'all' && c.analytics !== 'team') {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Team reporting is not part of your role"
          body="Your own numbers are on My performance."
          actionLabel="My performance" onAction={() => go('perf')} />
      </div>
    );
  }

  const all = logs.data || [];
  const active = (users.data || []).filter((u) => u.status !== 'suspended');

  const perUser = active
    .map((u) => {
      const mine = all.filter((l) => l.calledById === u.id);
      return { user: u, calls: mine.length, connect: connectRate(mine) };
    })
    .sort((a, b) => b.calls - a.calls);

  const byStatus = dash.data?.byStatus || {};
  const totalPipeline = dash.data?.total || 0;
  const breached = (reqs.data || []).filter((r) => r.slaBreached);

  return (
    <div className="pad" style={{ maxWidth: 1000 }}>
      <div className="grid-auto">
        <Stat label="Active users" value={num(active.length)} icon="group" color={T.indigo} tint={T.indigoTint} />
        <Stat label="Calls logged" value={num(all.length)} icon="call" color={T.teal} tint={T.tealTint} />
        <Stat label="In pipeline" value={num(totalPipeline)} icon="groups" color={T.blue} tint={T.blueTint} />
        <Stat label="SLA breached" value={num(breached.length)} sub={breached.length ? 'needs attention' : 'all on track'}
          icon="running_with_errors" color={breached.length ? T.red : T.green}
          tint={breached.length ? T.redTint : T.greenTint} />
      </div>

      <Panel title="Activity by recruiter" subtitle="Calls logged against each user id">
        {perUser.map((r, i) => (
          <div key={r.user.id} className="row">
            <span className="mono" style={{ width: 20, fontSize: 11, color: T.inkFaint }}>{i + 1}</span>
            <Avatar name={r.user.name} id={r.user.id} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.user.name || r.user.email}</div>
              <div style={{ fontSize: 10.5, color: T.inkFaint }}>{r.user.personaName || r.user.role}</div>
            </div>
            <div style={{ width: 96 }}><Meter value={r.calls / Math.max(1, perUser[0]?.calls || 1)} /></div>
            <span className="mono" style={{ fontSize: 12, width: 40, textAlign: 'right' }}>{num(r.calls)}</span>
            <span className="mono" style={{ fontSize: 11, width: 46, textAlign: 'right', color: T.inkMuted }}>
              {r.calls ? pct(r.connect) : '—'}
            </span>
          </div>
        ))}
        {!perUser.length && (
          <EmptyState icon="group" title="No users to compare" body="Invite recruiters from the Users screen." />
        )}
      </Panel>

      <Card style={{ marginTop: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Pipeline by stage</span>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(104px,1fr))', gap: 9 }}>
          {STAGES.map((s) => (
            <div key={s.id} style={{ background: s.tint, borderRadius: 11, padding: '12px 13px' }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 500, color: s.color }}>{num(byStatus[s.id] || 0)}</div>
              <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 700, color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {breached.length > 0 && (
        <Panel title="Requisitions past SLA" subtitle={`${breached.length} needing attention`}>
          {breached.map((r) => (
            <div key={r.id} className="row row-click" onClick={() => go('job', { requisitionId: r.id })}>
              <Icon name="running_with_errors" size={18} color={T.red} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: T.inkMuted }}>{r.clientName || r.department || '—'}</div>
              </div>
              <Badge label={r.slaLabel || 'overdue'} bg={T.redTint} fg={T.red} />
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
