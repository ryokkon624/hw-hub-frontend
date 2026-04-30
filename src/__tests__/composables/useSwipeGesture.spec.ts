import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useSwipeGesture } from '@/composables/useSwipeGesture'

/**
 * TouchEvent をモックするためのヘルパー
 */
const createTouchEvent = (type: string, clientX: number): TouchEvent => {
  const touch = {
    clientX,
    clientY: 0,
    identifier: 0,
    target: document.createElement('div'),
    screenX: clientX,
    screenY: 0,
    pageX: clientX,
    pageY: 0,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 0,
  } as Touch

  return new TouchEvent(type, {
    touches: type === 'touchend' ? [] : [touch],
    changedTouches: [touch],
    bubbles: true,
  })
}

describe('useSwipeGesture', () => {
  let elementRef: Ref<HTMLElement | null>
  let onSwipeLeft: ReturnType<typeof vi.fn>
  let onSwipeRight: ReturnType<typeof vi.fn>

  beforeEach(() => {
    elementRef = ref<HTMLElement | null>(null)
    onSwipeLeft = vi.fn()
    onSwipeRight = vi.fn()

    // 要素の幅を300pxとしてモック
    const el = document.createElement('div')
    Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true })
    elementRef.value = el
  })

  it('右スワイプ30%以上（90px超）で右コールバックが発火する', () => {
    const { translateX, swipeState } = useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    // touchstart: x=0
    elementRef.value!.dispatchEvent(createTouchEvent('touchstart', 0))
    // touchmove: x=100（100/300 = 33% > 30%）
    elementRef.value!.dispatchEvent(createTouchEvent('touchmove', 100))
    expect(translateX.value).toBe(100)
    expect(swipeState.value).toBe('dragging-right')
    // touchend
    elementRef.value!.dispatchEvent(createTouchEvent('touchend', 100))

    expect(onSwipeRight).toHaveBeenCalledOnce()
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(translateX.value).toBe(0)
    expect(swipeState.value).toBe('idle')
  })

  it('左スワイプ30%以上（90px超）で左コールバックが発火する', () => {
    const { translateX, swipeState } = useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    // touchstart: x=200
    elementRef.value!.dispatchEvent(createTouchEvent('touchstart', 200))
    // touchmove: x=50（差=-150, 150/300 = 50% > 30%）
    elementRef.value!.dispatchEvent(createTouchEvent('touchmove', 50))
    expect(translateX.value).toBe(-150)
    expect(swipeState.value).toBe('dragging-left')
    // touchend
    elementRef.value!.dispatchEvent(createTouchEvent('touchend', 50))

    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(translateX.value).toBe(0)
    expect(swipeState.value).toBe('idle')
  })

  it('右スワイプ30%未満（89px以下）で指を離すとtranslateXが0に戻りコールバック不発火', () => {
    const { translateX, swipeState } = useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    // touchstart: x=0
    elementRef.value!.dispatchEvent(createTouchEvent('touchstart', 0))
    // touchmove: x=80（80/300 = 26% < 30%）
    elementRef.value!.dispatchEvent(createTouchEvent('touchmove', 80))
    expect(translateX.value).toBe(80)
    // touchend
    elementRef.value!.dispatchEvent(createTouchEvent('touchend', 80))

    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(translateX.value).toBe(0)
    expect(swipeState.value).toBe('idle')
  })

  it('左スワイプ30%未満（89px以下）で指を離すとtranslateXが0に戻りコールバック不発火', () => {
    const { translateX, swipeState } = useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    // touchstart: x=100
    elementRef.value!.dispatchEvent(createTouchEvent('touchstart', 100))
    // touchmove: x=30（差=-70, 70/300 = 23% < 30%）
    elementRef.value!.dispatchEvent(createTouchEvent('touchmove', 30))
    expect(translateX.value).toBe(-70)
    // touchend
    elementRef.value!.dispatchEvent(createTouchEvent('touchend', 30))

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(translateX.value).toBe(0)
    expect(swipeState.value).toBe('idle')
  })

  it('touchstartなしにtouchmoveが来てもcrashしない', () => {
    const { translateX } = useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    expect(() => {
      elementRef.value!.dispatchEvent(createTouchEvent('touchmove', 50))
    }).not.toThrow()

    expect(translateX.value).toBe(0)
  })

  it('マウスイベント(mousedown/mousemove)ではコールバックが発火しない', () => {
    useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    const mousedown = new MouseEvent('mousedown', { clientX: 0, bubbles: true })
    const mousemove = new MouseEvent('mousemove', { clientX: 200, bubbles: true })
    const mouseup = new MouseEvent('mouseup', { clientX: 200, bubbles: true })

    elementRef.value!.dispatchEvent(mousedown)
    elementRef.value!.dispatchEvent(mousemove)
    elementRef.value!.dispatchEvent(mouseup)

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('ちょうど30%（90px）のときは閾値を超えていないためコールバック不発火', () => {
    const { translateX } = useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    // 幅300px * 30% = 90px ちょうど
    elementRef.value!.dispatchEvent(createTouchEvent('touchstart', 0))
    elementRef.value!.dispatchEvent(createTouchEvent('touchmove', 90))
    elementRef.value!.dispatchEvent(createTouchEvent('touchend', 90))

    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(translateX.value).toBe(0)
  })

  it('30%超（91px）のときはコールバックが発火する', () => {
    useSwipeGesture(elementRef, onSwipeLeft, onSwipeRight)

    elementRef.value!.dispatchEvent(createTouchEvent('touchstart', 0))
    elementRef.value!.dispatchEvent(createTouchEvent('touchmove', 91))
    elementRef.value!.dispatchEvent(createTouchEvent('touchend', 91))

    expect(onSwipeRight).toHaveBeenCalledOnce()
  })
})
