/**
 * SKIDS Daily Insights — Personalized Insight Generator
 *
 * Every morning, a SKIDS parent sees personalized health insights about
 * HER child. Not generic parenting blogs. Not internet search results.
 * These insights come from the child's life record + clinical knowledge graph.
 *
 * The generator analyzes:
 * 1. What developmental windows are approaching? (milestone_watch)
 * 2. Which body systems haven't been observed recently? (observation_gap)
 * 3. Are there patterns in recent observations? (pattern_alert)
 * 4. What has the child achieved recently? (celebration)
 * 5. What's age-appropriate to know right now? (age_insight)
 * 6. Any screenings or vaccines due? (screening_due)
 * 7. How is growth trending? (growth_update)
 *
 * Each insight has a `deepQueryPrompt` — the question that opens chat
 * pre-seeded so the parent can go deeper.
 */

import type { LifeRecordContext } from '../life-record/types'
import type { DailyInsight, InsightGenerationContext, InsightType } from './types'
import { getPromptsForAge } from '../life-record/domain-prompts'

// ============================================
// PUBLIC API
// ============================================

/**
 * Generate 1-3 personalized daily insights for a child.
 * Uses the full life record context — no internet search, only the engine.
 */
export async function generateDailyInsights(
  context: LifeRecordContext,
  db: any,
  ai?: any
): Promise<DailyInsight[]> {
  // 1. Build the insight generation context from life record
  const genCtx = await buildInsightContext(context, db)

  // 2. Generate insights from each analysis
  const insights: DailyInsight[] = []

  // Milestone watches — highest value
  insights.push(...generateMilestoneWatches(genCtx))

  // Celebration — recently achieved milestones
  insights.push(...generateCelebrations(genCtx))

  // Observation gaps — domains that need attention
  insights.push(...generateGapInsights(genCtx))

  // Pattern alerts — repeated observations in same domain
  insights.push(...generatePatternAlerts(genCtx))

  // Screening/vaccination due
  insights.push(...generateScreeningInsights(genCtx))

  // Growth updates
  insights.push(...generateGrowthInsights(genCtx))

  // Growth track guidance — domain-specific developmental nurturing
  insights.push(...generateGrowthTrackInsights(genCtx))

  // Intervention progress — doctor-prescribed therapy updates
  insights.push(...generateInterventionInsights(genCtx))

  // Age insights — general age-appropriate guidance
  insights.push(...generateAgeInsights(genCtx))

  // 3. Sort by priority (lower = more important), take top 3
  insights.sort((a, b) => a.priority - b.priority)
  const topInsights = insights.slice(0, 3)

  // 4. If AI is available, enhance with warm language
  if (ai && topInsights.length > 0) {
    try {
      return await enhanceWithAI(topInsights, genCtx, ai)
    } catch (err) {
      console.error('[DailyInsights] AI enhancement failed, using template:', err)
    }
  }

  return topInsights
}

// ============================================
// CONTEXT BUILDER
// ============================================

