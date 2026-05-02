<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Hand, House, Brush } from 'lucide-vue-next'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkStore } from '@/stores/houseworkStore'
import OnboardingStepCard from './OnboardingStepCard.vue'

const { t } = useI18n()
const router = useRouter()
const householdStore = useHouseholdStore()
const houseworkStore = useHouseworkStore()

const currentHouseholdId = computed(() => householdStore.currentHouseholdId)
const hasHouseworks = computed(() => houseworkStore.items.length > 0)

// Step 1: Join/Create Household (Done if household exists)
const isStep1Done = computed(() => !!currentHouseholdId.value)

// Step 2: Create Housework (Done if housework exists)
const isStep2Done = computed(() => {
  if (!isStep1Done.value) return false

  if (!houseworkStore.isFetchedFor(currentHouseholdId.value ?? 0)) return false

  return hasHouseworks.value
})

// Show card if any step is NOT done
const showCard = computed(() => !isStep1Done.value || !isStep2Done.value)

const goHouseholdSettings = () => {
  router.push({ name: 'settings.household' })
}

const goHouseworkSettings = () => {
  router.push({ name: 'settings.housework' })
}
</script>

<template>
  <article
    v-if="showCard"
    class="rounded-xl border border-hwhub-primary-200 bg-hwhub-onboarding p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500"
  >
    <header class="mb-4">
      <h3 class="text-lg font-bold text-hwhub-heading flex items-center gap-2">
        <Hand class="w-6 h-6 text-amber-500" />
        <span>{{ t('home.onboarding.title') }}</span>
      </h3>
      <p class="mt-1 text-sm text-hwhub-muted ml-9">
        {{ t('home.onboarding.subtitle') }}
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <OnboardingStepCard
        :icon="House"
        :title="t('home.onboarding.step1.title')"
        :description="t('home.onboarding.step1.description')"
        :button-label="t('home.onboarding.step1.button')"
        :is-done="isStep1Done"
        @action="goHouseholdSettings"
      />

      <OnboardingStepCard
        :icon="Brush"
        :title="t('home.onboarding.step2.title')"
        :description="t('home.onboarding.step2.description')"
        :button-label="t('home.onboarding.step2.button')"
        :is-done="isStep2Done"
        :is-button-disabled="!isStep1Done"
        @action="goHouseworkSettings"
      />
    </div>
  </article>
</template>
