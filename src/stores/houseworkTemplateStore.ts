import { defineStore } from 'pinia'
import { houseworkTemplateApi } from '@/api/houseworkTemplateApi'
import type { HouseworkTemplateModel } from '@/domain'

interface HouseworkTemplateState {
  templates: HouseworkTemplateModel[]
  isLoading: boolean
  loaded: boolean
}

export const useHouseworkTemplateStore = defineStore('houseworkTemplate', {
  state: (): HouseworkTemplateState => ({
    templates: [],
    isLoading: false,
    loaded: false,
  }),

  actions: {
    /** 全件取得（初回のみ fetch、以降はキャッシュを使用） */
    async loadAllIfNeeded(): Promise<void> {
      if (this.loaded || this.isLoading) return
      this.isLoading = true
      try {
        this.templates = await houseworkTemplateApi.fetchAll()
        this.loaded = true
      } finally {
        this.isLoading = false
      }
    },

    clear() {
      this.templates = []
      this.loaded = false
    },
  },
})
