import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Input } from '../../components/ui/index.jsx'

/* ── helpers ── */
function gk(key, def = '') {
  try { return localStorage.getItem(key) || def } catch { return def }
}
function sk(key, val) {
  try { localStorage.setItem(key, val) } catch {}
}
function gjson(key, def = {}) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return def }
}

/* ── AI call (tries Gemini then Groq) ── */
async function callAI(prompt) {
  const gKey = gk('careeros_gemini_key')
  const rKey = gk('careeros_groq_key')

  if (gKey) {
    const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-flash']
    for (const m of MODELS) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${gKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
        )
        const d = await r.json()
        if (d.error) continue
        const t = d.candidates?.[0]?.content?.parts?.[0]?.text
        if (t) return t
      } catch { /* try next */ }
    }
  }

  if (rKey) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${rKey}` },
        body: JSON.stringify({ model: 'llama-3.1-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 1024 })
      })
      const d = await r.json()
      return d.choices?.[0]?.message?.content || null
    } catch { /* fall through */ }
  }

  return null
}

/* ── Section wrapper ── */
function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 16, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', background: 'var(--bg-elevated)', border: 'none', borderBottom: open ? '1px solid var(--border)' : 'none',
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'left' }}>{title}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: '18px 20px' }}>{children}</div>}
    </div>
  )
}

/* ── Info box ── */
function InfoBox({ children }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      {children}
    </div>
  )
}

/* ── Status message ── */
function Status({ msg }) {
  if (!msg) return null
  const ok = msg.startsWith('✅')
  return (
    <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      background: ok ? 'var(--success-dim)' : 'var(--danger-dim)',
      color: ok ? 'var(--success)' : 'var(--danger)',
      border: `1px solid ${ok ? 'var(--success)' : 'var(--danger)'}` }}>
      {msg}
    </div>
  )
}

export default function Settings() {
  /* API keys */
  const [geminiKey, setGeminiKey] = useState('')
  const [groqKey,   setGroqKey]   = useState('')
  const [adzunaId,  setAdzunaId]  = useState('')
  const [adzunaKey, setAdzunaKey] = useState('')
  const [tgToken,   setTgToken]   = useState('')
  const [tgChatId,  setTgChatId]  = useState('')

  /* CV */
  const [cvText,    setCvText]    = useState('')
  const [cvReview,  setCvReview]  = useState('')
  const [cvLoading, setCvLoading] = useState(false)
  const [cvStatus,  setCvStatus]  = useState('')

  /* Test statuses */
  const [geminiStatus, setGeminiStatus] = useState('')
  const [groqStatus,   setGroqStatus]   = useState('')
  const [tgStatus,     setTgStatus]     = useState('')

  /* Password */
  const [pwd,    setPwd]    = useState('gcc2025')
  const [pwdMsg, setPwdMsg] = useState('')

  /* Global save */
  const [saveMsg, setSaveMsg] = useState('')

  const fileRef = useRef()

  /* Load saved values */
  useEffect(() => {
    setGeminiKey(gk('careeros_gemini_key'))
    setGroqKey(gk('careeros_groq_key'))
    const ak = gjson('careeros_api_keys')
    setAdzunaId(ak.adzunaId  || '')
    setAdzunaKey(ak.adzunaKey || '')
    const tg = gjson('careeros_telegram')
    setTgToken(tg.token   || '')
    setTgChatId(tg.chatId || '')
    setCvText(gk('careeros_cv_text'))
    setPwd(gk('co_access', 'gcc2025'))
  }, [])

  /* ── Save all ── */
  function saveAll() {
    if (geminiKey.trim()) sk('careeros_gemini_key', geminiKey.trim())
    if (groqKey.trim())   sk('careeros_groq_key',   groqKey.trim())
    sk('careeros_api_keys', JSON.stringify({ adzunaId: adzunaId.trim(), adzunaKey: adzunaKey.trim() }))
    if (tgToken.trim() && tgChatId.trim())
      sk('careeros_telegram', JSON.stringify({ token: tgToken.trim(), chatId: tgChatId.trim() }))
    setSaveMsg('✅ All settings saved!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  /* ── Password change ── */
  function changePwd() {
    if (!pwd.trim() || pwd.trim().length < 4) { setPwdMsg('❌ Password must be at least 4 characters'); return }
    sk('co_access', pwd.trim())
    setPwdMsg('✅ Password updated! You will need the new password next time you visit.')
    setTimeout(() => setPwdMsg(''), 4000)
  }

  /* ── Test Gemini ── */
  async function testGemini() {
    const key = geminiKey.trim()
    if (!key) { setGeminiStatus('❌ Paste your Gemini key first'); return }
    setGeminiStatus('Testing…')
    sk('careeros_gemini_key', key)
    const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-flash']
    for (const m of MODELS) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with just the word: Connected' }] }] }) }
        )
        const d = await r.json()
        if (d.error) continue
        const t = d.candidates?.[0]?.content?.parts?.[0]?.text
        if (t) { setGeminiStatus(`✅ Gemini working! Model: ${m}`); return }
      } catch { /* try next */ }
    }
    setGeminiStatus('❌ Key invalid or all models unavailable. Check key and try again.')
    setTimeout(() => setGeminiStatus(''), 6000)
  }

  /* ── Test Groq ── */
  async function testGroq() {
    const key = groqKey.trim()
    if (!key) { setGroqStatus('❌ Paste your Groq key first'); return }
    setGroqStatus('Testing…')
    sk('careeros_groq_key', key)
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'Say: Connected' }], max_tokens: 10 })
      })
      const d = await r.json()
      const t = d.choices?.[0]?.message?.content
      if (t) { setGroqStatus('✅ Groq working! Fast AI activated.') }
      else    { setGroqStatus(`❌ Groq error: ${JSON.stringify(d.error || d)}`) }
    } catch (e) { setGroqStatus(`❌ Failed: ${e.message}`) }
    setTimeout(() => setGroqStatus(''), 5000)
  }

  /* ── Test Telegram ── */
  async function testTelegram() {
    if (!tgToken.trim() || !tgChatId.trim()) { setTgStatus('❌ Enter both token and chat ID'); return }
    setTgStatus('Sending test message…')
    try {
      const r = await fetch(`https://api.telegram.org/bot${tgToken.trim()}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId.trim(), text: '✅ CareerOS GCC — Telegram connected and working!' })
      })
      const d = await r.json()
      if (d.ok) { setTgStatus('✅ Test message sent! Check your Telegram.') }
      else       { setTgStatus(`❌ Error: ${d.description || JSON.stringify(d)}`) }
    } catch (e) { setTgStatus(`❌ Failed: ${e.message}`) }
    setTimeout(() => setTgStatus(''), 6000)
  }

  /* ── CV file upload ── */
  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result || ''
      setCvText(text)
      sk('careeros_cv_text', text)
      extractKeywords(text)
      setCvStatus('✅ CV loaded! Click "AI Review" for analysis.')
      setTimeout(() => setCvStatus(''), 4000)
    }
    reader.readAsText(file)
  }

  function handleCVPaste(val) {
    setCvText(val)
    sk('careeros_cv_text', val)
    if (val.length > 200) extractKeywords(val)
  }

  function extractKeywords(text) {
    const stopWords = new Set(['the','and','for','with','that','this','from','are','was','were','been','have','has','had','will','would','could','should','their','they','them','about','into','your','our','also','more','some','what','when','which','where','who','how','any','all','can','but','not','its','his','her','you','we','be','to','in','on','of','at','by','an','or','as','is','it','do','up','if','so','no','my','me'])
    const words = text
      .replace(/[^a-zA-Z0-9\s\+\#]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 2 && w.length < 30 && !stopWords.has(w) && !/^\d+$/.test(w))
    const freq = {}
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 80).map(([w]) => w)
    sk('careeros_cv_keywords', JSON.stringify(sorted))
  }

  /* ── CV AI Review ── */
  async function reviewCV() {
    if (!cvText.trim()) return
    setCvLoading(true)
    setCvReview('')
    const result = await callAI(`You are a senior GCC recruitment expert. Review this CV professionally.

CV:
${cvText.slice(0, 2500)}

Provide a structured review with these exact sections:
## Overall Score
Rate 0-100 with brief justification.

## Top 3 Strengths
What works well.

## Top 3 Improvements Needed
Specific, actionable changes.

## ATS Optimisation for UAE/GCC
How to improve keyword density and formatting for Bayt, Naukrigulf, GulfTalent.

## Rewritten Professional Summary
Write a 3-sentence executive summary for this person.

## Keywords to Add
10 high-value keywords missing from this CV for the GCC market.`)

    setCvReview(result || 'No AI key configured. Add Gemini or Groq key above.')
    setCvLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 9, padding: '9px 13px', fontSize: 13,
    fontFamily: 'var(--font-body)', color: 'var(--text-primary)',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '28px 36px', maxWidth: 740, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>⚙️ Settings</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        All keys stored in your browser only. Nothing is sent to any external server by CareerOS.
      </p>

      {/* ────────────────── CV UPLOAD ────────────────── */}
      <Section title="📄 Your CV — Upload & AI Review" icon="📄">
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
          Upload or paste your CV. CareerOS extracts keywords for job matching and the AI reviews it for improvements.
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <input ref={fileRef} type="file" accept=".txt,.md,.rtf,.csv" style={{ display: 'none' }} onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} style={{
            padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            📁 Upload .txt File
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', alignSelf: 'center' }}>
            — save your Word CV as .txt first (File → Save As → Plain Text)
          </span>
        </div>

        <textarea
          value={cvText}
          onChange={e => handleCVPaste(e.target.value)}
          placeholder={'Paste your full CV text here…\n\nInclude:\n• Your name, contact details\n• Job titles, companies, dates\n• Responsibilities and achievements (with numbers)\n• Skills, tools, certifications\n• Education\n\nThe more detail you add, the better the AI matching and review.'}
          rows={10}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, padding: 14 }}
          onFocus={e => { e.target.style.borderColor = 'var(--gold)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />

        <Status msg={cvStatus} />

        {cvText.trim().length > 100 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <button onClick={reviewCV} disabled={cvLoading} style={{
              padding: '10px 20px', borderRadius: 9, border: 'none',
              background: 'linear-gradient(135deg,var(--teal),var(--tealDim,#2D7A85))',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: cvLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', opacity: cvLoading ? 0.6 : 1,
            }}>
              {cvLoading ? '⏳ Reviewing…' : '✨ AI Review My CV'}
            </button>
            <button onClick={() => { extractKeywords(cvText); setCvStatus('✅ Keywords extracted for job matching!'); setTimeout(() => setCvStatus(''), 3000) }} style={{
              padding: '10px 18px', borderRadius: 9, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
              🔑 Extract Keywords Only
            </button>
          </div>
        )}

        {cvReview && (
          <div style={{ marginTop: 16, padding: 18, background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>AI CV Review</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>{cvReview}</div>
            <button onClick={() => navigator.clipboard?.writeText(cvReview)} style={{
              marginTop: 12, padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>📋 Copy Review</button>
          </div>
        )}
      </Section>

      {/* ────────────────── GEMINI ────────────────── */}
      <Section title="✨ Google Gemini API Key (Primary AI)" icon="✨">
        <InfoBox>
          <strong style={{ color: 'var(--gold)' }}>How to get your FREE Gemini key (2 minutes):</strong><br />
          1. Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>aistudio.google.com</a><br />
          2. Sign in with your Google account<br />
          3. Click <strong>"Get API key"</strong> in the left sidebar<br />
          4. Click <strong>"Create API key"</strong><br />
          5. If it asks for a project — click <strong>"Create API key in new project"</strong><br />
          6. Your key appears starting with <code style={{ color: 'var(--gold)', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 4 }}>AIza</code><br />
          7. Click the copy icon next to it → paste below<br />
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Free: 1,500 requests/day · No credit card needed</span>
        </InfoBox>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Gemini API Key</label>
          <input
            type="password"
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'var(--gold)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>
        <button onClick={testGemini} style={{ marginTop: 10, padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          🧪 Test Gemini Key
        </button>
        <Status msg={geminiStatus} />
      </Section>

      {/* ────────────────── GROQ ────────────────── */}
      <Section title="⚡ Groq API Key (Backup AI — Faster & More Generous)" icon="⚡" defaultOpen={false}>
        <InfoBox>
          <strong style={{ color: 'var(--gold)' }}>How to get your FREE Groq key (2 minutes):</strong><br />
          1. Go to <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>console.groq.com</a><br />
          2. Click <strong>Sign Up</strong> — use Google or email, no credit card needed<br />
          3. After login, click <strong>"API Keys"</strong> in the left sidebar<br />
          4. Click <strong>"Create API Key"</strong> — give it a name like CareerOS<br />
          5. Copy the key starting with <code style={{ color: 'var(--gold)', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 4 }}>gsk_</code><br />
          6. Paste below<br />
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Free: 14,400 requests/day · Llama 3.1 models · Very fast</span>
        </InfoBox>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Groq API Key</label>
          <input
            type="password"
            value={groqKey}
            onChange={e => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'var(--gold)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>
        <button onClick={testGroq} style={{ marginTop: 10, padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          🧪 Test Groq Key
        </button>
        <Status msg={groqStatus} />
      </Section>

      {/* ────────────────── ADZUNA ────────────────── */}
      <Section title="🔍 Adzuna Job API (UAE & Global Jobs)" icon="🔍" defaultOpen={false}>
        <InfoBox>
          <strong style={{ color: 'var(--gold)' }}>How to get your FREE Adzuna key:</strong><br />
          1. Go to <a href="https://developer.adzuna.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>developer.adzuna.com</a><br />
          2. Click <strong>Register</strong> → fill name, email, password → submit<br />
          3. Verify your email → log in<br />
          4. On the dashboard click <strong>"Create new application"</strong><br />
          5. App name: <code style={{ color: 'var(--gold)', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 4 }}>CareerOS</code><br />
          &nbsp;&nbsp;&nbsp;URL: <code style={{ color: 'var(--gold)', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 4 }}>https://thanjanbaburaj.github.io</code><br />
          6. Submit → you get an <strong>App ID</strong> (numbers) and <strong>App Key</strong> (long string)<br />
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Free: ~1,000 calls/month</span>
        </InfoBox>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>App ID (numbers only)</label>
            <input type="text" value={adzunaId} onChange={e => setAdzunaId(e.target.value)} placeholder="12345678" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--gold)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>App Key (long string)</label>
            <input type="password" value={adzunaKey} onChange={e => setAdzunaKey(e.target.value)} placeholder="abcdef1234567890..." style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--gold)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
          </div>
        </div>
      </Section>

      {/* ────────────────── TELEGRAM ────────────────── */}
      <Section title="📱 Telegram Notifications (Optional)" icon="📱" defaultOpen={false}>
        <InfoBox>
          <strong style={{ color: 'var(--gold)' }}>Step A — Create your bot:</strong><br />
          1. Open Telegram → search <strong>@BotFather</strong> (blue verified tick)<br />
          2. Send <code style={{ color: 'var(--gold)', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 4 }}>/newbot</code><br />
          3. When asked for a name → type <strong>CareerOS</strong><br />
          4. When asked for username → type e.g. <strong>careeros_yourname_bot</strong> (must end in bot)<br />
          5. BotFather gives you a token like <code style={{ color: 'var(--gold)', fontSize: 11 }}>7123456789:AAF-xxxxx</code> — copy it<br /><br />
          <strong style={{ color: 'var(--gold)' }}>Step B — Get your Chat ID:</strong><br />
          1. Search <strong>@userinfobot</strong> in Telegram → send any message<br />
          2. It replies with your ID number → copy it<br /><br />
          <strong style={{ color: 'var(--gold)' }}>Step C — Activate:</strong><br />
          Search your new bot by username → click <strong>Start</strong> (required once)
        </InfoBox>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Bot Token</label>
            <input type="password" value={tgToken} onChange={e => setTgToken(e.target.value)} placeholder="7123456789:AAF-xxxxxxxxxxxxx" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--gold)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Your Chat ID</label>
            <input type="text" value={tgChatId} onChange={e => setTgChatId(e.target.value)} placeholder="987654321" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--gold)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
          </div>
        </div>
        <button onClick={testTelegram} style={{ marginTop: 10, padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          📤 Send Test Message
        </button>
        <Status msg={tgStatus} />
      </Section>

      {/* ────────────────── PASSWORD ────────────────── */}
      <Section title="🔒 Access Password" icon="🔒" defaultOpen={false}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
          Change the password required to access this site. Current password is stored in your browser.
          Anyone visiting the URL must enter this password.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>New Password (min 4 characters)</label>
          <input
            type="text"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="your-new-password"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'var(--gold)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>
        <button onClick={changePwd} style={{ marginTop: 10, padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          🔒 Update Password
        </button>
        <Status msg={pwdMsg} />
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.6 }}>
          Note: The password is checked by your browser. To permanently change it for all visitors,
          also update the value in <code style={{ color: 'var(--gold)' }}>index.html</code> in your GitHub repo (look for <code style={{ color: 'var(--gold)' }}>var PWD = 'gcc2025'</code>).
        </p>
      </Section>

      {/* ────────────────── FREE AI TOOLS GUIDE ────────────────── */}
      <Section title="🤖 Free AI Tools Available" icon="🤖" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'Google Gemini', status: '✅ Integrated', free: '1,500 req/day', url: 'aistudio.google.com', note: 'Best quality. Primary AI for CareerOS.' },
            { name: 'Groq',          status: '✅ Integrated', free: '14,400 req/day', url: 'console.groq.com', note: 'Fastest. Most generous free tier. Uses Llama 3.1.' },
            { name: 'Claude (Anthropic)', status: '❌ Not free', free: 'No free API tier', url: 'console.anthropic.com', note: 'Excellent quality but requires paid API. $3/million tokens.' },
            { name: 'ChatGPT (OpenAI)', status: '❌ Not free', free: 'No free API tier', url: 'platform.openai.com', note: 'Requires paid API. $0.15/million tokens for GPT-4o-mini.' },
            { name: 'Microsoft Copilot', status: '❌ No public API', free: 'No API access', url: 'N/A', note: 'No public API available for integration.' },
            { name: 'Cohere',        status: '⚠️ Free trial', free: 'Trial then paid', url: 'dashboard.cohere.com', note: 'Free trial available. Good for text tasks.' },
            { name: 'Mistral AI',    status: '⚠️ Limited free', free: 'Very limited', url: 'console.mistral.ai', note: 'Small free tier. Good European alternative.' },
          ].map((tool, i) => (
            <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{tool.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: tool.status.startsWith('✅') ? 'var(--success-dim)' : tool.status.startsWith('⚠️') ? 'var(--warning-dim)' : 'var(--danger-dim)',
                  color: tool.status.startsWith('✅') ? 'var(--success)' : tool.status.startsWith('⚠️') ? 'var(--warning)' : 'var(--danger)',
                }}>{tool.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 2 }}>Free tier: {tool.free}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tool.note}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 14, lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-muted)' }}>Recommendation:</strong> Add both Gemini and Groq keys. CareerOS automatically uses Gemini first. If it fails or hits limits, it falls back to Groq. Between the two you have 16,000+ free AI requests per day — far more than any personal use requires.
        </p>
      </Section>

      {/* ────────────────── SAVE BUTTON ────────────────── */}
      <div style={{ marginTop: 8 }}>
        {saveMsg && (
          <div style={{ padding: '12px 16px', background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: 10, color: 'var(--success)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            {saveMsg}
          </div>
        )}
        <button onClick={saveAll} style={{
          width: '100%', padding: '13px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))',
          color: '#0A1628', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          💾 Save All Settings
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
          All keys stored in your browser's localStorage only. Never transmitted externally by CareerOS.
        </p>
      </div>
    </div>
  )
}
