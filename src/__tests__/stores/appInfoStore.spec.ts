import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppInfoStore } from '@/stores/appInfoStore'
import { appInfoApi } from '@/api/appInfoApi'

// --- module mocks -------------------------------------------------

vi.mock('@/api/appInfoApi', () => ({
  appInfoApi: {
    fetchAppInfo: vi.fn(),
  },
}))

describe('appInfoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('state', () => {
    it('初期状態では apiVersion は null、isLoading は false', () => {
      const store = useAppInfoStore()
      expect(store.apiVersion).toBeNull()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('getters', () => {
    it('frontVersion は import.meta.env.VITE_APP_VERSION を返す', () => {
      const store = useAppInfoStore()

      // vi.stubEnv を用いて環境変数を一時的に上書きする
      vi.stubEnv('VITE_APP_VERSION', 'v1.0.0-test')

      expect(store.frontVersion).toBe('v1.0.0-test')

      // 元に戻す
      vi.unstubAllEnvs()
    })

    it('frontVersion は import.meta.env.VITE_APP_VERSION が未定義の場合は "local" を返す', () => {
      const store = useAppInfoStore()

      // vi.stubEnv ではプロパティの完全な削除ができず undefined にならない場合があるため、
      // 厳密に undefined をシミュレートするために一時的に import.meta.env ごと置き換えてテストする。
      // (フロントエンド固有のビルドツール仕様に依存するため)
      const originalEnv = import.meta.env
      // @ts-expect-error: import.meta.env は読み取り専用だがテストのために一時的に上書きする
      import.meta.env = { ...originalEnv }
      // @ts-expect-error: import.meta.env のプロパティ削除は通常許可されないがテストのために実地する
      delete import.meta.env.VITE_APP_VERSION

      expect(store.frontVersion).toBe('local')

      // @ts-expect-error: テスト終了後に元の環境変数オブジェクトに戻す
      import.meta.env = originalEnv
    })
  })

  describe('actions', () => {
    describe('fetchApiVersion', () => {
      it('API取得成功時、apiVersion に値がセットされる', async () => {
        const store = useAppInfoStore()
        vi.mocked(appInfoApi.fetchAppInfo).mockResolvedValue({
          apiVersion: '1.5.0',
        })

        const promise = store.fetchApiVersion()
        expect(store.isLoading).toBe(true)

        await promise

        expect(appInfoApi.fetchAppInfo).toHaveBeenCalledTimes(1)
        expect(store.apiVersion).toBe('1.5.0')
        expect(store.isLoading).toBe(false)
      })

      it('API取得失敗時、apiVersion に "unknown" がセットされエラーを握りつぶす', async () => {
        const store = useAppInfoStore()
        vi.mocked(appInfoApi.fetchAppInfo).mockRejectedValue(new Error('Network error'))

        await store.fetchApiVersion()

        expect(appInfoApi.fetchAppInfo).toHaveBeenCalledTimes(1)
        expect(store.apiVersion).toBe('unknown')
        expect(store.isLoading).toBe(false)
      })

      it('既に isLoading===true の場合、APIを呼び出さず早期リターンする', async () => {
        const store = useAppInfoStore()
        store.isLoading = true
        vi.mocked(appInfoApi.fetchAppInfo).mockResolvedValue({
          apiVersion: '2.0.0',
        })

        await store.fetchApiVersion()

        expect(appInfoApi.fetchAppInfo).not.toHaveBeenCalled()
        expect(store.apiVersion).toBeNull() // 更新されない
      })
    })
  })
})
