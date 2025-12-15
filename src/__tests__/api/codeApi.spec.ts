import { describe, it, expect, vi, beforeEach } from 'vitest'
import { codeApi } from '@/api/codeApi'
import { apiClient } from '@/api/client'
import type { CodeModel } from '@/domain'

// apiClient モック用の型（any なし）
type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
}

// 実体をモックとして扱う
const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
    },
  }
})

describe('codeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchAllCodes: /api/codes に GET し、codes 配列を CodeModel[] に変換して返す', async () => {
    const dtoList = [
      {
        codeType: '0001',
        codeTypeName: '区分',
        codeTypeNameEn: 'Type',
        codeValue: '1',
        name: '名前',
        displayNameJa: '日本語',
        displayNameEn: 'English',
        displayNameEs: 'Español',
        remarks: '備考',
        displayOrder: '1',
      },
    ]

    mockedClient.get.mockResolvedValue({
      data: {
        codes: dtoList,
      },
    })

    const result = await codeApi.fetchAllCodes()

    expect(mockedClient.get).toHaveBeenCalledTimes(1)
    expect(mockedClient.get).toHaveBeenCalledWith('/api/codes')

    const expected: CodeModel[] = [
      {
        codeType: '0001',
        codeTypeName: '区分',
        codeTypeNameEn: 'Type',
        codeValue: '1',
        name: '名前',
        displayNameJa: '日本語',
        displayNameEn: 'English',
        displayNameEs: 'Español',
        remarks: '備考',
        displayOrder: '1',
      },
    ]

    expect(result).toEqual(expected)
  })

  it('fetchAllCodes: data.codes が配列でない場合は空配列を返す', async () => {
    // codes が undefined のパターン
    mockedClient.get.mockResolvedValue({
      data: {
        codes: undefined,
      },
    })

    const result = await codeApi.fetchAllCodes()

    expect(mockedClient.get).toHaveBeenCalledTimes(1)
    expect(result).toEqual([])
  })
})
