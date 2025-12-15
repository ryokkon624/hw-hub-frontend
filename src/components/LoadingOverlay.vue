<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
  >
    <div class="flex flex-col items-center gap-2">
      <div
        class="w-10 h-10 rounded-full border-4 border-hwhub-surface-subtle border-t-hwhub-primary animate-spin"
      />
      <p class="text-xs text-hwhub-muted">{{ t('common.loading') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const uiStore = useUiStore()
const isLoading = computed(() => uiStore.isLoading)
</script>
