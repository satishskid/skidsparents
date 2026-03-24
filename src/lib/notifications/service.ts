import type { D1Database } from '@cloudflare/workers-types'
import type { NotificationType } from '@/lib/db/schema'
import { sendPush } from '@/lib/notifications/push'

// ─── Types ─────────────────────────────────────────────

export interface NotificationInput {
  parentId: string
  childId: string
  type: NotificationType
  title: string
  body: string
  actionUrl: string
  dataJson: Record<string, unknown>
  env?: { DB: D1Database; FIREBASE_ADMIN_KEY?: string; ADMIN_KEY?: string }
}

interface ChildRow {
  id: string
  name: string
  dob: string
}

interface ChildWithAge extends ChildRow {
  ageMonths: number
}

// ─── Utility Functions ─────────────────────────────────

/**
 * Builds a stable colon-separated deduplication key.
 * e.g. buildDedupeKey('milestone', 'first_words') → 'milestone:first_words'
 *      buildDedupeKey('habit_streak', 'active_movement', '7') → 'habit_streak:active_movement:7'
 */
export function buildDedupeKey(triggerType: string, ...parts: string[]): string {
  return [triggerType, ...parts].join(':')
}

/**
 * Maps age in months to a developmental stage string.
 * 0–11   → 'infant'
 * 12–35  → 'toddler'
 * 36–71  → 'preschooler'
 * 72–143 → 'school-age'
 * 144+   → 'adolescent'
 */
export function getAgeStage(ageMonths: number): string {
  if (ageMonths < 12) return 'infant'
  if (ageMonths < 36) return 'toddler'
  if (ageMonths < 72) return 'preschooler'
  if (ageMonths < 144) return 'school-age'
  return 'adolescent'
}

export const HABIT_LABELS: Record<string, string> = {
  healthy_eating: 'Healthy Eating',
  active_movement: 'Active Movement',
  balanced_stress: 'Balanced Stress',
  inner_coaching: 'Inner Coaching',
  timekeepers: 'Timekeepers',
  sufficient_sleep: 'Sufficient Sleep',
}

// ─── Core Service Functions ────────────────────────────

/**
 * Checks whether a notification with the given dedupeKey already exists
 * within the cooldown window. If cooldownDays <= 0, checks all time.
 */
export async function isDuplicate(
  db: D1Database,
  parentId: string,
  childId: string,
  type: string,
  dedupeKey: string,
  cooldownDays: number
): Promise<boolean> {
  let query: string
  let bindings: unknown[]

  if (cooldownDays > 0) {
    query = `
      SELECT id, data_json FROM notifications
      WHERE parent_id = ? AND type = ?
        AND created_at >= datetime('now', ? || ' days')
    `
    bindings = [parentId, type, `-${cooldownDays}`]
  } else {
    query = `
      SELECT id, data_json FROM notifications
      WHERE parent_id = ? AND type = ?
    `
    bindings = [parentId, type]
  }

  const result = await (db.prepare(query).bind(...bindings) as ReturnType<D1Database['prepare']>).all<{ id: string; data_json: string }>()
  const rows = result.results ?? []

  for (const row of rows) {
    try {
      const data = JSON.parse(row.data_json ?? '{}') as Record<string, unknown>
      if (data.dedupeKey === dedupeKey && data.childId === childId) {
        return true
      }
    } catch {
      // malformed JSON — skip
    }
  }

  return false
}

/**
 * Inserts a new notification record into the notifications table.
 * Also fires a push notification as fire-and-forget.
 */
export async function createNotification(db: D1Database, input: NotificationInput): Promise<void> {
  const id = crypto.randomUUID()
  const dataJsonStr = JSON.stringify(input.dataJson)

  await db
    .prepare(
      `INSERT INTO notifications (id, parent_id, type, title, body, data_json, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`
    )
    .bind(id, input.parentId, input.type, input.title, input.body, dataJsonStr)
    .run()

  // Fire-and-forget push delivery
  if (input.env) {
    sendPush(db, input.env, input.parentId, {
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
    }, input.type).catch(() => {})
  }
}

// ─── Trigger Functions ─────────────────────────────────

async function checkMilestoneWindows(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  let count = 0

  const result = await db
    .prepare(
      `SELECT id, milestone_key, title, expected_age_min, expected_age_max
       FROM milestones
       WHERE child_id = ? AND status = 'not_started'
         AND expected_age_min IS NOT NULL AND expected_age_max IS NOT NULL`
    )
    .bind(child.id)
    .all<{ id: string; milestone_key: string; title: string; expected_age_min: number; expected_age_max: number }>()

  const milestones = result.results ?? []

  for (const milestone of milestones) {
    if (child.ageMonths < milestone.expected_age_min || child.ageMonths > milestone.expected_age_max) {
      continue
    }

    const dedupeKey = buildDedupeKey('milestone', milestone.milestone_key)
    const dup = await isDuplicate(db, parentId, child.id, 'milestone_reminder', dedupeKey, 7)
    if (dup) continue

    await createNotification(db, {
      parentId,
      childId: child.id,
      type: 'milestone_reminder',
      title: `${child.name}'s ${milestone.title} milestone is coming up`,
      body: `Track this milestone in the app to stay on top of ${child.name}'s development.`,
      actionUrl: '/dashboard/milestones',
      dataJson: { childId: child.id, childName: child.name, dedupeKey, milestoneKey: milestone.milestone_key },
    })
    count++
  }

  return count
}

