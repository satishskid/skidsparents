# Implementation Plan: Brand Awareness & Community Building

## Overview

This implementation plan focuses on building FREE features first to establish brand awareness and market presence. The approach is to provide maximum value through free content and community features, with comprehensive analytics to measure engagement and identify conversion opportunities.

**Priority**: FREE features (content, community, analytics) before paid services.

## Tasks

- [x] 1. Set up analytics infrastructure
  - [x] 1.1 Install and configure analytics libraries (GA4, Meta Pixel, PostHog, fast-check)
  - [x] 1.2 Implement AnalyticsManager and provider classes
  - [x] 1.3 Add analytics initialization to Astro layout
  - [x] 1.4 Write property test for page view tracking
  - [x] 1.5 Write property test for UTM parameter preservation

- [x] 2. Create database schema for community and engagement
  - [x] 2.1 Add forum tables to schema
  - [x] 2.2 Add content engagement tables to schema
  - [x] 2.3 Create and run database migration
  - [x] 2.4 Write property test for forum post data integrity

- [x] 3. Implement content engagement tracking
  - [x] 3.1 Create EngagementService class
  - [x] 3.2 Create API routes for engagement tracking
  - [x] 3.3 Add client-side engagement tracking hooks
  - [x] 3.4 Write property test for view duration accuracy
  - [x] 3.5 Write property test for engagement immutability

- [x] 4. Checkpoint - Ensure analytics and engagement tracking work

- [x] 5. Build forum system backend
  - [x] 5.1 Create ForumService class
  - [x] 5.2 Create forum API routes
  - [x] 5.3 Implement anonymous posting privacy
  - [x] 5.4 Implement aggregate count maintenance
  - [x] 5.5 Write property test for anonymous post privacy
  - [x] 5.6 Write property test for forum like counting
  - [x] 5.7 Write property test for post count maintenance

- [x] 6. Build forum system frontend
  - [x] 6.1 Create forum group listing page
  - [x] 6.2 Create forum post listing page
  - [x] 6.3 Create forum post detail page
  - [x] 6.4 Create forum post creation form
  - [x] 6.5 Write unit tests for forum UI components

- [x] 7. Implement social sharing functionality
  - [x] 7.1 Create SocialShareService class
  - [x] 7.2 Create social share API routes
  - [x] 7.3 Add social share buttons to content pages
  - [x] 7.4 Write property test for share URL UTM injection
  - [x] 7.5 Write property test for social share persistence

- [x] 8. Checkpoint - Ensure community and sharing features work

- [x] 9. Enhance existing blog integration
  - [x] 9.1 Add analytics tracking to blog pages
  - [x] 9.2 Implement blog bookmark functionality
  - [x] 9.3 Write property test for blog bookmark uniqueness
  - [x] 9.4 Write unit tests for blog API error handling

- [x] 10. Enhance organ discovery modules
  - [x] 10.1 Create organ discovery content files (src/lib/content/organs.ts — 16 modules)
  - [x] 10.2 Create organ discovery pages (src/pages/discover/index.astro, [organ].astro)
  - [x] 10.3 Link organs to related interventions

- [x] 11. Create H.A.B.I.T.S. framework content
  - [x] 11.1 Create H.A.B.I.T.S. content files (src/lib/content/habits.ts — 6 letters)
  - [x] 11.2 Create H.A.B.I.T.S. pages (src/pages/habits/index.astro, [habit].astro)
  - [x] 11.3 Integrate with existing habits_log table

- [x] 12. Implement WhatsApp broadcast system
  - [x] 12.1 Create BHASHService class (src/lib/distribution/whatsapp.ts)
  - [x] 12.2 Create WhatsApp subscription management (src/pages/api/whatsapp/subscribe.ts)
  - [x] 12.3 Create daily tip scheduler (src/pages/api/cron/daily-broadcast.ts)
  - [x] 12.4 Write property test for WhatsApp message formatting
  - [x] 12.5 Write unit tests for BHASH API integration

- [x] 13. Add analytics tracking to existing features
  - [x] 13.1 Add tracking to PHR features
  - [x] 13.2 Add tracking to Dr. SKIDS chatbot
  - [x] 13.3 Add conversion tracking to service pages
  - [x] 13.4 Write property test for content engagement tracking

- [x] 14. Build admin analytics dashboard
  - [x] 14.1 Create analytics dashboard page (src/pages/admin/analytics.astro)
  - [x] 14.2 Create popular content API (src/pages/api/admin/popular-content.ts)
  - [x] 14.3 Write property test for popular content ranking

- [x] 15. Implement content moderation features
  - [x] 15.1 Add report functionality to forum (src/pages/api/forum/report.ts)
  - [x] 15.2 Create admin moderation dashboard (src/pages/admin/moderation.astro)
  - [x] 15.3 Write unit tests for moderation features

- [-] 16. Final checkpoint and deployment preparation
  - [x] 16.1 Run all tests and ensure they pass
    - Run: `npx vitest run`
    - Ensure all property tests and unit tests pass
    - _Requirements: Testing Coverage Goals_

  - [ ] 16.2 Set up environment variables in Cloudflare
    - `wrangler pages secret put GA4_MEASUREMENT_ID`
    - `wrangler pages secret put META_PIXEL_ID`
    - `wrangler pages secret put POSTHOG_API_KEY`
    - Verify BHASH_USER, BHASH_PASS, BHASH_SENDER already set
    - _Requirements: Deployment Considerations_

  - [x] 16.3 Deploy database migration to production D1
    - Run: `wrangler d1 migrations apply skids-parent-db --remote`
    - Applies migrations 0001_core_schema.sql and 0002_community_tables.sql
    - Verify tables exist: forum_groups, forum_posts, forum_comments, forum_likes, social_shares, whatsapp_subscriptions
    - _Requirements: Deployment Considerations_

  - [x] 16.4 Configure Cloudflare Cron Trigger
    - Cron set in wrangler.jsonc: "30 3 * * *" (9 AM IST)
    - Handler: src/pages/api/cron/daily-broadcast.ts

  - [x] 16.5 Deploy to production
    - Build: `npm run build`
    - Deploy: `wrangler pages deploy dist --project-name skids-parent`
    - Smoke test: verify forum, analytics, WhatsApp subscription, organ/habits pages
    - _Requirements: All_

## Notes

- All implementation code is complete (tasks 1–15 fully done)
- Only remaining work is deployment (task 16): run tests → set secrets → migrate DB → deploy
- All UTM campaigns use `skids_` prefix
- All phone numbers normalized to 10-digit format (no +91) for BHASH API
- All API routes use getParentId authentication pattern
- Cron trigger configured for daily WhatsApp broadcast at 9 AM IST (3:30 AM UTC)
