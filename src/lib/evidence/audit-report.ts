/**
 * SKIDS Evidence Audit Report Generator
 *
 * Generates audit reports for any domain's evidence map.
 * Reports identify gaps, weak evidence, and unverified citations.
 */

import type { DomainEvidenceMap, AuditReport, AuditFinding, EvidenceGrade } from './types'

/**
 * Generate a full audit report for a domain
 */
export function generateAuditReport(map: DomainEvidenceMap): AuditReport {
  const findings: AuditFinding[] = []

  // ── Check for uncited claims ──
  const uncited = map.claims.filter(c => c.citationIds.length === 0)
  for (const claim of uncited) {
    findings.push({
      severity: 'critical',
      message: `Uncited claim: "${claim.claim}"`,
      contentRef: `${claim.contentRef.layer}/${claim.contentRef.contentId}/${claim.contentRef.field}`,
      recommendation: 'Add at least one citation supporting this claim',
    })
  }

  // ── Check for unverified citations ──
  const unverified = map.citations.filter(c => !c.verified)
  for (const cit of unverified) {
    findings.push({
      severity: 'warning',
      message: `Unverified citation: "${cit.title}" (${cit.authors}, ${cit.year})`,
      contentRef: cit.id,
      recommendation: 'Verify via PubMed/DOI search. Add PMID and DOI.',
    })
  }

  // ── Check for red flag / safety claims with weak evidence ──
  const weakSafetyClaims = map.claims.filter(
    c => (c.claimType === 'red_flag' || c.claimType === 'safety' || c.claimType === 'dosage') &&
      (c.strongestGrade === '4' || c.strongestGrade === '5')
  )
  for (const claim of weakSafetyClaims) {
    findings.push({
      severity: 'warning',
      message: `Safety/dosage claim has only Grade ${claim.strongestGrade} evidence: "${claim.claim}"`,
      contentRef: `${claim.contentRef.layer}/${claim.contentRef.contentId}/${claim.contentRef.field}`,
      recommendation: 'Seek Grade 1-3 evidence (RCT, cohort study, or systematic review)',
    })
  }

  // ── Check for recommendation claims with only Grade 5 ──
  const weakRecommendations = map.claims.filter(
    c => c.claimType === 'recommendation' && c.strongestGrade === '5'
  )
  for (const claim of weakRecommendations) {
    findings.push({
      severity: 'warning',
      message: `Clinical recommendation relies solely on textbook/theory (Grade 5): "${claim.claim}"`,
      contentRef: `${claim.contentRef.layer}/${claim.contentRef.contentId}/${claim.contentRef.field}`,
      recommendation: 'Add supporting clinical guideline or empirical study',
    })
  }

  // ── Check for claims not clinician-reviewed ──
  const unreviewed = map.claims.filter(c => !c.clinicianReviewed)
  if (unreviewed.length > 0) {
    findings.push({
      severity: 'info',
      message: `${unreviewed.length} of ${map.claims.length} claims have not been reviewed by a clinician`,
      contentRef: map.domain,
      recommendation: 'Schedule clinician review session. Target: 100% review before production.',
    })
  }

  // ── Grade distribution ──
  const gradeDistribution: Record<EvidenceGrade, number> = {
    '1a': 0, '1b': 0, '2a': 0, '2b': 0, '3': 0, '4': 0, '5': 0,
  }
  for (const claim of map.claims) {
    gradeDistribution[claim.strongestGrade]++
  }

  // ── Summary stats ──
  const grades = map.claims.map(c => c.strongestGrade).sort()
  const strongestOverall = grades[0] || '5'
  const weakestClaim = grades[grades.length - 1] || '5'

  // ── Minimum standard check ──
  // Intervention protocols must have at least one Grade 1a/1b citation
  const hasGrade1 = map.claims.some(c => c.strongestGrade === '1a' || c.strongestGrade === '1b')
  const allClaimed = map.audit.uncitedClaims === 0
  const meetsMinimum = hasGrade1 && allClaimed

  return {
    generatedAt: new Date().toISOString(),
    domain: map.domain,
    summary: {
      totalCitations: map.citations.length,
      verifiedCitations: map.citations.filter(c => c.verified).length,
      totalClaims: map.claims.length,
      citedClaims: map.claims.filter(c => c.citationIds.length > 0).length,
      clinicianReviewed: map.claims.filter(c => c.clinicianReviewed).length,
      strongestOverallGrade: strongestOverall as EvidenceGrade,
      weakestClaimGrade: weakestClaim as EvidenceGrade,
    },
    findings,
    gradeDistribution,
    meetsMinimumStandard: meetsMinimum,
  }
}

/**
 * Format audit report as readable text
 */
export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════')
  lines.push(`SKIDS Evidence Audit Report — ${report.domain}`)
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')

  lines.push('SUMMARY')
  lines.push(`  Total Citations:     ${report.summary.totalCitations}`)
  lines.push(`  Verified (DOI/PMID): ${report.summary.verifiedCitations}`)
  lines.push(`  Total Claims:        ${report.summary.totalClaims}`)
  lines.push(`  Cited Claims:        ${report.summary.citedClaims}`)
  lines.push(`  Clinician Reviewed:  ${report.summary.clinicianReviewed}`)
  lines.push(`  Strongest Grade:     ${report.summary.strongestOverallGrade}`)
  lines.push(`  Weakest Claim Grade: ${report.summary.weakestClaimGrade}`)
  lines.push(`  Meets Minimum:       ${report.meetsMinimumStandard ? 'YES ✓' : 'NO ✗'}`)
  lines.push('')

  lines.push('EVIDENCE GRADE DISTRIBUTION')
  for (const [grade, count] of Object.entries(report.gradeDistribution)) {
    const bar = '█'.repeat(count)
    lines.push(`  Grade ${grade}: ${bar} (${count})`)
  }
  lines.push('')

  const critical = report.findings.filter(f => f.severity === 'critical')
  const warnings = report.findings.filter(f => f.severity === 'warning')
  const info = report.findings.filter(f => f.severity === 'info')

  if (critical.length > 0) {
    lines.push(`CRITICAL (${critical.length})`)
    for (const f of critical) {
      lines.push(`  ✗ ${f.message}`)
      lines.push(`    → ${f.recommendation}`)
    }
    lines.push('')
  }

  if (warnings.length > 0) {
    lines.push(`WARNINGS (${warnings.length})`)
    for (const f of warnings) {
      lines.push(`  ⚠ ${f.message}`)
      lines.push(`    → ${f.recommendation}`)
    }
    lines.push('')
  }

  if (info.length > 0) {
    lines.push(`INFO (${info.length})`)
    for (const f of info) {
      lines.push(`  ℹ ${f.message}`)
      lines.push(`    → ${f.recommendation}`)
    }
  }

  return lines.join('\n')
}
