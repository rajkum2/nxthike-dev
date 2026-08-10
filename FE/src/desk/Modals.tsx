/**
 * Every modal the dashboard opens, driven off `useDesk().modal`.
 *
 * Consent and erasure are deliberately explicit — they write a legal fact, so
 * they never default to "yes" and never close on a stray click-through.
 */

import React, { useEffect, useState } from 'react';
import { deskApi, type DeskCandidate } from '../desk/api';
import { DISPOSITIONS, DROP_REASONS, STAGES, T } from './tokens';
import { useDesk } from './store';
import {
  Avatar, Badge, Banner, Button, Card, Chip, Icon, Input, Modal, Select,
  Textarea, useLoad, whenLabel,
} from './ui';

/* ------------------------------------------------------------------ *
 *  Persona switcher                                                  *
 * ------------------------------------------------------------------ */

function PersonaModal({ onClose }: { onClose: () => void }) {
  const { session, boot } = useDesk();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const personas = session?.personas || [];
  /*
   * Gated on the account's portal role, not on `caps.admin`, so an admin who
   * has switched to Interviewer can still switch back. The API applies the
   * same rule and is the one that decides.
   */
  const canSwitch = session?.role === 'admin';

  const pick = async (id: string) => {
    if (!session) return;
    setBusy(id); setError(null);
    try {
      await deskApi.switchPersona(id);
      await boot();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  return (
    <Modal title="Roles in this workspace" subtitle="Each one sees a different dashboard." onClose={onClose} width={620}>
      {!canSwitch && (
        <Banner icon="info" tone="info">
          You are signed in as <b>{session?.personaName}</b>. Only an admin account can change which
          role it holds — this list is here so you can see what the others can do.
        </Banner>
      )}
      {canSwitch && (
        <Banner icon="switch_account" tone="info">
          Switching changes what this account can see and do, immediately and for real — the API
          enforces it too. Your admin sign-in can always switch back.
        </Banner>
      )}
      {error && <div style={{ marginTop: 10 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {personas.map((p) => {
          const mine = p.id === session?.personaId;
          return (
            <Card key={p.id} pad={13} style={{ borderColor: mine ? T.indigo : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 10, background: mine ? T.indigo : T.fill,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: mine ? '#fff' : T.inkMuted }}>
                    {p.id.toUpperCase()}
                  </span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.inkMuted }}>
                    Lands on {p.home} · {p.mode === 'AGENCY' ? 'agency' : 'in-house'} words
                  </div>
                </div>
                {mine
                  ? <Badge label="current" bg={T.indigoTint} fg={T.indigo} />
                  : canSwitch && (
                    <Button variant="ghost" onClick={() => pick(p.id)} disabled={!!busy}>
                      {busy === p.id ? 'Switching…' : 'Switch'}
                    </Button>
                  )}
              </div>
            </Card>
          );
        })}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Consent                                                           *
 * ------------------------------------------------------------------ */

function ConsentModal({ onClose }: { onClose: () => void }) {
  const { candidateId } = useDesk();
  const [channel, setChannel] = useState('call');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const cand = useLoad(async () => (candidateId ? deskApi.candidate(candidateId) : null), [candidateId]);

  const save = async () => {
    if (!candidateId || !confirmed) return;
    setBusy(true);
    try {
      await deskApi.patchCandidate(candidateId, {
        consentAt: new Date().toISOString(), consentChannel: channel,
      });
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Record consent"
      subtitle={cand.data?.name ? `for ${cand.data.name}` : undefined}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!confirmed || busy}>{busy ? 'Saving…' : 'Record consent'}</Button>
        </>
      }
    >
      <Banner icon="gavel" tone="warn">
        Under the DPDP Act consent must be freely given, specific and recorded. Only tick this if the
        candidate actually agreed — this writes a dated legal fact against their record.
      </Banner>

      {cand.data?.consentAt && (
        <div style={{ marginTop: 12 }}>
          <Banner icon="check_circle" tone="success">
            Consent already recorded {whenLabel(cand.data.consentAt)}
            {cand.data.consentChannel ? ` over ${cand.data.consentChannel}` : ''}. Saving again updates the date.
          </Banner>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <label className="label">How was it obtained?</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['call', 'whatsapp', 'email', 'portal', 'in_person'].map((ch) => (
            <Chip key={ch} label={ch.replace('_', ' ')} on={channel === ch} onClick={() => setChannel(ch)} />
          ))}
        </div>
      </div>

      <label style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
          style={{ marginTop: 2, width: 17, height: 17, accentColor: T.indigo }} />
        <span style={{ fontSize: 12.5, lineHeight: 1.5, color: T.inkBody }}>
          I confirm this candidate was told who we are and what we will use their details for, and
          they agreed to be contacted about roles.
        </span>
      </label>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Erasure request                                                   *
 * ------------------------------------------------------------------ */

function ErasureModal({ onClose }: { onClose: () => void }) {
  const { candidateId } = useDesk();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const cand = useLoad(async () => (candidateId ? deskApi.candidate(candidateId) : null), [candidateId]);

  const raise = async () => {
    if (!candidateId || !reason.trim()) return;
    setBusy(true);
    try {
      await deskApi.raiseErasure(candidateId, reason.trim());
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Request erasure"
      subtitle={cand.data?.name || undefined}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={raise} disabled={!reason.trim() || busy}>
            {busy ? 'Raising…' : 'Raise request'}
          </Button>
        </>
      }
    >
      <Banner icon="info" tone="info">
        This raises a request for review — it does not delete anything now. A compliance approver
        completes the erasure, and both steps are written to the audit log.
      </Banner>
      <div style={{ marginTop: 14 }}>
        <label className="label">Reason *</label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Candidate emailed on 4 Aug asking to be removed from the database." />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Stage change / drop reason                                        *
 * ------------------------------------------------------------------ */

function StageModal({ onClose }: { onClose: () => void }) {
  const { candidateId, openModal } = useDesk();
  const [busy, setBusy] = useState(false);
  const cand = useLoad(async () => (candidateId ? deskApi.candidate(candidateId) : null), [candidateId]);

  const move = async (statusId: string) => {
    if (!candidateId) return;
    if (statusId === 'rejected') { openModal('dropreason'); return; }
    setBusy(true);
    try {
      await deskApi.patchCandidate(candidateId, { status: statusId });
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  const current = cand.data?.status;

  return (
    <Modal title="Move stage" subtitle={cand.data?.name || undefined} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {STAGES.map((s) => {
          const on = current === s.id;
          return (
            <button
              key={s.id}
              onClick={() => move(s.id)}
              disabled={busy || on}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderRadius: 12,
                border: `1.5px solid ${on ? s.color : T.border}`, background: on ? s.tint : T.surface,
                textAlign: 'left', opacity: busy ? 0.6 : 1,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 99, background: s.color }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: on ? s.color : T.ink }}>{s.label}</span>
              {on && <Badge label="current" bg={T.surface} fg={s.color} />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function DropReasonModal({ onClose }: { onClose: () => void }) {
  const { candidateId } = useDesk();
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const drop = async () => {
    if (!candidateId || !reason) return;
    setBusy(true);
    try {
      await deskApi.patchCandidate(candidateId, { status: 'rejected' });
      await deskApi.addNote(candidateId, `Dropped · ${reason}${note ? ` — ${note}` : ''}`, 'shared');
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Why are they being dropped?"
      subtitle="Recorded on the candidate so the next recruiter is not guessing."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={drop} disabled={!reason || busy}>
            {busy ? 'Saving…' : 'Drop candidate'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {DROP_REASONS.map((r) => (
          <Chip key={r} label={r} on={reason === r} onClick={() => setReason(r)} accent={T.red} />
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <label className="label">Detail · optional</label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Disposition / callback / DNC                                      *
 * ------------------------------------------------------------------ */

function DispositionModal({ onClose }: { onClose: () => void }) {
  const { candidateId } = useDesk();
  const [pick, setPick] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const chosen = DISPOSITIONS.find((d) => d.id === pick);

  const log = async () => {
    if (!candidateId || !pick) return;
    setBusy(true);
    try {
      await deskApi.logCall({ candidateId, disposition: pick, note, durationSeconds: 0, source: 'web' });
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Log the outcome"
      onClose={onClose}
      width={620}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={log} disabled={!pick || busy}>{busy ? 'Saving…' : 'Log call'}</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 7 }}>
        {DISPOSITIONS.map((d) => {
          const on = pick === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setPick(d.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 11,
                border: `1.5px solid ${on ? d.color : T.border}`, background: on ? d.tint : T.surface,
                textAlign: 'left',
              }}
            >
              <Icon name={d.icon} size={17} color={d.color} />
              <span style={{ fontSize: 12, fontWeight: 700, color: on ? d.color : T.inkBody }}>{d.label}</span>
            </button>
          );
        })}
      </div>

      {chosen?.next && (
        <div style={{ marginTop: 14 }}>
          <Banner icon="arrow_forward" tone="info">Next · {chosen.next}</Banner>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <label className="label">Note · optional</label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
}

function CallbackModal({ onClose }: { onClose: () => void }) {
  const { candidateId, session } = useDesk();
  const [when, setWhen] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const w = session?.settings.callingWindow;

  // A callback promised outside the calling window cannot legally be honoured.
  const outside = (() => {
    if (!when || !w) return false;
    const d = new Date(when);
    const iso = d.getDay() === 0 ? 7 : d.getDay(); // JS Sunday=0 → ISO Sunday=7
    return d.getHours() < w.openHour || d.getHours() >= w.closeHour || !w.days.includes(iso);
  })();

  const save = async () => {
    if (!candidateId || !when) return;
    setBusy(true);
    try {
      await deskApi.logCall({
        candidateId, disposition: 'connected_callback', note,
        callbackAt: new Date(when).toISOString(), durationSeconds: 0, source: 'web',
      });
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Schedule a callback"
      subtitle={w?.label}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!when || outside || busy}>
            {busy ? 'Saving…' : 'Schedule'}
          </Button>
        </>
      }
    >
      <label className="label">When did you promise to call back?</label>
      <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />

      {outside && (
        <div style={{ marginTop: 12 }}>
          <Banner icon="block" tone="danger">
            That time is outside the calling window ({w?.label}). Pick a slot inside it — a callback
            you cannot legally make is worse than none.
          </Banner>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <label className="label">Note · optional</label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="What did they ask you to follow up on?" />
      </div>
    </Modal>
  );
}

function DncModal({ onClose }: { onClose: () => void }) {
  const { candidateId } = useDesk();
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const cand = useLoad(async () => (candidateId ? deskApi.candidate(candidateId) : null), [candidateId]);

  const mark = async () => {
    if (!candidateId || !confirmed) return;
    setBusy(true);
    try {
      await deskApi.patchCandidate(candidateId, { dnc: true });
      await deskApi.logCall({ candidateId, disposition: 'do_not_call', note: 'Marked do-not-call', durationSeconds: 0, source: 'web' });
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Mark do-not-call"
      subtitle={cand.data?.name || undefined}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={mark} disabled={!confirmed || busy}>
            {busy ? 'Saving…' : 'Mark do-not-call'}
          </Button>
        </>
      }
    >
      <Banner icon="block" tone="danger">
        This removes the candidate from every call queue for everyone, permanently, and the console
        will refuse to dial them. It is not a personal preference flag.
      </Banner>
      <label style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
          style={{ marginTop: 2, width: 17, height: 17, accentColor: T.red }} />
        <span style={{ fontSize: 12.5, lineHeight: 1.5, color: T.inkBody }}>
          The candidate asked not to be contacted again.
        </span>
      </label>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Invite user                                                       *
 * ------------------------------------------------------------------ */

function InviteModal({ onClose }: { onClose: () => void }) {
  const { session } = useDesk();
  const [form, setForm] = useState({ email: '', name: '', persona: 'p1', title: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const invite = async () => {
    if (!form.email.trim()) return;
    setBusy(true); setError(null);
    try {
      const u = await deskApi.inviteUser(form);
      setDone(u.email);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  if (done) {
    return (
      <Modal title="Invited" onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}>
        <Banner icon="check_circle" tone="success">
          <b>{done}</b> now has workspace access. They sign in with the normal login — no separate
          password is created here.
        </Banner>
      </Modal>
    );
  }

  return (
    <Modal
      title="Invite to the workspace"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={invite} disabled={!form.email.trim() || busy}>{busy ? 'Inviting…' : 'Invite'}</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label className="label">Email *</label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Role</label>
          <Select value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })}>
            {(session?.personas || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        <div>
          <label className="label">Job title · optional</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
      </div>
      {error && <div style={{ marginTop: 12 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  New task                                                          *
 * ------------------------------------------------------------------ */

function NewTaskModal({ onClose }: { onClose: () => void }) {
  const { candidateId } = useDesk();
  const [form, setForm] = useState({ title: '', detail: '', dueAt: '' });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      await deskApi.createTask({
        title: form.title,
        detail: form.detail || null,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        linkKind: candidateId ? 'candidate' : null,
        linkId: candidateId,
      });
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="New task"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!form.title.trim() || busy}>{busy ? 'Saving…' : 'Add task'}</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label className="label">Title *</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Chase the client on the Pune shortlist" />
        </div>
        <div>
          <label className="label">Detail</label>
          <Textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
        </div>
        <div>
          <label className="label">Due</label>
          <Input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Filters + tag apply                                               *
 * ------------------------------------------------------------------ */

function FiltersModal({ onClose }: { onClose: () => void }) {
  const { selection, clearSelection } = useDesk();
  const ids = Object.keys(selection);
  const tags = useLoad(() => deskApi.tags(), []);
  const [add, setAdd] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    if (!ids.length || !add.length) return;
    setBusy(true);
    try {
      await deskApi.applyTags({ candidateIds: ids, add });
      clearSelection();
      onClose();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Apply tags"
      subtitle={`${ids.length} candidate${ids.length === 1 ? '' : 's'} selected`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={apply} disabled={!ids.length || !add.length || busy}>
            {busy ? 'Applying…' : `Apply to ${ids.length}`}
          </Button>
        </>
      }
    >
      {!ids.length && (
        <Banner icon="info" tone="info">
          Nothing selected. Tick candidates in the list first, then apply tags to all of them at once.
        </Banner>
      )}
      <div style={{ marginTop: ids.length ? 0 : 12, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {(tags.data || []).map((t) => {
          const on = add.includes(t.name);
          return (
            <Chip
              key={t.id}
              label={t.name}
              on={on}
              onClick={() => setAdd(on ? add.filter((x) => x !== t.name) : [...add, t.name])}
              accent={t.color || undefined}
            />
          );
        })}
        {tags.data && !tags.data.length && (
          <span style={{ fontSize: 12, color: T.inkFaint }}>No tags defined yet — create some on the Tags screen.</span>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Add candidate                                                     *
 * ------------------------------------------------------------------ */

/**
 * Opens over whatever screen you were on — Candidates or Today — so sourcing a
 * name never costs you your place in the list. Dedupe still runs on the phone
 * number as you type, which is the whole point of the screen this replaced.
 */
function AddCandidateModal({ onClose }: { onClose: () => void }) {
  const { go, bumpCandidates } = useDesk();
  const roles = useLoad(() => deskApi.hiringDashboard(), []);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '', latestRole: '', latestCompany: '',
    roleId: '', source: 'Naukri',
  });
  const [dupe, setDupe] = useState<DeskCandidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Dedupe as you type, on the last ten digits.
  const checkDupe = async (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 6) { setDupe(null); return; }
    try {
      const res = await deskApi.candidates({ search: digits.slice(-10), pageSize: 5 });
      setDupe(res.items.find((c) => (c.phone || '').replace(/\D/g, '').slice(-10) === digits.slice(-10)) || null);
    } catch { setDupe(null); }
  };

  const valid = Boolean(form.name.trim() && form.phone.trim() && form.roleId);

  const save = async () => {
    if (!valid) return;
    setSaving(true); setError(null);
    try {
      const created = await deskApi.createCandidate({
        roleId: form.roleId,
        roleName: roles.data?.roles.find((r) => r.id === form.roleId)?.name || '',
        name: form.name, phone: form.phone, email: form.email || null, city: form.city || null,
        latestRole: form.latestRole || null, latestCompany: form.latestCompany || null,
        status: 'new', tags: [form.source],
      });
      bumpCandidates();
      onClose();
      go('cands', { candidateId: created.id });
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  const openExisting = (id: string) => { onClose(); go('cands', { candidateId: id }); };

  return (
    <Modal
      title="Add candidate"
      subtitle="Dedupe runs on the number as you type."
      onClose={onClose}
      width={680}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void save()} disabled={!valid || saving}>
            {saving ? 'Saving…' : 'Save candidate'}
          </Button>
          {!valid && (
            <span style={{ fontSize: 11, color: T.inkFaint, alignSelf: 'center' }}>
              Name, number and requisition required
            </span>
          )}
        </>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
        <div>
          <label className="label">Full name *</label>
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Ritu Malhotra"
          />
        </div>
        <div>
          <label className="label">Mobile number *</label>
          <Input
            value={form.phone}
            placeholder="98200 41562"
            onChange={(e) => { set('phone', e.target.value); void checkDupe(e.target.value); }}
            style={dupe ? { borderColor: '#E0A83A' } : undefined}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <Input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@company.com" />
        </div>
        <div>
          <label className="label">City</label>
          <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Pune" />
        </div>
        <div>
          <label className="label">Current role</label>
          <Input value={form.latestRole} onChange={(e) => set('latestRole', e.target.value)} placeholder="e.g. Senior Java Developer" />
        </div>
        <div>
          <label className="label">Current company</label>
          <Input value={form.latestCompany} onChange={(e) => set('latestCompany', e.target.value)} placeholder="e.g. Infosys" />
        </div>
        <div>
          <label className="label">Requisition *</label>
          <Select value={form.roleId} onChange={(e) => set('roleId', e.target.value)}>
            <option value="">Choose…</option>
            {(roles.data?.roles || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </div>
        <div>
          <label className="label">Source</label>
          <Select value={form.source} onChange={(e) => set('source', e.target.value)}>
            {['Naukri', 'LinkedIn', 'Referral', 'Internshala', 'Apna', 'Walk-in'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      {dupe && (
        <div style={{ marginTop: 14 }}>
          <Banner
            icon="content_copy"
            tone="warn"
            action={<Button variant="soft" onClick={() => openExisting(dupe.id)}>Open existing</Button>}
          >
            <strong>Possible duplicate.</strong> {dupe.name} already has this number
            {dupe.roleName ? ` on ${dupe.roleName}` : ''}.
          </Banner>
        </div>
      )}

      {error && <div style={{ marginTop: 14 }}><Banner icon="error" tone="danger">{error}</Banner></div>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Router                                                            *
 * ------------------------------------------------------------------ */

export function Modals() {
  const { modal, closeModal } = useDesk();
  if (!modal) return null;

  switch (modal) {
    case 'personas': return <PersonaModal onClose={closeModal} />;
    case 'consent': return <ConsentModal onClose={closeModal} />;
    case 'erasure': return <ErasureModal onClose={closeModal} />;
    case 'stage': return <StageModal onClose={closeModal} />;
    case 'dropreason': return <DropReasonModal onClose={closeModal} />;
    case 'disposition': return <DispositionModal onClose={closeModal} />;
    case 'callback': return <CallbackModal onClose={closeModal} />;
    case 'dnc': return <DncModal onClose={closeModal} />;
    case 'invite': return <InviteModal onClose={closeModal} />;
    case 'newtask': return <NewTaskModal onClose={closeModal} />;
    case 'filters': return <FiltersModal onClose={closeModal} />;
    case 'addcand': return <AddCandidateModal onClose={closeModal} />;
    default: return null;
  }
}
