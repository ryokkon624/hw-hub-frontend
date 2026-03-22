import type { UserRoleCode, PermissionCode } from '@/constants/code.constants'

/**
 * ログインユーザDomain Model
 */
export interface LoginUser {
  userId: number
  email: string
  authProvider: string
  displayName: string
  locale: string
  notificationEnabled: boolean
  iconUrl?: string | null
}

/**
 * ログイン後のセッション情報Domain Model
 */
export interface AuthSession {
  accessToken: string
  user: LoginUser
}

/**
 * アカウント登録結果 Domain Model
 *
 * - local/stg（メール認証OFF）: kind='LOGGED_IN' で AuthSession が返る
 * - prod（メール認証ON）: kind='VERIFICATION_REQUIRED' でメール確認待ちになる
 */
export type RegisterResult =
  | {
      kind: 'LOGGED_IN'
      session: AuthSession
    }
  | {
      kind: 'VERIFICATION_REQUIRED'
      verificationExpiresAt?: string | null
    }

/**
 * ユーザのロール情報Domain Model
 */
export interface MyRolesModel {
  roles: UserRoleCode[]
  permissions: PermissionCode[]
}

/**
 * 管理ユーザDomain Model
 */
export interface AdminUserModel {
  userId: number
  email: string
  displayName: string
  locale: string
  isActive: boolean
  roles: UserRoleCode[]
}
