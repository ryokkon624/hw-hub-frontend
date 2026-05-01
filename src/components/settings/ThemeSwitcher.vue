<template>
  <div class="rounded-full border border-hwhub-border-subtle overflow-hidden shadow-sm inline-flex">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="flex items-center gap-1.5 px-3 py-1 text-xs font-bold focus:outline-none transition-all"
      :class="[
        themeStore.mode === option.value
          ? 'bg-hwhub-primary text-hwhub-on-primary shadow-inner'
          : 'bg-transparent hover:bg-hwhub-surface-subtle text-hwhub-muted',
      ]"
      @click="themeStore.setMode(option.value)"
    >
      <component :is="option.icon" class="w-3.5 h-3.5" />
      <span>{{ t(option.labelKey) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Monitor, Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import { THEME_MODE } from '@/constants/code.constants'
import type { ThemeModeCode } from '@/constants/code.constants'

const { t } = useI18n()
const themeStore = useThemeStore()

const options: { value: ThemeModeCode; icon: unknown; labelKey: string }[] = [
  { value: THEME_MODE.SYSTEM, icon: Monitor, labelKey: 'settings.account.theme.options.system' },
  { value: THEME_MODE.LIGHT, icon: Sun, labelKey: 'settings.account.theme.options.light' },
  { value: THEME_MODE.DARK, icon: Moon, labelKey: 'settings.account.theme.options.dark' },
]
</script>
