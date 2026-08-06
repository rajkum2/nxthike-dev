/**
 * TalentDialer design tokens, lifted verbatim from the Claude Design spec
 * (`TalentDialer Web.dc.html`). Every literal here appears in that file — keep
 * them in sync rather than inventing new values.
 */

export const T = {
  // Surfaces
  appBg: '#F3F2F8',
  surface: '#FFFFFF',
  surfaceAlt: '#FBFAFD',
  fill: '#F1F0F7',
  fillHover: '#E9E7F2',
  track: '#F0EFF6',
  rowHover: '#FAFAFD',

  // Lines
  border: '#E9E7F2',
  borderStrong: '#D8D6E2',
  borderInput: '#C7C5D0',
  divider: '#EDEBF3',
  dividerFaint: '#F3F2F8',
  headBorder: '#E3E1EC',

  // Ink
  ink: '#1A1A22',
  inkBody: '#3A3846',
  inkMuted: '#5A5866',
  inkFaint: '#8B8996',
  inkGhost: '#B7B5C2',

  // Brand
  indigo: '#4B45C9',
  indigoHover: '#3A34AD',
  indigoInk: '#2A2585',
  indigoTint: '#EDEBFA',
  indigoTintSoft: '#F4F3FE',
  indigoPill: '#DFDCFB',
  indigoEdge: '#C6C1F5',
  disabled: '#E6E4F0',
  disabledInk: '#8B8996',

  // Rail (dark)
  rail: '#15141C',
  railInk: '#EDECF4',
  railMuted: '#B4B1C6',
  railFaint: '#807D96',
  railDim: '#6B678A',
  railHover: '#262332',
  railActive: '#312C63',
  railField: '#221F2E',
  railBorder: '#2A2836',
  railEdge: '#35314A',

  // Semantic pairs
  green: '#1F7A3D', greenTint: '#E4F4E9',
  mint: '#2B7A4B', mintTint: '#E6F4EB',
  teal: '#0F7A72', tealTint: '#E3F4F1', tealInk: '#0B4F49', tealBorder: '#BFE4DD',
  blue: '#1D5FBF', blueTint: '#E5EDFA',
  purple: '#6E3AAF', purpleTint: '#EEE4FA',
  amber: '#A66A00', amberTint: '#FBF0DC', amberInk: '#8A5A00',
  amberSurface: '#FFF9EC', amberBorder: '#F2DCB0', amberDeep: '#6B5220',
  red: '#B3261E', redTint: '#FCE8E6',
  maroon: '#8C1D18', maroonTint: '#FBE3E1', maroonBorder: '#F3C6C1', maroonInk: '#7A1F19',
  orange: '#B85C00', orangeTint: '#FCEEDD',
  rust: '#B34A00', rustTint: '#FBEBE0',
  clay: '#8A5A57', clayTint: '#F5EBEA',
  slate: '#4A5A6B', slateTint: '#E7ECF1',
  neutral: '#6B6975', neutralTint: '#F1F0F4',
} as const;

/** Deterministic avatar palette — the spec's `AV`. */
export const AVATARS = [
  '#4B45C9', '#0F7A72', '#6E3AAF', '#B85C00',
  '#1D5FBF', '#1F7A3D', '#8C1D18', '#4A5A6B',
];

/** Mirrors the spec's `avOf()` character-sum hash, so colours stay stable. */
export function avatarColor(key: string): string {
  if (!key) return AVATARS[0];
  let sum = 0;
  for (let i = 0; i < key.length; i += 1) sum += key.charCodeAt(i);
  return AVATARS[sum % AVATARS.length];
}

/** Two-letter initials — the spec's `ini()`. */
export function initials(name?: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const a = parts[0][0];
  const b = parts[1]?.[0];
  return (b ? `${a}${b}` : a).toUpperCase();
}

/* ------------------------------------------------------------------ *
 *  Domain vocabulary                                                 *
 * ------------------------------------------------------------------ */

