/**
 * Maps a blog article's category and tags to the most relevant forum group ID.
 * Uses keyword priority matching — first match wins.
 */

const KEYWORD_MAP: Array<{ keywords: string[]; groupId: string }> = [
  { keywords: ['nutrition', 'feeding', 'food', 'diet', 'breastfeed', 'formula', 'solids', 'nutree', 'meal', 'eating', 'iron', 'magnesium'], groupId: 'topic-nutrition' },
  { keywords: ['sleep', 'bedtime', 'nap', 'night waking', 'circadian', 'insomnia'], groupId: 'topic-sleep' },
  { keywords: ['development', 'milestone', 'speech', 'motor', 'cognitive', 'language', 'chatter', 'sensory', 'vestibular', 'auditory', 'vision', 'hearing', 'dental', 'oral'], groupId: 'topic-development' },
  { keywords: ['behavior', 'behaviour', 'tantrum', 'discipline', 'screen time', 'emotion', 'defiance', 'adhd', 'autism', 'anxiety', 'mental health', 'stress', 'cortisol'], groupId: 'topic-behavior' },
  { keywords: ['health', 'illness', 'vaccine', 'fever', 'doctor', 'sick', 'immune', 'infection', 'cavity', 'tooth', 'respiratory', 'lung'], groupId: 'topic-health' },
  { keywords: ['newborn', 'infant', '0-6', '0 month', '1 month', '2 month', '3 month', '4 month', '5 month', '6 month'], groupId: 'age-0-6m' },
  { keywords: ['6-12', '7 month', '8 month', '9 month', '10 month', '11 month', '12 month', 'crawl', 'first words', 'solids'], groupId: 'age-6-12m' },
  { keywords: ['toddler', '1-2', '1 year', '2 year', 'walking', 'talking'], groupId: 'age-1-2y' },
  { keywords: ['preschool', '2-5', 'potty', '3 year', '4 year', '5 year'], groupId: 'age-2-5y' },
  { keywords: ['school', '5+', '6 year', '7 year', '8 year', '9 year', '10 year', 'learning', 'academic', 'exam', 'cbse'], groupId: 'age-5plus' },
]

export function mapBlogToGroup(category: string, tags: string[]): string {
  const haystack = [category, ...tags].join(' ').toLowerCase()

  for (const { keywords, groupId } of KEYWORD_MAP) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      return groupId
    }
  }

  // Default fallback
  return 'topic-development'
}
