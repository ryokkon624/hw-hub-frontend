import { defineStore } from 'pinia'
import { appInfoApi } from '@/api/appInfoApi'
import type { AppInfoModel } from '@/domain'

// ---- State ----------------------------------------------------

interface AppInfoStoreState {
  apiVersion: string | null
  isLoading: boolean
  // フロントのバージョンはビルド時に静的に埋め込まれるため State 管理せず
  // getter経由でimport.meta.env.VITE_APP_VERSION を直接参照する
}

// ---- Store ----------------------------------------------------

export const useAppInfoStore = defineStore('appInfo', {
  state: (): AppInfoStoreState => ({
    apiVersion: null,
    isLoading: false,
  }),

  getters: {
    /**
     * フロントのバージョン
     * ビルド時に VITE_APP_VERSION として静的に埋め込まれる
     * GitHub Actions から git describe の値が注入される
     */
    frontVersion(): string {
      return import.meta.env.VITE_APP_VERSION ?? 'local'
    },
  },

  actions: {
    /**
     * バックエンドのバージョン情報を取得する
     * AppInfoPage の onMounted から呼び出す
     */
    async fetchApiVersion(): Promise<void> {
      if (this.isLoading) return

      this.isLoading = true
      try {
        const info: AppInfoModel = await appInfoApi.fetchAppInfo()
        this.apiVersion = info.apiVersion
      } catch {
        // バージョン取得失敗は致命的エラーではないため unknown で表示
        this.apiVersion = 'unknown'
      } finally {
        this.isLoading = false
      }
    },
  },
})
