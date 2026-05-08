import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { Sparkline } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'

function Loader() {
  return <div className="center" style={{ minHeight: 'calc(100vh - 56px)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/></div>
}

function Metric({ label, value, sub, color = 'var(--accent)', series = [0] }) {
  return (
    <div className="card" style={{ padding: 18, borderRadius: 8 }}>
      <div className="eyebrow">{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{value}</div>
      <div className="muted" style={{ fontSize: 12 }}>{sub}</div>
      <div style={{ marginTop: 10 }}><Sparkline data={series.length ? series : [0]} color={color} height={34}/></div>
    </div>
  )
}

function Bars({ items }) {
  const max = Math.max(1, ...items.map(item => item.value))
  return (
    <div className="col gap-3">
      {items.map(item => (
        <div key={item.label}>
          <div className="between" style={{ marginBottom: 5, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            <span className="muted">{item.value}</span>
          </div>
          <div style={{ height: 9, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${item.value / max * 100}%`, background: item.color, borderRadius: 999 }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyticsPage() {
  const I = Icons
  const { isMobile, isTablet } = useBreakpoint()
  const wins = useQuery(api.appData.listWins)
  const tasks = useQuery(api.appData.listTasks, {})
  const logs = useQuery(api.appData.listDailyLogs)
  const scores = useQuery(api.appData.listGrowthScores)
  const reports = useQuery(api.appData.listReports)

  if ([wins, tasks, logs, scores, reports].some(v => v === undefined)) return <Loader/>

  const blocked = tasks.filter(task => task.status === 'blocked')
  const completed = tasks.filter(task => task.status === 'done')
  const learnings = logs.filter(log => log.learned)
  const avgScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.value, 0) / scores.length) : 0
  const metricCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)'
  const chartCols = isMobile ? '1fr' : '1fr 1fr'
  const taskByStatus = ['backlog', 'progress', 'waiting', 'blocked', 'done'].map((status, i) => ({
    label: status,
    value: tasks.filter(task => task.status === status).length,
    color: ['var(--ink-4)', 'var(--accent)', 'var(--amber)', 'var(--rose)', 'var(--violet)'][i],
  }))
  const winsByTag = Object.entries(wins.reduce((acc, win) => {
    acc[win.tag] = (acc[win.tag] || 0) + 1
    return acc
  }, {})).map(([label, value], i) => ({ label, value, color: ['var(--accent)', 'var(--cyan)', 'var(--violet)', 'var(--amber)', 'var(--rose)'][i % 5] }))

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
      <div className="between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Analytics</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44 }}>Patterns from your database.</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{logs.length} logs · {wins.length} wins · {tasks.length} tasks · {reports.length} reports</div>
        </div>
        <button className="btn btn-accent"><I.Download size={14}/> Export</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: metricCols, gap: 12, marginBottom: 16 }}>
        <Metric label="Growth score" value={avgScore} sub="average of Convex scores" color="var(--accent)" series={scores[0]?.series || [avgScore]}/>
        <Metric label="Wins" value={wins.length} sub="wins table" color="var(--violet)" series={wins.map((_, i) => i + 1)}/>
        <Metric label="Logs" value={logs.length} sub="dailyLogs table" color="var(--cyan)" series={logs.map((_, i) => i + 1)}/>
        <Metric label="Learnings" value={learnings.length} sub="logs with learning text" color="var(--indigo)" series={learnings.map((_, i) => i + 1)}/>
        <Metric label="Blockers" value={blocked.length} sub="blocked tasks" color="var(--rose)" series={blocked.map((_, i) => i + 1)}/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: chartCols, gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 22, borderRadius: 8 }}>
          <div className="h3" style={{ marginBottom: 14 }}>Tasks by status</div>
          <Bars items={taskByStatus}/>
        </div>
        <div className="card" style={{ padding: 22, borderRadius: 8 }}>
          <div className="h3" style={{ marginBottom: 14 }}>Wins by tag</div>
          {winsByTag.length ? <Bars items={winsByTag}/> : <div className="muted">No wins in Convex yet.</div>}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: chartCols, gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 22, borderRadius: 8 }}>
          <div className="h3" style={{ marginBottom: 10 }}>Growth dimensions</div>
          {scores.length ? <Bars items={scores.map(score => ({ label: score.label, value: score.value, color: score.color }))}/> : <div className="muted">No growth scores in Convex yet.</div>}
        </div>
        <div className="card" style={{ padding: 22, borderRadius: 8 }}>
          <div className="h3" style={{ marginBottom: 10 }}>Current summary</div>
          <div className="col gap-2">
            <div className="chip">Completed tasks: {completed.length}</div>
            <div className="chip">Open tasks: {tasks.length - completed.length}</div>
            <div className="chip">Reports computed: {reports.length}</div>
            <div className="chip">High impact wins: {wins.filter(win => win.impact === 'High').length}</div>
          </div>
        </div>
      </div>

      <div className="dock-spacer"/>
    </div>
  )
}

export default AnalyticsPage
