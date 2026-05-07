import React from 'react'

// Steppr icon set — duotone style
// Each icon: bg fill layer (currentColor @ 12–15% opacity) + 2px stroke layer
// strokeWidth=2, strokeLinecap/Join=round throughout

const Icons = {

  // ── Brand ────────────────────────────────────────────────────────────────────
  Logo: ({ size = 22, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="2.5"  y="14" width="6" height="7"  rx="1.6" fill="#FFB81C"/>
      <rect x="9"    y="9"  width="6" height="12" rx="1.6" fill="#003594"/>
      <rect x="15.5" y="3"  width="6" height="18" rx="1.6" fill="#FFB81C" opacity="0.85"/>
    </svg>
  ),

  // ── Navigation ───────────────────────────────────────────────────────────────
  Dashboard: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg: top-left + bottom-right panels */}
      <rect x="3" y="3" width="8" height="9" rx="2" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="13" y="12" width="8" height="9" rx="2" fill="#FFB81C" fillOpacity={0.18}/>
      {/* strokes: all four panels */}
      <rect x="3"  y="3"  width="8" height="9" rx="2" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
      <rect x="13" y="3"  width="8" height="5" rx="2" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
      <rect x="3"  y="16" width="8" height="5" rx="2" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
      <rect x="13" y="12" width="8" height="9" rx="2" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
    </svg>
  ),

  Log: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg: document body */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" fill="#FFB81C" fillOpacity={0.18}/>
      {/* outline + corner fold */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* text lines */}
      <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Graph: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg: central hub glow */}
      <circle cx="12" cy="12" r="4" fill="#FFB81C" fillOpacity={0.18}/>
      {/* edges */}
      <path d="M7.5 7.5 10 10M16.5 7.5 14 10M7.5 16.5 10 14M16.5 16.5 14 14" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"/>
      {/* satellite nodes */}
      <circle cx="6"  cy="6"  r="2.25" stroke="currentColor" strokeWidth={2}/>
      <circle cx="18" cy="6"  r="2.25" stroke="currentColor" strokeWidth={2}/>
      <circle cx="6"  cy="18" r="2.25" stroke="currentColor" strokeWidth={2}/>
      <circle cx="18" cy="18" r="2.25" stroke="currentColor" strokeWidth={2}/>
      {/* central hub */}
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2}/>
    </svg>
  ),

  Reports: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg fill */}
      <path d="M4 4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M4 4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* bar chart inside */}
      <path d="M8 18v-3M11 18v-5M14 18v-2M17 18v-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Analytics: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg bars fill */}
      <rect x="7"  y="11" width="3" height="8" rx="1" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="11" y="7"  width="3" height="12" rx="1" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="15" y="9"  width="3" height="10" rx="1" fill="#FFB81C" fillOpacity={0.18}/>
      {/* axes */}
      <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* bar strokes */}
      <path d="M8 11v8M12 7v12M16 9v10" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"/>
    </svg>
  ),

  Coach: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg bubble fill */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* chat dots */}
      <circle cx="9"  cy="10" r="1.2" fill="currentColor"/>
      <circle cx="12" cy="10" r="1.2" fill="currentColor"/>
      <circle cx="15" cy="10" r="1.2" fill="currentColor"/>
    </svg>
  ),

  Tasks: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg: first column highlight */}
      <rect x="3" y="4" width="5" height="16" rx="2" fill="#FFB81C" fillOpacity={0.18}/>
      {/* all three columns */}
      <rect x="3"  y="4"  width="5"  height="16" rx="2" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
      <rect x="10" y="4"  width="5"  height="10" rx="2" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
      <rect x="17" y="4"  width="4"  height="6"  rx="2" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
    </svg>
  ),

  Wins: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg cup fill */}
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="#FFB81C" fillOpacity={0.18}/>
      {/* cup + handles */}
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 6h2a2 2 0 1 1 0 4h-2M7 6H5a2 2 0 1 0 0 4h2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14v4M8 21h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Settings: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg: inner ring */}
      <circle cx="12" cy="12" r="3" fill="#FFB81C" fillOpacity={0.18}/>
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2}/>
    </svg>
  ),

  // ── UI actions ────────────────────────────────────────────────────────────────
  Search: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="11" cy="11" r="7" fill="#FFB81C" fillOpacity={0.18}/>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Bell: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg bell body */}
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Plus: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  X: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Check: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Chevron: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  ChevronDown: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  ArrowRight: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  ArrowUp: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  ArrowDown: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Edit: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg: pencil body */}
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Eye: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="#FFB81C" fillOpacity={0.18}/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2}/>
    </svg>
  ),

  Copy: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="8" y="8" width="13" height="13" rx="2" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="8" y="8" width="13" height="13" rx="2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Download: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 3v12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      <path d="M6 11l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 21h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Filter: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Sliders: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      <circle cx="16" cy="6"  r="2" fill="#FFB81C" fillOpacity={0.18}/>
      <circle cx="16" cy="6"  r="2" stroke="currentColor" strokeWidth={2}/>
      <circle cx="8"  cy="12" r="2" fill="#FFB81C" fillOpacity={0.18}/>
      <circle cx="8"  cy="12" r="2" stroke="currentColor" strokeWidth={2}/>
      <circle cx="16" cy="18" r="2" fill="#FFB81C" fillOpacity={0.18}/>
      <circle cx="16" cy="18" r="2" stroke="currentColor" strokeWidth={2}/>
    </svg>
  ),

  Drag: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="9"  cy="6"  r="1.5" fill="currentColor"/>
      <circle cx="15" cy="6"  r="1.5" fill="currentColor"/>
      <circle cx="9"  cy="12" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="9"  cy="18" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="18" r="1.5" fill="currentColor"/>
    </svg>
  ),

  Send: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M22 2 11 13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Pin: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M9 3h6l-1 7 4 3v2H6v-2l4-3-1-7Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M9 3h6l-1 7 4 3v2H6v-2l4-3-1-7Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 18v3" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Tag: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M3 12.5V4a1 1 0 0 1 1-1h8.5l9 9-9 9-9.5-9Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M3 12.5V4a1 1 0 0 1 1-1h8.5l9 9-9 9-9.5-9Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
    </svg>
  ),

  Link: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // ── Content / Media ───────────────────────────────────────────────────────────
  FileText: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Code: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="m8 8-5 4 5 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m16 8 5 4-5 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m14 4-4 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Lock: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="4" y="11" width="16" height="11" rx="2" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="4" y="11" width="16" height="11" rx="2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  ),

  Globe: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="9" fill="#FFB81C" fillOpacity={0.18}/>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2}/>
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Layers: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m3 13 9 5 9-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m3 18 9 5 9-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // ── Status / Feedback ─────────────────────────────────────────────────────────
  Star: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Heart: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 21C12 21 3 15.5 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M12 21C12 21 3 15.5 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Trophy: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 6h2a2 2 0 1 1 0 4h-2M7 6H5a2 2 0 1 0 0 4h2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14v4M8 21h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  // ── AI / Magic ────────────────────────────────────────────────────────────────
  Spark: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* center glow */}
      <circle cx="12" cy="12" r="3" fill="#FFB81C" fillOpacity={0.18}/>
      {/* rays */}
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      <path d="M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"/>
    </svg>
  ),

  Bolt: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Zap: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M19 15.74C20.75 15.13 22 13.46 22 11.5c0-2.35-1.79-4.27-4.08-4.48C17.45 4.17 14.98 2 12 2 9.02 2 6.55 4.17 6.08 7.02 3.79 7.23 2 9.16 2 11.5c0 1.96 1.25 3.63 3 4.24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m13 11-4 6h6l-4 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Flame: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 2c0 5.5-6 8-6 13a6 6 0 0 0 12 0c0-3.5-2-5.5-3-7-1 2-2 3-2 5a2 2 0 0 1-4 0c0-3 3-5 3-11Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M12 2c0 5.5-6 8-6 13a6 6 0 0 0 12 0c0-3.5-2-5.5-3-7-1 2-2 3-2 5a2 2 0 0 1-4 0c0-3 3-5 3-11Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Brain: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* right half bg fill */}
      <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0V4Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V4a3 3 0 0 0-3 0Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Mic: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="9" y="3" width="6" height="12" rx="3" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 19v3" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  Voice: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // ── Time / Calendar ───────────────────────────────────────────────────────────
  Calendar: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* bg: header stripe */}
      <rect x="3" y="4" width="18" height="6" rx="2" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      {/* date dots */}
      <circle cx="8"  cy="15" r="1.2" fill="currentColor"/>
      <circle cx="12" cy="15" r="1.2" fill="currentColor"/>
      <circle cx="16" cy="15" r="1.2" fill="currentColor"/>
    </svg>
  ),

  Moon: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Sun: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="4" fill="#FFB81C" fillOpacity={0.18}/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={2}/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5.07 5.07l1.41 1.41M17.52 17.52l1.41 1.41M5.07 18.93l1.41-1.41M17.52 6.48l1.41-1.41" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  ),

  // ── Media controls ────────────────────────────────────────────────────────────
  Play: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M7 4v16l13-8L7 4Z" fill="#FFB81C" fillOpacity={0.18}/>
      <path d="M7 4v16l13-8L7 4Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Pause: ({ size = 18, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="6"  y="4" width="4" height="16" rx="1.5" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="14" y="4" width="4" height="16" rx="1.5" fill="#FFB81C" fillOpacity={0.18}/>
      <rect x="6"  y="4" width="4" height="16" rx="1.5" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
      <rect x="14" y="4" width="4" height="16" rx="1.5" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
    </svg>
  ),
}

export default Icons
