import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Icons from '../components/Icons'
import { COACH_PROMPTS, useToast, fireConfetti } from '../components/Primitives'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useCurrentUser } from '../hooks/useCurrentUser'

function defaultReviewDraft(r, variant, wins = []) {
  return {
    dates: r.dates,
    wins: wins.slice(0, 2).map(w => `${w.title}: ${w.detail}`).join('\n'),
    learnings: '',
    blockers: '',
    next: '',
  }
}

function draftLines(text, fallback = []) {
  const lines = String(text || '').split('\n').map(s => s.trim()).filter(Boolean)
  return lines.length ? lines : fallback
}

function downloadTextFile(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function buildPrintableHtml(r, variant, draft, user) {
  const m = variant === 'manager'
  const name = user?.name || 'Current user'
  const role = user?.role || 'Role not set'
  const renderList = (text) => draftLines(text).map(item => `<li>${item}</li>`).join('')
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${r.week} ${m ? 'Weekly Review' : 'Personal Review'}</title>
  <style>
    body { font-family: Georgia, serif; color: #0C1A35; margin: 48px; line-height: 1.55; }
    h1 { font-size: 34px; margin: 0 0 8px; }
    h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid #B0BDD0; padding-bottom: 5px; margin-top: 28px; }
    .meta { color: #4A5C7A; font-family: system-ui, sans-serif; font-size: 13px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 24px 0; font-family: system-ui, sans-serif; }
    .stat { border: 1px solid #DDE1EE; padding: 10px; }
    .label { color: #4A5C7A; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
    .value { font-size: 24px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="meta">${r.week.toUpperCase()} · ${m ? 'FOR MAYA' : 'PRIVATE'}</div>
  <h1>${m ? 'Weekly review' : 'My honest week'}</h1>
  <div class="meta">${draft.dates} · ${name} · ${role}</div>
  <div class="stats">
    <div class="stat"><div class="label">Score</div><div class="value">${r.score}</div></div>
    <div class="stat"><div class="label">Wins</div><div class="value">${r.wins}</div></div>
    <div class="stat"><div class="label">Learnings</div><div class="value">${r.learnings}</div></div>
    <div class="stat"><div class="label">Blockers</div><div class="value">${r.blockers}</div></div>
  </div>
  <h2>${m ? 'Top wins' : 'What felt good'}</h2><ul>${renderList(draft.wins)}</ul>
  <h2>${m ? 'What I learned' : 'The messy version'}</h2><ul>${renderList(draft.learnings)}</ul>
  <h2>${m ? 'Blockers' : 'What stuck'}</h2><ul>${renderList(draft.blockers)}</ul>
  <h2>${m ? 'Next week' : 'Promises to myself'}</h2><ol>${renderList(draft.next)}</ol>
</body>
</html>`
}

// ── LaTeX builder ──────────────────────────────────────────────────────────────
function buildLatex(r, wins, variant, draft, user) {
  const m = variant === 'manager'
  const name = user?.name || 'Current user'
  const role = user?.role || 'Role not set'
  const winItems = draft ? draftLines(draft.wins) : wins.slice(0,3).map(w => `\\textbf{${w.title}} --- ${w.detail}`)
  const learningItems = draft ? draftLines(draft.learnings) : (m
    ? ['Profile \\emph{before} optimizing.', 'Multi-doc evals need separate axes.', 'RFCs surface hidden assumptions faster.']
    : ['I keep optimizing the wrong thing.', 'The doubt is the slowest part of my week.', 'Public writing is how I get in the rooms I want.'])
  const blockerItems = draft ? draftLines(draft.blockers) : (m
    ? ['Cluster quota (8xA100) --- IT ticket open. \\textbf{Can you nudge?}', 'Eval set v3 --- pending legal.']
    : ["Comparing myself to Jonas. He's been here 3 years.", "Cluster quota felt like proof I don't matter yet."])
  const nextItems = draft ? draftLines(draft.next) : (m
    ? ['Ship LoRA sweep once cluster unblocks.', 'Pair with Jonas on the RFC.', 'Volunteer for Thursday review.']
    : ['No laptop after 10pm.', 'Ask one dumb question per standup.', 'Send Maya the manager version.'])
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{xcolor,titlesec,enumitem}
\\definecolor{accent}{HTML}{003594}
\\definecolor{muted}{HTML}{6B6760}
\\titleformat{\\section}{\\large\\bfseries}{}{0pt}{}[\\titlerule]
\\setlist{leftmargin=*,itemsep=2pt}
\\begin{document}\\pagestyle{empty}
% ${m ? 'MANAGER VERSION' : 'PERSONAL — private'}
{\\color{accent}\\textbf{${r.week.toUpperCase()} · ${m ? 'FOR MAYA' : 'PRIVATE'}}}\\\\[2pt]
{\\huge\\bfseries ${m ? 'Weekly review' : 'My honest week'}}\\\\[4pt]
{\\color{muted}\\small ${(draft?.dates || r.dates)} · ${name} · ${role}}\\\\[10pt]
\\noindent\\fbox{\\parbox{\\textwidth}{
  \\textbf{Score:} ${r.score}\\quad\\textbf{Wins:} ${r.wins}\\quad
  \\textbf{Learnings:} ${r.learnings}\\quad\\textbf{Blockers:} ${r.blockers}
}}\\\\[10pt]
\\section*{${m ? 'Top wins' : 'What felt good'}}
\\begin{itemize}
${winItems.map(item => `  \\item ${item}`).join('\n')}
\\end{itemize}
\\section*{${m ? 'What I learned' : 'The messy version'}}
\\begin{itemize}
${learningItems.map(item => `  \\item ${item}`).join('\n')}
\\end{itemize}
\\section*{${m ? 'Blockers' : 'What stuck'}}
\\begin{itemize}
${blockerItems.map(item => `  \\item ${item}`).join('\n')}
\\end{itemize}
\\section*{${m ? 'Next week' : 'Promises to myself'}}
\\begin{enumerate}
${nextItems.map(item => `  \\item ${item}`).join('\n')}
\\end{enumerate}
\\vfill{\\color{muted}\\small Generated by Steppr · ${r.date}}
\\end{document}`
}

// ── Markdown source builder ────────────────────────────────────────────────────
function buildMarkdownSource(r, variant, draft) {
  const m = variant === 'manager'
  const section = (text) => draftLines(text).map(item => `- ${item}`)
  return [
    '---',
    `week: ${r.week}`,
    `dates: ${draft?.dates || r.dates}`,
    `score: ${r.score}`,
    `wins: ${r.wins}`,
    `learnings: ${r.learnings}`,
    `blockers: ${r.blockers}`,
    ...(m ? [] : ['mood: 7.4']),
    `variant: ${variant}`,
    '---',
    '',
    ...(m ? [] : ['<!-- Private — Maya never sees this. Be honest. -->', '']),
    `## ${m ? 'Top Wins' : 'What Felt Good'}`,
    '',
    ...(draft ? section(draft.wins) : [
      '- **Eval pipeline** — Parallel worker pool: 4h → 22min. Tokenizer was the bottleneck.',
      '- **LoRA sweep** — 3B param fine-tuning experiments with full mentor sign-off.',
      '- **RFC shipped** — First solo architecture document. Zero revision requests.',
    ]),
    '',
    `## ${m ? 'What I Learned' : 'The Messy Version'}`,
    '',
    ...(draft ? section(draft.learnings) : m
      ? [
          '- Profile *before* optimizing — the bottleneck is rarely where you assume.',
          '- Multi-doc retrieval evals need separate latency + accuracy axes.',
          '- RFCs surface hidden assumptions faster than DMs to senior staff.',
        ]
      : [
          "- I keep optimizing the wrong thing first. Ego protects me from the real work.",
          "- I'm faster than I think; the *doubt* is the slowest part of my week.",
          "- Public writing scares me, but it's how I get in the rooms I want.",
        ]),
    '',
    `## ${m ? 'What Blocked Me' : 'What Stuck'}`,
    '',
    ...(draft ? section(draft.blockers) : m
      ? [
          '- Cluster quota (8×A100) — IT ticket open since Tuesday. **Can you nudge?**',
          '- Eval set v3 access — pending legal review.',
        ]
      : [
          '- Comparing myself to Jonas. He has been here 3 years. I am 5 weeks in.',
          "- Cluster quota felt like proof I don't matter yet. (I know that's not true.)",
          '- Slept 5h Tuesday. Recipe for next-day regret.',
        ]),
    '',
    `## ${m ? 'Next Week' : 'Promises to Myself'}`,
    '',
    ...(draft ? draftLines(draft.next).map((item, i) => `${i + 1}. ${item}`) : m
      ? [
          '1. Ship LoRA sweep results once cluster unblocks.',
          '2. Pair with Jonas on the streaming token-budget RFC.',
          "3. Volunteer to present at Thursday's research review.",
        ]
      : [
          '1. No laptop after 10pm. Real sleep is a feature, not a bug.',
          '2. Ask one "dumb" question per standup. Out loud.',
          "3. Send Maya the manager version. She doesn't need the rest.",
        ]),
  ].join('\n')
}

// ── Inline markdown tokenizer ──────────────────────────────────────────────────
function tokenizeInline(text) {
  if (!text) return [{ t: ' ', c: 'var(--ink-2)' }]
  const tokens = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        tokens.push({ t: '**' + text.slice(i + 2, end) + '**', c: '#E6A318', b: true })
        i = end + 2
        continue
      }
    }
    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1)
      if (end !== -1) {
        tokens.push({ t: '*' + text.slice(i + 1, end) + '*', c: 'var(--ink-3)', it: true })
        i = end + 1
        continue
      }
    }
    let j = i + 1
    while (j < text.length && text[j] !== '*') j++
    tokens.push({ t: text.slice(i, j), c: 'var(--ink-2)' })
    i = j
  }
  return tokens.length ? tokens : [{ t: text, c: 'var(--ink-2)' }]
}

function tokenizeMarkdownLines(source) {
  const lines = source.split('\n')
  let fmCount = 0
  return lines.map(line => {
    if (line === '---') {
      fmCount++
      return [{ t: '---', c: '#9CA3AF' }]
    }
    if (fmCount === 1) {
      const ci = line.indexOf(':')
      if (ci > -1) return [
        { t: line.slice(0, ci + 1), c: '#0891B2' },
        { t: line.slice(ci + 1), c: '#CBD5E1' },
      ]
      return [{ t: line || ' ', c: '#6B7280' }]
    }
    if (!line.trim()) return [{ t: ' ', c: 'transparent' }]
    if (line.startsWith('<!--')) return [{ t: line, c: '#6B7280', it: true }]
    if (/^#{1,6}\s/.test(line)) return [{ t: line, c: 'var(--accent)', b: true }]
    const dashM = line.match(/^(\s*)([-*])(\s+)(.*)/)
    if (dashM) {
      const [, ind, dash, sp, rest] = dashM
      return [{ t: ind + dash + sp, c: 'var(--secondary)' }, ...tokenizeInline(rest)]
    }
    const numM = line.match(/^(\s*\d+\.)(\s+)(.*)/)
    if (numM) {
      const [, num, sp, rest] = numM
      return [{ t: num + sp, c: 'var(--secondary)' }, ...tokenizeInline(rest)]
    }
    return tokenizeInline(line)
  })
}

// ── Markdown editor with line numbers ─────────────────────────────────────────
function MarkdownEditor({ source, fixed = false }) {
  const lines = useMemo(() => tokenizeMarkdownLines(source), [source])
  return (
    <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: fixed ? 11 : 12.5, lineHeight: fixed ? 1.45 : 1.75, flex: 1, overflow: fixed ? 'hidden' : 'auto' }}>
      {lines.map((tokens, i) => (
        <div key={i} style={{ display: 'flex', minHeight: 22 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,53,148,0.035)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span style={{ width: 44, paddingRight: 14, textAlign: 'right', color: 'var(--ink-5)', userSelect: 'none', flexShrink: 0, fontSize: 11, lineHeight: 'inherit' }}>
            {i + 1}
          </span>
          <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingRight: 24 }}>
            {tokens.map((tok, j) => (
              <span key={j} style={{ color: tok.c, fontWeight: tok.b ? 600 : 400, fontStyle: tok.it ? 'italic' : 'normal' }}>
                {tok.t}
              </span>
            ))}
          </span>
        </div>
      ))}
    </pre>
  )
}