async function buildInsightContext(
  ctx: LifeRecordContext,
  db: any
): Promise<InsightGenerationContext> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get observation domain distribution
  let recentDomains: string[] = []
  let gapDomains: string[] = []
  let patternDomains: Array<{ domain: string; count: number }> = []
  let recentAchievements: Array<{ key: string; title: string }> = []

  if (db) {
    try {
      // Recent observations with categories (last 30 days)
      const { results: recentObs } = await db.prepare(
        `SELECT category, COUNT(*) as cnt FROM parent_observations
         WHERE child_id = ? AND date >= ?
         GROUP BY category`
      ).bind(ctx.child.id, thirtyDaysAgo).all()

      recentDomains = (recentObs || []).map((r: any) => r.category).filter(Boolean)

      // Pattern: 3+ observations in same domain in 30 days
      patternDomains = (recentObs || [])
        .filter((r: any) => r.cnt >= 3)
        .map((r: any) => ({ domain: r.category, count: r.cnt }))

      // Find domains with NO observations in 90 days
      // Compare all known domains for this age against recent activity
      const agePrompts = getPromptsForAge(ctx.child.ageMonths)
      const activeDomains = new Set(recentDomains)
      const allRelevantDomains = [...new Set(agePrompts.map(p => p.domain))]

      // Check which domains had any observations ever
      const { results: allDomainObs } = await db.prepare(
        `SELECT DISTINCT category FROM parent_observations
         WHERE child_id = ? AND date >= ?`
      ).bind(ctx.child.id, ninetyDaysAgo).all()

      const recentlyObservedDomains = new Set(
        (allDomainObs || []).map((r: any) => r.category).filter(Boolean)
      )

      gapDomains = allRelevantDomains.filter(d => !recentlyObservedDomains.has(d))

      // Recently achieved milestones (last 7 days)
      const { results: achievements } = await db.prepare(
        `SELECT milestone_key, title FROM milestones
         WHERE child_id = ? AND status = 'achieved' AND updated_at >= ?
         ORDER BY updated_at DESC LIMIT 5`
      ).bind(ctx.child.id, sevenDaysAgo).all()

      recentAchievements = (achievements || []).map((m: any) => ({
        key: m.milestone_key,
        title: m.title,
      }))
    } catch (err) {
      console.error('[DailyInsights] DB query error:', err)
    }
  }

  // Approaching milestones: not yet achieved, within 2 months of expected window
  const approachingMilestones = ctx.milestones.notStarted
    .filter(m => m.expectedAgeMax > 0 && m.expectedAgeMax - ctx.child.ageMonths <= 2 && m.expectedAgeMax >= ctx.child.ageMonths)

  // Growth tracks for this age
  let activeGrowthTracks: Array<{ domain: string; title: string; keyMessage?: string; flaggedForPed: number }> = []
  if (db) {
    try {
      const { results: tracks } = await db.prepare(
        `SELECT gt.domain, gt.title, gt.key_message, COALESCE(gtp.flagged_for_ped, 0) as flagged_for_ped
         FROM growth_tracks gt
         LEFT JOIN growth_track_progress gtp ON gt.id = gtp.track_id AND gtp.child_id = ?
         WHERE gt.age_min_months <= ? AND gt.age_max_months >= ?
         LIMIT 8`
      ).bind(ctx.child.id, ctx.child.ageMonths, ctx.child.ageMonths).all()

      activeGrowthTracks = (tracks || []).map((t: any) => ({
        domain: t.domain,
        title: t.title,
        keyMessage: t.key_message || undefined,
        flaggedForPed: t.flagged_for_ped || 0,
      }))
    } catch { /* ignore */ }
  }

  // Active interventions with compliance
  let activeInterventions: Array<{ protocolName: string; category: string; conditionName?: string; compliancePct?: number; currentStreak: number }> = []
  if (db) {
    try {
      const { results: interventions } = await db.prepare(
        `SELECT ip.name as protocol_name, ip.category, ip.condition_name, s.compliance_pct, s.current_streak
         FROM intervention_assignments ia
         JOIN intervention_protocols ip ON ia.intervention_protocol_id = ip.id
         LEFT JOIN intervention_streaks s ON s.assignment_id = ia.id
         WHERE ia.child_id = ? AND ia.status = 'active'`
      ).bind(ctx.child.id).all()

      activeInterventions = (interventions || []).map((i: any) => ({
        protocolName: i.protocol_name,
        category: i.category,
        conditionName: i.condition_name || undefined,
        compliancePct: i.compliance_pct ?? undefined,
        currentStreak: i.current_streak || 0,
      }))
    } catch { /* ignore */ }
  }

  return {
    childName: ctx.child.name,
    ageMonths: ctx.child.ageMonths,
    gender: ctx.child.gender,
    recentDomains,
    gapDomains,
    patternDomains,
    approachingMilestones,
    recentAchievements,
    overdueVaccinations: ctx.vaccinations.overdue,
    growthTrend: ctx.growth.percentileCrossing,
    activeConditions: ctx.activeConditions,
    isPreterm: (ctx.birthHistory.gestationalWeeks || 40) < 37,
    hadNicuStay: !!ctx.birthHistory.nicuStay,
    delayedMilestones: ctx.milestones.delayed,
    activeGrowthTracks,
    activeInterventions,
  }
}

