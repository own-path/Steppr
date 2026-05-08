import React, { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useCurrentUser } from '../hooks/useCurrentUser'

function Loader() {
  return <div className="center" style={{ minHeight: 'calc(100vh - 56px)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/></div>
}

function KnowledgeGraphPage() {
  const I = Icons
  const { isMobile, isTablet } = useBreakpoint()
  const { user } = useCurrentUser()
  const wins = useQuery(api.appData.listWins)
  const tasks = useQuery(api.appData.listTasks, {})
  const logs = useQuery(api.appData.listDailyLogs)
  const [selected, setSelected] = useState(null)

  const loading = wins === undefined || tasks === undefined || logs === undefined
  const nodes = useMemo(() => {
    if (loading) return []
    const goalNodes = (user?.goals || []).map((goal, i) => ({ id: `goal-${i}`, type: 'goal', label: goal, size: 18 }))
    const winNodes = wins.map(win => ({ id: win._id, type: 'win', label: win.title, sub: win.tag, size: win.impact === 'High' ? 16 : 12 }))
    const taskNodes = tasks.map(task => ({ id: task._id, type: task.status === 'blocked' ? 'blocker' : 'task', label: task.title, sub: task.status, size: task.priority === 'high' ? 16 : 12 }))
    const logNodes = logs.slice(0, 8).map(log => ({ id: log._id, type: 'log', label: log.date, sub: log.reflection || 'Daily log', size: 10 }))
    return [...goalNodes, ...winNodes, ...taskNodes, ...logNodes]
  }, [loading, user?.goals, wins, tasks, logs])

  if (loading) return <Loader/>

  const selectedNode = nodes.find(node => node.id === selected) || nodes[0]
  const cols = isMobile ? '1fr' : isTablet ? '1fr 280px' : '1fr 340px'
  const color = (type) => ({
    goal: 'var(--accent)',
    win: 'var(--violet)',
    task: 'var(--cyan)',
    blocker: 'var(--rose)',
    log: 'var(--amber)',
  }[type] || 'var(--ink-4)')

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Knowledge Graph</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Connections from your Convex data.</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{nodes.length} nodes · {wins.length} wins · {tasks.length} tasks · {logs.length} logs</div>
        </div>
        <button className="btn"><I.Search size={14}/> Search</button>
      </div>

      {nodes.length === 0 ? (
        <div className="card" style={{ padding: 24, borderRadius: 8 }}>
          <div className="h3">No graph data yet.</div>
          <div className="muted" style={{ marginTop: 6 }}>Add goals, wins, tasks, or daily logs and this graph will populate from Convex.</div>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: cols, gap: 16 }}>
          <div className="card" style={{ padding: 24, borderRadius: 8, minHeight: 520 }}>
            <div className="grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {nodes.map(node => (
                <button key={node.id} onClick={() => setSelected(node.id)}
                  style={{ textAlign: 'left', padding: 14, borderRadius: 8, border: `1px solid ${selected === node.id ? color(node.type) : 'var(--line)'}`, background: selected === node.id ? 'var(--accent-tint)' : 'var(--surface)', minHeight: 88 }}>
                  <div className="row items-center gap-2" style={{ marginBottom: 8 }}>
                    <span style={{ width: node.size, height: node.size, borderRadius: 999, background: color(node.type), flexShrink: 0 }}/>
                    <span className="chip" style={{ textTransform: 'capitalize' }}>{node.type}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{node.label}</div>
                  {node.sub && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{node.sub}</div>}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22, borderRadius: 8 }}>
            <div className="eyebrow">Selected node</div>
            {selectedNode && (
              <>
                <div className="h3" style={{ marginTop: 10 }}>{selectedNode.label}</div>
                <div className="muted" style={{ marginTop: 6, textTransform: 'capitalize' }}>{selectedNode.type}{selectedNode.sub ? ` · ${selectedNode.sub}` : ''}</div>
                <div style={{ marginTop: 18 }} className="col gap-2">
                  <span className="chip">Source: Convex</span>
                  <span className="chip">Profile: {user?.name || 'Current user'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="dock-spacer"/>
    </div>
  )
}

export default KnowledgeGraphPage
