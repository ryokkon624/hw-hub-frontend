import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShoppingFavoriteStore } from '@/stores/shoppingFavoriteStore'
import { shoppingItemApi } from '@/api/shoppingItemApi'
import type { ShoppingItemModel } from '@/domain'

vi.mock('@/api/shoppingItemApi', () => ({
  shoppingItemApi: {
    getFavoriteShoppingItems: vi.fn(),
  },
}))

const createItem = (overrides: Partial<ShoppingItemModel> = {}): ShoppingItemModel =>
  ({
    shoppingItemId: 1,
    householdId: 1,
    name: '牛乳',
    memo: null,
    storeType: '1',
    status: '1',
    favorite: true,
    purchasedAt: null,
    createdAt: '2025-01-01T00:00:00Z',
    hasImage: false,
    ...overrides,
  }) as ShoppingItemModel

describe('shoppingFavoriteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('favorites getter は householdId が null の場合は空配列を返す', () => {
    const store = useShoppingFavoriteStore()

    const result = store.favorites(null)
    expect(result).toEqual([])
  })

  it('favorites getter は指定された householdId のお気に入りを返す', () => {
    const store = useShoppingFavoriteStore()
    const list: ShoppingItemModel[] = [
      createItem({ shoppingItemId: 1, name: '牛乳' }),
      createItem({ shoppingItemId: 2, name: 'パン' }),
    ]
    store.favoritesByHouseholdId[1] = list

    const result = store.favorites(1)
    expect(result).toEqual(list)
  })

  it('fetchFavorites は householdId が 0/undefined の場合は何もしない', async () => {
    const store = useShoppingFavoriteStore()

    await store.fetchFavorites(0)
    expect(shoppingItemApi.getFavoriteShoppingItems).not.toHaveBeenCalled()
  })

  it('fetchFavorites はキャッシュがない場合 API を呼び、favoritesByHouseholdId を更新する', async () => {
    const store = useShoppingFavoriteStore()

    const items: ShoppingItemModel[] = [
      createItem({ shoppingItemId: 1, name: '牛乳' }),
      createItem({ shoppingItemId: 2, name: 'パン' }),
    ]

    vi.mocked(shoppingItemApi.getFavoriteShoppingItems).mockResolvedValue(items)

    await store.fetchFavorites(1)

    expect(shoppingItemApi.getFavoriteShoppingItems).toHaveBeenCalledTimes(1)
    expect(shoppingItemApi.getFavoriteShoppingItems).toHaveBeenCalledWith(1)
    expect(store.favoritesByHouseholdId[1]).toEqual(items)
  })

  it('fetchFavorites は既にキャッシュがあり force 指定がない場合、API を呼ばない', async () => {
    const store = useShoppingFavoriteStore()

    const cached: ShoppingItemModel[] = [createItem({ shoppingItemId: 1, name: 'キャッシュ牛乳' })]
    store.favoritesByHouseholdId[1] = cached

    await store.fetchFavorites(1)

    expect(shoppingItemApi.getFavoriteShoppingItems).not.toHaveBeenCalled()
    expect(store.favoritesByHouseholdId[1]).toEqual(cached)
  })

  it('fetchFavorites は force:true の場合、キャッシュがあっても再取得する', async () => {
    const store = useShoppingFavoriteStore()

    const cached: ShoppingItemModel[] = [createItem({ shoppingItemId: 1, name: '古い牛乳' })]
    store.favoritesByHouseholdId[1] = cached

    const fresh: ShoppingItemModel[] = [createItem({ shoppingItemId: 2, name: '新しい牛乳' })]
    vi.mocked(shoppingItemApi.getFavoriteShoppingItems).mockResolvedValue(fresh)

    await store.fetchFavorites(1, { force: true })

    expect(shoppingItemApi.getFavoriteShoppingItems).toHaveBeenCalledTimes(1)
    expect(store.favoritesByHouseholdId[1]).toEqual(fresh)
  })

  it('clearForHousehold は対象世帯のお気に入りを削除する', () => {
    const store = useShoppingFavoriteStore()

    store.favoritesByHouseholdId[1] = [createItem({ shoppingItemId: 1 })]
    store.favoritesByHouseholdId[2] = [createItem({ shoppingItemId: 2 })]

    store.clearForHousehold(1)

    expect(store.favoritesByHouseholdId[1]).toBeUndefined()
    expect(store.favoritesByHouseholdId[2]).toBeDefined()
  })
})
