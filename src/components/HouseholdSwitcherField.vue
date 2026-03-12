<template>
  <section class="space-y-1">
    <label class="block text-xs text-hwhub-muted"> {{ t('household.switcher.label') }}</label>
    <button
      type="button"
      class="w-full rounded-xl border border-hwhub-border-subtle px-3 py-2 flex items-center justify-between bg-white text-sm hover:bg-hwhub-surface-subtle transition"
      @click="open = true"
    >
      <div class="flex items-center gap-2">
        <div
          class="h-8 w-8 rounded-full bg-hwhub-surface-subtle flex items-center justify-center text-hwhub-heading"
        >
          <House class="w-4 h-4" />
        </div>
        <div class="flex flex-col">
          <span class="font-medium truncate text-hwhub-heading">
            {{ currentHouseholdName }}
          </span>
          <span class="text-[11px] text-hwhub-muted"> {{ currentHouseholdName }}</span>
        </div>
      </div>
      <span class="text-hwhub-muted text-lg">›</span>
    </button>

    <!-- 実際のシート -->
    <HouseholdSwitcherMobile v-model="open" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import HouseholdSwitcherMobile from './HouseholdSwitcherMobile.vue'
import { House } from 'lucide-vue-next'
import { useHouseholdStore } from '@/stores/householdStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const open = ref(false)
const householdStore = useHouseholdStore()

const currentHousehold = computed(
  () =>
    householdStore.households.find((h) => h.householdId === householdStore.currentHouseholdId) ??
    null,
)

const currentHouseholdName = computed(
  () => currentHousehold.value?.name ?? t('household.switcher.noneSelected'),
)
</script>