// ── LaTeX highlighter ──────────────────────────────────────────────────────────
function LatexHighlighter({ source, fixed = false }) {
  const lines = source.split('\n')
  const tok = line => {
    if (/^\s*%/.test(line)) return [{ t: line, c: '#9CA3AF', i: true }]
    const parts = []; let i = 0
    const re = /(\\[a-zA-Z@]+\*?)|(\\[\\\$&%#_{}~^])|(\{|\})|(\[[^\]]*\])|(\$[^$]*\$)/g
    let m
    while ((m = re.exec(line)) !== null) {
      if (m.index > i) parts.push({ t: line.slice(i, m.index), c: '#374151' })
      if (m[1]) parts.push({ t: m[1], c: '#7C3AED', b: true })
      else if (m[2]) parts.push({ t: m[2], c: '#7C3AED' })
      else if (m[3]) parts.push({ t: m[3], c: '#0EA5E9' })
      else if (m[4]) parts.push({ t: m[4], c: '#003594' })
      else if (m[5]) parts.push({ t: m[5], c: '#DC2626' })
      i = m.index + m[0].length
    }
    if (i < line.length) parts.push({ t: line.slice(i), c: '#374151' })
    return parts.length ? parts : [{ t: line || ' ', c: '#374151' }]
  }
  return (
    <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: fixed ? 10.5 : 12, lineHeight: fixed ? 1.4 : 1.65, flex: 1, overflow: fixed ? 'hidden' : 'auto' }}>
      {lines.map((ln, idx) => (
        <div key={idx} style={{ display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,53,148,0.035)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span style={{ width: 44, paddingRight: 14, textAlign: 'right', color: 'var(--ink-5)', userSelect: 'none', flexShrink: 0, fontSize: 11 }}>{idx + 1}</span>
          <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1, paddingRight: 24 }}>
            {tok(ln).map((p, j) => <span key={j} style={{ color: p.c, fontWeight: p.b ? 600 : 400, fontStyle: p.i ? 'italic' : 'normal' }}>{p.t}</span>)}
          </span>
        </div>
      ))}
    </pre>
  )
}

