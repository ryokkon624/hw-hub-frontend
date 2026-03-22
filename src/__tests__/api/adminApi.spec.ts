import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminApi } from '@/api/adminApi'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchUsers', () => {
    it('メールでユーザー検索してAdminUserModelの配列にマッピングして返す', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [
          {
            userId: 100,
            email: 'test@example.com',
            displayName: 'Taro',
            locale: 'ja',
            isActive: true,
            roles: ['ADMIN'],
          },
        ],
      })

      const result = await adminApi.searchUsers('test@example.com')

      expect(apiClient.get).toHaveBeenCalledWith('/api/admin/users', {
        params: { email: 'test@example.com' },
      })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        userId: 100,
        email: 'test@example.com',
        displayName: 'Taro',
        locale: 'ja',
        isActive: true,
        roles: ['ADMIN'],
      })
    })

    it('複数ユーザーが返った場合は全件マッピングする', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [
          {
            userId: 1,
            email: 'alice@example.com',
            displayName: 'Alice',
            locale: 'en',
            isActive: true,
            roles: ['ADMIN'],
          },
          {
            userId: 2,
            email: 'bob@example.com',
            displayName: 'Bob',
            locale: 'ja',
            isActive: false,
            roles: [],
          },
        ],
      })

      const result = await adminApi.searchUsers('example.com')

      expect(result).toHaveLength(2)
      expect(result[0]?.email).toBe('alice@example.com')
      expect(result[1]?.email).toBe('bob@example.com')
      expect(result[1]?.isActive).toBe(false)
      expect(result[1]?.roles).toEqual([])
    })

    it('該当ユーザーがいない場合は空配列を返す', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

      const result = await adminApi.searchUsers('nobody@example.com')

      expect(result).toEqual([])
    })
  })

  describe('assignRole', () => {
    it('指定したユーザーにロールを付与するAPIを呼ぶ', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      await adminApi.assignRole(10, 'ADMIN')

      expect(apiClient.post).toHaveBeenCalledWith('/api/admin/roles/10', { role: 'ADMIN' })
    })

    it('SUPPORTロールも付与できる', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({})

      await adminApi.assignRole(20, 'SPPRT')

      expect(apiClient.post).toHaveBeenCalledWith('/api/admin/roles/20', { role: 'SPPRT' })
    })
  })

  describe('removeRole', () => {
    it('指定したユーザーのロールを削除するAPIを呼ぶ', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      await adminApi.removeRole(10, 'ADMIN')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/admin/roles/10/ADMIN')
    })

    it('SUPPORTロールも削除できる', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      await adminApi.removeRole(20, 'SPPRT')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/admin/roles/20/SPPRT')
    })
  })
})
