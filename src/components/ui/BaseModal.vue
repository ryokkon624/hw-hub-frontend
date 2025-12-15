<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center">
    <!-- 背景 -->
    <div class="absolute inset-0 bg-black/30 backdrop-blur-[1px]" @click="$emit('close')" />

    <!-- パネル -->
    <div
      class="relative z-50 w-full max-w-md max-h-[80vh] rounded-2xl bg-white shadow-lg flex flex-col"
    >
      <!-- ヘッダ -->
      <header class="flex items-center justify-between px-4 py-3 border-b">
        <h2 class="text-sm font-semibold text-hwhub-heading">{{ title }}</h2>
        <button
          type="button"
          class="text-hwhub-muted hover:text-hwhub-heading text-xl leading-none"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>

      <!-- 本文 -->
      <div class="p-4 overflow-y-auto">
        <slot />
      </div>

      <!-- フッタ（任意） -->
      <footer v-if="$slots.footer" class="px-4 py-3 border-t bg-hwhub-surface-subtle">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>
