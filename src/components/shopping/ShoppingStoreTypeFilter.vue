<template>
  <div class="flex flex-wrap gap-1 text-[11px]">
    <!-- すべて -->
    <button
      type="button"
      class="px-2 py-0.5 rounded-full border transition"
      :class="
        modelValue === 'all'
          ? 'bg-hwhub-primary text-white border-hwhub-primary'
          : 'border-hwhub-border text-hwhub-muted hover:bg-hwhub-surface-subtle'
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
          ? 'bg-hwhub-primary text-white border-hwhub-primary'
          : 'border-hwhub-palette-emerald/30 text-hwhub-palette-emerald hover:bg-hwhub-palette-emerald-soft'
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
          ? 'bg-hwhub-palette-rose text-white border-hwhub-palette-rose'
          : 'border-hwhub-palette-rose/30 text-hwhub-palette-rose hover:bg-hwhub-palette-rose-soft'
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
          ? 'bg-hwhub-palette-blue text-white border-hwhub-palette-blue'
          : 'border-hwhub-palette-blue/30 text-hwhub-palette-blue hover:bg-hwhub-palette-blue-soft'
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
