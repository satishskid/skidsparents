# Implementation Plan: Public Onboarding & Navigation Redesign

## Overview

This implementation plan breaks down the trust-based conversion strategy into concrete coding tasks following the priority order: foundation & navigation (highest priority - users blocked without these), analytics infrastructure (needed to measure everything), blog SEO optimization (critical for reaching millions), trust-based content access (core philosophy), value-focused prompts (conversion strategy), premium value communication (homepage), and comprehensive testing.

The implementation follows a trust-first philosophy where all users get real value (20 AI questions/day, health tracking, community access, basic PDF export), and premium enhances the experience (100 AI questions/day, detailed health score, teleconsult discount, unlimited children). Sign-in and upgrade prompts are contextual and value-focused, never blocking access.

## Tasks

### Phase 1: Foundation & Navigation (Highest Priority)

- [x] 1. Fix logo link and navigation structure
  - [x] 1.1 Update Navbar component to link logo to homepage
    - Modify `src/components/common/Navbar.astro` to add click handler on logo linking to `/`
    - Ensure logo is clickable with proper cursor styling
    - _Requirements: 2.1_
  
  - [x] 1.2 Add back navigation to community pages
    - Add back button component to community group pages linking to `/`
    - Style back button consistently with navigation system
    - Ensure back button is visible on both desktop and mobile
    - _Requirements: 2.2_
  
  - [x] 1.3 Verify all navigation links are functional
    - Test all navbar links (Blog, Discover, Community, Timeline, Interventions)
    - Test all mobile tab bar links (Home, Discover, Timeline, Reports, Me)
    - Ensure links work for both authenticated and unauthenticated users
    - _Requirements: 2.7_


- [x] 2. Implement active page indication
  - [x] 2.1 Add visual styling for active page in Navbar
    - Use `Astro.url.pathname` to determine current page
    - Apply visual indicator (border, color, or background) to active link
    - Ensure indicator is accessible with ARIA current attribute
    - _Requirements: 2.5_
  
  - [x] 2.2 Add visual styling for active tab in MobileTabBar
    - Use `Astro.url.pathname` to determine current tab
    - Apply visual indicator consistent with Navbar styling
    - Ensure touch targets remain at least 44px
    - _Requirements: 2.5, 9.4_
  
  - [ ]* 2.3 Write unit tests for active page indication
    - Test navbar active state for each route
    - Test mobile tab bar active state for each route
    - Test ARIA current attribute is set correctly
    - _Requirements: 2.5_

- [x] 3. Checkpoint - Verify navigation functionality
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Analytics Infrastructure

- [x] 4. Set up Google Analytics 4 (G4) tracking
  - [x] 4.1 Add G4 script to BaseLayout
    - Add G4 tracking script to `src/layouts/BaseLayout.astro`
    - Configure G4 measurement ID from environment variables
    - Ensure script loads asynchronously without blocking content
    - _Requirements: 10.1_
  
  - [x] 4.2 Create G4 tracking helper utilities
    - Create `src/lib/utils/analytics.ts` with `trackEvent` function
    - Implement type-safe event tracking with proper parameter types
    - Add window.gtag type definitions
    - _Requirements: 10.1_
  
  - [ ]* 4.3 Write unit tests for G4 tracking utilities
    - Test trackEvent function with various event types
    - Test window.gtag is called with correct parameters
    - Test graceful handling when gtag is unavailable
    - _Requirements: 10.1_


- [x] 5. Set up Meta Pixel tracking
  - [x] 5.1 Add Meta Pixel script to BaseLayout
    - Add Meta Pixel tracking script to `src/layouts/BaseLayout.astro`
    - Configure Pixel ID from environment variables
    - Ensure script loads asynchronously
    - _Requirements: 10.1_
  
  - [x] 5.2 Create Meta Pixel tracking helper utilities
    - Add `trackMetaEvent` function to `src/lib/utils/analytics.ts`
    - Implement type-safe Meta event tracking
    - Add window.fbq type definitions
    - _Requirements: 10.1_
  
  - [ ]* 5.3 Write unit tests for Meta Pixel tracking utilities
    - Test trackMetaEvent function with various event types
    - Test window.fbq is called with correct parameters
    - Test graceful handling when fbq is unavailable
    - _Requirements: 10.1_

