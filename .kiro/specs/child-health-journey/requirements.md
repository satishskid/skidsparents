# Requirements Document

## Introduction

The Child Health Journey feature closes the end-to-end loop in the SKIDS Parent app: from the moment a parent registers a child, through guided health history intake via Dr. SKIDS, to an always-accessible observation journal with direct chat escalation. It also fixes a critical mobile UX bug that hides the Dr. SKIDS chat widget on all mobile devices — the primary platform for Indian parents.

## Glossary

- **System**: The SKIDS Parent PWA (parent.skids.clinic)
- **Milestone_Seeder**: The server-side logic that inserts age-appropriate milestone records into the database when a child is created
- **Dr_SKIDS**: The AI health companion chatbot powered by Cloudflare Workers AI
- **Onboarding_Chat**: A special chat mode triggered after new child registration that guides the parent through capturing medical history
- **Observation_Journal**: The parent-facing UI for logging health observations, incidents, and milestones
- **Chat_Widget**: The floating Dr. SKIDS button and panel rendered in `ChatWidget.tsx`
- **Child_Dashboard**: The 5-tab PHR view in `ChildDashboard.tsx`
- **History_Intake**: Structured medical history data (birth complications, allergies, past illnesses, developmental concerns) extracted from Onboarding_Chat
- **Parent**: An authenticated user of the SKIDS Parent app
- **Child**: A child profile linked to a Parent, aged 0–16 years

## Requirements

### Requirement 1: Milestone Auto-Seeding on Child Registration

**User Story:** As a parent, I want my child's milestone wall to be pre-populated with age-appropriate milestones when I register my child, so that I can immediately start tracking development without manual setup.

#### Acceptance Criteria

1. WHEN a Parent successfully creates a child via `POST /api/children`, THE Milestone_Seeder SHALL insert all milestones returned by `getMilestonesForAge(ageMonths)` into the `milestones` table for that child with status `not_started`.
2. WHEN the Milestone_Seeder inserts milestones, THE Milestone_Seeder SHALL set each record's `key`, `title`, `category`, `expected_age_min`, `expected_age_max`, and `child_id` fields from the `MilestoneDefinition` content library.
3. IF a milestone with the same `key` and `child_id` already exists, THEN THE Milestone_Seeder SHALL skip that milestone without returning an error (idempotent seeding).
4. WHEN milestone seeding fails due to a database error, THE System SHALL still return a successful `201` response for the child creation and SHALL log the seeding error server-side.
5. THE System SHALL complete milestone seeding within the same request lifecycle as child creation, before returning the `201` response to the client.

### Requirement 2: Mobile Chat Widget Visibility Fix

**User Story:** As a parent using a mobile phone, I want to access Dr. SKIDS from any screen in the app, so that I can get health guidance without navigating to a separate page.

#### Acceptance Criteria

1. THE Chat_Widget floating button SHALL be visible on all screen sizes, including mobile viewports below the `md` breakpoint (768px).
2. WHEN the Chat_Widget is opened on a mobile viewport, THE Chat_Widget SHALL render as a full-width bottom sheet occupying at least 70% of the viewport height.
3. WHEN the Chat_Widget is opened on a desktop viewport (≥768px), THE Chat_Widget SHALL render as a fixed-position panel in the bottom-right corner, preserving existing desktop behavior.
4. THE Chat_Widget floating button SHALL remain accessible above other fixed UI elements (bottom navigation bars, tab bars) using a z-index that ensures it is not obscured.

### Requirement 3: Dr. SKIDS Onboarding Chat Mode

**User Story:** As a parent who just registered a child, I want Dr. SKIDS to guide me through capturing my child's medical history, so that the health record is complete from day one.

#### Acceptance Criteria

