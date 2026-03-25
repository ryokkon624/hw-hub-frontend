/**
 * ユーザ Domain Model
 */
export type UserProfile = {
  userId: number
  email: string
  authProvider: string
  displayName: string
  locale: string // 'ja' | 'en' | 'es'
  notificationEnabled: boolean
  iconUrl?: string | null
}

/**
 * 管理者用ユーザ詳細 Model
 */
export interface AdminUserDetailModel {
  userId: number
  email: string
  authProvider: string
  displayName: string
  locale: string
  notificationEnabled: boolean
  isActive: boolean
  iconUrl: string | null
  createdAt: Date
  updatedAt: Date
}
