// Client-side module

/**
 * MedScribe Engine — Structured clinical extraction for pediatric consultations
 *
 * Designed for the Pediatrician Console — doctors seeing walk-in patients
 * or follow-ups from SKIDS screening referrals.
 *
 * Features:
 *   1. Consultation extraction — chief complaint, history, exam, Rx, labs, referrals
 *   2. Repair prompts — re-prompt LLM on malformed JSON output
 *   3. Chunking — split long dictations into segments, process independently
 *   4. Consolidation — merge multi-chunk results into coherent report
 *   5. SKIDS integration — links findings back to screening chip IDs when available
 *   6. Graceful degradation — keyword fallback when LLM unavailable
 */

import type { LLMConfig, LLMResponse, LLMMessage } from './llm-gateway'
import { queryLLM } from './llm-gateway'

// ============================================
// TYPES
// ============================================

export interface ConsultationExtraction {
  /** Chief complaint / reason for visit */
  chiefComplaint: string
  /** History of presenting illness */
  hpiNarrative: string
  /** Clinical examination findings */
  findings: ClinicalFinding[]
  /** Diagnoses (working + differential) */
  diagnoses: Diagnosis[]
  /** Prescriptions */
  prescriptions: Prescription[]
  /** Lab / investigation orders */
  labOrders: LabOrder[]
  /** Referrals to specialists */
  referrals: Referral[]
  /** SOAP-structured clinical summary */
  clinicalSummary: {
    subjective: string   // Chief complaint + HPI + parent reports
    objective: string    // Examination findings + vitals
    assessment: string   // Diagnoses + clinical reasoning
    plan: string         // Rx + labs + referrals + follow-up
  }
  /** Follow-up plan */
  followUp: {
    interval: string     // e.g. "1 week", "3 months"
    instructions: string[]  // Parent/caretaker instructions
    redFlags: string[]      // "Return immediately if..."
  }
  /** ICD-10 codes for diagnoses */
  icdCodes: Array<{ code: string; description: string; type: 'primary' | 'secondary' }>
  /** Visit type context */
  visitType: 'walk_in' | 'skids_followup' | 'referral' | 'routine_checkup'
  /** SKIDS screening chip IDs confirmed/updated by this consultation */
  skidsChipsConfirmed: string[]
  skidsChipsAdded: string[]
  /** Urgency level */
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
  /** Free-text doctor notes preserved verbatim */
  rawNotes: string
  /** Processing metadata */
  meta: {
    provider: string
    model: string
    latencyMs: number
    chunksProcessed: number
    repairAttempts: number
  }
}

export interface ClinicalFinding {
  /** Human-readable finding name */
  label: string
  /** Body system: cardiovascular, respiratory, GI, neuro, MSK, skin, ENT, eyes, general */
  system: string
  /** Matching SKIDS chip ID (if applicable) */
  chipId?: string
  /** normal, mild, moderate, severe */
  severity: 'normal' | 'mild' | 'moderate' | 'severe'
  /** Brief clinical note */
  note: string
}

export interface Diagnosis {
  /** Diagnosis name */
  name: string
  /** ICD-10 code */
  icdCode?: string
  /** working (most likely) or differential (to rule out) */
  type: 'working' | 'differential'
  /** Confidence 0-1 */
  confidence: number
}

export interface Prescription {
  /** Drug name (generic preferred) */
  drug: string
  /** Dose e.g. "250mg" */
  dose: string
  /** Route: oral, topical, IM, IV, inhaled */
  route: string
  /** Frequency e.g. "twice daily", "TID" */
  frequency: string
  /** Duration e.g. "5 days", "2 weeks" */
  duration: string
  /** Special instructions e.g. "after meals", "with milk" */
  instructions?: string
}

export interface LabOrder {
  /** Test name */
  test: string
  /** Urgency */
  urgency: 'routine' | 'urgent' | 'stat'
  /** Clinical reason */
  reason: string
}

export interface Referral {
  /** Specialty */
  specialty: string
  /** Reason for referral */
  reason: string
  /** Urgency */
  urgency: 'routine' | 'soon' | 'urgent'
}

// ============================================
// CHUNK + PROCESS + MERGE + CONSOLIDATE
// ============================================

const MAX_CHUNK_CHARS = 3200
const MAX_TRANSCRIPT_FOR_SINGLE_PASS = 6000

