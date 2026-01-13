<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useHouseholdStore } from '@/stores/householdStore'
import { householdInvitationApi } from '@/api/householdInvitationApi'
import type { HouseholdInvitationViewModel } from '@/domain'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const householdStore = useHouseholdStore()

const loading = ref(true)
const error = ref<string | null>(null)
const status = ref<HouseholdInvitationViewModel | null>(null)

const token = computed(() => route.params.token as string)

const isLoggedIn = computed(() => authStore.isAuthenticated)
const currentEmail = computed(() => authStore.currentUser?.email ?? null)

const showEmailWarning = computed(
  () =>
    isLoggedIn.value &&
    currentEmail.value &&
    status.value?.invitedEmail &&
    currentEmail.value !== status.value.invitedEmail,
)

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await householdInvitationApi.getInvitation(token.value)
    status.value = data
  } catch (e) {
    console.error(e)
    error.value = t('invite.page.error.invalid')
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push({ name: 'login' })
}

const goRegister = () => {
  router.push({ name: 'signup' })
}

const accept = async () => {
  if (!token.value) return
  try {
    await householdInvitationApi.accept(token.value)

    householdStore.fetchMyHouseholds()
    router.push({ name: 'home' })
  } catch (e) {
    console.error(e)
    error.value = t('invite.page.error.acceptFailed')
  }
}

const decline = async () => {
  if (!token.value) return
  try {
    await householdInvitationApi.decline(token.value)
    router.push({ name: 'login' })
  } catch (e) {
    console.error(e)
    error.value = t('invite.page.error.declineFailed')
  }
}

onMounted(() => {
  load()
  if (!authStore.isAuthenticated) {
    uiStore.setRedirectAfterLogin(route.fullPath)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-hwhub-surface px-4">
    <div class="absolute top-4 right-4">
      <LanguageSwitcher />
    </div>

    <div
      class="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row"
    >
      <!-- 左：説明 -->
      <section class="md:w-1/2 px-8 py-8 md:py-10 bg-hwhub-surface-subtle flex flex-col gap-4">
        <div>
          <p class="text-[11px] font-semibold tracking-[0.16em] text-hwhub-muted mb-2">
            {{ t('invite.page.hero.badge') }}
          </p>
          <h1 class="text-2xl md:text-3xl font-extrabold leading-snug text-hwhub-heading">
            {{ t('invite.page.hero.heading') }}
          </h1>
        </div>
        <p class="text-sm text-hwhub-muted">
          {{ t('invite.page.hero.description') }}
        </p>
        <p class="text-[11px] text-hwhub-muted mt-auto">
          {{ t('invite.page.hero.notice') }}
        </p>
      </section>

      <!-- 右：状態＆アクション -->
      <section class="md:w-1/2 px-8 py-8 md:py-10">
        <div v-if="loading" class="text-sm text-hwhub-muted">{{ t('invite.page.loading') }}</div>

        <div v-else-if="error" class="space-y-3">
          <p class="text-sm text-red-600">
            {{ error }}
          </p>
          <button
            type="button"
            class="mt-2 inline-flex items-center rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
            @click="load"
          >
            {{ t('invite.page.error.reloadButton') }}
          </button>
        </div>

        <div v-else-if="status" class="space-y-5">
          <div class="space-y-1">
            <p class="text-xs font-semibold text-hwhub-muted">
              {{ t('invite.page.info.householdTitle') }}
            </p>
            <p class="text-lg font-semibold text-hwhub-heading">
              {{ status.householdName }}
            </p>
            <p class="text-xs text-hwhub-muted">
              {{ t('invite.page.info.inviterLabel') }} {{ status.inviterDisplayName }}
            </p>
            <p class="text-xs text-hwhub-muted mt-1">
              {{ t('invite.page.info.invitedEmailLabel') }} {{ status.invitedEmail }}
            </p>
          </div>

          <p
            v-if="showEmailWarning"
            class="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2"
          >
            {{
              t('invite.page.warning.emailMismatch', {
                currentEmail,
                invitedEmail: status.invitedEmail,
              })
            }}
          </p>

          <!-- 未ログインの場合：まずログイン or 新規登録へ誘導 -->
          <div v-if="!isLoggedIn" class="space-y-3">
            <p class="text-xs text-hwhub-muted">
              {{ t('invite.page.loginNeeded.message') }}
            </p>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
                @click="goLogin"
              >
                {{ t('invite.page.loginNeeded.loginAndJoin') }}
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-full border border-hwhub-border px-4 py-2 text-sm font-semibold text-hwhub-heading bg-white hover:bg-hwhub-surface-subtle"
                @click="goRegister"
              >
                {{ t('invite.page.loginNeeded.signupAndJoin') }}
              </button>
            </div>
          </div>

          <!-- ログイン済みの場合：そのまま参加/辞退ボタン -->
          <div v-else class="space-y-3">
            <p class="text-xs text-hwhub-muted">
              {{
                t('invite.page.loggedIn.confirmMessage', {
                  householdName: status.householdName,
                })
              }}
            </p>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-60"
                @click="accept"
              >
                {{ t('invite.page.actions.accept') }}
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-full border border-hwhub-border px-4 py-2 text-sm font-semibold text-hwhub-heading bg-white hover:bg-hwhub-surface-subtle"
                @click="decline"
              >
                {{ t('invite.page.actions.decline') }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
