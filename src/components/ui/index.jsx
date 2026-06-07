import React, { useState } from 'react'

/* ── Button ─────────────────────────────────────────── */
export function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled, loading, fullWidth, type = 'button', style: s
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.3px',
    transition: 'all var(--transition)', whiteSpace: 'nowrap',
    opacity: disabled || loading ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
  }
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12, borderRadius: 'var(--radius-sm)' },
    md: { padding: '10px 20px', fontSize: 14, borderRadius: 'var(--radius-md)' },
    lg: { padding: '13px 28px', fontSize: 15, borderRadius: 'var(--radius-md)' },
  }
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
      color: '#0A1628',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--danger-dim)',
      color: 'var(--danger)',
      border: '1px solid var(--danger)',
    },
    success: {
      background: 'var(--success-dim)',
      color: 'var(--success)',
      border: '1px solid var(--success)',
    },
    teal: {
      background: 'var(--teal-dim)',
      color: 'var(--teal)',
      border: '1px solid var(--teal)',
    },
  }
  return (
    <button
      type={type}
      onClick={!disabled && !loading ? onClick : undefined}
      style={{ ...base, ...sizes[size], ...variants[variant], ...s }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', display: 'inline-block',
        }} />
      )}
      {children}
    </button>
  )
}

/* ── Card ───────────────────────────────────────────── */
export function Card({ children, style: s, onClick, hover = true }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered && onClick ? 'var(--bg-elevated)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        transition: 'all var(--transition)',
        cursor: onClick ? 'pointer' : 'default',
        ...(hovered && onClick ? { borderColor: 'var(--border-gold)', transform: 'translateY(-2px)' } : {}),
        ...s,
      }}
    >
      {children}
    </div>
  )
}

/* ── Input ──────────────────────────────────────────── */
export function Input({ label, value, onChange, placeholder, type = 'text', error, required, multiline, rows = 4, style: s }) {
  const baseStyle = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition)',
    boxSizing: 'border-box',
    ...s,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {label}{required && <span style={{ color: 'var(--gold)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...baseStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={baseStyle}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
        />
      )}
      {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

/* ── Select ─────────────────────────────────────────── */
export function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {label}{required && <span style={{ color: 'var(--gold)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'var(--bg-elevated)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-body)',
          color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

/* ── Badge ──────────────────────────────────────────── */
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    gold:    { background: 'var(--gold-glow)',   color: 'var(--gold)',           border: '1px solid var(--border-gold)' },
    success: { background: 'var(--success-dim)', color: 'var(--success)',        border: '1px solid rgba(76,175,130,0.3)' },
    danger:  { background: 'var(--danger-dim)',  color: 'var(--danger)',         border: '1px solid rgba(192,90,90,0.3)' },
    teal:    { background: 'var(--teal-dim)',     color: 'var(--teal)',           border: '1px solid rgba(61,188,184,0.3)' },
    warning: { background: 'var(--warning-dim)', color: 'var(--warning)',        border: '1px solid rgba(232,168,74,0.3)' },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 10px' : '4px 14px',
      borderRadius: 'var(--radius-full)',
      fontSize: size === 'sm' ? 11 : 13,
      fontWeight: 600, fontFamily: 'var(--font-body)',
      ...variants[variant],
    }}>
      {children}
    </span>
  )
}

/* ── Modal ──────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'fadeInFast 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-xl)', padding: 32,
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeIn 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Tabs ───────────────────────────────────────────── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 4,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 13, fontWeight: 600,
            transition: 'all var(--transition)',
            background: active === t.id ? 'var(--bg-elevated)' : 'transparent',
            color: active === t.id ? 'var(--gold)' : 'var(--text-muted)',
            borderBottom: active === t.id ? '2px solid var(--gold)' : '2px solid transparent',
          }}
        >
          {t.icon && <span style={{ marginRight: 6 }}>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ── Progress Bar ───────────────────────────────────── */
export function ProgressBar({ value, max = 100, color = 'var(--gold)', height = 6 }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 99, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: color, borderRadius: 99,
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

/* ── Empty State ────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon || '🔍'}</div>
      <h4 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h4>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: action ? 24 : 0 }}>{description}</p>
      {action}
    </div>
  )
}

/* ── Chip / Toggle ──────────────────────────────────── */
export function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 'var(--radius-full)',
        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        background: selected ? 'var(--gold-glow)' : 'transparent',
        color: selected ? 'var(--gold-light)' : 'var(--text-muted)',
        fontSize: 12, fontFamily: 'var(--font-body)',
        fontWeight: selected ? 700 : 400,
        cursor: 'pointer', transition: 'all var(--transition)',
        marginBottom: 6, marginRight: 6,
      }}
    >
      {label}
    </button>
  )
}
