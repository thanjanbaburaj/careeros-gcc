import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/index.jsx'

const FEATURES = [
  { icon: '🔍', title: 'Unified Job Feed',       desc: 'All sources. UAE, GCC & Remote. Deduplicated.' },
  { icon: '📋', title: 'Smart Tracker',           desc: 'Kanban board. Every application. Every stage.' },
  { icon: '📄', title: 'CV by Discovery',         desc: 'Answer questions. AI builds your CV.' },
  { icon: '🎯', title: 'Interview Prep',          desc: 'GCC-tuned question bank. AI mock interviews.' },
  { icon: '✨', title: 'AI Career Assistant',     desc: 'Any career question. Instant GCC-specific answer.' },
  { icon: '💚', title: 'Wellbeing Support',       desc: 'Job search is tough. We\'ve got you.' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#0A1628',
          }}>C</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Career<span style={{ color: 'var(--gold)' }}>OS</span> GCC
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
          <Button size="sm" onClick={() => navigate('/register')}>Get Started Free</Button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--gold-glow)', border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-full)', padding: '6px 18px', marginBottom: 28,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: 1.5 }}>FREE FOREVER · UAE & GCC</span>
        </div>

        <h1 style={{ marginBottom: 20, lineHeight: 1.15 }}>
          Your entire job search.<br />
          <span style={{ color: 'var(--gold)' }}>One place. Free.</span>
        </h1>

        <p style={{ fontSize: 18, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          The career management platform built for UAE and GCC professionals.
          Entry level to C-suite. All in one window.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => navigate('/register')}>
            Start Free — 90 Seconds
          </Button>
          <Button size="lg" variant="ghost" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          No credit card. No trial period. Free forever.
        </p>
      </div>

      {/* Features grid */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="animate-fadeIn"
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '24px',
                animationDelay: `${i * 0.08}s`, opacity: 0,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h4 style={{ fontSize: 15, marginBottom: 6, color: 'var(--text-primary)' }}>{f.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}>
        CareerOS GCC · Built for UAE & GCC Professionals · $0 Forever
      </div>
    </div>
  )
}
