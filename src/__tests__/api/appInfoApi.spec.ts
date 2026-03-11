import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appInfoApi } from '@/api/appInfoApi'
import { apiClient } from '@/api/client'

// apiClient モック用の型
type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
}

// 実体をモックとして扱う
const mockedClient = apiClient as unknown as MockedApiClient

// client モジュールをモック
vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
    },
  }
})

describe('appInfoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchAppInfo', () => {
    it('fetchAppInfo: /actuator/info に GET し、レスポンスを AppInfoModel に変換して返す', async () => {
      const dto = {
        app: {
          version: '1.2.3',
        },
      }

      mockedClient.get.mockResolvedValue({
        data: dto,
      })

      const result = await appInfoApi.fetchAppInfo()

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/actuator/info')

      expect(result).toEqual({
        apiVersion: '1.2.3',
      })
    })
  })
})
