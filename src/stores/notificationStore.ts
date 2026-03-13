import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notificationApi'
import type { NotificationModel } from '@/domain'
import { SHORT_CACHE_TTL_MS } from '@/constants/cache.constants'

interface NotificationStoreState {
  items: NotificationModel[]
  isLoading: boolean
  lastFetchedAt: Date | null
  unreadCount: number
  isUnreadCountLoading: boolean
  lastUnreadCountFetchedAt: Date | null
  previousUnreadCount: number
  shouldAnimateBell: boolean
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationStoreState => ({
    items: [] as NotificationModel[],
    isLoading: false,
    lastFetchedAt: null as Date | null,
    unreadCount: 0,
    isUnreadCountLoading: false,
    lastUnreadCountFetchedAt: null as Date | null,
    previousUnreadCount: 0,
    shouldAnimateBell: false,
  }),

  getters: {
    latestItems(state): NotificationModel[] {
      return state.items
    },
  },

  actions: {
    async loadLatest(limit = 20, markRead = true) {
      if (this.isLoading) return

      // 連打防止
      const now = Date.now()
      const last = this.lastFetchedAt
      if (last && now - last.getTime() < SHORT_CACHE_TTL_MS) {
        return
      }

      this.isLoading = true
      try {
        const items = await notificationApi.fetchNotifications({ limit, markRead })
        this.items = items
        this.lastFetchedAt = new Date()
      } finally {
        this.isLoading = false
      }
    },

    async refreshUnreadCount(force = false) {
      if (this.isUnreadCountLoading) return

      const now = Date.now()
      const last = this.lastUnreadCountFetchedAt
      if (!force && last && now - last.getTime() < SHORT_CACHE_TTL_MS) {
        return
      }

      this.isUnreadCountLoading = true

      try {
        const prev = this.unreadCount
        const next = await notificationApi.fetchUnreadCount()

        this.previousUnreadCount = prev
        this.unreadCount = next
        this.lastUnreadCountFetchedAt = new Date()

        if (next > prev) {
          this.animateBell()
        }
      } finally {
        this.isUnreadCountLoading = false
      }
    },

    animateBell() {
      // 連続通知でも確実に再発火させる
      this.shouldAnimateBell = false
      requestAnimationFrame(() => {
        this.shouldAnimateBell = true
        window.setTimeout(() => {
          this.shouldAnimateBell = false
        }, 1500)
      })
    },

    resetBellAnimation() {
      this.shouldAnimateBell = false
    },

    markAsReadLocally(notificationId: number) {
      const item = this.latestItems.find((i) => i.notificationId === notificationId)
      if (item && !item.isRead) {
        item.isRead = true
        if (this.unreadCount > 0) {
          this.unreadCount -= 1
        }
      }
    },

    clear() {
      this.items = []
      this.lastFetchedAt = null
      this.unreadCount = 0
      this.lastUnreadCountFetchedAt = null
      this.previousUnreadCount = 0
      this.isLoading = false
      this.isUnreadCountLoading = false
      this.shouldAnimateBell = false
    },
  },
})
