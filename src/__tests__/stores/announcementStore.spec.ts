import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnouncementStore } from '@/stores/announcementStore'
import { announcementApi } from '@/api/announcementApi'
import { ANNOUNCEMENT_SEVERITY, ANNOUNCEMENT_SCOPE } from '@/constants/code.constants'
import type { Announcement } from '@/domain'

vi.mock('@/api/announcementApi', () => ({
  announcementApi: {
    fetchActiveAnnouncements: vi.fn(),
  },
}))

// sessionStorage のモック
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

const makeAnnouncement = (overrides: Partial<Announcement> = {}): Announcement => ({
  id: 1,
  titleJa: 'タイトル',
  titleEn: 'Title',
  titleEs: 'Titulo',
  bodyJa: '本文',
  bodyEn: 'Body',
  bodyEs: 'Cuerpo',
  severity: ANNOUNCEMENT_SEVERITY.INFO,
  targetScope: ANNOUNCEMENT_SCOPE.ALL,
  startAt: '2026-05-01T00:00:00',
  endAt: '2026-06-01T00:00:00',
  ...overrides,
})

describe('announcementStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorageMock.clear()
    vi.clearAllMocks()
  })

  // ---- fetchActive ----

  it('fetchActive: API を呼び出し announcements に格納し isLoaded を true にする', async () => {
    const store = useAnnouncementStore()

    const mockData: Announcement[] = [
      makeAnnouncement({ id: 1, severity: ANNOUNCEMENT_SEVERITY.INFO }),
      makeAnnouncement({
        id: 2,
        severity: ANNOUNCEMENT_SEVERITY.WARNING,
        targetScope: ANNOUNCEMENT_SCOPE.HOME,
      }),
    ]

    vi.mocked(announcementApi.fetchActiveAnnouncements).mockResolvedValue(mockData)

    await store.fetchActive()

    expect(announcementApi.fetchActiveAnnouncements).toHaveBeenCalledTimes(1)
    expect(store.announcements).toHaveLength(2)
    expect(store.isLoaded).toBe(true)
  })

  it('fetchActive: API エラー時でも isLoaded は true になる（空配列）', async () => {
    const store = useAnnouncementStore()

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(announcementApi.fetchActiveAnnouncements).mockRejectedValue(new Error('network'))

    await store.fetchActive()

    expect(store.announcements).toHaveLength(0)
    expect(store.isLoaded).toBe(true)
    consoleSpy.mockRestore()
  })

  // ---- close ----

  it('close: 指定IDを closedIds に追加し sessionStorage に保存する', () => {
    const store = useAnnouncementStore()
    store.announcements = [makeAnnouncement({ id: 1 }), makeAnnouncement({ id: 2 })]

    store.close(1)

    expect(store.closedIds.has(1)).toBe(true)
    expect(store.closedIds.has(2)).toBe(false)

    const saved = JSON.parse(sessionStorageMock.getItem('hwhub.announcement.closed') ?? '[]')
    expect(saved).toContain(1)
  })

  // ---- toggleExpand ----

  it('toggleExpand: 閉じている場合は expandedIds に追加する', () => {
    const store = useAnnouncementStore()
    store.toggleExpand(1)
    expect(store.expandedIds.has(1)).toBe(true)
  })

  it('toggleExpand: 開いている場合は expandedIds から削除する', () => {
    const store = useAnnouncementStore()
    store.expandedIds.add(1)
    store.toggleExpand(1)
    expect(store.expandedIds.has(1)).toBe(false)
  })

  // ---- isExpanded ----

  it('isExpanded: 展開中のIDに対して true を返す', () => {
    const store = useAnnouncementStore()
    store.expandedIds.add(1)
    expect(store.isExpanded(1)).toBe(true)
  })

  it('isExpanded: 展開していないIDに対して false を返す', () => {
    const store = useAnnouncementStore()
    expect(store.isExpanded(1)).toBe(false)
  })

  it('isExpanded: toggleExpand で展開した後は true を返す', () => {
    const store = useAnnouncementStore()
    store.toggleExpand(1)
    expect(store.isExpanded(1)).toBe(true)
  })

  it('isExpanded: toggleExpand で折りたたんだ後は false を返す', () => {
    const store = useAnnouncementStore()
    store.expandedIds.add(1)
    store.toggleExpand(1)
    expect(store.isExpanded(1)).toBe(false)
  })

  // ---- visibleForRoute ----

  it('visibleForRoute: targetScope が ALL のアナウンスは currentScope に関わらず全ルートで表示される', () => {
    const store = useAnnouncementStore()
    store.announcements = [makeAnnouncement({ id: 1, targetScope: ANNOUNCEMENT_SCOPE.ALL })]

    const result = store.visibleForRoute('home', ANNOUNCEMENT_SCOPE.HOME)
    expect(result).toHaveLength(1)
  })

  it('visibleForRoute: currentScope が undefined の場合、targetScope === ALL のみ表示される', () => {
    const store = useAnnouncementStore()
    store.announcements = [
      makeAnnouncement({ id: 1, targetScope: ANNOUNCEMENT_SCOPE.ALL }),
      makeAnnouncement({ id: 2, targetScope: ANNOUNCEMENT_SCOPE.HOME }),
    ]

    const result = store.visibleForRoute('home', undefined)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(1)
  })

  it('visibleForRoute: currentScope が HOME のとき targetScope === HOME のアナウンスが表示される', () => {
    const store = useAnnouncementStore()
    store.announcements = [
      makeAnnouncement({ id: 1, targetScope: ANNOUNCEMENT_SCOPE.HOME }),
      makeAnnouncement({ id: 2, targetScope: ANNOUNCEMENT_SCOPE.MY_TASKS }),
    ]

    const homeResult = store.visibleForRoute('home', ANNOUNCEMENT_SCOPE.HOME)
    expect(homeResult).toHaveLength(1)
    expect(homeResult[0]!.id).toBe(1)

    const taskResult = store.visibleForRoute('housework.tasks', ANNOUNCEMENT_SCOPE.MY_TASKS)
    expect(taskResult).toHaveLength(1)
    expect(taskResult[0]!.id).toBe(2)
  })

  it('visibleForRoute: currentScope が SHOPPING のとき targetScope === MY_TASKS のアナウンスは表示されない', () => {
    const store = useAnnouncementStore()
    store.announcements = [makeAnnouncement({ id: 1, targetScope: ANNOUNCEMENT_SCOPE.MY_TASKS })]

    const result = store.visibleForRoute('shopping.new', ANNOUNCEMENT_SCOPE.SHOPPING)
    expect(result).toHaveLength(0)
  })

  it('visibleForRoute: close されたアナウンスは表示されない', () => {
    const store = useAnnouncementStore()
    store.announcements = [
      makeAnnouncement({ id: 1, targetScope: ANNOUNCEMENT_SCOPE.ALL }),
      makeAnnouncement({ id: 2, targetScope: ANNOUNCEMENT_SCOPE.ALL }),
    ]
    store.closedIds.add(1)

    const result = store.visibleForRoute('home', ANNOUNCEMENT_SCOPE.HOME)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(2)
  })

  it('visibleForRoute: currentScope と targetScope が一致するアナウンスは表示される', () => {
    const store = useAnnouncementStore()
    store.announcements = [
      makeAnnouncement({ id: 1, targetScope: ANNOUNCEMENT_SCOPE.HOUSEWORK_ASSIGN }),
    ]

    const result = store.visibleForRoute('housework.assign', ANNOUNCEMENT_SCOPE.HOUSEWORK_ASSIGN)
    expect(result).toHaveLength(1)
  })

  it('visibleForRoute: currentScope と targetScope が不一致のアナウンスは表示されない', () => {
    const store = useAnnouncementStore()
    store.announcements = [
      makeAnnouncement({ id: 1, targetScope: ANNOUNCEMENT_SCOPE.HOUSEWORK_ASSIGN }),
    ]

    const result = store.visibleForRoute('home', ANNOUNCEMENT_SCOPE.HOME)
    expect(result).toHaveLength(0)
  })

  // ---- reset ----

  it('reset: announcements / expandedIds / closedIds / isLoaded をリセットする', async () => {
    const store = useAnnouncementStore()
    store.announcements = [makeAnnouncement()]
    store.expandedIds.add(1)
    store.closedIds.add(1)

    store.reset()

    expect(store.announcements).toHaveLength(0)
    expect(store.expandedIds.size).toBe(0)
    expect(store.closedIds.size).toBe(0)
    expect(store.isLoaded).toBe(false)
  })
})
