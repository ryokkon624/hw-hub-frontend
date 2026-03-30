import { describe, it, expect, vi, beforeEach } from 'vitest'
import { houseworkTemplateApi } from '@/api/houseworkTemplateApi'
import { apiClient } from '@/api/client'
import type { HouseworkTemplateModel } from '@/domain'

type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('houseworkTemplateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchAll', () => {
    it('GET /api/housework-templates して DTO を Domain Model[] に変換して返す', async () => {
      const mockDto = {
        houseworkTemplateId: 100,
        nameJa: '掃除',
        nameEn: 'Cleaning',
        nameEs: 'Limpieza',
        descriptionJa: '部屋の掃除です',
        descriptionEn: 'Room cleaning',
        descriptionEs: 'Limpieza de la habitación',
        recommendationJa: '週に一度',
        recommendationEn: 'Once a week',
        recommendationEs: 'Una vez por semana',
        category: 'CLEAN',
        recurrenceType: 'WEEKLY',
        weeklyDays: 1,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
      }

      mockedClient.get.mockResolvedValue({
        data: [mockDto],
      })

      const result = await houseworkTemplateApi.fetchAll()

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/housework-templates')

      const expected: HouseworkTemplateModel[] = [
        {
          houseworkTemplateId: 100,
          nameJa: '掃除',
          nameEn: 'Cleaning',
          nameEs: 'Limpieza',
          descriptionJa: '部屋の掃除です',
          descriptionEn: 'Room cleaning',
          descriptionEs: 'Limpieza de la habitación',
          recommendationJa: '週に一度',
          recommendationEn: 'Once a week',
          recommendationEs: 'Una vez por semana',
          category: 'CLEAN',
          recurrenceType: 'WEEKLY',
          weeklyDays: 1,
          dayOfMonth: null,
          nthWeek: null,
          weekday: null,
        },
      ]

      expect(result).toEqual(expected)
    })
  })
})
