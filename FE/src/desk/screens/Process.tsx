/**
 * Composer, templates, interviews, scorecards, offers, offer letter, approvals.
 */

import React, { useMemo, useState } from 'react';
import { deskApi, type Interview, type Offer } from '../api';
import { T, stage } from '../tokens';
import { useDesk } from '../store';
import {
  Avatar, Badge, Banner, Button, Card, Chip, EmptyState, ErrorState, Eyebrow,
  FactGrid, Icon, Input, Panel, Select, SkeletonRows, Stat, Textarea,
  num, shortDate, splitList, useLoad, whenLabel,
} from '../ui';

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'chat', color: T.teal, tint: T.tealTint },
  { key: 'sms', label: 'SMS', icon: 'sms', color: T.blue, tint: T.blueTint },
  { key: 'email', label: 'Email', icon: 'mail', color: T.purple, tint: T.purpleTint },
];

/* ------------------------------------------------------------------ *
 *  Composer                                                          *
 * ------------------------------------------------------------------ */

/** Shared body used by full-page Composer and the modal overlay. */
export function ComposerPanel({
  candidateId,
  compact = false,
}: {
  candidateId: string;
  compact?: boolean;
}) {
  const { session } = useDesk();
  const [channel, setChannel] = useState('whatsapp');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [touched, setTouched] = useState(false);

  const candLoad = useLoad(async () => deskApi.candidate(candidateId), [candidateId]);
  const templates = useLoad(() => deskApi.templates(), []);
  const candData = candLoad.data && candLoad.data.id === candidateId ? candLoad.data : null;

  const vars = useMemo(() => ({
    name: (candData?.name || '').split(' ')[0] || 'there',
    role: candData?.roleName || 'the role',
    client: candData?.latestCompany || candData?.roleName || 'our client',
    recruiter: (session?.name || '').split(' ')[0] || 'the team',
    org: session?.settings.orgName || '',
  }), [candData, session]);

  const resolve = (text: string) =>
    Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{{${k}}}`).join(v), text);

  const forChannel = (templates.data || []).filter((t) => t.channel === channel);
  const active = forChannel.find((t) => t.id === templateId) || forChannel[0];
  const resolved = touched ? body : resolve(active?.body || '');

  const send = () => {
    const c = candData;
    if (!c) return;
    const text = encodeURIComponent(resolved);
    const digits = (c.phone || '').replace(/\D/g, '');
    if (channel === 'whatsapp') {
      const e164 = digits.length === 10 ? `91${digits}` : digits;
      window.open(`https://wa.me/${e164}?text=${text}`, '_blank', 'noopener');
    } else if (channel === 'sms') {
      window.location.href = `sms:${c.phone}?body=${text}`;
    } else {
      window.location.href = `mailto:${c.email}?subject=${encodeURIComponent(active?.subject || c.roleName)}&body=${text}`;
    }
  };

  if (candLoad.loading && !candData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 12 }}>
        <SkeletonRows rows={compact ? 4 : 5} />
      </div>
    );
  }

  if (candLoad.error && !candData) {
    return <ErrorState message={candLoad.error} onRetry={() => candLoad.reload()} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={candData?.name} id={candidateId} size={compact ? 36 : 40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{candData?.name || 'Candidate'}</div>
          <div style={{ fontSize: 11.5, color: T.inkMuted }}>
            {channel === 'email' ? candData?.email : candData?.phone}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {CHANNELS.map((ch) => {
          const on = channel === ch.key;
          return (
            <button
              key={ch.key}
              type="button"
              onClick={() => { setChannel(ch.key); setTemplateId(null); setTouched(false); }}
              style={{
                flex: 1,
                height: compact ? 36 : 40,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                background: on ? ch.tint : T.surface,
                border: `1px solid ${on ? ch.color : T.borderStrong}`,
                color: on ? ch.color : T.inkBody,
              }}
            >
              <Icon name={ch.icon} size={16} />
              {ch.label}
            </button>
          );
        })}
      </div>

      <div>
        <label className="label">Template</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: compact ? 160 : undefined, overflowY: compact ? 'auto' : undefined }}>
          {forChannel.map((t) => {
            const on = active?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTemplateId(t.id); setTouched(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: `1px solid ${on ? T.indigo : T.border}`,
                  background: on ? T.indigoTintSoft : T.surface,
                  textAlign: 'left',
                }}
              >
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700 }}>{t.name}</span>
                {t.stage && <Badge label={t.stage} bg={T.fill} fg={T.inkMuted} />}
              </button>
            );
          })}
          {!forChannel.length && (
            <div style={{ fontSize: 12, color: T.inkFaint }}>
              No templates for this channel yet. Add one on the Templates screen.
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="label">Message · variables resolved</label>
        <Textarea
          value={resolved}
          onChange={(e) => { setTouched(true); setBody(e.target.value); }}
          style={{ minHeight: compact ? 100 : 120 }}
        />
      </div>

      <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10 }}>
        <Eyebrow>Variables</Eyebrow>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {Object.entries(vars).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: 10.5, background: T.fill, color: T.indigo, padding: '2px 6px', borderRadius: 3 }}>
                {`{{${k}}}`}
              </span>
              <Icon name="arrow_forward" size={13} color={T.inkGhost} />
              <span style={{ fontSize: 11.5, color: T.inkBody }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button icon="open_in_new" onClick={send} disabled={!resolved.trim()}>
          {channel === 'whatsapp' ? 'Open in WhatsApp' : channel === 'sms' ? 'Open SMS app' : 'Open email app'}
        </Button>
        <span style={{ fontSize: 10.5, color: T.inkFaint }}>
          Hands off to the app on this machine — nothing is sent from the browser.
        </span>
      </div>
    </div>
  );
}

