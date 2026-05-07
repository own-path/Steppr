import React, { useState, useEffect, createContext, useContext } from 'react'

const COACH_PROMPTS = [
  'How do I impress my manager this week?',
  'What should I mention in standup tomorrow?',
  'Summarize my week in 3 bullets.',
  'Where am I underperforming?',
  'How do I improve visibility with senior staff?',
];

// ---------- Animated counter ----------
function useCountUp(target, duration = 900, deps = []) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start;
    const from = 0, to = Number(target) || 0;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line
  }, deps.length ? deps : [target]);
  return val;
}

// ---------- Sparkline ----------
function Sparkline({ data, color = 'var(--accent)', height = 56, fill = true }) {
  const W = 200, H = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * W, H - ((v - min) / range) * (H - 6) - 3]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const fillD = `${d} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: H }}>
      {fill && <path d={fillD} fill={color} opacity="0.14"/>}
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill="#fff" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

// ---------- Ring meter ----------
function RingMeter({ value, color = 'var(--accent)', size = 84, stroke = 8, label, sub }) {
  const v = useCountUp(value, 1100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-3)" strokeWidth={stroke} fill="none"/>
          <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                  strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18 }}>{v}</div>
      </div>
      {label && <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' }}>{label}</div>}
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{sub}</div>}
    </div>
  );
}

// ---------- Avatar ----------
function Avatar({ initials = 'DK', size = 32, color = '#14120E' }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
      fontSize: size * 0.4, letterSpacing: '-0.02em' }}>{initials}</div>
  );
}

// ---------- Toast ----------
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = (msg, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, msg, kind }]);
    setTimeout(() => setItems((s) => s.filter(t => t.id !== id)), 2400);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', bottom: 130, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
        {items.map(t => (
          <div key={t.id} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, animation: 'pageIn .25s' }}>
            <span className="ai-pulse"></span>
            <span style={{ fontSize: 13 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

// ---------- Confetti ----------
function fireConfetti(x, y) {
  const colors = ['#FFB81C', '#003594', '#1D4ED8', '#8B5CF6', '#E6A318'];
  for (let i = 0; i < 28; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:8px;height:8px;border-radius:2px;background:${colors[i%5]};pointer-events:none;z-index:99999;`;
    document.body.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const vel = 80 + Math.random() * 220;
    const dx = Math.cos(angle) * vel;
    const dy = Math.sin(angle) * vel - 120;
    el.animate([
      { transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy + 400}px) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], { duration: 1100 + Math.random()*400, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => el.remove();
  }
}

export { COACH_PROMPTS, useCountUp, Sparkline, RingMeter, Avatar, ToastProvider, useToast, fireConfetti };
