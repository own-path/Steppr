import React, { useState } from 'react'

const TOTAL_STEPS = 7

const QUOTES = [
  { q: "I went into my mid-internship review with 11 weeks of receipts.", a: "Daryl K. · ML Intern" },
  { q: "Steppr is a memory I can trust.", a: "Priya R. · SWE I" },
  { q: "Half the work of 1:1 prep, twice the signal.", a: "Maya O. · EM" },
  { q: "Friday afternoons stopped being a panic.", a: "Theo S. · Product" },
  { q: "It's the journal I never managed to keep.", a: "Lin H. · Designer" },
  { q: "I forgot how much I'd actually shipped.", a: "Asha P. · New grad" },
  { q: "You'll thank past-you for starting tonight.", a: "" },
]

const LOGO_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2.5" y="14" width="6" height="7" rx="1.6" fill="#FFB81C"/>
    <rect x="9.5" y="9" width="6" height="12" rx="1.6" fill="#fff"/>
    <rect x="16.5" y="3" width="5" height="18" rx="1.6" fill="#FFB81C" opacity="0.85"/>
  </svg>
)

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
)

const CHECK_SVG = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function ProgressDots({ step }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 48 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 999,
          background: i < step ? 'var(--accent)' : i === step ? 'var(--ink)' : 'var(--bg-3)',
          transition: 'background .3s',
        }}/>
      ))}
    </div>
  )
}

function Tile({ icon, h, p, selected, onClick, multi }) {
  return (
    <button onClick={onClick} type="button" style={{
      padding: '18px 20px', borderRadius: 16,
      border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
      background: selected ? 'var(--accent-tint)' : 'var(--surface)',
      cursor: 'pointer', textAlign: 'left',
      transition: 'all .15s ease',
      display: 'flex', alignItems: 'flex-start', gap: 14,
      minHeight: 56,
      boxShadow: selected ? '0 0 0 3px rgba(0,53,148,0.15)' : 'none',
    }}>
      {icon && (
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: selected ? 'var(--accent-tint)' : 'var(--bg-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 20,
        }}>{icon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{h}</div>
        {p && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{p}</div>}
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: multi ? 6 : 999,
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--line-2)'}`,
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? 'var(--accent)' : 'transparent',
        transition: 'all .15s',
        color: selected ? '#fff' : 'transparent',
      }}>{CHECK_SVG}</div>
    </button>
  )
}

function Step1({ data, set }) {
  return (
    <div key="s1" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Step 01 / 07</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', maxWidth: '18ch' }}>
        First, what should we call you?
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 32px' }}>
        Steppr is built around your voice — the manager email, the AI coach, the wins vault, all of it sounds like you.
      </p>
      <input
        style={{
          width: '100%', padding: '16px 18px', borderRadius: 14,
          border: `1.5px solid var(--line)`, background: 'var(--surface)',
          fontSize: 17, color: 'var(--ink)', outline: 'none',
          fontFamily: 'inherit', transition: 'border-color .18s, box-shadow .18s',
        }}
        placeholder="e.g. Daryl"
        value={data.name || ''}
        onChange={e => set({ name: e.target.value })}
        autoFocus
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 4px var(--accent-tint)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
        We never share your name. You can change it any time.
      </div>
    </div>
  )
}

function Step2({ data, set }) {
  const ROLES = [
    { id: 'intern',   h: 'Intern',          p: 'Internship to return offer',       icon: '🌱' },
    { id: 'newgrad',  h: 'New grad',         p: 'First 12 months on the job',       icon: '🚀' },
    { id: 'ic',       h: 'IC, leveling up',  p: 'Aiming for next promo',            icon: '📈' },
    { id: 'manager',  h: 'Manager',          p: "Tracking my own + my reports",     icon: '🧭' },
    { id: 'founder',  h: 'Founder',          p: "No one's evaluating me but me",    icon: '🛠' },
    { id: 'switcher', h: 'Career switcher',  p: 'Building proof for the next role', icon: '🔁' },
  ]
  return (
    <div key="s2" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Step 02 / 07</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', maxWidth: '18ch' }}>
        Where are you in your career?
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 32px' }}>
        This shapes the prompts, the rubric, and how the weekly report is framed.
      </p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        {ROLES.map(r => (
          <Tile key={r.id} icon={r.icon} h={r.h} p={r.p}
            selected={data.role === r.id}
            onClick={() => set({ role: r.id })}/>
        ))}
      </div>
    </div>
  )
}

