import type { CategoryCode, TaskStatusCode } from '@/constants/code.constants'

/**
 * 家事タスク Domain Model
 */
export interface HouseworkTaskModel {
  houseworkTaskId: number
  householdId: number
  houseworkId: number
  houseworkName: string
  categoryCode: CategoryCode | null
  targetDate: string
  assigneeUserId: number | null
  assigneeNickname: string | null
  status: TaskStatusCode
  assignReasonType: string | null
  doneAt: string | null
  skippedReason: string | null

  // 拡張プロパティ
  isOverdue: boolean
  isToday: boolean
}
