import type { Housework } from './housework.model'
import type { HouseworkFormModel } from './houseworkForm.model'
import { createDefaultHouseworkForm } from './houseworkForm.model'
import type { HouseworkSaveInput } from './housework.model'
import { RECURRENCE_TYPE } from '@/constants/code.constants'

const weeklyDaysToMask = (days?: string[] | null): number =>
  (days ?? []).reduce((mask, v) => mask | (1 << Number(v)), 0)

const maskToWeeklyDays = (mask: number): string[] => {
  const result: string[] = []
  for (let bit = 0; bit < 7; bit++) {
    if ((mask & (1 << bit)) !== 0) result.push(String(bit))
  }
  return result
}

/**
 * Domain Model → FormModelへの変換
 * @param housework Domain Model
 * @returns FormModel
 */
export const toHouseworkFormModel = (housework: Housework): HouseworkFormModel => {
  const form = createDefaultHouseworkForm()
  form.name = housework.name
  form.description = housework.description ?? ''
  form.category = housework.category
  form.recurrenceType = housework.recurrenceType
  form.startDate = housework.startDate ?? ''
  form.endDate = housework.endDate ?? ''
  form.defaultAssigneeUserId = housework.defaultAssigneeUserId ?? null

  switch (housework.recurrenceType) {
    case RECURRENCE_TYPE.WEEKLY:
      form.weeklyDays = housework.weeklyDays != null ? maskToWeeklyDays(housework.weeklyDays) : []
      break
    case RECURRENCE_TYPE.MONTHLY:
      form.dayOfMonthOption = housework.dayOfMonth
      break
    case RECURRENCE_TYPE.NTH_WEEKDAY:
      form.nthWeek = housework.nthWeek
      form.weekday = housework.weekday
      break
  }

  return form
}

/**
 * FormModel → Domain Inputへの変換
 * @param form FormModel
 * @returns Domain Input
 */
export const fromHouseworkFormModel = (form: HouseworkFormModel): HouseworkSaveInput => {
  // デフォルトは全部 null
  let weeklyDays: number | null = null
  let dayOfMonth: number | null = null
  let nthWeek: number | null = null
  let weekday: number | null = null

  switch (form.recurrenceType) {
    case RECURRENCE_TYPE.WEEKLY:
      weeklyDays = weeklyDaysToMask(form.weeklyDays)
      break
    case RECURRENCE_TYPE.MONTHLY:
      dayOfMonth = form.dayOfMonthOption != null ? Number(form.dayOfMonthOption) : null
      break
    case RECURRENCE_TYPE.NTH_WEEKDAY:
      nthWeek = form.nthWeek ?? null
      weekday = form.weekday ?? null
      break
  }

  return {
    name: form.name,
    description: form.description,
    category: form.category,
    recurrenceType: form.recurrenceType,
    weeklyDays,
    dayOfMonth,
    nthWeek,
    weekday,
    defaultAssigneeUserId: form.defaultAssigneeUserId,
    startDate: form.startDate,
    endDate: form.endDate,
  }
}
