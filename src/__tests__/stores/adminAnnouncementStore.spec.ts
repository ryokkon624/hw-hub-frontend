import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminAnnouncementStore } from '@/stores/adminAnnouncementStore'
import { adminApi } from '@/api/adminApi'
import type { AdminAnnouncementRequest } from '@/api/adminApi'
import type { AdminAnnouncementModel } from '@/domain'

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    fetchAdminAnnouncements: vi.fn(),
    fetchAdminAnnouncement: vi.fn(),
    createAdminAnnouncement: vi.fn(),
    updateAdminAnnouncement: vi.fn(),
    deleteAdminAnnouncement: vi.fn(),
  },
}))

describe('adminAnnouncementStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockAnnouncements: AdminAnnouncementModel[] = [
    {
      id: 1,
      titleJa: 'タイトル1',
      titleEn: 'Title1',
      titleEs: 'Titulo1',
      bodyJa: '本文1',
      bodyEn: 'Body1',
      bodyEs: 'Cuerpo1',
      severity: 'INFO',
      targetScope: 'ALL',
      startAt: '2026-05-01T00:00:00',
      endAt: '2026-05-31T00:00:00',
    },
  ]

  const dummyRequest: AdminAnnouncementRequest = {
    titleJa: 'タイトル',
    titleEn: 'Title',
    titleEs: 'Titulo',
    bodyJa: '本文',
    bodyEn: 'Body',
    bodyEs: 'Cuerpo',
    severity: 'INFO',
    targetScope: 'ALL',
    startAt: '2026-05-01T00:00:00',
    endAt: '2026-05-31T00:00:00',
  }

  describe('loadAll', () => {
    it('APIを呼び出してアナウンス一覧をロードする', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.fetchAdminAnnouncements).mockResolvedValue(mockAnnouncements)

      await store.loadAll()

      expect(adminApi.fetchAdminAnnouncements).toHaveBeenCalledTimes(1)
      expect(store.items).toEqual(mockAnnouncements)
      expect(store.isLoading).toBe(false)
    })

    it('ロード中は二重に呼び出さない', async () => {
      const store = useAdminAnnouncementStore()
      store.isLoading = true

      await store.loadAll()

      expect(adminApi.fetchAdminAnnouncements).not.toHaveBeenCalled()
    })

    it('エラーが発生しても isLoading が false になる', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.fetchAdminAnnouncements).mockRejectedValue(new Error('fail'))

      await expect(store.loadAll()).rejects.toThrow('fail')
      expect(store.isLoading).toBe(false)
    })

    it('ロード完了後に isLoaded が true になる', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.fetchAdminAnnouncements).mockResolvedValue(mockAnnouncements)

      expect(store.isLoaded).toBe(false)
      await store.loadAll()
      expect(store.isLoaded).toBe(true)
    })

    it('エラー発生時は isLoaded が false のまま', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.fetchAdminAnnouncements).mockRejectedValue(new Error('fail'))

      await expect(store.loadAll()).rejects.toThrow('fail')
      expect(store.isLoaded).toBe(false)
    })
  })

  describe('loadAllIfNeeded', () => {
    it('未ロード時はAPIを呼び出す', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.fetchAdminAnnouncements).mockResolvedValue(mockAnnouncements)

      await store.loadAllIfNeeded()

      expect(adminApi.fetchAdminAnnouncements).toHaveBeenCalledTimes(1)
      expect(store.items).toEqual(mockAnnouncements)
    })

    it('ロード済みの場合はAPIを呼び出さない', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.fetchAdminAnnouncements).mockResolvedValue(mockAnnouncements)

      await store.loadAllIfNeeded()
      vi.clearAllMocks()
      await store.loadAllIfNeeded()

      expect(adminApi.fetchAdminAnnouncements).not.toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('APIを呼び出してアナウンスを先頭に追加する', async () => {
      const store = useAdminAnnouncementStore()
      const newAnnouncement: AdminAnnouncementModel = {
        ...dummyRequest,
        id: 2,
      }
      vi.mocked(adminApi.createAdminAnnouncement).mockResolvedValue(newAnnouncement)

      const result = await store.create(dummyRequest)

      expect(adminApi.createAdminAnnouncement).toHaveBeenCalledWith(dummyRequest)
      expect(store.items[0]).toEqual(newAnnouncement)
      expect(result).toEqual(newAnnouncement)
      expect(store.isSubmitting).toBe(false)
    })

    it('エラーが発生しても isSubmitting が false になる', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.createAdminAnnouncement).mockRejectedValue(new Error('fail'))

      await expect(store.create(dummyRequest)).rejects.toThrow('fail')
      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('update', () => {
    it('APIを呼び出して既存のアナウンスを更新する', async () => {
      const store = useAdminAnnouncementStore()
      store.items = [{ ...mockAnnouncements[0]! }]
      vi.mocked(adminApi.updateAdminAnnouncement).mockResolvedValue()

      const updateReq = { ...dummyRequest, titleJa: '更新後' }
      await store.update(1, updateReq)

      expect(adminApi.updateAdminAnnouncement).toHaveBeenCalledWith(1, updateReq)
      expect(store.items[0]!.titleJa).toBe('更新後')
      expect(store.isSubmitting).toBe(false)
    })

    it('該当するアナウンスがない場合は items は変更されない', async () => {
      const store = useAdminAnnouncementStore()
      store.items = [{ ...mockAnnouncements[0]! }]
      vi.mocked(adminApi.updateAdminAnnouncement).mockResolvedValue()

      await store.update(999, dummyRequest)

      expect(store.items[0]!.titleJa).toBe('タイトル1')
      expect(store.isSubmitting).toBe(false)
    })

    it('エラーが発生しても isSubmitting が false になる', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.updateAdminAnnouncement).mockRejectedValue(new Error('fail'))

      await expect(store.update(1, dummyRequest)).rejects.toThrow('fail')
      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('remove', () => {
    it('APIを呼び出してアナウンスを削除する', async () => {
      const store = useAdminAnnouncementStore()
      store.items = [{ ...mockAnnouncements[0]! }]
      vi.mocked(adminApi.deleteAdminAnnouncement).mockResolvedValue()

      await store.remove(1)

      expect(adminApi.deleteAdminAnnouncement).toHaveBeenCalledWith(1)
      expect(store.items).toHaveLength(0)
      expect(store.isSubmitting).toBe(false)
    })

    it('エラーが発生しても isSubmitting が false になる', async () => {
      const store = useAdminAnnouncementStore()
      vi.mocked(adminApi.deleteAdminAnnouncement).mockRejectedValue(new Error('fail'))

      await expect(store.remove(1)).rejects.toThrow('fail')
      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('clear', () => {
    it('アナウンス一覧を空にする', () => {
      const store = useAdminAnnouncementStore()
      store.items = [...mockAnnouncements]

      store.clear()

      expect(store.items).toHaveLength(0)
    })
  })
})
