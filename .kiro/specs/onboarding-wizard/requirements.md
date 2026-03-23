# Requirements Document

## Introduction

The Onboarding Wizard is a 3-step guided flow that appears immediately after a new parent signs up on SKIDS Parent (`parent.skids.clinic`). Its purpose is to reduce post-signup drop-off by guiding parents through three high-value first actions: adding their child's profile, logging a developmental milestone, and logging a daily H.A.B.I.T.S. entry. The wizard renders as a full-screen overlay on mobile and desktop, uses smooth animated transitions, and celebrates completion before redirecting to the dashboard. Once completed (or explicitly dismissed after step 1), the wizard never appears again for that parent.

---

## Glossary

- **Wizard**: The full-screen onboarding overlay component (`OnboardingWizard`)
- **Parent**: An authenticated user of SKIDS Parent with a record in the `parents` table
- **Child**: A child profile record in the `children` table linked to a Parent
- **Session_Endpoint**: `POST /api/auth/session` — returns `{ parentId, isNew }` after Firebase login
- **Children_API**: `GET /api/children` — returns the list of children for the authenticated Parent
- **Milestone**: A developmental milestone record in the `milestones` table with status `not_started | in_progress | achieved | delayed`
- **Habit_Log**: A daily H.A.B.I.T.S. entry in the `habits_log` table
- **HABITS**: The six health habit categories: Healthy Eating, Active Movement, Balanced Stress, Inner Coaching, Timekeepers, Sufficient Sleep
- **Completion_Flag**: A persisted marker (`onboarding_completed = true`) stored in the `parents` table indicating the Wizard has been finished
- **Step_Indicator**: The visual progress bar or dot-stepper showing current step (1 of 3, 2 of 3, 3 of 3)
- **Celebration_Screen**: The animated success state shown after step 3 is submitted or skipped
- **IAP**: Indian Academy of Pediatrics — the vaccination schedule reference used by the platform
- **Age_Months**: A child's age expressed in whole months, computed from `dob` to the current date

---

## Requirements

### Requirement 1: Wizard Trigger Logic

**User Story:** As a new parent, I want the onboarding wizard to appear automatically after I sign up, so that I am guided to set up my account without having to find the right screens myself.

#### Acceptance Criteria

1. WHEN the Session_Endpoint returns `isNew = true`, THE Wizard SHALL render automatically on the next page load without requiring any user action.
2. WHEN the Session_Endpoint returns `isNew = false` AND the Children_API returns an empty array AND the Parent's `onboarding_completed` flag is `false`, THE Wizard SHALL render automatically.
3. WHEN the Parent's `onboarding_completed` flag is `true`, THE Wizard SHALL NOT render, regardless of the value of `isNew` or the number of children.
4. THE Wizard SHALL evaluate trigger conditions client-side after the Firebase auth token is available, using the existing `Bearer` token pattern.
5. WHEN the Wizard trigger conditions are being evaluated, THE Wizard SHALL display a loading skeleton for no more than 2 seconds before either rendering or suppressing itself.
6. IF the Children_API or Session_Endpoint returns an error during trigger evaluation, THEN THE Wizard SHALL suppress itself and allow the parent to reach the dashboard normally.

---

### Requirement 2: Wizard Shell and Navigation

**User Story:** As a parent, I want a clear, focused full-screen experience with visible progress, so that I always know where I am in the setup process and can move forward confidently.

#### Acceptance Criteria

