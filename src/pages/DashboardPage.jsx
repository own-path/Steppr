import React, { useEffect, useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { useCountUp, Sparkline, useToast } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useCurrentUser } from '../hooks/useCurrentUser'

function PixelLockup({ text, style }) {
  return <div className="pixel-display" style={style}>{text}</div>;
}

function StatCard({ icon, label, value, suffix = '', delta, color = 'var(--accent)', spark }) {
  const I = Icons;
  const Ic = I[icon];
  const v = useCountUp(value, 1100);
  return (
    <div className="card lift" style={{ padding: 22 }}>
      <div className="between" style={{ marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic size={18}/></div>
        {delta !== undefined && (
          <span className="chip" style={{ background: delta >= 0 ? 'var(--accent-tint)' : 'var(--rose-soft)', color: delta >= 0 ? 'var(--accent-2)' : '#9F1239', borderColor: 'transparent' }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 4 }}>{v}{suffix}</div>
      {spark && <div style={{ marginTop: 12 }}><Sparkline data={spark} color={color}/></div>}
    </div>
  );
}

function Heatmap() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weeks = 14;
  const grid = useMemo(() => Array.from({length: weeks}, (_, w) => Array.from({length: 7}, (_, d) => {
    const seed = (w * 7 + d) * 9301 + 49297;
    return Math.abs(Math.sin(seed)) ;
  })), []);
  const cellColor = (v) => {
    if (v < 0.2) return 'var(--bg-3)';
    if (v < 0.4) return '#E6ECF8';
    if (v < 0.6) return '#C8D5EE';
    if (v < 0.8) return '#1D4ED8';
    return '#003594';
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'space-between' }}>
        {days.map((d, i) => <div key={d} style={{ flex: 1, fontSize: 10, color: 'var(--ink-4)', display: 'flex', alignItems: 'center' }}>{i % 2 ? d : ''}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 4, width: '100%' }}>
        {grid.map((col, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {col.map((v, d) => (
              <div key={d} title={`${days[d]} W${w+1}: ${Math.round(v*100)}`} style={{
                width: '100%', aspectRatio: '1', borderRadius: 4, background: cellColor(v),
                transition: 'transform .2s', cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.4)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function GrowthMultiLine({ scores, active }) {
  const W = 520, H = 240, P = { l: 36, r: 18, t: 16, b: 28 };
  const weeks = scores[0].series.length;
  const xLabels = Array.from({ length: weeks }, (_, i) => `W${i + 1}`);
  const x = (i) => P.l + (i / (weeks - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - v / 100) * (H - P.t - P.b);
  const ticks = [0, 25, 50, 75, 100];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {ticks.map(t => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={t === 0 ? '0' : '3 4'}/>
          <text x={P.l - 8} y={y(t) + 4} fontSize="9" fill="var(--ink-4)" textAnchor="end" fontFamily="JetBrains Mono, ui-monospace, monospace">{t}</text>
        </g>
      ))}
      {xLabels.map((lb, i) => (i % 2 === 0 || i === weeks - 1) && (
        <text key={i} x={x(i)} y={H - 8} fontSize="9" fill="var(--ink-4)" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace">{lb}</text>
      ))}
      {scores.map(s => {
        const isActive = active.has(s.key);
        const d = s.series.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
        return (
          <g key={s.key} style={{ opacity: isActive ? 1 : 0.06, transition: 'opacity .25s' }}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
            <circle cx={x(weeks - 1)} cy={y(s.series[weeks - 1])} r="4" fill="#fff" stroke={s.color} strokeWidth="2.2"/>
            <text x={x(weeks - 1) + 8} y={y(s.series[weeks - 1]) + 4} fontSize="10" fontWeight="700" fill={s.color}>{s.series[weeks - 1]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function GrowthScoreCard({ scores }) {
  const I = Icons;
  const [active, setActive] = useState(new Set(scores.map(s => s.key)));
  useEffect(() => setActive(new Set(scores.map(s => s.key))), [scores]);
  const overall = scores.length ? Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length) : 0;
  const overallSeries = scores[0]?.series?.map((_, i) => Math.round(scores.reduce((a, s) => a + s.series[i], 0) / scores.length)) || [0];
  const trend = overallSeries[overallSeries.length - 1] - overallSeries[0];
  const toggle = (k) => {
    setActive(prev => {
      const n = new Set(prev);
      if (n.has(k)) { if (n.size > 1) n.delete(k); }
      else n.add(k);
      return n;
    });
  };
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div className="between" style={{ marginBottom: 14 }}>
        <div>
          <div className="eyebrow">Growth score</div>
          <div className="row items-baseline gap-3" style={{ marginTop: 4 }}>
            <div className="h2" style={{ fontSize: 38, lineHeight: 1 }}>{overall}</div>
            <span className="chip" style={{ background: 'var(--accent-tint)', color: 'var(--accent-2)', borderColor: 'transparent' }}>↑ {trend} over 12 wks</span>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ padding: '4px 10px' }}>Details <I.Chevron size={12}/></button>
      </div>

      <div style={{ flex: 1, marginTop: 4 }}>
        {scores.length ? <GrowthMultiLine scores={scores} active={active}/> : <div className="muted">No growth scores in Convex yet.</div>}
      </div>

      <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        {scores.map(s => {
          const on = active.has(s.key);
          const last = s.series[s.series.length - 1];
          return (
            <button key={s.key} onClick={() => toggle(s.key)}
              className="row items-center gap-2"
              style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid ' + (on ? s.color + '40' : 'var(--line)'),
                background: on ? s.color + '14' : 'transparent', cursor: 'pointer', fontSize: 12,
                opacity: on ? 1 : 0.5, transition: 'all .2s' }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: s.color }}></span>
              <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{s.label}</span>
              <span style={{ color: s.color, fontWeight: 700, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{last}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPage() {
  const I = Icons;
  const toast = useToast();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { user } = useCurrentUser();
  const wins = useQuery(api.appData.listWins);
  const scores = useQuery(api.appData.listGrowthScores);

  if (wins === undefined || scores === undefined) {
    return <div className="center" style={{ minHeight: 'calc(100vh - 56px)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/></div>
  }

  const statCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const mainCols = isDesktop ? '1.4fr 1fr' : '1fr';
  const bottomCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1.2fr 1fr 1fr';

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      {/* Hero */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {!isMobile && <PixelLockup text="STEPPR" style={{ position: 'absolute', right: -8, top: -22, fontSize: 'clamp(60px, 9vw, 140px)' }}/>}
        <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--accent-2)' }}>Week 3 · Momentum strong</div>
        <h1 className="h1" style={{ fontSize: isMobile ? 'clamp(28px,6vw,36px)' : 'clamp(36px, 4.4vw, 56px)', maxWidth: 720 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'there'}.<br/>
          <span style={{ color: 'var(--ink-4)' }}>You shipped {wins.length} wins this week.</span>
        </h1>
        <div className="row gap-2" style={{ marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn btn-accent"><I.Plus size={14}/> Log today</button>
          <button className="btn"><I.Mic size={14}/> Voice note</button>
          <button className="btn"><I.Spark size={14}/> Ask coach</button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid" style={{ gridTemplateColumns: statCols, gap: 16, marginBottom: 16 }}>
        <StatCard icon="Bolt" label="Momentum" value={86} suffix="" delta={+4} color="#003594" spark={[40,55,48,62,70,68,82,86]}/>
        <StatCard icon="Flame" label="Day streak" value={18} delta={+12} color="#F59E0B" spark={[2,4,6,8,10,12,15,18]}/>
        <StatCard icon="Trophy" label="Wins this week" value={7} delta={+40} color="#8B5CF6" spark={[3,4,5,4,6,7,6,7]}/>
        <StatCard icon="Brain" label="Learning velocity" value={91} delta={+6} color="#4F46E5" spark={[60,68,72,78,80,85,88,91]}/>
      </div>

      {/* Main grid */}
      <div className="grid" style={{ gridTemplateColumns: mainCols, gap: 16, marginBottom: 16 }}>
        {/* Today focus */}
        <div className="card" style={{ padding: 24 }}>
          <div className="between" style={{ marginBottom: 18 }}>
            <div>
              <div className="eyebrow">Today's focus</div>
              <div className="h2" style={{ marginTop: 4 }}>Three moves that matter</div>
            </div>
            <button className="btn btn-ghost"><I.Sliders size={14}/> Reorder</button>
          </div>
          <div className="col gap-3">
            {[
              { n: '01', t: 'Finalize RAG eval v2 multi-doc benchmarks', meta: 'Est. 2h · High impact', color: '#003594' },
              { n: '02', t: 'Send draft of Week 3 report to Maya', meta: 'Due 3 PM Friday', color: '#06B6D4' },
              { n: '03', t: 'Pair with Priya on dataloader refactor', meta: '30m · Mentorship win', color: '#8B5CF6' },
            ].map(it => (
              <div key={it.n} className="row items-center gap-4" style={{ padding: 16, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
                <div className="font-pixel" style={{ fontSize: 36, color: it.color, lineHeight: 1, width: 56 }}>{it.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{it.t}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{it.meta}</div>
                </div>
                <button className="btn btn-ghost" style={{ padding: 8, borderRadius: 999 }}><I.ArrowRight size={16}/></button>
              </div>
            ))}
          </div>
          <div className="row items-center gap-2" style={{ marginTop: 18, padding: 14, borderRadius: 14, background: 'var(--accent-tint)', border: '1px solid var(--line-2)' }}>
            <I.Spark size={16} stroke="var(--accent-2)"/>
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong style={{ color: 'var(--accent-2)' }}>Suggested next move:</strong> You perform strongest after planning mornings — block 9–10 AM tomorrow for the eval push.
            </div>
            <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => toast('Added to tomorrow')}>Apply</button>
          </div>
        </div>

        {/* Growth scores */}
        <GrowthScoreCard scores={scores}/>
      </div>

      {/* Wins timeline + heatmap + AI insight */}
      <div className="grid" style={{ gridTemplateColumns: bottomCols, gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div className="h3">Recent wins</div>
            <button className="btn btn-ghost" style={{ padding: '4px 10px' }}>All wins <I.Chevron size={12}/></button>
          </div>
          <div className="col gap-3">
            {wins.slice(0,4).map((w, i) => (
              <div key={w._id} className="row gap-3" style={{ paddingBottom: 12, borderBottom: i < Math.min(3, wins.length - 1) ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{w.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{w.detail}</div>
                  <div className="row gap-2" style={{ marginTop: 6 }}>
                    <span className="chip">{w.tag}</span>
                    <span className="chip" style={{ background: 'transparent', borderColor: 'var(--line)' }}>{w.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="h3" style={{ marginBottom: 14 }}>Activity heatmap</div>
          <Heatmap/>
          <div className="row items-center gap-2" style={{ marginTop: 16, fontSize: 11, color: 'var(--ink-4)' }}>
            Less
            {['var(--bg-3)','#E6ECF8','#C8D5EE','#1D4ED8','#003594'].map(c => (
              <span key={c} style={{ width: 12, height: 12, borderRadius: 3, background: c }}></span>
            ))}
            More
          </div>
        </div>
        <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #14120E 0%, #2B2823 100%)', color: '#fff', borderColor: 'transparent' }}>
          <div className="row items-center gap-2" style={{ marginBottom: 14 }}>
            <span className="ai-pulse"></span>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>AI insight</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.015em' }}>
            "You perform strongest after planning mornings — and your Tuesday/Thursday output is <span style={{ color: '#FFB81C' }}>2.1× higher</span> than Monday/Wednesday."
          </div>
          <div className="row gap-2" style={{ marginTop: 18 }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.18)' }}>Why?</button>
            <button className="btn" style={{ background: '#FFB81C', color: '#fff', borderColor: '#E6A318' }}>Apply pattern</button>
          </div>
        </div>
      </div>
      <div className="dock-spacer"></div>
    </div>
  );
}

export default DashboardPage;
