<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHouseworkStore } from '@/stores/houseworkStore'
import { useCodeStore } from '@/stores/codeStore'
import { useHouseholdStore } from '@/stores/householdStore'
import { weeklyDaysMaskToLabel } from '@/utils/weeklyDaysLabel'
import type { Housework } from '@/domain'
import HouseholdSwitcherField from '@/components/HouseholdSwitcherField.vue'
import ListPagination from '@/components/ui/ListPagination.vue'
import { useHouseworkCodes } from '@/composables/useHouseworkCodes'
import { usePagination } from '@/composables/usePagination'
import { useSortable } from '@/composables/useSortable'
import { RECURRENCE_TYPE } from '@/constants/code.constants'

const { t, locale } = useI18n()
const router = useRouter()
const houseworkStore = useHouseworkStore()
const codeStore = useCodeStore()
const householdStore = useHouseholdStore()
const { recurrenceTypeLabel, categoryLabel, weekdayLabel, nthWeekLabel, categoryOptions } =
  useHouseworkCodes()

const filterCategory = ref<string | 'ALL'>('ALL')

// 世帯が変わったら一覧を再取得
watch(
  () => householdStore.currentHouseholdId,
  async (newId) => {
    if (!newId) {
      houseworkStore.clear()
      return
    }
    await houseworkStore.loadAll()
  },
  { immediate: true },
)

onMounted(async () => {
  await codeStore.loadAllIfNeeded()

  if (householdStore.currentHouseholdId) {
    // この画面は毎回メンバーを強制再取得
    await householdStore.fetchMembers(householdStore.currentHouseholdId, { force: true })
  }
})

const getNickName = (userId: number | null) => {
  if (!userId) return ''
  const member = householdStore.currentAllMembers.find((u) => u.userId == userId)
  return member?.nickname
}

// 曜日 bitmask → ラベル
const weeklyDaysLabel = (mask: number | null): string => {
  if (mask == null) return ''
  return weeklyDaysMaskToLabel(mask, locale.value)
}

// recurrence_type + 各カラム → ロケール別・ユーザ向け1行表示
const buildRecurrenceSummary = (hw: Housework): string => {
  const type = hw.recurrenceType

  // 1: Weekly
  if (type === RECURRENCE_TYPE.WEEKLY) {
    const days = weeklyDaysLabel(hw.weeklyDays)
    if (!days) {
      return t('housework.recurrence.weekly')
    }
    return t('housework.recurrence.weeklyWithDays', { days })
  }

  // 2: Monthly（日付 / 月末）
  if (type === RECURRENCE_TYPE.MONTHLY) {
    const opt = hw.dayOfMonth ?? null

    if (opt === 31) {
      return t('housework.recurrence.monthlyLastDay')
    }

    if (opt != null) {
      return t('housework.recurrence.monthlyWithDay', { day: opt })
    }

    return t('housework.recurrence.monthly')
  }

  // 3: NthWeekday（nthWeek + weekday）
  if (type === RECURRENCE_TYPE.NTH_WEEKDAY) {
    const nth = nthWeekLabel(hw.nthWeek)
    const wd = weekdayLabel(hw.weekday)

    if (nth && wd) {
      return t('housework.recurrence.nthWeekday', { nth, weekday: wd })
    }

    return t('housework.recurrence.nthWeekdayPlain')
  }

  // 想定外の場合はコードラベルのみ
  return recurrenceTypeLabel(type)
}

// 表示用 view item 型
interface HouseworkViewItem extends Housework {
  categoryLabel: string
  recurrenceSummary: string
  defaultAssigneeLabel: string
}

// 表示用に加工
const viewItems = computed<HouseworkViewItem[]>(() =>
  houseworkStore.items.map((hw: Housework) => ({
    ...hw,
    categoryLabel: categoryLabel(hw.category),
    recurrenceSummary: buildRecurrenceSummary(hw),
    defaultAssigneeLabel: getNickName(hw.defaultAssigneeUserId) || '',
  })),
)

