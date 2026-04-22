<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAdminHouseworkTemplateStore } from '@/stores/adminHouseworkTemplateStore'
import { useCodeStore } from '@/stores/codeStore'
import { useHouseworkCodes } from '@/composables/useHouseworkCodes'
import { useHouseworkTemplate } from '@/composables/useHouseworkTemplate'
import { usePagination } from '@/composables/usePagination'
import { useSortable } from '@/composables/useSortable'
import { weeklyDaysMaskToLabel } from '@/utils/weeklyDaysLabel'
import { RECURRENCE_TYPE, CATEGORY } from '@/constants/code.constants'
import type { AdminHouseworkTemplateModel, HouseworkTemplateModel } from '@/domain'
import ListPagination from '@/components/ui/ListPagination.vue'
import { ArrowUpDown, ArrowUp, ArrowDown, Lightbulb } from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const templateStore = useAdminHouseworkTemplateStore()
const codeStore = useCodeStore()
const { recurrenceTypeLabel, categoryLabel, weekdayLabel, nthWeekLabel, categoryOptions } =
  useHouseworkCodes()
const { getLocalizedName } = useHouseworkTemplate()

const filterCategory = ref<string | 'ALL'>('ALL')

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
  await templateStore.loadAll()
})

const buildRecurrenceSummary = (item: AdminHouseworkTemplateModel): string => {
  const type = item.recurrenceType

  if (type === RECURRENCE_TYPE.WEEKLY) {
    const days = item.weeklyDays != null ? weeklyDaysMaskToLabel(item.weeklyDays, locale.value) : ''
    if (!days) return t('housework.recurrence.weekly')
    return t('housework.recurrence.weeklyWithDays', { days })
  }

  if (type === RECURRENCE_TYPE.MONTHLY) {
    if (item.dayOfMonth === 31) return t('housework.recurrence.monthlyLastDay')
    if (item.dayOfMonth != null)
      return t('housework.recurrence.monthlyWithDay', { day: item.dayOfMonth })
    return t('housework.recurrence.monthly')
  }

  if (type === RECURRENCE_TYPE.NTH_WEEKDAY) {
    const nth = nthWeekLabel(item.nthWeek)
    const wd = weekdayLabel(item.weekday)
    if (nth && wd) return t('housework.recurrence.nthWeekday', { nth, weekday: wd })
    return t('housework.recurrence.nthWeekdayPlain')
  }

  return recurrenceTypeLabel(type)
}

interface TemplateViewItem extends AdminHouseworkTemplateModel {
  localizedName: string
  categoryLabel: string
  recurrenceSummary: string
}

const viewItems = computed<TemplateViewItem[]>(() =>
  templateStore.items.map((item) => ({
    ...item,
    localizedName: getLocalizedName(item as unknown as HouseworkTemplateModel),
    categoryLabel: categoryLabel(item.category),
    recurrenceSummary: buildRecurrenceSummary(item),
  })),
)

const filteredItems = computed(() => {
  if (filterCategory.value === 'ALL') return viewItems.value
  return viewItems.value.filter((item) => item.category === filterCategory.value)
})

const totalCount = computed(() => viewItems.value.length)

const hasRecommendation = (item: AdminHouseworkTemplateModel) =>
  !!(item.recommendationJa || item.recommendationEn || item.recommendationEs)

// --- PC版: ソート → ページング ---
const {
  sortKey,
  sortOrder,
  sortedItems: pcSortedItems,
  toggleSort,
} = useSortable<TemplateViewItem>(filteredItems, null)

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

const getSortIcon = (key: keyof TemplateViewItem) => {
  if (sortKey.value !== key) return ArrowUpDown
  return sortOrder.value === 'asc' ? ArrowUp : ArrowDown
}

const goEdit = (id: number) => {
  router.push({ name: 'admin.houseworkTemplates.edit', params: { id } })
}

const goCreate = () => {
  router.push({ name: 'admin.houseworkTemplates.new' })
}

