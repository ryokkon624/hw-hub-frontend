<template>
  <div class="space-y-4">
    <!-- ページタイトル -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="sr-only">{{ t('shopping.list.titleSr') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('shopping.list.intro') }}</p>
      </div>

      <button
        type="button"
        class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="onClickAdd"
      >
        {{ t('shopping.list.addButton') }}
      </button>
    </header>

    <!-- SP 用 世帯スイッチャー -->
    <HouseholdSwitcherField class="sm:hidden" />

    <!-- SP 用の追加ボタン -->
    <div class="sm:hidden">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="onClickAdd"
      >
        {{ t('shopping.list.addButton') }}
      </button>
    </div>

    <!-- メインレイアウト：PC は2カラム、SP は縦並び（高さ揃え） -->
    <div class="grid gap-4 md:grid-cols-2 md:items-stretch">
      <!-- 未購入リスト -->
      <section
        class="rounded-xl border bg-white p-4 shadow-sm flex flex-col min-h-[260px] md:h-full"
      >
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-semibold text-hwhub-heading">
            {{ t('shopping.list.notPurchased.title') }}
          </h2>
          <span class="text-xs text-hwhub-muted">
            <span v-if="storeTypeFilter === 'all'">
              {{
                t('shopping.list.notPurchased.count', { count: filteredNotPurchasedItems.length })
              }}
            </span>
            <span v-else>
              {{
                t('shopping.list.notPurchased.countWithFilter', {
                  filtered: filteredNotPurchasedItems.length,
                  total: notPurchasedItems.length,
                })
              }}
            </span>
          </span>
        </div>

        <!-- 🔍 購入場所フィルタ -->
        <div class="mb-2 flex flex-wrap gap-1 text-[11px]">
          <!-- すべて -->
          <button
            type="button"
            class="px-2 py-0.5 rounded-full border transition"
            :class="
              storeTypeFilter === 'all'
                ? 'bg-hwhub-primary text-white border-hwhub-primary'
                : 'border-gray-300 text-hwhub-muted hover:bg-hwhub-surface-subtle'
            "
            @click="storeTypeFilter = 'all'"
          >
            {{ t('shopping.list.filters.all') }}
          </button>

          <!-- スーパー -->
          <button
            type="button"
            class="px-2 py-0.5 rounded-full border flex items-center gap-1 transition"
            :class="
              storeTypeFilter === '1'
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            "
            @click="storeTypeFilter = '1'"
          >
            <span class="h-2 w-2 rounded-full" :class="storeTypeDotClass('1')" />
            {{ storeTypeLabel(PURCHASE_LOCATION_TYPE.SUPERMARKET) }}
          </button>

          <!-- ドラッグストア -->
          <button
            type="button"
            class="px-2 py-0.5 rounded-full border flex items-center gap-1 transition"
            :class="
              storeTypeFilter === '3'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'border-rose-200 text-rose-700 hover:bg-rose-50'
            "
            @click="storeTypeFilter = '3'"
          >
            <span class="h-2 w-2 rounded-full" :class="storeTypeDotClass('3')" />
            {{ storeTypeLabel(PURCHASE_LOCATION_TYPE.DRUGSTORE) }}
          </button>

          <!-- オンライン -->
          <button
            type="button"
            class="px-2 py-0.5 rounded-full border flex items-center gap-1 transition"
            :class="
              storeTypeFilter === '2'
                ? 'bg-sky-500 text-white border-sky-500'
                : 'border-sky-200 text-sky-700 hover:bg-sky-50'
            "
            @click="storeTypeFilter = '2'"
          >
            <span class="h-2 w-2 rounded-full" :class="storeTypeDotClass('2')" />
            {{ storeTypeLabel(PURCHASE_LOCATION_TYPE.ONLINE) }}
          </button>
        </div>

        <div
          v-if="filteredNotPurchasedItems.length === 0"
          class="flex-1 flex items-center justify-center"
        >
          <p class="text-xs text-hwhub-muted">
            <span v-if="notPurchasedItems.length === 0">{{
              t('shopping.list.notPurchased.emptyAll')
            }}</span>
            <span v-else>{{ t('shopping.list.notPurchased.emptyFiltered') }}</span>
          </p>
        </div>

        <TransitionGroup
          v-else
          name="shopping-list"
          tag="ul"
          class="space-y-2 flex-1 overflow-y-auto overflow-x-hidden md:max-h-none max-h-80 shopping-move-list"
        >
          <li
            v-for="item in filteredNotPurchasedItems"
            :key="item.shoppingItemId"
            class="group rounded-xl border border-gray-300 bg-white px-3 py-2.5 flex items-start gap-3 hover:bg-hwhub-surface-subtle shadow-sm hover:shadow-md hover:-translate-y-px transition"
            :class="storeTypeBorderClass(item.storeType)"
          >
            <!-- テキスト＆アクション -->
            <div class="flex-1 min-w-0" @click="goToDetail(item)">
              <div class="flex items-start justify-between gap-2 min-w-0">
                <!-- 左：タイトル＋メモ -->
                <div class="flex-1 min-w-0 flex flex-col justify-center min-h-10">
                  <p
                    class="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-hwhub-heading transition-colors"
                  >
                    {{ item.name }}
                  </p>
                  <p
                    v-if="item.memo"
                    class="mt-0.5 text-[11px] text-hwhub-muted leading-snug line-clamp-2 group-hover:text-hwhub-heading/70 transition-colors"
                  >
                    {{ item.memo }}
                  </p>
                </div>

                <!-- 右上：画像アイコン（あるときだけ） -->
                <div v-if="item.hasImage" class="shrink-0 ml-1 mt-0.5">
                  <span
                    class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-hwhub-surface-subtle text-[11px] text-hwhub-muted"
                  >
                    📷
                  </span>
                </div>

                <!-- 右：アクション -->
                <div
                  class="flex flex-col justify-center items-center gap-1 shrink-0 min-h-10 min-w-[72px]"
                >
                  <!-- ★ ボタン -->
                  <button
                    type="button"
                    class="flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-yellow-400 hover:border-yellow-300 hover:bg-yellow-50 hover:scale-105 transition"
                    @click.stop="toggleFavorite(item)"
                  >
                    <span v-if="item.favorite">★</span>
                    <span v-else class="text-gray-300">☆</span>
                  </button>

                  <!-- かごへボタン -->
                  <button
                    type="button"
                    class="px-3 py-1 text-[11px] rounded-full border border-gray-300 text-hwhub-heading hover:bg-hwhub-surface-subtle active:scale-95"
                    @click.stop="moveToBasket(item)"
                  >
                    {{ t('shopping.list.actions.toBasket') }}
                  </button>
                </div>
              </div>
            </div>
          </li>
        </TransitionGroup>
      </section>

      <!-- かごリスト -->
      <section
        class="rounded-xl border bg-white p-4 shadow-sm flex flex-col min-h-[260px] md:h-full"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-hwhub-heading">
            {{ t('shopping.list.basket.title') }}
          </h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-hwhub-muted">{{
              t('shopping.list.basket.count', { count: inBasketItems.length })
            }}</span>
            <button
              type="button"
              class="px-2 py-1 text-[11px] rounded-full border border-gray-300 text-hwhub-heading hover:bg-hwhub-surface-subtle"
              :disabled="inBasketItems.length === 0"
              @click="onClickCompletePurchase"
            >
              {{ t('shopping.list.basket.completeButton') }}
            </button>
          </div>
        </div>

        <div v-if="inBasketItems.length === 0" class="flex-1 flex items-center justify-center">
          <p class="text-xs text-hwhub-muted">{{ t('shopping.list.basket.empty') }}</p>
        </div>

        <TransitionGroup
          v-else
          name="shopping-list"
          tag="ul"
          class="space-y-2 flex-1 overflow-y-auto overflow-x-hidden md:max-h-none max-h-80 shopping-move-list"
        >
          <li
            v-for="item in inBasketItems"
            :key="item.shoppingItemId"
            class="group rounded-xl border border-gray-300 bg-white px-3 py-2.5 flex items-start gap-3 hover:bg-hwhub-surface-subtle shadow-sm hover:shadow-md hover:-translate-y-px transition"
            :class="storeTypeBorderClass(item.storeType)"
          >
            <!-- テキスト＆アクション -->
            <div class="flex-1 min-w-0" @click="goToDetail(item)">
              <div class="flex items-start justify-between gap-2 min-w-0">
                <!-- 左：タイトル＋メモ -->
                <div class="flex-1 min-w-0 flex flex-col justify-center min-h-10">
                  <p
                    class="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-hwhub-heading transition-colors"
                  >
                    {{ item.name }}
                  </p>
                  <p
                    v-if="item.memo"
                    class="mt-0.5 text-[11px] text-hwhub-muted leading-snug line-clamp-2 group-hover:text-hwhub-heading/70 transition-colors"
                  >
                    {{ item.memo }}
                  </p>
                </div>

                <!-- 右上：画像アイコン（あるときだけ） -->
                <div v-if="item.hasImage" class="shrink-0 ml-1 mt-0.5">
                  <span
                    class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-hwhub-surface-subtle text-[11px] text-hwhub-muted"
                  >
                    📷
                  </span>
                </div>

                <!-- 右：戻すボタン -->
                <div
                  class="flex flex-col justify-center items-end gap-1 shrink-0 min-h-10 min-w-14"
                >
                  <button
                    type="button"
                    class="px-3 py-1 text-[11px] rounded-full border border-gray-300 text-hwhub-heading hover:bg-hwhub-surface-subtle active:scale-95"
                    @click.stop="moveToNotPurchased(item)"
                  >
                    {{ t('shopping.list.actions.return') }}
                  </button>
                </div>
              </div>
            </div>
          </li>
        </TransitionGroup>
      </section>
    </div>

    <!-- 購入済み（折りたたみ） -->
    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <button
        type="button"
        class="flex w-full items-center justify-between text-sm font-semibold text-hwhub-heading"
        @click="showCompleted = !showCompleted"
      >
        <span>{{ t('shopping.list.completed.title') }}</span>
        <span class="text-xs text-hwhub-muted">
          {{ t('shopping.list.completed.count', { count: completedTotalCount }) }}
          <span v-if="completedGroups.length" class="text-[10px] text-hwhub-muted">
            {{ t('shopping.list.completed.daysLabel', { days: COMPLETED_DAYS }) }}）
          </span>
        </span>
      </button>

      <transition name="fade">
        <div v-if="showCompleted" class="mt-3 max-h-60 overflow-y-auto">
          <p v-if="completedGroups.length === 0" class="text-xs text-hwhub-muted">
            {{ t('shopping.list.completed.empty', { days: COMPLETED_DAYS }) }}
          </p>

          <div v-else class="space-y-2 text-sm">
            <div
              v-for="group in completedGroups"
              :key="group.date"
              class="rounded-lg border border-gray-200 bg-hwhub-surface-subtle p-2"
            >
              <!-- グループヘッダ（日付＋件数） -->
              <div class="flex items-center justify-between text-[11px] text-hwhub-muted mb-1">
                <span>{{ formatDateLabel(group.date) }}</span>
                <span>{{ t('common.itemCount', { count: group.items.length }) }}</span>
              </div>

              <!-- グループ内のアイテム -->
              <ul class="space-y-1 text-xs">
                <li
                  v-for="item in group.items"
                  :key="item.shoppingItemId"
                  class="flex justify-between items-start gap-2 border-b last:border-b-0 py-1 min-w-0"
                  @click="goToDetail(item)"
                >
                  <!-- 左側：名前（複数行OK・横幅は親まで） -->
                  <span class="flex-1 min-w-0 text-xs break-all text-hwhub-heading">
                    {{ item.name }}
                  </span>

                  <!-- 右側：購入場所バッジ（固定幅） -->
                  <span class="text-hwhub-muted shrink-0">
                    <span
                      class="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 text-[10px]"
                    >
                      {{ storeTypeLabel(item.storeType) }}
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { ShoppingItemModel } from '@/domain'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/householdStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import { useUiStore } from '@/stores/uiStore'
import { useCodeStore } from '@/stores/codeStore'
import HouseholdSwitcherField from '@/components/HouseholdSwitcherField.vue'
import { useShoppingCodes } from '@/composables/useShoppingCodes'
import { PURCHASE_LOCATION_TYPE, SHOPPING_ITEM_STATUS } from '@/constants/code.constants'
import { isWithinDays } from '@/utils/dateUtils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const householdStore = useHouseholdStore()
const shoppingStore = useShoppingStore()
const uiStore = useUiStore()
const codeStore = useCodeStore()
const { storeTypeLabel } = useShoppingCodes()

