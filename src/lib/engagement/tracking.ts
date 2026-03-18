// Content Engagement Tracking Service
// Tracks views and interactions in the content_engagement table

import { drizzle } from 'drizzle-orm/d1'
import { contentEngagement } from '@/lib/db/schema'
import { eq, desc, and, gte, sql } from 'drizzle-orm'

type EngagementAction = 'view' | 'click' | 'share' | 'bookmark' | 'complete'

export interface ContentEngagementRecord {
  id: string
  parentId: string | null
  contentType: string
  contentId: string
  action: EngagementAction
  createdAt: string | null
}

export class EngagementService {
  private db: ReturnType<typeof drizzle>

  constructor(d1: D1Database) {
    this.db = drizzle(d1)
  }

  /** Track a content view (durationSeconds noted but not persisted — schema uses action enum) */
  async trackView(
    parentId: string,
    contentType: string,
    contentId: string,
    _durationSeconds: number
  ): Promise<void> {
    await this.db.insert(contentEngagement).values({
      parentId,
      contentType,
      contentId,
      action: 'view',
    })
  }

  /** Track a content interaction (like, share, bookmark, complete) */
  async trackInteraction(
    parentId: string,
    contentType: string,
    contentId: string,
    action: string
  ): Promise<void> {
    // Map incoming action to schema enum; default to 'click'
    const validActions: EngagementAction[] = ['view', 'click', 'share', 'bookmark', 'complete']
    const mapped: EngagementAction = validActions.includes(action as EngagementAction)
      ? (action as EngagementAction)
      : 'click'

    await this.db.insert(contentEngagement).values({
      parentId,
      contentType,
      contentId,
      action: mapped,
    })
  }

  /** Get engagement history for a parent, most recent first */
  async getUserEngagement(
    parentId: string,
    limit = 50
  ): Promise<ContentEngagementRecord[]> {
    const rows = await this.db
      .select()
      .from(contentEngagement)
      .where(eq(contentEngagement.parentId, parentId))
      .orderBy(desc(contentEngagement.createdAt))
      .limit(Math.min(limit, 200))
      .all()

    return rows as ContentEngagementRecord[]
  }

  /** Get popular content by type within a timeframe, ordered by engagement count */
  async getPopularContent(
    contentType: string,
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<Array<{ contentId: string; contentType: string; engagementCount: number }>> {
    const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const rows = await this.db
      .select({
        contentId: contentEngagement.contentId,
        contentType: contentEngagement.contentType,
        engagementCount: sql<number>`count(*)`,
      })
      .from(contentEngagement)
      .where(
        and(
          eq(contentEngagement.contentType, contentType),
          gte(contentEngagement.createdAt, since)
        )
      )
      .groupBy(contentEngagement.contentId, contentEngagement.contentType)
      .orderBy(desc(sql`count(*)`))
      .limit(20)
      .all()

    return rows
  }
}
