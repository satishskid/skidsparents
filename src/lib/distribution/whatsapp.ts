// BHASH WhatsApp API Service
// API: http://bhashsms.com/api/sendmsg.php
// Params: user, pass, sender (BUZWAP), phone (10-digit), text, priority=wa, stype=normal

export interface WhatsAppMessage {
  to: string   // 10-digit phone number
  message: string
}

export class BHASHService {
  private apiUrl = 'http://bhashsms.com/api/sendmsg.php'
  private user: string
  private pass: string
  private sender: string

  constructor(env: { BHASH_USER: string; BHASH_PASS: string; BHASH_SENDER: string }) {
    this.user = env.BHASH_USER
    this.pass = env.BHASH_PASS
    this.sender = env.BHASH_SENDER
  }

  /** Normalize phone: strip +91 / 91 prefix, ensure 10 digits */
  normalizePhone(phone: string): string {
    let normalized = phone.replace(/\D/g, '') // strip non-digits
    if (normalized.startsWith('91') && normalized.length === 12) {
      normalized = normalized.slice(2)
    }
    if (normalized.length !== 10) {
      throw new Error(`Invalid phone number: ${phone}. Must be 10 digits.`)
    }
    return normalized
  }

  async sendMessage(msg: WhatsAppMessage): Promise<string> {
    const phone = this.normalizePhone(msg.to)

    const params = new URLSearchParams({
      user: this.user,
      pass: this.pass,
      sender: this.sender,
      phone,
      text: msg.message,
      priority: 'wa',
      stype: 'normal',
    })

    const response = await fetch(`${this.apiUrl}?${params.toString()}`)
    const result = await response.text()

    if (!response.ok) {
      throw new Error(`BHASH API HTTP error ${response.status}: ${result}`)
    }

    return result
  }

  /** Send with retry (exponential backoff) */
  async sendWithRetry(msg: WhatsAppMessage, maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.sendMessage(msg)
        return
      } catch (error) {
        if (attempt === maxRetries) throw error
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /** Broadcast a daily tip to a list of phone numbers */
  async sendDailyTip(phones: string[], tip: string): Promise<{ sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    for (const phone of phones) {
      try {
        await this.sendWithRetry({ to: phone, message: tip })
        sent++
        // 1-second delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to send to ${phone}:`, error)
        failed++
      }
    }

    return { sent, failed }
  }

  /** Send a personalized message to a single parent */
  async sendPersonalized(phone: string, message: string): Promise<void> {
    await this.sendWithRetry({ to: phone, message })
  }
}

/** Format a daily health tip message for WhatsApp */
export function formatDailyTip(tip: {
  title: string
  body: string
  url?: string
}): string {
  const lines = [
    `🌟 *SKIDS Daily Health Tip*`,
    ``,
    `*${tip.title}*`,
    ``,
    tip.body,
  ]

  if (tip.url) {
    lines.push(``, `📖 Read more: ${tip.url}`)
  }

  lines.push(``, `_SKIDS Parent — Raising smart, healthy S-Kids_`)

  return lines.join('\n')
}
