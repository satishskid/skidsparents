/**
 * Growth Track Library — All 8 domains × age periods = ~77 tracks
 *
 * Uses factory pattern: compact data files + builder = full GrowthTrack objects.
 * This barrel re-exports the complete library as a single array.
 */
import type { GrowthTrack } from '../ai/growth-tracks/types'
import { buildDomain } from './growth-track-factory'

import { TRACKS as emotionalData } from './growth-data-emotional'
import { TRACKS as behavioralData } from './growth-data-behavioral'
import { TRACKS as nutritionData } from './growth-data-nutrition'
import { TRACKS as physicalData } from './growth-data-physical'
import { TRACKS as sleepData } from './growth-data-sleep'
import { TRACKS as socialData } from './growth-data-social'
import { TRACKS as digitalData } from './growth-data-digital'
import { TRACKS as parentalData } from './growth-data-parental'

export const GROWTH_TRACK_LIBRARY: GrowthTrack[] = [
  ...buildDomain('emotional', emotionalData),
  ...buildDomain('behavioral', behavioralData),
  ...buildDomain('nutrition_habits', nutritionData),
  ...buildDomain('physical_activity', physicalData),
  ...buildDomain('sleep_hygiene', sleepData),
  ...buildDomain('social', socialData),
  ...buildDomain('digital_wellness', digitalData),
  ...buildDomain('parental_coping', parentalData),
]

/** Get tracks for a specific domain */
export function getTracksByDomain(domain: string): GrowthTrack[] {
  return GROWTH_TRACK_LIBRARY.filter((t) => t.domain === domain)
}

/** Get tracks active for a child's age in months */
export function getTracksForAge(ageMonths: number): GrowthTrack[] {
  return GROWTH_TRACK_LIBRARY.filter(
    (t) => ageMonths >= t.ageMinMonths && ageMonths < t.ageMaxMonths
  )
}

/** Get a specific track by domain + age period */
export function getTrack(domain: string, agePeriod: string): GrowthTrack | undefined {
  return GROWTH_TRACK_LIBRARY.find((t) => t.domain === domain && t.agePeriod === agePeriod)
}
