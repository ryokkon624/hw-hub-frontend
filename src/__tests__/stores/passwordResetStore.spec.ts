import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePasswordResetStore } from '@/stores/passwordResetStore'
import { passwordResetApi } from '@/api/passwordResetApi'
import type { ApiError } from '@/api/client'

vi.mock('@/api/passwordResetApi', () => ({
  passwordResetApi: {
    request: vi.fn(),
    confirm: vi.fn(),
  },
}))

describe('passwordResetStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期状態チェック', () => {
    const store = usePasswordResetStore()
    expect(store.isRequesting).toBe(false)
    expect(store.isConfirming).toBe(false)
    expect(store.lastEmail).toBeNull()
    expect(store.lastErrorCode).toBeNull()
  })

  it('clearError は lastErrorCode を null にする', () => {
    const store = usePasswordResetStore()
    store.lastErrorCode = 'SOME_ERROR'
    store.clearError()
    expect(store.lastErrorCode).toBeNull()
  })

  describe('request', () => {
    it('正常系: API呼び出し成功で状態更新', async () => {
      const store = usePasswordResetStore()
      vi.mocked(passwordResetApi.request).mockResolvedValue()

      const promise = store.request('test@example.com')

      expect(store.isRequesting).toBe(true)
      expect(store.lastEmail).toBe('test@example.com')
      expect(store.lastErrorCode).toBeNull()

      await promise

      expect(passwordResetApi.request).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(store.isRequesting).toBe(false)
      expect(store.lastErrorCode).toBeNull()
    })

    it('異常系: APIエラーで lastErrorCode をセットし例外を再送出', async () => {
      const store = usePasswordResetStore()
      const error: ApiError = {
        message: 'error',
        status: 400,
        errorCode: 'ABC_ERROR',
        details: [],
        original: {} as unknown as import('axios').AxiosError,
      }
      vi.mocked(passwordResetApi.request).mockRejectedValue(error)

      await expect(store.request('test@example.com')).rejects.toEqual(error)

      expect(store.isRequesting).toBe(false)
      expect(store.lastErrorCode).toBe('ABC_ERROR')
    })

    it('異常系: errorCodeなしのエラー', async () => {
      const store = usePasswordResetStore()
      const error: ApiError = {
        message: 'error',
        status: 500,
        details: [],
        original: {} as unknown as import('axios').AxiosError,
        errorCode: 'UNKNOWN',
      }
      vi.mocked(passwordResetApi.request).mockRejectedValue(error)

      await expect(store.request('test@example.com')).rejects.toEqual(error)
      expect(store.lastErrorCode).toBe('UNKNOWN')
    })
  })

  describe('confirm', () => {
    it('正常系: API呼び出し成功で状態更新', async () => {
      const store = usePasswordResetStore()
      vi.mocked(passwordResetApi.confirm).mockResolvedValue()

      const promise = store.confirm('token123', 'newPas$')

      expect(store.isConfirming).toBe(true)
      expect(store.lastErrorCode).toBeNull()

      await promise

      expect(passwordResetApi.confirm).toHaveBeenCalledWith({
        token: 'token123',
        newPassword: 'newPas$',
      })
      expect(store.isConfirming).toBe(false)
    })

    it('異常系: APIエラーで lastErrorCode をセット', async () => {
      const store = usePasswordResetStore()
      const error: ApiError = {
        message: 'inv',
        status: 400,
        errorCode: 'TOKEN_INVALID',
        details: [],
        original: {} as unknown as import('axios').AxiosError,
      }
      vi.mocked(passwordResetApi.confirm).mockRejectedValue(error)

      await expect(store.confirm('t', 'p')).rejects.toEqual(error)

      expect(store.isConfirming).toBe(false)
      expect(store.lastErrorCode).toBe('TOKEN_INVALID')
    })
  })
})
