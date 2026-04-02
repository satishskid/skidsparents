/**
 * InterventionStrip — Shows today's prescribed intervention tasks.
 *
 * Only renders if child has active intervention assignments.
 * Top of dashboard — highest priority for parent's daily action.
 *
 * Layout per assignment:
 * [Icon] Protocol Name – Day X/Y
 * [ ] Task 1 (duration)  [Done] [Skip]
 * [ ] Task 2             [Log]
 * Streak: 🔥 N days | This week: X/Y ✓
 * [Ask Coach →]
 */

import { useState, useEffect, useCallback } from 'react'

interface Task {
  id: string
  assignment_id: string
  task_key: string
  title: string
  instructions: string
  duration_minutes: number | null
  status: 'pending' | 'done' | 'skipped' | 'partial'
  protocol_name: string
  category: string
  subspecialty: string
}

interface Assignment {
  id: string
  protocolName: string
  category: string
  subspecialty: string
  startDate: string
  endDate: string
  durationDays: number
  customParams: Record<string, any>
}

interface Streak {
  assignment_id: string
  current_streak: number
  compliance_pct: number
  total_done: number
  total_skipped: number
}

const CATEGORY_EMOJI: Record<string, string> = {
  vision: '👁️', hearing: '👂', ent: '🦻', dental: '🦷',
  developmental: '🧩', nutrition: '🥄', skin: '🧴', allergy: '🤧',
  respiratory: '🫁', physio: '🏋️', musculoskeletal: '🦴', cardiac: '❤️',
  behavioral: '🧠', immunological: '🛡️', growth: '📏', endocrine: '⚡',
}

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  done: 'bg-green-100 text-green-700',
  skipped: 'bg-red-100 text-red-600',
  partial: 'bg-amber-100 text-amber-700',
}

export default function InterventionStrip({
  childId,
  token,
  onTaskLogged,
}: {
  childId: string
  token: string
  onTaskLogged?: () => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingTask, setLoggingTask] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/interventions/tasks?childId=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
        setAssignments(data.assignments || [])
        setStreaks(data.streaks || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [childId, token])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function logTask(taskId: string, status: 'done' | 'skipped' | 'partial') {
    setLoggingTask(taskId)
    try {
      const res = await fetch('/api/interventions/tasks', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, status }),
      })
      if (res.ok) {
        const data = await res.json()
        // Update task status locally
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status } : t
        ))
        // Update streak
        if (data.streak) {
          setStreaks(prev => {
            const task = tasks.find(t => t.id === taskId)
            if (!task) return prev
            return prev.map(s =>
              s.assignment_id === task.assignment_id
                ? { ...s, ...data.streak }
                : s
            )
          })
        }
        onTaskLogged?.()
      }
    } catch {} finally {
      setLoggingTask(null)
    }
  }

  function openCoach(assignmentId: string, protocolName: string) {
    window.dispatchEvent(new CustomEvent('open-intervention-coach', {
      detail: { childId, assignmentId, protocolName },
    }))
  }

  if (loading) {
    return <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-4 animate-pulse h-28" />
  }

  if (assignments.length === 0) return null

  // Group tasks by assignment
  const tasksByAssignment = new Map<string, Task[]>()
  for (const task of tasks) {
    const list = tasksByAssignment.get(task.assignment_id) || []
    list.push(task)
    tasksByAssignment.set(task.assignment_id, list)
  }

  return (
    <div className="space-y-3">
      {assignments.map(assignment => {
        const assignmentTasks = tasksByAssignment.get(assignment.id) || []
        const streak = streaks.find(s => s.assignment_id === assignment.id)
        const dayNumber = Math.ceil(
          (Date.now() - new Date(assignment.startDate).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
        const emoji = CATEGORY_EMOJI[assignment.category] || '💊'

        const doneToday = assignmentTasks.filter(t => t.status === 'done').length
        const totalToday = assignmentTasks.length
        const allDoneToday = doneToday === totalToday && totalToday > 0

        return (
          <div
            key={assignment.id}
            className={`rounded-2xl border overflow-hidden ${
              allDoneToday
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{assignment.protocolName}</h3>
                <p className="text-[10px] text-gray-500">
                  Day {dayNumber} of {assignment.durationDays}
                  {assignment.customParams && Object.keys(assignment.customParams).length > 0 && (
                    <> · {Object.entries(assignment.customParams).map(([k, v]) =>
                      `${k.replace(/_/g, ' ')}: ${v}`
                    ).join(', ')}</>
                  )}
                </p>
              </div>
              {allDoneToday && (
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  Done today
                </span>
              )}
            </div>

            {/* Tasks */}
            <div className="px-4 py-2 space-y-2">
              {assignmentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${STATUS_COLORS[task.status]}`}>
                    {task.status === 'done' ? '✓' : task.status === 'skipped' ? '✕' : task.status === 'partial' ? '~' : '○'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {task.title}
                      {task.duration_minutes ? ` (${task.duration_minutes}min)` : ''}
                    </p>
                  </div>
                  {task.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => logTask(task.id, 'done')}
                        disabled={loggingTask === task.id}
                        className="px-2.5 py-1 rounded-lg bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => logTask(task.id, 'skipped')}
                        disabled={loggingTask === task.id}
                        className="px-2 py-1 rounded-lg bg-gray-200 text-gray-600 text-[10px] font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer: streak + coach */}
            <div className="px-4 pb-3 flex items-center gap-2">
              {streak && streak.current_streak > 0 && (
                <span className="text-[10px] text-orange-600 font-medium">
                  🔥 {streak.current_streak}-day streak
                </span>
              )}
              {streak && (
                <span className="text-[10px] text-gray-400">
                  · {Math.round(streak.compliance_pct)}% this week
                </span>
              )}
              <div className="flex-1" />
              <button
                onClick={() => openCoach(assignment.id, assignment.protocolName)}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
              >
                Ask Coach →
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
