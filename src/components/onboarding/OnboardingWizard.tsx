import { useState, useEffect, useRef, useCallback } from 'react'
import Step1ChildForm from '@/components/onboarding/Step1ChildForm'
import Step2Milestones from '@/components/onboarding/Step2Milestones'
import Step3Habits from '@/components/onboarding/Step3Habits'
import CelebrationScreen from '@/components/onboarding/CelebrationScreen'
import { MILESTONES } from '@/lib/content/milestones'
import { HABITS } from '@/lib/content/habits'

interface WizardState {
  step: 0 | 1 | 2 | 3
  childId: string | null
  childName: string
  childAgeMonths: number
  selectedMilestoneId: string | null
  selectedMilestoneTitle: string | null
  selectedMilestoneStatus: 'achieved' | 'in_progress' | null
  selectedHabitKey: string | null
  selectedHabitName: string | null
  milestoneLogged: boolean
  habitLogged: boolean
  step1Complete: boolean
}

interface OnboardingWizardProps {
  token: string
  parentId: string
  onComplete: () => void
}

// StepIndicator — 3 dots, 1-indexed current step, hidden on celebration (step 3)
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div
      role="progressbar"
      aria-label={`Step ${current} of 3`}
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={3}
      className="flex items-center justify-center gap-2"
    >
      {([1, 2, 3] as const).map((i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current ? 'w-3 h-3 bg-green-500' : 'w-2 h-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function OnboardingWizard({ token, parentId, onComplete }: OnboardingWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 0,
    childId: null,
    childName: '',
    childAgeMonths: 0,
    selectedMilestoneId: null,
    selectedMilestoneTitle: null,
    selectedMilestoneStatus: null,
    selectedHabitKey: null,
    selectedHabitName: null,
    milestoneLogged: false,
    habitLogged: false,
    step1Complete: false,
  })

  const [prevStep, setPrevStep] = useState<number>(-1)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const stepHeadings: Record<number, string> = {
    0: 'Step 1 of 3 — Add your child',
    1: 'Step 2 of 3 — Log a milestone',
    2: 'Step 3 of 3 — Log a habit',
    3: "You're all set!",
  }

  // Announce step heading via aria-live on step change
  useEffect(() => {
    setLiveAnnouncement(stepHeadings[state.step] ?? '')
  }, [state.step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Move focus to first interactive element whenever step changes
  useEffect(() => {
    const el = containerRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    el?.focus()
  }, [state.step])

  // Focus trap — Tab/Shift+Tab cycle within the dialog
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const container = containerRef.current
    if (!container) return

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.closest('[aria-hidden="true"]'))

    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Advance to next step
  const advanceStep = (nextStep: 0 | 1 | 2 | 3) => {
    setPrevStep(state.step)
    setState((s) => ({ ...s, step: nextStep }))
  }

  // Close button handler — PATCH then call onComplete
  const handleClose = async () => {
    try {
      await fetch('/api/parents/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ onboarding_completed: true }),
      })
    } catch {
      // best-effort
    }
    onComplete()
  }

  // CSS transition classes per step panel
  const stepClass = (stepIndex: number): string => {
    const isCurrent = state.step === stepIndex
    const isOutgoing = prevStep === stepIndex && !isCurrent
    if (isCurrent) return 'translate-x-0 opacity-100 transition-all duration-300 ease-in-out'
    if (isOutgoing) return 'translate-x-[-100%] opacity-0 transition-all duration-300 ease-in-out'
    return 'translate-x-[100%] opacity-0'
  }

  // 1-indexed step for StepIndicator
  const indicatorStep = (state.step + 1) as 1 | 2 | 3

  return (
    <>
      {/* ── Mobile layout: full-screen ── */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-9999 bg-white flex flex-col md:hidden"
      >
        <div ref={containerRef} className="relative flex flex-col flex-1 min-h-0">
          {/* Close button — visible only after step 1 complete */}
          {state.step1Complete && (
            <button
              onClick={handleClose}
              aria-label="Close wizard"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
            >
              ×
            </button>
          )}

          {/* Step indicator — only on steps 0–2 */}
          {state.step < 3 && (
            <div className="pt-6 pb-2 flex justify-center">
              <StepIndicator current={indicatorStep} />
            </div>
          )}

          {/* Step panels */}
          <div className="relative flex-1 overflow-hidden">
            <div className={`absolute inset-0 ${stepClass(0)}`}>
              <Step1ChildForm
                token={token}
                onSuccess={(childId, name, ageMonths) => {
                  setState(s => ({ ...s, childId, childName: name, childAgeMonths: ageMonths, step1Complete: true }))
                  advanceStep(1)
                }}
              />
            </div>
            <div className={`absolute inset-0 ${stepClass(1)}`}>
              <Step2Milestones
                token={token}
                childId={state.childId ?? ''}
                childName={state.childName}
                ageMonths={state.childAgeMonths}
                onComplete={(milestoneId, status, logged) => {
                  const milestoneTitle = MILESTONES.find(m => m.key === milestoneId)?.title ?? milestoneId
                  setState(s => ({ ...s, selectedMilestoneId: milestoneId, selectedMilestoneTitle: milestoneTitle, selectedMilestoneStatus: status as any, milestoneLogged: logged }))
                  advanceStep(2)
                }}
                onSkip={() => advanceStep(2)}
              />
            </div>
            <div className={`absolute inset-0 ${stepClass(2)}`}>
              <Step3Habits
                token={token}
                childId={state.childId ?? ''}
                childName={state.childName}
                onComplete={(habitKey, logged) => {
                  const habitName = HABITS.find(h => h.key === habitKey)?.name ?? habitKey
                  setState(s => ({ ...s, selectedHabitKey: habitKey, selectedHabitName: habitName, habitLogged: logged }))
                  advanceStep(3)
                }}
                onSkip={() => advanceStep(3)}
              />
            </div>
            <div className={`absolute inset-0 ${stepClass(3)}`}>
              <CelebrationScreen
                token={token}
                childId={state.childId ?? ''}
                childName={state.childName}
                milestoneLogged={state.milestoneLogged}
                milestoneTitle={state.selectedMilestoneTitle}
                habitLogged={state.habitLogged}
                habitName={state.selectedHabitName}
                onDone={onComplete}
              />
            </div>
          </div>

          {/* aria-live announcement region */}
          <div aria-live="polite" className="sr-only">{liveAnnouncement}</div>
        </div>
      </div>

      {/* ── Desktop layout: centred modal ── */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-sm items-center justify-center hidden md:flex"
      >
        <div className="bg-white rounded-3xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto flex flex-col">
          <div className="relative flex flex-col flex-1 min-h-0">
            {state.step1Complete && (
              <button
                onClick={handleClose}
                aria-label="Close wizard"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
              >
                ×
              </button>
            )}

            {state.step < 3 && (
              <div className="pt-6 pb-2 flex justify-center">
                <StepIndicator current={indicatorStep} />
              </div>
            )}

            <div className="relative flex-1 overflow-hidden">
              <div className={`absolute inset-0 ${stepClass(0)}`}>
                <Step1ChildForm
                  token={token}
                  onSuccess={(childId, name, ageMonths) => {
                    setState(s => ({ ...s, childId, childName: name, childAgeMonths: ageMonths, step1Complete: true }))
                    advanceStep(1)
                  }}
                />
              </div>
              <div className={`absolute inset-0 ${stepClass(1)}`}>
                <Step2Milestones
                  token={token}
                  childId={state.childId ?? ''}
                  childName={state.childName}
                  ageMonths={state.childAgeMonths}
                  onComplete={(milestoneId, status, logged) => {
                    const milestoneTitle = MILESTONES.find(m => m.key === milestoneId)?.title ?? milestoneId
                    setState(s => ({ ...s, selectedMilestoneId: milestoneId, selectedMilestoneTitle: milestoneTitle, selectedMilestoneStatus: status as any, milestoneLogged: logged }))
                    advanceStep(2)
                  }}
                  onSkip={() => advanceStep(2)}
                />
              </div>
              <div className={`absolute inset-0 ${stepClass(2)}`}>
                <Step3Habits
                  token={token}
                  childId={state.childId ?? ''}
                  childName={state.childName}
                  onComplete={(habitKey, logged) => {
                    const habitName = HABITS.find(h => h.key === habitKey)?.name ?? habitKey
                    setState(s => ({ ...s, selectedHabitKey: habitKey, selectedHabitName: habitName, habitLogged: logged }))
                    advanceStep(3)
                  }}
                  onSkip={() => advanceStep(3)}
                />
              </div>
              <div className={`absolute inset-0 ${stepClass(3)}`}>
                <CelebrationScreen
                  token={token}
                  childId={state.childId ?? ''}
                  childName={state.childName}
                  milestoneLogged={state.milestoneLogged}
                  milestoneTitle={state.selectedMilestoneTitle}
                  habitLogged={state.habitLogged}
                  habitName={state.selectedHabitName}
                  onDone={onComplete}
                />
              </div>
            </div>

            <div aria-live="polite" className="sr-only">{liveAnnouncement}</div>
          </div>
        </div>
      </div>
    </>
  )
}
