<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import type { ApiError } from '@/api/client'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const email = ref('')
const displayName = ref('')
const password = ref('')
const passwordConfirm = ref('')
const locale = ref<'ja' | 'en'>('ja')

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const authStore = useAuthStore()
const router = useRouter()
const uiStore = useUiStore()

const locales = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
]

const canSubmit = computed(() => {
  return (
    email.value.trim() &&
    displayName.value.trim() &&
    password.value.length >= 8 &&
    password.value === passwordConfirm.value
  )
})

const onSubmit = async () => {
  if (!canSubmit.value) return
  errorMessage.value = null
  isSubmitting.value = true

  try {
    await authStore.register({
      email: email.value,
      displayName: displayName.value,
      password: password.value,
      locale: locale.value,
    })

    const redirect = uiStore.redirectAfterLogin
    uiStore.setRedirectAfterLogin(null)

    if (redirect) {
      router.push(redirect)
    } else {
      router.push({ name: 'home' })
    }
  } catch (e) {
    const err = e as ApiError
    if (err.status === 409 && err.errorCode === 'EMAIL_ALREADY_USED') {
      errorMessage.value = t('signup.errors.emailUsed')
    } else {
      errorMessage.value = t('signup.errors.failed')
      console.error(e)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-hwhub-surface px-4">
    <div class="absolute top-4 right-4">
      <LanguageSwitcher />
    </div>

    <div
      class="w-full max-w-4xl bg-white rounded-3xl shadow-lg border border-gray-200 flex flex-col md:flex-row overflow-hidden"
    >
      <!-- 左：コピーエリア（サインアップ用の文言） -->
      <section class="md:w-1/2 px-8 py-8 md:py-12 bg-hwhub-surface-subtle flex flex-col gap-6">
        <div class="space-y-4">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/80 border px-3 py-1">
            <span class="text-xs font-semibold text-hwhub-muted">Family App</span>
            <span class="text-[11px] text-hwhub-muted">Housework Hub</span>
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl md:text-3xl font-bold text-hwhub-heading tracking-tight">
              {{ t('signup.subtitle.line1') }}<br />
              {{ t('signup.subtitle.line2') }}
            </h1>
            <div class="space-y-2 text-sm text-hwhub-muted">
              <p>{{ t('signup.description.aboutSharing') }}</p>
              <p>{{ t('signup.description.multiHousehold') }}</p>
              <p class="text-[11px]">{{ t('signup.description.noteChangeable') }}</p>
              <p>{{ t('signup.description.devNote') }}</p>
            </div>
          </div>
        </div>

        <div class="mt-auto text-[11px] text-hwhub-muted">
          {{ t('signup.bottom.haveAccount') }}
          <RouterLink to="/login" class="underline font-medium">
            {{ t('signup.bottom.goLogin') }}</RouterLink
          >
          {{ t('signup.bottom.suffix') }}
        </div>
      </section>

      <!-- 右：フォームエリア -->
      <section class="md:w-1/2 px-8 py-8 md:py-12">
        <header class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-hwhub-heading">{{ t('signup.title') }}</h2>
          <RouterLink
            to="/login"
            class="text-xs text-hwhub-muted hover:text-hwhub-heading underline"
          >
            {{ t('signup.header.haveAccountLink') }}
          </RouterLink>
        </header>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <!-- メール -->
          <div>
            <label class="block text-xs font-medium text-hwhub-heading mb-1">{{
              t('signup.fields.email')
            }}</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hwhub-primary focus:border-transparent"
              :placeholder="t('signup.placeholder.email')"
            />
          </div>

          <!-- 表示名 -->
          <div>
            <label class="block text-xs font-medium text-hwhub-heading mb-1">{{
              t('signup.fields.displayName')
            }}</label>
            <input
              v-model="displayName"
              type="text"
              required
              class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hwhub-primary focus:border-transparent"
              :placeholder="t('signup.placeholder.displayName')"
            />
          </div>

          <!-- パスワード -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-hwhub-heading mb-1">{{
                t('signup.fields.password')
              }}</label>
              <input
                v-model="password"
                type="password"
                required
                minlength="8"
                class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hwhub-primary focus:border-transparent"
              />
              <p class="mt-1 text-[11px] text-hwhub-muted">{{ t('signup.fields.passwordHint') }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-hwhub-heading mb-1">
                {{ t('signup.fields.passwordConfirm') }}
              </label>
              <input
                v-model="passwordConfirm"
                type="password"
                required
                minlength="8"
                class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hwhub-primary focus:border-transparent"
              />
            </div>
          </div>

          <!-- 利用言語 -->
          <div>
            <label class="block text-xs font-medium text-hwhub-heading mb-1">{{
              t('signup.fields.locale')
            }}</label>
            <select
              v-model="locale"
              class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hwhub-primary focus:border-transparent"
            >
              <option v-for="opt in locales" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- エラー -->
          <p v-if="errorMessage" class="text-xs text-red-600">
            {{ errorMessage }}
          </p>

          <!-- 送信ボタン -->
          <button
            type="submit"
            class="mt-2 inline-flex w-full items-center justify-center rounded-full bg-hwhub-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-hwhub-primary disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isSubmitting || !canSubmit"
          >
            {{ isSubmitting ? t('signup.submit.loading') : t('signup.submit.default') }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
