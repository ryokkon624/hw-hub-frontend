import { defineStore } from 'pinia'
import type { Announcement } from '@/domain'
import { announcementApi } from '@/api/announcementApi'

const CLOSED_IDS_KEY = 'hwhub.announcement.closed'

/** target_scope コード値 → 対応するルート名のマッピング */
const SCOPE_TO_ROUTE_MAP: Record<string, string> = {
  HOME: 'home',
  HW_ASSIGN: 'housework.assign',
  HW_TASK: 'housework.tasks',
  HW_CONF: 'settings.housework',
  SHOPPING: 'shopping',
  CONF_ACCT: 'settings.account',
  CONF_HH: 'settings.household',
  CONF_APP: 'settings.app',
  NOTIFY: 'notifications',
  INQUIRY: 'settings.inquiry',
  ADMIN: 'admin',
}

interface AnnouncementState {
  announcements: Announcement[]
  expandedIds: Set<number>
  closedIds: Set<number>
  isLoaded: boolean
}

export const useAnnouncementStore = defineStore('announcement', {
  state: (): AnnouncementState => ({
    announcements: [],
    expandedIds: new Set<number>(),
    closedIds: loadClosedIdsFromSession(),
    isLoaded: false,
  }),

  getters: {
    /**
     * 指定ルート名に表示すべきアナウンス一覧を返す。
     * - targetScope が 'ALL' の場合は全ルートで表示
     * - targetScope が特定スコープの場合は対応するルート名と一致する場合のみ表示
     * - closedIds に含まれるアナウンスは除外する
     */
    visibleForRoute:
      (state) =>
      (routeName: string): Announcement[] => {
        return state.announcements.filter((a) => {
          if (state.closedIds.has(a.id)) return false
          if (a.targetScope === 'ALL') return true
          const mappedRoute = SCOPE_TO_ROUTE_MAP[a.targetScope]
          return mappedRoute === routeName
        })
      },
  },

  actions: {
    /**
     * 現在有効なアナウンスを取得する。
     */
    async fetchActive() {
      try {
        this.announcements = await announcementApi.fetchActiveAnnouncements()
      } catch (e: unknown) {
        console.error(e)
        this.announcements = []
      } finally {
        this.isLoaded = true
      }
    },

    /**
     * アナウンスの展開/折りたたみを切り替える。
     * @param id アナウンスID
     */
    toggleExpand(id: number) {
      if (this.expandedIds.has(id)) {
        this.expandedIds.delete(id)
      } else {
        this.expandedIds.add(id)
      }
    },

    /**
     * アナウンスを閉じる。閉じたIDはsessionStorageに保存し次回ログインまで非表示にする。
     * @param id アナウンスID
     */
    close(id: number) {
      this.closedIds.add(id)
      saveClosedIdsToSession(this.closedIds)
    },

    /**
     * ログアウト時などにストアをリセットする。
     */
    reset() {
      this.announcements = []
      this.expandedIds = new Set<number>()
      this.closedIds = new Set<number>()
      this.isLoaded = false
    },
  },
})

// ---- sessionStorage ユーティリティ ----

function loadClosedIdsFromSession(): Set<number> {
  try {
    const raw = sessionStorage.getItem(CLOSED_IDS_KEY)
    if (!raw) return new Set<number>()
    const ids = JSON.parse(raw) as number[]
    return new Set(ids)
  } catch {
    return new Set<number>()
  }
}

function saveClosedIdsToSession(ids: Set<number>): void {
  sessionStorage.setItem(CLOSED_IDS_KEY, JSON.stringify([...ids]))
}