- [x] 6. Implement UTM parameter capture and preservation
  - [x] 6.1 Create UTM parameter utilities
    - Create `src/lib/utils/utm.ts` with `captureUTMParams` and `getUTMParams` functions
    - Capture utm_source, utm_medium, utm_campaign, utm_term, utm_content, and referral code
    - Store parameters in sessionStorage for persistence
    - _Requirements: 10.6_
  
  - [x] 6.2 Add UTM capture to BaseLayout
    - Call `captureUTMParams` on initial page load
    - Ensure UTM params are captured before any tracking events
    - _Requirements: 10.6_
  
  - [x] 6.3 Include UTM params in all tracking events
    - Modify `trackEvent` and `trackMetaEvent` to include UTM params
    - Ensure UTM params are appended to all event metadata
    - _Requirements: 10.6_
  
  - [ ]* 6.4 Write unit tests for UTM parameter utilities
    - Test UTM parameter extraction from URL
    - Test sessionStorage persistence
    - Test UTM params included in tracking events
    - _Requirements: 10.6_


- [x] 7. Implement page view tracking
  - [x] 7.1 Add page view tracking to BaseLayout
    - Track page_view events with page_type parameter (blog, discover, community, homepage)
    - Fire both G4 and Meta Pixel PageView events
    - Include UTM parameters in page view events
    - _Requirements: 10.1_
  
  - [ ]* 7.2 Write integration tests for page view tracking
    - Test page view events fire on navigation
    - Test correct page_type is sent for each page
    - Test UTM params are included in events
    - _Requirements: 10.1_

- [x] 8. Checkpoint - Verify analytics tracking
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Blog SEO Optimization

- [ ] 9. Add complete meta tags to blog posts
  - [x] 9.1 Create BlogSEOMetadata interface
    - Define TypeScript interface in `src/lib/types/seo.ts`
    - Include fields for title, description, keywords, canonical URL
    - Include Open Graph and Twitter Card fields
    - Include structured data fields
    - _Requirements: 14.2, 14.3, 14.4_
  
  - [x] 9.2 Implement SEO metadata component
    - Create `src/components/blog/BlogSEO.astro` component
    - Accept BlogSEOMetadata props
    - Render all meta tags in document head
    - _Requirements: 14.2, 14.3, 14.4_
  
  - [x] 9.3 Add SEO metadata to blog post pages
    - Update blog post page template to include BlogSEO component
    - Populate metadata from blog post content
    - Ensure canonical URLs are absolute
    - _Requirements: 14.2, 14.3, 14.4_
  
  - [ ]* 9.4 Write unit tests for SEO metadata
    - Test all meta tags are rendered correctly
    - Test Open Graph tags are complete
    - Test Twitter Card tags are complete
    - _Requirements: 14.2, 14.3, 14.4_


- [ ] 10. Implement structured data (JSON-LD) for blog posts
  - [x] 10.1 Add JSON-LD script to BlogSEO component
    - Generate Article or BlogPosting schema
    - Include headline, description, image, datePublished, author
    - Render as script tag with type="application/ld+json"
    - _Requirements: 14.7_
  
  - [ ]* 10.2 Write unit tests for structured data
    - Test JSON-LD is valid JSON
    - Test all required schema.org fields are present
    - Test structured data matches blog post content
    - _Requirements: 14.7_

- [ ] 11. Ensure semantic HTML structure for blog posts
  - [x] 11.1 Update blog post template with semantic tags
    - Use `<article>` for blog post content
    - Use `<header>` for post title and metadata
    - Use `<section>` for post sections
    - Ensure proper heading hierarchy (h1, h2, h3)
    - _Requirements: 14.5_
  
  - [ ]* 11.2 Write accessibility tests for semantic HTML
    - Test proper heading hierarchy
    - Test semantic tags are used correctly
    - Test article structure is accessible
    - _Requirements: 14.5_

