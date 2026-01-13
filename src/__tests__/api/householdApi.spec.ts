import { describe, it, expect, vi, beforeEach } from 'vitest'
import { householdApi } from '@/api/householdApi'
import { apiClient } from '@/api/client'

// apiClient モック用の型（any なし）
type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

// 実体をモック型として扱う
const mockedClient = apiClient as unknown as MockedApiClient

// client モジュールをモック
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

describe('householdApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getHouseholdMembers', () => {
    it('指定された householdId で GET し、DTO を HouseholdMember に map して返す', async () => {
      const dtoList = [
        {
          householdId: 1,
          userId: 10,
          displayName: 'Alice',
          iconUrl: 'http://example.com/icon.png',
          nickname: 'A',
          status: '1',
          role: 'OWNER',
        },
        {
          householdId: 1,
          userId: 11,
          displayName: 'Bob',
          iconUrl: null,
          nickname: null,
          status: '2',
          role: 'MEMBER',
        },
      ]

      mockedClient.get.mockResolvedValue({
        data: dtoList,
      })

      const result = await householdApi.getHouseholdMembers(1)

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/households/1/members')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        householdId: 1,
        userId: 10,
        displayName: 'Alice',
        iconUrl: 'http://example.com/icon.png',
        nickname: 'A',
        status: '1',
        role: 'OWNER',
      })
      expect(result[1]).toEqual({
        householdId: 1,
        userId: 11,
        displayName: 'Bob',
        iconUrl: null,
        nickname: null,
        status: '2',
        role: 'MEMBER',
      })
    })
  })

  describe('updateHouseholdName', () => {
    it('PUT /api/households/{id} に name を送信する', async () => {
      mockedClient.put.mockResolvedValue({})

      await householdApi.updateHouseholdName(5, 'My Household')

      expect(mockedClient.put).toHaveBeenCalledTimes(1)
      expect(mockedClient.put).toHaveBeenCalledWith('/api/households/5', {
        name: 'My Household',
      })
    })
  })

  describe('createHousehold', () => {
    it('POST /api/households を呼び、レスポンス DTO を HouseholdModel に変換して返す', async () => {
      const dto = {
        householdId: 10,
        name: 'Created Household',
        ownerUserId: 99,
      }

      mockedClient.post.mockResolvedValue({
        data: dto,
      })

      const result = await householdApi.createHousehold('Created Household')

      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/households', {
        name: 'Created Household',
      })

      // mapper (toHouseholdModel) の確認
      expect(result).toEqual({
        householdId: 10,
        name: 'Created Household',
        ownerUserId: 99,
      })
    })
  })

  describe('deleteHousehold', () => {
    it('DELETE /api/households/{id} を呼び出す', async () => {
      mockedClient.delete = vi.fn().mockResolvedValue({})

      await householdApi.deleteHousehold(123)

      expect(mockedClient.delete).toHaveBeenCalledTimes(1)
      expect(mockedClient.delete).toHaveBeenCalledWith('/api/households/123')
    })
  })
})
