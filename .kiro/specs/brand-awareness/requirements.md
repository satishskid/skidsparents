# Brand Awareness & Community Building Strategy

## Executive Summary

**Goal**: Build SKIDS Parent as India's #1 parent education platform through transparent analytics, community engagement, and gradual D2C conversion.

**Timeline**: 12 weeks (3 phases)

**Success Metrics**: 100,000+ monthly active users, 10,000+ daily blog views, 5% D2C conversion

---

## Phase 1: Analytics & Tracking Foundation (Weeks 1-2)

### 1.1 Analytics Infrastructure

#### Google Analytics 4 (GA4)
- **Page views**: Track all page visits
- **User journeys**: Track user flow through site
- **Conversion events**: Track signup, PHR completion, service inquiry
- **Custom dimensions**: Child age, parent location, content category
- **E-commerce tracking**: Track service views, add-to-cart, purchases

#### Meta Pixel (Facebook/Instagram)
- **Page view events**: Track all page visits
- **Custom events**: 
  - ViewContent (blog, organ, intervention)
  - AddToCart (service inquiry)
  - InitiateCheckout (service booking)
  - Purchase (service purchase)
  - Lead (lead capture form)
- **Custom audiences**: Retarget engaged users
- **Lookalike audiences**: Find similar users

#### PostHog (Product Analytics)
- **User behavior**: Session recordings, heatmaps
- **Feature flags**: A/B testing for features
- **Funnels**: Track conversion funnels
- **Cohort analysis**: Track user retention
- **Event tracking**: Track all user actions

#### Plausible (Privacy-Friendly Analytics)
- **Page views**: Track all page visits
- **Referrer tracking**: Track traffic sources
- **Goal tracking**: Track conversions
- **No cookies**: GDPR compliant

### 1.2 Event Tracking Schema

```typescript
// Core Events
- page_view: { page_path, page_title, referrer }
- user_signup: { method: 'google' | 'phone', referral_code }
- child_added: { child_age_months, gender }
- phr_entry: { type: 'milestone' | 'growth' | 'habit', child_id }
- content_view: { type: 'blog' | 'organ' | 'intervention', slug }
- content_share: { type, slug, platform: 'whatsapp' | 'instagram' }
- service_inquiry: { service_slug, source }
- lead_captured: { source, funnel_stage, asset_code }

// Engagement Events
- chat_message: { child_id, topic }
- habit_logged: { habit_type, streak_days }
- milestone_achieved: { milestone_key, child_age_months }
- growth_recorded: { height_cm, weight_kg }

// Conversion Events
- trial_started: { plan: 'premium' | 'family' }
- subscription_created: { plan, amount, duration }
- service_purchased: { service_slug, amount }
```

### 1.3 UTM Parameter Strategy

```
Campaign Structure:
- utm_source: facebook, instagram, google, whatsapp, organic
- utm_medium: social, cpc, email, referral
- utm_campaign: skids_awareness_q1, skids_vision_launch
- utm_content: blog_post, organ_discovery, intervention_page
- utm_term: child_health, parenting_tips, vision_screening
```

---

## Phase 2: Community & Engagement (Weeks 3-6)

### 2.1 Parent Community Features

#### Discussion Forums
- **Age-based groups**: 0-6 months, 6-12 months, 1-2 years, 2-5 years, 5+ years
- **Topic-based groups**: Nutrition, Sleep, Development, Behavior
- **Expert Q&A**: Weekly live sessions with pediatricians
- **Milestone sharing**: Share achievements with community
- **Anonymous posting**: Option for sensitive topics

#### Social Features
- **Follow other parents**: Build connections
- **Like & comment**: Engage with posts
- **Save posts**: Bookmark helpful content
- **Share to WhatsApp**: One-click sharing
- **Invite friends**: Referral program

#### Gamification
- **Badges**: Earn badges for engagement
- **Leaderboard**: Top contributors
- **Streak counter**: Daily login streak
- **Points system**: Earn points for actions
- **Rewards**: Redeem points for services

### 2.2 Content Strategy

#### Daily Content Calendar
- **Monday**: Milestone Monday (developmental milestones)
- **Tuesday**: Nutrition Tuesday (healthy eating tips)
- **Wednesday**: Wellness Wednesday (organ discovery)
- **Thursday**: Habit Thursday (H.A.B.I.T.S. framework)
- **Friday**: FAQ Friday (common parent questions)
- **Saturday**: Story Saturday (parent success stories)
- **Sunday**: Sunday Funday (fun activities for kids)

#### Content Types
- **Blog posts**: 1 new post per day (300-500 words)
- **Video tips**: 60-second health tips (3 per week)
- **Infographics**: Visual health guides (2 per week)
- **Podcasts**: Expert interviews (1 per week)
- **Webinars**: Live Q&A sessions (1 per month)

