<template>
  <div class="space-y-6 max-w-xl">
    <div>
      <h2 class="sr-only">{{ t('settings.sections.account.title') }}</h2>
      <p class="text-sm text-hwhub-muted">
        {{ t('settings.account.description') }}
      </p>
    </div>

    <!-- アカウント情報（読み取り） -->
    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <h3 class="text-sm font-semibold mb-3 text-hwhub-heading">
        {{ t('settings.account.info.title') }}
      </h3>
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-hwhub-muted w-24">{{ t('settings.account.info.emailLabel') }}</dt>
          <dd class="flex-1 text-right truncate text-hwhub-heading">
            {{ userEmail || t('common.notSet') }}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-hwhub-muted w-24">{{ t('settings.account.info.displayNameLabel') }}</dt>
          <dd class="flex-1 text-right truncate text-hwhub-heading">
            {{ originalDisplayName || t('common.notSet') }}
          </dd>
        </div>
      </dl>
      <p class="mt-2 text-xs text-hwhub-muted">{{ t('settings.account.info.note') }}</p>
    </section>

    <!-- 表示名の変更 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-sm font-semibold text-hwhub-heading">
        {{ t('settings.account.displayName.title') }}
      </h3>
      <p class="text-xs text-hwhub-muted">
        {{ t('settings.account.displayName.description') }}
      </p>

      <div>
        <label class="block text-xs text-hwhub-muted mb-1">{{
          t('settings.account.displayName.fieldLabel')
        }}</label>
        <Field name="displayName" v-slot="{ field }">
          <input
            v-bind="field"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            maxlength="50"
          />
        </Field>
        <ErrorMessage name="displayName" v-slot="{ message }">
          <p class="text-xs text-red-600 mt-1">{{ message }}</p>
        </ErrorMessage>
      </div>
    </section>

    <!-- プロフィール画像 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-sm font-semibold text-hwhub-heading">
        {{ t('settings.account.icon.title') }}
      </h3>
      <p class="text-xs text-hwhub-muted">
        {{ t('settings.account.icon.description') }}
      </p>

      <div class="flex items-center gap-4">
        <!-- 現在のアイコン -->
        <div
          class="w-16 h-16 rounded-full bg-hwhub-surface-subtle flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="userIconUrl"
            :src="userIconUrl"
            :alt="t('settings.account.icon.title')"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-sm text-hwhub-muted">NO IMG</span>
        </div>

        <!-- 画像選択 -->
        <div class="flex-1">
          <ImageFileInput
            :label="t('settings.account.icon.selectLabel')"
            :description="t('settings.account.icon.note')"
            :maxSizeBytes="5 * 1024 * 1024"
            :loading="authStore.isUploadingIcon"
            :showPreview="false"
            @change="onIconFileChange"
            @error="(msg) => uiStore.showToast('error', msg)"
          />
        </div>
      </div>
    </section>

    <!-- 言語設定 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-sm font-semibold text-hwhub-heading">
        {{ t('settings.account.language.title') }}
      </h3>
      <p class="text-xs text-hwhub-muted">
        {{ t('settings.account.language.description') }}
      </p>

      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('settings.account.language.fieldLabel') }}</label
        >
        <Field name="locale" v-slot="{ field }">
          <select
            v-bind="field"
            class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option v-for="lang in locales" :key="lang" :value="lang">
              {{ labelForLocale(lang) }}
            </option>
          </select>
        </Field>
        <ErrorMessage name="locale" v-slot="{ message }">
          <p class="text-xs text-red-600 mt-1">{{ message }}</p>
        </ErrorMessage>
      </div>
    </section>

    <!-- 保存ボタン -->
    <div class="flex justify-end">
      <button
        type="button"
        class="inline-flex items-center rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
        :disabled="!hasChanges"
        @click="onSave"
      >
        {{ t('common.save') }}
      </button>
    </div>

    <!-- アカウント削除 -->
    <section class="rounded-xl border border-red-200 bg-white p-4 shadow-sm space-y-3 mt-8">
      <h3 class="text-sm font-semibold text-red-600">
        {{ t('settings.account.delete.title') }}
      </h3>
      <p class="text-xs text-red-600 whitespace-pre-wrap">
        {{ t('settings.account.delete.description') }}
      </p>

      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          @click="onDeleteAccount"
        >
          {{ t('settings.account.delete.button') }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { SUPPORT_LOCALES, type Locale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import ImageFileInput from '@/components/inputs/ImageFileInput.vue'
import {
  accountSettingsTypedSchema,
  type AccountSettingsSchemaType,
} from '@/domain/user/accountSettings.validation'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { t, locale } = useI18n()

// ロケール一覧
const locales = SUPPORT_LOCALES

// 元の値（変更有無の判定用）
const originalDisplayName = ref<string | null>(null)
const originalLocale = ref<Locale>('ja')

const labelForLocale = (lang: Locale) => {
  return t(`common.locales.${lang}`)
}

// vee-validate フォーム
const { handleSubmit, values, resetForm } = useForm<AccountSettingsSchemaType>({
  validationSchema: accountSettingsTypedSchema,
  // 初期値はいったんダミーにしておき、onMounted で resetForm で上書きする
  initialValues: {
    displayName: '',
    locale: 'ja',
    iconFile: null,
  },
})

// 読み取り用：メールなど
const userEmail = computed(() => {
  const user = authStore.currentUser as { email?: string } | undefined
  return user?.email ?? ''
})

const userIconUrl = computed(() => {
  const user = authStore.currentUser as { iconUrl?: string | null } | null
  return user?.iconUrl ?? null
})

// 変更があるかどうか（vee-validate の values から判定）
const hasChanges = computed(() => {
  return (
    values.displayName !== (originalDisplayName.value ?? '') ||
    values.locale !== originalLocale.value
  )
})

onMounted(() => {
  const user = authStore.currentUser as {
    displayName?: string
    locale?: Locale
    email?: string
  } | null

  const initialDisplayName = user?.displayName ?? ''
  const initialLocale = (user?.locale as Locale | undefined) ?? (locale.value as Locale)

  // フォームの初期値を反映
  resetForm({
    values: {
      displayName: initialDisplayName,
      locale: initialLocale,
      iconFile: null,
    },
  })

  originalDisplayName.value = initialDisplayName
  originalLocale.value = initialLocale
})

// プロフィール画像：選択したら即アップロード
const onIconFileChange = async (files: File[] | null) => {
  if (!files || files.length === 0) return
  const file = files[0]
  if (!file) return

  try {
    await uiStore.withLoading(async () => {
      await authStore.uploadUserIcon(file)
    })
    uiStore.showToast('success', t('settings.account.toasts.iconUpdated'))
  } catch (err) {
    console.error(err)
    uiStore.showToast('error', t('settings.account.toasts.iconUpdateFailed'))
  }
}

// 保存ボタン（表示名 + ロケール）
const onSave = handleSubmit(async (formValues) => {
  if (!hasChanges.value) return

  const payload = {
    displayName: formValues.displayName.trim(),
    locale: formValues.locale,
  }

  try {
    await uiStore.withLoading(async () => {
      await authStore.updateAccountProfile(payload)

      locale.value = payload.locale
      localStorage.setItem('hwhub_locale', payload.locale)

      originalDisplayName.value = payload.displayName
      originalLocale.value = payload.locale
    })

    uiStore.showToast('success', t('settings.account.toasts.saveSuccess'))
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('settings.account.toasts.saveFailed'))
  }
})


const onDeleteAccount = async () => {
  if (!confirm(t('settings.account.delete.confirm'))) return

  try {
    await uiStore.withLoading(async () => {
      // バリデーション実行
      await authStore.validateAccountDeletion()

      await authStore.deleteAccount()
    })
    alert(t('settings.account.toasts.deleteSuccess'))
    window.location.href = '/login'
  } catch (e: unknown) {
    console.error(e)
    if (e instanceof Error && e.message === 'VALIDATION_ERROR_OWNER_WITH_MEMBERS') {
      alert(t('settings.account.delete.validationError'))
      return
    }

    const err = e as { response?: { data?: { message?: string } } }
    const msg = err.response?.data?.message || ''
    uiStore.showToast('error', t('settings.account.toasts.deleteFailed') + (msg ? `\n${msg}` : ''))
  }
}
</script>
