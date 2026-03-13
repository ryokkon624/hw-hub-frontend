<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import type { HouseworkTaskModel } from '@/domain'
import { toYmd, addDays } from '@/utils/dateUtils'
import { TASK_STATUS } from '@/constants/code.constants'
import { ClipboardList } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const householdStore = useHouseholdStore()
const taskStore = useHouseworkTaskStore()

const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)

const today = new Date()
const todayYmd = toYmd(today)

const soon3DaysEndYmd = addDays(today, 3)

const allTasks = computed<HouseworkTaskModel[]>(() => {
  if (!currentHouseholdId.value) return []
  return taskStore.items ?? []
})

const unassignedTasks = computed(() =>
  allTasks.value.filter((t) => t.assigneeUserId == null && t.status === TASK_STATUS.NOT_DONE),
)

const unassignedTotal = computed(() => unassignedTasks.value.length)

const unassignedSoonCount = computed(
  () =>
    unassignedTasks.value.filter((t) => t.targetDate >= todayYmd && t.targetDate <= soon3DaysEndYmd)
      .length,
)

const goAssign = () => {
  router.push({ name: 'housework.assign' })
}
</script>

<template>
  <article class="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-4">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-hwhub-heading flex items-center gap-2">
          <ClipboardList class="w-5 h-5 text-amber-500" />
          <span>
            <span>{{ t('home.unassigned.title') }}</span></span
          >
        </h3>
        <p class="mt-1 text-xs text-hwhub-muted">
          {{ t('home.unassigned.summary') }}
        </p>
      </div>
    </header>

    <div class="grid grid-cols-2 gap-3">
      <!-- 未割り当て総数 -->
      <div
        class="rounded-lg bg-hwhub-accent-soft border border-hwhub-accent px-3 py-2 flex flex-col"
      >
        <span class="text-[11px] text-hwhub-muted">{{ t('home.unassigned.totalLabel') }}</span>
        <span class="mt-1 text-xl font-semibold text-hwhub-heading">
          {{ t('home.common.taskCount', { count: unassignedTotal }) }}
        </span>
        <span class="text-[11px] text-hwhub-muted mt-0.5">{{
          t('home.unassigned.totalPeriod')
        }}</span>
      </div>

      <!-- 今日〜3日以内 -->
      <div
        class="rounded-lg bg-hwhub-accent-soft border border-hwhub-accent px-3 py-2 flex flex-col"
      >
        <span class="text-[11px] text-hwhub-muted">{{ t('home.unassigned.soonLabel') }}</span>
        <span class="mt-1 text-xl font-semibold text-hwhub-heading">
          {{ t('home.common.taskCount', { count: unassignedSoonCount }) }}
        </span>
        <span class="text-[11px] text-hwhub-muted mt-0.5">
          {{ t('home.unassigned.soonDescription') }}
        </span>
      </div>
    </div>

    <footer class="flex items-center justify-between gap-2 text-[11px] text-hwhub-muted">
      <span>{{ t('home.unassigned.note') }}</span>

      <button
        type="button"
        class="inline-flex items-center rounded-full bg-hwhub-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-hwhub-primary min-w-20"
        @click="goAssign"
      >
        {{ t('home.unassigned.openButton') }}
      </button>
    </footer>
  </article>
</template>
