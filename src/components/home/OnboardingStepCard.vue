<script setup lang="ts">
import { type Component } from 'vue'
import { CheckSquare } from 'lucide-vue-next'

const props = defineProps<{
  icon: Component
  title: string
  description: string
  buttonLabel: string
  isDone: boolean
  isButtonDisabled?: boolean
  extraMessage?: string
}>()

const emit = defineEmits<{
  action: []
}>()

const onAction = () => {
  if (!props.isDone && !props.isButtonDisabled) {
    emit('action')
  }
}
</script>

<template>
  <section
    class="flex flex-col rounded-lg border p-4 transition-colors"
    :class="[
      isDone
        ? 'bg-white/40 border-hwhub-primary-200 opacity-70'
        : 'bg-white border-hwhub-primary-300 shadow-sm',
    ]"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-2 mb-2">
        <component :is="icon" class="w-5 h-5 text-hwhub-primary" />
        <h4 class="font-bold text-hwhub-heading text-sm">
          {{ title }}
        </h4>
      </div>
      <div v-if="isDone">
        <CheckSquare class="w-5 h-5 text-hwhub-primary" />
      </div>
    </div>

    <p class="text-xs text-hwhub-body leading-relaxed flex-1">
      {{ description }}
    </p>

    <p v-if="extraMessage" class="mt-2 text-xs text-hwhub-muted leading-relaxed">
      {{ extraMessage }}
    </p>

    <div v-if="!isDone" class="mt-4 flex justify-end">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-hwhub-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-hwhub-primary-600 shadow-sm"
        :disabled="isButtonDisabled"
        :class="{ 'opacity-50 cursor-not-allowed': isButtonDisabled }"
        @click="onAction"
      >
        {{ buttonLabel }}
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  </section>
</template>
