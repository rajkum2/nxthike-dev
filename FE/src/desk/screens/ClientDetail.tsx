/**
 * Client 360 body, shared by the right-hand drawer on the Clients list and the
 * full-screen Client screen. One implementation so the two can't drift.
 *
 * `compact` is the drawer: narrower stat grid and tighter spacing. Everything
 * else — storefront detail, contract, contacts, job orders — is identical.
 */

import React, { useState } from 'react';
import { deskApi, type Client, type ClientContact } from '../api';
import { T } from '../tokens';
import { useDesk } from '../store';
import { isLikelyWhatsAppMobile, mapsHref, openWhatsApp } from '../messaging';
import {
  Avatar, Badge, Button, Card, EmptyState, ErrorState, FactGrid, Field, Icon,
  Input, Modal, Panel, Select, SkeletonRows, Stat, Textarea, num, useLoad,
} from '../ui';

const DAYS: [string, string][] = [
  ['monday', 'Mon'], ['tuesday', 'Tue'], ['wednesday', 'Wed'], ['thursday', 'Thu'],
  ['friday', 'Fri'], ['saturday', 'Sat'], ['sunday', 'Sun'],
];

const HEALTH: Record<string, { bg: string; fg: string; label: string }> = {
  good: { bg: T.greenTint, fg: T.green, label: 'Healthy' },
  watch: { bg: T.amberTint, fg: T.amber, label: 'Watch' },
  risk: { bg: T.redTint, fg: T.red, label: 'At risk' },
};

const BLANK_CONTACT: ClientContact = {
  name: '', role: '', phone: '', altPhone: '', whatsapp: '', email: '',
};

/** Explicit WhatsApp number, else the main phone when it looks like a mobile. */
function waNumber(p: { whatsapp?: string | null; phone?: string | null }): string | null {
  if (p.whatsapp && isLikelyWhatsAppMobile(p.whatsapp)) return p.whatsapp;
  if (!p.whatsapp && isLikelyWhatsAppMobile(p.phone)) return p.phone || null;
  return p.whatsapp && p.whatsapp.trim() ? p.whatsapp : null;
}

/**
 * Edit every field on an account, plus its contact list.
 *
 * Only keys the user actually changed are sent, so two people editing
 * different parts of the same account don't clobber each other.
 */
