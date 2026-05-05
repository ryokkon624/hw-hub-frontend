import type { Announcement } from '@/domain'
import type { AnnouncementSeverityCode, AnnouncementScopeCode } from '@/constants/code.constants'
import { apiClient } from './client'

export const announcementApi = {
  /**
   * 現在有効なアナウンス一覧を取得する。
   * @returns Announcement ドメインモデル配列
   */
  async fetchActiveAnnouncements(): Promise<Announcement[]> {
    const res = await apiClient.get<AnnouncementsResponse>('/api/announcements/active')

    if (Array.isArray(res.data.announcements)) {
      return res.data.announcements.map(toModel)
    }

    return []
  },
}

// ---- API DTO ----------------------------------------------------

type AnnouncementsResponse = {
  announcements: AnnouncementDto[]
}

interface AnnouncementDto {
  id: number
  titleJa: string
  titleEn: string
  titleEs: string
  bodyJa: string
  bodyEn: string
  bodyEs: string
  severity: string
  targetScope: string
  startAt: string
  endAt: string
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

const toModel = (dto: AnnouncementDto): Announcement => ({
  id: dto.id,
  titleJa: dto.titleJa,
  titleEn: dto.titleEn,
  titleEs: dto.titleEs,
  bodyJa: dto.bodyJa,
  bodyEn: dto.bodyEn,
  bodyEs: dto.bodyEs,
  severity: dto.severity as AnnouncementSeverityCode,
  targetScope: dto.targetScope as AnnouncementScopeCode,
  startAt: dto.startAt,
  endAt: dto.endAt,
})
