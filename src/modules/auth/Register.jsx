import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authStore from '../../store/authStore.js'
import { Button, Input, Select, Chip } from '../../components/ui/index.jsx'

const FIELDS = [
  'Finance & Banking','Technology & IT','Real Estate','Marketing & Comms',
  'Human Resources','Sales & Business Dev','Operations','Legal',
  'Engineering & Construction','Healthcare','Hospitality & Tourism',
  'Oil & Gas / Energy','Consulting','Education','Media & Creative',
  'Logistics & Aviation','Government & Public Sector','Other',
]

const LOCATIONS = [
  'Dubai, UAE','Abu Dhabi, UAE','Sharjah, UAE',
  'Riyadh, KSA','Jeddah, KSA','Doha, Qatar',
  'Kuwait City','Manama, Bahrain','Muscat, Oman',
  'Outside GCC (relocating)',
]

const EXP_LEVELS = [
  { value: '0-2',   label: '0–2 years (Entry)' },
  { value: '2-5',   label: '2–5 years (Junior–Mid)' },
  { value: '5-10',  label: '5–10 years (Mid–Senior)' },
  { value: '10-20', label: '10–20 years (Senior)' },
  { value: '20+',   label: '20+ years (Executive)' },
]

export default function Register() {
  const navigate = useNavigate()
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    field: '', experience: '2-5',
    location: '', targetLocations: [],
    minSalary: '', careerMode: 'exploring',
  })

  function update(key, val) { setForm(f => ({ ...f, [key]: val })) }
  function toggleLoc(loc) {
    update('targetLocations',
      form.targetLocations.includes(loc)
        ? form.targetLocations.filter(l => l !== loc)
        : [...form.targetLocations, loc]
    )
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      await authStore.register(form)
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const canStep1 = form.name && form.email && form.password.length >= 6
  const canStep2 = form.field && form.experience && form.location
  const canStep3 = form.targetLocations.length > 0

  const screenStyle = {
    minHeight: '100vh', background: 'var(--bg-deep)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  }
  const boxStyle = {
    width: '100%', maxWidth: 480,
    background: 'var(--bg-card)', border: '1px solid var(--border-gold)',
    borderRadius: 'var(--radius-xl)', padding: 40,
    animation: 'fadeIn 0.3s ease',
  }

  return (
    <div style={screenStyle}>
      <div style={boxStyle}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            Career<span style={{ color: 'var(--gold)' }}>OS</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Step {step} of 3 — {['Identity', 'Your Situation', 'Your Goals'][step - 1]}
          </p>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                height: 4, flex: 1, borderRadius: 99, maxWidth: 60,
                background: s <= step ? 'var(--gold)' : 'var(--bg-elevated)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: 'var(--danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Full Name" value={form.name} onChange={v => update('name', v)} placeholder="As it appears professionally" required />
            <Input label="Email" type="email" value={form.email} onChange={v => update('email', v)} placeholder="your@email.com" required />
            <Input label="Password" type="password" value={form.password} onChange={v => update('password', v)} placeholder="Minimum 6 characters" required />
            <Button fullWidth onClick={() => setStep(2)} disabled={!canStep1}>
              Continue →
            </Button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--gold)' }}>Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Primary Field <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {FIELDS.map(f => (
                  <Chip key={f} label={f} selected={form.field === f} onClick={() => update('field', f)} />
                ))}
              </div>
            </div>
            <Select
              label="Years of Experience"
              value={form.experience}
              onChange={v => update('experience', v)}
              options={EXP_LEVELS}
              required
            />
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Current City <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {LOCATIONS.map(l => (
                  <Chip key={l} label={l} selected={form.location === l} onClick={() => update('location', l)} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" fullWidth onClick={() => setStep(1)}>← Back</Button>
              <Button fullWidth onClick={() => setStep(3)} disabled={!canStep2}>Continue →</Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Target Locations <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {[...LOCATIONS, 'Remote / Anywhere', 'GCC (Any)'].map(l => (
                  <Chip key={l} label={l} selected={form.targetLocations.includes(l)} onClick={() => toggleLoc(l)} />
                ))}
              </div>
            </div>
            <Input
              label="Minimum Salary Target (AED/month) — optional"
              type="number"
              value={form.minSalary}
              onChange={v => update('minSalary', v)}
              placeholder="e.g. 15000"
            />
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Career Mode
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {[
                  { v: 'exploring',   l: '🌊 Exploring'   },
                  { v: 'stretching',  l: '📈 Stretching'  },
                  { v: 'stepping-back', l: '🔄 Open to Any' },
                  { v: 'pivoting',    l: '🔀 Pivoting'    },
                  { v: 'returning',   l: '🔙 Returning'   },
                ].map(({ v, l }) => (
                  <Chip key={v} label={l} selected={form.careerMode === v} onClick={() => update('careerMode', v)} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" fullWidth onClick={() => setStep(2)}>← Back</Button>
              <Button fullWidth onClick={handleSubmit} loading={loading} disabled={!canStep3}>
                Launch My CareerOS 🚀
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
