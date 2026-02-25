import type { NotificationLinkTypeCode } from '@/constants/code.constants'

export type NotificationModel = {
  notificationId: number
  isRead: boolean
  occurredAt: Date
  titleKey: string | null
  bodyKey: string
  params: Record<string, unknown>
  linkType: NotificationLinkTypeCode
  linkId: number | null
  aggregatedCount: number
}
