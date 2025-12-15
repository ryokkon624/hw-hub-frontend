/**
 * ユーザ Domain Model
 */
export type UserProfile = {
  userId: number
  email: string
  displayName: string
  locale: string // 'ja' | 'en' | 'es'
  iconUrl?: string | null
}
