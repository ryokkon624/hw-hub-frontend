<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t, te } = useI18n()

/**
 * ?type=emailVerify|passwordReset
 * ?status=success|expired|invalid
 */
const type = computed(() => String(route.query.type ?? ''))
const status = computed(() => String(route.query.status ?? ''))

/**
 * i18nキーを組み立てる
 * 例: authResult.emailVerify.success.title
 */
const baseKey = computed(() => `authResult.${type.value}.${status.value}`)

const titleKey = computed(() => {
  const k = `${baseKey.value}.title`
  return te(k) ? k : 'authResult.common.title'
})

const messageKey = computed(() => {
  const k = `${baseKey.value}.message`
  return te(k) ? k : 'authResult.common.message'
})

type ActionKind = 'toLogin' | 'retryPasswordReset' | 'toSignup'

const primaryAction = computed<{ kind: ActionKind; labelKey: string; onClick: () => void } | null>(
  () => {
    // 成功時はログインへ寄せる
    if (status.value === 'success') {
      return {
        kind: 'toLogin',
        labelKey: 'authResult.actions.toLogin',
        onClick: () =>
          router.push({
            name: 'login',
            query:
              type.value === 'passwordReset'
                ? { notice: 'passwordResetSuccess' }
                : type.value === 'emailVerify'
                  ? { notice: 'emailVerified' }
                  : {},
          }),
      }
    }

    // password reset の失敗は “再申請”
    if (type.value === 'passwordReset') {
      return {
        kind: 'retryPasswordReset',
        labelKey: 'authResult.actions.retryPasswordReset',
        onClick: () => router.push({ name: 'password.forgot' }),
      }
    }

    // email verify の失敗は signup へ戻す（再送導線はsignup側に任せる）
    if (type.value === 'emailVerify') {
      return {
        kind: 'toSignup',
        labelKey: 'authResult.actions.toSignup',
        onClick: () => router.push({ name: 'signup' }),
      }
    }

    return {
      kind: 'toLogin',
      labelKey: 'authResult.actions.toLogin',
      onClick: () =>
        router.push({
          name: 'login',
          query:
            type.value === 'passwordReset'
              ? { notice: 'passwordResetSuccess' }
              : type.value === 'emailVerify'
                ? { notice: 'emailVerified' }
                : {},
        }),
    }
  },
)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-8 text-center">
      <h1 class="text-xl font-bold text-slate-800 mb-4">
        {{ t(titleKey) }}
      </h1>

      <p class="text-slate-600 mb-8">
        {{ t(messageKey) }}
      </p>

      <div v-if="primaryAction">
        <button
          class="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700"
          @click="primaryAction.onClick"
        >
          {{ t(primaryAction.labelKey) }}
        </button>
      </div>
    </div>
  </div>
</template>
