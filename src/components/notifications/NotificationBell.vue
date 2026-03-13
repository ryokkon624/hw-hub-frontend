<template>
  <div class="relative" data-notif-root ref="rootEl">
    <button
      type="button"
      class="relative rounded-full p-2 hover:bg-hwhub-surface-subtle active:bg-hwhub-surface-subtle/70 active:scale-[0.96]"
      :class="store.shouldAnimateBell ? 'bell-shake' : 'transition duration-150'"
      :aria-label="t('notifications.bell.ariaLabel')"
      @click="toggle"
    >
      <Bell class="w-5 h-5" :class="unreadCount > 0 ? 'text-amber-500' : 'text-hwhub-muted'" />

      <!-- 未読バッジ -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
      >
        {{ displayUnreadCount }}
      </span>
    </button>

    <!-- ドロップダウン -->
    <div
      v-if="open"
      class="absolute right-0 mt-2 w-80 rounded-xl border border-hwhub-border-subtle bg-white shadow-lg z-20 overflow-hidden"
    >
      <div class="px-3 py-2 border-b bg-white flex items-center justify-between">
        <div class="text-sm font-medium text-hwhub-heading">
          {{ t('notifications.bell.title') }}
        </div>
        <button type="button" class="text-xs text-hwhub-muted hover:underline" @click="goToCenter">
          {{ t('notifications.bell.viewAll') }}
        </button>
      </div>

      <div class="max-h-96 overflow-auto">
        <div v-if="isLoading" class="p-4 text-sm text-hwhub-muted">
          {{ t('common.loading') }}
        </div>

        <NotificationListItem
          v-for="n in items"
          :key="n.notificationId"
          :notification="n"
          @click="onClickItem"
        />

        <div v-if="!isLoading && items.length === 0" class="p-4 text-sm text-hwhub-muted">
          {{ t('notifications.bell.empty') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { Bell } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import type { NotificationModel } from '@/domain'
import { navigateByNotification } from '@/utils/notificationLink'
import NotificationListItem from './NotificationListItem.vue'

const { t } = useI18n()
const router = useRouter()
const store = useNotificationStore()

const open = ref(false)

const items = computed(() => store.latestItems)
const unreadCount = computed(() => store.unreadCount)
const isLoading = computed(() => store.isLoading)

const rootEl = ref<HTMLElement | null>(null)
const clickedId = ref<number | null>(null)

const displayUnreadCount = computed(() => {
  if (store.unreadCount > 99) return '99+'
  return store.unreadCount
})

const onDocClick = (e: MouseEvent) => {
  const target = e.target as Node
  if (!rootEl.value) return
  if (rootEl.value.contains(target)) return
  open.value = false
}

document.addEventListener('click', onDocClick)
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const toggle = async () => {
  open.value = !open.value

  if (open.value) {
    // 一覧取得 + 既読化
    await store.loadLatest(20, true)

    // 未読件数を再取得
    await store.refreshUnreadCount(true)
  }
}

const close = () => {
  open.value = false
}

const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.closest('[data-notif-root]')) return
  close()
}

// クリック外で閉じる
document.addEventListener('click', onClickOutside)
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

const goToCenter = async () => {
  close()
  await store.refreshUnreadCount(true)
  router.push({ name: 'notifications' }).catch(() => {})
}

const onClickItem = async (n: NotificationModel) => {
  clickedId.value = n.notificationId

  // 未読ならその場で既読見た目に
  if (!n.isRead) {
    store.markAsReadLocally(n.notificationId)
  }

  // 少しだけ押した感を見せる
  setTimeout(async () => {
    close()
    await navigateByNotification(router, n)
    clickedId.value = null
  }, 120)
}
</script>
<style scoped>
@keyframes bellShake {
  0%   { transform: rotate(0deg); }
  5%   { transform: rotate(18deg); }
  15%  { transform: rotate(-15deg); }
  25%  { transform: rotate(14deg); }
  35%  { transform: rotate(-11deg); }
  45%  { transform: rotate(9deg); }
  55%  { transform: rotate(-6deg); }
  65%  { transform: rotate(4deg); }
  75%  { transform: rotate(-2deg); }
  85%  { transform: rotate(1deg); }
  100% { transform: rotate(0deg); }
}

.bell-shake {
  transform-origin: 50% 15%;
  animation: bellShake 1.4s ease-in-out;
}

button {
  -webkit-tap-highlight-color: transparent;
}
</style>
