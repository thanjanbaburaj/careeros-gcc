import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useDB } from '../../hooks/useDB.js'
import { fetchJobs } from '../../services/api/jobsAPI.js'
import { Card, Button, Input, Badge, EmptyState, Chip } from '../../components/ui/index.jsx'

const SOURCES = ['All Sources', 'RemoteOK', 'Adzuna (AE)', 'Adzuna (GB)', "HN Who's Hiring"]
const SORT_OPTIONS = [
  { value: 'match',  label: 'Best Match' },
  { value: 'recent', label: 'Most Recent' },
]

function JobCard({ job, onSave, onHide, saved }) {
  const [expanded, setExpanded] = useState(false)
  const [saving,   setSaving]   = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(job)
    setSaving(false)
  }

  const scamRisk = job.scamScore >= 1

  return (
    <Card style={{ padding: 0, overflow: 'hidden', opacity: scamRisk ? 0.6 : 1 }}>
      {/* Top colour bar — match quality */}
      <div style={{
        height: 3,
        background: job.matchScore >= 3
          ? 'var(--success)'
          : job.matchScore >= 1
            ? 'var(--gold)'
            : 'var(--border)',
      }} />

      <div style={{ padding: '18px 20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h4 style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
              {job.title}
            </h4>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {job.company}
              {job.location && <span> · 📍 {job.location}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <Badge variant="default">{job.source}</Badge>
            {job.matchScore > 0 && (
              <Badge variant="gold">✓ {job.matchScore} keyword{job.matchScore !== 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          {job.salary && <span>💰 {job.salary}</span>}
          {job.posted && <span>🕐 {job.posted?.slice(0, 10) || 'Recently'}</span>}
          {scamRisk && <span style={{ color: 'var(--danger)' }}>⚠️ Possible scam signals</span>}
        </div>

        {/* Description preview */}
        {job.description && (
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14,
            display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {job.description}
          </p>
        )}

        {job.description && job.description.length > 200 && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 12, cursor: 'pointer', marginBottom: 12, padding: 0 }}
          >
            {expanded ? 'Show less ▲' : 'Read more ▼'}
          </button>
        )}

        {/* Tags */}
        {job.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {job.tags.slice(0, 5).map((t, i) => (
              <span key={i} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)', padding: '2px 10px',
                fontSize: 11, color: 'var(--text-muted)',
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={saved}
            variant={saved ? 'success' : 'primary'}
          >
            {saved ? '✓ Saved' : 'Save Job'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(job.url, '_blank')}
          >
            View & Apply →
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onHide(job.id)}
            style={{ marginLeft: 'auto' }}
          >
            Hide
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function JobFeed() {
  const { user }            = useAuth()
  const { data: apps, save: saveApp } = useDB('applications')

  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(false)
  const [hidden,  setHidden]  = useState([])
  const [query,   setQuery]   = useState(user?.field || '')
  const [location, setLocation] = useState('')
  const [source,  setSource]  = useState('All Sources')
  const [sort,    setSort]    = useState('match')
  const [searched, setSearched] = useState(false)

  const savedIds = new Set(apps.map(a => a.jobId))

  const loadJobs = useCallback(async (force = false) => {
    setLoading(true)
    try {
      const keywords = user?.cvKeywords || query.split(' ').filter(Boolean)
      const results  = await fetchJobs({
        query,
        location,
        keywords,
        forceRefresh: force,
      })
      setJobs(results)
      setSearched(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query, location, user])

  useEffect(() => { loadJobs() }, [])

  async function handleSave(job) {
    await saveApp({
      jobId:     job.id,
      title:     job.title,
      company:   job.company,
      location:  job.location,
      url:       job.url,
      salary:    job.salary,
      source:    job.source,
      stage:     'saved',
      savedAt:   new Date().toISOString(),
      notes:     '',
    })
  }

  function handleHide(id) { setHidden(h => [...h, id]) }

  const filtered = jobs
    .filter(j => !hidden.includes(j.id))
    .filter(j => source === 'All Sources' || j.source === source)
    .sort((a, b) =>
      sort === 'match'
        ? b.matchScore - a.matchScore
        : new Date(b.posted || 0) - new Date(a.posted || 0)
    )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>Job Feed</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Unified results from RemoteOK · Adzuna UAE · Adzuna UK · HN Who's Hiring — deduplicated
        </p>
      </div>

      {/* Search bar */}
      <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <Input
              label="Role / Keywords"
              value={query}
              onChange={setQuery}
              placeholder="e.g. Marketing Manager, Director, Engineer"
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Input
              label="Location"
              value={location}
              onChange={setLocation}
              placeholder="Dubai, Remote, UAE…"
            />
          </div>
          <Button onClick={() => loadJobs(true)} loading={loading}>
            🔍 Search
          </Button>
          <Button variant="ghost" onClick={() => loadJobs(true)} disabled={loading}>
            ↻ Refresh
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>SOURCE:</span>
        {SOURCES.map(s => (
          <Chip key={s} label={s} selected={source === s} onClick={() => setSource(s)} />
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {SORT_OPTIONS.map(o => (
            <Chip key={o.value} label={o.label} selected={sort === o.value} onClick={() => setSort(o.value)} />
          ))}
        </div>
      </div>

      {/* Results count */}
      {searched && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {loading ? 'Searching…' : `${filtered.length} jobs found · ${hidden.length} hidden`}
        </div>
      )}

      {/* No API key notice */}
      <Card style={{ marginBottom: 20, background: 'var(--warning-dim)', borderColor: 'var(--warning)', padding: '14px 18px' }}>
        <p style={{ fontSize: 13, color: 'var(--warning)', margin: 0, lineHeight: 1.6 }}>
          ⚙️ <strong>To unlock Adzuna UAE/UK results</strong> — add your free Adzuna API key in Settings.
          RemoteOK and HN results work without any key.
          <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            Get a free key at developer.adzuna.com — takes 2 minutes.
          </span>
        </p>
      </Card>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 140, borderRadius: 'var(--radius-lg)' }} className="skeleton" />
          ))}
        </div>
      )}

      {/* Job list */}
      {!loading && filtered.length > 0 && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSave}
              onHide={handleHide}
              saved={savedIds.has(job.id)}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && searched && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No jobs found"
          description="Try different keywords, a broader location, or click Refresh to fetch the latest listings."
          action={<Button onClick={() => loadJobs(true)}>Try Again</Button>}
        />
      )}

      {/* First load prompt */}
      {!loading && !searched && (
        <EmptyState
          icon="✨"
          title="Ready to search"
          description="Enter a role or keyword above and click Search, or click Refresh to load the latest listings."
          action={<Button onClick={() => loadJobs(true)} loading={loading}>Load Jobs Now</Button>}
        />
      )}
    </div>
  )
}
