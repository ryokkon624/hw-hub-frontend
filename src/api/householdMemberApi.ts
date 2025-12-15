// src/api/householdMemberApi.ts
import { apiClient } from './client'

export const householdMemberApi = {
  /**
   * 自身のニックネームを更新する。
   * @param householdId 世帯ID
   * @param nickname ニックネーム
   */
  async updateMyNickname(householdId: number, nickname: string): Promise<void> {
    await apiClient.put(`/api/households/${householdId}/members/me/nickname`, {
      nickname,
    })
  },

  /**
   * 世帯から離脱する。
   * @param householdId 世帯ID
   */
  async leaveMyself(householdId: number): Promise<void> {
    await apiClient.delete(`/api/households/${householdId}/members/me`)
  },

  /**
   * 指定されたユーザを世帯から離脱させる。
   * @param householdId 世帯ID
   * @param userId ユーザID
   */
  async removeMember(householdId: number, userId: number): Promise<void> {
    await apiClient.delete(`/api/households/${householdId}/members/${userId}`)
  },
}
