<template>
  <div class="space-y-4 w-full">
    <!-- 説明 -->
    <section class="text-sm text-hwhub-muted">
      {{ t('assign.intro') }}
    </section>

    <!-- SP 用 世帯スイッチャー -->
    <HouseholdSwitcherField class="sm:hidden" />

    <!-- メンバー別サマリー -->
    <section class="rounded-xl border bg-white p-3 shadow-sm space-y-2">
      <h3 class="text-xs font-semibold text-hwhub-muted">{{ t('assign.summary.heading') }}</h3>

      <!-- flex-wrap で折り返しレイアウト -->
      <div class="flex flex-wrap gap-2 mt-1">
        <!-- 未割当 pill -->
        <div
          class="flex items-center gap-2 rounded-full border px-3 py-1 bg-hwhub-accent-soft border-hwhub-accent transition-colors cursor-pointer"
          :class="
            draggingOverTargetId === 'UNASSIGNED' ? 'ring-2 ring-hwhub-primary ring-offset-1' : ''
          "
          @dragover.prevent
          @dragenter.prevent="onDragEnterTarget('UNASSIGNED')"
          @dragleave.prevent="onDragLeaveTarget('UNASSIGNED')"
          @drop.prevent="onDropToTarget('UNASSIGNED')"
        >
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-hwhub-accent-badge text-[11px] text-hwhub-accent-badge"
          >
            {{ t('assign.summary.unassignedBadge') }}
          </span>
          <div class="flex flex-col">
            <span class="text-[11px] text-hwhub-muted">
              {{ t('assign.summary.unassignedLabel') }}</span
            >
            <span class="text-sm font-semibold text-hwhub-heading">
              {{ unassignedTasks.length }}
            </span>
          </div>
        </div>

        <!-- メンバー別 -->
        <div
          v-for="s in memberSummaries"
          :key="s.member.userId"
          class="flex items-center gap-2 rounded-full border px-3 py-1 min-w-22 transition-colors cursor-pointer"
          :class="[
            s.member.userId === loginUserId
              ? 'bg-hwhub-primary-50 border-hwhub-primary'
              : 'bg-white border-hwhub-border',
            draggingOverTargetId === s.member.userId
              ? 'ring-2 ring-hwhub-primary ring-offset-1'
              : '',
          ]"
          @dragover.prevent
          @dragenter.prevent="onDragEnterTarget(s.member.userId)"
          @dragleave.prevent="onDragLeaveTarget(s.member.userId)"
          @drop.prevent="onDropToTarget(s.member.userId)"
        >
          <div
            class="h-6 w-6 rounded-full bg-hwhub-surface-subtle flex items-center justify-center text-[11px] font-semibold text-hwhub-muted overflow-hidden"
          >
            <img
              v-if="s.member.iconUrl"
              :src="s.member.iconUrl"
              :alt="t('assign.avatarAlt')"
              class="w-full h-full object-cover"
            />
            <span v-else>
              {{ avatarLabel(s.member) }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-[11px] text-hwhub-muted">
              {{ s.member.nickname || s.member.displayName }}
            </span>
            <span class="text-sm font-semibold text-hwhub-heading">
              {{ s.count }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 上部バー：件数 + フィルタ -->
    <section class="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <span class="text-hwhub-muted">
            {{
              t('assign.summary.tasksLabel', {
                total: allTasks.length,
                unassigned: unassignedTasks.length,
              })
            }}
          </span>
        </div>

        <!-- 過去の未割当スキップ -->
        <div v-if="pastUnassignedTasks.length > 0" class="flex items-center gap-2 mt-0.5">
          <span class="text-hwhub-muted">
            {{ t('assign.bulk.pastUnassignedCount', { count: pastUnassignedTasks.length }) }}
          </span>
          <button
            type="button"
            class="px-3 py-1 rounded-full text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600"
            @click="bulkSkipPastUnassigned"
          >
            {{ t('assign.bulk.skipButton') }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-hwhub-muted">{{ t('assign.filter.label') }}</span>
        <div class="inline-flex rounded-full border bg-hwhub-surface-subtle p-0.5">
          <button
            type="button"
            class="px-3 py-1 rounded-full"
            :class="
              assigneeFilter === 'ALL'
                ? 'bg-white text-hwhub-heading shadow-sm'
                : 'text-hwhub-muted'
            "
            @click="assigneeFilter = 'ALL'"
          >
            {{ t('assign.filter.all') }}
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-full"
            :class="
              assigneeFilter === 'UNASSIGNED'
                ? 'bg-white text-hwhub-heading shadow-sm'
                : 'text-hwhub-muted'
            "
            @click="assigneeFilter = 'UNASSIGNED'"
          >
            {{ t('assign.filter.unassignedOnly') }}
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-full"
            :class="
              assigneeFilter === 'MINE_AND_UNASSIGNED'
                ? 'bg-white text-hwhub-heading shadow-sm'
                : 'text-hwhub-muted'
            "
            @click="assigneeFilter = 'MINE_AND_UNASSIGNED'"
          >
            {{ t('assign.filter.mineAndUnassigned') }}
          </button>
        </div>
      </div>
    </section>

    <!-- リスト本体 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-2">
      <div v-if="visibleTasks.length === 0" class="text-xs text-hwhub-muted">
        {{ t('assign.list.empty') }}
      </div>

      <ul v-else class="space-y-2 w-full">
        <li
          v-for="task in visibleTasks"
          :key="task.houseworkTaskId"
          class="flex items-start gap-3 rounded-lg border px-3 py-2 text-sm w-full max-w-full overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-150"
          :class="[
            task.assigneeUserId == null
              ? 'bg-hwhub-accent-soft border-hwhub-accent'
              : 'bg-white hover:bg-hwhub-surface-subtle',
            draggingTaskId === task.houseworkTaskId ? 'opacity-60 shadow-md scale-[0.99]' : '',
            recentlyUpdatedTaskId === task.houseworkTaskId ? 'hw-fade-in' : '',
          ]"
          draggable="true"
          @dragstart="onTaskDragStart(task.houseworkTaskId)"
          @dragend="onTaskDragEnd"
        >
          <!-- 左：家事アイコン（未割当 or メンバーアイコン） -->
          <div
            class="mt-0.5 h-9 w-9 flex items-center justify-center rounded-full overflow-hidden shrink-0"
          >
            <!-- 未割当 -->
            <div
              v-if="task.assigneeUserId == null"
              class="h-9 w-9 flex items-center justify-center rounded-full bg-hwhub-accent-badge text-[11px] font-semibold text-hwhub-accent-badge"
            >
              {{ t('assign.list.unassignedBadge') }}
            </div>

            <!-- 担当あり：メンバーアイコン or 頭文字 -->
            <div
              v-else
              class="h-9 w-9 flex items-center justify-center rounded-full bg-hwhub-surface-subtle text-[11px] font-semibold text-hwhub-muted overflow-hidden"
            >
              <img
                v-if="getMemberForTask(task)?.iconUrl"
                :src="getMemberForTask(task)?.iconUrl || undefined"
                alt="icon"
                class="w-full h-full object-cover"
              />
              <span v-else>
                {{ avatarLabel(getMemberForTask(task)) }}
              </span>
            </div>
          </div>

          <!-- 中央：家事名 + 日付 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-hwhub-heading wrap-break-words">
              {{ task.houseworkName }}
            </p>
            <p class="mt-0.5 text-[11px] text-hwhub-muted">
              {{ t('assign.list.executionDate', { date: task.targetDate }) }}
            </p>
          </div>

          <!-- 右：担当セレクト + 自分にする -->
          <div class="shrink-0 flex flex-col items-end gap-1 min-w-24">
            <div
              class="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-1 sm:gap-2 w-full"
            >
              <button
                v-if="loginUserId && task.assigneeUserId !== loginUserId"
                type="button"
                class="w-full sm:w-auto text-[11px] px-2 py-1 rounded-full border border-hwhub-primary text-hwhub-primary hover:bg-hwhub-primary-50 text-center"
                @click="assignToMe(task)"
              >
                {{ t('assign.list.assignToMe') }}
              </button>

              <select
                class="w-full sm:w-auto rounded-full border px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary-50"
                :value="task.assigneeUserId ?? ''"
                @change="
                  (e) => {
                    const value = (e.target as HTMLSelectElement).value
                    const newId = value === '' ? null : Number(value)
                    changeAssignee(task, newId)
                  }
                "
              >
                <option value="">{{ t('assign.list.selectUnassigned') }}</option>
                <option v-for="m in members" :key="m.userId" :value="m.userId">
                  {{ m.nickname || m.displayName }}
                </option>
              </select>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkTaskStore } from '@/stores/houseworkTaskStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import HouseholdSwitcherField from '@/components/HouseholdSwitcherField.vue'
import type { HouseworkTaskModel, HouseholdMember } from '@/domain'
import { TASK_ASSIGN_REASON, TASK_STATUS } from '@/constants/code.constants'
import { useOpenHouseworkTasks } from '@/composables/useOpenHouseworkTasks'
import { toYmd } from '@/utils/dateUtils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const householdStore = useHouseholdStore()
const taskStore = useHouseworkTaskStore()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { currentHouseholdId, allOpenTasks, fetchOpenTasks } = useOpenHouseworkTasks()

const loginUserId = computed(() => authStore.currentUser?.userId ?? null)

// 表示対象フィルタ
const assigneeFilter = ref<'ALL' | 'UNASSIGNED' | 'MINE_AND_UNASSIGNED'>('UNASSIGNED')

// その世帯の未対応タスク（fetchTasks で status: '0' を取っている前提）
const allTasks = computed<HouseworkTaskModel[]>(() => allOpenTasks.value)

// メンバー一覧（担当セレクト／アバター用）
const members = computed<HouseholdMember[]>(() => householdStore.currentMembers)

// 未割当 / 担当あり / 自分担当
const unassignedTasks = computed(() => allTasks.value.filter((t) => t.assigneeUserId == null))

const myTasks = computed(() => allTasks.value.filter((t) => t.assigneeUserId === loginUserId.value))

// 過去の未割当タスク（targetDate < today かつ assigneeUserId == null）
const todayYmd = computed(() => toYmd(new Date()))
const pastUnassignedTasks = computed<HouseworkTaskModel[]>(() =>
  allTasks.value.filter((t) => t.assigneeUserId == null && t.targetDate < todayYmd.value),
)

// メンバー別件数サマリー
type MemberSummary = {
  member: HouseholdMember
  count: number
}

const memberSummaries = computed<MemberSummary[]>(() => {
  if (!members.value.length) return []

  return members.value.map((m) => ({
    member: m,
    count: allTasks.value.filter((t) => t.assigneeUserId === m.userId).length,
  }))
})

// フィルタ適用後に表示するタスク
const visibleTasks = computed<HouseworkTaskModel[]>(() => {
  if (assigneeFilter.value === 'UNASSIGNED') {
    return unassignedTasks.value
  }
  if (assigneeFilter.value === 'MINE_AND_UNASSIGNED') {
    const set = new Set<number>()
    const merged: HouseworkTaskModel[] = []
    for (const t of unassignedTasks.value) {
      set.add(t.houseworkTaskId)
      merged.push(t)
    }
    for (const t of myTasks.value) {
      if (!set.has(t.houseworkTaskId)) {
        merged.push(t)
      }
    }
    return merged
  }
  // ALL
  return allTasks.value
})

// タスクの担当メンバー取得
const getMemberForTask = (task: HouseworkTaskModel): HouseholdMember | null => {
  if (task.assigneeUserId == null) return null
  return members.value.find((m) => m.userId === task.assigneeUserId) ?? null
}

// アバターのラベル（ニックネーム or 表示名の先頭2文字）
const avatarLabel = (member: HouseholdMember | null): string => {
  if (!member) return ''
  const base = member.nickname || member.displayName || ''
  return base.slice(0, 2)
}

// タスク取得
const fetchTasks = async () => {
  if (!currentHouseholdId.value) return
  try {
    await uiStore.withLoading(async () => {
      await fetchOpenTasks({ force: true })
    })
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('assign.messages.fetchError'))
  }
}

