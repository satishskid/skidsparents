/**
 * Unified AI provider interface for SKIDS Guide chat.
 * Supports: Cloudflare Workers AI (free), Google Gemini (premium), Anthropic Claude (premium)
 */

export type ModelTier = 'free' | 'premium'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  text: string
  model: string
  tier: ModelTier
}

// ─── Workers AI (Cloudflare — free tier) ──────────────

export async function runWorkersAI(
  ai: any,
  messages: AIMessage[],
  maxTokens = 900
): Promise<AIResponse> {
  // Workers AI doesn't support 'system' role in all models — merge into first user message
  const cfMessages = messages.map(m => ({
    role: m.role === 'system' ? 'system' : m.role,
    content: m.content,
  }))

  // Try Llama-4-Scout first (newer, better model)
  try {
    const res = await ai.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
      messages: cfMessages,
      max_tokens: maxTokens,
    })
    return { text: res.response || '', model: 'llama-4-scout-17b-16e-instruct', tier: 'free' }
  } catch (err) {
    console.warn('[WorkersAI] Llama-4-Scout failed, falling back to Llama-3.1-8b:', err)
  }

  // Fallback to Llama-3.1-8b
  const res = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: cfMessages,
    max_tokens: maxTokens,
  })
  return { text: res.response || '', model: 'llama-3.1-8b-instruct', tier: 'free' }
}

// ─── Google Gemini (premium) ──────────────────────────

export async function runGemini(
  apiKey: string,
  messages: AIMessage[],
  maxTokens = 1200
): Promise<AIResponse> {
  // Separate system prompt from conversation
  const systemMsg = messages.find(m => m.role === 'system')
  const conversationMsgs = messages.filter(m => m.role !== 'system')

  const body: any = {
    contents: conversationMsgs.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  }

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const data: any = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return { text, model: 'gemini-1.5-flash', tier: 'premium' }
}

// ─── Groq (premium — very fast, generous free tier) ──

export async function runGroq(
  apiKey: string,
  messages: AIMessage[],
  maxTokens = 1200
): Promise<AIResponse> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }

  const data: any = await res.json()
  const text = data?.choices?.[0]?.message?.content || ''
  return { text, model: 'llama-3.3-70b (groq)', tier: 'premium' }
}

// ─── Anthropic Claude (premium) ──────────────────────

export async function runClaude(
  apiKey: string,
  messages: AIMessage[],
  maxTokens = 1200
): Promise<AIResponse> {
  const systemMsg = messages.find(m => m.role === 'system')
  const conversationMsgs = messages.filter(m => m.role !== 'system')

  const body: any = {
    model: 'claude-3-haiku-20240307', // cost-effective, fast — upgrade to sonnet for higher quality
    max_tokens: maxTokens,
    messages: conversationMsgs.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  }

  if (systemMsg) {
    body.system = systemMsg.content
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data: any = await res.json()
  const text = data?.content?.[0]?.text || ''
  return { text, model: 'claude-3-haiku', tier: 'premium' }
}
