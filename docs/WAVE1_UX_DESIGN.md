# Wave 1 UX Redesign — Design Philosophy & UAT Guide

## Design Philosophy

### Core Principle: "One child, one focus, one action"

SKIDS is not a dashboard full of charts. It's a **companion** — a calm, warm presence that helps parents notice things and connects them to their pediatrician when it matters.

### Parent Experience

**The metaphor: Guided journal, not medical app.**

The parent opens the app and sees their child — not a dashboard. The screen asks one question: *"How is Aarav today?"* Everything flows from that single interaction.

#### Design Rules

1. **Observation-first, never diagnosis.** We ask "what did you notice?" — never "what diagnosis are you worried about?" The system is a mirror that helps parents articulate what they see.

2. **Progressive disclosure.** Free text first. The system never demands structured input upfront. After text, it may gently guide with 1-2 follow-ups. The depth reveals itself naturally.

3. **Condition-agnostic education.** The parent summary never names conditions or shows probabilities. It educates about developmental signs in warm, conversational language. "Children develop at different paces" — not "suspected speech delay."

4. **Always end with an action.** Every observation results in concrete next steps: activities to try, things to watch for, or a care pathway (doctor review, tele, visit). Never leave a parent in anxiety without a path forward.

5. **Safety is structural, not decorative.** Red-flag gates are hard stops. If the engine detects emergency indicators, the pathway escalation is automatic — not a suggestion the parent can dismiss.

6. **The care loop is visible.** Parents can see that their doctor received the observation, is reviewing it, or has responded. "Your pediatrician is reviewing this" — visible, reassuring, never a black box.

### Doctor Experience

**The metaphor: Clinical WhatsApp.**

Indian pediatricians already manage patient communication through WhatsApp. SKIDS gives them the same interaction pattern — but with intelligence underneath.

#### Design Rules

1. **Thread-first, not dashboard-first.** The default view is an inbox of patient threads, sorted by urgency. Emergency at top, info at bottom. Unread bold. One tap to enter a patient's thread.

2. **Chat-like interaction.** Care episodes appear as conversation bubbles. Parent's observation on the left (received). Doctor's response on the right (sent). Clinical projections are collapsible — available when needed, not cluttering the view.

3. **Three-tap resolution.** Most care episodes should resolve in: tap thread → read → tap Reply/Dismiss. No extra screens, no forms, no page navigations.

4. **Clinical depth on demand.** Projections, probabilities, ICD codes, exam points — all available but collapsed by default. The doctor chooses when to dive deep. The surface layer is: what did the parent see, and what should I do?

5. **The twin record.** Every episode has two lenses. The doctor sees what the parent was shown (parent interaction record) alongside the clinical projections. Full transparency — no hidden information.

### Interaction Design Policy

- **Warm language.** "Share" not "Submit." "Looking at Aarav's record" not "Analyzing symptoms." "Keep an eye on" not "Monitor for."
- **Empathetic processing.** Bouncing dots and "Looking at [child]'s record..." — never "Processing" or "Analyzing."
- **No clinical jargon in parent view.** Zero ICD codes, zero probability numbers, zero "differential diagnosis" language.
- **Time-of-day awareness.** "Good morning" / "Good afternoon" / "Good evening" — the app knows when you're using it.
- **Rotating prompts.** The observation input cycles through gentle suggestions: "noticed something about sleep," "eating less than usual," "seems fussy today" — normalizing the act of sharing observations.

---

## UAT Guide — Wave 1 Testing

### Prerequisites

- Dev server running (`bun run dev` or deployed preview)
- Test parent account (Firebase auth)
- Test doctor account (with linked patients)
- At least one child registered

### Test Matrix

#### 1. Parent Home Screen (`/home/{childId}`)

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 1.1 | Page loads for authenticated parent | Login, navigate to `/home/{childId}` | Child identity card shows with name, age, greeting | |
| 1.2 | Time-of-day greeting | Check greeting text | Shows "Good morning" / "Good afternoon" / "Good evening" based on current time | |
| 1.3 | Loading skeleton | Load page (slow network or first load) | 3 shimmer cards visible during auth/data load (white, green-tint, white) | |
| 1.4 | Unauthenticated redirect | Open page without login | Shows "Please sign in to continue" with Sign In link | |
| 1.5 | Child not found | Navigate to `/home/nonexistent-id` | Shows "Child not found" with back link | |
| 1.6 | Active care episodes indicator | Have 1+ active (unresolved) care episodes | Green pulse badge: "X active care episodes" below child card | |
| 1.7 | Daily focus card | Have daily insights generated for child | Green gradient card with "Today's focus" label, title, and body | |
| 1.8 | No daily focus | No insights available | Daily focus section hidden (no empty state) | |
| 1.9 | Quick access grid | Scroll to bottom | 4-tile grid: Growth, Milestones, Vaccines, Records — all link to `/child/{id}` | |
| 1.10 | SKIDS Guide FAB | View on mobile viewport | Green floating button "Ask SKIDS" visible at bottom-right | |
| 1.11 | SKIDS Guide FAB desktop | View on desktop viewport | FAB hidden (`md:hidden`) | |
| 1.12 | Full record link | Tap records icon in child card header | Navigates to `/child/{childId}` (full ChildDashboard) | |

