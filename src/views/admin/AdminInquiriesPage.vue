<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { useAdminInquiryStore } from '@/stores/adminInquiryStore'
import { useCodeStore } from '@/stores/codeStore'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import { useCodes } from '@/composables/useCodes'
import { useSortable } from '@/composables/useSortable'
import { usePagination } from '@/composables/usePagination'
import ListPagination from '@/components/ui/ListPagination.vue'
import { CODE_TYPE, INQUIRY_CATEGORY, INQUIRY_STATUS } from '@/constants/code.constants'
import type { AdminInquiryModel } from '@/domain'

const { t } = useI18n()
const router = useRouter()
const adminInquiryStore = useAdminInquiryStore()
const codeStore = useCodeStore()
const { categoryLabel, statusLabel } = useInquiryCodes()
const { optionsOf } = useCodes()

const categoryOptions = optionsOf(CODE_TYPE.INQUIRY_CATEGORY)
const statusOptions = optionsOf(CODE_TYPE.INQUIRY_STATUS)

// ---- View Item 型 ----
interface AdminInquiryViewItem extends AdminInquiryModel {
  categoryLabel: string
  statusLabel: string
  createdAtFormatted: string
  updatedAtFormatted: string
  messageSummary: string
}

// ---- タブ状態 ----
const activeTab = ref<'pending' | 'search'>('pending')
const hasSearched = ref(false)

const searchForm = ref({
  createdAtFrom: '',
  createdAtTo: '',
  updatedAtFrom: '',
  updatedAtTo: '',
  userId: undefined as number | undefined,
  category: '',
  status: '',
})

const handleTabChange = (tab: 'pending' | 'search') => {
  activeTab.value = tab
  adminInquiryStore.setActiveTab(tab)
}

