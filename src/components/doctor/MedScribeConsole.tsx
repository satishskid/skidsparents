/**
 * SKIDS D2C — Doctor Clinic Console (MedScribe)
 *
 * Layout: LHS Patient Strip (longitudinal PHR from D1) + Main Cockpit (today's consultation)
 *
 * Twin PHR: Same D1 data the parent sees — doctor gets the clinical view.
 * Orchestrator: Doctor describes findings → subspecialty agents auto-invoked.
 *
 * Ported from zpediscreen/medscribe → skids-d2c as Astro React island.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  ASSISTANTS,
  detectRelevantAssistants,
  queryAssistant,
  parseArtifacts,
  type SubspecialtyAssistant,
  type ChildContext,
  type Artifact,
  type ArtifactType,
} from '@/lib/ai/medscribe/subspecialty-assistants'
import { DEFAULT_LLM_CONFIG, type LLMConfig } from '@/lib/ai/medscribe/llm-gateway'
import {
  getProactiveAlerts,
  getProtocolSummary,
  getParentToolsForAge,
  getProtocolTimelineEvents,
  explainRecommendation,
  getProtocolSchedule,
  type Region,
  type ProactiveAlert,
  type ProtocolSummary,
} from '@/lib/ai/medscribe/regional-protocols'

// ============================================
// INLINE UI COMPONENTS (replaces shadcn — parent app uses plain Tailwind)
// ============================================

function Button({ children, onClick, disabled, className = '', variant = 'default', size = 'default', ...props }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'; size?: 'default' | 'sm'; [key: string]: unknown
}) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  }
  const sizes: Record<string, string> = { default: 'h-10 px-4 text-sm', sm: 'h-8 px-3 text-xs' }
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>
}

function Badge({ children, variant = 'secondary', className = '' }: {
  children: React.ReactNode; variant?: 'default' | 'secondary' | 'destructive'; className?: string
}) {
  const variants: Record<string, string> = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-700',
    destructive: 'bg-red-100 text-red-700',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${className}`} {...props} />
}

// ============================================
// TYPES
// ============================================

interface ConsultMessage {
  id: string
  role: 'doctor' | 'orchestrator' | 'subspecialty'
  content: string
  timestamp: string
  assistantId?: string
  assistantName?: string
  assistantIcon?: string
  assistantColor?: string
  provider?: string
  model?: string
  latencyMs?: number
  artifacts?: Artifact[]
}

interface ScreeningFinding {
  module: string
  moduleIcon: string
  moduleName: string
  risk: 'normal' | 'low' | 'medium' | 'high'
  chips: Array<{ label: string; severity: string; aiSuggested?: boolean }>
  aiSuggestions?: string[]
  doctorConfirmed?: boolean
}

interface CarePlanItem {
  category: 'prescription' | 'referral' | 'education' | 'nutrition' | 'wellbeing' | 'followup' | 'milestone'
  icon: string
  title: string
  details: string
  urgency?: 'routine' | 'soon' | 'urgent'
  source?: string
}

interface CarePlan {
  childName: string
  childAge: string
  doctorName: string
  visitDate: string
  items: CarePlanItem[]
  confirmedFindings: ScreeningFinding[]
}

/** A single event on the child's life timeline */
interface TimelineEvent {
  id: string
  date: string          // ISO date string
  type: 'birth' | 'milestone' | 'vaccine' | 'screening' | 'condition' | 'growth' | 'emotional' | 'visit' | 'today'
  icon: string
  title: string
  subtitle?: string
  detail?: string       // expanded detail
  severity?: 'good' | 'info' | 'warn' | 'alert'  // dot color
  tags?: string[]       // compact chips
}

/**
 * PHR Summary — mirrors SKIDS Parent App (parent.skids.clinic) data model.
 *
 * Parent app creates this at onboarding (AI-assisted child creation → milestone seeding).
 * Doctor cockpit consumes it as read-only context for consultation.
 *
 * Data sources:
 *   - children table: name, dob, gender, allergies
 *   - growthRecords: heightCm, weightKg, whoZscoreJson
 *   - milestones: category (motor|cognitive|social|language), status, parentNotes
 *   - habitsLog: H.A.B.I.T.S. streaks (Hydration, Activity, Balanced diet, etc.)
 *   - parentObservations: free-text + Dr. SKIDS AI response + concern level
 *   - screeningImports: SKIDS Screen 4D results
 *   - vaccinationRecords: vaccine name, dose, date
 *   - chatbotConversations: Dr. SKIDS chat highlights
 *   - health-score.ts: composite 0-100 (Growth 30% + Dev 30% + Habits 25% + Nutrition 15%)
 */
interface PHRSummary {
  /** Health Score — composite from parent app (0-100) */
  healthScore: number
  healthScoreColor: 'green' | 'amber' | 'red'  // ≥70 green, 40-69 amber, <40 red
  healthScoreBreakdown: {
    growth: number     // WHO z-score derived, 0-100
    development: number // achieved/eligible milestones, 0-100
    habits: number     // avg streak / 30 * 100
    nutrition: number  // concern level mapped
  }
  /** Latest growth (from growthRecords) */
  height: string
  weight: string
  bmi: string
  growthTrend: 'up' | 'steady' | 'declining'
  whoZscores: { waz: string; haz: string }  // weight-for-age, height-for-age z-scores
  /** Milestones (from milestones table) */
  milestones: {
    achieved: number
    eligible: number
    delayed: number
    nextExpected: string  // next upcoming milestone
    categories: Record<'motor' | 'cognitive' | 'social' | 'language', 'on_track' | 'watch' | 'delayed'>
  }
  /** H.A.B.I.T.S. — 6 daily habits from parent app */
  habits: {
    avgStreak: number
    todayCompleted: number
    todayTotal: number
    items: Array<{ type: string; icon: string; streak: number }>
  }
  /** Active conditions (from screening + clinic) */
  activeConditions: Array<{ name: string; status: 'active' | 'monitoring'; since: string }>
  resolvedCount: number
  /** Immunization (from vaccinationRecords) */
  vaccinesCompleted: number
  vaccinesTotal: number
  vaccineGaps: string[]
  /** SEBA emotional baseline (latest) */
  seba: {
    overall: 'green' | 'yellow' | 'red'
    composite: number  // 0-100
    domains: Record<'sr' | 'sc' | 'sl' | 'fe' | 'st', 'green' | 'yellow' | 'red'>
    physiologicalCleared: boolean
  }
  /** Parent observations (from parentObservations table) */
  parentObservations: Array<{
    date: string
    text: string
    concernLevel: 'none' | 'mild' | 'moderate' | 'serious'
  }>
  /** Dr. SKIDS chat highlights — recent concerns raised by parent */
  drSkidsHighlights: string[]
  /** SKIDS Shield */
  shieldPercent: number
  screeningsCompleted: number
  lastScreeningDate: string
  nextScreeningDue: string
  /** Key flags for doctor attention */
  flags: string[]
}

/** Longitudinal health record — PHR timeline from SKIDS Parent App */
interface PatientRecord {
  timeline: TimelineEvent[]
  summary: PHRSummary
  allergies: string[]
  parentAppActive: boolean
}

// ============================================
// SIMPLE MARKDOWN RENDERER
// ============================================

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = []
    let remaining = line
    let key = 0
    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = boldRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>)
      }
      parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>)
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < remaining.length) {
      parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>)
    }
    if (parts.length === 0) parts.push(<span key={0}>{line}</span>)
    return (
      <React.Fragment key={i}>
        {i > 0 && '\n'}
        {parts}
      </React.Fragment>
    )
  })
}

// ============================================
// CONSTANTS
// ============================================

