import { defineStore } from 'pinia'
import { houseworkApi } from '@/api/houseworkApi'
import type { Housework, HouseworkSaveInput } from '@/domain'
import { useHouseholdStore } from '@/stores/householdStore'
import { DEFAULT_CACHE_TTL_MS } from '@/constants/cache.constants'

interface HouseworkState {
  items: Housework[]
  current: Housework | null
  itemsByHouseholdId: Record<number, Housework[]>
  lastFetchedAtByHouseholdId: Record<number, number>
}

export const useHouseworkStore = defineStore('houseworkStore', {
  state: (): HouseworkState => ({
    items: [],
    current: null,
    itemsByHouseholdId: {},
    lastFetchedAtByHouseholdId: {},
  }),

  actions: {
    /**
     * 選択中の世帯の家事を取得する。
     * @param options TTLを無視し強制取得する場合はforce:true。
     * @returns 家事Domain Model配列
     */
    async loadAll(options?: { force?: boolean }) {
      const householdStore = useHouseholdStore()
      const householdId = householdStore.currentHouseholdId
      const force = options?.force ?? false

      // 世帯未選択なら一覧を空にして終了
      if (!householdId) {
        this.items = []
        return
      }

      const now = Date.now()
      const last = this.lastFetchedAtByHouseholdId[householdId]
      const cached = this.itemsByHouseholdId[householdId]

      // TTL未満ならキャッシュを返す
      if (!force && last && cached && now - last < DEFAULT_CACHE_TTL_MS) {
        this.items = cached
        return
      }

      const list = await houseworkApi.fetchHouseworks(householdId)
      this.items = list
      this.itemsByHouseholdId[householdId] = [...list]
      this.lastFetchedAtByHouseholdId[householdId] = now
    },

    /**
     * 指定された家事を取得する。
     * @param houseworkId 家事ID
     * @returns 家事Domain Model
     */
    async loadOne(houseworkId: number): Promise<Housework> {
      const model = await houseworkApi.getHousework(houseworkId)

      // 既に items にあるなら更新、なければ追加
      const index = this.items.findIndex((h) => h.houseworkId === houseworkId)
      if (index >= 0) {
        this.items.splice(index, 1, model)
      } else {
        this.items.push(model)
      }
      this.current = model
      return model
    },

    /**
     * 家事を登録する。
     * @param input 画面入力値
     * @returns 家事Domain Model
     */
    async create(input: HouseworkSaveInput) {
      const householdStore = useHouseholdStore()
      const householdId = householdStore.currentHouseholdId
      if (!householdId) {
        throw new Error('世帯が選択されていません')
      }

      const created = await houseworkApi.createHousework(householdId, input)
      this.items.push(created)

      // householdIdキャッシュ側も更新
      const list = this.itemsByHouseholdId[householdId] ?? []
      this.itemsByHouseholdId[householdId] = [...list, created]
      return created
    },

    /**
     * 指定された家事IDの家事を更新する。
     * @param houseworkId 家事ID
     * @param input 画面入力値
     * @returns 家事Domain Model
     */
    async update(houseworkId: number, input: HouseworkSaveInput) {
      const householdStore = useHouseholdStore()
      const householdId = householdStore.currentHouseholdId
      if (!householdId) {
        throw new Error('世帯が選択されていません')
      }

      const updated = await houseworkApi.updateHousework(householdId, houseworkId, input)

      // stateへ反映
      this.current = updated
      const idx = this.items.findIndex((h) => h.houseworkId === houseworkId)
      if (idx >= 0) {
        this.items[idx] = updated
      }

      const list = this.itemsByHouseholdId[householdId] ?? []
      const cacheIdx = list.findIndex((h) => h.houseworkId === houseworkId)
      if (cacheIdx >= 0) {
        const clone = [...list]
        clone[cacheIdx] = updated
        this.itemsByHouseholdId[householdId] = clone
      }

      return updated
    },

    /**
     * 指定された家事IDの家事を削除する。
     * @param houseworkId 家事ID
     */
    async delete(houseworkId: number) {
      const householdStore = useHouseholdStore()
      const householdId = householdStore.currentHouseholdId

      await houseworkApi.deleteHousework(houseworkId)

      this.items = this.items.filter((item) => item.houseworkId !== houseworkId)

      if (householdId) {
        const list = this.itemsByHouseholdId[householdId] ?? []
        this.itemsByHouseholdId[householdId] = list.filter(
          (item) => item.houseworkId !== houseworkId,
        )
      }

      if (this.current?.houseworkId === houseworkId) {
        this.current = null
      }
    },

    clear() {
      this.items = []
      this.current = null
    },
  },
})
