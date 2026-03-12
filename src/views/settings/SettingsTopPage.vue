<template>
  <div class="space-y-4">
    <h2 class="sr-only">{{ t('settings.pageTitle') }}</h2>
    <p class="text-sm text-hwhub-muted">{{ t('settings.description') }}</p>

    <div class="mt-4 space-y-3">
      <!-- アカウント設定 -->
      <RouterLink
        to="/settings/account"
        class="block rounded-xl border bg-white p-4 shadow-sm hover:bg-hwhub-surface-subtle transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <User class="w-5 h-5" />
            <div>
              <div class="font-medium text-sm text-hwhub-heading">
                {{ t('settings.sections.account.title') }}
              </div>
              <div class="text-xs text-hwhub-muted">
                {{ t('settings.sections.account.subtitle') }}
              </div>
            </div>
          </div>
          <span class="text-hwhub-muted">›</span>
        </div>
      </RouterLink>

      <!-- 世帯設定 -->
      <RouterLink
        to="/settings/household"
        class="block rounded-xl border bg-white p-4 shadow-sm hover:bg-hwhub-surface-subtle transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <House class="w-5 h-5" />
            <div>
              <div class="font-medium text-sm text-hwhub-heading">
                {{ t('settings.sections.household.title') }}
              </div>
              <div class="text-xs text-hwhub-muted">
                {{ t('settings.sections.household.subtitle') }}
              </div>
            </div>
          </div>
          <span class="text-hwhub-muted">›</span>
        </div>
      </RouterLink>

      <!-- 家事設定 -->
      <RouterLink
        to="/settings/housework"
        class="block rounded-xl border bg-white p-4 shadow-sm hover:bg-hwhub-surface-subtle transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Brush class="w-5 h-5" />
            <div>
              <div class="font-medium text-sm text-hwhub-heading">
                {{ t('settings.sections.housework.title') }}
              </div>
              <div class="text-xs text-hwhub-muted">
                {{ t('settings.sections.housework.subtitle') }}
              </div>
            </div>
          </div>
          <span class="text-hwhub-muted">›</span>
        </div>
      </RouterLink>

      <!-- 通知センター -->
      <RouterLink
        to="/notifications"
        class="block rounded-xl border bg-white p-4 shadow-sm hover:bg-hwhub-surface-subtle transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Bell class="w-5 h-5" />
            <div>
              <div class="font-medium text-sm text-hwhub-heading">
                {{ t('settings.sections.notifications.title') }}
              </div>
              <div class="text-xs text-hwhub-muted">
                {{ t('settings.sections.notifications.subtitle') }}
              </div>
            </div>
          </div>
          <span class="text-hwhub-muted">›</span>
        </div>
      </RouterLink>

      <!-- アプリ情報 -->
      <RouterLink
        to="/settings/app"
        class="block rounded-xl border bg-white p-4 shadow-sm hover:bg-hwhub-surface-subtle transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Info class="w-5 h-5" />
            <div>
              <div class="font-medium text-sm text-hwhub-heading">
                {{ t('settings.sections.about.title') }}
              </div>
              <div class="text-xs text-hwhub-muted">
                {{ t('settings.sections.about.subtitle') }}
              </div>
            </div>
          </div>
          <span class="text-hwhub-muted">›</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { User, House, Brush, Bell, Info } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
