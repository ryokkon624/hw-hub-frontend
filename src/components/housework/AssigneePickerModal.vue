<template>
  <!-- ボトムシート風モーダル（下からせり上がるアニメーション） -->
  <!-- オーバーレイ -->
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/40 z-40"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>
    <Transition name="sheet-slide">
      <div
        v-if="modelValue"
        class="fixed bottom-0 left-0 right-0 z-50 bg-hwhub-surface-card rounded-t-2xl shadow-xl pb-safe"
      >
        <!-- ドラッグハンドル -->
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-hwhub-swipe-disabled" />
        </div>

        <!-- タイトル -->
        <div class="px-4 py-3 border-b border-hwhub-border">
          <h3 class="text-base font-semibold text-hwhub-heading text-center">
            {{ t('assign.picker.title') }}
          </h3>
        </div>

        <!-- メンバーリスト -->
        <div class="px-4 py-3 flex flex-wrap gap-2 max-h-72 overflow-y-auto">
          <!-- 未割当ピル -->
          <button
            type="button"
            class="flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors bg-hwhub-accent-soft border-hwhub-accent active:opacity-70"
            @click="onSelect(null)"
          >
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-hwhub-accent-badge text-[11px] font-semibold text-hwhub-accent-badge shrink-0"
            >
              {{ t('assign.list.unassignedBadge') }}
            </span>
            <span class="text-hwhub-heading font-medium">{{ t('assign.picker.unassigned') }}</span>
          </button>

          <!-- メンバーピル -->
          <button
            v-for="member in members"
            :key="member.userId"
            type="button"
            class="flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors bg-hwhub-surface-card border-hwhub-border active:opacity-70"
            :class="
              member.userId === currentAssigneeUserId
                ? 'ring-2 ring-hwhub-primary bg-hwhub-primary-50'
                : ''
            "
            @click="onSelect(member.userId)"
          >
            <UserAvatar
              :iconUrl="member.iconUrl ?? null"
              :label="avatarLabel(member)"
              size="sm"
              :alt="t('assign.avatarAlt')"
            />
            <span class="text-hwhub-heading font-medium">{{
              member.nickname || member.displayName
            }}</span>
          </button>
        </div>

        <!-- 下部余白（iOSのセーフエリア対応） -->
        <div class="h-4" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import type { HouseholdMember } from '@/domain'

const props = defineProps<{
  /** モーダルの表示状態 */
  modelValue: boolean
  /** おうちのメンバー一覧 */
  members: HouseholdMember[]
  /** 現在の担当者ID（ハイライト用） */
  currentAssigneeUserId?: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  /** 担当者が選択された */
  select: [userId: number | null]
}>()

const { t } = useI18n()

/** アバターのラベル（ニックネーム or 表示名の先頭2文字） */
const avatarLabel = (member: HouseholdMember): string => {
  const base = member.nickname || member.displayName || ''
  return base.slice(0, 2)
}

/** メンバーまたは未割当を選択 */
const onSelect = (userId: number | null) => {
  emit('select', userId)
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* オーバーレイのフェードイン/アウト */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 250ms ease-out;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ボトムシートの下からせり上がり */
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 250ms ease-out;
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>
