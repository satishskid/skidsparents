# Requirements Document

## Introduction

Push Notifications adds real device-level push delivery to the SKIDS Parent PWA using Firebase Cloud Messaging (FCM). Currently, parents receive in-app notifications (stored in D1, surfaced via NotificationBell) but get no alert when the app is closed or backgrounded — meaning critical events like new screening results or vaccination reminders go unnoticed until the parent actively opens the app.

This feature layers FCM push delivery on top of the existing smart-notifications system. When the NotificationService creates an in-app notification, it also dispatches an FCM push to all registered devices for that parent. The PWA service worker handles both foreground and background message receipt. Parents can grant or deny permission; the app functions fully without push.

Firebase is already integrated for auth, so the FCM SDK is available without new dependencies.

## Glossary

- **FCM**: Firebase Cloud Messaging — the push delivery service used to send device notifications.
- **FCMToken**: A device-specific registration token issued by FCM that identifies a parent's device for push delivery. Tokens expire and rotate.
- **PushSubscription**: A record in the `push_subscriptions` table linking a `parentId` to an `FCMToken` with metadata.
- **PushService**: The server-side module (`src/lib/notifications/push.ts`) responsible for sending FCM push messages to all registered devices for a parent.
- **ServiceWorker**: The PWA service worker (`public/firebase-messaging-sw.js`) that handles background FCM message receipt and displays system notifications.
- **PushPermission**: The browser/OS permission state for notifications — one of `granted`, `denied`, or `default`.
- **PushPayload**: The data sent in an FCM message: `title`, `body`, and `actionUrl`.
- **NotificationService**: The existing server-side module (`src/lib/notifications/service.ts`) that generates in-app notifications (from smart-notifications spec).
- **TokenRefresh**: The process of replacing a stale or rotated FCMToken with a new one from the FCM SDK.
- **VAPID**: Voluntary Application Server Identification — the key pair used to authenticate the push server with FCM for web push.

## Requirements

### Requirement 1: FCM Token Registration

**User Story:** As a parent, I want my device to be registered for push notifications after I grant permission, so that I receive alerts even when the app is closed.

#### Acceptance Criteria

1. WHEN a parent grants notification permission in the browser, THE PushRegistration_Component SHALL call the FCM SDK to obtain an FCMToken and POST it to `/api/push/register`.
2. WHEN `/api/push/register` receives a valid FCMToken and auth token, THE Push_API SHALL upsert a `push_subscriptions` record linking the `parentId` to the FCMToken, recording the `userAgent` and `registeredAt` timestamp.
3. THE Push_API SHALL accept the same FCMToken from the same parent multiple times and update the `registeredAt` timestamp without creating duplicate records.
4. IF a request to `/api/push/register` is made without a valid auth token, THEN THE Push_API SHALL return HTTP 401.
5. WHEN the FCM SDK issues a new FCMToken via `onTokenRefresh`, THE PushRegistration_Component SHALL POST the new token to `/api/push/register` to replace the stale token.

---

### Requirement 2: Notification Permission Request

**User Story:** As a parent, I want to be asked for notification permission at the right moment — not immediately on first load — so that I understand why the app needs it before deciding.

#### Acceptance Criteria

1. WHEN a parent completes onboarding (the `onboardingCompleted` flag transitions to `true`), THE PushPermissionPrompt_Component SHALL display a contextual prompt explaining that push notifications will alert them to their child's health events.
2. WHEN a parent clicks "Allow Notifications" in the prompt, THE PushPermissionPrompt_Component SHALL call the browser Notification permission API and, if granted, proceed with FCM token registration per Requirement 1.
3. WHEN a parent clicks "Not Now" in the prompt, THE PushPermissionPrompt_Component SHALL dismiss the prompt and store a `push_permission_dismissed` flag in localStorage so the prompt is not shown again in the same session.
4. IF the browser `Notification.permission` is already `granted` when the component mounts, THEN THE PushPermissionPrompt_Component SHALL skip the prompt and proceed directly to FCM token registration.
5. IF the browser `Notification.permission` is `denied`, THEN THE PushPermissionPrompt_Component SHALL NOT display the permission prompt.
6. THE PushPermissionPrompt_Component SHALL NOT request notification permission on the initial page load before onboarding is complete.

---

### Requirement 3: Push Subscriptions Storage

**User Story:** As a product owner, I want FCM tokens stored per parent and device in D1, so that push messages can be targeted to all of a parent's registered devices.

#### Acceptance Criteria

1. THE Push_API SHALL store FCM tokens in a `push_subscriptions` table with columns: `id`, `parentId`, `fcmToken`, `userAgent`, `registeredAt`, `isActive`.
2. WHEN a parent's FCMToken is replaced via TokenRefresh, THE Push_API SHALL set `isActive = false` on the old token record and insert a new record with the refreshed token.
3. WHEN `/api/push/unregister` receives a valid auth token and FCMToken, THE Push_API SHALL set `isActive = false` on the matching `push_subscriptions` record.
4. IF a request to `/api/push/unregister` is made without a valid auth token, THEN THE Push_API SHALL return HTTP 401.
5. THE Push_API SHALL only return or act on `push_subscriptions` records belonging to the authenticated parent.

---

### Requirement 4: Push Delivery on Notification Creation

**User Story:** As a parent, I want to receive a device push notification whenever the smart-notifications system creates a new in-app notification for me, so that I am alerted even when the app is closed.

