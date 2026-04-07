/**
 * LifeDialDrawer — Collapsible left drawer for the Life Timeline
 *
 * States:
 * 1. CLOSED — peek handle on left edge + clock icon in parent
 * 2. OPEN — full overlay slides from left, background dims
 * 3. PEEK — slim toast after observation saved, auto-dismisses
 *
 * Mobile: always drawer overlay
 * Desktop (768px+): could be persistent rail, but still collapsible
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import LifeDial from './LifeDial'

interface Props {
  childId: string
  childDob: string
  childName: string
  token: string
  isOpen: boolean
  onToggle: () => void
  /** Set to true after an observation is saved to trigger auto-peek */
  peekTrigger?: number
}

interface PeekData {
  message: string
  detail: string
}

export default function LifeDialDrawer({
  childId,
  childDob,
  childName,
  token,
  isOpen,
  onToggle,
  peekTrigger = 0,
}: Props) {
  const [showPeek, setShowPeek] = useState(false)
  const [peekData, setPeekData] = useState<PeekData | null>(null)
  const [animating, setAnimating] = useState(false)
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-peek when observation saved
  useEffect(() => {
    if (peekTrigger > 0 && !isOpen) {
      setPeekData({
        message: 'Timeline updated',
        detail: `New observation at ${getAgeLabel(childDob)}`,
      })
      setShowPeek(true)

      // Auto-dismiss after 4 seconds
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current)
      peekTimerRef.current = setTimeout(() => {
        setShowPeek(false)
        setPeekData(null)
      }, 4000)
    }
    return () => {
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current)
    }
  }, [peekTrigger, isOpen, childDob])

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setAnimating(true)
      setShowPeek(false) // Close peek if drawer opens
    }
  }, [isOpen])

  function handleClose() {
    setAnimating(false)
    // Small delay for exit animation
    setTimeout(() => onToggle(), 200)
  }

  const ageMonths = getAgeMonths(childDob)

  return (
    <>
      {/* ── PEEK HANDLE — always visible on left edge ── */}
      {!isOpen && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={onToggle}
            className="flex items-center group"
            aria-label="Open life timeline"
          >
            {/* Handle bar */}
            <div className="w-5 bg-gradient-to-r from-green-600 to-green-500 rounded-r-xl py-5 flex flex-col items-center justify-center shadow-md group-hover:w-6 transition-all">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            {/* Age chip */}
            <div className="bg-green-50 border border-green-200 rounded-r-lg px-1.5 py-0.5 shadow-sm group-hover:bg-green-100 transition-colors">
              <p className="text-[8px] text-green-700 font-bold">{ageMonths}m</p>
            </div>
          </button>
        </div>
      )}

      {/* ── AUTO-PEEK TOAST — slides from left after observation ── */}
      {showPeek && !isOpen && peekData && (
        <div className="fixed left-0 top-24 z-30 animate-[slideInLeft_0.3s_ease-out]">
          <button
            onClick={() => {
              setShowPeek(false)
              onToggle() // Open drawer on tap
            }}
            className="bg-white border border-green-200 rounded-r-2xl shadow-lg px-4 py-3 max-w-[220px] hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-green-700">{peekData.message}</p>
                <p className="text-[9px] text-gray-500">{peekData.detail}</p>
              </div>
            </div>
            {/* Mini dial snippet */}
            <div className="flex items-center gap-1 mt-2 pl-4">
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <div className="w-5 h-0.5 bg-green-300" />
              </div>
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-600 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
                <div className="w-5 h-0.5 bg-gray-200" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full border border-amber-400 bg-white" />
              <span className="text-[8px] text-gray-400 ml-1">
                {Math.max(0, ageMonths - 1)}m → {ageMonths}m → {ageMonths + 1}m
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── DRAWER OVERLAY ── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${
              animating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />

          {/* Drawer panel */}
          <div
            className={`fixed left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-200 ${
              animating ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <LifeDial
              childId={childId}
              childDob={childDob}
              token={token}
              onClose={handleClose}
            />
          </div>
        </>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}

function getAgeMonths(dob: string): number {
  const birth = new Date(dob)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

function getAgeLabel(dob: string): string {
  const months = getAgeMonths(dob)
  if (months < 1) return 'newborn'
  if (months < 12) return `${months} months`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years}y ${rem}mo` : `${years} years`
}