// フィルタ適用後
const filteredItems = computed(() => {
  if (filterCategory.value === 'ALL') return viewItems.value
  return viewItems.value.filter((hw) => hw.category === filterCategory.value)
})

const totalCount = computed(() => viewItems.value.length)

// --- PC版: ソート → ページング ---
const {
  sortKey,
  sortOrder,
  sortedItems: pcSortedItems,
  toggleSort,
} = useSortable<HouseworkViewItem>(filteredItems, null)

const {
  pagedItems: pcPagedItems,
  currentPage: pcCurrentPage,
  totalPages: pcTotalPages,
  startIndex: pcStartIndex,
  endIndex: pcEndIndex,
} = usePagination(pcSortedItems, 10)

// --- SP版: ページングのみ ---
const {
  pagedItems: spPagedItems,
  currentPage: spCurrentPage,
  totalPages: spTotalPages,
} = usePagination(filteredItems, 10)

// ソートインジケータ
const sortIcon = (key: keyof HouseworkViewItem) => {
  if (sortKey.value !== key) return ''
  return sortOrder.value === 'asc' ? '▲' : '▼'
}

const goEdit = (id: number) => {
  router.push({ name: 'settings.housework.edit', params: { houseworkId: id } })
}

const goCreate = () => {
  router.push({ name: 'settings.housework.new' })
}
</script>

