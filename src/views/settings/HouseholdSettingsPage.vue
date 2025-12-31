<template>
  <div class="space-y-6 max-w-3xl">
    <!-- タイトル・説明 -->
    <div>
      <h2 class="sr-only">{{ t('settings.household.title') }}</h2>
      <p class="text-sm text-hwhub-muted">
        {{ t('settings.household.description') }}
      </p>
    </div>

    <!-- 1. 所属している世帯一覧（軽め） -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-hwhub-heading">
          {{ t('settings.household.list.title') }}
        </h3>
        <!-- PC 用：ヘッダー右側の追加ボタン -->
        <button
          type="button"
          class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-hwhub-primary"
          @click="onClickAddHousehold"
        >
          {{ t('settings.household.list.addButtonPc') }}
        </button>
      </div>

      <div v-if="households.length === 0" class="text-xs text-hwhub-muted">
        {{ t('settings.household.list.empty') }}
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="h in households"
          :key="h.householdId"
          class="flex items-center justify-between rounded-lg border px-3 py-2"
          :class="
            h.householdId === currentHouseholdId
              ? 'bg-hwhub-surface-subtle'
              : 'bg-white hover:bg-hwhub-surface-subtle cursor-pointer'
          "
        >
          <div class="flex flex-col" @click="onChangeHousehold(h.householdId)">
            <span class="text-sm font-medium text-hwhub-heading">
              {{ h.name }}
            </span>
            <span class="text-[11px] text-hwhub-muted">
              {{ t('settings.household.list.householdId') }}: {{ h.householdId }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <!-- 現在の世帯の場合 -->
            <span
              v-if="h.householdId === currentHouseholdId"
              class="text-[11px] px-2 py-0.5 rounded-full bg-hwhub-primary text-white"
            >
              {{ t('settings.household.list.currentBadge') }}
            </span>

            <!-- 他の世帯の場合：切り替えボタン -->
            <button
              v-else
              type="button"
              class="text-[11px] px-2 py-1 rounded-full border border-gray-300 text-hwhub-heading hover:bg-hwhub-surface-subtle"
              @click.stop="onChangeHousehold(h.householdId)"
            >
              {{ t('settings.household.list.selectButton') }}
            </button>
          </div>
        </div>
      </div>

      <!-- SP 用：世帯追加カード -->
      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="md:hidden mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-3 py-3 text-sm text-hwhub-muted hover:bg-hwhub-surface-subtle"
          @click="onClickAddHousehold"
        >
          {{ t('settings.household.list.addButtonSp') }}
        </button>
      </div>

      <p class="text-[11px] text-hwhub-muted mt-1">
        {{ t('settings.household.list.note') }}
      </p>
    </section>

    <!-- 2. 選択中の世帯の設定（世帯情報 + あなたの設定） -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 2-1. 世帯の情報 -->
      <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <h3 class="text-sm font-semibold text-hwhub-heading">
          {{ t('settings.household.info.title') }}
        </h3>

        <div v-if="!currentHousehold" class="text-xs text-hwhub-muted">
          {{ t('settings.household.info.noCurrent') }}
        </div>

        <div v-else class="space-y-3">
          <div>
            <label class="block text-xs text-hwhub-muted mb-1">{{
              t('settings.household.info.nameLabel')
            }}</label>
            <input
              v-model="householdName"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              maxlength="100"
            />
          </div>

          <p class="text-[11px] text-hwhub-muted">
            {{ t('settings.household.info.nameHelp') }}
          </p>

          <div class="flex justify-end">
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-hwhub-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
              :disabled="!canSaveHouseholdName"
              @click="onSaveHouseholdName"
            >
              {{ t('settings.household.info.saveButton') }}
            </button>
          </div>
        </div>
      </section>

      <!-- 2-2. この世帯でのあなたの設定 -->
      <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <h3 class="text-sm font-semibold text-hwhub-heading">
          {{ t('settings.household.mySettings.title') }}
        </h3>

        <div v-if="!currentHousehold" class="text-xs text-hwhub-muted">
          {{ t('settings.household.info.noCurrent') }}
        </div>

        <div v-else class="space-y-3">
          <p class="text-xs text-hwhub-muted">
            {{ t('settings.household.mySettings.description') }}
          </p>

          <div>
            <label class="block text-xs text-hwhub-muted mb-1">
              {{ t('settings.household.mySettings.nicknameLabel') }}
            </label>
            <input
              v-model="myNickname"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              maxlength="50"
            />
          </div>

          <p class="text-[11px] text-hwhub-muted">
            {{ t('settings.household.mySettings.nicknameHelp') }}
          </p>

          <div class="flex justify-end">
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-hwhub-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
              :disabled="!canSaveNickname"
              @click="onSaveNickname"
            >
              {{ t('settings.household.mySettings.saveButton') }}
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- 3. メンバー一覧 -->
    <section class="bg-white rounded-lg shadow-sm p-4 border mt-6">
      <h3 class="text-sm font-semibold text-hwhub-heading">
        {{ t('settings.household.members.title') }}
      </h3>

      <p v-if="currentAllMembers.length === 0" class="text-hwhub-muted text-sm">
        {{ t('settings.household.members.empty') }}
      </p>

      <table v-else class="w-full text-sm border-collapse hidden md:table">
        <thead>
          <tr class="border-b bg-hwhub-surface-subtle text-left">
            <th class="py-2 px-2">{{ t('settings.household.members.table.displayName') }}</th>
            <th class="py-2 px-2">{{ t('settings.household.members.table.nickname') }}</th>
            <th class="py-2 px-2">{{ t('settings.household.members.table.status') }}</th>
            <th class="py-2 px-2">{{ t('settings.household.members.table.role') }}</th>
            <th class="py-2 px-2">{{ t('settings.household.members.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in currentAllMembers"
            :key="m.userId"
            class="border-b hover:bg-hwhub-surface-subtle"
          >
            <!-- 表示名 -->
            <td class="py-2 px-2">
              {{ m.displayName }}
              <span
                v-if="m.userId === loginUserId"
                class="ml-1 px-1.5 py-0.5 bg-hwhub-primary/10 text-hwhub-primary rounded text-[10px]"
              >
                {{ t('settings.household.members.table.you') }}
              </span>
            </td>

            <!-- ニックネーム -->
            <td class="py-2 px-2">
              {{ m.nickname || t('settings.household.members.table.nicknameNone') }}
            </td>

            <!-- ステータス -->
            <td class="py-2 px-2">
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="statusBadgeClass(m.status)"
              >
                {{ memberStatusLabel(m.status) }}
              </span>
            </td>

            <!-- 権限 -->
            <td class="py-2 px-2">
              <span
                v-if="m.role === 'OWNER'"
                class="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200"
              >
                {{ t('settings.household.members.table.roleOwner') }}
              </span>
              <span
                v-else
                class="px-2 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] border border-gray-200"
              >
                {{ t('settings.household.members.table.roleMember') }}
              </span>
            </td>

            <!-- 操作 -->
            <td class="py-2 px-2">
              <!-- 自分自身 & OWNER じゃない & 有効なメンバーだけ -->
              <button
                v-if="m.userId === loginUserId && !isOwnerInCurrentHousehold && m.status === '1'"
                type="button"
                class="px-3 py-1 rounded-full border text-[11px] text-red-600 hover:bg-red-50"
                @click="leaveHousehold"
              >
                {{ t('settings.household.members.actions.leave') }}
              </button>

              <!-- OWNER が他メンバーを外す -->
              <button
                v-else-if="
                  isOwnerInCurrentHousehold && m.userId !== loginUserId && m.status === '1'
                "
                type="button"
                class="px-3 py-1 rounded-full border text-[11px] text-red-600 hover:bg-red-50"
                @click="removeMember(m.userId)"
              >
                {{ t('settings.household.members.actions.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- スマホ版：カード表示 -->
      <div class="grid gap-3 md:hidden mt-4">
        <div
          v-for="m in currentAllMembers"
          :key="m.userId"
          class="rounded-lg border p-4 bg-white shadow-sm"
          :class="statusBorderClass(m.status)"
        >
          <!-- 上段：表示名 & あなた -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <!-- アイコン -->
              <div
                class="w-8 h-8 rounded-full bg-hwhub-surface-subtle flex items-center justify-center text-sm font-semibold text-gray-700 overflow-hidden"
              >
                <img
                  v-if="m.iconUrl"
                  :src="m.iconUrl"
                  alt="アイコン"
                  class="w-full h-full object-cover"
                />
                <span v-else>
                  {{ m.displayName.slice(0, 2) }}
                </span>
              </div>

              <div>
                <div class="text-sm font-medium text-hwhub-heading">
                  {{ m.displayName }}
                </div>
                <div class="text-[11px] text-hwhub-muted">
                  <span v-if="m.role === 'OWNER'">{{
                    t('settings.household.members.table.roleOwner')
                  }}</span>
                  <span v-else> {{ t('settings.household.members.table.roleMember') }}</span>
                </div>
              </div>
            </div>

            <span
              v-if="m.userId === loginUserId"
              class="px-2 py-1 bg-hwhub-primary/10 text-hwhub-primary rounded text-xs"
            >
              {{ t('settings.household.members.table.you') }}
            </span>
          </div>

          <!-- ニックネーム -->
          <div class="text-sm text-hwhub-heading mb-1">
            <span class="font-semibold">{{
              t('settings.household.members.mobile.nicknameLabel')
            }}</span>
            {{ m.nickname || t('settings.household.members.table.nicknameNone') }}
          </div>

          <!-- ステータス -->
          <div class="text-sm text-hwhub-heading mb-2">
            <span class="font-semibold">
              {{ t('settings.household.members.mobile.statusLabel') }}</span
            >
            <span class="px-2 py-1 rounded text-xs font-medium" :class="statusBadgeClass(m.status)">
              {{ memberStatusLabel(m.status) }}
            </span>
          </div>

          <!-- 操作ボタン -->
          <div class="mt-2 flex justify-end">
            <button
              v-if="m.userId === loginUserId && !isOwnerInCurrentHousehold && m.status === '1'"
              type="button"
              class="px-3 py-1 rounded-full border text-[11px] text-red-600 hover:bg-red-50"
              @click="leaveHousehold"
            >
              {{ t('settings.household.members.actions.leave') }}
            </button>

            <button
              v-else-if="isOwnerInCurrentHousehold && m.userId !== loginUserId && m.status === '1'"
              type="button"
              class="px-3 py-1 rounded-full border text-[11px] text-red-600 hover:bg-red-50"
              @click="removeMember(m.userId)"
            >
              {{ t('settings.household.members.actions.remove') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. メンバー招待 -->
    <section class="bg-white rounded-lg shadow-sm p-4 border mt-6 space-y-4">
      <h2 class="text-sm font-semibold text-hwhub-heading">
        {{ t('settings.household.invite.title') }}
      </h2>

      <p class="text-xs text-hwhub-muted">
        {{ t('settings.household.invite.description') }}
      </p>

      <!-- 招待フォーム -->
      <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input
          v-model="inviteEmail"
          type="email"
          placeholder="you@example.com"
          class="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
        />
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
          :disabled="!inviteEmail.trim() || !currentHouseholdId || isSendingInvite"
          @click="sendInvitation"
        >
          {{ t('settings.household.invite.createButton') }}
        </button>
      </div>

      <!-- 招待一覧 -->
      <div class="mt-2">
        <h3 class="text-xs font-semibold text-hwhub-muted mb-1">
          {{ t('settings.household.invite.sentTitle') }}
        </h3>

        <p v-if="invitations.length === 0" class="text-xs text-hwhub-muted">
          {{ t('settings.household.invite.none') }}
        </p>

        <ul v-else class="space-y-2 text-sm">
          <li
            v-for="inv in invitations"
            :key="inv.invitationToken"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 bg-hwhub-surface-subtle"
          >
            <div class="flex-1 min-w-0">
              <!-- 1行目：招待先 + ステータス -->
              <div class="flex items-center gap-2">
                <span class="font-medium text-hwhub-heading truncate">
                  {{ inv.invitedEmail }}
                </span>
                <span
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]"
                  :class="invitationStatusClass(inv.status)"
                >
                  {{ invitationStatusLabel(inv.status) }}
                </span>
              </div>

              <!-- 2行目：誰が参加したか（ACCEPTED のときだけ） -->
              <p
                v-if="inv.status === '1' && inv.acceptedUserName"
                class="mt-0.5 text-[11px] text-hwhub-heading"
              >
                {{ t('settings.household.invite.joinedMemberLabel') }}
                <span class="font-semibold">
                  <!-- ニックネーム優先で表示 -->
                  {{ inv.acceptedUserName }}
                </span>
              </p>

              <!-- 3行目：有効期限 or 参加日時など -->
              <p class="text-[11px] text-hwhub-muted mt-0.5">
                {{
                  t('settings.household.invite.expiresLabel', {
                    date: inv.expiresAt?.slice(0, 16).replace('T', ' '),
                  })
                }}
              </p>
            </div>

            <!-- ボタン類：PENDING のときだけ -->
            <div class="flex items-center gap-2 shrink-0" v-if="inv.status === '0'">
              <button
                type="button"
                class="px-3 py-1 rounded-full border text-[11px] text-hwhub-heading hover:bg-white"
                @click="copyInviteLink(inv.invitationToken)"
              >
                {{ t('settings.household.invite.copyButton') }}
              </button>

              <button
                type="button"
                class="px-3 py-1 rounded-full border text-[11px] text-red-600 hover:bg-white"
                @click="revokeInvitation(inv.invitationToken)"
              >
                {{ t('settings.household.invite.revokeButton') }}
              </button>
            </div>
          </li>
        </ul>
      </div>
    </section>
    <!-- 世帯作成ダイアログ -->
    <HouseholdCreateDialog v-model="showCreateDialog" @create="handleCreateHousehold" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useUiStore } from '@/stores/uiStore'
import type { HouseholdModel } from '@/domain'
import { householdMemberApi } from '@/api/householdMemberApi'
import { useAuthStore } from '@/stores/authStore'
import HouseholdCreateDialog from '@/components/HouseholdCreateDialog.vue'
import { useHouseholdInvitationStore } from '@/stores/householdInvitationStore'
import { HOUSEHOLD_MEMBER_STATUS, INVITATION_STATUS } from '@/constants/code.constants'
import { useHouseholdCodes } from '@/composables/useHouseholdCodes'
import { useI18n } from 'vue-i18n'

const householdStore = useHouseholdStore()
const uiStore = useUiStore()
const authStore = useAuthStore()
const invitationStore = useHouseholdInvitationStore()
const { memberStatusLabel, invitationStatusLabel } = useHouseholdCodes()
const { t } = useI18n()

// 所属世帯と現在の世帯
const households = computed(() => householdStore.households)
const currentHouseholdId = computed(() => householdStore.currentHouseholdId)
const currentAllMembers = computed(() => householdStore.currentAllMembers)
const currentHousehold = computed(() => {
  return (
    householdStore.households.find(
      (h: HouseholdModel) => h.householdId === householdStore.currentHouseholdId,
    ) ?? null
  )
})

// ダイアログ関連
const showCreateDialog = ref(false)

const onClickAddHousehold = () => {
  showCreateDialog.value = true
}

const handleCreateHousehold = async (name: string) => {
  try {
    await uiStore.withLoading(async () => {
      await householdStore.createHousehold(name)
    })

    showCreateDialog.value = false
    uiStore.showToast('success', '新しい世帯を作成しました')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', '世帯の作成に失敗しました')
  }
}

// 画面のForm項目
const householdName = ref('')
const myNickname = ref('')
const originalHouseholdName = ref('')

// ステータス → 色クラス
const statusBadgeClass = (status: string) => {
  switch (status) {
    case HOUSEHOLD_MEMBER_STATUS.ACTIVE:
      return 'bg-green-100 text-green-700'
    case HOUSEHOLD_MEMBER_STATUS.INVITED:
      return 'bg-yellow-100 text-yellow-700'
    case HOUSEHOLD_MEMBER_STATUS.LEFT:
      return 'bg-gray-200 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const statusBorderClass = (status: string) => {
  switch (status) {
    case HOUSEHOLD_MEMBER_STATUS.ACTIVE: // 有効
      return 'border-l-4 border-l-green-400'
    case HOUSEHOLD_MEMBER_STATUS.INVITED: // 招待中
      return 'border-l-4 border-l-yellow-400'
    case HOUSEHOLD_MEMBER_STATUS.LEFT: // 離脱
      return 'border-l-4 border-l-gray-400'
    default:
      return 'border-l-4 border-l-gray-300'
  }
}

const loginUserId = computed(() => {
  const user = authStore.currentUser
  return user?.userId ?? user?.userId ?? null
})

const myMemberInCurrentHousehold = computed(() => {
  if (!currentHouseholdId.value || loginUserId.value == null) return null

  return currentAllMembers.value.find((m) => m.userId === loginUserId.value) ?? null
})

// currentHousehold が変わったら初期値をセット
watch(
  currentHousehold,
  (h) => {
    if (h) {
      householdName.value = h.name ?? ''
      originalHouseholdName.value = h.name ?? ''
    } else {
      householdName.value = ''
      originalHouseholdName.value = ''
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!currentHouseholdId.value) return

  await householdStore.fetchMembers(currentHouseholdId.value, { force: false })
  const me = myMemberInCurrentHousehold.value
  if (me) {
    myNickname.value = me.nickname ?? ''
  }
})

watch(myMemberInCurrentHousehold, (me) => {
  if (me) {
    myNickname.value = me.nickname ?? ''
  }
})

const onChangeHousehold = async (householdId: number) => {
  if (currentHouseholdId.value === householdId) return

  try {
    await uiStore.withLoading(async () => {
      await householdStore.setCurrentHousehold(householdId)
    })

    uiStore.showToast('success', '世帯を切り替えました')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', '世帯の切り替えに失敗しました')
  }
}

const canSaveHouseholdName = computed(() => {
  const trimmed = householdName.value.trim()
  if (!currentHousehold.value) return false
  if (!trimmed) return false
  return trimmed !== (originalHouseholdName.value ?? '')
})

// ニックネーム保存ボタンの活性制御
const canSaveNickname = computed(() => {
  return !!currentHousehold.value && myNickname.value.trim().length > 0
})

// 世帯名保存
const onSaveHouseholdName = async () => {
  if (!currentHousehold.value) return

  const householdId = currentHousehold.value.householdId
  const name = householdName.value.trim()

  try {
    await uiStore.withLoading(async () => {
      await householdStore.updateHouseholdName(householdId, name)
      // store が更新した値をローカルの「元値」にも反映
      originalHouseholdName.value = name
    })

    uiStore.showToast('success', '世帯名を保存しました')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', '世帯名の保存に失敗しました')
  }
}

// ニックネーム保存
const onSaveNickname = async () => {
  if (!currentHousehold.value) return

  const householdId = currentHousehold.value.householdId

  try {
    await uiStore.withLoading(async () => {
      await householdMemberApi.updateMyNickname(householdId, myNickname.value.trim())
      // （任意）householdStore 側にも反映したければここで更新
      // 例：householdStore.updateMyNickname(currentHousehold.value.id, myNickname.value.trim())
    })
    await householdStore.fetchMembers(householdId, { force: true })
    uiStore.showToast('success', 'ニックネームを保存しました')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', 'ニックネームの保存に失敗しました')
  }
}

const isOwnerInCurrentHousehold = computed(() => {
  const me = myMemberInCurrentHousehold.value
  return me?.role === 'OWNER'
})

// 世帯からの離脱
const leaveHousehold = async () => {
  if (!currentHouseholdId.value || !loginUserId.value) return

  if (!confirm('この世帯から離脱しますか？\n家事の担当からも外れます。')) {
    return
  }

  try {
    await uiStore.withLoading(async () => {
      await householdStore.leaveMyself(currentHouseholdId.value!)
    })
    uiStore.showToast('success', 'この世帯から離脱しました')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', '離脱に失敗しました')
  }
}

// 世帯からの離脱(Owner用)
const removeMember = async (userId: number) => {
  if (!currentHouseholdId.value) return
  if (!isOwnerInCurrentHousehold.value) return

  const target = currentAllMembers.value.find((m) => m.userId === userId)
  if (!target) return

  if (!confirm(`「${target.displayName}」さんをこの世帯から削除しますか？`)) return

  try {
    await uiStore.withLoading(async () => {
      await householdMemberApi.removeMember(currentHouseholdId.value!, userId)
    })
    uiStore.showToast('success', 'メンバーを世帯から削除しました')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', 'メンバーの削除に失敗しました')
  }
}

// 招待フォーム
const inviteEmail = ref('')
const isSendingInvite = ref(false)

const invitations = computed(() =>
  currentHouseholdId.value ? invitationStore.byHousehold(currentHouseholdId.value) : [],
)

const invitationStatusClass = (status: string) => {
  switch (status) {
    case INVITATION_STATUS.PENDING:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case INVITATION_STATUS.ACCEPTED:
      return 'bg-hwhub-surface-subtle text-hwhub-heading border-gray-200'
    case INVITATION_STATUS.DECLINED:
    case INVITATION_STATUS.REVOKED:
    case INVITATION_STATUS.EXPIRED:
      return 'bg-gray-50 text-hwhub-muted border-gray-200'
    default:
      return 'bg-gray-50 text-hwhub-muted border-gray-200'
  }
}

// 招待リンク（フロントの /invite/:token を前提）
const buildInviteUrl = (token: string) => {
  return `${window.location.origin}/invite/${token}`
}

const copyInviteLink = async (token: string) => {
  const url = buildInviteUrl(token)
  try {
    await navigator.clipboard.writeText(url)
    uiStore.showToast('success', '招待リンクをコピーしました')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', 'クリップボードへのコピーに失敗しました')
  }
}

const sendInvitation = async () => {
  const email = inviteEmail.value.trim()
  if (!email || !currentHouseholdId.value) return

  isSendingInvite.value = true
  try {
    await invitationStore.createInvitation(currentHouseholdId.value, email)
    inviteEmail.value = ''
    uiStore.showToast('success', '招待リンクを作成しました')
  } catch {
    uiStore.showToast('error', '招待リンクの作成に失敗しました')
  } finally {
    isSendingInvite.value = false
  }
}

const revokeInvitation = async (token: string) => {
  if (!currentHouseholdId.value) return
  if (!confirm('この招待を取り消しますか？')) return

  try {
    await invitationStore.revokeInvitation(currentHouseholdId.value, token)
    uiStore.showToast('success', '招待を取り消しました')
  } catch {
    uiStore.showToast('error', '招待の取り消しに失敗しました')
  }
}

// 初回＆世帯切り替え時に読み込み
onMounted(() => {
  if (currentHouseholdId.value) {
    invitationStore.fetchByHousehold(currentHouseholdId.value, { force: true })
  }
})

watch(currentHouseholdId, (newId) => {
  if (newId) {
    invitationStore.fetchByHousehold(newId, { force: true })
  }
})
</script>
