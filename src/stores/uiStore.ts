import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

const REDIRECT_AFTER_LOGIN_KEY = 'hwhub.redirectAfterLogin'

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as Toast[],
    loadingCount: 0,
    nextToastId: 1,
    // OAuth のフルリダイレクトでも保持するため localStorage から復元
    redirectAfterLogin: (localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY) as string | null) ?? null,
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

      // 永続化（OAuth のフルリダイレクトでPiniaが初期化されても復元できるように）
      if (path) {
        localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, path)
      } else {
        localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY)
      }
    },
  },
})
