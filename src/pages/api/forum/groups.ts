// Forum groups API
export const prerender = false

import type { APIContext } from 'astro'
import { drizzle } from 'drizzle-orm/d1'
import { forumGroups } from '@/lib/db/schema'

// Seed data for forum groups
const DEFAULT_GROUPS = [
  // Age-based
  { id: 'age-0-6m', name: '0–6 Months', type: 'age-based' as const, emoji: '👶', description: 'Newborn care, feeding, sleep, and early development' },
  { id: 'age-6-12m', name: '6–12 Months', type: 'age-based' as const, emoji: '🍼', description: 'Solids, crawling, first words, and milestones' },
  { id: 'age-1-2y', name: '1–2 Years', type: 'age-based' as const, emoji: '🚶', description: 'Walking, talking, toddler tantrums, and nutrition' },
  { id: 'age-2-5y', name: '2–5 Years', type: 'age-based' as const, emoji: '🎨', description: 'Preschool, potty training, social skills, and play' },
  { id: 'age-5plus', name: '5+ Years', type: 'age-based' as const, emoji: '📚', description: 'School readiness, learning, sports, and screen time' },
  // Topic-based
  { id: 'topic-nutrition', name: 'Nutrition & Feeding', type: 'topic-based' as const, emoji: '🥗', description: 'Healthy eating, picky eaters, Indian meal plans' },
  { id: 'topic-sleep', name: 'Sleep', type: 'topic-based' as const, emoji: '😴', description: 'Sleep schedules, night waking, and sleep training' },
  { id: 'topic-development', name: 'Development', type: 'topic-based' as const, emoji: '🧠', description: 'Milestones, speech, motor skills, and learning' },
  { id: 'topic-behavior', name: 'Behavior', type: 'topic-based' as const, emoji: '💬', description: 'Tantrums, discipline, screen time, and emotions' },
  { id: 'topic-health', name: 'Health & Illness', type: 'topic-based' as const, emoji: '🏥', description: 'Common illnesses, vaccines, and when to see a doctor' },
]

export async function GET({ locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const db = drizzle(env.DB)

  try {
    let groups = await db.select().from(forumGroups).all()

    // Seed default groups if empty
    if (groups.length === 0) {
      await db.insert(forumGroups).values(
        DEFAULT_GROUPS.map(g => ({
          ...g,
          memberCount: 0,
          postCount: 0,
        }))
      )
      groups = await db.select().from(forumGroups).all()
    }

    return new Response(JSON.stringify({ groups }))
  } catch (error) {
    console.error('Forum groups error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch groups' }), { status: 500 })
  }
}