- [x] 12. Verify server-side rendering for blog posts
  - [x] 12.1 Ensure blog posts are statically generated
    - Configure Astro to pre-render blog post pages
    - Verify complete content is in initial HTML response
    - Test that content is not loaded client-side
    - _Requirements: 14.6_
  
  - [ ]* 12.2 Write integration tests for SSR
    - Test blog post HTML contains complete content
    - Test no client-side content loading
    - Test search engine crawlers can index content
    - _Requirements: 14.6_

- [x] 13. Checkpoint - Verify blog SEO optimization
  - Ensure all tests pass, ask the user if questions arise.


### Phase 4: Trust-Based Content Access

- [x] 14. Ensure all public content is accessible without authentication
  - [x] 14.1 Remove authentication checks from blog pages
    - Verify blog listing and individual posts have no auth requirements
    - Ensure complete article content renders without authentication
    - _Requirements: 1.1_
  
  - [x] 14.2 Implement read-only community access
    - Update community group listing to display without authentication
    - Update individual group pages to show posts in read-only mode
    - Hide post creation controls for unauthenticated users
    - Hide reaction controls for unauthenticated users
    - _Requirements: 1.2, 12.1, 12.4, 12.5_
  
  - [x] 14.3 Ensure discover pages are public
    - Verify organ discovery listing is accessible without auth
    - Verify individual organ pages are accessible without auth
    - _Requirements: 1.5_
  
  - [x] 14.4 Verify homepage is fully public
    - Ensure all homepage sections render without authentication
    - Verify navigation links are visible to unauthenticated users
    - _Requirements: 1.4, 1.6_
  
  - [ ]* 14.5 Write property test for public content accessibility
    - **Property 1: Public Content Accessibility**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    - Test any public page returns complete content without auth headers

- [x] 15. Ensure no blocking prompts on initial page load
  - [x] 15.1 Remove modal overlays from public pages
    - Audit all public pages for blocking modals
    - Remove or defer any authentication prompts on initial load
    - _Requirements: 1.7, 13.3_
  
  - [ ]* 15.2 Write property test for non-blocking initial load
    - **Property 22: Initial Page Load Non-Blocking**
    - **Validates: Requirements 12.3**
    - Test no modal overlays appear on initial page render


- [x] 16. Separate blog posts from community posts
  - [x] 16.1 Update community queries to filter by group_id
    - Modify community group queries to exclude posts with `group_id = NULL`
    - Ensure blog posts (group_id = NULL) are only shown in blog section
    - Ensure community posts (specific group_id) are only shown in community
    - _Requirements: 1.3, 12.3_
  
  - [ ]* 16.2 Write unit tests for content separation
    - Test blog queries exclude community posts
    - Test community queries exclude blog posts
    - Test correct content appears in each section
    - _Requirements: 1.3, 12.3_

- [x] 17. Checkpoint - Verify trust-based content access
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Value-Focused Prompts

- [x] 18. Implement Dr. SKIDS chat sign-in prompt
  - [x] 18.1 Update ChatWidget to provide general answers for unauthenticated users
    - Modify `src/components/chat/ChatWidget.tsx` to detect auth state
    - Send messages to AI without personalization context when unauthenticated
    - Display general answers to user questions
    - _Requirements: 3.1, 3.2_
  
  - [x] 18.2 Add contextual sign-in prompt to chat responses
    - Display sign-in prompt inline after general answer
    - Include value proposition: "personalized answers based on your child's age and profile"
    - Add clear call-to-action linking to `/login?redirect=/timeline`
    - Ensure prompt is not a blocking modal
    - _Requirements: 3.3, 3.4, 3.5, 3.6_
  
  - [x] 18.3 Allow multiple questions with contextual prompts
    - Enable unauthenticated users to ask multiple questions
    - Display sign-in prompt contextually with each response
    - Track sign-in prompt views with G4 and Meta Pixel
    - _Requirements: 3.7, 10.2_
  
  - [ ]* 18.4 Write unit tests for chat sign-in prompt
    - Test general answers are provided to unauthenticated users
    - Test sign-in prompt displays with value proposition
    - Test prompt is inline, not blocking modal
    - Test tracking events fire on prompt view
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 10.2_


