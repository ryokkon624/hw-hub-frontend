import { describe, it, expect, vi, beforeEach } from 'vitest'
import { announcementApi } from '@/api/announcementApi'
import { apiClient } from '@/api/client'
import { ANNOUNCEMENT_SEVERITY, ANNOUNCEMENT_SCOPE } from '@/constants/code.constants'

type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('announcementApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchActiveAnnouncements: /api/announcements/active に GET し、announcements 配列を Announcement[] に変換して返す', async () => {
    const dtoList = [
      {
        id: 1,
        titleJa: 'タイトル1',
        titleEn: 'Title1',
        titleEs: 'Titulo1',
        bodyJa: '本文1',
        bodyEn: 'Body1',
        bodyEs: 'Cuerpo1',
        severity: ANNOUNCEMENT_SEVERITY.INFO,
        targetScope: ANNOUNCEMENT_SCOPE.ALL,
        startAt: '2026-05-01T00:00:00',
        endAt: '2026-06-01T00:00:00',
      },
    ]

    mockedClient.get.mockResolvedValue({
      data: {
        announcements: dtoList,
      },
    })

    const result = await announcementApi.fetchActiveAnnouncements()

    expect(mockedClient.get).toHaveBeenCalledTimes(1)
    expect(mockedClient.get).toHaveBeenCalledWith('/api/announcements/active')

    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(1)
    expect(result[0]!.severity).toBe(ANNOUNCEMENT_SEVERITY.INFO)
    expect(result[0]!.targetScope).toBe(ANNOUNCEMENT_SCOPE.ALL)
    // title/body は locale ごとに提供する形式
    expect(result[0]!.titleJa).toBe('タイトル1')
    expect(result[0]!.titleEn).toBe('Title1')
    expect(result[0]!.titleEs).toBe('Titulo1')
  })

  it('fetchActiveAnnouncements: data.announcements が配列でない場合は空配列を返す', async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        announcements: undefined,
      },
    })

    const result = await announcementApi.fetchActiveAnnouncements()

    expect(result).toEqual([])
  })
})
