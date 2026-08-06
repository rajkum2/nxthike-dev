/**
 * Call console, callbacks, history and the end-of-queue summary.
 *
 * The web app cannot observe call state — a browser has no telephony. So the
 * duration is a stopwatch the recruiter starts and stops, clearly labelled as
 * an estimate, and the number opens through a `tel:` handoff to whatever
 * softphone or desk phone the machine is set up with.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { deskApi, type CallLog, type QueueItem } from '../api';
import { DISPOSITIONS, T, disposition, stage } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Banner, Button, Card, Chip, EmptyState, ErrorState, Eyebrow,
  FactGrid, Icon, Meter, Panel, Skeleton, SkeletonRows, Stat, Textarea,
  duration, maskEmail, maskPhone, num, pct, useLoad, useMediaQuery, whenLabel,
} from '../ui';

/* ------------------------------------------------------------------ *
 *  Call console                                                      *
 * ------------------------------------------------------------------ */

export function QueueScreen() {
  const { session, caps, go } = useDesk();
  const c = caps();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const cw = session?.settings.callingWindow;
  const windowOpen = cw?.isOpen ?? true;
  //: Roles the API masks contact details for.
  const maskedRole = ['limitedPII', 'ownReqs', 'ownInterviews'].includes(c.db);

  const [cursor, setCursor] = useState(0);
  const [live, setLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [dispId, setDispId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [nextAction, setNextAction] = useState('none');
  const [saving, setSaving] = useState(false);
  const [logged, setLogged] = useState<string[]>([]);
  const [showList, setShowList] = useState(true);
  const timer = useRef<number | null>(null);

  const queue = useLoad(() => deskApi.callQueue({ pageSize: 100 }), []);
  const stats = useLoad(() => deskApi.callStats(), [logged.length]);

  const rows = queue.data?.items || [];
  const current: QueueItem | undefined = rows[cursor];

  // The only duration signal a browser has: a stopwatch the user controls.
  useEffect(() => {
    if (live) {
      timer.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [live]);

  const detail = useLoad(
    async () => (current ? deskApi.candidate(current.candidateId) : null),
    [current?.candidateId],
  );

  const lastCall = useLoad(
    async () => (current ? (await deskApi.callLogs({ candidateId: current.candidateId, pageSize: 1 })).items[0] || null : null),
    [current?.candidateId],
  );

  const dnc = detail.data?.dnc || current?.lastDisposition === 'do_not_call';
  const canDial = c.dial && windowOpen && !dnc && !!current?.phone;

  const startCall = () => {
    if (!canDial || !current?.phone) return;
    setElapsed(0);
    setLive(true);
    // Hand off to the softphone / desk phone. Nothing is recorded in the browser.
    window.location.href = `tel:${current.phone.replace(/[^\d+]/g, '')}`;
  };

  const endCall = () => setLive(false);

  const save = async (advance: boolean) => {
    if (!dispId || !current) return;
    setSaving(true);
    try {
      await deskApi.logCall({
        candidateId: current.candidateId,
        disposition: dispId,
        note,
        durationSeconds: elapsed || null,
        durationEstimated: true,
        nextAction: nextAction === 'none' ? null : nextAction,
        candidateName: current.name,
        candidatePhone: current.phone,
        roleId: current.roleId,
        roleName: current.roleName,
      });
      setLogged((l) => [...l, dispId]);
      setDispId(null); setNote(''); setElapsed(0); setLive(false); setNextAction('none');
      if (advance) {
        if (cursor + 1 >= rows.length) go('summary');
        else setCursor(cursor + 1);
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!c.dial) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Calling is not part of your role"
          body={`${session?.personaName} does not dial or log calls. Your work starts on the pipeline and interview screens.`}
          actionLabel="Open pipeline" onAction={() => go('kanban')} />
      </div>
    );
  }

  const reached = Object.entries(stats.data?.byDisposition || {})
    .filter(([k]) => disposition(k).category === 'Reached')
    .reduce((a, [, v]) => a + v, 0);

  const listPane = (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="card-head">
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Queue</div>
          <div style={{ marginTop: 2, fontSize: 11.5, color: T.inkFaint }}>
            {num(queue.data?.total || 0)} waiting · {logged.length} logged this sitting
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {queue.loading && <div style={{ padding: 12 }}><SkeletonRows rows={6} /></div>}
        {queue.error && <ErrorState message={queue.error} onRetry={queue.reload} />}
        {queue.data && !rows.length && (
          <EmptyState icon="phone_disabled" title="No calls queued"
            body="Every candidate with a phone number has been worked, or the filter is too narrow."
            actionLabel="Open requisitions" onAction={() => go('jobs')} />
        )}
        {rows.map((r, i) => {
          const d = disposition(r.lastDisposition);
          const active = i === cursor;
          const blocked = r.lastDisposition === 'do_not_call';
          return (
            <button
              key={r.candidateId}
              onClick={() => { setCursor(i); setShowList(false); setDispId(null); setLive(false); setElapsed(0); }}
              style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 11,
                padding: '11px 14px', borderBottom: `1px solid ${T.dividerFaint}`,
                background: active ? T.indigoTint : 'transparent', opacity: blocked ? 0.6 : 1,
              }}
            >
              <Avatar name={r.name} id={r.candidateId} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.name || 'Unnamed'}
                </span>
                <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: T.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.roleName}
                </span>
              </span>
              <Badge label={d.label} bg={d.tint} fg={d.color} icon={d.icon} />
            </button>
          );
        })}
      </div>
    </div>
  );

  const callPane = !current ? (
    <Card><EmptyState icon="call" title="Nothing selected" body="Pick a candidate from the queue." /></Card>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      {!windowOpen && (
        <Banner icon="block" tone="danger">
          Outside the calling window. TCCCPR permits commercial calls {cw?.label} only —
          dialling is disabled, not merely discouraged.
        </Banner>
      )}
      {dnc && (
        <Banner icon="block" tone="danger">
          This number is flagged do-not-call. It stays visible for context but cannot be dialled.
        </Banner>
      )}

      <Card>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Avatar name={current.name} id={current.candidateId} size={52} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>{current.name || 'Unnamed'}</div>
            <div style={{ marginTop: 3, fontSize: 12.5, color: T.inkMuted }}>{current.roleName}</div>
            <div style={{ marginTop: 9, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge label={stage(current.status).label} bg={stage(current.status).tint} fg={stage(current.status).color} />
              <Badge
                label={detail.data?.consentAt ? 'Consent' : 'No consent'}
                bg={detail.data?.consentAt ? T.greenTint : T.amberTint}
                fg={detail.data?.consentAt ? T.green : T.amberInk}
                icon={detail.data?.consentAt ? 'verified_user' : 'gpp_maybe'}
              />
              <Badge label={windowOpen ? 'In window' : 'Window closed'}
                bg={windowOpen ? T.tealTint : T.maroonTint}
                fg={windowOpen ? T.tealInk : T.maroon}
                icon={windowOpen ? 'schedule' : 'block'} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: T.inkFaint }}>
            {cursor + 1} of {rows.length}
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.divider}` }}>
          <FactGrid
            columns={isMobile ? 2 : 4}
            facts={[
              // The queue endpoint predates masking, so mask here; the detail
              // record arrives already masked when the role requires it.
              ['Phone', detail.data?.piiMasked ? (detail.data.phone || '') : maskedRole ? maskPhone(current.phone) : current.phone || ''],
              ['Email', detail.data?.piiMasked ? (detail.data.email || '') : maskedRole ? maskEmail(current.email) : current.email || ''],
              ['Location', current.city || ''],
              ['Source', detail.data?.source || ''],
            ]}
          />
        </div>

        {/* Dial + stopwatch */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {!live ? (
            <Button icon={canDial ? 'call' : 'block'} onClick={startCall} disabled={!canDial}
              style={{ height: 44, padding: '0 20px', fontSize: 14 }}
            >
              {!windowOpen ? 'Calling window closed' : dnc ? 'Blocked · do not call' : `Call ${(current.name || '').split(' ')[0] || 'candidate'}`}
            </Button>
          ) : (
            <>
              <Button icon="call_end" variant="danger" onClick={endCall}
                style={{ height: 44, padding: '0 20px', fontSize: 14 }}
              >
                End call
              </Button>
              <span className="mono" style={{ fontSize: 22, fontWeight: 500 }}>{duration(elapsed)}</span>
              <Eyebrow>stopwatch · editable</Eyebrow>
            </>
          )}
          <Button variant="ghost" icon="chat" onClick={() => go('composer', { candidateId: current.candidateId })}>
            Message
          </Button>
          <Button variant="ghost" icon="skip_next"
            onClick={() => { setCursor(Math.min(cursor + 1, rows.length - 1)); setDispId(null); setLive(false); setElapsed(0); }}
          >
            Skip
          </Button>
        </div>
        <div style={{ marginTop: 8, fontSize: 10.5, color: T.inkFaint }}>
          Opens your softphone or desk phone. The browser cannot observe call state, so the duration above is a stopwatch and is saved as an estimate.
        </div>
      </Card>

      {/* Last contact */}
      {lastCall.data && (
        <Card style={{ background: T.surfaceAlt }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>Last contact</span>
            <span className="mono" style={{ fontSize: 10, color: T.inkFaint }}>{whenLabel(lastCall.data.calledAt)}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Badge label={disposition(lastCall.data.disposition).label}
              bg={disposition(lastCall.data.disposition).tint}
              fg={disposition(lastCall.data.disposition).color}
              icon={disposition(lastCall.data.disposition).icon} />
          </div>
          {lastCall.data.note && (
            <div style={{ marginTop: 8, fontSize: 12.5, color: T.inkBody, lineHeight: 1.5 }}>{lastCall.data.note}</div>
          )}
        </Card>
      )}

      {/* Disposition capture — always visible, so the outcome is one click away */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Log the outcome</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="timer" size={16} color={T.inkMuted} />
            <input
              className="mono"
              value={duration(elapsed)}
              onChange={(e) => {
                const [m, s] = e.target.value.split(':');
                const total = (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
                if (!Number.isNaN(total)) setElapsed(total);
              }}
              style={{ width: 66, textAlign: 'center', border: `1px solid ${T.borderInput}`, borderRadius: 8, height: 32, fontSize: 14 }}
            />
            <Eyebrow>estimated</Eyebrow>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${isMobile ? 150 : 180}px,1fr))`, gap: 7 }}>
          {DISPOSITIONS.map((d) => {
            const on = dispId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setDispId(d.id);
                  setNextAction(d.id === 'connected_callback' ? 'callback'
                    : d.id === 'do_not_call' ? 'dnc'
                      : ['connected_interested', 'screening_passed'].includes(d.id) ? 'stage' : 'none');
                }}
                style={{
                  minHeight: 56, borderRadius: 13, padding: '9px 11px', textAlign: 'left',
                  background: on ? d.color : d.tint,
                  border: `1.5px solid ${on ? d.color : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 9,
                }}
              >
                <Icon name={d.icon} size={20} color={on ? '#fff' : d.color} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: on ? '#fff' : d.color }}>
                    {d.label}
                  </span>
                  <span className="mono" style={{ display: 'block', marginTop: 2, fontSize: 9.5, color: on ? 'rgba(255,255,255,.75)' : `${d.color}B0` }}>
                    {d.category}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {dispId && (
          <div style={{ marginTop: 12, background: disposition(dispId).tint, borderRadius: 12, padding: 12, display: 'flex', gap: 9 }}>
            <Icon name="arrow_forward" size={18} color={disposition(dispId).color} />
            <span style={{ fontSize: 12, lineHeight: 1.5 }}>
              <strong>Next action · </strong>{disposition(dispId).next}
            </span>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <label className="label">Quick note</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did they actually say? Comp, notice, and what they are comparing against."
          />
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={() => save(true)} disabled={!dispId || saving}>
            {saving ? 'Saving…' : 'Save & next'}
          </Button>
          <Button variant="ghost" onClick={() => save(false)} disabled={!dispId || saving}>Save</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="pad" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Progress */}
      <Card pad={14} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Today</span>
              <span className="mono" style={{ fontSize: 12 }}>
                {num(stats.data?.todayCount || 0)} logged · {pct(reached, stats.data?.totalCount || 0)} connect
              </span>
            </div>
            <Meter value={(stats.data?.todayCount || 0) / Math.max(1, rows.length)} />
          </div>
          <Button variant="ghost" icon="history" onClick={() => go('callbacks')}>
            Callbacks ({stats.data?.callbacksDue || 0})
          </Button>
          <Button variant="ghost" icon="phone_in_talk" onClick={() => go('history')}>History</Button>
        </div>
      </Card>

      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {showList ? listPane : (
            <>
              <Button variant="ghost" icon="arrow_back" onClick={() => setShowList(true)} style={{ marginBottom: 12 }}>
                Back to queue
              </Button>
              {callPane}
            </>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
          {listPane}
          <div style={{ overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>{callPane}</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Callbacks                                                         *
 * ------------------------------------------------------------------ */

export function CallbacksScreen() {
  const { go } = useDesk();
  const load = useLoad(
    async () => (await deskApi.callLogs({ disposition: 'connected_callback', pageSize: 100 })).items
      .filter((l) => l.callbackAt)
      .sort((a, b) => (a.callbackAt || '').localeCompare(b.callbackAt || '')),
    [],
  );

  const now = Date.now();

  return (
    <div className="pad">
      {load.loading && <SkeletonRows rows={5} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !load.data.length && (
        <EmptyState icon="history" title="No callbacks booked"
          body="When a call ends in “Callback”, the slot you pick lands here."
          actionLabel="Open the console" onAction={() => go('queue')} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(load.data || []).map((l) => {
          const overdue = l.callbackAt ? new Date(l.callbackAt).getTime() < now : false;
          return (
            <Card key={l.id} pad={12} onClick={() => go('cands', { candidateId: l.candidateId })}
              style={{ borderColor: overdue ? T.maroonBorder : undefined }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={l.candidateName} id={l.candidateId} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{l.candidateName || 'Candidate'}</div>
                  <div style={{ marginTop: 2, fontSize: 11.5, color: T.inkMuted }}>
                    {l.note || 'No reason captured'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <Icon name={overdue ? 'error' : 'schedule'} size={15} color={overdue ? T.red : T.teal} />
                  <span className="mono" style={{ fontSize: 11.5, color: overdue ? T.red : T.teal, fontWeight: 600 }}>
                    {whenLabel(l.callbackAt)}{overdue ? ' · overdue' : ''}
                  </span>
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
 *  Call history                                                      *
 * ------------------------------------------------------------------ */

const HISTORY_FILTERS: { key: string; label: string; match: (c: string) => boolean }[] = [
  { key: 'all', label: 'All outcomes', match: () => true },
  { key: 'reached', label: 'Reached', match: (c) => c === 'Reached' },
  { key: 'missed', label: 'Not reached', match: (c) => c === 'Not reached' },
  { key: 'data', label: 'Data issues', match: (c) => c === 'Data issue' || c === 'Compliance' },
];

export function HistoryScreen() {
  const [filter, setFilter] = useState('all');
  const load = useLoad(async () => (await deskApi.callLogs({ pageSize: 100 })).items, []);

  const rule = HISTORY_FILTERS.find((f) => f.key === filter)!;
  const shown = (load.data || []).filter((l) => rule.match(disposition(l.disposition).category));

  return (
    <div className="pad">
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {HISTORY_FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} on={filter === f.key} onClick={() => setFilter(f.key)} />
        ))}
      </div>

      {load.loading && <SkeletonRows rows={6} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !shown.length && (
        <EmptyState icon="phone_disabled"
          title={load.data.length ? 'Nothing in this filter' : 'No calls logged yet'}
          body={load.data.length ? 'Try another outcome group.' : 'Outcomes you log from the console appear here, newest first.'}
          actionLabel={load.data.length ? 'Show all' : undefined}
          onAction={() => setFilter('all')} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shown.map((l) => <CallRow key={l.id} log={l} />)}
      </div>
    </div>
  );
}

export function CallRow({ log, showName = true }: { log: CallLog; showName?: boolean }) {
  const d = disposition(log.disposition);
  return (
    <Card pad={12}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: d.tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name={d.icon} size={17} color={d.color} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {showName && <div style={{ fontSize: 13.5, fontWeight: 700 }}>{log.candidateName || 'Candidate'}</div>}
          <div style={{ marginTop: showName ? 2 : 0, fontSize: 12, fontWeight: 600, color: d.color }}>{d.label}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>{duration(log.durationSeconds)}</div>
          <div className="mono" style={{ fontSize: 9.5, color: T.inkFaint, marginTop: 2 }}>{whenLabel(log.calledAt)}</div>
        </div>
      </div>
      {log.note && (
        <div style={{ marginTop: 9, fontSize: 12, color: T.inkBody, lineHeight: 1.5, background: '#F7F6FB', borderRadius: 9, padding: '9px 10px' }}>
          {log.note}
        </div>
      )}
      <div style={{ marginTop: 7, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Eyebrow>estimated</Eyebrow>
        {log.roleName && <span style={{ fontSize: 11, color: T.inkFaint }}>{log.roleName}</span>}
        {log.userEmail && <span style={{ fontSize: 11, color: T.inkFaint, marginLeft: 'auto' }}>{log.userEmail}</span>}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 *  Queue summary                                                     *
 * ------------------------------------------------------------------ */

export function SummaryScreen() {
  const { go } = useDesk();
  const load = useLoad(() => deskApi.callStats(), []);

  if (load.loading) return <div className="pad"><Skeleton rows={4} /></div>;
  if (load.error) return <div className="pad"><ErrorState message={load.error} onRetry={load.reload} /></div>;

  const s = load.data!;
  const reached = Object.entries(s.byDisposition)
    .filter(([k]) => disposition(k).category === 'Reached')
    .reduce((a, [, v]) => a + v, 0);
  const mix = Object.entries(s.byDisposition).sort((a, b) => b[1] - a[1]);

  return (
    <div className="pad">
      <div style={{ width: 54, height: 54, borderRadius: 18, background: T.greenTint, display: 'grid', placeItems: 'center' }}>
        <Icon name="task_alt" size={30} color={T.green} />
      </div>
      <h2 style={{ margin: '18px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Queue complete</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: T.inkMuted }}>
        Everything in the list has an outcome against it.
      </p>

      <div className="grid-auto" style={{ marginTop: 20 }}>
        <Stat label="Calls today" value={num(s.todayCount)} />
        <Stat label="Total logged" value={num(s.totalCount)} />
        <Stat label="Connect rate" value={pct(reached, s.totalCount)} color={T.green} />
        <Stat label="Callbacks due" value={num(s.callbacksDue)} color={T.teal} />
      </div>

      {mix.length > 0 && (
        <Card style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Outcome mix</div>
          {mix.map(([id, n]) => {
            const d = disposition(id);
            return (
              <div key={id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name={d.icon} size={15} color={d.color} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{d.label}</span>
                  <span className="mono" style={{ fontSize: 11.5, color: T.inkMuted }}>{num(n)}</span>
                </div>
                <div style={{ marginTop: 5 }}>
                  <Meter value={n / Math.max(1, s.totalCount)} color={d.color} />
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <Button onClick={() => go('home')}>Back to dashboard</Button>
        <Button variant="ghost" onClick={() => go('queue')}>Start another queue</Button>
      </div>
    </div>
  );
}