- [x] 19. Implement community sign-in prompts
  - [x] 19.1 Add sign-in prompt for community posting
    - Display inline prompt when unauthenticated user attempts to post
    - Include value proposition: "join the conversation, share experiences"
    - Add call-to-action linking to `/login?redirect=[current-page]`
    - Track prompt views with G4 and Meta Pixel
    - _Requirements: 4.2, 4.5, 10.2_
  
  - [x] 19.2 Add sign-in prompt for community reactions
    - Display inline prompt when unauthenticated user attempts to react
    - Include value proposition: "join the conversation"
    - Add call-to-action with redirect parameter
    - Track prompt views with G4 and Meta Pixel
    - _Requirements: 4.3, 4.5, 10.2_
  
  - [x] 19.3 Add scroll-triggered sign-in prompt
    - Display subtle prompt after user views 3+ posts
    - Limit to once per session using sessionStorage
    - Include value proposition: "join the conversation, share experiences"
    - Track prompt views with G4 and Meta Pixel
    - _Requirements: 12.6, 12.7, 10.2_
  
  - [ ]* 19.4 Write unit tests for community sign-in prompts
    - Test posting prompt displays for unauthenticated users
    - Test reaction prompt displays for unauthenticated users
    - Test scroll-triggered prompt appears after 3 posts
    - Test prompt frequency limiting (once per session)
    - Test tracking events fire on prompt views
    - _Requirements: 4.2, 4.3, 12.6, 10.2_

- [x] 20. Implement intervention booking sign-in prompt
  - [x] 20.1 Add sign-in prompt to intervention booking
    - Display prompt when unauthenticated user attempts to book
    - Include value proposition: "track appointments, receive reminders"
    - Add call-to-action linking to `/login?redirect=/interventions`
    - Track prompt views with G4 and Meta Pixel
    - _Requirements: 4.4, 4.5, 10.2_
  
  - [ ]* 20.2 Write unit tests for intervention sign-in prompt
    - Test prompt displays on booking attempt
    - Test value proposition is clear
    - Test redirect parameter preserves context
    - Test tracking events fire on prompt view
    - _Requirements: 4.4, 4.5, 10.2_


- [x] 21. Implement seamless sign-in flow with redirect
  - [x] 21.1 Store redirect URL on sign-in prompt click
    - Capture current page URL when user clicks sign-in prompt
    - Store in sessionStorage or URL parameter
    - _Requirements: 11.1_
  
  - [x] 21.2 Redirect to intended destination after authentication
    - Read redirect URL from storage or parameter after auth
    - Navigate user to stored URL
    - Clear stored redirect URL
    - _Requirements: 11.2_
  
  - [x] 21.3 Enable attempted action after authentication
    - Preserve action context (e.g., "post-comment", "react-to-post")
    - Automatically enable action after redirect
    - _Requirements: 11.3_
  
  - [x] 21.4 Preserve form input data across auth flow
    - Store form data in sessionStorage before redirect
    - Restore form data after authentication
    - _Requirements: 11.4_
  
  - [ ]* 21.5 Write integration tests for sign-in flow
    - Test redirect URL is preserved through auth
    - Test user returns to intended destination
    - Test attempted action is enabled after auth
    - Test form data is preserved and restored
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 22. Checkpoint - Verify value-focused prompts
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Premium Value Communication

- [x] 23. Update homepage with free tier value display
  - [x] 23.1 Add free tier features section to homepage
    - Display "20 AI questions per day - Get expert guidance on your child's health"
    - Display "Health tracking - Monitor your child's development and milestones"
    - Display "Community access - Connect with other parents and share experiences"
    - Display "Basic PDF export - Download your child's health records"
    - Use positive, value-focused language
    - _Requirements: 5.1, 7.2_
  
  - [ ]* 23.2 Write unit tests for free tier value display
    - Test all free tier features are displayed
    - Test language is positive and value-focused
    - Test no negative framing ("limited", "basic" in negative context)
    - _Requirements: 5.1, 7.2_


