import { apiClient } from './client'
import type { HouseholdModel, UserProfile } from '@/domain'

export const userApi = {
  /**
   * ユーザの所属する世帯を取得する。
   * @returns 世帯Domain Model配列
   */
  async getUserHouseholds(): Promise<HouseholdModel[]> {
    const res = await apiClient.get<UserHouseholdDto[]>('/api/users/me/households')
    return res.data.map(toHouseholdModel)
  },

  /**
   * ユーザ情報を取得する。
   * @returns ユーザDomain Model
   */
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<UserProfileDto>('/api/users/me/profile')
    return toUserProfile(res.data)
  },

  /**
   * ユーザ情報を更新する。
   * @param payload 入力値
   */
  async updateProfile(payload: { displayName: string; locale: string }): Promise<void> {
    await apiClient.put('/api/users/me/profile', payload)
  },

  /**
   * ユーザのアイコンをuploadするURLを生成する。
   * @param params Uploadするファイル名など
   * @returns uploadするURL
   */
  async createIconUploadUrl(params: {
    fileName: string
    mimeType: string
  }): Promise<{ uploadUrl: string; fileKey: string }> {
    const res = await apiClient.post<{ uploadUrl: string; fileKey: string }>(
      '/api/users/me/icon/upload-url',
      params,
    )
    return res.data
  },

  /**
   * Uploadしたファイルの情報をDBに登録する。
   * @param params ファイルのキー
   */
  async updateUserIcon(params: { fileKey: string }): Promise<void> {
    await apiClient.post('/api/users/me/icon', params)
  },

  /**
   * アカウントを退会する。
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/api/users/me')
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * 世帯Response用のDTO
 */
interface UserHouseholdDto {
  householdId: number
  name: string
  ownerUserId: number
}

/**
 * ユーザResponse用のDTO
 */
interface UserProfileDto {
  userId: number
  email: string
  displayName: string
  locale: string
  iconUrl?: string | null
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toHouseholdModel = (dto: UserHouseholdDto): HouseholdModel => ({
  householdId: dto.householdId,
  name: dto.name,
  ownerUserId: dto.ownerUserId,
})

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toUserProfile = (dto: UserProfileDto): UserProfile => ({
  userId: dto.userId,
  email: dto.email,
  displayName: dto.displayName,
  locale: dto.locale,
  iconUrl: dto.iconUrl ?? null,
})
