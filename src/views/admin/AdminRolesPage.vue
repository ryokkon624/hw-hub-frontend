<template>
  <div class="space-y-4">
    <h2 class="sr-only">{{ t('admin.sections.roles.title') }}</h2>
    <p class="text-sm text-hwhub-muted">{{ t('admin.sections.roles.subtitle') }}</p>

    <!-- 検索フォーム -->
    <form class="flex gap-2" @submit.prevent="handleSearch">
      <div class="flex-1">
        <label class="sr-only" for="email-search">{{ t('admin.roles.searchLabel') }}</label>
        <input
          id="email-search"
          v-model="emailInput"
          class="w-full rounded-md border border-hwhub-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          :placeholder="t('admin.roles.searchPlaceholder')"
        />
      </div>
      <button
        type="submit"
        class="rounded-lg bg-hwhub-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        :disabled="adminRoleStore.isSearching || !emailInput.trim()"
      >
        {{ t('admin.roles.searchButton') }}
      </button>
    </form>

    <!-- ローディング -->
    <div v-if="adminRoleStore.isSearching" class="py-4 text-center text-sm text-hwhub-muted">
      <span class="animate-pulse">...</span>
    </div>

    <!-- 検索結果 -->
    <template v-else-if="hasSearched">
      <!-- 結果なし -->
      <p
        v-if="adminRoleStore.searchResults.length === 0"
        class="py-4 text-center text-sm text-hwhub-muted"
      >
        {{ t('admin.roles.empty') }}
      </p>

      <!-- ユーザーカード一覧 -->
      <div v-else class="space-y-3">
        <div
          v-for="user in adminRoleStore.searchResults"
          :key="user.userId"
          class="rounded-xl border bg-white p-4 shadow-sm"
        >
          <!-- ユーザー情報 -->
          <div class="mb-3">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm text-hwhub-heading">{{ user.displayName }}</span>
              <span
                v-if="!user.isActive"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                inactive
              </span>
            </div>
            <div class="text-xs text-hwhub-muted">{{ user.email }}</div>
            <div class="text-xs text-hwhub-muted">{{ user.locale }}</div>
          </div>

          <!-- 現在のロールバッジ -->
          <div class="mb-3 flex flex-wrap gap-1.5">
            <span
              v-for="role in user.roles"
              :key="role"
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="roleBadgeClass(role)"
            >
              {{ roleLabel(role) }}
              <button
                type="button"
                class="ml-0.5 text-current opacity-70 hover:opacity-100"
                :disabled="adminRoleStore.isSubmitting"
                @click="handleRemove(user.userId, role)"
              >
                ×
              </button>
            </span>
          </div>

          <!-- 付与可能なロールボタン -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="role in assignableRoles(user.roles)"
              :key="role"
              type="button"
              class="rounded-lg border px-3 py-1 text-xs font-medium transition hover:bg-hwhub-surface-subtle disabled:opacity-50"
              :disabled="adminRoleStore.isSubmitting"
              @click="handleAssign(user.userId, role)"
            >
              + {{ roleLabel(role) }} {{ t('admin.roles.assignButton') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminRoleStore } from '@/stores/adminRoleStore'
import { useUiStore } from '@/stores/uiStore'
import { USER_ROLE } from '@/constants/code.constants'
import type { UserRoleCode } from '@/constants/code.constants'

const { t } = useI18n()
const adminRoleStore = useAdminRoleStore()
const uiStore = useUiStore()

const emailInput = ref('')
const hasSearched = ref(false)

const handleSearch = async () => {
  if (!emailInput.value.trim()) return
  await adminRoleStore.searchUsers(emailInput.value.trim())
  hasSearched.value = true
}

const handleAssign = async (userId: number, role: UserRoleCode) => {
  try {
    await adminRoleStore.assignRole(userId, role)
    uiStore.showToast('success', t('admin.roles.toast.assigned'))
  } catch {
    uiStore.showToast('error', t('admin.roles.toast.error'))
  }
}

const handleRemove = async (userId: number, role: UserRoleCode) => {
  if (!window.confirm(t('admin.roles.removeConfirm'))) return
  try {
    await adminRoleStore.removeRole(userId, role)
    uiStore.showToast('success', t('admin.roles.toast.removed'))
  } catch {
    uiStore.showToast('error', t('admin.roles.toast.error'))
  }
}

const roleLabel = (role: UserRoleCode): string => {
  return role === USER_ROLE.ADMIN ? 'ADMIN' : 'SUPPORT'
}

const roleBadgeClass = (role: UserRoleCode): string => {
  return role === USER_ROLE.ADMIN ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600'
}

const assignableRoles = (currentRoles: UserRoleCode[]): UserRoleCode[] =>
  Object.values(USER_ROLE).filter((r) => !currentRoles.includes(r))
</script>
