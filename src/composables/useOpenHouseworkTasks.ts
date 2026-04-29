import { computed } from 'vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import type { HouseworkTaskModel } from '@/domain'
import { TASK_STATUS } from '@/constants/code.constants'

export const useOpenHouseworkTasks = () => {
  const householdStore = useHouseholdStore()
  const taskStore = useHouseworkTaskStore()

  const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)

  // openTasks getter経由で未完了タスクを取得する
  const allOpenTasks = computed<HouseworkTaskModel[]>(() => {
    return taskStore.openTasks
  })

  const fetchOpenTasks = async (opts?: { force?: boolean }) => {
    if (!currentHouseholdId.value) return
    await taskStore.fetchTasks({
      householdId: currentHouseholdId.value!,
      status: TASK_STATUS.NOT_DONE,
      force: opts?.force,
    })
  }

  return {
    currentHouseholdId,
    allOpenTasks,
    fetchOpenTasks,
  }
}
