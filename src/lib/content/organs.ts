export interface OrganModule {
  slug: string
  name: string
  emoji: string
  description: string
  wonderFact: string
  duration: string
  gradient: string
  relatedCategories: string[]
  relatedHabit: string
}

export const ORGANS: OrganModule[] = [
  {
    slug: 'brain', name: 'Brain & Mind', emoji: '🧠',
    description: 'Your child\'s brain forms 1 million new connections every single second. The first 5 years shape everything.',
    wonderFact: '86 billion neurons — more stars than in the Milky Way',
    duration: '5 min', gradient: 'from-purple-600 to-violet-700',
    relatedCategories: ['Mental Health', 'Neurodevelopment', 'Development'],
    relatedHabit: 'inner_coaching',
  },
  {
    slug: 'heart', name: 'Heart & Blood', emoji: '❤️',
    description: 'A tiny heart the size of a fist, beating 100,000 times a day to keep your child growing strong.',
    wonderFact: 'Pumps 2,000 gallons of blood every day — enough to fill a swimming pool in a week',
    duration: '5 min', gradient: 'from-red-500 to-rose-600',
    relatedCategories: ['Physical Health', 'Heart'],
    relatedHabit: 'active_movement',
  },
  {
    slug: 'eyes', name: 'Eyes & Vision', emoji: '👁️',
    description: '80% of learning happens through vision. Early detection of vision issues changes everything.',
    wonderFact: 'Your child\'s eyes can distinguish 10 million different colors',
    duration: '5 min', gradient: 'from-amber-500 to-orange-600',
    relatedCategories: ['Vision', 'Physical Health'],
    relatedHabit: 'timekeepers',
  },
  {
    slug: 'ears', name: 'Hearing & Sound', emoji: '👂',
    description: 'Language development depends on hearing. The critical window is birth to 3 years.',
    wonderFact: 'Contains the 3 smallest bones in the entire human body',
    duration: '5 min', gradient: 'from-indigo-500 to-blue-600',
    relatedCategories: ['Hearing', 'Development'],
    relatedHabit: 'sufficient_sleep',
  },
  {
    slug: 'lungs', name: 'Lungs & Breathing', emoji: '🫁',
    description: 'Your child takes 20,000 breaths a day. Every breath fuels growth, learning, and play.',
    wonderFact: 'If flattened, lung surface area equals a tennis court',
    duration: '5 min', gradient: 'from-sky-500 to-cyan-600',
    relatedCategories: ['Physical Health', 'Respiratory'],
    relatedHabit: 'balanced_stress',
  },
  {
    slug: 'digestive', name: 'Nutrition & Gut', emoji: '🍎',
    description: 'The gut makes 95% of serotonin — the happy hormone. What your child eats shapes how they feel and think.',
    wonderFact: '30 feet of incredible food processing — longer than a school bus',
    duration: '5 min', gradient: 'from-orange-500 to-amber-600',
    relatedCategories: ['Nutrition', 'Physical Health'],
    relatedHabit: 'healthy_eating',
  },
  {
    slug: 'skin', name: 'Skin & Protection', emoji: '🛡️',
    description: 'The body\'s largest organ — completely renews every 28 days. Your child\'s first line of defence.',
    wonderFact: '1,000+ nerve endings per square inch — a super-sensor suit',
    duration: '5 min', gradient: 'from-pink-500 to-rose-600',
    relatedCategories: ['Physical Health', 'Skin'],
    relatedHabit: 'sufficient_sleep',
  },
  {
    slug: 'muscles', name: 'Muscles & Bones', emoji: '🦴',
    description: '600+ muscles and 206 bones working together. A baby is born with 270 bones that fuse as they grow.',
    wonderFact: 'Bone is 5x stronger than steel, gram for gram',
    duration: '5 min', gradient: 'from-emerald-500 to-green-600',
    relatedCategories: ['Physical Health', 'Motor'],
    relatedHabit: 'active_movement',
  },
  {
    slug: 'immune', name: 'Immune System', emoji: '🛡️',
    description: 'An army of 25 billion white blood cells, learning and remembering every germ they fight.',
    wonderFact: 'Remembers every germ it has ever defeated — a lifelong memory bank',
    duration: '5 min', gradient: 'from-teal-500 to-emerald-600',
    relatedCategories: ['Physical Health'],
    relatedHabit: 'healthy_eating',
  },
  {
    slug: 'hormones', name: 'Hormones & Growth', emoji: '⚡',
    description: '50+ chemical messengers controlling growth, mood, sleep, and energy. The invisible architects.',
    wonderFact: 'Growth hormone is released mainly during deep sleep — sleep literally makes your child taller',
    duration: '5 min', gradient: 'from-yellow-500 to-amber-600',
    relatedCategories: ['Physical Health', 'Sleep'],
    relatedHabit: 'sufficient_sleep',
  },
  {
    slug: 'kidneys', name: 'Kidneys & Filtering', emoji: '💧',
    description: 'Two incredible filters processing 50 gallons of blood daily. Your child\'s water treatment plant.',
    wonderFact: 'Each kidney has 1 million tiny filters called nephrons',
    duration: '5 min', gradient: 'from-cyan-500 to-blue-600',
    relatedCategories: ['Physical Health'],
    relatedHabit: 'healthy_eating',
  },
  // Developmental domains
  {
    slug: 'learning', name: 'Learning & Cognition', emoji: '📚',
    description: 'Working memory, attention, problem-solving — the mental toolkit that shapes your child\'s future.',
    wonderFact: 'Working memory holds 7±2 items — that\'s why phone numbers are 7 digits',
    duration: '5 min', gradient: 'from-violet-500 to-purple-600',
    relatedCategories: ['Development', 'Mental Health'],
    relatedHabit: 'inner_coaching',
  },
  {
    slug: 'language', name: 'Language & Speech', emoji: '🗣️',
    description: 'Children learn 9 new words every day. By age 6, they know 13,000 words. Language is a superpower.',
    wonderFact: 'Bilingual children have measurably more flexible brains',
    duration: '5 min', gradient: 'from-rose-500 to-pink-600',
    relatedCategories: ['Development', 'Hearing'],
    relatedHabit: 'inner_coaching',
  },
  {
    slug: 'emotions', name: 'Emotional Health', emoji: '💛',
    description: 'Empathy develops at 18 months. Emotional intelligence is the strongest predictor of life success.',
    wonderFact: 'Children can identify 30+ distinct emotions by age 5',
    duration: '5 min', gradient: 'from-fuchsia-500 to-purple-600',
    relatedCategories: ['Mental Health', 'Parental Guidance'],
    relatedHabit: 'balanced_stress',
  },
  {
    slug: 'movement', name: 'Motor Skills', emoji: '🏃',
    description: 'From first steps to first bike ride — 3 balance systems coordinating every move your child makes.',
    wonderFact: 'Cross-lateral movements (crawling) literally wire the brain halves together',
    duration: '5 min', gradient: 'from-lime-500 to-green-600',
    relatedCategories: ['Physical Health', 'Motor'],
    relatedHabit: 'active_movement',
  },
  {
    slug: 'senses', name: 'Sensory World', emoji: '🌈',
    description: 'Not 5 senses — at least 7. Your child processes 11 million bits of information every second.',
    wonderFact: 'Each child has a unique sensory profile — no two process the world the same way',
    duration: '5 min', gradient: 'from-blue-500 to-indigo-600',
    relatedCategories: ['Development'],
    relatedHabit: 'balanced_stress',
  },
]

/** Get organ by blog category */
export function getOrganForCategory(category: string): OrganModule | undefined {
  return ORGANS.find(o => o.relatedCategories.some(c =>
    category.toLowerCase().includes(c.toLowerCase()) ||
    c.toLowerCase().includes(category.toLowerCase())
  ))
}

/** Get today's featured organ (rotates daily) */
export function getTodaysOrgan(): OrganModule {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return ORGANS[dayOfYear % ORGANS.length]
}
