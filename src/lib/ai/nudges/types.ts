/**
 * SKIDS Smart Nudges — Type Definitions
 *
 * The wire speaks proactively. Nudges are personalized,
 * timely alerts that guide parents to observe what matters NOW.
 */

export type NudgeType =
  | 'milestone_window'       // Developmental window opening/closing
  | 'observation_gap'        // No observations in a domain for too long
  | 'pattern_alert'          // Multiple observations in same domain
  | 'celebration'            // Milestone achieved, streak, etc.
  | 'vaccination_reminder'   // Overdue or upcoming vaccine
  | 'screening_due'          // Age-based screening reminder

export type NudgeAction =
  | 'add_observation'        // Opens quick capture with domain pre-selected
  | 'view_milestone'         // Opens milestone section
  | 'open_chat'              // Opens chat with a pre-seeded question
  | 'view_vaccination'       // Opens vaccination section
  | 'dismiss'                // Just dismiss

export interface Nudge {
  /** Unique key for deduplication and dismissal tracking */
  key: string
  /** Display ID */
  id: string
  /** Nudge type determines styling */
  type: NudgeType
  /** Short title (1 line) */
  title: string
  /** Body text (1-2 sentences) */
  body: string
  /** Emoji for the nudge card */
  emoji: string
  /** What happens when parent taps the nudge */
  actionType: NudgeAction
  /** Data for the action (domain, question, etc.) */
  actionData?: string
  /** Priority: 1 = urgent, 5 = background */
  priority: number
  /** When this nudge expires (ISO string) */
  expiresAt?: string
}