// ── Document section divider ───────────────────────────────────────────────────
function DocSection({ title, compact = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: compact ? 10 : 20, marginTop: compact ? 16 : 32 }}>
      <h2 style={{ fontFamily: '"Newsreader", Charter, "Times New Roman", serif', fontSize: compact ? 15 : 22, fontWeight: 600, fontStyle: 'italic', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap', margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: 'var(--line-2)', alignSelf: 'center' }}/>
    </div>
  )
}

// ── Document preview ───────────────────────────────────────────────────────────
function DocumentPreview({ r, variant, draft, user, wins = [], fixed = false }) {
  const m = variant === 'manager'
  const name = user?.name || 'Current user'
  const role = user?.role || 'Role not set'
  const winItems = draftLines(draft?.wins, wins.slice(0, 3).map(w => `${w.title}: ${w.detail}`))
  const learningItems = draftLines(draft?.learnings, m
    ? ['Profile before optimizing — the bottleneck is rarely where you assume.', 'Multi-doc retrieval evals need separate latency + accuracy axes.', 'Writing RFCs surfaces hidden assumptions faster than DMing senior staff.']
    : ['I keep optimizing the wrong thing first — ego protects me from the real work.', "I'm faster than I think; the doubt is the slowest part of my week.", "Public writing scares me, but it's how I get pulled into the rooms I want."])
  const blockerItems = draftLines(draft?.blockers, m
    ? ['Cluster quota for the 8xA100 sweep — IT ticket open since Tuesday. Asking: can you nudge?', 'Eval set v3 access — pending legal review.']
    : ["Comparing myself to Jonas every standup. He's been here 3 years. I'm 5 weeks in.", "Cluster quota — felt like proof I don't matter yet. (I know that's not true.)", 'Slept 5h Tuesday. Recipe for next-day regret.'])
  const nextItems = draftLines(draft?.next, m
    ? ['Ship LoRA sweep results once cluster unblocks.', 'Pair with Jonas on the streaming token-budget RFC.', "Volunteer to present at Thursday's research review."]
    : ['No laptop after 10pm. Real sleep is a feature, not a bug.', 'Ask one "dumb" question per day in standup. Out loud.', "Send Maya the manager version of this. She doesn't need the rest."])
  return (
    <div style={{ flex: 1, overflow: fixed ? 'hidden' : 'auto', background: '#E9E8E7', padding: fixed ? '18px 18px 24px' : '32px 24px 60px', display: fixed ? 'flex' : 'block', alignItems: fixed ? 'flex-start' : undefined }}>
      <div style={{ width: '100%', maxWidth: fixed ? 620 : 680, margin: '0 auto', background: '#fff', boxShadow: '0 1px 4px rgba(20,18,14,0.10)', padding: fixed ? '34px 46px' : '60px 72px', minHeight: fixed ? 'auto' : 700, boxSizing: 'border-box', fontSize: fixed ? 12 : undefined }}>

        <div style={{ marginBottom: fixed ? 16 : 28, paddingBottom: fixed ? 12 : 18, borderBottom: '2px solid var(--ink)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: m ? 'var(--accent)' : '#7C3AED', marginBottom: 8 }}>
            {r.week} · {m ? 'For Maya' : 'Private'}
          </div>
          <h1 style={{ fontFamily: '"Newsreader", Charter, "Times New Roman", serif', fontSize: fixed ? 28 : 38, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 10px', color: 'var(--ink)' }}>
            {m ? 'Weekly review' : 'My honest week'}
          </h1>
          <div style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
            <span>{draft?.dates || r.dates}</span><span>·</span><span>{name}</span><span>·</span>
            <span>{role}{m && user?.team ? ` · ${user.team}` : ''}</span>
          </div>
        </div>

        <div style={{ display: 'flex', border: '1px solid #D0CCC7', marginBottom: fixed ? 16 : 28, borderRadius: 2 }}>
          {[
            { l: 'Score', v: r.score }, { l: 'Wins', v: r.wins },
            { l: 'Learnings', v: r.learnings }, { l: 'Blockers', v: r.blockers },
            ...(!m ? [{ l: 'Mood', v: '7.4' }] : []),
          ].map((s, i, arr) => (
            <div key={s.l} style={{ flex: 1, padding: '10px 14px', borderRight: i < arr.length - 1 ? '1px solid #D0CCC7' : 'none' }}>
              <div style={{ fontSize: 10, color: '#6B6760', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.l}</div>
              <div style={{ fontSize: fixed ? 20 : 26, fontWeight: 500, lineHeight: 1.1, marginTop: 3 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {!m && (
          <div style={{ padding: '12px 16px', border: '1px solid #E9D5FF', borderRadius: 3, marginBottom: 24, fontSize: 13, color: '#581C87', fontStyle: 'italic', fontFamily: '"Newsreader", serif', lineHeight: 1.6 }}>
            Note to self — Maya never sees this. Be honest. Spot the patterns before they become problems.
          </div>
        )}

        <DocSection title={m ? 'Top Wins' : 'What Felt Good'} compact={fixed}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: fixed ? 8 : 14, paddingLeft: fixed ? 8 : 20, marginBottom: 8 }}>
          {winItems.slice(0, 3).map((item, i) => {
            const [title, ...rest] = item.split(':')
            return (
            <div key={`${item}-${i}`} style={{ paddingLeft: 16, borderLeft: '4px solid var(--accent)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)' }}>{title}</div>
              <div style={{ fontFamily: '"Newsreader", serif', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.5 }}>{rest.join(':').trim()}</div>
            </div>
          )})}
        </div>

        {!fixed && <DocSection title={m ? 'What I Learned' : 'The Messy Version'}/>}
        {fixed && <DocSection title={m ? 'Learning + blockers' : 'Pattern'} compact/>}
        <ul style={{ paddingLeft: fixed ? 24 : 40, margin: '0 0 8px', fontSize: fixed ? 12.5 : 14, fontFamily: '"Newsreader", Charter, serif', lineHeight: fixed ? 1.45 : 1.7, color: '#4B4843' }}>
          {learningItems.slice(0, fixed ? 2 : 3).map((item, i) => <li key={item} style={{ marginBottom: i < learningItems.length - 1 ? 6 : 0 }}>{item}</li>)}
        </ul>

        {!fixed && (
          <>
            <DocSection title={m ? 'What Blocked Me' : 'What Stuck'}/>
            <ul style={{ paddingLeft: 40, margin: '0 0 8px', fontSize: 14, fontFamily: '"Newsreader", Charter, serif', lineHeight: 1.7, color: '#4B4843' }}>
              {blockerItems.map((item, i) => <li key={item} style={{ marginBottom: i < blockerItems.length - 1 ? 6 : 0 }}>{item}</li>)}
            </ul>
          </>
        )}

        <DocSection title={m ? 'Next Week' : 'Promises to Myself'} compact={fixed}/>
        <ol style={{ paddingLeft: fixed ? 24 : 40, margin: 0, fontSize: fixed ? 12.5 : 14, fontFamily: '"Newsreader", Charter, serif', lineHeight: fixed ? 1.45 : 1.7, color: '#4B4843' }}>
          {nextItems.map((item, i) => <li key={item} style={{ marginBottom: i < nextItems.length - 1 ? 6 : 0 }}>{item}</li>)}
        </ol>

        <div style={{ marginTop: fixed ? 18 : 48, paddingTop: fixed ? 10 : 16, borderTop: '1px solid #E5E1DC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.35 }}>
          <span style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 13 }}>Drafted with Steppr · {m ? 'Manager Edition' : 'Personal Edition'}</span>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: 18 }}>{r.week}</span>
        </div>
      </div>
    </div>
  )
}

// ── File explorer (left panel) ─────────────────────────────────────────────────
function FileExplorer({ reports, activeIdx, setActiveIdx, variant, setVariant }) {
  const I = Icons
  const [open, setOpen] = useState({ reports: true, templates: true })

  const FolderRow = ({ id, label }) => (
    <button onClick={() => setOpen(f => ({ ...f, [id]: !f[id] }))}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
      <span style={{ fontSize: 8 }}>{open[id] ? '▾' : '▸'}</span>
      {label}
    </button>
  )

  const FileRow = ({ label, active, dimmed, onClick }) => (
    <button onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px 4px 28px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12.5, background: active ? 'rgba(0,53,148,0.08)' : 'transparent', color: active ? 'var(--accent)' : dimmed ? 'var(--ink-5)' : 'var(--ink-2)', fontWeight: active ? 600 : 400, transition: 'background .1s' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-3)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <span style={{ fontSize: 9, flexShrink: 0, opacity: 0.6 }}>◻</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>}
    </button>
  )

  return (
    <div style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRight: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Explorer</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingTop: 6, paddingBottom: 6 }}>
        <FolderRow id="reports" label="Reports"/>
        {open.reports && reports.map((r, i) => (
          <FileRow
            key={i}
            label={`${r.week.toLowerCase().replace(' ', '-')}.md`}
            active={activeIdx === i}
            onClick={() => setActiveIdx(i)}
          />
        ))}
        <div style={{ height: 6 }}/>
        <FolderRow id="templates" label="Templates"/>
        {open.templates && ['manager', 'personal'].map(t => (
          <FileRow
            key={t}
            label={`${t}.md`}
            active={false}
            onClick={() => setVariant(t)}
            dimmed={variant !== t}
          />
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--line)', padding: '6px 8px', flexShrink: 0 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ink-4)', borderRadius: 6, textAlign: 'left' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <I.Settings size={13}/> Settings
        </button>
      </div>
    </div>
  )
}

// ── AI Coach panel (right) ─────────────────────────────────────────────────────
const COACH_TABS = [
  { id: 'chat', label: 'Chat' },
  { id: 'insights', label: 'Insights' },
  { id: 'memory', label: 'Memory' },
]

function CoachPanel({ report: r, variant }) {
  const I = Icons
  const [tab, setTab] = useState('chat')
  const [msgs, setMsgs] = useState([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [msgs, pending])

  const send = async text => {
    const t = (text ?? draft).trim()
    if (!t || pending) return
    setMsgs(m => [...m, { role: 'user', content: t }])
    setDraft('')
    setPending(true)
    try {
      const reply = await window.claude?.complete({ messages: [{ role: 'user', content: `You are Steppr's AI Coach for Daryl, ML/AI intern at Vector Lab in ${r.week}. Concise (2–3 paragraphs), warm but direct. Score ${r.score}, ${r.wins} wins, ${r.blockers} blockers. User: "${t}"` }] })
      setMsgs(m => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: "Focus on visibility this week. Send Maya a 3-bullet update Friday morning. Volunteer to present the eval results at Thursday's review." }])
    }
    setPending(false)
  }

  const insights = [
    { l: 'Growth Score', v: r.score, c: 'var(--accent)' },
    { l: 'Wins captured', v: r.wins, c: '#7C3AED' },
    { l: 'Learnings', v: r.learnings, c: '#0891B2' },
    { l: 'Blockers', v: r.blockers, c: '#DC2626' },
  ]

  const memoryItems = [
    'Wants return offer at Vector Lab',
    'Strongest after planning mornings',
    'Mentor: Maya · Senior: Jonas',
    'Underdeveloped: communication',
    'Wins cadence improving week-over-week',
  ]

  return (
    <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderLeft: '1px solid var(--line)', background: 'var(--surface)' }}>

      {/* Header */}
      <div style={{ padding: '12px 16px 0', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <I.Spark size={14} style={{ color: '#fff' }}/>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em' }}>AI Coach</div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{r.week} · {r.score} pts</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <span className="ai-pulse"/>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          {COACH_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '6px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--ink)' : 'var(--ink-4)', position: 'relative', transition: 'color .15s' }}>
              {t.label}
              {tab === t.id && <span style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2, background: 'var(--accent)', borderRadius: '2px 2px 0 0' }}/>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>

        {tab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
              Hey Daryl — I've got your <strong>{r.week}</strong> context loaded. What's on your mind?
            </p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {COACH_PROMPTS.slice(0, 3).map(p => (
                <button key={p} onClick={() => send(p)}
                  style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg-2)', cursor: 'pointer', color: 'var(--ink-3)' }}>
                  {p}
                </button>
              ))}
            </div>
            {msgs.map((m, i) => (
              <div key={i} style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid var(--line)', background: m.role === 'user' ? 'var(--bg-2)' : 'rgba(0,53,148,0.04)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, color: m.role === 'user' ? 'var(--ink-4)' : 'var(--accent)' }}>
                  {m.role === 'user' ? 'You' : 'AI Coach'}
                </div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink-2)', fontStyle: m.role === 'user' ? 'italic' : 'normal' }}>{m.content}</p>
              </div>
            ))}
            {pending && (
              <div style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid rgba(0,53,148,0.15)', background: 'rgba(0,53,148,0.04)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, color: 'var(--accent)' }}>AI Coach</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', opacity: 0.5, animation: `aiPulse 1.4s ${i * 0.15}s infinite` }}/>)}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 2 }}>{r.week} · {r.dates}</div>
            {insights.map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-2)', borderRadius: 9, border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{s.l}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</span>
              </div>
            ))}
            <div style={{ marginTop: 4, padding: '10px 12px', background: 'var(--accent-tint)', borderRadius: 9, border: '1px solid rgba(0,53,148,0.15)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-2)', marginBottom: 4 }}>AI Summary</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>Strong week. Eval pipeline win is resume-ready. Cluster quota blocker needs escalation — loop Maya in directly.</p>
            </div>
          </div>
        )}

        {tab === 'memory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 2 }}>Coach context</div>
            {memoryItems.map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, padding: '8px 11px', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                <Icons.Pin size={11} style={{ color: 'var(--ink-4)', flexShrink: 0, marginTop: 2 }}/>{t}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat input */}
      {tab === 'chat' && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid var(--line)', borderRadius: 8, padding: '7px 11px', background: 'var(--bg-2)' }}>
            <input value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask about your week…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: 'var(--ink)' }}/>
            <button onClick={() => send()} disabled={pending}
              style={{ background: 'none', border: 'none', cursor: pending ? 'not-allowed' : 'pointer', color: 'var(--accent)', padding: 0, display: 'flex' }}>
              <Icons.Send size={15}/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab bar ────────────────────────────────────────────────────────────────────
