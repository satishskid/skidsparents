# Requirements Document

## Introduction

Smart Notifications is a personalised, rule-based re-engagement system for the SKIDS Parent app. It generates contextually relevant in-app notifications by querying each child's real health data — milestones, habits, vaccinations, growth records, and screening results — and surfaces them through the existing notification bell UI. The goal is to make every parent feel that SKIDS genuinely knows their child, driving daily active use and emotional connection to the platform.

This feature replaces the current hardcoded mock data in `NotificationBell.tsx` with live, server-generated notifications stored in the existing `notifications` table.

## Glossary

- **NotificationService**: The server-side TypeScript module (`src/lib/notifications/service.ts`) responsible for evaluating trigger rules and writing notification records to the DB.
- **Notification**: A record in the `notifications` table representing a single in-app alert for a parent.
- **Trigger**: A rule evaluated against child data that, when satisfied, causes the NotificationService to create a Notification.
- **ActionUrl**: The deep-link path embedded in a Notification that navigates the parent to the relevant feature.
- **UnreadCount**: The count of Notification records for a parent where `read = false`.
- **NotificationBell**: The React component (`src/components/common/NotificationBell.tsx`) that displays the bell icon, unread badge, and dropdown panel.
- **GenerationRun**: A single execution of all trigger rules for all children of a parent, producing zero or more new Notifications.
- **Deduplication**: The process of preventing duplicate Notifications of the same type for the same child within a cooldown window.
- **CooldownWindow**: The minimum time period that must elapse before the same trigger type can fire again for the same child.
- **IAP Schedule**: Indian Academy of Pediatrics vaccination schedule used as the reference for vaccination due dates.

## Requirements

### Requirement 1: Notification Data API

