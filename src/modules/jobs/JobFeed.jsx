import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useDB }   from '../../hooks/useDB.js'

/* ── constants ── */
const ROLES = [
  'General Manager','Managing Director','Country Manager','Regional Director',
  'Director','VP / Vice President','Head of Department','C-Suite / Executive',
  'Marketing Manager','Finance Manager','HR Manager','Sales Manager',
  'Operations Manager','Project Manager','Business Development',
  'Software Engineer','Data Scientist','Legal Counsel','Other',
]
const LOCATIONS = [
  'Dubai, UAE','Abu Dhabi, UAE','Sharjah, UAE','UAE (Any)',
  'Riyadh, KSA','Jeddah, KSA','KSA (Any)','Doha, Qatar',
  'Kuwait City','Manama, Bahrain','Muscat, Oman',
  'GCC (Any)','Remote / Global',
]
const INDUSTRIES = [
  'Banking & Finance','Real Estate','Oil & Gas / Energy','Technology & IT',
  'Consulting','Hospitality & Tourism','Healthcare','Marketing & Digital',
  'HR & Recruitment','Legal','Engineering & Construction',
  'Logistics & Aviation','Education','Government','Retail & FMCG',
]
const EXP_LEVELS = [
  { v: '', l: 'Any Experience' },
  { v: '0-2',  l: '0–2 yrs (Entry)' },
  { v: '2-5',  l: '2–5 yrs (Mid)'   },
  { v: '5-10', l: '5–10 yrs (Senior)'},
  { v: '10-20',l: '10–20 yrs'       },
  { v: '20+',  l: '20+ yrs (Executive)'},
]
const JOB_TYPES = ['Full-time','Part-time','Contract','Freelance','Remote','Internship']
const SORT_OPTS = [
  { v: 'match',  l: '⭐ Best Match' },
  { v: 'date',   l: '🕐 Most Recent'},
  { v: 'salary', l: '💰 Salary'     },
]

/* ── scam signals ── */
const SCAM = ['pay to apply','training fee','upfront payment','send passport copy','wire transfer','earn from home guaranteed','100% guaranteed income','no experience needed earn']
function scamCheck(job) {
  const t = `${job.title} ${job.description}`.toLowerCase()
  return SCAM.some(s => t.includes(s))
}

/* ── fetch helpers ── */
async function fetchRemoteOK(query) {
  try {
    const r = await fetch('https://remoteok.com/api', { headers: { 'User-Agent': 'CareerOS-GCC/1.0' } })
    if (!r.ok) return []
    const data = await r.json()
    return data.slice(1)
      .filter(j => j.position && (!query || j.position.toLowerCase().includes(query.toLowerCase()) || (j.tags||[]).some(t => t.toLowerCase().includes(query.toLowerCase()))))
      .slice(0, 30)
      .map(j => ({
        id: `rok_${j.id}`,
        title: j.position, company: j.company, location: j.location || 'Remote',
        description: (j.description||'').replace(/<[^>]+>/g,' ').slice(0,600),
        salary: j.salary||'', posted: j.date||'', url: j.url||j.apply_url||'',
        source: 'RemoteOK', tags: j.tags||[], scam: false,
      }))
  } catch { return [] }
}

