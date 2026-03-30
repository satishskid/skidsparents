# Requirements Document

## Introduction

This document specifies requirements for redesigning the public onboarding flow and navigation system for the SKIDS Parent platform. The redesign implements a trust-based conversion strategy that maximizes content reach (targeting millions of blog readers) and converts approximately 1% to subscribers through demonstrated value rather than artificial limitations.

The core philosophy: all users get basic features, conversion is based on trust and appreciated need. The system must provide a frictionless experience where users explore freely, build trust through accessible content, and naturally discover premium value through usage. Sign-in prompts are contextual and value-focused, never blocking or aggressive. Premium features enhance the experience rather than gate essential functionality.

## Glossary

- **Navigation_System**: The global navigation components including navbar, mobile tab bar, logo, and back navigation controls
- **Public_Content**: Pages and features accessible without authentication (blogs, community read-only, discover pages, homepage)
- **Personalized_Feature**: Functionality requiring user authentication to provide personalized experience (Dr. SKIDS AI personalization, timeline, community posting, reactions, intervention booking)
- **Sign_In_Prompt**: Contextual UI element explaining value of authentication without blocking access
- **Value_Demonstration**: Strategy of showing premium benefits through usage rather than restriction
- **Trust_Based_Conversion**: Conversion strategy where users experience platform value freely, then upgrade based on appreciated need
- **Dr_SKIDS_Chat**: The AI-powered chat widget for health guidance (available to all, personalization requires sign-in)
- **Community_Page**: The forum groups listing and individual group discussion pages (readable by all, posting requires sign-in)
- **Blog_Post**: Content in the blog system with `group_id = NULL`, separate from community posts
- **Community_Post**: Content in forum groups with specific `group_id`, separate from blog posts
- **Timeline_Page**: Personal health records page requiring authentication
- **Blog_Page**: Article pages that are fully public and SEO-optimized
- **Homepage**: The landing page at parent.skids.clinic
- **Navbar**: The top navigation bar component with logo linking to homepage
- **Mobile_Tab_Bar**: The bottom navigation bar for mobile devices
- **Authentication_State**: The user's current login status (authenticated or unauthenticated)
- **Premium_Tier**: Subscription tier offering enhanced features (100 AI questions/day, detailed health score, teleconsult discount, unlimited children)
- **Free_Tier**: Default tier offering real value (20 AI questions/day, basic health tracking, community access, basic PDF export, single child profile)

## Requirements

### Requirement 1: Frictionless Public Content Access

**User Story:** As an anonymous visitor, I want to access all blog content, community discussions, and discover pages freely without interruption, so that I can evaluate the platform's value and build trust before signing up

#### Acceptance Criteria

1. THE Blog_Page SHALL render complete article content without requiring authentication
2. THE Community_Page SHALL display forum groups and posts in read-only mode without requiring authentication
3. THE Community_Page SHALL display Blog_Post content that has been seeded (with `group_id = NULL`) separately from Community_Post content
4. THE Homepage SHALL render all content sections without requiring authentication
5. THE Discover_Page SHALL display all organs and habits content without requiring authentication
6. THE Navigation_System SHALL display all navigation links to unauthenticated users without hiding or disabling any links
7. THE Navigation_System SHALL NOT display modal overlays or blocking prompts on initial page load for any Public_Content

### Requirement 2: Navigation System Completeness

**User Story:** As a user on any page, I want clear navigation options including a working logo link and back navigation, so that I never feel lost or trapped on the platform

#### Acceptance Criteria

1. WHEN a user clicks the SKIDS logo in the Navbar, THE Navigation_System SHALL navigate to the Homepage
2. THE Community_Page SHALL display a back navigation control linking to the Homepage
3. THE Navbar SHALL display consistently across all pages regardless of Authentication_State
4. THE Mobile_Tab_Bar SHALL display consistently on mobile devices across all pages
5. THE Navigation_System SHALL maintain visual indication of the current active page
6. WHEN a user navigates between pages, THE Navigation_System SHALL preserve Authentication_State
7. THE Navigation_System SHALL ensure all navigation links are functional and lead to their intended destinations

### Requirement 3: Dr. SKIDS Chat Value-Based Sign-In

