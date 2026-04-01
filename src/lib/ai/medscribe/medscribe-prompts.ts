/**
 * MedScribe SKIDS-Specific Prompts & Chip Mapping
 *
 * Maps extracted clinical findings to SKIDS screening module chip IDs.
 * Used by the MedScribe extraction engine to auto-tag findings.
 */

/** Module-to-conditions mapping (derived from MODULE_INSTRUCTIONS) */
export const MODULE_CHIP_MAP: Record<string, string[]> = {
  dental: [
    'dental_caries', 'missing_teeth', 'filled_teeth', 'malocclusion_class1', 'malocclusion_class2', 'malocclusion_class3',
    'gingivitis', 'plaque_calculus', 'coated_tongue', 'geographic_tongue', 'oral_ulcers', 'candidiasis',
    'enamel_hypoplasia', 'fluorosis', 'crowding', 'spacing', 'crossbite', 'open_bite', 'high_arched_palate', 'cleft_lip_palate_scar',
  ],
  skin: [
    'eczema', 'scabies', 'impetigo', 'fungal_infection', 'urticaria', 'birthmark', 'bruise_contusion', 'rash', 'wound',
  ],
  ear: [
    'wax_impaction', 'discharge_serous', 'discharge_mucopurulent', 'discharge_bloody', 'tm_perforation',
    'foreign_body', 'otitis_externa', 'otitis_media',
  ],
  throat: [
    'tonsillar_hypertrophy_g1', 'tonsillar_hypertrophy_g2', 'tonsillar_hypertrophy_g3', 'tonsillar_hypertrophy_g4',
    'pharyngeal_erythema', 'tonsillar_exudate', 'cobblestoning', 'uvula_deviation', 'postnasal_drip',
    'peritonsillar_abscess', 'elongated_uvula',
  ],
  eyes_external: [
    'strabismus_eso', 'strabismus_exo', 'ptosis', 'conjunctival_injection', 'conjunctival_pallor',
    'subconjunctival_hemorrhage', 'stye_chalazion', 'blepharitis', 'epiphora', 'periorbital_edema',
    'proptosis', 'nystagmus', 'anisocoria', 'corneal_opacity',
  ],
  general_appearance: [
    'well_nourished', 'malnourished', 'pallor', 'icterus', 'cyanosis', 'facial_edema',
    'pedal_edema', 'dehydration', 'poor_hygiene', 'syndromic_features', 'lethargy',
  ],
  motor: [
    'limp', 'asymmetry', 'joint_swelling', 'limited_rom', 'tremor', 'hypotonia', 'hypertonia',
  ],
  neuro: [
    'speech_delay', 'social_withdrawal', 'hyperactivity', 'attention_deficit', 'poor_eye_contact', 'repetitive_behaviors',
  ],
  hair: [
    'pediculosis', 'dandruff', 'alopecia_areata', 'tinea_capitis', 'folliculitis',
    'dry_brittle_hair', 'premature_graying', 'cradle_cap', 'psoriasis_patches',
  ],
  nose: [
    'deviated_septum', 'nasal_discharge_clear', 'nasal_discharge_mucopurulent', 'nasal_discharge_bloody',
    'turbinate_hypertrophy', 'nasal_polyps', 'vestibulitis', 'crusting',
    'epistaxis_signs', 'allergic_crease', 'allergic_shiners', 'nasal_flaring',
  ],
  nails: [
    'clubbing', 'koilonychia', 'nail_pallor', 'nail_cyanosis', 'splinter_hemorrhages',
    'onychomycosis', 'nail_pitting', 'beau_lines', 'leukonychia', 'paronychia', 'bitten_nails', 'ridging',
  ],
  posture: [
    'scoliosis', 'kyphosis', 'lordosis', 'uneven_shoulders', 'pelvic_tilt', 'head_tilt',
    'winged_scapula', 'pes_planus', 'pes_cavus', 'genu_valgum', 'genu_varum', 'leg_length_discrepancy',
  ],
  abdomen: [
    'distension', 'visible_veins', 'umbilical_hernia', 'inguinal_hernia',
    'tenderness_ruq', 'tenderness_luq', 'tenderness_rlq', 'tenderness_llq',
    'hepatomegaly', 'splenomegaly', 'ascites', 'surgical_scars', 'striae',
  ],
  neck: [
    'goiter_g0', 'goiter_g1', 'goiter_g2', 'goiter_g3',
    'cervical_lymphadenopathy_anterior', 'cervical_lymphadenopathy_posterior',
    'submandibular_lymphadenopathy', 'submental_lymphadenopathy',
    'torticollis', 'webbed_neck', 'thyroglossal_cyst', 'branchial_cyst',
  ],
  respiratory: [
    'wheeze', 'stridor', 'tachypnea', 'retractions', 'grunting', 'nasal_flaring',
  ],
}

