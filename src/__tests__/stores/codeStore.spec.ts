import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCodeStore } from '@/stores/codeStore'
import { codeApi } from '@/api/codeApi'
import type { CodeModel } from '@/domain'

vi.mock('@/api/codeApi', () => ({
  codeApi: {
    fetchAllCodes: vi.fn(),
  },
}))

describe('codeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loadAllIfNeeded が codesByType を構築し、loaded を true にする', async () => {
    const store = useCodeStore()

    const mockCodes: CodeModel[] = [
      {
        codeType: '0001',
        codeTypeName: '周期タイプ',
        codeTypeNameEn: 'Recurrence Type',
        codeValue: '1',
        name: '毎週',
        displayNameJa: '毎週',
        displayNameEn: 'Weekly',
        displayNameEs: 'Semanal',
        remarks: null,
        displayOrder: '1',
      },
      {
        codeType: '0001',
        codeTypeName: '周期タイプ',
        codeTypeNameEn: 'Recurrence Type',
        codeValue: '2',
        name: '毎月',
        displayNameJa: '毎月',
        displayNameEn: 'Monthly',
        displayNameEs: 'Mensual',
        remarks: null,
        displayOrder: '2',
      },
      {
        codeType: '0005',
        codeTypeName: '家事タスクステータス',
        codeTypeNameEn: 'Task Status',
        codeValue: '0',
        name: '未対応',
        displayNameJa: '未対応',
        displayNameEn: 'Open',
        displayNameEs: 'Abierto',
        remarks: null,
        displayOrder: '1',
      },
    ]

    vi.mocked(codeApi.fetchAllCodes).mockResolvedValue(mockCodes)

    await store.loadAllIfNeeded()

    // API が 1回だけ呼ばれている
    expect(codeApi.fetchAllCodes).toHaveBeenCalledTimes(1)

    // loaded / loading / error
    expect(store.loaded).toBe(true)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()

    // codesByType の構造チェック
    expect(store.codesByType['0001']).toHaveLength(2)
    expect(store.codesByType['0005']).toHaveLength(1)

    // getter の確認
    const recurrenceCodes = store.getByType('0001')
    expect(recurrenceCodes.map((c) => c.codeValue)).toEqual(['1', '2'])

    const statusCode = store.getOne('0005', '0')
    expect(statusCode?.name).toBe('未対応')
  })

  it('2回目以降の loadAllIfNeeded では API を再呼び出ししない', async () => {
    const store = useCodeStore()

    const mockCodes: CodeModel[] = [
      {
        codeType: '0001',
        codeTypeName: '周期タイプ',
        codeTypeNameEn: 'Recurrence Type',
        codeValue: '1',
        name: '毎週',
        displayNameJa: '毎週',
        displayNameEn: 'Weekly',
        displayNameEs: 'Semanal',
        remarks: null,
        displayOrder: '1',
      },
    ]

    vi.mocked(codeApi.fetchAllCodes).mockResolvedValue(mockCodes)

    await store.loadAllIfNeeded()
    await store.loadAllIfNeeded() // 2回目

    // API は 1回だけ
    expect(codeApi.fetchAllCodes).toHaveBeenCalledTimes(1)
  })

  it('API エラー時は error がセットされ、loaded は false のまま', async () => {
    const store = useCodeStore()

    // console.error を一時的に黙らせる
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(codeApi.fetchAllCodes).mockRejectedValue(new Error('network error'))

    await store.loadAllIfNeeded()

    expect(store.loaded).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.error).toBeTruthy()

    // console.errorを元に戻す
    consoleErrorSpy.mockRestore()
  })
})
