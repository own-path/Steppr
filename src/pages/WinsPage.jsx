import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { useToast, fireConfetti } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

function WinsPage() {
  const I = Icons;
  const toast = useToast();
  const { isMobile, isTablet } = useBreakpoint();
  const wins = useQuery(api.appData.listWins);

  const gridCols = isMobile ? '1fr' : 'repeat(2, 1fr)';

  if (wins === undefined) {
    return <div className="center" style={{ minHeight: 'calc(100vh - 56px)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/></div>
  }

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Wins vault</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Your achievements, ready to ship.</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>{wins.length} wins detected · {wins.filter(w => w.impact === 'High').length} high impact</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {!isMobile && <button className="btn"><I.Filter size={14}/> By tag</button>}
          {!isMobile && <button className="btn"><I.Spark size={14}/> Auto-detect new</button>}
          <button className="btn btn-accent"><I.Plus size={14}/> Add win</button>
        </div>
      </div>

      {wins.length === 0 ? (
        <div className="card" style={{ padding: 24, borderRadius: 8 }}>
          <div className="h3">No wins in Convex yet.</div>
          <div className="muted" style={{ marginTop: 6 }}>Log wins to populate this vault from the database.</div>
        </div>
      ) : (
      <div className="grid" style={{ gridTemplateColumns: gridCols, gap: 16 }}>
        {wins.map((w, i) => (
          <div key={w._id} className="card lift" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div className="font-pixel" style={{ position: 'absolute', right: -10, top: -20, fontSize: 80, color: 'rgba(0,53,148,0.07)' }}>W{String(i+1).padStart(2,'0')}</div>
            <div className="row items-center gap-2" style={{ marginBottom: 12 }}>
              <span className="chip chip-accent">{w.tag}</span>
              <span className="chip" style={{ background: w.impact === 'High' ? 'var(--violet-soft)' : 'var(--bg-2)', color: w.impact === 'High' ? '#5B21B6' : 'var(--ink-3)' }}>
                <I.Bolt size={11}/> {w.impact} impact
              </span>
              <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{w.date}</span>
            </div>
            <div className="h3" style={{ marginBottom: 8 }}>{w.title}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 18 }}>{w.detail}</div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <button className="btn" onClick={(e) => { fireConfetti(e.clientX, e.clientY); toast('Rewriting…'); }}><I.Spark size={12}/> Rewrite stronger</button>
              <button className="btn"><I.Bolt size={12}/> Quantify</button>
              <button className="btn">STAR story</button>
              <button className="btn"><I.Plus size={12}/> Resume</button>
              {!isMobile && <button className="btn"><I.Plus size={12}/> LinkedIn</button>}
            </div>
          </div>
        ))}
      </div>
      )}
      <div className="dock-spacer"></div>
    </div>
  );
}

export default WinsPage;