// ============================================
// INSIGHT GENERATORS
// ============================================

function generateMilestoneWatches(ctx: InsightGenerationContext): DailyInsight[] {
  if (ctx.approachingMilestones.length === 0) return []

  const milestone = ctx.approachingMilestones[0]
  const monthsLeft = milestone.expectedAgeMax - ctx.ageMonths
  const timeText = monthsLeft <= 0 ? 'right now' : monthsLeft === 1 ? 'in the next month' : `in the next ${monthsLeft} months`

  const categoryEmoji = CATEGORY_EMOJI[milestone.category] || '🎯'
  const domainName = DOMAIN_DISPLAY[milestone.category] || milestone.category

  return [{
    id: `mw_${milestone.key}_${today()}`,
    type: 'milestone_watch',
    title: `${domainName} milestone approaching`,
    body: `${ctx.childName} is entering the window for "${milestone.key}" ${timeText}. This is a great time to watch for progress and encourage development in this area.`,
    deepQueryPrompt: `What should I watch for with ${ctx.childName}'s ${milestone.category} development at ${ctx.ageMonths} months? The "${milestone.key}" milestone is expected soon.`,
    domain: milestone.category,
    priority: 1,
    emoji: categoryEmoji,
  }]
}

function generateCelebrations(ctx: InsightGenerationContext): DailyInsight[] {
  if (ctx.recentAchievements.length === 0) return []

  const achievement = ctx.recentAchievements[0]

  return [{
    id: `cel_${achievement.key}_${today()}`,
    type: 'celebration',
    title: `${ctx.childName} hit a milestone!`,
    body: `"${achievement.title}" — what a great achievement! Every milestone matters, and ${ctx.childName} is making wonderful progress.`,
    deepQueryPrompt: `${ctx.childName} just achieved "${achievement.title}". What milestone should I look for next? What's coming up in development?`,
    domain: 'general',
    priority: 1,
    emoji: '🎉',
  }]
}

function generateGapInsights(ctx: InsightGenerationContext): DailyInsight[] {
  if (ctx.gapDomains.length === 0) return []

  // Pick the most clinically relevant gap domain
  const priorityOrder = ['vision', 'hearing', 'language', 'motor', 'neurological', 'growth', 'behavioral']
  const gapDomain = priorityOrder.find(d => ctx.gapDomains.includes(d)) || ctx.gapDomains[0]
  const domainName = DOMAIN_DISPLAY[gapDomain] || gapDomain

  return [{
    id: `gap_${gapDomain}_${today()}`,
    type: 'observation_gap',
    title: `How is ${ctx.childName}'s ${domainName.toLowerCase()}?`,
    body: `It's been a while since we've had any notes about ${ctx.childName}'s ${domainName.toLowerCase()}. At ${formatAge(ctx.ageMonths)}, this is an important area to keep an eye on.`,
    deepQueryPrompt: `What should I be watching for in ${ctx.childName}'s ${domainName.toLowerCase()} development at ${formatAge(ctx.ageMonths)}?`,
    domain: gapDomain,
    priority: 2,
    emoji: DOMAIN_EMOJI[gapDomain] || '👁',
  }]
}

function generatePatternAlerts(ctx: InsightGenerationContext): DailyInsight[] {
  if (ctx.patternDomains.length === 0) return []

  const pattern = ctx.patternDomains[0]
  const domainName = DOMAIN_DISPLAY[pattern.domain] || pattern.domain

  return [{
    id: `pat_${pattern.domain}_${today()}`,
    type: 'pattern_alert',
    title: `${pattern.count} ${domainName.toLowerCase()} observations this month`,
    body: `You've been noting things about ${ctx.childName}'s ${domainName.toLowerCase()} frequently. This is worth discussing with your pediatrician at the next visit.`,
    deepQueryPrompt: `I've had ${pattern.count} observations about ${ctx.childName}'s ${domainName.toLowerCase()} this month. Should I be concerned? What should I discuss with the doctor?`,
    domain: pattern.domain,
    priority: 2,
    emoji: '📊',
  }]
}

