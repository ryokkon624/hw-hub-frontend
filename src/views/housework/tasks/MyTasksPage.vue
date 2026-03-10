<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import type { HouseworkTaskModel } from '@/domain'
import HouseholdSwitcherField from '@/components/HouseholdSwitcherField.vue'
import { toYmd } from '@/utils/dateUtils'
import { useOpenHouseworkTasks } from '@/composables/useOpenHouseworkTasks'
import { TASK_STATUS } from '@/constants/code.constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const uiStore = useUiStore()
const taskStore = useHouseworkTaskStore()
const { currentHouseholdId, allOpenTasks, fetchOpenTasks } = useOpenHouseworkTasks()

const loginUserId = computed(() => authStore.currentUser?.userId ?? null)

// 未来タスク用の期間フィルタ
const futureFilter = ref<'ALL' | 'TODAY' | 'WEEK'>('ALL')

// 日付 → 'YYYY-MM-DD'
const todayYmd = computed(() => toYmd(new Date()))

// すべてのタスク（この store は「現在の世帯のタスク」だけを持っている想定）
const allTasks = computed<HouseworkTaskModel[]>(() => allOpenTasks.value)

// 自分担当 & 未対応のみ
const myOpenTasks = computed<HouseworkTaskModel[]>(() => {
  if (!loginUserId.value) return []
  return allTasks.value.filter((t) => t.assigneeUserId === loginUserId.value)
})

// ── 過去 / 未来 分割 ─────────────────────────────
const pastTasks = computed<HouseworkTaskModel[]>(() =>
  myOpenTasks.value.filter((t) => t.targetDate < todayYmd.value),
)

const futureBaseTasks = computed<HouseworkTaskModel[]>(() =>
  myOpenTasks.value.filter((t) => t.targetDate >= todayYmd.value),
)

const filteredFutureTasks = computed<HouseworkTaskModel[]>(() => {
  const base = futureBaseTasks.value
  if (futureFilter.value === 'ALL') return base

  const today = new Date()

  if (futureFilter.value === 'TODAY') {
    const ymd = toYmd(today)
    return base.filter((t) => t.targetDate === ymd)
  }

  if (futureFilter.value === 'WEEK') {
    const from = toYmd(today)
    const d = new Date()
    d.setDate(today.getDate() + 7)
    const to = toYmd(d)
    return base.filter((t) => t.targetDate >= from && t.targetDate <= to)
  }

  return base
})

// ── 日付表示 & グルーピング ───────────────────────
type TaskGroup = {
  date: string
  label: string
  tasks: HouseworkTaskModel[]
}

const buildDateLabel = (ymd: string): string => {
  const [yStr, mStr, dStr] = ymd.split('-')
  const y = Number(yStr)
  const m = Number(mStr)
  const d = Number(dStr)

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return ymd
  }

  const target = new Date(y, m - 1, d)
  const today = new Date()
  const todayStr = toYmd(today)

  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = toYmd(tomorrow)

  if (ymd === todayStr) return t('myTasks.date.today')
  if (ymd === tomorrowStr) return t('myTasks.date.tomorrow')

  const weekdayKey = `myTasks.date.weekday.${target.getDay()}`
  const wd = t(weekdayKey)

  return t('myTasks.date.label', { month: m, day: d, weekday: wd })
}

const groupByDate = (tasks: HouseworkTaskModel[]): TaskGroup[] => {
  const sorted = [...tasks].sort((a, b) => (a.targetDate < b.targetDate ? -1 : 1))
  const map = new Map<string, HouseworkTaskModel[]>()

  for (const t of sorted) {
    if (!map.has(t.targetDate)) {
      map.set(t.targetDate, [])
    }
    map.get(t.targetDate)!.push(t)
  }

  return Array.from(map.entries()).map(([date, ts]) => ({
    date,
    label: buildDateLabel(date),
    tasks: ts,
  }))
}

const pastGroups = computed<TaskGroup[]>(() => groupByDate(pastTasks.value))
const futureGroups = computed<TaskGroup[]>(() => groupByDate(filteredFutureTasks.value))

// ── ロード & 世帯切り替え時の再取得 ────────────────
const fetchMyTasks = async () => {
  if (!currentHouseholdId.value) return
  try {
    await uiStore.withLoading(async () => {
      await fetchOpenTasks({ force: true })
    })
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('myTasks.messages.fetchError'))
  }
}

onMounted(fetchMyTasks)

watch(
  () => currentHouseholdId.value,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return
    await fetchMyTasks()
  },
)

// ── ステータス更新系 ────────────────────────────────
const markDone = async (task: HouseworkTaskModel) => {
  try {
    await uiStore.withLoading(async () => {
      await taskStore.updateStatus(task.houseworkTaskId, TASK_STATUS.DONE, null)
    })
    uiStore.showToast('success', t('myTasks.messages.doneSuccess'))
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('myTasks.messages.doneError'))
  }
}

const skipTask = async (task: HouseworkTaskModel) => {
  const reason = window.prompt(t('myTasks.messages.skipPrompt'), '')
  if (reason === null) return

  try {
    await uiStore.withLoading(async () => {
      await taskStore.updateStatus(task.houseworkTaskId, TASK_STATUS.SKIPPED, reason || null)
    })
    uiStore.showToast('success', t('myTasks.messages.skipSuccess'))
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('myTasks.messages.skipError'))
  }
}

