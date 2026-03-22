<template>
  <div class="space-y-4">
    <h2 class="sr-only">{{ t('admin.pageTitle') }}</h2>
    <p class="text-sm text-hwhub-muted">{{ t('admin.description') }}</p>

    <div class="mt-4 space-y-3">
      <!-- ロール管理カード -->
      <RouterLink
        :to="{ name: 'admin.roles' }"
        class="block rounded-xl border bg-white p-4 shadow-sm hover:bg-hwhub-surface-subtle transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="rounded-lg p-2 bg-rose-100">
              <ShieldCheck class="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div class="font-medium text-sm text-hwhub-heading">
                {{ t('admin.sections.roles.title') }}
              </div>
              <div class="text-xs text-hwhub-muted">
                {{ t('admin.sections.roles.subtitle') }}
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
import { ShieldCheck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
