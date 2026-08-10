/**
 * Dashboard, notifications and tasks.
 *
 * The dashboard reshapes itself per persona: a Sourcer counts records added and
 * duplicates caught, an Admin counts erasure requests and audit events. Every
 * figure is computed from live data — where the API has nothing to say, the
 * tile says so rather than showing a plausible number.
 */

import React, { useState } from 'react';
import { deskApi } from '../api';
import { T } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Banner, Button, Card, EmptyState, ErrorState, Eyebrow, Icon,
  Meter, Panel, Skeleton, SkeletonRows, Stat, num, pct, useLoad, whenLabel,
} from '../ui';
import { disposition, stage } from '../tokens';

/* ------------------------------------------------------------------ *
 *  Dashboard                                                         *
 * ------------------------------------------------------------------ */

interface Tile {
  label: string; value: string; sub: string; icon: string;
  color: string; tint: string; go?: () => void;
}

export function HomeScreen() {
  const { session, go, caps, openModal, words } = useDesk();
  const home = session?.home || 'dialer';
  const c = caps();
  const w = words();

  // Load only what this persona's tiles need — avoid 11 parallel full scans for every role.
  const load = useLoad(async () => {
    const needQueue = !!c.dial;
    const needApprovals = !!c.approve;
    const needAdmin = !!c.admin;
    const needPanel = home === 'panel' || home === 'ta' || home === 'hm';
    const needSubs = home === 'dialer' || home === 'lead' || home === 'am' || !!c.dial;

    const [
      stats, queue, dash, tasks, approvals, offers, interviews, subs, compliance, audit, users,
    ] = await Promise.all([
      deskApi.callStats().catch(() => null),
      needQueue ? deskApi.callQueue({ pageSize: 6 }).catch(() => null) : Promise.resolve(null),
      deskApi.hiringDashboard().catch(() => null),
      deskApi.tasks({ mine: true }).catch(() => []),
      needApprovals
        ? deskApi.approvals({ mine: true, status: 'pending' }).catch(() => [])
        : Promise.resolve([]),
      home === 'hm' || home === 'lead' || needApprovals
        ? deskApi.offers().catch(() => [])
        : Promise.resolve([]),
      needPanel
        ? deskApi.interviews({ mine: home === 'panel' }).catch(() => [])
        : Promise.resolve([]),
      needSubs ? deskApi.submissions().catch(() => []) : Promise.resolve([]),
      needAdmin ? deskApi.compliance().catch(() => null) : Promise.resolve(null),
      needAdmin ? deskApi.audit(30).catch(() => []) : Promise.resolve([]),
      needAdmin ? deskApi.users().catch(() => []) : Promise.resolve([]),
    ]);
    return { stats, queue, dash, tasks, approvals, offers, interviews, subs, compliance, audit, users };
  }, [home, c.dial, c.admin, c.approve]);

  if (load.loading) {
    return <div className="pad"><Skeleton rows={4} height={104} /></div>;
  }
  if (load.error) return <div className="pad"><ErrorState message={load.error} onRetry={load.reload} /></div>;

  const d = load.data!;
  const reached = Object.entries(d.stats?.byDisposition || {})
    .filter(([k]) => disposition(k).category === 'Reached')
    .reduce((a, [, v]) => a + v, 0);
  const connectRate = pct(reached, d.stats?.totalCount || 0);
  const openTasks = d.tasks.filter((t) => !t.done);
  const overdueTasks = openTasks.filter((t) => t.overdue);
  const byStatus = d.dash?.byStatus || {};
  const scorecardsDue = d.interviews.filter((i) => !i.hasScorecard && i.status === 'scheduled').length;

  /** Each persona gets the four numbers that actually govern their day. */
  const tiles: Record<string, Tile[]> = {
    dialer: [
      { label: 'Calls today', value: num(d.stats?.todayCount || 0), sub: `${num(d.queue?.total || 0)} in queue`, icon: 'call', color: T.indigo, tint: T.indigoTint, go: () => go('queue') },
      { label: 'Connect rate', value: connectRate, sub: `${num(reached)} reached of ${num(d.stats?.totalCount || 0)}`, icon: 'trending_up', color: T.green, tint: T.greenTint, go: () => go('perf') },
      { label: 'Callbacks due', value: num(d.stats?.callbacksDue || 0), sub: 'next 24 hours', icon: 'history', color: T.red, tint: T.redTint, go: () => go('callbacks') },
      { label: 'Submissions', value: num(d.subs.length), sub: 'all time', icon: 'send', color: T.teal, tint: T.tealTint, go: () => go('subs') },
    ],
    sourcer: [
      { label: 'Candidate database', value: num(d.dash?.total || 0), sub: 'records you can search', icon: 'groups', color: T.teal, tint: T.tealTint, go: () => go('cands') },
      { label: 'Sourced stage', value: num(byStatus.new || 0), sub: 'not yet contacted', icon: 'person_add', color: T.indigo, tint: T.indigoTint, go: () => go('cands') },
      { label: 'In screening', value: num(byStatus.reviewing || 0), sub: 'handed to recruiters', icon: 'swap_horiz', color: T.amber, tint: T.amberTint, go: () => go('cands') },
      { label: 'Calls logged', value: num(d.stats?.totalCount || 0), sub: `${connectRate} connect rate`, icon: 'call', color: T.purple, tint: T.purpleTint, go: () => go('history') },
    ],
    ta: [
      { label: `Open ${w.reqPlural.toLowerCase()}`, value: num(d.dash?.roles?.length || 0), sub: 'across the workspace', icon: 'work', color: T.indigo, tint: T.indigoTint, go: () => go('jobs') },
      { label: 'In interview', value: num(byStatus.interview || 0), sub: `${d.interviews.length} scheduled`, icon: 'event', color: T.purple, tint: T.purpleTint, go: () => go('intcal') },
      { label: 'Submitted', value: num(byStatus.shortlisted || 0), sub: 'awaiting a decision', icon: 'hourglass_top', color: T.red, tint: T.redTint, go: () => go('kanban') },
      { label: 'Scorecards due', value: num(scorecardsDue), sub: 'not yet submitted', icon: 'rate_review', color: T.amber, tint: T.amberTint, go: () => go('scorecard') },
    ],
    lead: [
      { label: 'Team calls', value: num(d.stats?.totalCount || 0), sub: `${num(d.stats?.todayCount || 0)} today`, icon: 'call', color: T.indigo, tint: T.indigoTint, go: () => go('team') },
      { label: 'Connect rate', value: connectRate, sub: 'across the team', icon: 'trending_up', color: T.green, tint: T.greenTint, go: () => go('team') },
      { label: 'Submissions', value: num(d.subs.length), sub: 'all accounts', icon: 'send', color: T.teal, tint: T.tealTint, go: () => go('subs') },
      { label: 'Approvals waiting', value: num(d.approvals.length), sub: 'on you', icon: 'gavel', color: T.purple, tint: T.purpleTint, go: () => go('approvals') },
    ],
    am: [
      { label: 'Live accounts', value: '—', sub: 'open the client list', icon: 'apartment', color: T.indigo, tint: T.indigoTint, go: () => go('clients') },
      { label: `Open ${w.reqPlural.toLowerCase()}`, value: num(d.dash?.roles?.length || 0), sub: 'across accounts', icon: 'work', color: T.teal, tint: T.tealTint, go: () => go('jobs') },
      { label: 'Submissions', value: num(d.subs.length), sub: `${d.subs.filter((s) => s.status === 'client_review').length} in client review`, icon: 'send', color: T.blue, tint: T.blueTint, go: () => go('subs') },
      { label: 'Placed', value: num(d.subs.filter((s) => s.status === 'placed').length), sub: 'converted to hires', icon: 'check_circle', color: T.green, tint: T.greenTint, go: () => go('subs') },
    ],
    hm: [
      { label: 'Waiting on you', value: num(byStatus.shortlisted || 0), sub: 'submitted for review', icon: 'hourglass_top', color: T.red, tint: T.redTint, go: () => go('kanban') },
      { label: 'Offers to approve', value: num(d.approvals.length), sub: 'pending your decision', icon: 'gavel', color: T.purple, tint: T.purpleTint, go: () => go('approvals') },
      { label: `My ${w.reqPlural.toLowerCase()}`, value: num(d.dash?.roles?.length || 0), sub: 'you own', icon: 'work', color: T.indigo, tint: T.indigoTint, go: () => go('jobs') },
      { label: 'Scorecards due', value: num(scorecardsDue), sub: 'from your panels', icon: 'rate_review', color: T.amber, tint: T.amberTint, go: () => go('scorecard') },
    ],
    panel: [
      { label: 'Your interviews', value: num(d.interviews.length), sub: 'scheduled with you', icon: 'event', color: T.purple, tint: T.purpleTint, go: () => go('intcal') },
      { label: 'Scorecards due', value: num(scorecardsDue), sub: 'submit within 24h', icon: 'rate_review', color: T.amber, tint: T.amberTint, go: () => go('scorecard') },
      { label: 'Completed', value: num(d.interviews.filter((i) => i.status === 'completed').length), sub: 'interviews done', icon: 'check_circle', color: T.green, tint: T.greenTint, go: () => go('intcal') },
      { label: 'With scorecard', value: num(d.interviews.filter((i) => i.hasScorecard).length), sub: 'feedback submitted', icon: 'task_alt', color: T.teal, tint: T.tealTint, go: () => go('intcal') },
    ],
    admin: [
      { label: 'Workspace users', value: num(d.users.length), sub: `${d.users.filter((u) => u.status === 'invited').length} invited`, icon: 'manage_accounts', color: T.indigo, tint: T.indigoTint, go: () => go('users') },
      { label: 'Erasure requests', value: num(d.compliance?.openErasures || 0), sub: 'DPDP clock running', icon: 'delete_sweep', color: T.red, tint: T.redTint, go: () => go('compliance') },
      { label: 'DND list', value: num(d.compliance?.dncCount || 0), sub: 'locked from every queue', icon: 'block', color: T.maroon, tint: T.maroonTint, go: () => go('compliance') },
      { label: 'Audit events', value: num(d.audit.length), sub: 'most recent', icon: 'receipt_long', color: T.neutral, tint: T.neutralTint, go: () => go('audit') },
    ],
  };

  const greet: Record<string, string> = {
    dialer: `${num(d.queue?.total || 0)} numbers in the queue. ${d.stats?.callbacksDue || 0} callbacks due.`,
    sourcer: `${num(d.dash?.total || 0)} records in the database. ${num(byStatus.new || 0)} still untouched.`,
    ta: `${num(byStatus.interview || 0)} candidates at interview, ${scorecardsDue} scorecards outstanding.`,
    lead: `${num(d.stats?.todayCount || 0)} calls logged today at a ${connectRate} connect rate.`,
    am: `${d.subs.filter((s) => s.status === 'client_review').length} submissions sitting in client review.`,
    hm: `${num(byStatus.shortlisted || 0)} candidates and ${d.approvals.length} approvals are waiting on you.`,
    panel: `${d.interviews.length} interviews on your calendar, ${scorecardsDue} scorecards to submit.`,
    admin: `${d.compliance?.openErasures || 0} erasure requests open, ${num(d.compliance?.missingConsent || 0)} records without consent.`,
  };

  const cta: Record<string, { label: string; icon: string; go: () => void }> = {
    dialer: { label: 'Start calling', icon: 'play_arrow', go: () => go('queue') },
    sourcer: { label: 'Add candidate', icon: 'person_add', go: () => openModal('addcand') },
    ta: { label: 'Open pipeline', icon: 'view_kanban', go: () => go('kanban') },
    lead: { label: 'Team dashboard', icon: 'leaderboard', go: () => go('team') },
    am: { label: 'Open clients', icon: 'apartment', go: () => go('clients') },
    hm: { label: 'Review candidates', icon: 'how_to_reg', go: () => go('kanban') },
    panel: { label: 'Open interviews', icon: 'event', go: () => go('intcal') },
    admin: { label: 'Compliance centre', icon: 'verified_user', go: () => go('compliance') },
  };

  // Alerts are derived, so they only appear when there is really something to do.
  const alerts: { icon: string; tint: string; color: string; title: string; detail: string; cta: string; go: () => void }[] = [];
  if (d.approvals.length) {
    alerts.push({ icon: 'gavel', tint: T.purpleTint, color: T.purple,
      title: `${d.approvals.length} approval${d.approvals.length > 1 ? 's' : ''} waiting on you`,
      detail: d.approvals[0].refLabel || 'Review the terms and decide', cta: 'Review', go: () => go('approvals') });
  }
  if (overdueTasks.length) {
    alerts.push({ icon: 'task_alt', tint: T.redTint, color: T.red,
      title: `${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} overdue`,
      detail: overdueTasks[0].title, cta: 'Open', go: () => go('tasks') });
  }
  if (scorecardsDue) {
    alerts.push({ icon: 'rate_review', tint: T.amberTint, color: T.amber,
      title: `${scorecardsDue} scorecard${scorecardsDue > 1 ? 's' : ''} outstanding`,
      detail: 'Panel feedback not yet submitted', cta: 'Fill in', go: () => go('intcal') });
  }
  if (c.admin && (d.compliance?.openErasures || 0) > 0) {
    alerts.push({ icon: 'delete_sweep', tint: T.maroonTint, color: T.maroon,
      title: `${d.compliance!.openErasures} erasure request(s) open`,
      detail: 'DPDP clock is running', cta: 'Handle', go: () => go('compliance') });
  }

  return (
    <div className="pad">
      {/* Persona header */}
      <Card style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Avatar name={session?.name} id={session?.userId || 'me'} size={42} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.01em' }}>{session?.name}</span>
            <Badge label={session?.personaName || ''} bg={T.indigoTint} fg={T.indigoInk} />
          </div>
          <div style={{ marginTop: 5, fontSize: 12.5, color: T.inkMuted, lineHeight: 1.5 }}>
            {greet[home] || greet.dialer}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button icon={cta[home]?.icon} onClick={cta[home]?.go}>{cta[home]?.label}</Button>
          <Button variant="ghost" icon="swap_horiz" onClick={() => openModal('personas')}>Switch persona</Button>
        </div>
      </Card>

      <div className="grid-auto">
        {(tiles[home] || tiles.dialer).map((t) => (
          <Stat key={t.label} label={t.label} value={t.value} sub={t.sub}
            icon={t.icon} color={t.color} tint={t.tint} onClick={t.go} />
        ))}
      </div>

      <div className="grid-panels" style={{ marginTop: 16 }}>
        {/* Up next in the queue */}
        {c.dial && (
          <Panel
            title="Up next in the queue"
            subtitle={`${num(d.queue?.total || 0)} waiting`}
            action={<Button variant="soft" onClick={() => go('queue')}>Open console</Button>}
          >
            {(d.queue?.items || []).slice(0, 5).map((r) => {
              const dis = disposition(r.lastDisposition);
              return (
                <div key={r.candidateId} className="row row-click"
                  onClick={() => go('cands', { candidateId: r.candidateId })}
                >
                  <Avatar name={r.name} id={r.candidateId} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.name || 'Unnamed'}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 11, color: T.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.roleName}
                    </div>
                  </div>
                  <Badge label={dis.label} bg={dis.tint} fg={dis.color} icon={dis.icon} />
                </div>
              );
            })}
            {!(d.queue?.items || []).length && (
              <EmptyState icon="phone_disabled" title="Queue is empty"
                body="Nothing to dial. Build a queue from a requisition pipeline." />
            )}
          </Panel>
        )}

        {/* Needs you */}
        <Panel title="Needs you">
          {alerts.length === 0 && (
            <EmptyState icon="check_circle" title="Nothing needs you" tone="success"
              body="No approvals, overdue tasks or outstanding scorecards." />
          )}
          {alerts.map((a) => (
            <div key={a.title} className="row row-click" onClick={a.go}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: a.tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={a.icon} size={17} color={a.color} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.title}</div>
                <div style={{ marginTop: 2, fontSize: 11, color: T.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.detail}
                </div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.indigo, flexShrink: 0 }}>{a.cta}</span>
            </div>
          ))}
        </Panel>

        {/* Pipeline by stage */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Pipeline by stage</span>
            <button onClick={() => go('kanban')} style={{ fontSize: 12, fontWeight: 600, color: T.indigo }}>
              Open board
            </button>
          </div>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: 9 }}>
            {stageList().map((s) => (
              <div key={s.id} style={{ background: s.tint, borderRadius: 11, padding: '11px 12px' }}>
                <div className="mono" style={{ fontSize: 19, fontWeight: 500, color: s.color }}>
                  {num(byStatus[s.id] || 0)}
                </div>
                <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 700, color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tasks */}
        <Panel
          title="Your tasks"
          subtitle={`${openTasks.length} open`}
          action={<Button variant="soft" onClick={() => go('tasks')}>All tasks</Button>}
        >
          {openTasks.slice(0, 5).map((t) => (
            <div key={t.id} className="row">
              <Icon name="radio_button_unchecked" size={18} color={T.inkGhost} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.title}</div>
                <div style={{ marginTop: 2, fontSize: 11, color: t.overdue ? T.red : T.inkMuted }}>
                  {t.dueAt ? whenLabel(t.dueAt) : 'No due date'}
                </div>
              </div>
            </div>
          ))}
          {!openTasks.length && (
            <EmptyState icon="task_alt" title="Nothing outstanding" body="Tasks assigned to you appear here." />
          )}
        </Panel>
      </div>
    </div>
  );
}