**User Story:** As an unauthenticated user exploring Dr. SKIDS AI, I want to understand the specific value of signing in (personalized answers based on my child's profile), so that I'm motivated to create an account when I see the benefit

#### Acceptance Criteria

1. THE Dr_SKIDS_Chat SHALL be accessible and visible to all users regardless of Authentication_State
2. WHEN an unauthenticated user sends a message in Dr_SKIDS_Chat, THE Dr_SKIDS_Chat SHALL provide a general answer to the question
3. WHEN an unauthenticated user sends a message in Dr_SKIDS_Chat, THE Dr_SKIDS_Chat SHALL display a Sign_In_Prompt explaining that personalized guidance based on child's age and profile requires authentication
4. THE Sign_In_Prompt SHALL emphasize the value benefit (personalized answers) rather than restriction (cannot continue)
5. THE Sign_In_Prompt SHALL provide a clear call-to-action to navigate to the sign-in page
6. THE Dr_SKIDS_Chat SHALL NOT block the chat interface with modal overlays
7. THE Dr_SKIDS_Chat SHALL allow unauthenticated users to ask multiple questions and receive general answers with the Sign_In_Prompt displayed contextually

### Requirement 4: Personalized Feature Access

**User Story:** As a product owner, I want specific personalization features to require authentication, so that we can provide tailored experiences based on user profiles while keeping core content accessible

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access the Timeline_Page, THE Navigation_System SHALL redirect to the sign-in page with redirect parameter
2. WHEN an unauthenticated user attempts to post in Community_Page, THE Community_Page SHALL display a Sign_In_Prompt explaining the value of joining the conversation
3. WHEN an unauthenticated user attempts to react to a community post, THE Community_Page SHALL display a Sign_In_Prompt
4. WHEN an unauthenticated user attempts to access intervention booking, THE Interventions_Page SHALL display a Sign_In_Prompt explaining the value of tracking appointments
5. THE Sign_In_Prompt SHALL emphasize the specific value benefit being unlocked (personalization, tracking, participation) rather than restriction
6. WHEN a user completes authentication, THE Navigation_System SHALL return the user to their intended destination and enable the attempted action

### Requirement 5: Trust-Building Value Demonstration

**User Story:** As an anonymous visitor, I want to understand what the platform offers and see real value in both free and premium tiers, so that I can make an informed decision about signing up and upgrading based on my needs

#### Acceptance Criteria

1. THE Homepage SHALL display free tier features with emphasis on real value provided (20 AI questions per day, health tracking, community access, basic PDF export)
2. THE Homepage SHALL display premium tier benefits explaining the problems they solve (100 AI questions for frequent concerns, detailed health score breakdown for understanding specific areas, teleconsult discount for booking appointments, unlimited children profiles for larger families)
3. THE Homepage SHALL demonstrate value through social proof where available (user testimonials, community activity, success stories)
4. THE Sign_In_Prompt SHALL explain specific value benefits relevant to the context (personalized answers, conversation participation, appointment tracking)
5. THE Navigation_System SHALL avoid aggressive or pushy language in all prompts and value displays
6. THE Homepage SHALL use G4 (Google Analytics 4) and Meta pixel for tracking visitor engagement and conversion funnel progression

### Requirement 6: Natural Premium Upgrade Triggers

**User Story:** As a signed-in free user, I want to discover premium benefits naturally through usage when I hit meaningful limits, so that I can decide if upgrading solves a real problem I'm experiencing

#### Acceptance Criteria

1. WHEN an authenticated user approaches their daily AI question limit, THE Dr_SKIDS_Chat SHALL display remaining question count after each interaction when below 6 questions remaining
2. WHEN an authenticated user reaches their daily AI question limit (20 questions), THE Dr_SKIDS_Chat SHALL display an upgrade prompt explaining that premium offers 100 questions per day for parents with frequent concerns
3. WHEN an authenticated user views their child's health score, THE Health_Score_Display SHALL show a subtle indicator that premium unlocks detailed component breakdown to understand specific areas needing attention
4. WHEN an authenticated user attempts to add a second child profile, THE Profile_System SHALL display an upgrade prompt explaining that premium supports unlimited children for larger families
5. THE upgrade prompts SHALL emphasize the problem being solved (frequent questions, understanding health details, multiple children) rather than just listing features
6. THE upgrade prompts SHALL provide a clear call-to-action to view subscription options without being pushy or aggressive
7. THE Dr_SKIDS_Chat SHALL track usage count per user per day to accurately display remaining questions

### Requirement 7: Premium Value Clarity

**User Story:** As a parent considering premium, I want to understand exactly what problems premium solves and when I would need it, so that I can make an informed decision based on my actual needs

#### Acceptance Criteria

1. THE Homepage SHALL explain premium tier benefits in terms of parent problems: "Have frequent questions? Get 100 AI answers per day", "Want to understand your child's health in detail? Get component score breakdown", "Have multiple children? Track unlimited profiles"
2. THE Homepage SHALL display the free tier as providing real value, not as a crippled experience
3. WHERE a user encounters an upgrade prompt, THE prompt SHALL explain the specific problem premium solves in that context
4. THE Navigation_System SHALL demonstrate premium value through usage patterns (showing what premium users can do) rather than through restrictions (blocking free users)
5. THE Homepage SHALL clarify that teleconsult discount applies to booking appointments with healthcare providers
6. THE Homepage SHALL use G4 and Meta pixel to track which value propositions drive the most conversions

### Requirement 8: Authentication State Management

**User Story:** As a developer, I want consistent authentication state handling across all pages, so that users see appropriate content and prompts without jarring transitions or content flashing

#### Acceptance Criteria

1. THE Navigation_System SHALL detect Authentication_State on page load
2. WHEN Authentication_State changes from unauthenticated to authenticated, THE Navigation_System SHALL update UI elements without requiring page reload
3. THE Homepage SHALL display onboarding hero content emphasizing blog reach and community value for unauthenticated users
4. THE Homepage SHALL display personalized daily content hero for authenticated users
5. THE Navigation_System SHALL cache Authentication_State in browser storage to prevent content flashing on subsequent visits
6. WHEN Authentication_State is cached, THE Navigation_System SHALL verify cached state against authoritative authentication service
7. THE Navigation_System SHALL default to unauthenticated UI during authentication resolution to avoid blocking content display

### Requirement 9: Mobile-Responsive Navigation

**User Story:** As a mobile user, I want navigation that works well on small screens, so that I can easily move between sections

#### Acceptance Criteria

1. THE Mobile_Tab_Bar SHALL display on devices with screen width below 768 pixels
2. THE Navbar SHALL display on devices with screen width at or above 768 pixels
3. THE Mobile_Tab_Bar SHALL provide access to primary navigation destinations
4. THE Navigation_System SHALL ensure touch targets are at least 44 pixels for mobile devices
5. WHEN a user rotates their device, THE Navigation_System SHALL adapt layout appropriately

### Requirement 10: Conversion Funnel Analytics

**User Story:** As a product manager, I want to track user progression through the trust-based conversion funnel using G4 and Meta pixel, so that I can measure blog reach, engagement depth, and conversion rates

#### Acceptance Criteria

1. THE Navigation_System SHALL track blog views, discover page views, and community page views using G4 and Meta pixel
2. THE Navigation_System SHALL track when unauthenticated users encounter Sign_In_Prompt elements (view, not just click)
3. THE Navigation_System SHALL track when users complete authentication (sign-up vs returning user)
4. THE Navigation_System SHALL track when authenticated users view premium upgrade prompts
5. THE Navigation_System SHALL track when users initiate subscription purchase flow
6. THE Navigation_System SHALL preserve UTM parameters and referral codes throughout the user journey
7. THE Navigation_System SHALL track engagement depth metrics (pages viewed, time on site, features explored) to identify high-intent users

### Requirement 11: Seamless Sign-In Flow

**User Story:** As a user prompted to sign in, I want a smooth authentication experience that returns me to what I was doing, so that I don't lose context or get frustrated

#### Acceptance Criteria

1. WHEN a user clicks a Sign_In_Prompt, THE Navigation_System SHALL store the current page URL
2. WHEN a user completes authentication, THE Navigation_System SHALL redirect to the stored URL
3. WHERE a user was attempting to perform an action before sign-in, THE Navigation_System SHALL enable that action after authentication without requiring repetition
4. THE Navigation_System SHALL preserve form input data across the authentication flow where applicable
5. WHEN authentication fails, THE Navigation_System SHALL display error messages and allow retry without losing context

### Requirement 12: Community Trust-Building Through Read Access

**User Story:** As an anonymous visitor, I want to browse community discussions freely to see that the community is active and valuable, so that I can build trust in the platform and decide if joining is worthwhile

#### Acceptance Criteria

1. THE Community_Page SHALL display all forum groups with accurate post counts to unauthenticated users
2. WHEN an unauthenticated user clicks a forum group, THE Community_Page SHALL display Community_Post content in read-only mode
3. THE Community_Page SHALL distinguish between Blog_Post content (seeded with `group_id = NULL`) and Community_Post content (with specific `group_id`)
4. THE Community_Page SHALL hide post creation controls from unauthenticated users
5. THE Community_Page SHALL hide reaction controls from unauthenticated users
6. WHEN an unauthenticated user scrolls through community posts, THE Community_Page SHALL display a subtle Sign_In_Prompt after viewing 3 posts
7. THE Sign_In_Prompt SHALL emphasize the value of joining the conversation and sharing experiences rather than restriction

### Requirement 13: Progressive Value Discovery

**User Story:** As a new visitor, I want to discover features and value gradually without being overwhelmed or interrupted, so that I can understand the platform's benefits at my own pace and build trust naturally

#### Acceptance Criteria

1. THE Homepage SHALL display primary value propositions in order of importance: blog content (SEO-optimized for reach), organ focus, habit tracker, Dr. SKIDS chat
2. THE Homepage SHALL reveal detailed feature explanations through progressive disclosure patterns (expand sections, hover states, scroll-triggered animations)
3. THE Navigation_System SHALL NOT display modal overlays or blocking prompts on initial page load for any page
4. WHERE a user explores multiple features, THE Navigation_System SHALL display Sign_In_Prompt elements with contextual relevance to the feature being explored
5. THE Navigation_System SHALL limit Sign_In_Prompt frequency to once per session per feature to avoid annoyance and maintain trust
6. THE Navigation_System SHALL prioritize demonstrating value over prompting for sign-in throughout the user journey

### Requirement 14: Blog SEO Optimization for Maximum Reach

**User Story:** As a product owner, I want blog content to be fully optimized for search engines and social sharing, so that we can reach millions of visitors and build trust at scale

#### Acceptance Criteria

1. THE Blog_Page SHALL be fully public with no authentication requirements or paywalls
2. THE Blog_Page SHALL include complete meta tags for SEO (title, description, keywords, canonical URL)
3. THE Blog_Page SHALL include Open Graph tags for social media sharing (og:title, og:description, og:image, og:url)
4. THE Blog_Page SHALL include Twitter Card tags for Twitter sharing
5. THE Blog_Page SHALL use semantic HTML structure (article, header, section tags) for search engine crawling
6. THE Blog_Page SHALL load content server-side (not client-side) to ensure search engines can index full content
7. THE Blog_Page SHALL include structured data markup (JSON-LD) for rich search results where applicable

### Requirement 15: Performance and Loading States

**User Story:** As a user on a slow connection, I want the site to load quickly and show me content immediately, so that I don't abandon the page

#### Acceptance Criteria

1. THE Homepage SHALL display static content within 2 seconds on 3G connections
2. THE Navigation_System SHALL render navigation controls before authentication state is determined
3. WHEN authentication state is being determined, THE Navigation_System SHALL display default unauthenticated UI
4. THE Blog_Page SHALL prioritize article content loading over interactive features
5. THE Navigation_System SHALL use optimistic UI updates when changing Authentication_State

### Requirement 16: Accessibility and Keyboard Navigation

**User Story:** As a user relying on keyboard navigation or screen readers, I want all navigation and prompts to be accessible, so that I can use the platform effectively

#### Acceptance Criteria

1. THE Navigation_System SHALL support keyboard navigation using Tab, Enter, and Escape keys
2. THE Sign_In_Prompt SHALL include appropriate ARIA labels and roles
3. THE Navigation_System SHALL maintain logical focus order through all interactive elements
4. THE Navbar SHALL indicate current page to screen readers
5. WHEN a modal or prompt appears, THE Navigation_System SHALL move focus to the prompt and trap focus within it until dismissed

### Requirement 17: Error Handling and Fallbacks

**User Story:** As a user experiencing network issues or errors, I want graceful error handling that lets me continue using available features, so that temporary problems don't block my entire experience

#### Acceptance Criteria

1. WHEN authentication service is unavailable, THE Navigation_System SHALL default to unauthenticated UI
2. WHEN blog content fails to load, THE Homepage SHALL display a fallback message with retry option
3. WHEN community groups fail to load, THE Community_Page SHALL display an error message with retry option
4. THE Dr_SKIDS_Chat SHALL display connection error messages when API requests fail
5. THE Navigation_System SHALL log client-side errors for debugging without exposing technical details to users