const showCompleted = ref(false)

const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)

// 状態別のリスト
const notPurchasedItems = computed<ShoppingItemModel[]>(() =>
  shoppingStore.notPurchased(currentHouseholdId.value),
)
const inBasketItems = computed<ShoppingItemModel[]>(() =>
  shoppingStore.inBasket(currentHouseholdId.value),
)
const completedItems = computed<ShoppingItemModel[]>(() =>
  shoppingStore.completed(currentHouseholdId.value),
)

onMounted(async () => {
  if (!currentHouseholdId.value) return
  try {
    await uiStore.withLoading(async () => {
      await codeStore.loadAllIfNeeded()
      await shoppingStore.fetchItems(currentHouseholdId.value!, { force: false })
    })
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.list.messages.fetchError'))
  }
})

// ★ お気に入りの切り替え
const toggleFavorite = async (item: ShoppingItemModel) => {
  if (!currentHouseholdId.value) return
  try {
    await shoppingStore.toggleFavorite(item.householdId, item.shoppingItemId)
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.list.messages.favoriteUpdateError'))
  }
}

// 未購入 → かごに移動
const moveToBasket = async (item: ShoppingItemModel) => {
  if (!currentHouseholdId.value) return
  try {
    await shoppingStore.updateStatus(
      item.householdId,
      item.shoppingItemId,
      SHOPPING_ITEM_STATUS.IN_BASKET,
    )
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.list.messages.statusUpdateError'))
  }
}

