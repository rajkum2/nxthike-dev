/**
 * The workspace chrome: dark rail, top bar, mobile drawer and ⌘K palette.
 *
 * Navigation is filtered by the capability list the server returned, so a
 * Sourcer never sees Clients and a Panellist never sees the call console.
 */

import React, { useEffect, useState } from 'react';
import { deskApi } from './api';
import { T } from './tokens';
import { NAV, SCREENS, useDesk, type ScreenKey } from './store';
import { Avatar, CommandPalette, Icon, IconButton, useLoad, useMediaQuery } from './ui';

/* ------------------------------------------------------------------ *
 *  Rail                                                              *
 * ------------------------------------------------------------------ */

function RailContent({ wide, onNavigate }: { wide: boolean; onNavigate?: () => void }) {
  const {
    screen, session, allowed, go, setPalette, openModal, toggleRail,
    candidateRoleId,
  } = useDesk();
  const badges: Partial<Record<ScreenKey, number>> = {};
  const [candsOpen, setCandsOpen] = useState(true);
  const canSeeCands = !!session?.nav?.includes('cands');
  const rolesLoad = useLoad(
    () => (canSeeCands
      ? deskApi.hiringDashboard().then((d) => d.roles || [])
      : Promise.resolve([] as { id: string; name: string; count: number }[])),
    [session?.userId, canSeeCands],
  );
  const roles = rolesLoad.data || [];

  // Keep the Candidates role tree open while that area is active.
  useEffect(() => {
    if (screen === 'cands' || screen === 'addcand' || screen === 'merge' || screen === 'resume') {
      setCandsOpen(true);
    }
  }, [screen]);

  return (
    <>
      <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: T.indigo,
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}
        >
          <Icon name="phone_in_talk" size={19} color="#fff" />
        </div>
        {wide && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>
              NxtHike
            </div>
            <div className="mono" style={{ fontSize: 9, color: T.railFaint, letterSpacing: '.05em' }}>
              {session?.mode === 'IN_HOUSE' ? 'WORKSPACE · IN-HOUSE' : 'WORKSPACE · AGENCY'}
            </div>
          </div>
        )}
      </div>

      {!wide && (
        <div style={{ padding: '0 10px 10px', flexShrink: 0 }}>
          <button
            onClick={() => setPalette(true)}
            title="Search (⌘K)"
            style={{
              width: '100%', height: 36, borderRadius: 9, background: T.railField,
              display: 'grid', placeItems: 'center',
            }}
          >
            <Icon name="search" size={18} color={T.railFaint} />
          </button>
        </div>
      )}

      {wide && (
        <div style={{ padding: '0 12px 12px', flexShrink: 0 }}>
          <button
            onClick={() => setPalette(true)}
            style={{
              width: '100%', height: 36, borderRadius: 9, background: T.railField,
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px',
            }}
          >
            <Icon name="search" size={17} color={T.railFaint} />
            <span style={{ fontSize: 12, color: T.railFaint, flex: 1, textAlign: 'left' }}>Search</span>
            <span className="mono" style={{
              fontSize: 9.5, color: T.railDim, border: `1px solid ${T.railEdge}`,
              borderRadius: 4, padding: '1px 4px',
            }}
            >
              ⌘K
            </span>
          </button>
        </div>
      )}

      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px' }}>
        {NAV.map((group, gi) => {
          const items = group.items.filter((i) => allowed(i.key));
          if (!items.length) return null;
          return (
            <div
              key={group.name}
              style={{
                marginBottom: 10,
                // Narrow rail has no group headings, so a rule keeps the icon
                // column scannable instead of one undifferentiated stack.
                ...(wide || gi === 0 ? null : {
                  borderTop: `1px solid ${T.railBorder}`, paddingTop: 10,
                }),
              }}
            >
              {wide && (
                <div className="mono" style={{
                  fontSize: 8.5, letterSpacing: '.14em', color: T.railDim, padding: '8px 8px 5px',
                }}
                >
                  {group.name}
                </div>
              )}
              {items.map((item) => {
                const isCands = item.key === 'cands';
                const on = isCands
                  ? (screen === 'cands' || screen === 'addcand' || screen === 'merge' || screen === 'resume')
                    && !candidateRoleId
                  : screen === item.key;
                const candsSectionActive = isCands && (
                  screen === 'cands' || screen === 'addcand' || screen === 'merge' || screen === 'resume'
                );

                return (
                  <div key={item.key}>
                    <button
                      className="rail-item"
                      title={item.label}
                      onClick={() => {
                        if (isCands) {
                          // Parent = all candidates (every role)
                          go('cands', { candidateRoleId: null, candidateId: null });
                          setCandsOpen(true);
                        } else {
                          go(item.key);
                        }
                        onNavigate?.();
                      }}
                      style={{
                        background: on || (isCands && candsSectionActive && !wide) ? T.railActive : 'transparent',
                        justifyContent: wide ? 'flex-start' : 'center',
                      }}
                    >
                      <Icon name={item.icon} size={19} color={(on || (isCands && candsSectionActive)) ? '#fff' : T.railMuted} />
                      {wide && (
                        <>
                          <span style={{
                            fontSize: 12.5, fontWeight: (on || (isCands && candsSectionActive)) ? 700 : 500,
                            color: (on || (isCands && candsSectionActive)) ? '#fff' : T.railMuted,
                            whiteSpace: 'nowrap', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                          }}
                          >
                            {item.label}
                          </span>
                          {isCands && roles.length > 0 && (
                            <span
                              role="button"
                              tabIndex={0}
                              title={candsOpen ? 'Collapse roles' : 'Expand roles'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCandsOpen((v) => !v);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCandsOpen((v) => !v);
                                }
                              }}
                              style={{
                                display: 'grid', placeItems: 'center', width: 22, height: 22,
                                borderRadius: 6, flexShrink: 0,
                              }}
                            >
                              <Icon
                                name={candsOpen ? 'expand_more' : 'chevron_right'}
                                size={18}
                                color={(on || candsSectionActive) ? 'rgba(255,255,255,.85)' : T.railFaint}
                              />
                            </span>
                          )}
                          {badges[item.key] ? (
                            <span className="mono" style={{
                              background: T.indigo, color: '#fff', fontSize: 9,
                              padding: '2px 5px', borderRadius: 5,
                            }}
                            >
                              {badges[item.key]}
                            </span>
                          ) : null}
                        </>
                      )}
                    </button>

                    {/* Hiring-role submenus under Candidates */}
                    {isCands && wide && candsOpen && roles.length > 0 && (
                      <div style={{ margin: '2px 0 6px 0', paddingLeft: 8 }}>
                        {roles.map((role) => {
                          const roleOn = screen === 'cands' && candidateRoleId === role.id;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              title={role.name}
                              onClick={() => {
                                go('cands', { candidateRoleId: role.id, candidateId: null });
                                onNavigate?.();
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 8px 6px 22px',
                                borderRadius: 8,
                                background: roleOn ? 'rgba(75,69,201,.35)' : 'transparent',
                                textAlign: 'left',
                                marginBottom: 1,
                              }}
                            >
                              <Icon
                                name="sell"
                                size={14}
                                color={roleOn ? '#fff' : T.railFaint}
                              />
                              <span style={{
                                fontSize: 11.5,
                                fontWeight: roleOn ? 700 : 500,
                                color: roleOn ? '#fff' : T.railMuted,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flex: 1,
                                minWidth: 0,
                              }}
                              >
                                {role.name}
                              </span>
                              <span className="mono" style={{
                                fontSize: 9.5,
                                color: roleOn ? 'rgba(255,255,255,.75)' : T.railDim,
                                flexShrink: 0,
                              }}
                              >
                                {role.count ?? 0}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div style={{
        padding: 10, borderTop: `1px solid ${T.railBorder}`, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 9,
        flexDirection: wide ? 'row' : 'column',
      }}
      >
        <button onClick={() => openModal('personas')} title={`${session?.name} · ${session?.personaName}`}>
          <Avatar name={session?.name} id={session?.userId || 'me'} size={30} />
        </button>
        {wide ? (
          <>
            <button
              onClick={() => openModal('personas')}
              style={{ minWidth: 0, flex: 1, textAlign: 'left' }}
            >
              <div style={{
                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}
              >
                {session?.name}
              </div>
              <div style={{
                fontSize: 10, color: T.railFaint, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}
              >
                {session?.personaName}
              </div>
            </button>
            <button onClick={() => openModal('personas')} title="Switch persona">
              <Icon name="swap_horiz" size={18} color={T.railFaint} />
            </button>
            <button onClick={toggleRail} title="Collapse sidebar">
              <Icon name="left_panel_close" size={18} color={T.railFaint} />
            </button>
          </>
        ) : (
          // The narrow rail keeps its own way back out, so expanding never
          // depends on finding the control in the top bar.
          !onNavigate && (
            <button onClick={toggleRail} title="Expand sidebar" style={{ padding: 4 }}>
              <Icon name="left_panel_open" size={18} color={T.railFaint} />
            </button>
          )
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Shell                                                             *
 * ------------------------------------------------------------------ */

export function Shell({ children }: { children: React.ReactNode }) {
  const {
    screen, session, railOpen, toggleRail, palette, setPalette,
    drawer, setDrawer, go, allowed,
  } = useDesk();

  const isMobile = useMediaQuery('(max-width: 899px)');

  /*
   * Collapsing narrows the rail to icons rather than removing it. Hiding it
   * outright cost the only always-visible way to move between screens, and
   * left the toggle pointing at nothing.
   *
   * Previously tablet widths forced the rail closed (labels never expanded),
   * so the toggle looked broken. Wide vs icon rail is now purely railOpen.
   */
  const showRail = !isMobile;
  const railWide = showRail && railOpen;
  const railWidth = railWide ? 248 : 68;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(!palette);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [palette, setPalette]);

  const meta = SCREENS[screen];
  const cw = session?.settings.callingWindow;

  const paletteItems = NAV.flatMap((g) =>
    g.items.filter((i) => allowed(i.key)).map((i) => ({
      id: i.key, label: i.label, group: g.name, icon: i.icon, run: () => go(i.key),
    })));

  return (
    <>
      {showRail && (
        <aside
          className={`rail ${railWide ? 'rail-wide' : 'rail-narrow'}`}
          style={{ width: railWidth }}
          aria-label="Workspace navigation"
        >
          <RailContent wide={railWide} />
        </aside>
      )}

      {drawer && isMobile && (
        <>
          <div className="scrim" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="rail drawer rail-wide" aria-label="Workspace navigation">
            <RailContent wide onNavigate={() => setDrawer(false)} />
          </aside>
        </>
      )}

      <div className="stage">
        <header className="topbar">
          {isMobile && (
            <IconButton name="menu" onClick={() => setDrawer(true)} title="Open navigation" />
          )}
          {/* Always offer a top-bar toggle on desktop so collapse/expand is not buried. */}
          {!isMobile && (
            <IconButton
              name={railOpen ? 'left_panel_close' : 'left_panel_open'}
              onClick={toggleRail}
              title={railOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            />
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 15, fontWeight: 700, letterSpacing: '-.01em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
            >
              {meta.name}
            </div>
            {!isMobile && (
              <div className="mono" style={{
                fontSize: 9.5, color: T.inkFaint, letterSpacing: '.03em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
              >
                {meta.id} · {session?.settings.orgName} · {session?.name}
              </div>
            )}
          </div>

          {/* The calling window is a gate, so it is always in sight. */}
          {!isMobile && cw && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              background: cw.isOpen ? T.tealTint : T.redTint,
              border: `1px solid ${cw.isOpen ? T.tealBorder : T.maroonBorder}`,
              borderRadius: 8, padding: '6px 10px',
            }}
            >
              <Icon name={cw.isOpen ? 'schedule' : 'block'} size={16} color={cw.isOpen ? T.tealInk : T.red} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: cw.isOpen ? T.tealInk : T.red, whiteSpace: 'nowrap' }}>
                {cw.isOpen ? `${cw.label} · open` : `Window closed · opens ${String(cw.openHour).padStart(2, '0')}:00`}
              </span>
            </div>
          )}

          {isMobile && <IconButton name="search" onClick={() => setPalette(true)} title="Search" />}
          <IconButton name="notifications" onClick={() => go('notifs')} title="Notifications" badge />
        </header>

        <main className="body">{children}</main>
      </div>

      {palette && <CommandPalette items={paletteItems} onClose={() => setPalette(false)} />}
    </>
  );
}
