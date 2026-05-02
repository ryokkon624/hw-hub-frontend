<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePasswordResetStore } from '@/stores/passwordResetStore'
import { toUiError } from '@/domain/error/errorMapper'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const passwordResetStore = usePasswordResetStore()
const { t } = useI18n()

const email = computed(() => passwordResetStore.lastEmail)

const errorKey = ref<string | null>(null)
const infoMessage = ref<string | null>(null)

const onResend = async () => {
  errorKey.value = null
  infoMessage.value = null

  if (!email.value) {
    await router.push({ name: 'password.forgot' })
    return
  }

  try {
    await passwordResetStore.request(email.value)
    infoMessage.value = 'Email sent. Please check your inbox.'
  } catch (e) {
    errorKey.value = toUiError(e).messageKey
  }
}
</script>

<template>
  <div class="min-h-screen bg-hwhub-surface flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-hwhub-surface-card rounded-2xl shadow p-6">
      <h1 class="text-xl font-semibold text-hwhub-heading">{{ t('passwordResetSent.title') }}</h1>

      <p class="mt-2 text-sm text-hwhub-body">
        {{ t('passwordResetSent.description') }}
        <span v-if="email" class="font-medium text-hwhub-heading">({{ email }})</span>
      </p>

      <div class="mt-4 rounded-lg bg-hwhub-surface-subtle p-4 text-sm text-hwhub-body space-y-2">
        <p>{{ t('passwordResetSent.checkSpam') }}</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>{{ t('passwordResetSent.spamActions.spamFolder') }}</li>
          <li>{{ t('passwordResetSent.spamActions.settings') }}</li>
          <li>{{ t('passwordResetSent.spamActions.wait') }}</li>
        </ul>
      </div>

      <p v-if="errorKey" class="text-sm text-red-600">{{ t(errorKey) }}</p>

      <div class="mt-6 space-y-3">
        <button
          class="w-full rounded-lg bg-emerald-600 text-white py-2 font-semibold disabled:opacity-50"
          :disabled="passwordResetStore.isRequesting"
          @click="onResend"
        >
          <span v-if="!passwordResetStore.isRequesting">{{ t('passwordResetSent.resend') }}</span>
          <span v-else>{{ t('passwordResetSent.sending') }}</span>
        </button>

        <router-link
          class="block w-full text-center rounded-lg border border-hwhub-border py-2 font-semibold text-hwhub-body hover:bg-hwhub-surface-subtle"
          :to="{ name: 'password.forgot' }"
        >
          {{ t('passwordResetSent.useDifferentEmail') }}
        </router-link>

        <router-link
          class="block text-center text-sm text-emerald-700 hover:underline"
          :to="{ name: 'login' }"
        >
          {{ t('passwordResetSent.backToLogin') }}
        </router-link>
      </div>
    </div>
  </div>
</template>
