/**
 * Simulation Engine — Manages the DM qualification flow state machine.
 * 
 * Stages:
 *   reels    → user is watching reels, can comment
 *   dm       → comment triggered, transitions to DM screen
 *   qualify  → bot sends questions, user replies
 *   complete → all questions answered → lead captured
 */

const TYPING_DELAY = 1200

export function createBotMessages(campaign) {
  const intro = `👋 Hey! Thanks for commenting "${campaign.triggerKeyword}" on our reel!`
  const welcome = `We'd love to learn a bit more about you. Just a few quick questions!`
  return { intro, welcome }
}

export function getQuestionMessage(question, index, total) {
  return `📝 Question ${index + 1}/${total}: ${question}`
}

export function getValidationError(field, value) {
  if (!value || !value.trim()) return 'Please enter a response.'
  if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.'
  if (field === 'phone' && !/^[\d\s\-\+\(\)]{7,}$/.test(value)) return 'Please enter a valid phone number.'
  return null
}

export function getClosingMessages(campaign) {
  return [
    `🎉 You're all set! Thanks for your time.`,
    `✅ A team member will reach out to you shortly.`,
    campaign.calendlyLink
      ? `📅 Book a call here: ${campaign.calendlyLink}`
      : null,
    `💬 Anything else, feel free to reach out!`,
  ].filter(Boolean)
}

export function simulateTyping(callback) {
  return setTimeout(() => callback(), TYPING_DELAY)
}

export function generateHandle() {
  const prefixes = ['creator', 'influencer', 'business', 'growth', 'digital', 'smart', 'the']
  const suffixes = ['co', 'io', 'hq', 'lab', 'hub', 'studio', 'pro', 'life']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  const num = Math.floor(Math.random() * 999)
  return `@${prefix}_${suffix}${num}`
}

export function getQuestionType(field) {
  const lower = (field || '').toLowerCase()
  if (lower.includes('email')) return 'email'
  if (lower.includes('phone') || lower.includes('mobile')) return 'phone'
  if (lower.includes('website') || lower.includes('url') || lower.includes('link')) return 'url'
  if (lower.includes('budget') || lower.includes('spend') || lower.includes('price')) return 'number'
  return 'text'
}