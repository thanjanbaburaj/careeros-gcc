import React, { useState, useEffect } from 'react'
import { useDB } from '../../hooks/useDB.js'
import { useAuth } from '../../hooks/useAuth.js'
import { Card, Button, Input, ProgressBar, EmptyState } from '../../components/ui/index.jsx'

const MOODS = [
  { value: 5, emoji: '🌟', label: 'Excellent',   color: 'var(--success)' },
  { value: 4, emoji: '😊', label: 'Good',        color: 'var(--teal)' },
  { value: 3, emoji: '😐', label: 'Neutral',     color: 'var(--gold)' },
  { value: 2, emoji: '😔', label: 'Struggling',  color: 'var(--warning)' },
  { value: 1, emoji: '😢', label: 'Very Tough',  color: 'var(--danger)' },
]

const WEEKLY_GOALS = [
  'Apply to 3 new roles',
  'Follow up on 2 applications',
  'Research 2 target companies',
  'Practice 5 interview questions',
  'Reach out to 1 new contact',
]

const NORMALISING_FACTS = [
  'The average GCC professional sends 40–80 applications before receiving an offer.',
  'Most job searches at senior level take 3–6 months. You are not alone.',
  'Receiving rejections means you are actively searching — that takes courage.',
  'The right role exists. The process of finding it takes time.',
  'Every "no" is one step closer to the right "yes".',
  'Many of the most successful professionals in the GCC faced long job searches.',
  'Taking breaks from job searching makes you more effective, not less.',
]

const CRISIS_RESOURCES = [
  { name: 'Dubai Health Authority Mental Health', contact: '800 4006', type: 'Hotline' },
  { name: 'Community Development Authority', contact: '800 88', type: 'UAE Support' },
  { name: 'LifeLine UAE', contact: '800 5433', type: 'Crisis Line' },
]

export default function Wellbeing() {
  const { user }  = useAuth()
  const { data: moods, save: saveMood } = useDB('mood_log')
  const [mood,    setMood]    = useState(null)
  const [note,    setNote]    = useState('')
  const [saved,   setSaved]   = useState(false)
  const [goals,   setGoals]   = useState({})
  const [streak,  setStreak]  = useState(0)

  const todayKey = new Date().toDateString()
  const todayMood = moods.find(m => new Date(m.date).toDateString() === todayKey)

  useEffect(() => {
    // Calculate streak — consecutive days with mood check-in
    const sorted = [...moods].sort((a, b) => new Date(b.date) - new Date(a.date))
    let s = 0
    let d = new Date()
    for (const m of sorted) {
      const md = new Date(m.date)
      if (md.toDateString() === d.toDateString()) {
        s++
        d.setDate(d.getDate() - 1)
      } else break
    }
    setStreak(s)
  }, [moods])

  async function handleMoodSave() {
    if (!mood) return
    await saveMood({
      mood,
      note,
      date: new Date().toISOString(),
    })
    setSaved(true)
    setNote('')
    setTimeout(() => setSaved(false), 3000)
  }

  const avgMood = moods.length
    ? (moods.slice(-7).reduce((s, m) => s + m.mood, 0) / Math.min(moods.length, 7)).toFixed(1)
    : null

  const randomFact = NORMALISING_FACTS[Math.floor(Date.now() / 86400000) % NORMALISING_FACTS.length]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>Wellbeing Centre</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Job searching is tough. We're here to help you stay motivated and resilient.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Streak card */}
        <Card style={{ textAlign: 'center', background: streak > 0 ? 'var(--gold-glow)' : undefined, borderColor: streak > 0 ? 'var(--border-gold)' : undefined }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🔥</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{streak}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Day Check-in Streak</div>
        </Card>

        {/* Average mood */}
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>📊</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-display)' }}>
            {avgMood || '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>7-Day Mood Average</div>
        </Card>
      </div>

      {/* Daily mood check-in */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>How are you feeling today?</h3>
        {todayMood ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <span style={{ fontSize: 28 }}>{MOODS.find(m => m.value === todayMood.mood)?.emoji}</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {MOODS.find(m => m.value === todayMood.mood)?.label} — check-in done ✓
              </div>
              {todayMood.note && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{todayMood.note}</div>}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${mood === m.value ? m.color : 'var(--border)'}`,
                    background: mood === m.value ? `${m.color}18` : 'var(--bg-elevated)',
                    cursor: 'pointer', transition: 'all var(--transition)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{m.emoji}</span>
                  <span style={{ fontSize: 11, color: mood === m.value ? m.color : 'var(--text-muted)', fontWeight: 600 }}>{m.label}</span>
                </button>
              ))}
            </div>

            {mood && mood <= 2 && (
              <div style={{ background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--warning)', lineHeight: 1.7, margin: 0 }}>
                  💛 It sounds like today is tough. That's completely normal and valid. {randomFact}
                </p>
              </div>
            )}

            <Input
              value={note}
              onChange={setNote}
              placeholder="Optional: what's on your mind today?"
              multiline
              rows={2}
            />
            <Button
              style={{ marginTop: 12 }}
              onClick={handleMoodSave}
              disabled={!mood}
            >
              {saved ? '✓ Saved' : 'Save Check-in'}
            </Button>
          </div>
        )}
      </Card>

      {/* Weekly goals */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>This Week's Goals</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Small consistent actions build momentum. Tick what you've done.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {WEEKLY_GOALS.map((goal, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div
                onClick={() => setGoals(g => ({ ...g, [i]: !g[i] }))}
                style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${goals[i] ? 'var(--success)' : 'var(--border)'}`,
                  background: goals[i] ? 'var(--success)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all var(--transition)',
                }}
              >
                {goals[i] && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
              </div>
              <span style={{
                fontSize: 14,
                color: goals[i] ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: goals[i] ? 'line-through' : 'none',
              }}>{goal}</span>
            </label>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Weekly progress</span>
            <span>{Object.values(goals).filter(Boolean).length} / {WEEKLY_GOALS.length}</span>
          </div>
          <ProgressBar value={Object.values(goals).filter(Boolean).length} max={WEEKLY_GOALS.length} />
        </div>
      </Card>

      {/* Normalising reminder */}
      <Card style={{ marginBottom: 20, background: 'var(--teal-dim)', borderColor: 'rgba(61,188,184,0.3)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 24 }}>💙</span>
          <div>
            <h4 style={{ fontSize: 14, color: 'var(--teal)', marginBottom: 6 }}>Remember</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{randomFact}</p>
          </div>
        </div>
      </Card>

      {/* Mood history */}
      {moods.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Check-ins</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...moods].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7).map((m, i) => {
              const moodDef = MOODS.find(md => md.value === m.mood)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{moodDef?.emoji}</span>
                  <span style={{ fontSize: 12, color: moodDef?.color, fontWeight: 600, width: 80 }}>{moodDef?.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{new Date(m.date).toLocaleDateString('en-AE')}</span>
                  {m.note && <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>{m.note}</span>}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Crisis resources */}
      <Card style={{ background: 'rgba(192,90,90,0.08)', borderColor: 'rgba(192,90,90,0.2)' }}>
        <h4 style={{ fontSize: 14, color: 'var(--danger)', marginBottom: 12 }}>Need Immediate Support?</h4>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>
          If you are in crisis or need to speak with someone right now, please reach out:
        </p>
        {CRISIS_RESOURCES.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < CRISIS_RESOURCES.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.type}</div>
            </div>
            <a href={`tel:${r.contact}`} style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{r.contact}</a>
          </div>
        ))}
      </Card>
    </div>
  )
}
