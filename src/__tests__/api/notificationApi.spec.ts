import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notificationApi } from '@/api/notificationApi'
import { apiClient } from '@/api/client'
import { NOTIFICATION_LINK_TYPE } from '@/constants/code.constants'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('notificationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchNotifications', () => {
    it('APIから通知一覧を取得し、NotificationModelの配列にマッピングして返す（デフォルトパラメータ）', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              notificationId: 1,
              isRead: false,
              occurredAt: '2026-02-25T12:00:00Z',
              titleKey: 'test.title',
              bodyKey: 'test.body',
              params: { key: 'value' },
              linkType: NOTIFICATION_LINK_TYPE.MY_TASKS,
              linkId: 10,
              aggregatedCount: 1,
            },
            {
              notificationId: 2,
              isRead: true,
              occurredAt: '2026-02-25T13:00:00Z',
              titleKey: null,
              bodyKey: 'test.body2',
              params: null,
              linkType: 'UNKNOWN_TYPE',
              linkId: null,
              aggregatedCount: 5,
            },
          ],
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await notificationApi.fetchNotifications()

      // APIコールの引数確認（デフォルト値が使われていること）
      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: {
          limit: 20,
          markRead: true,
        },
      })

      // マッピング結果の確認
      expect(result).toHaveLength(2)

      // 1件目の確認
      expect(result[0]).toEqual({
        notificationId: 1,
        isRead: false,
        occurredAt: new Date('2026-02-25T12:00:00Z'),
        titleKey: 'test.title',
        bodyKey: 'test.body',
        params: { key: 'value' },
        linkType: NOTIFICATION_LINK_TYPE.MY_TASKS,
        linkId: 10,
        aggregatedCount: 1,
      })

      // 2件目の確認（null系の処理とUNKNOWN_TYPEのフォールバック）
      expect(result[1]).toEqual({
        notificationId: 2,
        isRead: true,
        occurredAt: new Date('2026-02-25T13:00:00Z'),
        titleKey: null,
        bodyKey: 'test.body2',
        params: {}, // nullだった場合は空のオブジェクトになること
        linkType: NOTIFICATION_LINK_TYPE.NONE, // 未知のリンクタイプはNONEになること
        linkId: null,
        aggregatedCount: 5,
      })
    })

    it('パラメータが指定された場合は、そのパラメータでAPIをコールする', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { items: [] } })

      await notificationApi.fetchNotifications({ limit: 50, markRead: false })

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: {
          limit: 50,
          markRead: false,
        },
      })
    })
  })

  describe('fetchUnreadCount', () => {
    it('APIから未読件数を取得して返す', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          unreadCount: 3,
        },
      })

      const result = await notificationApi.fetchUnreadCount()

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications/unread-count')
      expect(result).toBe(3)
    })
  })
})
