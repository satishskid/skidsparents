# Brand Awareness & Community Building - Design Document

## Overview

This design focuses on building SKIDS Parent's brand awareness through FREE content and community features, establishing market presence before pushing paid services. The strategy is to let parents discover value through free educational content, community engagement, and PHR tools, with analytics tracking to measure engagement and identify conversion opportunities.

### Core Philosophy

**Free-First Approach**: Provide maximum value through free features to build trust and engagement. Track user behavior to understand what resonates, then introduce paid services to users who are already engaged and see value.

### Key Components

1. **Content Distribution Engine**: Daily blog posts, organ discovery modules, H.A.B.I.T.S. framework content
2. **Community Platform**: Discussion forums, social sharing, parent connections
3. **Analytics Foundation**: GA4, Meta Pixel, PostHog for comprehensive tracking
4. **Existing Free Features**: PHR (milestones, growth, vaccinations), Dr. SKIDS chatbot
5. **Content Amplification**: WhatsApp broadcasts, Instagram integration, social sharing

### Success Metrics

- **Awareness**: 100,000+ monthly visitors, 10,000+ daily blog views
- **Engagement**: 25% DAU/MAU, 5+ min session duration, 1,000+ monthly community posts
- **Conversion Readiness**: 20% service inquiry rate from engaged users

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     SKIDS Parent Platform                    │
│                    (Astro 5 + Cloudflare)                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Content    │    │  Community   │    │  Analytics   │
│   Engine     │    │  Platform    │    │   Layer      │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Blog API     │    │ D1 Database  │    │ GA4 + Meta   │
│ (External)   │    │ (Forums)     │    │ + PostHog    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Distribution    │
                    │  Channels        │
                    │ (WhatsApp, IG)   │
                    └──────────────────┘
```

### Technology Stack

- **Frontend**: Astro 5 (SSR) + React 18 + Tailwind CSS v4
- **Database**: Cloudflare D1 (SQLite via Drizzle ORM)
- **Auth**: Firebase Auth (existing)
- **Storage**: Cloudflare R2 (existing for medical reports)
- **Analytics**: GA4, Meta Pixel, PostHog
- **Distribution**: BHASH API (WhatsApp), Instagram Graph API
- **Blog Content**: External API (`https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs`)

### Data Flow

1. **Content Consumption**: User views blog/organ/H.A.B.I.T.S. content → Analytics tracks view → Content engagement stored in D1
2. **Community Interaction**: User posts/comments in forum → Stored in D1 → Analytics tracks engagement → Notifications sent
3. **Social Sharing**: User shares content → WhatsApp/Instagram API called → Analytics tracks share → UTM parameters added
4. **Analytics Pipeline**: All user actions → Client-side tracking (GA4, Meta, PostHog) → Server-side events (D1) → Dashboard aggregation

---

## Components and Interfaces

### 1. Analytics Layer

#### Analytics Manager (`src/lib/analytics/manager.ts`)

```typescript
interface AnalyticsEvent {
  eventName: string
  properties: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
}

interface AnalyticsProvider {
  initialize(): void
  trackEvent(event: AnalyticsEvent): void
  identifyUser(userId: string, traits: Record<string, any>): void
  trackPageView(path: string, title: string): void
}

class AnalyticsManager {
  private providers: AnalyticsProvider[]
  
  // Track event to all providers
  trackEvent(eventName: string, properties: Record<string, any>): void
  
  // Track page view to all providers
  trackPageView(path: string, title: string): void
  
  // Identify user across all providers
  identifyUser(userId: string, traits: Record<string, any>): void
}
```

#### GA4 Provider (`src/lib/analytics/ga4.ts`)

```typescript
class GA4Provider implements AnalyticsProvider {
  initialize(): void {
    // Load gtag.js script
    // Set GA4 measurement ID
  }
  
  trackEvent(event: AnalyticsEvent): void {
    // window.gtag('event', eventName, properties)
  }
  
  trackPageView(path: string, title: string): void {
    // window.gtag('config', measurementId, { page_path: path })
  }
}
```

#### Meta Pixel Provider (`src/lib/analytics/meta.ts`)

```typescript
class MetaPixelProvider implements AnalyticsProvider {
  initialize(): void {
    // Load fbq script
    // Set pixel ID
  }
  
