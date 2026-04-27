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

            <!-- 言語リスト（ピル形式） -->
            <div class="mt-4 p-1.5 bg-hwhub-surface-subtle rounded-2xl flex items-center gap-1">
              <button
                v-for="lang in locales"
                :key="lang"
                type="button"
                class="flex-1 py-3 px-2 text-sm font-bold rounded-xl transition-all duration-200 focus:outline-none"
                :class="[
                  currentLocale === lang
                    ? 'bg-white text-hwhub-primary shadow-sm scale-[1.02]'
                    : 'text-hwhub-muted hover:text-hwhub-heading active:scale-95',
                ]"
                @click="selectLocale(lang)"
              >
                {{ t(`common.locales.${lang}`) }}
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
  authStore.patchCurrentUser({ locale: lang })
  close()
}
</script>
