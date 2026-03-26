<template>
  <button
    type="button"
    class="group w-full text-left px-3 py-3 transition duration-150 border-b last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-hwhub-primary/30 active:scale-[0.995] active:bg-hwhub-surface-subtle/80"
    :class="[
      notification.isRead
        ? 'bg-white hover:bg-hwhub-surface-subtle'
        : 'bg-amber-50 hover:bg-amber-100/70 border-l-4 border-l-hwhub-primary',
      clicked ? 'notif-click-flash' : '',
    ]"
    @click="handleClick"
  >
    <div class="flex items-start gap-2">
      <!-- unread dot -->
      <span
        class="mt-1 text-sm"
        :class="notification.isRead ? 'opacity-10 text-hwhub-muted' : 'text-amber-500'"
      >
        ●
      </span>

      <div class="min-w-0 flex-1">
        <!-- title -->
        <div
          class="text-sm text-hwhub-heading group-hover:underline"
          :class="notification.isRead ? 'font-normal' : 'font-semibold'"
        >
          {{ renderTitle }}
        </div>

        <!-- body -->
        <div
          class="text-xs mt-1 line-clamp-2"
          :class="notification.isRead ? 'text-hwhub-muted/70' : 'text-hwhub-muted'"
        >
          {{ renderBody }}
        </div>

        <!-- meta -->
        <div
          class="text-xs mt-1"
          :class="notification.isRead ? 'text-hwhub-muted/70' : 'text-hwhub-muted'"
        >
          {{ formatTime(notification.occurredAt) }}
          <span v-if="notification.aggregatedCount > 1" class="ml-2">
            ({{ notification.aggregatedCount }})
          </span>
        </div>
      </div>

      <!-- action hint -->
      <div v-if="isLinkable" class="ml-2 flex items-center gap-2 text-hwhub-muted">
        <span class="text-[11px] opacity-0 translate-y-px transition group-hover:opacity-100">
          {{ t('notifications.bell.openHint') }}
        </span>

        <span
          class="mt-1 transition-transform opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100"
        >
          ›
        </span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NotificationModel } from '@/domain'
import { NOTIFICATION_LINK_TYPE } from '@/constants/code.constants'

const props = defineProps<{
  notification: NotificationModel
}>()

const emit = defineEmits<{
  (e: 'click', n: NotificationModel): void
}>()

const { t, te } = useI18n()

const clicked = ref(false)

const isLinkable = computed(() => props.notification.linkType !== NOTIFICATION_LINK_TYPE.NONE)

const renderText = (key: string, params: Record<string, unknown>) => {
  if (!te(key)) return key
  return t(key, params)
}

const renderTitle = computed(() => {
  const key = props.notification.titleKey ?? props.notification.bodyKey
  return renderText(key, props.notification.params)
})

const renderBody = computed(() => renderText(props.notification.bodyKey, props.notification.params))

const formatTime = (d: Date) => d.toLocaleString()

const handleClick = () => {
  clicked.value = true
  setTimeout(() => {
    emit('click', props.notification)
    clicked.value = false
  }, 120)
}
</script>
<style scoped>
@keyframes notifClickFlash {
  0% {
    background-color: rgba(0, 0, 0, 0.05);
  }
  100% {
    background-color: transparent;
  }
}

.notif-click-flash {
  animation: notifClickFlash 180ms ease-out;
}
</style>