function generateScreeningInsights(ctx: InsightGenerationContext): DailyInsight[] {
  const insights: DailyInsight[] = []

  // Overdue vaccinations
  if (ctx.overdueVaccinations.length > 0) {
    insights.push({
      id: `vax_overdue_${today()}`,
      type: 'screening_due',
      title: `Vaccination reminder`,
      body: `${ctx.childName} has ${ctx.overdueVaccinations.length} overdue vaccination${ctx.overdueVaccinations.length > 1 ? 's' : ''}: ${ctx.overdueVaccinations.slice(0, 2).join(', ')}${ctx.overdueVaccinations.length > 2 ? '...' : ''}. Schedule a visit with your pediatrician.`,
      deepQueryPrompt: `${ctx.childName} has overdue vaccinations: ${ctx.overdueVaccinations.join(', ')}. Tell me about these vaccines and when to get them.`,
      domain: 'immunological',
      priority: 1,
      emoji: '💉',
    })
  }

  // Age-based screening reminders
  const screeningDue = getScreeningDue(ctx.ageMonths)
  if (screeningDue) {
    insights.push({
      id: `scr_${screeningDue.type}_${today()}`,
      type: 'screening_due',
      title: screeningDue.title,
      body: screeningDue.body.replace('{name}', ctx.childName),
      deepQueryPrompt: screeningDue.deepQuery.replace('{name}', ctx.childName),
      domain: screeningDue.domain,
      priority: 2,
      emoji: '🩺',
    })
  }

  return insights
}

function generateGrowthInsights(ctx: InsightGenerationContext): DailyInsight[] {
  if (!ctx.growthTrend) return []

  if (ctx.growthTrend === 'stable') {
    return [{
      id: `growth_stable_${today()}`,
      type: 'growth_update',
      title: `${ctx.childName}'s growth is on track`,
      body: `Growth is tracking stably on the percentile curve — that's great news! Keep up the regular measurements at your pediatrician visits.`,
      deepQueryPrompt: `${ctx.childName}'s growth is stable. What growth milestones should I expect at ${formatAge(ctx.ageMonths)}?`,
      domain: 'growth',
      priority: 4,
      emoji: '📏',
    }]
  }

  if (ctx.growthTrend === 'downward') {
    return [{
      id: `growth_down_${today()}`,
      type: 'growth_update',
      title: `Growth trend to watch`,
      body: `${ctx.childName}'s growth measurements show a downward crossing pattern. This is worth discussing with your pediatrician — it's often normal but should be monitored.`,
      deepQueryPrompt: `${ctx.childName}'s growth is crossing percentiles downward. What could cause this and what should I discuss with the doctor?`,
      domain: 'growth',
      priority: 2,
      emoji: '📉',
    }]
  }

  return []
}

function generateAgeInsights(ctx: InsightGenerationContext): DailyInsight[] {
  const insight = AGE_INSIGHTS.find(
    a => ctx.ageMonths >= a.ageMin && ctx.ageMonths <= a.ageMax
  )
  if (!insight) return []

  return [{
    id: `age_${insight.key}_${today()}`,
    type: 'age_insight',
    title: insight.title.replace('{name}', ctx.childName),
    body: insight.body.replace('{name}', ctx.childName).replace('{age}', formatAge(ctx.ageMonths)),
    deepQueryPrompt: insight.deepQuery.replace('{name}', ctx.childName).replace('{age}', formatAge(ctx.ageMonths)),
    domain: insight.domain,
    priority: 3,
    emoji: insight.emoji,
  }]
}

