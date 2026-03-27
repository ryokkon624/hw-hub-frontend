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
import { MessagesSquare } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const { t } = useI18n()
const store = useAdminInquiryStore()
const stats = computed(() => store.messageDailyStats)
const isLoading = computed(() => store.isLoadingMessageDailyStats)

onMounted(() => store.loadMessageDailyStats(10))

const MESSAGE_LAYERS = [
  { key: 'user' as const, label: 'USER', color: '#34d399' }, // emerald-400
  { key: 'ai' as const, label: 'AI', color: '#60a5fa' }, // blue-400
  { key: 'staff' as const, label: 'STAFF', color: '#a78bfa' }, // violet-400
]

const labels = computed(() =>
  stats.value.map((s) => {
    const d = new Date(s.date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }),
)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: MESSAGE_LAYERS.map((layer) => ({
    type: 'bar' as const,
    label: layer.label,
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
      stacked: false,
      ticks: { font: { size: 9 } },
      grid: { display: false },
    },
    y: {
      stacked: false,
      beginAtZero: true,
      ticks: { stepSize: 1, precision: 0, font: { size: 10 } },
      grid: { color: '#e5e7eb' },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, boxWidth: 8, font: { size: 9 } },
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

const hasData = computed(() => stats.value.some((s) => s.user + s.ai + s.staff > 0))
</script>

<template>
  <article class="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-3">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-hwhub-heading flex items-center gap-2">
          <MessagesSquare class="w-5 h-5 text-violet-400" />
          <span>{{ t('admin.dashboard.messageStats.title') }}</span>
        </h3>
        <p class="mt-1 text-xs text-hwhub-muted">
          {{ t('admin.dashboard.messageStats.subtitle') }}
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
        {{ t('admin.dashboard.messageStats.empty') }}
      </p>
    </div>
  </article>
</template>
