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
