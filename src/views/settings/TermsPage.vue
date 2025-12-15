<template>
  <div class="max-w-3xl mx-auto space-y-4 text-sm text-hwhub-heading">
    <h1 class="text-xl font-bold mb-2">
      {{ t('terms.title') }}
    </h1>
    <p class="text-xs text-hwhub-muted">
      {{ t('terms.intro') }}
    </p>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('terms.article1.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('terms.article1.body') }}
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('terms.article2.title') }}
      </h2>
      <ul class="list-disc pl-4 text-xs text-hwhub-muted space-y-1">
        <li>{{ t('terms.article2.items.accurateInfo') }}</li>
        <li>{{ t('terms.article2.items.accountResponsibility') }}</li>
        <li>{{ t('terms.article2.items.illegalUseNotice') }}</li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('terms.article3.title') }}
      </h2>
      <ul class="list-disc pl-4 text-xs text-hwhub-muted space-y-1">
        <li>{{ t('terms.article3.items.lawAndOrder') }}</li>
        <li>{{ t('terms.article3.items.impersonation') }}</li>
        <li>{{ t('terms.article3.items.serviceDisruption') }}</li>
        <li>{{ t('terms.article3.items.reverseEngineering') }}</li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('terms.article4.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('terms.article4.body') }}
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('terms.article5.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('terms.article5.body') }}
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="font-semibold text-sm">
        {{ t('terms.article6.title') }}
      </h2>
      <p class="text-xs text-hwhub-muted">
        {{ t('terms.article6.body') }}
      </p>
    </section>

    <p class="text-[11px] text-hwhub-muted mt-4">
      {{ t('terms.note') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
