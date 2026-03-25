import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MockedObject } from 'vitest'
import { adminApi } from '@/api/adminApi'
import type { InquiryDetail } from '@/domain'

// apiClient をモック化（client.ts ごと差し替え）
vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

// inquiryApi の toInquiryDetail をモック化
vi.mock('@/api/inquiryApi', () => ({
  toInquiryDetail: vi.fn(),
}))

import { apiClient } from '@/api/client'
import { toInquiryDetail } from '@/api/inquiryApi'

const mockedApiClient = apiClient as MockedObject<typeof apiClient>
const mockedToInquiryDetail = toInquiryDetail as ReturnType<typeof vi.fn>

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- searchUsers ------------------------------------------------

  describe('searchUsers', () => {
    it('メールアドレスをクエリパラメータに渡してGETリクエストを送る', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] })

      await adminApi.searchUsers('test@example.com')

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/users', {
        params: { email: 'test@example.com' },
      })
    })

    it('DTOをAdminUserModelに変換して返す', async () => {
      const dtos = [
        {
          userId: 1,
          email: 'admin@example.com',
          displayName: '管理者',
          locale: 'ja',
          isActive: true,
          roles: ['ADMIN', 'SPPRT'],
        },
      ]
      mockedApiClient.get.mockResolvedValue({ data: dtos })

      const result = await adminApi.searchUsers('admin@example.com')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        userId: 1,
        email: 'admin@example.com',
        displayName: '管理者',
        locale: 'ja',
        isActive: true,
        roles: ['ADMIN', 'SPPRT'],
      })
    })

    it('isActive フィールドを正しくマッピングする', async () => {
      const dtos = [
        {
          userId: 2,
          email: 'inactive@example.com',
          displayName: '無効ユーザー',
          locale: 'en',
          isActive: false,
          roles: [],
        },
      ]
      mockedApiClient.get.mockResolvedValue({ data: dtos })

      const result = await adminApi.searchUsers('inactive@example.com')

      expect(result[0]!.isActive).toBe(false)
    })

    it('空配列が返ってきた場合は空配列を返す', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] })

      const result = await adminApi.searchUsers('notfound@example.com')

      expect(result).toEqual([])
    })
  })

  // ---- assignRole ------------------------------------------------

  describe('assignRole', () => {
    it('正しいエンドポイントにロールをPOSTする', async () => {
      mockedApiClient.post.mockResolvedValue({})

      await adminApi.assignRole(10, 'ADMIN')

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/admin/roles/10', { role: 'ADMIN' })
    })
  })

  // ---- removeRole ------------------------------------------------

  describe('removeRole', () => {
    it('正しいエンドポイントにDELETEリクエストを送る', async () => {
      mockedApiClient.delete.mockResolvedValue({})

      await adminApi.removeRole(10, 'SPPRT')

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/admin/roles/10/SPPRT')
    })
  })

  // ---- fetchPendingInquiries ------------------------------------

  describe('fetchPendingInquiries', () => {
    it('対応待ち問い合わせ一覧エンドポイントにGETリクエストを送る', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] })

      await adminApi.fetchPendingInquiries()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/inquiries')
    })

    it('DTOをAdminInquiryModelに変換し、日付型に変換して返す', async () => {
      const dtos = [
        {
          inquiryId: 100,
          userId: 1,
          userEmail: 'user@example.com',
          userDisplayName: 'テストユーザー',
          category: '10',
          status: '20',
          title: '問い合わせタイトル',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-06-01T12:00:00Z',
          totalMessageCount: 3,
          userMessageCount: 1,
          aiMessageCount: 1,
          staffMessageCount: 1,
        },
      ]
      mockedApiClient.get.mockResolvedValue({ data: dtos })

      const result = await adminApi.fetchPendingInquiries()

      expect(result).toHaveLength(1)
      expect(result[0]!.inquiryId).toBe(100)
      expect(result[0]!.userId).toBe(1)
      expect(result[0]!.userEmail).toBe('user@example.com')
      expect(result[0]!.userDisplayName).toBe('テストユーザー')
      expect(result[0]!.category).toBe('10')
      expect(result[0]!.status).toBe('20')
      expect(result[0]!.title).toBe('問い合わせタイトル')
      expect(result[0]!.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'))
      expect(result[0]!.updatedAt).toEqual(new Date('2025-06-01T12:00:00Z'))
      expect(result[0]!.totalMessageCount).toBe(3)
      expect(result[0]!.userMessageCount).toBe(1)
      expect(result[0]!.aiMessageCount).toBe(1)
      expect(result[0]!.staffMessageCount).toBe(1)
    })

    it('空配列が返ってきた場合は空配列を返す', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] })

      const result = await adminApi.fetchPendingInquiries()

      expect(result).toEqual([])
    })
  })

  // ---- searchInquiries ------------------------------------------

  describe('searchInquiries', () => {
    it('検索条件をクエリパラメータに渡してGETリクエストを送る', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] })
      const params = { status: '20', category: '10' }

      await adminApi.searchInquiries(params)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/inquiries/search', {
        params,
      })
    })

    it('DTOをAdminInquiryModelに変換して返す', async () => {
      const dtos = [
        {
          inquiryId: 200,
          userId: 2,
          userEmail: 'search@example.com',
          userDisplayName: '検索ユーザー',
          category: '40',
          status: '00',
          title: 'バグ報告',
          createdAt: '2025-03-15T09:00:00Z',
          updatedAt: '2025-03-16T10:00:00Z',
          totalMessageCount: 2,
          userMessageCount: 2,
          aiMessageCount: 0,
          staffMessageCount: 0,
        },
      ]
      mockedApiClient.get.mockResolvedValue({ data: dtos })

      const result = await adminApi.searchInquiries({ status: '00' })

      expect(result).toHaveLength(1)
      expect(result[0]!.inquiryId).toBe(200)
      expect(result[0]!.createdAt).toEqual(new Date('2025-03-15T09:00:00Z'))
      expect(result[0]!.updatedAt).toEqual(new Date('2025-03-16T10:00:00Z'))
    })

    it('空の検索条件でもリクエストを送れる', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] })

      await adminApi.searchInquiries({})

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/inquiries/search', {
        params: {},
      })
    })
  })

  // ---- fetchAdminInquiryDetail ----------------------------------

  describe('fetchAdminInquiryDetail', () => {
    it('問い合わせIDを使ってGETリクエストを送る', async () => {
      const rawData = { inquiryId: 300 }
      const mapped: InquiryDetail = {
        inquiryId: 300,
        category: '10',
        status: '20',
        title: '詳細タイトル',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        messages: [],
      }
      mockedApiClient.get.mockResolvedValue({ data: rawData })
      mockedToInquiryDetail.mockReturnValue(mapped)

      const result = await adminApi.fetchAdminInquiryDetail(300)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/inquiries/300')
      expect(mockedToInquiryDetail).toHaveBeenCalledWith(rawData)
      expect(result).toBe(mapped)
    })
  })

  // ---- replyToInquiry -------------------------------------------

  describe('replyToInquiry', () => {
    it('正しいエンドポイントに返信本文をPOSTする', async () => {
      mockedApiClient.post.mockResolvedValue({})

      await adminApi.replyToInquiry(100, '返信内容です')

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/admin/inquiries/100/reply', {
        body: '返信内容です',
      })
    })
  })

  // ---- searchAdminUsers ----------------------------------------

  describe('searchAdminUsers', () => {
    it('検索条件をクエリパラメータに渡してGETリクエストを送る', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] })
      const params = { email: 'test@example.com', isActive: true, locale: 'ja' }

      await adminApi.searchAdminUsers(params)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/admin/users/search', {
        params,
      })
    })

    it('DTOをAdminUserDetailModelに変換し、日付型に変換して返す', async () => {
      const dto = {
        userId: 1,
        email: 'user@example.com',
        authProvider: 'google',
        displayName: 'テスト名',
        locale: 'ja',
        notificationEnabled: true,
        isActive: true,
        iconUrl: 'http://example.com/icon.png',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      }
      mockedApiClient.get.mockResolvedValue({ data: [dto] })

      const result = await adminApi.searchAdminUsers({})

      expect(result).toHaveLength(1)
      expect(result[0]!.userId).toBe(1)
      expect(result[0]!.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'))
      expect(result[0]!.updatedAt).toEqual(new Date('2025-01-02T00:00:00Z'))
    })
  })

  // ---- createAdminUser -----------------------------------------

  describe('createAdminUser', () => {
    it('パラメータをリクエストボディに含めてPOSTリクエストを送る', async () => {
      const dto = {
        userId: 1,
        email: 'new@example.com',
        authProvider: 'password',
        displayName: '新規',
        locale: 'ja',
        notificationEnabled: false,
        isActive: true,
        iconUrl: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
      mockedApiClient.post.mockResolvedValue({ data: dto })
      const params = { email: 'new@example.com', password: 'password', displayName: '新規', locale: 'ja' }

      const result = await adminApi.createAdminUser(params)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/admin/users', params)
      expect(result.userId).toBe(1)
      expect(result.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'))
    })
  })

  // ---- updateAdminUser -----------------------------------------

  describe('updateAdminUser', () => {
    it('userIdをパスに含めてPUTリクエストを送る', async () => {
      const dto = {
        userId: 99,
        email: 'up@example.com',
        authProvider: 'password',
        displayName: '更新済',
        locale: 'en',
        notificationEnabled: true,
        isActive: false,
        iconUrl: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z',
      }
      mockedApiClient.put.mockResolvedValue({ data: dto })
      const params = { displayName: '更新済', locale: 'en', isActive: false }

      const result = await adminApi.updateAdminUser(99, params)

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api/admin/users/99', params)
      expect(result.userId).toBe(99)
      expect(result.updatedAt).toEqual(new Date('2025-02-01T00:00:00Z'))
    })
  })
})
