// src/__tests__/utils/weeklyDaysLabel.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { weeklyDaysMaskToLabel } from '@/utils/weeklyDaysLabel'
import type { CodeModel } from '@/domain/code/code.model'
import type { StoreDefinition } from 'pinia'

// ── codeStore のモック準備 ─────────────────────────

const getOneMock = vi.fn<(codeType: string, codeValue: string) => CodeModel | undefined>()

vi.mock('@/stores/codeStore', () => {
  const useCodeStore = (() => ({
    getOne: getOneMock,
  })) as unknown as StoreDefinition

  return { useCodeStore }
})

// ── テスト用 CodeModel ────────────────────────────

const createWeekdayCode = (value: string, ja: string): CodeModel => ({
  codeType: '0002',
  codeTypeName: 'weekday',
  codeTypeNameEn: 'weekday',
  codeValue: value,
  name: ja,
  displayNameJa: ja,
  displayNameEn: ja,
  displayNameEs: ja,
  remarks: null,
  displayOrder: null,
})

describe('weeklyDaysMaskToLabel', () => {
  beforeEach(() => {
    getOneMock.mockReset()

    const codeMap: Record<string, CodeModel> = {
      // bit1=月, bit3=水, bit6=土 くらいを用意
      '1': createWeekdayCode('1', '月'),
      '3': createWeekdayCode('3', '水'),
      '6': createWeekdayCode('6', '土'),
    }

    getOneMock.mockImplementation((codeType: string, codeValue: string): CodeModel | undefined => {
      if (codeType !== '0002') return undefined
      return codeMap[codeValue]
    })
  })

  it('mask のビットに対応する曜日ラベルを「・」区切りで返す（ja）', () => {
    // bit1(月) + bit3(水) = 0b0001010 = 10
    const mask = (1 << 1) | (1 << 3)
    const label = weeklyDaysMaskToLabel(mask, 'ja')
    expect(label).toBe('月・水')

    // getOne が正しく呼ばれていることもざっくり確認
    expect(getOneMock).toHaveBeenCalledWith('0002', '1')
    expect(getOneMock).toHaveBeenCalledWith('0002', '3')
  })

  it('存在しない曜日コードのビットは無視される', () => {
    // bit0(日) は codeMap に無い → ラベルに出てこない
    const mask = 1 << 0
    const label = weeklyDaysMaskToLabel(mask, 'ja')
    expect(label).toBe('')
  })

  it('複数ビット + ロケールが en の場合でも resolveCodeLabel 経由でラベルが返る', () => {
    const mask = (1 << 1) | (1 << 6) // 月・土
    const label = weeklyDaysMaskToLabel(mask, 'en')
    // CodeModel では displayNameEn に同じ文字を入れているのでそのまま
    expect(label).toBe('月・土')
  })

  it('mask が 0 のときは空文字を返す', () => {
    const label = weeklyDaysMaskToLabel(0, 'ja')
    expect(label).toBe('')
    // getOne が一度も呼ばれないことも確認しておく
    expect(getOneMock).not.toHaveBeenCalled()
  })
})
