import React, { useState, useCallback } from 'react'
import '../landing.css'
import Icons from '../components/Icons'

const LOGO_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2.5" y="14" width="6" height="7" rx="1.6" fill="#FFB81C"/>
    <rect x="9.5" y="9" width="6" height="12" rx="1.6" fill="#003594"/>
    <rect x="16.5" y="3" width="5" height="18" rx="1.6" fill="#FFB81C" opacity="0.85"/>
  </svg>
)

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
)

// --- Demo extraction logic ---
const VERBS_WINS = ['shipped','launched','fixed','caught','found','solved','closed','merged','released','mentored','wrote','presented','built','deployed','authored','reviewed','paired','unblocked','optimized']
const CATS_MAP = [
  { k: ['ship','shipp','launch','release','deploy','merg','close','built','build'], cat: 'Velocity' },
  { k: ['fix','caught','found','regression','bug','break','patched'], cat: 'Quality' },
  { k: ['mentor','help','onboard','pair','review','docs','wrote','present','demo','share','communic'], cat: 'Communication' },
  { k: ['eval','rag','model','llm','retriev','train','fine-tune','prompt','pipeline','ml','ai'], cat: 'ML/AI' },
  { k: ['stuck','blocked','quota','wait','slow','delay','blocker'], cat: 'Blocker' },
  { k: ['initiat','propos','rfc','filed','flagg','spotted','noticed'], cat: 'Initiative' },
]
const SKIP_NAMES = new Set(['The','I','And','But','My','We','Steppr','It','Tue','Wed','Mon','Thu','Fri','Sat','Sun','Today','Yesterday'])

function extractFromText(txt) {
  const lower = txt.toLowerCase()
  const sentences = txt.split(/[.!\n]+/).map(s => s.trim()).filter(Boolean)
  const wins = sentences.filter(s => {
    const l = s.toLowerCase()
    return VERBS_WINS.some(v => new RegExp('\\b' + v).test(l))
  }).map(s => {
    const verb = VERBS_WINS.find(v => new RegExp('\\b' + v).test(s.toLowerCase()))
    return verb.charAt(0).toUpperCase() + verb.slice(1)
  })
  const uniqWins = [...new Set(wins)]
  const cats = CATS_MAP.filter(c => c.k.some(k => lower.includes(k))).map(c => c.cat)
  const peopleSet = new Set()
  const NAME = /(?:^|\s|with )([A-Z][a-z]{2,})/g
  let m
  while ((m = NAME.exec(txt)) !== null) {
    if (!SKIP_NAMES.has(m[1])) peopleSet.add(m[1])
  }
  const people = [...peopleSet].slice(0, 6)
  let theme = 'A balanced day.'
  if (cats.includes('Quality') && cats.includes('Velocity')) theme = 'Shipped + caught — strong dual-axis day.'
  else if (cats.includes('Velocity') && cats.includes('Communication')) theme = 'Output-heavy with strong communication signal.'
  else if (cats.includes('Blocker')) theme = 'Mixed signal — wins logged, but a blocker is recurring.'
  else if (cats.includes('Initiative')) theme = 'Initiative day — you noticed something others missed.'
  else if (uniqWins.length >= 3) theme = 'Sharp output day — three or more distinct wins.'
  else if (uniqWins.length === 0 && txt.trim().length > 20) theme = 'Reflective entry — noted context but no wins to claim today.'
  return { wins: uniqWins, cats, people, theme }
}

// --- Testimonials ---
const TESTIS = [
  { q: "I went into my mid-internship review with 11 weeks of receipts. My manager called it the most prepared check-in she'd had with an intern. Got the offer.", n: 'Daryl K.', r: 'ML Intern → New grad', a: 'D', c: '#003594' },
  { q: "I always blanked on what I shipped each week. Steppr is a memory I can trust.", n: 'Priya R.', r: 'SWE I, fintech', a: 'P', c: '#8B5CF6' },
  { q: "The personal version of the weekly report is the journal I never managed to keep.", n: 'Theo S.', r: 'Product, infra', a: 'T', c: '#06B6D4' },
  { q: "Half the work of 1:1 prep, twice the signal. My reports love it because they get the personal version.", n: 'Maya O.', r: 'EM, 6 reports', a: 'M', c: '#F59E0B' },
  { q: "I forgot how much I'd actually shipped. Steppr handed me a portfolio.", n: 'Asha P.', r: 'New grad SWE', a: 'A', c: '#EC4899' },
  { q: "Friday afternoons stopped being a panic. The report is just there.", n: 'Lin H.', r: 'Designer', a: 'L', c: '#4F46E5' },
  { q: "First tool that didn't make me feel surveilled. The manager opt-in is the whole game.", n: 'Wren K.', r: 'IC, climate-tech', a: 'W', c: '#003594' },
  { q: "I switched careers. Steppr was the receipt-keeper that made my resume actually true.", n: 'Sami J.', r: 'Career switcher', a: 'S', c: '#8B5CF6' },
]

