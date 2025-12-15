import type { PurchaseLocationTypeCode, ShoppingItemStatusCode } from '@/constants/code.constants'

/**
 * 買い物アイテム Domain Model
 */
export interface ShoppingItemModel {
  shoppingItemId: number
  householdId: number
  name: string
  memo?: string | null
  storeType: PurchaseLocationTypeCode
  status: ShoppingItemStatusCode
  favorite: boolean
  purchasedAt: string | null
  createdAt: string
  hasImage: boolean
}

/**
 * 新規入力時のDomain Input
 */
export interface ShoppingItemCreateInput {
  name: string
  memo: string | null
  storeType: PurchaseLocationTypeCode
  favorite?: boolean
  /**
   * 過去履歴から作るときの元アイテム ID（任意）
   */
  sourceShoppingItemId?: number | null
}

/**
 * 更新時のDomain Input
 */
export interface ShoppingItemUpdateInput {
  name: string
  memo: string | null
  storeType: PurchaseLocationTypeCode
  favorite: boolean
}
