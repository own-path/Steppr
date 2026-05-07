import React, { useEffect, useRef, useState, useMemo } from 'react'
import Icons from '../components/Icons'
import { useBreakpoint } from '../hooks/useBreakpoint'

// Navy + amber scale
const NODE_TYPES = {
  goal:     { color: '#002570', label: 'Goals' },
  project:  { color: '#003594', label: 'Projects' },
  skill:    { color: '#1D4ED8', label: 'Skills' },
  win:      { color: '#FFB81C', label: 'Wins' },
  blocker:  { color: '#E6A318', label: 'Blockers' },
  tool:     { color: '#4A5C7A', label: 'Tools' },
  person:   { color: '#7A8CA8', label: 'People' },
  risk:     { color: '#C8D5EE', label: 'Risks' },
};

const NODES = [
  { id: 'g_offer',    type: 'goal', label: 'Earn return offer', size: 22 },
  { id: 'p_rag',      type: 'project', label: 'RAG eval v2', size: 20 },
  { id: 'p_router',   type: 'project', label: 'Router merge', size: 16 },
  { id: 'p_lora',     type: 'project', label: 'LoRA sweep', size: 16 },
  { id: 's_python',   type: 'skill', label: 'Python', size: 14 },
  { id: 's_torch',    type: 'skill', label: 'PyTorch', size: 16 },
  { id: 's_eval',     type: 'skill', label: 'Eval design', size: 18 },
  { id: 's_writing',  type: 'skill', label: 'Tech writing', size: 14 },
  { id: 's_present',  type: 'skill', label: 'Presenting', size: 12 },
  { id: 'w_4x',       type: 'win', label: '4× eval speedup', size: 14 },
  { id: 'w_regress',  type: 'win', label: 'Caught regression', size: 12 },
  { id: 'w_rfc',      type: 'win', label: 'Token-budget RFC', size: 12 },
  { id: 'w_mentor',   type: 'win', label: 'Mentored Priya', size: 11 },
  { id: 't_wandb',    type: 'tool', label: 'wandb', size: 11 },
  { id: 't_torch',    type: 'tool', label: 'torch.profiler', size: 11 },
  { id: 't_slurm',    type: 'tool', label: 'SLURM', size: 11 },
  { id: 'b_quota',    type: 'blocker', label: 'Cluster quota', size: 12 },
  { id: 'b_evalset',  type: 'blocker', label: 'Eval set v3 access', size: 11 },
  { id: 'pe_maya',    type: 'person', label: 'Maya (mgr)', size: 14 },
  { id: 'pe_priya',   type: 'person', label: 'Priya', size: 11 },
  { id: 'pe_jonas',   type: 'person', label: 'Jonas (staff)', size: 12 },
  { id: 'r_visibility', type: 'risk', label: 'Low visibility', size: 11 },
];

const EDGES = [
  ['p_rag','s_eval'], ['p_rag','s_torch'], ['p_rag','t_torch'], ['p_rag','t_wandb'],
  ['p_rag','w_4x'], ['w_4x','g_offer'], ['p_rag','pe_maya'], ['p_rag','b_quota'],
  ['p_router','w_regress'], ['p_router','s_eval'], ['w_regress','pe_maya'],
  ['p_lora','s_torch'], ['p_lora','t_slurm'], ['p_lora','t_wandb'], ['p_lora','b_quota'],
  ['s_writing','w_rfc'], ['w_rfc','pe_jonas'], ['w_rfc','g_offer'],
  ['s_present','pe_maya'], ['s_present','g_offer'],
  ['w_mentor','pe_priya'], ['w_mentor','g_offer'],
  ['b_evalset','p_rag'], ['r_visibility','g_offer'], ['s_python','s_torch'],
];

