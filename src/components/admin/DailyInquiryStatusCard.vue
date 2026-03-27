<script setup lang="ts">
import { computed, onMounted } from 'vue'
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
import { useAdminInquiryStore } from '@/stores/adminInquiryStore'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import { MessageCircleQuestion } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { INQUIRY_STATUS } from '@/constants/code.constants'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const { t } = useI18n()
const { statusLabel } = useInquiryCodes()
const store = useAdminInquiryStore()
const stats = computed(() => store.dailyStats)
const isLoading = computed(() => store.isLoadingDailyStats)

onMounted(() => store.loadDailyStats(30))

// datasets の定義順 = 積み上げ順（先頭が下）
const STATUS_LAYERS = [
  { key: 'closed' as const, code: INQUIRY_STATUS.CLOSED, color: '#94a3b8' }, // slate-400
  { key: 'staffAnswered' as const, code: INQUIRY_STATUS.STAFF_ANSWERED, color: '#a78bfa' }, // violet-400
  { key: 'pendingStaff' as const, code: INQUIRY_STATUS.PENDING_STAFF, color: '#fbbf24' }, // amber-400
  { key: 'aiAnswered' as const, code: INQUIRY_STATUS.AI_ANSWERED, color: '#60a5fa' }, // blue-400
  { key: 'open' as const, code: INQUIRY_STATUS.OPEN, color: '#34d399' }, // emerald-400
]

// 横軸ラベル: M/D 形式
const labels = computed(() =>
  stats.value.map((s) => {
    const d = new Date(s.date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }),
)

// datasets: STATUS_LAYERS の順番通りに生成（先頭が棒の下）
const chartData = computed(() => ({
  labels: labels.value,
  datasets: STATUS_LAYERS.map((layer) => ({
    type: 'bar' as const,
    label: statusLabel(layer.code),
    data: stats.value.map((s) => s[layer.key]),
    backgroundColor: layer.color,
    borderWidth: 0,
    borderRadius: 2,
    barPercentage: 0.9,
    categoryPercentage: 0.8,
  })) as ChartDataset<'bar', number[]>[],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      ticks: { font: { size: 9 } },
      grid: { display: false },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { stepSize: 1, precision: 0, font: { size: 10 } },
      grid: { color: '#e5e7eb' },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 9 },
      },
    },
    tooltip: {
      callbacks: {
        label(context) {
          return `${context.dataset.label}: ${context.parsed.y}件`
        },
      },
    },
  },
}))

const hasData = computed(() =>
  stats.value.some((s) => s.open + s.aiAnswered + s.pendingStaff + s.staffAnswered + s.closed > 0),
)
</script>

<template>
  <article class="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-3">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-hwhub-heading flex items-center gap-2">
          <MessageCircleQuestion class="w-5 h-5 text-violet-400" />
          <span>{{ t('admin.dashboard.inquiryStats.title') }}</span>
        </h3>
        <p class="mt-1 text-xs text-hwhub-muted">
          {{ t('admin.dashboard.inquiryStats.subtitle') }}
        </p>
      </div>
    </header>

    <div class="mt-2">
      <div v-if="isLoading" class="h-56 flex items-center justify-center">
        <span class="text-xs text-hwhub-muted">{{ t('common.loading') }}</span>
      </div>
      <div v-else-if="hasData" class="h-56 sm:h-64">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
      <p v-else class="text-xs text-hwhub-muted mt-4">
        {{ t('admin.dashboard.inquiryStats.empty') }}
      </p>
    </div>
  </article>
</template>