// ---- ヘルパー ----
const formatDateTime = (date: Date): string => {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${y}/${mo}/${d} ${hh}:${mi}`
}

const toViewItem = (item: AdminInquiryModel): AdminInquiryViewItem => ({
  ...item,
  categoryLabel: categoryLabel(item.category),
  statusLabel: statusLabel(item.status),
  createdAtFormatted: formatDateTime(item.createdAt),
  updatedAtFormatted: formatDateTime(item.updatedAt),
  messageSummary: `${item.totalMessageCount}件 (U:${item.userMessageCount}/A:${item.aiMessageCount}/S:${item.staffMessageCount})`,
})

// ---- 対応待ちタブ: ソート + ページング ----
const pendingViewItems = computed<AdminInquiryViewItem[]>(() =>
  adminInquiryStore.pendingItems.map(toViewItem),
)

const {
  sortKey: pendingSortKey,
  sortOrder: pendingSortOrder,
  sortedItems: pendingSortedItems,
  toggleSort: pendingToggleSort,
} = useSortable<AdminInquiryViewItem>(pendingViewItems, 'createdAt', 'asc')

const {
  pagedItems: pendingPcPagedItems,
  currentPage: pendingPcCurrentPage,
  totalPages: pendingPcTotalPages,
  startIndex: pendingPcStartIndex,
  endIndex: pendingPcEndIndex,
} = usePagination(pendingSortedItems, 20)

const {
  pagedItems: pendingSpPagedItems,
  currentPage: pendingSpCurrentPage,
  totalPages: pendingSpTotalPages,
} = usePagination(pendingViewItems, 20)

const getPendingSortIcon = (key: keyof AdminInquiryViewItem) => {
  if (pendingSortKey.value !== key) return ArrowUpDown
  return pendingSortOrder.value === 'asc' ? ArrowUp : ArrowDown
}

// ---- 全件検索タブ: ソート + ページング ----
const searchViewItems = computed<AdminInquiryViewItem[]>(() =>
  adminInquiryStore.searchResults.map(toViewItem),
)

const {
  sortKey: searchSortKey,
  sortOrder: searchSortOrder,
  sortedItems: searchSortedItems,
  toggleSort: searchToggleSort,
} = useSortable<AdminInquiryViewItem>(searchViewItems, 'createdAt', 'desc')

const {
  pagedItems: searchPcPagedItems,
  currentPage: searchPcCurrentPage,
  totalPages: searchPcTotalPages,
  startIndex: searchPcStartIndex,
  endIndex: searchPcEndIndex,
} = usePagination(searchSortedItems, 20)

const {
  pagedItems: searchSpPagedItems,
  currentPage: searchSpCurrentPage,
  totalPages: searchSpTotalPages,
} = usePagination(searchViewItems, 20)

const getSearchSortIcon = (key: keyof AdminInquiryViewItem) => {
  if (searchSortKey.value !== key) return ArrowUpDown
  return searchSortOrder.value === 'asc' ? ArrowUp : ArrowDown
}

// ---- onMounted: タブ・検索条件の復元 ----
onMounted(async () => {
  await codeStore.loadAllIfNeeded()

  activeTab.value = adminInquiryStore.activeTab

  if (adminInquiryStore.activeTab === 'pending') {
    await adminInquiryStore.loadPending()
  } else {
    if (adminInquiryStore.lastSearchParams) {
      const p = adminInquiryStore.lastSearchParams
      searchForm.value.createdAtFrom = p.createdAtFrom ?? ''
      searchForm.value.createdAtTo = p.createdAtTo ?? ''
      searchForm.value.updatedAtFrom = p.updatedAtFrom ?? ''
      searchForm.value.updatedAtTo = p.updatedAtTo ?? ''
      searchForm.value.userId = p.userId
      searchForm.value.category = p.category ?? ''
      searchForm.value.status = p.status ?? ''
      hasSearched.value = true
    }
  }
})

// ---- 検索 ----
const handleSearch = async () => {
  const params = {
    createdAtFrom: searchForm.value.createdAtFrom || undefined,
    createdAtTo: searchForm.value.createdAtTo || undefined,
    updatedAtFrom: searchForm.value.updatedAtFrom || undefined,
    updatedAtTo: searchForm.value.updatedAtTo || undefined,
    userId: searchForm.value.userId || undefined,
    category: searchForm.value.category || undefined,
    status: searchForm.value.status || undefined,
  }
  adminInquiryStore.saveSearchParams(params)
  await adminInquiryStore.search(params)
  hasSearched.value = true
}

// ---- バッジ色 ----
const categoryColorClass = (category: string): string => {
  switch (category) {
    case INQUIRY_CATEGORY.GENERAL:
      return 'bg-slate-100 text-slate-600'
    case INQUIRY_CATEGORY.HOUSEWORK:
      return 'bg-amber-100 text-amber-600'
    case INQUIRY_CATEGORY.SHOPPING:
      return 'bg-emerald-100 text-emerald-600'
    case INQUIRY_CATEGORY.ACCOUNT:
      return 'bg-blue-100 text-blue-600'
    case INQUIRY_CATEGORY.BUG:
      return 'bg-rose-100 text-rose-600'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}

const statusColorClass = (status: string): string => {
  switch (status) {
    case INQUIRY_STATUS.OPEN:
      return 'bg-blue-100 text-blue-600'
    case INQUIRY_STATUS.AI_ANSWERED:
      return 'bg-violet-100 text-violet-600'
    case INQUIRY_STATUS.PENDING_STAFF:
      return 'bg-amber-100 text-amber-600'
    case INQUIRY_STATUS.STAFF_ANSWERED:
      return 'bg-emerald-100 text-emerald-600'
    case INQUIRY_STATUS.CLOSED:
      return 'bg-slate-100 text-slate-500'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}

const statusWithCode = (code: string): string => `${code}: ${statusLabel(code)}`

const rowBgClass = (status: string): string => {
  switch (status) {
    case INQUIRY_STATUS.OPEN:
      return 'bg-white'
    case INQUIRY_STATUS.AI_ANSWERED:
      return 'bg-violet-50'
    case INQUIRY_STATUS.PENDING_STAFF:
      return 'bg-amber-50'
    case INQUIRY_STATUS.STAFF_ANSWERED:
      return 'bg-emerald-50'
    case INQUIRY_STATUS.CLOSED:
      return 'bg-slate-100'
    default:
      return 'bg-white'
  }
}

const goDetail = (inquiryId: number) => {
  router.push({ name: 'admin.inquiries.detail', params: { inquiryId } })
}
</script>

<template>
  <div class="space-y-4">
    <!-- タブ -->
    <div class="flex gap-2 border-b border-hwhub-border">
      <button
        class="pb-2 px-1 text-sm font-medium transition-colors"
        :class="
          activeTab === 'pending'
            ? 'border-b-2 border-hwhub-primary text-hwhub-primary'
            : 'text-hwhub-muted hover:text-hwhub-heading'
        "
        @click="handleTabChange('pending')"
      >
        {{ t('admin.inquiries.tabs.pending') }}
      </button>
      <button
        class="pb-2 px-1 text-sm font-medium transition-colors"
        :class="
          activeTab === 'search'
            ? 'border-b-2 border-hwhub-primary text-hwhub-primary'
            : 'text-hwhub-muted hover:text-hwhub-heading'
        "
        @click="handleTabChange('search')"
      >
        {{ t('admin.inquiries.tabs.search') }}
      </button>
    </div>

    <!-- ============================================================
         タブ①: 対応待ち
         ============================================================ -->
    <template v-if="activeTab === 'pending'">
      <div
        v-if="adminInquiryStore.isLoadingPending"
        class="text-sm text-hwhub-muted text-center py-8"
      >
        {{ t('common.loading') }}
      </div>

      <section v-else class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <!-- PC版: テーブル + ソート + ページング -->
        <div class="hidden md:block overflow-x-auto">
          <p v-if="pendingViewItems.length > 0" class="mb-2 text-[11px] text-hwhub-muted">
            {{
              t('admin.inquiries.pagination.showing', {
                start: pendingPcStartIndex,
                end: pendingPcEndIndex,
                total: pendingViewItems.length,
              })
            }}
          </p>

          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-hwhub-border bg-hwhub-surface-subtle">
                <!-- #ID / 件名 -->
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                  @click="pendingToggleSort('inquiryId')"
                >
                  <div class="flex items-center gap-1">
                    <span>{{ t('admin.inquiries.columns.id') }}</span>
                    <component
                      :is="getPendingSortIcon('inquiryId')"
                      class="w-3 h-3 transition-colors"
                      :class="
                        pendingSortKey === 'inquiryId'
                          ? 'text-hwhub-primary'
                          : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                      "
                    />
                  </div>
                </th>
                <!-- ユーザー -->
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                  @click="pendingToggleSort('userDisplayName')"
                >
                  <div class="flex items-center gap-1">
                    <span>{{ t('admin.inquiries.columns.user') }}</span>
                    <component
                      :is="getPendingSortIcon('userDisplayName')"
                      class="w-3 h-3 transition-colors"
                      :class="
                        pendingSortKey === 'userDisplayName'
                          ? 'text-hwhub-primary'
                          : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                      "
                    />
                  </div>
                </th>
                <!-- カテゴリ -->
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                  @click="pendingToggleSort('categoryLabel')"
                >
                  <div class="flex items-center gap-1">
                    <span>{{ t('admin.inquiries.columns.category') }}</span>
                    <component
                      :is="getPendingSortIcon('categoryLabel')"
                      class="w-3 h-3 transition-colors"
                      :class="
                        pendingSortKey === 'categoryLabel'
                          ? 'text-hwhub-primary'
                          : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                      "
                    />
                  </div>
                </th>
                <!-- メッセージ数 -->
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                  @click="pendingToggleSort('totalMessageCount')"
                >
                  <div class="flex items-center gap-1">
                    <span>{{ t('admin.inquiries.columns.messages') }}</span>
                    <component
                      :is="getPendingSortIcon('totalMessageCount')"
                      class="w-3 h-3 transition-colors"
                      :class="
                        pendingSortKey === 'totalMessageCount'
                          ? 'text-hwhub-primary'
                          : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                      "
                    />
                  </div>
                </th>
                <!-- 作成日時 -->
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                  @click="pendingToggleSort('createdAt')"
                >
                  <div class="flex items-center gap-1">
                    <span>{{ t('admin.inquiries.columns.createdAt') }}</span>
                    <component
                      :is="getPendingSortIcon('createdAt')"
                      class="w-3 h-3 transition-colors"
                      :class="
                        pendingSortKey === 'createdAt'
                          ? 'text-hwhub-primary'
                          : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                      "
                    />
                  </div>
                </th>
                <!-- 更新日時 -->
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                  @click="pendingToggleSort('updatedAt')"
                >
                  <div class="flex items-center gap-1">
                    <span>{{ t('admin.inquiries.columns.updatedAt') }}</span>
                    <component
                      :is="getPendingSortIcon('updatedAt')"
                      class="w-3 h-3 transition-colors"
                      :class="
                        pendingSortKey === 'updatedAt'
                          ? 'text-hwhub-primary'
                          : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                      "
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in pendingPcPagedItems"
                :key="item.inquiryId"
                class="border-b border-hwhub-border cursor-pointer transition-colors hover:bg-hwhub-surface-subtle"
                @click="goDetail(item.inquiryId)"
              >
                <td class="px-3 py-2 align-top">
                  <div class="flex flex-col text-xs">
                    <span class="text-hwhub-muted">#{{ item.inquiryId }}</span>
                    <span class="font-medium text-hwhub-heading truncate max-w-[200px]">
                      {{ item.title }}
                    </span>
                  </div>
                </td>
                <td class="px-3 py-2 align-top">
                  <div class="flex flex-col text-xs">
                    <span class="text-hwhub-heading">{{ item.userDisplayName }}</span>
                    <span class="text-hwhub-muted">{{ item.userEmail }}</span>
                  </div>
                </td>
                <td class="px-3 py-2 align-top">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                    :class="categoryColorClass(item.category)"
                  >
                    {{ item.categoryLabel }}
                  </span>
                </td>
                <td class="px-3 py-2 align-top text-xs text-hwhub-heading">
                  {{ item.messageSummary }}
                </td>
                <td class="px-3 py-2 align-top text-xs text-hwhub-heading">
                  {{ item.createdAtFormatted }}
                </td>
                <td class="px-3 py-2 align-top text-xs text-hwhub-heading">
                  {{ item.updatedAtFormatted }}
                </td>
              </tr>

              <tr v-if="pendingViewItems.length === 0">
                <td colspan="6" class="px-3 py-6 text-center text-xs text-hwhub-muted">
                  {{ t('admin.inquiries.pending.empty') }}
                </td>
              </tr>
            </tbody>
          </table>

          <ListPagination
            v-model:current-page="pendingPcCurrentPage"
            :total-pages="pendingPcTotalPages"
          />
        </div>

        <!-- SP版: カード + ページングのみ -->
        <div class="mt-2 space-y-2 md:hidden">
          <div
            v-for="item in pendingSpPagedItems"
            :key="item.inquiryId"
            class="rounded-xl border border-hwhub-border bg-white px-3 py-2 shadow-sm space-y-1"
          >
            <p class="text-sm font-medium text-hwhub-heading">
              #{{ item.inquiryId }}: {{ item.title }}
            </p>
            <p class="text-xs text-hwhub-muted">{{ item.userDisplayName }}</p>
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="categoryColorClass(item.category)"
              >
                {{ item.categoryLabel }}
              </span>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="statusColorClass(item.status)"
              >
                {{ item.statusLabel }}
              </span>
            </div>
            <p class="text-xs text-hwhub-muted">{{ item.messageSummary }}</p>
            <div class="flex gap-4 text-xs text-hwhub-muted">
              <span>{{ item.createdAtFormatted }}</span>
              <span>{{ item.updatedAtFormatted }}</span>
            </div>
            <div class="flex justify-end">
              <button
                class="rounded-md border border-hwhub-primary px-3 py-1 text-xs font-semibold text-hwhub-primary hover:bg-hwhub-surface-subtle"
                @click="goDetail(item.inquiryId)"
              >
                {{ t('admin.inquiries.card.detailButton') }}
              </button>
            </div>
          </div>

          <p v-if="pendingViewItems.length === 0" class="py-6 text-center text-xs text-hwhub-muted">
            {{ t('admin.inquiries.pending.empty') }}
          </p>

          <ListPagination
            v-model:current-page="pendingSpCurrentPage"
            :total-pages="pendingSpTotalPages"
          />
        </div>
      </section>
    </template>

    <!-- ============================================================
         タブ②: 全件検索
         ============================================================ -->
    <template v-else>
      <!-- フィルタフォーム -->
      <div class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.inquiries.search.createdAtFrom') }}
            </label>
            <input
              v-model="searchForm.createdAtFrom"
              type="date"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
            />
          </div>
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.inquiries.search.createdAtTo') }}
            </label>
            <input
              v-model="searchForm.createdAtTo"
              type="date"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
            />
          </div>
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.inquiries.search.updatedAtFrom') }}
            </label>
            <input
              v-model="searchForm.updatedAtFrom"
              type="date"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
            />
          </div>
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.inquiries.search.updatedAtTo') }}
            </label>
            <input
              v-model="searchForm.updatedAtTo"
              type="date"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('admin.inquiries.search.userId') }}
          </label>
          <input
            v-model.number="searchForm.userId"
            type="number"
            class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('inquiry.create.categoryLabel') }}
            </label>
            <select
              v-model="searchForm.category"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
            >
              <option value="">—</option>
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.inquiries.search.status') }}
            </label>
            <select
              v-model="searchForm.status"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
            >
              <option value="">—</option>
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex justify-end">
          <button
            class="rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
            :disabled="adminInquiryStore.isSearching"
            @click="handleSearch"
          >
            {{ t('admin.inquiries.search.searchButton') }}
          </button>
        </div>
      </div>

      <!-- 検索結果 -->
      <div v-if="adminInquiryStore.isSearching" class="text-sm text-hwhub-muted text-center py-8">
        {{ t('common.loading') }}
      </div>

      <template v-else-if="hasSearched">
        <p v-if="searchViewItems.length === 0" class="text-sm text-hwhub-muted text-center py-8">
          {{ t('admin.inquiries.search.empty') }}
        </p>

        <section v-else class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
          <!-- PC版: テーブル + ソート + ページング -->
          <div class="hidden md:block overflow-x-auto">
            <p class="mb-2 text-[11px] text-hwhub-muted">
              {{
                t('admin.inquiries.pagination.showing', {
                  start: searchPcStartIndex,
                  end: searchPcEndIndex,
                  total: searchViewItems.length,
                })
              }}
            </p>

            <table class="min-w-full border-collapse text-sm">
              <thead>
                <tr class="border-b border-hwhub-border bg-hwhub-surface-subtle">
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                    @click="searchToggleSort('inquiryId')"
                  >
                    <div class="flex items-center gap-1">
                      <span>{{ t('admin.inquiries.columns.id') }}</span>
                      <component
                        :is="getSearchSortIcon('inquiryId')"
                        class="w-3 h-3 transition-colors"
                        :class="
                          searchSortKey === 'inquiryId'
                            ? 'text-hwhub-primary'
                            : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                        "
                      />
                    </div>
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                    @click="searchToggleSort('userDisplayName')"
                  >
                    <div class="flex items-center gap-1">
                      <span>{{ t('admin.inquiries.columns.user') }}</span>
                      <component
                        :is="getSearchSortIcon('userDisplayName')"
                        class="w-3 h-3 transition-colors"
                        :class="
                          searchSortKey === 'userDisplayName'
                            ? 'text-hwhub-primary'
                            : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                        "
                      />
                    </div>
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                    @click="searchToggleSort('categoryLabel')"
                  >
                    <div class="flex items-center gap-1">
                      <span>{{ t('admin.inquiries.columns.category') }}</span>
                      <component
                        :is="getSearchSortIcon('categoryLabel')"
                        class="w-3 h-3 transition-colors"
                        :class="
                          searchSortKey === 'categoryLabel'
                            ? 'text-hwhub-primary'
                            : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                        "
                      />
                    </div>
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                    @click="searchToggleSort('status')"
                  >
                    <div class="flex items-center gap-1">
                      <span>{{ t('admin.inquiries.columns.status') }}</span>
                      <component
                        :is="getSearchSortIcon('status')"
                        class="w-3 h-3 transition-colors"
                        :class="
                          searchSortKey === 'status'
                            ? 'text-hwhub-primary'
                            : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                        "
                      />
                    </div>
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                    @click="searchToggleSort('totalMessageCount')"
                  >
                    <div class="flex items-center gap-1">
                      <span>{{ t('admin.inquiries.columns.messages') }}</span>
                      <component
                        :is="getSearchSortIcon('totalMessageCount')"
                        class="w-3 h-3 transition-colors"
                        :class="
                          searchSortKey === 'totalMessageCount'
                            ? 'text-hwhub-primary'
                            : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                        "
                      />
                    </div>
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                    @click="searchToggleSort('createdAt')"
                  >
                    <div class="flex items-center gap-1">
                      <span>{{ t('admin.inquiries.columns.createdAt') }}</span>
                      <component
                        :is="getSearchSortIcon('createdAt')"
                        class="w-3 h-3 transition-colors"
                        :class="
                          searchSortKey === 'createdAt'
                            ? 'text-hwhub-primary'
                            : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                        "
                      />
                    </div>
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                    @click="searchToggleSort('updatedAt')"
                  >
                    <div class="flex items-center gap-1">
                      <span>{{ t('admin.inquiries.columns.updatedAt') }}</span>
                      <component
                        :is="getSearchSortIcon('updatedAt')"
                        class="w-3 h-3 transition-colors"
                        :class="
                          searchSortKey === 'updatedAt'
                            ? 'text-hwhub-primary'
                            : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                        "
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in searchPcPagedItems"
                  :key="item.inquiryId"
                  class="border-b border-hwhub-border cursor-pointer transition-colors"
                  :class="[rowBgClass(item.status), 'hover:brightness-95']"
                  @click="goDetail(item.inquiryId)"
                >
                  <td class="px-3 py-2 align-top">
                    <div class="flex flex-col text-xs">
                      <span class="text-hwhub-muted">#{{ item.inquiryId }}</span>
                      <span class="font-medium text-hwhub-heading truncate max-w-[200px]">
                        {{ item.title }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2 align-top">
                    <div class="flex flex-col text-xs">
                      <span class="text-hwhub-heading">{{ item.userDisplayName }}</span>
                      <span class="text-hwhub-muted">{{ item.userEmail }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-2 align-top">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                      :class="categoryColorClass(item.category)"
                    >
                      {{ item.categoryLabel }}
                    </span>
                  </td>
                  <td class="px-3 py-2 align-top text-xs text-hwhub-heading">
                    {{ statusWithCode(item.status) }}
                  </td>
                  <td class="px-3 py-2 align-top text-xs text-hwhub-heading">
                    {{ item.messageSummary }}
                  </td>
                  <td class="px-3 py-2 align-top text-xs text-hwhub-heading">
                    {{ item.createdAtFormatted }}
                  </td>
                  <td class="px-3 py-2 align-top text-xs text-hwhub-heading">
                    {{ item.updatedAtFormatted }}
                  </td>
                </tr>
              </tbody>
            </table>

            <ListPagination
              v-model:current-page="searchPcCurrentPage"
              :total-pages="searchPcTotalPages"
            />
          </div>

          <!-- SP版: カード + ページングのみ -->
          <div class="mt-2 space-y-2 md:hidden">
            <div
              v-for="item in searchSpPagedItems"
              :key="item.inquiryId"
              class="rounded-xl border border-hwhub-border bg-white px-3 py-2 shadow-sm space-y-1"
            >
              <p class="text-sm font-medium text-hwhub-heading">
                #{{ item.inquiryId }}: {{ item.title }}
              </p>
              <p class="text-xs text-hwhub-muted">{{ item.userDisplayName }}</p>
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="categoryColorClass(item.category)"
                >
                  {{ item.categoryLabel }}
                </span>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="statusColorClass(item.status)"
                >
                  {{ item.statusLabel }}
                </span>
              </div>
              <p class="text-xs text-hwhub-muted">{{ item.messageSummary }}</p>
              <div class="flex gap-4 text-xs text-hwhub-muted">
                <span>{{ item.createdAtFormatted }}</span>
                <span>{{ item.updatedAtFormatted }}</span>
              </div>
              <div class="flex justify-end">
                <button
                  class="rounded-md border border-hwhub-primary px-3 py-1 text-xs font-semibold text-hwhub-primary hover:bg-hwhub-surface-subtle"
                  @click="goDetail(item.inquiryId)"
                >
                  {{ t('admin.inquiries.card.detailButton') }}
                </button>
              </div>
            </div>

            <ListPagination
              v-model:current-page="searchSpCurrentPage"
              :total-pages="searchSpTotalPages"
            />
          </div>
        </section>
      </template>
    </template>
  </div>
</template>
