export interface Habit {
  key: string
  letter: string
  name: string
  emoji: string
  color: string
  bgColor: string
  tagline: string
  tip: string
  description: string
}

export const HABITS: Habit[] = [
  {
    key: 'healthy_eating', letter: 'H', name: 'Healthy Eating', emoji: '🥗',
    color: 'text-green-600', bgColor: 'bg-green-500',
    tagline: 'Fuel for Body and Brain',
    tip: 'Try the Rainbow Plate challenge — 6 colors of food in one meal today!',
    description: 'Brain foods like omega-3s, iron, and colorful vegetables literally build neural pathways. You are what you eat — especially when you\'re growing.',
  },
  {
    key: 'active_movement', letter: 'A', name: 'Active Movement', emoji: '🏃',
    color: 'text-orange-600', bgColor: 'bg-orange-500',
    tagline: 'The Brain\'s Miracle-Gro',
    tip: '20 minutes of physical play today — jumping, running, or dancing!',
    description: 'Physical activity releases BDNF — a protein that\'s literally Miracle-Gro for the brain. Active kids focus better, sleep better, and learn faster.',
  },
  {
    key: 'balanced_stress', letter: 'B', name: 'Balanced Stress', emoji: '🧘',
    color: 'text-purple-600', bgColor: 'bg-purple-500',
    tagline: 'Building a Resilient Brain',
    tip: 'Try Box Breathing together: 4 seconds in, 4 hold, 4 out, 4 hold.',
    description: 'Some stress builds resilience. Too much damages development. The goal isn\'t zero stress — it\'s teaching your child to navigate it.',
  },
  {
    key: 'inner_coaching', letter: 'I', name: 'Inner Coaching', emoji: '💬',
    color: 'text-blue-600', bgColor: 'bg-blue-500',
    tagline: 'Architecting the Mind',
    tip: 'Replace "I can\'t" with "I can\'t YET" — the magic word that rewires the brain.',
    description: 'Growth mindset isn\'t just positive thinking. It physically rewires neural pathways. The words we use with our children become their inner voice.',
  },
  {
    key: 'timekeepers', letter: 'T', name: 'Timekeepers', emoji: '⏰',
    color: 'text-amber-600', bgColor: 'bg-amber-500',
    tagline: 'Mastering the Body\'s Clock',
    tip: '10 minutes of morning sunlight — it sets your child\'s circadian clock for the whole day.',
    description: 'Circadian rhythm controls everything: hormones, appetite, mood, focus. A consistent routine is the single most underrated parenting superpower.',
  },
  {
    key: 'sufficient_sleep', letter: 'S', name: 'Sufficient Sleep', emoji: '😴',
    color: 'text-indigo-600', bgColor: 'bg-indigo-500',
    tagline: 'The Brain\'s Nightly Recharge',
    tip: 'Start the Power-Down Hour: no screens 60 minutes before bed.',
    description: 'During sleep, the brain consolidates memories, clears toxins, and releases growth hormone. Children who sleep well literally grow smarter overnight.',
  },
]

/** Get today's habit (rotates daily through the 6 habits) */
export function getTodaysHabit(): Habit {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return HABITS[dayOfYear % HABITS.length]
}
