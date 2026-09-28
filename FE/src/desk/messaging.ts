/**
 * Phone, WhatsApp, SMS, email and map helpers, shared by Candidates and Clients.
 *
 * These used to live inside the Candidates screen. Clients need the same
 * behaviour — particularly the DNC block, which must not diverge between the
 * two screens — so they live here and both import them.
 */

export function phoneDigits(phone?: string | null) {
  return (phone || '').replace(/\D/g, '');
}

/** Normalize to a dialable digit string (strip leading 0). */
export function normalizePhoneDigits(phone?: string | null) {
  let d = phoneDigits(phone);
  if (d.startsWith('0') && d.length >= 11) d = d.replace(/^0+/, '');
  return d;
}

/**
 * Heuristic: Indian mobiles (6–9 + 9 digits) are WhatsApp-eligible in our market.
 * We cannot query Meta for registration; this avoids landlines / junk numbers.
 */
export function isLikelyWhatsAppMobile(phone?: string | null): boolean {
  const d = normalizePhoneDigits(phone);
  if (/^[6-9]\d{9}$/.test(d)) return true;
  if (/^91[6-9]\d{9}$/.test(d)) return true;
  return false;
}

export type MsgChannel = 'whatsapp' | 'sms' | 'email' | 'none' | 'blocked';

export function messagingChannel(opts: {
  phone?: string | null;
  email?: string | null;
  dnc?: boolean | null;
}): MsgChannel {
  if (opts.dnc) return 'blocked';
  if (isLikelyWhatsAppMobile(opts.phone)) return 'whatsapp';
  const d = normalizePhoneDigits(opts.phone);
  if (d.length >= 10) return 'sms';
  const em = (opts.email || '').trim();
  if (em.includes('@')) return 'email';
  return 'none';
}

/** `tel:` target: 10-digit Indian mobiles dial as-is, 91-prefixed ones get their +. */
export function telHref(phone?: string | null) {
  const d = normalizePhoneDigits(phone);
  return `tel:${d.length === 12 && d.startsWith('91') ? `+${d}` : d}`;
}

export function hasCallablePhone(phone?: string | null) {
  return normalizePhoneDigits(phone).length >= 10;
}

/** Open WhatsApp (Indian 10-digit → 91 prefix). */
export function openWhatsApp(phone?: string | null, name?: string | null, message?: string) {
  if (!isLikelyWhatsAppMobile(phone)) return;
  let d = normalizePhoneDigits(phone);
  if (/^[6-9]\d{9}$/.test(d)) d = `91${d}`;
  const text = encodeURIComponent(message || (name ? `Hi ${name}` : 'Hi'));
  window.open(`https://wa.me/${d}?text=${text}`, '_blank', 'noopener');
}

export function openSms(phone?: string | null, name?: string | null) {
  const d = normalizePhoneDigits(phone);
  if (d.length < 10) return;
  const body = encodeURIComponent(name ? `Hi ${name}` : 'Hi');
  window.open(`sms:${d}?body=${body}`, '_self');
}

export function openEmail(email?: string | null, name?: string | null) {
  const em = (email || '').trim();
  if (!em.includes('@')) return;
  const subject = encodeURIComponent('Hello');
  const body = encodeURIComponent(name ? `Hi ${name},` : 'Hi,');
  window.open(`mailto:${em}?subject=${subject}&body=${body}`, '_self');
}

/**
 * A map link for an account.
 *
 * Listing imports only sometimes carry a real Maps URL, and only the pet-store
 * batch has coordinates. Everything else falls back to a Maps search built from
 * whatever place text we do have, so every client still has a working Map
 * action rather than a dead button.
 */
export function mapsHref(place: {
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
  address?: string | null;
  location?: string | null;
}): string | null {
  if (place.mapsUrl) return place.mapsUrl;
  if (place.latitude != null && place.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }
  const q = [place.name, place.address, place.location].filter(Boolean).join(', ').trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
