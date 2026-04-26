<template>
  <Teleport to="body">
    <!-- 外側：背景フェード -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
        @click.self="close"
      >
        <!-- 内側：シートのスライドアップ -->
        <transition name="slide-up">
          <div
            v-show="isOpen"
            class="w-full max-w-md rounded-t-2xl bg-white shadow-xl p-4 pb-6 animate-in fade-in slide-in-from-bottom-2"
          >
            <!-- ハンドル -->
            <div class="flex justify-center mb-2">
              <div class="h-1 w-10 rounded-full bg-hwhub-border-subtle" />
            </div>

            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-semibold text-hwhub-heading">
                {{ t('languageSwitcher.mobile.title') }}
              </h2>
              <button
                type="button"
                class="text-xs text-hwhub-muted hover:text-hwhub-heading"
                @click="close"
              >
                {{ t('languageSwitcher.mobile.close') }}
              </button>
            </div>

            <!-- 言語リスト -->
            <div class="space-y-2">
              <button
                v-for="lang in locales"
                :key="lang"
                type="button"
                class="w-full rounded-xl border px-3 py-2 text-left flex items-center justify-between transition"
                :class="
                  currentLocale === lang
                    ? 'border-hwhub-primary bg-hwhub-primary text-white'
                    : 'border-hwhub-border-subtle bg-white text-hwhub-heading hover:bg-hwhub-surface-subtle'
                "
                @click="selectLocale(lang)"
              >
                <span class="text-sm font-medium">
                  {{ t(`common.locales.${lang}`) }}
                </span>

                <span
                  v-if="currentLocale === lang"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-white/95 text-hwhub-heading"
                >
                  {{ t('languageSwitcher.mobile.current') }}
                </span>
                <span v-else class="text-lg text-hwhub-muted">›</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORT_LOCALES, type Locale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const locales = SUPPORT_LOCALES
const currentLocale = computed(() => locale.value as Locale)

const close = () => {
  isOpen.value = false
}

const selectLocale = (lang: Locale) => {
  locale.value = lang
  localStorage.setItem('hwhub_locale', lang)
  if (authStore.currentUser) {
    authStore.currentUser.locale = lang
  }
  close()
}
</script>
