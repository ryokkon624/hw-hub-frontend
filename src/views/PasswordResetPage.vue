<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePasswordResetStore } from '@/stores/passwordResetStore'
import { toUiError } from '@/domain/error/errorMapper'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const passwordResetStore = usePasswordResetStore()
const { t } = useI18n()

const token = ref<string>('')

const newPassword = ref('')
const newPasswordConfirm = ref('')

const errorKey = ref<string | null>(null)

const passwordMismatch = computed(() => {
  if (!newPassword.value || !newPasswordConfirm.value) return false
  return newPassword.value !== newPasswordConfirm.value
})

const canSubmit = computed(() => {
  if (!token.value) return false
  if (!newPassword.value || !newPasswordConfirm.value) return false
  if (passwordMismatch.value) return false
  return true
})

/**
 * 結果画面へ集約する
 */
const goResult = (status: 'success' | 'expired' | 'invalid') =>
  router.replace({
    name: 'auth.result',
    query: { type: 'passwordReset', status },
  })

onMounted(() => {
  const q = route.query.token
  token.value = typeof q === 'string' ? q : ''

  // token無しはinvalid扱い
  if (!token.value) {
    goResult('invalid')
  }
})

const onSubmit = async () => {
  if (!canSubmit.value) return
  errorKey.value = null

  try {
    await passwordResetStore.confirm(token.value, newPassword.value)
    goResult('success')
  } catch (e) {
    const uiErr = toUiError(e)
    // expired を区別したいので messageKey で判定
    if (uiErr.messageKey === 'errors.passwordReset.expired') {
      goResult('expired')
      return
    }
    goResult('invalid')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-6">
      <h1 class="text-xl font-semibold text-slate-900">
        {{ t('passwordReset.page.title') }}
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        {{ t('passwordReset.page.description') }}
      </p>

      <div
        v-if="!token"
        class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ t('passwordReset.page.missingToken') }}
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700">
            {{ t('passwordReset.form.newPassword') }}
          </label>
          <input
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            :placeholder="t('passwordReset.form.newPasswordPlaceholder')"
            :disabled="!token"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">
            {{ t('passwordReset.form.confirmPassword') }}
          </label>
          <input
            v-model="newPasswordConfirm"
            type="password"
            autocomplete="new-password"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            :placeholder="t('passwordReset.form.confirmPasswordPlaceholder')"
            :disabled="!token"
          />

          <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">
            {{ t('passwordReset.errors.mismatch') }}
          </p>
        </div>

        <!-- ここは token expired などの前段エラーではなく、フォーム上の送信失敗系の残り（基本は resultへ飛ぶ） -->
        <p v-if="errorKey" class="text-sm text-red-600">{{ t(errorKey) }}</p>

        <button
          type="submit"
          class="w-full rounded-lg bg-emerald-600 text-white py-2 font-semibold disabled:opacity-50"
          :disabled="!canSubmit || passwordResetStore.isConfirming"
        >
          <span v-if="!passwordResetStore.isConfirming">{{ t('passwordReset.form.submit') }}</span>
          <span v-else>{{ t('passwordReset.form.submitting') }}</span>
        </button>

        <div class="text-center text-sm text-slate-600">
          <router-link class="text-emerald-700 hover:underline" :to="{ name: 'password.forgot' }">
            {{ t('passwordReset.links.requestNew') }}
          </router-link>
          <span class="mx-2">·</span>
          <router-link class="text-emerald-700 hover:underline" :to="{ name: 'login' }">
            {{ t('passwordReset.links.backToLogin') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
