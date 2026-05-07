import React, { useState, useEffect, useRef } from 'react'
import Icons from './Icons'
import { Avatar, fireConfetti } from './Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
  { id: 'log',       label: 'Daily Log', icon: 'Log' },
  { id: 'reports',   label: 'Review',    icon: 'Reports' },
  { id: 'tasks',     label: 'Tasks',     icon: 'Tasks' },
];

function TopBar({ route, setRoute }) {
  const I = Icons;
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const titles = {
    dashboard: 'Dashboard', log: 'Daily Log', graph: 'Knowledge Graph',
    reports: 'Weekly Review', analytics: 'Analytics',
    tasks: 'Tasks & Goals', wins: 'Wins Vault', settings: 'Settings'
  };
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(14px) saturate(140%)', WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      background: 'rgba(250,250,247,0.72)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '12px 16px' : '14px 32px',
        display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        {/* Left: logo + page */}
        <div className="row items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
          <I.Logo size={26}/>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Steppr</div>
          {!isMobile && (
            <>
              <span style={{ width: 1, height: 16, background: 'var(--line-2)', margin: '0 6px', flexShrink: 0 }}></span>
              <span style={{ fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titles[route] || ''}</span>
            </>
          )}
        </div>
        {/* Center: search — hide on mobile */}
        {!isMobile && (
          <div style={{ width: isTablet ? 280 : 420, maxWidth: '100%', flexShrink: 0 }}>
            <div className="row items-center gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--line)',
              padding: '7px 14px', borderRadius: 999 }}>
              <I.Search size={15} stroke="var(--ink-4)"/>
              <input className="input" placeholder="Search wins, notes, people…"
                style={{ border: 'none', padding: 0, background: 'transparent', flex: 1 }}/>
              {isDesktop && <span className="kbd">⌘K</span>}
            </div>
          </div>
        )}
        {/* Right: meta */}
        <div className="row items-center gap-3" style={{ flexShrink: 0 }}>
          {isDesktop && (
            <>
              <div className="chip" style={{ background: 'var(--surface)' }}>
                <I.Calendar size={13}/> Current week
              </div>
              <div className="chip chip-amber" title="Database status">
                <I.Flame size={13}/> Synced
              </div>
              <div className="chip" style={{ background: 'var(--surface)' }}>
                <span className="ai-pulse"></span> AI online
              </div>
            </>
          )}
          {isTablet && (
            <div className="chip chip-amber" title="Career streak">
              <I.Flame size={13}/> 18d
            </div>
          )}
          <button className="btn btn-ghost" style={{ padding: 8, borderRadius: 999 }}><I.Bell size={17}/></button>
          <button className="btn btn-ghost" style={{ padding: 8, borderRadius: 999 }} onClick={() => setRoute && setRoute('settings')} title="Settings"><I.Settings size={17}/></button>
          <Avatar initials="DK"/>
        </div>
      </div>
    </header>
  );
}

function Dock({ route, setRoute }) {
  const I = Icons;
  const { isMobile } = useBreakpoint();

  const visibleItems = NAV_ITEMS;

  return (
    <div style={{ position: 'fixed', bottom: isMobile ? 12 : 22, left: 0, right: 0, zIndex: 60, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto',
        background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderRadius: 999, padding: isMobile ? 6 : 8, display: 'flex', gap: isMobile ? 2 : 4,
        boxShadow: 'var(--shadow-dock)', border: '1px solid rgba(20,18,14,0.08)' }}>
        {visibleItems.map(item => {
          const Ic = I[item.icon];
          const active = route === item.id;
          return (
            <button key={item.id} onClick={() => setRoute(item.id)} title={item.label}
              style={{
                position: 'relative',
                width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? '#fff' : 'var(--ink-2)',
                transition: 'all .25s cubic-bezier(.2,.8,.2,1)',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-2)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Ic size={isMobile ? 16 : 18}/>
              {active && <span style={{ position: 'absolute', bottom: -8, width: 4, height: 4, background: 'var(--accent)', borderRadius: 999 }}></span>}
            </button>
          );
        })}
        <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--line-2)', margin: '6px 4px' }}></span>
        <button title="Quick add"
          style={{ width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, borderRadius: 999, background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,53,148,0.35)' }}
          onClick={(e) => { fireConfetti(e.clientX, e.clientY); }}
        >
          <I.Plus size={isMobile ? 16 : 18}/>
        </button>
      </div>
    </div>
  );
}

export { NAV_ITEMS, TopBar, Dock };
