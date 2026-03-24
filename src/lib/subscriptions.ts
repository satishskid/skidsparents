/**
 * Subscription utilities — query parent feature access from D1.
 * Falls back to free tier features on any error or missing subscription.
 */

const FREE_TIER_FEATURES = ['pdf_export', 'health_score_basic']

interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
}

interface SubscriptionRow {
  features_snapshot_json: string
}

/**
 * Returns the feature keys for a parent's active subscription.
 * Falls back to free tier features if no active subscription exists or on DB error.
 */
export async function getParentFeatures(parentId: string, db: D1Database): Promise<string[]> {
  try {
    const row = await db
      .prepare(
        `SELECT features_snapshot_json FROM parent_subscriptions
         WHERE parent_id = ? AND status = 'active'
         ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(parentId)
      .first<SubscriptionRow>()

    if (!row?.features_snapshot_json) return FREE_TIER_FEATURES

    const features = JSON.parse(row.features_snapshot_json) as unknown
    if (!Array.isArray(features)) return FREE_TIER_FEATURES
    return features as string[]
  } catch {
    return FREE_TIER_FEATURES
  }
}

/**
 * Returns true if the parent's active subscription includes the given feature key.
 */
export async function hasFeature(parentId: string, feature: string, db: D1Database): Promise<boolean> {
  const features = await getParentFeatures(parentId, db)
  return features.includes(feature)
}
