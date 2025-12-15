import { describe, it, expect } from 'vitest'
import {
  accountSettingsSchema,
  type AccountSettingsSchemaType,
} from '@/domain/user/accountSettings.validation'

describe('accountSettings.validation', () => {
  const baseValid: AccountSettingsSchemaType = {
    displayName: 'ユーザー',
    locale: 'ja',
    iconFile: null,
  }

  const validate = async (data: Partial<AccountSettingsSchemaType>) =>
    accountSettingsSchema.validate(data, { abortEarly: false })

  const expectErrors = async (
    data: Partial<AccountSettingsSchemaType>,
    expectedMessages: string[],
  ) => {
    await expect(validate(data)).rejects.toMatchObject({
      errors: expect.arrayContaining(expectedMessages),
    })
  }

  it('displayName: 必須 & 100バイト以内', async () => {
    // 必須
    await expectErrors(
      {
        ...baseValid,
        displayName: '' as unknown as string,
      },
      ['account.form.errors.displayName.required'],
    )

    // 100バイト以内（"あ" 30個 = 90バイト）
    const okName = 'あ'.repeat(30)
    await expect(
      validate({
        ...baseValid,
        displayName: okName,
      }),
    ).resolves.toBeTruthy()

    // 100バイト超過（"あ" 40個 = 120バイト）
    const ngName = 'あ'.repeat(40)
    await expectErrors(
      {
        ...baseValid,
        displayName: ngName,
      },
      ['account.form.errors.displayName.maxBytes'],
    )
  })

  it('locale: 必須', async () => {
    await expectErrors(
      {
        ...baseValid,
        locale: '' as unknown as 'ja',
      },
      ['account.form.errors.locale.required'],
    )

    // 代表で 'ja' が通ることを確認
    await expect(
      validate({
        ...baseValid,
        locale: 'ja',
      }),
    ).resolves.toBeTruthy()
  })

  it('iconFile: null / undefined は OK、5MB 以下のみ許可', async () => {
    // null OK
    await expect(
      validate({
        ...baseValid,
        iconFile: null,
      }),
    ).resolves.toBeTruthy()

    // undefined も OK
    await expect(
      validate({
        ...baseValid,
        iconFile: undefined,
      }),
    ).resolves.toBeTruthy()

    // 5MB 未満の File → OK
    const smallFile = new File(['x'.repeat(1024 * 1024)], 'small.png', {
      type: 'image/png',
    })
    await expect(
      validate({
        ...baseValid,
        iconFile: smallFile,
      }),
    ).resolves.toBeTruthy()

    // 5MB 超過の File → NG
    const bigFile = new File(['x'.repeat(5 * 1024 * 1024 + 1)], 'big.png', {
      type: 'image/png',
    })
    await expectErrors(
      {
        ...baseValid,
        iconFile: bigFile,
      },
      ['account.form.errors.iconFile.maxSize'],
    )
  })
})
