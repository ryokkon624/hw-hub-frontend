<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="sr-only">
          {{ t('housework.create.title') }}
        </h1>
        <p class="text-sm text-hwhub-muted">
          {{ t('housework.create.description') }}
        </p>
      </div>
    </header>

    <!-- フォームカード -->
    <HouseworkForm v-model="form" @submit="handleSubmit" @cancel="goBack" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCodeStore } from '@/stores/codeStore'
import { useHouseworkStore } from '@/stores/houseworkStore'
import HouseworkForm from '@/components/housework/HouseworkForm.vue'
import {
  createDefaultHouseworkForm,
  type HouseworkFormModel,
  type HouseworkSaveInput,
} from '@/domain'
import { fromHouseworkFormModel } from '@/domain'
import { useUiStore } from '@/stores/uiStore'

const { t } = useI18n()
const router = useRouter()
const codeStore = useCodeStore()
const uiStore = useUiStore()
const houseworkStore = useHouseworkStore()

const form = ref<HouseworkFormModel>(createDefaultHouseworkForm())

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
})

const handleSubmit = async (value: HouseworkFormModel) => {
  const payload: HouseworkSaveInput = fromHouseworkFormModel(value)
  try {
    await uiStore.withLoading(async () => {
      await houseworkStore.create(payload)
    })
    uiStore.showToast('success', t('housework.create.toast.saveSuccess'))
    router.push({ name: 'settings.housework' })
  } catch {
    uiStore.showToast('error', t('housework.create.toast.saveFailed'))
  }
}

const goBack = () => {
  router.push({ name: 'settings.housework' })
}
</script>
