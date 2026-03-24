import { useState } from 'react'
import {
  Document, Page, Text, View, StyleSheet, pdf,
} from '@react-pdf/renderer'

interface Child {
  id: string
  name: string
  dob: string
  gender?: string
}

interface Props {
  child: Child
  token: string
  features: string[]
}

// ─── PDF Styles ────────────────────────────────────────

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 12 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 9, color: '#6b7280' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 6, color: '#16a34a' },
  table: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableHeader: { backgroundColor: '#f9fafb' },
  tableCell: { flex: 1, padding: '4 6', fontSize: 9 },
  tableCellBold: { flex: 1, padding: '4 6', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  empty: { color: '#9ca3af', fontStyle: 'italic', fontSize: 9, padding: 8 },
})

// ─── Helpers ───────────────────────────────────────────

/** Sanitise child name for filename: lowercase, spaces→hyphens, strip non-alphanumeric */
export function sanitiseName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Format date as YYYY-MM-DD */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Build PDF filename */
export function buildFilename(childName: string, date: Date): string {
  return `skids-${sanitiseName(childName)}-${formatDate(date)}.pdf`
}

// ─── PDF Document ──────────────────────────────────────

interface VaccinationRecord { vaccine_name: string; dose?: string; administered_date?: string; provider?: string }
interface GrowthRecord { date: string; height_cm?: number; weight_kg?: number; bmi?: number }
interface MilestoneRecord { category: string; title: string; status: string; observed_at?: string }
interface ObservationRecord { date: string; category?: string; observation_text: string; concern_level?: string }

interface PdfData {
  vaccinations: VaccinationRecord[]
  growth: GrowthRecord[]
  milestones: MilestoneRecord[]
  observations: ObservationRecord[]
}

function PhrDocument({ child, data, exportDate }: { child: Child; data: PdfData; exportDate: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{child.name}</Text>
          <Text style={styles.subtitle}>
            DOB: {child.dob}  |  Gender: {child.gender ?? 'Not specified'}  |  Exported: {exportDate}
          </Text>
        </View>

        {/* Vaccinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vaccinations</Text>
          {data.vaccinations.length === 0
            ? <Text style={styles.empty}>No records available</Text>
            : (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCellBold}>Vaccine</Text>
                  <Text style={styles.tableCellBold}>Dose</Text>
                  <Text style={styles.tableCellBold}>Date</Text>
                  <Text style={styles.tableCellBold}>Provider</Text>
                </View>
                {data.vaccinations.map((v, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{v.vaccine_name}</Text>
                    <Text style={styles.tableCell}>{v.dose ?? '—'}</Text>
                    <Text style={styles.tableCell}>{v.administered_date ?? '—'}</Text>
                    <Text style={styles.tableCell}>{v.provider ?? '—'}</Text>
                  </View>
                ))}
              </View>
            )}
        </View>

        {/* Growth */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth Records</Text>
          {data.growth.length === 0
            ? <Text style={styles.empty}>No records available</Text>
            : (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCellBold}>Date</Text>
                  <Text style={styles.tableCellBold}>Height (cm)</Text>
                  <Text style={styles.tableCellBold}>Weight (kg)</Text>
                  <Text style={styles.tableCellBold}>BMI</Text>
                </View>
                {data.growth.map((g, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{g.date}</Text>
                    <Text style={styles.tableCell}>{g.height_cm ?? '—'}</Text>
                    <Text style={styles.tableCell}>{g.weight_kg ?? '—'}</Text>
                    <Text style={styles.tableCell}>{g.bmi?.toFixed(1) ?? '—'}</Text>
                  </View>
                ))}
              </View>
            )}
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {data.milestones.length === 0
            ? <Text style={styles.empty}>No records available</Text>
            : (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCellBold}>Category</Text>
                  <Text style={styles.tableCellBold}>Title</Text>
                  <Text style={styles.tableCellBold}>Status</Text>
                  <Text style={styles.tableCellBold}>Observed</Text>
                </View>
                {data.milestones.map((m, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{m.category}</Text>
                    <Text style={styles.tableCell}>{m.title}</Text>
                    <Text style={styles.tableCell}>{m.status}</Text>
                    <Text style={styles.tableCell}>{m.observed_at ?? '—'}</Text>
                  </View>
                ))}
              </View>
            )}
        </View>

        {/* Observations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Observations</Text>
          {data.observations.length === 0
            ? <Text style={styles.empty}>No records available</Text>
            : (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCellBold}>Date</Text>
                  <Text style={styles.tableCellBold}>Category</Text>
                  <Text style={styles.tableCellBold}>Note</Text>
                  <Text style={styles.tableCellBold}>Concern</Text>
                </View>
                {data.observations.map((o, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{o.date}</Text>
                    <Text style={styles.tableCell}>{o.category ?? '—'}</Text>
                    <Text style={styles.tableCell}>{o.observation_text.slice(0, 80)}</Text>
                    <Text style={styles.tableCell}>{o.concern_level ?? '—'}</Text>
                  </View>
                ))}
              </View>
            )}
        </View>
      </Page>
    </Document>
  )
}

// ─── Export Button Component ───────────────────────────

export default function PhrPdfExport({ child, token, features }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!features.includes('pdf_export')) return null

  async function handleExport() {
    setLoading(true)
    setError(null)

    try {
      const authHeader = { Authorization: `Bearer ${token}` }
      const [vacRes, growthRes, milestonesRes, obsRes] = await Promise.all([
        fetch(`/api/vaccinations?childId=${child.id}`, { headers: authHeader }),
        fetch(`/api/growth?childId=${child.id}`, { headers: authHeader }),
        fetch(`/api/milestones?childId=${child.id}`, { headers: authHeader }),
        fetch(`/api/observations?childId=${child.id}`, { headers: authHeader }),
      ])

      if (!vacRes.ok || !growthRes.ok || !milestonesRes.ok || !obsRes.ok) {
        throw new Error('Failed to fetch health records')
      }

      const [vacData, growthData, milestonesData, obsData] = await Promise.all([
        vacRes.json() as Promise<{ vaccinations?: VaccinationRecord[] }>,
        growthRes.json() as Promise<{ records?: GrowthRecord[] }>,
        milestonesRes.json() as Promise<{ milestones?: MilestoneRecord[] }>,
        obsRes.json() as Promise<{ observations?: ObservationRecord[] }>,
      ])

      const exportDate = formatDate(new Date())
      const observations = (obsData.observations ?? [])
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10)

      const data: PdfData = {
        vaccinations: vacData.vaccinations ?? [],
        growth: growthData.records ?? [],
        milestones: milestonesData.milestones ?? [],
        observations,
      }

      const doc = <PhrDocument child={child} data={data} exportDate={exportDate} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = buildFilename(child.name, new Date())
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating PDF…
          </>
        ) : (
          <>📄 Export PHR</>
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