#### Acceptance Criteria

1. WHEN the NotificationService creates a new in-app `Notification` record for a parent, THE NotificationService SHALL invoke the PushService with the `parentId` and the notification's `title`, `body`, and `actionUrl`.
2. WHEN the PushService is invoked, THE PushService SHALL query all `push_subscriptions` records for the `parentId` where `isActive = true`.
3. WHEN the PushService has one or more active subscriptions, THE PushService SHALL send an FCM message to each FCMToken containing the `PushPayload` (`title`, `body`, `actionUrl`).
4. IF the FCM API returns a token-not-registered error for a specific FCMToken, THEN THE PushService SHALL set `isActive = false` on that `push_subscriptions` record and continue sending to remaining tokens.
5. IF the PushService encounters an FCM API error that is not a token-not-registered error, THEN THE PushService SHALL log the error and continue processing remaining tokens without throwing.
6. IF a parent has no active `push_subscriptions` records, THEN THE PushService SHALL return without error and the in-app notification SHALL still be created normally.

---

### Requirement 5: Service Worker Background Message Handling

**User Story:** As a parent, I want to see a system notification when a push arrives while the app is in the background or closed, so that I am alerted immediately.

#### Acceptance Criteria

1. WHEN an FCM push message is received by the ServiceWorker while the app is in the background or closed, THE ServiceWorker SHALL display a system notification using the `title` and `body` from the `PushPayload`.
2. WHEN a parent clicks the system notification, THE ServiceWorker SHALL open or focus the SKIDS Parent app and navigate to the `actionUrl` from the `PushPayload`.
3. THE ServiceWorker SHALL be registered at `public/firebase-messaging-sw.js` and initialise the Firebase app using the project's FCM configuration.
4. WHEN the ServiceWorker displays a system notification, THE ServiceWorker SHALL include the SKIDS app icon (`/icons/icon-192.png`) as the notification icon.
5. IF the `PushPayload` does not contain an `actionUrl`, THEN THE ServiceWorker SHALL navigate to `/dashboard` on notification click.

---

### Requirement 6: Foreground Message Handling

**User Story:** As a parent using the app, I want to see an in-app toast or badge update when a push arrives while I have the app open, so that I am not shown a redundant system notification.

#### Acceptance Criteria

1. WHEN an FCM push message is received while the app is in the foreground, THE FCM_Client SHALL suppress the system notification and instead dispatch a custom browser event `skids:push-received` with the `PushPayload`.
2. WHEN the `skids:push-received` event is dispatched, THE NotificationBell SHALL refresh its notification list from `/api/notifications` to reflect the new notification.
3. THE FCM_Client SHALL be initialised once per app session and SHALL NOT create duplicate `onMessage` listeners on re-renders.

---

### Requirement 7: Graceful Degradation

**User Story:** As a parent who has denied notification permission or uses an unsupported browser, I want the app to work fully without push notifications, so that I am not blocked from using SKIDS.

#### Acceptance Criteria

1. IF the browser does not support the Notifications API or the FCM SDK fails to initialise, THEN THE PushRegistration_Component SHALL silently skip registration without displaying an error to the parent.
2. IF a parent has set `PushPermission` to `denied`, THEN THE App SHALL function identically to a parent with `PushPermission` set to `granted`, with the sole difference being the absence of push delivery.
3. WHEN the PushService is invoked for a parent with no active subscriptions, THE NotificationService SHALL complete the in-app notification creation without delay or error.
4. THE PushService SHALL complete each FCM send attempt within 5 seconds and SHALL NOT block the NotificationService's GenerationRun if FCM is unavailable.

---

### Requirement 8: Push Payload Consistency

**User Story:** As a parent, I want the push notification content to match what I see in the in-app notification bell, so that the experience is coherent across surfaces.

#### Acceptance Criteria

1. THE PushService SHALL construct the `PushPayload` `title` and `body` fields from the same `title` and `body` values written to the `notifications` table record.
2. THE PushService SHALL set the `PushPayload` `actionUrl` to the same `actionUrl` stored in the `dataJson` field of the corresponding `notifications` record.
3. WHEN the FCM message is received on device, THE title displayed in the system notification SHALL exactly match the `title` field in the `PushPayload`.
4. THE PushService SHALL NOT send push messages for `Notification` records of type `blog_recommendation` unless the parent has been inactive in the app for more than 3 days, to avoid low-signal interruptions.

---

### Requirement 9: Token Lifecycle and Cleanup

**User Story:** As a product owner, I want stale FCM tokens to be cleaned up automatically, so that the push_subscriptions table does not accumulate dead records that waste FCM API calls.

#### Acceptance Criteria

1. WHEN the FCM SDK calls `onTokenRefresh` on the client, THE PushRegistration_Component SHALL POST the new token to `/api/push/register` within the same session.
2. WHEN the PushService receives a token-not-registered error from FCM for a specific token, THE PushService SHALL immediately set `isActive = false` on that record per Requirement 4.4.
3. THE Push_API SHALL expose a `/api/push/cleanup` endpoint that, when called with a valid `ADMIN_KEY` header, sets `isActive = false` on all `push_subscriptions` records where `registeredAt` is older than 60 days.
4. IF `/api/push/cleanup` is called without a valid `ADMIN_KEY` header, THEN THE Push_API SHALL return HTTP 401.