function generateGrowthTrackInsights(ctx: InsightGenerationContext): DailyInsight[] {
  if (!ctx.activeGrowthTracks || ctx.activeGrowthTracks.length === 0) return []

  // Prioritize flagged tracks, then pick one with a key message
  const flagged = ctx.activeGrowthTracks.find(t => t.flaggedForPed > 0)
  if (flagged) {
    const domainName = DOMAIN_DISPLAY[flagged.domain] || flagged.domain
    return [{
      id: `gt_flag_${flagged.domain}_${today()}`,
      type: 'pattern_alert',
      title: `${domainName} needs attention`,
      body: `${ctx.childName}'s ${domainName.toLowerCase()} track has been flagged. This is worth discussing with your pediatrician at the next visit.`,
      deepQueryPrompt: `${ctx.childName}'s ${domainName.toLowerCase()} growth track has been flagged for the pediatrician. What should I ask about?`,
      domain: flagged.domain,
      priority: 2,
      emoji: '🚩',
    }]
  }

  // Otherwise, surface a growth track tip
  const track = ctx.activeGrowthTracks.find(t => t.keyMessage) || ctx.activeGrowthTracks[0]
  if (!track) return []

  const domainName = DOMAIN_DISPLAY[track.domain] || track.domain
  return [{
    id: `gt_tip_${track.domain}_${today()}`,
    type: 'age_insight',
    title: track.title || `${domainName} guidance`,
    body: track.keyMessage || `${ctx.childName} is in the ${track.title} phase. This is a great time to focus on ${domainName.toLowerCase()} development.`,
    deepQueryPrompt: `Tell me more about ${ctx.childName}'s ${domainName.toLowerCase()} development at ${formatAge(ctx.ageMonths)}. What should I focus on?`,
    domain: track.domain,
    priority: 3,
    emoji: DOMAIN_EMOJI[track.domain] || '🌱',
  }]
}

function generateInterventionInsights(ctx: InsightGenerationContext): DailyInsight[] {
  if (!ctx.activeInterventions || ctx.activeInterventions.length === 0) return []

  const insights: DailyInsight[] = []

  // High compliance celebration
  const highComp = ctx.activeInterventions.find(i => i.compliancePct !== undefined && i.compliancePct >= 80 && i.currentStreak >= 3)
  if (highComp) {
    insights.push({
      id: `intv_streak_${highComp.category}_${today()}`,
      type: 'celebration',
      title: `Great job with ${highComp.protocolName}!`,
      body: `${ctx.childName}'s ${highComp.protocolName} compliance is at ${Math.round(highComp.compliancePct!)}% with a ${highComp.currentStreak}-day streak. Consistency is key — keep it up!`,
      deepQueryPrompt: `${ctx.childName} is doing well with ${highComp.protocolName}. What progress should I expect to see?`,
      domain: highComp.category,
      priority: 3,
      emoji: '🌟',
    })
  }

  // Low compliance encouragement (not shame)
  const lowComp = ctx.activeInterventions.find(i => i.compliancePct !== undefined && i.compliancePct < 50)
  if (lowComp) {
    insights.push({
      id: `intv_low_${lowComp.category}_${today()}`,
      type: 'pattern_alert',
      title: `${lowComp.protocolName} — every bit helps`,
      body: `${ctx.childName}'s ${lowComp.protocolName} has been tricky to keep up with. That's okay — even partial effort matters. Try one task today.`,
      deepQueryPrompt: `I'm struggling with ${ctx.childName}'s ${lowComp.protocolName} therapy. What are some tips to make it easier to stick with?`,
      domain: lowComp.category,
      priority: 2,
      emoji: '💪',
    })
  }

  return insights.slice(0, 1) // Max 1 intervention insight per day
}

// ============================================
// AI ENHANCEMENT
// ============================================

async function enhanceWithAI(
  insights: DailyInsight[],
  ctx: InsightGenerationContext,
  ai: any
): Promise<DailyInsight[]> {
  const insightDescriptions = insights.map((i, idx) =>
    `Insight ${idx + 1} (${i.type}): Title: "${i.title}" Body: "${i.body}"`
  ).join('\n')

  const systemPrompt = `You are the SKIDS Guide, a warm and knowledgeable child health knowledge companion for parents.
You are rewriting daily insight cards for ${ctx.childName} (${formatAge(ctx.ageMonths)}, ${ctx.gender}).

RULES:
- Keep the same meaning and type for each insight
- Make the language warm, encouraging, and parent-friendly
- Use ${ctx.childName}'s name naturally
- Keep titles under 50 characters
- Keep body text to 2-3 sentences max
- Never use clinical jargon
- Never diagnose or alarm — guide and encourage
- Return ONLY valid JSON array`

  const userPrompt = `Rewrite these ${insights.length} insight cards to be warmer and more natural:

${insightDescriptions}

Return a JSON array with objects: [{"title": "...", "body": "..."}, ...]`

  try {
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 512,
    })

    const text = response.response || ''
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const enhanced = JSON.parse(jsonMatch[0])
      return insights.map((insight, idx) => ({
        ...insight,
        title: enhanced[idx]?.title || insight.title,
        body: enhanced[idx]?.body || insight.body,
      }))
    }
  } catch (err) {
    console.error('[DailyInsights] AI enhancement parse error:', err)
  }

  return insights
}

