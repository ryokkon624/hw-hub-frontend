import { computed } from 'vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import type { HouseworkTaskModel } from '@/domain'
import { TASK_STATUS } from '@/constants/code.constants'

export const useOpenHouseworkTasks = () => {
  const householdStore = useHouseholdStore()
  const taskStore = useHouseworkTaskStore()

  const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)

  // この store は「現在の世帯の未完了タスク」を持つ前提
  const allOpenTasks = computed<HouseworkTaskModel[]>(() => {
    return (taskStore.items ?? []).filter((t) => t.status === TASK_STATUS.NOT_DONE)
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
