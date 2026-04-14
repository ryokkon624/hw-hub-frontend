import { defineStore } from 'pinia'
import { houseworkTaskApi } from '@/api/houseworkTaskApi'
import type { HouseworkTaskModel } from '@/domain'
import { TASK_STATUS, type TaskStatusCode } from '@/constants/code.constants'
import { DEFAULT_CACHE_TTL_MS } from '@/constants/cache.constants'

type FetchParams = {
  householdId: number
  status?: string
  force?: boolean
}
type TaskCacheKey = string
const makeCacheKey = (householdId: number, status: string): TaskCacheKey =>
  `${householdId}__${status}`

export const useHouseworkTaskStore = defineStore('houseworkTask', {
  state: () => ({
    items: [] as HouseworkTaskModel[],
    loading: false,
    cacheByKey: {} as Record<TaskCacheKey, HouseworkTaskModel[]>,
    lastFetchedAtByKey: {} as Record<TaskCacheKey, number>,
  }),

  getters: {
    openTasks: (state) => state.items.filter((t) => t.status === TASK_STATUS.NOT_DONE),
  },

  actions: {
    /**
     * 内部の共通ヘルパー。
     * items と cacheByKey の両方に同じタスク更新を適用する。
     * @param taskId 家事タスクID
     * @param updater 家事タスクDomain Model
     */
    _applyTaskUpdate(taskId: number, updater: (t: HouseworkTaskModel) => HouseworkTaskModel) {
      // メイン items を更新
      const mainIdx = this.items.findIndex((t) => t.houseworkTaskId === taskId)
      if (mainIdx >= 0) {
        const current = this.items[mainIdx]
        if (current) {
          this.items[mainIdx] = updater(current)
        }
      }

      // キャッシュを更新
      for (const key of Object.keys(this.cacheByKey)) {
        const list = this.cacheByKey[key]
        if (!list) continue

        const idx = list.findIndex((t) => t.houseworkTaskId === taskId)
        if (idx < 0) continue

        const current = list[idx]
        if (!current) continue

        const clone = [...list]
        clone[idx] = updater(current)
        this.cacheByKey[key] = clone
      }
    },

    /**
     * 指定された世帯の家事タスクを取得する。
     * @param params
     * @returns 家事タスクDomain Model配列
     */
    async fetchTasks(params: FetchParams) {
      const { householdId } = params
      const status = params.status ?? TASK_STATUS.NOT_DONE
      const force = params.force ?? false

      this.loading = true
      try {
        const key = makeCacheKey(householdId, status)
        const now = Date.now()
        const last = this.lastFetchedAtByKey[key]
        const cached = this.cacheByKey[key]

        if (!force && last && cached && now - last < DEFAULT_CACHE_TTL_MS) {
          this.items = cached
          return
        }

        const data = await houseworkTaskApi.fetchTasks(householdId, status)
        this.items = data

        this.cacheByKey[key] = data
        this.lastFetchedAtByKey[key] = now
      } catch (e) {
        console.error(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    /**
     * 家事タスクの担当者を更新する。
     * @param taskId 家事タスクID
     * @param assigneeUserId 担当者のユーザID
     * @param assignReasonType 担当割当区分
     */
    async updateAssignee(
      taskId: number,
      assigneeUserId: number | null,
      assignReasonType: string | null = null,
    ) {
      await houseworkTaskApi.updateAssignee(taskId, assigneeUserId, assignReasonType)

      this._applyTaskUpdate(taskId, (t) => ({
        ...t,
        assigneeUserId,
        assignReasonType,
      }))
    },

    /**
     * キャッシュキーを取得する。
     * @param householdId 世帯ID
     * @param status ステータス
     * @returns キャッシュキー
     */
    getCacheKey(householdId: number, status: string): TaskCacheKey {
      return makeCacheKey(householdId, status)
    },

    /**
     * 家事タスクのステータスを更新する。
     * @param taskId 家事タスクID
     * @param status ステータス
     * @param skippedReason スキップ理由
     */
    async updateStatus(taskId: number, status: TaskStatusCode, skippedReason: string | null) {
      await houseworkTaskApi.updateStatus(taskId, status, skippedReason)

      this._applyTaskUpdate(taskId, (t) => ({
        ...t,
        status,
        skippedReason,
      }))
    },

    /**
     * 家事タスクのステータスを一括で更新する。
     * @param taskIds 家事タスクIDリスト
     * @param status ステータス
     * @param skippedReason スキップ理由
     */
    async bulkUpdateStatus(
      taskIds: number[],
      status: TaskStatusCode,
      skippedReason: string | null,
    ) {
      await houseworkTaskApi.bulkUpdateStatus(taskIds, status, skippedReason)

      for (const id of taskIds) {
        this._applyTaskUpdate(id, (t) => ({
          ...t,
          status,
          skippedReason,
        }))
      }
    },
  },
})