**User Story:** As a parent, I want to see my real notifications in the app, so that I can act on personalised health reminders for my child.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/notifications` with a valid auth token, THE Notifications_API SHALL return all Notification records for the authenticated parent ordered by `createdAt` descending.
2. WHEN a GET request is made to `/api/notifications` with a valid auth token, THE Notifications_API SHALL include an `unreadCount` field in the response body.
3. WHEN a POST request is made to `/api/notifications` with `{ action: "mark_read", id: "<notificationId>" }`, THE Notifications_API SHALL set `read = true` for that Notification and return `{ success: true }`.
4. WHEN a POST request is made to `/api/notifications` with `{ action: "mark_all_read" }`, THE Notifications_API SHALL set `read = true` for all unread Notifications belonging to the authenticated parent.
5. IF a request is made to `/api/notifications` without a valid auth token, THEN THE Notifications_API SHALL return HTTP 401.
6. IF a POST request is made to `/api/notifications` with an `id` that does not belong to the authenticated parent, THEN THE Notifications_API SHALL return HTTP 403.

---

### Requirement 2: NotificationBell Wired to Real Data

**User Story:** As a parent, I want the notification bell to show my real unread count and actual notifications, so that I am not misled by placeholder data.

#### Acceptance Criteria

1. WHEN the NotificationBell component mounts, THE NotificationBell SHALL fetch notifications from `/api/notifications` using the Firebase auth token.
2. WHEN the API response is received, THE NotificationBell SHALL display the real `unreadCount` as the badge number on the bell icon.
3. WHEN a parent clicks "Mark all read" in the dropdown, THE NotificationBell SHALL call POST `/api/notifications` with `{ action: "mark_all_read" }` and update the local state to reflect zero unread.
4. WHEN a notification item is clicked, THE NotificationBell SHALL navigate to the `actionUrl` stored in that Notification record.
5. IF the `/api/notifications` fetch fails, THEN THE NotificationBell SHALL display an empty notification list without crashing.
6. WHILE the notifications are loading, THE NotificationBell SHALL display a loading skeleton in place of the notification list.

---

### Requirement 3: Milestone Age Window Trigger

**User Story:** As a parent, I want to be notified when my child enters the expected age window for a developmental milestone, so that I can track and record it at the right time.

#### Acceptance Criteria

1. WHEN the NotificationService runs a GenerationRun for a child and the child's current age in months falls within the `expectedAgeMin`–`expectedAgeMax` range of a milestone with status `not_started`, THE NotificationService SHALL create a Notification of type `milestone_reminder` with an ActionUrl pointing to `/dashboard/milestones`.
2. WHEN creating a milestone age window Notification, THE NotificationService SHALL include the child's name and the milestone title in the notification title.
3. THE NotificationService SHALL NOT create a duplicate milestone age window Notification for the same child and `milestoneKey` within a 7-day CooldownWindow.
4. IF a milestone status is `achieved` or `in_progress`, THEN THE NotificationService SHALL NOT create a milestone age window Notification for that milestone.

---

### Requirement 4: Habit Streak Celebration Trigger

**User Story:** As a parent, I want to be celebrated when my child hits a habit streak milestone, so that I feel motivated to keep logging habits.

#### Acceptance Criteria

1. WHEN the NotificationService runs a GenerationRun and a child's `streakDays` for any `habitType` equals 3, 7, 14, or 30, THE NotificationService SHALL create a Notification of type `habit_streak` with an ActionUrl pointing to `/dashboard/habits`.
2. WHEN creating a habit streak Notification, THE NotificationService SHALL include the child's name, the streak count, and the habit type label in the notification title.
3. THE NotificationService SHALL NOT create a duplicate habit streak Notification for the same child, `habitType`, and streak milestone value within a 1-day CooldownWindow.

---

### Requirement 5: Vaccination Due Trigger

**User Story:** As a parent, I want to be reminded 7 days before my child's next vaccination is due, so that I can schedule the appointment in time.

#### Acceptance Criteria

1. WHEN the NotificationService runs a GenerationRun and a child has a `vaccinationRecords` entry where `nextDue` is exactly 7 days from the current date, THE NotificationService SHALL create a Notification of type `general` with an ActionUrl pointing to `/dashboard/vaccinations`.
2. WHEN creating a vaccination due Notification, THE NotificationService SHALL include the child's name and the `vaccineName` in the notification title.
3. THE NotificationService SHALL NOT create a duplicate vaccination due Notification for the same child and `vaccineName` within a 3-day CooldownWindow.

---

### Requirement 6: Growth Entry Reminder Trigger

**User Story:** As a parent, I want to be reminded to log my child's growth measurements if I haven't done so in 30 days, so that the growth chart stays up to date.

#### Acceptance Criteria

1. WHEN the NotificationService runs a GenerationRun and a child has no `growthRecords` entry in the last 30 days, THE NotificationService SHALL create a Notification of type `general` with an ActionUrl pointing to `/dashboard/growth`.
2. WHEN creating a growth entry reminder Notification, THE NotificationService SHALL include the child's name in the notification title.
3. THE NotificationService SHALL NOT create a duplicate growth entry reminder Notification for the same child within a 7-day CooldownWindow.

---

### Requirement 7: Screening Result Available Trigger

**User Story:** As a parent, I want to be notified immediately when new screening results are available for my child, so that I can review them promptly.

#### Acceptance Criteria

1. WHEN a new `screeningImports` record is created for a child, THE NotificationService SHALL create a Notification of type `screening_alert` with an ActionUrl pointing to `/dashboard/reports`.
2. WHEN creating a screening result Notification, THE NotificationService SHALL include the child's name in the notification title.
3. THE NotificationService SHALL NOT create a duplicate screening result Notification for the same `screeningImports` record id.

---

### Requirement 8: Blog Recommendation Trigger

**User Story:** As a parent, I want to receive a weekly blog recommendation relevant to my child's current developmental stage, so that I can stay informed with timely content.

#### Acceptance Criteria

1. WHEN the NotificationService runs a GenerationRun and the parent has not received a `blog_recommendation` Notification in the last 7 days, THE NotificationService SHALL create a Notification of type `blog_recommendation` with an ActionUrl pointing to `/blog`.
2. WHEN creating a blog recommendation Notification, THE NotificationService SHALL include the child's age stage (e.g. "infant", "toddler", "preschooler", "school-age") in the notification body.
3. THE NotificationService SHALL NOT create a duplicate blog recommendation Notification for the same parent within a 7-day CooldownWindow.

---

### Requirement 9: Habit Gap Nudge Trigger

**User Story:** As a parent, I want a gentle nudge when I haven't logged a habit for 3 days, so that I don't lose the habit-tracking momentum.

#### Acceptance Criteria

1. WHEN the NotificationService runs a GenerationRun and a child has no `habitsLog` entry for a specific `habitType` in the last 3 days, THE NotificationService SHALL create a Notification of type `habit_streak` with an ActionUrl pointing to `/dashboard/habits`.
2. WHEN creating a habit gap nudge Notification, THE NotificationService SHALL include the child's name and the habit type label in the notification title.
3. THE NotificationService SHALL NOT create a duplicate habit gap nudge Notification for the same child and `habitType` within a 3-day CooldownWindow.
4. THE NotificationService SHALL NOT create a habit gap nudge Notification for a `habitType` on the same day a habit streak celebration Notification was created for that same child and `habitType`.

---

### Requirement 10: Welcome / Onboarding Trigger

**User Story:** As a new parent, I want a welcome notification that guides me to add my child's first milestone, so that I understand the value of the platform immediately.

#### Acceptance Criteria

1. WHEN the NotificationService runs a GenerationRun for a parent whose oldest child has no `milestones` records, THE NotificationService SHALL create a Notification of type `general` with an ActionUrl pointing to `/dashboard/milestones`.
2. WHEN creating a welcome Notification, THE NotificationService SHALL include the child's name in the notification title.
3. THE NotificationService SHALL NOT create more than one welcome Notification per child.

---

### Requirement 11: Notification Generation Invocation

**User Story:** As a product owner, I want notifications to be generated on login and via a scheduled cron job, so that parents always have fresh, timely notifications.

#### Acceptance Criteria

1. WHEN a parent successfully authenticates and their session is established, THE NotificationService SHALL be invoked to run a GenerationRun for all children of that parent.
2. WHERE a Cloudflare scheduled cron trigger is configured, THE NotificationService SHALL be invoked daily for all parents to run a GenerationRun.
3. WHEN the NotificationService runs a GenerationRun, THE NotificationService SHALL evaluate all trigger rules (Requirements 3–10) for each child of the parent.
4. IF the NotificationService encounters a database error during a GenerationRun, THEN THE NotificationService SHALL log the error and continue processing remaining children without throwing.

---

### Requirement 12: Notification Deduplication

**User Story:** As a parent, I want to avoid receiving the same notification repeatedly, so that the bell does not feel spammy.

#### Acceptance Criteria

1. BEFORE creating any Notification, THE NotificationService SHALL query existing Notifications for the same `parentId`, `type`, and child identifier within the applicable CooldownWindow.
2. IF a matching Notification already exists within the CooldownWindow, THEN THE NotificationService SHALL skip creation of the duplicate Notification.
3. THE NotificationService SHALL store the child's id in the `dataJson` field of every Notification to enable per-child deduplication queries.
