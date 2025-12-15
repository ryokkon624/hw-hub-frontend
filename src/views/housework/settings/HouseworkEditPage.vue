<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="sr-only">
          {{ t('housework.edit.title') }}
        </h1>
        <p class="text-sm text-hwhub-muted">
          {{ t('housework.edit.description') }}
        </p>
      </div>
    </header>

    <!-- フォームカード -->
    <HouseworkForm v-model="form" @submit="handleSubmit" @cancel="goBack" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCodeStore } from '@/stores/codeStore'
import { useUiStore } from '@/stores/uiStore'
import { useHouseworkStore } from '@/stores/houseworkStore'
import HouseworkForm from '@/components/housework/HouseworkForm.vue'
import {
  createDefaultHouseworkForm,
  type HouseworkFormModel,
  type HouseworkSaveInput,
} from '@/domain'
import { toHouseworkFormModel, fromHouseworkFormModel } from '@/domain'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const codeStore = useCodeStore()
const uiStore = useUiStore()
const houseworkStore = useHouseworkStore()

const form = ref<HouseworkFormModel>(createDefaultHouseworkForm())
const loaded = ref(false)

const houseworkId = Number(route.params.houseworkId)

onMounted(async () => {
  await codeStore.loadAllIfNeeded()

  if (isNaN(houseworkId)) {
    console.error('Invalid houseworkId:', route.params.houseworkId)
    router.push({ name: 'houseworks' })
    return
  }

  try {
    await houseworkStore.loadOne(houseworkId)
  } catch {
    router.push({ name: 'settings.housework' })
  }

  if (houseworkStore.current) {
    form.value = toHouseworkFormModel(houseworkStore.current)
  }
  loaded.value = true
})

const handleSubmit = async (value: HouseworkFormModel) => {
  if (!houseworkStore.current) return
  const payload: HouseworkSaveInput = fromHouseworkFormModel(value)

  try {
    await uiStore.withLoading(async () => {
      await houseworkStore.update(houseworkId, payload)
    })
    uiStore.showToast('success', t('housework.edit.toast.saveSuccess'))
    router.push({ name: 'settings.housework' })
  } catch {
    uiStore.showToast('error', t('housework.edit.toast.saveFailed'))
  }
}

const goBack = () => {
  router.push({ name: 'settings.housework' })
}
</script>