1. WHEN a Parent completes child registration, THE System SHALL display an Onboarding_Chat prompt inviting the parent to share the child's health history with Dr. SKIDS.
2. WHEN the Onboarding_Chat is initiated, THE System SHALL pass a `mode: 'onboarding'` parameter and the new `childId` to the `POST /api/chat` endpoint.
3. WHEN `POST /api/chat` receives `mode: 'onboarding'`, THE System SHALL use a history-intake system prompt that asks the parent sequentially about: birth complications, significant past illnesses, known allergies, and developmental concerns.
4. WHEN Dr_SKIDS receives a parent's response during Onboarding_Chat, THE System SHALL extract any structured health data mentioned and save it as a `parent_observation` record with `category: 'Health'` for that child.
5. WHEN the Onboarding_Chat history intake is complete (parent indicates no more to add or after 4 topic areas are covered), THE System SHALL transition to the standard Dr_SKIDS chat mode for that child.
6. IF a child already has existing `parent_observations` records, THEN THE System SHALL skip the Onboarding_Chat prompt and open the standard chat instead.

### Requirement 4: "Ask Dr. SKIDS" Integration in Observation Journal

**User Story:** As a parent logging an observation, I want to escalate directly to Dr. SKIDS from the observation entry, so that I can get immediate guidance on anything I've noticed.

#### Acceptance Criteria

1. WHEN a Parent saves an observation with `concern_level` of `mild`, `moderate`, or `serious`, THE Observation_Journal SHALL display an "Ask Dr. SKIDS" button below that observation entry.
2. WHEN a Parent taps the "Ask Dr. SKIDS" button on an observation, THE System SHALL open the Chat_Widget pre-populated with a message referencing the observation text.
3. WHEN the Chat_Widget is opened from an observation, THE System SHALL pass the `childId` associated with that observation to the chat so Dr_SKIDS has full child context.
4. THE Observation_Journal SHALL display an "Ask Dr. SKIDS" button on the empty-state screen when no observations exist, to encourage parents to start a conversation.
5. WHEN a Parent taps "Ask Dr. SKIDS" from the empty-state screen, THE System SHALL open the Chat_Widget with a prompt suggesting the parent describe their child's current health status.

### Requirement 5: Enhanced Chat Context (Vaccination + Growth Data)

**User Story:** As a parent chatting with Dr. SKIDS, I want the AI to be aware of my child's vaccination history and growth measurements, so that its guidance is fully personalized.

#### Acceptance Criteria

1. WHEN `POST /api/chat` builds the system prompt for a child, THE System SHALL query the `vaccination_records` table and include the last 5 vaccination records in the `ChatContext`.
2. WHEN `POST /api/chat` builds the system prompt for a child, THE System SHALL query the `growth_records` table and include the most recent height and weight measurements in the `ChatContext`.
3. WHEN vaccination or growth data is unavailable for a child, THE System SHALL build the system prompt without those fields and SHALL NOT return an error.
4. THE `buildSystemPrompt` function in `src/lib/ai/prompt.ts` SHALL accept optional `vaccinationHistory` and `latestGrowth` fields in the `ChatContext` interface and include them in the rendered prompt when present.

### Requirement 6: Child Dashboard Mobile Tab Navigation

**User Story:** As a parent on a mobile phone, I want the child dashboard tabs to be easy to tap and read, so that I can navigate between health sections without frustration.

#### Acceptance Criteria

1. THE Child_Dashboard tab bar SHALL render all 5 tabs without horizontal overflow or text truncation on viewports of 320px width and above.
2. WHEN the Child_Dashboard is rendered on a mobile viewport below 768px, THE System SHALL display tab labels as icon-only or abbreviated (≤6 characters) to prevent cramping.
3. THE Child_Dashboard SHALL display a persistent "Ask Dr. SKIDS" floating action button above the bottom safe area on mobile viewports, linking to the Chat_Widget with the current `childId` pre-selected.
4. WHEN a Parent taps the "Ask Dr. SKIDS" floating action button on the Child_Dashboard, THE System SHALL open the Chat_Widget with the current child's context pre-loaded.