#### 2. Observation Capture (embedded in Parent Home)

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 2.1 | Invite state | Load parent home | Shows "How is {firstName} today?" with SKIDS avatar and empty textarea | |
| 2.2 | Rotating placeholders | Wait 4+ seconds without typing | Placeholder text cycles through suggestions ("noticed something about sleep", etc.) | |
| 2.3 | Typing transition | Start typing in textarea | Phase transitions from "invite" to "writing" | |
| 2.4 | Auto-resize textarea | Type multiple lines | Textarea grows up to 160px max | |
| 2.5 | Clear text returns to invite | Delete all text | Phase returns to "invite" with rotating placeholders | |
| 2.6 | Share button disabled when empty | No text entered | "Share" button is gray and disabled | |
| 2.7 | Share button active with text | Type any text | "Share" button turns green, clickable | |
| 2.8 | Submit observation | Type observation and tap Share | Phase transitions to "submitting" — shows bouncing dots + "Looking at {child}'s record..." | |
| 2.9 | Result: home monitoring | Submit mild observation | Shows SKIDS summary + green "Keep watching at home" pathway card + activities + watch-for items | |
| 2.10 | Result: doctor review | Submit concerning observation | Shows "Your doctor will review this" pathway card in blue | |
| 2.11 | Result: emergency pathway | Submit emergency-level observation | Shows "Please visit your pediatrician" in red/orange with urgent styling | |
| 2.12 | Result: activities card | Observation returns activities | Green card with "What you can do" header and bulleted activity list | |
| 2.13 | Result: watch-for card | Observation returns watchFor items | Amber card with "Keep an eye on" header and bulleted list | |
| 2.14 | Result: escalation card | Observation returns escalateIf items | Red card with "Visit your doctor if" header and bulleted list | |
| 2.15 | Share something else | After result, tap "Share something else" | Resets to invite state, textarea cleared | |
| 2.16 | Timeline refresh | After observation saved | Recent activity section updates with new episode | |
| 2.17 | Network error | Disable network, tap Share | Shows error message, returns to writing state | |
| 2.18 | Photo button | Tap camera icon | No crash (placeholder — future feature) | |

#### 3. Recent Activity Timeline (embedded in Parent Home)

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 3.1 | Episodes display | Have 1+ care episodes | "Recent activity" section with episode cards | |
| 3.2 | Episode card collapsed | View episode card | Shows observation text (2-line clamp), time ago, status badge, pathway text | |
| 3.3 | Episode card expanded | Tap episode card | Expands to show SKIDS Guide summary and/or doctor response | |
| 3.4 | Doctor response visible | Episode has doctor response | Blue card with "Your pediatrician" badge and response text | |
| 3.5 | Awaiting review state | Episode status = awaiting_ped, no response | Amber card with spinner: "Your pediatrician is reviewing this" | |
| 3.6 | Resolved styling | Episode status = resolved | Muted colors, gray status dot, "Resolved" badge | |
| 3.7 | Show more / less | Have 5+ episodes | "Show X more" link visible; toggles to show all/collapse | |
| 3.8 | Urgency dot colors | Episodes with different alert levels | Red (emergency), orange (urgent), amber (review), blue (info) dots | |
| 3.9 | Collapse on re-tap | Tap expanded episode again | Collapses back to summary | |

#### 4. Doctor Inbox (`/doctor/dashboard` → Inbox tab)

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 4.1 | Default tab is Inbox | Login as doctor, open dashboard | Inbox tab is selected by default (was "patients" before) | |
| 4.2 | Three tabs visible | View tab bar | "Inbox", "Patients", "Queue" tabs with toggle styling | |
| 4.3 | Thread list renders | Have active care episodes | WhatsApp-style thread rows, one per child | |
| 4.4 | Thread grouping | Multiple episodes for same child | Grouped into single thread row with count badge | |
| 4.5 | Urgency sorting | Episodes with different alert levels | Emergency threads at top, then urgent, review, info | |
| 4.6 | Unread styling | Episode without doctor response | Child name is bold, observation text is dark, time is green | |
| 4.7 | Read styling | Episode with doctor response | Child name is medium weight, observation text is gray | |
| 4.8 | Avatar with urgency dot | View thread row | Child initial in blue circle + colored urgency dot (bottom-right) | |
| 4.9 | Count badge | Thread with 3 unresolved episodes | Badge shows "3" with urgency-colored background | |
| 4.10 | Summary header counts | Have emergency + urgent episodes | Red and orange count badges in header next to "X active" text | |
| 4.11 | Search filter | Type child name in search | Thread list filters in real-time | |
| 4.12 | Search by parent name | Type parent name in search | Thread list filters by parent name | |
| 4.13 | Empty state | No active episodes | Green checkmark with "All caught up" message | |
| 4.14 | Tap thread opens detail | Tap any thread row | Navigates to PatientThread view for that child | |
| 4.15 | Back from thread refreshes | Open thread → back | Inbox refreshes data (catches any actions taken in thread) | |
| 4.16 | Search hidden for < 4 threads | Have 1-3 threads | Search bar not shown | |