function TabBar({ reports, activeIdx, setActiveIdx, view, setView, variant, setVariant, isMobile }) {
  const I = Icons
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', height: 36, borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', flexShrink: 0, overflowX: 'auto', overflowY: 'hidden' }}>

      {/* File tabs */}
      {reports.map((r, i) => {
        const active = activeIdx === i
        return (
          <button key={i} onClick={() => setActiveIdx(i)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', border: 'none', cursor: 'pointer', fontSize: 12.5, whiteSpace: 'nowrap', flexShrink: 0, position: 'relative', transition: 'background .1s', borderRight: '1px solid var(--line)', background: active ? 'var(--surface)' : 'transparent', color: active ? 'var(--ink)' : 'var(--ink-4)', fontWeight: active ? 500 : 400 }}>
            {active && <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)' }}/>}
            <span style={{ fontSize: 9, opacity: 0.5 }}>◻</span>
            {`${r.week.toLowerCase().replace(' ', '-')}.md`}
          </button>
        )
      })}

      <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 11.5, color: 'var(--ink-4)', flexShrink: 0, borderRight: '1px solid var(--line)' }}>
        <I.Plus size={10}/> Generate
      </button>

      <div style={{ flex: 1 }}/>

      {/* Variant toggle */}
      {!isMobile && (
        <>
          <div style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch', margin: '7px 0' }}/>
          {[{ k: 'manager', l: 'Manager' }, { k: 'personal', l: 'Personal' }].map(v => (
            <button key={v.k} onClick={() => setVariant(v.k)}
              style={{ padding: '0 11px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: variant === v.k ? 'var(--ink)' : 'var(--ink-4)', fontWeight: variant === v.k ? 600 : 400, position: 'relative' }}>
              {v.l}
              {variant === v.k && <span style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, background: 'var(--secondary)', borderRadius: '2px 2px 0 0' }}/>}
            </button>
          ))}
        </>
      )}

      {/* View toggle */}
      <div style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch', margin: '7px 0' }}/>
      {[{ k: 'preview', l: 'Preview' }, { k: 'source', l: 'Source' }, { k: 'latex', l: 'LaTeX' }].map(v => (
        <button key={v.k} onClick={() => setView(v.k)}
          style={{ padding: '0 11px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: view === v.k ? 'var(--ink)' : 'var(--ink-4)', fontWeight: view === v.k ? 600 : 400, position: 'relative' }}>
          {v.l}
          {view === v.k && <span style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, background: 'var(--accent)', borderRadius: '2px 2px 0 0' }}/>}
        </button>
      ))}
    </div>
  )
}

