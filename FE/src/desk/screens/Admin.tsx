/**
 * Settings, users, calling window, role matrix, compliance, audit, taxonomy,
 * plus the two global screens (sync outbox and state gallery).
 *
 * Everything destructive here is confirmed, and everything an admin changes is
 * written to the audit log by the API.
 */

import React, { useEffect, useState } from 'react';
import { deskApi, type WorkspaceUser } from '../api';
import { DISPOSITIONS, T } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Banner, Button, Card, Chip, EmptyState, ErrorState, Eyebrow,
  FactGrid, Icon, Input, Meter, Panel, Select, SkeletonRows, Stat, Switch,
  Textarea, ToggleRow, num, pct, shortDate, useLoad, whenLabel,
} from '../ui';

const CAP_ROWS: { key: string; label: string; help: string }[] = [
  { key: 'db', label: 'Database access', help: 'How much of the candidate database this role can read.' },
  { key: 'create', label: 'Add candidates', help: 'Create new candidate records.' },
  { key: 'dial', label: 'Dial', help: 'Open the call console and place calls.' },
  { key: 'log', label: 'Log calls', help: 'Record dispositions and callbacks.' },
  { key: 'reqs', label: 'Requisitions', help: 'Create, own or only view job orders.' },
  { key: 'rates', label: 'Commercials', help: 'See and set bill / pay rates and margins.' },
  { key: 'stage', label: 'Move stages', help: 'Advance or drop candidates in the pipeline.' },
  { key: 'score', label: 'Scorecards', help: 'Submit structured interview feedback.' },
  { key: 'approve', label: 'Approvals', help: 'Decide on offers and exceptions.' },
  { key: 'eeo', label: 'Diversity data', help: 'Access aggregated EEO reporting.' },
  { key: 'analytics', label: 'Reporting', help: 'Own numbers, the team, or everything.' },
  { key: 'admin', label: 'Administration', help: 'Workspace configuration.' },
  { key: 'erasure', label: 'Erasure', help: 'Approve deletion requests under DPDP.' },
];

/**
 * The Team Lead holds `admin: "partial"` — truthy, but not full admin.
 *
 * The API draws the same line: reading an admin surface accepts either, while
 * anything that widens someone's access requires exactly `true`. Screens use
 * `fullAdmin` for controls and `anyAdmin` for visibility, so a Team Lead gets
 * a read-only view rather than buttons that 403.
 */
const fullAdmin = (c: { admin?: unknown }) => c.admin === true;
const anyAdmin = (c: { admin?: unknown }) => !!c.admin;

function capText(v: unknown): string {
  if (v === true) return 'Yes';
  if (v === false || v == null) return 'No';
  return String(v);
}

function capTone(v: unknown): { bg: string; fg: string } {
  if (v === true || v === 'all') return { bg: T.greenTint, fg: T.green };
  if (v === false || v === 'none' || v == null) return { bg: T.fill, fg: T.inkGhost };
  return { bg: T.amberTint, fg: T.amber };
}

/* ------------------------------------------------------------------ *
 *  Settings                                                          *
 * ------------------------------------------------------------------ */

