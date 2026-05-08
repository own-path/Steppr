import React, { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { useToast, fireConfetti } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

function WinsContent() {
  const I = Icons;
  const toast = useToast();
  const { isMobile } = useBreakpoint();
  const wins = useQuery(api.appData.listWins);
  const redetectAll = useMutation(api.appData.redetectAllDailyLogSignals);
  if (wins === undefined) return <div className="center" style={{ minHeight: 240 }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/></div>
  return (
    <div>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Wins vault</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Your achievements, ready to ship.</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>{wins.length} wins detected · {wins.filter(w => w.impact === 'High').length} high impact</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {!isMobile && <button className="btn"><I.Filter size={14}/> By tag</button>}
          {!isMobile && <button className="btn" onClick={() => redetectAll().then(r => toast(`Detected ${r.detectedWins} wins and ${r.detectedBlockers} blockers`))}><I.Spark size={14}/> Auto-detect new</button>}
          <button className="btn btn-accent" onClick={() => toast('Use the main Wins page to add a manual win')}><I.Plus size={14}/> Add win</button>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyLogPage() {
  const I = Icons;
  const [pageTab, setPageTab] = useState('log');
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(8);
  const [text, setText] = useState("");
  const [learned, setLearned] = useState("");
  const [blocked, setBlocked] = useState("");
  const [winsToday, setWinsToday] = useState("");
  const toast = useToast();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const logs = useQuery(api.appData.listDailyLogs);
  const saveDailyLog = useMutation(api.appData.saveDailyLog);
  const today = new Date();
  const todayLabel = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const todayIso = today.toISOString().slice(0, 10);
  const monthLabel = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const loggedDays = new Set((logs || []).map(log => Number(log.date.slice(8, 10))));
  const weekKey = `${today.getFullYear()}-W${Math.ceil((((today - new Date(today.getFullYear(), 0, 1)) / 86400000) + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7)}`;

  const days = ['M','T','W','T','F','S','S'];

  // Layout: desktop = 3-col, tablet = 2-col (no calendar), mobile = 1-col (no calendar)
  const showCalendar = isDesktop;
  const gridCols = isDesktop ? '280px 1fr 320px' : isTablet ? '1fr 280px' : '1fr';

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>

      {/* Page tab switcher */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--line)', marginBottom: 28 }}>
        {[{ k: 'log', l: 'Daily Log' }, { k: 'wins', l: 'Wins Vault' }].map(t => (
          <button key={t.k} onClick={() => setPageTab(t.k)}
            style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: pageTab === t.k ? 600 : 400, color: pageTab === t.k ? 'var(--ink)' : 'var(--ink-4)', position: 'relative', transition: 'color .15s' }}>
            {t.l}
            {pageTab === t.k && <span style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2, background: 'var(--accent)', borderRadius: '2px 2px 0 0' }}/>}
          </button>
        ))}
      </div>

      {pageTab === 'wins' && <WinsContent/>}

      {pageTab === 'log' && <>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>{todayLabel}</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Daily reflection</h1>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn"><I.Calendar size={14}/> {today.toLocaleDateString(undefined, { month: 'long' })}</button>
          {!isMobile && <button className="btn"><I.Mic size={14}/> Voice</button>}
          <button className="btn btn-accent" onClick={() => {
            saveDailyLog({
              date: todayIso,
              weekKey,
              reflection: text,
              learned,
              blockers: blocked ? blocked.split('\n').filter(Boolean) : [],
              wins: winsToday ? winsToday.split('\n').filter(Boolean) : [],
              mood,
              energy,
            }).then((result) => toast(`Saved · ${result.detectedWins} wins · ${result.detectedBlockers} blockers`))
          }}>Save entry</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: gridCols, gap: 16 }}>
        {/* LEFT: calendar + timeline — desktop only */}
        {showCalendar && (
          <div className="col gap-4">
            <div className="card" style={{ padding: 18 }}>
              <div className="between" style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>{monthLabel}</div>
                <div className="row gap-1">
                  <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 8 }}><I.Chevron size={14}/></button>
                  <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 8 }}><I.Chevron size={14}/></button>
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, fontSize: 11, color: 'var(--ink-4)', marginBottom: 6 }}>
                {days.map((d, i) => <div key={i} style={{ textAlign: 'center' }}>{d}</div>)}
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {Array.from({length: 35}).map((_, i) => {
                  const day = i - 1;
                  const isToday = day === today.getDate();
                  const hasEntry = loggedDays.has(day);
                  return (
                    <div key={i} style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, borderRadius: 8, position: 'relative',
                      background: isToday ? 'var(--ink)' : (hasEntry ? 'var(--accent-tint)' : 'transparent'),
                      color: isToday ? '#fff' : (day > 0 && day <= 30 ? 'var(--ink)' : 'var(--ink-5)'),
                      fontWeight: isToday ? 600 : 400, cursor: 'pointer'
                    }}>
                      {day > 0 && day <= 30 ? day : ''}
                      {hasEntry && !isToday && <span style={{ position: 'absolute', bottom: 3, width: 3, height: 3, borderRadius: 999, background: 'var(--accent)' }}></span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>This week</div>
              <div className="col gap-2">
                {(logs || []).slice(0, 4).map(e => (
                  <div key={e._id} className="row items-center gap-2" style={{ padding: '6px 0' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }}></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{e.date}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.reflection || 'Reflection logged'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CENTER: composer */}
        <div className="card" style={{ padding: 28 }}>
          <div className="row gap-2" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
            {['Reflection','Quick log','Standup notes','Win','Blocker'].map((t,i) => (
              <button key={t} className="chip" style={{ cursor: 'pointer', background: i === 0 ? 'var(--ink)' : 'var(--bg-2)', color: i === 0 ? '#fff' : 'var(--ink-2)', borderColor: i === 0 ? 'var(--ink)' : 'var(--line)' }}>{t}</button>
            ))}
          </div>

          {[
            { q: 'What did you do today?', body: text, set: setText, h: 100 },
            { q: 'What did you learn?', body: learned, set: setLearned, h: 70 },
            { q: 'What blocked you?', body: blocked, set: setBlocked, h: 50 },
            { q: 'Wins today?', body: winsToday, set: setWinsToday, h: 50 },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{f.q}</div>
              <textarea value={f.body} onChange={(e) => f.set && f.set(e.target.value)}
                style={{ width: '100%', minHeight: f.h, border: '1px solid var(--line)', borderRadius: 14, padding: 14,
                  fontFamily: 'inherit', fontSize: 14, lineHeight: 1.55, resize: 'vertical', outline: 'none',
                  background: 'var(--surface-2)', color: 'var(--ink)' }}/>
            </div>
          ))}

          {/* Mood + Energy */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, paddingTop: 6 }}>
            <div>
              <div className="between" style={{ marginBottom: 8 }}>
                <span className="eyebrow">Mood</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{mood}/10</span>
              </div>
              <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent)' }}/>
            </div>
            <div>
              <div className="between" style={{ marginBottom: 8 }}>
                <span className="eyebrow">Energy</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{energy}/10</span>
              </div>
              <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--cyan)' }}/>
            </div>
          </div>

          <div className="row gap-2" style={{ marginTop: 22, flexWrap: 'wrap' }}>
            <span className="chip">+ deep work</span>
            <span className="chip">+ shipped</span>
            <span className="chip">+ paired</span>
            <span className="chip">+ blocked</span>
            <span className="chip">+ learning</span>
            <span className="chip">+ flow</span>
          </div>
        </div>

        {/* RIGHT: AI reflection — show on tablet + desktop */}
        {!isMobile && (
          <div className="col gap-4">
            <div className="card" style={{ padding: 20, background: 'linear-gradient(180deg, var(--accent-tint) 0%, #fff 100%)', borderColor: 'var(--line-2)' }}>
              <div className="row items-center gap-2" style={{ marginBottom: 12 }}>
                <span className="ai-pulse"></span>
                <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>AI Reflection</div>
              </div>
              <div className="h3" style={{ marginBottom: 8 }}>Current entry</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {text || learned || blocked || winsToday
                  ? [text, learned, blocked, winsToday].filter(Boolean).join(' ')
                  : 'Write today\'s entry to generate a profile-specific reflection.'}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Recent log signals</div>
              <div className="col gap-2">
                {(((logs || []).slice(0, 3).map(log => log.reflection || log.learned || log.date)).length
                  ? (logs || []).slice(0, 3).map(log => log.reflection || log.learned || log.date)
                  : ['No daily logs in Convex yet.']).map((s, i) => (
                  <div key={i} className="row items-center gap-2" style={{ fontSize: 13 }}>
                    <I.Check size={14} stroke="var(--accent-2)"/>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Next from this entry</div>
              <div className="col gap-2">
                {[
                  { t: blocked ? `Resolve blocker: ${blocked.split('\n')[0]}` : 'Add blockers to track next actions.', c: blocked ? 'var(--rose)' : 'var(--ink-4)' },
                  { t: winsToday ? `Capture win: ${winsToday.split('\n')[0]}` : 'Add wins to populate the vault.', c: winsToday ? 'var(--accent)' : 'var(--ink-4)' },
                  { t: learned ? `Save learning: ${learned.split('\n')[0]}` : 'Add a learning to improve review quality.', c: learned ? 'var(--cyan)' : 'var(--ink-4)' },
                ].map((s, i) => (
                  <div key={i} className="row items-center gap-2" style={{ fontSize: 13, padding: '6px 0' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: s.c }}></span>
                    <span>{s.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="dock-spacer"></div>
      </>}

      {pageTab === 'wins' && <div className="dock-spacer"></div>}
    </div>
  );
}

export default DailyLogPage;