1. THE Wizard SHALL render as a full-screen overlay with a minimum z-index that places it above all dashboard content, navigation bars, and notification bells.
2. THE Wizard SHALL display a Step_Indicator showing the current step number and total steps (3) at all times during steps 1 through 3.
3. WHEN a parent completes the required input for the current step, THE Wizard SHALL enable a primary "Continue" or "Done" call-to-action button for that step.
4. WHEN a parent taps the primary action button on step 1, THE Wizard SHALL validate the child form and, if valid, persist the child record before advancing to step 2.
5. WHEN a parent taps the primary action button on steps 2 or 3, THE Wizard SHALL persist the selected data and advance to the Celebration_Screen.
6. THE Wizard SHALL support a "Skip" action on steps 2 and 3 that advances to the next step without persisting any data for that step.
7. THE Wizard SHALL NOT display a "Skip" action on step 1.
8. THE Wizard SHALL NOT display a back-navigation button; the flow is strictly forward.
9. WHEN transitioning between steps, THE Wizard SHALL animate the transition using a horizontal slide or fade with a duration between 250ms and 400ms.
10. THE Wizard SHALL be dismissible via a close (×) icon only after step 1 has been successfully completed, and dismissal SHALL trigger the same Completion_Flag persistence as full completion.
11. WHILE the Wizard is open, THE Wizard SHALL prevent scroll on the underlying dashboard page.

---

### Requirement 3: Step 1 — Add Child Profile

**User Story:** As a new parent, I want to add my child's basic profile in a simple, friendly form, so that the platform can personalise health tracking for my child.

#### Acceptance Criteria

1. THE Wizard SHALL display a child name input field that accepts a minimum of 1 character and a maximum of 50 characters.
2. THE Wizard SHALL display a date-of-birth picker that accepts dates from the current date minus 16 years to the current date (inclusive), representing children aged 0–16 years.
3. THE Wizard SHALL display a gender selector with three options — Boy, Girl, Other — each accompanied by a friendly icon or emoji.
4. WHEN a parent submits step 1, THE Wizard SHALL send a `POST /api/children` request with `name`, `dob`, and `gender` fields.
5. WHEN the `POST /api/children` request succeeds, THE Wizard SHALL store the returned `childId` in component state for use in steps 2 and 3.
6. IF the child name field is empty when the parent taps "Continue", THEN THE Wizard SHALL display an inline validation message "Please enter your child's name" without submitting the form.
7. IF the date-of-birth field is empty when the parent taps "Continue", THEN THE Wizard SHALL display an inline validation message "Please enter your child's date of birth" without submitting the form.
8. IF the `POST /api/children` request fails, THEN THE Wizard SHALL display an inline error message and SHALL NOT advance to step 2.
9. WHILE the `POST /api/children` request is in flight, THE Wizard SHALL disable the "Continue" button and display a loading indicator.
10. THE Wizard SHALL display placeholder copy using Indian child names (e.g., "e.g. Arjun, Priya") in the name input field.
11. THE date-of-birth picker SHALL be optimised for mobile touch interaction, using a native date input on mobile browsers and a custom calendar widget on desktop.

---

### Requirement 4: Step 2 — Log First Milestone

**User Story:** As a parent, I want to see milestone suggestions relevant to my child's age and mark one, so that I can start tracking my child's development immediately.

#### Acceptance Criteria

1. WHEN step 2 renders, THE Wizard SHALL call `getMilestonesForAge(ageMonths)` using the child's computed Age_Months to retrieve age-appropriate milestone suggestions.
2. THE Wizard SHALL display between 3 and 6 milestone suggestions, prioritising milestones where `expectedAgeMin <= ageMonths <= expectedAgeMax`.
3. WHEN a parent taps a milestone card, THE Wizard SHALL display two selection options: "Achieved ✓" and "In Progress →".
4. WHEN a parent selects "Achieved" for a milestone, THE Wizard SHALL send a `PATCH /api/milestones/{id}` request with `status: "achieved"` and `observedAt` set to the current ISO date.
5. WHEN a parent selects "In Progress" for a milestone, THE Wizard SHALL send a `PATCH /api/milestones/{id}` request with `status: "in_progress"`.
6. THE Wizard SHALL display each milestone card with its `title`, `category` label, and the category emoji defined in `MILESTONE_CATEGORIES`.
7. WHEN a parent taps "Skip" on step 2, THE Wizard SHALL advance to step 3 without making any API call.
8. IF the milestone update API call fails, THEN THE Wizard SHALL display a non-blocking toast error and SHALL still advance to step 3 so the parent is not blocked.
9. THE Wizard SHALL display a brief contextual message above the milestone list that references the child's name and age, e.g., "Here are some milestones for Arjun at 14 months."

