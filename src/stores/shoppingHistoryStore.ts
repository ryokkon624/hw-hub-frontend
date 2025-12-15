import { defineStore } from 'pinia'
import { shoppingItemApi } from '@/api/shoppingItemApi'
import type { ShoppingItemHistorySuggestionModel } from '@/domain/'

interface State {
  suggestionsByHouseholdId: Record<number, ShoppingItemHistorySuggestionModel[]>
}

export const useShoppingHistoryStore = defineStore('shoppingHistory', {
  state: (): State => ({
    suggestionsByHouseholdId: {},
  }),

  getters: {
    /**
     * 選択中の世帯の買い物アイテム履歴サジェストを返す。
     * @param state
     * @returns 買い物アイテム履歴サジェストDomain Model配列
     */
    suggestions:
      (state) =>
      (householdId: number | null): ShoppingItemHistorySuggestionModel[] =>
        householdId ? (state.suggestionsByHouseholdId[householdId] ?? []) : [],
  },

  actions: {
    /**
     * 買い物アイテム履歴サジェストを取得する。
     * @param householdId 世帯ID
     * @param options
     */
    async fetchSuggestions(
      householdId: number,
      options?: { q?: string; storeType?: string; limit?: number; force?: boolean },
    ) {
      if (!householdId) return

      const already = this.suggestionsByHouseholdId[householdId]
      if (already && !options?.force) {
        return
      }

      const models = await shoppingItemApi.listHistorySuggestions(householdId, {
        q: options?.q,
        storeType: options?.storeType,
        limit: options?.limit ?? 20,
      })

      this.suggestionsByHouseholdId[householdId] = models
    },

    /**
     * 指定された世帯の買い物アイテム履歴サジェストをstoreから削除する。
     * @param householdId 世帯ID
     */
    clearForHousehold(householdId: number) {
      delete this.suggestionsByHouseholdId[householdId]
    },
  },
})
