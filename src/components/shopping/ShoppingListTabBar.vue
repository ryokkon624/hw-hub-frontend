<template>
  <!-- SP時のみ表示（PC時は非表示） -->
  <nav class="md:hidden flex border-b border-hwhub-border bg-hwhub-surface-card">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="flex-1 flex items-center justify-center gap-1 py-2.5 text-sm font-medium transition-colors"
      :class="
        activeTab === tab.key
          ? 'text-hwhub-primary border-b-2 border-hwhub-primary'
          : 'text-hwhub-muted border-b-2 border-transparent'
      "
      @click="emit('update:activeTab', tab.key)"
    >
      {{ tab.label }}
      <span
        v-if="tab.badge != null && tab.badge > 0"
        class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold"
        :class="
          activeTab === tab.key
            ? 'bg-hwhub-primary text-white'
            : 'bg-hwhub-surface text-hwhub-muted'
        "
      >
        {{ tab.badge }}
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

type TabKey = 'notPurchased' | 'basket' | 'completed'

const props = defineProps<{
  activeTab: TabKey
  notPurchasedCount: number
  basketCount: number
}>()

const emit = defineEmits<{
  'update:activeTab': [value: TabKey]
}>()

const { t } = useI18n()

const tabs = computed(() => [
  {
    key: 'notPurchased' as TabKey,
    label: t('shopping.list.tabs.notPurchased'),
    badge: props.notPurchasedCount,
  },
  {
    key: 'basket' as TabKey,
    label: t('shopping.list.tabs.basket'),
    badge: props.basketCount,
  },
  {
    key: 'completed' as TabKey,
    label: t('shopping.list.tabs.completed'),
    badge: null,
  },
])
</script>
