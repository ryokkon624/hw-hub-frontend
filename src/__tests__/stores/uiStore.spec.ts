import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '@/stores/uiStore'
import type { Toast } from '@/stores/uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('初期状態では isLoading は false、toasts は空', () => {
    const store = useUiStore()
    expect(store.isLoading).toBe(false)
    expect(store.toasts).toEqual([])
    expect(store.redirectAfterLogin).toBeNull()
  })

  it('showToast はトーストを追加し、3秒後に自動削除する', () => {
    const store = useUiStore()

    store.showToast('success', 'OK')

    expect(store.toasts).toHaveLength(1)
    const toast = store.toasts[0]!
    expect(toast.type).toBe('success')
    expect(toast.message).toBe('OK')
    const id = toast.id

    // まだ3秒経過前
    vi.advanceTimersByTime(2999)
    expect(store.toasts.find((t) => t.id === id)).toBeTruthy()

    // 3秒経過
    vi.advanceTimersByTime(1)
    expect(store.toasts.find((t) => t.id === id)).toBeFalsy()
  })

  it('removeToast は指定IDのトーストだけ削除する', () => {
    const store = useUiStore()

    store.showToast('info', 'A')
    store.showToast('error', 'B')

    const t1: Toast = store.toasts[0]!
    const t2: Toast = store.toasts[1]!

    store.removeToast(t1.id)

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]!.id).toBe(t2.id)
  })

  it('startLoading / stopLoading で loadingCount / isLoading が変化する', () => {
    const store = useUiStore()

    expect(store.isLoading).toBe(false)

    store.startLoading()
    expect(store.isLoading).toBe(true)

    store.startLoading()
    expect(store.loadingCount).toBe(2)

    store.stopLoading()
    expect(store.loadingCount).toBe(1)
    expect(store.isLoading).toBe(true)

    store.stopLoading()
    expect(store.loadingCount).toBe(0)
    expect(store.isLoading).toBe(false)

    // 0 未満にはならない
    store.stopLoading()
    expect(store.loadingCount).toBe(0)
  })

  it('withLoading は開始時に startLoading を呼び、終了時に stopLoading を呼ぶ', async () => {
    const store = useUiStore()

    const fn = vi.fn().mockResolvedValue('result')

    const startSpy = vi.spyOn(store, 'startLoading')
    const stopSpy = vi.spyOn(store, 'stopLoading')

    const result = await store.withLoading(fn)

    expect(result).toBe('result')
    expect(startSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(store.loadingCount).toBe(0)
  })

  it('withLoading はエラー時でも stopLoading を必ず呼ぶ', async () => {
    const store = useUiStore()

    const fn = vi.fn().mockRejectedValue(new Error('failure'))

    const startSpy = vi.spyOn(store, 'startLoading')
    const stopSpy = vi.spyOn(store, 'stopLoading')

    await expect(store.withLoading(fn)).rejects.toThrow('failure')

    expect(startSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).toHaveBeenCalledTimes(1)
    expect(store.loadingCount).toBe(0)
  })

  it('setRedirectAfterLogin は redirectAfterLogin を更新する', () => {
    const store = useUiStore()

    store.setRedirectAfterLogin('/foo')
    expect(store.redirectAfterLogin).toBe('/foo')

    store.setRedirectAfterLogin(null)
    expect(store.redirectAfterLogin).toBeNull()
  })
})