- [x] 24. Update homepage with premium tier value display
  - [x] 24.1 Add premium benefits section framed as solving parent problems
    - Display "Have frequent questions? Get 100 AI answers per day"
    - Display "Want to understand your child's health in detail? Get component score breakdown"
    - Display "Need to book appointments? Get teleconsult discount"
    - Display "Have multiple children? Track unlimited profiles"
    - Use question format to help parents self-identify needs
    - _Requirements: 5.2, 7.1_
  
  - [x] 24.2 Track which value propositions drive conversions
    - Add click tracking to each premium benefit
    - Fire G4 and Meta Pixel events with benefit type
    - Include UTM parameters in tracking events
    - _Requirements: 7.6_
  
  - [ ]* 24.3 Write unit tests for premium value display
    - Test all premium benefits are displayed
    - Test benefits are framed as solving problems
    - Test question format is used
    - Test tracking events fire on benefit clicks
    - _Requirements: 5.2, 7.1, 7.6_

- [x] 25. Add social proof to homepage
  - [x] 25.1 Create social proof component
    - Display user testimonials where available
    - Display community activity indicators (e.g., "Join 10,000+ parents")
    - Display success stories demonstrating platform value
    - _Requirements: 5.3_
  
  - [x] 25.2 Track engagement with social proof elements
    - Add click tracking to testimonials and success stories
    - Fire G4 events for social proof engagement
    - _Requirements: 5.3_
  
  - [ ]* 25.3 Write unit tests for social proof display
    - Test social proof elements render correctly
    - Test tracking events fire on engagement
    - _Requirements: 5.3_

- [x] 26. Implement hero content adaptation based on auth state
  - [x] 26.1 Create onboarding hero for unauthenticated users
    - Emphasize blog reach and community value
    - Include clear value propositions
    - Add call-to-action for sign-up
    - _Requirements: 8.3_
  
  - [x] 26.2 Create personalized daily content hero for authenticated users
    - Display personalized content based on user profile
    - Show daily health tips or reminders
    - _Requirements: 8.4_
  
  - [x] 26.3 Implement reactive hero content switching
    - Detect auth state changes without page reload
    - Update hero content dynamically
    - Use cached auth state to prevent content flashing
    - _Requirements: 8.2, 8.5_
  
  - [ ]* 26.4 Write unit tests for hero content adaptation
    - Test onboarding hero displays for unauthenticated users
    - Test personalized hero displays for authenticated users
    - Test hero updates on auth state change
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 27. Checkpoint - Verify premium value communication
  - Ensure all tests pass, ask the user if questions arise.


### Phase 7: Premium Upgrade Prompts

- [x] 28. Implement Dr. SKIDS usage limit tracking and prompts
  - [x] 28.1 Create daily usage tracking system
    - Track AI question count per user per day in database
    - Reset count daily at midnight
    - Query current usage count on each chat interaction
    - _Requirements: 6.7_
  
  - [x] 28.2 Display remaining question count
    - Show remaining count after each interaction when below 6 questions
    - Display inline in chat interface
    - _Requirements: 6.1_
  
  - [x] 28.3 Display upgrade prompt when limit reached
    - Show prompt when user reaches 20 questions (free tier limit)
    - Explain premium offers 100 questions per day for frequent concerns
    - Provide call-to-action to view subscription options
    - Track prompt views with G4 and Meta Pixel
    - _Requirements: 6.2, 6.5, 6.6, 10.4_
  
  - [ ]* 28.4 Write unit tests for usage limit tracking
    - Test daily usage count increments correctly
    - Test remaining count displays when below 6
    - Test upgrade prompt displays at limit
    - Test tracking events fire on prompt view
    - _Requirements: 6.1, 6.2, 6.7, 10.4_

- [x] 29. Implement health score premium indicator
  - [x] 29.1 Create HealthScoreDisplay component
    - Display overall health score for all users
    - Show subtle indicator that premium unlocks detailed breakdown
    - Include value proposition: "Want to understand your child's health in detail?"
    - Provide call-to-action to view subscription options
    - Track prompt views with G4 and Meta Pixel
    - _Requirements: 6.3, 6.5, 6.6, 10.4_
  
  - [ ]* 29.2 Write unit tests for health score premium indicator
    - Test overall score displays for free tier users
    - Test premium indicator is subtle and non-intrusive
    - Test value proposition is clear
    - Test tracking events fire on prompt view
    - _Requirements: 6.3, 6.5, 10.4_


