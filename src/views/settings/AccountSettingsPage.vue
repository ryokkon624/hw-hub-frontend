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

    <!-- パスワード変更 -->
    <PasswordChangeSection />

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
          <p class="text-xs text-red-600 mt-1">{{ tMaybe(message) }}</p>
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
          <p class="text-xs text-red-600 mt-1">{{ tMaybe(message) }}</p>
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

    <!-- Google 連携 -->
    <section v-if="shouldShowGoogleLinkSection" class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-hwhub-heading">
            {{ t('settings.account.google.title') }}
          </h3>

          <!-- 未連携 -->
          <p v-if="!isGoogleLinked" class="text-xs text-hwhub-muted mt-1">
            {{ t('settings.account.google.description.notLinked') }}
          </p>

          <!-- 連携済み -->
          <p v-else class="text-xs text-hwhub-muted mt-1 whitespace-pre-line">
            {{ t('settings.account.google.description.linked') }}
          </p>
        </div>

        <span
          class="shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
          :class="isGoogleLinked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'"
        >
          {{ isGoogleLinked ? t('settings.account.google.status.linked') : t('settings.account.google.status.notLinked') }}
        </span>
      </div>

      <div v-if="!isGoogleLinked" class="flex flex-col gap-3 pt-2">
        <button
          type="button"
          class="
            group
            w-full
            sm:w-auto
            inline-flex
            items-center
            justify-center
            gap-3
            rounded-xl
            border
            border-gray-300
            bg-white
            px-5
            py-2.5
            text-sm
            font-medium
            text-gray-700
            shadow-sm
            transition
            hover:bg-gray-50
            hover:shadow
            focus:outline-none
            focus:ring-2
            focus:ring-hwhub-primary/40
            disabled:opacity-60
          "
          :disabled="authStore.isStartingGoogleLink"
          @click="onStartGoogleLink"
        >
          <!-- Google Logo -->
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            class="h-5 w-5"
          />

          <span v-if="!authStore.isStartingGoogleLink" class="tracking-tight">
            {{ t('settings.account.google.actions.link') }}
          </span>
          <span v-else class="flex items-center gap-2">
            <span class="h-4 w-4 rounded-full border-2 border-gray-400/60 border-t-transparent animate-spin" />
            {{ t('settings.account.google.actions.linking') }}
          </span>
        </button>

        <p class="text-[11px] text-hwhub-muted">
          {{ t('settings.account.google.note') }}
        </p>
      </div>

      <div v-else class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 whitespace-pre-line">
        {{ t('settings.account.google.warning.passwordDisabled') }}
      </div>
    </section>

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
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { SUPPORT_LOCALES, type Locale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import ImageFileInput from '@/components/inputs/ImageFileInput.vue'
import {
  accountSettingsTypedSchema,
  type AccountSettingsSchemaType,
} from '@/domain/user/accountSettings.validation'
import PasswordChangeSection from '@/components/inputs/PasswordChangeSection.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// ロケール一覧
const locales = SUPPORT_LOCALES

// 元の値（変更有無の判定用）
const originalDisplayName = ref<string | null>(null)
const originalLocale = ref<Locale>('ja')

const labelForLocale = (lang: Locale) => {
  return t(`common.locales.${lang}`)
}

// vee-validate フォーム(アカウント設定用)
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

const isGoogleLinked = computed(() => {
  const user = authStore.currentUser as { authProvider?: string | null } | null
  return user?.authProvider === 'GOOGLE'
})

// Google連携UIを出す条件：gmail のときだけ（例: xxx@gmail.com）
const shouldShowGoogleLinkSection = computed(() => {
  const email = userEmail.value?.toLowerCase() ?? ''
  return email.endsWith('@gmail.com')
})

onMounted(async () => {
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

  const notice = route.query.notice
  const token = route.query.token

  if (notice === 'googleLinked' && typeof token === 'string' && token.length > 0) {
    try {
      await authStore.completeOAuthLogin(token)
      uiStore.showToast('success', t('settings.account.google.linkedSuccess'))
    } catch (e) {
      console.error(e)
      uiStore.showToast('error', t('settings.account.google.linkedFailed'))
    } finally {
      // クエリを削除（再表示防止）
      await router.replace({ query: {} })
    }
  } else if (notice === 'googleLinkFailed') {
    uiStore.showToast('error', t('settings.account.google.linkedFailed'))
    await router.replace({ query: {} })
  }
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

const onStartGoogleLink = async () => {
  try {
    await authStore.startGoogleLink()
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('settings.account.google.toasts.failed'))
  }
}

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

const tMaybe = (msg: string | undefined | null) => {
  if (!msg) return ''
  if (msg.startsWith('settings.')) return t(msg)
  return msg
}
</script>
