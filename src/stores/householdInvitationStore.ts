import { defineStore } from 'pinia'
import { householdInvitationApi } from '@/api/householdInvitationApi'
import type { HouseholdInvitationModel } from '@/domain'
import { INVITATION_STATUS } from '@/constants/code.constants'

type State = {
  itemsByHouseholdId: Record<number, HouseholdInvitationModel[]>
}

export const useHouseholdInvitationStore = defineStore('householdInvitation', {
  state: (): State => ({
    itemsByHouseholdId: {},
  }),

  getters: {
    /**
     * 指定された世帯の招待情報を返す。
     * @param state
     * @returns 招待Domain Model
     */
    byHousehold:
      (state) =>
      (householdId: number | null | undefined): HouseholdInvitationModel[] => {
        if (!householdId) return []
        return state.itemsByHouseholdId[householdId] ?? []
      },
  },

  actions: {
    /**
     * 世帯の招待情報を取得する。
     * @param householdId 世帯ID
     * @param opts
     */
    async fetchByHousehold(householdId: number, opts?: { force?: boolean }) {
      if (!opts?.force && this.itemsByHouseholdId[householdId]) return

      const list = await householdInvitationApi.listByHousehold(householdId)
      this.itemsByHouseholdId[householdId] = list
    },

    /**
     * 招待する。
     * @param householdId 世帯ID
     * @param email 招待する人のメールアドレス
     * @returns 招待Domain Model
     */
    async createInvitation(householdId: number, email: string) {
      const created = await householdInvitationApi.create(householdId, email)
      const list = this.itemsByHouseholdId[householdId] ?? []
      this.itemsByHouseholdId[householdId] = [created, ...list]
      return created
    },

    /**
     * 招待を取り消す。
     * @param householdId 世帯ID
     * @param token トークン
     */
    async revokeInvitation(householdId: number, token: string) {
      await householdInvitationApi.revoke(token)
      const list = this.itemsByHouseholdId[householdId] ?? []
      this.itemsByHouseholdId[householdId] = list.map((inv) =>
        inv.invitationToken === token ? { ...inv, status: INVITATION_STATUS.REVOKED } : inv,
      )
    },
  },
})
