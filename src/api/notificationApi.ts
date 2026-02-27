import { apiClient } from './client'
import type { NotificationModel } from '@/domain'
import { NOTIFICATION_LINK_TYPE, type NotificationLinkTypeCode } from '@/constants/code.constants'

export const notificationApi = {
  async fetchNotifications(params?: {
    limit?: number
    markRead?: boolean
  }): Promise<NotificationModel[]> {
    const res = await apiClient.get<NotificationListResponse>('/api/notifications', {
      params: {
        limit: params?.limit ?? 20,
        markRead: params?.markRead ?? true,
      },
    })
    return res.data.items.map(toNotificationModel)
  },

  async fetchUnreadCount(): Promise<number> {
    const res = await apiClient.get<UnreadCountResponse>('/api/notifications/unread-count')
    return res.data.unreadCount
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * Response用の通知一覧のDTO
 */
interface NotificationListResponse {
  items: NotificationItemResponse[]
}

/**
 * Response用の通知一覧のDTO
 */
interface NotificationItemResponse {
  notificationId: number
  isRead: boolean
  occurredAt: string
  titleKey: string | null
  bodyKey: string
  params: Record<string, unknown> | null
  linkType: string
  linkId: number | null
  aggregatedCount: number
}

/**
 * 未読件数取得のResponse用のDTO
 */
interface UnreadCountResponse {
  unreadCount: number
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------
const toNotificationModel = (dto: NotificationItemResponse): NotificationModel => {
  return {
    notificationId: dto.notificationId,
    isRead: dto.isRead,
    occurredAt: new Date(dto.occurredAt),
    titleKey: dto.titleKey ?? null,
    bodyKey: dto.bodyKey,
    params: dto.params ?? {},
    linkType: toNotificationLinkTypeCode(dto.linkType),
    linkId: dto.linkId ?? null,
    aggregatedCount: dto.aggregatedCount,
  }
}

/**
 * 文字列をNotificationLinkTypeCodeに変換する。
 * code.constantsに定義されていない場合はNONEを返す。
 *
 * @param v 文字列
 * @returns NotificationLinkTypeCode
 */
function toNotificationLinkTypeCode(v: string): NotificationLinkTypeCode {
  const values = Object.values(NOTIFICATION_LINK_TYPE) as string[]
  return values.includes(v) ? (v as NotificationLinkTypeCode) : NOTIFICATION_LINK_TYPE.NONE
}
