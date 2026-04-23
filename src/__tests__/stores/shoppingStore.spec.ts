import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShoppingStore } from '@/stores/shoppingStore'
import { shoppingItemApi } from '@/api/shoppingItemApi'
import type { ShoppingItemModel } from '@/domain'
import {
  FAVORITE_FLAG,
  SHOPPING_ITEM_STATUS,
  type ShoppingItemStatusCode,
} from '@/constants/code.constants'

vi.mock('@/api/shoppingItemApi', () => ({
  shoppingItemApi: {
    getShoppingItems: vi.fn(),
    updateItem: vi.fn(),
    createItem: vi.fn(),
    updateStatus: vi.fn(),
    toggleFavorite: vi.fn(),
    deleteItem: vi.fn(),
    bulkUpdateStatus: vi.fn(),
  },
}))

const createItem = (overrides: Partial<ShoppingItemModel> = {}): ShoppingItemModel =>
  ({
    shoppingItemId: 1,
    householdId: 1,
    name: '牛乳',
    status: SHOPPING_ITEM_STATUS.NOT_PURCHASED,
    favorite: false,
    storeType: '1',
    memo: null,
    ...overrides,
  }) as ShoppingItemModel

describe('shoppingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('items getter は householdId が null の場合は空配列を返す', () => {
    const store = useShoppingStore()
    expect(store.items(null)).toEqual([])
  })

  it('items getter は householdId ごとの itemsByHouseholdId を返す', () => {
    const store = useShoppingStore()
    const list = [createItem({ shoppingItemId: 1 }), createItem({ shoppingItemId: 2 })]
    store.itemsByHouseholdId[1] = list

    expect(store.items(1)).toEqual(list)
  })

  it('notPurchased / inBasket / completed getter が status ごとにフィルタする', () => {
    const store = useShoppingStore()
    const i1 = createItem({
      shoppingItemId: 1,
      status: SHOPPING_ITEM_STATUS.NOT_PURCHASED,
    })
    const i2 = createItem({
      shoppingItemId: 2,
      status: SHOPPING_ITEM_STATUS.IN_BASKET,
    })
    const i3 = createItem({
      shoppingItemId: 3,
      status: SHOPPING_ITEM_STATUS.PURCHASED,
    })
    store.itemsByHouseholdId[1] = [i1, i2, i3]

    expect(store.notPurchased(1).map((i) => i.shoppingItemId)).toEqual([1])
    expect(store.inBasket(1).map((i) => i.shoppingItemId)).toEqual([2])
    expect(store.completed(1).map((i) => i.shoppingItemId)).toEqual([3])
  })

  it('getItemById は指定 householdId / itemId のアイテムを返し、なければ null を返す', () => {
    const store = useShoppingStore()
    const i1 = createItem({ shoppingItemId: 1 })
    store.itemsByHouseholdId[1] = [i1]

    expect(store.getItemById(1, 1)).toEqual(i1)
    expect(store.getItemById(1, 999)).toBeNull()
    expect(store.getItemById(null, 1)).toBeNull()
  })

  it('setItems は householdId ごとに itemsByHouseholdId を上書きする', () => {
    const store = useShoppingStore()
    const list = [createItem({ shoppingItemId: 1 })]

    store.setItems(1, list)

    expect(store.itemsByHouseholdId[1]).toEqual(list)
  })

  it('findItem は指定 householdId / shoppingItemId のアイテムを返し、なければ undefined を返す', () => {
    const store = useShoppingStore()
    const i1 = createItem({ shoppingItemId: 1 })
    store.itemsByHouseholdId[1] = [i1]

    expect(store.findItem(1, 1)).toEqual(i1)
    expect(store.findItem(1, 999)).toBeUndefined()
    expect(store.findItem(2, 1)).toBeUndefined()
  })

  it('fetchItems は householdId が falsy の場合何もしない', async () => {
    const store = useShoppingStore()
    await store.fetchItems(0)
    expect(shoppingItemApi.getShoppingItems).not.toHaveBeenCalled()
  })

  it('fetchItems はキャッシュがなく TTL も満了の場合、API から取得して state を更新する', async () => {
    const store = useShoppingStore()
    const list = [createItem({ shoppingItemId: 1 }), createItem({ shoppingItemId: 2 })]
    vi.mocked(shoppingItemApi.getShoppingItems).mockResolvedValue(list)

    await store.fetchItems(1)

    expect(shoppingItemApi.getShoppingItems).toHaveBeenCalledWith(1)
    expect(store.itemsByHouseholdId[1]).toEqual(list)
    expect(store.lastFetchedAtByHouseholdId[1]).toBeTypeOf('number')
  })

  it('fetchItems は TTL 内にキャッシュがある場合 API を呼ばない', async () => {
    const store = useShoppingStore()
    const list = [createItem({ shoppingItemId: 1 })]
    store.itemsByHouseholdId[1] = list
    store.lastFetchedAtByHouseholdId[1] = Date.now() // TTL 内とみなす

    await store.fetchItems(1)

    expect(shoppingItemApi.getShoppingItems).not.toHaveBeenCalled()
    expect(store.itemsByHouseholdId[1]).toEqual(list)
  })

  it('fetchItems は force:true の場合 TTL 内でも再取得する', async () => {
    const store = useShoppingStore()
    const cached = [createItem({ shoppingItemId: 1, name: '古い' })]
    store.itemsByHouseholdId[1] = cached
    store.lastFetchedAtByHouseholdId[1] = Date.now()

    const fresh = [createItem({ shoppingItemId: 1, name: '新しい' })]
    vi.mocked(shoppingItemApi.getShoppingItems).mockResolvedValue(fresh)

    await store.fetchItems(1, { force: true })

    expect(shoppingItemApi.getShoppingItems).toHaveBeenCalledWith(1)
    expect(store.itemsByHouseholdId[1]).toEqual(fresh)
  })

  it('updateItemBasicInfo は既存アイテムがある場合それを更新する', async () => {
    const store = useShoppingStore()
    const original = createItem({ shoppingItemId: 1, name: '牛乳' })
    store.itemsByHouseholdId[1] = [original]

    const updated = createItem({ shoppingItemId: 1, name: '成分無調整牛乳' })
    vi.mocked(shoppingItemApi.updateItem).mockResolvedValue(updated)

    await store.updateItemBasicInfo(1, 1, {
      name: '成分無調整牛乳',
      memo: null,
      storeType: '1',
      favorite: false,
    })

    expect(shoppingItemApi.updateItem).toHaveBeenCalled()
    expect(store.itemsByHouseholdId[1][0]).toEqual(updated)
  })

  it('updateItemBasicInfo は既存アイテムがない場合追加する', async () => {
    const store = useShoppingStore()
    store.itemsByHouseholdId[1] = []

    const updated = createItem({ shoppingItemId: 1, name: '牛乳' })
    vi.mocked(shoppingItemApi.updateItem).mockResolvedValue(updated)

    await store.updateItemBasicInfo(1, 1, {
      name: '牛乳',
      memo: null,
      storeType: '1',
      favorite: false,
    })

    expect(store.itemsByHouseholdId[1]).toEqual([updated])
  })

  it('addItem は createItem の結果を該当世帯の末尾に追加する', async () => {
    const store = useShoppingStore()
    const existing = createItem({ shoppingItemId: 1 })
    store.itemsByHouseholdId[1] = [existing]

    const created = createItem({ shoppingItemId: 2, name: 'パン' })
    vi.mocked(shoppingItemApi.createItem).mockResolvedValue(created)

    const result = await store.addItem(1, {
      name: 'パン',
      memo: null,
      storeType: '1',
      favorite: false,
      sourceShoppingItemId: null,
    })

    expect(result).toEqual(created)
    expect(store.itemsByHouseholdId[1]).toEqual([existing, created])
  })

  it('updateStatus は API 呼び出し後、該当アイテムの status を更新する', async () => {
    const store = useShoppingStore()
    const item = createItem({
      shoppingItemId: 1,
      status: SHOPPING_ITEM_STATUS.NOT_PURCHASED,
    })
    store.itemsByHouseholdId[1] = [item]

    const newStatus: ShoppingItemStatusCode = SHOPPING_ITEM_STATUS.IN_BASKET
    vi.mocked(shoppingItemApi.updateStatus).mockResolvedValue(undefined)

    await store.updateStatus(1, 1, newStatus)

    expect(shoppingItemApi.updateStatus).toHaveBeenCalledWith(1, newStatus)
    expect(store.itemsByHouseholdId[1]![0]!.status).toBe(newStatus)
  })

  it('deleteItem は API 呼び出し後、該当アイテムをキャッシュから除去する', async () => {
    const store = useShoppingStore()
    const i1 = createItem({ shoppingItemId: 1 })
    const i2 = createItem({ shoppingItemId: 2, name: 'パン' })
    store.itemsByHouseholdId[1] = [i1, i2]

    vi.mocked(shoppingItemApi.deleteItem).mockResolvedValue(undefined)

    await store.deleteItem(1, 1)

    expect(shoppingItemApi.deleteItem).toHaveBeenCalledWith(1)
    expect(store.itemsByHouseholdId[1]).toEqual([i2])
  })

  it('deleteItem は該当アイテムが存在しない世帯でもエラーにならない', async () => {
    const store = useShoppingStore()
    store.itemsByHouseholdId[1] = []

    vi.mocked(shoppingItemApi.deleteItem).mockResolvedValue(undefined)

    await store.deleteItem(1, 999)

    expect(shoppingItemApi.deleteItem).toHaveBeenCalledWith(999)
    expect(store.itemsByHouseholdId[1]).toEqual([])
  })

  it('bulkUpdateStatus は API 呼び出し後、指定アイテムのステータスを一括更新する', async () => {
    const store = useShoppingStore()
    const i1 = createItem({ shoppingItemId: 1, status: SHOPPING_ITEM_STATUS.IN_BASKET })
    const i2 = createItem({ shoppingItemId: 2, status: SHOPPING_ITEM_STATUS.IN_BASKET })
    const i3 = createItem({ shoppingItemId: 3, status: SHOPPING_ITEM_STATUS.NOT_PURCHASED })
    store.itemsByHouseholdId[1] = [i1, i2, i3]

    vi.mocked(shoppingItemApi.bulkUpdateStatus).mockResolvedValue(undefined)

    await store.bulkUpdateStatus(1, [1, 2], SHOPPING_ITEM_STATUS.PURCHASED)

    expect(shoppingItemApi.bulkUpdateStatus).toHaveBeenCalledWith(
      [1, 2],
      SHOPPING_ITEM_STATUS.PURCHASED,
    )
    expect(store.itemsByHouseholdId[1]![0]!.status).toBe(SHOPPING_ITEM_STATUS.PURCHASED)
    expect(store.itemsByHouseholdId[1]![1]!.status).toBe(SHOPPING_ITEM_STATUS.PURCHASED)
    expect(store.itemsByHouseholdId[1]![2]!.status).toBe(SHOPPING_ITEM_STATUS.NOT_PURCHASED)
  })

  it('clear は itemsByHouseholdId と lastFetchedAtByHouseholdId を空にする', () => {
    const store = useShoppingStore()
    store.itemsByHouseholdId[1] = [createItem({ shoppingItemId: 1 })]
    store.itemsByHouseholdId[2] = [createItem({ shoppingItemId: 2 })]
    store.lastFetchedAtByHouseholdId[1] = Date.now()
    store.lastFetchedAtByHouseholdId[2] = Date.now()

    store.clear()

    expect(store.itemsByHouseholdId).toEqual({})
    expect(store.lastFetchedAtByHouseholdId).toEqual({})
  })

  it('toggleFavorite は favorite をトグルし、API に FAVORITE_FLAG を渡す', async () => {
    const store = useShoppingStore()
    const item = createItem({
      shoppingItemId: 1,
      favorite: false,
    })
    store.itemsByHouseholdId[1] = [item]

    vi.mocked(shoppingItemApi.toggleFavorite).mockResolvedValue(undefined)

    // false -> true
    await store.toggleFavorite(1, 1)
    expect(shoppingItemApi.toggleFavorite).toHaveBeenCalledWith(1, FAVORITE_FLAG.FAVORITE)
    expect(store.itemsByHouseholdId[1]![0]!.favorite).toBe(true)

    vi.mocked(shoppingItemApi.toggleFavorite).mockClear()

    // true -> false
    await store.toggleFavorite(1, 1)
    expect(shoppingItemApi.toggleFavorite).toHaveBeenCalledWith(1, FAVORITE_FLAG.NORMAL)
    expect(store.itemsByHouseholdId[1]![0]!.favorite).toBe(false)
  })
})
