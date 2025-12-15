<!-- src/components/LanguageSwitcher.vue -->
<template>
  <div class="inline-flex rounded-full border border-hwhub-border-subtle overflow-hidden bg-white">
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
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORT_LOCALES, type Locale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'

const { locale } = useI18n()
const authStore = useAuthStore()

const locales = SUPPORT_LOCALES
const currentLocale = computed(() => locale.value as Locale)

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