// かご → 未購入 に戻す
const moveToNotPurchased = async (item: ShoppingItemModel) => {
  if (!currentHouseholdId.value) return
  try {
    await shoppingStore.updateStatus(
      item.householdId,
      item.shoppingItemId,
      SHOPPING_ITEM_STATUS.NOT_PURCHASED,
    )
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.list.messages.statusUpdateError'))
  }
}

// 購入済みにまとめて移動
const onClickCompletePurchase = async () => {
  if (!currentHouseholdId.value) return
  const householdId = currentHouseholdId.value
  const target = [...inBasketItems.value]
  if (target.length === 0) return

  try {
    await uiStore.withLoading(async () => {
      for (const item of target) {
        await shoppingStore.updateStatus(
          item.householdId,
          item.shoppingItemId,
          SHOPPING_ITEM_STATUS.PURCHASED,
        )
      }
      shoppingStore.fetchItems(householdId, { force: true })
    })
    uiStore.showToast('success', t('shopping.list.messages.completeSuccess'))
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.list.messages.completeError'))
  }
}

const onClickAdd = () => {
  router.push('/shopping/new')
}

const goToDetail = (item: ShoppingItemModel) => {
  router.push(`/shopping/items/${item.shoppingItemId}`)
}

/**
 * 未購入リストのフィルタ関連
 */
