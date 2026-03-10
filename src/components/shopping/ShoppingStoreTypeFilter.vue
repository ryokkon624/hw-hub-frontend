<template>
  <div class="flex flex-wrap gap-1 text-[11px]">
    <!-- すべて -->
    <button
      type="button"
      class="px-2 py-0.5 rounded-full border transition"
      :class="
        modelValue === 'all'
          ? 'bg-hwhub-primary text-white border-hwhub-primary'
          : 'border-gray-300 text-hwhub-muted hover:bg-hwhub-surface-subtle'
      "
      @click="$emit('update:modelValue', 'all')"
    >
      {{ t('shopping.list.filters.all') }}
    </button>

    <!-- スーパー -->
    <button
      type="button"
      class="px-2 py-0.5 rounded-full border flex items-center gap-1 transition"
      :class="
        modelValue === '1'
          ? 'bg-emerald-500 text-white border-emerald-500'
          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
      "
      @click="$emit('update:modelValue', '1')"
    >
      <span class="h-2 w-2 rounded-full" :class="storeTypeDotClass('1')" />
      {{ storeTypeLabel('1') }}
    </button>

    <!-- ドラッグストア -->
    <button
      type="button"
      class="px-2 py-0.5 rounded-full border flex items-center gap-1 transition"
      :class="
        modelValue === '3'
          ? 'bg-rose-500 text-white border-rose-500'
          : 'border-rose-200 text-rose-700 hover:bg-rose-50'
      "
      @click="$emit('update:modelValue', '3')"
    >
      <span class="h-2 w-2 rounded-full" :class="storeTypeDotClass('3')" />
      {{ storeTypeLabel('3') }}
    </button>

    <!-- オンライン -->
    <button
      type="button"
      class="px-2 py-0.5 rounded-full border flex items-center gap-1 transition"
      :class="
        modelValue === '2'
          ? 'bg-sky-500 text-white border-sky-500'
          : 'border-sky-200 text-sky-700 hover:bg-sky-50'
      "
      @click="$emit('update:modelValue', '2')"
    >
      <span class="h-2 w-2 rounded-full" :class="storeTypeDotClass('2')" />
      {{ storeTypeLabel('2') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useShoppingCodes } from '@/composables/useShoppingCodes'
import { useI18n } from 'vue-i18n'

defineProps<{
  modelValue: 'all' | '1' | '2' | '3' | ''
}>()

defineEmits<{
  'update:modelValue': [value: 'all' | '1' | '2' | '3' | '']
}>()

const { t } = useI18n()
const { storeTypeLabel, storeTypeDotClass } = useShoppingCodes()
</script>
