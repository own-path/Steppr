import React, { useMemo } from 'react'
import Icons from '../components/Icons'
import { Sparkline } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

function LineChart({ data, color = 'var(--accent)', height = 200, fill = true, dashed = false }) {
  const W = 560, H = height, P = { l: 32, r: 16, t: 14, b: 24 };
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const x = (i) => P.l + (i/(data.length-1))*(W - P.l - P.r);
  const y = (v) => P.t + (1 - (v-min)/range) * (H - P.t - P.b);
  const pts = data.map((v, i) => [x(i), y(v)]);
  const d = pts.map((p, i) => (i===0?`M${p[0].toFixed(1)},${p[1].toFixed(1)}`:`L${p[0].toFixed(1)},${p[1].toFixed(1)}`)).join(' ');
  const area = `${d} L${pts[pts.length-1][0]},${H-P.b} L${pts[0][0]},${H-P.b} Z`;
  const gid = `g-${color.replace(/[^a-zA-Z0-9]/g,'')}-${data.length}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,1,2,3].map(i => <line key={i} x1={P.l} x2={W-P.r} y1={P.t + (H-P.t-P.b)*i/3} y2={P.t + (H-P.t-P.b)*i/3} stroke="var(--line)" strokeDasharray="3 4"/>)}
      {[max, Math.round((max+min)/2), min].map((v, i) => (
        <text key={i} x={P.l - 6} y={P.t + (H-P.t-P.b)*i/2 + 4} fontSize="9" fill="var(--ink-4)" textAnchor="end" fontFamily="JetBrains Mono, ui-monospace, monospace">{v}</text>
      ))}
      {fill && <path d={area} fill={`url(#${gid})`}/>}
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '5 4' : '0'} vectorEffect="non-scaling-stroke"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill="#fff" stroke={color} strokeWidth="2.2"/>
      <text x={pts[pts.length-1][0] - 6} y={pts[pts.length-1][1] - 8} fontSize="11" fontWeight="700" fill={color} textAnchor="end">{data[data.length-1]}</text>
    </svg>
  );
}

