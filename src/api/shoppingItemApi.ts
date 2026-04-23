import { apiClient } from './client'
import type {
  ShoppingItemModel,
  ShoppingItemCreateInput,
  ShoppingItemUpdateInput,
  ShoppingItemHistorySuggestionModel,
} from '@/domain'
import { FAVORITE_FLAG } from '@/constants/code.constants'
import type { PurchaseLocationTypeCode, ShoppingItemStatusCode } from '@/constants/code.constants'

export const shoppingItemApi = {
  /**
   * 指定された世帯の買い物アイテムを取得する。
   * @param householdId 世帯ID
   * @returns 買い物アイテムDomain Model配列
   */
  async getShoppingItems(householdId: number): Promise<ShoppingItemModel[]> {
    const res = await apiClient.get<ShoppingItemListResponse>(
      `/api/households/${householdId}/shopping-items`,
    )
    return res.data.items.map(toShoppingItem)
  },

  /**
   * お気に入りの買い物アイテムを取得する。
   * @param householdId 世帯ID
   * @returns 買い物アイテムDomain Model配列
   */
  async getFavoriteShoppingItems(householdId: number): Promise<ShoppingItemModel[]> {
    const res = await apiClient.get<ShoppingItemListResponse>(
      `/api/households/${householdId}/shopping-items/favorites`,
    )
    return res.data.items.map(toShoppingItem)
  },

  /**
   * 買い物アイテムを登録する。
   * @param householdId 世帯ID
   * @param input 入力値
   * @returns 買い物アイテムDomain Model
   */
  async createItem(
    householdId: number,
    input: ShoppingItemCreateInput,
  ): Promise<ShoppingItemModel> {
    const payload = toCreateShoppingItemRequestDto(input)
    const res = await apiClient.post<ShoppingItemDto>(
      `/api/households/${householdId}/shopping-items`,
      payload,
    )
    return toShoppingItem(res.data)
  },

  /**
   * 買い物アイテムを更新する。
   * @param householdId 世帯ID
   * @param shoppingItemId 買い物アイテムID
   * @param input 入力値
   * @returns 買い物アイテムDomain Model
   */
  async updateItem(
    householdId: number,
    shoppingItemId: number,
    input: ShoppingItemUpdateInput,
  ): Promise<ShoppingItemModel> {
    const payload = toUpdateShoppingItemRequestDto(input)
    const res = await apiClient.put<ShoppingItemDto>(
      `/api/households/${householdId}/shopping-items/${shoppingItemId}`,
      payload,
    )
    return toShoppingItem(res.data)
  },

  /**
   * 買い物アイテムのステータスを更新する。
   * @param shoppingItemId 買い物アイテムID
   * @param status 更新するステータス
   */
  async updateStatus(shoppingItemId: number, status: string): Promise<void> {
    await apiClient.patch(`/api/shopping-items/${shoppingItemId}/status`, {
      status,
    })
  },

  /**
   * 複数の買い物アイテムのステータスを一括更新する。
   * @param ids 買い物アイテムIDの配列
   * @param status 更新するステータス
   */
  async bulkUpdateStatus(ids: number[], status: string): Promise<void> {
    await apiClient.patch('/api/shopping-items/bulk-status', { ids, status })
  },

  /**
   * 買い物アイテムを削除する。
   * @param shoppingItemId 買い物アイテムID
   */
  async deleteItem(shoppingItemId: number): Promise<void> {
    await apiClient.delete<void>(`/api/shopping-items/${shoppingItemId}`)
  },

  /**
   * お気に入りを更新する。
   * @param shoppingItemId 買い物アイテムID
   * @param favorite お気に入り
   */
  async toggleFavorite(shoppingItemId: number, favorite: '0' | '1'): Promise<void> {
    await apiClient.patch(`/api/shopping-items/${shoppingItemId}/favorite`, {
      favorite,
    })
  },

  /**
   * 買い物の過去履歴を取得する。
   * @param householdId 世帯ID
   * @param params
   * @returns 買い物アイテム履歴Domain Model配列
   */
  async listHistorySuggestions(
    householdId: number,
    params?: { q?: string; storeType?: string; limit?: number },
  ): Promise<ShoppingItemHistorySuggestionModel[]> {
    const res = await apiClient.get<ShoppingItemHistorySuggestionDto[]>(
      `/api/households/${householdId}/shopping-items/history-suggestions`,
      { params },
    )
    return res.data.map(toHistorySuggestionModel)
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * Response用の買い物アイテムのDTO
 */
interface ShoppingItemDto {
  shoppingItemId: number
  householdId: number
  name: string
  memo?: string | null
  storeType: string
  status: string
  favorite: string
  purchasedAt: string | null
  createdAt: string
  hasImage: boolean
}

/**
 * Response用の買い物アイテムのDTO配列
 */
interface ShoppingItemListResponse {
  items: ShoppingItemDto[]
}

/**
 * 登録Request用の買い物アイテムのDTO
 */
interface CreateShoppingItemRequestDto {
  name: string
  memo?: string | null
  storeType: string
  favorite?: string
  sourceShoppingItemId?: number | null
}

/**
 * 更新Request用の買い物アイテムのDTO
 */
interface UpdateShoppingItemRequestDto {
  name: string
  memo: string | null
  storeType: string
  favorite: '0' | '1'
}

/**
 * 買い物アイテム履歴サジェストResponse用のDTO
 */
interface ShoppingItemHistorySuggestionDto {
  name: string
  storeType: string
  lastPurchasedDate: string
  purchaseCount: number
  sourceShoppingItemId: number
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toShoppingItem = (dto: ShoppingItemDto): ShoppingItemModel => ({
  shoppingItemId: dto.shoppingItemId,
  householdId: dto.householdId,
  name: dto.name,
  memo: dto.memo,
  storeType: dto.storeType as PurchaseLocationTypeCode,
  status: dto.status as ShoppingItemStatusCode,
  favorite: dto.favorite === FAVORITE_FLAG.FAVORITE,
  purchasedAt: dto.purchasedAt,
  createdAt: dto.createdAt,
  hasImage: dto.hasImage,
})

/**
 * Domain Input → Request DTOへの変換
 * @param input Domain Input
 * @returns Request DTO
 */
const toCreateShoppingItemRequestDto = (
  input: ShoppingItemCreateInput,
): CreateShoppingItemRequestDto => ({
  name: input.name,
  memo: input.memo ?? null,
  storeType: input.storeType,
  favorite:
    input.favorite === undefined
      ? undefined
      : input.favorite
        ? FAVORITE_FLAG.FAVORITE
        : FAVORITE_FLAG.NORMAL,
  sourceShoppingItemId: input.sourceShoppingItemId ?? null,
})

/**
 * Domain Input → Request DTOへの変換
 * @param input Domain Input
 * @returns Request DTO
 */
const toUpdateShoppingItemRequestDto = (
  input: ShoppingItemUpdateInput,
): UpdateShoppingItemRequestDto => ({
  name: input.name,
  memo: input.memo,
  storeType: input.storeType,
  favorite: input.favorite ? FAVORITE_FLAG.FAVORITE : FAVORITE_FLAG.NORMAL,
})

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toHistorySuggestionModel = (
  dto: ShoppingItemHistorySuggestionDto,
): ShoppingItemHistorySuggestionModel => ({
  name: dto.name,
  storeType: dto.storeType as PurchaseLocationTypeCode,
  lastPurchasedDate: dto.lastPurchasedDate,
  purchaseCount: dto.purchaseCount,
  sourceShoppingItemId: dto.sourceShoppingItemId,
  hasImage: false, // TODO: backend で返すようになったら書き換える
})