function Step3({ data, set }) {
  const GOALS = [
    { id: 'ship',    h: 'Ship more',         p: 'Velocity & throughput',   icon: '⚡' },
    { id: 'learn',   h: 'Learn faster',      p: 'Build deeper expertise',  icon: '🧠' },
    { id: 'offer',   h: 'Earn return offer', p: 'Internship → full-time',  icon: '🎯' },
    { id: 'promo',   h: 'Get promoted',      p: 'Next-level evidence',     icon: '🪜' },
    { id: 'visible', h: 'Be more visible',   p: 'Communicate impact',      icon: '📣' },
    { id: 'balance', h: 'Avoid burnout',     p: 'Sustainable cadence',     icon: '🧘' },
  ]
  const sel = data.goals || []
  const toggle = (id) => {
    const next = sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
    set({ goals: next })
  }
  return (
    <div key="s3" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Step 03 / 07</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', maxWidth: '18ch' }}>
        What matters this season?
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 32px' }}>
        Pick up to three. These become your weekly check-ins and what the AI coach orients around.
      </p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        {GOALS.map(g => (
          <Tile key={g.id} icon={g.icon} h={g.h} p={g.p} multi
            selected={sel.includes(g.id)}
            onClick={() => toggle(g.id)}/>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-4)' }}>
        {sel.length > 0 ? `${sel.length} selected` : 'No selection yet'}
      </div>
    </div>
  )
}

function Step4({ data, set }) {
  const CONNS = [
    { id: 'cal',    name: 'Google Calendar', p: 'Auto-pull what you actually worked on',    bg: '#fff',    fg: '#4285F4', label: 'G' },
    { id: 'slack',  name: 'Slack',           p: 'Mine your DMs & threads for wins',          bg: '#4A154B', fg: '#fff',    label: 'S' },
    { id: 'github', name: 'GitHub',          p: 'PRs, reviews, commits → portfolio',          bg: '#14120E', fg: '#fff',    label: 'GH' },
    { id: 'linear', name: 'Linear',          p: 'Tickets shipped → automatic wins',           bg: '#5E6AD2', fg: '#fff',    label: 'L' },
    { id: 'notion', name: 'Notion',          p: 'Pull docs you wrote into your knowledge graph', bg: '#fff', fg: '#14120E', label: 'N' },
  ]
  const conn = data.connectors || {}
  const toggle = (id) => set({ connectors: { ...conn, [id]: !conn[id] } })
  return (
    <div key="s4" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Step 04 / 07</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', maxWidth: '18ch' }}>
        Connect what you'd like.
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 32px' }}>
        Optional. Steppr only reads — never posts. You can revoke any of these in one click later.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CONNS.map(c => (
          <div key={c.id} style={{ padding: 18, borderRadius: 16, border: '1.5px solid var(--line)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: c.bg, color: c.fg, fontWeight: 700, fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: c.bg === '#fff' ? '1px solid var(--line)' : 'none',
            }}>{c.label}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 1 }}>{c.p}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(c.id)}
              style={{
                padding: '8px 14px', borderRadius: 999,
                border: conn[c.id] ? '1px solid rgba(0,53,148,0.3)' : '1px solid var(--line-2)',
                background: conn[c.id] ? 'var(--accent-tint)' : 'var(--surface)',
                color: conn[c.id] ? 'var(--accent-2)' : 'var(--ink-2)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'all .15s', whiteSpace: 'nowrap',
              }}>
              {conn[c.id] ? '✓ Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step5({ data, set }) {
  const TIMES = ['7:00am', '8:00am', '12:30pm', '5:00pm', '6:00pm', '7:00pm', '9:00pm', '10:30pm']
  return (
    <div key="s5" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Step 05 / 07</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', maxWidth: '18ch' }}>
        When should we ping you?
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 32px' }}>
        Once a day, gently. End of day works for most people — but you do you.
      </p>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {TIMES.map(t => (
          <button key={t} type="button"
            onClick={() => set({ checkin: t })}
            style={{
              padding: '14px 10px', borderRadius: 12,
              border: `1.5px solid ${data.checkin === t ? 'var(--accent)' : 'var(--line)'}`,
              background: data.checkin === t ? 'var(--accent-tint)' : 'var(--surface)',
              color: data.checkin === t ? 'var(--accent-2)' : 'var(--ink)',
              fontSize: 14, fontWeight: 600, textAlign: 'center',
              cursor: 'pointer', transition: 'all .15s',
            }}>{t}</button>
        ))}
      </div>
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>How would you like to log?</div>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[{ id: 'type', h: 'Type', icon: '⌨' }, { id: 'voice', h: 'Voice', icon: '🎙' }, { id: 'both', h: 'Both', icon: '✨' }].map(o => (
            <Tile key={o.id} icon={o.icon} h={o.h}
              selected={data.logmode === o.id}
              onClick={() => set({ logmode: o.id })}/>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step6({ data, set }) {
  return (
    <div key="s6" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Step 06 / 07</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', maxWidth: '18ch' }}>
        Want to email weekly to a manager?
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 32px' }}>
        Optional. Steppr drafts a polished version every Friday — you review, edit, then send. They never see the personal version.
      </p>
      <input
        style={{
          width: '100%', padding: '16px 18px', borderRadius: 14,
          border: '1.5px solid var(--line)', background: 'var(--surface)',
          fontSize: 17, color: 'var(--ink)', outline: 'none',
          fontFamily: 'inherit', transition: 'border-color .18s, box-shadow .18s',
        }}
        placeholder="manager@yourcompany.com"
        value={data.manager || ''}
        onChange={e => set({ manager: e.target.value })}
        type="email"
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 4px var(--accent-tint)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
      />
      <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-2)', borderRadius: 14, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13 }}>What gets sent</div>
        <div style={{ marginTop: 6 }}>Top wins, blockers, what's next, and a one-line theme. Always reviewed by you before it goes anywhere.</div>
      </div>
    </div>
  )
}

function Step7({ data, set }) {
  const OPTIONS = [
    { id: 'local',  h: 'Local-first (recommended)', p: "Steppr runs a small model on your device. Your reflections never leave. Ideal if your company has policies about external AI.", tag: 'Private · slower' },
    { id: 'cloud',  h: 'Cloud (faster, smarter)',   p: "Use Steppr-hosted models for richer summaries and the AI coach. Encrypted in transit & at rest. SOC 2.",                      tag: 'Faster · enterprise-grade' },
    { id: 'hybrid', h: 'Hybrid',                    p: "Daily logs stay local. Weekly reports use cloud. Best of both, recommended for power users.",                                  tag: 'Smart default' },
  ]
  return (
    <div key="s7" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Step 07 / 07</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', maxWidth: '18ch' }}>
        Where should the AI run?
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 32px' }}>
        You can change this any time in Settings.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OPTIONS.map(o => (
          <button key={o.id} type="button"
            onClick={() => set({ privacy: o.id })}
            style={{
              padding: 24, borderRadius: 18,
              border: `1.5px solid ${data.privacy === o.id ? 'var(--accent)' : 'var(--line)'}`,
              background: data.privacy === o.id ? 'var(--accent-tint)' : 'var(--surface)',
              cursor: 'pointer', transition: 'all .15s',
              display: 'flex', gap: 16, textAlign: 'left',
            }}>
            <div style={{
              width: 22, height: 22, borderRadius: 999, marginTop: 2,
              border: `2px solid ${data.privacy === o.id ? 'var(--accent)' : 'var(--line-2)'}`,
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {data.privacy === o.id && <div style={{ width: 12, height: 12, borderRadius: 999, background: 'var(--accent)' }}/>}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{o.h}</div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'var(--bg-2)', color: 'var(--ink-3)', fontWeight: 500, border: '1px solid var(--line)' }}>{o.tag}</span>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>{o.p}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Done({ data, setRoute }) {
  const name = (data.name || 'friend').split(' ')[0]
  const roleLabel = { intern: 'interns', newgrad: 'new grads', ic: 'ICs', manager: 'managers', founder: 'founders', switcher: 'career switchers' }
  const connCount = Object.values(data.connectors || {}).filter(Boolean).length
  const goalCount = (data.goals || []).length
  const aiLabel = { local: 'Local-first', cloud: 'Cloud', hybrid: 'Hybrid' }

  return (
    <div key="done" style={{ animation: 'obStepIn .35s cubic-bezier(.2,.8,.2,1) both' }}>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>You're set</div>
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 'clamp(80px, 10vw, 140px)',
        lineHeight: 0.85, letterSpacing: '-0.02em',
        background: 'linear-gradient(180deg, var(--accent), var(--accent-2))',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        marginTop: 8,
      }}>READY.</div>
      <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '12px 0 12px', maxWidth: '18ch' }}>
        Welcome, {name}.
      </h1>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'var(--ink-3)', maxWidth: '50ch', lineHeight: 1.5, margin: '0 0 24px' }}>
        Here's what we set up for you. You can change any of it later — Settings is one tap from anywhere.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
        {[
          `Profile & rubric tuned for ${roleLabel[data.role] || 'you'}`,
          `${goalCount} season goal${goalCount === 1 ? '' : 's'} pinned to your dashboard`,
          `${connCount} integration${connCount === 1 ? '' : 's'} connected`,
          `Daily check-in at ${data.checkin || '6:00pm'}`,
          `AI mode: ${aiLabel[data.privacy] || 'Local-first'}`,
        ].map((item, i) => (
          <li key={i} style={{ padding: '14px 0', fontSize: 15, color: 'var(--ink-2)', borderBottom: i < 4 ? '1px solid var(--line)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--accent-tint)', color: 'var(--accent-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 12 }}>✓</span>
            <span dangerouslySetInnerHTML={{ __html: item.replace(/(<strong>.*?<\/strong>)/g, '$1') }}/>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setRoute('dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '16px 28px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          transition: 'background .18s', marginTop: 12,
        }}
        onMouseEnter={e => e.target.style.background = 'var(--accent-2)'}
        onMouseLeave={e => e.target.style.background = 'var(--accent)'}
      >
        Open Steppr {ARROW}
      </button>
    </div>
  )
}

export default function OnboardingPage({ setRoute }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '', role: '', goals: [], connectors: {}, checkin: '6:00pm', logmode: 'both', manager: '', privacy: 'local',
  })
  const set = (patch) => setData(d => ({ ...d, ...patch }))

  const canNext = () => {
    if (step === 0) return (data.name || '').trim().length > 0
    if (step === 1) return !!data.role
    if (step === 2) return (data.goals || []).length > 0
    if (step === 6) return !!data.privacy
    return true
  }

  const isDone = step === TOTAL_STEPS
  const quote = QUOTES[Math.min(step, QUOTES.length - 1)]

  const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7]
  const Cur = isDone ? null : STEPS[step]

  return (
    <>
      <style>{`
        @keyframes obStepIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-back:hover { background: var(--surface) !important; color: var(--ink) !important; }
        .ob-next:hover { background: var(--ink-2) !important; transform: translateY(-1px); }
        .ob-next.accent:hover { background: var(--accent-2) !important; }
        @media (max-width: 900px) {
          .ob-shell { grid-template-columns: 1fr !important; grid-template-rows: auto 1fr !important; }
          .ob-brand { min-height: 140px !important; padding: 20px !important; }
          .ob-brand-quote { display: none !important; }
          .ob-brand-mini { display: flex !important; }
          .ob-progress-desktop { display: none !important; }
          .ob-form { padding: 24px 20px !important; }
        }
        @media (min-width: 901px) {
          .ob-brand-mini { display: none !important; }
        }
        @media (max-width: 480px) {
          .ob-tiles-2 { grid-template-columns: 1fr !important; }
          .ob-time-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <div className="ob-shell" style={{
        minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>

        {/* LEFT: brand panel */}
        <aside style={{
          background: `
            radial-gradient(900px 500px at 80% 0%, rgba(255,184,28,0.1), transparent 60%),
            radial-gradient(700px 400px at 0% 100%, rgba(139,92,246,0.06), transparent 60%),
            linear-gradient(160deg, #14120E 0%, #2B2823 100%)`,
          color: '#fff', padding: 56, position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }} className="ob-brand">
          <div style={{
            content: '', position: 'absolute', right: -40, bottom: -120, pointerEvents: 'none',
            fontFamily: "'VT323', monospace", fontSize: 'clamp(220px, 26vw, 380px)',
            color: 'rgba(255,255,255,0.04)', lineHeight: 0.8, letterSpacing: '-0.01em',
            userSelect: 'none',
            // Can't do ::after in inline styles, so we fake it with a div
          }}></div>
          <div style={{ position: 'absolute', right: -40, bottom: -120, fontFamily: "'VT323', monospace", fontSize: 'clamp(220px, 26vw, 380px)', color: 'rgba(255,255,255,0.04)', lineHeight: 0.8, pointerEvents: 'none', userSelect: 'none' }}>STEPPR</div>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', position: 'relative', zIndex: 2 }}>
            {LOGO_SVG} Steppr
          </div>

          {/* Mobile mini progress */}
          <div className="ob-brand-mini" style={{ gap: 6, alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}</span>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 999, marginLeft: 12, overflow: 'hidden' }}>
              <div style={{ width: `${(Math.min(step, TOTAL_STEPS - 1) / (TOTAL_STEPS - 1)) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width .4s ease' }}/>
            </div>
          </div>

          {/* Quote */}
          <div className="ob-brand-quote" style={{ position: 'relative', zIndex: 2, maxWidth: '32ch' }} key={step}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 80, lineHeight: 0.5, color: 'var(--accent)', display: 'block', marginBottom: 8 }}>"</span>
            <div style={{ fontSize: 'clamp(20px, 2.4vw, 32px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{quote.q}</div>
            {quote.a && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 24, fontWeight: 400 }}>— {quote.a}</div>}
          </div>
        </aside>

        {/* RIGHT: form */}
        <main className="ob-form" style={{ padding: '56px 56px 32px', display: 'flex', flexDirection: 'column', maxHeight: '100vh', overflowY: 'auto' }}>
          {!isDone && <ProgressDots step={step} />}

          {isDone
            ? <Done data={data} setRoute={setRoute}/>
            : <Cur data={data} set={set}/>
          }

          {!isDone && (
            <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="ob-back"
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                style={{
                  padding: '14px 20px', borderRadius: 999,
                  border: '1px solid var(--line)', background: 'transparent',
                  fontSize: 14, fontWeight: 500, cursor: step === 0 ? 'not-allowed' : 'pointer',
                  color: 'var(--ink-3)', transition: 'all .15s',
                  opacity: step === 0 ? 0.3 : 1,
                }}>Back</button>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {(step === 3 || step === 5) && (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--ink-4)', fontSize: 13, cursor: 'pointer', padding: '8px 12px', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Skip for now
                  </button>
                )}
                <button
                  className={`ob-next${step === TOTAL_STEPS - 1 ? ' accent' : ''}`}
                  onClick={() => canNext() && setStep(s => Math.min(TOTAL_STEPS, s + 1))}
                  disabled={!canNext()}
                  style={{
                    padding: '14px 24px', borderRadius: 999,
                    background: step === TOTAL_STEPS - 1 ? 'var(--accent)' : 'var(--ink)',
                    color: '#fff', border: 'none',
                    fontSize: 14, fontWeight: 600, cursor: canNext() ? 'pointer' : 'not-allowed',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    transition: 'all .15s',
                    opacity: canNext() ? 1 : 0.5,
                  }}>
                  {step === TOTAL_STEPS - 1 ? 'Finish setup' : 'Continue'} {ARROW}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