  trackEvent(event: AnalyticsEvent): void {
    // Map custom events to Meta standard events
    // window.fbq('track', standardEvent, properties)
  }
}
```

#### PostHog Provider (`src/lib/analytics/posthog.ts`)

```typescript
class PostHogProvider implements AnalyticsProvider {
  initialize(): void {
    // posthog.init(apiKey, config)
  }
  
  trackEvent(event: AnalyticsEvent): void {
    // posthog.capture(eventName, properties)
  }
  
  identifyUser(userId: string, traits: Record<string, any>): void {
    // posthog.identify(userId, traits)
  }
}
```

### 2. Content Engine

#### Blog Integration (`src/lib/content/blog.ts`)

```typescript
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
  author: {
    name: string
    avatar?: string
  }
  coverImage?: string
  readTime: number
}

interface BlogAPI {
  // Fetch all published blogs
  getPublishedBlogs(): Promise<BlogPost[]>
  
  // Fetch single blog by slug
  getBlogBySlug(slug: string): Promise<BlogPost | null>
  
  // Fetch blogs by category
  getBlogsByCategory(category: string): Promise<BlogPost[]>
  
  // Fetch blogs by tag
  getBlogsByTag(tag: string): Promise<BlogPost[]>
  
  // Search blogs
  searchBlogs(query: string): Promise<BlogPost[]>
}
```

#### Organ Discovery (`src/lib/content/organs.ts`)

```typescript
interface OrganModule {
  id: string
  name: string
  slug: string
  description: string
  ageRelevance: string // "0-2 years", "2-5 years", etc.
  content: {
    overview: string
    development: string[]
    commonIssues: string[]
    redFlags: string[]
    tips: string[]
  }
  illustrations: string[]
  relatedInterventions: string[] // Links to SKIDS services
}

// 16 organ modules: brain, eyes, ears, heart, lungs, stomach, 
// liver, kidneys, bones, muscles, skin, teeth, immune, hormones, 
// nervous, reproductive
const organModules: OrganModule[] = [...]
```

#### H.A.B.I.T.S. Framework (`src/lib/content/habits.ts`)

```typescript
interface HABITSModule {
  letter: 'H' | 'A' | 'B' | 'I' | 'T' | 'S'
  fullName: string // "Hygiene", "Activity", "Behavior", etc.
  description: string
  ageGroups: {
    ageRange: string // "0-1 year", "1-3 years", etc.
    milestones: string[]
    activities: string[]
    tips: string[]
  }[]
  trackingTemplate: {
    frequency: 'daily' | 'weekly'
    metrics: string[]
  }
}

// H - Hygiene, A - Activity, B - Behavior, I - Immunity, 
// T - Thinking, S - Sleep
const habitsFramework: HABITSModule[] = [...]
```


### 3. Community Platform

#### Forum System (`src/lib/community/forum.ts`)

```typescript
interface ForumGroup {
  id: string
  name: string
  type: 'age-based' | 'topic-based'
  description: string
  memberCount: number
  postCount: number
}

interface ForumPost {
  id: string
  groupId: string
  parentId: string // Author's parent ID
  authorName: string // Display name or "Anonymous"
  isAnonymous: boolean
  title: string
  content: string
  likes: number
  commentCount: number
  createdAt: string
  updatedAt: string
}

interface ForumComment {
  id: string
  postId: string
  parentId: string
  authorName: string
  isAnonymous: boolean
  content: string
  likes: number
  createdAt: string
}

interface ForumService {
  // Groups
  getGroups(): Promise<ForumGroup[]>
  getGroupById(groupId: string): Promise<ForumGroup | null>
  
  // Posts
  createPost(post: Omit<ForumPost, 'id' | 'createdAt'>): Promise<ForumPost>
  getPostsByGroup(groupId: string, limit: number, offset: number): Promise<ForumPost[]>
  getPostById(postId: string): Promise<ForumPost | null>
  likePost(postId: string, parentId: string): Promise<void>
  
  // Comments
  createComment(comment: Omit<ForumComment, 'id' | 'createdAt'>): Promise<ForumComment>
  getCommentsByPost(postId: string): Promise<ForumComment[]>
  likeComment(commentId: string, parentId: string): Promise<void>
}
```

#### Social Sharing (`src/lib/social/sharing.ts`)

```typescript
interface ShareOptions {
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'copy'
  contentType: 'blog' | 'organ' | 'habit' | 'milestone' | 'growth'
  contentId: string
  contentTitle: string
  contentUrl: string
  utmParams: {
    source: string
    medium: string
    campaign: string
    content?: string
  }
}