// ── Status bar ─────────────────────────────────────────────────────────────────
function StatusBar({ r, variant, view, latexSource }) {
  const I = Icons
  return (
    <div style={{ height: 26, background: 'var(--ink)', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', fontSize: 11.5, flexShrink: 0, overflow: 'hidden', paddingLeft: 12, paddingRight: 8, gap: 0 }}>
      <span style={{ color: 'var(--secondary)', marginRight: 8, fontSize: 10 }}>●</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, marginRight: 10, color: 'rgba(255,255,255,0.55)' }}>Auto-saved</span>
      <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.12)', marginRight: 10 }}/>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginRight: 10 }}>
        reports/{r.week.toLowerCase().replace(' ', '-')}.md
      </span>
      <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.12)', marginRight: 10 }}/>
      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', marginRight: 10, textTransform: 'capitalize' }}>{variant}</span>
      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>{r.dates}</span>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: 'var(--secondary)', fontWeight: 600, marginRight: 10 }}>{r.score} pts</span>
        <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.12)', marginRight: 8 }}/>
        <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: 10.5, padding: '0 6px' }}>
          <I.Download size={11}/> Export PDF
        </button>
        <button disabled={variant === 'personal'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: variant === 'personal' ? 'not-allowed' : 'pointer', color: variant === 'personal' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.65)', fontSize: 10.5, padding: '0 6px' }}>
          <I.Send size={11}/> Send to Maya
        </button>
        {view === 'latex' && (
          <button onClick={() => navigator.clipboard?.writeText(latexSource)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: 10.5, padding: '0 6px' }}>
            <I.Copy size={11}/> Copy LaTeX
          </button>
        )}
        <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.12)', margin: '0 8px' }}/>
        <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', paddingRight: 4 }}>ML Intern · Vector Lab</span>
      </div>
    </div>
  )
}

