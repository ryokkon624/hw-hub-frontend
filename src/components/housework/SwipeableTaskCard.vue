<template>
  <!-- スワイプ可能な家事タスクカード（SP版）: 背景レイヤー＋前面レイヤーの2層構成 -->
  <div ref="containerRef" class="relative overflow-hidden rounded-xl">
    <!-- 背景レイヤー（スワイプ方向に応じた色とアイコン） -->
    <div
      class="absolute inset-0 flex items-center justify-between px-5 rounded-xl"
      :class="backgroundClass"
    >
      <!-- 左側（右スワイプ: 完了） -->
      <div class="flex flex-col items-center gap-1 text-white">
        <!-- 不透明度20%の大きいアイコン -->
        <CheckCheck class="w-10 h-10 opacity-20" />
      </div>
      <!-- 中央の白文字ラベル -->
      <div
        v-if="swipeState === 'dragging-right'"
        class="absolute inset-0 flex items-center justify-start pl-8"
      >
        <span class="text-white text-sm font-bold">{{ t('myTasks.swipe.done') }}</span>
      </div>
      <div
        v-if="swipeState === 'dragging-left'"
        class="absolute inset-0 flex items-center justify-end pr-8"
      >
        <span class="text-white text-sm font-bold">{{ t('myTasks.swipe.skip') }}</span>
      </div>
      <!-- 右側（左スワイプ: スキップ） -->
      <div class="flex flex-col items-center gap-1 text-white">
        <!-- 不透明度20%の大きいアイコン -->
        <CircleMinus class="w-10 h-10 opacity-20" />
      </div>
    </div>

    <!-- 前面レイヤー（カード本体、translateXでドラッグ追従） -->
    <div
      class="relative rounded-xl border p-3 shadow-sm flex flex-col gap-2 bg-hwhub-surface-card"
      :class="cardBorderClass"
      :style="{ transform: `translateX(${translateX}px)` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCheck, CircleMinus } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useSwipeGesture } from '@/composables/useSwipeGesture'

const props = defineProps<{
  /** 今日のタスクかどうか（ボーダー色の切り替えに使用） */
  isToday?: boolean
  /** 過去タスクかどうか（ボーダー色の切り替えに使用） */
  isPast?: boolean
}>()

const emit = defineEmits<{
  'swipe-right': []
  'swipe-left': []
}>()

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)

const { translateX, swipeState } = useSwipeGesture(
  containerRef,
  () => emit('swipe-left'),
  () => emit('swipe-right'),
)

const backgroundClass = computed(() => {
  if (swipeState.value === 'dragging-right') return 'bg-hwhub-swipe-action'
  if (swipeState.value === 'dragging-left') return 'bg-hwhub-swipe-back'
  return 'bg-transparent'
})

const cardBorderClass = computed(() => {
  if (props.isPast) return 'border-hwhub-palette-rose bg-hwhub-palette-rose-soft'
  if (props.isToday) return 'bg-hwhub-palette-emerald-soft border-hwhub-palette-emerald'
  return 'bg-hwhub-surface-card'
})
</script>
