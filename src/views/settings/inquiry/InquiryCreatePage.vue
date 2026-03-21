<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header>
      <h1 class="sr-only">{{ t('inquiry.create.title') }}</h1>
      <p class="text-sm text-hwhub-muted">{{ t('inquiry.create.description') }}</p>
    </header>

    <!-- フォームカード -->
    <form class="rounded-xl border bg-white p-4 shadow-sm space-y-4" @submit.prevent="onSubmit">
      <!-- カテゴリ -->
      <div class="space-y-1">
        <label class="block text-xs font-medium text-hwhub-heading">
          {{ t('inquiry.create.categoryLabel') }}
        </label>
        <Field name="category" v-slot="{ field }">
          <select
            v-bind="field"
            class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option value="">{{ t('common.selectPlaceholder') }}</option>
            <option
              v-for="option in categoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </Field>
        <ErrorMessage name="category" v-slot="{ message }">
          <p class="text-xs text-red-600 mt-1">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>

      <!-- 件名 -->
      <div class="space-y-1">
        <label class="block text-xs font-medium text-hwhub-heading">
          {{ t('inquiry.create.titleLabel') }}
        </label>
        <Field name="title" v-slot="{ field }">
          <input
            v-bind="field"
            type="text"
            maxlength="200"
            class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
        </Field>
        <ErrorMessage name="title" v-slot="{ message }">
          <p class="text-xs text-red-600 mt-1">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>

      <!-- お問い合わせ内容 -->
      <div class="space-y-1">
        <label class="block text-xs font-medium text-hwhub-heading">
          {{ t('inquiry.create.bodyLabel') }}
        </label>
        <Field name="body" v-slot="{ field }">
          <textarea
            v-bind="field"
            rows="6"
            class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
        </Field>
        <ErrorMessage name="body" v-slot="{ message }">
          <p class="text-xs text-red-600 mt-1">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>

      <!-- ボタン -->
      <div class="flex justify-end gap-2 pt-2 border-t">
        <button
          type="button"
          class="rounded-md border px-4 py-2 text-sm font-semibold text-hwhub-muted hover:bg-hwhub-surface-subtle"
          @click="goBack"
        >
          {{ t('inquiry.create.cancelButton') }}
        </button>
        <button
          type="submit"
          class="rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
          :disabled="inquiryStore.isSubmitting"
        >
          {{ t('inquiry.create.submitButton') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { inquiryFormTypedSchema } from '@/domain/inquiry/inquiryForm.validation'
import { useInquiryStore } from '@/stores/inquiryStore'
import { useHouseholdStore } from '@/stores/householdStore'
import { useUiStore } from '@/stores/uiStore'
import { useCodeStore } from '@/stores/codeStore'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import type { InquiryCategoryCode } from '@/constants/code.constants'

const { t } = useI18n()
const router = useRouter()
const inquiryStore = useInquiryStore()
const householdStore = useHouseholdStore()
const uiStore = useUiStore()
const codeStore = useCodeStore()
const { categoryOptions } = useInquiryCodes()

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
})

const { handleSubmit } = useForm({
  validationSchema: inquiryFormTypedSchema,
  initialValues: { category: '', title: '', body: '' },
})

const onSubmit = handleSubmit(async (values) => {
  const householdId = householdStore.currentHouseholdId
  if (!householdId) return

  try {
    await uiStore.withLoading(async () => {
      const inquiryId = await inquiryStore.create({
        householdId,
        category: values.category as InquiryCategoryCode,
        title: values.title,
        body: values.body,
      })
      uiStore.showToast('success', t('inquiry.create.toast.success'))
      router.push({ name: 'settings.inquiry.detail', params: { inquiryId } })
    })
  } catch {
    uiStore.showToast('error', t('inquiry.create.toast.error'))
  }
})

const goBack = () => {
  router.push({ name: 'settings.inquiry' })
}
</script>
