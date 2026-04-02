/**
 * SKIDS Probabilistic Life Record — Module Index
 *
 * The SKIDS Life Record is a continuous pediatric health intelligence system.
 * It doesn't diagnose — it unfolds possibilities into probabilities.
 * The doctor confirms into diagnoses. Nothing is missed.
 *
 * Three-layer architecture:
 *   Layer 1: Knowledge Graph — population-level base rates (epidemiology)
 *   Layer 2: Life Record Prior — individual child context (Bayesian update)
 *   Layer 3: Doctor Refinement — clinical examination updates probabilities
 */

// Types
export type {
  ConditionObservationEntry,
  ConditionModifier,
  LifeRecordContext,
  ObservationProjection,
  ProjectionResult,
  DoctorRefinement,
  BodySystem,
  ConditionCategory,
  Urgency,
  ModifierSource,
} from './types'

// Knowledge Graph (Layer 1)
export {
  OBSERVATION_CONDITION_MAP,
  matchObservationToConditions,
  detectDomains,
  getMustNotMissConditions,
  getConditionsBySystem,
} from './knowledge-graph'

// Probability Engine (Layer 2)
export {
  projectObservation,
  applyDoctorRefinement,
  getParentSummary,
  getDoctorSummary,
} from './probability-engine'

// Context Builder (DB → LifeRecordContext)
export {
  buildLifeRecordContext,
  buildMinimalContext,
} from './context-builder'

// Domain Prompts (The Wire → Parent)
export type {
  DomainPrompt,
  PromptCondition,
  ObservationInput,
} from './domain-prompts'

export {
  DOMAIN_PROMPTS,
  getPromptsForAge,
  getAllPromptsForAge,
  getPromptsForDomain,
} from './domain-prompts'