// 過去タスク一括完了
const bulkCompletePast = async () => {
  if (pastTasks.value.length === 0) return

  const ok = window.confirm(t('myTasks.messages.bulkConfirm', { count: pastTasks.value.length }))
  if (!ok) return

  try {
    const taskIds = pastTasks.value.map((t) => t.houseworkTaskId)
    await uiStore.withLoading(async () => {
      await taskStore.bulkUpdateStatus(taskIds, TASK_STATUS.DONE, null)
    })
    uiStore.showToast('success', t('myTasks.messages.bulkSuccess'))
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('myTasks.messages.bulkError'))
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 説明（タイトルは AppLayout 側で表示済み） -->
    <section class="text-sm text-hwhub-muted">
      {{ t('myTasks.intro') }}
    </section>

    <!-- 👇 SP 専用 世帯スイッチャー（既存コンポーネントをそのまま利用） -->
    <HouseholdSwitcherField class="sm:hidden" />

    <!-- セクション A: 過去の家事（今日より前） -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-sm font-semibold text-hwhub-heading">{{ t('myTasks.past.title') }}</h2>
          <p class="text-xs text-hwhub-muted">
            {{ t('myTasks.past.description') }}
          </p>
        </div>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-hwhub-primary hover:bg-hwhub-primary disabled:opacity-40"
          :disabled="pastTasks.length === 0"
          @click="bulkCompletePast"
        >
          {{ t('myTasks.past.bulkComplete') }}
        </button>
      </div>

      <div v-if="pastGroups.length === 0" class="text-xs text-hwhub-muted">
        {{ t('myTasks.past.empty') }}
      </div>

      <div v-else class="space-y-3">
        <div v-for="group in pastGroups" :key="group.date" class="space-y-2">
          <!-- 日付ヘッダー -->
          <div class="flex items-center gap-2 text-xs text-hwhub-muted">
            <span class="font-semibold text-hwhub-heading">{{ group.label }}</span>
            <span>{{ t('myTasks.past.groupCount', { count: group.tasks.length }) }}</span>
          </div>

          <!-- カード一覧 -->
          <div class="space-y-2">
            <article
              v-for="task in group.tasks"
              :key="task.houseworkTaskId"
              class="rounded-lg border bg-white p-3 shadow-sm flex flex-col gap-2"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-hwhub-heading truncate">
                    {{ task.houseworkName }}
                  </h3>
                </div>
              </div>

              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="px-3 py-1 rounded-full border text-xs text-hwhub-muted hover:bg-hwhub-surface-subtle"
                  @click="skipTask(task)"
                >
                  {{ t('myTasks.actions.skip') }}
                </button>
                <button
                  type="button"
                  class="px-3 py-1 rounded-full text-xs text-white bg-hwhub-primary hover:bg-hwhub-primary"
                  @click="markDone(task)"
                >
                  {{ t('myTasks.actions.complete') }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- セクション B: これからの家事（今日以降） -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <!-- ヘッダー + フィルタ -->
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <h2 class="text-sm font-semibold text-hwhub-heading">{{ t('myTasks.future.title') }}</h2>
          <p class="text-xs text-hwhub-muted">
            {{ t('myTasks.future.description') }}
          </p>
        </div>

        <div class="flex flex-col items-end gap-1">
          <div class="inline-flex rounded-full border bg-hwhub-surface-subtle p-0.5">
            <button
              type="button"
              class="px-3 py-1 rounded-full"
              :class="
                futureFilter === 'ALL'
                  ? 'bg-white text-hwhub-heading shadow-sm'
                  : 'text-hwhub-muted'
              "
              @click="futureFilter = 'ALL'"
            >
              {{ t('myTasks.future.filterAll') }}
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-full"
              :class="
                futureFilter === 'TODAY'
                  ? 'bg-white text-hwhub-heading shadow-sm'
                  : 'text-hwhub-muted'
              "
              @click="futureFilter = 'TODAY'"
            >
              {{ t('myTasks.future.filterToday') }}
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-full"
              :class="
                futureFilter === 'WEEK'
                  ? 'bg-white text-hwhub-heading shadow-sm'
                  : 'text-hwhub-muted'
              "
              @click="futureFilter = 'WEEK'"
            >
              {{ t('myTasks.future.filterWeek') }}
            </button>
          </div>
          <div class="text-[11px] text-hwhub-muted">
            {{ t('myTasks.future.pendingCount', { count: filteredFutureTasks.length }) }}
          </div>
        </div>
      </div>

      <div v-if="futureGroups.length === 0" class="text-xs text-hwhub-muted">
        {{ t('myTasks.future.empty') }}
      </div>

      <div v-else class="space-y-3">
        <div v-for="group in futureGroups" :key="group.date" class="space-y-2">
          <!-- 日付ヘッダー -->
          <div class="flex items-center gap-2 text-xs text-hwhub-muted">
            <span class="font-semibold text-hwhub-heading">{{ group.label }}</span>
            <span> {{ t('myTasks.future.groupCount', { count: group.tasks.length }) }}</span>
          </div>

          <!-- カード一覧 -->
          <div class="space-y-2">
            <article
              v-for="task in group.tasks"
              :key="task.houseworkTaskId"
              class="rounded-lg border bg-white p-3 shadow-sm flex flex-col gap-2"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-hwhub-heading truncate">
                    {{ task.houseworkName }}
                  </h3>
                </div>
              </div>

              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="px-3 py-1 rounded-full border text-xs text-hwhub-muted hover:bg-hwhub-surface-subtle"
                  @click="skipTask(task)"
                >
                  {{ t('myTasks.actions.skip') }}
                </button>
                <button
                  type="button"
                  class="px-3 py-1 rounded-full text-xs text-white bg-hwhub-primary hover:bg-hwhub-primary"
                  @click="markDone(task)"
                >
                  {{ t('myTasks.actions.complete') }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
