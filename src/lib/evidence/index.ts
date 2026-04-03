/**
 * SKIDS Evidence Library — Barrel Export
 *
 * Structured citation database supporting audit-ready clinical content.
 */

// Types
export type {
  Citation,
  EvidenceClaim,
  DomainEvidenceMap,
  AuditReport,
  AuditFinding,
  EvidenceGrade,
  SourceType,
  GuidelineBody,
  ContentRegion,
  ClaimType,
} from './types'

// Intervention Protocol Citations & Evidence Map
export {
  ALL_INTERVENTION_CITATIONS,
  AMBLYOPIA_CITATIONS,
  IRON_DEFICIENCY_CITATIONS,
  SPEECH_STIMULATION_CITATIONS,
  BEHAVIORAL_ROUTINE_CITATIONS,
  GROSS_MOTOR_CITATIONS,
  getInterventionCitation,
  getCitationsForCondition,
  getVerifiedCitations,
  getInterventionCitationAudit,
} from './sources/intervention-citations'

export {
  INTERVENTION_EVIDENCE_MAP,
  getClaimsForProtocol,
  getWeaklyEvidencedClaims,
  getUnreviewedClaims,
} from './domains/interventions'

// Growth Track Citations — Digital & Parental
export {
  ALL_DIGITAL_PARENTAL_CITATIONS,
  DIGITAL_GROWTH_CITATIONS,
  PARENTAL_GROWTH_CITATIONS,
  getDigitalParentalCitation,
  getDigitalParentalCitationAudit,
} from './sources/growth-digital-parental'

// Growth Track Citations — Emotional & Behavioral
export {
  ALL_EMOTIONAL_BEHAVIORAL_CITATIONS,
  EMOTIONAL_GROWTH_CITATIONS,
  BEHAVIORAL_GROWTH_CITATIONS,
  getEmotionalBehavioralCitation,
  getEmotionalBehavioralCitationAudit,
} from './sources/growth-emotional-behavioral'

// Growth Track Citations — Sleep & Social
export {
  ALL_GROWTH_SLEEP_SOCIAL_CITATIONS,
  SLEEP_GROWTH_CITATIONS,
  SOCIAL_GROWTH_CITATIONS,
  getGrowthSleepSocialCitation,
  getGrowthSleepSocialCitationAudit,
} from './sources/growth-sleep-social'

// Growth Track Citations — Nutrition & Physical
export {
  ALL_NUTRITION_PHYSICAL_CITATIONS,
  NUTRITION_GROWTH_CITATIONS,
  PHYSICAL_GROWTH_CITATIONS,
  getNutritionPhysicalCitation,
  getNutritionPhysicalCitationAudit,
} from './sources/growth-nutrition-physical'

// Audit Report Generator
export {
  generateAuditReport,
  formatAuditReport,
} from './audit-report'
