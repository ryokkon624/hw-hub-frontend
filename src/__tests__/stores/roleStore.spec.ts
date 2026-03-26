import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRoleStore } from '@/stores/roleStore'
import { roleApi } from '@/api/roleApi'

vi.mock('@/api/roleApi', () => ({
  roleApi: {
    fetchMyRoles: vi.fn(),
  },
}))

describe('roleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchMyRoles', () => {
    it('ロールとパーミッションを取得してstateを更新する', async () => {
      const store = useRoleStore()
      vi.mocked(roleApi.fetchMyRoles).mockResolvedValue({
        roles: ['ADMIN'],
        permissions: ['11', '10'],
      })

      await store.fetchMyRoles()

      expect(store.roles).toEqual(['ADMIN'])
      expect(store.permissions).toEqual(['11', '10'])
      expect(store.isLoading).toBe(false)
    })

    it('複数ロール・複数パーミッションを正しく格納する', async () => {
      const store = useRoleStore()
      vi.mocked(roleApi.fetchMyRoles).mockResolvedValue({
        roles: ['ADMIN', 'SPPRT'],
        permissions: ['10', '11', '20'],
      })

      await store.fetchMyRoles()

      expect(store.roles).toEqual(['ADMIN', 'SPPRT'])
      expect(store.permissions).toEqual(['10', '11', '20'])
    })

    it('fetch中はisLoadingがtrueになる', async () => {
      const store = useRoleStore()
      let isLoadingDuringFetch = false
      vi.mocked(roleApi.fetchMyRoles).mockImplementation(async () => {
        isLoadingDuringFetch = store.isLoading
        return { roles: [], permissions: [] }
      })

      await store.fetchMyRoles()

      expect(isLoadingDuringFetch).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('既にisLoadingがtrueの場合は何もしない', async () => {
      const store = useRoleStore()
      store.isLoading = true

      await store.fetchMyRoles()

      expect(roleApi.fetchMyRoles).not.toHaveBeenCalled()
    })

    it('APIがエラーを返した場合はrolesとpermissionsを空にしてisLoadingをfalseに戻す', async () => {
      const store = useRoleStore()
      store.roles = ['ADMIN'] as typeof store.roles
      store.permissions = ['11'] as typeof store.permissions
      vi.mocked(roleApi.fetchMyRoles).mockRejectedValue(new Error('Network Error'))

      await store.fetchMyRoles()

      expect(store.roles).toEqual([])
      expect(store.permissions).toEqual([])
      expect(store.isLoading).toBe(false)
    })
  })

  describe('hasAnyRole (getter)', () => {
    it('rolesが空の場合はfalseを返す', () => {
      const store = useRoleStore()

      expect(store.hasAnyRole).toBe(false)
    })

    it('rolesにロールがある場合はtrueを返す', () => {
      const store = useRoleStore()
      store.roles = ['ADMIN'] as typeof store.roles

      expect(store.hasAnyRole).toBe(true)
    })
  })

  describe('clear', () => {
    it('全ての状態を初期値にリセットする', () => {
      const store = useRoleStore()
      store.roles = ['ADMIN'] as typeof store.roles
      store.permissions = ['11', '10'] as typeof store.permissions
      store.isLoading = true

      store.clear()

      expect(store.roles).toEqual([])
      expect(store.permissions).toEqual([])
      expect(store.isLoading).toBe(false)
    })
  })
})
