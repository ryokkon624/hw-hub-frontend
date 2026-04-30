<template>
  <div
    class="rounded-full bg-hwhub-surface-subtle flex items-center justify-center font-semibold text-hwhub-heading overflow-hidden"
    :class="sizeClass"
  >
    <img
      v-if="iconUrl && !imageError"
      :src="iconUrl"
      :alt="alt ?? label"
      class="w-full h-full object-cover"
      @error="imageError = true"
    />
    <span v-else class="select-none">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  iconUrl: string | null
  label: string
  size?: 'sm' | 'md' | 'lg'
  alt?: string
}>()

const imageError = ref(false)

const initials = computed(() => {
  const text = props.label.trim()
  if (!text) return '?'
  return text.slice(0, 2).toUpperCase()
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-6 h-6 text-[10px]'
    case 'lg':
      return 'w-9 h-9 text-sm'
    case 'md':
    default:
      return 'w-8 h-8 text-sm'
  }
})
</script>
