import { describe, it, expect } from 'vitest'
import {
  houseworkFormSchema,
  type HouseworkFormSchemaType,
} from '@/domain/housework/houseworkForm.validation'

describe('houseworkForm.validation', () => {
  const baseValid: HouseworkFormSchemaType = {
    name: '掃除',
    description: 'desc',
    category: 'CLEAN',
    recurrenceType: '1', // WEEKLY
    weeklyDays: ['0'],
    dayOfMonthOption: null,
    nthWeek: null,
    weekday: null,
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  }

  const validate = async (data: Partial<HouseworkFormSchemaType>) =>
    houseworkFormSchema.validate(data, { abortEarly: false })

  const expectErrors = async (
    data: Partial<HouseworkFormSchemaType>,
    expectedMessages: string[],
  ) => {
    await expect(validate(data)).rejects.toMatchObject({
      errors: expect.arrayContaining(expectedMessages),
    })
  }

  it('name: 必須 & 100バイト以内', async () => {
    // 必須
    await expectErrors(
      {
        ...baseValid,
        name: '' as unknown as string, // required 判定させたいだけなので空文字
      },
      ['housework.form.errors.name.required'],
    )

    // 100バイト以内（"あ" = 3バイト × 30 = 90バイト → OK）
    const okName = 'あ'.repeat(30)
    await expect(
      validate({
        ...baseValid,
        name: okName,
      }),
    ).resolves.toBeTruthy()

    // 101バイト以上（"あ" 40個 = 120バイト → NG）
    const ngName = 'あ'.repeat(40)
    await expectErrors(
      {
        ...baseValid,
        name: ngName,
      },
      ['housework.form.errors.name.maxBytes'],
    )
  })

  it('description: 任意 & 500バイト以内（undefined / null も OK）', async () => {
    // undefined
    await expect(
      validate({
        ...baseValid,
        description: undefined,
      }),
    ).resolves.toBeTruthy()

    // null
    await expect(
      validate({
        ...baseValid,
        description: null,
      }),
    ).resolves.toBeTruthy()

    // 500バイト以内
    const okDesc = 'あ'.repeat(150) // 150*3=450バイト
    await expect(
      validate({
        ...baseValid,
        description: okDesc,
      }),
    ).resolves.toBeTruthy()

    // 500バイト超過
    const ngDesc = 'あ'.repeat(200) // 600バイト
    await expectErrors(
      {
        ...baseValid,
        description: ngDesc,
      },
      ['housework.form.errors.description.maxBytes'],
    )
  })

  it('category / recurrenceType は必須', async () => {
    await expectErrors(
      {
        ...baseValid,
        category: '' as unknown as string,
      },
      ['housework.form.errors.category.required'],
    )

    await expectErrors(
      {
        ...baseValid,
        recurrenceType: '' as unknown as string,
      },
      ['housework.form.errors.recurrenceType.required'],
    )
  })

  it('weeklyDays: recurrenceType = "1" のときは 1件以上必須、それ以外は任意', async () => {
    // WEEKLY で weeklyDays 空 → エラー
    await expectErrors(
      {
        ...baseValid,
        recurrenceType: '1',
        weeklyDays: [],
      },
      ['housework.form.errors.weeklyDays.required'],
    )

    // WEEKLY で1件ある → OK
    await expect(
      validate({
        ...baseValid,
        recurrenceType: '1',
        weeklyDays: ['2'],
      }),
    ).resolves.toBeTruthy()

    // MONTHLY のときは weeklyDays 空でも OK
    await expect(
      validate({
        ...baseValid,
        recurrenceType: '2',
        weeklyDays: [],
        dayOfMonthOption: '1',
      }),
    ).resolves.toBeTruthy()
  })

  it('dayOfMonthOption: recurrenceType = "2" のとき必須', async () => {
    await expectErrors(
      {
        ...baseValid,
        recurrenceType: '2',
        dayOfMonthOption: null,
        weeklyDays: [], // WEEKLY 制約は関係ないので空にしておく
      },
      ['housework.form.errors.dayOfMonth.required'],
    )

    await expect(
      validate({
        ...baseValid,
        recurrenceType: '2',
        dayOfMonthOption: '15',
        weeklyDays: [],
      }),
    ).resolves.toBeTruthy()
  })

  it('nthWeek / weekday: recurrenceType = "3" のとき必須', async () => {
    // 両方 null → それぞれエラー
    await expectErrors(
      {
        ...baseValid,
        recurrenceType: '3',
        nthWeek: null,
        weekday: null,
        weeklyDays: [],
      },
      ['housework.form.errors.nthWeek.required', 'housework.form.errors.weekday.required'],
    )

    // 両方とも指定されていれば OK
    await expect(
      validate({
        ...baseValid,
        recurrenceType: '3',
        nthWeek: '2',
        weekday: '1',
        weeklyDays: [],
      }),
    ).resolves.toBeTruthy()
  })

  it('startDate / endDate: startDate 必須 & endDate は startDate 以降である必要がある', async () => {
    // startDate 未指定
    await expectErrors(
      {
        ...baseValid,
        startDate: '' as unknown as string,
      },
      ['housework.form.errors.startDate.required'],
    )

    // endDate 未指定
    await expectErrors(
      {
        ...baseValid,
        endDate: '' as unknown as string,
      },
      ['housework.form.errors.endDate.required'],
    )

    // start < end → OK
    await expect(
      validate({
        ...baseValid,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      }),
    ).resolves.toBeTruthy()

    // start == end → OK
    await expect(
      validate({
        ...baseValid,
        startDate: '2025-01-10',
        endDate: '2025-01-10',
      }),
    ).resolves.toBeTruthy()

    // end < start → NG
    await expectErrors(
      {
        ...baseValid,
        startDate: '2025-01-10',
        endDate: '2025-01-09',
      },
      ['housework.form.errors.endDate.afterStart'],
    )
  })
})
