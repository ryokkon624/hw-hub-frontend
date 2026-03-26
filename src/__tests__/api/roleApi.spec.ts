import { describe, it, expect, vi, beforeEach } from 'vitest'
import { roleApi } from '@/api/roleApi'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('roleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMyRoles', () => {
    it('APIからロール・パーミッションを取得してMyRolesModelにマッピングして返す', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          roles: ['ADMIN'],
          permissions: ['11', '10'],
        },
      })

      const result = await roleApi.fetchMyRoles()

      expect(apiClient.get).toHaveBeenCalledWith('/api/users/me/roles')
      expect(result).toEqual({
        roles: ['ADMIN'],
        permissions: ['11', '10'],
      })
    })

    it('ロールなし・パーミッションなしの場合は空リストを返す', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { roles: [], permissions: [] },
      })

      const result = await roleApi.fetchMyRoles()

      expect(result).toEqual({ roles: [], permissions: [] })
    })

    it('複数ロール・複数パーミッションを正しくマッピングする', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          roles: ['ADMIN', 'SPPRT'],
          permissions: ['10', '11', '20'],
        },
      })

      const result = await roleApi.fetchMyRoles()

      expect(result.roles).toEqual(['ADMIN', 'SPPRT'])
      expect(result.permissions).toEqual(['10', '11', '20'])
    })
  })

  describe('assignRole', () => {
    it('指定したユーザーにロールを付与するAPIを呼ぶ', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      await roleApi.assignRole(10, 'ADMIN')

      expect(apiClient.post).toHaveBeenCalledWith('/api/admin/roles/10', { role: 'ADMIN' })
    })

    it('SUPPORTロールも同様に付与できる', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      await roleApi.assignRole(20, 'SPPRT')

      expect(apiClient.post).toHaveBeenCalledWith('/api/admin/roles/20', { role: 'SPPRT' })
    })
  })

  describe('removeRole', () => {
    it('指定したユーザーのロールを削除するAPIを呼ぶ', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      await roleApi.removeRole(10, 'ADMIN')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/admin/roles/10/ADMIN')
    })

    it('SUPPORTロールも同様に削除できる', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      await roleApi.removeRole(20, 'SPPRT')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/admin/roles/20/SPPRT')
    })
  })
})
