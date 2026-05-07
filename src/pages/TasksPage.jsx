import React, { useEffect, useState, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { useBreakpoint } from '../hooks/useBreakpoint'

function TasksPage() {
  const I = Icons;
  const tasks = useQuery(api.appData.listTasks);
  const updateTaskStatus = useMutation(api.appData.updateTaskStatus);
  const [cols, setCols] = useState({ backlog: [], progress: [], waiting: [], done: [], blocked: [] });
  const dragging = useRef(null);
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  useEffect(() => {
    if (!tasks) return;
    const next = { backlog: [], progress: [], waiting: [], done: [], blocked: [] };
    for (const task of tasks) {
      const status = next[task.status] ? task.status : 'backlog';
      next[status].push(task);
    }
    for (const status of Object.keys(next)) next[status].sort((a, b) => a.order - b.order);
    setCols(next);
  }, [tasks]);

  const onDragStart = (taskId, fromCol) => { dragging.current = { taskId, fromCol }; };
  const onDrop = (toCol) => {
    if (!dragging.current) return;
    const { taskId, fromCol } = dragging.current;
    if (fromCol === toCol) return;
    const movedTask = cols[fromCol].find(t => t._id === taskId);
    setCols(prev => {
      const task = prev[fromCol].find(t => t._id === taskId);
      if (!task) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(t => t._id !== taskId),
        [toCol]: [task, ...prev[toCol]],
      };
    });
    if (movedTask) updateTaskStatus({ taskId: movedTask._id, status: toCol, order: Date.now() });
    dragging.current = null;
  };

  const COL_META = {
    backlog: { title: 'Backlog', color: 'var(--ink-4)', bg: 'var(--bg-2)' },
    progress: { title: 'In progress', color: 'var(--accent-2)', bg: 'var(--accent-tint)' },
    waiting: { title: 'Waiting', color: '#92400E', bg: 'var(--amber-soft)' },
    done: { title: 'Completed', color: '#5B21B6', bg: 'var(--violet-soft)' },
    blocked: { title: 'Blocked', color: '#9F1239', bg: 'var(--rose-soft)' },
  };

  const PRIORITY = { high: 'var(--rose)', med: 'var(--amber)', low: 'var(--cyan)' };

  if (tasks === undefined) {
    return <div className="center" style={{ minHeight: 'calc(100vh - 56px)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/></div>
  }

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Tasks & goals</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>This week's board</h1>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {!isMobile && <button className="btn"><I.Filter size={14}/> Filter</button>}
          {!isMobile && <button className="btn"><I.Spark size={14}/> AI breakdown</button>}
          <button className="btn btn-accent"><I.Plus size={14}/> Add task</button>
        </div>
      </div>

      {/* Desktop: 5-col grid; mobile/tablet: horizontal scroll flex */}
      {isDesktop ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {Object.entries(cols).map(([key, items]) => {
            const meta = COL_META[key];
            return (
              <div key={key}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = 'var(--bg-2)'; }}
                onDragLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                onDrop={(e) => { e.currentTarget.style.background = 'transparent'; onDrop(key); }}
                style={{ padding: 8, borderRadius: 18, border: '1px dashed var(--line)', minHeight: 540 }}>
                <div className="between" style={{ padding: '8px 8px 12px' }}>
                  <div className="row items-center gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color }}></span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{meta.title}</span>
                    <span className="chip" style={{ background: meta.bg, color: meta.color, borderColor: 'transparent' }}>{items.length}</span>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 6 }}><I.Plus size={12}/></button>
                </div>
                <div className="col gap-2">
                  {items.map(t => (
                    <div key={t._id} draggable
                      onDragStart={() => onDragStart(t._id, key)}
                      className="card lift" style={{ padding: 14, cursor: 'grab', userSelect: 'none' }}>
                      <div className="between" style={{ marginBottom: 8 }}>
                        <span className="chip" style={{ fontSize: 11 }}>{t.tag}</span>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: PRIORITY[t.priority] }} title={t.priority}></span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 10 }}>{t.title}</div>
                      {t.blocker && (
                        <div className="row items-center gap-1" style={{ fontSize: 11, color: '#9F1239', marginBottom: 6 }}>
                          <I.Lock size={11}/> {t.blocker}
                        </div>
                      )}
                      <div className="between">
                        <div className="muted" style={{ fontSize: 11 }}><I.Calendar size={10} style={{ verticalAlign: 'middle' }}/> {t.due}</div>
                        <button className="btn btn-ghost" style={{ padding: 2, borderRadius: 6 }}><I.Drag size={12} stroke="var(--ink-5)"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12 }}>
          {Object.entries(cols).map(([key, items]) => {
            const meta = COL_META[key];
            return (
              <div key={key}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = 'var(--bg-2)'; }}
                onDragLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                onDrop={(e) => { e.currentTarget.style.background = 'transparent'; onDrop(key); }}
                style={{ padding: 8, borderRadius: 18, border: '1px dashed var(--line)', minHeight: 400, minWidth: 220, flexShrink: 0 }}>
                <div className="between" style={{ padding: '8px 8px 12px' }}>
                  <div className="row items-center gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color }}></span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{meta.title}</span>
                    <span className="chip" style={{ background: meta.bg, color: meta.color, borderColor: 'transparent' }}>{items.length}</span>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 6 }}><I.Plus size={12}/></button>
                </div>
                <div className="col gap-2">
                  {items.map(t => (
                    <div key={t._id} draggable
                      onDragStart={() => onDragStart(t._id, key)}
                      className="card lift" style={{ padding: 14, cursor: 'grab', userSelect: 'none' }}>
                      <div className="between" style={{ marginBottom: 8 }}>
                        <span className="chip" style={{ fontSize: 11 }}>{t.tag}</span>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: PRIORITY[t.priority] }} title={t.priority}></span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 10 }}>{t.title}</div>
                      {t.blocker && (
                        <div className="row items-center gap-1" style={{ fontSize: 11, color: '#9F1239', marginBottom: 6 }}>
                          <I.Lock size={11}/> {t.blocker}
                        </div>
                      )}
                      <div className="between">
                        <div className="muted" style={{ fontSize: 11 }}><I.Calendar size={10} style={{ verticalAlign: 'middle' }}/> {t.due}</div>
                        <button className="btn btn-ghost" style={{ padding: 2, borderRadius: 6 }}><I.Drag size={12} stroke="var(--ink-5)"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{ padding: 20, marginTop: 16, background: 'linear-gradient(180deg, var(--bg-2) 0%, var(--surface) 100%)' }}>
        <div className="row items-center gap-2" style={{ marginBottom: 10 }}>
          <span className="ai-pulse"></span>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>AI actions</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {[
            'Break down "RAG eval v2" into subtasks',
            'Suggest mentor for "LoRA sweep"',
            'When should I escalate cluster quota?',
            'Smart reminder for Friday report',
          ].map(t => (
            <button key={t} className="btn"><I.Spark size={12}/> {t}</button>
          ))}
        </div>
      </div>
      <div className="dock-spacer"></div>
    </div>
  );
}

export default TasksPage;
