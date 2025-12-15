import { describe, it, expect, vi, beforeEach } from 'vitest'
import { householdInvitationApi } from '@/api/householdInvitationApi'
import { apiClient } from '@/api/client'
import { INVITATION_STATUS } from '@/constants/code.constants'

// apiClient モック用の型
type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
    },
  }
})

describe('householdInvitationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listByHousehold', () => {
    it('指定された householdId の招待一覧を取得し、Domain Model 配列に変換して返す', async () => {
      mockedClient.get.mockResolvedValue({
        data: [
          {
            householdId: 1,
            inviterUserId: 10,
            invitedEmail: 'invitee@example.com',
            invitationToken: 'token-123',
            status: INVITATION_STATUS.PENDING,
            expiresAt: '2025-01-02T00:00:00Z',
            acceptedUserId: null,
            acceptedUserName: null,
            createdAt: '2025-01-01T00:00:00Z',
          },
        ],
      })

      const result = await householdInvitationApi.listByHousehold(1)

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/households/1/invitations')

      expect(result).toEqual([
        {
          householdId: 1,
          inviterUserId: 10,
          invitedEmail: 'invitee@example.com',
          invitationToken: 'token-123',
          status: INVITATION_STATUS.PENDING,
          expiresAt: '2025-01-02T00:00:00Z',
          acceptedUserId: null,
          acceptedUserName: null,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ])
    })
  })

  describe('create', () => {
    it('指定された householdId と email で POST し、Domain Model に変換して返す', async () => {
      mockedClient.post.mockResolvedValue({
        data: {
          householdId: 2,
          inviterUserId: 20,
          invitedEmail: 'new@example.com',
          invitationToken: 'token-xyz',
          status: INVITATION_STATUS.PENDING,
          expiresAt: '2025-02-01T00:00:00Z',
          acceptedUserId: null,
          acceptedUserName: null,
          createdAt: '2025-01-10T00:00:00Z',
        },
      })

      const result = await householdInvitationApi.create(2, 'new@example.com')

      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/households/2/invitations', {
        invitedEmail: 'new@example.com',
      })

      expect(result).toEqual({
        householdId: 2,
        inviterUserId: 20,
        invitedEmail: 'new@example.com',
        invitationToken: 'token-xyz',
        status: INVITATION_STATUS.PENDING,
        expiresAt: '2025-02-01T00:00:00Z',
        acceptedUserId: null,
        acceptedUserName: null,
        createdAt: '2025-01-10T00:00:00Z',
      })
    })
  })

  describe('getInvitation', () => {
    it('token で GET し、ViewModel に変換して返す', async () => {
      mockedClient.get.mockResolvedValue({
        data: {
          householdId: 3,
          householdName: 'テスト世帯',
          inviterDisplayName: '招待した人',
          invitedEmail: 'target@example.com',
          status: INVITATION_STATUS.PENDING,
          expired: false,
        },
      })

      const result = await householdInvitationApi.getInvitation('token-view')

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/household-invitations/token-view')

      expect(result).toEqual({
        householdId: 3,
        householdName: 'テスト世帯',
        inviterDisplayName: '招待した人',
        invitedEmail: 'target@example.com',
        status: INVITATION_STATUS.PENDING,
        expired: false,
      })
    })
  })

  describe('accept / decline / revoke', () => {
    it('accept: 正しい URL に POST される', async () => {
      mockedClient.post.mockResolvedValue({})

      await householdInvitationApi.accept('token-accept')

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/api/household-invitations/token-accept/accept',
        {},
      )
    })

    it('decline: 正しい URL に POST される', async () => {
      mockedClient.post.mockResolvedValue({})

      await householdInvitationApi.decline('token-decline')

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/api/household-invitations/token-decline/decline',
        {},
      )
    })

    it('revoke: 正しい URL に POST される', async () => {
      mockedClient.post.mockResolvedValue({})

      await householdInvitationApi.revoke('token-revoke')

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/api/household-invitations/token-revoke/revoke',
        {},
      )
    })
  })
})
