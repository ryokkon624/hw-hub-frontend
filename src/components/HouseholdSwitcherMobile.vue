<template>
  <Teleport to="body">
    <!-- 外側：背景フェード -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
        @click.self="close"
      >
        <!-- 内側：シートのスライドアップ -->
        <transition name="slide-up">
          <div
            v-show="isOpen"
            class="w-full max-w-md rounded-t-2xl bg-white shadow-xl p-4 pb-6 animate-in fade-in slide-in-from-bottom-2"
          >
            <!-- ハンドル -->
            <div class="flex justify-center mb-2">
              <div class="h-1 w-10 rounded-full bg-hwhub-border-subtle" />
            </div>

            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-semibold text-hwhub-heading">
                {{ t('household.switcher.mobile.title') }}
              </h2>
              <button
                type="button"
                class="text-xs text-hwhub-muted hover:text-hwhub-heading"
                @click="close"
              >
                {{ t('household.switcher.mobile.close') }}
              </button>
            </div>

            <p class="mb-3 text-[11px] text-hwhub-muted">
              {{ t('household.switcher.mobile.description') }}
            </p>

            <!-- 世帯リスト -->
            <div class="space-y-2 max-h-[50vh] overflow-y-auto">
              <button
                v-for="h in households"
                :key="h.householdId"
                type="button"
                class="w-full rounded-xl border px-3 py-2 text-left flex items-center justify-between transition"
                :class="
                  h.householdId === currentHouseholdId
                    ? 'border-hwhub-primary bg-hwhub-primary text-white'
                    : 'border-hwhub-border-subtle bg-white text-hwhub-heading hover:bg-hwhub-surface-subtle'
                "
                @click="selectHousehold(h.householdId)"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="h-8 w-8 rounded-full flex items-center justify-center text-base"
                    :class="
                      h.householdId === currentHouseholdId
                        ? 'bg-white text-hwhub-heading'
                        : 'bg-hwhub-surface-subtle text-hwhub-muted'
                    "
                  >
                    🏠
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium truncate">
                      {{ h.name }}
                    </span>
                    <span
                      class="text-[11px]"
                      :class="
                        h.householdId === currentHouseholdId ? 'text-white/80' : 'text-hwhub-muted'
                      "
                    >
                      {{ t('household.switcher.mobile.householdLabel') }}
                    </span>
                  </div>
                </div>

                <div class="ml-2 flex items-center gap-1">
                  <span
                    v-if="h.householdId === currentHouseholdId"
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-white/95 text-hwhub-heading"
                  >
                    {{ t('household.switcher.mobile.current') }}
                  </span>
                  <span v-else class="text-lg text-hwhub-muted">›</span>
                </div>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const householdStore = useHouseholdStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const households = computed(() => householdStore.households)
const currentHouseholdId = computed(() => householdStore.currentHouseholdId)

const close = () => {
  isOpen.value = false
}

const selectHousehold = (id: number) => {
  if (id === householdStore.currentHouseholdId) {
    close()
    return
  }
  householdStore.setCurrentHousehold(id)
  close()
}
</script>
