import { defineStore } from 'pinia'
import { shoppingItemApi } from '@/api/shoppingItemApi'
import type { ShoppingItemModel } from '@/domain/'

interface State {
  favoritesByHouseholdId: Record<number, ShoppingItemModel[]>
}

export const useShoppingFavoriteStore = defineStore('shoppingFavorite', {
  state: (): State => ({
    favoritesByHouseholdId: {},
  }),

  getters: {
    /**
     * 選択中の世帯の買い物アイテムお気に入りを返す。
     * @param state
     * @returns 買い物アイテムDomain Model配列
     */
    favorites:
      (state) =>
      (householdId: number | null): ShoppingItemModel[] =>
        householdId ? (state.favoritesByHouseholdId[householdId] ?? []) : [],
  },

  actions: {
    /**
     * 買い物アイテムお気に入りを取得する。
     * @param householdId 世帯ID
     * @param options
     */
    async fetchFavorites(householdId: number, options?: { force?: boolean }) {
      if (!householdId) return

      const already = this.favoritesByHouseholdId[householdId]
      if (already && !options?.force) {
        return
      }

      const models = await shoppingItemApi.getFavoriteShoppingItems(householdId)

      this.favoritesByHouseholdId[householdId] = models
    },

    /**
     * 指定された世帯の買い物アイテムお気に入りをstoreから削除する。
     * @param householdId 世帯ID
     */
    clearForHousehold(householdId: number) {
      delete this.favoritesByHouseholdId[householdId]
    },
  },
})
