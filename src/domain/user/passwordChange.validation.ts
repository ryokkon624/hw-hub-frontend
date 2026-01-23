import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'

export const passwordChangeSchema = yup.object({
  currentPassword: yup
    .string()
    .required('settings.account.password.form.errors.currentPassword.required'),

  newPassword: yup
    .string()
    .required('settings.account.password.form.errors.newPassword.required')
    .min(8, 'settings.account.password.form.errors.newPassword.minLength'),

  newPasswordConfirm: yup
    .string()
    .required('settings.account.password.form.errors.newPasswordConfirm.required')
    .oneOf(
      [yup.ref('newPassword')],
      'settings.account.password.form.errors.newPasswordConfirm.mismatch',
    ),
})

export type PasswordChangeSchemaType = InferType<typeof passwordChangeSchema>

export const passwordChangeTypedSchema = toTypedSchema(passwordChangeSchema)
