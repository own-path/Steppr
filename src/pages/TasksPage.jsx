import React, { useEffect, useState, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { useToast } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

function weekKeyFor(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  return `${date.getFullYear()}-W${Math.ceil((((date - start) / 86400000) + start.getDay() + 1) / 7)}`;
}

function TasksPage() {
  const I = Icons;
  const tasks = useQuery(api.appData.listTasks, {});
  const updateTaskStatus = useMutation(api.appData.updateTaskStatus);
  const createTask = useMutation(api.appData.createTask);
  const toast = useToast();
  const [cols, setCols] = useState({ backlog: [], progress: [], waiting: [], done: [], blocked: [] });
  const [newTask, setNewTask] = useState({ open: false, status: 'backlog', title: '', priority: 'med', due: '' });
  const [filterMode, setFilterMode] = useState('all');
  const [saving, setSaving] = useState(false);
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
  const openTaskForm = (status = 'backlog') => setNewTask({ open: true, status, title: '', priority: status === 'blocked' ? 'high' : 'med', due: '' });
  const addGeneratedTask = async ({ title, status = 'backlog', priority = 'med', blocker }) => {
    await createTask({ title, status, priority, blocker, weekKey: weekKeyFor() });
  };
  const breakdownTask = async () => {
    const base = cols.progress[0] || cols.backlog[0];
    if (!base) {
      openTaskForm('backlog');
      toast?.('Add a task first');
      return;
    }
    await Promise.all([
      addGeneratedTask({ title: `${base.title}: define next concrete step`, priority: base.priority || 'med' }),
      addGeneratedTask({ title: `${base.title}: identify dependency or risk`, priority: 'med' }),
      addGeneratedTask({ title: `${base.title}: send status update`, priority: 'low' }),
    ]);
    toast?.('Breakdown tasks added');
  };
  const saveTask = async () => {
    const title = newTask.title.trim();
    if (!title || saving) return;
    setSaving(true);
    try {
      await createTask({
        title,
        status: newTask.status,
        priority: newTask.priority,
        due: newTask.due || undefined,
        weekKey: weekKeyFor(),
        blocker: newTask.status === 'blocked' ? title : undefined,
      });
      setNewTask(s => ({ ...s, open: false, title: '' }));
      toast?.('Task added');
    } finally {
      setSaving(false);
    }
  };

  if (tasks === undefined) {
    return <div className="center" style={{ minHeight: 'calc(100vh - 56px)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/></div>
  }

  const visibleEntries = Object.entries(cols).filter(([key]) => filterMode === 'all' || key !== 'done');
  const aiActions = [
    {
      label: cols.progress[0] ? `Break down "${cols.progress[0].title}"` : 'Add an in-progress task to break down',
      run: breakdownTask,
    },
    {
      label: cols.blocked[0] ? `Escalate blocker: ${cols.blocked[0].title}` : 'No blocked tasks in Convex',
      run: () => {
        const blocked = cols.blocked[0];
        if (!blocked) return toast?.('No blocked tasks to escalate');
        navigator.clipboard?.writeText(`Blocked on: ${blocked.title}${blocked.blocker ? `\nContext: ${blocked.blocker}` : ''}`);
        toast?.('Blocker summary copied');
      },
    },
    {
      label: cols.backlog[0] ? `Prioritize backlog: ${cols.backlog[0].title}` : 'Backlog is empty',
      run: () => {
        const task = cols.backlog[0];
        if (!task) return toast?.('Backlog is empty');
        updateTaskStatus({ taskId: task._id, status: 'progress', order: Date.now() });
        toast?.('Moved top backlog task into progress');
      },
    },
    {
      label: 'Create reminder from selected task',
      run: () => {
        const task = cols.progress[0] || cols.backlog[0] || cols.blocked[0];
        if (!task) return toast?.('No task available');
        addGeneratedTask({ title: `Reminder: ${task.title}`, status: 'waiting', priority: task.priority || 'med' }).then(() => toast?.('Reminder task created'));
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Tasks & goals</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>This week's board</h1>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {!isMobile && <button className="btn" onClick={() => setFilterMode(mode => mode === 'all' ? 'active' : 'all')}><I.Filter size={14}/> {filterMode === 'all' ? 'Hide done' : 'Show all'}</button>}
          {!isMobile && <button className="btn" onClick={breakdownTask}><I.Spark size={14}/> AI breakdown</button>}
          <button className="btn btn-accent" onClick={() => openTaskForm('backlog')}><I.Plus size={14}/> Add task</button>
        </div>
      </div>

      {newTask.open && (
        <div className="card" style={{ padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <div className="grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 150px 140px auto', gap: 10, alignItems: 'center' }}>
            <input
              className="input"
              autoFocus
              value={newTask.title}
              onChange={e => setNewTask(s => ({ ...s, title: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') saveTask(); if (e.key === 'Escape') setNewTask(s => ({ ...s, open: false })); }}
              placeholder="Task title"
            />
            <select className="input" value={newTask.status} onChange={e => setNewTask(s => ({ ...s, status: e.target.value }))}>
              {Object.keys(COL_META).map(status => <option key={status} value={status}>{COL_META[status].title}</option>)}
            </select>
            <select className="input" value={newTask.priority} onChange={e => setNewTask(s => ({ ...s, priority: e.target.value }))}>
              <option value="high">High</option>
              <option value="med">Medium</option>
              <option value="low">Low</option>
            </select>
            <div className="row gap-2">
              <button className="btn btn-accent" onClick={saveTask} disabled={saving || !newTask.title.trim()}><I.Check size={14}/> {saving ? 'Saving' : 'Save'}</button>
              <button className="btn" onClick={() => setNewTask(s => ({ ...s, open: false }))}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: 5-col grid; mobile/tablet: horizontal scroll flex */}
      {isDesktop ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {visibleEntries.map(([key, items]) => {
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
                  <button className="btn btn-ghost" onClick={() => openTaskForm(key)} style={{ padding: 4, borderRadius: 6 }}><I.Plus size={12}/></button>
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
          {visibleEntries.map(([key, items]) => {
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
                  <button className="btn btn-ghost" onClick={() => openTaskForm(key)} style={{ padding: 4, borderRadius: 6 }}><I.Plus size={12}/></button>
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
          {aiActions.map(action => (
            <button key={action.label} className="btn" onClick={action.run}><I.Spark size={12}/> {action.label}</button>
          ))}
        </div>
      </div>
      <div className="dock-spacer"></div>
    </div>
  );
}

export default TasksPage;