onMounted(fetchTasks)

watch(
  () => currentHouseholdId.value,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return
    await fetchTasks()
  },
)

// 担当変更（既存のロジック名に合わせてください）
const changeAssignee = async (task: HouseworkTaskModel, newUserId: number | null) => {
  if (!currentHouseholdId.value) return
  try {
    await uiStore.withLoading(async () => {
      // TODO: 自発的か押しつけかロジック追加する
      await taskStore.updateAssignee(
        task.houseworkTaskId,
        newUserId,
        TASK_ASSIGN_REASON.SELF_ASSIGNED,
      )
    })
    uiStore.showToast('success', t('assign.messages.assigneeUpdateSuccess'))
  } catch {
    uiStore.showToast('error', t('assign.messages.assigneeUpdateError'))
  }
}

// 自分にする
const assignToMe = async (task: HouseworkTaskModel) => {
  if (!loginUserId.value) return
  // すでに自分なら何もしない
  if (task.assigneeUserId === loginUserId.value) return
  await changeAssignee(task, loginUserId.value)
}

// 過去の未割当タスク一括スキップ
const bulkSkipPastUnassigned = async () => {
  if (pastUnassignedTasks.value.length === 0) return

  const ok = window.confirm(
    t('assign.bulk.confirmSkip', { count: pastUnassignedTasks.value.length }),
  )
  if (!ok) return

  try {
    const taskIds = pastUnassignedTasks.value.map((t) => t.houseworkTaskId)
    await uiStore.withLoading(async () => {
      await taskStore.bulkUpdateStatus(taskIds, TASK_STATUS.SKIPPED, 'bulk update')
    })
    uiStore.showToast('success', t('assign.bulk.skipSuccess'))
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('assign.bulk.skipError'))
  }
}