const FAQS = [
  { q: 'Is this just a fancy journal?', a: "No — a journal is a dump. Steppr is a system. It tags, scores, surfaces, summarizes, and exports. You write the sentence; it builds the case for who you are professionally." },
  { q: 'Will my manager actually read this?', a: "The manager version is short on purpose: 4 wins, 2 blockers, 1 next-week plan. We've found it lands in 2 minutes — fewer than most Slack updates." },
  { q: 'What about privacy?', a: "Local-first by default. The model can run entirely on your laptop. The personal version of every report stays on-device. Cloud sync is opt-in, encrypted in transit and at rest." },
  { q: 'Which models can I use?', a: "Free tier: Gemma 2B, Llama 3.2 3B. Pro tier: Llama 70B, Mixtral, plus any HuggingFace model you can run locally. Bring-your-own API keys for OpenAI/Anthropic too." },
  { q: 'Do you have an API?', a: <span>Yes — read your wins, push entries, generate reports programmatically. Docs at <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-2)' }}>docs.steppr.app</span>.</span> },
  { q: 'Can I export my data?', a: "Anytime, in Markdown, JSON, or LaTeX. Your data is portable forever — even if you cancel." },
  { q: 'What if I miss a day?', a: "Steppr never shames you. Your streak resets, but the AI coach gently asks what got in the way and offers to backfill from your calendar. Friction-free re-entry." },
]

function VFrame({ url, children }) {
  return (
    <div className="vframe">
      <div className="vframe-bar">
        <div className="vframe-dots"><span/><span/><span/></div>
        <div className="vframe-url">{url}</div>
        <div style={{ width: 40 }}/>
      </div>
      <div className="vframe-mock">{children}</div>
    </div>
  )
}

