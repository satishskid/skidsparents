/**
 * India National Immunization Schedule (NIS) + IAP recommendations.
 * Covers birth through 12 years.
 */

export interface VaccineDefinition {
  key: string
  name: string
  abbreviation: string
  dose: string
  dueAgeMonths: number       // when it's due
  catchUpAgeMonths?: number  // latest recommended age
  category: 'nis' | 'iap'   // government schedule vs IAP recommended
}

export const VACCINATION_SCHEDULE: VaccineDefinition[] = [
  // ─── Birth ───
  { key: 'bcg', name: 'BCG', abbreviation: 'BCG', dose: '1', dueAgeMonths: 0, catchUpAgeMonths: 12, category: 'nis' },
  { key: 'opv_0', name: 'Oral Polio Vaccine', abbreviation: 'OPV-0', dose: '0', dueAgeMonths: 0, catchUpAgeMonths: 1, category: 'nis' },
  { key: 'hep_b_1', name: 'Hepatitis B', abbreviation: 'Hep B-1', dose: '1', dueAgeMonths: 0, catchUpAgeMonths: 1, category: 'nis' },

  // ─── 6 Weeks ───
  { key: 'dpt_1', name: 'DPT (Diphtheria, Pertussis, Tetanus)', abbreviation: 'DPT-1', dose: '1', dueAgeMonths: 1.5, catchUpAgeMonths: 3, category: 'nis' },
  { key: 'opv_1', name: 'Oral Polio Vaccine', abbreviation: 'OPV-1', dose: '1', dueAgeMonths: 1.5, catchUpAgeMonths: 3, category: 'nis' },
  { key: 'hep_b_2', name: 'Hepatitis B', abbreviation: 'Hep B-2', dose: '2', dueAgeMonths: 1.5, catchUpAgeMonths: 3, category: 'nis' },
  { key: 'hib_1', name: 'Haemophilus Influenzae B', abbreviation: 'Hib-1', dose: '1', dueAgeMonths: 1.5, catchUpAgeMonths: 3, category: 'iap' },
  { key: 'rota_1', name: 'Rotavirus', abbreviation: 'Rota-1', dose: '1', dueAgeMonths: 1.5, catchUpAgeMonths: 3, category: 'iap' },
  { key: 'pcv_1', name: 'Pneumococcal Conjugate', abbreviation: 'PCV-1', dose: '1', dueAgeMonths: 1.5, catchUpAgeMonths: 3, category: 'iap' },
  { key: 'ipv_1', name: 'Inactivated Polio Vaccine', abbreviation: 'IPV-1', dose: '1', dueAgeMonths: 1.5, catchUpAgeMonths: 3, category: 'nis' },

  // ─── 10 Weeks ───
  { key: 'dpt_2', name: 'DPT', abbreviation: 'DPT-2', dose: '2', dueAgeMonths: 2.5, catchUpAgeMonths: 4, category: 'nis' },
  { key: 'opv_2', name: 'Oral Polio Vaccine', abbreviation: 'OPV-2', dose: '2', dueAgeMonths: 2.5, catchUpAgeMonths: 4, category: 'nis' },
  { key: 'hib_2', name: 'Haemophilus Influenzae B', abbreviation: 'Hib-2', dose: '2', dueAgeMonths: 2.5, catchUpAgeMonths: 4, category: 'iap' },
  { key: 'rota_2', name: 'Rotavirus', abbreviation: 'Rota-2', dose: '2', dueAgeMonths: 2.5, catchUpAgeMonths: 4, category: 'iap' },
  { key: 'pcv_2', name: 'Pneumococcal Conjugate', abbreviation: 'PCV-2', dose: '2', dueAgeMonths: 2.5, catchUpAgeMonths: 4, category: 'iap' },

  // ─── 14 Weeks ───
  { key: 'dpt_3', name: 'DPT', abbreviation: 'DPT-3', dose: '3', dueAgeMonths: 3.5, catchUpAgeMonths: 5, category: 'nis' },
  { key: 'opv_3', name: 'Oral Polio Vaccine', abbreviation: 'OPV-3', dose: '3', dueAgeMonths: 3.5, catchUpAgeMonths: 5, category: 'nis' },
  { key: 'hep_b_3', name: 'Hepatitis B', abbreviation: 'Hep B-3', dose: '3', dueAgeMonths: 3.5, catchUpAgeMonths: 5, category: 'nis' },
  { key: 'hib_3', name: 'Haemophilus Influenzae B', abbreviation: 'Hib-3', dose: '3', dueAgeMonths: 3.5, catchUpAgeMonths: 5, category: 'iap' },
  { key: 'rota_3', name: 'Rotavirus', abbreviation: 'Rota-3', dose: '3', dueAgeMonths: 3.5, catchUpAgeMonths: 5, category: 'iap' },
  { key: 'pcv_3', name: 'Pneumococcal Conjugate', abbreviation: 'PCV-3', dose: '3', dueAgeMonths: 3.5, catchUpAgeMonths: 5, category: 'iap' },
  { key: 'ipv_2', name: 'Inactivated Polio Vaccine', abbreviation: 'IPV-2', dose: '2', dueAgeMonths: 3.5, catchUpAgeMonths: 5, category: 'nis' },

  // ─── 9 Months ───
  { key: 'mr_1', name: 'Measles-Rubella', abbreviation: 'MR-1', dose: '1', dueAgeMonths: 9, catchUpAgeMonths: 12, category: 'nis' },
  { key: 'je_1', name: 'Japanese Encephalitis', abbreviation: 'JE-1', dose: '1', dueAgeMonths: 9, catchUpAgeMonths: 15, category: 'nis' },
  { key: 'vit_a_1', name: 'Vitamin A', abbreviation: 'Vit A-1', dose: '1', dueAgeMonths: 9, catchUpAgeMonths: 12, category: 'nis' },

  // ─── 12 Months ───
  { key: 'hep_a_1', name: 'Hepatitis A', abbreviation: 'Hep A-1', dose: '1', dueAgeMonths: 12, catchUpAgeMonths: 24, category: 'iap' },

  // ─── 15 Months ───
  { key: 'mmr_1', name: 'MMR (Measles, Mumps, Rubella)', abbreviation: 'MMR-1', dose: '1', dueAgeMonths: 15, catchUpAgeMonths: 24, category: 'iap' },
  { key: 'varicella_1', name: 'Varicella (Chickenpox)', abbreviation: 'Varicella-1', dose: '1', dueAgeMonths: 15, catchUpAgeMonths: 24, category: 'iap' },
  { key: 'pcv_b', name: 'Pneumococcal Conjugate Booster', abbreviation: 'PCV-B', dose: 'B', dueAgeMonths: 15, catchUpAgeMonths: 24, category: 'iap' },

  // ─── 16–18 Months ───
  { key: 'dpt_b1', name: 'DPT Booster', abbreviation: 'DPT-B1', dose: 'B1', dueAgeMonths: 16, catchUpAgeMonths: 24, category: 'nis' },
  { key: 'opv_b', name: 'OPV Booster', abbreviation: 'OPV-B', dose: 'B', dueAgeMonths: 16, catchUpAgeMonths: 24, category: 'nis' },
  { key: 'hib_b', name: 'Hib Booster', abbreviation: 'Hib-B', dose: 'B', dueAgeMonths: 16, catchUpAgeMonths: 24, category: 'iap' },
  { key: 'ipv_b', name: 'IPV Booster', abbreviation: 'IPV-B', dose: 'B', dueAgeMonths: 16, catchUpAgeMonths: 24, category: 'nis' },

  // ─── 18 Months ───
  { key: 'hep_a_2', name: 'Hepatitis A', abbreviation: 'Hep A-2', dose: '2', dueAgeMonths: 18, catchUpAgeMonths: 36, category: 'iap' },
  { key: 'je_2', name: 'Japanese Encephalitis', abbreviation: 'JE-2', dose: '2', dueAgeMonths: 18, catchUpAgeMonths: 24, category: 'nis' },

  // ─── 4–6 Years ───
  { key: 'dpt_b2', name: 'DPT Booster 2', abbreviation: 'DPT-B2', dose: 'B2', dueAgeMonths: 48, catchUpAgeMonths: 72, category: 'nis' },
  { key: 'opv_b2', name: 'OPV Booster 2', abbreviation: 'OPV-B2', dose: 'B2', dueAgeMonths: 48, catchUpAgeMonths: 72, category: 'nis' },
  { key: 'mmr_2', name: 'MMR Booster', abbreviation: 'MMR-2', dose: '2', dueAgeMonths: 48, catchUpAgeMonths: 72, category: 'iap' },
  { key: 'varicella_2', name: 'Varicella Booster', abbreviation: 'Varicella-2', dose: '2', dueAgeMonths: 48, catchUpAgeMonths: 72, category: 'iap' },

  // ─── 10–12 Years ───
  { key: 'tdap', name: 'Tdap (Tetanus, Diphtheria, Pertussis)', abbreviation: 'Tdap', dose: '1', dueAgeMonths: 120, catchUpAgeMonths: 144, category: 'nis' },
  { key: 'hpv_1', name: 'HPV (Human Papillomavirus)', abbreviation: 'HPV-1', dose: '1', dueAgeMonths: 108, catchUpAgeMonths: 156, category: 'iap' },
  { key: 'hpv_2', name: 'HPV', abbreviation: 'HPV-2', dose: '2', dueAgeMonths: 114, catchUpAgeMonths: 156, category: 'iap' },
]

