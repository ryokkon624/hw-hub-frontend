/**
 * ログインユーザDomain Model
 */
export interface LoginUser {
  userId: number
  email: string
  displayName: string
  locale: string
  iconUrl?: string | null
}

/**
 * ログイン後のセッション情報Domain Model
 */
export interface AuthSession {
  accessToken: string
  user: LoginUser
}