function chunkTranscript(transcript: string): string[] {
  if (transcript.length <= MAX_TRANSCRIPT_FOR_SINGLE_PASS) {
    return [transcript]
  }

  const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [transcript]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_CHUNK_CHARS && current.length > 0) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks
}

function mergeExtractions(results: ConsultationExtraction[]): ConsultationExtraction {
  if (results.length === 1) return results[0]

  // Deduplicate findings by label
  const seenFindings = new Set<string>()
  const allFindings: ClinicalFinding[] = []
  for (const r of results) {
    for (const f of r.findings) {
      const key = f.label.toLowerCase()
      if (!seenFindings.has(key)) { seenFindings.add(key); allFindings.push(f) }
    }
  }

  // Deduplicate prescriptions by drug name
  const seenDrugs = new Set<string>()
  const allRx: Prescription[] = []
  for (const r of results) {
    for (const rx of r.prescriptions) {
      const key = rx.drug.toLowerCase()
      if (!seenDrugs.has(key)) { seenDrugs.add(key); allRx.push(rx) }
    }
  }

  // Deduplicate diagnoses
  const seenDx = new Set<string>()
  const allDx: Diagnosis[] = []
  for (const r of results) {
    for (const dx of r.diagnoses) {
      const key = dx.name.toLowerCase()
      if (!seenDx.has(key)) { seenDx.add(key); allDx.push(dx) }
    }
  }

  // Merge labs, referrals, ICD codes
  const seenLabs = new Set<string>()
  const allLabs = results.flatMap(r => r.labOrders).filter(l => { const k = l.test.toLowerCase(); if (seenLabs.has(k)) return false; seenLabs.add(k); return true })
  const seenRefs = new Set<string>()
  const allRefs = results.flatMap(r => r.referrals).filter(r => { const k = r.specialty.toLowerCase(); if (seenRefs.has(k)) return false; seenRefs.add(k); return true })
  const seenIcd = new Set<string>()
  const allIcd = results.flatMap(r => r.icdCodes).filter(i => { if (seenIcd.has(i.code)) return false; seenIcd.add(i.code); return true })

  // Use highest urgency
  const urgencyOrder = ['routine', 'soon', 'urgent', 'emergency'] as const
  const maxUrgency = results.reduce((max, r) => {
    return urgencyOrder.indexOf(r.urgency) > urgencyOrder.indexOf(max) ? r.urgency : max
  }, 'routine' as typeof urgencyOrder[number])

  const summaryParts = results.map(r => r.clinicalSummary)

  return {
    chiefComplaint: results.map(r => r.chiefComplaint).filter(Boolean).join('; ') || '',
    hpiNarrative: results.map(r => r.hpiNarrative).filter(Boolean).join(' '),
    findings: allFindings,
    diagnoses: allDx,
    prescriptions: allRx,
    labOrders: allLabs,
    referrals: allRefs,
    clinicalSummary: {
      subjective: summaryParts.map(s => s.subjective).filter(Boolean).join(' '),
      objective: summaryParts.map(s => s.objective).filter(Boolean).join(' '),
      assessment: summaryParts.map(s => s.assessment).filter(Boolean).join(' '),
      plan: summaryParts.map(s => s.plan).filter(Boolean).join(' '),
    },
    followUp: {
      interval: results.find(r => r.followUp.interval)?.followUp.interval || '',
      instructions: [...new Set(results.flatMap(r => r.followUp.instructions))],
      redFlags: [...new Set(results.flatMap(r => r.followUp.redFlags))],
    },
    icdCodes: allIcd,
    visitType: results[0]?.visitType || 'walk_in',
    skidsChipsConfirmed: [...new Set(results.flatMap(r => r.skidsChipsConfirmed))],
    skidsChipsAdded: [...new Set(results.flatMap(r => r.skidsChipsAdded))],
    urgency: maxUrgency,
    rawNotes: results.map(r => r.rawNotes).join('\n'),
    meta: {
      provider: results[0]?.meta.provider || 'unknown',
      model: results[0]?.meta.model || 'unknown',
      latencyMs: results.reduce((sum, r) => sum + r.meta.latencyMs, 0),
      chunksProcessed: results.length,
      repairAttempts: results.reduce((sum, r) => sum + r.meta.repairAttempts, 0),
    },
  }
}

