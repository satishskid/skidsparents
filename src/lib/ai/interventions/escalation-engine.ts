/**
 * Escalation Engine — Evaluates escalation rules after task logs and chat sessions.
 *
 * When a parent logs a task or chats with the intervention coach, this engine
 * checks if any escalation rules are triggered and creates flags for the doctor.
 *
 * Escalations are de-duplicated: same trigger won't fire again within 7 days.
 */

import type {
  InterventionProtocol,
  InterventionAssignment,
  InterventionTask,
  InterventionStreak,
  InterventionEscalation,
  EscalationRule,
  EscalationSeverity,
} from './types'

/**
 * Evaluate all escalation rules for an assignment after a task log or chat.
 * Creates escalation rows for any triggered rules (de-duplicated).
 */
export async function evaluateEscalations(
  assignment: InterventionAssignment,
  protocol: InterventionProtocol,
  streak: InterventionStreak | null,
  latestTask: InterventionTask | null,
  boundaryHits: number,
  parentConcernLevel: number,
  db: any
): Promise<InterventionEscalation[]> {
  const created: InterventionEscalation[] = []

  for (const rule of protocol.escalationRules) {
    const metricValue = getMetricValue(
      rule.condition.metric,
      streak,
      latestTask,
      boundaryHits,
      parentConcernLevel
    )

    const triggered = evaluateCondition(
      metricValue,
      rule.condition.operator,
      rule.condition.value
    )

    if (triggered) {
      // Check de-duplication: same trigger within last 7 days?
      const recentExists = await checkRecentEscalation(
        assignment.id,
        rule.trigger,
        7,
        db
      )

      if (!recentExists) {
        const escalation = await createEscalation(
          assignment,
          rule,
          streak,
          latestTask,
          db
        )
        if (escalation) created.push(escalation)
      }
    }
  }

  return created
}

/**
 * Get current metric value for rule evaluation.
 */
function getMetricValue(
  metric: string,
  streak: InterventionStreak | null,
  latestTask: InterventionTask | null,
  boundaryHits: number,
  parentConcernLevel: number
): number {
  switch (metric) {
    case 'compliance_pct':
      return streak?.compliancePct || 0

    case 'consecutive_skips':
      return countConsecutiveSkips(streak)

    case 'boundary_hits':
      return boundaryHits

    case 'parent_concern_level':
      return parentConcernLevel

    case 'difficulty_rating':
      return latestTask?.difficultyRating || 0

    case 'total_skipped':
      return streak?.totalSkipped || 0

    default:
      return 0
  }
}

/**
 * Count consecutive skips from streak data.
 * If current streak is 0 and total skipped > 0, estimate from compliance.
 */
function countConsecutiveSkips(streak: InterventionStreak | null): number {
  if (!streak) return 0
  // If compliance is 0 in the rolling window, all are skips
  if (streak.compliancePct === 0 && streak.totalSkipped > 0) {
    return Math.min(streak.totalSkipped, 7) // Cap at window size
  }
  // If current streak is 0, the last task wasn't done
  if (streak.currentStreak === 0 && streak.totalSkipped > 0) {
    // Estimate: inverse of compliance
    const estimated = Math.round(7 * (1 - streak.compliancePct / 100))
    return Math.max(estimated, 1)
  }
  return 0
}

/**
 * Evaluate a condition: metric <operator> threshold.
 */
function evaluateCondition(
  value: number,
  operator: 'lt' | 'gt' | 'eq',
  threshold: number
): boolean {
  switch (operator) {
    case 'lt': return value < threshold
    case 'gt': return value > threshold
    case 'eq': return value === threshold
    default: return false
  }
}

/**
 * Check if an escalation with same trigger exists within the last N days.
 */
async function checkRecentEscalation(
  assignmentId: string,
  trigger: string,
  days: number,
  db: any
): Promise<boolean> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffISO = cutoff.toISOString()

  const result = await db.prepare(
    `SELECT COUNT(*) as count FROM intervention_escalations
     WHERE assignment_id = ? AND escalation_type = ? AND created_at > ?`
  ).bind(assignmentId, trigger, cutoffISO).first()

  return (result?.count || 0) > 0
}

/**
 * Create an escalation row in the database.
 */
