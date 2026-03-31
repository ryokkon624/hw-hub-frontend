import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminHouseworkTemplateStore } from '@/stores/adminHouseworkTemplateStore'
import { adminApi } from '@/api/adminApi'
import type { AdminHouseworkTemplateRequest } from '@/api/adminApi'
import type { AdminHouseworkTemplateModel } from '@/domain'

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    fetchAdminHouseworkTemplates: vi.fn(),
    createAdminHouseworkTemplate: vi.fn(),
    updateAdminHouseworkTemplate: vi.fn(),
    deleteAdminHouseworkTemplate: vi.fn(),
  },
}))

describe('adminHouseworkTemplateStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockTemplates: AdminHouseworkTemplateModel[] = [
    {
      houseworkTemplateId: 1,
      nameJa: 'テンプレート1',
      nameEn: 'Template 1',
      nameEs: 'Plantilla 1',
      descriptionJa: '説明1',
      descriptionEn: null,
      descriptionEs: null,
      recommendationJa: null,
      recommendationEn: null,
      recommendationEs: null,
      category: '1',
      recurrenceType: '1',
      weeklyDays: 1,
      dayOfMonth: null,
      nthWeek: null,
      weekday: null,
    },
  ]

  const dummyRequest: AdminHouseworkTemplateRequest = {
    nameJa: 'テスト',
    nameEn: 'Test',
    nameEs: 'Test',
    descriptionJa: null,
    descriptionEn: null,
    descriptionEs: null,
    recommendationJa: null,
    recommendationEn: null,
    recommendationEs: null,
    category: '1',
    recurrenceType: '1',
    weeklyDays: null,
    dayOfMonth: null,
    nthWeek: null,
    weekday: null,
  }

  describe('loadAll', () => {
    it('APIを呼び出してアイテムをロードする', async () => {
      const store = useAdminHouseworkTemplateStore()
      vi.mocked(adminApi.fetchAdminHouseworkTemplates).mockResolvedValue(mockTemplates)

      await store.loadAll()

      expect(adminApi.fetchAdminHouseworkTemplates).toHaveBeenCalledTimes(1)
      expect(store.items).toEqual(mockTemplates)
      expect(store.isLoading).toBe(false)
    })

    it('ロード中は二重に呼び出さない', async () => {
      const store = useAdminHouseworkTemplateStore()
      store.isLoading = true

      await store.loadAll()

      expect(adminApi.fetchAdminHouseworkTemplates).not.toHaveBeenCalled()
    })

    it('エラーが発生しても isLoading が false になる', async () => {
      const store = useAdminHouseworkTemplateStore()
      vi.mocked(adminApi.fetchAdminHouseworkTemplates).mockRejectedValue(new Error('fail'))

      await expect(store.loadAll()).rejects.toThrow('fail')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('create', () => {
    it('APIを呼び出してアイテムを追加する', async () => {
      const store = useAdminHouseworkTemplateStore()
      const newTemplate = {
        ...mockTemplates[0]!,
        houseworkTemplateId: 2,
      } as AdminHouseworkTemplateModel
      vi.mocked(adminApi.createAdminHouseworkTemplate).mockResolvedValue(newTemplate)

      const req: AdminHouseworkTemplateRequest = {
        ...dummyRequest,
        nameJa: '新規',
        nameEn: 'New',
        nameEs: 'Nuevo',
      }
      const result = await store.create(req)

      expect(adminApi.createAdminHouseworkTemplate).toHaveBeenCalledWith(req)
      expect(store.items[0]).toEqual(newTemplate)
      expect(result).toEqual(newTemplate)
      expect(store.isSubmitting).toBe(false)
    })

    it('エラーが発生しても isSubmitting が false になる', async () => {
      const store = useAdminHouseworkTemplateStore()
      vi.mocked(adminApi.createAdminHouseworkTemplate).mockRejectedValue(new Error('fail'))

      await expect(store.create(dummyRequest)).rejects.toThrow('fail')
      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('update', () => {
    it('APIを呼び出して既存のアイテムを更新する', async () => {
      const store = useAdminHouseworkTemplateStore()
      store.items = [{ ...mockTemplates[0]! } as AdminHouseworkTemplateModel]
      vi.mocked(adminApi.updateAdminHouseworkTemplate).mockResolvedValue()

      const updateReq: AdminHouseworkTemplateRequest = {
        ...dummyRequest,
        nameJa: '更新後',
      }
      await store.update(1, updateReq)

      expect(adminApi.updateAdminHouseworkTemplate).toHaveBeenCalledWith(1, updateReq)
      expect(store.items[0]!.nameJa).toBe('更新後')
      expect(store.isSubmitting).toBe(false)
    })

    it('該当するアイテムがない場合は items は変更されない', async () => {
      const store = useAdminHouseworkTemplateStore()
      store.items = [{ ...mockTemplates[0]! } as AdminHouseworkTemplateModel]
      vi.mocked(adminApi.updateAdminHouseworkTemplate).mockResolvedValue()

      const updateReq: AdminHouseworkTemplateRequest = {
        ...dummyRequest,
        nameJa: '不明',
      }
      await store.update(999, updateReq)

      expect(store.items[0]!.nameJa).toBe('テンプレート1')
      expect(store.isSubmitting).toBe(false)
    })

    it('エラーが発生しても isSubmitting が false になる', async () => {
      const store = useAdminHouseworkTemplateStore()
      vi.mocked(adminApi.updateAdminHouseworkTemplate).mockRejectedValue(new Error('fail'))

      await expect(store.update(1, dummyRequest)).rejects.toThrow('fail')
      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('remove', () => {
    it('APIを呼び出してアイテムを削除する', async () => {
      const store = useAdminHouseworkTemplateStore()
      store.items = [{ ...mockTemplates[0]! } as AdminHouseworkTemplateModel]
      vi.mocked(adminApi.deleteAdminHouseworkTemplate).mockResolvedValue()

      await store.remove(1)

      expect(adminApi.deleteAdminHouseworkTemplate).toHaveBeenCalledWith(1)
      expect(store.items).toHaveLength(0)
      expect(store.isSubmitting).toBe(false)
    })

    it('エラーが発生しても isSubmitting が false になる', async () => {
      const store = useAdminHouseworkTemplateStore()
      vi.mocked(adminApi.deleteAdminHouseworkTemplate).mockRejectedValue(new Error('fail'))

      await expect(store.remove(1)).rejects.toThrow('fail')
      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('clear', () => {
    it('アイテムを空にする', () => {
      const store = useAdminHouseworkTemplateStore()
      store.items = [...mockTemplates]

      store.clear()

      expect(store.items).toHaveLength(0)
    })
  })
})