// ============================================
// JSON PARSING WITH REPAIR
// ============================================

function tryParseJSON(text: string): ConsultationExtraction | null {
  let jsonStr = text.trim()

  // Strip markdown code fences
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) jsonStr = fenceMatch[1].trim()

  // Find JSON object
  const objMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!objMatch) return null

  try {
    const parsed = JSON.parse(objMatch[0])
    return normalizeExtraction(parsed)
  } catch {
    return null
  }
}

function normalizeExtraction(raw: Record<string, unknown>): ConsultationExtraction {
  const arr = (v: unknown) => Array.isArray(v) ? v : []
  const str = (v: unknown) => typeof v === 'string' ? v : ''

  const findings = arr(raw.findings).map((f: any) => ({
    label: str(f.label) || 'Unknown',
    system: str(f.system) || 'general',
    chipId: f.chipId ? str(f.chipId) : undefined,
    severity: (['normal', 'mild', 'moderate', 'severe'].includes(str(f.severity)) ? str(f.severity) : 'normal') as ClinicalFinding['severity'],
    note: str(f.note),
  }))

  const diagnoses = arr(raw.diagnoses).map((d: any) => ({
    name: str(d.name),
    icdCode: d.icdCode ? str(d.icdCode) : undefined,
    type: (['working', 'differential'].includes(str(d.type)) ? str(d.type) : 'working') as Diagnosis['type'],
    confidence: typeof d.confidence === 'number' ? Math.min(1, Math.max(0, d.confidence)) : 0.7,
  }))

  const prescriptions = arr(raw.prescriptions).map((rx: any) => ({
    drug: str(rx.drug),
    dose: str(rx.dose),
    route: str(rx.route) || 'oral',
    frequency: str(rx.frequency),
    duration: str(rx.duration),
    instructions: rx.instructions ? str(rx.instructions) : undefined,
  }))

  const labOrders = arr(raw.labOrders || raw.lab_orders).map((l: any) => ({
    test: str(l.test),
    urgency: (['routine', 'urgent', 'stat'].includes(str(l.urgency)) ? str(l.urgency) : 'routine') as LabOrder['urgency'],
    reason: str(l.reason),
  }))

  const referrals = arr(raw.referrals).map((r: any) => ({
    specialty: str(r.specialty),
    reason: str(r.reason),
    urgency: (['routine', 'soon', 'urgent'].includes(str(r.urgency)) ? str(r.urgency) : 'routine') as Referral['urgency'],
  }))

  const summary = (raw.clinicalSummary || raw.clinical_summary || {}) as any
  const followUpRaw = (raw.followUp || raw.follow_up || {}) as any

  return {
    chiefComplaint: str(raw.chiefComplaint || raw.chief_complaint),
    hpiNarrative: str(raw.hpiNarrative || raw.hpi_narrative || raw.hpi),
    findings,
    diagnoses,
    prescriptions,
    labOrders,
    referrals,
    clinicalSummary: {
      subjective: str(summary.subjective),
      objective: str(summary.objective),
      assessment: str(summary.assessment),
      plan: str(summary.plan),
    },
    followUp: {
      interval: str(followUpRaw.interval),
      instructions: arr(followUpRaw.instructions).map(String),
      redFlags: arr(followUpRaw.redFlags || followUpRaw.red_flags).map(String),
    },
    icdCodes: arr(raw.icdCodes || raw.icd_codes).map((i: any) => ({
      code: str(i.code),
      description: str(i.description),
      type: (['primary', 'secondary'].includes(str(i.type)) ? str(i.type) : 'secondary') as 'primary' | 'secondary',
    })),
    visitType: (['walk_in', 'skids_followup', 'referral', 'routine_checkup'].includes(str(raw.visitType || raw.visit_type))
      ? str(raw.visitType || raw.visit_type) : 'walk_in') as ConsultationExtraction['visitType'],
    skidsChipsConfirmed: arr(raw.skidsChipsConfirmed || raw.skids_chips_confirmed).map(String),
    skidsChipsAdded: arr(raw.skidsChipsAdded || raw.skids_chips_added).map(String),
    urgency: (['routine', 'soon', 'urgent', 'emergency'].includes(str(raw.urgency))
      ? str(raw.urgency) : 'routine') as ConsultationExtraction['urgency'],
    rawNotes: str(raw.rawNotes || raw.raw_notes),
    meta: { provider: '', model: '', latencyMs: 0, chunksProcessed: 1, repairAttempts: 0 },
  }
}

