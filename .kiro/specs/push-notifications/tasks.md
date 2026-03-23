# Implementation Plan: Push Notifications

## Overview

Layer FCM push delivery on top of the existing smart-notifications system. Tasks are ordered by dependency: DB schema first, then server-side PushService, then API routes, then NotificationService integration, then client-side (service worker, FCM client, UI components), and finally tests.

## Tasks

- [ ] 1. Create D1 migration and Drizzle schema for push_subscriptions
  - Create `migrations/0005_push_subscriptions.sql` with the `push_subscriptions` table, unique index on `(parent_id, fcm_token)`, and active-token index
  - Add `pushSubscriptions` table definition to `src/lib/db/schema.ts` with columns: `id`, `parentId`, `fcmToken`, `userAgent`, `registeredAt`, `isActive`
  - _Requirements: 3.1_

- [ ] 2. Implement PushService (`src/lib/notifications/push.ts`)
  - [ ] 2.1 Implement `getAdminApp(env)` module-level singleton that parses `FIREBASE_ADMIN_KEY` and calls `initializeApp` once
    - Use `getApps()` guard to prevent re-initialisation across requests
    - _Requirements: 4.1, 4.3_

  - [ ] 2.2 Implement `deactivateToken(db, fcmToken, parentId)`
    - Issue `UPDATE push_subscriptions SET is_active=0 WHERE fcm_token=? AND parent_id=?`
    - _Requirements: 3.3, 4.4_

  - [ ] 2.3 Implement `sendPush(db, env, parentId, payload, notificationType)`
    - Query active tokens for parentId; return early if none
    - Suppress FCM call for `blog_recommendation` type unless parent inactive >3 days (check `content_engagement` table)
    - Call `messaging.sendEachForMulticast` with `notification`, `data`, and `webpush` fields
    - Per-token: call `deactivateToken` on `messaging/registration-token-not-registered` error; log and swallow all other errors
    - Never throws — wrap entire body in try/catch
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 7.4, 8.1, 8.2, 8.4_

  - [ ]* 2.4 Write unit tests for PushService (`src/lib/notifications/push.test.ts`)
    - `deactivateToken` — mock DB, verify correct UPDATE
    - `sendPush` with no active tokens — verify FCM API never called
    - `sendPush` with mixed active/inactive tokens — verify only active tokens passed to FCM
    - `sendPush` blog_recommendation suppression — mock recent activity, verify FCM not called
    - `sendPush` token-not-registered — mock one failure, verify `deactivateToken` called for that token and others still processed
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 8.4_

  - [ ]* 2.5 Write property test: Property 4 — PushService sends to exactly the active subscription set
    - Generate random sets of active/inactive subscriptions; assert FCM multicast tokens list equals exactly the active subset
    - `// Feature: push-notifications, Property 4: PushService sends to exactly the active subscription set`
    - Validates: Requirements 4.2, 4.3

  - [ ]* 2.6 Write property test: Property 5 — Push payload matches notification record
    - Generate random `NotificationInput` values; assert `PushPayload` fields equal the corresponding notification record fields
    - `// Feature: push-notifications, Property 5: Push payload matches notification record`
    - Validates: Requirements 8.1, 8.2

  - [ ]* 2.7 Write property test: Property 6 — blog_recommendation push suppression
    - Generate random `blog_recommendation` inputs with recent activity timestamps; assert FCM API is not called
    - `// Feature: push-notifications, Property 6: blog_recommendation push suppression`
    - Validates: Requirements 8.4

- [ ] 3. Create Push API routes
  - [ ] 3.1 Create `src/pages/api/push/register.ts` (POST)
    - Authenticate via `getParentId`; return 401 if missing
    - Upsert `push_subscriptions` on `(parentId, fcmToken)`: insert new or update `registeredAt` + set `isActive=true`
    - Record `userAgent` from request headers
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1_

  - [ ] 3.2 Create `src/pages/api/push/unregister.ts` (POST)
    - Authenticate via `getParentId`; return 401 if missing
    - Set `isActive=false` WHERE `parentId=?` AND `fcmToken=?`
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ] 3.3 Create `src/pages/api/push/cleanup.ts` (GET)
    - Check `x-admin-key` or `Authorization: Bearer` header against `env.ADMIN_KEY`; return 401 if invalid
    - `UPDATE push_subscriptions SET is_active=0 WHERE registered_at < datetime('now', '-60 days')`
    - Return `{ deactivated: number }`
    - _Requirements: 9.3, 9.4_

  - [ ]* 3.4 Write unit tests for API route handlers
    - Mock `env.DB` and `env.FIREBASE_ADMIN_KEY`; verify 401 on missing auth, 200 on valid requests for all three routes
    - _Requirements: 1.4, 3.4, 9.4_

  - [ ]* 3.5 Write property test: Property 1 — Token registration is idempotent
    - Generate random `(parentId, fcmToken)` pairs; call register N times (N ∈ [1, 10]); assert exactly 1 record with `isActive=true`
    - `// Feature: push-notifications, Property 1: Token registration is idempotent`
    - Validates: Requirements 1.2, 1.3

  - [ ]* 3.6 Write property test: Property 2 — Token ownership isolation
    - Generate two random parentIds and a token; register under parentA; assert parentB cannot query or modify it
    - `// Feature: push-notifications, Property 2: Token ownership isolation`
    - Validates: Requirements 3.5

  - [ ]* 3.7 Write property test: Property 3 — Unregister deactivates token
    - Generate random `(parentId, fcmToken)`; register then unregister; assert record exists with `isActive=false`
    - `// Feature: push-notifications, Property 3: Unregister deactivates token`
    - Validates: Requirements 3.3

  - [ ]* 3.8 Write property test: Property 7 — Cleanup deactivates only stale tokens
    - Generate random subscriptions with varying `registeredAt` dates; call cleanup; assert only records older than 60 days are deactivated
    - `// Feature: push-notifications, Property 7: Cleanup deactivates only stale tokens`
    - Validates: Requirements 9.3

  - [ ]* 3.9 Write property test: Property 8 — Unauthenticated push API requests return 401
    - Generate random requests without auth headers; assert all three endpoints return 401
    - `// Feature: push-notifications, Property 8: Unauthenticated push API requests return 401`
    - Validates: Requirements 1.4, 3.4, 9.4

