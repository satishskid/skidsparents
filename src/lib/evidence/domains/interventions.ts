/**
 * Evidence Claims Map — Intervention Protocols
 *
 * Maps specific clinical claims in our intervention protocols
 * to the citations that support them.
 *
 * This is the audit trail: "Why does SKIDS say X?" → "Because study Y found Z."
 */

import type { EvidenceClaim, DomainEvidenceMap } from '../types'
import { ALL_INTERVENTION_CITATIONS } from '../sources/intervention-citations'

// ════════════════════════════════════════════════════════════════════════════
// AMBLYOPIA CLAIMS
// ════════════════════════════════════════════════════════════════════════════

const AMBLYOPIA_CLAIMS: EvidenceClaim[] = [
  {
    id: 'amblyopia-2hr-noninferiority',
    claim: '2 hours/day patching is as effective as 6 hours/day for moderate amblyopia (20/40-20/80) in children under 7',
    claimType: 'recommendation',
    citationIds: ['pedig-2003-moderate-patching'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_*',
      field: 'task_param',
      fieldKey: 'patching_hours',
    },
    strongestGrade: '1b',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-6hr-severe',
    claim: '6 hours/day patching is as effective as full-time patching for severe amblyopia (20/100-20/400)',
    claimType: 'recommendation',
    citationIds: ['pedig-2003-severe-patching'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_*',
      field: 'task_param',
      fieldKey: 'patching_hours_severe',
    },
    strongestGrade: '1b',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-age-response',
    claim: 'Children under 7 respond significantly better to amblyopia treatment than ages 7-13. Treatment still beneficial in older children.',
    claimType: 'threshold',
    citationIds: ['holmes-2011-age-amblyopia'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_*',
      field: 'coaching_topic',
      fieldKey: 'how_long_results',
    },
    strongestGrade: '1a',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-prevalence-india',
    claim: 'Amblyopia affects approximately 1-3% of Indian children',
    claimType: 'prevalence',
    citationIds: ['iap-2019-vision-screening'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_iap_v1',
      field: 'prevalence_notes',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-prevalence-usa',
    claim: 'Amblyopia affects approximately 2-3% of US children',
    claimType: 'prevalence',
    citationIds: ['aap-2016-visual-system-assessment', 'aao-2023-amblyopia-ppp'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_aap_v1',
      field: 'prevalence_notes',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-near-work-benefit',
    claim: '1 hour of prescribed near-work activity during patching improved outcomes by an additional line on the eye chart',
    claimType: 'recommendation',
    citationIds: ['pedig-2003-moderate-patching'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_*',
      field: 'coaching_topic',
      fieldKey: 'best_activities',
    },
    strongestGrade: '1b',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-adjustment-1-2-weeks',
    claim: 'Most children adjust to patch wearing within 1-2 weeks',
    claimType: 'developmental_norm',
    citationIds: ['aao-2023-amblyopia-ppp'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_*',
      field: 'coaching_topic',
      fieldKey: 'child_resists_patch',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-improvement-timeline',
    claim: 'Measurable improvement typically takes 6-12 weeks of consistent patching. Early neural adaptation at weeks 3-6.',
    claimType: 'duration',
    citationIds: ['pedig-2003-moderate-patching', 'holmes-2011-age-amblyopia'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_*',
      field: 'coaching_topic',
      fieldKey: 'how_long_results',
    },
    strongestGrade: '1a',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-compliance-5-7-days',
    claim: 'Children who patched 5-7 days per week had significantly better outcomes than those patching 3-4 days',
    claimType: 'threshold',
    citationIds: ['pedig-2003-moderate-patching', 'pedig-2003-severe-patching'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_*',
      field: 'coaching_topic',
      fieldKey: 'can_we_skip',
    },
    strongestGrade: '1b',
    clinicianReviewed: false,
  },
  {
    id: 'amblyopia-consanguinity-gcc',
    claim: 'Higher rates of consanguineous marriages in GCC may increase prevalence of refractive errors contributing to amblyopia',
    claimType: 'prevalence',
    citationIds: ['gulf-2021-pediatric-ophthalmology'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_amblyopia_gulf_v1',
      field: 'genetic_considerations',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// IRON DEFICIENCY CLAIMS
// ════════════════════════════════════════════════════════════════════════════

const IRON_DEFICIENCY_CLAIMS: EvidenceClaim[] = [
  {
    id: 'iron-india-67pct-anemia',
    claim: '67% of children aged 6-59 months in India are anemic, with iron deficiency being the leading cause',
    claimType: 'prevalence',
    citationIds: ['nfhs5-2021-india-anemia'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_iap_v1',
      field: 'prevalence_notes',
    },
    strongestGrade: '3',
    clinicianReviewed: false,
  },
  {
    id: 'iron-dosage-3-6-mg',
    claim: 'Therapeutic iron dosage of 3-6 mg/kg/day elemental iron for treatment of iron deficiency anemia',
    claimType: 'dosage',
    citationIds: ['baker-2010-aap-iron', 'who-2016-daily-iron', 'iap-2019-iron-initiative'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_*',
      field: 'task_param',
      fieldKey: 'iron_dosage',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'iron-supplement-3mo-after-normal',
    claim: 'Continue iron supplementation for 3 months after hemoglobin normalizes to replenish iron stores',
    claimType: 'duration',
    citationIds: ['baker-2010-aap-iron', 'iap-2019-iron-initiative'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_*',
      field: 'task_param',
      fieldKey: 'duration',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'iron-vitc-enhances-absorption',
    claim: 'Vitamin C enhances non-heme iron absorption. Pair iron-rich foods with citrus fruits.',
    claimType: 'mechanism',
    citationIds: ['baker-2010-aap-iron', 'who-2016-daily-iron'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_*',
      field: 'coaching_topic',
      fieldKey: 'iron_rich_foods',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'iron-neurodevelopmental-harm',
    claim: 'Iron deficiency in infancy causes long-lasting neurodevelopmental harm even after correction',
    claimType: 'mechanism',
    citationIds: ['baker-2010-aap-iron'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_*',
      field: 'description',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'iron-g6pd-gulf',
    claim: 'G6PD deficiency prevalence is 5-25% in Gulf Arab populations. Testing should be confirmed before iron supplementation.',
    claimType: 'safety',
    citationIds: ['gulf-2020-pediatric-nutrition'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_gulf_v1',
      field: 'genetic_considerations',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'iron-thalassemia-india',
    claim: 'Thalassemia trait prevalence 3-17% in Indian populations. Verify iron deficiency vs thalassemia trait before supplementation.',
    claimType: 'safety',
    citationIds: ['iap-2019-iron-consensus'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_iap_v1',
      field: 'genetic_considerations',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'iron-gcc-20-40-pct',
    claim: 'Iron deficiency anemia affects 20-40% of children in GCC countries despite high economic status',
    claimType: 'prevalence',
    citationIds: ['al-saqladi-2020-middle-east-iron'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_iron_gulf_v1',
      field: 'prevalence_notes',
    },
    strongestGrade: '1a',
    clinicianReviewed: false,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// SPEECH STIMULATION CLAIMS
// ════════════════════════════════════════════════════════════════════════════

const SPEECH_CLAIMS: EvidenceClaim[] = [
  {
    id: 'speech-ses-maternal-input',
    claim: 'SES differences in child vocabulary are fully mediated by properties of maternal speech (variety, length, complexity)',
    claimType: 'mechanism',
    citationIds: ['hoff-2003-ses-vocabulary'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_speech_*',
      field: 'coaching_topic',
      fieldKey: 'talk_more',
    },
    strongestGrade: '2b',
    clinicianReviewed: false,
  },
  {
    id: 'speech-bilingual-no-delay',
    claim: 'Bilingual children are not at risk of language delay from dual language exposure. Code-switching is normal.',
    claimType: 'developmental_norm',
    citationIds: ['paradis-2011-dual-language'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_speech_*',
      field: 'coaching_topic',
      fieldKey: 'bilingual_concerns',
    },
    strongestGrade: '5',
    clinicianReviewed: false,
  },
  {
    id: 'speech-screen-displaces-language',
    claim: 'Excessive screen time displaces face-to-face language interaction critical for speech development',
    claimType: 'mechanism',
    citationIds: ['aap-2016-media-school-age'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_speech_*',
      field: 'coaching_topic',
      fieldKey: 'screen_time',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'speech-prevalence-5-10-pct',
    claim: 'Speech/language delay affects 5-10% of preschool-age children',
    claimType: 'prevalence',
    citationIds: ['aap-2020-autism-identification'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_speech_*',
      field: 'prevalence_notes',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL ROUTINE CLAIMS
// ════════════════════════════════════════════════════════════════════════════

const BEHAVIORAL_CLAIMS: EvidenceClaim[] = [
  {
    id: 'behavioral-extinction-effective',
    claim: 'Behavioral interventions (extinction, graduated extinction, bedtime fading) are highly effective for pediatric sleep problems. 52 studies reviewed.',
    claimType: 'recommendation',
    citationIds: ['mindell-2006-behavioral-sleep'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_behavioral_*',
      field: 'coaching_topic',
      fieldKey: 'bedtime_routine',
    },
    strongestGrade: '1a',
    clinicianReviewed: false,
  },
  {
    id: 'behavioral-sleep-hours-by-age',
    claim: 'Recommended sleep: 12-16h (4-12mo), 11-14h (1-2yr), 10-13h (3-5yr), 9-12h (6-12yr), 8-10h (13-18yr)',
    claimType: 'recommendation',
    citationIds: ['aasm-2016-pediatric-sleep'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_behavioral_*',
      field: 'task_param',
      fieldKey: 'sleep_target_hours',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'behavioral-no-corporal-punishment',
    claim: 'Corporal punishment is minimally effective short-term, ineffective long-term, and linked to increased negative outcomes',
    claimType: 'recommendation',
    citationIds: ['aap-2018-effective-discipline'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_behavioral_*',
      field: 'coaching_topic',
      fieldKey: 'discipline_strategies',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'behavioral-sleep-problems-25-50',
    claim: 'Behavioral sleep problems affect 25-50% of US preschoolers',
    claimType: 'prevalence',
    citationIds: ['mindell-2006-behavioral-sleep'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_behavioral_aap_v1',
      field: 'prevalence_notes',
    },
    strongestGrade: '1a',
    clinicianReviewed: false,
  },
  {
    id: 'behavioral-tantrums-normal-1-4',
    claim: 'Tantrums are developmentally normal at ages 1-4, typically peak at age 2-3. ~5-10% are clinically significant.',
    claimType: 'developmental_norm',
    citationIds: ['kazdin-2005-pmt'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_behavioral_*',
      field: 'prevalence_notes',
    },
    strongestGrade: '5',
    clinicianReviewed: false,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// GROSS MOTOR CLAIMS
// ════════════════════════════════════════════════════════════════════════════

const MOTOR_CLAIMS: EvidenceClaim[] = [
  {
    id: 'motor-early-pt-best',
    claim: 'Early PT intervention for CMT (within first month of life) yields best outcomes',
    claimType: 'recommendation',
    citationIds: ['kaplan-2013-cmt-guideline'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_motor_*',
      field: 'description',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'motor-tummy-time-core',
    claim: 'Tummy time, neck stretches, and repositioning are first-line interventions for CMT and positional plagiocephaly',
    claimType: 'recommendation',
    citationIds: ['kaplan-2013-cmt-guideline', 'laughlin-2011-positional-deformities'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_motor_*',
      field: 'task_param',
      fieldKey: 'exercises',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'motor-plagiocephaly-no-cognitive-harm',
    claim: 'Children with positional plagiocephaly show no significant cognitive deficits at school age',
    claimType: 'safety',
    citationIds: ['collett-2019-plagiocephaly-cognition'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_motor_*',
      field: 'coaching_topic',
      fieldKey: 'head_shape_concern',
    },
    strongestGrade: '2b',
    clinicianReviewed: false,
  },
  {
    id: 'motor-cmt-prevalence',
    claim: 'Congenital muscular torticollis affects 0.3-2% of newborns',
    claimType: 'prevalence',
    citationIds: ['kaplan-2013-cmt-guideline'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_motor_*',
      field: 'prevalence_notes',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'motor-plagiocephaly-back-to-sleep',
    claim: 'Positional plagiocephaly rates increased since Back to Sleep campaign. Supine sleeping still recommended (SIDS prevention outweighs).',
    claimType: 'prevalence',
    citationIds: ['laughlin-2011-positional-deformities'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_motor_*',
      field: 'prevalence_notes',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
  {
    id: 'motor-vitd-gulf',
    claim: 'Vitamin D deficiency in GCC populations (despite sunny climate) can affect muscle tone and motor development',
    claimType: 'safety',
    citationIds: ['gulf-2020-pediatric-nutrition'],
    contentRef: {
      layer: 'intervention',
      contentId: 'proto_motor_gulf_v1',
      field: 'genetic_considerations',
    },
    strongestGrade: '4',
    clinicianReviewed: false,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// COMBINED DOMAIN MAP
// ════════════════════════════════════════════════════════════════════════════

const ALL_CLAIMS = [
  ...AMBLYOPIA_CLAIMS,
  ...IRON_DEFICIENCY_CLAIMS,
  ...SPEECH_CLAIMS,
  ...BEHAVIORAL_CLAIMS,
  ...MOTOR_CLAIMS,
]

export const INTERVENTION_EVIDENCE_MAP: DomainEvidenceMap = {
  domain: 'intervention_protocols',
  citations: ALL_INTERVENTION_CITATIONS,
  claims: ALL_CLAIMS,
  audit: {
    totalClaims: ALL_CLAIMS.length,
    citedClaims: ALL_CLAIMS.filter(c => c.citationIds.length > 0).length,
    uncitedClaims: ALL_CLAIMS.filter(c => c.citationIds.length === 0).length,
    grade1Count: ALL_CLAIMS.filter(c => c.strongestGrade.startsWith('1')).length,
    grade2Count: ALL_CLAIMS.filter(c => c.strongestGrade.startsWith('2')).length,
    grade3Count: ALL_CLAIMS.filter(c => c.strongestGrade === '3').length,
    grade4Count: ALL_CLAIMS.filter(c => c.strongestGrade === '4').length,
    grade5Count: ALL_CLAIMS.filter(c => c.strongestGrade === '5').length,
    verifiedCitations: ALL_INTERVENTION_CITATIONS.filter(c => c.verified).length,
    unverifiedCitations: ALL_INTERVENTION_CITATIONS.filter(c => !c.verified).length,
    clinicianReviewedClaims: ALL_CLAIMS.filter(c => c.clinicianReviewed).length,
    lastAuditDate: '2026-04-02',
  },
}

/**
 * Get all claims for a specific protocol
 */
export function getClaimsForProtocol(protocolId: string): EvidenceClaim[] {
  return ALL_CLAIMS.filter(c =>
    c.contentRef.contentId === protocolId ||
    c.contentRef.contentId.replace('*', '').length > 0 &&
    protocolId.includes(c.contentRef.contentId.replace('*', '').replace('proto_', ''))
  )
}

/**
 * Get claims that need stronger evidence (Grade 4 or 5 only)
 */
export function getWeaklyEvidencedClaims(): EvidenceClaim[] {
  return ALL_CLAIMS.filter(c => c.strongestGrade === '4' || c.strongestGrade === '5')
}

/**
 * Get claims not yet reviewed by a clinician
 */
export function getUnreviewedClaims(): EvidenceClaim[] {
  return ALL_CLAIMS.filter(c => !c.clinicianReviewed)
}
