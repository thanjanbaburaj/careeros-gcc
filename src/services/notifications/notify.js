/**
 * CareerOS GCC — Notification Service
 * Standalone. Handles Telegram bot delivery.
 * Email handled via mailto for now (zero server cost).
 */

function getTelegramConfig() {
  try {
    return JSON.parse(localStorage.getItem('careeros_telegram') || '{}')
  } catch { return {} }
}

export async function sendTelegram(message) {
  const { token, chatId } = getTelegramConfig()
  if (!token || !chatId) return { ok: false, reason: 'not_configured' }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:                  chatId,
        text:                     message,
        parse_mode:               'Markdown',
        disable_web_page_preview: true,
      }),
    })
    return await res.json()
  } catch (e) {
    return { ok: false, reason: e.message }
  }
}

export function sendEmailDigest(jobs, userEmail) {
  if (!userEmail || !jobs.length) return
  const subject = `🎯 ${jobs.length} New Job Matches — CareerOS GCC`
  const body = jobs.slice(0, 10).map((j, i) =>
    `${i + 1}. ${j.title} at ${j.company} (${j.location})\n${j.url}`
  ).join('\n\n')
  window.open(`mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
}

export async function notifyNewJobs(jobs, user) {
  if (!jobs.length) return

  const msg = [
    `🎯 *CareerOS GCC* — ${new Date().toLocaleDateString('en-AE')}`,
    `*${jobs.length} new match${jobs.length > 1 ? 'es'  : ''}* found\n`,
    ...jobs.slice(0, 8).map((j, i) =>
      `*${i + 1}. ${j.title}*\n🏢 ${j.company} · 📍 ${j.location}\n🔗 ${j.url}`
    ),
  ].join('\n')

  await sendTelegram(msg)
}
