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
   * 自分のパスワードを変更する。
   * @param payload 現在パスワード / 新しいパスワード
   */
  async changeMyPassword(payload: ChangeMyPasswordRequestDto): Promise<void> {
    await apiClient.put<void>('/api/users/me/password', payload)
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
   * 通知設定を取得する。
   * @returns 通知設定Response用のDTO
   */
  async getNotificationSettings(): Promise<NotificationSettingsResponse> {
    const res = await apiClient.get<NotificationSettingsResponse>(
      '/api/users/me/notification-settings',
    )
    return res.data
  },

  /**
   * 通知設定を更新する。
   * @param req 通知設定
   * @returns 通知設定Response用のDTO
   */
  async updateNotificationSettings(
    req: UpdateNotificationSettingsRequest,
  ): Promise<NotificationSettingsResponse> {
    const res = await apiClient.put('/api/users/me/notification-settings', req)
    return res.data
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
  authProvider: string
  displayName: string
  locale: string
  notificationEnabled: boolean
  iconUrl?: string | null
}

/**
 * パスワード変更Request用のDTO
 */
interface ChangeMyPasswordRequestDto {
  currentPassword: string
  newPassword: string
}

/**
 * 通知設定更新Request用のDTO
 */
interface UpdateNotificationSettingsRequest {
  notificationEnabled: boolean
  groupSettings?: Record<string, boolean>
}

/**
 * 通知設定Response用のDTO
 */
interface NotificationSettingsResponse {
  notificationEnabled: boolean
  groupSettings: Record<string, boolean>
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
  authProvider: dto.authProvider,
  displayName: dto.displayName,
  locale: dto.locale,
  notificationEnabled: dto.notificationEnabled,
  iconUrl: dto.iconUrl ?? null,
})
