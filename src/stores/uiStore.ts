import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as Toast[],
    loadingCount: 0,
    nextToastId: 1,
    redirectAfterLogin: null as string | null,
  }),
  getters: {
    isLoading: (state) => state.loadingCount > 0,
  },
  actions: {
    showToast(type: ToastType, message: string) {
      const id = this.nextToastId++
      this.toasts.push({ id, type, message })

      // 自動クローズ（3秒）
      setTimeout(() => {
        this.removeToast(id)
      }, 3000)
    },

    removeToast(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    startLoading() {
      this.loadingCount++
    },

    stopLoading() {
      if (this.loadingCount > 0) {
        this.loadingCount--
      }
    },

    // 便利ヘルパー：ラップすると try/finally を毎回書かなくて済む
    async withLoading<T>(fn: () => Promise<T>): Promise<T> {
      try {
        this.startLoading()
        return await fn()
      } finally {
        this.stopLoading()
      }
    },

    setRedirectAfterLogin(path: string | null) {
      this.redirectAfterLogin = path
    },
  },
})
