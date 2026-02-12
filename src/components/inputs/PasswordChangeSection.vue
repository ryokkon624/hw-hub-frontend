<script setup lang="ts">
import { computed } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { passwordChangeTypedSchema, type PasswordChangeSchemaType } from '@/domain/user/passwordChange.validation'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const { t } = useI18n()

// vee-validate フォーム(パスワード変更用)
const {
  handleSubmit,
  meta: passwordMeta,
  resetForm
} = useForm<PasswordChangeSchemaType>({
  validationSchema: passwordChangeTypedSchema,
  initialValues: {
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  },
})

const isGoogleLinked = computed(() => {
  const user = authStore.currentUser as { authProvider?: string | null } | null
  return user?.authProvider === 'GOOGLE'
})

const onChangePassword = handleSubmit(async (v) => {
  try {
    await uiStore.withLoading(async () => {
      await authStore.changeMyPassword({ currentPassword: v.currentPassword, newPassword: v.newPassword })
    })
    authStore.logout()
    await router.push({ name: 'login', query: { pwChanged: '1' } })
    resetForm()
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('settings.account.password.toasts.failed'))
  }
})

const tMaybe = (msg: string | undefined | null) => {
  if (!msg) return ''
  if (msg.startsWith('settings.')) return t(msg)
  return msg
}
</script>

<template>
    <!-- パスワード変更 -->
    <section v-if="!isGoogleLinked" class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-sm font-semibold text-hwhub-heading">
        {{ t('settings.account.password.title') }}
      </h3>
      <p class="text-xs text-hwhub-muted">
        <span>
          {{ t('settings.account.password.description') }}
        </span>
      </p>

      <form class="space-y-3" @submit.prevent="onChangePassword">
        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('settings.account.password.fields.currentPassword') }}
          </label>
          <Field name="currentPassword" v-slot="{ field }">
            <input
              v-bind="field"
              type="password"
              autocomplete="current-password"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              :disabled="authStore.isChangingPassword"
            />
          </Field>
          <ErrorMessage name="currentPassword" v-slot="{ message }">
            <p class="text-xs text-red-600 mt-1">{{ tMaybe(message) }}</p>
          </ErrorMessage>
        </div>

        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('settings.account.password.fields.newPassword') }}
          </label>
          <Field name="newPassword" v-slot="{ field }">
            <input
              v-bind="field"
              type="password"
              autocomplete="new-password"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              :disabled="authStore.isChangingPassword"
            />
          </Field>
          <ErrorMessage name="newPassword" v-slot="{ message }">
            <p class="text-xs text-red-600 mt-1">{{ tMaybe(message) }}</p>
          </ErrorMessage>
        </div>

        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('settings.account.password.fields.newPasswordConfirm') }}
          </label>
          <Field name="newPasswordConfirm" v-slot="{ field }">
            <input
              v-bind="field"
              type="password"
              autocomplete="new-password"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              :disabled="authStore.isChangingPassword"
            />
          </Field>
          <ErrorMessage name="newPasswordConfirm" v-slot="{ message }">
            <p class="text-xs text-red-600 mt-1">{{ tMaybe(message) }}</p>
          </ErrorMessage>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
            :disabled="authStore.isChangingPassword || !passwordMeta.valid"
          >
            <span v-if="!authStore.isChangingPassword">
              {{ t('settings.account.password.actions.submit') }}
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
              {{ t('settings.account.password.actions.submitting') }}
            </span>
          </button>
        </div>

        <p class="text-[11px] text-hwhub-muted">
          {{ t('settings.account.password.noteLogout') }}
        </p>
      </form>
    </section>
    <!-- パスワード変更の案内（Google連携済みの場合） -->
    <section v-else class="rounded-xl border bg-white p-4 shadow-sm space-y-2">
      <h3 class="text-sm font-semibold text-hwhub-heading">
        {{ t('settings.account.password.title') }}
      </h3>
      <p class="text-xs text-hwhub-muted whitespace-pre-line">
        {{ t('settings.account.password.descriptionGoogleLinked') }}
      </p>
    </section>
</template>
