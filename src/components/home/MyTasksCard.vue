<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import type { HouseworkTaskModel } from '@/domain'
import { toYmd, addDays } from '@/utils/dateUtils'
import { TASK_STATUS } from '@/constants/code.constants'
import { CheckSquare } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const today = new Date()
const todayYmd = toYmd(today)
const weekEndYmd = addDays(today, 7)

const router = useRouter()
const authStore = useAuthStore()
const taskStore = useHouseworkTaskStore()

const loginUserId = computed(() => authStore.currentUser?.userId ?? null)

const allTasks = computed<HouseworkTaskModel[]>(() => taskStore.items ?? [])

// 自分担当 & 未対応
const myOpenTasks = computed(() =>
  allTasks.value.filter(
    (t) => t.assigneeUserId === loginUserId.value && t.status === TASK_STATUS.NOT_DONE,
  ),
)

const myTodayCount = computed(
  () => myOpenTasks.value.filter((t) => t.targetDate === todayYmd).length,
)

const myWeekCount = computed(
  () =>
    myOpenTasks.value.filter((t) => t.targetDate >= todayYmd && t.targetDate <= weekEndYmd).length,
)

const myOverdueCount = computed(
  () => myOpenTasks.value.filter((t) => t.targetDate < todayYmd).length,
)

const goMyTasks = () => {
  router.push({ name: 'housework.tasks' })
}
</script>

<template>
  <article class="rounded-xl border bg-white p-4 shadow-sm flex flex-col justify-between gap-3">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-hwhub-heading flex items-center gap-2">
          <CheckSquare class="w-5 h-5" />
          <span>{{ t('pageTitles.myTasks') }}</span>
        </h3>
        <p class="mt-1 text-xs text-hwhub-muted">
          {{ t('home.myTasks.summary') }}
        </p>
      </div>
      <div class="flex flex-col items-end min-w-20">
        <span class="text-[11px] text-hwhub-muted">{{ t('home.myTasks.todayLabel') }}</span>
        <span
          class="mt-0.5 inline-flex items-center justify-center rounded-full bg-hwhub-primary-50 px-3 py-1 text-sm font-semibold text-hwhub-primary"
        >
          {{ t('home.common.taskCount', { count: myTodayCount }) }}
        </span>
      </div>
    </header>

    <div class="mt-2 grid grid-cols-2 gap-3 text-xs">
      <div class="rounded-lg bg-hwhub-surface-subtle px-3 py-2 flex flex-col">
        <span class="text-hwhub-muted">{{ t('home.myTasks.weekLabel') }}</span>
        <span class="mt-1 text-base font-semibold text-hwhub-heading">
          {{ t('home.common.taskCount', { count: myWeekCount }) }}
        </span>
      </div>
      <div class="rounded-lg bg-hwhub-danger-soft px-3 py-2 flex flex-col">
        <span class="text-hwhub-body">{{ t('home.myTasks.overdueLabel') }}</span>
        <span class="mt-1 text-base font-semibold text-hwhub-danger">
          {{ t('home.common.taskCount', { count: myOverdueCount }) }}
        </span>
      </div>
    </div>

    <footer class="mt-3 flex items-center justify-between gap-2 text-[11px] text-hwhub-muted">
      <span>{{ t('home.myTasks.note') }}</span>
      <button
        type="button"
        class="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-hwhub-primary hover:bg-hwhub-primary"
        @click="goMyTasks"
      >
        {{ t('home.myTasks.openButton') }}
      </button>
    </footer>
  </article>
</template>