export function SettingsScreen() {
  const { session, go, caps, boot } = useDesk();
  const c = caps();
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session) setToggles(session.settings.notificationToggles || {});
  }, [session]);

  if (!session) return <div className="pad"><SkeletonRows rows={4} /></div>;

  const flip = async (k: string, v: boolean) => {
    const next = { ...toggles, [k]: v };
    setToggles(next);
    setSaving(true); setSaved(false);
    try {
      await deskApi.updateSettings({ notificationToggles: next });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setToggles(toggles);
      alert((e as Error).message);
    } finally { setSaving(false); }
  };

  const w = session.settings.callingWindow;

  return (
    <div className="pad">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={session.name} id={session.userId} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{session.name || session.email}</div>
            <div style={{ fontSize: 12, color: T.inkMuted }}>{session.email}</div>
            <div style={{ marginTop: 7, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge label={session.personaName} bg={T.indigoTint} fg={T.indigo} />
              <Badge label={session.mode === 'AGENCY' ? 'Agency mode' : 'In-house mode'} bg={T.fill} fg={T.inkMuted} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="ghost" icon="switch_account" onClick={() => useDesk.getState().openModal('personas')}>
            Switch persona
          </Button>
          <Button variant="ghost" icon="refresh" onClick={() => boot()}>Reload session</Button>
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Workspace</div>
        <div style={{ marginTop: 12 }}>
          <FactGrid
            facts={[
              ['Organisation', session.settings.orgName],
              ['Mode', session.mode === 'AGENCY' ? 'Agency' : 'In-house'],
              ['Calling window', w.label],
              ['Retention', `${session.settings.retentionMonths} months`],
            ]}
          />
        </div>
        {anyAdmin(c) && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="ghost" icon="schedule" onClick={() => go('callwindow')}>Calling window</Button>
            <Button variant="ghost" icon="verified_user" onClick={() => go('compliance')}>Compliance</Button>
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
          {saving && <span style={{ fontSize: 11, color: T.inkFaint }}>Saving…</span>}
          {saved && <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Saved</span>}
        </div>
        <div style={{ marginTop: 6 }}>
          {[
            ['callbacks', 'Callback reminders', 'Ping me when a promised callback is due.'],
            ['mentions', 'Mentions', 'When a teammate mentions me in a note.'],
            ['approvals', 'Approvals', 'Offers and exceptions waiting on me.'],
            ['interviews', 'Interviews', 'Panel invites and schedule changes.'],
            ['digest', 'Daily digest', 'A morning summary of yesterday.'],
          ].map(([k, label, help]) => (
            <ToggleRow key={k} label={label} help={help} value={!!toggles[k]} onChange={(v) => flip(k, v)} />
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Your capabilities</div>
        <div style={{ marginTop: 6, fontSize: 12, color: T.inkMuted }}>
          Granted by the {session.personaName} role and enforced by the API on every request.
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CAP_ROWS.map((r) => {
            const v = (session.caps as unknown as Record<string, unknown>)[r.key];
            const tone = capTone(v);
            return <Badge key={r.key} label={`${r.label} · ${capText(v)}`} bg={tone.bg} fg={tone.fg} />;
          })}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Users                                                             *
 * ------------------------------------------------------------------ */

export function UsersScreen() {
  const { session, caps, openModal } = useDesk();
  const c = caps();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const load = useLoad(() => deskApi.users(search || undefined), [search]);

  if (!anyAdmin(c)) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="User management is admin-only"
          body="Ask a workspace admin to change roles or invite people." />
      </div>
    );
  }

  const change = async (u: WorkspaceUser, body: Record<string, unknown>) => {
    setBusy(u.id);
    try {
      await deskApi.updateUser(u.id, body);
      load.reload();
    } catch (e) { alert((e as Error).message); } finally { setBusy(null); }
  };

  const personas = session?.personas || [];
  const canEdit = fullAdmin(c);

  return (
    <div className="pad">
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email"
          style={{ maxWidth: 300 }} />
        {canEdit && (
          <Button icon="person_add" onClick={() => openModal('invite')} style={{ marginLeft: 'auto' }}>Invite</Button>
        )}
      </div>

      <Banner icon="shield" tone={canEdit ? 'info' : 'warn'}>
        {canEdit
          ? "Changing someone's role changes what the API will return to them, immediately. Portal "
            + 'accounts without a workspace role cannot reach this dashboard at all.'
          : `Read-only for your role (${session?.personaName}). Assigning roles, inviting people and `
            + 'suspending accounts all need a full Admin, because each of them can widen what '
            + 'someone is able to reach.'}
      </Banner>

      {load.loading && <div style={{ marginTop: 14 }}><SkeletonRows rows={5} /></div>}
      {load.error && <div style={{ marginTop: 14 }}><ErrorState message={load.error} onRetry={load.reload} /></div>}

      {load.data && load.data.length > 0 && (
        <Card pad={0} style={{ marginTop: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>User</th><th>Workspace role</th><th>Account</th><th>Status</th><th>Last active</th><th /></tr>
              </thead>
              <tbody>
                {load.data.map((u) => {
                  const me = u.id === session?.userId;
                  return (
                    <tr key={u.id} style={{ opacity: busy === u.id ? 0.5 : 1 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={u.name} id={u.id} size={30} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {u.name || '—'}
                              {me && <Badge label="you" bg={T.indigoTint} fg={T.indigo} />}
                            </div>
                            <div style={{ fontSize: 11, color: T.inkFaint }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Select
                          value={u.persona || ''}
                          disabled={me || !canEdit}
                          onChange={(e) => change(u, { persona: e.target.value || null })}
                          style={{ height: 32, fontSize: 12, width: 190 }}
                        >
                          <option value="">No workspace access</option>
                          {personas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                      </td>
                      <td style={{ color: T.inkMuted }}>{u.role}</td>
                      <td>
                        <Badge
                          label={u.status}
                          bg={u.status === 'active' ? T.greenTint : u.status === 'invited' ? T.amberTint : T.fill}
                          fg={u.status === 'active' ? T.green : u.status === 'invited' ? T.amber : T.inkMuted}
                        />
                      </td>
                      <td className="mono" style={{ fontSize: 11, color: T.inkFaint }}>
                        {u.lastActiveAt ? shortDate(u.lastActiveAt) : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!me && canEdit && (
                          <button
                            onClick={() => change(u, { status: u.status === 'suspended' ? 'active' : 'suspended' })}
                            style={{ fontSize: 11.5, fontWeight: 600, color: u.status === 'suspended' ? T.green : T.red }}
                          >
                            {u.status === 'suspended' ? 'Restore' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Calling window                                                    *
 * ------------------------------------------------------------------ */

/** Index + 1 is the ISO weekday the API stores — 1 = Monday … 7 = Sunday. */
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CallWindowScreen() {
  const { session, caps, boot } = useDesk();
  const c = caps();
  const [open, setOpen] = useState(9);
  const [close, setClose] = useState(21);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const w = session?.settings.callingWindow;
    if (w) { setOpen(w.openHour); setClose(w.closeHour); setDays(w.days); }
  }, [session]);

  if (!fullAdmin(c)) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Calling window is admin-only"
          body="The window applies to everyone; only admins can change it." />
      </div>
    );
  }

  const save = async () => {
    setBusy(true); setSaved(false);
    try {
      await deskApi.updateSettings({ callingWindow: { openHour: open, closeHour: close, days } });
      await boot();
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  const tooWide = open < 9 || close > 21;

  return (
    <div className="pad">
      <Banner icon="gavel" tone="warn">
        TRAI's TCCCPR restricts unsolicited commercial calls to 09:00–21:00. Widening this window past
        those hours puts the outreach outside the safe harbour.
      </Banner>

      <Card style={{ marginTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          <div>
            <label className="label">Opens at</label>
            <Select value={String(open)} onChange={(e) => setOpen(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="label">Closes at</label>
            <Select value={String(close)} onChange={(e) => setClose(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h + 1} value={h + 1}>{String(h + 1).padStart(2, '0')}:00</option>
              ))}
            </Select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="label">Days</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {DAY_NAMES.map((d, i) => {
              const iso = i + 1;
              const on = days.includes(iso);
              return (
                <button
                  key={d}
                  onClick={() => setDays(on ? days.filter((x) => x !== iso) : [...days, iso].sort((a, b) => a - b))}
                  style={{
                    width: 54, height: 40, borderRadius: 11, fontSize: 12, fontWeight: 700,
                    background: on ? T.indigo : T.surface,
                    border: `1.5px solid ${on ? T.indigo : T.borderStrong}`,
                    color: on ? '#fff' : T.inkMuted,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {tooWide && (
          <div style={{ marginTop: 14 }}>
            <Banner icon="warning" tone="danger">
              {String(open).padStart(2, '0')}:00–{String(close).padStart(2, '0')}:00 falls outside 09:00–21:00.
              The console will still block dialling outside the window you set, but the window itself is
              now wider than the regulation allows.
            </Banner>
          </div>
        )}

        <div style={{ marginTop: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button onClick={save} disabled={busy || !days.length}>{busy ? 'Saving…' : 'Save window'}</Button>
          {saved && <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>Saved and applied</span>}
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Right now</div>
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{
            width: 9, height: 9, borderRadius: 99,
            background: session?.settings.callingWindow.isOpen ? T.green : T.red,
          }} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>
            {session?.settings.callingWindow.isOpen ? 'Calling is open' : 'Calling is closed'}
          </span>
          <span style={{ fontSize: 11.5, color: T.inkMuted }}>· {session?.settings.callingWindow.label}</span>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Role matrix                                                       *
 * ------------------------------------------------------------------ */

export function RolesScreen() {
  const { session, caps } = useDesk();
  const c = caps();
  const personas = useLoad(() => deskApi.personas(), []);

  if (!anyAdmin(c)) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Roles are admin-only"
          body="Your own capabilities are listed on the Settings screen." />
      </div>
    );
  }

  const rows = personas.data || [];

  return (
    <div className="pad">
      <Banner icon="shield" tone="info">
        This matrix is the server's copy — the API checks it on every request, so a capability
        withheld here cannot be reached by calling the endpoint directly.
      </Banner>

      {personas.loading && <div style={{ marginTop: 14 }}><SkeletonRows rows={5} /></div>}
      {personas.error && <div style={{ marginTop: 14 }}><ErrorState message={personas.error} onRetry={personas.reload} /></div>}

      {rows.length > 0 && (
        <Card pad={0} style={{ marginTop: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, background: T.surfaceAlt, zIndex: 1 }}>Capability</th>
                  {rows.map((p) => (
                    <th key={p.id} style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700 }}>{p.short}</div>
                      <div style={{ fontSize: 9.5, color: T.inkFaint, fontWeight: 500, textTransform: 'none' }}>{p.id}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAP_ROWS.map((r) => (
                  <tr key={r.key}>
                    <td style={{ position: 'sticky', left: 0, background: T.surface, zIndex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5 }}>{r.label}</div>
                      <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 2 }}>{r.help}</div>
                    </td>
                    {rows.map((p) => {
                      const v = (p.caps as unknown as Record<string, unknown>)[r.key];
                      const tone = capTone(v);
                      return (
                        <td key={p.id} style={{ textAlign: 'center' }}>
                          <Badge label={capText(v)} bg={tone.bg} fg={tone.fg} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid-panels" style={{ marginTop: 16 }}>
        {rows.map((p) => (
          <Card key={p.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{p.name}</span>
              {p.id === session?.personaId && <Badge label="yours" bg={T.indigoTint} fg={T.indigo} />}
            </div>
            <div style={{ marginTop: 6, fontSize: 11.5, color: T.inkMuted }}>
              Lands on <b>{p.home}</b> · {p.mode === 'AGENCY' ? 'agency' : 'in-house'} vocabulary
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Compliance                                                        *
 * ------------------------------------------------------------------ */

export function ComplianceScreen() {
  const { caps } = useDesk();
  const c = caps();
  const [busy, setBusy] = useState<string | null>(null);
  const [months, setMonths] = useState<string>('');
  const comp = useLoad(() => deskApi.compliance(), []);
  const eras = useLoad(() => deskApi.erasures(), []);
  const { session, boot } = useDesk();

  useEffect(() => {
    if (session) setMonths(String(session.settings.retentionMonths));
  }, [session]);

  if (!anyAdmin(c) && !c.erasure) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Compliance is restricted"
          body="Consent, retention and erasure are handled by admins and the compliance role." />
      </div>
    );
  }

  const decide = async (id: string, status: string) => {
    if (status === 'completed' && !confirm('Mark this erasure as completed? Do this only after the record has actually been erased.')) return;
    setBusy(id);
    try {
      await deskApi.decideErasure(id, status);
      eras.reload(); comp.reload();
    } catch (e) { alert((e as Error).message); } finally { setBusy(null); }
  };

  const saveRetention = async () => {
    const v = Number(months);
    if (!v || v < 1) return;
    try {
      await deskApi.updateSettings({ retentionMonths: v });
      await boot();
      comp.reload();
    } catch (e) { alert((e as Error).message); }
  };

  const d = comp.data;
  const consentRate = d && d.totalCandidates ? d.withConsent / d.totalCandidates : 0;

  return (
    <div className="pad">
      {comp.loading && <SkeletonRows rows={4} />}
      {comp.error && <ErrorState message={comp.error} onRetry={comp.reload} />}

      {d && (
        <>
          <div className="grid-auto">
            <Stat label="Candidates" value={num(d.totalCandidates)} icon="groups" color={T.indigo} tint={T.indigoTint} />
            <Stat label="Consent recorded" value={num(d.withConsent)} sub={pct(consentRate)}
              icon="verified_user" color={T.green} tint={T.greenTint} />
            <Stat label="On DNC" value={num(d.dncCount)} sub="never dial" icon="do_not_disturb_on"
              color={T.red} tint={T.redTint} />
            <Stat label="Open erasures" value={num(d.openErasures)} icon="delete_forever"
              color={d.openErasures ? T.amber : T.inkMuted} tint={d.openErasures ? T.amberTint : T.fill} />
          </div>

          <Card style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Consent coverage</div>
            <div style={{ marginTop: 12 }}><Meter value={consentRate} color={consentRate > 0.6 ? T.green : T.amber} /></div>
            <div style={{ marginTop: 9, fontSize: 12, color: T.inkMuted, lineHeight: 1.55 }}>
              {num(d.missingConsent)} candidates have no recorded consent. Under the DPDP Act consent
              must be recorded before outreach, so the call console asks for it on first contact rather
              than assuming it.
            </div>
          </Card>
        </>
      )}

      {fullAdmin(c) && (
        <Card style={{ marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Retention</div>
          <div style={{ marginTop: 8, fontSize: 12, color: T.inkMuted }}>
            How long an untouched candidate record is kept before it is due for review.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 9, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: 160 }}>
              <label className="label">Months</label>
              <Input type="number" min={1} value={months} onChange={(e) => setMonths(e.target.value)} />
            </div>
            <Button variant="ghost" onClick={saveRetention}>Save</Button>
          </div>
          <div style={{ marginTop: 12 }}>
            <Banner icon="info" tone="info">
              Changing this number changes the policy, not the data. Nothing is deleted automatically.
            </Banner>
          </div>
        </Card>
      )}

      <Panel title="Erasure requests" subtitle="DPDP right to erasure">
        {(eras.data || []).map((e) => (
          <div key={e.id} className="row" style={{ opacity: busy === e.id ? 0.5 : 1, alignItems: 'flex-start' }}>
            <Icon name="delete_forever" size={19} color={e.status === 'pending' ? T.amber : T.inkFaint} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{e.candidateName || e.candidateId}</div>
              <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>{e.reason || 'No reason given'}</div>
              <div style={{ fontSize: 10.5, color: T.inkFaint, marginTop: 4 }}>
                Raised by {e.raisedByName || 'someone'} · {whenLabel(e.createdAt)}
              </div>
            </div>
            {e.status === 'pending' && c.erasure ? (
              <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                <Button variant="danger" onClick={() => decide(e.id, 'completed')} disabled={busy === e.id}>
                  Mark erased
                </Button>
                <Button variant="ghost" onClick={() => decide(e.id, 'rejected')} disabled={busy === e.id}>
                  Reject
                </Button>
              </div>
            ) : (
              <Badge label={e.status} bg={e.status === 'completed' ? T.greenTint : T.fill}
                fg={e.status === 'completed' ? T.green : T.inkMuted} />
            )}
          </div>
        ))}
        {eras.data && !eras.data.length && (
          <EmptyState icon="verified_user" tone="success" title="No open requests"
            body="Erasure requests raised from a candidate profile land here." />
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Audit log                                                         *
 * ------------------------------------------------------------------ */

export function AuditScreen() {
  const { caps } = useDesk();
  const c = caps();
  const [limit, setLimit] = useState(100);
  const load = useLoad(() => deskApi.audit(limit), [limit]);
  const [q, setQ] = useState('');

  if (!anyAdmin(c)) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Audit log is admin-only"
          body="The team stream on Activity shows what you are allowed to see." />
      </div>
    );
  }

  const rows = (load.data || []).filter((r) => {
    if (!q) return true;
    const hay = `${r.actorName} ${r.actorEmail} ${r.action} ${r.objectLabel} ${r.objectKind}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="pad">
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by actor, action or object"
          style={{ maxWidth: 320 }} />
        <Select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))} style={{ width: 130, height: 38 }}>
          {[50, 100, 250, 500].map((n) => <option key={n} value={n}>Last {n}</option>)}
        </Select>
        <span style={{ fontSize: 11.5, color: T.inkFaint, marginLeft: 'auto' }}>
          Append-only — entries cannot be edited or removed from here.
        </span>
      </div>

      {load.loading && <SkeletonRows rows={8} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !rows.length && (
        <EmptyState icon="receipt_long" title="No entries" body="Actions are recorded here as they happen." />
      )}

      {rows.length > 0 && (
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>When</th><th>Actor</th><th>Action</th><th>Object</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="mono" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{whenLabel(r.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.actorName || '—'}</div>
                      <div style={{ fontSize: 10.5, color: T.inkFaint }}>{r.actorEmail}</div>
                    </td>
                    <td className="mono" style={{ fontSize: 11.5, color: T.indigo }}>{r.action}</td>
                    <td style={{ color: T.inkMuted }}>
                      {r.objectLabel || r.objectId || '—'}
                      {r.objectKind && <span style={{ fontSize: 10.5, color: T.inkFaint }}> · {r.objectKind}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Disposition taxonomy                                              *
 * ------------------------------------------------------------------ */

export function TaxonomyScreen() {
  const load = useLoad(() => deskApi.taxonomy(), []);
  const server = load.data?.dispositions || [];

  // Group by the taxonomy's own categories rather than a second, invented set.
  const categories = [...new Set(DISPOSITIONS.map((d) => d.category))];
  const groups = categories.map((cat) => [cat, DISPOSITIONS.filter((d) => d.category === cat)] as const);

  return (
    <div className="pad">
      <Banner icon="info" tone="info">
        These outcome codes are fixed in the API so the mobile app, the web console and past call
        history all mean the same thing. The next action attached to each is what the console offers
        after you log the call.
      </Banner>

      {groups.map(([name, items]) => (
        <div key={name} style={{ marginTop: 18 }}>
          <Eyebrow>{name}</Eyebrow>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((d) => {
              const known = server.some((s) => s.id === d.id);
              return (
                <Card key={d.id} pad={13}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: d.tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name={d.icon} size={17} color={d.color} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{d.label}</div>
                      <div className="mono" style={{ fontSize: 10, color: T.inkFaint, marginTop: 2 }}>{d.id}</div>
                    </div>
                    {d.next && <Badge label={`next · ${d.next}`} bg={T.fill} fg={T.inkMuted} />}
                    {!known && load.data && <Badge label="not on server" bg={T.redTint} fg={T.red} />}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Offline & sync                                                    *
 * ------------------------------------------------------------------ */

interface Outbox { id: string; label: string; detail: string; at: number }

const OUTBOX_KEY = 'desk.outbox';

export function readOutbox(): Outbox[] {
  try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch { return []; }
}

export function pushOutbox(entry: Omit<Outbox, 'id' | 'at'>) {
  const next = [...readOutbox(), { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: Date.now() }];
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(next));
}

export function SyncScreen() {
  const [online, setOnline] = useState(navigator.onLine);
  const [items, setItems] = useState<Outbox[]>(readOutbox());

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const clear = () => {
    if (!confirm('Discard every queued action? They will not be sent.')) return;
    localStorage.setItem(OUTBOX_KEY, '[]');
    setItems([]);
  };

  return (
    <div className="pad">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{
            width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center',
            background: online ? T.greenTint : T.redTint,
          }}>
            <Icon name={online ? 'cloud_done' : 'cloud_off'} size={21} color={online ? T.green : T.red} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{online ? 'Connected' : 'Offline'}</div>
            <div style={{ fontSize: 12, color: T.inkMuted }}>
              {online ? 'Changes are written straight through to the API.' : 'Queued actions will be retried when you reconnect.'}
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Outbox</span>
          {items.length > 0 && (
            <button onClick={clear} style={{ fontSize: 12, fontWeight: 600, color: T.red }}>Discard all</button>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          {items.map((i) => (
            <div key={i.id} className="row">
              <Icon name="pending" size={18} color={T.amber} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{i.label}</div>
                <div style={{ fontSize: 11, color: T.inkMuted }}>{i.detail}</div>
              </div>
              <span className="mono" style={{ fontSize: 10, color: T.inkFaint }}>
                {new Date(i.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {!items.length && (
            <EmptyState icon="cloud_done" tone="success" title="Nothing queued"
              body="Everything you have done has reached the server." />
          )}
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>What the web console does not queue</div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: T.inkMuted, lineHeight: 1.55 }}>
          Calls placed from this browser hand off to your phone or softphone, so the browser cannot
          retry a dial. Only the logging of an outcome is queued — and only when the request itself
          fails, never speculatively.
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  State gallery                                                     *
 * ------------------------------------------------------------------ */

export function StatesScreen() {
  return (
    <div className="pad">
      <Banner icon="widgets" tone="info">
        Reference for every non-happy state the dashboard can show, so they stay consistent.
      </Banner>

      <div style={{ marginTop: 16 }}>
        <Eyebrow>Loading</Eyebrow>
        <Card style={{ marginTop: 10 }}><SkeletonRows rows={3} /></Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Eyebrow>Empty</Eyebrow>
        <Card style={{ marginTop: 10 }}>
          <EmptyState icon="inbox" title="Nothing here yet"
            body="An empty state names what would be here and how to create the first one."
            actionLabel="Do the thing" onAction={() => {}} />
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Eyebrow>Error</Eyebrow>
        <Card style={{ marginTop: 10 }}>
          <ErrorState message="Could not reach the API at this address." onRetry={() => {}} />
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Eyebrow>Permission denied</Eyebrow>
        <Card style={{ marginTop: 10 }}>
          <EmptyState icon="lock" title="Not part of your role"
            body="Denied states name the capability rather than pretending the screen is empty." />
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Eyebrow>Banners</Eyebrow>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Banner icon="info" tone="info">Informational — context the user needs but no action.</Banner>
          <Banner icon="warning" tone="warn">Warning — allowed, but with a consequence worth stating.</Banner>
          <Banner icon="error" tone="danger">Blocking — the action will not proceed.</Banner>
          <Banner icon="check_circle" tone="success">Confirmation — something completed.</Banner>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Eyebrow>Chips and badges</Eyebrow>
        <Card style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <Chip label="Selected" on onClick={() => {}} />
            <Chip label="Unselected" on={false} onClick={() => {}} />
            <Badge label="Sourced" bg={T.indigoTint} fg={T.indigo} />
            <Badge label="Interview" bg={T.purpleTint} fg={T.purple} />
            <Badge label="Hired" bg={T.greenTint} fg={T.green} />
            <Badge label="Dropped" bg={T.redTint} fg={T.red} />
          </div>
        </Card>
      </div>
    </div>
  );
}