#### Content Distribution
- **Website**: All content on parent.skids.clinic
- **WhatsApp**: Daily tip via WhatsApp broadcast
- **Instagram**: Daily post + 3 stories ([@skids_clinic](https://www.instagram.com/skids_clinic/))
- **Facebook**: Daily post + weekly live ([SKIDS Health](https://www.facebook.com/skids.health))
- **Twitter/X**: Daily health tips ([@SKIDS58283752](https://x.com/SKIDS58283752))
- **LinkedIn**: Professional content ([SKIDS Company](https://www.linkedin.com/company/skids/))
- **Medium**: Long-form articles ([@skids_health](https://medium.com/@skids_health))
- **Email**: Weekly newsletter

### 2.3 Influencer & Partnership Strategy

#### Micro-Influencers (10K-100K followers)
- **Parent bloggers**: Collaborate on content
- **Pediatricians**: Expert endorsements
- **Nutritionists**: Meal plan collaborations
- **Therapists**: Developmental content

#### Strategic Partnerships
- **Schools**: Screening programs
- **Clinics**: Referral partnerships
- **Brands**: Co-marketing campaigns
- **NGOs**: Community health programs

---

## Phase 3: Parent-Doctor Engagement (Weeks 7-12)

### 3.1 Doctor-Facing Features

#### Doctor Portal
- **Profile management**: Create doctor profile
- **Availability calendar**: Set consultation slots
- **Patient records**: View child's PHR (with consent)
- **Consultation notes**: Add notes after consultation
- **Prescription management**: Digital prescriptions
- **Earnings dashboard**: Track consultation revenue

#### Doctor Discovery
- **Search by location**: Find nearby doctors
- **Filter by specialty**: Pediatrician, nutritionist, therapist
- **View ratings**: See patient reviews
- **Book consultation**: Schedule video call
- **In-clinic booking**: Book in-person visit

#### Doctor Engagement
- **Referral program**: Earn for referring patients
- **Content contribution**: Write blog posts
- **Expert Q&A**: Participate in live sessions
- **CME credits**: Earn continuing education credits

### 3.2 Parent-Doctor Interaction

#### Teleconsult Flow
```
1. Parent selects concern (symptom checker)
2. AI triages urgency (green/amber/red)
3. Parent views doctor profiles
4. Parent books consultation slot
5. Parent pays via Razorpay
6. Doctor receives PHR summary
7. Video consultation (15 min)
8. Doctor adds notes to PHR
9. Parent receives prescription
10. Follow-up reminder (7 days)
```

#### PHR Sharing
- **Share with doctor**: One-click sharing
- **Consent management**: Parent controls access
- **Time-limited access**: 24-hour access window
- **Audit log**: Track who viewed PHR
- **Revoke access**: Parent can revoke anytime

#### Prescription Management
- **Digital prescriptions**: PDF download
- **Medicine reminders**: Push notifications
- **Pharmacy integration**: Order medicines online
- **Refill reminders**: Auto-remind for refills

### 3.3 D2C Service Campaigns

#### Service Launch Strategy
```
Week 7-8: SKIDS Vision Launch
- Blog series: "Why vision screening matters"
- Instagram campaign: #ClearVisionClearFuture
- Influencer partnerships: Parent testimonials
- Early bird offer: 20% off first 100 bookings

Week 9-10: SKIDS Nutrition Launch
- Blog series: "Nutrition myths debunked"
- Instagram campaign: #FeedTheirFuture
- Webinar: "Indian meal plans for picky eaters"
- Free trial: 7-day meal plan

Week 11-12: SKIDS Teleconsult Launch
- Blog series: "When to consult a pediatrician"
- Instagram campaign: #DoctorOnDemand
- Doctor onboarding: 50 pediatricians
- Launch offer: First consultation free
```

#### Conversion Funnel
```
Awareness → Interest → Consideration → Purchase

Awareness:
- Blog post: "5 signs your child needs vision screening"
- Instagram post: Parent testimonial
- WhatsApp broadcast: Daily health tip

Interest:
- Lead magnet: Free vision checklist
- Email sequence: 5-day vision series
- Retargeting ad: "Book your screening"

Consideration:
- Service page: SKIDS Vision details
- FAQ page: Common questions
- Testimonials: Parent reviews

Purchase:
- Booking page: Select date/time
- Payment page: Razorpay checkout
- Confirmation: WhatsApp + email
```

---

## Technical Implementation

### 1. Analytics Integration

#### Google Analytics 4
```typescript
// src/lib/analytics/ga4.ts
export function trackEvent(eventName: string, params: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Usage
trackEvent('page_view', { page_path: '/blog/vision-screening' })
trackEvent('user_signup', { method: 'google' })
trackEvent('service_inquiry', { service_slug: 'vision-check' })
```

#### Meta Pixel
```typescript
// src/lib/analytics/meta.ts
export function trackMetaEvent(eventName: string, params: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params)
  }
}

// Usage
trackMetaEvent('ViewContent', { content_name: 'SKIDS Vision', content_category: 'Service' })
trackMetaEvent('Lead', { content_name: 'Vision Screening Inquiry' })
trackMetaEvent('Purchase', { value: 799, currency: 'INR' })
```

#### PostHog
```typescript
// src/lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  posthog.init('YOUR_API_KEY', {
    api_host: 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
  })
}

export function identifyUser(userId: string, traits: Record<string, any>) {
  posthog.identify(userId, traits)
}

export function trackEvent(eventName: string, properties: Record<string, any>) {
  posthog.capture(eventName, properties)
}
```

### 2. Community Features

#### Discussion Forum Schema
```typescript
// src/lib/db/schema.ts
export const forumPosts = sqliteTable('forum_posts', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references(() => parents.id),
  groupId: text('group_id').notNull(), // age-based or topic-based
  title: text('title').notNull(),
  content: text('content').notNull(),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const forumComments = sqliteTable('forum_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => forumPosts.id),
  parentId: text('parent_id').references(() => parents.id),
  content: text('content').notNull(),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  likes: integer('likes').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

### 3. Doctor Portal Schema
```typescript
// src/lib/db/schema.ts
export const doctors = sqliteTable('doctors', {
  id: text('id').primaryKey(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  specialty: text('specialty'), // pediatrician, nutritionist, therapist
  qualifications: text('qualifications'),
  experience: integer('experience'), // years
  rating: real('rating'),
  consultationFee: integer('consultation_fee'), // in paise
  availabilityJson: text('availability_json'), // weekly schedule
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const consultations = sqliteTable('consultations', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references(() => parents.id),
  childId: text('child_id').references(() => children.id),
  doctorId: text('doctor_id').references(() => doctors.id),
  scheduledAt: text('scheduled_at').notNull(),
  status: text('status', { enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] }),
  symptomSummary: text('symptom_summary'),
  consultationNotes: text('consultation_notes'),
  prescriptionJson: text('prescription_json'),
  paymentId: text('payment_id'),
  amountPaid: integer('amount_paid'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

---

## Metrics & KPIs

### Awareness Metrics
- **Website traffic**: 100,000+ monthly visitors
- **Blog views**: 10,000+ daily views
- **Social media reach**: 500,000+ monthly reach
- **Social shares**: 5,000+ monthly shares
- **Referral rate**: 15% of new users from referrals

### Engagement Metrics
- **DAU/MAU**: 25% (daily active / monthly active)
- **Session duration**: 5+ minutes average
- **Pages per session**: 3+ pages
- **Return rate**: 40% return within 7 days
- **Community posts**: 1,000+ monthly posts

### Conversion Metrics
- **Signup rate**: 10% of visitors
- **PHR completion**: 60% of signups
- **Service inquiry**: 20% of active users
- **Service purchase**: 5% of inquiries
- **LTV/CAC**: 3:1 ratio

### Doctor Engagement
- **Doctor signups**: 100+ doctors
- **Consultations**: 500+ monthly consultations
- **Doctor rating**: 4.5+ average
- **Doctor retention**: 80% active after 3 months

---

## Budget Allocation

### Marketing Budget (Monthly)
- **Meta Ads**: ₹50,000 (awareness campaigns)
- **Google Ads**: ₹30,000 (search campaigns)
- **Influencer partnerships**: ₹20,000 (micro-influencers)
- **Content creation**: ₹15,000 (blog, video, graphics)
- **WhatsApp broadcasts**: ₹5,000 (BHASH API)
- **Total**: ₹120,000/month

### Technology Budget (One-time)
- **Analytics setup**: ₹10,000 (GA4, Meta Pixel, PostHog)
- **Community features**: ₹30,000 (forum, social features)
- **Doctor portal**: ₹50,000 (doctor dashboard, booking)
- **Total**: ₹90,000

---

## Success Criteria

### Week 2 (Analytics Foundation)
- ✅ GA4 tracking all events
- ✅ Meta Pixel tracking conversions
- ✅ PostHog tracking user behavior
- ✅ UTM parameters in all campaigns

### Week 6 (Community Building)
- ✅ 10,000+ monthly active users
- ✅ 1,000+ community posts
- ✅ 5,000+ social shares
- ✅ 15% referral rate

### Week 12 (Doctor Engagement)
- ✅ 100+ doctors onboarded
- ✅ 500+ monthly consultations
- ✅ 5% service conversion
- ✅ ₹350,000 monthly revenue

---

## Next Steps

1. **Set up analytics** (GA4, Meta Pixel, PostHog)
2. **Create community features** (forum, social)
3. **Build doctor portal** (profile, booking, notes)
4. **Launch D2C campaigns** (Vision, Nutrition, Teleconsult)
5. **Track & optimize** (A/B testing, conversion optimization)