// ============================================
// AGE-BASED INSIGHTS DATABASE
// ============================================

const AGE_INSIGHTS: Array<{
  key: string
  ageMin: number
  ageMax: number
  title: string
  body: string
  deepQuery: string
  domain: string
  emoji: string
}> = [
  {
    key: 'newborn_bonding', ageMin: 0, ageMax: 1,
    title: 'Bonding with {name}',
    body: 'Skin-to-skin contact, eye gazing, and responding to {name}\'s cries all build strong neural connections. At {age}, every interaction is brain-building.',
    deepQuery: 'What are the best bonding activities for {name} at {age}? How does bonding affect brain development?',
    domain: 'behavioral', emoji: '💕',
  },
  {
    key: 'social_smile', ageMin: 1, ageMax: 3,
    title: '{name}\'s social smile window',
    body: 'Between 6-12 weeks, babies develop their social smile — a real, responsive smile to faces. Watch for {name} lighting up when they see you!',
    deepQuery: 'When should {name} start social smiling? What if the social smile seems delayed?',
    domain: 'behavioral', emoji: '😊',
  },
  {
    key: 'tummy_time', ageMin: 1, ageMax: 4,
    title: 'Tummy time for {name}',
    body: 'At {age}, supervised tummy time builds neck and core strength — the foundation for sitting, crawling, and walking. Even 3-5 minutes several times a day helps.',
    deepQuery: 'How much tummy time does {name} need at {age}? What if {name} hates tummy time?',
    domain: 'motor', emoji: '🏋️',
  },
  {
    key: 'object_tracking', ageMin: 2, ageMax: 4,
    title: '{name}\'s vision is developing',
    body: 'At {age}, {name} should be tracking objects with their eyes and showing interest in faces. Try slowly moving a toy across their line of sight.',
    deepQuery: 'What vision milestones should {name} hit at {age}? How can I check {name}\'s vision at home?',
    domain: 'vision', emoji: '👁',
  },
  {
    key: 'babbling', ageMin: 4, ageMax: 7,
    title: '{name}\'s babbling stage',
    body: 'Between 4-7 months, babies start babbling — "ba ba", "da da", "ma ma" are all early language building blocks. Talk back to {name} and watch the "conversation" develop!',
    deepQuery: 'What babbling sounds should {name} be making at {age}? How can I encourage language development?',
    domain: 'language', emoji: '🗣',
  },
  {
    key: 'solid_foods', ageMin: 5, ageMax: 7,
    title: 'Starting solids with {name}',
    body: 'At {age}, {name} may be ready for solid foods if they can sit with support and show interest in food. Start with iron-rich foods — it\'s a critical nutrient now.',
    deepQuery: 'Is {name} ready for solid foods at {age}? What are the best first foods and how do I start?',
    domain: 'gi_nutrition', emoji: '🍽',
  },
  {
    key: 'stranger_anxiety', ageMin: 7, ageMax: 10,
    title: 'Stranger awareness is normal',
    body: 'If {name} has started getting clingy or crying with unfamiliar people, that\'s a healthy sign — it means {name} has formed strong attachments. This phase passes naturally.',
    deepQuery: 'Why does {name} get upset around strangers at {age}? Is this normal and how should I handle it?',
    domain: 'emotional', emoji: '🤗',
  },
  {
    key: 'cruising', ageMin: 9, ageMax: 12,
    title: '{name} is getting mobile!',
    body: 'Between 9-12 months, babies start pulling up and "cruising" along furniture. Time to baby-proof if you haven\'t yet! Each child has their own timeline for walking.',
    deepQuery: 'What movement milestones should {name} hit at {age}? When should I expect walking?',
    domain: 'motor', emoji: '🚶',
  },
  {
    key: 'first_words', ageMin: 11, ageMax: 15,
    title: 'First words window for {name}',
    body: 'Most children say their first meaningful word between 11-14 months. {name} may already be using gestures like pointing and waving — these count as communication too!',
    deepQuery: 'When should {name} say first words? What counts as a "word" and how can I encourage speech?',
    domain: 'language', emoji: '💬',
  },
  {
    key: 'parallel_play', ageMin: 18, ageMax: 24,
    title: '{name} and playing alongside others',
    body: 'At {age}, {name} is in the "parallel play" stage — playing next to other children rather than with them. This is completely normal and is building social skills.',
    deepQuery: 'What social development should I expect from {name} at {age}? How do toddlers learn to play with others?',
    domain: 'behavioral', emoji: '🧸',
  },
  {
    key: 'two_word_phrases', ageMin: 18, ageMax: 26,
    title: '{name}\'s language is exploding',
    body: 'Between 18-24 months, vocabulary grows rapidly and two-word phrases emerge — "more milk", "daddy go". Talk to {name} constantly — narrate your day!',
    deepQuery: 'How many words should {name} have at {age}? When should two-word phrases start?',
    domain: 'language', emoji: '📖',
  },
  {
    key: 'toilet_readiness', ageMin: 24, ageMax: 36,
    title: 'Toilet training readiness',
    body: 'There\'s no rush! {name} may show signs of readiness: staying dry for 2+ hours, showing interest in the toilet, or telling you when they need to go. Follow {name}\'s lead.',
    deepQuery: 'Is {name} ready for toilet training at {age}? What are the signs of readiness and best approach?',
    domain: 'behavioral', emoji: '🚽',
  },
  {
    key: 'preschool_social', ageMin: 36, ageMax: 48,
    title: '{name}\'s social world is growing',
    body: 'At {age}, {name} is learning to share, take turns, and make friends. Some conflict is normal — it\'s how they learn. Cooperative play is the exciting next stage.',
    deepQuery: 'What social skills should {name} have at {age}? How can I help with sharing and friendships?',
    domain: 'behavioral', emoji: '👫',
  },
  {
    key: 'school_readiness', ageMin: 48, ageMax: 66,
    title: 'Preparing {name} for school',
    body: 'School readiness is more than ABCs — it\'s about self-regulation, following instructions, and being curious. At {age}, {name} is building these skills through play.',
    deepQuery: 'Is {name} ready for school? What skills beyond academics matter for school readiness at {age}?',
    domain: 'cognitive', emoji: '🎒',
  },
  {
    key: 'reading_fluency', ageMin: 66, ageMax: 96,
    title: '{name}\'s reading journey',
    body: 'At {age}, reading shifts from "learning to read" to "reading to learn." Encourage {name} to read what they love — comics, science books, adventure stories — all reading counts!',
    deepQuery: 'How should {name}\'s reading be developing at {age}? What if {name} struggles with reading?',
    domain: 'cognitive', emoji: '📚',
  },
  {
    key: 'puberty_awareness', ageMin: 96, ageMax: 132,
    title: 'Early puberty awareness',
    body: 'Puberty can start as early as 8 in girls and 9 in boys. At {age}, it\'s helpful to have age-appropriate conversations about body changes with {name}.',
    deepQuery: 'When should I expect puberty for {name}? What are the first signs and how should I talk about it?',
    domain: 'endocrine', emoji: '🌱',
  },
  {
    key: 'teen_mental_health', ageMin: 132, ageMax: 216,
    title: '{name}\'s emotional wellbeing',
    body: 'Adolescence brings big emotions. Check in with {name} regularly about how they\'re feeling — not just school performance. Your connection is their anchor.',
    deepQuery: 'How can I support {name}\'s mental health during adolescence? What signs should I watch for?',
    domain: 'emotional', emoji: '💙',
  },
]