function BarChart({ data, color = 'var(--violet)', height = 200, labels }) {
  const W = 560, H = height, P = { l: 32, r: 16, t: 14, b: 28 };
  const max = Math.max(...data);
  const innerW = W - P.l - P.r;
  const slot = innerW / data.length;
  const bw = slot - 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
      {[0,1,2,3].map(i => <line key={i} x1={P.l} x2={W-P.r} y1={P.t + (H-P.t-P.b)*i/3} y2={P.t + (H-P.t-P.b)*i/3} stroke="var(--line)" strokeDasharray="3 4"/>)}
      {data.map((v, i) => {
        const h = (v / max) * (H - P.t - P.b);
        const x = P.l + i*slot + 3;
        return (
          <g key={i}>
            <rect x={x} y={H-P.b-h} width={bw} height={h} rx="4" fill={color} opacity={i === data.length - 1 ? 1 : 0.7}/>
            {labels && <text x={x + bw/2} y={H - 8} fontSize="9" fill="var(--ink-4)" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace">{labels[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function ScatterChart({ data, height = 200 }) {
  const W = 560, H = height, P = { l: 32, r: 16, t: 14, b: 28 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
      {[0,1,2,3].map(i => <line key={i} x1={P.l} x2={W-P.r} y1={P.t + (H-P.t-P.b)*i/3} y2={P.t + (H-P.t-P.b)*i/3} stroke="var(--line)" strokeDasharray="3 4"/>)}
      <text x={P.l - 6} y={P.t + 6} fontSize="9" fill="var(--ink-4)" textAnchor="end">High</text>
      <text x={P.l - 6} y={H - P.b + 2} fontSize="9" fill="var(--ink-4)" textAnchor="end">Low</text>
      <text x={P.l + 4} y={H - 8} fontSize="9" fill="var(--ink-4)">Low mood</text>
      <text x={W - P.r - 4} y={H - 8} fontSize="9" fill="var(--ink-4)" textAnchor="end">High mood</text>
      <line x1={P.l + 20} y1={H - P.b - 20} x2={W - P.r - 20} y2={P.t + 30} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4"/>
      {data.map((d, i) => (
        <circle key={i} cx={P.l + d.x*(W-P.l-P.r)} cy={H-P.b - d.y*(H-P.t-P.b)} r={3 + d.r*4} fill="#003594" opacity={0.55}/>
      ))}
    </svg>
  );
}

function ActivityHeat({ height = 200 }) {
  const W = 560, H = height, P = { l: 36, r: 12, t: 12, b: 24 };
  const days = ['Mon','Tue','Wed','Thu','Fri'];
  const hours = [9,10,11,12,13,14,15,16,17,18];
  const cellW = (W - P.l - P.r) / hours.length;
  const cellH = (H - P.t - P.b) / days.length;
  const seed = (d, h) => {
    const a = Math.sin((d * 13.7 + h * 7.3)) * 0.5 + 0.5;
    let mult = 1;
    if (d === 1 && h >= 9 && h <= 11) mult = 1.6;
    if (d === 3 && h >= 14 && h <= 16) mult = 1.5;
    if (h === 12) mult = 0.4;
    return Math.min(1, a * mult);
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
      {days.map((d, di) => (
        <text key={d} x={P.l - 6} y={P.t + cellH*di + cellH/2 + 4} fontSize="10" fill="var(--ink-4)" textAnchor="end" fontFamily="JetBrains Mono, ui-monospace, monospace">{d}</text>
      ))}
      {hours.map((h, hi) => (
        (hi % 2 === 0) && <text key={h} x={P.l + cellW*hi + cellW/2} y={H - 8} fontSize="9" fill="var(--ink-4)" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace">{h}</text>
      ))}
      {days.map((d, di) => hours.map((h, hi) => {
        const v = seed(di, hi);
        const a = Math.max(0.06, v);
        return <rect key={`${di}-${hi}`} x={P.l + cellW*hi + 1.5} y={P.t + cellH*di + 1.5} width={cellW - 3} height={cellH - 3} rx="3" fill="#003594" opacity={a}/>;
      }))}
    </svg>
  );
}

function StackedBar({ height = 200 }) {
  const W = 560, H = height, P = { l: 32, r: 90, t: 14, b: 28 };
  const weeks = ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'];
  const cats = [
    { k: 'Build',    color: '#003594' },
    { k: 'Review',   color: '#06B6D4' },
    { k: 'Meet',     color: '#F59E0B' },
    { k: 'Learn',    color: '#8B5CF6' },
    { k: 'Mentor',   color: '#EC4899' },
  ];
  const data = weeks.map((w, i) => ({
    Build: 18 + Math.round(Math.sin(i*0.6)*3 + i*0.4),
    Review: 6 + (i%3),
    Meet: 8 - Math.round(i*0.2),
    Learn: 4 + Math.round(Math.cos(i*0.5)*2 + i*0.3),
    Mentor: i < 4 ? 1 : 2 + (i%2),
  }));
  const max = Math.max(...data.map(d => cats.reduce((a, c) => a + d[c.k], 0)));
  const slot = (W - P.l - P.r) / weeks.length;
  const bw = slot - 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
      {[0,1,2,3].map(i => <line key={i} x1={P.l} x2={W-P.r} y1={P.t + (H-P.t-P.b)*i/3} y2={P.t + (H-P.t-P.b)*i/3} stroke="var(--line)" strokeDasharray="3 4"/>)}
      {data.map((d, i) => {
        let acc = 0;
        return cats.map((c, ci) => {
          const h = (d[c.k] / max) * (H - P.t - P.b);
          const yPos = H - P.b - acc - h;
          acc += h;
          return <rect key={`${i}-${c.k}`} x={P.l + i*slot + 2} y={yPos} width={bw} height={h} fill={c.color} opacity="0.92"
            rx={ci === cats.length - 1 ? 4 : 0}/>;
        });
      })}
      {weeks.map((w, i) => (i % 2 === 0 || i === weeks.length - 1) && (
        <text key={w} x={P.l + i*slot + bw/2 + 2} y={H - 8} fontSize="9" fill="var(--ink-4)" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace">{w}</text>
      ))}
      {cats.map((c, i) => (
        <g key={c.k} transform={`translate(${W - P.r + 8}, ${P.t + i*22})`}>
          <rect width="12" height="12" rx="3" fill={c.color}/>
          <text x="18" y="10" fontSize="11" fill="var(--ink-2)">{c.k}</text>
        </g>
      ))}
    </svg>
  );
}

function Donut({ items, size = 180 }) {
  const total = items.reduce((a, x) => a + x.v, 0);
  const r = size/2 - 14, R = size/2;
  let acc = 0;
  return (
    <div className="row gap-4 items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {items.map((it, i) => {
          const a0 = (acc / total) * Math.PI * 2 - Math.PI/2;
          acc += it.v;
          const a1 = (acc / total) * Math.PI * 2 - Math.PI/2;
          const x0 = R + r * Math.cos(a0), y0 = R + r * Math.sin(a0);
          const x1 = R + r * Math.cos(a1), y1 = R + r * Math.sin(a1);
          const large = (a1 - a0) > Math.PI ? 1 : 0;
          const xi0 = R + (r-18) * Math.cos(a0), yi0 = R + (r-18) * Math.sin(a0);
          const xi1 = R + (r-18) * Math.cos(a1), yi1 = R + (r-18) * Math.sin(a1);
          return <path key={i} d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r-18} ${r-18} 0 ${large} 0 ${xi0} ${yi0} Z`} fill={it.color}/>;
        })}
        <text x={R} y={R - 2} textAnchor="middle" fontSize="11" fill="var(--ink-4)" textTransform="uppercase" fontWeight="600">Total</text>
        <text x={R} y={R + 18} textAnchor="middle" fontSize="22" fill="var(--ink)" fontWeight="700">{total}h</text>
      </svg>
      <div className="col gap-2" style={{ flex: 1 }}>
        {items.map(it => (
          <div key={it.k} className="row items-center gap-2" style={{ fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: it.color }}></span>
            <span style={{ flex: 1 }}>{it.k}</span>
            <span className="muted" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 12 }}>{it.v}h</span>
            <span style={{ width: 36, textAlign: 'right', color: 'var(--ink-3)', fontSize: 12, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{Math.round(it.v / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBar({ items }) {
  const max = Math.max(...items.map(i => i.v));
  return (
    <div className="col gap-3">
      {items.map(it => (
        <div key={it.k}>
          <div className="between" style={{ fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{it.k}</span>
            <span style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', color: 'var(--ink-3)' }}>{it.v}×</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${it.v/max*100}%`, background: it.color, borderRadius: 999, transition: 'width .8s cubic-bezier(.2,.8,.2,1)' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KPICard({ label, value, sub, delta, color, sparkline }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
      <div className="row items-baseline gap-2" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{value}</div>
        {delta !== undefined && (
          <span className="chip" style={{ background: delta >= 0 ? 'var(--accent-tint)' : 'var(--rose-soft)', color: delta >= 0 ? 'var(--accent-2)' : '#9F1239', borderColor: 'transparent', fontSize: 11 }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      {sub && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
      {sparkline && <div style={{ marginTop: 10 }}><Sparkline data={sparkline} color={color} height={32}/></div>}
    </div>
  );
}

function AnalyticsPage() {
  const I = Icons;
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const productivity = [62,66,64,70,72,68,74,78,76,80,82,79,85,86];
  const learningWeekly = [4,6,5,8,7,9,11,10,12,13,12,14];
  const ownership = [10,12,11,14,16,18,17,20,22,24,23,26,28,30];
  const opportunity = [40,42,45,48,52,55,58,60,64,68,72,76,79,84];
  const goalProj = [60,62,65,68,71,74,77,80,83,86,89,92];

  const moodVsOutput = useMemo(() =>
    Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random()*0.7 + 0.15 + Math.random()*0.15, r: Math.random() })),
  []);

  const blockers = [
    { k: 'Cluster quota / IT', v: 7, color: '#F59E0B' },
    { k: 'Code review latency', v: 5, color: '#8B5CF6' },
    { k: 'Unclear specs', v: 4, color: '#06B6D4' },
    { k: 'Meeting fragmentation', v: 4, color: '#EC4899' },
    { k: 'Eval data access', v: 3, color: '#003594' },
    { k: 'Onboarding gaps', v: 2, color: '#4F46E5' },
  ];

  const timeAlloc = [
    { k: 'Build / coding',  v: 22, color: '#003594' },
    { k: 'Review / RFCs',   v:  9, color: '#06B6D4' },
    { k: 'Meetings',        v:  6, color: '#F59E0B' },
    { k: 'Learning',        v:  7, color: '#8B5CF6' },
    { k: 'Mentoring',       v:  3, color: '#EC4899' },
  ];

  const kpiCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)';
  const featuredCols = isDesktop ? '1.6fr 1fr' : '1fr';
  const chartPairCols = isMobile ? '1fr' : '1fr 1fr';

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Analytics</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Patterns over time</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>14 weeks of data · 6 dimensions tracked</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <div className="row" style={{ background: 'var(--bg-2)', padding: 4, borderRadius: 999, border: '1px solid var(--line)' }}>
            {['30d','90d','All'].map((r, i) => (
              <button key={r} className="btn" style={{ padding: '6px 12px', borderRadius: 999, border: 'none',
                background: i === 1 ? 'var(--surface)' : 'transparent', boxShadow: i === 1 ? 'var(--shadow-sm)' : 'none' }}>{r}</button>
            ))}
          </div>
          {!isMobile && <button className="btn"><I.Filter size={14}/> Filters</button>}
          <button className="btn btn-accent"><I.Download size={14}/> Export</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid" style={{ gridTemplateColumns: kpiCols, gap: 12, marginBottom: 16 }}>
        <KPICard label="Productivity" value="86" delta={+9} color="#003594" sub="21-day avg" sparkline={productivity}/>
        <KPICard label="Wins shipped" value="42" delta={+18} color="#8B5CF6" sub="last 90 days" sparkline={[2,3,3,4,5,4,6,5,6,7,8,7]}/>
        <KPICard label="Avg week score" value="78" delta={+6} color="#06B6D4" sub="last 12 weeks" sparkline={[60,64,62,68,72,70,74,76,78,80,77,78]}/>
        <KPICard label="Deep-work hours" value="22h" delta={+12} color="#4F46E5" sub="weekly avg" sparkline={[14,15,16,18,17,19,20,21,22,21,22,22]}/>
        <KPICard label="Mood index" value="7.4" delta={-3} color="#EC4899" sub="self-reported" sparkline={[7.0,7.2,7.4,7.6,7.8,7.6,7.5,7.6,7.8,7.6,7.5,7.4]}/>
      </div>

      {/* Featured row */}
      <div className="grid" style={{ gridTemplateColumns: featuredCols, gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div className="h3">Productivity trend</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>21-day rolling average · score out of 100</div>
            </div>
            <div className="row gap-2">
              <span className="chip" style={{ background: 'var(--accent-tint)', color: 'var(--accent-2)', borderColor: 'transparent' }}>↑ 24% vs prev period</span>
            </div>
          </div>
          <LineChart data={productivity} color="#003594" height={220}/>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div className="h3">When you work best</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Day × hour · darker = more flow</div>
            </div>
          </div>
          <ActivityHeat height={220}/>
          <div className="row items-center gap-2" style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-4)' }}>
            <I.Spark size={12} stroke="var(--accent-2)"/>
            <span><strong>Tue 9–11 AM</strong> & <strong>Thu 2–4 PM</strong> are your peak windows.</span>
          </div>
        </div>
      </div>

      {/* Time allocation + Blockers */}
      <div className="grid" style={{ gridTemplateColumns: chartPairCols, gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="h3" style={{ marginBottom: 14 }}>Time allocation · this week</div>
          <Donut items={timeAlloc}/>
          <div className="row gap-2" style={{ marginTop: 18, padding: 12, background: 'var(--bg-2)', borderRadius: 12, fontSize: 12 }}>
            <I.Spark size={14} stroke="var(--accent-2)"/>
            <span><strong style={{ color: 'var(--accent-2)' }}>Suggestion:</strong> meetings dropped 31% — consider batching the freed slots into deep-work blocks.</span>
          </div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div className="h3">Top blockers</div>
            <span className="chip">25 logged in 90 days</span>
          </div>
          <HBar items={blockers}/>
        </div>
      </div>

      {/* Stacked time per category */}
      <div className="card" style={{ padding: 22, marginBottom: 16 }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div>
            <div className="h3">Time per category · 12 weeks</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Hours spent · colored stack per week</div>
          </div>
        </div>
        <StackedBar height={220}/>
      </div>

      {/* Mood vs output + Learning velocity */}
      <div className="grid" style={{ gridTemplateColumns: chartPairCols, gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div className="h3">Mood vs output</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Each dot = one day · trendline shows correlation</div>
            </div>
            <span className="chip">r = 0.62</span>
          </div>
          <ScatterChart data={moodVsOutput}/>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div className="h3">Learning velocity</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Concepts internalized per week</div>
            </div>
          </div>
          <BarChart data={learningWeekly} color="#4F46E5" labels={['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12']}/>
        </div>
      </div>

      {/* Ownership growth & Goal projection */}
      <div className="grid" style={{ gridTemplateColumns: chartPairCols, gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div className="h3">Ownership growth</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>PRs initiated + RFCs authored · cumulative</div>
            </div>
            <span className="chip chip-accent">↑ 200% over 14 wks</span>
          </div>
          <LineChart data={ownership} color="#8B5CF6"/>
        </div>
        <div className="card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div className="h3">Return-offer signal</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Composite score · projection dashed</div>
            </div>
            <span className="chip" style={{ background: 'var(--accent-tint)', color: 'var(--accent-2)', borderColor: 'transparent' }}>On track</span>
          </div>
          <div style={{ position: 'relative' }}>
            <LineChart data={[...opportunity, ...goalProj.slice(8)]} color="#06B6D4"/>
          </div>
        </div>
      </div>

      {/* Insights footer */}
      <div className="card" style={{ padding: 24, marginBottom: 16, background: 'linear-gradient(135deg, #14120E 0%, #2B2823 100%)', color: '#fff', borderColor: 'transparent' }}>
        <div className="row items-center gap-2" style={{ marginBottom: 16 }}>
          <span className="ai-pulse"></span>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>AI insights · 3 patterns detected</div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { t: 'Your "shipping mornings" are real', d: 'Code merged 9–11 AM has 3.4× lower revert rate than afternoon merges. Defend the slot.', tag: 'Behavior' },
            { t: 'Communication score is the laggard', d: 'It\'s grown 28% slower than every other dimension. One Loom per week would close the gap.', tag: 'Gap' },
            { t: 'You under-credit yourself in reports', d: 'Wins logged: 42. Wins surfaced to Maya: 19. The vault is ahead of the narrative.', tag: 'Story' },
          ].map((ins, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFB81C', borderColor: 'transparent', fontSize: 10 }}>{ins.tag}</span>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 10, lineHeight: 1.3 }}>{ins.t}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 1.5 }}>{ins.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dock-spacer"></div>
    </div>
  );
}

export default AnalyticsPage;