// ----------------------
// DnD関連
// ----------------------
const draggingTaskId = ref<number | null>(null)
const draggingOverTargetId = ref<'UNASSIGNED' | number | null>(null)
const recentlyUpdatedTaskId = ref<number | null>(null)

// ドラッグ開始
const onTaskDragStart = (taskId: number) => {
  draggingTaskId.value = taskId
}

// ドラッグ終了（どこにもドロップされなかった場合も含む）
const onTaskDragEnd = () => {
  draggingTaskId.value = null
  draggingOverTargetId.value = null
}

// ドロップターゲットにマウスが乗っている間のハイライト制御
const onDragEnterTarget = (targetId: 'UNASSIGNED' | number) => {
  if (draggingTaskId.value == null) return
  draggingOverTargetId.value = targetId
}

const onDragLeaveTarget = (targetId: 'UNASSIGNED' | number) => {
  if (draggingOverTargetId.value === targetId) {
    draggingOverTargetId.value = null
  }
}

// ピルへのドロップ処理
const onDropToTarget = async (targetId: 'UNASSIGNED' | number) => {
  if (draggingTaskId.value == null) return

  const task = allTasks.value.find((t) => t.houseworkTaskId === draggingTaskId.value)
  if (!task) {
    onTaskDragEnd()
    return
  }

  const newUserId = targetId === 'UNASSIGNED' ? null : (targetId as number)

  if (task.assigneeUserId === newUserId) {
    onTaskDragEnd()
    return
  }

  await changeAssignee(task, newUserId)

  // フェードイン用のフラグを立てる
  recentlyUpdatedTaskId.value = task.houseworkTaskId
  setTimeout(() => {
    if (recentlyUpdatedTaskId.value === task.houseworkTaskId) {
      recentlyUpdatedTaskId.value = null
    }
  }, 250)

  onTaskDragEnd()
}
</script>
<style scoped>
@keyframes hw-fade-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.hw-fade-in {
  animation: hw-fade-in 0.25s ease-out;
}
</style>
