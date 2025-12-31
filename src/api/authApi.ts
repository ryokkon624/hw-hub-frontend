import { apiClient } from './client'
import type { AuthSession, LoginUser } from '@/domain'

export const authApi = {
  /**
   * ログイン処理を行う。
   * @param payload
   * @returns ログイン後のセッション情報 Domain Model
   */
  async login(payload: { email: string; password: string }): Promise<AuthSession> {
    const res = await apiClient.post<LoginResponseDto>(
      '/api/auth/login',
      payload as LoginRequestDto,
    )
    return toAuthSession(res.data)
  },

  /**
   * アカウント登録を行う。
   * @param body アカウント登録時に入力値
   * @returns ログイン後のセッション情報 Domain Model
   */
  async register(body: {
    email: string
    password: string
    displayName: string
    locale: string
    invitationToken?: string | null
  }): Promise<AuthSession> {
    const res = await apiClient.post<LoginResponseDto>(
      '/api/auth/register',
      body as RegisterRequestDto,
    )
    return toAuthSession(res.data)
  },

  /**
   * S3への画像をPUTする。
   * @param uploadUrl presignedUrl
   * @param file Uploadするファイル
   */
  async putToPresignedUrl(uploadUrl: string, file: File) {
    const contentType = file.type || 'application/octet-stream'

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    })

    if (!res.ok) {
      // S3はCORSの都合で本文が読めないことがあるので
      const text = await res.text().catch(() => '')
      throw new Error(`S3 upload failed: ${res.status} ${res.statusText} ${text}`)
    }
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * ログインRequest用のDTO
 */
interface LoginRequestDto {
  email: string
  password: string
}

/**
 * アカウント登録Request用のDTO
 */
interface RegisterRequestDto {
  email: string
  password: string
  displayName: string
  locale: string
  invitationToken?: string | null
}

/**
 * ログインResonse用のユーザ DTO
 */
interface LoginUserDto {
  userId: number
  email: string
  displayName: string
  locale: string
  iconUrl?: string | null
}

/**
 * ログインResonse用のDTO
 */
interface LoginResponseDto {
  accessToken: string
  user: LoginUserDto
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toLoginUser = (dto: LoginUserDto): LoginUser => ({
  userId: dto.userId,
  email: dto.email,
  displayName: dto.displayName,
  locale: dto.locale,
  iconUrl: dto.iconUrl ?? null,
})

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toAuthSession = (dto: LoginResponseDto): AuthSession => ({
  accessToken: dto.accessToken,
  user: toLoginUser(dto.user),
})
