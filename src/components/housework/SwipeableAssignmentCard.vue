<template>
  <!-- スワイプ可能な家事割り当てカード（SP版）: 背景レイヤー＋前面レイヤーの2層構成 -->
  <div ref="containerRef" class="relative overflow-hidden rounded-xl">
    <!-- 背景レイヤー（スワイプ方向に応じた色とアイコン） -->
    <div
      class="absolute inset-0 flex items-center justify-between px-5 rounded-xl"
      :class="backgroundClass"
    >
      <!-- 左側（右スワイプ: メンバーへ） -->
      <div class="flex flex-col items-center gap-1 text-white">
        <!-- 不透明度20%の大きいアイコン -->
        <Users class="w-10 h-10 opacity-20" />
      </div>
      <!-- 中央の白文字ラベル（右スワイプ時） -->
      <div
        v-if="swipeState === 'dragging-right'"
        class="absolute inset-0 flex items-center justify-start pl-8"
      >
        <span class="text-white text-sm font-bold">{{ t('assign.swipe.members') }}</span>
      </div>
      <!-- 中央の白文字ラベル（左スワイプ時） -->
      <div
        v-if="swipeState === 'dragging-left'"
        class="absolute inset-0 flex items-center justify-end pr-8"
      >
        <span class="text-white text-sm font-bold">{{ t('assign.swipe.self') }}</span>
      </div>
      <!-- 右側（左スワイプ: 自分にする） -->
      <div class="flex flex-col items-center gap-1 text-white">
        <!-- 不透明度20%の大きいアイコン -->
        <UserCheck class="w-10 h-10 opacity-20" />
      </div>
    </div>

    <!-- 前面レイヤー（カード本体、translateXでドラッグ追従） -->
    <div
      class="relative rounded-xl border p-3 shadow-sm flex flex-col gap-2 bg-hwhub-surface-card"
      :style="{ transform: `translateX(${translateX}px)` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, UserCheck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useSwipeGesture } from '@/composables/useSwipeGesture'

const emit = defineEmits<{
  /** 左スワイプ: 自分にする */
  'swipe-self': []
  /** 右スワイプ: メンバー選択モーダル起動 */
  'swipe-members': []
}>()

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)

const { translateX, swipeState } = useSwipeGesture(
  containerRef,
  () => emit('swipe-self'),
  () => emit('swipe-members'),
)

const backgroundClass = computed(() => {
  if (swipeState.value === 'dragging-right') return 'bg-hwhub-swipe-members'
  if (swipeState.value === 'dragging-left') return 'bg-hwhub-swipe-self'
  return 'bg-transparent'
})
</script>
