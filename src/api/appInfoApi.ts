import { apiClient } from './client'
import type { AppInfoModel } from '@/domain'

export const appInfoApi = {
  /**
   * バックエンドのバージョン情報を取得する
   * 認証不要エンドポイント（SecurityConfig で permitAll 済み）
   */
  async fetchAppInfo(): Promise<AppInfoModel> {
    const res = await apiClient.get<AppInfoResponse>('/actuator/info')
    return toAppInfoModel(res.data)
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * GET /actuator/info のレスポンスDTO
 * Spring Boot Actuator の info エンドポイントの形式に合わせる
 */
interface AppInfoResponse {
  app: {
    version: string
  }
}

// ---- Mapper ----------------------------------------------------

const toAppInfoModel = (dto: AppInfoResponse): AppInfoModel => ({
  apiVersion: dto.app.version,
})