async function checkHabitStreaks(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  let count = 0
  const STREAK_MILESTONES = [3, 7, 14, 30]

  // Get latest log per habit type
  const result = await db
    .prepare(
      `SELECT habit_type, streak_days
       FROM habits_log
       WHERE child_id = ?
         AND date = (SELECT MAX(date) FROM habits_log h2 WHERE h2.child_id = ? AND h2.habit_type = habits_log.habit_type)
       GROUP BY habit_type`
    )
    .bind(child.id, child.id)
    .all<{ habit_type: string; streak_days: number }>()

  const logs = result.results ?? []

  for (const log of logs) {
    const streakDays = log.streak_days ?? 0
    if (!STREAK_MILESTONES.includes(streakDays)) continue

    const habitType = log.habit_type
    const dedupeKey = buildDedupeKey('habit_streak', habitType, String(streakDays))
    const dup = await isDuplicate(db, parentId, child.id, 'habit_streak', dedupeKey, 1)
    if (dup) continue

    const label = HABIT_LABELS[habitType] ?? habitType
    await createNotification(db, {
      parentId,
      childId: child.id,
      type: 'habit_streak',
      title: `${child.name} has a ${streakDays}-day ${label} streak!`,
      body: `Keep it up! Consistency builds healthy habits for life.`,
      actionUrl: '/dashboard/habits',
      dataJson: { childId: child.id, childName: child.name, dedupeKey, habitType, streakDays },
    })
    count++
  }

  return count
}

async function checkHabitGaps(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  let count = 0
  const habitTypes = Object.keys(HABIT_LABELS)

  for (const habitType of habitTypes) {
    // Check if any log exists in the last 3 days
    const logResult = await db
      .prepare(
        `SELECT COUNT(*) as cnt FROM habits_log
         WHERE child_id = ? AND habit_type = ?
           AND date >= date('now', '-3 days')`
      )
      .bind(child.id, habitType)
      .first<{ cnt: number }>()

    if ((logResult?.cnt ?? 0) > 0) continue

    // Check no streak notification was created today for same child+habitType
    const streakTodayResult = await db
      .prepare(
        `SELECT COUNT(*) as cnt FROM notifications
         WHERE parent_id = ? AND type = 'habit_streak'
           AND date(created_at) = date('now')
           AND data_json LIKE ?`
      )
      .bind(parentId, `%"childId":"${child.id}"%"habitType":"${habitType}"%`)
      .first<{ cnt: number }>()

    if ((streakTodayResult?.cnt ?? 0) > 0) continue

    const dedupeKey = buildDedupeKey('habit_gap', habitType)
    const dup = await isDuplicate(db, parentId, child.id, 'habit_streak', dedupeKey, 3)
    if (dup) continue

    const label = HABIT_LABELS[habitType] ?? habitType
    await createNotification(db, {
      parentId,
      childId: child.id,
      type: 'habit_streak',
      title: `Keep ${child.name}'s ${label} habit going!`,
      body: `It's been a few days since the last log. A small step today keeps the streak alive.`,
      actionUrl: '/dashboard/habits',
      dataJson: { childId: child.id, childName: child.name, dedupeKey, habitType },
    })
    count++
  }

  return count
}

async function checkVaccinationsDue(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  let count = 0

  const result = await db
    .prepare(
      `SELECT id, vaccine_name, next_due
       FROM vaccination_records
       WHERE child_id = ?
         AND next_due = date('now', '+7 days')`
    )
    .bind(child.id)
    .all<{ id: string; vaccine_name: string; next_due: string }>()

  const records = result.results ?? []

  for (const record of records) {
    const vaccineName = record.vaccine_name
    const dedupeKey = buildDedupeKey('vaccination', vaccineName)
    const dup = await isDuplicate(db, parentId, child.id, 'general', dedupeKey, 3)
    if (dup) continue

    await createNotification(db, {
      parentId,
      childId: child.id,
      type: 'general',
      title: `${child.name}'s ${vaccineName} vaccine is due in 7 days`,
      body: `Schedule the appointment soon to keep ${child.name}'s immunisation on track.`,
      actionUrl: '/dashboard/vaccinations',
      dataJson: { childId: child.id, childName: child.name, dedupeKey, vaccineName },
    })
    count++
  }

  return count
}

