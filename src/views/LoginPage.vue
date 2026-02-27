<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { toUiError } from '@/domain/error/errorMapper'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppToastContainer from '@/components/AppToastContainer.vue'

const { t } = useI18n()
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()

onMounted(async () => {
  let shouldClearQuery = false

  // OAuth の token を拾ってログイン完了
  const token = route.query.token
  const tokenStr = typeof token === 'string' ? token : ''

  if (tokenStr) {
    try {
      await authStore.completeOAuthLogin(tokenStr)

      uiStore.showToast('success', t('login.notice.googleLoginSuccess'))
      shouldClearQuery = true

      // ログイン後の遷移：redirectAfterLogin があるなら優先
      const redirect = uiStore.redirectAfterLogin
      uiStore.setRedirectAfterLogin(null)

      if (redirect) {
        await router.replace(redirect)
      } else {
        await router.replace({ name: 'home' })
      }

      return
    } catch (e) {
      console.error(e)
      uiStore.showToast('error', t('login.notice.googleLoginFailed'))
      shouldClearQuery = true
    }
  }

  // notice / pwChanged toast
  const notice = route.query.notice
  if (notice === 'passwordResetSuccess') {
    uiStore.showToast('success', t('login.notice.passwordResetSuccess'))
    shouldClearQuery = true
  } else if (notice === 'emailVerified') {
    uiStore.showToast('success', t('login.notice.emailVerified'))
    shouldClearQuery = true
  } else if (notice === 'googleLoginSuccess') {
    uiStore.showToast('success', t('login.notice.googleLoginSuccess'))
    shouldClearQuery = true
  } else if (notice === 'googleLoginFailed') {
    uiStore.showToast('error', t('login.notice.googleLoginFailed'))
    shouldClearQuery = true
  }

  const pwChanged = route.query.pwChanged
  if (pwChanged === '1') {
    uiStore.showToast('success', t('login.toasts.passwordChanged'))
    shouldClearQuery = true
  }

  // クエリを消す（再表示防止）
  if (shouldClearQuery) {
    await router.replace({ name: 'login', query: {} })
  }
})

const onSubmit = async () => {
  errorMessage.value = null
  isSubmitting.value = true
  try {
    await authStore.login(email.value, password.value)

    // 招待経由なら、招待ページに戻して「参加する／しない」の画面を出す
    const redirect = uiStore.redirectAfterLogin
    uiStore.setRedirectAfterLogin(null)

    if (redirect) {
      router.push(redirect)
    } else {
      router.push({ name: 'home' })
    }
  } catch (e) {
    errorMessage.value = t(toUiError(e).messageKey)
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

const goToForgotPassword = () => {
  const trimmed = email.value.trim()
  router.push({
    name: 'password.forgot',
    query: trimmed ? { email: trimmed } : {},
  })
}

const onClickGoogle = async () => {
  try {
    await authStore.startGoogleLogin()
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('login.notice.googleLoginFailed'))
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-hwhub-surface px-4">
    <div class="absolute top-4 right-4">
      <LanguageSwitcher />
    </div>

    <!-- カード全体 -->
    <div
      class="w-full max-w-4xl rounded-3xl bg-white shadow-xl border border-gray-200 overflow-hidden grid md:grid-cols-[1.1fr_1fr]"
    >
      <!-- 左：ブランド＆説明（SPでは上） -->
      <section
        class="relative bg-hwhub-surface-subtle md:bg-linear-to-br md:from-hwhub-surface-subtle md:to-white px-6 py-6 md:px-8 md:py-8 flex flex-col justify-between"
      >
        <!-- アプリ名 -->
        <div class="space-y-4">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/80 border px-3 py-1">
            <span class="text-xs font-semibold text-hwhub-muted">Family App</span>
            <span class="text-[11px] text-hwhub-muted">Housework Hub</span>
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl md:text-3xl font-bold text-hwhub-heading tracking-tight">
              {{ t('login.hero.titleFirst') }}<br class="hidden sm:inline" />
              {{ t('login.hero.title2nd') }}
            </h1>
            <p class="text-sm text-hwhub-muted leading-relaxed">
              {{ t('login.hero.description.beforeHighlight') }}
              <span class="font-semibold">{{ t('login.hero.description.highlight') }}</span>
              {{ t('login.hero.description.afterHighlight') }}
            </p>
          </div>
        </div>

        <!-- 下部のちょっとした説明 -->
        <div class="mt-6 text-[11px] text-hwhub-muted space-y-1">
          <p>{{ t('login.hero.notes.sameAccount') }}</p>
          <p>{{ t('login.hero.notes.sharedData') }}</p>
        </div>
      </section>

      <!-- 右：ログインフォーム -->
      <section class="px-6 py-6 md:px-8 md:py-8 flex flex-col justify-center">
        <div class="space-y-5">
          <!-- タイトル -->
          <header class="space-y-1">
            <h2 class="text-lg font-semibold text-hwhub-heading">
              {{ t('login.title') }}
            </h2>
            <p class="text-xs text-hwhub-muted">
              {{ t('login.subtitle') }}
            </p>
          </header>

          <!-- Google ログイン -->
          <div class="space-y-3">
            <button
              type="button"
              class="group w-full inline-flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-hwhub-primary/40 disabled:opacity-60"
              :disabled="isSubmitting"
              @click="onClickGoogle"
            >
              <!-- Google Logo -->
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                class="h-5 w-5"
              />

              <span class="tracking-tight"> Google アカウントでログイン </span>
            </button>

            <!-- Divider -->
            <div class="flex items-center gap-2 text-[11px] text-hwhub-muted">
              <span class="flex-1 h-px bg-gray-200" />
              <span>{{ t('login.divider') }}</span>
              <span class="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          <!-- メール / パスワードフォーム -->
          <form class="space-y-4" @submit.prevent="onSubmit">
            <div class="space-y-1">
              <label for="email" class="block text-xs font-medium text-hwhub-heading">
                {{ t('login.email') }}
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hwhub-primary/70 focus:border-hwhub-primary bg-white"
                :placeholder="t('login.placeholderEmail')"
              />
            </div>

            <div class="space-y-1">
              <label for="password" class="block text-xs font-medium text-hwhub-heading">
                {{ t('login.password') }}
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hwhub-primary/70 focus:border-hwhub-primary bg-white"
                :placeholder="t('login.placeholderPassword')"
              />
            </div>

            <div class="space-y-1 text-right">
              <button
                type="button"
                class="text-[11px] text-hwhub-primary hover:underline disabled:opacity-60"
                :disabled="isSubmitting"
                @click="goToForgotPassword"
              >
                {{ t('login.forgotPassword') }}
              </button>
            </div>

            <p v-if="errorMessage" class="text-xs text-red-600">
              {{ errorMessage }}
            </p>

            <div class="pt-1 space-y-2">
              <button
                type="submit"
                class="w-full inline-flex items-center justify-center rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">{{ t('login.submit.default') }}</span>
                <span v-else class="flex items-center gap-2">
                  <span
                    class="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin"
                  />
                  {{ t('login.submit.loading') }}
                </span>
              </button>

              <p class="text-[11px] text-hwhub-muted text-center">
                {{ t('login.noAccount') }}
                <RouterLink to="/signup" class="text-hwhub-primary hover:underline">
                  {{ t('login.goSignup') }}</RouterLink
                >
                {{ t('login.goSignupSuffix') }}
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
  <AppToastContainer />
</template>
