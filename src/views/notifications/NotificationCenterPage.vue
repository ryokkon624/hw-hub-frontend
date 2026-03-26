<template>
  <div class="space-y-4">
    <h1 class="sr-only">
      {{ t('notifications.center.title') }}
    </h1>

    <div class="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div class="p-4 border-b flex items-center justify-between">
        <div class="text-sm text-hwhub-muted">
          {{ t('notifications.center.subtitle') }}
        </div>
        <button type="button" class="text-sm text-hwhub-muted hover:underline" @click="reload">
          {{ t('notifications.center.reload') }}
        </button>
      </div>

      <div v-if="isLoading" class="p-4 text-sm text-hwhub-muted">
        {{ t('common.loading') }}
      </div>

      <div v-else>
        <div
          v-if="items.length === 0"
          class="p-8 flex flex-col items-center gap-2 text-hwhub-muted"
        >
          <Bell class="w-8 h-8 opacity-30" />
          <p class="text-sm">{{ t('notifications.center.empty') }}</p>
        </div>

        <NotificationListItem
          v-for="n in items"
          :key="n.notificationId"
          :notification="n"
          @click="onClickItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Bell } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import type { NotificationModel } from '@/domain'
import { navigateByNotification } from '@/utils/notificationLink'
import NotificationListItem from '@/components/notifications/NotificationListItem.vue'

const { t } = useI18n()
const router = useRouter()
const store = useNotificationStore()

const items = computed(() => store.items)
const isLoading = computed(() => store.isLoading)

onMounted(async () => {
  // センターは開いたら既読
  await store.loadLatest(50, true)
})

const reload = async () => {
  await store.loadLatest(50, true)
}

const onClickItem = async (n: NotificationModel) => {
  await navigateByNotification(router, n)
}
</script>
