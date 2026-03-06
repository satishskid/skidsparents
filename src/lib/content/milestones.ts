export interface MilestoneDefinition {
  key: string
  title: string
  category: 'motor' | 'cognitive' | 'social' | 'language'
  description: string
  expectedAgeMin: number // months
  expectedAgeMax: number // months
}

export const MILESTONES: MilestoneDefinition[] = [
  // ─── Motor (0–60 months) ─────────────────────────────
  { key: 'head_control', title: 'Holds head steady', category: 'motor', description: 'Can hold head upright and steady when held in a sitting position.', expectedAgeMin: 1, expectedAgeMax: 4 },
  { key: 'rolls_over', title: 'Rolls over', category: 'motor', description: 'Rolls from tummy to back and back to tummy independently.', expectedAgeMin: 3, expectedAgeMax: 6 },
  { key: 'sits_without_support', title: 'Sits without support', category: 'motor', description: 'Sits steadily without using hands for balance.', expectedAgeMin: 5, expectedAgeMax: 8 },
  { key: 'crawls', title: 'Crawls', category: 'motor', description: 'Moves forward on hands and knees or belly crawls purposefully.', expectedAgeMin: 6, expectedAgeMax: 10 },
  { key: 'pulls_to_stand', title: 'Pulls to stand', category: 'motor', description: 'Pulls self up to standing using furniture or support.', expectedAgeMin: 8, expectedAgeMax: 12 },
  { key: 'walks_independently', title: 'Walks independently', category: 'motor', description: 'Takes several steps without holding on to anything.', expectedAgeMin: 9, expectedAgeMax: 15 },
  { key: 'runs', title: 'Runs', category: 'motor', description: 'Runs with coordination, can start and stop without falling.', expectedAgeMin: 15, expectedAgeMax: 24 },
  { key: 'kicks_ball', title: 'Kicks a ball', category: 'motor', description: 'Kicks a ball forward without losing balance.', expectedAgeMin: 18, expectedAgeMax: 24 },
  { key: 'jumps_both_feet', title: 'Jumps with both feet', category: 'motor', description: 'Jumps off the ground with both feet leaving the floor simultaneously.', expectedAgeMin: 24, expectedAgeMax: 36 },
  { key: 'pedals_tricycle', title: 'Pedals a tricycle', category: 'motor', description: 'Can pedal and steer a tricycle or similar ride-on toy.', expectedAgeMin: 30, expectedAgeMax: 42 },
  { key: 'hops_one_foot', title: 'Hops on one foot', category: 'motor', description: 'Hops on one foot for a few steps without losing balance.', expectedAgeMin: 36, expectedAgeMax: 48 },
  { key: 'catches_ball', title: 'Catches a bounced ball', category: 'motor', description: 'Catches a large ball bounced to them most of the time.', expectedAgeMin: 42, expectedAgeMax: 60 },

  // ─── Cognitive (0–60 months) ─────────────────────────
  { key: 'tracks_objects', title: 'Tracks moving objects', category: 'cognitive', description: 'Eyes follow a slowly moving object or face from side to side.', expectedAgeMin: 1, expectedAgeMax: 3 },
  { key: 'reaches_for_toys', title: 'Reaches for toys', category: 'cognitive', description: 'Reaches out intentionally to grab a toy or interesting object.', expectedAgeMin: 3, expectedAgeMax: 5 },
  { key: 'object_permanence', title: 'Understands object permanence', category: 'cognitive', description: 'Looks for a toy that has been hidden under a cloth or behind something.', expectedAgeMin: 6, expectedAgeMax: 10 },
  { key: 'cause_effect', title: 'Understands cause and effect', category: 'cognitive', description: 'Drops or throws things on purpose to see what happens. Presses buttons to activate toys.', expectedAgeMin: 8, expectedAgeMax: 12 },
  { key: 'stacks_blocks', title: 'Stacks blocks', category: 'cognitive', description: 'Stacks 2-4 blocks on top of each other.', expectedAgeMin: 12, expectedAgeMax: 18 },
  { key: 'simple_puzzles', title: 'Completes simple puzzles', category: 'cognitive', description: 'Fits shapes into a shape sorter or completes a 3-4 piece puzzle.', expectedAgeMin: 18, expectedAgeMax: 24 },
  { key: 'pretend_play', title: 'Engages in pretend play', category: 'cognitive', description: 'Pretends to feed a doll, talk on a phone, or act out simple scenarios.', expectedAgeMin: 18, expectedAgeMax: 30 },
  { key: 'sorts_by_shape_color', title: 'Sorts by shape and color', category: 'cognitive', description: 'Groups objects by one attribute like color, shape, or size.', expectedAgeMin: 24, expectedAgeMax: 36 },
  { key: 'counts_to_ten', title: 'Counts to 10', category: 'cognitive', description: 'Counts objects up to 10 with one-to-one correspondence.', expectedAgeMin: 36, expectedAgeMax: 48 },
  { key: 'understands_time', title: 'Understands time concepts', category: 'cognitive', description: 'Grasps concepts like yesterday, today, tomorrow, morning, and night.', expectedAgeMin: 42, expectedAgeMax: 60 },

  // ─── Social-Emotional (0–60 months) ──────────────────
  { key: 'social_smile', title: 'Social smile', category: 'social', description: 'Smiles in response to a parent\'s smile or voice.', expectedAgeMin: 1, expectedAgeMax: 3 },
  { key: 'laughs', title: 'Laughs out loud', category: 'social', description: 'Laughs during playful interaction like peek-a-boo.', expectedAgeMin: 3, expectedAgeMax: 5 },
  { key: 'stranger_anxiety', title: 'Shows stranger anxiety', category: 'social', description: 'Shows wariness or cries around unfamiliar people — a sign of healthy attachment.', expectedAgeMin: 6, expectedAgeMax: 10 },
  { key: 'waves_bye', title: 'Waves bye-bye', category: 'social', description: 'Waves goodbye when prompted or in imitation.', expectedAgeMin: 9, expectedAgeMax: 14 },
  { key: 'plays_alongside', title: 'Plays alongside others', category: 'social', description: 'Engages in parallel play — plays near other children with similar toys.', expectedAgeMin: 18, expectedAgeMax: 24 },
  { key: 'shows_empathy', title: 'Shows empathy', category: 'social', description: 'Notices when someone is upset and tries to comfort them.', expectedAgeMin: 18, expectedAgeMax: 30 },
  { key: 'takes_turns', title: 'Takes turns', category: 'social', description: 'Can wait briefly and take turns during games or conversations.', expectedAgeMin: 24, expectedAgeMax: 36 },
  { key: 'cooperative_play', title: 'Plays cooperatively', category: 'social', description: 'Plays with other children with shared goals and agreed-upon rules.', expectedAgeMin: 36, expectedAgeMax: 48 },
  { key: 'expresses_feelings', title: 'Expresses feelings with words', category: 'social', description: 'Uses words like happy, sad, angry, or scared to describe emotions.', expectedAgeMin: 36, expectedAgeMax: 48 },
  { key: 'makes_friends', title: 'Makes friends independently', category: 'social', description: 'Initiates play with peers and has preferred friends.', expectedAgeMin: 42, expectedAgeMax: 60 },

  // ─── Language (0–60 months) ──────────────────────────
  { key: 'coos', title: 'Coos and gurgles', category: 'language', description: 'Makes vowel-like sounds (ooh, aah) in response to interaction.', expectedAgeMin: 1, expectedAgeMax: 4 },
  { key: 'babbles', title: 'Babbles consonant sounds', category: 'language', description: 'Produces repeated syllables like ba-ba, da-da, ma-ma.', expectedAgeMin: 4, expectedAgeMax: 8 },
  { key: 'responds_to_name', title: 'Responds to own name', category: 'language', description: 'Turns head or looks when their name is called.', expectedAgeMin: 5, expectedAgeMax: 9 },
  { key: 'first_words', title: 'Says first real words', category: 'language', description: 'Uses 1-3 words with meaning like mama, dada, or ball.', expectedAgeMin: 9, expectedAgeMax: 14 },
  { key: 'points_to_show', title: 'Points to show or request', category: 'language', description: 'Uses pointing to indicate wants or to share interest in something.', expectedAgeMin: 9, expectedAgeMax: 14 },
  { key: 'follows_simple_instructions', title: 'Follows simple instructions', category: 'language', description: 'Understands and follows one-step instructions like "Give me the ball."', expectedAgeMin: 12, expectedAgeMax: 18 },
  { key: 'two_word_phrases', title: 'Uses two-word phrases', category: 'language', description: 'Combines two words like "more milk," "daddy go," or "big dog."', expectedAgeMin: 18, expectedAgeMax: 24 },
  { key: 'knows_body_parts', title: 'Names body parts', category: 'language', description: 'Can point to and name at least 6 body parts.', expectedAgeMin: 18, expectedAgeMax: 30 },
  { key: 'simple_sentences', title: 'Speaks in sentences', category: 'language', description: 'Uses 3-4 word sentences and is understood by familiar adults most of the time.', expectedAgeMin: 24, expectedAgeMax: 36 },
  { key: 'tells_stories', title: 'Tells simple stories', category: 'language', description: 'Narrates simple events or stories with a beginning, middle, and end.', expectedAgeMin: 36, expectedAgeMax: 48 },
  { key: 'asks_why', title: 'Asks "why" questions', category: 'language', description: 'Frequently asks "why" and "how" questions to understand the world.', expectedAgeMin: 30, expectedAgeMax: 48 },
]

/** Get milestones appropriate for a child's age in months */
export function getMilestonesForAge(ageMonths: number): MilestoneDefinition[] {
  // Show milestones where child is within or near the expected age range
  // Include milestones up to 6 months ahead for anticipatory guidance
  return MILESTONES.filter(
    (m) => m.expectedAgeMin <= ageMonths + 6 && m.expectedAgeMax >= Math.max(0, ageMonths - 6)
  )
}

/** Get milestones by category */
export function getMilestonesByCategory(category: MilestoneDefinition['category']): MilestoneDefinition[] {
  return MILESTONES.filter((m) => m.category === category)
}

export const MILESTONE_CATEGORIES = [
  { key: 'motor' as const, label: 'Motor', emoji: '🏃', color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'cognitive' as const, label: 'Cognitive', emoji: '🧠', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'social' as const, label: 'Social', emoji: '❤️', color: 'text-pink-600', bg: 'bg-pink-50' },
  { key: 'language' as const, label: 'Language', emoji: '💬', color: 'text-blue-600', bg: 'bg-blue-50' },
]
