/**
 * CareerOS GCC — Gemini AI Service
 * Free tier. Standalone. Zero external deps.
 * Caches responses to conserve the 1,500/day limit.
 * User provides their own free API key via Settings.
 */

const CACHE_PREFIX = 'careeros_ai_'
const CACHE_TTL    = 24 * 60 * 60 * 1000   // 24h

function getKey() {
  return localStorage.getItem('careeros_gemini_key') || ''
}

function cacheGet(hash) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + hash)
    if (!raw) return null
    const { text, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return text
  } catch { return null }
}

function cacheSet(hash, text) {
  try {
    localStorage.setItem(CACHE_PREFIX + hash, JSON.stringify({ text, ts: Date.now() }))
  } catch {}
}

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

async function callGemini(prompt) {
  const key = getKey()
  if (!key) {
    return 'Please add your free Gemini API key in Settings to enable AI features.'
  }

  const hash   = hashStr(prompt.slice(0, 200))
  const cached = cacheGet(hash)
  if (cached) return cached

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'Gemini API error')
    }
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    cacheSet(hash, text)
    return text
  } catch (e) {
    return `AI error: ${e.message}. Check your Gemini API key in Settings.`
  }
}

// ── Named AI functions ───────────────────────────────

export async function generateCoverLetter({ jobTitle, company, cvKeywords, tone = 'professional' }) {
  const prompt = `Write a compelling, concise cover letter for a ${jobTitle} position at ${company} in the UAE/GCC region.
The candidate's key skills: ${cvKeywords.join(', ')}.
Tone: ${tone}. Length: 3 short paragraphs. No placeholders. No Dear Hiring Manager.
Start directly with a strong opening sentence. End with a confident call to action.`
  return callGemini(prompt)
}

export async function analyseGap({ jobDescription, cvKeywords }) {
  const prompt = `Compare this CV profile against this job description and give a brief gap analysis.

CV Keywords: ${cvKeywords.join(', ')}

Job Description: ${jobDescription.slice(0, 800)}

Respond in this exact format:
MATCH_SCORE: [number 0-100]
STRENGTHS: [comma-separated list of matching skills]
GAPS: [comma-separated list of missing skills]
ADVICE: [2 sentence improvement suggestion]`
  return callGemini(prompt)
}

export async function generateInterviewQuestions({ jobTitle, company, industry }) {
  const prompt = `Generate 8 likely interview questions for a ${jobTitle} role at ${company || 'a company'} in the ${industry || 'GCC'} market.
Mix of: behavioural, situational, and technical questions.
Format: numbered list. Include one question about GCC/UAE market knowledge.`
  return callGemini(prompt)
}

export async function generateFollowUp({ jobTitle, company, daysSince, stage }) {
  const prompt = `Write a brief, professional follow-up message for a ${jobTitle} application at ${company}.
Status: ${stage || 'applied'} ${daysSince} days ago with no response.
GCC professional norms. Polite. Confident. 3 sentences maximum.`
  return callGemini(prompt)
}

export async function answerCareerQuestion(question, userContext = '') {
  const prompt = `You are CareerOS, a career advisor specialising in the UAE and GCC job market.
${userContext ? `User context: ${userContext}` : ''}

Question: ${question}

Answer concisely in 2-4 sentences. Focus on practical, GCC-specific advice.`
  return callGemini(prompt)
}

export async function buildCVFromAnswers(answers) {
  const prompt = `Transform these interview answers into professional CV bullet points for a UAE/GCC CV.

Answers: ${JSON.stringify(answers)}

For each role/section, produce 2-3 bullet points starting with strong action verbs.
Quantify where possible. Use professional language. Return as JSON:
{"summary": "...", "experience": [{"role": "...", "company": "...", "bullets": ["..."]}], "skills": ["..."]}`
  return callGemini(prompt)
}

export { callGemini }
