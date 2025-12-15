// src/domain/housework/houseworkForm.validation.ts
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'

// バイト長を計算するユーティリティ
const byteLength = (s: string | undefined | null): number =>
  s ? new TextEncoder().encode(s).length : 0

export const houseworkFormSchema = yup.object({
  // 家事名：必須 & 100バイト以内
  name: yup
    .string()
    .required('housework.form.errors.name.required')
    .test(
      'name-byte-length',
      'housework.form.errors.name.maxBytes',
      (value) => byteLength(value) <= 100,
    ),

  // 説明：任意 & 500バイト以内
  description: yup
    .string()
    .nullable()
    .test(
      'desc-byte-length',
      'housework.form.errors.description.maxBytes',
      (value) => byteLength(value) <= 500,
    ),

  category: yup.string().required('housework.form.errors.category.required'),

  recurrenceType: yup.string().required('housework.form.errors.recurrenceType.required'),

  weeklyDays: yup
    .array()
    .of(yup.string())
    .when('recurrenceType', {
      is: '1',
      then: (schema) => schema.min(1, 'housework.form.errors.weeklyDays.required'),
    }),

  dayOfMonthOption: yup
    .string()
    .nullable()
    .when('recurrenceType', {
      is: '2',
      then: (schema) => schema.required('housework.form.errors.dayOfMonth.required'),
    }),

  nthWeek: yup
    .string()
    .nullable()
    .when('recurrenceType', {
      is: '3',
      then: (schema) => schema.required('housework.form.errors.nthWeek.required'),
    }),

  weekday: yup
    .string()
    .nullable()
    .when('recurrenceType', {
      is: '3',
      then: (schema) => schema.required('housework.form.errors.weekday.required'),
    }),

  startDate: yup.string().required('housework.form.errors.startDate.required'),

  endDate: yup
    .string()
    .required('housework.form.errors.endDate.required')
    .test('end-after-start', 'housework.form.errors.endDate.afterStart', (value, ctx) => {
      const start = ctx.parent.startDate as string | undefined
      if (!value || !start) return true
      return value >= start
    }),
})

export type HouseworkFormSchemaType = InferType<typeof houseworkFormSchema>

export const houseworkFormTypedSchema = toTypedSchema(houseworkFormSchema)
