import React, { useState } from 'react'
import { generateInterviewQuestions, generateFollowUp } from '../../services/api/geminiAPI.js'
import { Card, Button, Input, Badge, Tabs, EmptyState } from '../../components/ui/index.jsx'

const QUESTION_BANK = {
  'General': [
    'Tell me about yourself and your career journey so far.',
    'Why are you looking for a new opportunity?',
    'What do you know about our company and why do you want to work here?',
    'Where do you see yourself in 5 years?',
    'What are your greatest strengths and areas for development?',
    'Describe your ideal working environment.',
    'What salary range are you targeting and what is your current package?',
  ],
  'Behavioural (STAR)': [
    'Tell me about a time you led a team through a challenging project.',
    'Describe a situation where you had to manage conflicting priorities.',
    'Give me an example of when you had to persuade stakeholders to change direction.',
    'Tell me about a significant achievement you are most proud of.',
    'Describe a time you made a mistake and how you handled it.',
    'Tell me about a time you worked with a difficult colleague or manager.',
  ],
  'GCC / UAE Specific': [
    'What experience do you have working in a multicultural environment?',
    'How do you manage working across different cultures and communication styles in the GCC?',
    'Are you familiar with UAE Labour Law and how it affects employment?',
    'What is your visa status and notice period?',
    'Are you open to relocation within the GCC if required?',
    'Do you speak Arabic, and to what level?',
  ],
  'Senior / Executive': [
    'Describe your experience managing P&L responsibility and the scale involved.',
    'How do you approach building and developing high-performing teams?',
    'Tell me about your experience working with or presenting to a board.',
    'How do you balance short-term operational demands with long-term strategic goals?',
    'Describe your approach to driving organisational change.',
    'What is your leadership philosophy and how has it evolved?',
  ],
}

const STAR_TEMPLATE = `SITUATION: Describe the context and challenge.
(What was the situation? What were the stakes?)

TASK: What was your specific role or responsibility?
(What were you asked to do or what problem did you need to solve?)

ACTION: What specific actions did YOU take?
(Focus on your individual contribution, not the team's.)

RESULT: What was the measurable outcome?
(Numbers, percentages, time saved, revenue impact…)

REFLECTION: What did you learn from this experience?`

function QuestionCard({ question, idx }) {
  const [answer, setAnswer] = useState('')
  const [showTemplate, setShowTemplate] = useState(false)

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gold-glow)', border: '1px solid var(--border-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'var(--gold)',
        }}>{idx + 1}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5, marginBottom: 12 }}>
            {question}
          </p>
          <Input
            value={answer}
            onChange={setAnswer}
            placeholder="Write your answer here to practice…"
            multiline
            rows={3}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setShowTemplate(t => !t)}
              style={{
                background: 'none', border: 'none', color: 'var(--gold)',
                fontSize: 12, cursor: 'pointer', padding: 0,
              }}
            >
              {showTemplate ? '▲ Hide STAR template' : '▼ Show STAR template'}
            </button>
          </div>
          {showTemplate && (
            <pre style={{
              marginTop: 10, padding: '12px 14px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', fontSize: 12,
              color: 'var(--text-muted)', whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-body)', lineHeight: 1.7,
            }}>{STAR_TEMPLATE}</pre>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function Interview() {
  const [tab, setTab]       = useState('bank')
  const [category, setCategory] = useState('General')
  const [aiJobTitle, setAiJobTitle] = useState('')
  const [aiCompany,  setAiCompany]  = useState('')
  const [aiQuestions, setAiQuestions] = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)

  // Follow-up generator
  const [fuJobTitle, setFuJobTitle] = useState('')
  const [fuCompany,  setFuCompany]  = useState('')
  const [fuDays,     setFuDays]     = useState('7')
  const [fuStage,    setFuStage]    = useState('applied')
  const [fuMessage,  setFuMessage]  = useState('')
  const [fuLoading,  setFuLoading]  = useState(false)

  async function generateAIQuestions() {
    if (!aiJobTitle) return
    setAiLoading(true)
    const result = await generateInterviewQuestions({
      jobTitle: aiJobTitle, company: aiCompany, industry: 'GCC',
    })
    setAiQuestions(result)
    setAiLoading(false)
  }

  async function generateFollowUpMsg() {
    if (!fuJobTitle || !fuCompany) return
    setFuLoading(true)
    const result = await generateFollowUp({
      jobTitle: fuJobTitle, company: fuCompany,
      daysSince: fuDays, stage: fuStage,
    })
    setFuMessage(result)
    setFuLoading(false)
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>Interview Preparation</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>GCC-tuned question bank, AI question generation, and follow-up tools</p>
      </div>

      <Tabs
        tabs={[
          { id: 'bank',     label: '📚 Question Bank'   },
          { id: 'ai',       label: '✨ AI Questions'     },
          { id: 'followup', label: '📬 Follow-up Writer' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: 24 }}>

        {/* QUESTION BANK */}
        {tab === 'bank' && (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {Object.keys(QUESTION_BANK).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '7px 16px', borderRadius: 99,
                    border: `1px solid ${category === cat ? 'var(--gold)' : 'var(--border)'}`,
                    background: category === cat ? 'var(--gold-glow)' : 'transparent',
                    color: category === cat ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >{cat}</button>
              ))}
            </div>
            <div className="stagger-children">
              {QUESTION_BANK[category].map((q, i) => (
                <QuestionCard key={i} question={q} idx={i} />
              ))}
            </div>
          </div>
        )}

        {/* AI QUESTIONS */}
        {tab === 'ai' && (
          <div>
            <Card style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Generate Role-Specific Questions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <Input label="Job Title" value={aiJobTitle} onChange={setAiJobTitle} placeholder="Marketing Director" required />
                <Input label="Company (optional)" value={aiCompany} onChange={setAiCompany} placeholder="Emaar Properties" />
              </div>
              <Button onClick={generateAIQuestions} loading={aiLoading} disabled={!aiJobTitle}>
                ✨ Generate Questions
              </Button>
            </Card>

            {aiQuestions && (
              <Card>
                <h4 style={{ fontSize: 14, color: 'var(--gold)', marginBottom: 16 }}>
                  AI-Generated Questions for {aiJobTitle}
                </h4>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {aiQuestions}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* FOLLOW-UP WRITER */}
        {tab === 'followup' && (
          <div>
            <Card style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>Professional Follow-Up Generator</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Most candidates never follow up. Those who do get significantly better response rates.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Input label="Job Title" value={fuJobTitle} onChange={setFuJobTitle} placeholder="Marketing Manager" required />
                <Input label="Company" value={fuCompany} onChange={setFuCompany} placeholder="Noon.com" required />
                <Input label="Days Since Applied" type="number" value={fuDays} onChange={setFuDays} />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Stage</label>
                  <select
                    value={fuStage}
                    onChange={e => setFuStage(e.target.value)}
                    style={{
                      width: '100%', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                      padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <option value="applied">Applied — no response</option>
                    <option value="screening">After screening call</option>
                    <option value="interview">After interview</option>
                  </select>
                </div>
              </div>
              <Button onClick={generateFollowUpMsg} loading={fuLoading} disabled={!fuJobTitle || !fuCompany}>
                ✨ Write Follow-Up
              </Button>
            </Card>

            {fuMessage && (
              <Card style={{ background: 'var(--gold-glow)', borderColor: 'var(--border-gold)' }}>
                <h4 style={{ fontSize: 13, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Your Follow-Up Message</h4>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {fuMessage}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ marginTop: 14 }}
                  onClick={() => navigator.clipboard.writeText(fuMessage)}
                >
                  📋 Copy to Clipboard
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
