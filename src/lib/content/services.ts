export interface Service {
  slug: string
  name: string
  emoji: string
  category: string
  deliveryType: 'digital' | 'telehealth' | 'in_clinic' | 'hybrid'
  deliveryLabel: string
  priceInr: number
  priceLabel: string
  description: string
  badge?: string
  providerType: 'skids' | 'partner'
}

export const SERVICES: Service[] = [
  {
    slug: 'vision-check', name: 'Vision Screening', emoji: '👁️',
    category: 'vision', deliveryType: 'in_clinic', deliveryLabel: 'In-Clinic',
    priceInr: 799, priceLabel: '₹799',
    description: 'FDA-approved eye tracking assessment. Detect myopia, amblyopia, and vision issues early.',
    badge: 'Popular', providerType: 'skids',
  },
  {
    slug: 'nutreeai', name: 'NutreeAI Nutrition', emoji: '🥗',
    category: 'nutrition', deliveryType: 'digital', deliveryLabel: 'Digital',
    priceInr: 399, priceLabel: '₹399/mo',
    description: 'AI-powered personalized meal plans based on your child\'s growth, biomarkers, and preferences.',
    badge: 'AI-Powered', providerType: 'skids',
  },
  {
    slug: 'behavioral-assessment', name: 'Behavioral Assessment', emoji: '🧠',
    category: 'behavioral', deliveryType: 'digital', deliveryLabel: 'Digital',
    priceInr: 499, priceLabel: '₹499',
    description: 'Standardized screening for ADHD, autism, anxiety, and developmental concerns.',
    badge: 'Clinical', providerType: 'skids',
  },
  {
    slug: 'sleep-program', name: 'Sleep Program', emoji: '😴',
    category: 'sleep', deliveryType: 'digital', deliveryLabel: 'Digital',
    priceInr: 1499, priceLabel: '₹1,499',
    description: '4-week evidence-based sleep intervention. Better sleep = better growth + better mood.',
    badge: 'New', providerType: 'skids',
  },
  {
    slug: 'speech-therapy', name: 'Speech Therapy', emoji: '🗣️',
    category: 'therapy', deliveryType: 'telehealth', deliveryLabel: 'Telehealth',
    priceInr: 999, priceLabel: '₹999/session',
    description: 'Online sessions with certified speech-language pathologists for speech and language delays.',
    providerType: 'partner',
  },
  {
    slug: 'pediatric-consult', name: 'Pediatric Consult', emoji: '👨‍⚕️',
    category: 'consultation', deliveryType: 'telehealth', deliveryLabel: 'Telehealth',
    priceInr: 499, priceLabel: '₹499',
    description: 'Quick video consultation with experienced pediatricians. Get answers in 15 minutes.',
    badge: 'Quick', providerType: 'partner',
  },
  {
    slug: 'specs-myopia', name: 'Specs & Myopia Care', emoji: '👓',
    category: 'vision', deliveryType: 'hybrid', deliveryLabel: 'Ship to Home',
    priceInr: 1999, priceLabel: 'from ₹1,999',
    description: 'Myopia arrest lenses with 30-60% progression reduction. Monthly monitoring included.',
    providerType: 'skids',
  },
  {
    slug: 'parenting-coach', name: 'Parenting Coach', emoji: '👨‍👩‍👧',
    category: 'parenting', deliveryType: 'telehealth', deliveryLabel: 'Video + Chat',
    priceInr: 299, priceLabel: '₹299/mo',
    description: 'Expert guidance for modern parenting challenges. Digital detox, behavior, school readiness.',
    badge: 'Popular', providerType: 'skids',
  },
  {
    slug: 'growth-tracking', name: 'Growth Tracking Pro', emoji: '📊',
    category: 'digital', deliveryType: 'digital', deliveryLabel: 'Digital',
    priceInr: 199, priceLabel: '₹199/mo',
    description: 'WHO z-score monitoring with AI trend analysis. Spot growth concerns early.',
    badge: 'AI-Powered', providerType: 'skids',
  },
  {
    slug: 'occupational-therapy', name: 'Occupational Therapy', emoji: '✋',
    category: 'therapy', deliveryType: 'telehealth', deliveryLabel: 'Telehealth',
    priceInr: 899, priceLabel: '₹899/session',
    description: 'Help with fine motor skills, sensory processing, and daily activity independence.',
    providerType: 'partner',
  },
]

export const SERVICE_CATEGORIES = [
  { key: 'all', label: 'All Services' },
  { key: 'vision', label: 'Vision' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'behavioral', label: 'Behavioral' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'therapy', label: 'Therapy' },
  { key: 'consultation', label: 'Consult' },
  { key: 'parenting', label: 'Parenting' },
  { key: 'digital', label: 'Digital' },
]
