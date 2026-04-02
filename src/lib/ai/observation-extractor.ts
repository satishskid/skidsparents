/**
 * SKIDS Passive Observation Extractor
 *
 * The key insight: when a parent asks "why is my baby squinting?",
 * that IS a vision observation. The chat system silently extracts
 * and saves it to the life record.
 *
 * This extractor:
 * 1. Determines if a chat message contains an observation
 * 2. Identifies the body system domain
 * 3. Extracts the observation text
 * 4. Estimates concern level
 *
 * The parent never sees "observation saved" — the life record
 * fills itself invisibly through natural conversation.
 *
 * NOT observations: "what foods are good for toddlers?" (general question)
 * IS an observation: "my baby won't eat anything" (eating concern)
 * IS an observation: "she was squinting at the TV today" (vision observation)
 * NOT observations: "when should babies walk?" (information seeking)
 * IS an observation: "he still isn't walking at 18 months" (motor delay)
 */

import { detectDomains } from './life-record/knowledge-graph'
import type { BodySystem } from './life-record/types'

// ============================================
// TYPES
// ============================================

export interface ObservationExtraction {
  /** Is this message an observation about the child? */
  isObservation: true
  /** Primary body system domain */
  domain: BodySystem
  /** Cleaned observation text for the life record */
  observationText: string
  /** Estimated concern level */
  concernLevel: 'none' | 'mild' | 'moderate' | 'serious'
  /** Category for DB storage */
  category: string
  /** Confidence in this extraction (0-1) */
  confidence: number
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Analyze a chat message and extract an observation if present.
 * Returns null if the message is NOT an observation.
 */
export function extractObservationFromChat(
  message: string,
  childAgeMonths: number
): ObservationExtraction | null {
  const lowerMsg = message.toLowerCase().trim()

  // Step 1: Quick reject — general questions, greetings, info-seeking
  if (isGeneralQuestion(lowerMsg)) return null

  // Step 2: Check for observation indicators
  const obsScore = computeObservationScore(lowerMsg)
  if (obsScore < 0.4) return null

  // Step 3: Detect domains using the life record knowledge graph
  const domains = detectDomains(lowerMsg)
  if (domains.length === 0) {
    // Try broader domain detection
    const broadDomain = detectBroadDomain(lowerMsg)
    if (!broadDomain) return null
    domains.push(broadDomain)
  }

  // Step 4: Extract the core observation text
  const observationText = extractObservationText(message)

  // Step 5: Estimate concern level
  const concernLevel = estimateConcernLevel(lowerMsg)

  // Step 6: Map domain to category
  const category = DOMAIN_TO_CATEGORY[domains[0]] || 'General'

  return {
    isObservation: true,
    domain: domains[0],
    observationText,
    concernLevel,
    category,
    confidence: Math.min(obsScore, 0.95),
  }
}

// ============================================
// OBSERVATION DETECTION
// ============================================

/**
 * Quick reject: messages that are clearly NOT observations
 */
function isGeneralQuestion(msg: string): boolean {
  // Pure information seeking
  const infoPatterns = [
    /^(what|when|how|where|which|who) (is|are|should|does|do|can|could|would) (?!my|our|the baby|the child|she|he)/,
    /^(tell me about|explain|describe|define|what's the difference)/,
    /^(best|top|recommended|ideal|good) (foods?|books?|toys?|activities?|exercises?)/,
    /^(how (much|many|often|long)) (should|do|does)/,
    /^(is it (normal|ok|okay|fine|safe|common)) (to|for|if|that|when)/,
    /^(can|should) (i|we|babies?|toddlers?|children) /,
    /^(thank|thanks|ok|okay|sure|got it|great|good|yes|no|hi|hello|hey)/,
    /^(what age|at what age|when do) (babies?|kids?|children|toddlers?)/,
  ]

  return infoPatterns.some(p => p.test(msg))
}

/**
 * Score how likely this message contains a child observation (0-1)
 */
function computeObservationScore(msg: string): number {
  let score = 0

  // Possessive/specific child references
  if (/\b(my (baby|child|kid|son|daughter|toddler|infant)|she|he|the baby)\b/.test(msg)) score += 0.25
  if (/\b(name|names|his|her|their)\b/.test(msg)) score += 0.1

  // Present/recent tense observations
  if (/\b(is|has been|was|started|noticed|seems?|appears?|looks?|keeps?|won'?t|doesn'?t|can'?t|isn'?t|hasn'?t)\b/.test(msg)) score += 0.2

  // Time references suggesting recent observation
  if (/\b(today|yesterday|this (week|morning|evening)|lately|recently|last (night|week|few days)|since|for (the|a) (past|last))\b/.test(msg)) score += 0.2

  // Concern language
  if (/\b(worried|concerned|noticed|strange|unusual|different|not (normal|usual)|problem|issue|trouble)\b/.test(msg)) score += 0.2

  // Observation verbs
  if (/\b(noticed|saw|observed|found|spotted|see(ing)?|hear(ing|d)?|feel(ing|s)?)\b/.test(msg)) score += 0.15

  // Symptom-like language
  if (/\b(rash|fever|cough|cold|cry(ing)?|vomit|diarr|pain|swell|red|bump|spot|bruise|itch|bleed)\b/.test(msg)) score += 0.3

  // Behavior descriptions
  if (/\b(won'?t (eat|sleep|talk|walk|sit|crawl)|refuses?|tantrum|hitting|biting|throwing|screaming)\b/.test(msg)) score += 0.3

  // Development concerns
  if (/\b(not (talking|walking|crawling|sitting|babbling|pointing|responding)|still (can'?t|isn'?t|hasn'?t|doesn'?t)|delayed|behind|regression|lost|stopped)\b/.test(msg)) score += 0.35

  // Sensory observations
  if (/\b(squint|stare|not (looking|hearing|responding)|deaf|blind|tilt|cross-eyed|wall-eyed)\b/.test(msg)) score += 0.3

  return Math.min(score, 1.0)
}

/**
 * Broader domain detection for messages the knowledge graph might miss
 */
function detectBroadDomain(msg: string): BodySystem | null {
  const domainPatterns: Array<{ pattern: RegExp; domain: BodySystem }> = [
    { pattern: /\b(eat|food|feed|milk|breast|formula|appetite|weight|picky|vomit|spit|swallow|chew)\b/, domain: 'gi_nutrition' },
    { pattern: /\b(sleep|nap|wake|night|bed|tired|rest|drowsy|insomnia)\b/, domain: 'neurological' },
    { pattern: /\b(skin|rash|eczema|spot|bump|red|itch|dry|scal|hive|diaper)\b/, domain: 'skin' },
    { pattern: /\b(cough|wheeze|breath|cold|nose|nasal|sneez|chest|lung|asthma)\b/, domain: 'respiratory' },
    { pattern: /\b(eye|vision|see|sight|squint|stare|cross|blink|pupil|tear)\b/, domain: 'vision' },
    { pattern: /\b(ear|hear|sound|noise|respond|deaf|speech|word|talk|language|babbl|stutter|stammer)\b/, domain: 'language' },
    { pattern: /\b(walk|crawl|sit|stand|roll|balance|fall|limp|gait|move|motor|grip|grasp|reach)\b/, domain: 'motor' },
    { pattern: /\b(tantrum|behav|mood|anger|aggress|bite|hit|throw|defi|meltdown|scream|cry)\b/, domain: 'behavioral' },
    { pattern: /\b(anxious|anxiety|scared|fear|sad|depressed|withdraw|shy|social|friend|play)\b/, domain: 'emotional' },
    { pattern: /\b(tooth|teeth|dental|gum|cavity|bite|mouth)\b/, domain: 'dental' },
    { pattern: /\b(height|tall|short|grow|weight|thin|fat|obese|small|big)\b/, domain: 'growth' },
    { pattern: /\b(fever|temperature|hot|sick|ill|infection|virus|bacteria)\b/, domain: 'immunological' },
    { pattern: /\b(pee|poo|stool|urin|potty|toilet|constipat|diarr|bowel|bladder|diaper)\b/, domain: 'gi_nutrition' },
  ]

  for (const { pattern, domain } of domainPatterns) {
    if (pattern.test(msg)) return domain
  }

  return null
}

// ============================================
// TEXT EXTRACTION
// ============================================

/**
 * Clean the chat message into a proper observation text
 */
function extractObservationText(message: string): string {
  let text = message.trim()

  // Remove question framing
  text = text.replace(/^(i'?m? ?(worried|concerned|wondering|not sure) (about|if|whether|that|why)\s*)/i, '')
  text = text.replace(/^(why (is|does|has|did|would|could)\s*)/i, '')
  text = text.replace(/^(is it (normal|ok|okay|fine|safe|common) (that|if|for|when)\s*)/i, '')
  text = text.replace(/^(should i (be )?(worried|concerned) (that|about|because)\s*)/i, '')
  text = text.replace(/\?+$/, '')

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1)

  // Truncate if too long
  if (text.length > 500) text = text.substring(0, 500) + '...'

  return text
}

/**
 * Estimate concern level from language
 */
function estimateConcernLevel(msg: string): 'none' | 'mild' | 'moderate' | 'serious' {
  // Serious indicators
  if (/\b(emergency|not breathing|seizure|unconscious|blue|purple|limp|unresponsive|convuls)\b/.test(msg)) {
    return 'serious'
  }

  // Moderate indicators
  if (/\b(very worried|really concerned|getting worse|not improving|persistent|multiple|several (days|weeks)|regression|lost ability|stopped doing)\b/.test(msg)) {
    return 'moderate'
  }

  // Mild indicators
  if (/\b(worried|concerned|unusual|strange|different|noticed|not sure|seems off)\b/.test(msg)) {
    return 'mild'
  }

  return 'none'
}

// ============================================
// DOMAIN MAPPING
// ============================================

const DOMAIN_TO_CATEGORY: Record<string, string> = {
  motor: 'Development',
  language: 'Development',
  cognitive: 'Development',
  behavioral: 'Behavior',
  emotional: 'Behavior',
  vision: 'Health',
  hearing: 'Health',
  neurological: 'Health',
  cardiac: 'Health',
  respiratory: 'Health',
  skin: 'Health',
  gi_nutrition: 'Eating',
  growth: 'Health',
  dental: 'Health',
  musculoskeletal: 'Health',
  immunological: 'Health',
  endocrine: 'Health',
  urogenital: 'Health',
  general: 'General',
}
