import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { Locale } from '@/i18n'

// 文字列バイト長（HouseworkForm と同じ）
const byteLength = (s: string | undefined | null): number =>
  s ? new TextEncoder().encode(s).length : 0

// 5MB
const MAX_ICON_BYTES = 5 * 1024 * 1024

export const accountSettingsSchema = yup.object({
  // 表示名：必須 & 100バイト以内
  displayName: yup
    .string()
    .required('account.form.errors.displayName.required')
    .test(
      'displayName-byte-length',
      'account.form.errors.displayName.maxBytes',
      (value) => byteLength(value) <= 100,
    ),

  // ロケール：必須（ja / en / es など）
  locale: yup.string<Locale>().required('account.form.errors.locale.required'),

  // アイコンファイル：任意 & 5MB 以内
  iconFile: yup
    .mixed()
    .nullable()
    .test('iconFile-size', 'account.form.errors.iconFile.maxSize', (value) => {
      if (!value) return true // null / undefined は OK（任意）
      const file = value as File
      return file.size <= MAX_ICON_BYTES
    }),
})

export type AccountSettingsSchemaType = InferType<typeof accountSettingsSchema>

export const accountSettingsTypedSchema = toTypedSchema(accountSettingsSchema)
