import type { AnnouncementSeverityCode, AnnouncementScopeCode } from '@/constants/code.constants'

export interface Announcement {
  id: number
  titleJa: string
  titleEn: string
  titleEs: string
  bodyJa: string
  bodyEn: string
  bodyEs: string
  severity: AnnouncementSeverityCode
  targetScope: AnnouncementScopeCode
  startAt: string
  endAt: string
}
