<template>
  <transition-group name="toast" tag="div" class="fixed top-4 right-4 z-40 flex flex-col gap-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="min-w-[220px] max-w-xs rounded-lg border px-3 py-2 shadow-md bg-white flex items-start gap-2"
      :class="toastClass(toast.type)"
    >
      <div class="pt-0.5">
        <CheckSquare v-if="toast.type === 'success'" class="w-5 h-5" />
        <TriangleAlert v-else-if="toast.type === 'error'" class="w-5 h-5" />
        <Info v-else class="w-5 h-5" />
      </div>
      <div class="flex-1 text-sm">
        {{ toast.message }}
      </div>
      <button
        type="button"
        class="text-xs text-hwhub-muted hover:text-hwhub-heading"
        @click="remove(toast.id)"
      >
        ✕
      </button>
    </div>
  </transition-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckSquare, TriangleAlert, Info } from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()

const toasts = computed(() => uiStore.toasts)

const remove = (id: number) => {
  uiStore.removeToast(id)
}

const toastClass = (type: 'success' | 'error' | 'info') => {
  switch (type) {
    case 'success':
      return 'border-hwhub-primary bg-hwhub-primary-50 text-hwhub-primary'
    case 'error':
      return 'border-hwhub-danger bg-hwhub-danger-soft text-hwhub-danger'
    default:
      return 'border-gray-200 bg-hwhub-info-soft text-hwhub-info'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
