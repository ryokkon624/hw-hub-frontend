<template>
  <!-- オーバーレイ -->
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      @click.self="close"
    >
      <!-- ダイアログ本体 -->
      <div
        class="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-lg p-4 sm:p-5 space-y-4"
      >
        <!-- ヘッダー -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-hwhub-heading">
              {{ t('household.createDialog.title') }}
            </h3>
            <p class="text-xs text-hwhub-muted mt-0.5">
              {{ t('household.createDialog.description') }}
            </p>
          </div>
          <button
            type="button"
            class="text-xs text-hwhub-muted hover:text-hwhub-heading"
            @click="close"
          >
            {{ t('household.createDialog.close') }}
          </button>
        </div>

        <!-- フォーム -->
        <form class="space-y-3" @submit.prevent="onSubmit">
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('household.createDialog.nameLabel') }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="name"
              type="text"
              class="w-full rounded-md border border-hwhub-border-subtle px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              maxlength="100"
              :placeholder="t('household.createDialog.namePlaceholder')"
            />
            <p v-if="error" class="mt-1 text-[11px] text-red-600">
              {{ error }}
            </p>
          </div>

          <p class="text-[11px] text-hwhub-muted">
            {{ t('household.createDialog.note') }}
          </p>

          <!-- ボタン -->
          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              class="px-3 py-1.5 rounded-md border border-hwhub-border-subtle text-xs text-hwhub-muted hover:bg-hwhub-surface-subtle"
              @click="close"
            >
              {{ t('household.createDialog.cancel') }}
            </button>
            <button
              type="submit"
              class="px-3 py-1.5 rounded-md bg-hwhub-primary text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              :disabled="!name.trim()"
            >
              {{ t('household.createDialog.submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', name: string): void
}>()

const name = ref('')
const error = ref<string | null>(null)

// 開くたびに初期化
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      name.value = ''
      error.value = null
    }
  },
)

const close = () => {
  emit('update:modelValue', false)
}

const onSubmit = () => {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = t('household.createDialog.nameRequired')
    return
  }
  emit('create', trimmed)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
