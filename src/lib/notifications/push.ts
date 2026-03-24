/**
 * PushService — FCM push delivery layer on top of smart-notifications.
 * Called fire-and-forget from createNotification(). Never throws.
 */

import type { D1Database } from '@cloudflare/workers-types'

export interface PushPayload {
  title: string
  body: string
  actionUrl: string
}

interface Env {
  DB: D1Database
  FIREBASE_ADMIN_KEY?: string
  ADMIN_KEY?: string
}

interface ActiveToken {
  fcm_token: string
}

// Module-level singleton — initialised once per worker lifetime
let _app: unknown = null

function getAdminApp(env: Env): unknown {
  if (_app) return _app
  // Dynamic require to avoid bundling firebase-admin in client paths
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { initializeApp, getApps, cert } = require('firebase-admin/app') as typeof import('firebase-admin/app')
  const existing = getApps()
  if (existing.length > 0) {
    _app = existing[0]
    return _app
  }
  const serviceAccount = JSON.parse(env.FIREBASE_ADMIN_KEY ?? '{}') as object
  _app = initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) })
  return _app
}

/**
 * Deactivates a single FCM token (token-not-registered or explicit unregister).
 */
export async function deactivateToken(
  db: D1Database,
  fcmToken: string,
  parentId: string
): Promise<void> {
  await db
    .prepare('UPDATE push_subscriptions SET is_active = 0 WHERE fcm_token = ? AND parent_id = ?')
    .bind(fcmToken, parentId)
    .run()
}

/**
 * Sends an FCM push to all active devices for a parent.
 * Suppresses blog_recommendation if parent was active in last 3 days.
 * Never throws — all errors are logged and swallowed.
 */
export async function sendPush(
  db: D1Database,
  env: Env,
  parentId: string,
  payload: PushPayload,
  notificationType: string
): Promise<void> {
  try {
    // Suppress blog_recommendation if parent was recently active
    if (notificationType === 'blog_recommendation') {
      const recent = await db
        .prepare(
          `SELECT COUNT(*) as cnt FROM content_engagement
           WHERE parent_id = ? AND created_at >= datetime('now', '-3 days')`
        )
        .bind(parentId)
        .first<{ cnt: number }>()
      if ((recent?.cnt ?? 0) > 0) return
    }

    // Query active tokens
    const result = await db
      .prepare(
        `SELECT fcm_token FROM push_subscriptions
         WHERE parent_id = ? AND is_active = 1`
      )
      .bind(parentId)
      .all<ActiveToken>()

    const activeTokens = (result.results ?? []).map((r) => r.fcm_token)
    if (activeTokens.length === 0) return

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getMessaging } = require('firebase-admin/messaging') as typeof import('firebase-admin/messaging')
    const messaging = getMessaging(getAdminApp(env) as import('firebase-admin/app').App)

    const response = await messaging.sendEachForMulticast({
      tokens: activeTokens,
      notification: { title: payload.title, body: payload.body },
      data: { actionUrl: payload.actionUrl },
      webpush: {
        notification: { icon: '/icons/icon-192.png' },
        fcmOptions: { link: payload.actionUrl },
      },
    })

    // Deactivate stale tokens
    for (let i = 0; i < response.responses.length; i++) {
      const r = response.responses[i]
      if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
        await deactivateToken(db, activeTokens[i], parentId)
      }
    }
  } catch (err) {
    console.error('[PushService] sendPush error:', err)
  }
}
