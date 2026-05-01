import { ref, watch, getCurrentInstance, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export type SwipeState = 'idle' | 'dragging-left' | 'dragging-right'

/** スワイプ閾値: 要素幅の30%超でスワイプ確定 */
const THRESHOLD_RATIO = 0.3

export interface UseSwipeGestureOptions {
  /** true にすると左スワイプを無効化する（translateX が負にならない） */
  disableLeft?: boolean
  /** true にすると右スワイプを無効化する（translateX が正にならない） */
  disableRight?: boolean
}

/**
 * スワイプジェスチャー検知コンポーザブル（タッチのみ対応、マウスイベントは無視）
 *
 * @param elementRef - スワイプ対象要素のRef
 * @param onSwipeLeft - 左スワイプ（要素幅30%超）で発火するコールバック
 * @param onSwipeRight - 右スワイプ（要素幅30%超）で発火するコールバック
 * @param options - オプション（disableLeft / disableRight）
 * @returns translateX（ドラッグ中のオフセットpx）, swipeState（現在の状態）
 */
export function useSwipeGesture(
  elementRef: Ref<HTMLElement | null>,
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  options: UseSwipeGestureOptions = {},
) {
  const translateX = ref(0)
  const swipeState = ref<SwipeState>('idle')

  let startX: number | null = null

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    startX = touch.clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (startX === null) return

    const touch = e.touches[0]
    if (!touch) return
    let diff = touch.clientX - startX

    // 無効化オプション適用: 該当方向の差分を0にクランプ
    if (options.disableRight && diff > 0) diff = 0
    if (options.disableLeft && diff < 0) diff = 0

    translateX.value = diff
    swipeState.value = diff > 0 ? 'dragging-right' : diff < 0 ? 'dragging-left' : 'idle'
  }

  const handleTouchEnd = () => {
    if (startX === null) return

    const width = elementRef.value?.offsetWidth ?? 0
    const threshold = width * THRESHOLD_RATIO
    const diff = translateX.value

    if (diff > threshold) {
      onSwipeRight()
    } else if (diff < -threshold) {
      onSwipeLeft()
    }

    // 状態リセット
    translateX.value = 0
    swipeState.value = 'idle'
    startX = null
  }

  const addListeners = (el: HTMLElement) => {
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  const removeListeners = (el: HTMLElement) => {
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
  }

  // elementRefが変化したときにリスナーをつけ直す
  watch(
    elementRef,
    (newEl, oldEl) => {
      if (oldEl) removeListeners(oldEl)
      if (newEl) addListeners(newEl)
    },
    { immediate: true },
  )

  // コンポーネントのsetup内で呼ばれた場合のみライフサイクルフックを登録する
  if (getCurrentInstance()) {
    onUnmounted(() => {
      const el = elementRef.value
      if (el) removeListeners(el)
    })
  }

  return {
    translateX,
    swipeState,
  }
}