---

### Requirement 5: Step 3 — Log First Habit

**User Story:** As a parent, I want to log a H.A.B.I.T.S. entry for today in a single tap, so that I can start building a healthy routine tracking habit from day one.

#### Acceptance Criteria

1. THE Wizard SHALL display all 6 HABITS categories as tappable cards, each showing the habit `emoji`, `name`, and `tagline` from the `HABITS` content definition.
2. WHEN a parent taps a habit card, THE Wizard SHALL visually highlight the selected card with the habit's brand colour and display a "Log for Today" confirmation button.
3. WHEN a parent taps "Log for Today", THE Wizard SHALL send a `POST /api/habits` request with `childId`, `date` (today's ISO date), `habitType` (the selected habit `key`), and a default `valueJson` of `{}`.
4. WHEN the habit log API call succeeds, THE Wizard SHALL advance to the Celebration_Screen.
5. WHEN a parent taps "Skip" on step 3, THE Wizard SHALL advance to the Celebration_Screen without making any API call.
6. IF the habit log API call fails, THEN THE Wizard SHALL display a non-blocking toast error and SHALL still advance to the Celebration_Screen so the parent is not blocked.
7. THE Wizard SHALL display a brief contextual message above the habit grid, e.g., "Pick one healthy habit to log for [child name] today."
8. WHILE a habit card is selected, THE Wizard SHALL display the habit's `tip` text below the grid as a motivational nudge.

---

### Requirement 6: Completion and Celebration

**User Story:** As a parent, I want a satisfying completion moment after finishing the wizard, so that I feel rewarded for setting up my child's profile and motivated to return.

#### Acceptance Criteria

1. WHEN the Celebration_Screen renders, THE Wizard SHALL display an animated success state — either a CSS/Lottie confetti burst or a pulsing checkmark animation — lasting between 1.5 and 3 seconds.
2. THE Celebration_Screen SHALL display the child's name in the success message, e.g., "You're all set for Arjun! 🎉".
3. WHEN the Celebration_Screen renders, THE Wizard SHALL send a `PATCH /api/parents/me` request to set `onboarding_completed = true` on the Parent record.
4. WHEN the `PATCH /api/parents/me` request succeeds, THE Wizard SHALL automatically redirect the parent to `/dashboard` after the celebration animation completes.
5. IF the `PATCH /api/parents/me` request fails, THEN THE Wizard SHALL still redirect to `/dashboard` after the animation, and SHALL retry the flag update once in the background.
6. THE Celebration_Screen SHALL display a summary of what was set up: the child's name, and (if not skipped) the milestone and habit that were logged.
7. WHEN the Celebration_Screen is visible, THE Wizard SHALL NOT display the Step_Indicator or any navigation buttons.

---

### Requirement 7: Completion State Persistence

**User Story:** As a returning parent, I want the wizard to never appear again after I've completed it, so that I am not interrupted every time I log in.

#### Acceptance Criteria

1. THE `parents` table SHALL include an `onboarding_completed` boolean column (default `false`) to persist the completion state.
2. WHEN the Wizard sets `onboarding_completed = true` via `PATCH /api/parents/me`, THE Session_Endpoint SHALL return this flag on subsequent logins.
3. THE Wizard SHALL read the `onboarding_completed` flag from the session response before deciding whether to render.
4. WHEN `onboarding_completed = true`, THE Wizard SHALL not render even if `isNew = true` is returned (e.g., after a token refresh).
5. THE Wizard SHALL also persist the completion flag to `localStorage` under the key `skids_onboarding_complete` as a client-side fallback to prevent flash-of-wizard on fast subsequent loads.
6. WHEN `localStorage` contains `skids_onboarding_complete = "true"`, THE Wizard SHALL suppress itself immediately without waiting for the API response.

---

### Requirement 8: Mobile Responsiveness

**User Story:** As a parent on a mobile phone, I want the wizard to feel native and comfortable on my screen, so that I can complete setup without pinching, zooming, or struggling with small touch targets.

#### Acceptance Criteria

1. THE Wizard SHALL occupy 100% of the viewport width and height on screens narrower than 768px.
2. THE Wizard SHALL render as a centred modal with a maximum width of 480px and rounded corners on screens 768px and wider.
3. ALL interactive elements within the Wizard (buttons, cards, inputs) SHALL have a minimum touch target size of 44×44px.
4. THE date-of-birth input SHALL use `type="date"` on mobile to invoke the native OS date picker.
5. THE Wizard SHALL not require horizontal scrolling on any screen width from 320px to 428px.
6. THE Wizard SHALL use the SKIDS brand font sizes: minimum 14px for body text, minimum 16px for input fields (to prevent iOS auto-zoom on focus).
7. THE habit and milestone card grids SHALL reflow to a single-column layout on screens narrower than 400px and a two-column layout on screens 400px and wider.
8. WHEN the soft keyboard opens on mobile, THE Wizard SHALL scroll the active input into view and SHALL NOT be obscured by the keyboard.

---

### Requirement 9: Accessibility

**User Story:** As a parent using assistive technology, I want the wizard to be navigable and understandable, so that I can complete onboarding regardless of how I interact with my device.

#### Acceptance Criteria

1. THE Wizard SHALL trap keyboard focus within the overlay while it is open, preventing focus from reaching background content.
2. WHEN the Wizard opens, THE Wizard SHALL move focus to the first interactive element of step 1.
3. THE Wizard SHALL be fully navigable using the Tab and Shift+Tab keys to move between interactive elements.
4. ALL icon-only buttons (close ×, gender icons) SHALL have an `aria-label` attribute describing their action.
5. THE Step_Indicator SHALL include an `aria-label` such as "Step 2 of 3" for screen reader announcement.
6. WHEN a validation error is displayed, THE Wizard SHALL associate the error message with its input field using `aria-describedby`.
7. WHEN the Wizard advances to a new step, THE Wizard SHALL announce the new step heading to screen readers using an `aria-live` region or by moving focus to the step heading.
8. THE Celebration_Screen animation SHALL respect the `prefers-reduced-motion` media query — WHEN `prefers-reduced-motion: reduce` is set, THE Wizard SHALL display a static success icon instead of the animated confetti.
9. ALL colour combinations used in the Wizard SHALL maintain a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text against their backgrounds.
10. THE Wizard overlay SHALL have `role="dialog"` and `aria-modal="true"` set on the root container element.

---

### Requirement 10: Analytics and Observability

**User Story:** As a product team member, I want to track wizard funnel metrics, so that I can identify where parents drop off and improve the onboarding experience over time.

#### Acceptance Criteria

1. WHEN the Wizard renders for the first time, THE Wizard SHALL fire an analytics event `onboarding_wizard_started` with properties `{ parentId, trigger: "new_user" | "no_children" }`.
2. WHEN a parent advances from step 1 to step 2, THE Wizard SHALL fire an analytics event `onboarding_step_completed` with properties `{ step: 1, childId }`.
3. WHEN a parent skips step 2 or step 3, THE Wizard SHALL fire an analytics event `onboarding_step_skipped` with properties `{ step: 2 | 3 }`.
4. WHEN the Celebration_Screen renders, THE Wizard SHALL fire an analytics event `onboarding_wizard_completed` with properties `{ childId, milestoneLogged: boolean, habitLogged: boolean }`.
5. THE Wizard SHALL use the existing `contentEngagement` analytics pattern already present in the codebase, routing events through the GA4 integration.