const storeTypeFilter = ref<'all' | '1' | '2' | '3'>('all')

const filteredNotPurchasedItems = computed<ShoppingItemModel[]>(() => {
  const base = notPurchasedItems.value
  if (storeTypeFilter.value === 'all') return base
  return base.filter((item) => item.storeType === storeTypeFilter.value)
})

// 左ライン用クラスhelper
const storeTypeBorderClass = (code: string | null): string => {
  switch (code) {
    case PURCHASE_LOCATION_TYPE.SUPERMARKET:
      return 'border-hwhub-store-super'
    case PURCHASE_LOCATION_TYPE.ONLINE:
      return 'border-hwhub-store-online'
    case PURCHASE_LOCATION_TYPE.DRUGSTORE:
      return 'border-hwhub-store-drug'
    default:
      return ''
  }
}

// フィルタチップ用のラベル＋色（小さい丸）
const storeTypeDotClass = (code: '1' | '2' | '3'): string => {
  switch (code) {
    case '1':
      return 'bg-hwhub-store-super'
    case '2':
      return 'bg-hwhub-store-online'
    case '3':
      return 'bg-hwhub-store-drug'
  }
}

/**
 * 購入済みリスト関連
 */
// 購入済リストは7日分だけ表示
const COMPLETED_DAYS = 7

