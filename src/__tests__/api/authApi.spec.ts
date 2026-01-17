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
        kind: 'LOGGED_IN',
        session: {
          accessToken: 'reg-token',
          user: {
            userId: 3,
            email: 'new@example.com',
            displayName: 'New User',
            locale: 'ja',
            iconUrl: null,
          },
        },
      })
    })

    it('register: emailVerificationRequired=true の場合は VERIFICATION_REQUIRED を返す', async () => {
      const dto = {
        emailVerificationRequired: true,
        accessToken: null,
        user: {
          userId: 4,
          email: 'verify@example.com',
          displayName: 'Verify User',
          locale: 'ja',
          iconUrl: null,
        },
        verificationExpiresAt: '2025-01-01T12:00:00',
      }

      mockedClient.post.mockResolvedValue({
        data: dto,
      })

      const result = await authApi.register({
        email: 'verify@example.com',
        password: 'pw',
        displayName: 'Verify',
        locale: 'ja',
      })

      expect(result).toEqual({
        kind: 'VERIFICATION_REQUIRED',
        verificationExpiresAt: '2025-01-01T12:00:00',
      })
    })
  })

  describe('verifyEmail', () => {
    it('verifyEmail: /api/auth/email-verification/verify に POST する', async () => {
      mockedClient.post.mockResolvedValue({ data: undefined })

      await authApi.verifyEmail({ token: 'abc-def' })

      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/auth/email-verification/verify', {
        token: 'abc-def',
      })
    })
  })

  describe('resendVerification', () => {
    it('resendVerification: /api/auth/email-verification/resend に POST する', async () => {
      mockedClient.post.mockResolvedValue({ data: undefined })

      await authApi.resendVerification({ email: 'resend@example.com' })

      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/auth/email-verification/resend', {
        email: 'resend@example.com',
      })
    })
  })

  describe('putToPresignedUrl', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // fetch を毎回初期化
      globalThis.fetch = vi.fn()
    })

    it('PUT が 200/204 のときは成功する（例: 200）', async () => {
      // Response っぽい最小形
      ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue(''),
      })

      const file = new File([new Uint8Array([1, 2, 3])], 'icon.jpg', { type: 'image/jpeg' })

      await expect(
        authApi.putToPresignedUrl('https://example.com/presigned', file),
      ).resolves.toBeUndefined()

      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/presigned', {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: file,
      })
    })

    it('file.type が空のとき Content-Type は application/octet-stream になる', async () => {
      ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue(''),
      })

      const file = new File([new Uint8Array([1])], 'blob.bin') // type なし

      await authApi.putToPresignedUrl('https://example.com/presigned', file)

      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/presigned', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: file,
      })
    })

    it('PUT が失敗したら status / statusText / text を含む Error を投げる（text 読めるケース）', async () => {
      ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: vi.fn().mockResolvedValue('<Error>AccessDenied</Error>'),
      })

      const file = new File([new Uint8Array([1])], 'icon.jpg', { type: 'image/jpeg' })

      await expect(
        authApi.putToPresignedUrl('https://example.com/presigned', file),
      ).rejects.toThrow('S3 upload failed: 403 Forbidden <Error>AccessDenied</Error>')
    })

    it('PUT が失敗し、res.text() も失敗する場合は空文字で Error を投げる（CORSなど）', async () => {
      ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: vi.fn().mockRejectedValue(new Error('blocked')),
      })

      const file = new File([new Uint8Array([1])], 'icon.jpg', { type: 'image/jpeg' })

      await expect(
        authApi.putToPresignedUrl('https://example.com/presigned', file),
      ).rejects.toThrow('S3 upload failed: 403 Forbidden ')
    })
  })
})
