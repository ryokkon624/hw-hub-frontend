import { defineStore } from 'pinia'
import type { Announcement } from '@/domain'
import { announcementApi } from '@/api/announcementApi'
import { ANNOUNCEMENT_SCOPE } from '@/constants/code.constants'
import type { AnnouncementScopeCode } from '@/constants/code.constants'

const CLOSED_IDS_KEY = 'hwhub.announcement.closed'

/** target_scope コード値 → 対応するルート名のマッピング */
const SCOPE_TO_ROUTE_MAP: Record<AnnouncementScopeCode, string> = {
  [ANNOUNCEMENT_SCOPE.ALL]: '',
  [ANNOUNCEMENT_SCOPE.HOME]: 'home',
  [ANNOUNCEMENT_SCOPE.HW_ASSIGN]: 'housework.assign',
  [ANNOUNCEMENT_SCOPE.HW_TASK]: 'housework.tasks',
  [ANNOUNCEMENT_SCOPE.HW_CONF]: 'settings.housework',
  [ANNOUNCEMENT_SCOPE.SHOPPING]: 'shopping',
  [ANNOUNCEMENT_SCOPE.CONF_ACCT]: 'settings.account',
  [ANNOUNCEMENT_SCOPE.CONF_HH]: 'settings.household',
  [ANNOUNCEMENT_SCOPE.CONF_APP]: 'settings.app',
  [ANNOUNCEMENT_SCOPE.NOTIFY]: 'notifications',
  [ANNOUNCEMENT_SCOPE.INQUIRY]: 'settings.inquiry',
  [ANNOUNCEMENT_SCOPE.ADMIN]: 'admin',
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
     * 指定IDのアナウンスが展開中かどうかを返す。
     * @param id アナウンスID
     */
    isExpanded:
      (state) =>
      (id: number): boolean => {
        return state.expandedIds.has(id)
      },

    /**
     * 指定ルート名と現在の featureScope に表示すべきアナウンス一覧を返す。
     * - targetScope が 'ALL' の場合は全ルートで表示
     * - currentScope が指定されている場合は targetScope === currentScope の場合のみ表示
     * - currentScope が未定義（featureScope 未設定のルート）の場合は ALL のみ表示
     * - closedIds に含まれるアナウンスは除外する
     * @param routeName 現在のルート名（未使用だが AnnouncementBanner.vue との互換性のため残す）
     * @param currentScope 現在のルートの featureScope
     */
    visibleForRoute:
      (state) =>
      (routeName: string, currentScope?: AnnouncementScopeCode): Announcement[] => {
        return state.announcements.filter((a) => {
          if (state.closedIds.has(a.id)) return false
          if (a.targetScope === ANNOUNCEMENT_SCOPE.ALL) return true
          if (!currentScope) return false
          return a.targetScope === currentScope
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
