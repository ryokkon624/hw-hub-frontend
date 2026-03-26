<template>
  <div class="space-y-4">
    <!-- ローディング -->
    <div v-if="inquiryStore.isLoading && !detail" class="text-sm text-hwhub-muted text-center py-8">
      {{ t('common.loading') }}
    </div>

    <template v-else-if="detail">
      <!-- ヘッダー -->
      <header class="space-y-2">
        <button
          class="flex items-center gap-1 text-sm text-hwhub-muted hover:text-hwhub-heading"
          @click="goBack"
        >
          ‹ {{ t('common.cancel') }}
        </button>
        <h1 class="font-semibold text-sm text-hwhub-heading">
          #{{ detail.inquiryId }}: {{ detail.title }}
        </h1>
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
          :class="message.senderType === INQUIRY_SENDER_TYPE.USER ? 'justify-end' : 'justify-start'"
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

      <!-- ステータス説明文（スレッド下・返信フォーム直上） -->
      <div v-if="statusDescription" class="border-t border-hwhub-border pt-3 mt-3">
        <p class="text-xs text-hwhub-muted">{{ statusDescription }}</p>
      </div>

      <!-- 返信フォーム（CLOSED のみ非表示） -->
      <div
        v-if="detail.status !== INQUIRY_STATUS.CLOSED"
        class="rounded-xl border bg-white p-4 shadow-sm space-y-2"
      >
        <textarea
          v-model="replyBody"
          rows="3"
          :placeholder="t('inquiry.detail.replyPlaceholder')"
          class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
        />
        <div class="flex justify-end">
          <button
            class="rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
            :disabled="inquiryStore.isSubmitting || !replyBody.trim()"
            @click="handleReply"
          >
            {{ t('inquiry.detail.sendReplyButton') }}
          </button>
        </div>
      </div>

      <!-- アクションボタン（AI_ANSWERED: 「解決した」+「解決しなかった」/ STAFF_ANSWERED: 「解決した」のみ） -->
      <div
        v-if="
          detail.status === INQUIRY_STATUS.AI_ANSWERED ||
          detail.status === INQUIRY_STATUS.STAFF_ANSWERED
        "
        class="flex flex-col sm:flex-row gap-2"
      >
        <button
          class="flex-1 rounded-md border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
          :disabled="inquiryStore.isSubmitting"
          @click="handleClose"
        >
          {{ t('inquiry.detail.resolvedButton') }}
        </button>
        <button
          v-if="detail.status === INQUIRY_STATUS.AI_ANSWERED"
          class="flex-1 rounded-md border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 disabled:opacity-50"
          :disabled="inquiryStore.isSubmitting"
          @click="handleEscalate"
        >
          {{ t('inquiry.detail.escalateButton') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useInquiryStore } from '@/stores/inquiryStore'
import { useUiStore } from '@/stores/uiStore'
import { useCodeStore } from '@/stores/codeStore'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import { INQUIRY_CATEGORY, INQUIRY_STATUS, INQUIRY_SENDER_TYPE } from '@/constants/code.constants'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const inquiryStore = useInquiryStore()
const uiStore = useUiStore()
const codeStore = useCodeStore()
const { categoryLabel, statusLabel, senderTypeLabel } = useInquiryCodes()

const inquiryId = Number(route.params.inquiryId)
const replyBody = ref('')

const detail = computed(() => inquiryStore.currentDetail)

onMounted(async () => {
  if (isNaN(inquiryId)) {
    router.push({ name: 'settings.inquiry' })
    return
  }
  await codeStore.loadAllIfNeeded()
  try {
    await inquiryStore.loadDetail(inquiryId)
  } catch {
    router.push({ name: 'settings.inquiry' })
  }
})

const goBack = () => router.push({ name: 'settings.inquiry' })

const handleReply = async () => {
  if (!replyBody.value.trim()) return
  try {
    await uiStore.withLoading(async () => {
      await inquiryStore.addMessage(inquiryId, replyBody.value)
    })
    replyBody.value = ''
    uiStore.showToast('success', t('inquiry.detail.toast.replySent'))
  } catch {
    uiStore.showToast('error', t('inquiry.detail.toast.error'))
  }
}

const handleClose = async () => {
  if (!window.confirm(t('inquiry.detail.closeConfirm'))) return
  try {
    await inquiryStore.closeInquiry(inquiryId)
    uiStore.showToast('success', t('inquiry.detail.toast.closed'))
  } catch {
    uiStore.showToast('error', t('inquiry.detail.toast.error'))
  }
}

const handleEscalate = async () => {
  if (!window.confirm(t('inquiry.detail.escalateConfirm'))) return
  try {
    await inquiryStore.escalateToStaff(inquiryId)
    uiStore.showToast('success', t('inquiry.detail.toast.escalated'))
  } catch {
    uiStore.showToast('error', t('inquiry.detail.toast.error'))
  }
}

const statusDescription = computed((): string | null => {
  const status = inquiryStore.currentDetail?.status
  if (!status) return null
  return t(`inquiry.detail.statusDescription.${status}`) ?? null
})

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
