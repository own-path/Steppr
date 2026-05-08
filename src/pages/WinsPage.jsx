import React, { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { useToast, fireConfetti } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

function WinsPage() {
  const I = Icons;
  const toast = useToast();
  const { isMobile, isTablet } = useBreakpoint();
  const wins = useQuery(api.appData.listWins);
  const createWin = useMutation(api.appData.createWin);
  const redetectAll = useMutation(api.appData.redetectAllDailyLogSignals);
  const [form, setForm] = useState({ open: false, title: '', detail: '', impact: 'Medium' });
  const [tagFilter, setTagFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  const weekKey = `${today.getFullYear()}-W${Math.ceil((((today - start) / 86400000) + start.getDay() + 1) / 7)}`;
  const todayIso = today.toISOString().slice(0, 10);
  const saveWin = async () => {
    const title = form.title.trim();
    if (!title || saving) return;
    setSaving(true);
    try {
      await createWin({
        title,
        detail: form.detail.trim() || title,
        date: todayIso,
        weekKey,
        impact: form.impact,
      });
      setForm({ open: false, title: '', detail: '', impact: 'Medium' });
      toast('Win added');
    } finally {
      setSaving(false);
    }
  };
  const copyText = async (text, message) => {
    await navigator.clipboard?.writeText(text);
    toast(message);
  };
  const strengthen = (w) => `${w.title}\n\nImpact: ${w.detail}\nResult: ${w.impact} impact signal captured in Steppr.`;
  const quantify = (w) => `${w.title}\nEvidence to quantify: time saved, users affected, revenue/risk reduced, quality improved.\nCurrent detail: ${w.detail}`;
  const star = (w) => `Situation: Context for ${w.title}\nTask: What needed to happen\nAction: ${w.detail}\nResult: ${w.impact} impact`;
  const resumeBullet = (w) => `- ${w.title}: ${w.detail}`;
  const linkedInPost = (w) => `Small professional win: ${w.title}\n\n${w.detail}\n\nLogged with Steppr.`;
  const tags = Array.from(new Set(wins.map(w => w.tag))).filter(Boolean).sort();
  const displayedWins = tagFilter === 'all' ? wins : wins.filter(w => w.tag === tagFilter);

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
          {!isMobile && <button className="btn" onClick={() => setShowFilters(show => !show)}><I.Filter size={14}/> By tag</button>}
          {!isMobile && <button className="btn" onClick={() => redetectAll().then(r => toast(`Detected ${r.detectedWins} wins and ${r.detectedBlockers} blockers`))}><I.Spark size={14}/> Auto-detect new</button>}
          <button className="btn btn-accent" onClick={() => setForm(s => ({ ...s, open: true }))}><I.Plus size={14}/> Add win</button>
        </div>
      </div>

      {showFilters && (
        <div className="card" style={{ padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {[{ tag: 'all', label: 'All tags' }, ...tags.map(tag => ({ tag, label: tag }))].map(item => (
              <button key={item.tag} className="chip" onClick={() => setTagFilter(item.tag)}
                style={{ background: tagFilter === item.tag ? 'var(--ink)' : 'var(--bg-2)', color: tagFilter === item.tag ? '#fff' : 'var(--ink-2)' }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.open && (
        <div className="card" style={{ padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div className="grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 180px auto', gap: 10, alignItems: 'center' }}>
            <input
              className="input"
              autoFocus
              value={form.title}
              onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') saveWin(); if (e.key === 'Escape') setForm(s => ({ ...s, open: false })); }}
              placeholder="Win title"
            />
            <select className="input" value={form.impact} onChange={e => setForm(s => ({ ...s, impact: e.target.value }))}>
              <option value="High">High impact</option>
              <option value="Medium">Medium impact</option>
              <option value="Low">Low impact</option>
            </select>
            <div className="row gap-2">
              <button className="btn btn-accent" onClick={saveWin} disabled={saving || !form.title.trim()}><I.Check size={14}/> {saving ? 'Saving' : 'Save'}</button>
              <button className="btn" onClick={() => setForm(s => ({ ...s, open: false }))}>Cancel</button>
            </div>
          </div>
          <textarea
            value={form.detail}
            onChange={e => setForm(s => ({ ...s, detail: e.target.value }))}
            placeholder="Optional detail/evidence"
            style={{ width: '100%', minHeight: 72, marginTop: 10, border: '1px solid var(--line)', borderRadius: 8, padding: 12, resize: 'vertical', background: 'var(--surface-2)', color: 'var(--ink)' }}
          />
        </div>
      )}

      {displayedWins.length === 0 ? (
        <div className="card" style={{ padding: 24, borderRadius: 8 }}>
          <div className="h3">{wins.length ? 'No wins match this filter.' : 'No wins in Convex yet.'}</div>
          <div className="muted" style={{ marginTop: 6 }}>{wins.length ? 'Choose a different tag.' : 'Log wins to populate this vault from the database.'}</div>
        </div>
      ) : (
      <div className="grid" style={{ gridTemplateColumns: gridCols, gap: 16 }}>
        {displayedWins.map((w, i) => (
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
              <button className="btn" onClick={(e) => { fireConfetti(e.clientX, e.clientY); copyText(strengthen(w), 'Stronger version copied'); }}><I.Spark size={12}/> Rewrite stronger</button>
              <button className="btn" onClick={() => copyText(quantify(w), 'Quantification prompt copied')}><I.Bolt size={12}/> Quantify</button>
              <button className="btn" onClick={() => copyText(star(w), 'STAR story copied')}>STAR story</button>
              <button className="btn" onClick={() => copyText(resumeBullet(w), 'Resume bullet copied')}><I.Plus size={12}/> Resume</button>
              {!isMobile && <button className="btn" onClick={() => copyText(linkedInPost(w), 'LinkedIn draft copied')}><I.Plus size={12}/> LinkedIn</button>}
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
