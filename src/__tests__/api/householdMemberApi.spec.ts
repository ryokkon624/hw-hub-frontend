import { describe, it, expect, vi, beforeEach } from 'vitest'
import { householdMemberApi } from '@/api/householdMemberApi'
import { apiClient } from '@/api/client'

type MockedApiClient = {
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => {
  return {
    apiClient: {
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('householdMemberApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updateMyNickname: 指定された householdId / nickname で PUT される', async () => {
    mockedClient.put.mockResolvedValue({})

    await householdMemberApi.updateMyNickname(1, 'ニックネーム')

    expect(mockedClient.put).toHaveBeenCalledTimes(1)
    expect(mockedClient.put).toHaveBeenCalledWith('/api/households/1/members/me/nickname', {
      nickname: 'ニックネーム',
    })
  })

  it('leaveMyself: 指定された householdId で /members/me に DELETE される', async () => {
    mockedClient.delete.mockResolvedValue({})

    await householdMemberApi.leaveMyself(2)

    expect(mockedClient.delete).toHaveBeenCalledTimes(1)
    expect(mockedClient.delete).toHaveBeenCalledWith('/api/households/2/members/me')
  })

  it('removeMember: 指定された householdId / userId で /members/:userId に DELETE される', async () => {
    mockedClient.delete.mockResolvedValue({})

    await householdMemberApi.removeMember(3, 99)

    expect(mockedClient.delete).toHaveBeenCalledTimes(1)
    expect(mockedClient.delete).toHaveBeenCalledWith('/api/households/3/members/99')
  })
})