export interface Disposition {
  id: string;
  label: string;
  category: 'Reached' | 'Not reached' | 'Data issue' | 'Compliance';
  color: string;
  tint: string;
  icon: string;
  next: string;
}

/** Ids are the backend's `CALL_DISPOSITIONS` verbatim. */
export const DISPOSITIONS: Disposition[] = [
  { id: 'connected_interested', label: 'Interested', category: 'Reached', color: T.green, tint: T.greenTint, icon: 'thumb_up', next: 'Move stage to Screening, schedule a follow-up' },
  { id: 'connected_callback', label: 'Callback', category: 'Reached', color: T.teal, tint: T.tealTint, icon: 'history', next: 'Schedule a callback inside the calling window' },
  { id: 'connected_not_interested', label: 'Not interested', category: 'Reached', color: T.orange, tint: T.orangeTint, icon: 'thumb_down', next: 'Remove from queue, record the reason' },
  { id: 'screening_passed', label: 'Screening passed', category: 'Reached', color: T.mint, tint: T.mintTint, icon: 'check_circle', next: 'Move to Submitted, prepare the client submission' },
  { id: 'screening_failed', label: 'Screening failed', category: 'Reached', color: T.red, tint: T.redTint, icon: 'cancel', next: 'Reject with a structured reason' },
  { id: 'no_answer', label: 'No answer', category: 'Not reached', color: T.neutral, tint: T.neutralTint, icon: 'phone_missed', next: 'Retry per cadence' },
  { id: 'busy', label: 'Busy', category: 'Not reached', color: T.amber, tint: T.amberTint, icon: 'phone_paused', next: 'Retry in 1–2 hours' },
  { id: 'voicemail', label: 'Voicemail', category: 'Not reached', color: T.blue, tint: T.blueTint, icon: 'voicemail', next: 'Send a WhatsApp follow-up, then retry' },
  { id: 'wrong_number', label: 'Wrong number', category: 'Data issue', color: T.rust, tint: T.rustTint, icon: 'wrong_location', next: 'Flag the record for data cleanup' },
  { id: 'not_reachable', label: 'Not reachable', category: 'Data issue', color: T.clay, tint: T.clayTint, icon: 'signal_disconnected', next: 'Verify the number or archive the record' },
  { id: 'do_not_call', label: 'Do not call', category: 'Compliance', color: T.maroon, tint: T.maroonTint, icon: 'block', next: 'Lock the number, remove from every queue' },
];

export const NEVER_CALLED: Disposition = {
  id: '', label: 'Never called', category: 'Not reached',
  color: T.neutral, tint: T.neutralTint, icon: 'phone_disabled', next: '',
};

export function disposition(id?: string | null): Disposition {
  return DISPOSITIONS.find((d) => d.id === id) || NEVER_CALLED;
}

export interface Stage {
  id: string;
  label: string;
  color: string;
  tint: string;
}

/** `id` is the backend `Candidate.status`; `label` is the recruiting word. */
export const STAGES: Stage[] = [
  { id: 'new', label: 'Sourced', color: T.slate, tint: T.slateTint },
  { id: 'reviewing', label: 'Screening', color: T.amber, tint: T.amberTint },
  { id: 'shortlisted', label: 'Submitted', color: T.blue, tint: T.blueTint },
  { id: 'interview', label: 'Interview', color: T.purple, tint: T.purpleTint },
  { id: 'offer', label: 'Offer', color: T.teal, tint: T.tealTint },
  { id: 'hired', label: 'Hired', color: T.green, tint: T.greenTint },
  { id: 'rejected', label: 'Dropped', color: T.red, tint: T.redTint },
];

export const ON_HOLD: Stage = { id: 'on_hold', label: 'On hold', color: T.neutral, tint: T.neutralTint };

export function stage(id?: string | null): Stage {
  return STAGES.find((s) => s.id === id) || (id === 'on_hold' ? ON_HOLD : STAGES[0]);
}

export const DROP_REASONS = [
  'Offer dropped', 'Ghosted', 'Counter-offer accepted', 'Comp mismatch',
  'Notice too long', 'Failed screening', 'Position closed',
];
