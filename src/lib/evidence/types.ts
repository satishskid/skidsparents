/**
 * SKIDS Evidence Protocol — Structured Citation Types
 *
 * Every piece of clinical guidance traces to published science.
 * This module defines the structured types for audit-ready citations.
 *
 * Evidence grades follow Modified Oxford CEBM (Centre for Evidence-Based Medicine):
 *   1a = Systematic review of RCTs
 *   1b = Individual RCT
 *   2a = Systematic review of cohort studies
 *   2b = Individual cohort study
 *   3  = Case-control study
 *   4  = Clinical guideline / expert consensus / case series
 *   5  = Developmental theory / textbook / expert opinion
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EvidenceGrade = '1a' | '1b' | '2a' | '2b' | '3' | '4' | '5'

export type SourceType =
  | 'systematic_review'   // 1a — Cochrane, meta-analyses
  | 'rct'                 // 1b — Randomized controlled trial
  | 'cohort_review'       // 2a — Systematic review of cohort studies
  | 'cohort'              // 2b — Individual cohort / longitudinal study
  | 'case_control'        // 3  — Case-control study
  | 'guideline'           // 4  — Clinical practice guideline (AAP, IAP, WHO, NICE)
  | 'consensus'           // 4  — Expert consensus statement
  | 'case_series'         // 4  — Case series
  | 'textbook'            // 5  — Reference textbook
  | 'theory'              // 5  — Developmental theory (Piaget, Erikson, Bowlby)
  | 'meta_analysis'       // 1a — Meta-analysis of studies
  | 'national_survey'     // 3  — National health survey data (NFHS, NHANES)

export type GuidelineBody =
  | 'AAP'       // American Academy of Pediatrics
  | 'IAP'       // Indian Academy of Pediatrics
  | 'WHO'       // World Health Organization
  | 'NICE'      // UK National Institute for Health and Care Excellence
  | 'CDC'       // US Centers for Disease Control
  | 'AAO'       // American Academy of Ophthalmology
  | 'AIOS'      // All India Ophthalmological Society
  | 'Gulf_AP'   // Gulf Association of Pediatrics
  | 'ASHA'      // American Speech-Language-Hearing Association
  | 'Cochrane'  // Cochrane Collaboration
  | 'ESPGHAN'   // European Society for Paediatric Gastroenterology
  | 'RCPCH'     // Royal College of Paediatrics and Child Health
  | 'ZeroToThree' // Zero to Three (infant mental health)
  | 'PEDIG'     // Pediatric Eye Disease Investigator Group
  | 'ICMR'      // Indian Council of Medical Research

export type ContentRegion = 'global' | 'india' | 'usa' | 'gcc' | 'uk' | 'europe'

// ═══════════════════════════════════════════════════════════════════════════
// CITATION — A single published reference
// ═══════════════════════════════════════════════════════════════════════════

export interface Citation {
  /** Unique ID, e.g. 'pedig-2003-patching-moderate' */
  id: string

  /** Full author list, e.g. 'Holmes JM, Kraker RT, Beck RW, et al.' */
  authors: string

  /** Publication year */
  year: number

  /** Full title of paper/book/guideline */
  title: string

  /** Journal name, publisher, or issuing body */
  source: string

  /** Evidence type classification */
  type: SourceType

  /** Modified Oxford CEBM grade */
  grade: EvidenceGrade

  /** Digital Object Identifier — the gold standard for traceability */
  doi?: string

  /** PubMed ID for journal articles */
  pmid?: string

  /** ISBN for books */
  isbn?: string

  /** Journal volume */
  volume?: string

  /** Journal issue */
  issue?: string

  /** Page range, e.g. '603-611' */
  pages?: string

  /** Full-text URL (open access or guideline PDF) */
  url?: string

  /** Issuing guideline body, if applicable */
  guidelineBody?: GuidelineBody

  /** Edition or version, e.g. '4th Edition', '2022 Update' */
  edition?: string

  /** Primary region this citation applies to */
  region: ContentRegion

  /** One-line plain-English summary of what this source establishes */
  keyFinding: string

  /** Whether this citation has been independently verified (PubMed/DOI confirmed) */
  verified: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE CLAIM — A specific clinical claim linked to citation(s)
// ═══════════════════════════════════════════════════════════════════════════

export type ClaimType =
  | 'recommendation'      // "Patch 2 hours/day for moderate amblyopia"
  | 'threshold'           // "Below 50% compliance = treatment failure"
  | 'milestone_age'       // "Social smile expected by 6-8 weeks"
  | 'red_flag'            // "No babbling by 12 months warrants evaluation"
  | 'prevalence'          // "67% of Indian children under 5 are anemic"
  | 'mechanism'           // "Vitamin C enhances non-heme iron absorption"
  | 'dosage'              // "3-6 mg/kg/day elemental iron"
  | 'duration'            // "Supplement for 3 months after hemoglobin normalizes"
  | 'safety'              // "G6PD testing before iron supplementation in Gulf"
  | 'developmental_norm'  // "Parallel play is normal at 2-3 years"

export interface EvidenceClaim {
  /** Unique claim ID, e.g. 'amblyopia-2hr-noninferiority' */
  id: string

  /** The specific clinical claim in plain English */
  claim: string

  /** What type of claim this is */
  claimType: ClaimType

  /** Citation IDs that support this claim */
  citationIds: string[]

  /** Which content this claim maps to */
  contentRef: {
    /** 'growth_track' | 'intervention' | 'knowledge_graph' */
    layer: 'growth_track' | 'intervention' | 'knowledge_graph'
    /** Protocol/track/node ID */
    contentId: string
    /** Specific field: 'coaching_topic', 'red_flag', 'milestone', 'task_param', 'escalation_rule' */
    field: string
    /** Field key or index */
    fieldKey?: string
  }

  /** Strongest evidence grade among supporting citations */
  strongestGrade: EvidenceGrade

  /** Whether this claim has been reviewed by a clinician */
  clinicianReviewed: boolean

  /** Review date if reviewed */
  reviewDate?: string

  /** Reviewing clinician name */
  reviewer?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN EVIDENCE MAP — All citations for a domain/protocol
// ═══════════════════════════════════════════════════════════════════════════

export interface DomainEvidenceMap {
  /** Domain name (e.g. 'emotional', 'amblyopia_patching') */
  domain: string

  /** All citations used in this domain */
  citations: Citation[]

  /** All evidence claims in this domain */
  claims: EvidenceClaim[]

  /** Audit summary stats */
  audit: {
    totalClaims: number
    citedClaims: number
    uncitedClaims: number
    grade1Count: number   // RCTs + systematic reviews
    grade2Count: number   // Cohort studies
    grade3Count: number   // Case-control
    grade4Count: number   // Guidelines
    grade5Count: number   // Textbooks/theory
    verifiedCitations: number
    unverifiedCitations: number
    clinicianReviewedClaims: number
    lastAuditDate: string
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT REPORT — Generated per domain
// ═══════════════════════════════════════════════════════════════════════════

export interface AuditFinding {
  severity: 'critical' | 'warning' | 'info'
  message: string
  contentRef: string
  recommendation: string
}

export interface AuditReport {
  generatedAt: string
  domain: string
  summary: {
    totalCitations: number
    verifiedCitations: number
    totalClaims: number
    citedClaims: number
    clinicianReviewed: number
    strongestOverallGrade: EvidenceGrade
    weakestClaimGrade: EvidenceGrade
  }
  findings: AuditFinding[]
  gradeDistribution: Record<EvidenceGrade, number>
  /** Pass/fail for minimum evidence requirements */
  meetsMinimumStandard: boolean
}