export function ComposerScreen() {
  const { candidateId, go } = useDesk();

  if (!candidateId) {
    return (
      <div className="pad">
        <EmptyState
          icon="chat"
          title="No candidate selected"
          body="Open a candidate first, then compose from their profile."
          actionLabel="Browse candidates"
          onAction={() => go('cands')}
        />
      </div>
    );
  }

  return (
    <div className="pad">
      <Card style={{ maxWidth: 820 }}>
        <ComposerPanel candidateId={candidateId} />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Templates                                                         *
 * ------------------------------------------------------------------ */

export function TemplatesScreen() {
  const [filter, setFilter] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', channel: 'whatsapp', stage: '', body: '' });
  const load = useLoad(() => deskApi.templates(), []);

  const shown = (load.data || []).filter((t) => !filter || t.channel === filter);

  const save = async () => {
    if (!draft.name.trim() || !draft.body.trim()) return;
    await deskApi.createTemplate(draft);
    setDraft({ name: '', channel: 'whatsapp', stage: '', body: '' });
    setAdding(false);
    load.reload();
  };

  return (
    <div className="pad">
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip label="All" on={!filter} onClick={() => setFilter(null)} />
        {CHANNELS.map((ch) => (
          <Chip key={ch.key} label={ch.label} on={filter === ch.key} onClick={() => setFilter(ch.key)} accent={ch.color} />
        ))}
        <Button icon="add" onClick={() => setAdding(!adding)} style={{ marginLeft: 'auto' }}>New template</Button>
      </div>

      {adding && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            <div>
              <label className="label">Name</label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Channel</label>
              <Select value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value })}>
                {CHANNELS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </Select>
            </div>
            <div>
              <label className="label">Stage</label>
              <Input value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value })} placeholder="e.g. Sourced" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Body · use {'{{name}} {{role}} {{client}} {{recruiter}} {{org}}'}</label>
            <Textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <Button onClick={save} disabled={!draft.name.trim() || !draft.body.trim()}>Save template</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {load.loading && <SkeletonRows rows={4} />}
      {load.data && !shown.length && (
        <EmptyState icon="description" title="No templates" body="Create one to speed up first outreach." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shown.map((t) => {
          const ch = CHANNELS.find((c) => c.key === t.channel) || CHANNELS[0];
          return (
            <Card key={t.id} pad={13}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{t.name}</span>
                <Badge label={ch.label} bg={ch.tint} fg={ch.color} />
                {t.stage && <Badge label={t.stage} bg={T.fill} fg={T.inkMuted} />}
              </div>
              <div className="mono" style={{ marginTop: 9, fontSize: 11.5, color: T.inkMuted, lineHeight: 1.55, background: '#F7F6FB', borderRadius: 9, padding: 10 }}>
                {t.body}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Interviews                                                        *
 * ------------------------------------------------------------------ */

export function InterviewsScreen() {
  const { go, caps } = useDesk();
  const c = caps();
  const load = useLoad(() => deskApi.interviews({ mine: c.db === 'ownInterviews' }), [c.db]);

  const grouped = (load.data || []).reduce<Record<string, Interview[]>>((acc, i) => {
    const key = i.scheduledAt ? shortDate(i.scheduledAt) : 'UNSCHEDULED';
    (acc[key] ||= []).push(i);
    return acc;
  }, {});

  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Button icon="add" onClick={() => go('intsched')}>Schedule interview</Button>
      </div>

      {load.loading && <SkeletonRows rows={4} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !load.data.length && (
        <EmptyState icon="event" title="No interviews scheduled"
          body="Schedule one from a candidate, or move someone to the Interview stage."
          actionLabel="Schedule interview" onAction={() => go('intsched')} />
      )}

      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} style={{ marginBottom: 18 }}>
          <Eyebrow>{day}</Eyebrow>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((i) => (
              <Card key={i.id} pad={0} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 4, background: T.purple, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: 14, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
                      <Avatar name={i.candidateName} id={i.candidateId} size={34} />
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{i.candidateName || 'Candidate'}</div>
                        <div style={{ fontSize: 11.5, color: T.inkMuted }}>{i.requisitionName || '—'}</div>
                      </div>
                      <div className="mono" style={{ fontSize: 12, textAlign: 'right' }}>
                        {i.scheduledAt ? whenLabel(i.scheduledAt) : 'Not scheduled'}
                        <div style={{ fontSize: 9.5, color: T.inkFaint, marginTop: 2 }}>{i.durationMinutes}m</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Badge label={i.roundLabel || i.kind} bg={T.purpleTint} fg={T.purple} />
                      {i.mode && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: T.inkMuted }}>
                          <Icon name="videocam" size={14} />{i.mode}
                        </span>
                      )}
                      {i.panel.length > 0 && (
                        <span style={{ fontSize: 10.5, color: T.inkFaint }}>
                          Panel · {i.panel.map((p) => p.name).filter(Boolean).join(', ')}
                        </span>
                      )}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
                        <Button variant="ghost" onClick={() => go('intkit', { interviewId: i.id, candidateId: i.candidateId })}>
                          Kit
                        </Button>
                        {c.score && (
                          <Button variant={i.hasScorecard ? 'ghost' : 'soft'}
                            onClick={() => go('scorecard', { interviewId: i.id, candidateId: i.candidateId })}
                          >
                            {i.hasScorecard ? 'Scorecard filed' : 'Scorecard'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScheduleInterviewScreen() {
  const { candidateId, go } = useDesk();
  const [form, setForm] = useState({
    candidateId: candidateId || '', kind: 'technical', roundLabel: '',
    scheduledAt: '', durationMinutes: '45', mode: 'Google Meet', panel: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cands = useLoad(async () => (await deskApi.candidates({ status: 'interview', pageSize: 40 })).items, []);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.candidateId) return;
    setBusy(true); setError(null);
    try {
      await deskApi.createInterview({
        candidateId: form.candidateId,
        kind: form.kind,
        roundLabel: form.roundLabel || null,
        scheduledAt: form.scheduledAt || null,
        durationMinutes: Number(form.durationMinutes) || 45,
        mode: form.mode || null,
        panel: splitList(form.panel).map((n) => ({ name: n })),
      });
      go('intcal');
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="pad">
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Candidate *</label>
            <Select value={form.candidateId} onChange={(e) => set('candidateId', e.target.value)}>
              <option value="">Choose…</option>
              {(cands.data || []).map((c) => <option key={c.id} value={c.id}>{c.name} · {c.roleName}</option>)}
            </Select>
          </div>
          <div>
            <label className="label">Type</label>
            <Select value={form.kind} onChange={(e) => set('kind', e.target.value)}>
              {['screening', 'technical', 'panel', 'culture', 'hr'].map((k) => (
                <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="label">Round label</label>
            <Input value={form.roundLabel} onChange={(e) => set('roundLabel', e.target.value)} placeholder="Technical round 2" />
          </div>
          <div>
            <label className="label">When</label>
            <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)} />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <Input type="number" value={form.durationMinutes} onChange={(e) => set('durationMinutes', e.target.value)} />
          </div>
          <div>
            <label className="label">Mode / link</label>
            <Input value={form.mode} onChange={(e) => set('mode', e.target.value)} />
          </div>
          <div>
            <label className="label">Panel · comma separated</label>
            <Input value={form.panel} onChange={(e) => set('panel', e.target.value)} placeholder="Fatima Q, Arun S" />
          </div>
        </div>

        {error && <div style={{ marginTop: 14 }}><Banner icon="error" tone="danger">{error}</Banner></div>}

        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <Button icon="send" onClick={save} disabled={!form.candidateId || busy}>
            {busy ? 'Scheduling…' : 'Schedule'}
          </Button>
          <Button variant="ghost" onClick={() => go('intcal')}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
}

const COMPETENCIES = [
  ['Core craft', 'Walk through the hardest problem you solved in this stack.'],
  ['Systems thinking', 'How would you design this to survive a 10× load increase?'],
  ['Ownership', 'Describe a release you owned end to end.'],
  ['Communication', 'Explain your last architecture decision to a non-technical stakeholder.'],
];

const AGENDA = [
  ['0–5 min', 'Intro, role context, team shape'],
  ['5–25 min', "Core skills deep dive against the candidate's stated stack"],
  ['25–40 min', 'System design or scenario relevant to the requisition'],
  ['40–45 min', 'Candidate questions, comp and notice confirmation'],
];

export function InterviewKitScreen() {
  const { candidateId, interviewId, go, caps } = useDesk();
  const c = caps();
  const cand = useLoad(async () => (candidateId ? deskApi.candidate(candidateId) : null), [candidateId]);
  const skills = splitList(cand.data?.relevantSkills || cand.data?.otherSkills);

  return (
    <div className="pad">
      <Button variant="ghost" icon="arrow_back" onClick={() => go('intcal')}>All interviews</Button>

      <div style={{ marginTop: 14 }}>
        <Eyebrow color={T.purple}>Interview brief</Eyebrow>
        <h2 style={{ margin: '7px 0 0', fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>
          {cand.data?.name || 'Candidate'}
        </h2>
        <div style={{ marginTop: 3, fontSize: 12.5, color: T.inkMuted }}>
          {[cand.data?.latestRole, cand.data?.roleName].filter(Boolean).join(' · ')}
        </div>
      </div>

      <Card style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Agenda</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AGENDA.map(([t, d]) => (
            <div key={t} style={{ display: 'flex', gap: 11 }}>
              <span className="mono" style={{ fontSize: 10, color: T.purple, width: 62, flexShrink: 0, fontWeight: 500 }}>{t}</span>
              <span style={{ fontSize: 12, color: T.inkBody, lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Competencies & prompts</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {COMPETENCIES.map(([n, q]) => (
            <div key={n}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.indigo }}>{n}</div>
              <div style={{ marginTop: 3, fontSize: 12, color: T.inkMuted, lineHeight: 1.5 }}>{q}</div>
            </div>
          ))}
        </div>
      </Card>

      {skills.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Stated skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {skills.map((s) => (
              <span key={s} style={{ background: T.fill, borderRadius: 8, padding: '5px 10px', fontSize: 11.5, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </Card>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {cand.data?.resumeLink && (
          <Button variant="ghost" icon="picture_as_pdf" onClick={() => go('resume', { candidateId: candidateId! })}>
            Resume
          </Button>
        )}
        {c.score && (
          <Button icon="rate_review" onClick={() => go('scorecard', { candidateId: candidateId!, interviewId: interviewId || undefined })}>
            Open scorecard
          </Button>
        )}
      </div>
    </div>
  );
}

const RECOMMENDATIONS = [
  { key: 'strong_hire', label: 'Strong hire', color: T.green },
  { key: 'hire', label: 'Hire', color: T.teal },
  { key: 'no_hire', label: 'No hire', color: T.orange },
  { key: 'strong_no', label: 'Strong no', color: T.red },
];

export function ScorecardScreen() {
  const { candidateId, interviewId, go, caps } = useDesk();
  const c = caps();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [rec, setRec] = useState<string | null>(null);
  const [evidence, setEvidence] = useState('');
  const [busy, setBusy] = useState(false);
  const [pickId, setPickId] = useState(candidateId || '');

  const interviews = useLoad(() => deskApi.interviews({ mine: c.db === 'ownInterviews' }), []);
  const complete = Object.keys(scores).length === COMPETENCIES.length && rec;

  if (!c.score) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Scorecards are not part of your role"
          body="Only interviewers and hiring managers submit structured feedback." />
      </div>
    );
  }

  const submit = async () => {
    if (!complete || !pickId) return;
    setBusy(true);
    try {
      await deskApi.submitScorecard({
        candidateId: pickId, interviewId: interviewId || null,
        scores, recommendation: rec, evidence,
      });
      go('intcal');
    } catch (e) {
      alert((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="pad">
      <Card>
        {!candidateId && (
          <div style={{ marginBottom: 14 }}>
            <label className="label">Candidate *</label>
            <Select value={pickId} onChange={(e) => setPickId(e.target.value)}>
              <option value="">Choose…</option>
              {(interviews.data || []).map((i) => (
                <option key={i.id} value={i.candidateId}>{i.candidateName} · {i.roundLabel || i.kind}</option>
              ))}
            </Select>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Eyebrow>Competency</Eyebrow>
          <Eyebrow>1 poor — 4 excellent</Eyebrow>
        </div>

        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {COMPETENCIES.map(([name]) => (
            <Card key={name} pad={12}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{name}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 7 }}>
                {[1, 2, 3, 4].map((v) => {
                  const on = scores[name] === v;
                  const col = v === 1 ? T.red : v === 2 ? T.orange : v === 3 ? T.green : T.teal;
                  return (
                    <button
                      key={v}
                      onClick={() => setScores((s) => ({ ...s, [name]: v }))}
                      className="mono"
                      style={{
                        flex: 1, height: 44, borderRadius: 11, fontSize: 15,
                        background: on ? col : T.surface,
                        border: `1.5px solid ${on ? col : T.borderStrong}`,
                        color: on ? '#fff' : T.inkMuted,
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="label">Evidence & notes</label>
          <Textarea value={evidence} onChange={(e) => setEvidence(e.target.value)}
            placeholder="What did they actually say or do? Quote specifics." />
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="label">Recommendation</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 7 }}>
            {RECOMMENDATIONS.map((r) => {
              const on = rec === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRec(r.key)}
                  style={{
                    height: 44, borderRadius: 11, fontSize: 12.5, fontWeight: 700,
                    background: on ? r.color : T.surface,
                    border: `1.5px solid ${on ? r.color : T.borderStrong}`,
                    color: on ? '#fff' : T.inkBody,
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {complete && (
          <div style={{ marginTop: 14 }}>
            <Banner icon="info" tone="info">
              {rec === 'strong_hire' || rec === 'hire'
                ? 'Submitting moves this candidate to Offer.'
                : rec === 'strong_no'
                  ? 'Submitting drops this candidate from the pipeline.'
                  : 'Submitting records the scorecard without changing the stage.'}
            </Banner>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <Button onClick={submit} disabled={!complete || !pickId || busy}>
            {busy ? 'Submitting…' : complete ? 'Submit scorecard' : `Rate all ${COMPETENCIES.length} competencies`}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Offers                                                            *
 * ------------------------------------------------------------------ */

const OFFER_TONE: Record<string, { bg: string; fg: string }> = {
  draft: { bg: T.fill, fg: T.inkMuted },
  pending_approval: { bg: T.amberTint, fg: T.amber },
  approved: { bg: T.tealTint, fg: T.teal },
  extended: { bg: T.blueTint, fg: T.blue },
  accepted: { bg: T.greenTint, fg: T.green },
  joined: { bg: T.greenTint, fg: T.green },
  rejected: { bg: T.redTint, fg: T.red },
  declined: { bg: T.redTint, fg: T.red },
  dropped: { bg: T.redTint, fg: T.red },
};

export function OffersScreen() {
  const { go } = useDesk();
  const load = useLoad(() => deskApi.offers(), []);

  const groups: [string, Offer[]][] = [
    ['PENDING APPROVAL', (load.data || []).filter((o) => o.status === 'pending_approval')],
    ['LIVE', (load.data || []).filter((o) => ['approved', 'extended', 'accepted'].includes(o.status))],
    ['CLOSED', (load.data || []).filter((o) => ['joined', 'declined', 'dropped', 'rejected'].includes(o.status))],
    ['DRAFT', (load.data || []).filter((o) => o.status === 'draft')],
  ];

  return (
    <div className="pad">
      {load.loading && <SkeletonRows rows={4} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !load.data.length && (
        <EmptyState icon="contract" title="No offers yet"
          body="Raise one from a candidate who has cleared their interviews." />
      )}

      {groups.filter(([, items]) => items.length).map(([name, items]) => (
        <div key={name} style={{ marginBottom: 18 }}>
          <Eyebrow>{name}</Eyebrow>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((o) => {
              const t = OFFER_TONE[o.status] || OFFER_TONE.draft;
              return (
                <Card key={o.id} pad={13} onClick={() => go('offer', { offerId: o.id, candidateId: o.candidateId })}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Avatar name={o.candidateName} id={o.candidateId} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{o.candidateName || 'Candidate'}</div>
                      <div style={{ fontSize: 11, color: T.inkMuted }}>
                        {[o.requisitionName, o.clientName].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>
                      {o.ctcTotal ? `₹${o.ctcTotal} LPA` : '—'}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge label={o.status.replace(/_/g, ' ')} bg={t.bg} fg={t.fg} />
                    {o.reference && <span className="mono" style={{ fontSize: 10, color: T.inkFaint }}>{o.reference}</span>}
                    {o.joiningDate && <span className="mono" style={{ fontSize: 10, color: T.inkFaint }}>JOINS {shortDate(o.joiningDate)}</span>}
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

export function OfferScreen() {
  const { offerId, go, caps } = useDesk();
  const c = caps();
  const load = useLoad(async () => (offerId ? deskApi.offer(offerId) : null), [offerId]);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  if (load.loading) return <div className="pad"><SkeletonRows rows={4} /></div>;
  if (load.error) return <div className="pad"><ErrorState message={load.error} onRetry={load.reload} /></div>;
  const o = load.data;
  if (!o) return <div className="pad"><EmptyState icon="contract" title="Nothing selected" body="Pick an offer." /></div>;

  const t = OFFER_TONE[o.status] || OFFER_TONE.draft;
  const myPending = o.approvals.find((a) => a.status === 'pending');

  const decide = async (approve: boolean) => {
    if (!myPending) return;
    setBusy(true);
    try {
      await deskApi.decideApproval(myPending.id, approve, comment);
      load.reload();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="pad">
      <Button variant="ghost" icon="arrow_back" onClick={() => go('offers')}>All offers</Button>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge label={o.status.replace(/_/g, ' ')} bg={t.bg} fg={t.fg} />
        {o.reference && <span className="mono" style={{ fontSize: 10, color: T.inkFaint }}>{o.reference}</span>}
      </div>
      <h2 style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>
        {o.candidateName}
      </h2>
      <div style={{ marginTop: 3, fontSize: 12.5, color: T.inkMuted }}>
        {[o.requisitionName, o.clientName].filter(Boolean).join(' · ') || '—'}
      </div>

      <Card style={{ marginTop: 14, background: T.indigo, color: '#fff', border: 'none' }}>
        <div style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 600 }}>Total CTC</div>
        <div className="mono" style={{ marginTop: 6, fontSize: 30, fontWeight: 500, lineHeight: 1 }}>
          {o.ctcTotal ? `₹${o.ctcTotal} LPA` : 'Not set'}
        </div>
        {o.bandNote && <div style={{ marginTop: 6, fontSize: 11.5, opacity: 0.85 }}>{o.bandNote}</div>}
      </Card>

      {o.breakup.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>CTC breakup</div>
          {o.breakup.map((b) => (
            <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ fontSize: 12, color: T.inkMuted }}>{b.label}</span>
              <span className="mono" style={{ fontSize: 12.5 }}>₹{b.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </Card>
      )}

      <Card style={{ marginTop: 12 }}>
        <FactGrid
          facts={[
            ['Joining date', o.joiningDate ? shortDate(o.joiningDate) : ''],
            ['Expires', o.expiresAt ? shortDate(o.expiresAt) : ''],
            ['Notice', o.noticeDays ? `${o.noticeDays} days` : ''],
            ['Buyout cost', o.buyoutCost ? `₹${o.buyoutCost.toLocaleString('en-IN')}` : ''],
          ]}
        />
      </Card>

      <Card style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Approval chain</div>
        {o.approvals.length === 0 && <div style={{ fontSize: 12, color: T.inkFaint }}>No approvers on this offer.</div>}
        {o.approvals.map((a) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
            <Icon
              name={a.status === 'approved' ? 'check_circle' : a.status === 'rejected' ? 'cancel' : 'schedule'}
              size={19}
              color={a.status === 'approved' ? T.green : a.status === 'rejected' ? T.red : T.inkFaint}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.approverName || 'Unassigned'}</div>
              <div style={{ fontSize: 10.5, color: T.inkFaint }}>{a.approverRole || '—'}{a.comment ? ` · ${a.comment}` : ''}</div>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="ghost" icon="description" onClick={() => go('offerletter', { offerId: o.id })}>
          Offer letter
        </Button>
        <Button variant="ghost" icon="person" onClick={() => go('cands', { candidateId: o.candidateId })}>
          Candidate
        </Button>
      </div>

      {c.approve && myPending && (
        <Card style={{ marginTop: 16 }}>
          <label className="label">Decision comment</label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Why approve or reject?" />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <Button onClick={() => decide(true)} disabled={busy}>Approve</Button>
            <Button variant="danger" onClick={() => decide(false)} disabled={busy}>Reject</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export function OfferLetterScreen() {
  const { offerId, go, session } = useDesk();
  const load = useLoad(async () => (offerId ? deskApi.offer(offerId) : null), [offerId]);
  const [body, setBody] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const o = load.data;

  const draft = o ? (o.letterBody || [
    `Dear ${o.candidateName},`,
    '',
    `We are delighted to offer you the position of ${o.requisitionName || 'the role'}${o.clientName ? ` at ${o.clientName}` : ''}.`,
    '',
    `Total compensation: ${o.ctcTotal ? `₹${o.ctcTotal} LPA` : '—'}`,
    o.joiningDate ? `Proposed joining date: ${shortDate(o.joiningDate)}` : '',
    o.expiresAt ? `This offer is valid until ${shortDate(o.expiresAt)}.` : '',
    '',
    'We look forward to welcoming you.',
    '',
    session?.settings.orgName || '',
  ].filter(Boolean).join('\n')) : '';

  const text = body ?? draft;

  const save = async (markSent: boolean) => {
    if (!offerId) return;
    setBusy(true);
    try {
      await deskApi.updateOffer(offerId, { letterBody: text, markLetterSent: markSent || undefined });
      load.reload();
      if (markSent) go('offer', { offerId });
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  if (load.loading) return <div className="pad"><SkeletonRows rows={4} /></div>;
  if (!o) return <div className="pad"><EmptyState icon="description" title="No offer selected" body="Pick an offer first." /></div>;

  return (
    <div className="pad">
      <Button variant="ghost" icon="arrow_back" onClick={() => go('offer', { offerId })}>Back to offer</Button>

      {o.status === 'pending_approval' && (
        <div style={{ marginTop: 14 }}>
          <Banner icon="lock" tone="warn">
            This offer is still awaiting approval. You can draft the letter, but sending it before the
            chain clears would put an unapproved number in writing.
          </Banner>
        </div>
      )}

      <Card style={{ marginTop: 14, maxWidth: 820 }}>
        <label className="label">Letter · merged from the offer</label>
        <Textarea value={text} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 320, fontFamily: 'inherit' }} />
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => save(false)} disabled={busy}>Save draft</Button>
          <Button icon="send" onClick={() => save(true)} disabled={busy || o.status === 'pending_approval'}>
            Mark as sent
          </Button>
          {o.letterSentAt && (
            <span style={{ fontSize: 11.5, color: T.green, alignSelf: 'center' }}>
              Sent {whenLabel(o.letterSentAt)}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

export function ApprovalsScreen() {
  const { go, caps } = useDesk();
  const c = caps();
  const [busy, setBusy] = useState<string | null>(null);
  const load = useLoad(() => deskApi.approvals({ mine: true, status: 'pending' }), []);

  const decide = async (id: string, approve: boolean) => {
    setBusy(id);
    try {
      await deskApi.decideApproval(id, approve, '');
      load.reload();
    } catch (e) { alert((e as Error).message); } finally { setBusy(null); }
  };

  if (!c.approve) {
    return (
      <div className="pad">
        <EmptyState icon="lock" title="Approvals are not part of your role"
          body="Team leads, hiring managers and admins decide on offers and rate exceptions." />
      </div>
    );
  }

  return (
    <div className="pad">
      {load.loading && <SkeletonRows rows={3} />}
      {load.error && <ErrorState message={load.error} onRetry={load.reload} />}
      {load.data && !load.data.length && (
        <EmptyState icon="check_circle" tone="success" title="Nothing to approve"
          body="Offers and requisitions raised by the team land here." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(load.data || []).map((a) => (
          <Card key={a.id}>
            <div style={{ display: 'flex', gap: 11 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: T.purpleTint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="gavel" size={19} color={T.purple} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{a.refLabel || a.kind}</div>
                {a.detail && <div style={{ marginTop: 3, fontSize: 11.5, color: T.inkMuted }}>{a.detail}</div>}
                <div style={{ marginTop: 5, fontSize: 10.5, color: T.inkFaint }}>
                  Raised by {a.requestedByName || 'someone'} · {whenLabel(a.createdAt)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Button onClick={() => decide(a.id, true)} disabled={busy === a.id}>Approve</Button>
              <Button variant="ghost" onClick={() => decide(a.id, false)} disabled={busy === a.id}>Reject</Button>
              {a.kind === 'offer' && (
                <Button variant="ghost" icon="visibility" onClick={() => go('offer', { offerId: a.refId })}>View</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
