<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAdminInquiryStore } from '@/stores/adminInquiryStore'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import { LayoutDashboard } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { INQUIRY_STATUS } from '@/constants/code.constants'

const { t } = useI18n()
const { statusLabel } = useInquiryCodes()
const store = useAdminInquiryStore()
const summary = computed(() => store.statusSummary)
const isLoading = computed(() => store.isLoadingStatusSummary)

const totalUnclosed = computed(
  () =>
    (summary.value?.open ?? 0) +
    (summary.value?.aiAnswered ?? 0) +
    (summary.value?.pendingStaff ?? 0) +
    (summary.value?.staffAnswered ?? 0),
)

const totalStaleUnclosed = computed(
  () =>
    (summary.value?.staleUnclosedOpen ?? 0) +
    (summary.value?.staleUnclosedAiAnswered ?? 0) +
    (summary.value?.staleUnclosedPendingStaff ?? 0) +
    (summary.value?.staleUnclosedStaffAnswered ?? 0),
)

onMounted(() => store.loadStatusSummary())
</script>

<template>
  <article class="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-3">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-hwhub-heading flex items-center gap-2">
          <LayoutDashboard class="w-5 h-5 text-violet-400" />
          <span>{{ t('admin.dashboard.status.title') }}</span>
        </h3>
        <p class="mt-1 text-xs text-hwhub-muted">
          {{ t('admin.dashboard.status.subtitle') }}
        </p>
      </div>
    </header>

    <div v-if="isLoading" class="flex items-center justify-center py-4">
      <span class="text-xs text-hwhub-muted">{{ t('common.loading') }}</span>
    </div>

    <template v-else>
      <!-- 上段: 未クローズ件数 -->
      <p class="text-xs font-medium text-hwhub-muted mb-2">
        {{ t('admin.dashboard.status.unclosedSection') }}
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div class="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.OPEN) }}</span>
          <span class="mt-1 text-base font-semibold text-emerald-700">
            {{ summary?.open ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
        <div class="rounded-lg bg-blue-50 border border-blue-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.AI_ANSWERED) }}</span>
          <span class="mt-1 text-base font-semibold text-blue-700">
            {{ summary?.aiAnswered ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
        <div class="rounded-lg bg-amber-50 border border-amber-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.PENDING_STAFF) }}</span>
          <span class="mt-1 text-base font-semibold text-amber-700">
            {{ summary?.pendingStaff ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
        <div class="rounded-lg bg-violet-50 border border-violet-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.STAFF_ANSWERED) }}</span>
          <span class="mt-1 text-base font-semibold text-violet-700">
            {{ summary?.staffAnswered ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
      </div>
      <div
        class="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs flex items-center justify-between"
      >
        <span class="text-emerald-700">{{ t('admin.dashboard.status.totalUnclosed') }}</span>
        <span class="text-base font-semibold text-emerald-700">
          {{ totalUnclosed }}{{ t('admin.dashboard.status.unit') }}
        </span>
      </div>

      <hr class="border-hwhub-border my-2" />

      <!-- 下段: 3日以上前の未クローズ -->
      <p class="text-xs font-medium text-rose-500 mb-2">
        {{ t('admin.dashboard.status.staleSection') }}
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div class="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.OPEN) }}</span>
          <span class="mt-1 text-base font-semibold text-emerald-700">
            {{ summary?.staleUnclosedOpen ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
        <div class="rounded-lg bg-blue-50 border border-blue-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.AI_ANSWERED) }}</span>
          <span class="mt-1 text-base font-semibold text-blue-700">
            {{ summary?.staleUnclosedAiAnswered ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
        <div class="rounded-lg bg-amber-50 border border-amber-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.PENDING_STAFF) }}</span>
          <span class="mt-1 text-base font-semibold text-amber-700">
            {{ summary?.staleUnclosedPendingStaff ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
        <div class="rounded-lg bg-violet-50 border border-violet-200 px-2 py-2 flex flex-col">
          <span class="text-hwhub-muted">{{ statusLabel(INQUIRY_STATUS.STAFF_ANSWERED) }}</span>
          <span class="mt-1 text-base font-semibold text-violet-700">
            {{ summary?.staleUnclosedStaffAnswered ?? 0 }}{{ t('admin.dashboard.status.unit') }}
          </span>
        </div>
      </div>
      <div
        class="mt-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs flex items-center justify-between"
      >
        <span class="text-rose-600">{{ t('admin.dashboard.status.totalStaleUnclosed') }}</span>
        <span
          class="text-base text-rose-600"
          :class="totalStaleUnclosed > 0 ? 'font-bold' : 'font-semibold'"
        >
          {{ totalStaleUnclosed }}{{ t('admin.dashboard.status.unit') }}
        </span>
      </div>
    </template>
  </article>
</template>