// Existing SKIDS social media channels
const SOCIAL_CHANNELS = {
  facebook: 'https://www.facebook.com/skids.health',
  instagram: 'https://www.instagram.com/skids_clinic/',
  twitter: 'https://x.com/SKIDS58283752',
  linkedin: 'https://www.linkedin.com/company/skids/',
  medium: 'https://medium.com/@skids_health'
}

interface SocialShareService {
  // Generate shareable URL with UTM parameters
  generateShareUrl(options: ShareOptions): string
  
  // Share to WhatsApp
  shareToWhatsApp(options: ShareOptions): Promise<void>
  
  // Share to Instagram (via Instagram Graph API)
  shareToInstagram(options: ShareOptions): Promise<void>
  
  // Track share event
  trackShare(options: ShareOptions): Promise<void>
}
```

### 4. Content Distribution

#### WhatsApp Broadcast (`src/lib/distribution/whatsapp.ts`)

```typescript
interface WhatsAppMessage {
  to: string // Phone number with country code
  message: string
  mediaUrl?: string
}

interface WhatsAppBroadcast {
  // Send daily tip to all subscribed parents
  sendDailyTip(tip: string, mediaUrl?: string): Promise<void>
  
  // Send personalized content based on child age
  sendPersonalizedContent(parentId: string, content: string): Promise<void>
  
  // Send community digest (weekly)
  sendCommunityDigest(parentId: string, digest: string): Promise<void>
}

// Uses BHASH API with credentials from env
class BHASHService implements WhatsAppBroadcast {
  private apiUrl = 'http://bhashsms.com/api/sendmsg.php'
  private user: string // BHASH_USER from env (e.g., 'Santaan_01')
  private pass: string // BHASH_PASS from env
  private sender: string // BHASH_SENDER from env (e.g., 'BUZWAP')
  
  async sendMessage(message: WhatsAppMessage): Promise<void> {
    // Call BHASH API with query parameters
    // Example: http://bhashsms.com/api/sendmsg.php?user=Santaan_01&pass=123456&sender=BUZWAP&phone=9742100448&text=message&priority=wa&stype=normal
    const params = new URLSearchParams({
      user: this.user,
      pass: this.pass,
      sender: this.sender,
      phone: message.to, // Phone number without +91 prefix
      text: message.message,
      priority: 'wa', // WhatsApp priority
      stype: 'normal' // Send type
    })
    
    const response = await fetch(`${this.apiUrl}?${params.toString()}`)
    // Handle response and errors
  }
}
```

#### Instagram Integration (`src/lib/distribution/instagram.ts`)

```typescript
interface InstagramPost {
  caption: string
  imageUrl: string
  hashtags: string[]
}

interface InstagramService {
  // Post daily content to Instagram
  postContent(post: InstagramPost): Promise<void>
  
  // Post story
  postStory(imageUrl: string, link?: string): Promise<void>
  
  // Schedule post (via Instagram Graph API)
  schedulePost(post: InstagramPost, scheduledTime: Date): Promise<void>
}
```

### 5. Content Engagement Tracking

#### Engagement Service (`src/lib/engagement/tracking.ts`)

```typescript
interface ContentEngagement {
  id: string
  parentId: string
  contentType: 'blog' | 'organ' | 'habit' | 'forum_post' | 'forum_comment'
  contentId: string
  action: 'view' | 'like' | 'share' | 'bookmark' | 'comment'
  durationSeconds?: number // For views
  createdAt: string
}

interface EngagementService {
  // Track content view
  trackView(parentId: string, contentType: string, contentId: string, duration: number): Promise<void>
  
  // Track content interaction
  trackInteraction(parentId: string, contentType: string, contentId: string, action: string): Promise<void>
  
  // Get user's engagement history
  getUserEngagement(parentId: string, limit: number): Promise<ContentEngagement[]>
  
  // Get popular content
  getPopularContent(contentType: string, timeframe: 'day' | 'week' | 'month'): Promise<any[]>
}
```

---

## Data Models

### Database Schema Extensions

#### Forum Tables

```typescript
// src/lib/db/schema.ts

