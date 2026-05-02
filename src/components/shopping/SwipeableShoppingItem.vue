<template>
  <!-- スワイプ可能なアイテム（SP版）: 背景レイヤー＋前面レイヤーの2層構成 -->
  <div ref="containerRef" class="relative overflow-hidden rounded-xl">
    <!-- 背景レイヤー（スワイプ方向に応じた色とアイコン） -->
    <div
      class="absolute inset-0 flex items-center justify-between px-5 rounded-xl"
      :class="backgroundClass"
    >
      <!-- 右側の背景アイコン（右スワイプ） -->
      <div class="flex items-center gap-1 text-white text-xs font-semibold">
        <component :is="leftBackgroundIcon" class="w-5 h-5" />
        <span>{{ leftBackgroundLabel }}</span>
      </div>
      <!-- 左側の背景アイコン（左スワイプ） -->
      <div class="flex items-center gap-1 text-white text-xs font-semibold">
        <span>{{ rightBackgroundLabel }}</span>
        <component :is="rightBackgroundIcon" class="w-5 h-5" />
      </div>
    </div>

    <!-- 前面レイヤー（アイテム本体、translateXでドラッグ追従） -->
    <div
      class="relative group rounded-xl border border-hwhub-border bg-hwhub-surface-card px-3 py-2.5 flex items-start gap-3 shadow-sm transition-transform duration-100"
      :class="storeTypeBorderClass(item.storeType)"
      :style="{ transform: `translateX(${translateX}px)` }"
      @click="onItemClick"
    >
      <!-- テキスト -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 min-w-0">
          <!-- 左：タイトル＋メモ -->
          <div class="flex-1 min-w-0 flex flex-col justify-center min-h-10">
            <p class="text-[13px] font-semibold leading-snug line-clamp-2">
              {{ item.name }}
            </p>
            <p
              v-if="item.memo"
              class="mt-0.5 text-[11px] text-hwhub-muted leading-snug line-clamp-2"
            >
              {{ item.memo }}
            </p>
          </div>

          <!-- 右上：画像アイコン（あるときだけ） -->
          <div v-if="item.hasImage" class="shrink-0 ml-1 mt-0.5">
            <span
              class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-hwhub-surface-subtle text-hwhub-muted"
            >
              <Camera class="w-3 h-3 text-hwhub-muted" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Camera, ShoppingCart, Trash2, ListRestart, Wallet } from 'lucide-vue-next'
import type { ShoppingItemModel } from '@/domain'
import { useSwipeGesture, type UseSwipeGestureOptions } from '@/composables/useSwipeGesture'
import { useShoppingCodes } from '@/composables/useShoppingCodes'
import { SHOPPING_ITEM_STATUS } from '@/constants/code.constants'

const props = defineProps<{
  item: ShoppingItemModel
}>()

const emit = defineEmits<{
  swipeRight: []
  swipeLeft: []
  click: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const { storeTypeBorderClass } = useShoppingCodes()

/**
 * 購入済みアイテムは右スワイプを無効化する。
 * item.status は動的に変わりうるため reactive で管理する。
 */
const swipeOptions = reactive<UseSwipeGestureOptions>({
  disableRight: props.item.status === SHOPPING_ITEM_STATUS.PURCHASED,
})

watch(
  () => props.item.status,
  (status) => {
    swipeOptions.disableRight = status === SHOPPING_ITEM_STATUS.PURCHASED
  },
)

const { translateX, swipeState } = useSwipeGesture(
  containerRef,
  () => emit('swipeLeft'),
  () => emit('swipeRight'),
  swipeOptions,
)

/**
 * ステータスに応じた背景色・アイコン・ラベル定義
 *
 * 未購入（NOT_PURCHASED）:
 *   - 右スワイプ → かごへ（緑 / shopping-cart）
 *   - 左スワイプ → 削除（赤 / trash-2）
 *
 * かご（IN_BASKET）:
 *   - 右スワイプ → 購入済み（緑 / wallet）
 *   - 左スワイプ → 未購入に戻す（グレー / list-restart）
 *
 * 購入済み（PURCHASED）:
 *   - 右スワイプ → 無効（disableRight: true）
 *   - 左スワイプ → グレー背景＋メッセージ表示のみ
 */
const leftBackgroundIcon = computed(() => {
  if (props.item.status === SHOPPING_ITEM_STATUS.NOT_PURCHASED) return ShoppingCart
  if (props.item.status === SHOPPING_ITEM_STATUS.IN_BASKET) return Wallet
  return null
})

const leftBackgroundLabel = computed(() => {
  if (props.item.status === SHOPPING_ITEM_STATUS.NOT_PURCHASED) return ''
  if (props.item.status === SHOPPING_ITEM_STATUS.IN_BASKET) return ''
  return ''
})

const rightBackgroundIcon = computed(() => {
  if (props.item.status === SHOPPING_ITEM_STATUS.NOT_PURCHASED) return Trash2
  if (props.item.status === SHOPPING_ITEM_STATUS.IN_BASKET) return ListRestart
  return null
})

const rightBackgroundLabel = computed(() => '')

const backgroundClass = computed(() => {
  if (swipeState.value === 'dragging-right') {
    if (props.item.status === SHOPPING_ITEM_STATUS.NOT_PURCHASED) return 'bg-hwhub-swipe-action'
    if (props.item.status === SHOPPING_ITEM_STATUS.IN_BASKET) return 'bg-hwhub-swipe-action'
    return 'bg-hwhub-swipe-back'
  }
  if (swipeState.value === 'dragging-left') {
    if (props.item.status === SHOPPING_ITEM_STATUS.NOT_PURCHASED) return 'bg-hwhub-swipe-delete'
    if (props.item.status === SHOPPING_ITEM_STATUS.IN_BASKET) return 'bg-hwhub-swipe-back'
    // 購入済みアイテムの左スワイプ背景: グレー系
    return 'bg-hwhub-swipe-back'
  }
  return 'bg-transparent'
})

const onItemClick = () => {
  // ドラッグ中はクリックを無視
  if (translateX.value !== 0) return
  emit('click')
}
</script>