// ── Center editor pane ─────────────────────────────────────────────────────────
function EditorPane({ r, variant, view, markdownSource, latexSource, draft, user, wins, fixed = false }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {view === 'preview' && <DocumentPreview r={r} variant={variant} draft={draft} user={user} wins={wins} fixed={fixed}/>}
      {view === 'source' && (
        <div style={{ flex: 1, overflow: fixed ? 'hidden' : 'auto', background: 'var(--surface)', padding: fixed ? '12px 0 12px 6px' : '18px 0 18px 6px', display: 'flex', flexDirection: 'column' }}>
          <MarkdownEditor source={markdownSource} fixed={fixed}/>
        </div>
      )}
      {view === 'latex' && (
        <div style={{ flex: 1, overflow: fixed ? 'hidden' : 'auto', background: '#FAFAF7', padding: fixed ? '12px 0 12px 6px' : '18px 0 18px 6px', display: 'flex', flexDirection: 'column' }}>
          <LatexHighlighter source={latexSource} fixed={fixed}/>
        </div>
      )}
    </div>
  )
}

function ReviewCard({ children, style }) {
  return (
    <div className="card" style={{ borderRadius: 8, overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function ReviewToggle({ items, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', padding: 3, borderRadius: 999, background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
      {items.map(item => (
        <button key={item.k} onClick={() => onChange(item.k)}
          style={{ padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: value === item.k ? 700 : 500, color: value === item.k ? '#fff' : 'var(--ink-3)', background: value === item.k ? 'var(--ink)' : 'transparent', whiteSpace: 'nowrap' }}>
          {item.l}
        </button>
      ))}
    </div>
  )
}

function ReviewCoachRail({ r, variant, reports, wins, activeIdx, setActiveIdx, setReviewDraft, onSave }) {
  const I = Icons
  const [coachDraft, setCoachDraft] = useState('')
  const [coachReply, setCoachReply] = useState('Focus on the specific ask: Maya can unblock quota and visibility. Keep the review outcome-led, then use blockers only to explain what needs intervention.')
  const prompts = [
    'How should I frame the blocker?',
    'Make this sound more manager-ready.',
    'What did I understate this week?',
  ]
  const insightGroups = [
    { title: 'Weekly review insights', sub: '6 insights', items: ['Best signal: eval pipeline speedup', 'Strongest theme: technical ownership', 'Risk: blocker needs a specific ask'] },
    { title: 'Wins to highlight', sub: `${wins.length} ready`, items: wins.slice(0, 3).map(w => w.title) },
    { title: 'Manager framing', sub: variant === 'manager' ? 'Active' : 'Private', items: ['Lead with outcomes', 'Keep emotions out of blockers', 'Name exactly where Maya can help'] },
  ]

  return (
    <ReviewCard style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--line)' }}>
        <div className="row items-center gap-2" style={{ marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--ink)', color: '#fff' }} className="center">
            <I.Spark size={16}/>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Steppr Coach</div>
            <div className="muted" style={{ fontSize: 12 }}>{r.week} · {r.score} growth score</div>
          </div>
        </div>
        <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.45 }}>
          I drafted your weekly review from the wins, blockers, and learning notes. Ask me to tighten sections, shift tone, or pull out better evidence.
        </p>
      </div>

      <div style={{ padding: 12, borderBottom: '1px solid var(--line)', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {reports.map((report, i) => (
          <button key={report.week} onClick={() => setActiveIdx(i)}
            className="chip"
            style={{ background: activeIdx === i ? 'var(--ink)' : 'var(--surface)', color: activeIdx === i ? '#fff' : 'var(--ink-2)', borderColor: activeIdx === i ? 'var(--ink)' : 'var(--line)', flexShrink: 0 }}>
            {report.week}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: 12 }} className="col gap-2">
        {insightGroups.map(group => (
          <details key={group.title} open style={{ border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface)' }}>
            <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '9px 10px' }}>
              <div className="between">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{group.title}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{group.sub}</div>
                </div>
                <I.ChevronDown size={14} style={{ color: 'var(--ink-4)' }}/>
              </div>
            </summary>
            <div style={{ padding: '0 10px 10px' }} className="col gap-2">
              {group.items.slice(0, 2).map(item => (
                <div key={item} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }}/>
                  {item}
                </div>
              ))}
            </div>
          </details>
        ))}

        <button onClick={() => setCoachDraft('How can I better tailor this review to Maya?')} style={{ textAlign: 'left', padding: 12, borderRadius: 8, background: 'var(--accent-tint)', border: '1px solid var(--line-2)', color: 'var(--accent-2)', fontWeight: 700, lineHeight: 1.35, fontSize: 13 }}>
          How can I better tailor this review to Maya?
        </button>
        <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--line)', fontSize: 12.5, lineHeight: 1.4, color: 'var(--ink-2)' }}>
          {coachReply}
        </div>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
        <div style={{ border: '1px solid var(--line-2)', borderRadius: 8, background: 'var(--surface-2)', padding: 10 }}>
          <textarea value={coachDraft} onChange={e => setCoachDraft(e.target.value)} placeholder="Trim, tailor, sharpen..."
            style={{ width: '100%', height: 48, resize: 'none', border: 0, outline: 0, background: 'transparent', color: 'var(--ink)', fontSize: 13, lineHeight: 1.35 }}/>
          <div className="between" style={{ marginTop: 8 }}>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {prompts.slice(0, 1).map(p => <button key={p} onClick={() => setCoachDraft(p)} className="chip" style={{ fontSize: 11 }}>{p}</button>)}
            </div>
            <button
              className="btn btn-accent"
              style={{ padding: 8, borderRadius: 8 }}
              onClick={() => {
                const request = coachDraft.trim()
                if (!request) return
                const lower = request.toLowerCase()
                if (lower.includes('tailor') || lower.includes('manager')) {
                  setReviewDraft(s => ({ ...s, blockers: s.blockers.replace('Ask Maya to nudge.', 'Ask Maya to nudge the quota ticket and confirm timing for the sweep.') }))
                  setCoachReply('I tightened the blocker ask so it names the exact manager action. The rest of the review can stay outcome-first.')
                } else if (lower.includes('trim') || lower.includes('short')) {
                  setReviewDraft(s => ({ ...s, wins: draftLines(s.wins).slice(0, 2).join('\n'), learnings: draftLines(s.learnings).slice(0, 2).join('\n') }))
                  setCoachReply('I trimmed the wins and learnings to the two strongest signals so the report reads faster.')
                } else {
                  setCoachReply(`Noted: "${request}" I would keep the review concrete: outcome, evidence, blocker, ask.`)
                }
                setCoachDraft('')
                onSave?.('Coach changes applied')
              }}
            ><I.Send size={14}/></button>
          </div>
        </div>
      </div>
    </ReviewCard>
  )
}

function ReviewField({ label, children, action }) {
  return (
    <section style={{ padding: '12px 0', borderTop: '1px solid var(--line)' }}>
      <div className="between" style={{ marginBottom: 8 }}>
        <div className="eyebrow">{label}</div>
        {action && <button style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>{action}</button>}
      </div>
      {children}
    </section>
  )
}

function EditableList({ items, color = 'var(--accent)' }) {
  return (
    <div className="col gap-2">
      {items.map((item, i) => (
        <div key={item} className="row gap-2" style={{ alignItems: 'flex-start' }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: color, marginTop: 11, flexShrink: 0 }}/>
          <textarea defaultValue={item}
            style={{ flex: 1, minHeight: 42, resize: 'vertical', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 11px', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 13, lineHeight: 1.45, outline: 0 }}/>
        </div>
      ))}
    </div>
  )
}

function ComputedMetric({ label, value, tone = 'var(--accent)' }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface-2)', padding: 10 }}>
      <div className="muted" style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: tone, marginTop: 5 }}>{value}</div>
      <div className="muted" style={{ fontSize: 10, marginTop: 5 }}>Computed</div>
    </div>
  )
}

