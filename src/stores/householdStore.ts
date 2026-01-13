import { defineStore } from 'pinia'
import type { HouseholdMember, HouseholdModel } from '@/domain'
import { userApi } from '@/api/userApi'
import { householdApi } from '@/api/householdApi'
import { householdMemberApi } from '@/api/householdMemberApi'
import { HOUSEHOLD_MEMBER_STATUS } from '@/constants/code.constants'
import { DEFAULT_CACHE_TTL_MS } from '@/constants/cache.constants'

const STORAGE_KEY = 'hwhub.currentHouseholdId'

interface HouseholdState {
  households: HouseholdModel[]
  currentHouseholdId: number | null
  membersByHouseholdId: Record<number, HouseholdMember[]>
  lastFetchedAtByHouseholdId: Record<number, number>
}

export const useHouseholdStore = defineStore('household', {
  state: (): HouseholdState => ({
    households: [],
    currentHouseholdId: null,
    membersByHouseholdId: {},
    lastFetchedAtByHouseholdId: {},
  }),

  getters: {
    /**
     * 選択中の世帯を返す。
     * @param state
     * @returns 世帯Domain Model
     */
    currentHousehold(state): HouseholdModel | null {
      return state.households.find((h) => h.householdId === state.currentHouseholdId) ?? null
    },

    /**
     * 選択中の世帯の全メンバーを返す。
     * @param state
     * @returns 世帯メンバーDomain Model配列
     */
    currentAllMembers(state): HouseholdMember[] {
      const id = state.currentHouseholdId
      if (!id) return []
      return state.membersByHouseholdId[id] ?? []
    },

    /**
     * 選択中の世帯の有効なメンバーを返す。
     * @returns 世帯メンバーDomain Model配列
     */
    currentMembers(): HouseholdMember[] {
      return this.currentAllMembers.filter((m) => m.status !== HOUSEHOLD_MEMBER_STATUS.LEFT)
    },

    /**
     * 選択中の世帯の招待中のメンバーを返す。
     * @returns 世帯メンバーDomain Model配列
     */
    currentInvitedMembers(): HouseholdMember[] {
      return this.currentAllMembers.filter((m) => m.status === HOUSEHOLD_MEMBER_STATUS.INVITED)
    },
  },

  actions: {
    /**
     * localStorage から currentHouseholdId を復元する。
     * アプリ起動時・ログイン復元時に呼ばれる。
     */
    initFromStorage() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const parsed = Number(raw)
      if (!Number.isNaN(parsed)) {
        this.currentHouseholdId = parsed
      }
    },

    /**
     * 所属世帯一覧をバックエンドから取得する。
     */
    async fetchMyHouseholds() {
      const list = await userApi.getUserHouseholds()
      this.households = list

      // まだ currentHouseholdId が決まっていなければ先頭をセット
      if (this.currentHouseholdId == null && list.length > 0) {
        if (list[0] != null) {
          this.setCurrentHousehold(list[0].householdId)
        }
      }
      if (this.households.length == 0) {
        this.currentHouseholdId = null
      }
    },

    /**
     * 世帯メンバーをバックエンドから取得する。
     * @param householdId 世帯ID
     * @param options TTLを無視し強制取得する場合はforce:true。
     */
    async fetchMembers(householdId: number, options?: { force?: boolean }) {
      const force = options?.force ?? false

      const now = Date.now()
      const last = this.lastFetchedAtByHouseholdId[householdId]

      if (
        !force &&
        last &&
        now - last < DEFAULT_CACHE_TTL_MS &&
        this.membersByHouseholdId[householdId]
      ) {
        // キャッシュをそのまま使う
        return
      }

      const members = await householdApi.getHouseholdMembers(householdId)
      this.membersByHouseholdId[householdId] = members
      this.lastFetchedAtByHouseholdId[householdId] = now
    },

    /**
     * 現在選択中の世帯を変更し、localStorage にも保存
     * @param householdId 世帯ID
     */
    async setCurrentHousehold(householdId: number | null) {
      this.currentHouseholdId = householdId
      if (householdId == null) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, String(householdId))
        await this.fetchMembers(householdId)
      }
    },

    /**
     * storeの世帯名を更新する。
     * @param householdId 世帯ID
     * @param name 世帯名
     */
    updateHouseholdNameLocal(householdId: number, name: string) {
      const target = this.households.find((h) => h.householdId === householdId)
      if (target) {
        target.name = name
      }
    },

    /**
     * 世帯名を更新する。
     * @param householdId 世帯ID
     * @param name 世帯名
     */
    async updateHouseholdName(householdId: number, name: string): Promise<void> {
      await householdApi.updateHouseholdName(householdId, name)

      this.updateHouseholdNameLocal(householdId, name)
    },

    /**
     * 世帯を登録する。
     * @param name 世帯名
     */
    async createHousehold(name: string) {
      const trimmed = name.trim()
      if (!trimmed) {
        throw new Error('世帯名が空です')
      }

      const data = await householdApi.createHousehold(trimmed)

      // households に追加
      const newHousehold = data as HouseholdModel
      this.households.push(newHousehold)

      // 現在の世帯にする
      this.currentHouseholdId = newHousehold.householdId
      await this.fetchMembers(data.householdId, { force: true })
    },

    /**
     * 世帯から離脱する。
     * @param household 世帯ID
     */
    async leaveMyself(household: number) {
      await householdMemberApi.leaveMyself(household)
      await this.fetchMyHouseholds()
    },

    /**
     * 指定されたユーザを世帯から離脱させる。
     * @param household 世帯ID
     * @param userId ユーザID
     */
    async removeMember(household: number, userId: number) {
      await householdMemberApi.removeMember(household, userId)
      await this.fetchMembers(household, { force: true })
    },

    /**
     * 世帯を削除する。
     * @param householdId 世帯ID
     */
    async deleteHousehold(householdId: number) {
      await householdApi.deleteHousehold(householdId)

      this.households = this.households.filter((h) => h.householdId !== householdId)

      if (this.currentHouseholdId === householdId) {
        const next = this.households[0]?.householdId ?? null
        await this.setCurrentHousehold(next)
      }
    },

    /**
     * 世帯のOWNERを譲渡する。
     * @param householdId 世帯ID
     * @param newOwnerUserId 新しいOWNERのユーザID
     */
    async transferOwnership(householdId: number, newOwnerUserId: number) {
      await householdApi.transferOwner(householdId, newOwnerUserId)

      // storeの情報を更新
      const target = this.households.find((h) => h.householdId === householdId)
      if (target) {
        target.ownerUserId = newOwnerUserId
      }

      // メンバー一覧を再取得（roleが変わるため）
      await this.fetchMembers(householdId, { force: true })
    },

    /**
     * ログアウト時などに全部リセットしたい場合だけ使う
     */
    reset() {
      this.households = []
      this.currentHouseholdId = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
