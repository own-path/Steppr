import React, { useState, useRef, useEffect } from 'react'
import Icons from '../components/Icons'
import { COACH_PROMPTS, Avatar } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

function CoachPage() {
  const I = Icons;
  const [msgs, setMsgs] = useState([
    { role: 'assistant', content: "Hey Daryl — I've got your full week 3 context loaded (7 wins, 2 blockers, 4 learnings). What's on your mind?" },
  ]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef(null);
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, pending]);

  const send = async (text) => {
    const t = (text ?? draft).trim();
    if (!t || pending) return;
    setMsgs(m => [...m, { role: 'user', content: t }]);
    setDraft('');
    setPending(true);
    try {
      const reply = await window.claude?.complete({
        messages: [
          { role: 'user', content: `You are Steppr's AI Coach for Daryl, an ML/AI research intern at Vector Lab in week 3 of his internship. Be concise (2-4 short paragraphs), warm but direct, and reference his real context: 7 wins this week, RAG eval v2 shipped 4x speedup, blocked on cluster quota and eval-set v3 access, mentor is Maya, peer is Priya, staff he wants to impress is Jonas. User asked: "${t}"` }
        ]
      });
      setMsgs(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', content: "Couldn't reach the model just now — but here's a quick take: focus on visibility this week. Send Maya a 3-bullet update Friday morning, not 3 PM. Volunteer to present the eval results at next research review." }]);
    }
    setPending(false);
  };

  // Layout
  const showLeft = isDesktop;
  const showRight = !isMobile;
  const gridCols = isDesktop ? '300px 1fr 280px' : isTablet ? '1fr 240px' : '1fr';

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="grid" style={{ gridTemplateColumns: gridCols, gap: 16, height: 'calc(100vh - 200px)', minHeight: 600 }}>
        {/* Left: history + memory — desktop only */}
        {showLeft && (
          <div className="col gap-3" style={{ overflow: 'auto' }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="row items-center gap-2" style={{ marginBottom: 12 }}>
                <span className="ai-pulse"></span>
                <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Coach memory</div>
              </div>
              <div className="col gap-2" style={{ fontSize: 12.5 }}>
                {[
                  'Wants return offer at Vector Lab',
                  'Strongest after planning mornings',
                  'Mentor: Maya · Staff: Jonas',
                  'Underdeveloped: communication',
                ].map(t => (
                  <div key={t} className="row items-center gap-2" style={{ padding: '6px 0' }}>
                    <I.Pin size={11} stroke="var(--ink-4)"/>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Recent threads</div>
              <div className="col gap-1">
                {[
                  'Friday report rewrite',
                  'How to ask for cluster quota',
                  'Standup talk prep',
                  'STAR story for interview',
                ].map(t => (
                  <button key={t} className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 10, fontSize: 13, fontWeight: 400 }}>
                    <I.Coach size={13}/> {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center: chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="between" style={{ padding: 16, borderBottom: '1px solid var(--line)' }}>
            <div className="row items-center gap-2">
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I.Spark size={16}/>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Steppr Coach</div>
                <div style={{ fontSize: 11, color: 'var(--accent-2)' }}>● Online · grounded in your data</div>
              </div>
            </div>
            <button className="btn btn-ghost"><I.Plus size={14}/> New thread</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            {msgs.map((m, i) => (
              <div key={i} className="row gap-3" style={{ marginBottom: 18, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && <Avatar initials="S" color="var(--accent)" size={32}/>}
                <div style={{
                  maxWidth: '78%',
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: m.role === 'user' ? 'var(--ink)' : 'var(--bg-2)',
                  color: m.role === 'user' ? '#fff' : 'var(--ink)',
                  fontSize: 14, lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  border: m.role === 'assistant' ? '1px solid var(--line)' : 'none',
                }}>{m.content}</div>
                {m.role === 'user' && <Avatar initials="DK" size={32}/>}
              </div>
            ))}
            {pending && (
              <div className="row gap-3" style={{ marginBottom: 18 }}>
                <Avatar initials="S" color="var(--accent)" size={32}/>
                <div style={{ padding: '14px 18px', borderRadius: 16, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--ink-4)',
                      animation: `aiPulse 1.4s ${i*0.15}s infinite` }}></span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: 16, borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
            <div className="row gap-2" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
              {COACH_PROMPTS.slice(0,isMobile ? 2 : 4).map(p => (
                <button key={p} className="chip" style={{ cursor: 'pointer', background: 'var(--surface)', fontSize: isMobile ? 11 : 12 }} onClick={() => send(p)}>{p}</button>
              ))}
            </div>
            <div className="row items-center gap-2" style={{ background: 'var(--surface)', borderRadius: 16, padding: '10px 14px', border: '1px solid var(--line)' }}>
              <I.Spark size={16} stroke="var(--accent)"/>
              <input value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask anything about your week, growth, or next move…"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }}/>
              {!isMobile && <button className="btn btn-ghost" style={{ padding: 6, borderRadius: 8 }}><I.Mic size={14}/></button>}
              <button className="btn btn-accent" style={{ padding: '6px 14px' }} onClick={() => send()} disabled={pending}>
                <I.Send size={13}/> Send
              </button>
            </div>
          </div>
        </div>

        {/* Right: actionable outputs — tablet + desktop */}
        {showRight && (
          <div className="col gap-3" style={{ overflow: 'auto' }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Save this advice</div>
              <div className="col gap-2">
                {[
                  { t: 'Send 3-bullet pre-standup to Maya', c: 'var(--accent)' },
                  { t: 'Volunteer for Thursday review', c: 'var(--cyan)' },
                  { t: 'Quantify eval speedup in $ saved', c: 'var(--violet)' },
                ].map(it => (
                  <div key={it.t} className="row items-center gap-2" style={{ padding: 10, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-2)' }}>
                    <span style={{ width: 6, height: 24, borderRadius: 2, background: it.c }}></span>
                    <span style={{ flex: 1, fontSize: 13 }}>{it.t}</span>
                    <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 6 }}><I.Plus size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Memory references</div>
              <div className="col gap-2" style={{ fontSize: 12.5 }}>
                {[
                  'Apr 24 log — eval shipping',
                  'Apr 19 RFC — token budget',
                  'Apr 17 1:1 with Maya',
                ].map(t => (
                  <div key={t} className="row items-center gap-2" style={{ padding: '6px 0', color: 'var(--ink-3)' }}>
                    <I.Link size={11}/><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="dock-spacer"></div>
    </div>
  );
}

export default CoachPage;
