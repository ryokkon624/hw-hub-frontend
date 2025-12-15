import { describe, it, expect, vi, beforeEach } from 'vitest'
import { houseworkApi } from '@/api/houseworkApi'
import { apiClient } from '@/api/client'
import type { Housework, HouseworkSaveInput } from '@/domain'
import { CATEGORY, RECURRENCE_TYPE } from '@/constants/code.constants'

type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('houseworkApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const baseDto = {
    houseworkId: 10,
    householdId: 1,
    name: 'テスト家事',
    description: '説明',
    category: CATEGORY.OTHER,
    recurrenceType: RECURRENCE_TYPE.WEEKLY,
    weeklyDays: 3,
    dayOfMonth: null,
    nthWeek: null,
    weekday: null,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    defaultAssigneeUserId: 99,
  }

  describe('fetchHouseworks', () => {
    it('GET /api/houseworks?householdId=... して DTO を Domain Model[] に変換して返す', async () => {
      mockedClient.get.mockResolvedValue({
        data: [baseDto],
      })

      const result = await houseworkApi.fetchHouseworks(1)

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/houseworks', {
        params: { householdId: 1 },
      })

      const expected: Housework[] = [
        {
          houseworkId: 10,
          householdId: 1,
          name: 'テスト家事',
          description: '説明',
          category: CATEGORY.OTHER,
          recurrenceType: RECURRENCE_TYPE.WEEKLY,
          weeklyDays: 3,
          dayOfMonth: null,
          nthWeek: null,
          weekday: null,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          defaultAssigneeUserId: 99,
        },
      ]

      expect(result).toEqual(expected)
    })
  })

  describe('getHousework', () => {
    it('GET /api/houseworks/:id して Domain Model に変換して返す', async () => {
      mockedClient.get.mockResolvedValue({
        data: baseDto,
      })

      const result = await houseworkApi.getHousework(10)

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/houseworks/10')

      const expected: Housework = {
        houseworkId: 10,
        householdId: 1,
        name: 'テスト家事',
        description: '説明',
        category: CATEGORY.OTHER,
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: 3,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        defaultAssigneeUserId: 99,
      }

      expect(result).toEqual(expected)
    })

    it('DTO に startDate / endDate が無い場合は Domain Model 側は null になる', async () => {
      const dtoWithoutDates = {
        ...baseDto,
        startDate: undefined,
        endDate: undefined,
      } as unknown as typeof baseDto

      mockedClient.get.mockResolvedValue({
        data: dtoWithoutDates,
      })

      const result = await houseworkApi.getHousework(11)

      expect(result.startDate).toBeNull()
      expect(result.endDate).toBeNull()
    })
  })

  describe('createHousework', () => {
    it('POST /api/houseworks に Request DTO を渡し、戻り値を Domain Model に変換して返す', async () => {
      mockedClient.post.mockResolvedValue({
        data: baseDto,
      })

      const input: HouseworkSaveInput = {
        name: 'テスト家事',
        description: '説明',
        category: CATEGORY.OTHER,
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: 3,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        defaultAssigneeUserId: 99,
      }

      const result = await houseworkApi.createHousework(1, input)

      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/houseworks', {
        householdId: 1,
        name: 'テスト家事',
        description: '説明',
        category: CATEGORY.OTHER,
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: 3,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        defaultAssigneeUserId: 99,
      })

      expect(result.householdId).toBe(1)
      expect(result.houseworkId).toBe(10)
    })

    it('input.startDate / endDate が undefined の場合、payload では空文字になる', async () => {
      mockedClient.post.mockResolvedValue({
        data: baseDto,
      })

      const input = {
        name: 'NoDate',
        description: '',
        category: CATEGORY.OTHER,
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: null,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
        startDate: undefined,
        endDate: undefined,
        defaultAssigneeUserId: null,
      } as unknown as HouseworkSaveInput

      await houseworkApi.createHousework(2, input)

      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/houseworks', {
        householdId: 2,
        name: 'NoDate',
        description: '',
        category: CATEGORY.OTHER,
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: null,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
        startDate: '',
        endDate: '',
        defaultAssigneeUserId: null,
      })
    })
  })

  describe('updateHousework', () => {
    it('PUT /api/houseworks/:id に Request DTO を渡し、戻り値を Domain Model に変換して返す', async () => {
      mockedClient.put.mockResolvedValue({
        data: baseDto,
      })

      const input: HouseworkSaveInput = {
        name: '更新後家事',
        description: '更新説明',
        category: CATEGORY.OTHER,
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: 5,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
        startDate: '2025-02-01',
        endDate: '2025-12-31',
        defaultAssigneeUserId: 88,
      }

      const result = await houseworkApi.updateHousework(1, 10, input)

      expect(mockedClient.put).toHaveBeenCalledTimes(1)
      expect(mockedClient.put).toHaveBeenCalledWith('/api/houseworks/10', {
        householdId: 1,
        name: '更新後家事',
        description: '更新説明',
        category: CATEGORY.OTHER,
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: 5,
        dayOfMonth: null,
        nthWeek: null,
        weekday: null,
        startDate: '2025-02-01',
        endDate: '2025-12-31',
        defaultAssigneeUserId: 88,
      })

      expect(result.name).toBe('テスト家事') // baseDto の値で map されていること
    })
  })

  describe('deleteHousework', () => {
    it('DELETE /api/houseworks/:id を呼び出す', async () => {
      mockedClient.delete.mockResolvedValue({})

      await houseworkApi.deleteHousework(10)

      expect(mockedClient.delete).toHaveBeenCalledTimes(1)
      expect(mockedClient.delete).toHaveBeenCalledWith('/api/houseworks/10')
    })
  })
})
