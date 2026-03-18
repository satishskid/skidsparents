# Design Document: Awareness-First Growth Strategy

## Overview

Transform SKIDS Parent from a PHR tool to a **parent education platform** that builds awareness first, then converts to paid services.

## Core Principles

1. **Open Everything First** - Remove all paywalls on educational content
2. **Daily Value** - Provide daily educational content to build habit
3. **Social Proof** - Enable sharing to build trust and virality
4. **Gradual Conversion** - Convert users to paid features naturally

## Architecture

### Frontend Changes

#### 1. Public Pages (No Login Required)
```
/blog/[slug] - Blog posts (public)
/discover - Organ discovery (public)
/discover/[organ] - Organ details (public)
/habits - H.A.B.I.T.S. framework (public)
```

#### 2. Free PHR Features (Login Required)
```
/me - Child profile (free)
/me/[childId] - Child dashboard (free)
  - Milestones (free)
  - Growth (free)
  - Habits (free)
  - Observations (free)
  - Vaccinations (free)
  - Records (free)
```

#### 3. Premium Features (Paid)
```
/chat - Dr. SKIDS AI chatbot (Premium)
/notifications - Push notifications (Premium)
/reports - PDF export (Premium)
/services - Service booking (Premium)
```

### Backend Changes

#### 1. Feature Flags
```typescript
interface UserFeatures {
  free: {
    phr: true;
    blog: true;
    discover: true;
    habits: true;
  };
  premium: {
    aiChat: boolean;
    pushNotifications: boolean;
    pdfExport: boolean;
    serviceBooking: boolean;
  };
}
```

#### 2. Payment Integration
```typescript
// Razorpay payment flow
POST /api/payments/create-order
POST /api/payments/verify-payment
POST /api/subscriptions/create
POST /api/subscriptions/cancel
```

#### 3. Referral System
```typescript
// Referral code generation
POST /api/referrals/generate
GET /api/referrals/my-code
POST /api/referrals/apply
GET /api/referrals/stats
```

## UI/UX Changes

### 1. Home Page
- **Hero Section**: "Daily health tips for your child"
- **Blog Carousel**: Latest 5 blog posts
- **Organ of the Day**: Featured organ with fun fact
- **Habit of the Day**: Featured habit with tip
- **CTA**: "Track your child's health" (free)

### 2. Blog Page
- **Search**: Filter by category
- **Archive**: Browse by month
- **Share**: WhatsApp, Instagram, email
- **Related Posts**: Suggest similar articles

### 3. Organ Discovery
- **16 Organ Modules**: Click to explore
- **Fun Facts**: Educational content
- **Age-Specific Tips**: By child age
- **Related Blog Posts**: Link to articles

### 4. H.A.B.I.T.S. Framework
- **6 Habits**: Click to learn more
- **Daily Tip**: Rotate daily
- **Track Your Habit**: Log daily progress
- **Streak Counter**: Show consecutive days

### 5. Child Dashboard
- **Health Score**: Overall health metric (0-100)
- **Quick Actions**: Add measurement, log habit
- **Recent Activity**: Last 5 entries
- **Share Button**: Share to WhatsApp

### 6. Profile Page
- **Referral Code**: Unique code for sharing
- **Share Stats**: Number of referrals
- **Rewards**: Free months earned
- **Upgrade Button**: Convert to Premium

## Conversion Funnel

### 1. Awareness Stage
- User visits blog (no login required)
- Reads daily health tip
- Shares to WhatsApp
- Friend sees post, visits site

### 2. Interest Stage
- User creates free account
- Adds child profile
- Starts tracking milestones
- Uses habit tracker

### 3. Consideration Stage
- User sees Health Score
- Gets habit streak alerts
- Uses PDF export
- Reads Premium features

### 4. Conversion Stage
- User sees conversion trigger
- Starts 7-day free trial
- Uses Premium features
- Converts to paid

## Metrics

### Awareness Metrics
- Blog views/day
- Organ discovery visits/day
- Habit page visits/day
- Social shares/day
- Referral rate

### Engagement Metrics
- DAU/MAU
- PHR completion rate
- Chatbot usage
- Habit tracking frequency

### Conversion Metrics
- Free to Premium conversion rate
- Service conversion rate
- Referral conversion rate
- LTV/CAC ratio

## Technical Stack

### Frontend
- Astro 5 (SSR)
- React 18
- Tailwind CSS v4
- Firebase Auth

### Backend
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- Cloudflare KV (cache)
- Cloudflare Workers AI (AI chatbot)

### Payments
- Razorpay (payment gateway)
- Stripe (optional)

### Analytics
- PostHog (product analytics)
- Google Analytics (web analytics)

## Security

### Authentication
- Firebase Auth (Google + Phone OTP)
- Session management via Cloudflare KV
- Token refresh on expiry

### Data Protection
- GDPR compliant
- Data encryption at rest
- Data encryption in transit
- Regular security audits

## Compliance

### India Specific
- GDPR compliant
- Data localization (Cloudflare India)
- GST-compliant invoices
- Indian phone number support (+91)

### Health Data
- HIPAA compliant (if applicable)
- Medical data encryption
- Patient consent management
- Data retention policies

## Timeline

### Week 1-2: Open Free Version
- Remove login requirements
- Add Health Score
- Add PDF export
- Add referral program

### Week 3-6: Build Awareness
- Daily educational content
- Social sharing
- Community features

### Week 7-12: Convert to Paid
- Razorpay integration
- Subscription management
- Conversion triggers
- Free trial

## Risks

### Technical Risks
- Razorpay integration complexity
- Push notification delivery
- PDF generation performance
- Analytics data accuracy

### Business Risks
- User acquisition cost
- Conversion rate targets
- Churn rate
- Competition from other apps

### Mitigation
- Start with small user base
- A/B test pricing
- Offer free trial
- Focus on retention

## Success Criteria

### Week 2
- All free content accessible
- Health Score working
- PDF export working
- Referral program working

### Week 6
- 1,000+ blog views/day
- 500+ social shares/day
- 10% referral rate
- 20% DAU/MAU

### Week 12
- 350,000/month revenue
- 5% service conversion
- 4.5+ app rating
- 100,000+ active users

## Next Steps

1. **Create specs for Phase 1** (Open Free Version)
2. **Add "Health Score" metric**
3. **Add PDF export**
4. **Add referral program**
5. **Add push notifications**
