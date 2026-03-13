<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Hand, House, CheckSquare, Brush } from 'lucide-vue-next'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkStore } from '@/stores/houseworkStore'

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

  const fetchedAt = houseworkStore.lastFetchedAtByHouseholdId[currentHouseholdId.value ?? 0]
  if (!fetchedAt) return false

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
    class="rounded-xl border border-hwhub-primary-200 bg-linear-to-r from-teal-50 to-blue-50 p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500"
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
      <!-- Step 1 Config -->
      <section
        class="flex flex-col rounded-lg border p-4 transition-colors"
        :class="[
          isStep1Done
            ? 'bg-white/40 border-hwhub-primary-200 opacity-70'
            : 'bg-white border-hwhub-primary-300 shadow-sm',
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 mb-2">
            <House class="w-5 h-5 text-hwhub-primary" />
            <h4 class="font-bold text-hwhub-heading text-sm">
              {{ t('home.onboarding.step1.title') }}
            </h4>
          </div>
          <div v-if="isStep1Done">
            <CheckSquare class="w-5 h-5 text-hwhub-primary" />
          </div>
        </div>

        <p class="text-xs text-hwhub-body leading-relaxed flex-1">
          {{ t('home.onboarding.step1.description') }}
        </p>

        <div v-if="!isStep1Done" class="mt-4">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-hwhub-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-hwhub-primary-600 shadow-sm"
            @click="goHouseholdSettings"
          >
            {{ t('home.onboarding.step1.button') }}
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </section>

      <!-- Step 2 Config -->
      <section
        class="flex flex-col rounded-lg border p-4 transition-colors"
        :class="[
          isStep2Done
            ? 'bg-white/40 border-hwhub-primary-200 opacity-70'
            : 'bg-white border-hwhub-primary-300 shadow-sm',
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 mb-2">
            <Brush class="w-5 h-5 text-hwhub-primary" />
            <h4 class="font-bold text-hwhub-heading text-sm">
              {{ t('home.onboarding.step2.title') }}
            </h4>
          </div>
          <div v-if="isStep2Done">
            <CheckSquare class="w-5 h-5 text-hwhub-primary" />
          </div>
        </div>

        <p class="text-xs text-hwhub-body leading-relaxed flex-1">
          {{ t('home.onboarding.step2.description') }}
        </p>

        <div v-if="!isStep2Done" class="mt-4">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-hwhub-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-hwhub-primary-600 shadow-sm"
            @click="goHouseworkSettings"
            :disabled="!isStep1Done"
            :class="{ 'opacity-50 cursor-not-allowed': !isStep1Done }"
          >
            {{ t('home.onboarding.step2.button') }}
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </section>
    </div>
  </article>
</template>
