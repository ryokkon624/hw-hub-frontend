<template>
  <!-- スケルトンスクリーン共通コンポーネント -->
  <div :class="containerClass" role="status" aria-busy="true">
    <div v-for="i in resolvedCount" :key="i" class="animate-pulse" :class="itemClass">
      <!-- task-card: 家事割り当て画面の行 -->
      <template v-if="variant === 'task-card'">
        <div
          class="flex items-start gap-3 rounded-lg border border-hwhub-border bg-white px-3 py-2 w-full"
        >
          <!-- アイコン -->
          <div class="mt-0.5 h-9 w-9 rounded-full bg-slate-200 shrink-0" />
          <!-- テキスト -->
          <div class="flex-1 space-y-2 min-w-0">
            <div class="h-3 w-2/3 rounded bg-slate-200" />
            <div class="h-2.5 w-1/3 rounded bg-slate-100" />
          </div>
          <!-- 担当セレクト（右側） -->
          <div class="shrink-0 h-6 w-20 rounded-full bg-slate-200" />
        </div>
      </template>

      <!-- task-row: My Tasks画面のカード -->
      <template v-else-if="variant === 'task-row'">
        <div class="rounded-lg border border-hwhub-border bg-white p-3 w-full space-y-2">
          <div class="flex items-center justify-between gap-2">
            <div class="h-3.5 w-1/2 rounded bg-slate-200" />
          </div>
          <div class="flex justify-end gap-2">
            <div class="h-6 w-14 rounded-full bg-slate-100" />
            <div class="h-6 w-14 rounded-full bg-slate-200" />
          </div>
        </div>
      </template>

      <!-- shopping-item: 買い物リスト画面のアイテム -->
      <template v-else-if="variant === 'shopping-item'">
        <div
          class="rounded-xl border border-hwhub-border bg-white px-3 py-2.5 flex items-start gap-3 w-full"
        >
          <div class="flex-1 space-y-2 min-w-0">
            <div class="h-3 w-3/4 rounded bg-slate-200" />
            <div class="h-2.5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const DEFAULT_COUNT: Record<string, number> = {
  'task-card': 5,
  'task-row': 4,
  'shopping-item': 5,
}

const props = withDefaults(
  defineProps<{
    variant: 'task-card' | 'task-row' | 'shopping-item'
    count?: number
  }>(),
  {
    count: undefined,
  },
)

const resolvedCount = computed(() => props.count ?? DEFAULT_COUNT[props.variant] ?? 3)

const containerClass = computed(() => 'space-y-2 w-full')

const itemClass = computed(() => 'w-full')
</script>