function buildRepairPrompt(rawOutput: string): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `The following output was not valid JSON. Fix it and return ONLY a valid JSON object. No markdown fences, no explanation. Keep all medical content intact.`
    },
    {
      role: 'user',
      content: `Fix this JSON:\n\n${rawOutput.slice(0, 3000)}`
    }
  ]
}

// ============================================
// KEYWORD FALLBACK
// ============================================

const KEYWORD_PATTERNS: Record<string, { system: string; severity: ClinicalFinding['severity'] }> = {
  'dental caries': { system: 'ENT', severity: 'moderate' },
  'gingivitis': { system: 'ENT', severity: 'mild' },
  'tonsillitis': { system: 'ENT', severity: 'moderate' },
  'otitis media': { system: 'ENT', severity: 'moderate' },
  'strabismus': { system: 'eyes', severity: 'moderate' },
  'conjunctivitis': { system: 'eyes', severity: 'mild' },
  'anemia': { system: 'general', severity: 'moderate' },
  'pallor': { system: 'general', severity: 'moderate' },
  'malnutrition': { system: 'general', severity: 'severe' },
  'fever': { system: 'general', severity: 'moderate' },
  'pneumonia': { system: 'respiratory', severity: 'severe' },
  'wheeze': { system: 'respiratory', severity: 'moderate' },
  'asthma': { system: 'respiratory', severity: 'moderate' },
  'diarrhea': { system: 'GI', severity: 'moderate' },
  'constipation': { system: 'GI', severity: 'mild' },
  'worm infestation': { system: 'GI', severity: 'mild' },
  'scabies': { system: 'skin', severity: 'mild' },
  'eczema': { system: 'skin', severity: 'mild' },
  'impetigo': { system: 'skin', severity: 'moderate' },
  'ringworm': { system: 'skin', severity: 'mild' },
  'scoliosis': { system: 'MSK', severity: 'moderate' },
  'flat feet': { system: 'MSK', severity: 'mild' },
  'speech delay': { system: 'neuro', severity: 'moderate' },
  'autism': { system: 'neuro', severity: 'moderate' },
  'ADHD': { system: 'neuro', severity: 'moderate' },
  'seizure': { system: 'neuro', severity: 'severe' },
  'heart murmur': { system: 'cardiovascular', severity: 'moderate' },
}

function keywordFallback(transcript: string): ConsultationExtraction {
  const findings: ClinicalFinding[] = []
  const lower = transcript.toLowerCase()

  for (const [label, { system, severity }] of Object.entries(KEYWORD_PATTERNS)) {
    if (lower.includes(label.toLowerCase())) {
      findings.push({ label, system, severity, note: 'Keyword match (AI unavailable)' })
    }
  }

  // Try to extract drug names (common pediatric)
  const drugPatterns = /\b(amoxicillin|paracetamol|ibuprofen|cetirizine|azithromycin|cefixime|albendazole|iron syrup|multivitamin|ORS|zinc|salbutamol|montelukast|permethrin|clotrimazole|mupirocin)\b/gi
  const drugs = [...new Set(lower.match(drugPatterns) || [])]
  const prescriptions: Prescription[] = drugs.map(d => ({
    drug: d.charAt(0).toUpperCase() + d.slice(1),
    dose: '', route: 'oral', frequency: '', duration: '',
  }))

  return {
    chiefComplaint: transcript.slice(0, 200),
    hpiNarrative: '',
    findings,
    diagnoses: [],
    prescriptions,
    labOrders: [],
    referrals: [],
    clinicalSummary: {
      subjective: transcript.slice(0, 500),
      objective: `${findings.length} keyword matches`,
      assessment: findings.length > 0 ? 'Findings detected via keyword extraction (AI unavailable)' : 'No keyword matches',
      plan: prescriptions.length > 0 ? `${prescriptions.length} medications mentioned` : '',
    },
    followUp: { interval: '', instructions: [], redFlags: [] },
    icdCodes: [],
    visitType: 'walk_in',
    skidsChipsConfirmed: [],
    skidsChipsAdded: [],
    urgency: findings.some(f => f.severity === 'severe') ? 'urgent' : 'routine',
    rawNotes: transcript,
    meta: { provider: 'keyword-fallback', model: 'regex', latencyMs: 0, chunksProcessed: 1, repairAttempts: 0 },
  }
}

