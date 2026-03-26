import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminUserStore } from '@/stores/adminUserStore'
import { adminApi } from '@/api/adminApi'
import type { AdminUserDetailModel } from '@/domain'

// adminApi をモック化
vi.mock('@/api/adminApi', () => ({
  adminApi: {
    searchAdminUsers: vi.fn(),
    createAdminUser: vi.fn(),
    updateAdminUser: vi.fn(),
  },
}))

describe('adminUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const dummyUser: AdminUserDetailModel = {
    userId: 1,
    email: 'user1@example.com',
    authProvider: 'google',
    displayName: 'User 1',
    locale: 'ja',
    notificationEnabled: true,
    isActive: true,
    iconUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // ---- search --------------------------------------------------

  describe('search', () => {
    it('検索実行中フラグが立ち、APIの結果が保持されること', async () => {
      const store = useAdminUserStore()
      const results = [dummyUser]
      vi.mocked(adminApi.searchAdminUsers).mockResolvedValue(results)

      const promise = store.search({ email: 'test' })
      expect(store.isSearching).toBe(true)
      expect(store.lastSearchParams).toEqual({ email: 'test' })

      await promise
      expect(store.isSearching).toBe(false)
      expect(store.searchResults).toEqual(results)
    })

    it('検索実行中は二重に実行されないこと', async () => {
      const store = useAdminUserStore()
      store.isSearching = true

      await store.search({ email: 'test' })

      expect(adminApi.searchAdminUsers).not.toHaveBeenCalled()
    })

    it('エラーが発生しても検索実行中フラグが正しくリセットされること', async () => {
      const store = useAdminUserStore()
      vi.mocked(adminApi.searchAdminUsers).mockRejectedValue(new Error('API Error'))

      await expect(store.search({})).rejects.toThrow('API Error')
      expect(store.isSearching).toBe(false)
    })
  })

  // ---- createUser ----------------------------------------------

  describe('createUser', () => {
    it('ユーザーが作成され、一覧の先頭に追加されること', async () => {
      const store = useAdminUserStore()
      store.searchResults = [dummyUser]
      const newUser: AdminUserDetailModel = { ...dummyUser, userId: 2, email: 'user2@example.com' }
      vi.mocked(adminApi.createAdminUser).mockResolvedValue(newUser)

      const promise = store.createUser({ email: 'user2', password: 'pw', displayName: 'U2', locale: 'ja' })
      expect(store.isSubmitting).toBe(true)

      await promise
      expect(store.isSubmitting).toBe(false)
      expect(store.searchResults).toHaveLength(2)
      expect(store.searchResults[0]).toEqual(newUser)
    })

    it('作成実行中は二重に実行されないこと', async () => {
      const store = useAdminUserStore()
      store.isSubmitting = true

      await store.createUser({ email: '', password: '', displayName: '', locale: '' })

      expect(adminApi.createAdminUser).not.toHaveBeenCalled()
    })
  })

  // ---- updateUser ----------------------------------------------

  describe('updateUser', () => {
    it('ユーザーが更新され、一覧内のデータが差し替えられること', async () => {
      const store = useAdminUserStore()
      store.searchResults = [dummyUser]
      const updatedUser: AdminUserDetailModel = { ...dummyUser, displayName: 'Updated' }
      vi.mocked(adminApi.updateAdminUser).mockResolvedValue(updatedUser)

      const promise = store.updateUser(1, { displayName: 'Updated', locale: 'ja' })
      expect(store.isSubmitting).toBe(true)

      await promise
      expect(store.isSubmitting).toBe(false)
      expect(store.searchResults[0]!.displayName).toBe('Updated')
    })

    it('一覧に存在しないユーザーの更新時は何もしないこと', async () => {
      const store = useAdminUserStore()
      store.searchResults = [dummyUser]
      const updatedUser: AdminUserDetailModel = { ...dummyUser, userId: 99, displayName: 'NonExistent' }
      vi.mocked(adminApi.updateAdminUser).mockResolvedValue(updatedUser)

      await store.updateUser(99, { displayName: 'NonExistent', locale: 'ja' })

      expect(store.searchResults).toHaveLength(1)
      expect(store.searchResults[0]!.userId).toBe(1)
    })

    it('更新実行中は二重に実行されないこと', async () => {
      const store = useAdminUserStore()
      store.isSubmitting = true

      await store.updateUser(1, { displayName: '', locale: '' })

      expect(adminApi.updateAdminUser).not.toHaveBeenCalled()
    })
  })

  // ---- clear ---------------------------------------------------

  describe('clear', () => {
    it('ステートが初期化されること', () => {
      const store = useAdminUserStore()
      store.searchResults = [dummyUser]
      store.lastSearchParams = { email: 'test' }

      store.clear()

      expect(store.searchResults).toEqual([])
      expect(store.lastSearchParams).toEqual({})
    })
  })
})