- [x] 30. Implement multiple children profile upgrade prompt
  - [x] 30.1 Add upgrade prompt to child registration
    - Detect when authenticated user attempts to add second child
    - Display upgrade prompt explaining premium supports unlimited children
    - Include value proposition: "Have multiple children? Track unlimited profiles"
    - Provide call-to-action to view subscription options
    - Track prompt views with G4 and Meta Pixel
    - _Requirements: 6.4, 6.5, 6.6, 10.4_
  
  - [ ]* 30.2 Write unit tests for multiple children prompt
    - Test prompt displays when adding second child on free tier
    - Test prompt does not display for premium users
    - Test value proposition is clear
    - Test tracking events fire on prompt view
    - _Requirements: 6.4, 6.5, 10.4_

- [x] 31. Checkpoint - Verify premium upgrade prompts
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8: Authentication State Management

- [x] 32. Implement authentication state caching
  - [x] 32.1 Create auth state cache utilities
    - Store auth state in browser localStorage
    - Include user ID, tier, and timestamp
    - Implement cache expiration (e.g., 24 hours)
    - _Requirements: 8.5_
  
  - [x] 32.2 Load cached auth state on page load
    - Read cached state before Firebase auth check
    - Display cached UI immediately to prevent flashing
    - Verify cached state against Firebase
    - _Requirements: 8.5, 8.6_
  
  - [x] 32.3 Default to unauthenticated UI during auth resolution
    - Show unauthenticated UI while Firebase auth is resolving
    - Avoid blocking content display
    - _Requirements: 8.7_
  
  - [ ]* 32.4 Write unit tests for auth state caching
    - Test cached state is stored and retrieved correctly
    - Test cache expiration works
    - Test default to unauthenticated UI during resolution
    - _Requirements: 8.5, 8.6, 8.7_


- [x] 33. Implement reactive authentication UI updates
  - [x] 33.1 Update navigation components on auth state change
    - Listen to Firebase auth state changes
    - Update Navbar, NavbarUser, and MobileTabBar without page reload
    - Use optimistic UI updates for smooth transitions
    - _Requirements: 8.2, 13.5_
  
  - [x] 33.2 Track authentication events
    - Fire G4 and Meta Pixel events on sign-up (with method: google/phone)
    - Fire events on sign-in (with method and is_new_user flag)
    - Include UTM parameters in auth events
    - _Requirements: 10.3_
  
  - [ ]* 33.3 Write integration tests for reactive auth UI
    - Test UI updates on auth state change
    - Test no page reload required
    - Test tracking events fire on authentication
    - _Requirements: 8.2, 10.3, 13.5_

- [x] 34. Checkpoint - Verify authentication state management
  - Ensure all tests pass, ask the user if questions arise.

### Phase 9: Mobile Responsiveness

- [x] 35. Implement responsive navigation display
  - [x] 35.1 Configure viewport-based navigation display
    - Show MobileTabBar on viewport width < 768px
    - Show Navbar on viewport width ≥ 768px
    - Handle orientation changes appropriately
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [x] 35.2 Ensure touch target accessibility
    - Verify all mobile navigation elements have ≥44px touch targets
    - Test on actual mobile devices
    - _Requirements: 9.4_
  
  - [x] 35.3 Handle safe area insets for notched devices
    - Apply CSS `env(safe-area-inset-bottom)` to MobileTabBar
    - Test on devices with notches
    - _Requirements: 9.1_
  
  - [ ]* 35.4 Write responsive navigation tests
    - Test MobileTabBar displays on small viewports
    - Test Navbar displays on large viewports
    - Test touch target sizes meet 44px minimum
    - Test orientation change handling
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 36. Checkpoint - Verify mobile responsiveness
  - Ensure all tests pass, ask the user if questions arise.


### Phase 10: Performance Optimization

