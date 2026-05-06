// src/domain/announcement/announcementForm.validation.ts
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'

// バイト長を計算するユーティリティ
const byteLength = (s: string | undefined | null): number =>
  s ? new TextEncoder().encode(s).length : 0

export const announcementFormSchema = yup.object({
  // タイトル3言語：必須 & 200バイト以内
  titleJa: yup
    .string()
    .required('admin.announcement.validation.titleJa.required')
    .test(
      'titleJa-byte-length',
      'admin.announcement.validation.titleJa.maxBytes',
      (value) => byteLength(value) <= 200,
    ),

  titleEn: yup
    .string()
    .required('admin.announcement.validation.titleEn.required')
    .test(
      'titleEn-byte-length',
      'admin.announcement.validation.titleEn.maxBytes',
      (value) => byteLength(value) <= 200,
    ),

  titleEs: yup
    .string()
    .required('admin.announcement.validation.titleEs.required')
    .test(
      'titleEs-byte-length',
      'admin.announcement.validation.titleEs.maxBytes',
      (value) => byteLength(value) <= 200,
    ),

  // 本文3言語：必須
  bodyJa: yup.string().required('admin.announcement.validation.bodyJa.required'),
  bodyEn: yup.string().required('admin.announcement.validation.bodyEn.required'),
  bodyEs: yup.string().required('admin.announcement.validation.bodyEs.required'),

  // 設定
  severity: yup.string().required('admin.announcement.validation.severity.required'),
  targetScope: yup.string().required('admin.announcement.validation.targetScope.required'),
  startAt: yup.string().required('admin.announcement.validation.startAt.required'),
  endAt: yup
    .string()
    .required('admin.announcement.validation.endAt.required')
    .test('end-after-start', 'admin.announcement.validation.endAtAfterStartAt', (value, ctx) => {
      const start = ctx.parent.startAt as string | undefined
      if (!value || !start) return true
      return new Date(value) > new Date(start)
    }),
})

export type AnnouncementFormSchemaType = InferType<typeof announcementFormSchema>

export const announcementFormTypedSchema = toTypedSchema(announcementFormSchema)
