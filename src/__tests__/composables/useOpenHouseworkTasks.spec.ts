// src/__tests__/composables/useOpenHouseworkTasks.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { HouseworkTaskModel } from '@/domain'
import { TASK_STATUS } from '@/constants/code.constants'

// --- composable を後から import する（モック設定後に読み込むため）
import { useOpenHouseworkTasks } from '@/composables/useOpenHouseworkTasks'

// ---- モック用の型 ----
type MockHouseholdStore = {
  currentHouseholdId: number | null
}

type MockTaskStore = {
  items: HouseworkTaskModel[]
  fetchTasks: (params: { householdId: number; status?: string; force?: boolean }) => Promise<void>
}

// 実体（テストごとに値だけ入れ替える）
const mockHouseholdStore: MockHouseholdStore = {
  currentHouseholdId: null,
}

type FetchTasksFn = (params: {
  householdId: number
  status?: string
  force?: boolean
}) => Promise<void>

const fetchTasksSpy = vi.fn<FetchTasksFn>()

const mockTaskStore: MockTaskStore = {
  items: [],
  fetchTasks: fetchTasksSpy,
}

// ---- stores のモック定義 ----
vi.mock('@/stores/householdStore', () => ({
  useHouseholdStore: () => mockHouseholdStore,
}))

vi.mock('@/stores/houseworkTaskStore', () => ({
  useHouseworkTaskStore: () => mockTaskStore,
}))

describe('useOpenHouseworkTasks', () => {
  beforeEach(() => {
    // 各テスト前にリセット
    mockHouseholdStore.currentHouseholdId = null
    mockTaskStore.items = []
    fetchTasksSpy.mockReset()
  })

  it('householdId が null のとき fetchOpenTasks は何もしない', async () => {
    mockHouseholdStore.currentHouseholdId = null

    const { fetchOpenTasks } = useOpenHouseworkTasks()

    await fetchOpenTasks() // force 未指定

    expect(fetchTasksSpy).not.toHaveBeenCalled()
  })

  it('householdId があれば NOT_DONE & force フラグ付きで fetchTasks を呼ぶ', async () => {
    mockHouseholdStore.currentHouseholdId = 123

    const { fetchOpenTasks } = useOpenHouseworkTasks()

    await fetchOpenTasks({ force: true })

    expect(fetchTasksSpy).toHaveBeenCalledTimes(1)
    expect(fetchTasksSpy).toHaveBeenCalledWith({
      householdId: 123,
      status: TASK_STATUS.NOT_DONE,
      force: true,
    })
  })

  it('allOpenTasks は taskStore.items をそのまま返す', () => {
    const sampleTasks: HouseworkTaskModel[] = [
      {
        houseworkTaskId: 1,
        householdId: 1,
        houseworkId: 1,
        houseworkName: 'テスト家事',
        categoryCode: null,
        targetDate: '2025-01-01',
        assigneeUserId: 10,
        assigneeNickname: 'Aさん',
        status: TASK_STATUS.NOT_DONE,
        assignReasonType: null,
        doneAt: '2025-01-01T00:00:00Z',
        skippedReason: null,
        isOverdue: false,
        isToday: false,
      },
    ]

    mockTaskStore.items = sampleTasks
    mockHouseholdStore.currentHouseholdId = 1

    const { allOpenTasks } = useOpenHouseworkTasks()

    expect(allOpenTasks.value).toEqual(sampleTasks)
  })
})