export const forumGroups = sqliteTable('forum_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['age-based', 'topic-based'] }).notNull(),
  description: text('description'),
  memberCount: integer('member_count').default(0),
  postCount: integer('post_count').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const forumPosts = sqliteTable('forum_posts', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => forumGroups.id).notNull(),
  parentId: text('parent_id').references(() => parents.id).notNull(),
  authorName: text('author_name').notNull(),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  title: text('title').notNull(),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  commentCount: integer('comment_count').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

export const forumComments = sqliteTable('forum_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => forumPosts.id).notNull(),
  parentId: text('parent_id').references(() => parents.id).notNull(),
  authorName: text('author_name').notNull(),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const forumLikes = sqliteTable('forum_likes', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references(() => parents.id).notNull(),
  targetType: text('target_type', { enum: ['post', 'comment'] }).notNull(),
  targetId: text('target_id').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

#### Content Engagement Tables

```typescript
export const contentEngagement = sqliteTable('content_engagement', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references(() => parents.id).notNull(),
  contentType: text('content_type', { 
    enum: ['blog', 'organ', 'habit', 'forum_post', 'forum_comment'] 
  }).notNull(),
  contentId: text('content_id').notNull(),
  action: text('action', { 
    enum: ['view', 'like', 'share', 'bookmark', 'comment'] 
  }).notNull(),
  durationSeconds: integer('duration_seconds'),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const blogBookmarks = sqliteTable('blog_bookmarks', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references(() => parents.id).notNull(),
  blogSlug: text('blog_slug').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

#### Social Sharing Tables

```typescript
export const socialShares = sqliteTable('social_shares', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references(() => parents.id).notNull(),
  platform: text('platform', { 
    enum: ['whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin', 'medium', 'copy'] 
  }).notNull(),
  contentType: text('content_type').notNull(),
  contentId: text('content_id').notNull(),
  shareUrl: text('share_url').notNull(),
  utmCampaign: text('utm_campaign'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
```

#### WhatsApp Subscription Tables

```typescript
export const whatsappSubscriptions = sqliteTable('whatsapp_subscriptions', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references(() => parents.id).notNull(),
  phone: text('phone').notNull(),
  isSubscribed: integer('is_subscribed', { mode: 'boolean' }).default(true),
  subscriptionType: text('subscription_type', { 
    enum: ['daily_tip', 'weekly_digest', 'personalized'] 
  }).notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})
```

### Analytics Event Schema

```typescript
// Client-side event tracking
interface AnalyticsEventSchema {
  // Page events
  page_view: {
    page_path: string
    page_title: string
    referrer: string
  }
  
  // User events
  user_signup: {
    method: 'google' | 'phone'
    referral_code?: string
  }
  
  child_added: {
    child_age_months: number
    gender: 'male' | 'female' | 'other'
  }
  
  // Content events
  content_view: {
    type: 'blog' | 'organ' | 'habit' | 'intervention'
    slug: string
    duration_seconds: number
  }
  
  content_share: {
    type: 'blog' | 'organ' | 'habit' | 'milestone' | 'growth'
    slug: string
    platform: 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'medium'
  }
  
  content_bookmark: {
    type: 'blog' | 'organ' | 'habit'
    slug: string
  }
  
  // Community events
  forum_post_created: {
    group_id: string
    is_anonymous: boolean
  }
  
  forum_comment_created: {
    post_id: string
    is_anonymous: boolean
  }
  
  forum_like: {
    target_type: 'post' | 'comment'
    target_id: string
  }
  
  // PHR events
  phr_entry: {
    type: 'milestone' | 'growth' | 'habit' | 'observation' | 'vaccination'
    child_id: string
  }
  
  // Chatbot events
  chat_message: {
    child_id: string
    topic: string
    message_length: number
  }
  
  // Service events (for conversion tracking)
  service_view: {
    service_slug: string
    source: string
  }
  
  service_inquiry: {
    service_slug: string
    source: string
  }
  
  lead_captured: {
    source: string
    funnel_stage: string
    asset_code: string
  }
}
```

---

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Analytics Tracking Properties

**Property 1: Page view tracking completeness**

*For any* page path visited by a user, the analytics system should capture and record a page_view event with the correct page path, title, and referrer information.

**Validates: Analytics Foundation (Phase 1, Section 1.1)**

**Property 2: Signup event metadata completeness**

*For any* user signup action, the analytics system should track a user_signup event that includes the authentication method (google or phone) and any referral code if present.

**Validates: Analytics Foundation (Phase 1, Section 1.1)**

**Property 3: Content engagement tracking**

*For any* content interaction (view, like, share, bookmark), the system should create a content_engagement record with the correct parent ID, content type, content ID, and action type.

**Validates: Analytics Foundation (Phase 1, Section 1.1)**

**Property 4: UTM parameter preservation**

*For any* incoming URL containing UTM parameters (utm_source, utm_medium, utm_campaign, utm_content, utm_term), the analytics system should capture and associate these parameters with all subsequent events in that session.

**Validates: Analytics Foundation (Phase 1, Section 1.3)**

### Community Platform Properties

**Property 5: Forum post data integrity**

*For any* forum post creation, the system should store the post with the correct group ID, parent ID, author name, anonymous flag, title, and content, and the post should be retrievable with all fields intact.

**Validates: Community Features (Phase 2, Section 2.1)**

**Property 6: Anonymous post privacy**

*For any* forum post or comment created with isAnonymous set to true, when retrieved by other users, the author's real name and parent ID should not be exposed in the response.

**Validates: Community Features (Phase 2, Section 2.1)**

**Property 7: Forum like counting**

*For any* forum post or comment, when a parent likes it, the like count should increment by exactly 1, and the same parent should not be able to like the same item more than once.

**Validates: Community Features (Phase 2, Section 2.1)**

**Property 8: Comment-post association**

*For any* forum comment created, the comment should be associated with the correct post ID, and when retrieving comments for a post, all comments with that post ID should be returned.

**Validates: Community Features (Phase 2, Section 2.1)**

### Content Distribution Properties

**Property 9: Share URL UTM injection**

*For any* content share request, the generated share URL should include UTM parameters with utm_source matching the share platform, utm_medium set to "social", and utm_campaign following the "skids_" prefix convention.

**Validates: Content Distribution (Phase 2, Section 2.2)**

**Property 10: WhatsApp message formatting**

*For any* WhatsApp broadcast message, the message should be formatted with the recipient's phone number in 10-digit format (without +91 prefix for BHASH API), include the BHASH sender ID (BUZWAP), and not exceed the API's character limit.

**Validates: Content Distribution (Phase 2, Section 2.2)**

**Property 11: Social share persistence**

*For any* content share action, the system should create a social_shares record with the parent ID, platform, content type, content ID, share URL, and UTM campaign, and this record should be retrievable.

**Validates: Content Distribution (Phase 2, Section 2.2)**

### Blog Integration Properties

**Property 12: Blog bookmark uniqueness**

*For any* parent and blog slug combination, the system should allow only one bookmark record, and attempting to bookmark the same blog twice should either be idempotent (no error, no duplicate) or return the existing bookmark.

**Validates: Content Strategy (Phase 2, Section 2.2)**

### Content Engagement Properties

**Property 13: View duration accuracy**

*For any* content view session, if the user views content for N seconds, the content_engagement record should have a durationSeconds value equal to N (within a reasonable tolerance of ±2 seconds for timing precision).

**Validates: Content Engagement Tracking (Section 5)**

**Property 14: Popular content ranking**

*For any* time period (day, week, month), when retrieving popular content, the results should be ordered by engagement score (combination of views, likes, shares, comments), with higher engagement content appearing first.

**Validates: Content Engagement Tracking (Section 5)**

**Property 15: Engagement history retrieval**

*For any* parent ID, when retrieving engagement history, all content_engagement records for that parent should be returned in reverse chronological order (most recent first), up to the specified limit.

**Validates: Content Engagement Tracking (Section 5)**

### Data Integrity Properties

**Property 16: Forum group post count maintenance**

*For any* forum group, when a new post is created in that group, the group's postCount field should increment by exactly 1, and when querying the group, the postCount should match the actual number of posts in the database.

**Validates: Community Features (Phase 2, Section 2.1)**

**Property 17: Forum post comment count maintenance**

*For any* forum post, when a new comment is created on that post, the post's commentCount field should increment by exactly 1, and when querying the post, the commentCount should match the actual number of comments in the database.

**Validates: Community Features (Phase 2, Section 2.1)**

**Property 18: Content engagement immutability**

*For any* content_engagement record, once created, the record should not be modifiable (no UPDATE operations allowed), ensuring an accurate audit trail of all user engagement actions.

**Validates: Content Engagement Tracking (Section 5)**

---

## Error Handling

### Analytics Errors

**Client-Side Tracking Failures**:
- If GA4/Meta/PostHog scripts fail to load (ad blockers, network issues), the application should continue functioning normally
- Analytics failures should be logged to console in development but not shown to users
- Server-side event tracking (D1 database) should continue even if client-side tracking fails

**Event Validation Errors**:
- If an analytics event is missing required properties, log a warning and send the event with available data
- If event properties have invalid types, coerce to correct type or use default values
- Never throw errors that would break the user experience due to analytics issues

### Community Platform Errors

**Forum Post/Comment Creation Errors**:
- If database write fails, return a 500 error with message "Failed to create post. Please try again."
- If parent is not authenticated, return 401 error
- If content exceeds length limits (title: 200 chars, content: 5000 chars), return 400 error with specific limit
- If group ID doesn't exist, return 404 error "Forum group not found"

**Like Errors**:
- If parent tries to like the same item twice, return 409 error "Already liked" (or make it idempotent and return success)
- If target post/comment doesn't exist, return 404 error
- If database update fails, return 500 error

**Anonymous Posting Errors**:
- If isAnonymous flag is missing, default to false (non-anonymous)
- Ensure author name is never exposed even if database query accidentally includes it

### Content Distribution Errors

**WhatsApp API Errors**:
- If BHASH API returns error, log the error and retry up to 3 times with exponential backoff
- If phone number is invalid format, log error and skip that recipient
- If API rate limit is hit, queue messages for later delivery
- Never expose BHASH API errors to end users

**Share URL Generation Errors**:
- If content doesn't exist, return 404 error
- If UTM parameters are malformed, use default values
- Always return a valid URL even if some parameters are missing

### Blog Integration Errors

**External API Errors**:
- If blog API is unreachable, return cached blog list (if available) or empty array
- If blog API returns malformed data, log error and filter out invalid posts
- If specific blog is not found, return 404 page with suggestions for related content
- Implement 30-second timeout for blog API calls

**Bookmark Errors**:
- If blog slug doesn't exist in external API, still allow bookmark (user might have valid link)
- If database write fails, return 500 error
- If parent tries to bookmark same blog twice, make it idempotent (return existing bookmark)

### Content Engagement Errors

**Tracking Errors**:
- If parent ID is missing (unauthenticated user), skip database tracking but still track in client-side analytics
- If content ID is invalid, log warning but don't fail the request
- If duration is negative or unreasonably large (>1 hour), clamp to reasonable range (0-3600 seconds)

**Query Errors**:
- If database query fails, return empty array and log error
- If limit/offset parameters are invalid, use defaults (limit: 50, offset: 0)
- If timeframe parameter is invalid, default to 'week'

---

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property tests**: Verify universal properties across all inputs through randomized testing

### Property-Based Testing

We will use **fast-check** (TypeScript property-based testing library) to implement the correctness properties defined above.

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: brand-awareness, Property {N}: {property description}`
- Tests should generate random but valid data (parent IDs, content IDs, timestamps, etc.)

**Example Property Test Structure**:

```typescript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('Feature: brand-awareness, Property 7: Forum like counting', () => {
  it('should increment like count by 1 and prevent duplicate likes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          postId: fc.uuid(),
          parentId: fc.uuid(),
          groupId: fc.uuid(),
        }),
        async ({ postId, parentId, groupId }) => {
          // Create a forum post
          const post = await createForumPost({ id: postId, groupId, ... })
          
          // Like the post
          await likePost(postId, parentId)
          const postAfterLike = await getPostById(postId)
          expect(postAfterLike.likes).toBe(1)
          
          // Try to like again
          await likePost(postId, parentId)
          const postAfterSecondLike = await getPostById(postId)
          expect(postAfterSecondLike.likes).toBe(1) // Should still be 1
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Unit Testing

**Focus Areas**:
- Analytics provider initialization and configuration
- Event tracking with specific known values
- Error handling for each error scenario documented above
- Edge cases: empty strings, null values, missing fields
- Integration points: External blog API, BHASH API, Instagram API

**Example Unit Test**:

```typescript
describe('Analytics Manager', () => {
  it('should track page view with correct parameters', () => {
    const analytics = new AnalyticsManager()
    const spy = vi.spyOn(analytics, 'trackEvent')
    
    analytics.trackPageView('/blog/vision-screening', 'Vision Screening Guide')
    
    expect(spy).toHaveBeenCalledWith('page_view', {
      page_path: '/blog/vision-screening',
      page_title: 'Vision Screening Guide',
      referrer: expect.any(String),
    })
  })
  
  it('should handle missing UTM parameters gracefully', () => {
    const url = 'https://parent.skids.clinic/blog/post'
    const params = extractUTMParams(url)
    
    expect(params).toEqual({
      utm_source: undefined,
      utm_medium: undefined,
      utm_campaign: undefined,
    })
    // Should not throw error
  })
})
```

### Integration Testing

**External API Integration**:
- Mock blog API responses for testing
- Test error handling when blog API is down
- Test timeout handling (30-second limit)

**WhatsApp Integration**:
- Mock BHASH API for testing
- Test message formatting
- Test retry logic on failures

**Database Integration**:
- Test all CRUD operations on new tables
- Test foreign key constraints
- Test aggregate count updates (triggers or application logic)

### Testing Coverage Goals

- **Unit test coverage**: 80%+ for all new code
- **Property test coverage**: All 18 correctness properties implemented
- **Integration test coverage**: All external API integrations tested with mocks
- **Error handling coverage**: All documented error scenarios tested

---

## Implementation Notes

### Phase 1 Priority: Analytics Foundation

Start with analytics infrastructure as it's foundational for measuring everything else:

1. Implement AnalyticsManager with all three providers (GA4, Meta, PostHog)
2. Add analytics tracking to existing pages (blog, organ discovery, PHR)
3. Set up server-side event tracking (content_engagement table)
4. Implement UTM parameter extraction and session tracking

### Phase 2 Priority: Community Features

Build community platform to drive engagement:

1. Create forum database tables and API routes
2. Build forum UI components (post list, post detail, comment thread)
3. Implement anonymous posting with privacy guarantees
4. Add like functionality with duplicate prevention
5. Implement social sharing with UTM tracking

### Phase 3 Priority: Content Distribution

Amplify content reach through distribution channels:

1. Integrate BHASH API for WhatsApp broadcasts
2. Build daily tip scheduler (Cloudflare Cron Trigger)
3. Implement share URL generation with UTM injection
4. Add Instagram integration for automated posting
5. Build content engagement dashboard for admins

### Existing Features to Enhance

**Blog Integration**:
- Already exists at `/blog` route
- Add analytics tracking to blog views
- Add bookmark functionality
- Add social sharing buttons

**Organ Discovery**:
- Already exists at `/organs` route
- Add analytics tracking
- Add social sharing
- Add related intervention links

**H.A.B.I.T.S. Framework**:
- Already exists in habits_log table
- Create content pages for each letter
- Add tracking templates
- Add social sharing

**Dr. SKIDS Chatbot**:
- Already exists with Cloudflare Workers AI
- Add analytics tracking for chat sessions
- Track topics discussed
- Measure engagement (messages per session)

### Performance Considerations

**Analytics Performance**:
- Load analytics scripts asynchronously to avoid blocking page load
- Batch events when possible (PostHog supports batching)
- Use requestIdleCallback for non-critical tracking

**Database Performance**:
- Index foreign keys (parentId, groupId, postId)
- Index frequently queried fields (createdAt for sorting)
- Use pagination for forum posts and comments (limit + offset)
- Cache popular content queries (Cloudflare KV, 5-minute TTL)

**Content Distribution Performance**:
- Queue WhatsApp broadcasts (don't send synchronously)
- Use Cloudflare Queues for async message processing
- Rate limit API calls to BHASH (respect their limits)
- Batch Instagram posts (schedule multiple at once)

### Security Considerations

**Anonymous Posting**:
- Never expose parent ID or real name for anonymous posts
- Store isAnonymous flag and check it in all queries
- Use database views or query filters to enforce privacy

**Content Moderation**:
- Implement profanity filter for forum posts/comments
- Add report functionality for inappropriate content
- Admin dashboard to review reported content
- Soft delete (mark as hidden) rather than hard delete

**API Security**:
- All forum API routes require authentication (getParentId)
- Rate limit forum post creation (max 10 posts per hour per parent)
- Rate limit likes (max 100 likes per hour per parent)
- Validate all input lengths and formats

**Analytics Privacy**:
- PostHog: Enable privacy mode (no IP tracking)
- GA4: Anonymize IP addresses
- Meta Pixel: Respect user consent (GDPR compliance)
- Allow users to opt out of analytics tracking

### Deployment Considerations

**Environment Variables**:
- `GA4_MEASUREMENT_ID`: Google Analytics 4 measurement ID
- `META_PIXEL_ID`: Facebook/Instagram Pixel ID
- `POSTHOG_API_KEY`: PostHog project API key
- `BHASH_USER`, `BHASH_PASS`, `BHASH_SENDER`: Already configured
- `INSTAGRAM_ACCESS_TOKEN`: Instagram Graph API token (if implementing auto-posting)

**Database Migrations**:
- Create migration script for new tables (forum_groups, forum_posts, forum_comments, forum_likes, content_engagement, social_shares, whatsapp_subscriptions)
- Run migration on D1 database before deploying code
- Test migration on preview environment first

**Cloudflare Configuration**:
- Set up Cron Trigger for daily WhatsApp broadcasts (9 AM IST)
- Configure Cloudflare Queues for async message processing (if needed)
- Increase D1 database limits if needed (check current usage)

**Monitoring**:
- Set up Cloudflare Analytics to monitor API route performance
- Monitor D1 database query performance
- Set up alerts for external API failures (blog API, BHASH API)
- Track analytics script load failures (client-side error logging)

### Content Strategy Implementation

**Daily Content Calendar**:
- Monday: Milestone Monday (developmental milestones)
- Tuesday: Nutrition Tuesday (healthy eating tips)
- Wednesday: Wellness Wednesday (organ discovery)
- Thursday: Habit Thursday (H.A.B.I.T.S. framework)
- Friday: FAQ Friday (common parent questions)
- Saturday: Story Saturday (parent success stories)
- Sunday: Sunday Funday (fun activities for kids)

**Content Distribution Channels**:
- Website: All content on parent.skids.clinic
- WhatsApp: Daily tip via WhatsApp broadcast (9 AM IST)
- Instagram: Daily post + 3 stories
- Facebook: Daily post + weekly live
- Email: Weekly newsletter (future enhancement)

**UTM Campaign Structure**:
- utm_source: facebook, instagram, google, whatsapp, organic
- utm_medium: social, cpc, email, referral
- utm_campaign: skids_awareness_q1, skids_vision_launch, skids_community
- utm_content: blog_post, organ_discovery, intervention_page, forum_post
- utm_term: child_health, parenting_tips, vision_screening

### Free vs Paid Feature Boundaries

**FREE Features (Focus Now)**:
- All blog content
- All organ discovery modules
- All H.A.B.I.T.S. framework content
- Community forums (all groups)
- Social sharing
- PHR features (milestones, growth, vaccinations, observations)
- Dr. SKIDS chatbot (unlimited messages)
- WhatsApp daily tips

**PAID Features (Track Analytics, Don't Push)**:
- SKIDS Vision screening bookings
- SKIDS Nutrition meal plans
- SKIDS Teleconsult bookings
- SKIDS Chatter therapy sessions
- Premium subscriptions (future)

**Conversion Tracking**:
- Track when engaged users view paid service pages
- Track service inquiry form submissions
- Track time spent on intervention pages
- Identify "warm leads" (high engagement + service page views)
- Send warm leads to Neodove CRM for follow-up

### Success Metrics Dashboard

**Awareness Metrics**:
- Website traffic: 100,000+ monthly visitors
- Blog views: 10,000+ daily views
- Social media reach: 500,000+ monthly reach
- Social shares: 5,000+ monthly shares
- Referral rate: 15% of new users from referrals

**Engagement Metrics**:
- DAU/MAU: 25% (daily active / monthly active)
- Session duration: 5+ minutes average
- Pages per session: 3+ pages
- Return rate: 40% return within 7 days
- Community posts: 1,000+ monthly posts

**Conversion Readiness Metrics**:
- Service page views: 20% of active users
- Service inquiries: 5% of service page viewers
- Lead quality score: Based on engagement + demographics
- WhatsApp subscription rate: 30% of signups

