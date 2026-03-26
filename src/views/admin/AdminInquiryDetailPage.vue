<template>
  <div class="space-y-4">
    <!-- ローディング -->
    <div
      v-if="adminInquiryStore.isLoadingDetail && !detail"
      class="text-sm text-hwhub-muted text-center py-8"
    >
      {{ t('common.loading') }}
    </div>

    <template v-else-if="detail">
      <!-- ヘッダー -->
      <header class="space-y-2">
        <button
          class="flex items-center gap-1 text-sm text-hwhub-muted hover:text-hwhub-heading"
          @click="router.push({ name: 'admin.inquiries' })"
        >
          ‹ {{ t('common.cancel') }}
        </button>
        <h1 class="font-semibold text-sm text-hwhub-heading">
          #{{ detail.inquiryId }}: {{ detail.title }}
        </h1>
        <!-- 投稿者情報 -->
        <div class="rounded-lg bg-hwhub-surface-subtle px-3 py-2 text-xs text-hwhub-muted space-y-0.5">
          <p>
            <span class="font-medium text-hwhub-heading">{{ posterInfo?.userDisplayName }}</span>
            （{{ posterInfo?.userEmail }}）
          </p>
          <p>User ID: {{ posterInfo?.userId }}</p>
        </div>
        <div class="flex items-center justify-between">
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
            :class="categoryColorClass(detail.category)"
          >
            {{ categoryLabel(detail.category) }}
          </span>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
            :class="statusColorClass(detail.status)"
          >
            {{ statusLabel(detail.status) }}
          </span>
        </div>
        <span class="text-xs text-hwhub-muted">{{ formatDateTime(detail.createdAt) }}</span>
      </header>

      <!-- メッセージスレッド -->
      <div class="space-y-3">
        <div
          v-for="message in detail.messages"
          :key="message.messageId"
          class="flex"
          :class="message.senderType === INQUIRY_SENDER_TYPE.USER ? 'justify-start' : 'justify-end'"
        >
          <div
            class="max-w-[80%] rounded-xl px-4 py-2 text-sm"
            :class="messageClass(message.senderType)"
          >
            <div class="text-xs font-medium mb-1 opacity-70">
              {{ senderTypeLabel(message.senderType) }}
              · {{ formatDateTime(message.createdAt) }}
            </div>
            <div class="whitespace-pre-wrap">{{ message.body }}</div>
          </div>
        </div>
      </div>

      <!-- ステータス説明文 -->
      <div
        v-if="statusDescription"
        class="border-t border-hwhub-border pt-3 mt-3"
      >
        <p class="text-xs text-hwhub-muted">{{ statusDescription }}</p>
      </div>

      <!-- 返信フォーム（CLOSED 以外は常に表示） -->
      <div
        v-if="detail.status !== INQUIRY_STATUS.CLOSED"
        class="rounded-xl border bg-white p-4 shadow-sm space-y-2"
      >
        <textarea
          v-model="replyBody"
          rows="3"
          :placeholder="t('admin.inquiries.detail.replyPlaceholder')"
          class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
        />
        <div class="flex justify-end">
          <button
            class="rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
            :disabled="adminInquiryStore.isSubmitting || !replyBody.trim()"
            @click="handleReply"
          >
            {{ t('admin.inquiries.detail.replyButton') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAdminInquiryStore } from '@/stores/adminInquiryStore'
import { useUiStore } from '@/stores/uiStore'
import { useCodeStore } from '@/stores/codeStore'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import { INQUIRY_STATUS, INQUIRY_SENDER_TYPE, INQUIRY_CATEGORY } from '@/constants/code.constants'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const adminInquiryStore = useAdminInquiryStore()
const uiStore = useUiStore()
const codeStore = useCodeStore()
const { categoryLabel, statusLabel, senderTypeLabel } = useInquiryCodes()

const inquiryId = Number(route.params.inquiryId)
const replyBody = ref('')

const detail = computed(() => adminInquiryStore.currentDetail)

// 対応待ちリストまたは検索結果から投稿者情報を取得
const posterInfo = computed(() => {
  const found =
    adminInquiryStore.pendingItems.find((i) => i.inquiryId === inquiryId) ??
    adminInquiryStore.searchResults.find((i) => i.inquiryId === inquiryId)
  return found ?? null
})

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
  await adminInquiryStore.loadDetail(inquiryId)
})

const handleReply = async () => {
  if (!replyBody.value.trim()) return
  try {
    await adminInquiryStore.reply(inquiryId, replyBody.value)
    replyBody.value = ''
    uiStore.showToast('success', t('admin.inquiries.detail.toast.sent'))
  } catch {
    uiStore.showToast('error', t('admin.inquiries.detail.toast.error'))
  }
}

const statusDescription = computed((): string | null => {
  const status = detail.value?.status
  if (!status) return null
  return t(`inquiry.detail.statusDescription.${status}`) ?? null
})

const formatDateTime = (date: Date): string => {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${y}/${mo}/${d} ${hh}:${mi}`
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

const messageClass = (senderType: string): string => {
  switch (senderType) {
    case INQUIRY_SENDER_TYPE.USER:
      return 'bg-hwhub-primary text-white'
    case INQUIRY_SENDER_TYPE.AI:
      return 'bg-violet-50 border border-violet-200 text-hwhub-heading'
    case INQUIRY_SENDER_TYPE.STAFF:
      return 'bg-emerald-50 border border-emerald-200 text-hwhub-heading'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-heading'
  }
}
</script>