// ============================================
// SCREENING DUE REMINDERS
// ============================================

interface ScreeningReminder {
  type: string
  title: string
  body: string
  deepQuery: string
  domain: string
}

function getScreeningDue(ageMonths: number): ScreeningReminder | null {
  // Key screening ages from IAP/AAP guidelines
  const screenings: Array<{ ageMin: number; ageMax: number } & ScreeningReminder> = [
    {
      ageMin: 9, ageMax: 11, type: 'dev_screen_9',
      title: 'Developmental screening due',
      body: 'At 9-12 months, a developmental screening is recommended for {name}. This quick assessment helps catch any delays early when intervention is most effective.',
      deepQuery: 'What happens in a 9-month developmental screening for {name}? What will they check?',
      domain: 'general',
    },
    {
      ageMin: 17, ageMax: 19, type: 'dev_screen_18',
      title: 'Developmental screening due',
      body: '18-month screening is one of the most important — it includes autism screening (M-CHAT). This is a routine check that gives peace of mind or early access to support.',
      deepQuery: 'What is the 18-month developmental screening? What does the autism screening (M-CHAT) involve for {name}?',
      domain: 'general',
    },
    {
      ageMin: 23, ageMax: 25, type: 'dev_screen_24',
      title: 'Two-year developmental check',
      body: 'At 2 years, {name} should have a comprehensive developmental screening. This checks language, motor, social, and cognitive development.',
      deepQuery: 'What should {name}\'s 2-year developmental screening cover? What milestones are they checking?',
      domain: 'general',
    },
    {
      ageMin: 35, ageMax: 37, type: 'vision_screen_3',
      title: 'Vision screening time',
      body: 'Age 3 is the recommended time for {name}\'s first formal vision screening. Early detection of vision issues like amblyopia is critical — treatment is most effective before age 6.',
      deepQuery: 'Why is vision screening important at age 3? What should I watch for in {name}\'s vision?',
      domain: 'vision',
    },
    {
      ageMin: 47, ageMax: 49, type: 'school_readiness_4',
      title: 'Pre-school health check',
      body: 'Before starting school, {name} should have vision, hearing, and dental checks. These ensure {name} can see the board, hear the teacher, and focus on learning.',
      deepQuery: 'What health checks does {name} need before starting school? What should the pre-school assessment include?',
      domain: 'general',
    },
  ]

  return screenings.find(s => ageMonths >= s.ageMin && ageMonths <= s.ageMax) || null
}

