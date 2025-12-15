<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/householdStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import type { ShoppingItemModel } from '@/domain'
import { toYmd, addDays } from '@/utils/dateUtils'
import { PURCHASE_LOCATION_TYPE, SHOPPING_ITEM_STATUS } from '@/constants/code.constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const householdStore = useHouseholdStore()
const shoppingStore = useShoppingStore()

const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)

const today = new Date()
const todayYmd = toYmd(today)

const recent2DaysStartYmd = addDays(today, -2)

const allShoppingItems = computed<ShoppingItemModel[]>(() => {
  const hid = currentHouseholdId.value
  if (!hid) return []
  return shoppingStore.items(hid) ?? []
})

// 未購入アイテムのみ
const openShoppingItems = computed(() =>
  allShoppingItems.value.filter((i) => i.status === SHOPPING_ITEM_STATUS.NOT_PURCHASED),
)

const superCount = computed(
  () =>
    openShoppingItems.value.filter((i) => i.storeType === PURCHASE_LOCATION_TYPE.SUPERMARKET)
      .length,
)

const drugCount = computed(
  () =>
    openShoppingItems.value.filter((i) => i.storeType === PURCHASE_LOCATION_TYPE.DRUGSTORE).length,
)

const onlineCount = computed(
  () => openShoppingItems.value.filter((i) => i.storeType === PURCHASE_LOCATION_TYPE.ONLINE).length,
)

const recentAddedCount = computed(() => {
  return openShoppingItems.value.filter((i) => {
    const ymd = i.createdAt.substring(0, 10) // "YYYY-MM-DD"
    return ymd >= recent2DaysStartYmd && ymd <= todayYmd
  }).length
})

const goShopping = () => {
  router.push({ name: 'shopping' })
}
</script>

<template>
  <article class="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-3">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-hwhub-heading flex items-center gap-2">
          <span class="text-lg">🛒</span>
          <span>{{ t('home.shopping.title') }}</span>
        </h3>
        <p class="mt-1 text-xs text-hwhub-muted">
          {{ t('home.shopping.summary') }}
        </p>
      </div>
    </header>

    <div class="mt-2 grid grid-cols-3 gap-2 text-xs">
      <div class="rounded-lg bg-hwhub-surface-subtle px-2 py-2 flex flex-col items-start">
        <span class="text-hwhub-muted">{{ t('home.shopping.super') }}</span>
        <span class="mt-1 text-base font-semibold text-hwhub-heading">
          {{ t('home.common.itemCount', { count: superCount }) }}
        </span>
      </div>
      <div class="rounded-lg bg-hwhub-surface-subtle px-2 py-2 flex flex-col items-start">
        <span class="text-hwhub-muted">{{ t('home.shopping.drug') }}</span>
        <span class="mt-1 text-base font-semibold text-hwhub-heading">
          {{ t('home.common.itemCount', { count: drugCount }) }}
        </span>
      </div>
      <div class="rounded-lg bg-hwhub-surface-subtle px-2 py-2 flex flex-col items-start">
        <span class="text-hwhub-muted">{{ t('home.shopping.online') }}</span>
        <span class="mt-1 text-base font-semibold text-hwhub-heading">
          {{ t('home.common.itemCount', { count: onlineCount }) }}
        </span>
      </div>
    </div>

    <div
      class="mt-2 rounded-lg bg-hwhub-primary-50 px-3 py-2 text-xs flex items-center justify-between"
    >
      <span class="text-hwhub-primary">{{ t('home.shopping.recentLabel') }}</span>
      <span class="text-base font-semibold text-hwhub-primary"
        >{{ t('home.common.itemCount', { count: recentAddedCount }) }}
      </span>
    </div>

    <footer class="mt-3 flex items-center justify-end">
      <button
        type="button"
        class="inline-flex items-center rounded-full bg-hwhub-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-hwhub-primary"
        @click="goShopping"
      >
        {{ t('home.shopping.openButton') }}
      </button>
    </footer>
  </article>
</template>
