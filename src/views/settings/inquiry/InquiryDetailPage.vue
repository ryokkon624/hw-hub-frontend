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
        <!-- クライアント情報 -->
        <div
          class="rounded-lg bg-hwhub-surface-subtle px-3 py-2 text-xs text-hwhub-muted space-y-0.5"
        >
          <p>{{ t('inquiry.detail.clientInfo.ui') }}: {{ uiClientLabel(detail.uiClient) }}</p>
          <p>{{ t('inquiry.detail.clientInfo.uiVersion') }}: {{ detail.uiVersion }}</p>
          <p>{{ t('inquiry.detail.clientInfo.apiVersion') }}: {{ detail.apiVersion }}</p>
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
          :class="message.senderType === SENDER_TYPE.YOU ? 'justify-end' : 'justify-start'"
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
        class="rounded-xl border bg-hwhub-surface-card p-4 shadow-sm space-y-2"
      >
        <textarea
          v-model="replyBody"
          rows="3"
          :placeholder="t('inquiry.detail.replyPlaceholder')"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
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
          class="flex-1 rounded-md border border-hwhub-palette-emerald bg-hwhub-palette-emerald-soft px-4 py-2 text-sm font-semibold text-hwhub-palette-emerald hover:opacity-80 disabled:opacity-50 transition-opacity"
          :disabled="inquiryStore.isSubmitting"
          @click="handleClose"
        >
          {{ t('inquiry.detail.resolvedButton') }}
        </button>
        <button
          v-if="detail.status === INQUIRY_STATUS.AI_ANSWERED"
          class="flex-1 rounded-md border border-hwhub-palette-amber bg-hwhub-palette-amber-soft px-4 py-2 text-sm font-semibold text-hwhub-palette-amber hover:opacity-80 disabled:opacity-50 transition-opacity"
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
import { INQUIRY_CATEGORY, INQUIRY_STATUS, SENDER_TYPE } from '@/constants/code.constants'

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
      return 'bg-hwhub-surface-subtle text-hwhub-body'
    case INQUIRY_CATEGORY.HOUSEWORK:
      return 'bg-hwhub-palette-amber-soft border border-hwhub-palette-amber text-hwhub-palette-amber'
    case INQUIRY_CATEGORY.SHOPPING:
      return 'bg-hwhub-palette-emerald-soft border border-hwhub-palette-emerald text-hwhub-palette-emerald'
    case INQUIRY_CATEGORY.ACCOUNT_SETTINGS:
      return 'bg-hwhub-palette-blue-soft border border-hwhub-palette-blue text-hwhub-palette-blue'
    case INQUIRY_CATEGORY.BUG_REPORT:
      return 'bg-hwhub-palette-rose-soft border border-hwhub-palette-rose text-hwhub-palette-rose'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}

const statusColorClass = (status: string): string => {
  switch (status) {
    case INQUIRY_STATUS.OPEN:
      return 'bg-hwhub-palette-blue-soft border border-hwhub-palette-blue text-hwhub-palette-blue'
    case INQUIRY_STATUS.AI_ANSWERED:
      return 'bg-hwhub-palette-violet-soft border border-hwhub-palette-violet text-hwhub-palette-violet'
    case INQUIRY_STATUS.PENDING_STAFF:
      return 'bg-hwhub-palette-amber-soft border border-hwhub-palette-amber text-hwhub-palette-amber'
    case INQUIRY_STATUS.STAFF_ANSWERED:
      return 'bg-hwhub-palette-emerald-soft border border-hwhub-palette-emerald text-hwhub-palette-emerald'
    case INQUIRY_STATUS.CLOSED:
      return 'bg-hwhub-surface-subtle border border-hwhub-border-subtle text-hwhub-muted'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}

const messageClass = (senderType: string): string => {
  switch (senderType) {
    case SENDER_TYPE.YOU:
      return 'bg-hwhub-primary text-white'
    case SENDER_TYPE.AI_SUPPORT:
      return 'bg-hwhub-palette-violet-soft border border-hwhub-palette-violet text-hwhub-heading'
    case SENDER_TYPE.STAFF:
      return 'bg-hwhub-palette-emerald-soft border border-hwhub-palette-emerald text-hwhub-heading'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-heading'
  }
}

const uiClientLabel = (uiClient: string): string => {
  switch (uiClient) {
    case 'web':
      return t('inquiry.detail.clientInfo.uiWeb')
    case 'mobile':
      return t('inquiry.detail.clientInfo.uiMobile')
    default:
      return uiClient
  }
}
</script>
