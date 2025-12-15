import type { PurchaseLocationTypeCode } from '@/constants/code.constants'

/**
 * 買い物アイテム履歴サジェストDomain Model
 */
export interface ShoppingItemHistorySuggestionModel {
  name: string
  storeType: PurchaseLocationTypeCode
  lastPurchasedDate: string
  purchaseCount: number
  sourceShoppingItemId: number
  hasImage: boolean
}
