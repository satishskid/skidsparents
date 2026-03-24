import {
  deriveScreeningType,
  deriveStatus,
  extractReportUrl,
  formatScreeningDate,
  getInterventionLink,
  getNextStepsMessage,
  SCREENING_TYPE_CONFIG,
  type ScreeningImportRecord,
} from '@/lib/phr/screening-utils'

interface ScreeningCardProps {
  record: ScreeningImportRecord
  childName: string
}

const STATUS_CONFIG = {
  'normal':          { label: 'Normal',          bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  'borderline':      { label: 'Borderline',       bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  'needs-attention': { label: 'Needs Attention',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'   },
}

export default function ScreeningCard({ record, childName }: ScreeningCardProps) {
  const type = deriveScreeningType(record.dataJson)
  const status = deriveStatus(record.fourDJson)
  const reportUrl = extractReportUrl(record.dataJson)
  const nextSteps = getNextStepsMessage(type, status)
  const interventionLink = status === 'needs-attention' ? getInterventionLink(type) : null
  const config = SCREENING_TYPE_CONFIG[type]
  const statusCfg = STATUS_CONFIG[status]
  const dateLabel = formatScreeningDate(record.screeningDate)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400">{dateLabel}</p>
          {record.campaignCode && (
            <p className="text-[10px] text-gray-400 mt-0.5">Campaign: {record.campaignCode}</p>
          )}
        </div>
        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {record.summaryText || `${config.emoji} ${config.label} screening completed for ${childName}.`}
      </p>

      {/* Next steps */}
      <div className="bg-gray-50 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-500 font-medium mb-0.5">Next steps</p>
        <p className="text-xs text-gray-700">{nextSteps}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {interventionLink && (
          <a
            href={interventionLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Book Consultation →
          </a>
        )}
        {reportUrl && (
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            View Report
          </a>
        )}
      </div>
    </div>
  )
}