#### 5. Patient Thread (`/doctor/dashboard` → Inbox → tap thread)

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 5.1 | Thread header | Open any patient thread | Shows back arrow, child avatar, name, age, parent name, Console link | |
| 5.2 | Chronological order | Multiple episodes | Oldest at top, newest at bottom (chat-like) | |
| 5.3 | Date separators | Episodes on different days | "Today", "Yesterday", or date labels between groups | |
| 5.4 | Parent observation bubble | View episode | Left-aligned white bubble with alert badge, pathway label, text, time, parent name | |
| 5.5 | Doctor response bubble | Episode with response | Right-aligned blue bubble with response text and time | |
| 5.6 | Projections toggle | Tap "X projections" button below observation | Expands to show projection list with probabilities, MNM badges, exam points | |
| 5.7 | Parent interaction record | Expand projections | Indigo card showing what parent was told (summary + activities) | |
| 5.8 | Must-not-miss highlight | Projection with mustNotMiss=true | Red-tinted row with "MNM" badge | |
| 5.9 | Reply button | Tap "Reply" on unresolved episode | Reply bar at bottom activates with textarea focused | |
| 5.10 | Send response | Type text and tap send arrow | Response sent, blue bubble appears, episode resolved | |
| 5.11 | Dismiss episode | Tap "Dismiss" | Episode marked resolved with "Reviewed, no action needed" | |
| 5.12 | More actions menu | Tap "..." button | Shows "Tele" and "Visit" scheduling buttons | |
| 5.13 | Schedule tele | Tap "Tele" from more actions | Booking created, episode pathway updated | |
| 5.14 | Schedule visit | Tap "Visit" from more actions | Booking created, episode pathway updated | |
| 5.15 | Reply bar default state | Thread with unresolved episodes | Bottom bar shows "Respond to {child}'s concern..." placeholder button | |
| 5.16 | Cancel reply | Click X while composing | Reply bar resets to placeholder state | |
| 5.17 | Auto-scroll to bottom | Open thread with many episodes | Scrolls to most recent episode automatically | |
| 5.18 | Console link | Tap "Console" in header | Navigates to `/doctor/console?childId=...` with correct params | |
| 5.19 | Resolved episode styling | Episode that was resolved | Shows gray resolution note, no action buttons | |
| 5.20 | Auto-resize reply textarea | Type multiple lines in reply | Textarea grows up to 120px max | |

### Cross-Cutting Tests

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| X.1 | Mobile responsive (375px) | Resize to mobile | All components fit, no horizontal scroll, text truncates properly | |
| X.2 | Tablet responsive (768px) | Resize to tablet | Max-width constraint (`max-w-lg` parent, `max-w-4xl` doctor) centers content | |
| X.3 | Desktop responsive (1280px) | Resize to desktop | Content centered, no stretched layouts | |
| X.4 | Parent → Doctor flow | Parent submits observation | Doctor sees it in Inbox (after refresh) with correct alert level | |
| X.5 | Doctor → Parent flow | Doctor responds to episode | Parent sees response in care timeline (after refresh) | |
| X.6 | Old dashboard accessible | Navigate to `/child/{childId}` | Full ChildDashboard still works with all tiles | |
| X.7 | Existing Queue tab | Doctor dashboard → Queue tab | Original CareQueue component renders unchanged | |
| X.8 | Existing Patients tab | Doctor dashboard → Patients tab | Patient list renders, search works, Console link works | |

### Known Limitations (Wave 1)

1. **Photo/video capture** — camera button is placeholder (UI present, upload not wired)
2. **Guided follow-up questions** — phase exists in code but not yet triggered (future: system asks 1-2 clarifying questions after free text)
3. **Push notifications** — care episode notifications created in DB but FCM delivery depends on device token registration
4. **Real-time updates** — inbox/thread require manual refresh (no WebSocket yet)
5. **Multi-child** — ParentHome handles one child at a time (child switcher is Wave 4)

### Team Notes

- **Parent home route**: `/home/{childId}` — this is the new post-registration entry point
- **Full record route**: `/child/{childId}` — unchanged, still the deep-dive dashboard
- **Doctor inbox**: default tab changed from "Patient Panel" to "Inbox"
- **All existing routes work** — this is additive, not replacing anything
- **Migration 0012** must be run on production D1 before care episodes work
