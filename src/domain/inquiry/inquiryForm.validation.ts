import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'

export const inquiryFormSchema = yup.object({
  category: yup.string().required('inquiry.create.validation.category.required'),
  title: yup
    .string()
    .required('inquiry.create.validation.title.required')
    .max(200, 'inquiry.create.validation.title.maxLength'),
  body: yup.string().required('inquiry.create.validation.body.required'),
})

export type InquiryFormSchemaType = InferType<typeof inquiryFormSchema>
export const inquiryFormTypedSchema = toTypedSchema(inquiryFormSchema)
