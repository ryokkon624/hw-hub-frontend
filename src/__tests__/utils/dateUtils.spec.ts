// src/__tests__/utils/dateUtils.spec.ts
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import {
  toYmd,
  parseDateSafe,
  addDays,
  todayYmd,
  isWithinDays,
  compareYmd,
} from '@/utils/dateUtils'

describe('dateUtils', () => {
  describe('toYmd', () => {
    it('Date を YYYY-MM-DD 形式に変換する', () => {
      const d = new Date(2025, 0, 2) // 2025-01-02
      expect(toYmd(d)).toBe('2025-01-02')
    })
  })

  describe('parseDateSafe', () => {
    it('有効な日付文字列は Date に変換される', () => {
      const result = parseDateSafe('2025-03-15')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2025)
      expect(result?.getMonth()).toBe(2) // 0-origin
      expect(result?.getDate()).toBe(15)
    })

    it('null / undefined は null を返す', () => {
      expect(parseDateSafe(null)).toBeNull()
      expect(parseDateSafe(undefined)).toBeNull()
    })

    it('不正な文字列は null を返す', () => {
      expect(parseDateSafe('invalid-date')).toBeNull()
      // 存在しない日付
      expect(parseDateSafe('2025-02-31')).toBeNull()
    })

    it('存在しない日付は null を返す', () => {
      expect(parseDateSafe('2025-02-31')).toBeNull() // 月をまたぐ補正パターン
    })

    it('月の桁が不正でも null を返す', () => {
      expect(parseDateSafe('2025-13-10')).toBeNull()
    })

    it('日付の桁が不正でも null を返す', () => {
      expect(parseDateSafe('2025-10-40')).toBeNull()
    })
  })

  describe('addDays', () => {
    it('指定日数を加算した日付を YYYY-MM-DD で返す', () => {
      const base = new Date(2025, 0, 30) // 2025-01-30
      expect(addDays(base, 1)).toBe('2025-01-31')
      expect(addDays(base, 2)).toBe('2025-02-01') // 月またぎ
    })
  })

  describe('todayYmd / isWithinDays', () => {
    beforeAll(() => {
      // vitest の fake timers
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-05-10T00:00:00Z'))
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('todayYmd は現在日時を YYYY-MM-DD で返す', () => {
      expect(todayYmd()).toBe('2025-05-10')
    })

    it('isWithinDays: 指定日数以内なら true を返す', () => {
      // 2 日前 → 2日以内
      expect(isWithinDays('2025-05-08', 2)).toBe(true)
      // 3 日前 → 2日以内ではない
      expect(isWithinDays('2025-05-07', 2)).toBe(false)
    })

    it('isWithinDays: 未来日は false を返す', () => {
      expect(isWithinDays('2025-05-12', 5)).toBe(false)
    })

    it('isWithinDays: 不正な日付や null は false を返す', () => {
      expect(isWithinDays(null, 3)).toBe(false)
      expect(isWithinDays('invalid', 3)).toBe(false)
    })
  })

  describe('compareYmd', () => {
    it('同一日付は 0 を返す', () => {
      expect(compareYmd('2025-01-01', '2025-01-01')).toBe(0)
    })

    it('a < b のとき -1 を返す', () => {
      expect(compareYmd('2025-01-01', '2025-01-02')).toBe(-1)
    })

    it('a > b のとき 1 を返す', () => {
      expect(compareYmd('2025-01-02', '2025-01-01')).toBe(1)
    })
  })
})