function ClientEditModal({
  client, onClose, onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: client.name || '',
    industry: client.industry || '',
    location: client.location || '',
    phone: client.phone || '',
    whatsapp: client.whatsapp || '',
    website: client.website || '',
    address: client.address || '',
    pincode: client.pincode || '',
    rating: client.rating == null ? '' : String(client.rating),
    reviewsCount: client.reviewsCount == null ? '' : String(client.reviewsCount),
    health: client.health || 'good',
    source: client.source || '',
    mapsUrl: client.mapsUrl || '',
    tags: (client.tags || []).join(', '),
    notes: client.notes || '',
    isClient: client.isClient ? 'client' : 'prospect',
  });
  const [contacts, setContacts] = useState<ClientContact[]>(
    (client.contacts || []).length ? client.contacts.map((c) => ({ ...BLANK_CONTACT, ...c })) : [],
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const setContact = (i: number, k: keyof ClientContact, v: string) =>
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)));

  const save = async () => {
    const name = f.name.trim();
    if (!name) { setErr('Name is required.'); return; }
    const rating = f.rating.trim() === '' ? null : Number(f.rating);
    if (rating != null && (Number.isNaN(rating) || rating < 0 || rating > 5)) {
      setErr('Rating must be a number between 0 and 5.'); return;
    }
    const reviews = f.reviewsCount.trim() === '' ? null : Number(f.reviewsCount);
    if (reviews != null && (Number.isNaN(reviews) || reviews < 0)) {
      setErr('Reviews must be a positive number.'); return;
    }
    // Drop rows the user added but left blank; a contact needs at least a name.
    const cleaned = contacts
      .map((c) => ({
        name: (c.name || '').trim(),
        role: (c.role || '').trim(),
        phone: (c.phone || '').trim(),
        altPhone: (c.altPhone || '').trim(),
        whatsapp: (c.whatsapp || '').trim(),
        email: (c.email || '').trim(),
      }))
      .filter((c) => c.name || c.phone || c.altPhone || c.whatsapp || c.email);
    if (cleaned.some((c) => !c.name)) { setErr('Every contact needs a name.'); return; }

    const body: Record<string, unknown> = {
      name,
      industry: f.industry.trim(),
      location: f.location.trim(),
      phone: f.phone.trim(),
      whatsapp: f.whatsapp.trim(),
      website: f.website.trim(),
      address: f.address.trim(),
      pincode: f.pincode.trim(),
      rating,
      reviewsCount: reviews,
      health: f.health,
      source: f.source.trim(),
      mapsUrl: f.mapsUrl.trim(),
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: f.notes.trim(),
      contacts: cleaned,
      // Promoting a prospect also puts it on the public company directory.
      isClient: f.isClient === 'client',
    };

    setBusy(true); setErr(null);
    try {
      await deskApi.updateClient(client.id, body);
      onSaved();
      onClose();
    } catch (e) {
      setErr((e as Error).message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`Edit ${client.name}`}
      subtitle="Account profile, storefront detail and contacts"
      onClose={onClose}
      width={680}
      footer={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          {err && <span style={{ fontSize: 12, color: T.red, flex: 1 }}>{err}</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button icon={busy ? 'hourglass_top' : 'check'} onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        <Field label="Name"><Input value={f.name} onChange={set('name')} /></Field>
        <Field label="Category"><Input value={f.industry} onChange={set('industry')} placeholder="e.g. Pet store" /></Field>
        <Field label="Area"><Input value={f.location} onChange={set('location')} placeholder="e.g. Gachibowli, Hyderabad" /></Field>
        <Field label="Phone"><Input value={f.phone} onChange={set('phone')} /></Field>
        <Field label="WhatsApp"><Input value={f.whatsapp} onChange={set('whatsapp')} placeholder="Blank = use phone" /></Field>
        <Field label="Website"><Input value={f.website} onChange={set('website')} placeholder="https://…" /></Field>
        <Field label="Pincode"><Input value={f.pincode} onChange={set('pincode')} /></Field>
        <Field label="Rating (0–5)"><Input value={f.rating} onChange={set('rating')} inputMode="decimal" /></Field>
        <Field label="Reviews"><Input value={f.reviewsCount} onChange={set('reviewsCount')} inputMode="numeric" /></Field>
        <Field label="Health">
          <Select value={f.health} onChange={set('health')}>
            <option value="good">Healthy</option>
            <option value="watch">Watch</option>
            <option value="risk">At risk</option>
          </Select>
        </Field>
        <Field label="Source"><Input value={f.source} onChange={set('source')} placeholder="e.g. Google Maps" /></Field>
        <Field label="Account type">
          <Select value={f.isClient} onChange={set('isClient')}>
            <option value="client">Client — we work with them</option>
            <option value="prospect">Prospect — imported lead</option>
          </Select>
        </Field>
      </div>

      <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
        <Field label="Address"><Textarea value={f.address} onChange={set('address')} rows={2} /></Field>
        <Field label="Map link"><Input value={f.mapsUrl} onChange={set('mapsUrl')} placeholder="https://maps.google.com/…" /></Field>
        <Field label="Tags"><Input value={f.tags} onChange={set('tags')} placeholder="comma separated" /></Field>
        <Field label="Notes"><Textarea value={f.notes} onChange={set('notes')} rows={2} /></Field>
      </div>

      <div style={{ marginTop: 16, borderTop: `1px solid ${T.divider}`, paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Contacts</span>
          <span style={{ fontSize: 11.5, color: T.inkMuted }}>{contacts.length} recorded</span>
          <Button
            variant="ghost"
            icon="person_add"
            onClick={() => setContacts((p) => [...p, { ...BLANK_CONTACT }])}
            style={{ marginLeft: 'auto', height: 28, fontSize: 12 }}
          >
            Add contact
          </Button>
        </div>

        {!contacts.length && (
          <div style={{ fontSize: 12, color: T.inkGhost, padding: '8px 0' }}>
            No contacts yet — add the people you deal with at this account.
          </div>
        )}

        {contacts.map((ct, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${T.border}`, borderRadius: 10, padding: 10,
              marginBottom: 8, background: T.surfaceAlt,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.inkMuted }}>Contact {i + 1}</span>
              <Button
                variant="ghost"
                icon="delete"
                title="Remove contact"
                aria-label="Remove contact"
                onClick={() => setContacts((p) => p.filter((_, idx) => idx !== i))}
                style={{ marginLeft: 'auto', height: 26, width: 26, padding: 0, minWidth: 26 }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
              <Field label="Name">
                <Input value={ct.name || ''} onChange={(e) => setContact(i, 'name', e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Role">
                <Input value={ct.role || ''} onChange={(e) => setContact(i, 'role', e.target.value)} placeholder="e.g. Owner" />
              </Field>
              <Field label="Phone">
                <Input value={ct.phone || ''} onChange={(e) => setContact(i, 'phone', e.target.value)} />
              </Field>
              <Field label="Alternative phone">
                <Input value={ct.altPhone || ''} onChange={(e) => setContact(i, 'altPhone', e.target.value)} />
              </Field>
              <Field label="WhatsApp">
                <Input
                  value={ct.whatsapp || ''}
                  onChange={(e) => setContact(i, 'whatsapp', e.target.value)}
                  placeholder="Blank = use phone"
                />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Email">
                  <Input
                    type="email"
                    value={ct.email || ''}
                    onChange={(e) => setContact(i, 'email', e.target.value)}
                    placeholder="name@company.com"
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/** True when this account carries listing-sourced storefront detail. */
function hasStorefront(cl: Client): boolean {
  return Boolean(
    cl.phone || cl.address || cl.pincode || cl.website ||
    cl.rating != null || cl.mapsUrl || Object.keys(cl.hours || {}).length,
  );
}

export function ClientDetailBody({
  clientId,
  compact = false,
  showClose = false,
  onClose,
  onExpand,
  onSaved,
}: {
  clientId: string | null;
  compact?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
  /** Called after a successful edit so the list behind can refresh. */
  onSaved?: () => void;
}) {
  const { go, caps, words } = useDesk();
  const c = caps();
  const w = words();

  const load = useLoad(async () => (clientId ? deskApi.client(clientId) : null), [clientId]);
  const reqs = useLoad(() => deskApi.requisitions(), []);
  const [editOpen, setEditOpen] = useState(false);
  //: Editing client accounts is the same capability that governs requisitions.
  const canEdit = c.reqs === 'all';

  if (!clientId) {
    return <Card><EmptyState icon="apartment" title="Nothing selected" body={`Pick a ${w.client.toLowerCase()}.`} /></Card>;
  }
  if (load.loading && !load.data) return <Card style={{ padding: 14 }}><SkeletonRows rows={5} /></Card>;
  if (load.error && !load.data) return <Card><ErrorState message={load.error} onRetry={load.reload} /></Card>;

  const cl = load.data;
  if (!cl) {
    return (
      <Card>
        <EmptyState icon="apartment" title="Account unavailable" body="Could not load this client. Try again or pick another." />
      </Card>
    );
  }

  const clientReqs = (reqs.data || []).filter((r) => r.clientId === cl.id);
  const h = HEALTH[cl.health] || HEALTH.good;
  const hours = DAYS.filter(([k]) => (cl.hours || {})[k]);
  const wa = waNumber(cl);
  const map = mapsHref(cl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: compact ? 10 : 14, flexWrap: 'wrap' }}>
        <Avatar name={cl.name} id={cl.id} size={compact ? 38 : 48} square />
        <div style={{ flex: 1, minWidth: 160 }}>
          <h2 style={{ margin: 0, fontSize: compact ? 16 : 22, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.25 }}>
            {cl.name}
          </h2>
          <div style={{ marginTop: 3, fontSize: 12.5, color: T.inkMuted }}>
            {[cl.industry, cl.location].filter(Boolean).join(' · ') || '—'}
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge label={h.label} bg={h.bg} fg={h.fg} />
            {cl.rating != null && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
                <Icon name="star" size={13} color={T.amber} />
                <span className="mono" style={{ fontWeight: 700 }}>{cl.rating.toFixed(1)}</span>
                {cl.reviewsCount != null && (
                  <span style={{ color: T.inkMuted }}>({num(cl.reviewsCount)})</span>
                )}
              </span>
            )}
            <Badge
              label={cl.isClient ? 'Client' : 'Prospect'}
              bg={cl.isClient ? T.indigoTint : T.fill}
              fg={cl.isClient ? T.indigoInk : T.inkMuted}
            />
            {cl.source && (
              <span style={{ fontSize: 11, color: T.inkFaint }}>via {cl.source}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {canEdit && (
            <Button
              variant="ghost"
              icon="edit"
              title="Edit client"
              aria-label="Edit client"
              onClick={() => setEditOpen(true)}
              style={{ height: 30, width: 30, padding: 0, minWidth: 30 }}
            />
          )}
          {onExpand && (
            <Button
              variant="ghost"
              icon="open_in_full"
              title="Open full screen"
              aria-label="Open full screen"
              onClick={onExpand}
              style={{ height: 30, width: 30, padding: 0, minWidth: 30 }}
            />
          )}
          {showClose && onClose && (
            <Button
              variant="ghost"
              icon="close"
              title="Close"
              aria-label="Close"
              onClick={onClose}
              style={{ height: 30, width: 30, padding: 0, minWidth: 30 }}
            />
          )}
          {!compact && (
            <Button variant="ghost" icon="send" onClick={() => go('subs', { clientId: cl.id })}>
              Submissions
            </Button>
          )}
        </div>
      </div>

      {/* quick actions — call / WhatsApp / site / map */}
      {(cl.phone || wa || cl.website || map) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cl.phone && (
            <Button icon="call" onClick={() => { window.location.href = `tel:${cl.phone}`; }} style={{ height: 30 }}>
              Call
            </Button>
          )}
          {wa && (
            <Button
              variant="ghost"
              icon="chat"
              title={`WhatsApp ${wa}`}
              onClick={() => openWhatsApp(wa, cl.name)}
              style={{ height: 30, color: '#25D366' }}
            >
              WhatsApp
            </Button>
          )}
          {cl.website && (
            <Button
              variant="ghost"
              icon="language"
              onClick={() => window.open(cl.website as string, '_blank', 'noopener,noreferrer')}
              style={{ height: 30 }}
            >
              Website
            </Button>
          )}
          {map && (
            <Button
              variant="ghost"
              icon="place"
              title={cl.mapsUrl ? 'Open the listing on Google Maps' : 'Search Google Maps for this address'}
              onClick={() => window.open(map, '_blank', 'noopener,noreferrer')}
              style={{ height: 30 }}
            >
              Map
            </Button>
          )}
        </div>
      )}

      {/* pipeline stats */}
      <div
        className={compact ? undefined : 'grid-auto'}
        style={compact
          ? { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }
          : undefined}
      >
        <Stat label="Open job orders" value={num(cl.openRequisitions)} icon="work" color={T.indigo} tint={T.indigoTint} />
        <Stat label="Submissions" value={num(cl.submissions)} icon="send" color={T.blue} tint={T.blueTint} />
        <Stat label="Placements" value={num(cl.placements)} icon="check_circle" color={T.green} tint={T.greenTint} />
        {c.rates && (
          <Stat
            label="Margin"
            value={cl.marginPct ? `${cl.marginPct}%` : '—'}
            sub={cl.marginPct ? '' : 'not recorded'}
            icon="percent"
            color={T.teal}
            tint={T.tealTint}
          />
        )}
      </div>

      {/* storefront detail — only for accounts that have it */}
      {hasStorefront(cl) && (
        <Panel title="Business details" subtitle={cl.source ? `from ${cl.source}` : undefined}>
          <div style={{ padding: '10px 14px 14px' }}>
            <FactGrid
              columns={compact ? 1 : 2}
              facts={[
                ['Phone', cl.phone ? <span className="mono">{cl.phone}</span> : ''],
                ['WhatsApp', wa ? <span className="mono">{wa}</span> : ''],
                ['Category', cl.industry || ''],
                ['Area', cl.location || ''],
                ['Pincode', cl.pincode ? <span className="mono">{cl.pincode}</span> : ''],
                ['Rating', cl.rating != null
                  ? `${cl.rating.toFixed(1)}${cl.reviewsCount != null ? ` · ${num(cl.reviewsCount)} reviews` : ''}`
                  : ''],
                ['Website', cl.website
                  ? (
                    <a
                      href={cl.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ color: T.indigo, textDecoration: 'none' }}
                    >
                      {cl.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )
                  : ''],
              ]}
            />
            {cl.address && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 600 }}>Address</div>
                <div style={{ marginTop: 2, fontSize: 12.5, lineHeight: 1.5 }}>{cl.address}</div>
              </div>
            )}
            {!!hours.length && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 600, marginBottom: 4 }}>Opening hours</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 10px', fontSize: 12 }}>
                  {hours.map(([key, label]) => (
                    <React.Fragment key={key}>
                      <span style={{ color: T.inkMuted }}>{label}</span>
                      <span>{(cl.hours || {})[key]}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            {!!(cl.tags || []).length && (
              <div style={{ marginTop: 12, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {(cl.tags || []).map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 10.5, padding: '2px 7px', borderRadius: 99,
                      background: T.fill, color: T.inkMuted, fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {cl.notes && (
              <div style={{ marginTop: 12, fontSize: 12.5, color: T.inkBody, lineHeight: 1.55 }}>{cl.notes}</div>
            )}
          </div>
        </Panel>
      )}

      {c.rates && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="lock" size={16} color={T.amber} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>Contract · role-gated</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 12.5, color: cl.terms ? T.inkBody : T.inkGhost, lineHeight: 1.55 }}>
            {cl.terms || 'No contract terms recorded yet.'}
          </div>
        </Card>
      )}

      <Panel
        title="Contacts"
        subtitle={(cl.contacts || []).length ? `${(cl.contacts || []).length} recorded` : undefined}
        action={canEdit ? (
          <Button variant="ghost" icon="person_add" onClick={() => setEditOpen(true)} style={{ height: 28, fontSize: 12 }}>
            Add
          </Button>
        ) : undefined}
      >
        {(cl.contacts || []).map((p, i) => (
          <div key={i} className="row">
            <Avatar name={p.name} id={p.name || String(i)} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: T.inkMuted }}>
                {[p.role, p.phone].filter(Boolean).join(' · ')}
                {p.altPhone ? ` · alt ${p.altPhone}` : ''}
                {p.whatsapp && p.whatsapp !== p.phone ? ` · wa ${p.whatsapp}` : ''}
              </div>
              {p.email && (
                <a
                  href={`mailto:${p.email}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 11, color: T.indigo, textDecoration: 'none' }}
                >
                  {p.email}
                </a>
              )}
            </div>
            {waNumber(p) && (
              <Button
                variant="ghost"
                icon="chat"
                title={`WhatsApp ${waNumber(p)}`}
                aria-label="WhatsApp"
                onClick={() => openWhatsApp(waNumber(p), p.name)}
                style={{ height: 30, width: 30, padding: 0, minWidth: 30, color: '#25D366' }}
              />
            )}
            {p.email && (
              <Button
                variant="ghost"
                icon="mail"
                title={`Email ${p.email}`}
                aria-label="Email"
                onClick={() => { window.location.href = `mailto:${p.email}`; }}
                style={{ height: 30, width: 30, padding: 0, minWidth: 30 }}
              />
            )}
            {p.phone && (
              <Button variant="ghost" icon="call" onClick={() => { window.location.href = `tel:${p.phone}`; }}>Call</Button>
            )}
          </div>
        ))}
        {!(cl.contacts || []).length && (
          <EmptyState
            icon="contacts"
            title="No contacts recorded"
            body={canEdit ? 'Use Add to record the people you deal with here.' : 'Add the people you deal with at this account.'}
          />
        )}
      </Panel>

      <Panel title="Job orders" subtitle={`${clientReqs.length} linked`}>
        {clientReqs.map((r) => (
          <div key={r.id} className="row row-click" onClick={() => go('job', { requisitionId: r.id })}>
            <Icon name="work" size={18} color={T.indigo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: T.inkMuted }}>{num(r.pipelineTotal)} in pipeline</div>
            </div>
            <Badge label={r.priority} bg={T.fill} fg={T.inkMuted} />
          </div>
        ))}
        {!clientReqs.length && (
          <EmptyState
            icon="work"
            title="No job orders linked"
            body={`Link a ${w.req.toLowerCase()} to this account from its detail screen.`}
          />
        )}
      </Panel>

      {editOpen && canEdit && (
        <ClientEditModal
          client={cl}
          onClose={() => setEditOpen(false)}
          onSaved={() => { load.reload(); onSaved?.(); }}
        />
      )}
    </div>
  );
}
