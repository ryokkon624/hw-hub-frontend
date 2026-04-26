<!-- src/components/LanguageSwitcher.vue -->
<template>
  <!-- SP版：languages アイコン1つ + ハーフモーダル -->
  <div class="md:hidden">
    <button
      type="button"
      class="flex items-center justify-center w-8 h-8 rounded-full border border-hwhub-border-subtle bg-white hover:bg-hwhub-surface-subtle transition"
      :aria-label="t('languageSwitcher.mobile.ariaLabel')"
      @click="mobileOpen = true"
    >
      <Languages class="w-4 h-4 text-hwhub-muted" />
    </button>
    <LanguageSwitcherMobile v-model="mobileOpen" />
  </div>

  <!-- PC版：従来のテキスト並び -->
  <div
    class="hidden md:inline-flex rounded-full border border-hwhub-border-subtle overflow-hidden bg-white"
  >
    <button
      v-for="lang in locales"
      :key="lang"
      type="button"
      class="px-3 py-1 text-xs sm:text-sm focus:outline-none transition"
      :class="[
        currentLocale === lang
          ? 'bg-hwhub-primary text-white'
          : 'bg-white text-hwhub-muted hover:bg-hwhub-surface-subtle',
      ]"
      @click="changeLocale(lang)"
    >
      {{ lang.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Languages } from 'lucide-vue-next'
import { SUPPORT_LOCALES, type Locale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import LanguageSwitcherMobile from '@/components/LanguageSwitcherMobile.vue'

const { locale, t } = useI18n()
const authStore = useAuthStore()

const locales = SUPPORT_LOCALES
const currentLocale = computed(() => locale.value as Locale)
const mobileOpen = ref(false)

const changeLocale = (lang: Locale) => {
  locale.value = lang
  localStorage.setItem('hwhub_locale', lang)
}

onMounted(() => {
  if (authStore.currentUser && authStore.currentUser.locale) {
    locale.value = authStore.currentUser?.locale
  }
})
</script>
