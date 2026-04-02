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

// Audit Report Generator
export {
  generateAuditReport,
  formatAuditReport,
} from './audit-report'