- [ ] 4. Integrate PushService into NotificationService
  - In `src/lib/notifications/service.ts`, update `createNotification()` to call `sendPush()` after the DB insert as fire-and-forget (`.catch(() => {})`)
  - Pass `db`, `env`, `input.parentId`, `{ title, body, actionUrl }`, and `input.type`
  - Ensure the existing DB insert and return value are unaffected
  - _Requirements: 4.1, 4.6, 7.3_

- [ ] 5. Create service worker for background FCM handling
  - Create `public/firebase-messaging-sw.js` using `firebase-app-compat` and `firebase-messaging-compat` importScripts
  - Initialise Firebase app with project FCM config (public values only)
  - Implement `onBackgroundMessage` to call `self.registration.showNotification` with title, body, icon `/icons/icon-192.png`, and `data.actionUrl`
  - Implement `notificationclick` handler: close notification, focus existing app window or `clients.openWindow(actionUrl)`, default to `/dashboard` if `actionUrl` absent
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.1 Write property test: Property 10 — Service worker notification uses payload title
    - Generate random FCM message payloads; assert `showNotification` title equals `payload.notification.title`
    - `// Feature: push-notifications, Property 10: Service worker notification uses payload title`
    - Validates: Requirements 5.4, 8.3

- [ ] 6. Create FCM foreground client (`src/lib/firebase/fcm-client.ts`)
  - Implement `initFcmForegroundListener()` with a module-level `_listenerRegistered` boolean guard
  - On each foreground message, dispatch `new CustomEvent('skids:push-received', { detail: payload })` on `window`
  - Implement `getFcmToken()`: call `getToken(messaging, { vapidKey })`, wrap in try/catch, return `null` on failure
  - _Requirements: 6.1, 6.3, 7.1_

  - [ ]* 6.1 Write property test: Property 9 — Foreground listener is registered at most once
    - Call `initFcmForegroundListener` N times (N ∈ [1, 20]); dispatch one FCM message; assert exactly 1 `skids:push-received` event fired
    - `// Feature: push-notifications, Property 9: Foreground listener is registered at most once`
    - Validates: Requirements 6.3

- [ ] 7. Create PushPermissionPrompt component (`src/components/common/PushPermissionPrompt.tsx`)
  - Accept props `{ onboardingCompleted: boolean, token: string }`
  - Render nothing if: `!onboardingCompleted`, `Notification.permission === 'denied'`, `localStorage.getItem('push_permission_dismissed')`, or `typeof Notification === 'undefined'`
  - If `Notification.permission === 'granted'` on mount, skip prompt and call `registerToken()` directly
  - Otherwise render prompt with "Allow Notifications" and "Not Now" buttons
  - "Allow Notifications": call `Notification.requestPermission()`, if granted call `registerToken()`
  - "Not Now": set `localStorage.setItem('push_permission_dismissed', '1')` and hide prompt
  - `registerToken()`: call `getFcmToken()`, POST to `/api/push/register` with Bearer token, silently ignore errors
  - Call `initFcmForegroundListener()` after successful registration
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1_

- [ ] 8. Update NotificationBell to handle push-received events
  - In `src/components/common/NotificationBell.tsx`, add a `useEffect` that registers a `skids:push-received` listener on `window`
  - Handler calls the existing `fetchNotifications()` function to refresh the list
  - Clean up listener on unmount
  - _Requirements: 6.2_

- [ ] 9. Checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all unit tests pass
  - Verify no TypeScript errors in new files
  - Ask the user if any questions arise before proceeding

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property-based tests use fast-check with minimum 100 runs each; mock D1 with an in-memory object and FCM Admin SDK via `vi.mock('firebase-admin/messaging')`
- `FIREBASE_ADMIN_KEY` and `VAPID_KEY` must be set as Cloudflare secrets before push delivery works in production
- The service worker must be at the root public path for correct FCM scope registration
