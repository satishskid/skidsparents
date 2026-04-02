/**
 * Intervention Coach Prompt Builder — Builds protocol-bound system prompts.
 *
 * Two types of coaching:
 * 1. Intervention Coach: For prescribed protocols (strict playbook, compliance-aware)
 * 2. Growth Coach: For developmental tracks (lighter, universal)
 *
 * Both answer ONLY from their playbook. Never search the internet.
 * Both flag boundaries and suggest HITL when they reach limits.
 */

import type {
  InterventionProtocol,
  InterventionAssignment,
  InterventionTask,
  InterventionStreak,
  CoachingPlaybook,
  CoachingTopic,
} from './types'
import type { GrowthTrack } from '../growth-tracks/types'

// ── Intervention Coach (Protocol-bound) ──

export function buildInterventionCoachPrompt(
  protocol: InterventionProtocol,
  assignment: InterventionAssignment,
  childName: string,
  childAgeText: string,
  doctorName: string,
  recentTasks: InterventionTask[],
  streak: InterventionStreak | null,
  dayNumber: number
): string {
  const parts: string[] = []
  const params = assignment.customParams || {}

  // 1. Persona
  parts.push(INTERVENTION_COACH_PERSONA)

  // 2. Protocol context
  parts.push(`\nPROTOCOL: ${protocol.name}`)
  parts.push(`DESCRIPTION: ${protocol.description}`)
  parts.push(`EVIDENCE BASE: ${protocol.evidenceBase}`)
  parts.push(`AUTHORITY: ${protocol.protocolAuthority}`)

  // 3. Child context
  parts.push(`\nCHILD: ${childName}, ${childAgeText}`)
  if (assignment.childEthnicOrigin) {
    parts.push(`ETHNIC ORIGIN: ${assignment.childEthnicOrigin}`)
  }

  // 4. Regional context
  if (protocol.dietaryContext) {
    parts.push(`DIETARY CONTEXT: ${protocol.dietaryContext}`)
  }
  if (protocol.geneticConsiderations) {
    parts.push(`GENETIC CONSIDERATIONS: ${protocol.geneticConsiderations}`)
  }

  // 5. Prescribed parameters
  parts.push(`\nPRESCRIBED PARAMETERS:`)
  for (const [key, value] of Object.entries(params)) {
    parts.push(`- ${key}: ${value}`)
  }
  parts.push(`DAY: ${dayNumber} of ${protocol.defaultDurationDays}`)

  // 6. Compliance context
  if (streak) {
    parts.push(`\nCOMPLIANCE:`)
    parts.push(`- 7-day compliance: ${Math.round(streak.compliancePct)}%`)
    parts.push(`- Current streak: ${streak.currentStreak} days`)
    parts.push(`- Longest streak: ${streak.longestStreak} days`)
    parts.push(`- Total done: ${streak.totalDone}, skipped: ${streak.totalSkipped}, partial: ${streak.totalPartial}`)
  }

  // Recent task status
  if (recentTasks.length > 0) {
    parts.push(`\nRECENT TASKS (last 7 days):`)
    for (const task of recentTasks.slice(0, 14)) {
      const note = task.parentNote ? ` — Note: "${task.parentNote}"` : ''
      parts.push(`- ${task.taskDate}: ${task.title} → ${task.status}${note}`)
    }
  }

  // 7. THE PLAYBOOK
  parts.push(`\nCOACHING PLAYBOOK (ONLY answer from these topics):`)
  for (const [topic, entry] of Object.entries(protocol.coachingPlaybook)) {
    // Interpolate params into responses
    let response = entry.response
    for (const [key, value] of Object.entries(params)) {
      response = response.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    }
    response = response.replace(/\{\{child_name\}\}/g, childName)
    response = response.replace(/\{\{doctor_name\}\}/g, doctorName)

    parts.push(`\n[${topic}]`)
    parts.push(`Trigger keywords: ${entry.questionPatterns.join(', ')}`)
    parts.push(`Response: ${response}`)
    if (entry.followUp) parts.push(`Follow-up: ${entry.followUp}`)
    if (entry.boundary) parts.push(`⚠️ BOUNDARY: This is a medical question. Direct to Dr. ${doctorName}.`)
  }

  // 8. Guardrails
  parts.push(buildInterventionGuardrails(doctorName))

  return parts.join('\n')
}

// ── Growth Coach (Track-bound) ──

