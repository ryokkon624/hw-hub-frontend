import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import { houseworkTaskApi } from '@/api/houseworkTaskApi'
import type { HouseworkTaskModel } from '@/domain'
import { TASK_STATUS, type TaskStatusCode } from '@/constants/code.constants'

vi.mock('@/api/houseworkTaskApi', () => ({
  houseworkTaskApi: {
    fetchTasks: vi.fn(),
    updateAssignee: vi.fn(),
    updateStatus: vi.fn(),
    bulkUpdateStatus: vi.fn(),
  },
}))

const mockedApi = vi.mocked(houseworkTaskApi, true)

const makeTask = (overrides?: Partial<HouseworkTaskModel>): HouseworkTaskModel =>
  ({
    houseworkTaskId: 1,
    householdId: 1,
    houseworkId: 1,
    houseworkName: '猫トイレ掃除',
    categoryCode: null,
    targetDate: '2025-12-01',
    assigneeUserId: 1,
    assigneeNickname: 'ねこ好き',
    status: TASK_STATUS.NOT_DONE as TaskStatusCode,
    skippedReason: null,
    assignReasonType: null,
    isToday: false,
    ...overrides,
  }) as HouseworkTaskModel

describe('houseworkTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('openTasks: NOT_DONE のタスクだけを返す', () => {
    const store = useHouseworkTaskStore()
    const open = makeTask({ houseworkTaskId: 1, status: TASK_STATUS.NOT_DONE })
    const done = makeTask({ houseworkTaskId: 2, status: TASK_STATUS.DONE })

    store.items = [open, done]

    expect(store.openTasks).toEqual([open])
  })

  it('fetchTasks: キャッシュが無い場合は API から取得して保存する', async () => {
    const store = useHouseworkTaskStore()
    const task = makeTask()

    const now = 1_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    mockedApi.fetchTasks.mockResolvedValue([task])

    await store.fetchTasks({ householdId: 1 })

    const key = `1__${TASK_STATUS.NOT_DONE}`

    expect(mockedApi.fetchTasks).toHaveBeenCalledWith(1, TASK_STATUS.NOT_DONE)
    expect(store.items).toEqual([task])
    expect(store.cacheByKey[key]).toEqual([task])
    expect(store.lastFetchedAtByKey[key]).toBe(now)
    expect(store.loading).toBe(false)
  })

  it('fetchTasks: TTL 内のキャッシュがある場合は API を呼ばず cache をそのまま使う', async () => {
    const store = useHouseworkTaskStore()
    const task = makeTask({ houseworkTaskId: 10 })
    const key = `1__${TASK_STATUS.NOT_DONE}`

    const now = 1_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    store.cacheByKey[key] = [task]
    store.lastFetchedAtByKey[key] = now
    store.items = []

    await store.fetchTasks({ householdId: 1 })

    expect(mockedApi.fetchTasks).not.toHaveBeenCalled()
    expect(store.items).toEqual([task])
  })

  it('fetchTasks: force=true のときは TTL に関係なく再取得する', async () => {
    const store = useHouseworkTaskStore()
    const cached = makeTask({ houseworkTaskId: 1, houseworkName: 'cached' })
    const fetched = makeTask({ houseworkTaskId: 2, houseworkName: 'fresh' })
    const key = `1__${TASK_STATUS.NOT_DONE}`

    const now = 1_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    store.cacheByKey[key] = [cached]
    store.lastFetchedAtByKey[key] = now

    mockedApi.fetchTasks.mockResolvedValue([fetched])

    await store.fetchTasks({ householdId: 1, force: true })

    expect(mockedApi.fetchTasks).toHaveBeenCalledWith(1, TASK_STATUS.NOT_DONE)
    expect(store.items).toEqual([fetched])
    expect(store.cacheByKey[key]).toEqual([fetched])
  })

  it('fetchTasks: API エラー時はエラーを投げ loading を false に戻す', async () => {
    const store = useHouseworkTaskStore()

    const error = new Error('network error')
    mockedApi.fetchTasks.mockRejectedValue(error)

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(store.fetchTasks({ householdId: 1 })).rejects.toThrow('network error')

    expect(consoleSpy).toHaveBeenCalled()
    expect(store.loading).toBe(false)

    consoleSpy.mockRestore()
  })

  it('updateAssignee: items / cache の両方を更新する', async () => {
    const store = useHouseworkTaskStore()

    const task = makeTask({ houseworkTaskId: 1, assigneeUserId: 1, assignReasonType: null })
    const otherTask = makeTask({ houseworkTaskId: 2, assigneeUserId: 2 })

    const key1 = `1__${TASK_STATUS.NOT_DONE}`
    const key2 = `1__${TASK_STATUS.DONE}`

    store.items = [task, otherTask]
    store.cacheByKey[key1] = [task]
    store.cacheByKey[key2] = [otherTask]

    mockedApi.updateAssignee.mockResolvedValue()

    await store.updateAssignee(1, 99, 'MANUAL')

    expect(mockedApi.updateAssignee).toHaveBeenCalledWith(1, 99, 'MANUAL')

    const updatedItem = store.items.find((t) => t.houseworkTaskId === 1)
    expect(updatedItem?.assigneeUserId).toBe(99)
    expect(updatedItem?.assignReasonType).toBe('MANUAL')

    const updatedCacheItem = store.cacheByKey[key1].find((t) => t.houseworkTaskId === 1)
    expect(updatedCacheItem?.assigneeUserId).toBe(99)
    expect(updatedCacheItem?.assignReasonType).toBe('MANUAL')

    // 別キャッシュに入っている別タスクは変わらないこと
    const notTarget = store.cacheByKey[key2].find((t) => t.houseworkTaskId === 2)
    expect(notTarget?.assigneeUserId).toBe(2)
  })

  it('updateAssignee: items に存在しなくても cache があれば更新される', async () => {
    const store = useHouseworkTaskStore()

    const taskOnlyInCache = makeTask({ houseworkTaskId: 10, assigneeUserId: 1 })
    const key = `1__${TASK_STATUS.NOT_DONE}`

    store.items = [] // main 側には存在しない
    store.cacheByKey[key] = [taskOnlyInCache]

    mockedApi.updateAssignee.mockResolvedValue()

    await store.updateAssignee(10, 5, 'AUTO')

    const updatedCacheItem = store.cacheByKey[key].find((t) => t.houseworkTaskId === 10)
    expect(updatedCacheItem?.assigneeUserId).toBe(5)
    expect(updatedCacheItem?.assignReasonType).toBe('AUTO')
  })

  it('updateStatus: items / cache の status と skippedReason を更新する', async () => {
    const store = useHouseworkTaskStore()

    const task = makeTask({
      houseworkTaskId: 1,
      status: TASK_STATUS.NOT_DONE,
      skippedReason: null,
    })
    const key = `1__${TASK_STATUS.NOT_DONE}`

    store.items = [task]
    store.cacheByKey[key] = [task]

    mockedApi.updateStatus.mockResolvedValue()

    await store.updateStatus(1, TASK_STATUS.SKIPPED, '雨だったため')

    expect(mockedApi.updateStatus).toHaveBeenCalledWith(1, TASK_STATUS.SKIPPED, '雨だったため')

    const updatedItem = store.items[0]!
    expect(updatedItem.status).toBe(TASK_STATUS.SKIPPED)
    expect(updatedItem.skippedReason).toBe('雨だったため')

    const updatedCacheItem = store.cacheByKey[key][0]!
    expect(updatedCacheItem.status).toBe(TASK_STATUS.SKIPPED)
    expect(updatedCacheItem.skippedReason).toBe('雨だったため')
  })

  it('bulkUpdateStatus: 複数タスクの status と skippedReason を一括更新する', async () => {
    const store = useHouseworkTaskStore()

    const task1 = makeTask({
      houseworkTaskId: 1,
      status: TASK_STATUS.NOT_DONE,
      skippedReason: null,
    })
    const task2 = makeTask({
      houseworkTaskId: 2,
      status: TASK_STATUS.NOT_DONE,
      skippedReason: null,
    })
    const task3 = makeTask({
      houseworkTaskId: 3,
      status: TASK_STATUS.NOT_DONE,
      skippedReason: null,
    })
    const key = `1__${TASK_STATUS.NOT_DONE}`

    store.items = [task1, task2, task3]
    store.cacheByKey[key] = [task1, task2, task3]

    mockedApi.bulkUpdateStatus.mockResolvedValue()

    await store.bulkUpdateStatus([1, 2], TASK_STATUS.SKIPPED, 'bulk update')

    expect(mockedApi.bulkUpdateStatus).toHaveBeenCalledWith(
      [1, 2],
      TASK_STATUS.SKIPPED,
      'bulk update',
    )

    // 対象タスクが更新されていること
    const updated1 = store.items.find((t) => t.houseworkTaskId === 1)!
    expect(updated1.status).toBe(TASK_STATUS.SKIPPED)
    expect(updated1.skippedReason).toBe('bulk update')

    const updated2 = store.items.find((t) => t.houseworkTaskId === 2)!
    expect(updated2.status).toBe(TASK_STATUS.SKIPPED)
    expect(updated2.skippedReason).toBe('bulk update')

    // 対象外タスクは変わらないこと
    const notTarget = store.items.find((t) => t.houseworkTaskId === 3)!
    expect(notTarget.status).toBe(TASK_STATUS.NOT_DONE)
    expect(notTarget.skippedReason).toBeNull()

    // cache も更新されていること
    const cachedUpdated1 = store.cacheByKey[key].find((t) => t.houseworkTaskId === 1)!
    expect(cachedUpdated1.status).toBe(TASK_STATUS.SKIPPED)
    expect(cachedUpdated1.skippedReason).toBe('bulk update')
  })
})