type CompletedGroup = {
  date: string // 'YYYY-MM-DD'
  items: ShoppingItemModel[]
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

const formatDateLabel = (dateStr: string): string => {
  // dateStr は 'YYYY-MM-DD' 想定
  const ymd = dateStr.substring(0, 10)
  const parts = ymd.split('-')

  // 想定外フォーマットのときはそのまま返す
  if (parts.length !== 3) {
    return dateStr
  }

  const [yStr, mStr, dStr] = parts
  const y = Number(yStr)
  const m = Number(mStr)
  const d = Number(dStr)

  // 数値化に失敗したときもそのまま返す
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return dateStr
  }

  const target = new Date(y, m - 1, d)

  const today = new Date()
  const todayYmd = today.toISOString().substring(0, 10)

  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const yesterdayYmd = yesterday.toISOString().substring(0, 10)

  if (ymd === todayYmd) return '今日'
  if (ymd === yesterdayYmd) return '昨日'

  const wd = WEEKDAYS[target.getDay()]
  return `${m}/${d}（${wd}）`
}

const completedGroups = computed<CompletedGroup[]>(() => {
  const map = new Map<string, ShoppingItemModel[]>()

  for (const item of completedItems.value) {
    const dateStr = item.purchasedAt
    if (!isWithinDays(dateStr, COMPLETED_DAYS)) continue
    if (!dateStr) continue

    const key = dateStr.substring(0, 10) // 念のため 'YYYY-MM-DD' に揃える
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }

  // 日付降順で並べる（新しい日付が上）
  const dates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a))

  return dates.map((date) => ({
    date,
    items: map.get(date) ?? [],
  }))
})

// 表示用の日付フォーマット（簡易版）
const completedTotalCount = computed(() =>
  completedGroups.value.reduce((sum, g) => sum + g.items.length, 0),
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 買い物リスト用：追加・削除・並び替えアニメーション */
.shopping-list-enter-active,
.shopping-list-leave-active {
  transition: all 0.18s ease;
}
.shopping-list-enter-from,
.shopping-list-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
.shopping-list-move {
  transition: transform 0.18s ease;
}

/* -------- 🎨 移動アニメーション -------- */
.shopping-move-list-move {
  transition: transform 0.25s ease;
}

/* 消える（remove）時のアニメ */
.shopping-move-list-leave-active {
  transition: all 0.25s ease;
}
.shopping-move-list-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.shopping-move-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 出現（enter）時のアニメ */
.shopping-move-list-enter-active {
  transition: all 0.25s ease;
}
.shopping-move-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.shopping-move-list-enter-to {
  opacity: 1;
  transform: translateX(0);
}
</style>
