<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { toUiError } from '@/domain/error/errorMapper'
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const email = computed(() => String(route.query.email ?? ''))

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(() => {
  if (!email.value) {
    router.replace({ name: 'signup' })
  }
})

const onResend = async () => {
  if (!email.value) return
  try {
    errorMessage.value = null
    isSubmitting.value = true
    await authStore.resendVerification(email.value)
    alert(t('emailVerify.waitPage.alertResent'))
    startCooldown(60)
  } catch (e) {
    errorMessage.value = t(toUiError(e).messageKey)
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

const cooldownSeconds = ref(0)
let timer: number | null = null

const startCooldown = (sec: number) => {
  cooldownSeconds.value = sec
  if (timer) window.clearInterval(timer)
  timer = window.setInterval(() => {
    cooldownSeconds.value -= 1
    if (cooldownSeconds.value <= 0 && timer) {
      window.clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const canResend = computed(() => !isSubmitting.value && cooldownSeconds.value <= 0 && !!email.value)
</script>

<template>
  <div class="mx-auto max-w-md p-6">
    <h1 class="text-xl font-semibold">{{ t('emailVerify.waitPage.title') }}</h1>

    <p class="mt-4 text-sm text-gray-600">
      <span v-if="email">{{ t('emailVerify.waitPage.sentTo', { email }) }}</span>
      {{ t('emailVerify.waitPage.instruction') }}
    </p>

    <button
      class="mt-6 w-full rounded bg-hwhub-primary px-4 py-2 text-white disabled:opacity-50"
      :disabled="!canResend"
      @click="onResend"
    >
      <span v-if="cooldownSeconds > 0">{{ t('emailVerify.waitPage.resendCooldown', { seconds: cooldownSeconds }) }}</span>
      <span v-else>{{ t('emailVerify.waitPage.resendButton') }}</span>
    </button>

    <p class="mt-4 text-xs text-gray-500">
      {{ t('emailVerify.waitPage.spamNote') }}
    </p>
  </div>
</template>
