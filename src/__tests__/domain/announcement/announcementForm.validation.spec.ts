import { describe, it, expect } from 'vitest'
import {
  announcementFormSchema,
  type AnnouncementFormSchemaType,
} from '@/domain/announcement/announcementForm.validation'

describe('announcementForm.validation', () => {
  const baseValid: AnnouncementFormSchemaType = {
    titleJa: 'タイトル日本語',
    titleEn: 'Title English',
    titleEs: 'Título Español',
    bodyJa: '本文日本語',
    bodyEn: 'Body English',
    bodyEs: 'Cuerpo Español',
    severity: 'INFO',
    targetScope: 'ALL',
    startAt: '2025-01-01T10:00',
    endAt: '2025-01-31T10:00',
  }

  const validate = async (data: Partial<AnnouncementFormSchemaType>) =>
    announcementFormSchema.validate(data, { abortEarly: false })

  const expectErrors = async (
    data: Partial<AnnouncementFormSchemaType>,
    expectedMessages: string[],
  ) => {
    await expect(validate(data)).rejects.toMatchObject({
      errors: expect.arrayContaining(expectedMessages),
    })
  }

  it('titleJa: 必須', async () => {
    await expectErrors({ ...baseValid, titleJa: '' as unknown as string }, [
      'admin.announcement.validation.titleJa.required',
    ])
  })

  it('titleEn: 必須', async () => {
    await expectErrors({ ...baseValid, titleEn: '' as unknown as string }, [
      'admin.announcement.validation.titleEn.required',
    ])
  })

  it('titleEs: 必須', async () => {
    await expectErrors({ ...baseValid, titleEs: '' as unknown as string }, [
      'admin.announcement.validation.titleEs.required',
    ])
  })

  it('bodyJa: 必須', async () => {
    await expectErrors({ ...baseValid, bodyJa: '' as unknown as string }, [
      'admin.announcement.validation.bodyJa.required',
    ])
  })

  it('bodyEn: 必須', async () => {
    await expectErrors({ ...baseValid, bodyEn: '' as unknown as string }, [
      'admin.announcement.validation.bodyEn.required',
    ])
  })

  it('bodyEs: 必須', async () => {
    await expectErrors({ ...baseValid, bodyEs: '' as unknown as string }, [
      'admin.announcement.validation.bodyEs.required',
    ])
  })

  it('severity: 必須', async () => {
    await expectErrors({ ...baseValid, severity: '' as unknown as string }, [
      'admin.announcement.validation.severity.required',
    ])
  })

  it('targetScope: 必須', async () => {
    await expectErrors({ ...baseValid, targetScope: '' as unknown as string }, [
      'admin.announcement.validation.targetScope.required',
    ])
  })

  it('startAt: 必須', async () => {
    await expectErrors({ ...baseValid, startAt: '' as unknown as string }, [
      'admin.announcement.validation.startAt.required',
    ])
  })

  it('endAt: 必須', async () => {
    await expectErrors({ ...baseValid, endAt: '' as unknown as string }, [
      'admin.announcement.validation.endAt.required',
    ])
  })

  it('titleJa: 200バイト以内 - OK（日本語66文字 = 198バイト）', async () => {
    // "あ" = 3バイト × 66 = 198バイト → OK
    const okTitle = 'あ'.repeat(66)
    await expect(validate({ ...baseValid, titleJa: okTitle })).resolves.toBeTruthy()
  })

  it('titleJa: 200バイト超過 - エラー（日本語67文字 = 201バイト）', async () => {
    // "あ" = 3バイト × 67 = 201バイト → NG
    const ngTitle = 'あ'.repeat(67)
    await expectErrors({ ...baseValid, titleJa: ngTitle }, [
      'admin.announcement.validation.titleJa.maxBytes',
    ])
  })

  it('titleEn: 200バイト以内 - OK（ASCII 200文字 = 200バイト）', async () => {
    const okTitle = 'A'.repeat(200)
    await expect(validate({ ...baseValid, titleEn: okTitle })).resolves.toBeTruthy()
  })

  it('titleEn: 200バイト超過 - エラー（ASCII 201文字 = 201バイト）', async () => {
    const ngTitle = 'A'.repeat(201)
    await expectErrors({ ...baseValid, titleEn: ngTitle }, [
      'admin.announcement.validation.titleEn.maxBytes',
    ])
  })

  it('titleEs: 200バイト以内 - OK（ASCII 200文字 = 200バイト）', async () => {
    const okTitle = 'A'.repeat(200)
    await expect(validate({ ...baseValid, titleEs: okTitle })).resolves.toBeTruthy()
  })

  it('titleEs: 200バイト超過 - エラー（ASCII 201文字 = 201バイト）', async () => {
    const ngTitle = 'A'.repeat(201)
    await expectErrors({ ...baseValid, titleEs: ngTitle }, [
      'admin.announcement.validation.titleEs.maxBytes',
    ])
  })

  it('endAt: startAt より後であれば OK', async () => {
    await expect(
      validate({
        ...baseValid,
        startAt: '2025-01-01T10:00',
        endAt: '2025-01-31T10:00',
      }),
    ).resolves.toBeTruthy()
  })

  it('endAt: startAt と同時刻はエラー', async () => {
    await expectErrors(
      {
        ...baseValid,
        startAt: '2025-01-01T10:00',
        endAt: '2025-01-01T10:00',
      },
      ['admin.announcement.validation.endAtAfterStartAt'],
    )
  })

  it('endAt: startAt より前はエラー', async () => {
    await expectErrors(
      {
        ...baseValid,
        startAt: '2025-01-10T10:00',
        endAt: '2025-01-01T10:00',
      },
      ['admin.announcement.validation.endAtAfterStartAt'],
    )
  })

  it('全フィールド valid の場合は成功', async () => {
    await expect(validate(baseValid)).resolves.toBeTruthy()
  })
})
