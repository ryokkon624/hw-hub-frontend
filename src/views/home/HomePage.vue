<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkStore } from '@/stores/houseworkStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import { useUiStore } from '@/stores/uiStore'
import HomeMyTasksCard from '@/components/home/MyTasksCard.vue'
import UnassignedTasksCard from '@/components/home/UnassignedTasksCard.vue'
import ShoppingListCard from '@/components/home/ShoppingListCard.vue'
import HouseholdSituationCard from '@/components/home/HouseholdSituationCard.vue'
import OnboardingCard from '@/components/home/OnboardingCard.vue'
import HouseholdSwitcherField from '@/components/HouseholdSwitcherField.vue'
import { TASK_STATUS } from '@/constants/code.constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const householdStore = useHouseholdStore()
const taskStore = useHouseworkTaskStore()
const shoppingStore = useShoppingStore()
const uiStore = useUiStore()
const houseworkStore = useHouseworkStore()

const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)

const fetchHomeData = async (options?: { force?: boolean }) => {
  if (!currentHouseholdId.value) return
  const hid = currentHouseholdId.value
  const force = options?.force ?? false

  await uiStore.withLoading(() =>
    Promise.all([
      householdStore.fetchMembers(hid, { force: true }),
      houseworkStore.loadAll({ force }),

      // タスク: 未対応（0）
      taskStore.fetchTasks({
        householdId: hid,
        status: TASK_STATUS.NOT_DONE,
        force: true,
      }),

      // タスク: スキップ以外のもう一種類（ここでは '1'）
      taskStore.fetchTasks({
        householdId: hid,
        status: TASK_STATUS.DONE,
        force,
      }),

      shoppingStore.fetchItems(hid, { force: true }),
    ]),
  )
}

onMounted(() => {
  fetchHomeData()
})

watch(
  () => currentHouseholdId.value,
  (newId, oldId) => {
    if (!newId || newId === oldId) return
    fetchHomeData()
  },
)
</script>

<template>
  <div class="space-y-4">
    <!-- 説明テキスト -->
    <section class="text-sm text-hwhub-muted">
      {{ t('home.intro') }}
    </section>

    <!-- SP 用 世帯スイッチャー -->
    <HouseholdSwitcherField class="sm:hidden" />

    <!-- 0. オンボーディングカード (条件付き表示) -->
    <!-- Grid の外に配置することで全幅表示にする -->
    <OnboardingCard />

    <!-- カード群：PC は 2 カラム、SP は 1 カラム -->
    <!-- カード群：PC は 2 カラム、SP は 1 カラム -->
    <section class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      <!-- A. My Tasks カード -->
      <HomeMyTasksCard />

      <!-- B. 家事未割り当てカード -->
      <UnassignedTasksCard />

      <!-- C. 買い物リストカード -->
      <ShoppingListCard />

      <!-- D. 世帯の様子カード -->
      <HouseholdSituationCard />
    </section>
  </div>
</template>
