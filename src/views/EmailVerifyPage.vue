<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { toApiErrorMessageKey } from '@/utils/apiErrorMessage'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const token = computed(() => String(route.query.token ?? ''))

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  if (!token.value) {
    status.value = 'error'
    return
  }
  errorMessage.value = null
  try {
    await authStore.verifyEmail(token.value)
    status.value = 'success'
  } catch (e) {
    errorMessage.value = t(toApiErrorMessageKey(e))
    status.value = 'error'
  }
})

const goToLogin = () => router.push({ name: 'login' })
const goToSignup = () => router.push({ name: 'signup' })
</script>

<template>
  <div class="mx-auto max-w-md p-6">
    <h1 class="text-xl font-semibold">{{ t('emailVerify.page.title') }}</h1>

    <div class="mt-6">
      <p v-if="status === 'loading'" class="text-sm text-gray-600">{{ t('emailVerify.page.loading') }}</p>

      <div v-else-if="status === 'success'">
        <p class="text-sm text-gray-600">{{ t('emailVerify.page.success') }}</p>
        <button class="mt-4 w-full rounded bg-hwhub-primary px-4 py-2 text-white" @click="goToLogin">
          {{ t('emailVerify.page.toLogin') }}
        </button>
      </div>

      <div v-else>
        <p class="text-sm text-gray-600">
          {{ t('emailVerify.page.invalid') }}
        </p>
        <button class="mt-4 w-full rounded border px-4 py-2" @click="goToSignup">
          {{ t('emailVerify.page.toSignup') }}
        </button>
      </div>
    </div>
  </div>
</template>
