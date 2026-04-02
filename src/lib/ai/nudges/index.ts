/**
 * SKIDS Smart Nudges — Module Index
 *
 * Proactive, personalized nudges that guide parents
 * to observe what matters NOW for their child.
 */

export type {
  Nudge,
  NudgeType,
  NudgeAction,
} from './types'

export {
  generateNudges,
  filterDismissedNudges,
} from './nudge-engine'
