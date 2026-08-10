/**
 * The TalentDialer UI kit.
 *
 * Small, unopinionated pieces that the 40-odd screens compose from. Sizes and
 * colours come from `tokens.ts`, which mirrors the design spec exactly.
 */

import React, { useEffect, useRef, useState } from 'react';
import { T, avatarColor, initials } from './tokens';

/* ------------------------------------------------------------------ *
 *  Icon                                                              *
 * ------------------------------------------------------------------ */

export function Icon({
  name, size = 20, color, className = '', title,
}: { name: string; size?: number; color?: string; className?: string; title?: string }) {
  return (
    <span
      // Below ~15px the light stroke starts to disappear, so small glyphs take
      // a slightly heavier weight to stay readable.
      className={`sym${size <= 15 ? ' sym-sm' : ''} ${className}`}
      style={{
        fontSize: size,
        color,
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        lineHeight: 1,
      }}
      title={title}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    >
      {name}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Identity                                                          *
 * ------------------------------------------------------------------ */

export function Avatar({
  name, id, size = 34, square = false,
}: { name?: string | null; id: string; size?: number; square?: boolean }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: square ? Math.round(size / 3.6) : 999,
        background: avatarColor(id), color: '#fff', display: 'grid', placeItems: 'center',
        fontSize: Math.max(9, Math.round(size * 0.35)), fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Badges & chips                                                    *
 * ------------------------------------------------------------------ */

export function Badge({
  label, bg, fg, icon,
}: { label: string; bg: string; fg: string; icon?: string }) {
  return (
    <span className="badge" style={{ background: bg, color: fg }}>
      {icon && <Icon name={icon} size={13} color={fg} />}
      {label}
    </span>
  );
}

export function Chip({
  label, on, onClick, icon, accent = T.indigo, disabled,
}: {
  label: string; on?: boolean; onClick?: () => void; icon?: string;
  accent?: string; disabled?: boolean;
}) {
  return (
    <button
      className="chip"
      onClick={onClick}
      disabled={disabled}
      style={
        on
          ? { borderColor: accent, background: `${accent}14`, color: accent === T.indigo ? T.indigoInk : accent }
          : { opacity: disabled ? 0.5 : 1 }
      }
    >
      {icon && <Icon name={icon} size={16} />}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 *  Buttons                                                           *
 * ------------------------------------------------------------------ */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  /**
   * Semantic colour for an outline button, applied to the glyph and border
   * rather than as a fill. Lets a destructive or brand action stay legible in
   * a row of icon buttons without shouting over its neighbours.
   */
  tone?: 'brand' | 'danger' | 'success';
  /** Compact control size (28px) for dense toolbars and detail panes. */
  size?: 'md' | 'sm';
};

export function Button({
  icon, variant = 'primary', tone, size = 'md', children, className = '', ...rest
}: BtnProps) {
  // Treat as icon-only when there is no visible label (undefined / null / empty).
  const hasLabel = (() => {
    if (children == null || children === false || children === true) return false;
    if (typeof children === 'string') return children.trim().length > 0;
    if (Array.isArray(children)) return children.some((c) => c != null && c !== false && c !== '');
    return true;
  })();
  const iconOnly = Boolean(icon) && !hasLabel;
  const iconPx = size === 'sm' ? 15 : 18;
  return (
    <button
      className={`btn btn-${variant}${tone ? ` tone-${tone}` : ''}${iconOnly ? ' btn-icon-only' : ''}${size === 'sm' ? ' btn-sm' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconPx} />}
      {hasLabel ? children : null}
    </button>
  );
}

export function IconButton({
  name, onClick, title, size = 20, badge,
}: { name: string; onClick?: () => void; title?: string; size?: number; badge?: boolean }) {
  return (
    <button className="icon-btn" onClick={onClick} title={title} aria-label={title}>
      <Icon name={name} size={size} />
      {badge && (
        <span style={{
          position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: 99,
          background: T.red, border: `1.5px solid ${T.fill}`,
        }}
        />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 *  Form controls                                                     *
 * ------------------------------------------------------------------ */

export function Field({
  label, hint, children,
}: { label?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && <div style={{ marginTop: 5, fontSize: 11, color: T.inkFaint }}>{hint}</div>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className || ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field ${props.className || ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`field ${props.className || ''}`} />;
}

export function Switch({
  on, onChange, label,
}: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      className="switch"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{ background: on ? T.indigo : '#C7C5D0', justifyContent: on ? 'flex-end' : 'flex-start' }}
    >
      <span className="switch-knob" />
    </button>
  );
}

export function ToggleRow({
  label, on, onChange, last,
}: { label: string; on: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: last ? 'none' : `1px solid ${T.dividerFaint}`, gap: 12,
    }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</span>
      <Switch on={on} onChange={onChange} label={label} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Surfaces                                                          *
 * ------------------------------------------------------------------ */

export function Card({
  children, pad = 12, className = '', onClick, style,
}: {
  children: React.ReactNode; pad?: number; className?: string;
  onClick?: () => void; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`card ${onClick ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{ padding: pad, cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      {children}
    </div>
  );
}

export function Panel({
  title, subtitle, action, children,
}: {
  title: string; subtitle?: string;
  action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ marginTop: 2, fontSize: 11.5, color: T.inkFaint }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Banner({
  icon, tone = 'info', children, action,
}: {
  icon: string;
  tone?: 'info' | 'warn' | 'danger' | 'success';
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const tones = {
    info: { bg: T.tealTint, border: T.tealBorder, fg: T.tealInk, icon: T.teal },
    warn: { bg: T.amberSurface, border: T.amberBorder, fg: T.amberDeep, icon: T.amber },
    danger: { bg: T.maroonTint, border: T.maroonBorder, fg: T.maroonInk, icon: T.maroon },
    success: { bg: T.greenTint, border: T.greenTint, fg: T.green, icon: T.green },
  }[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: tones.bg, border: `1px solid ${tones.border}`, borderRadius: 12,
    }}
    >
      <Icon name={icon} size={17} color={tones.icon} />
      <div style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: tones.fg, lineHeight: 1.5 }}>{children}</div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Data display                                                      *
 * ------------------------------------------------------------------ */

export function Stat({
  label, value, sub, icon, color = T.ink, tint = T.fill, onClick,
}: {
  label: string; value: string; sub?: string; icon?: string;
  color?: string; tint?: string; onClick?: () => void;
}) {
  return (
    <Card onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 12, color: T.inkMuted, fontWeight: 600 }}>{label}</span>
        {icon && (
          <span style={{ width: 28, height: 28, borderRadius: 8, background: tint, display: 'grid', placeItems: 'center' }}>
            <Icon name={icon} size={16} color={color} />
          </span>
        )}
      </div>
      <div className="mono" style={{ marginTop: 12, fontSize: 30, fontWeight: 500, lineHeight: 1, color }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 7, fontSize: 11.5, color: T.inkFaint }}>{sub}</div>}
    </Card>
  );
}

export function Meter({ value, color = T.indigo, height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="meter" style={{ height }}>
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
    </div>
  );
}

export function Eyebrow({ children, color = T.inkFaint }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="mono" style={{ fontSize: 9, letterSpacing: '.13em', color, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

export function FactGrid({
  facts, columns = 2,
}: { facts: [string, React.ReactNode][]; columns?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: '8px 12px' }}>
      {facts.map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 600 }}>{k}</div>
          <div style={{ marginTop: 2, fontSize: 12.5, fontWeight: 600, wordBreak: 'break-word' }}>
            {v === '' || v === null || v === undefined ? <span style={{ color: T.inkGhost }}>—</span> : v}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  States                                                            *
 * ------------------------------------------------------------------ */

export function Skeleton({ rows = 4, height = 96 }: { rows?: number; height?: number }) {
  return (
    <div className="grid-auto">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sk" style={{ height, background: '#EAE8F2', borderRadius: 14 }} />
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card sk" style={{ height: 58, display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 99, background: '#EAE8F2' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, width: '55%', background: '#EAE8F2', borderRadius: 4 }} />
            <div style={{ height: 8, width: '78%', background: T.track, borderRadius: 4, marginTop: 7 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon, title, body, actionLabel, onAction, tone = 'neutral',
}: {
  icon: string; title: string; body: string;
  actionLabel?: string; onAction?: () => void;
  tone?: 'neutral' | 'danger' | 'success';
}) {
  const tint = tone === 'danger' ? T.redTint : tone === 'success' ? T.greenTint : T.fill;
  const fg = tone === 'danger' ? T.red : tone === 'success' ? T.green : T.inkFaint;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '56px 32px', textAlign: 'center',
    }}
    >
      <div style={{ width: 62, height: 62, borderRadius: 20, background: tint, display: 'grid', placeItems: 'center' }}>
        <Icon name={icon} size={30} color={fg} />
      </div>
      <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 12.5, color: T.inkMuted, lineHeight: 1.55, maxWidth: 420 }}>{body}</div>
      {actionLabel && onAction && (
        <Button onClick={onAction} style={{ marginTop: 18, height: 40 }}>{actionLabel}</Button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="error"
      title="Something went wrong"
      body={message}
      tone="danger"
      actionLabel={onRetry ? 'Retry' : undefined}
      onAction={onRetry}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Overlays                                                          *
 * ------------------------------------------------------------------ */

export function Modal({
  title, subtitle, onClose, children, footer, width = 560,
}: {
  title: string; subtitle?: string; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode; width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: `min(${width}px, calc(100vw - 32px))`,
          left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        }}
      >
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
              {subtitle && <div style={{ marginTop: 2, fontSize: 12, color: T.inkMuted }}>{subtitle}</div>}
            </div>
            <IconButton name="close" onClick={onClose} title="Close" size={18} />
          </div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  );
}

/** ⌘K command palette. */
export function CommandPalette({
  items, onClose,
}: {
  items: { id: string; label: string; group: string; icon: string; run: () => void }[];
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase().trim()));

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setCursor(0); }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const hit = filtered[cursor];
        if (hit) { hit.run(); onClose(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, cursor, onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{ width: 'min(560px, calc(100vw - 32px))', left: '50%', top: 90, transform: 'translateX(-50%)' }}
      >
        <div style={{ padding: 14, borderBottom: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="search" size={19} color={T.inkMuted} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a screen…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
          />
          <span className="mono" style={{ fontSize: 10, color: T.inkGhost, border: `1px solid ${T.borderStrong}`, borderRadius: 4, padding: '1px 5px' }}>ESC</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: 6 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 12.5, color: T.inkFaint }}>
              Nothing matches “{q}”.
            </div>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onMouseEnter={() => setCursor(i)}
              onClick={() => { item.run(); onClose(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                borderRadius: 9, background: i === cursor ? T.indigoTint : 'transparent', textAlign: 'left',
              }}
            >
              <Icon name={item.icon} size={18} color={i === cursor ? T.indigo : T.inkMuted} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: i === cursor ? 700 : 500 }}>{item.label}</span>
              <span className="mono" style={{ fontSize: 9.5, color: T.inkFaint, letterSpacing: '.08em' }}>{item.group}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Misc                                                              *
 * ------------------------------------------------------------------ */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/** "Today 10:42" · "Yest 17:30" · "28 Jul 11:05" */
export function whenLabel(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (sameDay) return `Today ${time}`;
  if (d.toDateString() === yest.toDateString()) return `Yest ${time}`;
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${time}`;
}

export function shortDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
}

export function duration(seconds?: number | null): string {
  if (seconds === null || seconds === undefined || seconds < 0) return '—';
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export const num = (n: number) => n.toLocaleString('en-IN');

export function pct(a: number, b: number): string {
  return b <= 0 ? '0%' : `${Math.round((a / b) * 100)}%`;
}

export function splitList(raw?: string | null): string[] {
  return (raw || '')
    .split(/[,;\n|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}

export function maskPhone(p?: string | null) {
  if (!p) return '—';
  return `••••• ••${p.trim().slice(-3)}`;
}

export function maskEmail(e?: string | null) {
  if (!e || !e.includes('@')) return e || '—';
  const [local, domain] = e.split('@');
  const dot = domain.lastIndexOf('.');
  return `${local[0]}•••••••@•••••${dot >= 0 ? domain.slice(dot) : ''}`;
}

/* ------------------------------------------------------------------ *
 *  Data loading                                                      *
 * ------------------------------------------------------------------ */

export interface Loaded<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Runs an async loader and tracks its state. `deps` behaves like useEffect's.
 * A superseded request is discarded, so fast navigation cannot land stale data.
 */
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[] = []): Loaded<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const live = useRef(0);

  useEffect(() => {
    const ticket = ++live.current;
    setLoading(true);
    setError(null);
    loader()
      .then((res) => { if (ticket === live.current) { setData(res); setLoading(false); } })
      .catch((e: Error) => { if (ticket === live.current) { setError(e.message); setLoading(false); } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}

/** Settles several promises, keeping nulls for the ones that failed. */
export async function allSettledish<T extends readonly Promise<unknown>[]>(promises: T) {
  const out = await Promise.allSettled(promises);
  return out.map((r) => (r.status === 'fulfilled' ? r.value : null));
}
