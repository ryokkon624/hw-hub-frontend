<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAdminAnnouncementStore } from '@/stores/adminAnnouncementStore'
import { useCodeStore } from '@/stores/codeStore'
import { usePagination } from '@/composables/usePagination'
import { useSortable } from '@/composables/useSortable'
import { CODE_TYPE, ANNOUNCEMENT_SEVERITY } from '@/constants/code.constants'
import type { AdminAnnouncementModel } from '@/domain'
import ListPagination from '@/components/ui/ListPagination.vue'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const store = useAdminAnnouncementStore()
const codeStore = useCodeStore()

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
  await store.loadAll()
})

/** 重要度コードから表示名を取得 */
const severityLabel = (code: string): string => {
  const codeItem = codeStore
    .getByType(CODE_TYPE.ANNOUNCEMENT_SEVERITY)
    .find((c) => c.codeValue === code)
  if (!codeItem) return code
  if (locale.value === 'ja') return codeItem.displayNameJa ?? codeItem.name
  if (locale.value === 'es')
    return codeItem.displayNameEs ?? codeItem.displayNameEn ?? codeItem.name
  return codeItem.displayNameEn ?? codeItem.name
}

/** 対象スコープコードから表示名を取得 */
const scopeLabel = (code: string): string => {
  const codeItem = codeStore
    .getByType(CODE_TYPE.ANNOUNCEMENT_SCOPE)
    .find((c) => c.codeValue === code)
  if (!codeItem) return code
  if (locale.value === 'ja') return codeItem.displayNameJa ?? codeItem.name
  if (locale.value === 'es')
    return codeItem.displayNameEs ?? codeItem.displayNameEn ?? codeItem.name
  return codeItem.displayNameEn ?? codeItem.name
}

/** 重要度の色クラス */
const severityColorClass = (severity: string): string => {
  switch (severity) {
    case ANNOUNCEMENT_SEVERITY.INFO:
      return 'bg-hwhub-palette-blue-soft border border-hwhub-palette-blue text-hwhub-palette-blue'
    case ANNOUNCEMENT_SEVERITY.WARNING:
      return 'bg-hwhub-palette-amber-soft border border-hwhub-palette-amber text-hwhub-palette-amber'
    case ANNOUNCEMENT_SEVERITY.ERROR:
      return 'bg-hwhub-palette-rose-soft border border-hwhub-palette-rose text-hwhub-palette-rose'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}

/** ステータス（開始前 / 有効中 / 期限切れ） */
const announcementStatus = (item: AdminAnnouncementModel): 'upcoming' | 'active' | 'expired' => {
  const now = new Date()
  const start = new Date(item.startAt)
  const end = new Date(item.endAt)
  if (now < start) return 'upcoming'
  if (now < end) return 'active'
  return 'expired'
}

const statusColorClass = (status: 'upcoming' | 'active' | 'expired'): string => {
  switch (status) {
    case 'upcoming':
      return 'bg-hwhub-surface-subtle border border-hwhub-border text-hwhub-muted'
    case 'active':
      return 'bg-hwhub-palette-emerald-soft border border-hwhub-palette-emerald text-hwhub-palette-emerald'
    case 'expired':
      return 'bg-hwhub-surface-subtle border border-hwhub-border text-hwhub-muted line-through'
  }
}

const formatDatetime = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' })
}

/** タイトルをロケールに応じて選択 */
const localizedTitle = (item: AdminAnnouncementModel): string => {
  if (locale.value === 'ja') return item.titleJa
  if (locale.value === 'es') return item.titleEs
  return item.titleEn
}

interface AnnouncementViewItem extends AdminAnnouncementModel {
  localizedTitle: string
  severityLabel: string
  scopeLabel: string
  status: 'upcoming' | 'active' | 'expired'
  statusLabel: string
}

const viewItems = computed<AnnouncementViewItem[]>(() =>
  store.items.map((item) => {
    const status = announcementStatus(item)
    return {
      ...item,
      localizedTitle: localizedTitle(item),
      severityLabel: severityLabel(item.severity),
      scopeLabel: scopeLabel(item.targetScope),
      status,
      statusLabel: t(`admin.announcement.status.${status}`),
    }
  }),
)

// --- PC版: ソート → ページング ---
const {
  sortKey,
  sortOrder,
  sortedItems: pcSortedItems,
  toggleSort,
} = useSortable<AnnouncementViewItem>(viewItems, null)

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
} = usePagination(viewItems, 10)

const getSortIcon = (key: keyof AnnouncementViewItem) => {
  if (sortKey.value !== key) return ArrowUpDown
  return sortOrder.value === 'asc' ? ArrowUp : ArrowDown
}

const goEdit = (id: number) => {
  router.push({ name: 'admin.announcements.edit', params: { id } })
}

const goCreate = () => {
  router.push({ name: 'admin.announcements.new' })
}
</script>

