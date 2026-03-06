/**
 * Topic detection + content retrieval for in-context RAG.
 * Detects what the user is asking about, then loads relevant
 * content chunks from the app's content library.
 */

import { MILESTONES, getMilestonesForAge } from '@/lib/content/milestones'
import { ORGANS } from '@/lib/content/organs'
import { HABITS } from '@/lib/content/habits'
import { SERVICES } from '@/lib/content/services'

// ─── Topic keyword map ───────────────────────────────────

const TOPIC_KEYWORDS: Record<string, string[]> = {
  speech: ['talk', 'speak', 'word', 'speech', 'language', 'babbl', 'stutter', 'verbal', 'sentence', 'vocabulary'],
  motor: ['walk', 'crawl', 'sit', 'stand', 'run', 'jump', 'climb', 'balance', 'motor', 'movement', 'coordination', 'fine motor', 'gross motor'],
  cognitive: ['think', 'learn', 'puzzle', 'memory', 'attention', 'focus', 'count', 'sort', 'pretend', 'play', 'cognitive', 'smart', 'intelligent'],
  social: ['friend', 'share', 'turn', 'empathy', 'emotion', 'feeling', 'tantrum', 'behavior', 'social', 'anxiety', 'shy', 'aggress'],
  nutrition: ['food', 'eat', 'nutrition', 'diet', 'picky', 'appetite', 'vitamin', 'iron', 'protein', 'breastfeed', 'formula', 'weaning'],
  sleep: ['sleep', 'bed', 'nap', 'night', 'wake', 'insomnia', 'dream', 'snore', 'routine'],
  growth: ['height', 'weight', 'grow', 'short', 'tall', 'thin', 'overweight', 'bmi', 'percentile', 'growth chart'],
  screen: ['screen', 'phone', 'tablet', 'tv', 'video', 'gaming', 'digital', 'gadget'],
  vision: ['eye', 'vision', 'see', 'sight', 'glasses', 'myopia', 'squint', 'screen time'],
  brain: ['brain', 'neural', 'neuro', 'mind', 'cognitive', 'iq'],
  milestone: ['milestone', 'on track', 'delay', 'behind', 'ahead', 'normal', 'expected', 'should my child'],
  concern: ['worry', 'concern', 'problem', 'issue', 'trouble', 'scared', 'autism', 'adhd', 'delay', 'red flag', 'warning sign'],
  habit: ['habit', 'routine', 'daily', 'schedule', 'habits'],
  service: ['doctor', 'consult', 'therapy', 'screening', 'assessment', 'appointment', 'session', 'test'],
}

/** Detect which topics a question relates to */
export function detectTopics(question: string): string[] {
  const lower = question.toLowerCase()
  const topics: string[] = []

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      topics.push(topic)
    }
  }

  // If no topics detected, return general
  return topics.length > 0 ? topics : ['general']
}

/** Get relevant content chunks based on detected topics and child age */
export function getRelevantContent(topics: string[], childAgeMonths?: number): string {
  const chunks: string[] = []

  // Milestone content
  if (topics.some((t) => ['milestone', 'motor', 'speech', 'cognitive', 'social', 'concern', 'general'].includes(t))) {
    const milestones = childAgeMonths != null
      ? getMilestonesForAge(childAgeMonths)
      : MILESTONES.slice(0, 15) // first 15 if no age

    // Filter by specific category if topic is narrow
    let filtered = milestones
    if (topics.includes('motor') && !topics.includes('milestone')) {
      filtered = milestones.filter((m) => m.category === 'motor')
    } else if (topics.includes('speech')) {
      filtered = milestones.filter((m) => m.category === 'language')
    } else if (topics.includes('cognitive')) {
      filtered = milestones.filter((m) => m.category === 'cognitive')
    } else if (topics.includes('social')) {
      filtered = milestones.filter((m) => m.category === 'social')
    }

    if (filtered.length > 0) {
      const ageLabel = childAgeMonths != null ? ` (child is ${childAgeMonths} months old)` : ''
      chunks.push(
        `DEVELOPMENTAL MILESTONES${ageLabel}:\n` +
        filtered.map((m) => `- ${m.title} (${m.category}, ${m.expectedAgeMin}-${m.expectedAgeMax} months): ${m.description}`).join('\n')
      )
    }
  }

  // Organ content
  if (topics.some((t) => ['brain', 'vision', 'growth', 'nutrition', 'sleep', 'general'].includes(t))) {
    const relevantOrgans = ORGANS.filter((o) => {
      if (topics.includes('brain')) return ['brain', 'learning'].includes(o.slug)
      if (topics.includes('vision')) return ['eyes', 'senses'].includes(o.slug)
      if (topics.includes('nutrition')) return ['digestive'].includes(o.slug)
      if (topics.includes('sleep')) return ['hormones', 'brain'].includes(o.slug)
      if (topics.includes('growth')) return ['hormones', 'muscles'].includes(o.slug)
      return false
    })

    if (relevantOrgans.length > 0) {
      chunks.push(
        'ORGAN & BODY KNOWLEDGE:\n' +
        relevantOrgans.map((o) => `- ${o.name}: ${o.description} Fun fact: ${o.wonderFact}`).join('\n')
      )
    }
  }

  // Habit content
  if (topics.some((t) => ['habit', 'nutrition', 'sleep', 'screen', 'motor'].includes(t))) {
    const relevantHabits = HABITS.filter((h) => {
      if (topics.includes('nutrition')) return h.key === 'healthy_eating'
      if (topics.includes('sleep')) return h.key === 'sufficient_sleep'
      if (topics.includes('screen')) return h.key === 'timekeepers'
      if (topics.includes('motor')) return h.key === 'active_movement'
      return true // show all for generic 'habit' topic
    })

    chunks.push(
      'HABITS FRAMEWORK (H.A.B.I.T.S.):\n' +
      relevantHabits.map((h) => `- ${h.letter} = ${h.name}: ${h.description} Tip: ${h.tip}`).join('\n')
    )
  }

  // Service recommendations
  if (topics.some((t) => ['service', 'concern', 'vision', 'speech'].includes(t))) {
    const relevantServices = SERVICES.filter((s) => {
      if (topics.includes('vision')) return s.category === 'vision'
      if (topics.includes('speech')) return ['therapy'].includes(s.category) && s.slug.includes('speech')
      if (topics.includes('concern')) return ['behavioral', 'consultation'].includes(s.category)
      return true
    }).slice(0, 4)

    if (relevantServices.length > 0) {
      chunks.push(
        'AVAILABLE SKIDS SERVICES:\n' +
        relevantServices.map((s) => `- ${s.name} (${s.priceLabel}, ${s.deliveryLabel}): ${s.description}`).join('\n')
      )
    }
  }

  return chunks.join('\n\n')
}