function stageList() {
  return [
    stage('new'), stage('reviewing'), stage('shortlisted'),
    stage('interview'), stage('offer'), stage('hired'),
  ];
}

/* ------------------------------------------------------------------ *
 *  Notifications                                                     *
 * ------------------------------------------------------------------ */

export function NotificationsScreen() {
  const { go } = useDesk();
  const load = useLoad(() => deskApi.notifications(), []);

  const tone: Record<string, { icon: string; tint: string; color: string }> = {
    callback: { icon: 'history', tint: T.tealTint, color: T.teal },
    mention: { icon: 'alternate_email', tint: T.indigoTint, color: T.indigo },
    approval: { icon: 'gavel', tint: T.purpleTint, color: T.purple },
    interview: { icon: 'event', tint: T.blueTint, color: T.blue },
    data: { icon: 'wrong_location', tint: T.rustTint, color: T.rust },
    system: { icon: 'info', tint: T.fill, color: T.inkMuted },
  };

  return (
    <div className="pad">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Eyebrow>Notifications</Eyebrow>
        <Button variant="ghost" onClick={async () => { await deskApi.markAllRead(); load.reload(); }}>
          Mark all read
        </Button>
      </div>

      {load.loading && <SkeletonRows rows={5} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && load.data.length === 0 && (
        <EmptyState icon="inbox" title="Nothing needs you"
          body="Callbacks, approvals and flagged records surface here as they happen." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(load.data || []).map((n) => {
          const t = tone[n.kind] || tone.system;
          return (
            <Card key={n.id} pad={12}
              onClick={n.refKind === 'candidate' && n.refId
                ? () => go('cands', { candidateId: n.refId! }) : undefined}
            >
              <div style={{ display: 'flex', gap: 11 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: t.tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={t.icon} size={18} color={t.color} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                  <div style={{ marginTop: 3, fontSize: 11.5, color: T.inkMuted }}>{n.detail}</div>
                  <div className="mono" style={{ marginTop: 6, fontSize: 9.5, color: T.inkFaint }}>
                    {whenLabel(n.createdAt)}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Tasks                                                             *
 * ------------------------------------------------------------------ */

export function TasksScreen() {
  const { go } = useDesk();
  const [showDone, setShowDone] = useState(false);
  const [draft, setDraft] = useState('');
  const load = useLoad(() => deskApi.tasks({ mine: true, includeDone: showDone }), [showDone]);

  const toggle = async (id: string, done: boolean) => {
    await deskApi.updateTask(id, { done });
    load.reload();
  };

  const add = async () => {
    if (!draft.trim()) return;
    await deskApi.createTask({ title: draft.trim() });
    setDraft('');
    load.reload();
  };

  return (
    <div className="pad">
      <Card style={{ marginBottom: 14, display: 'flex', gap: 8 }}>
        <input
          className="field"
          placeholder="Add a task…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
        />
        <Button icon="add" onClick={add} disabled={!draft.trim()}>Add</Button>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Button variant={showDone ? 'soft' : 'ghost'} onClick={() => setShowDone(!showDone)}>
          {showDone ? 'Hiding nothing' : 'Show completed'}
        </Button>
      </div>

      {load.loading && <SkeletonRows rows={5} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !load.data.length && (
        <EmptyState icon="task_alt" title="Nothing outstanding"
          body="Add a task above, or let callbacks and screenings create them for you." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(load.data || []).map((t) => (
          <Card key={t.id} pad={12}>
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <button onClick={() => toggle(t.id, !t.done)} aria-label={t.done ? 'Mark not done' : 'Mark done'}>
                <Icon name={t.done ? 'check_circle' : 'radio_button_unchecked'} size={22}
                  color={t.done ? T.green : T.inkGhost} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  textDecoration: t.done ? 'line-through' : 'none',
                  color: t.done ? T.inkFaint : T.ink,
                }}
                >
                  {t.title}
                </div>
                <div style={{ marginTop: 5, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.done ? T.inkFaint : t.overdue ? T.red : T.inkMuted }}>
                    {t.done ? 'Completed' : t.dueAt ? whenLabel(t.dueAt) : 'No due date'}
                  </span>
                  {t.linkLabel && (
                    <button style={{ fontSize: 11, color: T.indigo }}
                      onClick={() => t.linkKind === 'candidate' && t.linkId && go('cands', { candidateId: t.linkId })}
                    >
                      {t.linkLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
