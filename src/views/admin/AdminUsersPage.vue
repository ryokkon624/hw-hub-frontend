<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { useAdminUserStore } from '@/stores/adminUserStore'
import { useUiStore } from '@/stores/uiStore'
import { useSortable } from '@/composables/useSortable'
import { usePagination } from '@/composables/usePagination'
import ListPagination from '@/components/ui/ListPagination.vue'
import type { AdminUserDetailModel } from '@/domain'
import { toUiError } from '@/domain/error/errorMapper'
import { CODE_TYPE, AUTH_PROVIDER } from '@/constants/code.constants'
import { useCodes } from '@/composables/useCodes'

const { t } = useI18n()
const adminUserStore = useAdminUserStore()
const uiStore = useUiStore()
const { labelOf } = useCodes()

// ---- View Item 型 ----
interface AdminUserViewItem extends AdminUserDetailModel {
  createdAtFormatted: string
  updatedAtFormatted: string
  isActiveLabel: string
  authProviderLabel: string
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

const toViewItem = (item: AdminUserDetailModel): AdminUserViewItem => ({
  ...item,
  createdAtFormatted: formatDateTime(item.createdAt),
  updatedAtFormatted: formatDateTime(item.updatedAt),
  isActiveLabel: item.isActive
    ? t('admin.users.search.isActiveActive')
    : t('admin.users.search.isActiveInactive'),
  authProviderLabel: labelOf(CODE_TYPE.AUTH_PROVIDER, item.authProvider),
})

// ---- 検索フォーム ----
const searchForm = ref({
  email: '',
  isActive: '' as '' | 'true' | 'false',
  locale: '',
})

const handleSearch = async () => {
  const params = {
    email: searchForm.value.email || undefined,
    isActive:
      searchForm.value.isActive === 'true'
        ? true
        : searchForm.value.isActive === 'false'
          ? false
          : undefined,
    locale: searchForm.value.locale || undefined,
  }
  await adminUserStore.search(params)
}

// ---- ソート + ページング ----
const viewItems = computed<AdminUserViewItem[]>(() => adminUserStore.searchResults.map(toViewItem))

const { sortKey, sortOrder, sortedItems, toggleSort } = useSortable<AdminUserViewItem>(
  viewItems,
  'createdAt',
  'desc',
)

const { pagedItems, currentPage, totalPages, startIndex, endIndex, totalCount, goToPage } =
  usePagination(sortedItems, 20)

const getSortIcon = (key: keyof AdminUserViewItem) => {
  if (sortKey.value !== key) return ArrowUpDown
  return sortOrder.value === 'asc' ? ArrowUp : ArrowDown
}

// ---- ダイアログ ----
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const selectedUser = ref<AdminUserViewItem | null>(null)

const createForm = ref({
  email: '',
  password: '',
  displayName: '',
  locale: 'ja',
})

const editForm = ref({
  displayName: '',
  locale: '',
  password: '',
  isActive: true,
})

const openCreateDialog = () => {
  createForm.value = { email: '', password: '', displayName: '', locale: 'ja' }
  showCreateDialog.value = true
}

const openEditDialog = (user: AdminUserViewItem) => {
  selectedUser.value = user
  editForm.value = {
    displayName: user.displayName,
    locale: user.locale,
    password: '',
    isActive: user.isActive,
  }
  showEditDialog.value = true
}

const closeCreate = () => {
  showCreateDialog.value = false
}
const closeEdit = () => {
  showEditDialog.value = false
  selectedUser.value = null
}

const errorKey = ref<string | null>(null)

const handleCreate = async () => {
  errorKey.value = null
  try {
    await adminUserStore.createUser({
      email: createForm.value.email,
      password: createForm.value.password,
      displayName: createForm.value.displayName,
      locale: createForm.value.locale,
    })
    uiStore.showToast('success', t('admin.users.toast.created'))
    closeCreate()
  } catch (e) {
    errorKey.value = toUiError(e).messageKey
  }
}

const handleUpdate = async () => {
  if (!selectedUser.value) return
  errorKey.value = null
  try {
    await adminUserStore.updateUser(selectedUser.value.userId, {
      displayName: editForm.value.displayName,
      locale: editForm.value.locale,
      password: editForm.value.password || undefined,
      isActive: editForm.value.isActive,
    })
    uiStore.showToast('success', t('admin.users.toast.updated'))
    closeEdit()
  } catch (e) {
    errorKey.value = toUiError(e).messageKey
  }
}

// ---- ソートアイコンのカラークラス ----
const sortIconClass = (key: keyof AdminUserViewItem) =>
  sortKey.value === key ? 'text-hwhub-primary' : 'text-hwhub-muted/40 group-hover:text-hwhub-muted'

// ---- onMounted: 全件ロード ----
onMounted(async () => {
  await adminUserStore.search({})
})
</script>

<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="sr-only">{{ t('pageTitles.adminUsers') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('admin.users.description') }}</p>
      </div>
      <!-- PC版: ヘッダー右端 -->
      <button
        type="button"
        class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="openCreateDialog"
      >
        {{ t('admin.users.createButton') }}
      </button>
    </header>