- [x] 37. Optimize homepage loading performance
  - [x] 37.1 Ensure static content loads within 2 seconds on 3G
    - Optimize images and assets
    - Minimize JavaScript bundle size
    - Use lazy loading for below-the-fold content
    - _Requirements: 15.1_
  
  - [x] 37.2 Prioritize navigation rendering
    - Render navigation controls before auth state determination
    - Display default unauthenticated UI during auth resolution
    - _Requirements: 15.2, 15.3_
  
  - [x] 37.3 Prioritize blog content loading
    - Load article content before interactive features
    - Use progressive enhancement for interactivity
    - _Requirements: 15.4_
  
  - [ ]* 37.4 Write performance tests
    - Test homepage loads within 2 seconds on simulated 3G
    - Test navigation renders before auth resolution
    - Test blog content loads before interactive features
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 38. Checkpoint - Verify performance optimization
  - Ensure all tests pass, ask the user if questions arise.

### Phase 11: Accessibility

- [x] 39. Implement keyboard navigation support
  - [x] 39.1 Add keyboard navigation to navigation components
    - Support Tab, Enter, and Escape keys
    - Maintain logical focus order
    - Test with keyboard-only navigation
    - _Requirements: 16.1, 16.3_
  
  - [x] 39.2 Add ARIA labels and roles to navigation
    - Add appropriate ARIA labels to all navigation elements
    - Add ARIA current attribute to active page
    - Add ARIA roles to sign-in prompts
    - _Requirements: 16.2, 16.4_
  
  - [x] 39.3 Implement focus management for modals
    - Move focus to modal when it appears
    - Trap focus within modal until dismissed
    - Return focus to trigger element on close
    - _Requirements: 16.5_
  
  - [ ]* 39.4 Write accessibility tests
    - Test keyboard navigation works correctly
    - Test ARIA labels and roles are present
    - Test focus management for modals
    - Test with screen reader simulation
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 40. Checkpoint - Verify accessibility
  - Ensure all tests pass, ask the user if questions arise.


### Phase 12: Error Handling

- [x] 41. Implement authentication error handling
  - [x] 41.1 Handle Firebase authentication failures
    - Display appropriate error messages for different failure types
    - Implement retry logic with exponential backoff
    - Preserve user context (redirect URL, form data) across errors
    - _Requirements: 11.5, 17.1_
  
  - [ ]* 41.2 Write unit tests for auth error handling
    - Test error messages display correctly
    - Test retry logic works
    - Test context preservation across errors
    - _Requirements: 11.5, 17.1_

- [x] 42. Implement content loading error handling
  - [x] 42.1 Handle blog content fetch failures
    - Display fallback message with retry option
    - Implement stale-while-revalidate caching
    - Log errors to analytics
    - _Requirements: 17.2_
  
  - [x] 42.2 Handle community groups fetch failures
    - Display error message with retry option
    - Implement caching strategy
    - Log errors to analytics
    - _Requirements: 17.3_
  
  - [x] 42.3 Handle Dr. SKIDS chat API failures
    - Display connection error messages
    - Implement request queuing with retry
    - Store failed messages locally
    - _Requirements: 17.4_
  
  - [ ]* 42.4 Write integration tests for content error handling
    - Test fallback messages display correctly
    - Test retry functionality works
    - Test caching strategy works
    - _Requirements: 17.2, 17.3, 17.4_

- [x] 43. Implement client-side error logging
  - [x] 43.1 Create error logging utility
    - Log client-side errors for debugging
    - Avoid exposing technical details to users
    - Send error logs to monitoring service
    - _Requirements: 17.5_
  
  - [ ]* 43.2 Write unit tests for error logging
    - Test errors are logged correctly
    - Test technical details are not exposed to users
    - _Requirements: 17.5_

- [x] 44. Checkpoint - Verify error handling
  - Ensure all tests pass, ask the user if questions arise.


### Phase 13: Comprehensive Testing