async function checkGrowthReminder(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM growth_records
       WHERE child_id = ? AND date >= date('now', '-30 days')`
    )
    .bind(child.id)
    .first<{ cnt: number }>()

  if ((result?.cnt ?? 0) > 0) return 0

  const dedupeKey = buildDedupeKey('growth_reminder')
  const dup = await isDuplicate(db, parentId, child.id, 'general', dedupeKey, 7)
  if (dup) return 0

  await createNotification(db, {
    parentId,
    childId: child.id,
    type: 'general',
    title: `Time to log ${child.name}'s growth measurements`,
    body: `Regular growth tracking helps spot trends early. It only takes a minute!`,
    actionUrl: '/dashboard/growth',
    dataJson: { childId: child.id, childName: child.name, dedupeKey },
  })

  return 1
}

async function checkScreeningResults(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  let count = 0

  const result = await db
    .prepare(
      `SELECT id FROM screening_imports WHERE child_id = ?`
    )
    .bind(child.id)
    .all<{ id: string }>()

  const imports = result.results ?? []

  for (const screening of imports) {
    const screeningId = screening.id
    const dedupeKey = buildDedupeKey('screening', screeningId)
    // cooldownDays = 0 → never repeat
    const dup = await isDuplicate(db, parentId, child.id, 'screening_alert', dedupeKey, 0)
    if (dup) continue

    await createNotification(db, {
      parentId,
      childId: child.id,
      type: 'screening_alert',
      title: `${child.name}'s screening results are ready`,
      body: `View the full report and recommendations in the app.`,
      actionUrl: '/dashboard/reports',
      dataJson: { childId: child.id, childName: child.name, dedupeKey, screeningId },
    })
    count++
  }

  return count
}

async function checkBlogRecommendation(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  const ageStage = getAgeStage(child.ageMonths)
  const dedupeKey = buildDedupeKey('blog', ageStage)

  const dup = await isDuplicate(db, parentId, child.id, 'blog_recommendation', dedupeKey, 7)
  if (dup) return 0

  await createNotification(db, {
    parentId,
    childId: child.id,
    type: 'blog_recommendation',
    title: `New articles for your ${ageStage}`,
    body: `Discover expert-curated content tailored for ${ageStage} development.`,
    actionUrl: '/blog',
    dataJson: { childId: child.id, childName: child.name, dedupeKey, ageStage },
  })

  return 1
}

async function checkWelcome(
  db: D1Database,
  parentId: string,
  child: ChildWithAge
): Promise<number> {
  const result = await db
    .prepare(`SELECT COUNT(*) as cnt FROM milestones WHERE child_id = ?`)
    .bind(child.id)
    .first<{ cnt: number }>()

  if ((result?.cnt ?? 0) > 0) return 0

  const dedupeKey = buildDedupeKey('welcome')
  // cooldownDays = 0 → never repeat
  const dup = await isDuplicate(db, parentId, child.id, 'general', dedupeKey, 0)
  if (dup) return 0

  await createNotification(db, {
    parentId,
    childId: child.id,
    type: 'general',
    title: `Welcome! Start tracking ${child.name}'s milestones`,
    body: `Add your first milestone to begin ${child.name}'s health journey with SKIDS.`,
    actionUrl: '/dashboard/milestones',
    dataJson: { childId: child.id, childName: child.name, dedupeKey },
  })

  return 1
}

// ─── Main Entry Point ──────────────────────────────────

/**
 * Runs the full notification generation pipeline for a parent.
 * Fetches all children, evaluates all 8 trigger rules per child,
 * and returns the total number of notifications created.
 */
export async function runGenerationRun(db: D1Database, parentId: string): Promise<number> {
  const childResult = await db
    .prepare(`SELECT id, name, dob FROM children WHERE parent_id = ?`)
    .bind(parentId)
    .all<ChildRow>()

  const children = childResult.results ?? []
  let totalCreated = 0

  for (const child of children) {
    try {
      const ageMonths = Math.floor(
        (Date.now() - new Date(child.dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      )
      const childWithAge: ChildWithAge = { ...child, ageMonths }

      const triggers = [
        checkMilestoneWindows,
        checkHabitStreaks,
        checkHabitGaps,
        checkVaccinationsDue,
        checkGrowthReminder,
        checkScreeningResults,
        checkBlogRecommendation,
        checkWelcome,
      ]

      for (const trigger of triggers) {
        try {
          const created = await trigger(db, parentId, childWithAge)
          totalCreated += created
        } catch (err) {
          console.error(`[notifications] trigger ${trigger.name} failed for child ${child.id}:`, err)
        }
      }
    } catch (err) {
      console.error(`[notifications] failed processing child ${child.id}:`, err)
    }
  }

  return totalCreated
}
