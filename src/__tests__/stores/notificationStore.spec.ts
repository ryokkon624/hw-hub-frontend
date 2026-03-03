import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/notificationStore'
import { notificationApi } from '@/api/notificationApi'
import { NOTIFICATION_LINK_TYPE } from '@/constants/code.constants'
import { SHORT_CACHE_TTL_MS } from '@/constants/cache.constants'

vi.mock('@/api/notificationApi', () => ({
  notificationApi: {
    fetchNotifications: vi.fn(),
    fetchUnreadCount: vi.fn(),
  },
}))

describe('notificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  const createNotification = (id: number, isRead = false) => ({
    notificationId: id,
    isRead,
    occurredAt: new Date(),
    titleKey: 'title',
    bodyKey: 'body',
    params: {},
    linkType: NOTIFICATION_LINK_TYPE.MY_TASKS,
    linkId: null,
    aggregatedCount: 1,
  })

  describe('loadLatest', () => {
    it('最新の通知を取得し、itemsとlastFetchedAtを更新する', async () => {
      const store = useNotificationStore()
      const notifications = [createNotification(1), createNotification(2)]
      vi.mocked(notificationApi.fetchNotifications).mockResolvedValue(notifications)

      const promise = store.loadLatest(20, true)

      expect(store.isLoading).toBe(true)
      await promise

      expect(store.isLoading).toBe(false)
      expect(store.items).toEqual(notifications)
      expect(store.lastFetchedAt).toBeInstanceOf(Date)
      expect(store.latestItems).toEqual(notifications) // getterの確認
      expect(notificationApi.fetchNotifications).toHaveBeenCalledWith({ limit: 20, markRead: true })
    })

    it('既にisLoadingがtrueの場合は何もしない', async () => {
      const store = useNotificationStore()
      store.isLoading = true

      await store.loadLatest()

      expect(notificationApi.fetchNotifications).not.toHaveBeenCalled()
    })

    it('SHORT_CACHE_TTL_MS経過前に再呼び出しした場合はAPI通信を行わない', async () => {
      const store = useNotificationStore()
      store.lastFetchedAt = new Date(Date.now() - (SHORT_CACHE_TTL_MS - 1000)) // TTL内

      await store.loadLatest()

      expect(notificationApi.fetchNotifications).not.toHaveBeenCalled()
    })

    it('SHORT_CACHE_TTL_MS経過後に再呼び出しした場合はAPI通信を行う', async () => {
      const store = useNotificationStore()
      const notifications = [createNotification(1)]
      vi.mocked(notificationApi.fetchNotifications).mockResolvedValue(notifications)
      store.lastFetchedAt = new Date(Date.now() - (SHORT_CACHE_TTL_MS + 1000)) // TTL経過後

      await store.loadLatest()

      expect(notificationApi.fetchNotifications).toHaveBeenCalled()
      expect(store.items).toEqual(notifications)
    })

    it('API通信でエラーが発生した場合、isLoadingがfalseに戻る', async () => {
      const store = useNotificationStore()
      vi.mocked(notificationApi.fetchNotifications).mockRejectedValue(new Error('API error'))

      await expect(store.loadLatest()).rejects.toThrow('API error')

      expect(store.isLoading).toBe(false)
    })
  })

  describe('refreshUnreadCount', () => {
    it('未読件数を取得して更新する', async () => {
      const store = useNotificationStore()
      vi.mocked(notificationApi.fetchUnreadCount).mockResolvedValue(5)
      store.unreadCount = 2 // 前回の未読件数

      const promise = store.refreshUnreadCount()

      expect(store.isUnreadCountLoading).toBe(true)
      await promise

      expect(store.isUnreadCountLoading).toBe(false)
      expect(store.previousUnreadCount).toBe(2)
      expect(store.unreadCount).toBe(5)
      expect(store.lastUnreadCountFetchedAt).toBeInstanceOf(Date)
      expect(notificationApi.fetchUnreadCount).toHaveBeenCalled()
    })

    it('未読件数が増加した場合はanimateBellが呼ばれる', async () => {
      const store = useNotificationStore()
      vi.mocked(notificationApi.fetchUnreadCount).mockResolvedValue(3)
      store.unreadCount = 1
      const animateBellSpy = vi.spyOn(store, 'animateBell')

      await store.refreshUnreadCount()

      expect(animateBellSpy).toHaveBeenCalled()
    })

    it('未読件数が増加しなかった場合はanimateBellは呼ばれない', async () => {
      const store = useNotificationStore()
      vi.mocked(notificationApi.fetchUnreadCount).mockResolvedValue(3)
      store.unreadCount = 3
      const animateBellSpy = vi.spyOn(store, 'animateBell')

      await store.refreshUnreadCount()

      expect(animateBellSpy).not.toHaveBeenCalled()
    })

    it('既にisUnreadCountLoadingがtrueの場合は何もしない', async () => {
      const store = useNotificationStore()
      store.isUnreadCountLoading = true

      await store.refreshUnreadCount()

      expect(notificationApi.fetchUnreadCount).not.toHaveBeenCalled()
    })

    it('SHORT_CACHE_TTL_MS経過前に再呼び出しした場合はAPI通信を行わない（force = false）', async () => {
      const store = useNotificationStore()
      store.lastUnreadCountFetchedAt = new Date(Date.now() - (SHORT_CACHE_TTL_MS - 1000))

      await store.refreshUnreadCount(false)

      expect(notificationApi.fetchUnreadCount).not.toHaveBeenCalled()
    })

    it('SHORT_CACHE_TTL_MS経過前でもforceオプションが指定されている場合はAPI通信を行う', async () => {
      const store = useNotificationStore()
      store.lastUnreadCountFetchedAt = new Date(Date.now() - (SHORT_CACHE_TTL_MS - 1000))
      vi.mocked(notificationApi.fetchUnreadCount).mockResolvedValue(1)

      await store.refreshUnreadCount(true)

      expect(notificationApi.fetchUnreadCount).toHaveBeenCalled()
    })

    it('API通信でエラーが発生した場合、isUnreadCountLoadingがfalseに戻る', async () => {
      const store = useNotificationStore()
      vi.mocked(notificationApi.fetchUnreadCount).mockRejectedValue(new Error('API error'))

      await expect(store.refreshUnreadCount()).rejects.toThrow('API error')

      expect(store.isUnreadCountLoading).toBe(false)
    })
  })

  describe('animateBell', () => {
    it('ベルをアニメーションさせる', () => {
      // requestAnimationFrameのモック化
      const originalRAF = globalThis.requestAnimationFrame
      let rafCallback: FrameRequestCallback | null = null
      globalThis.requestAnimationFrame = vi.fn((cb) => {
        rafCallback = cb
        return 1
      })

      const store = useNotificationStore()
      store.animateBell()

      expect(store.shouldAnimateBell).toBe(false)

      // requestAnimationFrameのコールバック実行
      if (rafCallback) {
        ;(rafCallback as FrameRequestCallback)(0)
      }

      expect(store.shouldAnimateBell).toBe(true)

      // setTimeoutの実行
      vi.runAllTimers()

      expect(store.shouldAnimateBell).toBe(false)

      // 元に戻す
      globalThis.requestAnimationFrame = originalRAF
    })
  })

  describe('resetBellAnimation', () => {
    it('ベルのアニメーションをリセットする', () => {
      const store = useNotificationStore()
      store.shouldAnimateBell = true

      store.resetBellAnimation()

      expect(store.shouldAnimateBell).toBe(false)
    })
  })

  describe('markAsReadLocally', () => {
    it('指定したIDの通知を既読にし、unreadCountをデクリメントする', () => {
      const store = useNotificationStore()
      store.items = [createNotification(1, false), createNotification(2, false)]
      store.unreadCount = 2

      store.markAsReadLocally(1)

      expect(store.items[0]?.isRead).toBe(true)
      expect(store.items[1]?.isRead).toBe(false)
      expect(store.unreadCount).toBe(1)
    })

    it('存在しないIDを指定した場合は何も起きない', () => {
      const store = useNotificationStore()
      store.items = [createNotification(1, false)]
      store.unreadCount = 1

      store.markAsReadLocally(2)

      expect(store.items[0]?.isRead).toBe(false)
      expect(store.unreadCount).toBe(1)
    })

    it('既に既読の通知を指定した場合はunreadCountはデクリメントされない', () => {
      const store = useNotificationStore()
      store.items = [createNotification(1, true)]
      store.unreadCount = 1

      store.markAsReadLocally(1)

      expect(store.items[0]?.isRead).toBe(true)
      expect(store.unreadCount).toBe(1)
    })

    it('unreadCountが0の場合はデクリメントされない', () => {
      const store = useNotificationStore()
      store.items = [createNotification(1, false)]
      store.unreadCount = 0 // 万が一ズレて0以下になっていた場合を想定

      store.markAsReadLocally(1)

      expect(store.items[0]?.isRead).toBe(true)
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('clear', () => {
    it('全ての状態を初期値にリセットする', () => {
      const store = useNotificationStore()

      // 事前に状態を変更しておく
      store.items = [createNotification(1), createNotification(2)]
      store.lastFetchedAt = new Date()
      store.unreadCount = 5
      store.lastUnreadCountFetchedAt = new Date()
      store.previousUnreadCount = 3
      store.isLoading = true
      store.isUnreadCountLoading = true
      store.shouldAnimateBell = true

      store.clear()

      expect(store.items).toEqual([])
      expect(store.lastFetchedAt).toBeNull()
      expect(store.unreadCount).toBe(0)
      expect(store.lastUnreadCountFetchedAt).toBeNull()
      expect(store.previousUnreadCount).toBe(0)
      expect(store.isLoading).toBe(false)
      expect(store.isUnreadCountLoading).toBe(false)
      expect(store.shouldAnimateBell).toBe(false)
    })
  })
})