function CompactReviewText({ value, onChange, rows = 3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      style={{ width: '100%', resize: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '9px 10px', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 12.5, lineHeight: 1.35, outline: 0 }}/>
  )
}

function ReviewEditorRail({ r, variant, setVariant, draft, setDraft, onSave }) {
  const I = Icons
  const update = (key, value) => setDraft(s => ({ ...s, [key]: value }))

  return (
    <ReviewCard style={{ minHeight: 0, overflow: 'hidden' }}>
      <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="between" style={{ marginBottom: 12, flexShrink: 0 }}>
          <div>
            <div className="eyebrow">Review editor</div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>{r.week}</div>
          </div>
          <button className="btn btn-accent" onClick={(e) => onSave?.('Review saved', e)} style={{ padding: '8px 12px', borderRadius: 8 }}><I.Check size={14}/> Save</button>
        </div>

        <ReviewToggle
          value={variant}
          onChange={setVariant}
          items={[{ k: 'manager', l: 'Manager' }, { k: 'personal', l: 'Personal' }]}
        />

        <ReviewField label="Meta">
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Dates</span>
            <input className="input" value={draft.dates} onChange={e => update('dates', e.target.value)} style={{ marginTop: 5, borderRadius: 8 }}/>
          </label>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <ComputedMetric label="Score" value={r.score} tone="var(--accent)"/>
            <ComputedMetric label="Wins" value={r.wins} tone="var(--violet)"/>
            <ComputedMetric label="Blockers" value={r.blockers} tone="var(--rose)"/>
          </div>
        </ReviewField>

        <ReviewField label={variant === 'manager' ? 'Top wins' : 'What felt good'}>
          <CompactReviewText value={draft.wins} onChange={value => update('wins', value)} rows={3}/>
        </ReviewField>

        <ReviewField label={variant === 'manager' ? 'What I learned' : 'The messy version'}>
          <CompactReviewText rows={3} value={draft.learnings} onChange={value => update('learnings', value)}/>
        </ReviewField>

        <ReviewField label={variant === 'manager' ? 'Blockers' : 'What stuck'}>
          <CompactReviewText value={draft.blockers} onChange={value => update('blockers', value)} rows={3}/>
        </ReviewField>

        <ReviewField label={variant === 'manager' ? 'Next week' : 'Promises'}>
          <CompactReviewText rows={3} value={draft.next} onChange={value => update('next', value)}/>
        </ReviewField>
      </div>
    </ReviewCard>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
function ReportsPage() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [variant, setVariant] = useState('manager')
  const [view, setView] = useState('preview')
  const [mobileTab, setMobileTab] = useState('document')
  const [sent, setSent] = useState(false)
  const { isMobile, isTablet, isDesktop } = useBreakpoint()
  const { user } = useCurrentUser()
  const toast = useToast()
  const reports = useQuery(api.appData.listReports)
  const wins = useQuery(api.appData.listWins)
  const drafts = useQuery(api.appData.listReviewDrafts)
  const saveReviewDraft = useMutation(api.appData.saveReviewDraft)
  const sendReviewDraft = useMutation(api.appData.sendReviewDraft)

  const loading = reports === undefined || wins === undefined || drafts === undefined
  const reportList = reports || []
  const winList = wins || []
  const r = reportList[activeIdx] || null
  const fileBase = r ? `${r.week.toLowerCase().replace(' ', '-')}-${variant}` : `review-${variant}`
  const [reviewDraft, setReviewDraft] = useState(() => ({
    dates: '',
    wins: '',
    learnings: '',
    blockers: '',
    next: '',
  }))

  useEffect(() => {
    if (activeIdx >= reportList.length) setActiveIdx(0)
  }, [activeIdx, reportList.length])

  useEffect(() => {
    if (!r || !drafts) return
    const saved = drafts.find((d) => d.weekKey === r.weekKey && d.variant === variant)
    setReviewDraft(saved ? {
      dates: saved.dates,
      wins: saved.wins,
      learnings: saved.learnings,
      blockers: saved.blockers,
      next: saved.next,
    } : defaultReviewDraft(r, variant, winList))
    setSent(false)
  }, [activeIdx, variant, r, drafts, winList])

  const markdownSource = useMemo(() => r ? buildMarkdownSource(r, variant, reviewDraft) : '', [r, variant, reviewDraft])
  const latexSource = useMemo(() => r ? buildLatex(r, winList, variant, reviewDraft, user) : '', [r, winList, variant, reviewDraft, user])
  const showThreePane = isDesktop
  const gridCols = showThreePane ? '320px minmax(0, 1fr) 360px' : isTablet ? '300px minmax(0, 1fr)' : '1fr'

  const saveReview = async (message = 'Review saved', e) => {
    if (!r) return
    await saveReviewDraft({ weekKey: r.weekKey, variant, ...reviewDraft })
    if (e?.clientX) fireConfetti(e.clientX, e.clientY)
    toast?.(message)
  }

  const exportReview = () => {
    if (!r) return
    if (view === 'latex') {
      downloadTextFile(`${fileBase}.tex`, latexSource, 'application/x-tex')
      toast?.('LaTeX exported')
      return
    }
    if (view === 'preview') {
      downloadTextFile(`${fileBase}.html`, buildPrintableHtml(r, variant, reviewDraft, user), 'text/html')
      toast?.('Printable review exported')
      return
    }
    downloadTextFile(`${fileBase}.md`, markdownSource, 'text/markdown')
    toast?.('Markdown exported')
  }

  const sendReview = (e) => {
    if (!r) return
    if (variant === 'personal') {
      toast?.('Personal reviews stay private')
      return
    }
    setSent(true)
    sendReviewDraft({ weekKey: r.weekKey, variant, ...reviewDraft }).then(() => {
      if (e?.clientX) fireConfetti(e.clientX, e.clientY)
      toast?.('Sent to Maya')
    })
  }

  if (loading) {
    return (
      <div className="center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-soft)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }}/>
      </div>
    )
  }

  if (!reportList.length || !r) {
    return (
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '32px 32px 0' }}>
        <div className="card" style={{ padding: 28, borderRadius: 8 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Weekly Review</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 44, marginTop: 6 }}>No Convex report data yet.</h1>
          <p className="muted" style={{ maxWidth: 620 }}>
            Add daily logs, wins, or saved review drafts in Convex and this page will compute weekly score, wins, learnings, and blockers from those records.
          </p>
        </div>
        <div className="dock-spacer"/>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '20px 32px 22px', height: isMobile ? 'auto' : 'calc(100vh - 56px)', overflow: isMobile ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div className="between" style={{ marginBottom: 14, gap: 14, flexWrap: 'wrap', flexShrink: 0 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--accent-2)' }}>Weekly Review</div>
          <h1 className="h1" style={{ fontSize: isMobile ? 32 : 34, margin: '4px 0 0' }}>Shape the story of your week.</h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>{r.dates} · {r.wins} wins · {r.blockers} blockers · drafted for {variant === 'manager' ? 'Maya' : 'you'}</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <ReviewToggle
            value={view}
            onChange={setView}
            items={[{ k: 'preview', l: 'PDF' }, { k: 'source', l: 'Source' }, { k: 'latex', l: 'LaTeX' }]}
          />
          <button className="btn" onClick={exportReview}><Icons.Download size={14}/> Export</button>
          <button className="btn btn-accent" onClick={sendReview}><Icons.Send size={14}/> {sent ? 'Sent' : 'Send'}</button>
        </div>
      </div>

      {isMobile && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, padding: 4, borderRadius: 999, background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
          {[{ k: 'coach', l: 'Coach' }, { k: 'document', l: 'Review' }, { k: 'fields', l: 'Edit' }].map(t => (
            <button key={t.k} onClick={() => setMobileTab(t.k)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 999, fontSize: 12, cursor: 'pointer', color: mobileTab === t.k ? '#fff' : 'var(--ink-3)', background: mobileTab === t.k ? 'var(--ink)' : 'transparent', fontWeight: mobileTab === t.k ? 700 : 500 }}>
              {t.l}
            </button>
          ))}
        </div>
      )}

      <div
        className="grid"
        style={{
          gridTemplateColumns: gridCols,
          gap: 16,
          alignItems: 'stretch',
          height: isMobile ? 'auto' : 'auto',
          flex: isMobile ? 'initial' : 1,
          minHeight: 0,
        }}
      >
        {(showThreePane || isTablet || (isMobile && mobileTab === 'coach')) && (
          <ReviewCoachRail r={r} variant={variant} reports={reportList} wins={winList} activeIdx={activeIdx} setActiveIdx={setActiveIdx} setReviewDraft={setReviewDraft} onSave={saveReview}/>
        )}

        {(!isMobile || mobileTab === 'document') && (
          <ReviewCard style={{ minHeight: isMobile ? 640 : 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-2)' }}>
            <div style={{ height: 42, padding: '0 14px', borderBottom: '1px solid var(--line)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Icons.Reports size={16} style={{ color: 'var(--accent)' }}/>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{r.week.toLowerCase().replace(' ', '-')}.{view === 'latex' ? 'tex' : 'pdf'}</span>
              <span className="chip" style={{ marginLeft: 'auto', background: 'var(--secondary-tint)', color: '#7A4E00' }}>Auto-saved</span>
            </div>
            <EditorPane r={r} variant={variant} view={view} markdownSource={markdownSource} latexSource={latexSource} draft={reviewDraft} user={user} wins={winList} fixed={!isMobile}/>
          </ReviewCard>
        )}

        {(showThreePane || (isMobile && mobileTab === 'fields')) && (
          <ReviewEditorRail r={r} variant={variant} setVariant={setVariant} draft={reviewDraft} setDraft={setReviewDraft} onSave={saveReview}/>
        )}
      </div>

      {isMobile && <div className="dock-spacer"/>}
    </div>
  )
}

export default ReportsPage
