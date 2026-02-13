<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const token = computed(() => {
  const v = route.query.token
  return typeof v === 'string' ? v : null
})
const notice = computed(() => {
  const v = route.query.notice
  return typeof v === 'string' ? v : null
})

const nextPath = computed(() => {
  const v = route.query.next
  return typeof v === 'string' ? v : '/settings/account'
})

const error = ref<string | null>(null)
type ResultQuery = {
  notice?: string
}

onMounted(async () => {
  error.value = null

  if (!token.value) {
    error.value = t('errors.common.badRequest')
    return
  }
  authStore.beginAuthTransition()
  try {
    // token を確定（localStorage反映も含む）
    await authStore.completeOAuthLogin(token.value)

    // URLから token を消し、安全なURLに移動（replace推奨）
    const q: ResultQuery = {}
    if (notice.value) q.notice = notice.value

    await router.replace({
      path: nextPath.value,
      query: q,
    })
  } catch (e) {
    console.error(e)
    error.value = t('errors.common.unauthorized')
    authStore.logout()
    await router.replace({ name: 'login' })
  } finally {
    authStore.endAuthTransition()
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-hwhub-surface px-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
      <h1 class="text-lg font-bold text-hwhub-heading">{{ t('oauthResult.processing') }}</h1>
      <p class="text-sm text-hwhub-muted mt-2">
        {{ t('oauthResult.status') }}
      </p>

      <p v-if="error" class="text-sm text-red-600 mt-4">
        {{ error }}
      </p>
    </div>
  </div>
</template>