export function buildGrowthCoachPrompt(
  tracks: GrowthTrack[],
  childName: string,
  childAgeText: string
): string {
  const parts: string[] = []

  parts.push(GROWTH_COACH_PERSONA)

  parts.push(`\nCHILD: ${childName}, ${childAgeText}`)

  for (const track of tracks) {
    parts.push(`\n━━━ ${track.title} ━━━`)
    parts.push(`WHAT TO EXPECT: ${track.whatToExpect}`)
    parts.push(`KEY MESSAGE: ${track.parentGuidance.keyMessage}`)

    parts.push(`\nCOACHING TOPICS:`)
    for (const [topic, entry] of Object.entries(track.coachingPlaybook)) {
      let response = entry.response.replace(/\{\{child_name\}\}/g, childName)
      parts.push(`\n[${topic}]`)
      parts.push(`Trigger keywords: ${entry.questionPatterns.join(', ')}`)
      parts.push(`Response: ${response}`)
      if (entry.boundary) parts.push(`⚠️ BOUNDARY: Direct to pediatrician.`)
    }

    // Parental coping
    if (track.parentalCoping) {
      parts.push(`\nPARENTAL SUPPORT:`)
      for (const norm of track.parentalCoping.normalizations) {
        parts.push(`- ${norm}`)
      }
      for (const strat of track.parentalCoping.copingStrategies) {
        parts.push(`- Coping: ${strat}`)
      }
    }
  }

  parts.push(GROWTH_COACH_GUARDRAILS)

  return parts.join('\n')
}

// ── Playbook Matching ──

/**
 * Find the best coaching response for a parent's message.
 * Returns matched topic + response, or null if no match (boundary).
 */
export function matchPlaybookTopic(
  playbook: CoachingPlaybook,
  message: string
): { topic: string; coaching: CoachingTopic; score: number } | null {
  const msgLower = message.toLowerCase()
  let best: { topic: string; coaching: CoachingTopic; score: number } | null = null

  for (const [topic, coaching] of Object.entries(playbook)) {
    let score = 0
    for (const pattern of coaching.questionPatterns) {
      if (msgLower.includes(pattern.toLowerCase())) {
        score += 1
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic, coaching, score }
    }
  }

  return best
}

// ── Personas ──

const INTERVENTION_COACH_PERSONA = `You are a home therapy coach for a pediatric intervention prescribed by a doctor. You help parents execute the prescribed protocol at home with warmth, practical guidance, and encouragement.

COMMUNICATION STYLE:
- Warm, encouraging, practical
- Short responses (2-3 paragraphs max)
- Acknowledge the parent's effort
- Use the child's name
- Indian family context where relevant
- When compliance is high: celebrate ("Amazing consistency!")
- When compliance is low: empathetic, not judgmental ("What's making it hard? Let me help.")
- After a gap: encouraging ("Welcome back! Every session counts.")

YOUR ROLE:
- Help parents understand and execute the prescribed tasks
- Provide encouragement based on compliance trajectory
- Answer questions ONLY from the coaching playbook
- You are NOT a doctor. You do NOT diagnose or change the protocol.`

const GROWTH_COACH_PERSONA = `You are a developmental growth coach for parents. You help parents understand and nurture their child's emotional, behavioral, social, and physical development using evidence-based guidance from pediatric science and developmental psychology.

COMMUNICATION STYLE:
- Warm, reassuring, non-judgmental
- Always normalize first, then guide ("This is very common at this age. Here's what helps...")
- Short responses (2-3 paragraphs max)
- Use the child's name
- Acknowledge the parent's feelings
- Indian family context where relevant

YOUR ROLE:
- Help parents understand what's NORMAL at each developmental stage
- Provide practical, daily-life guidance
- Support the parent's own emotional wellbeing
- Answer from developmental science, not internet trends or hearsay`

function buildInterventionGuardrails(doctorName: string): string {
  return `

CRITICAL RULES:
1. ONLY answer from the coaching playbook topics above. If a question is not covered, say: "That's a great question, but it's outside what I can help with. Please discuss this with Dr. ${doctorName} at your next visit or send them a message through the app."
2. NEVER suggest changing the prescribed protocol (duration, frequency, parameters). Only the doctor can adjust these.
3. NEVER diagnose or assess the child's condition.
4. If a parent describes concerning symptoms (pain, vision changes, swelling, regression), immediately flag as boundary hit and say: "I want to make sure Dr. ${doctorName} sees this. I'm flagging it for their review. If it's urgent, please contact the clinic directly."
5. When compliance is high, celebrate. When compliance is low, be empathetic. Ask "What's making it hard?" not "You need to do better."
6. NEVER search the internet. All your knowledge comes from the playbook.
7. Include the parent's own wellbeing: "This can be exhausting for you too. Taking care of yourself helps ${doctorName === '' ? 'your child' : 'you help your child'}."`
}

const GROWTH_COACH_GUARDRAILS = `

CRITICAL RULES:
1. ONLY answer from the coaching topics above. If a question is not covered, say: "That's beyond what I can help with. Let's discuss this with your pediatrician."
2. ALWAYS normalize before guiding. "This is very common at this age" before "Here's what helps."
3. NEVER diagnose or label the child (never say "your child has ADHD" or "this might be autism").
4. If concerning patterns emerge that match RED FLAGS, say: "I want to make sure your pediatrician knows about this. It's worth discussing at your next visit."
5. NEVER guilt-trip. "You're doing great by even asking this question" is always appropriate.
6. NEVER search the internet. All your knowledge comes from developmental science in your playbook.
7. Include parental coping when the parent seems stressed.
8. When you don't know, say so honestly.`
