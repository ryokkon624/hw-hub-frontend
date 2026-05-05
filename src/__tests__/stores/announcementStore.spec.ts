import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnouncementStore } from '@/stores/announcementStore'
import { announcementApi } from '@/api/announcementApi'
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
  severity: 'INFO',
  targetScope: 'ALL',
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
      makeAnnouncement({ id: 1, severity: 'INFO' }),
      makeAnnouncement({ id: 2, severity: 'WARN', targetScope: 'HOME' }),
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

  // ---- visibleForRoute ----

  it('visibleForRoute: targetScope が ALL のアナウンスは全ルートで表示される', () => {
    const store = useAnnouncementStore()
    store.announcements = [makeAnnouncement({ id: 1, targetScope: 'ALL' })]

    const result = store.visibleForRoute('home')
    expect(result).toHaveLength(1)
  })

  it('visibleForRoute: targetScope が HOME のアナウンスは home ルートのみ表示される', () => {
    const store = useAnnouncementStore()
    store.announcements = [
      makeAnnouncement({ id: 1, targetScope: 'HOME' }),
      makeAnnouncement({ id: 2, targetScope: 'HW_TASK' }),
    ]

    const homeResult = store.visibleForRoute('home')
    expect(homeResult).toHaveLength(1)
    expect(homeResult[0].id).toBe(1)

    const taskResult = store.visibleForRoute('housework.tasks')
    expect(taskResult).toHaveLength(1)
    expect(taskResult[0].id).toBe(2)
  })

  it('visibleForRoute: close されたアナウンスは表示されない', () => {
    const store = useAnnouncementStore()
    store.announcements = [
      makeAnnouncement({ id: 1, targetScope: 'ALL' }),
      makeAnnouncement({ id: 2, targetScope: 'ALL' }),
    ]
    store.closedIds.add(1)

    const result = store.visibleForRoute('home')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('visibleForRoute: ルートスコープと一致しないアナウンスは表示されない', () => {
    const store = useAnnouncementStore()
    store.announcements = [makeAnnouncement({ id: 1, targetScope: 'HW_ASSIGN' })]

    const result = store.visibleForRoute('home')
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