/** Age milestones for grouping vaccines in the UI */
export const VACCINE_AGE_GROUPS = [
  { label: 'Birth', minMonths: 0, maxMonths: 0 },
  { label: '6 Weeks', minMonths: 1, maxMonths: 2 },
  { label: '10 Weeks', minMonths: 2, maxMonths: 3 },
  { label: '14 Weeks', minMonths: 3, maxMonths: 4 },
  { label: '9 Months', minMonths: 8, maxMonths: 10 },
  { label: '12 Months', minMonths: 11, maxMonths: 13 },
  { label: '15 Months', minMonths: 14, maxMonths: 16 },
  { label: '16-18 Months', minMonths: 16, maxMonths: 19 },
  { label: '4-6 Years', minMonths: 48, maxMonths: 72 },
  { label: '9-12 Years', minMonths: 108, maxMonths: 156 },
]

export type VaccineStatus = 'done' | 'due' | 'overdue' | 'upcoming'

export interface VaccineWithStatus extends VaccineDefinition {
  status: VaccineStatus
  administeredDate?: string
  provider?: string
}

/** Compute vaccine statuses based on child age and completed records */
export function getVaccinationStatus(
  ageMonths: number,
  completedVaccines: { vaccine_name: string; dose: string; administered_date?: string; provider?: string }[]
): VaccineWithStatus[] {
  return VACCINATION_SCHEDULE.map((v) => {
    // Check if this vaccine+dose is completed
    const match = completedVaccines.find(
      (c) => c.vaccine_name === v.name && c.dose === v.dose
    ) || completedVaccines.find(
      (c) => c.vaccine_name === v.abbreviation && c.dose === v.dose
    ) || completedVaccines.find(
      (c) => c.vaccine_name.toLowerCase().includes(v.abbreviation.toLowerCase().replace(/[-\d]/g, '').trim()) && c.dose === v.dose
    )

    if (match) {
      return { ...v, status: 'done' as const, administeredDate: match.administered_date, provider: match.provider }
    }

    // Determine status based on age
    const catchUp = v.catchUpAgeMonths || v.dueAgeMonths + 6
    if (ageMonths > catchUp) {
      return { ...v, status: 'overdue' as const }
    }
    if (ageMonths >= v.dueAgeMonths - 0.5) {
      return { ...v, status: 'due' as const }
    }
    return { ...v, status: 'upcoming' as const }
  })
}

/** Get count summary */
export function getVaccineSummary(statuses: VaccineWithStatus[]) {
  return {
    done: statuses.filter((v) => v.status === 'done').length,
    due: statuses.filter((v) => v.status === 'due').length,
    overdue: statuses.filter((v) => v.status === 'overdue').length,
    total: statuses.length,
  }
}