function HeroDashboardMock() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11, color: 'var(--accent-2)', fontWeight: 600 }}>Week 3 · Momentum strong</div>
          <div style={{ fontSize: 'clamp(20px, 2.6vw, 28px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>
            Welcome back, Daryl. <span style={{ color: 'var(--ink-4)', fontWeight: 600 }}>7 wins this week.</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Momentum', val: '86', color: '#003594', pts: 'M0,22 L25,18 L50,20 L75,14 L100,16 L125,10 L150,8 L175,4 L200,2' },
          { label: 'Streak', val: '18d', color: '#F59E0B', pts: 'M0,24 L25,22 L50,18 L75,16 L100,14 L125,12 L150,8 L175,6 L200,3' },
          { label: 'Wins', val: '7', color: '#8B5CF6', pts: 'M0,22 L25,18 L50,16 L75,18 L100,12 L125,8 L150,10 L175,4 L200,2' },
          { label: 'Learn', val: '91', color: '#4F46E5', pts: 'M0,24 L25,20 L50,16 L75,12 L100,10 L125,8 L150,6 L175,4 L200,2' },
        ].map(card => (
          <div key={card.label} style={{ padding: 14, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 2 }}>{card.val}</div>
            <svg viewBox="0 0 200 28" preserveAspectRatio="none" style={{ width: '100%', height: 28, marginTop: 6 }}>
              <path d={card.pts} fill="none" stroke={card.color} strokeWidth="2" vectorEffect="non-scaling-stroke"/>
            </svg>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #14120E, #2B2823)', color: '#fff', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="ai-pulse" style={{ marginTop: 6 }}/>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>AI Insight</div>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginTop: 6 }}>"You ship 2.1× more on Tue/Thu mornings — defend the slot."</div>
        </div>
      </div>
    </div>
  )
}

function MockGraph() {
  return (
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      {[
        { x1:100,y1:80,x2:200,y2:160,delay:0 },
        { x1:300,y1:80,x2:200,y2:160,delay:1 },
        { x1:100,y1:240,x2:200,y2:160,delay:2 },
        { x1:300,y1:240,x2:200,y2:160,delay:3 },
        { x1:60,y1:160,x2:100,y2:80,delay:1.5 },
        { x1:340,y1:160,x2:300,y2:240,delay:2.5 },
        { x1:200,y1:40,x2:100,y2:80,delay:0.5 },
        { x1:200,y1:280,x2:300,y2:240,delay:3.5 },
      ].map((e,i) => (
        <line key={i} className="draw-edge" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#003594" strokeWidth="1.5" strokeOpacity="0.4" style={{ animationDelay: `${e.delay}s` }}/>
      ))}
      {[
        { cx:200,cy:160,r:22,fill:'#003594',label:'RAG',fs:11 },
        { cx:100,cy:80,r:14,fill:'#1D4ED8',label:'EVAL',fs:9 },
        { cx:300,cy:80,r:17,fill:'#002570',label:'PRIYA',fs:9 },
        { cx:100,cy:240,r:12,fill:'#FFB81C',label:'PYTHON',fs:8 },
        { cx:300,cy:240,r:15,fill:'#1E3258',label:'MAYA',fs:9 },
        { cx:60,cy:160,r:9,fill:'#C8D5EE',label:'',fs:8 },
        { cx:340,cy:160,r:10,fill:'#4A5C7A',label:'',fs:8 },
        { cx:200,cy:40,r:8,fill:'#C8D5EE',label:'',fs:8 },
        { cx:200,cy:280,r:8,fill:'#C8D5EE',label:'',fs:8 },
      ].map((n,i) => (
        <g key={i}>
          <circle className="pulse-node" cx={n.cx} cy={n.cy} r={n.r} fill={n.fill}/>
          {n.label && <text x={n.cx} y={n.cy+4} textAnchor="middle" fill="#fff" fontSize={n.fs} fontWeight="700" fontFamily="Space Grotesk">{n.label}</text>}
        </g>
      ))}
    </svg>
  )
}

function MockGrowth() {
  return (
    <svg viewBox="0 0 480 280" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#003594" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#003594" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[60,120,180,240].map(y => <line key={y} x1="40" x2="460" y1={y} y2={y} stroke="rgba(20,18,14,0.06)" strokeDasharray="3 4"/>)}
      <path className="growth-line" d="M 40,210 L 80,200 L 120,180 L 160,170 L 200,160 L 240,140 L 280,120 L 320,100 L 360,90 L 400,75 L 440,60" fill="none" stroke="#003594" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
      <path className="growth-line" style={{ animationDelay:'0.4s' }} d="M 40,220 L 80,215 L 120,200 L 160,195 L 200,180 L 240,170 L 280,155 L 320,145 L 360,130 L 400,115 L 440,100" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeOpacity="0.7" vectorEffect="non-scaling-stroke"/>
      <path className="growth-line" style={{ animationDelay:'0.8s' }} d="M 40,230 L 80,225 L 120,215 L 160,205 L 200,200 L 240,190 L 280,180 L 320,170 L 360,160 L 400,150 L 440,140" fill="none" stroke="#06B6D4" strokeWidth="2" strokeOpacity="0.7" vectorEffect="non-scaling-stroke"/>
      <path className="growth-line" style={{ animationDelay:'1.2s' }} d="M 40,235 L 80,230 L 120,225 L 160,220 L 200,215 L 240,205 L 280,200 L 320,190 L 360,185 L 400,175 L 440,170" fill="none" stroke="#F59E0B" strokeWidth="2" strokeOpacity="0.6" vectorEffect="non-scaling-stroke"/>
      <text x="40" y="20" fontFamily="JetBrains Mono" fontSize="10" fill="#8A8478">SCORE / 100</text>
      <rect x="350" y="245" width="10" height="3" fill="#003594"/>
      <text x="365" y="250" fill="#14120E" fontSize="10" fontWeight="600" fontFamily="Space Grotesk">Productivity</text>
    </svg>
  )
}

function QuoteCard({ t }) {
  return (
    <div className="land-quote-c">
      <div className="qt">"{t.q}"</div>
      <div className="qm">
        <div className="qa" style={{ background: t.c }}>{t.a}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{t.n}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{t.r}</div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage({ setRoute, onSignIn, onSignUp }) {
  const DEFAULT_DEMO = "Shipped the retrieval eval pipeline today. Found a silent regression with Priya — filed bug, paged on-call. Stuck on cluster quota again. Mentored Asha through her first PR."
  const [demoText, setDemoText] = useState(DEFAULT_DEMO)
  const [openFaq, setOpenFaq] = useState(0)

  const extracted = demoText.trim() ? extractFromText(demoText) : null

  const handleScrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="app-bg" style={{ minHeight: '100vh' }}>

      {/* NAV */}
      <nav className="land-nav">
        <div className="land-wrap land-nav-in">
          <a className="land-logo" href="#landing" onClick={e => { e.preventDefault(); setRoute('landing') }}>
            {LOGO_SVG} Steppr
          </a>
          <div className="land-nav-links">
            <a href="#features" onClick={e => { e.preventDefault(); handleScrollTo('features') }}>Features</a>
            <a href="#demo" onClick={e => { e.preventDefault(); handleScrollTo('demo') }}>Live demo</a>
            <a href="#stories" onClick={e => { e.preventDefault(); handleScrollTo('stories') }}>Stories</a>
            <a href="#faq" onClick={e => { e.preventDefault(); handleScrollTo('faq') }}>FAQ</a>
            <a href="#" style={{ color: 'var(--ink-4)' }} onClick={e => { e.preventDefault(); onSignIn ? onSignIn() : setRoute('dashboard') }}>Open app</a>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => onSignIn ? onSignIn() : setRoute('dashboard')}>Sign in</button>
            <button className="btn btn-accent" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => onSignUp ? onSignUp() : setRoute('onboarding')}>Start free</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="land-wrap land-hero">
        <span className="land-hero-eyebrow">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent-2)' }}/>
          For new grads, interns &amp; ICs in their first 18 months
        </span>
        <h1 className="land-h1">Tell your manager you're <em>ready</em>.</h1>
        <p className="land-hero-sub">
          Steppr turns 3 minutes a day into a portfolio of wins, a real-time growth score, and the weekly report your manager wishes more reports looked like.
        </p>
        <div className="land-hero-cta">
          <button className="btn btn-primary" style={{ padding: '14px 22px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={() => onSignUp ? onSignUp() : setRoute('onboarding')}>
            Start free — 60 seconds {ARROW}
          </button>
          <button className="btn" style={{ padding: '14px 22px', fontSize: 15 }} onClick={() => handleScrollTo('demo')}>Try it inline ↓</button>
        </div>
        <div className="land-hero-meta">
          <div className="land-hero-meta-item"><span className="land-hero-meta-dot"/><span>Local-first AI</span></div>
          <div className="land-hero-meta-item"><span className="land-hero-meta-dot"/><span>3 min/day</span></div>
          <div className="land-hero-meta-item"><span className="land-hero-meta-dot"/><span>Free forever for personal use</span></div>
        </div>

        <div className="land-hero-vframe vframe" style={{ aspectRatio: '16/10' }}>
          <div className="vframe-bar">
            <div className="vframe-dots"><span/><span/><span/></div>
            <div className="vframe-url">steppr.app / dashboard</div>
            <div style={{ width: 40 }}/>
          </div>
          <div className="vframe-mock"><HeroDashboardMock/></div>
          <div className="play-pulse"><span className="play-pulse-dot"/>LIVE PREVIEW</div>
        </div>
      </header>

      {/* TRUSTED */}
      <section className="land-wrap land-trusted">
        <div className="land-trusted-h">Used by people stepping up at</div>
        <div className="land-trusted-row">
          {['VECTOR LAB','FOUNDRY','NORTHSTAR','RIVET','HALO','OBELISK','QUARRY'].map(n => <span key={n}>{n}</span>)}
        </div>
      </section>

      {/* FEATURE SECTIONS */}
      <section className="land-wrap" id="features">
        {/* Feature 1 — Daily Log */}
        <div className="land-feature">
          <div className="land-feature-text">
            <span className="land-feature-tag">01 · Daily Log</span>
            <h2 className="land-feature-h">Drop a sentence. We do the surfacing.</h2>
            <p className="land-feature-p">Type, talk, or paste a Slack thread. Steppr reads between the lines — wins, blockers, who you worked with, what you learned — and timestamps it forever.</p>
            <ul className="land-feature-list">
              <li><span className="land-feature-li-i">✓</span>Wins detected and tagged automatically</li>
              <li><span className="land-feature-li-i">✓</span>Voice mode — talk for 90 seconds, transcribed locally</li>
              <li><span className="land-feature-li-i">✓</span>Paste anything: Slack, email, PR descriptions, meeting notes</li>
            </ul>
          </div>
          <div className="land-feature-visual">
            <VFrame url="daily-log · today">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                <div style={{ color: 'var(--ink-4)', fontSize: 10, letterSpacing: '0.05em' }}>TUE 4:32 PM</div>
                <div style={{ background: 'var(--surface)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                  <span className="mock-log-typ">Caught a silent regression in the retrieval router — 3.1% drop on MMLU. Filed bug, paged on-call, drafted root-cause doc.</span>
                </div>
                <div className="mock-log-extract">
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--accent-tint)' }}>+1 QUALITY</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--accent-tint)' }}>+INITIATIVE</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>→ added to Wins</span>
                </div>
              </div>
            </VFrame>
          </div>
        </div>

        {/* Feature 2 — Knowledge Graph */}
        <div className="land-feature flip">
          <div className="land-feature-text">
            <span className="land-feature-tag">02 · Knowledge Graph</span>
            <h2 className="land-feature-h">Watch your career take shape.</h2>
            <p className="land-feature-p">Every project, person, concept, and skill — mapped. Drag nodes around. See what's actually compounding. Watch the cluster you didn't realize you were building.</p>
            <ul className="land-feature-list">
              <li><span className="land-feature-li-i">✓</span>Auto-clusters by category, density tunable</li>
              <li><span className="land-feature-li-i">✓</span>Click any node for the full receipt trail</li>
              <li><span className="land-feature-li-i">✓</span>Export to Notion / Obsidian / Markdown</li>
            </ul>
          </div>
          <div className="land-feature-visual">
            <VFrame url="graph · 14 weeks · 84 nodes">
              <MockGraph/>
            </VFrame>
          </div>
        </div>

        {/* Feature 3 — Weekly Reports */}
        <div className="land-feature">
          <div className="land-feature-text">
            <span className="land-feature-tag">03 · Weekly Reports</span>
            <h2 className="land-feature-h">Two versions. One you. Friday won.</h2>
            <p className="land-feature-p">Manager version — tight, outcome-focused, in your voice, ready to ship. Personal version — the honest one, only you see it. Both written for you on Friday morning.</p>
            <ul className="land-feature-list">
              <li><span className="land-feature-li-i">✓</span>LaTeX source on the left, rendered PDF on the right</li>
              <li><span className="land-feature-li-i">✓</span>Send straight to Maya (or paste into your tracker)</li>
              <li><span className="land-feature-li-i">✓</span>Edit anything — Steppr never sends without you</li>
            </ul>
          </div>
          <div className="land-feature-visual">
            <VFrame url="reports · week 11 · manager view">
              <div className="land-mock-rep">
                <div className="land-mock-latex">
                  <div><span style={{ color: 'var(--violet)' }}>\documentclass</span>{'{'}<span style={{ color: 'var(--ink-2)' }}>steppr</span>{'}'}</div>
                  <div><span style={{ color: 'var(--violet)' }}>\title</span>{'{Week 11}'}</div>
                  <div style={{ marginTop: 6 }}><span style={{ color: 'var(--cyan)' }}>\section</span>{'{Top wins}'}</div>
                  <div><span style={{ color: 'var(--cyan)' }}>\begin</span>{'{itemize}'}</div>
                  <div>&nbsp;\item Shipped retrieval eval v2</div>
                  <div>&nbsp;\item Caught silent regression</div>
                  <div>&nbsp;\item Mentored Asha through first PR</div>
                  <div><span style={{ color: 'var(--cyan)' }}>\end</span>{'{itemize}'}</div>
                  <div style={{ marginTop: 6 }}><span style={{ color: 'var(--cyan)' }}>\section</span>{'{Blockers}'}</div>
                  <div>Cluster quota — IT followup</div>
                </div>
                <div className="land-mock-pdf">
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--accent-2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>WEEK 11 · DARYL K.</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>Weekly review</div>
                  <div style={{ marginTop: 8, fontWeight: 700, fontSize: 10 }}>Top wins</div>
                  <div style={{ fontSize: 9, lineHeight: 1.5 }}>• Shipped retrieval eval v2<br/>• Caught silent regression<br/>• Mentored Asha through first PR</div>
                  <div style={{ marginTop: 8, fontWeight: 700, fontSize: 10 }}>Blockers</div>
                  <div style={{ fontSize: 9 }}>Cluster quota — IT followup</div>
                </div>
              </div>
            </VFrame>
          </div>
        </div>

        {/* Feature 4 — AI Coach */}
        <div className="land-feature flip">
          <div className="land-feature-text">
            <span className="land-feature-tag">04 · AI Coach</span>
            <h2 className="land-feature-h">A coach who actually remembers.</h2>
            <p className="land-feature-p">Steppr's coach has read every reflection you've written. It asks the question your mentor would. Suggests the move your manager would. Calls out the pattern you keep ignoring.</p>
            <ul className="land-feature-list">
              <li><span className="land-feature-li-i">✓</span>Pulls receipts from your last 14 weeks</li>
              <li><span className="land-feature-li-i">✓</span>Knows your goals, your team, your blockers</li>
              <li><span className="land-feature-li-i">✓</span>Local-first — your reflections stay on device</li>
            </ul>
          </div>
          <div className="land-feature-visual">
            <VFrame url="coach · session 47">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
                <div style={{ padding: '12px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, maxWidth: '80%', alignSelf: 'flex-end', background: 'var(--ink)', color: '#fff', borderBottomRightRadius: 4 }}>
                  I keep getting stuck on the eval pipeline.
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, maxWidth: '80%', alignSelf: 'flex-start', background: 'var(--surface)', border: '1px solid var(--line)', borderBottomLeftRadius: 4 }}>
                  <span className="ai-pulse" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}/>
                  You said the same thing three Tuesdays ago. Both times you broke through after pairing with Priya. Want me to ping her?
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, maxWidth: '80%', alignSelf: 'flex-end', background: 'var(--ink)', color: '#fff', borderBottomRightRadius: 4 }}>
                  Yeah let's do it.
                </div>
                <div className="bubble-typing" style={{ padding: '12px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, maxWidth: '80%', alignSelf: 'flex-start', background: 'var(--surface)', border: '1px solid var(--line)', borderBottomLeftRadius: 4 }}>
                  <span className="ai-pulse" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}/>
                  Drafting message
                </div>
              </div>
            </VFrame>
          </div>
        </div>

        {/* Feature 5 — Growth Score */}
        <div className="land-feature">
          <div className="land-feature-text">
            <span className="land-feature-tag">05 · Growth Score</span>
            <h2 className="land-feature-h">Five dimensions. Twelve weeks. One shape.</h2>
            <p className="land-feature-p">Productivity, initiative, communication, ownership, learning velocity — tracked weekly. See what's compounding. See what's stalling. The shape doesn't lie.</p>
            <ul className="land-feature-list">
              <li><span className="land-feature-li-i">✓</span>Toggle dimensions — isolate, compare, overlay</li>
              <li><span className="land-feature-li-i">✓</span>Set targets — Steppr surfaces the gap</li>
              <li><span className="land-feature-li-i">✓</span>Weekly rubric, calibrated to your role</li>
            </ul>
          </div>
          <div className="land-feature-visual">
            <VFrame url="growth · 14-week trend">
              <MockGrowth/>
            </VFrame>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section className="land-wrap" id="demo">
        <div className="land-demo-block">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div className="land-section-eyebrow">Try it inline</div>
            <h2 className="land-section-h2" style={{ margin: '12px auto', maxWidth: '24ch' }}>Type one sentence. Watch Steppr think.</h2>
            <p className="land-section-sub" style={{ margin: '0 auto' }}>No signup, no install. Drop a real moment from your week and see the wins, tags, people, and one-line summary appear live.</p>
          </div>
          <div className="land-demo-grid">
            <div>
              <label style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Your daily log</label>
              <textarea
                className="land-demo-input"
                value={demoText}
                onChange={e => setDemoText(e.target.value)}
                placeholder="e.g. Shipped the new RAG eval pipeline today…"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--ink-4)' }}>
                <span>{demoText.length} chars</span>
                <span>↑ Steppr re-extracts as you type</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>What Steppr saw</label>
              <div className="land-demo-output">
                {!extracted ? (
                  <div className="land-demo-empty">Type something to see what Steppr extracts…</div>
                ) : (
                  <>
                    <div className="land-demo-out-h">Wins detected</div>
                    <div className="land-demo-tag-row">
                      {extracted.wins.length
                        ? extracted.wins.map((w,i) => <span key={i} className="land-demo-tag">+ {w}</span>)
                        : <span className="land-demo-empty" style={{ fontSize: 12 }}>No verbs of action detected yet</span>}
                    </div>
                    <div className="land-demo-out-h" style={{ marginTop: 16 }}>Categories</div>
                    <div className="land-demo-tag-row">
                      {extracted.cats.length
                        ? extracted.cats.map((c,i) => <span key={i} className="land-demo-tag cat">{c}</span>)
                        : <span className="land-demo-empty" style={{ fontSize: 12 }}>—</span>}
                    </div>
                    <div className="land-demo-out-h" style={{ marginTop: 16 }}>People</div>
                    <div className="land-demo-tag-row">
                      {extracted.people.length
                        ? extracted.people.map((p,i) => <span key={i} className="land-demo-tag peo">{p}</span>)
                        : <span className="land-demo-empty" style={{ fontSize: 12 }}>—</span>}
                    </div>
                    <div className="land-demo-summary"><strong>Theme of the day:</strong> {extracted.theme}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CINEMATIC STRIP */}
      <section className="land-wrap">
        <div className="land-cinematic">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 12, fontWeight: 600, color: '#FFB81C' }}>14 weeks · the average user</div>
            <h2 style={{ marginTop: 16, fontSize: 'clamp(36px, 5.4vw, 72px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.0, margin: '16px auto 0', maxWidth: '18ch' }}>
              Goes from <span className="land-cin-grad">scattered</span> to <span className="land-cin-grad">a portfolio they can show.</span>
            </h2>
            <div className="land-cinematic-bar">
              <div><strong>+24%</strong>productivity</div>
              <div><strong>2.1×</strong>wins logged</div>
              <div><strong>−40%</strong>time on weekly reports</div>
              <div><strong>3 min</strong>average daily check-in</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <section className="land-wrap land-section">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="land-section-eyebrow">More to explore</div>
          <h2 className="land-section-h2" style={{ margin: '12px auto 0' }}>Six tools, one quiet flow.</h2>
        </div>
        <div className="land-bento">
          <div className="land-bento-c wide tall" style={{ background: 'linear-gradient(160deg, var(--accent-tint), var(--surface))' }}>
            <div>
              <div className="land-bento-h">Wins Vault</div>
              <div className="land-bento-p">Every shipped thing, searchable forever. Filter by quarter, person, or theme.</div>
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 88, lineHeight: 0.85, color: 'var(--accent-2)', opacity: 0.3 }}>237</div>
          </div>
          <div className="land-bento-c">
            <div>
              <div className="land-bento-h">Voice mode</div>
              <div className="land-bento-p">90 seconds, transcribed locally.</div>
            </div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 36 }}>
              {[40,70,90,60,80,50,75,65,95,55].map((h,i) => (
                <div key={i} style={{ width: 4, height: `${h}%`, background: 'var(--accent)', borderRadius: 2 }}/>
              ))}
            </div>
          </div>
          <div className="land-bento-c dark">
            <div>
              <div className="land-bento-h" style={{ color: '#fff' }}>Local-first AI</div>
              <div className="land-bento-p">Gemma, Llama, Phi, Qwen — pick yours.</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              <div>$ steppr local --model gemma-2b</div>
              <div style={{ color: '#FFB81C' }}>✓ running on-device</div>
            </div>
          </div>
          <div className="land-bento-c wide">
            <div>
              <div className="land-bento-h">Weekly cadence</div>
              <div className="land-bento-p">Sun review · Mon plan · Fri report — all auto-prepped.</div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {['SUN','MON','TUE','WED','THU','FRI'].map(d => (
                <div key={d} style={{ flex: 1, padding: 8, borderRadius: 8, background: (d==='MON'||d==='FRI') ? 'var(--accent-tint)' : 'var(--bg-2)', color: (d==='MON'||d==='FRI') ? 'var(--accent-2)' : 'inherit', fontSize: 10, textAlign: 'center', fontWeight: (d==='MON'||d==='FRI') ? 600 : 400 }}>{d}</div>
              ))}
            </div>
          </div>
          <div className="land-bento-c">
            <div>
              <div className="land-bento-h">Wins → Promo Packet</div>
              <div className="land-bento-p">One click, one PDF, ready for review season.</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--accent-2)', marginTop: 8 }}>PROMO_PACKET_Q1.pdf →</div>
          </div>
          <div className="land-bento-c wide" style={{ background: 'var(--bg-2)' }}>
            <div>
              <div className="land-bento-h">Manager opt-in only</div>
              <div className="land-bento-p">Your manager only sees what you choose to send. No automatic surveillance, ever.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span className="chip" style={{ background: 'var(--surface)' }}><Icons.Eye size={13}/>Private vault</span>
              <span className="chip" style={{ background: 'var(--surface)' }}><Icons.Send size={13}/>Send when ready</span>
            </div>
          </div>
          <div className="land-bento-c">
            <div>
              <div className="land-bento-h">Full history export</div>
              <div className="land-bento-p">Markdown, JSON, or LaTeX. Yours, always.</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS MARQUEE */}
      <section style={{ padding: '64px 0' }} id="stories">
        <div className="land-wrap" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="land-section-eyebrow">In their words</div>
          <h2 className="land-section-h2" style={{ margin: '12px auto' }}>The check-in went different this time.</h2>
        </div>
        <div className="land-marquee">
          <div className="land-marquee-track">
            {[...TESTIS.slice(0,4), ...TESTIS.slice(0,4)].map((t,i) => <QuoteCard key={i} t={t}/>)}
          </div>
        </div>
        <div className="land-marquee" style={{ marginTop: 16 }}>
          <div className="land-marquee-track land-marquee-track-2">
            {[...TESTIS.slice(4), ...TESTIS.slice(4)].map((t,i) => <QuoteCard key={i} t={t}/>)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="land-wrap land-section" id="faq">
        <div style={{ textAlign: 'center' }}>
          <div className="land-section-eyebrow">FAQ</div>
          <h2 className="land-section-h2" style={{ margin: '12px auto' }}>Questions, mostly.</h2>
        </div>
        <div className="land-faq-wrap">
          {FAQS.map((faq, i) => (
            <div key={i} className={`land-faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="land-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                {faq.q}
                <span className="land-faq-plus">+</span>
              </button>
              <div className="land-faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BIG CTA */}
      <section className="land-wrap">
        <div className="land-big-cta">
          <h2 className="land-big-cta-h">Sunday-night you<br/>will thank you.</h2>
          <p className="land-big-cta-sub">Set it up tonight. Friday morning, the report is waiting.</p>
          <div className="land-big-cta-row">
            <button className="land-btn-accent" onClick={() => onSignUp ? onSignUp() : setRoute('onboarding')}>
              Start free — 60 seconds {ARROW}
            </button>
            <button className="land-btn-secondary" onClick={() => onSignIn ? onSignIn() : setRoute('dashboard')}>
              See the live app
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="land-wrap land-footer">
        <div className="land-foot-row">
          <div className="land-foot-col" style={{ maxWidth: 320 }}>
            <div className="land-logo" style={{ marginBottom: 16 }}>{LOGO_SVG} Steppr</div>
            <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5 }}>A working memory for your career. Three minutes a day, two versions of every report, a return-offer signal you can trust.</div>
          </div>
          <div className="land-foot-col">
            <h5>Product</h5>
            <a href="#features" onClick={e => { e.preventDefault(); handleScrollTo('features') }}>Features</a>
            <a href="#demo" onClick={e => { e.preventDefault(); handleScrollTo('demo') }}>Live demo</a>
            <a href="#" onClick={e => { e.preventDefault(); onSignIn ? onSignIn() : setRoute('dashboard') }}>Open app</a>
            <a href="#faq" onClick={e => { e.preventDefault(); handleScrollTo('faq') }}>FAQ</a>
          </div>
          <div className="land-foot-col">
            <h5>Company</h5>
            <a href="#">About</a><a href="#">Manifesto</a><a href="#">Careers</a><a href="#">Press</a>
          </div>
          <div className="land-foot-col">
            <h5>Resources</h5>
            <a href="#">Help center</a><a href="#">Privacy</a><a href="#">Security</a><a href="#">Status</a>
          </div>
        </div>
        <div className="land-foot-bottom">
          <div>© 2026 Steppr Labs.</div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--ink-5)' }}>v0.4.2 · Earnest Fern</div>
        </div>
      </footer>
    </div>
  )
}