- [ ] 45. Write property-based tests for core correctness properties
  - [ ]* 45.1 Property test: Navigation visibility on public pages
    - **Property 2: Navigation Visibility on Public Pages**
    - **Validates: Requirements 1.6, 2.3, 2.4**
    - Test navigation displays all links on any public page without auth
  
  - [ ]* 45.2 Property test: Authentication state persistence
    - **Property 3: Authentication State Persistence**
    - **Validates: Requirements 2.6, 7.1, 7.5, 7.6**
    - Test auth state remains consistent across navigation sequences
  
  - [ ]* 45.3 Property test: Active page indication
    - **Property 4: Active Page Indication**
    - **Validates: Requirements 2.5**
    - Test navigation indicates active page correctly for any route
  
  - [ ]* 45.4 Property test: Chat interface non-blocking
    - **Property 6: Chat Interface Non-Blocking**
    - **Validates: Requirements 3.6**
    - Test chat remains interactive with sign-in prompts
  
  - [ ]* 45.5 Property test: Gated content redirection
    - **Property 7: Gated Content Redirection**
    - **Validates: Requirements 4.1, 10.1**
    - Test gated pages redirect to sign-in with redirect parameter
  
  - [ ]* 45.6 Property test: Post-authentication redirect
    - **Property 9: Post-Authentication Redirect**
    - **Validates: Requirements 4.6, 10.2, 10.3**
    - Test users return to intended destination after auth
  
  - [ ]* 45.7 Property test: Responsive navigation display
    - **Property 14: Responsive Navigation Display**
    - **Validates: Requirements 8.1, 8.2, 8.5**
    - Test navigation adapts correctly across viewport sizes
  
  - [ ]* 45.8 Property test: Touch target accessibility
    - **Property 15: Touch Target Accessibility**
    - **Validates: Requirements 8.4**
    - Test all mobile navigation elements have ≥44px touch targets
  
  - [ ]* 45.9 Property test: UTM parameter preservation
    - **Property 17: UTM Parameter Preservation**
    - **Validates: Requirements 9.6**
    - Test UTM params persist through navigation and auth flows
  
  - [ ]* 45.10 Property test: Community read-only access
    - **Property 20: Community Read-Only Access**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
    - Test unauthenticated users can read community without controls


- [ ] 46. Write end-to-end tests for complete user journeys
  - [ ]* 46.1 E2E test: Anonymous blog reader journey
    - Test: Landing on blog → reading articles → sign-in prompt → authentication → return to blog
    - Verify: SEO optimization, no blocking prompts, smooth auth flow
    - _Requirements: 1.1, 3.2, 11.1, 11.2, 14.1-14.7_
  
  - [ ]* 46.2 E2E test: Dr. SKIDS chat exploration journey
    - Test: Chat with general answers → multiple questions → sign-in prompt → authentication → personalized chat
    - Verify: General answers provided, contextual prompts, seamless transition
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [ ]* 46.3 E2E test: Free tier usage limit journey
    - Test: Authenticated user → 20 AI questions → usage limit → upgrade prompt → subscription flow
    - Verify: Usage tracking, remaining count display, upgrade prompt with value proposition
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 6.7_
  
  - [ ]* 46.4 E2E test: Multiple children upgrade journey
    - Test: Authenticated user → add second child → upgrade prompt → subscription flow
    - Verify: Prompt displays, value proposition clear, tracking events fire
    - _Requirements: 6.4, 6.5, 6.6_
  
  - [ ]* 46.5 E2E test: Mobile navigation journey
    - Test: Mobile user → navigation → orientation change → layout adaptation
    - Verify: MobileTabBar displays, touch targets accessible, responsive behavior
    - _Requirements: 9.1, 9.2, 9.4, 9.5_
  
  - [ ]* 46.6 E2E test: UTM tracking journey
    - Test: Landing with UTM params → navigation → authentication → subscription
    - Verify: UTM params captured, preserved throughout, included in conversion events
    - _Requirements: 10.6_
  
  - [ ]* 46.7 E2E test: Community exploration journey
    - Test: Read posts → scroll through 3+ posts → sign-in prompt → authentication → post in community
    - Verify: Read-only access, scroll-triggered prompt, seamless auth flow
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 12.6, 12.7_

- [x] 47. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties across input space
- Unit tests validate specific examples and edge cases
- E2E tests validate complete user journeys from start to finish
- Implementation follows priority order: foundation/navigation → analytics → blog SEO → trust-based access → value-focused prompts → premium communication → testing
- All tracking events include UTM parameters for attribution
- All prompts emphasize value benefits rather than restrictions
- Free tier provides real value (20 AI questions, health tracking, community, PDF export)
- Premium enhances experience (100 AI questions, detailed health score, teleconsult discount, unlimited children)