async function createEscalation(
  assignment: InterventionAssignment,
  rule: EscalationRule,
  streak: InterventionStreak | null,
  latestTask: InterventionTask | null,
  db: any
): Promise<InterventionEscalation | null> {
  try {
    const id = generateId()

    // Interpolate templates
    let title = rule.titleTemplate
    let detail = rule.detailTemplate

    const replacements: Record<string, string> = {
      '{{compliance_pct}}': String(Math.round(streak?.compliancePct || 0)),
      '{{current_streak}}': String(streak?.currentStreak || 0),
      '{{consecutive_skips}}': String(countConsecutiveSkips(streak)),
      '{{done_count}}': String(streak?.totalDone || 0),
      '{{total_count}}': String((streak?.totalDone || 0) + (streak?.totalSkipped || 0) + (streak?.totalPartial || 0)),
      '{{parent_note}}': latestTask?.parentNote || '',
      '{{difficulty_rating}}': String(latestTask?.difficultyRating || 0),
    }

    for (const [key, value] of Object.entries(replacements)) {
      title = title.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
      detail = detail.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
    }

    const escalation: InterventionEscalation = {
      id,
      assignmentId: assignment.id,
      childId: assignment.childId,
      doctorId: assignment.doctorId,
      escalationType: rule.trigger as any,
      severity: rule.severity as EscalationSeverity,
      title,
      detail,
      source: 'system',
      status: 'open',
      createdAt: new Date().toISOString(),
    }

    await db.prepare(
      `INSERT INTO intervention_escalations
       (id, assignment_id, child_id, doctor_id, escalation_type, severity,
        title, detail, source, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      escalation.id, escalation.assignmentId, escalation.childId,
      escalation.doctorId, escalation.escalationType, escalation.severity,
      escalation.title, escalation.detail, escalation.source,
      escalation.status, escalation.createdAt
    ).run()

    return escalation
  } catch (err) {
    console.error('[Escalation] Failed to create:', err)
    return null
  }
}

/**
 * Update streak after task completion.
 * Called after each task log to keep compliance data fresh.
 */
export async function updateStreak(
  assignmentId: string,
  db: any
): Promise<InterventionStreak | null> {
  try {
    // Get last 7 days of tasks
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoff = sevenDaysAgo.toISOString().split('T')[0]

    const recentTasks = await db.prepare(
      `SELECT status, task_date FROM intervention_tasks
       WHERE assignment_id = ? AND task_date >= ?
       ORDER BY task_date DESC`
    ).bind(assignmentId, cutoff).all()

    const tasks = recentTasks?.results || []
    const done = tasks.filter((t: any) => t.status === 'done').length
    const skipped = tasks.filter((t: any) => t.status === 'skipped').length
    const partial = tasks.filter((t: any) => t.status === 'partial').length
    const total = tasks.length
    const compliancePct = total > 0 ? (done / total) * 100 : 0

    // Calculate current streak (consecutive done days, most recent first)
    let currentStreak = 0
    const allTasks = await db.prepare(
      `SELECT status, task_date FROM intervention_tasks
       WHERE assignment_id = ?
       ORDER BY task_date DESC`
    ).bind(assignmentId).all()

    const allResults = allTasks?.results || []
    // Group by date, check if all tasks on that date are done
    const dateMap = new Map<string, boolean>()
    for (const t of allResults as any[]) {
      const existing = dateMap.get(t.task_date)
      if (existing === false) continue
      dateMap.set(t.task_date, t.status === 'done' || t.status === 'partial')
    }

    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    for (const [, allDone] of sortedDates) {
      if (allDone) currentStreak++
      else break
    }

    // Get total counts
    const totals = await db.prepare(
      `SELECT
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as total_done,
        SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as total_skipped,
        SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as total_partial
       FROM intervention_tasks WHERE assignment_id = ?`
    ).bind(assignmentId).first()

    // Upsert streak
    const now = new Date().toISOString()
    const lastDone = (allResults as any[]).find((t: any) => t.status === 'done')
    const streakId = `streak_${assignmentId}`

    await db.prepare(
      `INSERT INTO intervention_streaks
       (id, assignment_id, current_streak, longest_streak, total_done, total_skipped,
        total_partial, compliance_pct, last_completed_date, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(assignment_id) DO UPDATE SET
        current_streak = excluded.current_streak,
        longest_streak = MAX(intervention_streaks.longest_streak, excluded.current_streak),
        total_done = excluded.total_done,
        total_skipped = excluded.total_skipped,
        total_partial = excluded.total_partial,
        compliance_pct = excluded.compliance_pct,
        last_completed_date = excluded.last_completed_date,
        updated_at = excluded.updated_at`
    ).bind(
      streakId, assignmentId, currentStreak, currentStreak,
      totals?.total_done || 0, totals?.total_skipped || 0, totals?.total_partial || 0,
      Math.round(compliancePct * 100) / 100,
      lastDone?.task_date || null, now
    ).run()

    return {
      id: streakId,
      assignmentId,
      currentStreak,
      longestStreak: currentStreak,
      totalDone: totals?.total_done || 0,
      totalSkipped: totals?.total_skipped || 0,
      totalPartial: totals?.total_partial || 0,
      compliancePct: Math.round(compliancePct * 100) / 100,
      lastCompletedDate: lastDone?.task_date,
      updatedAt: now,
    }
  } catch (err) {
    console.error('[Streak] Update failed:', err)
    return null
  }
}

function generateId(): string {
  const hex = () => Math.random().toString(16).substring(2, 10)
  return `${hex()}${hex()}`
}
