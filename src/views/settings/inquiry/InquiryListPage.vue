<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-hwhub-muted">{{ t('inquiry.list.description') }}</p>
      <button
        class="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="goCreate"
      >
        {{ t('inquiry.list.addButtonLabel') }}
      </button>
    </header>

    <!-- ローディング -->
    <div v-if="inquiryStore.isLoading" class="text-sm text-hwhub-muted text-center py-8">
      {{ t('common.loading') }}
    </div>

    <!-- 空状態 -->
    <div
      v-else-if="inquiryStore.summaries.length === 0"
      class="rounded-xl border bg-white p-8 text-center text-sm text-hwhub-muted shadow-sm"
    >
      {{ t('inquiry.list.empty') }}
    </div>

    <!-- 一覧 -->
    <ul v-else class="space-y-3">
      <li
        v-for="summary in inquiryStore.summaries"
        :key="summary.inquiryId"
      >
        <button
          class="w-full text-left rounded-xl border bg-white px-4 py-3 shadow-sm hover:bg-hwhub-surface-subtle transition flex items-center justify-between gap-3"
          @click="goDetail(summary.inquiryId)"
        >
          <!-- 左側：コンテンツ -->
          <div class="flex-1 min-w-0">
            <!-- 件名 -->
            <p class="text-sm font-medium text-hwhub-heading truncate">#{{ summary.inquiryId }}: {{ summary.title }}</p>
            <!-- カテゴリ（左） + ステータス（右端） -->
            <div class="flex items-center justify-between mt-1">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="categoryColorClass(summary.category)"
              >
                {{ categoryLabel(summary.category) }}
              </span>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="statusColorClass(summary.status)"
              >
                {{ statusLabel(summary.status) }}
              </span>
            </div>
            <!-- 作成日時 -->
            <p class="text-xs text-hwhub-muted mt-1">{{ formatDateTime(summary.createdAt) }}</p>
          </div>
          <!-- 右端：矢印 -->
          <span class="text-hwhub-muted text-lg shrink-0">›</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useInquiryStore } from '@/stores/inquiryStore'
import { useCodeStore } from '@/stores/codeStore'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import { INQUIRY_CATEGORY, INQUIRY_STATUS } from '@/constants/code.constants'

const { t } = useI18n()
const router = useRouter()
const inquiryStore = useInquiryStore()
const codeStore = useCodeStore()
const { categoryLabel, statusLabel } = useInquiryCodes()

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
  await inquiryStore.loadAll()
})

const goCreate = () => router.push({ name: 'settings.inquiry.new' })
const goDetail = (inquiryId: number) =>
  router.push({ name: 'settings.inquiry.detail', params: { inquiryId } })

const formatDateTime = (date: Date): string => {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${y}/${mo}/${d} ${h}:${mi}`
}

const categoryColorClass = (category: string): string => {
  switch (category) {
    case INQUIRY_CATEGORY.GENERAL:
      return 'bg-slate-100 text-slate-600'
    case INQUIRY_CATEGORY.HOUSEWORK:
      return 'bg-amber-100 text-amber-600'
    case INQUIRY_CATEGORY.SHOPPING:
      return 'bg-emerald-100 text-emerald-600'
    case INQUIRY_CATEGORY.ACCOUNT:
      return 'bg-blue-100 text-blue-600'
    case INQUIRY_CATEGORY.BUG:
      return 'bg-rose-100 text-rose-600'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}

const statusColorClass = (status: string): string => {
  switch (status) {
    case INQUIRY_STATUS.OPEN:
      return 'bg-blue-100 text-blue-600'
    case INQUIRY_STATUS.AI_ANSWERED:
      return 'bg-violet-100 text-violet-600'
    case INQUIRY_STATUS.PENDING_STAFF:
      return 'bg-amber-100 text-amber-600'
    case INQUIRY_STATUS.STAFF_ANSWERED:
      return 'bg-emerald-100 text-emerald-600'
    case INQUIRY_STATUS.CLOSED:
      return 'bg-slate-100 text-slate-500'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}
</script>
