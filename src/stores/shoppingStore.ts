import { defineStore } from 'pinia'
import type { ShoppingItemModel, ShoppingItemCreateInput, ShoppingItemUpdateInput } from '@/domain'
import { shoppingItemApi } from '@/api/shoppingItemApi'
import {
  FAVORITE_FLAG,
  SHOPPING_ITEM_STATUS,
  type ShoppingItemStatusCode,
} from '@/constants/code.constants'
import { DEFAULT_CACHE_TTL_MS } from '@/constants/cache.constants'

type ItemsByHouseholdId = Record<number, ShoppingItemModel[]>
type LastFetchedByHouseholdId = Record<number, number>

export const useShoppingStore = defineStore('shopping', {
  state: () => ({
    itemsByHouseholdId: {} as ItemsByHouseholdId,
    lastFetchedAtByHouseholdId: {} as LastFetchedByHouseholdId,
  }),

  getters: {
    /**
     * 選択中の世帯の買い物アイテムを返す。
     * @param state
     * @returns 買い物アイテム配列
     */
    items(state) {
      return (householdId: number | null): ShoppingItemModel[] => {
        if (!householdId) return []
        return state.itemsByHouseholdId[householdId] ?? []
      }
    },

    /**
     * 選択中の世帯の未購入の買い物アイテムを返す。
     * @returns 買い物アイテム配列
     */
    notPurchased() {
      return (householdId: number | null): ShoppingItemModel[] => {
        return this.items(householdId).filter(
          (i) => i.status === SHOPPING_ITEM_STATUS.NOT_PURCHASED,
        )
      }
    },

    /**
     * 選択中の世帯のかごに入れた買い物アイテムを返す。
     * @returns 買い物アイテム配列
     */
    inBasket() {
      return (householdId: number | null): ShoppingItemModel[] => {
        return this.items(householdId).filter((i) => i.status === SHOPPING_ITEM_STATUS.IN_BASKET)
      }
    },

    /**
     * 選択中の世帯の購入済み買い物アイテムを返す。
     * @returns 買い物アイテム配列
     */
    completed() {
      return (householdId: number | null): ShoppingItemModel[] => {
        return this.items(householdId).filter((i) => i.status === SHOPPING_ITEM_STATUS.PURCHASED)
      }
    },

    /**
     * stateから指定された買い物アイテムを返す。
     * @param state
     * @returns 買い物アイテムDomain Model
     */
    getItemById: (state) => (householdId: number | null, itemId: number) => {
      if (!householdId) return null
      const list = state.itemsByHouseholdId[householdId] ?? []
      return list.find((i) => i.shoppingItemId === itemId) ?? null
    },
  },

  actions: {
    /**
     * stateに買い物アイテムを設定する。
     * @param householdId 家事ID
     * @param items 買い物アイテムDomain Model配列
     */
    setItems(householdId: number, items: ShoppingItemModel[]) {
      this.itemsByHouseholdId[householdId] = items
    },

    /**
     * stateから指定された買い物アイテムを返す。
     * @param householdId 家事ID
     * @param shoppingItemId 買い物アイテムID
     * @returns 買い物アイテムDomain Model
     */
    findItem(householdId: number, shoppingItemId: number): ShoppingItemModel | undefined {
      const list = this.itemsByHouseholdId[householdId]
      if (!list) return undefined
      return list.find((i) => i.shoppingItemId === shoppingItemId)
    },

    /**
     * 指定された世帯の買い物アイテムを取得する。
     * @param householdId 世帯ID
     * @param options  TTLを無視し強制取得する場合はforce:true。
     * @returns 買い物アイテムDomain Model配列
     */
    async fetchItems(householdId: number, options?: { force?: boolean }) {
      if (!householdId) return

      const force = options?.force ?? false
      const now = Date.now()
      const last = this.lastFetchedAtByHouseholdId[householdId]
      const cached = this.itemsByHouseholdId[householdId]

      if (!force && last && cached && now - last < DEFAULT_CACHE_TTL_MS) {
        return
      }

      const items = await shoppingItemApi.getShoppingItems(householdId) // ← Domain Model[]
      this.setItems(householdId, items)
      this.lastFetchedAtByHouseholdId[householdId] = now
    },

    /**
     * 買い物アイテムの基本情報を更新する。
     * @param householdId 世帯ID
     * @param shoppingItemId 買い物アイテムID
     * @param payload 入力値
     */
    async updateItemBasicInfo(
      householdId: number,
      shoppingItemId: number,
      payload: ShoppingItemUpdateInput,
    ) {
      const updated = await shoppingItemApi.updateItem(householdId, shoppingItemId, payload)

      const current = this.itemsByHouseholdId[householdId] ?? []
      const idx = current.findIndex((i) => i.shoppingItemId === shoppingItemId)
      if (idx === -1) {
        this.itemsByHouseholdId[householdId] = [...current, updated]
      } else {
        const newList = [...current]
        newList[idx] = updated
        this.itemsByHouseholdId[householdId] = newList
      }
    },

    /**
     * 買い物アイテムを登録する。
     * @param householdId 世帯ID
     * @param payload 入力値
     * @returns 買い物アイテムDomain Model
     */
    async addItem(householdId: number, payload: ShoppingItemCreateInput) {
      const model = await shoppingItemApi.createItem(householdId, payload)
      const current = this.itemsByHouseholdId[householdId] ?? []
      this.itemsByHouseholdId[householdId] = [...current, model]
      return model
    },

    /**
     * 買い物アイテムのステータスを更新する。
     * @param householdId 世帯ID
     * @param shoppingItemId 買い物アイテムID
     * @param status 更新するステータス
     */
    async updateStatus(
      householdId: number,
      shoppingItemId: number,
      status: ShoppingItemStatusCode,
    ) {
      await shoppingItemApi.updateStatus(shoppingItemId, status)

      const item = this.findItem(householdId, shoppingItemId)
      if (item) {
        item.status = status
      }
    },

    /**
     * 指定された買い物アイテムのお気に入りを更新する。
     * @param householdId 世帯ID
     * @param shoppingItemId 買い物アイテムID
     * @returns 買い物アイテムDomain Model
     */
    async toggleFavorite(householdId: number, shoppingItemId: number) {
      const item = this.findItem(householdId, shoppingItemId)
      if (!item) return

      const next = item.favorite ? FAVORITE_FLAG.NORMAL : FAVORITE_FLAG.FAVORITE
      await shoppingItemApi.toggleFavorite(shoppingItemId, next)

      item.favorite = next === FAVORITE_FLAG.FAVORITE
    },
  },
})
