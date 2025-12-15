import { describe, it, expect } from 'vitest'
import {
  toHouseworkFormModel,
  fromHouseworkFormModel,
} from '@/domain/housework/houseworkForm.mapper'
import { createDefaultHouseworkForm } from '@/domain/housework/houseworkForm.model'
import type { Housework } from '@/domain/housework/housework.model'
import type { HouseworkFormModel } from '@/domain/housework/houseworkForm.model'
import type { HouseworkSaveInput } from '@/domain/housework/housework.model'
import { RECURRENCE_TYPE } from '@/constants/code.constants'

describe('houseworkForm.mapper', () => {
  const baseHousework = (override: Partial<Housework>): Housework =>
    ({
      // ここは型を気にせず、最低限のダミーを入れて unknown 経由で Housework にキャスト
      houseworkId: 1,
      householdId: 1,
      name: 'Base',
      description: null,
      category: 'CATEGORY',
      recurrenceType: RECURRENCE_TYPE.WEEKLY,
      weeklyDays: null,
      dayOfMonth: null,
      nthWeek: null,
      weekday: null,
      defaultAssigneeUserId: null,
      startDate: '',
      endDate: '',
      ...override,
    }) as unknown as Housework

  const baseForm = (override: Partial<HouseworkFormModel>): HouseworkFormModel => {
    const form = createDefaultHouseworkForm()
    Object.assign(form, override)
    return form
  }

  describe('toHouseworkFormModel (Domain → Form)', () => {
    it('WEEKLY: 共通項目と weeklyDaysMask を weeklyDays 配列に変換する', () => {
      const housework = baseHousework({
        name: '掃除',
        description: 'desc',
        category: 'CLEAN',
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        defaultAssigneeUserId: 10,
        // bit0(日) + bit2(火) → "0", "2"
        weeklyDays: (1 << 0) | (1 << 2),
      })

      const form = toHouseworkFormModel(housework)

      expect(form.name).toBe('掃除')
      expect(form.description).toBe('desc')
      expect(form.category).toBe('CLEAN')
      expect(form.recurrenceType).toBe(RECURRENCE_TYPE.WEEKLY)
      expect(form.startDate).toBe('2025-01-01')
      expect(form.endDate).toBe('2025-01-31')
      expect(form.defaultAssigneeUserId).toBe(10)
      expect(form.weeklyDays).toEqual(['0', '2'])
    })

    it('WEEKLY: weeklyDays が null/undefined のときは空配列になる', () => {
      const housework = baseHousework({
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        weeklyDays: null,
      })

      const form = toHouseworkFormModel(housework)

      expect(form.weeklyDays).toEqual([])
    })

    it('MONTHLY: dayOfMonth を dayOfMonthOption にセットする', () => {
      const housework = baseHousework({
        recurrenceType: RECURRENCE_TYPE.MONTHLY,
        dayOfMonth: 15,
      })

      const form = toHouseworkFormModel(housework)

      expect(form.recurrenceType).toBe(RECURRENCE_TYPE.MONTHLY)
      expect(form.dayOfMonthOption).toBe(15)
      // WEEKLY 系は触られていない（初期値のまま）
      expect(form.weeklyDays).toEqual([])
    })

    it('NTH_WEEKDAY: nthWeek / weekday をそのまま Form にコピーする', () => {
      const housework = baseHousework({
        recurrenceType: RECURRENCE_TYPE.NTH_WEEKDAY,
        nthWeek: 2,
        weekday: 4,
      })

      const form = toHouseworkFormModel(housework)

      expect(form.recurrenceType).toBe(RECURRENCE_TYPE.NTH_WEEKDAY)
      expect(form.nthWeek).toBe(2)
      expect(form.weekday).toBe(4)
    })
  })

  describe('fromHouseworkFormModel (Form → SaveInput)', () => {
    it('WEEKLY: weeklyDays 配列を bitmask に変換する', () => {
      const form = baseForm({
        name: 'ごみ出し',
        description: 'desc',
        category: 'CLEAN',
        recurrenceType: RECURRENCE_TYPE.WEEKLY,
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        defaultAssigneeUserId: 99,
        weeklyDays: ['0', '3', '6'], // 日 + 水 + 土
      })

      const input: HouseworkSaveInput = fromHouseworkFormModel(form)

      const expectedMask = (1 << 0) | (1 << 3) | (1 << 6)
      expect(input.name).toBe('ごみ出し')
      expect(input.description).toBe('desc')
      expect(input.category).toBe('CLEAN')
      expect(input.recurrenceType).toBe(RECURRENCE_TYPE.WEEKLY)
      expect(input.weeklyDays).toBe(expectedMask)
      expect(input.dayOfMonth).toBeNull()
      expect(input.nthWeek).toBeNull()
      expect(input.weekday).toBeNull()
      expect(input.defaultAssigneeUserId).toBe(99)
      expect(input.startDate).toBe('2025-02-01')
      expect(input.endDate).toBe('2025-02-28')
    })

    it('MONTHLY: dayOfMonthOption を number にして dayOfMonth へセットする', () => {
      const form = baseForm({
        name: '換気フィルター掃除',
        description: '',
        category: 'CLEAN',
        recurrenceType: RECURRENCE_TYPE.MONTHLY,
        dayOfMonthOption: 20,
      })

      const input = fromHouseworkFormModel(form)

      expect(input.recurrenceType).toBe(RECURRENCE_TYPE.MONTHLY)
      expect(input.dayOfMonth).toBe(20)
      expect(input.weeklyDays).toBeNull()
      expect(input.nthWeek).toBeNull()
      expect(input.weekday).toBeNull()
    })

    it('MONTHLY: dayOfMonthOption が null のとき dayOfMonth は null になる', () => {
      const form = baseForm({
        recurrenceType: RECURRENCE_TYPE.MONTHLY,
        dayOfMonthOption: null,
      })

      const input = fromHouseworkFormModel(form)

      expect(input.recurrenceType).toBe(RECURRENCE_TYPE.MONTHLY)
      expect(input.dayOfMonth).toBeNull()
    })

    it('NTH_WEEKDAY: nthWeek / weekday をそのまま number として渡す', () => {
      const form = baseForm({
        recurrenceType: RECURRENCE_TYPE.NTH_WEEKDAY,
        nthWeek: 3,
        weekday: 1,
      })

      const input = fromHouseworkFormModel(form)

      expect(input.recurrenceType).toBe(RECURRENCE_TYPE.NTH_WEEKDAY)
      expect(input.nthWeek).toBe(3)
      expect(input.weekday).toBe(1)
      expect(input.weeklyDays).toBeNull()
      expect(input.dayOfMonth).toBeNull()
    })

    it('NTH_WEEKDAY: nthWeek / weekday が null のときも null のまま渡す', () => {
      const form = baseForm({
        recurrenceType: RECURRENCE_TYPE.NTH_WEEKDAY,
        nthWeek: null,
        weekday: null,
      })

      const input = fromHouseworkFormModel(form)

      expect(input.recurrenceType).toBe(RECURRENCE_TYPE.NTH_WEEKDAY)
      expect(input.nthWeek).toBeNull()
      expect(input.weekday).toBeNull()
    })
  })
})
