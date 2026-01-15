import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userApi } from '@/api/userApi'
import { apiClient } from '@/api/client'
import type { HouseholdModel, UserProfile } from '@/domain'

vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUserHouseholds: GET /users/me/households して DTO を HouseholdModel[] に変換する', async () => {
    mockedClient.get.mockResolvedValue({
      data: [
        { householdId: 1, name: 'A家', ownerUserId: 10 },
        { householdId: 2, name: 'B家', ownerUserId: 20 },
      ],
    })

    const result = await userApi.getUserHouseholds()

    expect(mockedClient.get).toHaveBeenCalledTimes(1)
    expect(mockedClient.get).toHaveBeenCalledWith('/api/users/me/households')

    const expected: HouseholdModel[] = [
      { householdId: 1, name: 'A家', ownerUserId: 10 },
      { householdId: 2, name: 'B家', ownerUserId: 20 },
    ]
    expect(result).toEqual(expected)
  })

  it('getProfile: GET /users/me/profile して DTO を UserProfile に変換する（iconUrl あり）', async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        userId: 1,
        email: 'user@example.com',
        displayName: 'ユーザ',
        locale: 'ja',
        iconUrl: 'https://example.com/icon.png',
      },
    })

    const result = await userApi.getProfile()

    expect(mockedClient.get).toHaveBeenCalledTimes(1)
    expect(mockedClient.get).toHaveBeenCalledWith('/api/users/me/profile')

    const expected: UserProfile = {
      userId: 1,
      email: 'user@example.com',
      displayName: 'ユーザ',
      locale: 'ja',
      iconUrl: 'https://example.com/icon.png',
    }
    expect(result).toEqual(expected)
  })

  it('getProfile: iconUrl が undefined の場合は null として扱う', async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        userId: 2,
        email: 'no-icon@example.com',
        displayName: 'No Icon',
        locale: 'en',
        // iconUrl 省略
      },
    })

    const result = await userApi.getProfile()

    const expected: UserProfile = {
      userId: 2,
      email: 'no-icon@example.com',
      displayName: 'No Icon',
      locale: 'en',
      iconUrl: null,
    }
    expect(result).toEqual(expected)
  })

  it('updateProfile: PUT /users/me/profile に payload を送信する', async () => {
    mockedClient.put.mockResolvedValue({ data: undefined })

    await userApi.updateProfile({
      displayName: 'New Name',
      locale: 'ja',
    })

    expect(mockedClient.put).toHaveBeenCalledTimes(1)
    expect(mockedClient.put).toHaveBeenCalledWith('/api/users/me/profile', {
      displayName: 'New Name',
      locale: 'ja',
    })
  })

  it('createIconUploadUrl: POST /users/me/icon/upload-url して data を返す', async () => {
    mockedClient.post.mockResolvedValue({
      data: {
        uploadUrl: 'https://upload.example.com/icon',
        fileKey: 'icon-key-123',
      },
    })

    const result = await userApi.createIconUploadUrl({
      fileName: 'icon.png',
      mimeType: 'image/png',
    })

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    const args = mockedClient.post.mock.calls[0]!
    expect(args[0]).toBe('/api/users/me/icon/upload-url')
    expect(args[1]).toEqual({
      fileName: 'icon.png',
      mimeType: 'image/png',
    })

    expect(result).toEqual({
      uploadUrl: 'https://upload.example.com/icon',
      fileKey: 'icon-key-123',
    })
  })

  it('updateUserIcon: POST /users/me/icon に fileKey を送信する', async () => {
    mockedClient.post.mockResolvedValue({ data: undefined })

    await userApi.updateUserIcon({ fileKey: 'icon-key-999' })

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    expect(mockedClient.post).toHaveBeenCalledWith('/api/users/me/icon', {
      fileKey: 'icon-key-999',
    })
  })

  it('deleteAccount: DELETE /users/me を実行する', async () => {
    mockedClient.delete.mockResolvedValue({ data: undefined })

    await userApi.deleteAccount()

    expect(mockedClient.delete).toHaveBeenCalledTimes(1)
    expect(mockedClient.delete).toHaveBeenCalledWith('/api/users/me')
  })
})
