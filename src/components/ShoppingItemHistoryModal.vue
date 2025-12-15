<template>
  <BaseModal title="過去の購入から選ぶ" @close="$emit('close')">
    <div class="flex justify-between items-center mb-2">
      <p class="text-xs text-hwhub-muted">{{ t('shopping.historyModal.description') }}</p>
      <button
        type="button"
        class="text-[11px] text-hwhub-muted hover:text-hwhub-heading underline"
        @click="reload"
      >
        {{ t('shopping.historyModal.reload') }}
      </button>
    </div>

    <!-- 🔍 フィルタ UI -->
    <div class="mb-3 space-y-2">
      <div class="flex gap-2">
        <!-- 品名検索 -->
        <input
          v-model="keyword"
          type="text"
          class="flex-1 rounded-md border border-hwhub-border-subtle px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
          placeholder="品名で検索"
        />

        <!-- 購入場所 -->
        <select
          v-model="storeTypeFilter"
          class="w-28 rounded-md border border-hwhub-border-subtle px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
        >
          <option value="all">{{ t('shopping.historyModal.filters.storeType.all') }}</option>
          <option value="1">{{ t('shopping.historyModal.filters.storeType.supermarket') }}</option>
          <option value="2">{{ t('shopping.historyModal.filters.storeType.online') }}</option>
          <option value="3">{{ t('shopping.historyModal.filters.storeType.drugstore') }}</option>
        </select>
      </div>

      <!-- 期間フィルタ -->
      <div class="flex flex-wrap gap-1 text-[11px]">
        <button
          type="button"
          class="px-2 py-0.5 rounded-full border text-[11px] transition"
          :class="
            periodFilter === 'all'
              ? 'bg-hwhub-primary text-white border-hwhub-primary'
              : 'border-hwhub-border-subtle text-hwhub-muted hover:bg-hwhub-surface-subtle'
          "
          @click="setPeriod('all')"
        >
          {{ t('shopping.historyModal.filters.period.all') }}
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded-full border text-[11px] transition"
          :class="
            periodFilter === '30d'
              ? 'bg-hwhub-primary text-white border-hwhub-primary'
              : 'border-hwhub-border-subtle text-hwhub-muted hover:bg-hwhub-surface-subtle'
          "
          @click="setPeriod('30d')"
        >
          {{ t('shopping.historyModal.filters.period.d30') }}
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded-full border text-[11px] transition"
          :class="
            periodFilter === '90d'
              ? 'bg-hwhub-primary text-white border-hwhub-primary'
              : 'border-hwhub-border-subtle text-hwhub-muted hover:bg-hwhub-surface-subtle'
          "
          @click="setPeriod('90d')"
        >
          {{ t('shopping.historyModal.filters.period.d90') }}
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded-full border text-[11px] transition"
          :class="
            periodFilter === '365d'
              ? 'bg-hwhub-primary text-white border-hwhub-primary'
              : 'border-hwhub-border-subtle text-hwhub-muted hover:bg-hwhub-surface-subtle'
          "
          @click="setPeriod('365d')"
        >
          {{ t('shopping.historyModal.filters.period.d365') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="py-8 text-center text-xs text-hwhub-muted">
      {{ t('shopping.historyModal.loading') }}
    </div>

    <!-- 履歴そのものがゼロ -->
    <div v-else-if="rawHistories.length === 0" class="py-8 text-center text-xs text-hwhub-muted">
      {{ t('shopping.historyModal.emptyAll') }}
    </div>

    <!-- 履歴はあるが、条件にマッチしない -->
    <div v-else-if="histories.length === 0" class="py-8 text-center text-xs text-hwhub-muted">
      {{ t('shopping.historyModal.emptyFiltered') }}
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="h in histories"
        :key="h.sourceShoppingItemId"
        class="border border-hwhub-border-subtle rounded-lg px-3 py-2 text-xs flex gap-2 items-center hover:bg-hwhub-surface-subtle cursor-pointer transition"
        @click="onSelect(h)"
      >
        <!-- サムネ -->
        <div
          class="flex items-center justify-center h-8 w-8 rounded bg-hwhub-surface-subtle text-[10px] text-hwhub-muted shrink-0"
        >
          <span v-if="h.hasImage"> {{ t('shopping.historyModal.item.thumbnail.hasImage') }}</span>
          <span v-else>{{ t('shopping.historyModal.item.thumbnail.noImage') }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm text-hwhub-heading">{{ h.name }}</p>
          <p class="text-[11px] text-hwhub-muted truncate">
            {{ storeTypeLabel(h.storeType) || t('shopping.historyModal.item.storeTypeUnset') }}
            <span v-if="h.lastPurchasedDate">
              ／ {{ h.purchaseCount }}{{ t('shopping.historyModal.item.purchaseCountSuffix') }}
              {{ ' ' + h.lastPurchasedDate }}</span
            >
            <span v-if="h.purchaseCount"> ／ {{ h.purchaseCount }}回</span>
          </p>
        </div>

        <button
          type="button"
          class="text-[11px] px-2 py-1 rounded-full border border-hwhub-border-subtle text-hwhub-heading hover:bg-hwhub-surface-subtle"
        >
          {{ t('shopping.historyModal.item.selectButton') }}
        </button>
      </li>
    </ul>
  </BaseModal>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useShoppingHistoryStore } from '@/stores/shoppingHistoryStore'
import type { ShoppingItemHistorySuggestionModel } from '@/domain'
import { useShoppingCodes } from '@/composables/useShoppingCodes'
import { isWithinDays } from '@/utils/dateUtils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{
  householdId: number
}>()

const emit = defineEmits<{
  close: []
  selected: [item: ShoppingItemHistorySuggestionModel]
}>()

const historyStore = useShoppingHistoryStore()
const { storeTypeLabel } = useShoppingCodes()

// 元データ（Store からのそのまま）
const rawHistories = computed<ShoppingItemHistorySuggestionModel[]>(() => {
  if (!props.householdId) return []
  return historyStore.suggestions(props.householdId)
})

const loading = ref(false)

// 🔍 フィルタ用 state
const keyword = ref('')
const storeTypeFilter = ref<'all' | '1' | '2' | '3'>('all')
const periodFilter = ref<'all' | '30d' | '90d' | '365d'>('all')

// 絞り込み後のリスト
const histories = computed<ShoppingItemHistorySuggestionModel[]>(() => {
  let list = rawHistories.value

  // 品名テキスト検索
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter((h) => h.name.toLowerCase().includes(kw))
  }

  // 購入場所フィルタ
  if (storeTypeFilter.value !== 'all') {
    list = list.filter((h) => h.storeType === storeTypeFilter.value)
  }

  // 期間フィルタ
  if (periodFilter.value !== 'all') {
    const days = periodFilter.value === '30d' ? 30 : periodFilter.value === '90d' ? 90 : 365
    list = list.filter((h) => isWithinDays(h.lastPurchasedDate, days))
  }

  return list
})

const load = async () => {
  loading.value = true
  try {
    await historyStore.fetchSuggestions(props.householdId)
  } finally {
    loading.value = false
  }
}

const reload = () => load()

const onSelect = (item: ShoppingItemHistorySuggestionModel) => {
  emit('selected', item)
  emit('close')
}

// 期間ボタン用ヘルパー
const setPeriod = (value: 'all' | '30d' | '90d' | '365d') => {
  periodFilter.value = value
}

onMounted(load)
</script>
