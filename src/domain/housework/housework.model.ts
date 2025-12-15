import type { CategoryCode, RecurrenceTypeCode } from '@/constants/code.constants'

/**
 * 家事 Domain Model
 */
export interface Housework {
  houseworkId: number
  householdId: number
  name: string
  description: string | null
  category: CategoryCode
  recurrenceType: RecurrenceTypeCode
  weeklyDays: number | null
  dayOfMonth: number | null
  nthWeek: number | null
  weekday: number | null
  startDate: string | null
  endDate: string | null
  defaultAssigneeUserId: number | null
}

/**
 * Domain Input
 */
export interface HouseworkSaveInput {
  name: string
  description: string
  category: CategoryCode
  recurrenceType: RecurrenceTypeCode
  weeklyDays: number | null
  dayOfMonth: number | null
  nthWeek: number | null
  weekday: number | null
  startDate: string
  endDate: string
  defaultAssigneeUserId: number | null
}