const ARTIFACT_ICONS: Record<string, string> = {
  prescription: '💊',
  referral_letter: '📨',
  investigation_order: '🔬',
  parent_education: '📚',
  follow_up_plan: '📅',
  growth_interpretation: '📈',
  milestone_checklist: '✅',
  diet_plan: '🥗',
  exercise_protocol: '🏃',
  screening_protocol: '🩺',
  risk_score: '⚠️',
  treatment_protocol: '💉',
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string; bubble: string }> = {
  blue:    { bg: 'bg-blue-600',    text: 'text-blue-700',    border: 'border-blue-200',    light: 'bg-blue-50',    bubble: 'bg-blue-50 border-l-4 border-l-blue-500' },
  purple:  { bg: 'bg-purple-600',  text: 'text-purple-700',  border: 'border-purple-200',  light: 'bg-purple-50',  bubble: 'bg-purple-50 border-l-4 border-l-purple-500' },
  cyan:    { bg: 'bg-cyan-600',    text: 'text-cyan-700',    border: 'border-cyan-200',    light: 'bg-cyan-50',    bubble: 'bg-cyan-50 border-l-4 border-l-cyan-500' },
  pink:    { bg: 'bg-pink-600',    text: 'text-pink-700',    border: 'border-pink-200',    light: 'bg-pink-50',    bubble: 'bg-pink-50 border-l-4 border-l-pink-500' },
  green:   { bg: 'bg-green-600',   text: 'text-green-700',   border: 'border-green-200',   light: 'bg-green-50',   bubble: 'bg-green-50 border-l-4 border-l-green-500' },
  amber:   { bg: 'bg-amber-600',   text: 'text-amber-700',   border: 'border-amber-200',   light: 'bg-amber-50',   bubble: 'bg-amber-50 border-l-4 border-l-amber-500' },
  teal:    { bg: 'bg-teal-600',    text: 'text-teal-700',    border: 'border-teal-200',    light: 'bg-teal-50',    bubble: 'bg-teal-50 border-l-4 border-l-teal-500' },
  orange:  { bg: 'bg-orange-600',  text: 'text-orange-700',  border: 'border-orange-200',  light: 'bg-orange-50',  bubble: 'bg-orange-50 border-l-4 border-l-orange-500' },
  red:     { bg: 'bg-red-600',     text: 'text-red-700',     border: 'border-red-200',     light: 'bg-red-50',     bubble: 'bg-red-50 border-l-4 border-l-red-500' },
  yellow:  { bg: 'bg-yellow-600',  text: 'text-yellow-700',  border: 'border-yellow-200',  light: 'bg-yellow-50',  bubble: 'bg-yellow-50 border-l-4 border-l-yellow-500' },
  indigo:  { bg: 'bg-indigo-600',  text: 'text-indigo-700',  border: 'border-indigo-200',  light: 'bg-indigo-50',  bubble: 'bg-indigo-50 border-l-4 border-l-indigo-500' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50', bubble: 'bg-emerald-50 border-l-4 border-l-emerald-500' },
}

// ============================================
// DEMO DATA — simulates SKIDS Parent App record
// ============================================

function getDemoPatientRecord(): PatientRecord {
  return {
    allergies: ['Dust mite', 'Egg white (mild)'],
    parentAppActive: true,
    summary: {
      // Health Score — from parent app composite calculation
      healthScore: 72,
      healthScoreColor: 'green',
      healthScoreBreakdown: { growth: 68, development: 82, habits: 65, nutrition: 70 },
      // Growth
      height: '115 cm', weight: '19.5 kg', bmi: '14.7',
      growthTrend: 'steady',
      whoZscores: { waz: '-0.8', haz: '-0.6' },
      // Milestones
      milestones: {
        achieved: 24, eligible: 28, delayed: 1,
        nextExpected: 'Reading independently (6-7y)',
        categories: { motor: 'on_track', cognitive: 'on_track', social: 'on_track', language: 'watch' },
      },
      // H.A.B.I.T.S.
      habits: {
        avgStreak: 12, todayCompleted: 4, todayTotal: 6,
        items: [
          { type: 'Hydration', icon: '💧', streak: 18 },
          { type: 'Activity', icon: '🏃', streak: 14 },
          { type: 'Balanced diet', icon: '🥗', streak: 8 },
          { type: 'Independence', icon: '🧠', streak: 11 },
          { type: 'Togetherness', icon: '👨‍👩‍👦', streak: 15 },
          { type: 'Sleep', icon: '😴', streak: 6 },
        ],
      },
      // Conditions
      activeConditions: [
        { name: 'Intermittent exotropia L', status: 'monitoring', since: 'Sep 2025' },
      ],
      resolvedCount: 1,
      // Vaccines
      vaccinesCompleted: 14, vaccinesTotal: 16,
      vaccineGaps: ['Typhoid (catch-up)', 'Influenza 2025-26'],
      // SEBA
      seba: {
        overall: 'yellow', composite: 62,
        domains: { sr: 'yellow', sc: 'green', sl: 'yellow', fe: 'green', st: 'yellow' },
        physiologicalCleared: false,
      },
      // Parent observations (from Dr. SKIDS journal)
      parentObservations: [
        { date: '2026-03-20', text: 'Noticed squinting more at TV. Covering one eye sometimes.', concernLevel: 'moderate' },
        { date: '2026-02-14', text: 'Sleep has been restless this month. Screen time crept up.', concernLevel: 'mild' },
      ],
      // Dr. SKIDS chat highlights
      drSkidsHighlights: [
        'Asked about squinting — advised urgent vision recheck',
        'Asked about screen time limits — given AAP guidelines',
        'Asked about iron-rich foods — shared ragi/jaggery recipes',
      ],
      // Shield
      shieldPercent: 85,
      screeningsCompleted: 4,
      lastScreeningDate: '15 Mar 2026',
      nextScreeningDue: 'Sep 2026',
      flags: ['Vision monitoring', 'Sleep quality declining', 'Screen time 1.5hr (limit 1hr)', 'Language milestone watch'],
    },
    timeline: [
      // Birth
      { id: 'birth', date: '2020-04-12', type: 'birth', icon: '👶', title: 'Born', subtitle: '3.2 kg · 49 cm · Normal delivery', severity: 'good' },
      // Newborn vaccines
      { id: 'v1', date: '2020-04-12', type: 'vaccine', icon: '💉', title: 'BCG + OPV-0 + Hep-B Birth', severity: 'good' },
      { id: 'v2', date: '2020-05-24', type: 'vaccine', icon: '💉', title: 'DTP-1 + IPV-1 + Hep-B-2 + Rota-1', severity: 'good' },
      // Growth — 3 months
      { id: 'g1', date: '2020-07-12', type: 'growth', icon: '📏', title: '60 cm · 5.8 kg', subtitle: '50th percentile', severity: 'good' },
      { id: 'v3', date: '2020-07-24', type: 'vaccine', icon: '💉', title: 'DTP-2 + IPV-2 + Hep-B-3 + Rota-2', severity: 'good' },
      // Milestone — 6 months
      { id: 'm1', date: '2020-10-12', type: 'milestone', icon: '🎯', title: 'Sits without support', subtitle: 'Motor milestone — on track', severity: 'good' },
      { id: 'v4', date: '2020-10-24', type: 'vaccine', icon: '💉', title: 'DTP-3 + IPV-3 + Rota-3', severity: 'good' },
      // Growth — 9 months
      { id: 'g2', date: '2021-01-12', type: 'growth', icon: '📏', title: '72 cm · 8.5 kg', subtitle: '45th percentile', severity: 'good' },
      { id: 'v5', date: '2021-01-12', type: 'vaccine', icon: '💉', title: 'Measles-1 + Vitamin A', severity: 'good' },
      // Milestone — 12 months
      { id: 'm2', date: '2021-04-12', type: 'milestone', icon: '🎯', title: 'First steps + first words', subtitle: '1 year — walking, says "mama"', severity: 'good' },
      { id: 'g3', date: '2021-04-12', type: 'growth', icon: '📏', title: '76 cm · 9.8 kg', subtitle: '40th percentile', severity: 'good' },
      // 15 months — DTP booster
      { id: 'v6', date: '2021-07-12', type: 'vaccine', icon: '💉', title: 'DTP Booster-1 + MMR-1', severity: 'good' },
      // Milestone — 18 months
      { id: 'm3', date: '2021-10-12', type: 'milestone', icon: '🎯', title: 'Running, stacking blocks', subtitle: '18 months — language explosion', severity: 'good' },
      // 2 years — first condition
      { id: 'g4', date: '2022-04-12', type: 'growth', icon: '📏', title: '87 cm · 12.5 kg', subtitle: '35th percentile', severity: 'good' },
      { id: 'm4', date: '2022-04-12', type: 'milestone', icon: '🎯', title: '2-word sentences, toilet training', subtitle: '2 years — age appropriate', severity: 'good' },
      { id: 'v7', date: '2022-04-12', type: 'vaccine', icon: '💉', title: 'DTP Booster-2 + OPV Booster', severity: 'good' },
      // 3 years — preschool entry
      { id: 'm5', date: '2023-06-01', type: 'milestone', icon: '🎒', title: 'Preschool entry', subtitle: 'Speaks in full sentences, social play', severity: 'good' },
      { id: 'g5', date: '2023-04-12', type: 'growth', icon: '📏', title: '96 cm · 14.5 kg', subtitle: '30th percentile', severity: 'info' },
      // First SKIDS screening — 4 years
      { id: 's1', date: '2024-03-15', type: 'screening', icon: '🛡️', title: 'SKIDS Screen — 1st visit', subtitle: '18/31 modules · All clear', severity: 'good', tags: ['Vision ✓', 'Hearing ✓', 'Dental ✓'] },
      // 4.5 years — growth + emotional baseline
      { id: 'g6', date: '2024-09-15', type: 'growth', icon: '📏', title: '105 cm · 16.5 kg', subtitle: '25th percentile — tracking below', severity: 'info' },
      { id: 'e1', date: '2024-09-15', type: 'emotional', icon: '💛', title: 'Emotional Baseline — 1st check', subtitle: 'Self-regulation: developing · Social: good', severity: 'good' },
      // 5 years — second screening, pallor found
      { id: 's2', date: '2025-03-10', type: 'screening', icon: '🛡️', title: 'SKIDS Screen — 2nd visit', subtitle: '20/31 modules · 2 flagged', severity: 'warn', tags: ['Pallor ⚠', 'Low iron'] },
      { id: 'c1', date: '2025-03-10', type: 'condition', icon: '🩸', title: 'Mild pallor detected', subtitle: 'Iron panel ordered — Hb 10.8', severity: 'warn' },
      { id: 'v8', date: '2025-03-15', type: 'vaccine', icon: '💉', title: 'DTP Booster + IPV Booster', severity: 'good' },
      // 5 years — iron resolved, school entry
      { id: 'm6', date: '2025-06-01', type: 'milestone', icon: '🎒', title: 'Class 1 entry', subtitle: 'Reading simple words, riding bicycle', severity: 'good' },
      { id: 'c1r', date: '2025-07-15', type: 'condition', icon: '✅', title: 'Pallor resolved', subtitle: 'Hb normalized to 12.1 after iron supplementation', severity: 'good' },
      // 5.5 years — third screening, exotropia found
      { id: 's3', date: '2025-09-20', type: 'screening', icon: '🛡️', title: 'SKIDS Screen — 3rd visit', subtitle: '18/31 modules · 1 flagged', severity: 'warn', tags: ['Vision ⚠'] },
      { id: 'c2', date: '2025-09-20', type: 'condition', icon: '👁️', title: 'Intermittent exotropia L detected', subtitle: 'Monitoring — cover test positive', severity: 'alert' },
      { id: 'e2', date: '2025-09-20', type: 'emotional', icon: '💛', title: 'Emotional Baseline — 2nd check', subtitle: 'Self-reg: developing · Sleep: good · Screen: 1hr/day', severity: 'good' },
      { id: 'g7', date: '2025-09-20', type: 'growth', icon: '📏', title: '112 cm · 18.8 kg', subtitle: '28th percentile', severity: 'info' },
      // 6 years — current screening (today)
      { id: 's4', date: '2026-03-15', type: 'screening', icon: '🛡️', title: 'SKIDS Screen — 4th visit', subtitle: '22/31 modules · 3 flagged', severity: 'warn', tags: ['Vision ⚠', 'Dental ⚠', 'ENT ⚠'] },
      { id: 'e3', date: '2026-03-15', type: 'emotional', icon: '💛', title: 'Emotional Baseline — 3rd check', subtitle: 'Self-reg: developing · Sleep: fair · Screen: 1.5hr/day ⚠', severity: 'info' },
      { id: 'g8', date: '2026-03-15', type: 'growth', icon: '📏', title: '115 cm · 19.5 kg', subtitle: '30th percentile — steady', severity: 'good' },
      // Today
      { id: 'today', date: '2026-03-31', type: 'today', icon: '🩺', title: 'Today — Clinic Visit', subtitle: 'Doctor consultation in progress', severity: 'info' },
    ],
  }
}

function getDemoScreeningFindings(): ScreeningFinding[] {
  return [
    {
      module: 'vision', moduleIcon: '👁️', moduleName: 'Vision',
      risk: 'high',
      chips: [
        { label: 'Intermittent exotropia L', severity: 'high' },
        { label: 'VA 6/12 L eye', severity: 'high' },
        { label: 'VA 6/9 R eye', severity: 'medium' },
        { label: 'Cover test positive', severity: 'high', aiSuggested: true },
      ],
      aiSuggestions: ['Pattern consistent with amblyopia secondary to intermittent exotropia. Critical treatment window before age 7.'],
    },
    {
      module: 'dental', moduleIcon: '🦷', moduleName: 'Dental',
      risk: 'medium',
      chips: [
        { label: 'Caries lower left molar', severity: 'medium' },
        { label: 'Plaque visible', severity: 'low', aiSuggested: true },
      ],
      aiSuggestions: ['dmft > 0 before age 7 = high caries risk. Check dietary sugar intake.'],
    },
    {
      module: 'throat', moduleIcon: '👂', moduleName: 'ENT / Throat',
      risk: 'medium',
      chips: [
        { label: 'Tonsils grade 2', severity: 'medium' },
        { label: 'Mouth breathing noted', severity: 'low', aiSuggested: true },
      ],
      aiSuggestions: ['Mouth breathing + tonsils = check for sleep-disordered breathing. Ask about snoring.'],
    },
    {
      module: 'neuro', moduleIcon: '🧠', moduleName: 'NeuroDev',
      risk: 'normal',
      chips: [{ label: 'Age-appropriate milestones', severity: 'normal' }],
    },
    {
      module: 'motor', moduleIcon: '💪', moduleName: 'Motor / Posture',
      risk: 'normal',
      chips: [{ label: 'Gait normal', severity: 'normal' }, { label: 'No scoliosis', severity: 'normal' }],
    },
    {
      module: 'respiratory', moduleIcon: '🫁', moduleName: 'Respiratory',
      risk: 'normal',
      chips: [{ label: 'Clear lungs', severity: 'normal' }],
    },
    {
      module: 'cardiac', moduleIcon: '❤️', moduleName: 'Cardiac',
      risk: 'normal',
      chips: [{ label: 'No murmur', severity: 'normal' }, { label: 'BP 90/60 (normal)', severity: 'normal' }],
    },
    {
      module: 'skin', moduleIcon: '🧴', moduleName: 'Skin',
      risk: 'normal',
      chips: [{ label: 'No lesions', severity: 'normal' }],
    },
    {
      module: 'nutrition', moduleIcon: '🥗', moduleName: 'Nutrition',
      risk: 'low',
      chips: [
        { label: 'Weight 19.5kg (25th)', severity: 'normal' },
        { label: 'Height 115cm (30th)', severity: 'normal' },
        { label: 'Mild pallor noted', severity: 'low', aiSuggested: true },
      ],
      aiSuggestions: ['Pallor with 25th percentile growth — check Hb and iron panel.'],
    },
  ]
}

// ============================================
// MAIN COMPONENT
// ============================================

interface MedScribeConsoleProps {
  doctorName?: string
  doctorRole?: string
  doctorId?: string
  onSignOut?: () => void
}

export default function MedScribeConsole({ doctorName, doctorRole, doctorId, onSignOut }: MedScribeConsoleProps) {
  // Child context — initialize from URL params if coming from dashboard
  const [childContext, setChildContext] = useState<ChildContext>(() => {
    if (typeof window === 'undefined') return { name: '', age: '', gender: '' }
    const params = new URLSearchParams(window.location.search)
    return {
      name: params.get('name') || '',
      age: params.get('age') || '',
      gender: params.get('gender') || '',
    }
  })

  // Longitudinal record from Parent App
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null)

  // Today's screening findings (from SKIDS Screen pre-checkin)
  const [screeningFindings, setScreeningFindings] = useState<ScreeningFinding[]>([])

  // Care plan
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null)

  // Consultation thread
  const [messages, setMessages] = useState<ConsultMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAgents, setActiveAgents] = useState<string[]>([])
  const [involvedAssistants, setInvolvedAssistants] = useState<Set<string>>(new Set())

  // Artifacts
  const [artifactPanelOpen, setArtifactPanelOpen] = useState(false)
  const [allArtifacts, setAllArtifacts] = useState<Artifact[]>([])
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)

  // LLM config
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skids-llm-config')
      if (saved) try { return { ...DEFAULT_LLM_CONFIG, ...JSON.parse(saved) } } catch { /* */ }
    }
    return DEFAULT_LLM_CONFIG
  })
  const [showSettings, setShowSettings] = useState(false)

  // Timeline hover state
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  // Protocol engine state
  const [protocolAlerts, setProtocolAlerts] = useState<ProactiveAlert[]>([])
  const [protocolSummary, setProtocolSummary] = useState<ProtocolSummary | null>(null)
  const [parentTools, setParentTools] = useState<ReturnType<typeof getParentToolsForAge>>([])

  // ── TWIN PHR: Fetch child data directly from D1 ──
  // When navigated from dashboard with ?childId=xxx, load PHR from the same
  // D1 database the parent sees. This is the "twin record" — no bridge API.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const childId = params.get('childId')
    if (!childId) return

    // Get Firebase token from cookie or auth state
    const fetchPHR = async () => {
      try {
        // Import Firebase auth to get current token
        const { getIdToken } = await import('@/lib/firebase/client')
        const token = await getIdToken()
        if (!token) return

        const res = await fetch(`/api/doctor/child/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return

        const data = await res.json()
        if (data.child) {
          // Build patientRecord from D1 data
          const record: PatientRecord = {
            summary: {
              allergies: data.child.allergies ? data.child.allergies.split(',') : [],
              bloodGroup: data.child.blood_group || '',
              activeConditions: [],
              ongoingMedications: [],
              recentVisits: data.screenings?.slice(0, 3).map((s: { screening_date: string; campaign_code: string }) => ({
                date: s.screening_date,
                reason: `SKIDS Screen (${s.campaign_code})`,
              })) || [],
            },
            growth: data.growth?.map((g: { date: string; height_cm: number; weight_kg: number }) => ({
              date: g.date,
              height: g.height_cm,
              weight: g.weight_kg,
            })) || [],
            milestones: data.milestones?.map((m: { domain: string; milestone_name: string; status: string }) => ({
              domain: m.domain,
              name: m.milestone_name,
              status: m.status,
            })) || [],
            immunizations: data.vaccinations?.map((v: { vaccine_name: string; administered_date: string }) => ({
              name: v.vaccine_name,
              date: v.administered_date,
              status: 'completed' as const,
            })) || [],
            parentObservations: [],
          }
          setPatientRecord(record)
        }
      } catch (err) {
        console.error('[Console] Failed to fetch PHR from D1:', err)
      }
    }
    fetchPHR()
  }, [])

  // Compute protocol when patient record loads
  useEffect(() => {
    if (!patientRecord || !childContext.age) {
      setProtocolAlerts([])
      setProtocolSummary(null)
      setParentTools([])
      return
    }

    // Parse age from childContext (e.g. "6 years" → 72 months)
    const ageMatch = childContext.age.match(/(\d+)/)
    const ageYears = ageMatch ? parseInt(ageMatch[1]) : 6
    const ageMonths = ageYears * 12

    const protocolChild = {
      ageMonths,
      gender: (childContext.gender === 'male' ? 'male' : 'female') as 'male' | 'female',
      region: 'india' as Region,
      completedScreenings: [
        'iap_vision_newborn', 'iap_hearing_newborn', 'iap_dev_9m', 'iap_dev_18m',
        'iap_autism_18m', 'iap_vaccine_review_1y', 'iap_dental_1y',
        'iap_vision_3y', 'iap_iron_9m', 'iap_bp_3y', 'iap_speech_2y', 'iap_dev_30m',
      ],
      completedVaccines: ['bcg', 'opv0', 'hepb_birth', 'dtp1', 'ipv1', 'hepb2', 'rota1'],
      activeConditions: patientRecord.summary.activeConditions.map(c => c.name),
      riskFactors: [],
    }

    setProtocolAlerts(getProactiveAlerts(protocolChild))
    setProtocolSummary(getProtocolSummary(protocolChild))
    setParentTools(getParentToolsForAge(ageMonths))
  }, [childContext.age, childContext.gender, patientRecord])

  const updateLlmConfig = useCallback((patch: Partial<LLMConfig>) => {
    setLlmConfig(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem('skids-llm-config', JSON.stringify(next))
      return next
    })
  }, [])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeAgents])

  // Auto-scroll timeline to bottom (today) on load
  const timelineRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (patientRecord && timelineRef.current) {
      setTimeout(() => { timelineRef.current?.scrollTo({ top: timelineRef.current.scrollHeight, behavior: 'smooth' }) }, 300)
    }
  }, [patientRecord])

  // ============================================
  // ORCHESTRATOR
  // ============================================

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || loading) return
    const text = inputText.trim()
    const doctorMsg: ConsultMessage = {
      id: Date.now().toString(),
      role: 'doctor',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, doctorMsg])
    setInputText('')
    setLoading(true)

    const detected = detectRelevantAssistants(text)
    if (detected.length === 0) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_orch',
        role: 'orchestrator',
        content: 'No subspecialty triggers detected. Describe clinical findings — "squinting", "tonsils grade 3", "dental caries", "not reaching milestones", "pallor"',
        timestamp: new Date().toISOString(),
      }])
      setLoading(false)
      inputRef.current?.focus()
      return
    }

    const agentNames = detected.map(a => `${a.icon} ${a.name}`).join(', ')
    setMessages(prev => [...prev, {
      id: Date.now().toString() + '_orch',
      role: 'orchestrator',
      content: `Invoking ${detected.length} agent${detected.length > 1 ? 's' : ''}: ${agentNames}`,
      timestamp: new Date().toISOString(),
    }])
    setActiveAgents(detected.map(a => a.id))

    for (const assistant of detected) {
      setInvolvedAssistants(prev => new Set([...prev, assistant.id]))
      try {
        const response = await queryAssistant(assistant, childContext, text, [], llmConfig)
        const responseArtifacts = response.artifacts || []
        const assistantMsg: ConsultMessage = {
          id: Date.now().toString() + '_' + assistant.id,
          role: 'subspecialty',
          content: response.text,
          timestamp: new Date().toISOString(),
          assistantId: assistant.id,
          assistantName: assistant.name,
          assistantIcon: assistant.icon,
          assistantColor: assistant.color,
          provider: response.provider,
          model: response.model,
          latencyMs: response.latencyMs,
          artifacts: responseArtifacts.length > 0 ? responseArtifacts : undefined,
        }
        setMessages(prev => [...prev, assistantMsg])
        if (responseArtifacts.length > 0) {
          setAllArtifacts(prev => [...prev, ...responseArtifacts])
        }
      } catch (e: any) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '_err_' + assistant.id,
          role: 'subspecialty',
          content: `Error: ${e.message}`,
          timestamp: new Date().toISOString(),
          assistantId: assistant.id,
          assistantName: assistant.name,
          assistantIcon: assistant.icon,
          assistantColor: assistant.color,
        }])
      }
      setActiveAgents(prev => prev.filter(id => id !== assistant.id))
    }
    setLoading(false)
    inputRef.current?.focus()
  }, [inputText, loading, childContext, llmConfig])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const resetAll = useCallback(() => {
    setChildContext({ name: '', age: '', gender: '' })
    setPatientRecord(null)
    setScreeningFindings([])
    setCarePlan(null)
    setMessages([])
    setAllArtifacts([])
    setSelectedArtifact(null)
    setArtifactPanelOpen(false)
    setInvolvedAssistants(new Set())
    setActiveAgents([])
  }, [])

  // ============================================
  // GENERATE CARE PLAN
  // ============================================

  const generateCarePlan = useCallback(() => {
    const items: CarePlanItem[] = []
    const allMsgArtifacts = messages
      .filter(m => m.role === 'subspecialty' && m.artifacts)
      .flatMap(m => (m.artifacts || []).map(a => ({ ...a, source: m.assistantName })))

    for (const art of allMsgArtifacts) {
      if (art.type === 'prescription') items.push({ category: 'prescription', icon: '💊', title: art.title, details: art.rendered, source: art.source })
      else if (art.type === 'referral_letter') items.push({ category: 'referral', icon: '📨', title: art.title, details: art.rendered, urgency: art.rendered.toLowerCase().includes('urgent') ? 'urgent' : 'routine', source: art.source })
      else if (art.type === 'parent_education') items.push({ category: 'education', icon: '📖', title: art.title, details: art.rendered, source: art.source })
      else if (art.type === 'investigation_order') items.push({ category: 'referral', icon: '🔬', title: art.title, details: art.rendered, source: art.source })
      else if (art.type === 'screening_protocol') items.push({ category: 'followup', icon: '📋', title: art.title, details: art.rendered, source: art.source })
      else if (art.type === 'diet_plan') items.push({ category: 'nutrition', icon: '🍽️', title: art.title, details: art.rendered, source: art.source })
    }

    items.push({ category: 'nutrition', icon: '🥗', title: 'Daily Nutrition Plan', details: 'Iron-rich: ragi, jaggery, eggs, spinach\nCalcium: 2 cups milk/curd\nProtein: dal, paneer, eggs\nVitamins: seasonal fruits, amla\nAvoid: packaged snacks, sugary drinks' })
    items.push({
      category: 'wellbeing', icon: '💚', title: 'Emotional Regulation Baseline',
      details: `SKIDS tracks emotional health at every visit — building a longitudinal baseline.\n\nPrefrontal cortex still developing. Emotional outbursts ≠ defiance — brain still learning.\n\n✅ Model healthy regulation\n✅ Teach emotion words: "I see you're frustrated"\n✅ Validate feelings before correcting\n✅ Predictable routines reduce anxiety\n\n⚠️ Dysregulation often misdiagnosed as ADHD/ODD. Check sleep, iron, vision first.`,
    })
    items.push({ category: 'wellbeing', icon: '😴', title: 'Sleep', details: '9-11 hours. Consistent bedtime. No screens 1hr before bed.' })
    items.push({ category: 'wellbeing', icon: '🏃', title: 'Activity', details: '60 min outdoor play daily. Running, climbing, ball games.' })

    const hasHighRisk = screeningFindings.some(f => f.risk === 'high')
    const flagged = screeningFindings.filter(f => f.risk === 'high' || f.risk === 'medium').map(f => f.moduleName).join(', ')
    items.push({
      category: 'followup', icon: '🛡️', title: 'SKIDS Shield — Follow-up',
      details: hasHighRisk
        ? `2 weeks: Specialist (Ophthalmology)\n1 month: Dental\n3 months: Re-screen ${flagged}\n6 months: Full 31-module screening`
        : `6 months: Full SKIDS screening\n12 months: Annual comprehensive + emotional baseline`,
      urgency: hasHighRisk ? 'urgent' : 'routine',
    })
    items.push({ category: 'followup', icon: '📲', title: 'Parent App Reminders', details: 'Upcoming screenings, milestone check-ins, medication adherence, follow-ups.' })

    setCarePlan({
      childName: childContext.name || 'Patient',
      childAge: childContext.age || '',
      doctorName: 'SKIDS Pediatrician',
      visitDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      items,
      confirmedFindings: screeningFindings.filter(f => f.doctorConfirmed),
    })
  }, [messages, screeningFindings, childContext])

  // ============================================
  // RENDER: LHS PATIENT STRIP
  // ============================================

  function renderPatientStrip() {
    if (!patientRecord) return null

    const severityColor = (s?: string) => {
      if (s === 'good') return 'bg-green-500'
      if (s === 'info') return 'bg-blue-500'
      if (s === 'warn') return 'bg-amber-500'
      if (s === 'alert') return 'bg-red-500'
      return 'bg-slate-400'
    }

    const severityRing = (s?: string) => {
      if (s === 'good') return 'ring-green-200'
      if (s === 'info') return 'ring-blue-200'
      if (s === 'warn') return 'ring-amber-200'
      if (s === 'alert') return 'ring-red-200'
      return 'ring-slate-200'
    }

    // Group consecutive events by year for age markers
    let lastYear = ''

    const s = patientRecord.summary
    const dotColor = (v: 'green' | 'yellow' | 'red') =>
      v === 'green' ? 'bg-green-500' : v === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
    const scoreColor = (v: 'green' | 'amber' | 'red') =>
      v === 'green' ? 'text-green-700 bg-green-100' : v === 'amber' ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100'
    const catIcon = (status: 'on_track' | 'watch' | 'delayed') =>
      status === 'on_track' ? '🟢' : status === 'watch' ? '🟡' : '🔴'

    return (
      <div className="w-80 border-r bg-gradient-to-b from-slate-50 to-white flex flex-col shrink-0 overflow-hidden">
        {/* ═══ PHR SUMMARY — from parent.skids.clinic ═══ */}
        <div className="border-b bg-white">
          {/* Identity + Health Score */}
          <div className="px-3 pt-2 pb-1.5 flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {childContext.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{childContext.name}</p>
              <p className="text-[10px] text-slate-500">{childContext.age} · {childContext.gender}</p>
            </div>
            {/* Health Score gauge */}
            <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${scoreColor(s.healthScoreColor)}`}>
              <span className="text-lg font-black leading-none">{s.healthScore}</span>
              <span className="text-[7px] font-medium uppercase">Health</span>
            </div>
          </div>

          {/* Health Score breakdown bar */}
          <div className="px-3 pb-1.5 flex items-center gap-1">
            {[
              { label: 'Growth', val: s.healthScoreBreakdown.growth, color: 'bg-blue-400' },
              { label: 'Dev', val: s.healthScoreBreakdown.development, color: 'bg-purple-400' },
              { label: 'Habits', val: s.healthScoreBreakdown.habits, color: 'bg-teal-400' },
              { label: 'Nutr', val: s.healthScoreBreakdown.nutrition, color: 'bg-orange-400' },
            ].map(b => (
              <div key={b.label} className="flex-1 flex flex-col items-center">
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.val}%` }} />
                </div>
                <span className="text-[7px] text-slate-400 mt-0.5">{b.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 ml-1">
              {patientRecord.parentAppActive && <span className="text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded-full">📱</span>}
              <span className={`text-[7px] px-1 py-0.5 rounded-full font-bold ${
                s.shieldPercent >= 80 ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
              }`}>🛡️{s.shieldPercent}%</span>
            </div>
          </div>

          {/* Growth + Vitals */}
          <div className="px-3 py-1 bg-slate-50/60 flex items-center gap-2 text-[9px]">
            <span className="text-slate-400">📏</span>
            <span className="font-semibold">{s.height}</span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold">{s.weight}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Z</span>
            <span className="font-medium">{s.whoZscores.haz}</span>
            <span className={`font-semibold ml-auto ${
              s.growthTrend === 'up' ? 'text-green-600' : s.growthTrend === 'steady' ? 'text-blue-600' : 'text-amber-600'
            }`}>
              {s.growthTrend === 'up' ? '↑ Growing' : s.growthTrend === 'steady' ? '→ Steady' : '↓ Declining'}
            </span>
          </div>

          {/* Milestones + Conditions row */}
          <div className="px-3 py-1.5 flex items-start gap-3">
            {/* Milestones */}
            <div className="flex-1">
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Milestones</p>
              <p className="text-[9px] font-semibold">{s.milestones.achieved}/{s.milestones.eligible}
                {s.milestones.delayed > 0 && <span className="text-red-600"> · {s.milestones.delayed} delayed</span>}
              </p>
              <div className="flex gap-1 mt-0.5">
                {Object.entries(s.milestones.categories).map(([cat, status]) => (
                  <span key={cat} className="text-[7px]" title={`${cat}: ${status}`}>
                    {catIcon(status as any)}
                  </span>
                ))}
                <span className="text-[7px] text-slate-400 ml-0.5">M C S L</span>
              </div>
            </div>
            {/* Active conditions */}
            <div className="flex-1">
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Conditions</p>
              {s.activeConditions.map((c, i) => (
                <p key={i} className="text-[8px] text-amber-700 truncate">{c.status === 'active' ? '🔴' : '🟡'} {c.name}</p>
              ))}
              {s.resolvedCount > 0 && <p className="text-[8px] text-green-600">✓ {s.resolvedCount} resolved</p>}
            </div>
          </div>

          {/* SEBA + Vaccines + H.A.B.I.T.S. */}
          <div className="px-3 py-1.5 border-t border-slate-100 flex items-center gap-3">
            {/* SEBA compact */}
            <div>
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">SEBA</p>
              <div className="flex items-center gap-0.5">
                {Object.entries(s.seba.domains).map(([k, v]) => (
                  <span key={k} className={`w-2.5 h-2.5 rounded-full ${dotColor(v)}`} title={k} />
                ))}
                <span className="text-[9px] font-bold ml-1">{s.seba.composite}</span>
                {!s.seba.physiologicalCleared && <span className="text-[7px] text-amber-600 ml-0.5">⚠ physio</span>}
              </div>
            </div>
            {/* Vaccines */}
            <div>
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Vaccines</p>
              <p className="text-[9px] font-semibold">{s.vaccinesCompleted}/{s.vaccinesTotal}
                {s.vaccineGaps.length > 0 && <span className="text-amber-600"> · {s.vaccineGaps.length} gap</span>}
              </p>
            </div>
            {/* H.A.B.I.T.S. */}
            <div>
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">H.A.B.I.T.S.</p>
              <div className="flex items-center gap-0.5">
                {s.habits.items.map((h, i) => (
                  <span key={i} className={`text-[8px] ${h.streak >= 14 ? '' : h.streak >= 7 ? 'opacity-70' : 'opacity-40'}`} title={`${h.type}: ${h.streak}d`}>
                    {h.icon}
                  </span>
                ))}
                <span className="text-[8px] text-slate-500 ml-0.5">{s.habits.todayCompleted}/{s.habits.todayTotal}</span>
              </div>
            </div>
          </div>

          {/* Parent observations — what parent told Dr. SKIDS */}
          {s.parentObservations.length > 0 && (
            <div className="px-3 py-1.5 border-t border-slate-100">
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Parent Reported</p>
              {s.parentObservations.slice(0, 2).map((o, i) => (
                <div key={i} className="flex items-start gap-1 text-[8px] mb-0.5">
                  <span className={`shrink-0 ${
                    o.concernLevel === 'serious' ? 'text-red-500' : o.concernLevel === 'moderate' ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {o.concernLevel === 'serious' ? '🔴' : o.concernLevel === 'moderate' ? '🟡' : '○'}
                  </span>
                  <span className="text-slate-600 truncate">{o.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Dr. SKIDS chat highlights */}
          {s.drSkidsHighlights.length > 0 && (
            <div className="px-3 py-1.5 border-t border-slate-100">
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Dr. SKIDS Chat</p>
              {s.drSkidsHighlights.slice(0, 2).map((h, i) => (
                <p key={i} className="text-[8px] text-blue-600 truncate">💬 {h}</p>
              ))}
            </div>
          )}

          {/* Protocol Compliance — proactive screening schedule */}
          {protocolSummary && (
            <div className="px-3 py-1.5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider">Protocol ({protocolSummary.protocolName.split('(')[0].trim()})</p>
                <span className={`text-[7px] px-1 py-0.5 rounded-full font-bold ${
                  protocolSummary.shieldScore >= 80 ? 'bg-green-100 text-green-700' :
                  protocolSummary.shieldScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {protocolSummary.shieldScore}%
                </span>
              </div>
              {protocolSummary.criticalOverdue.length > 0 && (
                <div className="mb-1">
                  {protocolSummary.criticalOverdue.slice(0, 2).map((item, i) => (
                    <p key={i} className="text-[8px] text-red-600 truncate">🔴 Overdue: {item.parentFriendlyName}</p>
                  ))}
                </div>
              )}
              {protocolAlerts.filter(a => a.type === 'due_now').slice(0, 2).map((alert, i) => (
                <p key={i} className="text-[8px] text-amber-600 truncate">📋 Due: {alert.title.replace('Due now: ', '')}</p>
              ))}
              {protocolAlerts.filter(a => a.type === 'upcoming').slice(0, 1).map((alert, i) => (
                <p key={i} className="text-[8px] text-blue-500 truncate">🔮 Next: {alert.title.replace('Coming up: ', '')}</p>
              ))}
              {protocolAlerts.filter(a => a.type === 'systems_flag').slice(0, 1).map((alert, i) => (
                <p key={i} className="text-[8px] text-purple-600 truncate">⚡ {alert.title}</p>
              ))}
              {parentTools.length > 0 && (
                <p className="text-[7px] text-teal-600 mt-0.5">🧰 {parentTools.length} home assessment tools available</p>
              )}
            </div>
          )}

          {/* Flags + Allergies */}
          <div className="px-3 py-1 border-t border-slate-100 flex flex-wrap gap-0.5">
            {patientRecord.allergies.map((a, i) => (
              <span key={`a${i}`} className="text-[7px] bg-red-50 text-red-600 border border-red-200 px-1 py-0.5 rounded-full">⚠ {a}</span>
            ))}
            {s.flags.map((f, i) => (
              <span key={`f${i}`} className="text-[7px] bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.5 rounded-full">⚡ {f}</span>
            ))}
          </div>
        </div>

        {/* TIMELINE — the heart of the PHR */}
        <div ref={timelineRef} className="flex-1 overflow-auto">
          <div className="relative pl-7 pr-3 py-3">
            {/* Vertical timeline line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-slate-200 to-teal-300" />

            {patientRecord.timeline.map((event, i) => {
              // Year marker
              const eventYear = event.date.substring(0, 4)
              const showYear = eventYear !== lastYear
              lastYear = eventYear

              const isHovered = hoveredEvent === event.id
              const isToday = event.type === 'today'
              const isBirth = event.type === 'birth'

              // Format date compactly
              const d = new Date(event.date)
              const monthStr = d.toLocaleDateString('en-IN', { month: 'short' })
              const dayStr = d.getDate().toString()

              return (
                <React.Fragment key={event.id}>
                  {/* Year/age divider */}
                  {showYear && (
                    <div className="relative flex items-center gap-2 mb-2 mt-1 -ml-4">
                      <div className={`w-8 text-right text-[9px] font-bold ${isBirth ? 'text-blue-600' : 'text-slate-400'}`}>
                        {isBirth ? 'Born' : `${parseInt(eventYear) - 2020}y`}
                      </div>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[8px] text-slate-400">{eventYear}</span>
                    </div>
                  )}

                  {/* Timeline event */}
                  <div
                    className={`relative flex items-start gap-2 mb-2 group cursor-default transition-all duration-150 ${isToday ? 'mb-0' : ''}`}
                    onMouseEnter={() => setHoveredEvent(event.id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    {/* Dot on the timeline */}
                    <div className={`absolute -left-[18px] mt-0.5 flex items-center justify-center ${
                      isToday || isBirth ? 'w-5 h-5 -ml-[3px]' : 'w-3 h-3'
                    }`}>
                      {isToday ? (
                        <div className="w-5 h-5 rounded-full bg-teal-500 ring-2 ring-teal-200 flex items-center justify-center animate-pulse">
                          <span className="text-[8px] text-white">●</span>
                        </div>
                      ) : isBirth ? (
                        <div className="w-5 h-5 rounded-full bg-blue-500 ring-2 ring-blue-200 flex items-center justify-center">
                          <span className="text-[8px]">👶</span>
                        </div>
                      ) : (
                        <div className={`w-2.5 h-2.5 rounded-full ${severityColor(event.severity)} ${isHovered ? `ring-2 ${severityRing(event.severity)} scale-125` : ''} transition-transform`} />
                      )}
                    </div>

                    {/* Event content */}
                    <div className={`flex-1 min-w-0 rounded-lg transition-all ${
                      isToday ? 'bg-teal-50 border border-teal-200 p-2' :
                      isHovered ? 'bg-white shadow-sm border border-slate-200 p-1.5' :
                      'p-0.5'
                    }`}>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">{event.icon}</span>
                        <span className={`text-[10px] font-semibold truncate ${isToday ? 'text-teal-800' : 'text-slate-700'}`}>
                          {event.title}
                        </span>
                        {!isToday && !isBirth && (
                          <span className="text-[8px] text-slate-400 shrink-0 ml-auto">{monthStr} {dayStr}</span>
                        )}
                      </div>
                      {event.subtitle && (
                        <p className={`text-[9px] ${isToday ? 'text-teal-600' : 'text-slate-500'} mt-0.5 ${isHovered ? '' : 'truncate'}`}>
                          {event.subtitle}
                        </p>
                      )}
                      {/* Expanded detail on hover */}
                      {isHovered && event.detail && (
                        <p className="text-[9px] text-slate-600 mt-1 leading-relaxed">{event.detail}</p>
                      )}
                      {/* Tags */}
                      {event.tags && (isHovered || isToday) && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {event.tags.map((t, j) => (
                            <span key={j} className={`text-[8px] px-1 py-0.5 rounded ${
                              t.includes('⚠') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Bottom legend */}
        <div className="px-3 py-1.5 border-t bg-white/80">
          <div className="flex items-center justify-center gap-2 text-[8px] text-slate-400">
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Normal</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Info</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Watch</span>
            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Alert</span>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER: SETTINGS PANEL
  // ============================================

  function renderSettingsPanel() {
    return (
      <div className="border-b bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-xs">AI Pipeline</h3>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            Mode: <strong>{llmConfig.mode}</strong>
            {llmConfig.groqApiKey ? <span className="text-green-600">✓ Groq</span> : <span>✗ Groq</span>}
            {llmConfig.geminiApiKey ? <span className="text-green-600">✓ Gemini</span> : <span>✗ Gemini</span>}
            <button onClick={() => setShowSettings(false)} className="ml-2 hover:text-foreground">✕</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-medium">⚡ Groq <span className="text-muted-foreground">(free)</span></label>
            <Input type="password" placeholder="gsk_..." value={llmConfig.groqApiKey || ''} onChange={e => updateLlmConfig({ groqApiKey: e.target.value })} className="h-7 text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-medium">✦ Gemini <span className="text-muted-foreground">(free)</span></label>
            <Input type="password" placeholder="AIza..." value={llmConfig.geminiApiKey || ''} onChange={e => updateLlmConfig({ geminiApiKey: e.target.value })} className="h-7 text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-medium">🧠 Local LFM</label>
            <div className="h-7 flex items-center px-2 rounded-md border bg-muted/50 text-[10px]">{llmConfig.ollamaModel}</div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // ONBOARDING — no patient loaded
  // ============================================

  if (!childContext.name) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="h-11 border-b flex items-center px-4 shrink-0 bg-card gap-3">
          <span className="text-lg font-bold">🩺 SKIDS Clinic Console</span>
          {doctorName && (
            <span className="text-xs text-muted-foreground ml-2">
              Dr. {doctorName} <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-1">{doctorRole}</span>
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setShowSettings(s => !s)} className="p-1.5 rounded hover:bg-muted" title="AI Settings">⚙️</button>
            {onSignOut && (
              <button onClick={onSignOut} className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-500" title="Sign Out">Sign Out</button>
            )}
          </div>
        </div>
        {showSettings && renderSettingsPanel()}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center space-y-2">
              <span className="text-5xl">🩺</span>
              <h1 className="text-2xl font-bold">SKIDS Clinic Console</h1>
              <p className="text-sm text-muted-foreground">Pre-checkin via SKIDS Screen → Consultation → Care Plan</p>
            </div>
            <div className="border rounded-xl p-5 space-y-3 bg-card">
              <h3 className="font-semibold text-sm">Patient Check-in</h3>
              <p className="text-xs text-muted-foreground">Scan QR from SKIDS Parent App or enter manually</p>
              <Input placeholder="Child name" value={childContext.name} onChange={e => setChildContext(prev => ({ ...prev, name: e.target.value }))} className="h-9" />
              <div className="flex gap-2">
                <Input placeholder="Age (e.g. 6 years)" value={childContext.age} onChange={e => setChildContext(prev => ({ ...prev, age: e.target.value }))} className="h-9 flex-1" />
                <select value={childContext.gender} onChange={e => setChildContext(prev => ({ ...prev, gender: e.target.value }))} className="h-9 rounded-md border bg-background px-3 text-sm">
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <Input placeholder="Chief complaint / parent concern" value={childContext.parentConcerns || ''} onChange={e => setChildContext(prev => ({ ...prev, parentConcerns: e.target.value }))} className="h-9" />
            </div>
            <button
              onClick={() => {
                setChildContext({ name: 'Arjun K', age: '6 years', gender: 'male', parentConcerns: 'Mother reports squinting at blackboard for 3 months' })
                setPatientRecord(getDemoPatientRecord())
                setScreeningFindings(getDemoScreeningFindings())
              }}
              className="w-full text-left p-3 rounded-lg border border-dashed hover:border-blue-300 hover:bg-blue-50/50 transition-all text-xs text-muted-foreground"
            >
              💡 <strong>Demo:</strong> Arjun K, 6y male — returning patient with Parent App history + today's screening from SKIDS Screen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // MAIN COCKPIT — LHS Strip + Main Area
  // ============================================

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* TOP BAR */}
      <div className="h-11 border-b flex items-center justify-between px-3 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">🩺 SKIDS Clinic</span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
            {childContext.gender === 'female' ? '👧' : '👦'} {childContext.name} · {childContext.age}
          </span>
          {childContext.parentConcerns && (
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 max-w-xs truncate">
              💬 {childContext.parentConcerns}
            </span>
          )}
          {involvedAssistants.size > 0 && (
            <div className="flex items-center gap-0.5 ml-1">
              {[...involvedAssistants].map(id => {
                const a = ASSISTANTS.find(x => x.id === id)
                if (!a) return null
                const c = COLOR_MAP[a.color] || COLOR_MAP.blue
                return (
                  <span key={id} className={`text-[10px] px-1 py-0.5 rounded ${c.light} ${activeAgents.includes(id) ? 'animate-pulse' : ''}`} title={a.name}>
                    {a.icon}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {doctorName && <span className="text-[10px] text-muted-foreground hidden sm:inline">Dr. {doctorName}</span>}
          <button onClick={() => setShowSettings(s => !s)} className="p-1 rounded hover:bg-muted text-xs" title="AI Settings">⚙️</button>
          <button onClick={resetAll} className="text-[10px] px-2 py-1 rounded hover:bg-muted text-muted-foreground">+ New Patient</button>
          {onSignOut && <button onClick={onSignOut} className="text-[10px] px-2 py-1 rounded hover:bg-red-50 text-red-500">Sign Out</button>}
        </div>
      </div>

      {showSettings && renderSettingsPanel()}

      {/* MAIN LAYOUT: LHS Strip + Cockpit */}
      <div className="flex-1 flex overflow-hidden">

        {/* === LHS PATIENT STRIP === */}
        {renderPatientStrip()}

        {/* === MAIN COCKPIT === */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-4 space-y-4">

            {/* ─── TODAY'S SCREENING (from SKIDS Screen pre-checkin) ─── */}
            {screeningFindings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today's Screening</p>
                    <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">via SKIDS Screen</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-red-600 font-medium">{screeningFindings.filter(f => f.risk === 'high').length} high</span>
                    <span className="text-yellow-600 font-medium">{screeningFindings.filter(f => f.risk === 'medium').length} medium</span>
                    <span className="text-green-600 font-medium">{screeningFindings.filter(f => f.risk === 'normal' || f.risk === 'low').length} normal</span>
                    <button
                      onClick={() => setScreeningFindings(prev => prev.map(f => ({ ...f, doctorConfirmed: true })))}
                      className="px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium"
                    >✓ Confirm All</button>
                  </div>
                </div>

                {/* Flagged findings */}
                {screeningFindings.filter(f => f.risk === 'high' || f.risk === 'medium').map((finding, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    finding.doctorConfirmed ? 'opacity-60 bg-green-50/30 border-green-200' :
                    finding.risk === 'high' ? 'bg-red-50/50 border-red-200' : 'bg-yellow-50/50 border-yellow-200'
                  }`}>
                    <span className="text-lg mt-0.5">{finding.moduleIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{finding.moduleName}</span>
                        <Badge variant={finding.risk === 'high' ? 'destructive' : 'secondary'} className="text-[9px] py-0">{finding.risk.toUpperCase()}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {finding.chips.map((chip, j) => (
                          <span key={j} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${
                            chip.severity === 'high' ? 'bg-red-100 text-red-700' :
                            chip.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {chip.aiSuggested && <span className="text-[8px]">🤖</span>}
                            {chip.label}
                          </span>
                        ))}
                      </div>
                      {finding.aiSuggestions?.map((s, j) => (
                        <p key={j} className="text-[11px] text-blue-700 mt-1 bg-blue-50 px-2 py-1 rounded">🤖 {s}</p>
                      ))}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setScreeningFindings(prev => prev.map((f, j) => j === i ? { ...f, doctorConfirmed: true } : f))}
                        className={`px-2 py-1 rounded text-[11px] font-medium ${finding.doctorConfirmed ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >✓</button>
                      <button className="px-2 py-1 rounded text-[11px] bg-gray-100 hover:bg-gray-200">✏️</button>
                    </div>
                  </div>
                ))}

                {/* Normal findings — compact row */}
                <div className="flex flex-wrap gap-1.5">
                  {screeningFindings.filter(f => f.risk === 'normal' || f.risk === 'low').map((f, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border ${
                      f.doctorConfirmed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-500'
                    }`}>
                      {f.moduleIcon} {f.moduleName} {f.doctorConfirmed && '✓'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ─── CONSULTATION ─── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Consultation</p>

              {messages.map((msg) => {
                if (msg.role === 'doctor') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-blue-600 text-white text-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  )
                }
                if (msg.role === 'orchestrator') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="px-3 py-1 rounded-full bg-muted text-[11px] text-muted-foreground">{msg.content}</span>
                    </div>
                  )
                }
                const c = COLOR_MAP[msg.assistantColor || 'blue'] || COLOR_MAP.blue
                return (
                  <div key={msg.id} className={`rounded-xl px-4 py-3 ${c.bubble}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">{msg.assistantIcon}</span>
                      <span className={`text-xs font-semibold ${c.text}`}>{msg.assistantName}</span>
                      {msg.provider && msg.provider !== 'none' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          msg.provider === 'groq' ? 'bg-orange-100 text-orange-600' :
                          msg.provider === 'gemini' ? 'bg-blue-100 text-blue-600' :
                          msg.provider === 'ollama' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {msg.provider === 'groq' ? '⚡ Groq' : msg.provider === 'gemini' ? '✦ Gemini' : msg.provider === 'ollama' ? '🧠 LFM' : msg.provider === 'demo' ? '📋 Demo' : msg.provider}
                          {msg.latencyMs ? ` ${(msg.latencyMs / 1000).toFixed(1)}s` : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{renderMarkdown(msg.content)}</div>
                    {msg.artifacts && msg.artifacts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.artifacts.map((art, j) => (
                          <button key={j} onClick={() => { setSelectedArtifact(art); setArtifactPanelOpen(true) }}
                            className={`text-left px-2.5 py-1.5 rounded-lg border ${c.border} ${c.light} hover:shadow-sm text-xs transition-all`}>
                            <span className="text-sm">{ARTIFACT_ICONS[art.type] || '📎'}</span> {art.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {loading && (
                <div className="flex justify-center">
                  <span className="text-xs text-muted-foreground animate-pulse">Subspecialty agents analyzing...</span>
                </div>
              )}

              {messages.length === 0 && screeningFindings.length > 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Screening reviewed. Describe your clinical findings below.</p>
                  <p className="text-xs mt-1">Subspecialty agents auto-activate based on your notes.</p>
                </div>
              )}

              {messages.length === 0 && screeningFindings.length === 0 && (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-muted-foreground">No screening data yet. Run SKIDS Screen pre-checkin or describe findings.</p>
                  <Button size="sm" variant="outline" onClick={() => { setScreeningFindings(getDemoScreeningFindings()); setPatientRecord(getDemoPatientRecord()) }}>
                    Load Demo Pre-checkin
                  </Button>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 items-center">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe findings — agents auto-activate..."
                  className="flex-1 h-10"
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !inputText.trim()} className="h-10 px-4">Send</Button>
              </div>
            </div>

            {/* ─── CARE PLAN ─── */}
            {messages.length > 2 && !carePlan && (
              <div className="text-center">
                <Button onClick={generateCarePlan} className="gap-2">🛡️ Generate SKIDS Care Plan</Button>
              </div>
            )}

            {carePlan && (
              <div className="space-y-3 pb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">🛡️ SKIDS Care Plan</h2>
                    <p className="text-[11px] text-muted-foreground">Rx + Education + Nutrition + Wellbeing + Shield</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="default" className="text-xs h-7">📱 Send to Parent App</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.print()}>🖨️</Button>
                  </div>
                </div>

                {(['prescription', 'referral', 'education', 'nutrition', 'wellbeing', 'followup', 'milestone'] as const).map(cat => {
                  const items = carePlan.items.filter(item => item.category === cat)
                  if (items.length === 0) return null
                  const cfg: Record<string, { title: string; color: string }> = {
                    prescription: { title: '💊 Prescriptions', color: 'border-l-blue-500 bg-blue-50/30' },
                    referral: { title: '📨 Referrals & Investigations', color: 'border-l-purple-500 bg-purple-50/30' },
                    education: { title: '📖 Parent Education', color: 'border-l-green-500 bg-green-50/30' },
                    nutrition: { title: '🥗 Nutrition', color: 'border-l-orange-500 bg-orange-50/30' },
                    wellbeing: { title: '💛 Wellbeing & Emotional Health', color: 'border-l-yellow-500 bg-yellow-50/30' },
                    followup: { title: '🛡️ SKIDS Shield', color: 'border-l-teal-500 bg-teal-50/30' },
                    milestone: { title: '🏆 Milestones', color: 'border-l-indigo-500 bg-indigo-50/30' },
                  }
                  const c = cfg[cat]
                  return (
                    <div key={cat} className={`rounded-lg border-l-4 p-3 ${c.color}`}>
                      <p className="text-xs font-semibold mb-2">{c.title}</p>
                      <div className="space-y-2">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-sm mt-0.5">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{item.details}</p>
                              {item.urgency && item.urgency !== 'routine' && (
                                <Badge variant="destructive" className="text-[9px] mt-1">{item.urgency.toUpperCase()}</Badge>
                              )}
                            </div>
                            {item.source && <span className="text-[9px] text-muted-foreground shrink-0">{item.source}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                <p className="text-[10px] text-muted-foreground text-center pt-2">
                  Generated by SKIDS AI · Reviewed by treating physician · Not a substitute for clinical judgment
                </p>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* ARTIFACT MODAL */}
      {artifactPanelOpen && selectedArtifact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setArtifactPanelOpen(false)}>
          <div className="bg-background rounded-xl border shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{ARTIFACT_ICONS[selectedArtifact.type] || '📎'}</span>
                <div>
                  <p className="font-semibold text-sm">{selectedArtifact.title}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedArtifact.type.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <button onClick={() => setArtifactPanelOpen(false)} className="p-1 rounded hover:bg-muted">✕</button>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {selectedArtifact.rendered}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

