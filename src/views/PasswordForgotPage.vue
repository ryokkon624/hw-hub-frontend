<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePasswordResetStore } from '@/stores/passwordResetStore'
import { toUiError } from '@/domain/error/errorMapper'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const passwordResetStore = usePasswordResetStore()
const { t } = useI18n()

const email = ref('')
const errorKey = ref<string | null>(null)

const canSubmit = computed(() => email.value.trim().length > 0)

const onSubmit = async () => {
  if (!canSubmit.value) return
  errorKey.value = null

  try {
    await passwordResetStore.request(email.value.trim())
    await router.push({ name: 'password.reset-sent' })
  } catch (e) {
    errorKey.value = toUiError(e).messageKey
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-6">
      <h1 class="text-xl font-semibold text-slate-900">{{ t('passwordForgot.title') }}</h1>
      <p class="mt-2 text-sm text-slate-600">
        {{ t('passwordForgot.description') }}
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700">{{
            t('passwordForgot.email')
          }}</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            :placeholder="t('passwordForgot.placeholder')"
          />
        </div>

        <p v-if="errorKey" class="text-sm text-red-600">{{ t(errorKey) }}</p>

        <button
          type="submit"
          class="w-full rounded-lg bg-emerald-600 text-white py-2 font-semibold disabled:opacity-50"
          :disabled="!canSubmit || passwordResetStore.isRequesting"
        >
          <span v-if="!passwordResetStore.isRequesting">{{ t('passwordForgot.submit') }}</span>
          <span v-else>{{ t('passwordForgot.submitting') }}</span>
        </button>

        <div class="text-center text-sm text-slate-600">
          <router-link class="text-emerald-700 hover:underline" :to="{ name: 'login' }">
            {{ t('passwordForgot.backToLogin') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