<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="sr-only">{{ t('admin.sections.announcement.title') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('admin.sections.announcement.subtitle') }}</p>
      </div>

      <button
        type="button"
        class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
        @click="goCreate"
      >
        {{ t('admin.announcement.createButton') }}
      </button>
    </header>

    <!-- SP 用追加ボタン -->
    <div class="sm:hidden">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        @click="goCreate"
      >
        {{ t('admin.announcement.createButton') }}
      </button>
    </div>

    <!-- カード：一覧 -->
    <section class="rounded-xl border bg-hwhub-surface-card p-4 shadow-sm space-y-3">
      <!-- 件数 -->
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs text-hwhub-muted">
          {{ t('housework.list.totalPrefix') }}
          <span class="font-semibold text-hwhub-heading">{{ viewItems.length }}</span>
          {{ t('housework.list.totalUnit') }}
        </p>
      </div>

      <!-- ============================================================
           PC版：テーブル表示（ソート + ページング）
           ============================================================ -->
      <div class="mt-2 overflow-x-auto hidden md:block">
        <p v-if="viewItems.length > 0" class="mb-2 text-[11px] text-hwhub-muted">
          {{
            t('housework.list.pagination.showing', {
              start: pcStartIndex,
              end: pcEndIndex,
              total: viewItems.length,
            })
          }}
        </p>

        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-hwhub-border bg-hwhub-surface-subtle">
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                @click="toggleSort('localizedTitle')"
              >
                <div class="flex items-center gap-1">
                  <span>{{ t('admin.announcement.columns.title') }}</span>
                  <component
                    :is="getSortIcon('localizedTitle')"
                    class="w-3 h-3 transition-colors"
                    :class="
                      sortKey === 'localizedTitle'
                        ? 'text-hwhub-primary'
                        : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                    "
                  />
                </div>
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('admin.announcement.columns.severity') }}
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('admin.announcement.columns.targetScope') }}
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                @click="toggleSort('startAt')"
              >
                <div class="flex items-center gap-1">
                  <span>{{ t('admin.announcement.columns.period') }}</span>
                  <component
                    :is="getSortIcon('startAt')"
                    class="w-3 h-3 transition-colors"
                    :class="
                      sortKey === 'startAt'
                        ? 'text-hwhub-primary'
                        : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'
                    "
                  />
                </div>
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                @click="toggleSort('status')"
              >
                <div class="flex items-center gap-1">
                  <span>{{ t('admin.announcement.columns.status') }}</span>
                  <component
                    :is="getSortIcon('status')"
                    class="w-3 h-3 transition-colors"
                    :class="
                      sortKey === 'status'
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
              v-for="item in pcPagedItems"
              :key="item.id"
              class="border-b border-hwhub-border hover:bg-hwhub-surface-subtle cursor-pointer"
              @click="goEdit(item.id)"
            >
              <td class="px-3 py-2 align-top">
                <span class="text-sm font-medium text-hwhub-heading truncate">
                  {{ item.localizedTitle }}
                </span>
              </td>
              <td class="px-3 py-2 align-top">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"
                  :class="severityColorClass(item.severity)"
                >
                  {{ item.severityLabel }}
                </span>
              </td>
              <td class="px-3 py-2 align-top">
                <span class="text-xs text-hwhub-heading">{{ item.scopeLabel }}</span>
              </td>
              <td class="px-3 py-2 align-top">
                <span class="text-xs text-hwhub-muted whitespace-nowrap">
                  {{ formatDatetime(item.startAt) }} 〜 {{ formatDatetime(item.endAt) }}
                </span>
              </td>
              <td class="px-3 py-2 align-top">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"
                  :class="statusColorClass(item.status)"
                >
                  {{ item.statusLabel }}
                </span>
              </td>
            </tr>

            <tr v-if="viewItems.length === 0">
              <td colspan="5" class="px-3 py-6 text-center text-xs text-hwhub-muted">
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
          :key="item.id"
          type="button"
          class="w-full text-left rounded-xl border border-hwhub-border bg-hwhub-surface-card px-3 py-2 shadow-sm hover:bg-hwhub-surface-subtle active:bg-hwhub-surface-subtle transition"
          @click="goEdit(item.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-hwhub-heading truncate">
                {{ item.localizedTitle }}
              </p>
              <p class="mt-1 text-xs text-hwhub-muted">{{ item.scopeLabel }}</p>
              <p class="mt-0.5 text-xs text-hwhub-muted whitespace-nowrap">
                {{ formatDatetime(item.startAt) }} 〜 {{ formatDatetime(item.endAt) }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"
                :class="severityColorClass(item.severity)"
              >
                {{ item.severityLabel }}
              </span>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"
                :class="statusColorClass(item.status)"
              >
                {{ item.statusLabel }}
              </span>
            </div>
          </div>
        </button>

        <p v-if="viewItems.length === 0" class="py-6 text-center text-xs text-hwhub-muted">
          {{ t('housework.list.sp.empty') }}
        </p>

        <ListPagination v-model:current-page="spCurrentPage" :total-pages="spTotalPages" />
      </div>
    </section>
  </div>
</template>
