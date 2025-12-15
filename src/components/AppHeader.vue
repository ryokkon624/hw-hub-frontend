<template>
  <div class="flex items-center gap-4">
    <!-- 言語切替 -->
    <LanguageSwitcher />

    <!-- ユーザメニュー -->
    <div class="relative">
      <button
        type="button"
        class="flex items-center gap-2 rounded-full border border-hwhub-border-subtle px-2 py-1 bg-white hover:bg-hwhub-surface-subtle transition"
        @click="toggleMenu"
      >
        <!-- ユーザアイコン（イニシャル） -->
        <div
          class="w-8 h-8 rounded-full bg-hwhub-surface-subtle flex items-center justify-center text-sm font-semibold text-hwhub-heading overflow-hidden"
        >
          <img
            v-if="userIconUrl"
            :src="userIconUrl"
            :alt="t('appHeader.iconAlt')"
            class="w-full h-full object-cover"
          />
          <span v-else>
            {{ initials }}
          </span>
        </div>

        <!-- ニックネーム + アカウント名 -->
        <div class="hidden sm:flex flex-col items-start leading-tight">
          <span class="text-sm font-medium text-hwhub-heading">
            {{ displayNickname }}
          </span>
          <span class="text-xs text-hwhub-muted">
            {{ accountName }}
          </span>
        </div>
      </button>

      <!-- メニュー -->
      <div
        v-if="menuOpen"
        class="absolute right-0 mt-2 w-40 rounded-md border border-hwhub-border-subtle bg-white shadow-lg z-10 py-1"
      >
        <button
          type="button"
          class="w-full text-left px-3 py-2 text-sm text-hwhub-heading hover:bg-hwhub-surface-subtle"
          @click="goToSettings"
        >
          {{ t('pageTitles.settings') }}
        </button>
        <button
          type="button"
          class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          @click="logout"
        >
          {{ t('common.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useHouseholdStore } from '@/stores/householdStore'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const householdStore = useHouseholdStore()
const router = useRouter()

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const accountName = computed(() => {
  const user = authStore.currentUser
  if (!user) return ''
  return user.displayName ?? ''
})

// 世帯内ニックネーム（なければアカウント名）
const displayNickname = computed(() => {
  const member = householdStore.currentAllMembers.find(
    (e) => e.userId === authStore.currentUser?.userId,
  )
  const nickname = member?.nickname
  if (nickname && nickname.trim().length > 0) {
    return nickname
  }
  return accountName.value
})

const userIconUrl = computed(() => authStore.currentUser?.iconUrl ?? null)

// アイコン用のイニシャル（2文字まで）
const initials = computed(() => {
  const text = displayNickname.value || accountName.value || '?'
  const trimmed = text.trim()
  if (!trimmed) return '?'
  return trimmed.slice(0, 2).toUpperCase()
})

const goToSettings = () => {
  closeMenu()
  router.push({ name: 'settings.account' }).catch(() => {})
}

const logout = async () => {
  closeMenu()
  await authStore.logout()
  router.push({ name: 'login' })
}

// ルートが変わったらメニューを閉じる
const unwatch = router.afterEach(() => {
  closeMenu()
})

onBeforeUnmount(() => {
  unwatch()
})
</script>
