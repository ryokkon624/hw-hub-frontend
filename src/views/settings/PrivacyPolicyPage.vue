<template>
  <div class="max-w-3xl mx-auto space-y-4 text-sm text-hwhub-heading">
    <h1 class="text-xl font-bold mb-2">
      {{ t('privacy.title') }}
    </h1>
    <p class="text-xs text-hwhub-muted">
      {{ t('privacy.intro') }}
    </p>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('privacy.section1.title') }}
      </h2>
      <ul class="list-disc pl-4 text-xs text-hwhub-muted space-y-1">
        <li>{{ t('privacy.section1.items.accountInfo') }}</li>
        <li>{{ t('privacy.section1.items.usageData') }}</li>
        <li>{{ t('privacy.section1.items.logInfo') }}</li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('privacy.section2.title') }}
      </h2>
      <ul class="list-disc pl-4 text-xs text-hwhub-muted space-y-1">
        <li>{{ t('privacy.section2.items.serviceProvision') }}</li>
        <li>{{ t('privacy.section2.items.troubleshooting') }}</li>
        <li>{{ t('privacy.section2.items.analytics') }}</li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('privacy.section3.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('privacy.section3.body') }}
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('privacy.section4.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('privacy.section4.body') }}
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('privacy.section5.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('privacy.section5.body') }}
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('privacy.section6.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('privacy.section6.body') }}
      </p>
    </section>

    <p class="text-[11px] text-hwhub-muted mt-4">
      {{ t('privacy.note') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
