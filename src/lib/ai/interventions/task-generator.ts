/**
 * Intervention Task Generator — Materializes daily tasks from protocol templates.
 *
 * Tasks are generated lazily: on first GET of the day, generate next 7 days
 * if not already generated. Also triggered on POST /api/doctor/interventions
 * for the initial batch.
 */

import type {
  InterventionProtocol,
  InterventionAssignment,
  InterventionTask,
  InterventionTaskDef,
  TaskSchedule,
} from './types'

/**
 * Check if tasks need to be generated for a given date range.
 * Returns true if there are no tasks for the target date.
 */
export async function shouldGenerateTasks(
  assignmentId: string,
  targetDate: string,
  db: any
): Promise<boolean> {
  const result = await db.prepare(
    `SELECT COUNT(*) as count FROM intervention_tasks
     WHERE assignment_id = ? AND task_date = ?`
  ).bind(assignmentId, targetDate).first()

  return (result?.count || 0) === 0
}

/**
 * Generate materialized tasks for an assignment from the protocol template.
 * Creates tasks for `days` days starting from `fromDate`.
 */
export async function generateTasks(
  assignment: InterventionAssignment,
  protocol: InterventionProtocol,
  fromDate: string,
  days: number = 7,
  db: any
): Promise<InterventionTask[]> {
  const params = assignment.customParams || {}
  const childName = '' // Will be resolved at display time
  const tasks: InterventionTask[] = []

  for (let d = 0; d < days; d++) {
    const taskDate = addDays(fromDate, d)

    // Don't generate past end date
    if (assignment.endDate && taskDate > assignment.endDate) break

    // Don't generate before start date
    if (taskDate < assignment.startDate) continue

    for (const taskDef of protocol.tasks) {
      if (!shouldScheduleOnDate(taskDef.schedule, taskDate, assignment.startDate)) continue

      const timesPerDay = taskDef.schedule.timesPerDay || 1
      for (let t = 0; t < timesPerDay; t++) {
        const task: InterventionTask = {
          id: generateId(),
          assignmentId: assignment.id,
          childId: assignment.childId,
          taskDate,
          taskKey: taskDef.key,
          title: taskDef.title,
          instructions: interpolateTemplate(taskDef.instructionsTemplate, params),
          durationMinutes: taskDef.durationMinutes,
          sequenceInDay: t + 1,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        tasks.push(task)
      }
    }
  }

  // Batch insert
  if (tasks.length > 0) {
    for (const task of tasks) {
      await db.prepare(
        `INSERT OR IGNORE INTO intervention_tasks
         (id, assignment_id, child_id, task_date, task_key, title, instructions,
          duration_minutes, sequence_in_day, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        task.id, task.assignmentId, task.childId, task.taskDate,
        task.taskKey, task.title, task.instructions,
        task.durationMinutes || null, task.sequenceInDay, task.status,
        task.createdAt, task.updatedAt
      ).run()
    }
  }

  return tasks
}

/**
 * Regenerate future tasks after parameter change.
 * Deletes pending tasks from tomorrow onwards and regenerates.
 */
export async function regenerateFutureTasks(
  assignment: InterventionAssignment,
  protocol: InterventionProtocol,
  db: any
): Promise<void> {
  const tomorrow = addDays(todayISO(), 1)

  // Delete pending future tasks
  await db.prepare(
    `DELETE FROM intervention_tasks
     WHERE assignment_id = ? AND task_date >= ? AND status = 'pending'`
  ).bind(assignment.id, tomorrow).run()

  // Regenerate
  const daysRemaining = assignment.endDate
    ? daysBetween(tomorrow, assignment.endDate)
    : 30 // Generate 30 days ahead if no end date

  await generateTasks(assignment, protocol, tomorrow, Math.min(daysRemaining, 30), db)
}

/**
 * Calculate the day number within the intervention (Day X of Y).
 */
export function getDayNumber(startDate: string, currentDate: string): number {
  return daysBetween(startDate, currentDate) + 1
}

// ── Internal Helpers ──

function shouldScheduleOnDate(
  schedule: TaskSchedule,
  date: string,
  startDate: string
): boolean {
  switch (schedule.type) {
    case 'daily':
      return true

    case 'weekly': {
      // Schedule on the same day of week as start date
      const startDay = new Date(startDate).getDay()
      const dateDay = new Date(date).getDay()
      return startDay === dateDay
    }

    case 'specific_days': {
      if (!schedule.days) return false
      const dayOfWeek = new Date(date).getDay()
      // 0=Sun, 1=Mon... match to schedule.days
      return schedule.days.includes(dayOfWeek)
    }

    default:
      return true
  }
}

function interpolateTemplate(
  template: string,
  params: Record<string, any>
): string {
  let result = template
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(value))
  }
  return result
}

function generateId(): string {
  const hex = () => Math.random().toString(16).substring(2, 10)
  return `${hex()}${hex()}`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from)
  const b = new Date(to)
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}