function KnowledgeGraphPage() {
  const I = Icons;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState('p_rag');
  const [filter, setFilter] = useState(new Set(Object.keys(NODE_TYPES)));
  const [week, setWeek] = useState(3);
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState(1.0);
  const stateRef = useRef(null);
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  // init nodes with positions
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const cont = containerRef.current;
    const W = cont.clientWidth, H = cont.clientHeight;
    c.width = W * devicePixelRatio; c.height = H * devicePixelRatio;
    c.style.width = W + 'px'; c.style.height = H + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const nodes = NODES.map((n, i) => {
      const a = (i / NODES.length) * Math.PI * 2;
      const r = 180 + Math.random() * 60;
      return { ...n, x: W/2 + Math.cos(a) * r, y: H/2 + Math.sin(a) * r, vx: 0, vy: 0 };
    });
    const idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
    const edges = EDGES.map(([a,b]) => ({ a: idx[a], b: idx[b] }));
    const particles = edges.map(() => ({ t: Math.random() }));

    let dragging = null;
    let mouse = { x: 0, y: 0, down: false };

    const onMove = (e) => {
      const rect = c.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      let hit = null;
      for (const n of nodes) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        if (dx*dx + dy*dy < (n.size+8)**2) { hit = n.id; break; }
      }
      setHover(hit);
      c.style.cursor = hit ? 'pointer' : 'default';
      if (dragging) {
        dragging.x = mouse.x; dragging.y = mouse.y; dragging.vx = 0; dragging.vy = 0;
      }
    };
    const onDown = (e) => {
      e.preventDefault();
      mouse.down = true;
      for (const n of nodes) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        if (dx*dx + dy*dy < (n.size+10)**2) { dragging = n; setSelected(n.id); c.style.cursor = 'grabbing'; break; }
      }
    };
    const onUp = () => { mouse.down = false; dragging = null; c.style.cursor = 'default'; };
    c.addEventListener('mousemove', onMove);
    c.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    stateRef.current = { nodes, edges, particles, idx };

    let raf;
    const step = () => {
      const filterSet = stateRef.current.filterSet || filter;
      const motion = stateRef.current.motion ?? 1;
      const dens = stateRef.current.density ?? 1.0;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]; if (a === dragging) continue;
        for (let j = i+1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d2 = dx*dx + dy*dy + 0.01;
          const d = Math.sqrt(d2);
          const f = (1800 / dens) / d2;
          a.vx -= (dx/d) * f * 0.5; a.vy -= (dy/d) * f * 0.5;
          b.vx += (dx/d) * f * 0.5; b.vy += (dy/d) * f * 0.5;
        }
        a.vx += (W/2 - a.x) * 0.0008;
        a.vy += (H/2 - a.y) * 0.0008;
      }
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx*dx + dy*dy) || 1;
        const target = 110 / dens;
        const f = (d - target) * 0.018;
        if (a !== dragging) { a.vx += (dx/d) * f; a.vy += (dy/d) * f; }
        if (b !== dragging) { b.vx += (-dx/d) * f * -1 - 2*(dx/d)*f; b.vy += (-dy/d)*f*-1 - 2*(dy/d)*f; }
      }
      for (const n of nodes) {
        if (n === dragging) continue;
        n.vx *= 0.86; n.vy *= 0.86;
        n.x += n.vx * 0.03; n.y += n.vy * 0.03;
        n.x = Math.max(40, Math.min(W-40, n.x));
        n.y = Math.max(40, Math.min(H-40, n.y));
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(20,18,14,0.05)';
      for (let x = 30; x < W; x += 30) {
        for (let y = 30; y < H; y += 30) {
          ctx.beginPath(); ctx.arc(x, y, 0.7, 0, Math.PI*2); ctx.fill();
        }
      }

      for (let ei = 0; ei < edges.length; ei++) {
        const e = edges[ei];
        const a = nodes[e.a], b = nodes[e.b];
        const visA = filterSet.has(a.type), visB = filterSet.has(b.type);
        if (!visA || !visB) continue;
        const isHi = (selected && (a.id === selected || b.id === selected)) || (hover && (a.id === hover || b.id === hover));
        ctx.strokeStyle = isHi ? 'rgba(0,53,148,0.5)' : 'rgba(20,18,14,0.10)';
        ctx.lineWidth = isHi ? 1.6 : 0.9;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

        const p = particles[ei];
        p.t += 0.005 * motion * (isHi ? 2.2 : 1);
        if (p.t > 1) p.t = 0;
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        ctx.fillStyle = isHi ? '#FFB81C' : 'rgba(20,18,14,0.25)';
        ctx.beginPath(); ctx.arc(px, py, isHi ? 2.4 : 1.4, 0, Math.PI*2); ctx.fill();
      }

      for (const n of nodes) {
        if (!filterSet.has(n.type)) continue;
        const t = NODE_TYPES[n.type];
        const isSel = selected === n.id;
        const isHov = hover === n.id;
        const r = n.size + (isSel ? 6 : (isHov ? 3 : 0));
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.4);
        grd.addColorStop(0, t.color + '55');
        grd.addColorStop(1, t.color + '00');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = t.color;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 0.45, 0, Math.PI*2); ctx.fill();
        if (n.size >= 12 || isHov || isSel) {
          ctx.fillStyle = '#14120E';
          ctx.font = `${isSel ? 600 : 500} 12px "Space Grotesk", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(n.label, n.x, n.y + r + 6);
        }
      }

      raf = requestAnimationFrame(step);
    };
    step();
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener('mousemove', onMove);
      c.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => { if (stateRef.current) stateRef.current.filterSet = filter; }, [filter]);
  useEffect(() => { if (stateRef.current) stateRef.current.density = density; }, [density]);

  const toggleType = (k) => {
    setFilter(prev => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  const selNode = NODES.find(n => n.id === selected);
  const selEdges = EDGES.filter(([a,b]) => a === selected || b === selected).map(([a,b]) => {
    const otherId = a === selected ? b : a;
    return NODES.find(n => n.id === otherId);
  }).filter(Boolean);

  // Layout
  const showFilters = isDesktop;
  const showInsights = !isMobile;
  const canvasH = isMobile ? '50vh' : 'calc(100vh - 270px)';
  const gridCols = isDesktop ? '220px 1fr 320px' : isTablet ? '1fr 280px' : '1fr';

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Knowledge graph</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Your career, mapped.</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>22 nodes · 25 connections · last synced just now</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <div className="row items-center gap-2 chip" style={{ padding: '6px 10px' }}>
            <I.Search size={13}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search nodes" style={{ border: 'none', outline: 'none', background: 'transparent', width: 120, fontSize: 12 }}/>
          </div>
          {!isMobile && <button className="btn"><I.Layers size={14}/> Cluster mode</button>}
          <button className="btn btn-accent"><I.Plus size={14}/> Add node</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: gridCols, gap: 16, minHeight: 580 }}>
        {/* Filters — desktop only */}
        {showFilters && (
          <div className="card" style={{ padding: 18, height: '100%', overflow: 'auto' }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Categories</div>
            <div className="col gap-2">
              {Object.entries(NODE_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => toggleType(k)}
                  className="row items-center gap-2"
                  style={{ padding: '8px 10px', borderRadius: 10, background: filter.has(k) ? 'var(--bg-2)' : 'transparent',
                    border: '1px solid ' + (filter.has(k) ? 'var(--line)' : 'transparent'), justifyContent: 'flex-start',
                    opacity: filter.has(k) ? 1 : 0.45, cursor: 'pointer', fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: v.color }}></span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{v.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{NODES.filter(n => n.type === k).length}</span>
                </button>
              ))}
            </div>
            <hr className="hr" style={{ margin: '16px 0' }}/>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Density</div>
            <input type="range" min="0.5" max="2" step="0.05" value={density} onChange={(e) => setDensity(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)' }}/>
            <div className="between" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>
              <span>Spread</span><span style={{ fontWeight: 600, color: 'var(--ink)' }}>{density.toFixed(2)}×</span><span>Tight</span>
            </div>
            <hr className="hr" style={{ margin: '16px 0' }}/>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Timeline</div>
            <input type="range" min="1" max="3" value={week} onChange={(e) => setWeek(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)' }}/>
            <div className="between" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>
              <span>W1</span><span style={{ fontWeight: 600, color: 'var(--ink)' }}>Week {week}</span><span>Now</span>
            </div>
            <hr className="hr" style={{ margin: '16px 0' }}/>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Edge types</div>
            <div className="col gap-1" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              <div>— learned during</div>
              <div>— helped solve</div>
              <div>— led to success</div>
              <div>— mentioned with</div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div ref={containerRef} className="card" style={{ position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 40%, #FFFFFF 0%, #F4F1EC 80%)', borderRadius: 24,
          height: canvasH, minHeight: 400 }}>
          <canvas ref={canvasRef}></canvas>
          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 380 }}>
            {Object.entries(NODE_TYPES).map(([k, v]) => (
              <span key={k} className="chip" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)', fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: v.color }}></span>{v.label}
              </span>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 6 }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.85)' }}>−</button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.85)' }}>+</button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.85)' }}>Reset</button>
          </div>
        </div>

        {/* Insights — tablet + desktop */}
        {showInsights && (
          <div className="col gap-3" style={{ height: '100%', overflow: 'auto' }}>
            {selNode && (
              <div className="card" style={{ padding: 18 }}>
                <div className="row items-center gap-2" style={{ marginBottom: 10 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: NODE_TYPES[selNode.type].color }}></span>
                  <span className="eyebrow">{NODE_TYPES[selNode.type].label}</span>
                </div>
                <div className="h3" style={{ marginBottom: 4 }}>{selNode.label}</div>
                <div className="muted" style={{ fontSize: 12 }}>Connected to {selEdges.length} nodes</div>
                <hr className="hr" style={{ margin: '12px 0' }}/>
                <div className="col gap-2">
                  {selEdges.slice(0,6).map(n => (
                    <div key={n.id} className="row items-center gap-2" style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => setSelected(n.id)}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: NODE_TYPES[n.type].color }}></span>
                      <span style={{ flex: 1 }}>{n.label}</span>
                      <I.ArrowRight size={12} stroke="var(--ink-4)"/>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Insights</div>
              <div className="col gap-3">
                {[
                  { l: 'Fastest growing skill', v: 'Eval design', c: '#4F46E5' },
                  { l: 'Most recurring blocker', v: 'Cluster quota', c: '#F59E0B' },
                  { l: 'Strongest project cluster', v: 'RAG eval v2', c: '#8B5CF6' },
                  { l: 'Underdeveloped area', v: 'Communication', c: '#06B6D4' },
                  { l: 'New opportunity', v: 'Inference perf', c: '#003594' },
                ].map(it => (
                  <div key={it.l} className="row items-center gap-3" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ width: 4, height: 28, borderRadius: 2, background: it.c }}></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{it.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{it.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile insights below canvas */}
      {isMobile && selNode && (
        <div className="card" style={{ padding: 18, marginTop: 16 }}>
          <div className="row items-center gap-2" style={{ marginBottom: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: NODE_TYPES[selNode.type].color }}></span>
            <span className="eyebrow">{NODE_TYPES[selNode.type].label}</span>
          </div>
          <div className="h3" style={{ marginBottom: 4 }}>{selNode.label}</div>
          <div className="muted" style={{ fontSize: 12 }}>Connected to {selEdges.length} nodes</div>
        </div>
      )}

      <div className="dock-spacer"></div>
    </div>
  );
}

export default KnowledgeGraphPage;