// ============================================
// EXTRACTION PROMPT (CONSULTATION-FOCUSED)
// ============================================

function buildExtractionPrompt(
  transcript: string,
  options: {
    visitType?: string
    childAge?: string
    childName?: string
    skidsScreeningData?: string  // Summary of prior SKIDS screening if available
  }
): LLMMessage[] {
  const { visitType, childAge, childName, skidsScreeningData } = options

  let systemPrompt = `You are a pediatric consultation assistant for the SKIDS Health platform. A pediatrician is dictating their clinical notes during or after examining a child. Extract structured consultation data from the dictation.

CONTEXT: This is a clinical CONSULTATION (not a screening). The doctor is examining, diagnosing, and treating a patient.

RULES:
- Extract only what the doctor actually said — never fabricate
- Use generic drug names where possible
- Include dosage, frequency, duration for all prescriptions
- Suggest ICD-10 codes appropriate for pediatric diagnoses
- Rate urgency honestly
- If the doctor says something is normal, include it as a finding with severity "normal"
- Return ONLY valid JSON, no markdown, no explanation`

  if (visitType === 'skids_followup' && skidsScreeningData) {
    systemPrompt += `\n\nSKIDS SCREENING CONTEXT: This child was previously screened by a SKIDS nurse. The screening findings were:\n${skidsScreeningData}\nThe doctor is now seeing the child for follow-up. Note which screening findings the doctor confirms, updates, or disagrees with.`
  }

  if (childAge) systemPrompt += `\nPatient age: ${childAge}. Use age-appropriate dosing and norms.`
  if (childName) systemPrompt += `\nPatient name: ${childName}.`

  systemPrompt += `

Return JSON in this format:
{
  "chiefComplaint": "Reason for visit in doctor's words",
  "hpiNarrative": "History of presenting illness",
  "findings": [
    { "label": "Finding name", "system": "body system", "chipId": "skids_chip_id_if_applicable", "severity": "normal|mild|moderate|severe", "note": "Clinical note" }
  ],
  "diagnoses": [
    { "name": "Diagnosis", "icdCode": "ICD-10 code", "type": "working|differential", "confidence": 0.0-1.0 }
  ],
  "prescriptions": [
    { "drug": "Generic name", "dose": "250mg", "route": "oral", "frequency": "TID", "duration": "5 days", "instructions": "after meals" }
  ],
  "labOrders": [
    { "test": "CBC", "urgency": "routine|urgent|stat", "reason": "suspected anemia" }
  ],
  "referrals": [
    { "specialty": "ENT", "reason": "Grade 3 tonsillar hypertrophy", "urgency": "routine|soon|urgent" }
  ],
  "clinicalSummary": {
    "subjective": "Patient/parent complaints and history",
    "objective": "Examination findings, vitals, measurements",
    "assessment": "Clinical reasoning and diagnoses",
    "plan": "Treatment, labs, referrals, follow-up"
  },
  "followUp": {
    "interval": "1 week",
    "instructions": ["Complete full course of antibiotics", "Plenty of fluids"],
    "redFlags": ["Return if fever >103F", "Return if difficulty breathing"]
  },
  "icdCodes": [
    { "code": "J03.9", "description": "Acute tonsillitis", "type": "primary|secondary" }
  ],
  "visitType": "walk_in|skids_followup|referral|routine_checkup",
  "skidsChipsConfirmed": ["chip_ids confirmed from screening"],
  "skidsChipsAdded": ["new chip_ids found in consultation"],
  "urgency": "routine|soon|urgent|emergency"
}`

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Doctor's dictation:\n\n"${transcript}"` }
  ]
}

// ============================================
// MAIN EXTRACTION PIPELINE
// ============================================