async function fetchAdzuna(query, location, country) {
  try {
    const k = JSON.parse(localStorage.getItem('careeros_api_keys')||'{}')
    if (!k.adzunaId || !k.adzunaKey) return []
    const p = new URLSearchParams({ app_id: k.adzunaId, app_key: k.adzunaKey, what: query||'manager', where: location||'dubai', results_per_page: 25, sort_by: 'date', max_days_old: 3 })
    const r = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${p}`)
    if (!r.ok) return []
    const d = await r.json()
    return (d.results||[]).map(j => ({
      id: `adz_${j.id}`,
      title: j.title, company: j.company?.display_name||'', location: j.location?.display_name||'',
      description: (j.description||'').slice(0,600),
      salary: j.salary_min ? `${Math.round(j.salary_min).toLocaleString()}–${Math.round(j.salary_max||j.salary_min).toLocaleString()}` : '',
      posted: j.created||'', url: j.redirect_url||'',
      source: `Adzuna (${country.toUpperCase()})`, tags: j.category?[j.category.label]:[], scam: false,
    }))
  } catch { return [] }
}

async function fetchHN() {
  try {
    const r = await fetch('https://hacker-news.firebaseio.com/v0/user/whoishiring/submitted.json')
    if (!r.ok) return []
    const ids = await r.json()
    for (const id of ids.slice(0,3)) {
      const pr = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      const p  = await pr.json()
      if (!p?.title?.toLowerCase().includes('hiring')) continue
      const kids = (p.kids||[]).slice(0,20)
      const jobs = await Promise.all(kids.map(async kid => {
        try {
          const cr = await fetch(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`)
          const c  = await cr.json()
          if (!c||c.deleted||c.dead) return null
          const txt = (c.text||'').replace(/<[^>]+>/g,' ')
          return { id:`hn_${kid}`, title:'Tech Role (HN)', company: txt.split('|')[0].trim().slice(0,50), location:'Remote', description: txt.slice(0,500), salary:'', posted:'', url:`https://news.ycombinator.com/item?id=${kid}`, source:"HN Who's Hiring", tags:['tech','remote'], scam:false }
        } catch { return null }
      }))
      return jobs.filter(Boolean)
    }
    return []
  } catch { return []  }
}

function matchScore(job, keywords) {
  if (!keywords?.length) return 0
  const txt = `${job.title} ${job.description} ${(job.tags||[]).join(' ')}`.toLowerCase()
  return keywords.filter(k => k && txt.includes(k.toLowerCase())).length
}

function dedupe(jobs) {
  const seen = new Set()
  return jobs.filter(j => {
    const key = `${j.title?.toLowerCase().slice(0,30)}|${j.company?.toLowerCase().slice(0,20)}`
    if (seen.has(key)) return false
    seen.add(key); return true
  })
}

/* ── Chip ── */
function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 99, fontSize: 12, fontFamily: 'inherit',
      border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
      background: selected ? 'var(--gold-glow)' : 'transparent',
      color: selected ? 'var(--gold-light)' : 'var(--text-muted)',
      cursor: 'pointer', fontWeight: selected ? 700 : 400,
      transition: 'all 0.15s', marginBottom: 5, marginRight: 5,
    }}>{label}</button>
  )
}

