import { describe, it, expect } from 'vitest'
import {
  createDefaultHouseworkForm,
  weeklyDaysMaskToCodes,
  dayOfMonthToOption,
} from '@/domain/housework/houseworkForm.model'
import { CATEGORY, RECURRENCE_TYPE } from '@/constants/code.constants'

describe('houseworkForm.model', () => {
  describe('createDefaultHouseworkForm', () => {
    it('デフォルト値が期待どおりに設定される', () => {
      const form = createDefaultHouseworkForm()

      expect(form.name).toBe('')
      expect(form.description).toBe('')
      expect(form.category).toBe(CATEGORY.OTHER)
      expect(form.recurrenceType).toBe(RECURRENCE_TYPE.WEEKLY)

      expect(form.weeklyDays).toEqual([])
      expect(form.dayOfMonthOption).toBeNull()
      expect(form.nthWeek).toBeNull()
      expect(form.weekday).toBeNull()

      expect(form.defaultAssigneeUserId).toBeNull()
      expect(form.startDate).toBe('2025-01-01')
      expect(form.endDate).toBe('2029-12-31')
    })
  })

  describe('weeklyDaysMaskToCodes', () => {
    it('mask = 0 のときは空配列を返す', () => {
      expect(weeklyDaysMaskToCodes(0)).toEqual([])
    })

    it('ビットが立っている曜日のみ「文字列の配列」で返す', () => {
      // 日(0) + 火(2) + 土(6)
      const mask = (1 << 0) | (1 << 2) | (1 << 6)
      expect(weeklyDaysMaskToCodes(mask)).toEqual(['0', '2', '6'])
    })

    it('全ビット立っている場合は 0〜6 の文字列をすべて返す', () => {
      const fullMask = (1 << 7) - 1 // 0b1111111
      expect(weeklyDaysMaskToCodes(fullMask)).toEqual(['0', '1', '2', '3', '4', '5', '6'])
    })
  })

  describe('dayOfMonthToOption', () => {
    it('null のときは null を返す', () => {
      expect(dayOfMonthToOption(null)).toBeNull()
    })

    it('31 のときは "LAST" を返す', () => {
      expect(dayOfMonthToOption(31)).toBe('LAST')
    })

    it('それ以外の数値は文字列にして返す', () => {
      expect(dayOfMonthToOption(1)).toBe('1')
      expect(dayOfMonthToOption(15)).toBe('15')
      expect(dayOfMonthToOption(30)).toBe('30')
    })
  })
})
