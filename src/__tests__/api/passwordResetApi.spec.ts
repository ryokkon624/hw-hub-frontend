import { describe, it, expect, vi, beforeEach } from 'vitest'
import { passwordResetApi } from '@/api/passwordResetApi'
import { apiClient } from '@/api/client'

// モックの型定義
type MockedApiClient = {
  post: ReturnType<typeof vi.fn>
}

vi.mock('@/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as MockedApiClient

describe('passwordResetApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('request: POST /api/auth/password-reset/request', async () => {
    mockedClient.post.mockResolvedValue({ data: undefined })

    await passwordResetApi.request({ email: 'test@example.com' })

    expect(mockedClient.post).toHaveBeenCalledWith('/api/auth/password-reset/request', {
      email: 'test@example.com',
    })
  })

  it('confirm: POST /api/auth/password-reset/confirm', async () => {
    mockedClient.post.mockResolvedValue({ data: undefined })

    await passwordResetApi.confirm({ token: 't', newPassword: 'p' })

    expect(mockedClient.post).toHaveBeenCalledWith('/api/auth/password-reset/confirm', {
      token: 't',
      newPassword: 'p',
    })
  })
})