/* ── Job Card ── */
function JobCard({ job, onSave, saved }) {
  const [expanded, setExpanded] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const scoreColor = job.score >= 3 ? 'var(--success)' : job.score >= 1 ? 'var(--gold)' : 'var(--border)'

  async function save() {
    setSaving(true)
    await onSave(job)
    setSaving(false)
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden', marginBottom: 10,
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-gold)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {/* match bar top */}
      <div style={{ height: 3, background: scoreColor }} />

      <div style={{ padding: '16px 18px' }}>
        {/* row 1 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h4 style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.3 }}>
              {job.title}
            </h4>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {job.company}{job.location ? ` · 📍 ${job.location}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
            <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 99, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>{job.source}</span>
            {job.score > 0 && <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 99, background: 'var(--gold-glow)', border: '1px solid var(--border-gold)', color: 'var(--gold)', fontWeight: 700 }}>✓ {job.score} match{job.score !== 1 ? 'es' : ''}</span>}
          </div>
        </div>

        {/* row 2 — meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10, fontSize: 12 }}>
          {job.salary && <span style={{ color: 'var(--success)' }}>💰 {job.salary}</span>}
          {job.posted && <span style={{ color: 'var(--text-dim)' }}>🕐 {String(job.posted).slice(0,10)}</span>}
          {job.scam   && <span style={{ color: 'var(--danger)' }}>⚠️ Scam signals</span>}
        </div>

        {/* description */}
        {job.description && (
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{job.description}</p>
        )}
        {job.description?.length > 220 && (
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 12, cursor: 'pointer', marginBottom: 10, padding: 0, fontFamily: 'inherit' }}>
            {expanded ? '▲ Less' : '▼ More'}
          </button>
        )}

        {/* tags */}
        {job.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {job.tags.slice(0,5).map((t,i) => (
              <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>{t}</span>
            ))}
          </div>
        )}

        {/* actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={save} disabled={saved || saving} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: saved ? 'default' : 'pointer',
            background: saved ? 'var(--success-dim)' : 'linear-gradient(135deg,var(--gold),var(--gold-dim))',
            color: saved ? 'var(--success)' : '#0A1628',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            border: saved ? '1px solid var(--success)' : 'none',
          }}>
            {saving ? '…' : saved ? '✓ Saved' : 'Save Job'}
          </button>
          <button onClick={() => window.open(job.url,'_blank')} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>View & Apply →</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ── */
export default function JobFeed() {
  const { user } = useAuth()
  const { data: apps, save: saveApp } = useDB('applications')

  /* search state */
  const [keywords,  setKeywords]  = useState(user?.field || '')
  const [location,  setLocation]  = useState('')
  const [selRoles,  setSelRoles]  = useState([])
  const [selLocs,   setSelLocs]   = useState([])
  const [selInds,   setSelInds]   = useState([])
  const [selTypes,  setSelTypes]  = useState([])
  const [experience,setExperience]= useState('')
  const [minSalary, setMinSalary] = useState('')
  const [sortBy,    setSortBy]    = useState('match')
  const [remoteOnly,setRemoteOnly]= useState(false)
  const [showFilters,setShowFilters] = useState(false)

  /* results */
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(false)
  const [searched,setSearched]= useState(false)
  const [hidden,  setHidden]  = useState([])
  const [status,  setStatus]  = useState('')

  const savedIds = new Set(apps.map(a => a.jobId))
  const cvKws    = JSON.parse(localStorage.getItem('careeros_cv_keywords') || '[]')

  async function search(force = false) {
    setLoading(true); setSearched(true); setStatus('Fetching jobs…')

    const q    = [...selRoles, keywords].filter(Boolean).join(' ') || 'manager'
    const loc  = selLocs[0] || location || 'dubai'
    const kws  = cvKws.length ? cvKws : keywords.split(' ').filter(Boolean)

    const [rok, adzAE, adzGB, hn] = await Promise.allSettled([
      fetchRemoteOK(q),
      fetchAdzuna(q, loc, 'ae'),
      fetchAdzuna(q, loc, 'gb'),
      fetchHN(),
    ])

    const raw = [
      ...(rok.value   || []),
      ...(adzAE.value || []),
      ...(adzGB.value || []),
      ...(hn.value    || []),
    ]

    const deduped = dedupe(raw)
      .filter(j => !scamCheck(j))
      .map(j => ({ ...j, score: matchScore(j, kws), scam: scamCheck(j) }))

    // Apply filters
    let filtered = deduped
    if (selTypes.includes('Remote'))     filtered = filtered.filter(j => j.location?.toLowerCase().includes('remote') || j.source === 'RemoteOK')
    if (remoteOnly)                      filtered = filtered.filter(j => j.location?.toLowerCase().includes('remote'))
    if (selInds.length)                  filtered = filtered.filter(j => selInds.some(i => `${j.title} ${j.description}`.toLowerCase().includes(i.toLowerCase())))
    if (minSalary)                       filtered = filtered.filter(j => !j.salary || parseInt(j.salary.replace(/[^0-9]/g,'')) >= parseInt(minSalary))

    // Sort
    filtered = filtered.sort((a,b) =>
      sortBy === 'match'  ? b.score - a.score :
      sortBy === 'salary' ? (parseInt(b.salary||0) - parseInt(a.salary||0)) :
      new Date(b.posted||0) - new Date(a.posted||0)
    )

    setJobs(filtered)
    setLoading(false)
    setStatus(`${filtered.length} jobs found across ${new Set(raw.map(j=>j.source)).size} sources · ${deduped.length - filtered.length} duplicates removed`)
  }

  async function handleSave(job) {
    await saveApp({
      jobId: job.id, title: job.title, company: job.company,
      location: job.location, url: job.url, salary: job.salary,
      source: job.source, stage: 'saved',
      savedAt: new Date().toISOString(), notes: '',
    })
  }

  function toggle(arr, setArr, val) {
    setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val])
  }

  const visible = jobs.filter(j => !hidden.includes(j.id))

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>🔍 Job Feed</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Unified search · RemoteOK · Adzuna UAE & UK · HN Hiring · Deduplicated · Scam-filtered
        </p>
      </div>

      {/* Search bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Keywords / Role</label>
            <input
              value={keywords} onChange={e => setKeywords(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search(true)}
              placeholder="e.g. Marketing Director, Finance Manager, Engineer…"
              style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = 'var(--gold)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Location</label>
            <input
              value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Dubai, UAE, Remote…"
              style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = 'var(--gold)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>
          <button onClick={() => search(true)} disabled={loading} style={{
            padding: '10px 24px', borderRadius: 9, border: 'none',
            background: loading ? 'var(--border)' : 'linear-gradient(135deg,var(--gold),var(--gold-dim))',
            color: '#0A1628', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            {loading ? '⏳ Searching…' : '🔍 Search'}
          </button>
          <button onClick={() => setShowFilters(f => !f)} style={{
            padding: '10px 16px', borderRadius: 9, border: '1px solid var(--border)',
            background: showFilters ? 'var(--gold-glow)' : 'transparent',
            color: showFilters ? 'var(--gold)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ⚙️ Filters {(selRoles.length + selLocs.length + selInds.length + selTypes.length) > 0 ? `(${selRoles.length + selLocs.length + selInds.length + selTypes.length})` : ''}
          </button>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Role Type</div>
                <div>{ROLES.slice(0,10).map(r => <Chip key={r} label={r} selected={selRoles.includes(r)} onClick={() => toggle(selRoles, setSelRoles, r)} />)}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Target Location</div>
                <div>{LOCATIONS.map(l => <Chip key={l} label={l} selected={selLocs.includes(l)} onClick={() => toggle(selLocs, setSelLocs, l)} />)}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Industry</div>
                <div>{INDUSTRIES.map(i => <Chip key={i} label={i} selected={selInds.includes(i)} onClick={() => toggle(selInds, setSelInds, i)} />)}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Job Type</div>
                <div>{JOB_TYPES.map(t => <Chip key={t} label={t} selected={selTypes.includes(t)} onClick={() => toggle(selTypes, setSelTypes, t)} />)}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Experience Level</div>
                <select value={experience} onChange={e => setExperience(e.target.value)} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }}>
                  {EXP_LEVELS.map(e => <option key={e.v} value={e.v}>{e.l}</option>)}
                </select>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Min Salary (AED/month)</div>
                <input type="number" value={minSalary} onChange={e => setMinSalary(e.target.value)} placeholder="e.g. 20000" style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                <div onClick={() => setRemoteOnly(r => !r)} style={{ width: 38, height: 20, borderRadius: 99, background: remoteOnly ? 'var(--gold)' : 'var(--bg-elevated)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: remoteOnly ? 19 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
                Remote only
              </label>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {SORT_OPTS.map(o => <Chip key={o.v} label={o.l} selected={sortBy === o.v} onClick={() => setSortBy(o.v)} />)}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => { setSelRoles([]); setSelLocs([]); setSelInds([]); setSelTypes([]); setExperience(''); setMinSalary(''); setRemoteOnly(false) }} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adzuna key notice */}
      {!JSON.parse(localStorage.getItem('careeros_api_keys')||'{}').adzunaId && (
        <div style={{ background: 'rgba(232,168,74,0.1)', border: '1px solid rgba(232,168,74,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 14, fontSize: 12, color: 'var(--warning)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚙️ Add your free Adzuna API key in Settings to unlock UAE & UK job listings.</span>
          <a href="/careeros-gcc/settings" style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 12 }}>Go to Settings →</a>
        </div>
      )}

      {/* Status */}
      {status && !loading && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, padding: '6px 0' }}>{status}</div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 130, borderRadius: 14 }} className="skeleton" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && visible.length > 0 && (
        <div className="stagger-children">
          {visible.map(job => (
            <JobCard key={job.id} job={job} onSave={handleSave} saved={savedIds.has(job.id)} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h4 style={{ fontSize: 18, marginBottom: 8 }}>No jobs found</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Try broader keywords, fewer filters, or add your Adzuna API key for more results.</p>
          <button onClick={() => search(true)} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', color: '#0A1628', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Try Again
          </button>
        </div>
      )}

      {/* First load prompt */}
      {!loading && !searched && (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
          <h4 style={{ fontSize: 18, marginBottom: 8 }}>Ready to search</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.7 }}>
            Enter a role or keywords above and click Search.<br/>
            {cvKws.length > 0 && <span style={{ color: 'var(--success)' }}>✓ {cvKws.length} CV keywords loaded for matching.</span>}
          </p>
          <button onClick={() => search(true)} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', color: '#0A1628', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Load Latest Jobs
          </button>
        </div>
      )}
    </div>
  )
}