export async function extractConsultation(
  transcript: string,
  config: LLMConfig,
  options?: {
    visitType?: 'walk_in' | 'skids_followup' | 'referral' | 'routine_checkup'
    childAge?: string
    childName?: string
    skidsScreeningData?: string
    onProgress?: (status: string) => void
  }
): Promise<ConsultationExtraction> {
  const { visitType, childAge, childName, skidsScreeningData, onProgress } = options || {}

  if (!transcript.trim()) return emptyExtraction()

  // Step 1: Chunk
  const chunks = chunkTranscript(transcript)
  onProgress?.(`Processing ${chunks.length} chunk${chunks.length > 1 ? 's' : ''}...`)

  // Step 2: Process each chunk
  const chunkResults: ConsultationExtraction[] = []

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(`Analyzing chunk ${i + 1}/${chunks.length}...`)
    const result = await processChunk(chunks[i], config, { visitType, childAge, childName, skidsScreeningData })
    chunkResults.push(result)
  }

  // Step 3: Merge
  let merged = mergeExtractions(chunkResults)

  // Step 4: Consolidation pass for multi-chunk
  if (chunks.length > 1) {
    onProgress?.('Consolidating results...')
    merged = await consolidateResults(merged, config)
  }

  merged.meta.chunksProcessed = chunks.length
  merged.rawNotes = transcript
  if (visitType) merged.visitType = visitType

  return merged
}

async function processChunk(
  chunk: string,
  config: LLMConfig,
  options: { visitType?: string; childAge?: string; childName?: string; skidsScreeningData?: string }
): Promise<ConsultationExtraction> {
  const startTime = performance.now()
  const messages = buildExtractionPrompt(chunk, options)

  let responses: LLMResponse[]
  try {
    responses = await queryLLM(config, messages)
  } catch {
    return keywordFallback(chunk)
  }

  const response = responses.find(r => !r.error && r.text)
  if (!response) return keywordFallback(chunk)

  let extraction = tryParseJSON(response.text)

  // Repair attempt
  let repairAttempts = 0
  if (!extraction && response.text.length > 20) {
    repairAttempts = 1
    try {
      const repairMessages = buildRepairPrompt(response.text)
      const repairResponses = await queryLLM(config, repairMessages)
      const repairResponse = repairResponses.find(r => !r.error && r.text)
      if (repairResponse) extraction = tryParseJSON(repairResponse.text)
    } catch { /* fall through */ }
  }

  if (!extraction) {
    const fallback = keywordFallback(chunk)
    fallback.meta.repairAttempts = repairAttempts
    return fallback
  }

  extraction.meta = {
    provider: response.provider,
    model: response.model,
    latencyMs: Math.round(performance.now() - startTime),
    chunksProcessed: 1,
    repairAttempts,
  }
  extraction.rawNotes = chunk

  return extraction
}

async function consolidateResults(merged: ConsultationExtraction, config: LLMConfig): Promise<ConsultationExtraction> {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: `Consolidate these partial clinical extraction results into one coherent consultation record. Remove duplicates, ensure prescription doses are consistent, and produce a single coherent SOAP summary. Return ONLY valid JSON.`
    },
    {
      role: 'user',
      content: `Partial results to consolidate:\n\n${JSON.stringify({
        chiefComplaint: merged.chiefComplaint,
        findings: merged.findings,
        diagnoses: merged.diagnoses,
        prescriptions: merged.prescriptions,
        labOrders: merged.labOrders,
        referrals: merged.referrals,
        clinicalSummary: merged.clinicalSummary,
        followUp: merged.followUp,
      }, null, 1)}`
    }
  ]

  try {
    const responses = await queryLLM(config, messages)
    const response = responses.find(r => !r.error && r.text)
    if (response) {
      const consolidated = tryParseJSON(response.text)
      if (consolidated) {
        consolidated.meta = merged.meta
        consolidated.rawNotes = merged.rawNotes
        consolidated.visitType = merged.visitType
        return consolidated
      }
    }
  } catch { /* return merged as-is */ }

  return merged
}

function emptyExtraction(): ConsultationExtraction {
  return {
    chiefComplaint: '', hpiNarrative: '',
    findings: [], diagnoses: [], prescriptions: [], labOrders: [], referrals: [],
    clinicalSummary: { subjective: '', objective: '', assessment: '', plan: '' },
    followUp: { interval: '', instructions: [], redFlags: [] },
    icdCodes: [], visitType: 'walk_in',
    skidsChipsConfirmed: [], skidsChipsAdded: [],
    urgency: 'routine', rawNotes: '',
    meta: { provider: 'none', model: 'none', latencyMs: 0, chunksProcessed: 0, repairAttempts: 0 },
  }
}
