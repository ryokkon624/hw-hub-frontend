<!-- src/components/LanguageSwitcher.vue -->
<template>
  <!-- SP版：Globeアイコン + 言語コード (forcePillがfalseの場合のみ) -->
  <div v-if="!forcePill" class="md:hidden">
    <button
      type="button"
      class="flex items-center gap-1.5 px-2 py-1 rounded-full border border-hwhub-border-subtle bg-gradient-to-b from-white to-hwhub-surface-subtle shadow-sm hover:shadow-md transition-all active:scale-95 group"
      :class="buttonClass"
      :aria-label="t('languageSwitcher.mobile.ariaLabel')"
      @click="mobileOpen = true"
    >
      <Globe
        class="w-3.5 h-3.5 group-hover:rotate-12 transition-transform"
        :class="iconClass || 'text-hwhub-primary'"
      />
      <span
        class="text-[11px] font-bold tracking-tight leading-none"
        :class="textClass || 'text-hwhub-heading'"
      >
        {{ currentLocale.toUpperCase() }}
      </span>
    </button>
    <LanguageSwitcherMobile v-model="mobileOpen" />
  </div>

  <!-- PC版 または forcePill時のピル表示 -->
  <div
    class="rounded-full border border-hwhub-border-subtle overflow-hidden bg-white shadow-sm"
    :class="[forcePill ? 'flex' : 'hidden md:inline-flex', buttonClass]"
  >
    <button
      v-for="lang in locales"
      :key="lang"
      type="button"
      class="px-3 py-1 text-[10px] sm:text-xs font-bold focus:outline-none transition-all uppercase tracking-tight"
      :class="[
        currentLocale === lang
          ? 'bg-hwhub-primary text-white shadow-inner'
          : `bg-transparent hover:bg-hwhub-surface-subtle ${textClass || 'text-hwhub-muted'}`,
      ]"
      @click="changeLocale(lang)"
    >
      {{ lang }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe } from 'lucide-vue-next'
import { SUPPORT_LOCALES, type Locale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import LanguageSwitcherMobile from '@/components/LanguageSwitcherMobile.vue'

defineProps<{
  buttonClass?: string
  iconClass?: string
  textClass?: string
  forcePill?: boolean
}>()

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
