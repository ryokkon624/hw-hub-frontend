<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { toUiError } from '@/domain/error/errorMapper'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

/**
 * /email-verify?token=...
 */
const token = computed(() => String(route.query.token ?? ''))

/**
 * 結果画面へ集約する
 */
const goResult = (status: 'success' | 'expired' | 'invalid') =>
  router.replace({
    name: 'auth.result',
    query: { type: 'emailVerify', status },
  })

onMounted(async () => {
  // tokenなしはinvalid扱い
  if (!token.value) {
    goResult('invalid')
    return
  }

  try {
    await authStore.verifyEmail(token.value)
    goResult('success')
  } catch (e) {
    const uiErr = toUiError(e)
    if (uiErr.messageKey === 'errors.emailVerify.expired') {
      goResult('expired')
      return
    }

    goResult('invalid')
  }
})
</script>

<template>
  <div class="mx-auto max-w-md p-6">
    <h1 class="text-xl font-semibold">{{ t('emailVerify.page.title') }}</h1>

    <div class="mt-6">
      <p class="text-sm text-gray-600">{{ t('emailVerify.page.loading') }}</p>
    </div>
  </div>
</template>
