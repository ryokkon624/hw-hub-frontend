import { apiClient } from './client'
import type { HouseworkTaskModel } from '@/domain'
import { toYmd } from '@/utils/dateUtils'
import type { HouseholdMemberStatusCode, CategoryCode } from '@/constants/code.constants'

export const houseworkTaskApi = {
  /**
   * 指定された世帯の家事タスクを取得する。
   * @param householdId 世帯ID
   * @param status 家事タスクのステータス
   * @returns 家事タスクDomain Model配列
   */
  async fetchTasks(householdId: number, status: string): Promise<HouseworkTaskModel[]> {
    const res = await apiClient.get<HouseworkTaskDto[]>('/api/housework-tasks', {
      params: { householdId, status },
    })
    return res.data.map(toHouseworkTaskModel)
  },

  /**
   * 家事タスクの担当者を更新する。
   * @param houseworkTaskId 家事タスクID
   * @param assigneeUserId 担当者ユーザID
   * @param assignReasonType 担当割当区分
   */
  async updateAssignee(
    houseworkTaskId: number,
    assigneeUserId: number | null,
    assignReasonType: string | null,
  ): Promise<void> {
    await apiClient.patch(`/api/housework-tasks/${houseworkTaskId}/assign`, {
      assigneeUserId,
      assignReasonType,
    })
  },

  /**
   * 家事タスクのステータスを更新する。
   * @param houseworkTaskId 家事タスクID
   * @param status ステータス
   * @param skippedReason スキップ理由
   */
  async updateStatus(
    houseworkTaskId: number,
    status: string,
    skippedReason: string | null,
  ): Promise<void> {
    await apiClient.patch(`/api/housework-tasks/${houseworkTaskId}/status`, {
      status,
      skippedReason,
    })
  },

  /**
   * 家事タスクのステータスを一括で更新する。
   * @param taskIds 家事タスクIDリスト
   * @param status ステータス
   * @param skippedReason スキップ理由
   */
  async bulkUpdateStatus(
    taskIds: number[],
    status: string,
    skippedReason: string | null,
  ): Promise<void> {
    await apiClient.patch('/api/housework-tasks/bulk-status', {
      taskIds,
      status,
      skippedReason,
    })
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * Response用のタスクのDTO
 */
interface HouseworkTaskDto {
  houseworkTaskId: number
  householdId: number
  houseworkId: number
  houseworkName: string
  categoryCode: string | null
  targetDate: string
  assigneeUserId: number | null
  assigneeNickname: string | null
  status: string
  assignReasonType: string | null
  doneAt: string | null
  skippedReason: string | null
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toHouseworkTaskModel = (dto: HouseworkTaskDto): HouseworkTaskModel => {
  const today = toYmd(new Date())

  return {
    houseworkTaskId: dto.houseworkTaskId,
    householdId: dto.householdId,
    houseworkId: dto.houseworkId,
    houseworkName: dto.houseworkName,
    categoryCode: dto.categoryCode as CategoryCode,
    targetDate: dto.targetDate,
    assigneeUserId: dto.assigneeUserId,
    assigneeNickname: dto.assigneeNickname,
    status: dto.status as HouseholdMemberStatusCode,
    assignReasonType: dto.assignReasonType,
    doneAt: dto.doneAt,
    skippedReason: dto.skippedReason,
    // 追加フィールド（UI用）
    isOverdue: dto.targetDate < today,
    isToday: dto.targetDate === today,
  }
}