/** Flat lookup: chipId → { moduleType, humanLabel } */
export const CHIP_LOOKUP: Record<string, { moduleType: string; label: string }> = {}

// Build flat lookup from MODULE_CHIP_MAP
for (const [moduleType, chips] of Object.entries(MODULE_CHIP_MAP)) {
  for (const chipId of chips) {
    CHIP_LOOKUP[chipId] = {
      moduleType,
      label: chipId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }
  }
}

/**
 * Fuzzy-match a finding label to the closest SKIDS chip ID.
 * Returns chipId and moduleType if confidence > threshold.
 */
export function matchFindingToChip(
  findingLabel: string,
  moduleHint?: string
): { chipId: string; moduleType: string; confidence: number } | null {
  const normalized = findingLabel.toLowerCase().replace(/[^a-z0-9\s]/g, '')

  // Try exact match first
  const exactKey = normalized.replace(/\s+/g, '_')
  if (CHIP_LOOKUP[exactKey]) {
    return { chipId: exactKey, moduleType: CHIP_LOOKUP[exactKey].moduleType, confidence: 1.0 }
  }

  // Try substring match across all chips
  let bestMatch: { chipId: string; moduleType: string; score: number } | null = null

  const searchPool = moduleHint
    ? { [moduleHint]: MODULE_CHIP_MAP[moduleHint] || [] }
    : MODULE_CHIP_MAP

  for (const [moduleType, chips] of Object.entries(searchPool)) {
    for (const chipId of chips) {
      const chipWords = chipId.replace(/_/g, ' ')
      const score = computeSimilarity(normalized, chipWords)
      if (score > 0.4 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { chipId, moduleType, score }
      }
    }
  }

  if (bestMatch) {
    return { chipId: bestMatch.chipId, moduleType: bestMatch.moduleType, confidence: bestMatch.score }
  }

  return null
}

/**
 * Simple word-overlap similarity (Jaccard-like).
 */
function computeSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 2))
  const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 2))
  if (wordsA.size === 0 || wordsB.size === 0) return 0

  let overlap = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++
    // Also check if one contains the other
    for (const wb of wordsB) {
      if (w !== wb && (w.includes(wb) || wb.includes(w))) overlap += 0.5
    }
  }

  return overlap / Math.max(wordsA.size, wordsB.size)
}

/**
 * Post-process extraction results: map findings to SKIDS chips using fuzzy matching.
 */
export function mapFindingsToChips(
  findings: Array<{ label: string; chipId?: string; moduleType?: string; severity: string; confidence: number; reasoning: string }>,
  moduleHint?: string
): Array<{ label: string; chipId?: string; moduleType?: string; severity: string; confidence: number; reasoning: string }> {
  return findings.map(f => {
    // Already has a chipId that's valid
    if (f.chipId && CHIP_LOOKUP[f.chipId]) return f

    // Try to match
    const match = matchFindingToChip(f.label, moduleHint || f.moduleType)
    if (match) {
      return {
        ...f,
        chipId: match.chipId,
        moduleType: match.moduleType,
        confidence: Math.min(f.confidence, match.confidence),
      }
    }

    return f
  })
}