    <!-- SP版: 全幅ボタン -->
    <div class="sm:hidden">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="openCreateDialog"
      >
        {{ t('admin.users.createButton') }}
      </button>
    </div>

    <!-- 検索条件カード -->
    <section class="rounded-xl border bg-white p-4 shadow-sm">
      <form class="space-y-3" @submit.prevent="handleSearch">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <!-- メールアドレス -->
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.users.search.email') }}
            </label>
            <input
              v-model="searchForm.email"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            />
          </div>

          <!-- ステータス -->
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.users.search.isActive') }}
            </label>
            <select
              v-model="searchForm.isActive"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            >
              <option value="">{{ t('admin.users.search.isActiveAll') }}</option>
              <option value="true">{{ t('admin.users.search.isActiveActive') }}</option>
              <option value="false">{{ t('admin.users.search.isActiveInactive') }}</option>
            </select>
          </div>

          <!-- 言語 -->
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('admin.users.search.locale') }}
            </label>
            <select
              v-model="searchForm.locale"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            >
              <option value="">{{ t('admin.users.search.localeAll') }}</option>
              <option value="ja">{{ t('common.locales.ja') }}</option>
              <option value="en">{{ t('common.locales.en') }}</option>
              <option value="es">{{ t('common.locales.es') }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="submit"
            class="rounded-lg bg-hwhub-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            :disabled="adminUserStore.isSearching"
          >
            {{ t('admin.users.search.searchButton') }}
          </button>
        </div>
      </form>
    </section>

    <!-- ローディング -->
    <div v-if="adminUserStore.isSearching" class="py-4 text-center text-sm text-hwhub-muted">
      <span class="animate-pulse">{{ t('common.loading') }}</span>
    </div>

    <!-- ② 結果カード -->
    <section v-else class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <!-- 件数表示 -->
      <p v-if="totalCount > 0" class="text-[11px] text-hwhub-muted">
        {{ startIndex }}〜{{ endIndex }}件 / {{ totalCount }}件
      </p>

      <!-- 結果なし -->
      <p
        v-if="adminUserStore.searchResults.length === 0"
        class="py-6 text-center text-xs text-hwhub-muted"
      >
        {{ t('admin.users.empty') }}
      </p>

      <!-- PC版: テーブル -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-hwhub-border bg-hwhub-surface-subtle">
              <th
                v-for="col in [
                  'userId',
                  'email',
                  'authProvider',
                  'displayName',
                  'locale',
                  'notificationEnabled',
                  'isActive',
                  'createdAt',
                  'updatedAt',
                ] as const"
                :key="col"
                class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted cursor-pointer select-none group transition-colors hover:text-hwhub-heading hover:bg-hwhub-surface"
                @click="toggleSort(col)"
              >
                <div class="flex items-center gap-1">
                  <span>{{ t(`admin.users.columns.${col}`) }}</span>
                  <component
                    :is="getSortIcon(col)"
                    class="w-3 h-3 transition-colors"
                    :class="sortIconClass(col)"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in pagedItems"
              :key="user.userId"
              class="border-b border-hwhub-border cursor-pointer transition-colors hover:bg-hwhub-surface-subtle"
              @click="openEditDialog(user)"
            >
              <td class="px-3 py-2 text-xs text-hwhub-muted">{{ user.userId }}</td>
              <td class="px-3 py-2 text-xs max-w-[200px] truncate">{{ user.email }}</td>
              <td class="px-3 py-2 text-xs text-hwhub-heading">{{ user.authProviderLabel }}</td>
              <td class="px-3 py-2 text-xs text-hwhub-heading">{{ user.displayName }}</td>
              <td class="px-3 py-2 text-xs text-hwhub-heading">{{ user.locale }}</td>
              <td class="px-3 py-2 text-xs text-center">
                <span :class="user.notificationEnabled ? 'text-green-600' : 'text-gray-400'">
                  {{ user.notificationEnabled ? '✓' : '—' }}
                </span>
              </td>
              <td class="px-3 py-2">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ user.isActiveLabel }}
                </span>
              </td>
              <td class="px-3 py-2 text-xs text-hwhub-heading whitespace-nowrap">
                {{ user.createdAtFormatted }}
              </td>
              <td class="px-3 py-2 text-xs text-hwhub-heading whitespace-nowrap">
                {{ user.updatedAtFormatted }}
              </td>
            </tr>
          </tbody>
        </table>

        <ListPagination
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="goToPage"
        />
      </div>

      <!-- SP版: カード -->
      <div v-if="adminUserStore.searchResults.length > 0" class="md:hidden space-y-2">
        <div
          v-for="user in pagedItems"
          :key="user.userId"
          class="rounded-xl border border-hwhub-border bg-white px-3 py-2 shadow-sm space-y-1"
        >
          <p class="text-sm font-medium text-hwhub-heading">{{ user.displayName }}</p>
          <p class="text-xs text-hwhub-muted">{{ user.email }}</p>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-hwhub-muted">{{ user.authProviderLabel }}</span>
            <span class="text-xs text-hwhub-muted">{{ user.locale }}</span>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ user.isActiveLabel }}
            </span>
          </div>
          <div class="flex gap-4 text-xs text-hwhub-muted">
            <span>{{ user.createdAtFormatted }}</span>
            <span>{{ user.updatedAtFormatted }}</span>
          </div>
          <div class="flex justify-end">
            <button
              type="button"
              class="rounded-md border border-hwhub-primary px-3 py-1 text-xs font-semibold text-hwhub-primary hover:bg-hwhub-surface-subtle"
              @click="openEditDialog(user)"
            >
              {{ t('admin.users.editButton') }}
            </button>
          </div>
        </div>

        <ListPagination
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="goToPage"
        />
      </div>
    </section>

    <!-- ダイアログ: 新規登録 -->
    <Teleport to="body">
      <div
        v-if="showCreateDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="closeCreate"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
          <h3 class="mb-4 font-semibold text-hwhub-heading">
            {{ t('admin.users.form.create.title') }}
          </h3>
          <form class="space-y-3" @submit.prevent="handleCreate">
            <div>
              <label class="block text-xs font-medium text-hwhub-muted mb-1">{{
                t('admin.users.form.email')
              }}</label>
              <input
                v-model="createForm.email"
                type="email"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-hwhub-muted mb-1">{{
                t('admin.users.form.password')
              }}</label>
              <input
                v-model="createForm.password"
                type="password"
                required
                minlength="8"
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-hwhub-muted mb-1">{{
                t('admin.users.form.displayName')
              }}</label>
              <input
                v-model="createForm.displayName"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-hwhub-muted mb-1">{{
                t('admin.users.form.locale')
              }}</label>
              <select
                v-model="createForm.locale"
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              >
                <option value="ja">{{ t('common.locales.ja') }}</option>
                <option value="en">{{ t('common.locales.en') }}</option>
                <option value="es">{{ t('common.locales.es') }}</option>
              </select>
            </div>
            <p v-if="errorKey" class="text-sm text-red-600">{{ t(errorKey) }}</p>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                class="rounded-lg border px-4 py-2 text-sm transition hover:bg-hwhub-surface-subtle"
                @click="closeCreate"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="rounded-lg bg-hwhub-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                :disabled="adminUserStore.isSubmitting"
              >
                {{ t('admin.users.createButton') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ダイアログ: 編集 -->
    <Teleport to="body">
      <div
        v-if="showEditDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="closeEdit"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
          <h3 class="mb-4 font-semibold text-hwhub-heading">
            {{ t('admin.users.form.edit.title') }}
          </h3>
          <form class="space-y-3" @submit.prevent="handleUpdate">
            <div>
              <label class="block text-xs font-medium text-hwhub-muted mb-1">{{
                t('admin.users.form.displayName')
              }}</label>
              <input
                v-model="editForm.displayName"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-hwhub-muted mb-1">{{
                t('admin.users.form.locale')
              }}</label>
              <select
                v-model="editForm.locale"
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              >
                <option value="ja">{{ t('common.locales.ja') }}</option>
                <option value="en">{{ t('common.locales.en') }}</option>
                <option value="es">{{ t('common.locales.es') }}</option>
              </select>
            </div>
            <div v-if="selectedUser?.authProvider === AUTH_PROVIDER.LOCAL">
              <label class="block text-xs font-medium text-hwhub-muted mb-1">
                {{ t('admin.users.form.password') }}
                <span class="font-normal text-hwhub-muted ml-1"
                  >（{{ t('admin.users.form.passwordHint') }}）</span
                >
              </label>
              <input
                v-model="editForm.password"
                type="password"
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
                minlength="8"
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                id="isActive"
                v-model="editForm.isActive"
                type="checkbox"
                class="rounded border-gray-300 text-hwhub-primary focus:ring-hwhub-primary"
              />
              <label for="isActive" class="text-sm text-hwhub-heading">
                {{ t('admin.users.form.isActive') }}
              </label>
            </div>
            <p v-if="errorKey" class="text-sm text-red-600">{{ t(errorKey) }}</p>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                class="rounded-lg border px-4 py-2 text-sm transition hover:bg-hwhub-surface-subtle"
                @click="closeEdit"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="rounded-lg bg-hwhub-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                :disabled="adminUserStore.isSubmitting"
              >
                {{ t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
