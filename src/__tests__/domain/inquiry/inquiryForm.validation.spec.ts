import { describe, it, expect } from 'vitest'
import {
  inquiryFormSchema,
  type InquiryFormSchemaType,
} from '@/domain/inquiry/inquiryForm.validation'

describe('inquiryForm.validation', () => {
  const baseValid: InquiryFormSchemaType = {
    category: '10',
    title: 'テスト件名',
    body: 'お問い合わせ内容',
  }

  const validate = (data: Partial<InquiryFormSchemaType>) =>
    inquiryFormSchema.validate(data, { abortEarly: false })

  const expectErrors = async (data: Partial<InquiryFormSchemaType>, expectedMessages: string[]) => {
    await expect(validate(data)).rejects.toMatchObject({
      errors: expect.arrayContaining(expectedMessages),
    })
  }

  it('全フィールド正常入力時はバリデーションが通る', async () => {
    await expect(validate(baseValid)).resolves.toBeTruthy()
  })

  describe('category', () => {
    it('未選択（空文字）の場合はエラーになる', async () => {
      await expectErrors({ ...baseValid, category: '' }, [
        'inquiry.create.validation.category.required',
      ])
    })

    it('undefinedの場合もエラーになる', async () => {
      await expectErrors({ ...baseValid, category: undefined }, [
        'inquiry.create.validation.category.required',
      ])
    })

    it('値が選択されている場合はバリデーションが通る', async () => {
      await expect(validate({ ...baseValid, category: '20' })).resolves.toBeTruthy()
    })
  })

  describe('title', () => {
    it('未入力の場合はエラーになる', async () => {
      await expectErrors({ ...baseValid, title: '' }, ['inquiry.create.validation.title.required'])
    })

    it('undefinedの場合もエラーになる', async () => {
      await expectErrors({ ...baseValid, title: undefined }, [
        'inquiry.create.validation.title.required',
      ])
    })

    it('200文字以内はバリデーションが通る', async () => {
      await expect(validate({ ...baseValid, title: 'a'.repeat(200) })).resolves.toBeTruthy()
    })

    it('201文字以上はエラーになる', async () => {
      await expectErrors({ ...baseValid, title: 'a'.repeat(201) }, [
        'inquiry.create.validation.title.maxLength',
      ])
    })
  })

  describe('body', () => {
    it('未入力の場合はエラーになる', async () => {
      await expectErrors({ ...baseValid, body: '' }, ['inquiry.create.validation.body.required'])
    })

    it('undefinedの場合もエラーになる', async () => {
      await expectErrors({ ...baseValid, body: undefined }, [
        'inquiry.create.validation.body.required',
      ])
    })

    it('値が入力されている場合はバリデーションが通る', async () => {
      await expect(
        validate({ ...baseValid, body: '詳しい内容を記述します。' }),
      ).resolves.toBeTruthy()
    })
  })

  it('全フィールド未入力時はそれぞれのエラーが全て返る', async () => {
    await expectErrors({ category: '', title: '', body: '' }, [
      'inquiry.create.validation.category.required',
      'inquiry.create.validation.title.required',
      'inquiry.create.validation.body.required',
    ])
  })
})