// ============================================
// DISPLAY HELPERS
// ============================================

const DOMAIN_DISPLAY: Record<string, string> = {
  motor: 'Movement', vision: 'Vision', hearing: 'Hearing',
  language: 'Speech & Language', neurological: 'Neurological',
  behavioral: 'Behavior', emotional: 'Emotional',
  cognitive: 'Learning', growth: 'Growth', skin: 'Skin',
  gi_nutrition: 'Eating & Nutrition', respiratory: 'Breathing',
  cardiac: 'Heart', dental: 'Dental', musculoskeletal: 'Bones & Joints',
  immunological: 'Immune', endocrine: 'Hormones', urogenital: 'Urogenital',
  general: 'General Health',
}

const DOMAIN_EMOJI: Record<string, string> = {
  motor: '🏃', vision: '👁', hearing: '👂', language: '🗣',
  neurological: '🧠', behavioral: '😊', emotional: '💙',
  cognitive: '🧩', growth: '📏', skin: '🩹', gi_nutrition: '🍽',
  respiratory: '🫁', cardiac: '❤️', dental: '🦷', musculoskeletal: '🦴',
  immunological: '🛡', endocrine: '🌡', urogenital: '🩺', general: '✨',
}

const CATEGORY_EMOJI: Record<string, string> = {
  motor: '🏃', language: '🗣', social: '👫', cognitive: '🧩',
  self_care: '🧸', emotional: '💙', sensory: '👁',
}

function formatAge(months: number): string {
  if (months < 1) return 'newborn'
  if (months === 1) return '1 month'
  if (months < 12) return `${months} months`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return years === 1 ? '1 year' : `${years} years`
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}