const categoryColorClass = (category: string | null | undefined): string => {
  switch (category) {
    case CATEGORY.CLEAN:
      return 'bg-blue-50 text-blue-600'
    case CATEGORY.KITCHEN:
      return 'bg-orange-50 text-orange-600'
    case CATEGORY.GARDEN:
      return 'bg-cyan-50 text-cyan-600'
    case CATEGORY.GARBAGE:
      return 'bg-emerald-50 text-emerald-600'
    case CATEGORY.PET:
      return 'bg-purple-50 text-purple-600'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="sr-only">{{ t('admin.sections.houseworkTemplate.title') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('admin.sections.houseworkTemplate.subtitle') }}</p>
      </div>

      <button
        type="button"
        class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
        @click="goCreate"
      >
        {{ t('admin.houseworkTemplate.createButton') }}
      </button>
    </header>

    <!-- SP 用追加ボタン -->
    <div class="sm:hidden">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        @click="goCreate"
      >
        {{ t('admin.houseworkTemplate.createButton') }}
      </button>
    </div>

    <!-- カード：フィルタ + 一覧 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <!-- 上部バー：件数 + フィルタ -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs text-hwhub-muted">
          {{ t('housework.list.totalPrefix') }}
          <span class="font-semibold text-hwhub-heading">{{ totalCount }}</span>
          {{ t('housework.list.totalUnit') }}
        </p>

        <!-- カテゴリフィルタ -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-hwhub-muted">{{ t('housework.list.filter.categoryLabel') }}</span>
          <select
            v-model="filterCategory"
            class="rounded-md border border-hwhub-border px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
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
        <p v-if="filteredItems.length > 0" class="mb-2 text-[11px] text-hwhub-muted">
          {{
            t('housework.list.pagination.showing', {
              start: pcStartIndex,
              end: pcEndIndex,
              total: filteredItems.length,
            })
          }}
        </p>

        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-hwhub-border bg-hwhub-surface-subtle">
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                @click="toggleSort('localizedName')"
              >
                <div class="flex items-center gap-1">
                  <span>{{ t('admin.houseworkTemplate.columns.name') }}</span>
                  <component
                    :is="getSortIcon('localizedName')"
                    class="w-3 h-3 transition-colors"
                    :class="
                      sortKey === 'localizedName'
                        ? 'text-hwhub-primary'
                        : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                    "
                  />
                </div>
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                @click="toggleSort('categoryLabel')"
              >
                <div class="flex items-center gap-1">
                  <span>{{ t('housework.list.columns.category') }}</span>
                  <component
                    :is="getSortIcon('categoryLabel')"
                    class="w-3 h-3 transition-colors"
                    :class="
                      sortKey === 'categoryLabel'
                        ? 'text-hwhub-primary'
                        : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                    "
                  />
                </div>
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                @click="toggleSort('recurrenceSummary')"
              >
                <div class="flex items-center gap-1">
                  <span>{{ t('housework.list.columns.recurrenceType') }}</span>
                  <component
                    :is="getSortIcon('recurrenceSummary')"
                    class="w-3 h-3 transition-colors"
                    :class="
                      sortKey === 'recurrenceSummary'
                        ? 'text-hwhub-primary'
                        : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                    "
                  />
                </div>
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('admin.houseworkTemplate.columns.recommendation') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pcPagedItems"
              :key="item.houseworkTemplateId"
              class="border-b border-hwhub-border hover:bg-hwhub-surface-subtle cursor-pointer"
              @click="goEdit(item.houseworkTemplateId)"
            >
              <!-- 家��名 -->
              <td class="px-3 py-2 align-top">
                <span class="text-sm font-medium text-hwhub-heading truncate">
                  {{ item.localizedName }}
                </span>
              </td>

              <!-- カテゴリ -->
              <td class="px-3 py-2 align-top">
                <span
                  v-if="item.categoryLabel"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"
                  :class="categoryColorClass(item.category)"
                >
                  {{ item.categoryLabel }}
                </span>
              </td>

              <!-- 周期 -->
              <td class="px-3 py-2 align-top">
                <span class="text-xs text-hwhub-heading">{{ item.recurrenceSummary }}</span>
              </td>

              <!-- recommendation バッジ -->
              <td class="px-3 py-2 align-top">
                <span
                  v-if="hasRecommendation(item)"
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] bg-amber-50 text-amber-600"
                >
                  <Lightbulb class="w-3 h-3" />
                  {{ t('admin.houseworkTemplate.columns.recommendationYes') }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredItems.length === 0">
              <td colspan="4" class="px-3 py-6 text-center text-xs text-hwhub-muted">
                {{ t('housework.list.empty') }}
              </td>
            </tr>
          </tbody>
        </table>

        <ListPagination v-model:current-page="pcCurrentPage" :total-pages="pcTotalPages" />
      </div>

      <!-- ============================================================
           SP版：カード表示（ページングのみ）
           ============================================================ -->
      <div class="mt-2 space-y-2 md:hidden">
        <button
          v-for="item in spPagedItems"
          :key="item.houseworkTemplateId"
          type="button"
          class="w-full text-left rounded-xl border border-hwhub-border bg-white px-3 py-2 shadow-sm hover:bg-hwhub-surface-subtle active:bg-hwhub-surface-subtle transition"
          @click="goEdit(item.houseworkTemplateId)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-hwhub-heading truncate">
                {{ item.localizedName }}
              </p>
              <p class="mt-1 text-xs text-hwhub-muted">{{ item.recurrenceSummary }}</p>
            </div>
            <span
              v-if="item.categoryLabel"
              class="ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px]"
              :class="categoryColorClass(item.category)"
            >
              {{ item.categoryLabel }}
            </span>
          </div>
          <div class="mt-1.5 flex items-center gap-1 text-[11px]">
            <span
              v-if="hasRecommendation(item)"
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-amber-50 text-amber-600"
            >
              <Lightbulb class="w-3 h-3" />
              {{ t('admin.houseworkTemplate.columns.recommendationYes') }}
            </span>
          </div>
        </button>

        <p v-if="filteredItems.length === 0" class="py-6 text-center text-xs text-hwhub-muted">
          {{ t('housework.list.sp.empty') }}
        </p>

        <ListPagination v-model:current-page="spCurrentPage" :total-pages="spTotalPages" />
      </div>
    </section>
  </div>
</template>
