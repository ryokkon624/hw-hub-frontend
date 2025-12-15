import { RECURRENCE_TYPE, CATEGORY } from '@/constants/code.constants'
import type { CategoryCode, RecurrenceTypeCode } from '@/constants/code.constants'
export interface HouseworkFormModel {
  // 基本情報
  name: string
  description: string

  // コード値
  category: CategoryCode // 0004
  recurrenceType: RecurrenceTypeCode // 0001

  // 周期タイプ別の入力
  // Weekly 用：複数曜日（code_type=0002, code_value '0'〜'6'）
  weeklyDays: string[]

  // Monthly 用：1〜30 or 'LAST' みたいな選択肢を想定
  dayOfMonthOption: number | null

  // NthWeekday 用：第n週 + 曜日
  nthWeek: number | null // 0003
  weekday: number | null // 0002 単一

  // 担当者（とりあえず ID or 名前どちらでも）
  defaultAssigneeUserId: number | null

  // 有効期間
  startDate: string // '2025-01-01' デフォルト
  endDate: string // '2029-12-31' デフォルト
}

// 新規作成用の初期値
export const createDefaultHouseworkForm = (): HouseworkFormModel => ({
  name: '',
  description: '',
  category: CATEGORY.OTHER,
  recurrenceType: RECURRENCE_TYPE.WEEKLY,

  weeklyDays: [],
  dayOfMonthOption: null,
  nthWeek: null,
  weekday: null,

  defaultAssigneeUserId: null,
  startDate: '2025-01-01',
  endDate: '2029-12-31',
})

export const weeklyDaysMaskToCodes = (mask: number): string[] => {
  const result: string[] = []
  // 0: Sun, 1: Mon ... 6: Sat 想定
  for (let i = 0; i < 7; i++) {
    if ((mask & (1 << i)) !== 0) {
      result.push(String(i))
    }
  }
  return result
}

export const dayOfMonthToOption = (dayOfMonth: number | null): string | null => {
  if (dayOfMonth == null) return null
  if (dayOfMonth === 31) return 'LAST'
  return String(dayOfMonth)
}