<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="sr-only">{{ t('housework.list.title') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('housework.list.description') }}</p>
      </div>

      <button
        type="button"
        class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="goCreate"
      >
        {{ t('housework.list.addButtonLabel') }}
      </button>
    </header>

    <!-- 👇 SP 専用 世帯スイッチャー -->
    <HouseholdSwitcherField class="sm:hidden" />

    <!-- SP 用追加ボタン -->
    <div class="sm:hidden">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="goCreate"
      >
        {{ t('housework.list.addButtonLabel') }}
      </button>
    </div>

    <!-- カード：フィルタ + 一覧 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <!-- 上部バー：件数 + フィルタ -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs text-hwhub-muted">
          {{ t('housework.list.totalPrefix') }}
          <span class="font-semibold text-hwhub-heading">
            {{ totalCount }}
          </span>
          {{ t('housework.list.totalUnit') }}
        </p>

        <!-- カテゴリフィルタ -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-hwhub-muted">{{ t('housework.list.filter.categoryLabel') }}</span>
          <select
            v-model="filterCategory"
            class="rounded-md border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option value="ALL">{{ t('housework.list.filter.categoryAll') }}</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- ============================================================
           PC版：テーブル表示（ソート + ページング）
           ============================================================ -->
      <div class="mt-2 overflow-x-auto hidden md:block">
        <!-- 表示件数 -->
        <p v-if="filteredItems.length > 0" class="mb-2 text-[11px] text-hwhub-muted">
          {{ t('housework.list.pagination.showing', { start: pcStartIndex, end: pcEndIndex, total: filteredItems.length }) }}
        </p>

        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-hwhub-surface-subtle">
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none hover:text-hwhub-heading transition-colors"
                @click="toggleSort('name')"
              >
                {{ t('housework.list.columns.name') }}
                <span class="ml-0.5 text-[10px] text-hwhub-primary">{{ sortIcon('name') }}</span>
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none hover:text-hwhub-heading transition-colors"
                @click="toggleSort('categoryLabel')"
              >
                {{ t('housework.list.columns.category') }}
                <span class="ml-0.5 text-[10px] text-hwhub-primary">{{ sortIcon('categoryLabel') }}</span>
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none hover:text-hwhub-heading transition-colors"
                @click="toggleSort('recurrenceSummary')"
              >
                {{ t('housework.list.columns.recurrenceType') }}
                <span class="ml-0.5 text-[10px] text-hwhub-primary">{{ sortIcon('recurrenceSummary') }}</span>
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none hover:text-hwhub-heading transition-colors"
                @click="toggleSort('defaultAssigneeLabel')"
              >
                {{ t('housework.list.columns.defaultAssignee') }}
                <span class="ml-0.5 text-[10px] text-hwhub-primary">{{ sortIcon('defaultAssigneeLabel') }}</span>
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none hover:text-hwhub-heading transition-colors"
                @click="toggleSort('startDate')"
              >
                {{ t('housework.list.columns.activePeriod') }}
                <span class="ml-0.5 text-[10px] text-hwhub-primary">{{ sortIcon('startDate') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="hw in pcPagedItems"
              :key="hw.houseworkId"
              class="border-b border-gray-100 hover:bg-hwhub-surface-subtle cursor-pointer"
              @click="goEdit(hw.houseworkId)"
            >
              <!-- 家事名 -->
              <td class="px-3 py-2 align-top">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-hwhub-heading truncate">
                    {{ hw.name }}
                  </span>
                </div>
              </td>

              <!-- カテゴリ -->
              <td class="px-3 py-2 align-top">
                <span
                  v-if="hw.categoryLabel"
                  class="inline-flex items-center rounded-full bg-hwhub-surface-subtle px-2 py-0.5 text-[11px] text-hwhub-heading"
                >
                  {{ hw.categoryLabel }}
                </span>
              </td>

              <!-- 周期 -->
              <td class="px-3 py-2 align-top">
                <span class="text-xs text-hwhub-heading">
                  {{ hw.recurrenceSummary }}
                </span>
              </td>

              <!-- デフォルト担当者 -->
              <td class="px-3 py-2 align-top">
                <div class="flex flex-col text-xs text-hwhub-heading">
                  <span>{{ hw.defaultAssigneeLabel }}</span>
                </div>
              </td>

              <!-- 有効期間 -->
              <td class="px-3 py-2 align-top">
                <div class="flex flex-col text-xs text-hwhub-heading">
                  <span>{{ hw.startDate }} 〜 {{ hw.endDate }}</span>
                </div>
              </td>
            </tr>

            <tr v-if="filteredItems.length === 0">
              <td colspan="5" class="px-3 py-6 text-center text-xs text-hwhub-muted">
                {{ t('housework.list.empty') }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- ページネーション（PC版） -->
        <ListPagination
          v-model:current-page="pcCurrentPage"
          :total-pages="pcTotalPages"
        />
      </div>

      <!-- ============================================================
           SP版：カード表示（ページングのみ）
           ============================================================ -->
      <div class="mt-2 space-y-2 md:hidden">
        <button
          v-for="hw in spPagedItems"
          :key="hw.houseworkId"
          type="button"
          class="w-full text-left rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm hover:bg-hwhub-surface-subtle active:bg-hwhub-surface-subtle transition"
          @click="goEdit(hw.houseworkId)"
        >
          <!-- 上段：名前 + カテゴリチップ -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-hwhub-heading truncate">
                {{ hw.name }}
              </p>
              <p class="mt-1 text-xs text-hwhub-muted">
                {{ hw.recurrenceSummary }}
              </p>
            </div>

            <span
              v-if="hw.categoryLabel"
              class="ml-2 inline-flex shrink-0 items-center rounded-full bg-hwhub-surface-subtle px-2 py-0.5 text-[11px] text-hwhub-heading"
            >
              {{ hw.categoryLabel }}
            </span>
          </div>

          <!-- 下段：担当者 + 期間 -->
          <div
            class="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-hwhub-muted"
          >
            <span>
              {{ t('housework.list.sp.defaultAssigneeLabel') }}
              <span class="font-medium text-hwhub-heading">
                {{
                  getNickName(hw.defaultAssigneeUserId) ||
                  t('housework.list.sp.defaultAssigneeUnset')
                }}
              </span>
            </span>
            <span> {{ hw.startDate }} 〜 {{ hw.endDate }} </span>
          </div>
        </button>

        <p v-if="filteredItems.length === 0" class="py-6 text-center text-xs text-hwhub-muted">
          {{ t('housework.list.sp.empty') }}
        </p>

        <!-- ページネーション（SP版） -->
        <ListPagination
          v-model:current-page="spCurrentPage"
          :total-pages="spTotalPages"
        />
      </div>
    </section>
  </div>
</template>
