import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminRoleStore } from '@/stores/adminRoleStore'
import { adminApi } from '@/api/adminApi'

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    searchUsers: vi.fn(),
    assignRole: vi.fn(),
    removeRole: vi.fn(),
  },
}))

const createUser = (userId: number, roles: string[] = []) => ({
  userId,
  email: `user${userId}@example.com`,
  displayName: `User ${userId}`,
  locale: 'ja',
  isActive: true,
  roles: roles as import('@/constants/code.constants').UserRoleCode[],
})

describe('adminRoleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('searchUsers', () => {
    it('メールアドレスで検索してsearchResultsを更新する', async () => {
      const store = useAdminRoleStore()
      const users = [createUser(1, ['ADMIN']), createUser(2)]
      vi.mocked(adminApi.searchUsers).mockResolvedValue(users)

      await store.searchUsers('example.com')

      expect(adminApi.searchUsers).toHaveBeenCalledWith('example.com')
      expect(store.searchResults).toEqual(users)
      expect(store.isSearching).toBe(false)
    })

    it('検索中はisSearchingがtrueになる', async () => {
      const store = useAdminRoleStore()
      let isSearchingDuringCall = false
      vi.mocked(adminApi.searchUsers).mockImplementation(async () => {
        isSearchingDuringCall = store.isSearching
        return []
      })

      await store.searchUsers('test@example.com')

      expect(isSearchingDuringCall).toBe(true)
      expect(store.isSearching).toBe(false)
    })

    it('既にisSearchingがtrueの場合は何もしない', async () => {
      const store = useAdminRoleStore()
      store.isSearching = true

      await store.searchUsers('test@example.com')

      expect(adminApi.searchUsers).not.toHaveBeenCalled()
    })

    it('APIエラーが発生してもisSearchingがfalseに戻る', async () => {
      const store = useAdminRoleStore()
      vi.mocked(adminApi.searchUsers).mockRejectedValue(new Error('API Error'))

      await expect(store.searchUsers('test@example.com')).rejects.toThrow('API Error')

      expect(store.isSearching).toBe(false)
    })
  })

  describe('assignRole', () => {
    it('APIを呼び、対象ユーザーのrolesに楽観的に追加する', async () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(10, [])]
      vi.mocked(adminApi.assignRole).mockResolvedValue()

      await store.assignRole(10, 'ADMIN')

      expect(adminApi.assignRole).toHaveBeenCalledWith(10, 'ADMIN')
      expect(store.searchResults[0]?.roles).toContain('ADMIN')
      expect(store.isSubmitting).toBe(false)
    })

    it('既にロールを持っている場合は重複追加しない（冪等）', async () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(10, ['ADMIN'])]
      vi.mocked(adminApi.assignRole).mockResolvedValue()

      await store.assignRole(10, 'ADMIN')

      expect(store.searchResults[0]?.roles).toEqual(['ADMIN'])
    })

    it('既にisSubmittingがtrueの場合は何もしない', async () => {
      const store = useAdminRoleStore()
      store.isSubmitting = true

      await store.assignRole(10, 'ADMIN')

      expect(adminApi.assignRole).not.toHaveBeenCalled()
    })

    it('APIエラーが発生してもisSubmittingがfalseに戻る', async () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(10, [])]
      vi.mocked(adminApi.assignRole).mockRejectedValue(new Error('API Error'))

      await expect(store.assignRole(10, 'ADMIN')).rejects.toThrow('API Error')

      expect(store.isSubmitting).toBe(false)
    })

    it('SUPPORTロールも付与できる', async () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(20, [])]
      vi.mocked(adminApi.assignRole).mockResolvedValue()

      await store.assignRole(20, 'SPPRT')

      expect(adminApi.assignRole).toHaveBeenCalledWith(20, 'SPPRT')
      expect(store.searchResults[0]?.roles).toContain('SPPRT')
    })
  })

  describe('removeRole', () => {
    it('APIを呼び、対象ユーザーのrolesから楽観的に削除する', async () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(10, ['ADMIN', 'SPPRT'])]
      vi.mocked(adminApi.removeRole).mockResolvedValue()

      await store.removeRole(10, 'ADMIN')

      expect(adminApi.removeRole).toHaveBeenCalledWith(10, 'ADMIN')
      expect(store.searchResults[0]?.roles).not.toContain('ADMIN')
      expect(store.searchResults[0]?.roles).toContain('SPPRT')
      expect(store.isSubmitting).toBe(false)
    })

    it('既にisSubmittingがtrueの場合は何もしない', async () => {
      const store = useAdminRoleStore()
      store.isSubmitting = true

      await store.removeRole(10, 'ADMIN')

      expect(adminApi.removeRole).not.toHaveBeenCalled()
    })

    it('APIエラーが発生してもisSubmittingがfalseに戻る', async () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(10, ['ADMIN'])]
      vi.mocked(adminApi.removeRole).mockRejectedValue(new Error('API Error'))

      await expect(store.removeRole(10, 'ADMIN')).rejects.toThrow('API Error')

      expect(store.isSubmitting).toBe(false)
    })

    it('SUPPORTロールも削除できる', async () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(20, ['SPPRT'])]
      vi.mocked(adminApi.removeRole).mockResolvedValue()

      await store.removeRole(20, 'SPPRT')

      expect(adminApi.removeRole).toHaveBeenCalledWith(20, 'SPPRT')
      expect(store.searchResults[0]?.roles).not.toContain('SPPRT')
    })
  })

  describe('clear', () => {
    it('全ての状態を初期値にリセットする', () => {
      const store = useAdminRoleStore()
      store.searchResults = [createUser(1, ['ADMIN'])]
      store.isSearching = true
      store.isSubmitting = true

      store.clear()

      expect(store.searchResults).toEqual([])
      expect(store.isSearching).toBe(false)
      expect(store.isSubmitting).toBe(false)
    })
  })
})
