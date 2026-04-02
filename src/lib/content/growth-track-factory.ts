/**
 * Growth Track Factory — builds full GrowthTrack objects from compact data
 *
 * Instead of 6000+ lines of literal tracks, we define compact per-track data
 * and inflate it into the full GrowthTrack shape at runtime.
 */
import type {
  GrowthTrack,
  GrowthTrackDomain,
  AgePeriod,
  ParentGuidance,
  CoachingPlaybook,
  CoachingTopic,
  DevelopmentalMilestone,
  RedFlag,
  ParentalCopingGuidance,
  GuidedActivity,
} from '../ai/growth-tracks/types'

// ── Compact Input Types ──

export interface TrackData {
  agePeriod: AgePeriod
  ageMin: number
  ageMax: number
  title: string
  whatToExpect: string
  keyMessage: string
  dailyTips: string[]
  doList: string[]
  dontList: string[]
  activities: [string, string, number, string][] // [name, desc, minutes, frequency]
  topics: TopicData[]
  milestones: [string, string, number, string][] // [id, desc, typicalMonths, observationPrompt]
  redFlags: RedFlagData[]
  coping: CopingData
  evidence: string
}

export interface TopicData {
  key: string
  patterns: string[]
  response: string
  boundary?: boolean
}

export interface RedFlagData {
  id: string
  description: string
  severity: 'monitor' | 'discuss_with_ped' | 'urgent_referral'
  pattern: string
  action: string
  referral?: string
}

export interface CopingData {
  normalizations: string[]
  strategies: string[]
  selfCare: string[]
  partner: string
  warnings: string[]
}

// ── Builder ──

export function buildTrack(domain: GrowthTrackDomain, data: TrackData): GrowthTrack {
  const activities: GuidedActivity[] = data.activities.map(([name, description, dur, freq]) => ({
    name,
    description,
    ageAppropriate: true,
    durationMinutes: dur,
    frequency: freq,
  }))

  const guidance: ParentGuidance = {
    dailyTips: data.dailyTips,
    doList: data.doList,
    dontList: data.dontList,
    activities,
    keyMessage: data.keyMessage,
  }

  const playbook: CoachingPlaybook = {}
  for (const t of data.topics) {
    playbook[t.key] = {
      questionPatterns: t.patterns,
      response: t.response,
      boundary: t.boundary ?? false,
    }
  }

  const milestones: DevelopmentalMilestone[] = data.milestones.map(([id, desc, months, prompt]) => ({
    id,
    description: desc,
    domain,
    typicalAgeMonths: months,
    isObservable: true,
    observationPrompt: prompt,
  }))

  const redFlags: RedFlag[] = data.redFlags.map((rf) => ({
    id: rf.id,
    description: rf.description,
    severity: rf.severity,
    conditions: [{ type: 'observation_pattern' as const, pattern: rf.pattern }],
    suggestedAction: rf.action,
    referralSpecialty: rf.referral,
  }))

  const parentalCoping: ParentalCopingGuidance = {
    normalizations: data.coping.normalizations,
    copingStrategies: data.coping.strategies,
    selfCareReminders: data.coping.selfCare,
    partnerCommunication: data.coping.partner,
    warningSignsForParent: data.coping.warnings,
  }

  return {
    id: `gt-${domain}-${data.agePeriod}`,
    domain,
    ageMinMonths: data.ageMin,
    ageMaxMonths: data.ageMax,
    agePeriod: data.agePeriod,
    title: data.title,
    whatToExpect: data.whatToExpect,
    parentGuidance: guidance,
    coachingPlaybook: playbook,
    milestones,
    redFlags,
    parentalCoping,
    evidenceBase: data.evidence,
    region: 'global',
    protocolAuthority: 'WHO',
  }
}

export function buildDomain(domain: GrowthTrackDomain, tracks: TrackData[]): GrowthTrack[] {
  return tracks.map((t) => buildTrack(domain, t))
}
