<template>
  <div class="space-y-4 max-w-xl">
    <div>
      <h2 class="sr-only">{{ t('appInfo.title') }}</h2>
      <p class="text-sm text-hwhub-muted">
        {{ t('appInfo.description') }}
      </p>
    </div>

    <!-- バージョン情報 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-2">
      <h3 class="text-sm font-semibold mb-1">
        {{ t('appInfo.version.sectionTitle') }}
      </h3>

      <!-- フロントエンドバージョン（ビルド時に静的埋め込み） -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-hwhub-muted">{{ t('appInfo.version.frontend') }}</span>
        <span class="font-mono text-hwhub-heading">{{ appInfoStore.frontVersion }}</span>
      </div>

      <!-- APIバージョン（/actuator/info から取得） -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-hwhub-muted">{{ t('appInfo.version.api') }}</span>
        <span class="font-mono text-hwhub-heading">
          <template v-if="appInfoStore.isLoading">
            <span class="text-hwhub-muted text-xs">{{ t('appInfo.version.loading') }}</span>
          </template>
          <template v-else>
            {{ appInfoStore.apiVersion ?? t('appInfo.version.unknown') }}
          </template>
        </span>
      </div>
    </section>

    <!-- 利用規約・プライバシーポリシー -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-sm font-semibold mb-1">
        {{ t('appInfo.legal.sectionTitle') }}
      </h3>
      <p class="text-sm text-hwhub-heading">
        {{ t('appInfo.legal.description') }}
      </p>

      <div class="flex flex-col gap-2 mt-1">
        <RouterLink
          to="/settings/app/terms"
          class="inline-flex items-center justify-between rounded-lg border px-3 py-2 text-xs hover:bg-hwhub-surface-subtle"
        >
          <span class="text-hwhub-heading font-semibold">
            {{ t('appInfo.legal.termsLinkLabel') }}
          </span>
          <span class="text-hwhub-muted text-lg">›</span>
        </RouterLink>

        <RouterLink
          to="/settings/app/privacy"
          class="inline-flex items-center justify-between rounded-lg border px-3 py-2 text-xs hover:bg-hwhub-surface-subtle"
        >
          <span class="text-hwhub-heading font-semibold">
            {{ t('appInfo.legal.privacyLinkLabel') }}
          </span>
          <span class="text-hwhub-muted text-lg">›</span>
        </RouterLink>
      </div>
    </section>

    <!-- データとプライバシーの概要 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-2">
      <h3 class="text-sm font-semibold mb-1">
        {{ t('appInfo.privacyOverview.sectionTitle') }}
      </h3>
      <ul class="text-xs text-hwhub-muted list-disc pl-4 space-y-1">
        <li>{{ t('appInfo.privacyOverview.items.householdVisibility') }}</li>
        <li>{{ t('appInfo.privacyOverview.items.analyticsUsage') }}</li>
        <li>{{ t('appInfo.privacyOverview.items.noSelling') }}</li>
      </ul>
      <p class="text-[11px] text-hwhub-muted mt-1">
        {{ t('appInfo.privacyOverview.note') }}
      </p>
    </section>

    <!-- 開発者情報 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-2">
      <h3 class="text-sm font-semibold mb-1">
        {{ t('appInfo.developer.sectionTitle') }}
      </h3>
      <p class="text-xs text-hwhub-muted">
        {{ t('appInfo.developer.appNameLabel') }}<br />
        {{ t('appInfo.developer.operatorLabel') }}<br />
        {{ t('appInfo.developer.contactLabel') }}
        <a href="mailto:example@example.com" class="underline">
          {{ t('appInfo.developer.contactEmail') }}
        </a>
      </p>
    </section>

    <!-- OSS ライセンス -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-2">
      <h3 class="text-sm font-semibold mb-1">
        {{ t('appInfo.oss.sectionTitle') }}
      </h3>
      <p class="text-xs text-hwhub-muted">
        {{ t('appInfo.oss.body') }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useAppInfoStore } from '@/stores/appInfoStore'

const { t } = useI18n()
const appInfoStore = useAppInfoStore()

onMounted(() => {
  appInfoStore.fetchApiVersion()
})
</script>
