import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from '@/api/authApi'
import { apiClient } from '@/api/client'

// apiClient モック用の型（any なし）
type MockedApiClient = {
  post: ReturnType<typeof vi.fn>
}

// 実体をモックとして扱う
const mockedClient = apiClient as unknown as MockedApiClient

// client モジュールをモック
vi.mock('@/api/client', () => {
  return {
    apiClient: {
      post: vi.fn(),
    },
  }
})

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('login: /api/auth/login に POST し、レスポンス DTO を AuthSession に変換して返す', async () => {
      const dto = {
        accessToken: 'token-123',
        user: {
          userId: 1,
          email: 'user@example.com',
          displayName: 'User',
          locale: 'ja',
          iconUrl: 'http://example.com/icon.png',
        },
      }

      mockedClient.post.mockResolvedValue({
        data: dto,
      })

      const payload = { email: 'user@example.com', password: 'secret' }

      const result = await authApi.login(payload)

      // API 呼び出し内容
      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'user@example.com',
        password: 'secret',
      })

      // mapper (toAuthSession / toLoginUser) の確認
      expect(result).toEqual({
        accessToken: 'token-123',
        user: {
          userId: 1,
          email: 'user@example.com',
          displayName: 'User',
          locale: 'ja',
          iconUrl: 'http://example.com/icon.png',
        },
      })
    })

    it('login: iconUrl が undefined のときは null に変換される', async () => {
      const dtoWithoutIcon = {
        accessToken: 'token-xyz',
        user: {
          userId: 2,
          email: 'noicon@example.com',
          displayName: 'No Icon',
          locale: 'en',
          // iconUrl: undefined を想定（プロパティなしでもOK）
        },
      }

      mockedClient.post.mockResolvedValue({
        data: dtoWithoutIcon,
      })

      const result = await authApi.login({
        email: 'noicon@example.com',
        password: 'pw',
      })

      expect(result.user.iconUrl).toBeNull()
    })
  })

  describe('register', () => {
    it('register: /api/auth/register に POST し、レスポンス DTO を AuthSession に変換して返す', async () => {
      const dto = {
        accessToken: 'reg-token',
        user: {
          userId: 3,
          email: 'new@example.com',
          displayName: 'New User',
          locale: 'ja',
          iconUrl: null,
        },
      }

      mockedClient.post.mockResolvedValue({
        data: dto,
      })

      const body = {
        email: 'new@example.com',
        password: 'pw123',
        displayName: 'New User',
        locale: 'ja',
        invitationToken: 'invite-abc',
      }

      const result = await authApi.register(body)

      // API 呼び出し内容
      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/auth/register', body)

      // mapper の確認
      expect(result).toEqual({
        accessToken: 'reg-token',
        user: {
          userId: 3,
          email: 'new@example.com',
          displayName: 'New User',
          locale: 'ja',
          iconUrl: null,
        },
      })
    })
  })
})
