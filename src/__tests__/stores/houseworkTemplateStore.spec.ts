import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHouseworkTemplateStore } from '@/stores/houseworkTemplateStore'
import { houseworkTemplateApi } from '@/api/houseworkTemplateApi'
import type { HouseworkTemplateModel } from '@/domain'

vi.mock('@/api/houseworkTemplateApi', () => ({
  houseworkTemplateApi: {
    fetchAll: vi.fn(),
  },
}))

const mockedApi = vi.mocked(houseworkTemplateApi, true)

describe('houseworkTemplateStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期状態が正しいこと', () => {
    const store = useHouseworkTemplateStore()
    expect(store.templates).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.loaded).toBe(false)
  })

  describe('loadAllIfNeeded', () => {
    it('まだロードされていない場合、APIを呼び出してtemplatesを更新する', async () => {
      const mockTemplates: HouseworkTemplateModel[] = [
        {
          houseworkTemplateId: 1,
          nameJa: 'T1',
          nameEn: 'E1',
          nameEs: 'S1',
          descriptionJa: null,
          descriptionEn: null,
          descriptionEs: null,
          recommendationJa: null,
          recommendationEn: null,
          recommendationEs: null,
          category: 'CLEAN',
          recurrenceType: 'WEEKLY',
          weeklyDays: 1,
          dayOfMonth: null,
          nthWeek: null,
          weekday: null,
        },
      ]
      mockedApi.fetchAll.mockResolvedValue(mockTemplates)

      const store = useHouseworkTemplateStore()
      await store.loadAllIfNeeded()

      expect(mockedApi.fetchAll).toHaveBeenCalledTimes(1)
      expect(store.templates).toEqual(mockTemplates)
      expect(store.loaded).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('すでにロードされている場合、APIを呼び出さない', async () => {
      const store = useHouseworkTemplateStore()
      const mockTemplates: HouseworkTemplateModel[] = [
        {
          houseworkTemplateId: 1,
          nameJa: 'T1',
          nameEn: 'E1',
          nameEs: 'S1',
          descriptionJa: null,
          descriptionEn: null,
          descriptionEs: null,
          recommendationJa: null,
          recommendationEn: null,
          recommendationEs: null,
          category: 'CLEAN',
          recurrenceType: 'WEEKLY',
          weeklyDays: 1,
          dayOfMonth: null,
          nthWeek: null,
          weekday: null,
        },
      ]
      store.loaded = true
      store.templates = mockTemplates

      await store.loadAllIfNeeded()

      expect(mockedApi.fetchAll).not.toHaveBeenCalled()
    })

    it('ロード中の場合、APIを呼び出さない', async () => {
      const store = useHouseworkTemplateStore()
      store.isLoading = true

      await store.loadAllIfNeeded()

      expect(mockedApi.fetchAll).not.toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('状態をリセットする', () => {
      const store = useHouseworkTemplateStore()
      const mockTemplates: HouseworkTemplateModel[] = [
        {
          houseworkTemplateId: 1,
          nameJa: 'T1',
          nameEn: 'E1',
          nameEs: 'S1',
          descriptionJa: null,
          descriptionEn: null,
          descriptionEs: null,
          recommendationJa: null,
          recommendationEn: null,
          recommendationEs: null,
          category: 'CLEAN',
          recurrenceType: 'WEEKLY',
          weeklyDays: 1,
          dayOfMonth: null,
          nthWeek: null,
          weekday: null,
        },
      ]
      store.templates = mockTemplates
      store.loaded = true

      store.clear()

      expect(store.templates).toEqual([])
      expect(store.loaded).toBe(false)
    })
  })
})
