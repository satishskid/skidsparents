import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ─── Core ──────────────────────────────────────────────

export const parents = sqliteTable('parents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  firebaseUid: text('firebase_uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  city: text('city'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  referralCode: text('referral_code').unique(),
  isChampion: integer('is_champion', { mode: 'boolean' }).default(false),
})

export const children = sqliteTable('children', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  name: text('name').notNull(),
  dob: text('dob').notNull(), // ISO date
  gender: text('gender', { enum: ['male', 'female', 'other'] }),
  photoUrl: text('photo_url'),
  bloodGroup: text('blood_group'),
  allergiesJson: text('allergies_json'), // JSON array
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── PHR: Parent Observations ──────────────────────────

export const milestones = sqliteTable('milestones', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  category: text('category', { enum: ['motor', 'cognitive', 'social', 'language'] }).notNull(),
  milestoneKey: text('milestone_key').notNull(), // e.g. "head_control", "first_words"
  title: text('title').notNull(),
  status: text('status', { enum: ['not_started', 'in_progress', 'achieved', 'delayed'] }).default('not_started'),
  observedAt: text('observed_at'),
  parentNotes: text('parent_notes'),
  expectedAgeMin: integer('expected_age_min'), // months
  expectedAgeMax: integer('expected_age_max'), // months
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

export const habitsLog = sqliteTable('habits_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  date: text('date').notNull(), // ISO date
  habitType: text('habit_type', {
    enum: ['healthy_eating', 'active_movement', 'balanced_stress', 'inner_coaching', 'timekeepers', 'sufficient_sleep'],
  }).notNull(),
  valueJson: text('value_json'), // Flexible JSON for habit-specific data
  streakDays: integer('streak_days').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const growthRecords = sqliteTable('growth_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  date: text('date').notNull(),
  heightCm: real('height_cm'),
  weightKg: real('weight_kg'),
  headCircCm: real('head_circ_cm'),
  bmi: real('bmi'),
  whoZscoreJson: text('who_zscore_json'), // WHO z-score calculations
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const parentObservations = sqliteTable('parent_observations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  date: text('date').notNull(),
  category: text('category'),
  observationText: text('observation_text').notNull(),
  concernLevel: text('concern_level', { enum: ['none', 'mild', 'moderate', 'serious'] }).default('none'),
  aiResponse: text('ai_response'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── PHR: Clinical Data ────────────────────────────────

export const screeningImports = sqliteTable('screening_imports', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  source: text('source', { enum: ['skids', 'external'] }).default('skids'),
  campaignCode: text('campaign_code'),
  importedAt: text('imported_at').default(sql`(datetime('now'))`),
  screeningDate: text('screening_date'),
  dataJson: text('data_json'), // Full screening observation
  fourDJson: text('four_d_json'), // Defects, Delay, Disability, Deficiency
  summaryText: text('summary_text'), // AI-generated summary
})

export const uploadedReports = sqliteTable('uploaded_reports', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  fileUrl: text('file_url').notNull(), // R2 URL
  fileType: text('file_type', { enum: ['pdf', 'image'] }),
  fileName: text('file_name'),
  uploadDate: text('upload_date').default(sql`(datetime('now'))`),
  aiExtractedJson: text('ai_extracted_json'), // AI-extracted findings
  providerName: text('provider_name'),
  reportType: text('report_type'), // e.g. "pediatric_visit", "blood_test", "vaccination"
})

export const vaccinationRecords = sqliteTable('vaccination_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text('child_id').notNull().references(() => children.id),
  vaccineName: text('vaccine_name').notNull(),
  dose: text('dose'),
  administeredDate: text('administered_date'),
  provider: text('provider'),
  nextDue: text('next_due'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── D2C Marketplace ───────────────────────────────────

export const services = sqliteTable('services', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  shortDescription: text('short_description'),
  category: text('category', {
    enum: ['nutrition', 'behavioral', 'mental_health', 'sleep', 'parenting', 'vision', 'hearing', 'dental', 'therapy', 'consultation'],
  }).notNull(),
  deliveryType: text('delivery_type', { enum: ['digital', 'telehealth', 'in_clinic', 'hybrid'] }).notNull(),
  providerType: text('provider_type', { enum: ['skids', 'partner'] }).default('skids'),
  priceCents: integer('price_cents').notNull(),
  currency: text('currency').default('INR'),
  priceModel: text('price_model', { enum: ['one_time', 'subscription', 'per_session'] }).default('one_time'),
  duration: text('duration'), // e.g. "4 weeks", "per session"
  imageUrl: text('image_url'),
  badge: text('badge'), // e.g. "Most Popular", "New", "AI-Powered"
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const serviceOrders = sqliteTable('service_orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  childId: text('child_id').notNull().references(() => children.id),
  serviceId: text('service_id').notNull().references(() => services.id),
  status: text('status', {
    enum: ['pending', 'confirmed', 'scheduled', 'in_progress', 'completed', 'cancelled'],
  }).default('pending'),
  paymentId: text('payment_id'),
  amountCents: integer('amount_cents'),
  scheduledAt: text('scheduled_at'),
  completedAt: text('completed_at'),
  outcomeNotes: text('outcome_notes'),
  providerId: text('provider_id'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  // Phase 1 additions
  slotId: text('slot_id'),
  commissionPctSnapshot: real('commission_pct_snapshot'),
  razorpayOrderId: text('razorpay_order_id'),
  whatsappStatus: text('whatsapp_status', { enum: ['pending', 'sent', 'delivered', 'failed'] }).default('pending'),
  brand: text('brand').default('skids'),
  sessionUrl: text('session_url'),
  sessionStartedAt: text('session_started_at'),
  sessionEndedAt: text('session_ended_at'),
})

export const providers = sqliteTable('providers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  type: text('type', { enum: ['clinic', 'hospital', 'individual', 'skids_center'] }).notNull(),
  specializationsJson: text('specializations_json'),
  location: text('location'),
  city: text('city'),
  rating: real('rating'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  commissionPct: real('commission_pct').default(15),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  // Phase 1 additions
  firebaseUid: text('firebase_uid').unique(),
  status: text('status', { enum: ['pending_review', 'active', 'suspended'] }).default('pending_review'),
  feeStructureJson: text('fee_structure_json'),
  medicalRegNumber: text('medical_reg_number'),
})

export const carePlans = sqliteTable('care_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  priceYearly: integer('price_yearly'),
  priceMonthly: integer('price_monthly'),
  servicesJson: text('services_json'), // Included services
  discountsJson: text('discounts_json'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
})

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  carePlanId: text('care_plan_id').notNull().references(() => carePlans.id),
  status: text('status', { enum: ['active', 'expired', 'cancelled'] }).default('active'),
  startedAt: text('started_at'),
  expiresAt: text('expires_at'),
  paymentId: text('payment_id'),
})

// ─── Content & Engagement ──────────────────────────────

export const blogBookmarks = sqliteTable('blog_bookmarks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  blogSlug: text('blog_slug').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const contentEngagement = sqliteTable('content_engagement', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id'),
  contentType: text('content_type').notNull(), // blog, discovery, service, habits
  contentId: text('content_id').notNull(),
  action: text('action', { enum: ['view', 'click', 'share', 'bookmark', 'complete'] }).notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const chatbotConversations = sqliteTable('chatbot_conversations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  childId: text('child_id').references(() => children.id),
  messagesJson: text('messages_json'), // Array of {role, content, timestamp}
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ─── Notifications ─────────────────────────────────────

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  type: text('type', {
    enum: ['screening_alert', 'milestone_reminder', 'habit_streak', 'service_update', 'blog_recommendation', 'general'],
  }).notNull(),
  title: text('title').notNull(),
  body: text('body'),
  dataJson: text('data_json'),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── Community: Forum ──────────────────────────────────

export const forumGroups = sqliteTable('forum_groups', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  type: text('type', { enum: ['age-based', 'topic-based'] }).notNull(),
  description: text('description'),
  emoji: text('emoji'), // e.g. "👶", "🍎"
  memberCount: integer('member_count').default(0),
  postCount: integer('post_count').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const forumPosts = sqliteTable('forum_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text('group_id').notNull().references(() => forumGroups.id),
  parentId: text('parent_id').notNull().references(() => parents.id),
  authorName: text('author_name').notNull(),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  title: text('title').notNull(),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  commentCount: integer('comment_count').default(0),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('approved'),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  source: text('source'),
  blogSlug: text('blog_slug'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

export const forumComments = sqliteTable('forum_comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').notNull().references(() => forumPosts.id),
  parentId: text('parent_id').notNull().references(() => parents.id),
  authorName: text('author_name').notNull(),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const forumLikes = sqliteTable('forum_likes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  targetType: text('target_type', { enum: ['post', 'comment'] }).notNull(),
  targetId: text('target_id').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const forumReports = sqliteTable('forum_reports', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  targetType: text('target_type', { enum: ['post', 'comment'] }).notNull(),
  targetId: text('target_id').notNull(),
  reason: text('reason'),
  status: text('status', { enum: ['pending', 'reviewed', 'dismissed'] }).default('pending'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── Social Sharing ────────────────────────────────────

export const socialShares = sqliteTable('social_shares', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').references(() => parents.id),
  platform: text('platform', {
    enum: ['whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin', 'medium', 'copy'],
  }).notNull(),
  contentType: text('content_type', {
    enum: ['blog', 'organ', 'habit', 'milestone', 'growth', 'intervention', 'referral'],
  }).notNull(),
  contentId: text('content_id').notNull(),
  shareUrl: text('share_url').notNull(),
  utmCampaign: text('utm_campaign'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── Referrals ─────────────────────────────────────────

export const referrals = sqliteTable('referrals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrerParentId: text('referrer_parent_id').notNull().references(() => parents.id),
  refereeParentId: text('referee_parent_id').notNull().unique().references(() => parents.id),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── WhatsApp Subscriptions ────────────────────────────

export const whatsappSubscriptions = sqliteTable('whatsapp_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  phone: text('phone').notNull(), // 10-digit, no +91
  isSubscribed: integer('is_subscribed', { mode: 'boolean' }).default(true),
  subscriptionType: text('subscription_type', {
    enum: ['daily_tip', 'weekly_digest', 'personalized'],
  }).notNull().default('daily_tip'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ─── Phase 1: Platform Roadmap Tables ─────────────────

export const providerSlots = sqliteTable('provider_slots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text('provider_id').notNull().references(() => providers.id),
  slotType: text('slot_type', { enum: ['recurring', 'one_off', 'blocked'] }).notNull(),
  dayOfWeek: integer('day_of_week'), // 0=Sun, 6=Sat; null for one_off/blocked
  date: text('date'), // ISO date for one_off slots
  startTime: text('start_time').notNull(), // e.g. "09:00"
  endTime: text('end_time').notNull(),     // e.g. "09:30"
  serviceId: text('service_id').references(() => services.id),
  isBooked: integer('is_booked', { mode: 'boolean' }).default(false),
  orderId: text('order_id'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const providerCredentials = sqliteTable('provider_credentials', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text('provider_id').notNull().references(() => providers.id),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type', { enum: ['pdf', 'image'] }).notNull(),
  docType: text('doc_type').notNull(), // e.g. "medical_degree", "registration_cert"
  uploadedAt: text('uploaded_at').default(sql`(datetime('now'))`),
})

export const sessionNotes = sqliteTable('session_notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => serviceOrders.id),
  providerId: text('provider_id').notNull().references(() => providers.id),
  noteText: text('note_text').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => serviceOrders.id),
  childId: text('child_id').notNull().references(() => children.id),
  providerId: text('provider_id').notNull().references(() => providers.id),
  medicationsJson: text('medications_json'),
  educationJson: text('education_json'),
  nutritionJson: text('nutrition_json'),
  behaviouralJson: text('behavioural_json'),
  followUpJson: text('follow_up_json'),
  issuedAt: text('issued_at').default(sql`(datetime('now'))`),
  whatsappSent: integer('whatsapp_sent', { mode: 'boolean' }).default(false),
})

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text('actor_id').notNull(),
  actionType: text('action_type', {
    enum: [
      'provider_approved',
      'provider_suspended',
      'commission_updated',
      'order_reassigned',
      'order_status_updated',
      'order_cancelled',
      'refund_issued',
      'phr_access_denied',
    ],
  }).notNull(),
  targetType: text('target_type', { enum: ['provider', 'order', 'phr'] }).notNull(),
  targetId: text('target_id').notNull(),
  previousValueJson: text('previous_value_json'),
  newValueJson: text('new_value_json'),
  reason: text('reason'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── Push Subscriptions ────────────────────────────────

export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  fcmToken: text('fcm_token').notNull(),
  userAgent: text('user_agent'),
  registeredAt: text('registered_at').default(sql`(datetime('now'))`),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
})

// ─── Tiered Pricing ───────────────────────────────────

export const pricingTiers = sqliteTable('pricing_tiers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  currency: text('currency').default('INR'),
  amountCents: integer('amount_cents').notNull().default(0),
  amountYearlyCents: integer('amount_yearly_cents').notNull().default(0),
  featuresJson: text('features_json').notNull().default('[]'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const parentSubscriptions = sqliteTable('parent_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parent_id').notNull().references(() => parents.id),
  tierId: text('tier_id').notNull().references(() => pricingTiers.id),
  status: text('status', { enum: ['active', 'expired', 'cancelled'] }).default('active'),
  startedAt: text('started_at').default(sql`(datetime('now'))`),
  expiresAt: text('expires_at'),
  paymentId: text('payment_id'),
  billingCycle: text('billing_cycle', { enum: ['monthly', 'yearly'] }).default('monthly'),
  featuresSnapshotJson: text('features_snapshot_json').notNull().default('[]'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ─── Derived Types ─────────────────────────────────────

export type NotificationType = typeof notifications.type.enumValues[number]
