<template>
  <div class="space-y-4">
    <h2 class="sr-only">{{ t('settings.pageTitle') }}</h2>
    <p class="text-sm text-hwhub-muted">{{ t('settings.description') }}</p>

    <div class="mt-4 space-y-3">
      <SettingsCard
        to="/settings/account"
        :icon="User"
        icon-bg-class="bg-hwhub-palette-blue-soft"
        icon-color-class="text-hwhub-palette-blue"
        :title="t('settings.sections.account.title')"
        :subtitle="t('settings.sections.account.subtitle')"
      />

      <SettingsCard
        to="/settings/household"
        :icon="House"
        icon-bg-class="bg-hwhub-palette-emerald-soft"
        icon-color-class="text-hwhub-palette-emerald"
        :title="t('settings.sections.household.title')"
        :subtitle="t('settings.sections.household.subtitle')"
      />

      <SettingsCard
        to="/settings/housework"
        :icon="Brush"
        icon-bg-class="bg-hwhub-palette-amber-soft"
        icon-color-class="text-hwhub-palette-amber"
        :title="t('settings.sections.housework.title')"
        :subtitle="t('settings.sections.housework.subtitle')"
      />

      <SettingsCard
        to="/notifications"
        :icon="Bell"
        icon-bg-class="bg-hwhub-palette-rose-soft"
        icon-color-class="text-hwhub-palette-rose"
        :title="t('settings.sections.notifications.title')"
        :subtitle="t('settings.sections.notifications.subtitle')"
      />

      <SettingsCard
        :to="{ name: 'settings.inquiry' }"
        :icon="MessageCircleQuestion"
        icon-bg-class="bg-hwhub-palette-violet-soft"
        icon-color-class="text-hwhub-palette-violet"
        :title="t('settings.sections.inquiry.title')"
        :subtitle="t('settings.sections.inquiry.subtitle')"
      />

      <SettingsCard
        to="/settings/app"
        :icon="Info"
        icon-bg-class="bg-hwhub-surface-subtle"
        icon-color-class="text-hwhub-muted"
        :title="t('settings.sections.about.title')"
        :subtitle="t('settings.sections.about.subtitle')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, House, Brush, Bell, Info, MessageCircleQuestion } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import SettingsCard from '@/components/settings/SettingsCard.vue'

const { t } = useI18n()
</script>
