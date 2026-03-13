<script setup lang="ts">
import { computed } from 'vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import { Bar } from 'vue-chartjs'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartDataset,
} from 'chart.js'
import type { HouseworkTaskModel, HouseholdMember } from '@/domain'
import { Users } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const householdStore = useHouseholdStore()
const taskStore = useHouseworkTaskStore()

const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)
const members = computed<HouseholdMember[]>(() => householdStore.currentMembers)

// Chart.js コンポーネント登録
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const UNASSIGNED_KEY = 'UNASSIGNED'
// 13日分（今日含む ±6日）のラベルと日付文字列を作る
type ChartDay = { ymd: string; label: string }

const chartDays = computed<ChartDay[]>(() => {
  const result: ChartDay[] = []
  const base = new Date()

  for (let offset = -6; offset <= 6; offset += 1) {
    const d = new Date(base)
    d.setDate(base.getDate() + offset)

    const m = d.getMonth() + 1
    const day = d.getDate()
    const ymd = d.toISOString().substring(0, 10)

    // ラベルは "M/D" くらいの軽い表示で
    const label = `${m}/${day}`
    result.push({ ymd, label })
  }
  return result
})

// グラフの対象タスク：対象13日間に入っているものだけ
const tasksForChart = computed<HouseworkTaskModel[]>(() => {
  if (!currentHouseholdId.value) return []

  const validDates = new Set(chartDays.value.map((d) => d.ymd))
  const hid = currentHouseholdId.value

  const key0 = `${hid}__0` // 未対応
  const key1 = `${hid}__1` // 完了

  const open = (taskStore.cacheByKey?.[key0] ?? []) as HouseworkTaskModel[]
  const done = (taskStore.cacheByKey?.[key1] ?? []) as HouseworkTaskModel[]

  return [...open, ...done].filter((t) => validDates.has(t.targetDate))
})

// メンバーID→メンバーのマップ（ラベル引きやすいように）
const memberMap = computed(() => {
  const map = new Map<number, HouseholdMember>()
  for (const m of members.value) {
    map.set(m.userId, m)
  }
  return map
})

// 積み上げ棒グラフ用データ
type StackedBarData = {
  labels: string[]
  datasets: ChartDataset<'bar', number[]>[]
}

const stackedChartData = computed<StackedBarData>(() => {
  const labels = chartDays.value.map((d) => d.label)

  // データなしのときも datasets は空配列で返す
  if (!currentHouseholdId.value || tasksForChart.value.length === 0) {
    return { labels, datasets: [] }
  }

  const memberIds = members.value.map((m) => String(m.userId))
  const keys = [...memberIds, UNASSIGNED_KEY]

  const counts: Record<string, number[]> = {}
  // 先に全キー分ゼロ埋めしておくので undefined にはならない
  for (const key of keys) {
    counts[key] = new Array(chartDays.value.length).fill(0)
  }

  const dayIndexMap = new Map<string, number>()
  chartDays.value.forEach((d, idx) => {
    dayIndexMap.set(d.ymd, idx)
  })

  for (const task of tasksForChart.value) {
    const idx = dayIndexMap.get(task.targetDate)
    // number じゃなければスキップ（undefined 対策）
    if (typeof idx !== 'number') continue

    const key = task.assigneeUserId == null ? UNASSIGNED_KEY : String(task.assigneeUserId)

    // 配列がなければここで初期化（undefined 対策）
    const arr = counts[key] ?? (counts[key] = new Array(chartDays.value.length).fill(0))
    arr[idx] += 1
  }

  const palette = ['#0f766e', '#2563eb', '#f97316', '#a855f7', '#e11d48', '#16a34a', '#f59e0b']
  const unassignedColor = '#facc15'

  const datasets: ChartDataset<'bar', number[]>[] = keys.map((key, index) => {
    const isUnassigned = key === UNASSIGNED_KEY
    const label = isUnassigned
      ? t('assign.summary.unassignedLabel')
      : (() => {
          const idNum = Number(key)
          const m = memberMap.value.get(idNum)
          return m ? m.nickname || m.displayName : `User ${idNum}`
        })()

    const backgroundColor = isUnassigned ? unassignedColor : palette[index % palette.length]

    return {
      type: 'bar',
      label,
      data: counts[key], // number[] で確定
      backgroundColor,
      borderWidth: 0,
      borderRadius: 4,
      barPercentage: 0.9,
      categoryPercentage: 0.8,
    } as ChartDataset<'bar', number[]>
  })

  return {
    labels,
    datasets,
  }
})

// グラフオプション（積み上げ設定など）
const stackedChartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      ticks: {
        font: { size: 10 },
      },
      grid: { display: false },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
        font: { size: 10 },
      },
      grid: { color: '#e5e7eb' },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 10 },
      },
    },
    tooltip: {
      callbacks: {
        label(context) {
          const label = context.dataset.label || ''
          const value = context.parsed.y ?? 0
          const valueText = t('home.common.taskCount', { count: value })

          return `${label}: ${valueText}`
        },
      },
    },
  },
}))
</script>

<template>
  <article class="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-3">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-hwhub-heading flex items-center gap-2">
          <Users class="w-5 h-5 text-purple-400" />
          <span>{{ t('home.household.title') }}</span>
        </h3>
        <p class="mt-1 text-xs text-hwhub-muted">
          {{ t('home.household.summary') }}
        </p>
      </div>
    </header>

    <div class="mt-2">
      <div v-if="stackedChartData.datasets.length > 0" class="h-56 sm:h-64">
        <Bar :data="stackedChartData" :options="stackedChartOptions" />
      </div>

      <p v-else class="text-xs text-hwhub-muted mt-4">
        {{ t('home.household.empty') }}
      </p>
    </div>
  </article>
</template>
