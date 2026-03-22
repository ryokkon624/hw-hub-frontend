import { describe, it, expect, vi } from 'vitest'
import { navigateByNotification } from '@/utils/notificationLink'
import { NOTIFICATION_LINK_TYPE, type NotificationLinkTypeCode } from '@/constants/code.constants'
import type { NotificationModel } from '@/domain'
import type { Router } from 'vue-router'

describe('notificationLink', () => {
  const createNotification = (
    linkType: NotificationLinkTypeCode | string,
  ): NotificationModel => ({
    notificationId: 1,
    isRead: false,
    occurredAt: new Date(),
    titleKey: 'title',
    bodyKey: 'body',
    params: {},
    linkType: linkType as NotificationLinkTypeCode,
    linkId: null,
    aggregatedCount: 1,
  })

  const createMockRouter = () => {
    return {
      push: vi.fn().mockResolvedValue(true),
    } as unknown as Router
  }

  it('NONEのときはどこにも遷移しない', async () => {
    const router = createMockRouter()
    const notification = createNotification(NOTIFICATION_LINK_TYPE.NONE)

    await navigateByNotification(router, notification)

    expect(router.push).not.toHaveBeenCalled()
  })

  it('MY_TASKSのときはmyTasksに遷移する', async () => {
    const router = createMockRouter()
    const notification = createNotification(NOTIFICATION_LINK_TYPE.MY_TASKS)

    await navigateByNotification(router, notification)

    expect(router.push).toHaveBeenCalledWith({ name: 'housework.tasks' })
  })

  it('HOUSEHOLDのときはsettings.householdに遷移する', async () => {
    const router = createMockRouter()
    const notification = createNotification(NOTIFICATION_LINK_TYPE.HOUSEHOLD)

    await navigateByNotification(router, notification)

    expect(router.push).toHaveBeenCalledWith({ name: 'settings.household' })
  })

  it('SETTINGSのときはsettings.accountに遷移する', async () => {
    const router = createMockRouter()
    const notification = createNotification(NOTIFICATION_LINK_TYPE.SETTINGS)

    await navigateByNotification(router, notification)

    expect(router.push).toHaveBeenCalledWith({ name: 'settings.account' })
  })

  it('INVITATIONのときはsettings.householdに遷移する', async () => {
    const router = createMockRouter()
    const notification = createNotification(NOTIFICATION_LINK_TYPE.INVITATION)

    await navigateByNotification(router, notification)

    expect(router.push).toHaveBeenCalledWith({ name: 'settings.household' })
  })

  it('INQUIRYのときはsettings.inquiry.detailに遷移する', async () => {
    const router = createMockRouter()
    const notification = { ...createNotification(NOTIFICATION_LINK_TYPE.INQUIRY), linkId: 42 }

    await navigateByNotification(router, notification)

    expect(router.push).toHaveBeenCalledWith({
      name: 'settings.inquiry.detail',
      params: { inquiryId: '42' },
    })
  })

  it('未知のLinkTypeのときはどこにも遷移しない', async () => {
    const router = createMockRouter()
    const notification = createNotification('UNKNOWN_LINK_TYPE')

    await navigateByNotification(router, notification)

    expect(router.push).not.toHaveBeenCalled()
  })

  it('router.pushが例外を投げてもキャッチされる', async () => {
    const router = createMockRouter()
    // pushがエラーをthrowするようにモック
    vi.mocked(router.push).mockRejectedValue(new Error('Navigation Error'))
    const notification = createNotification(NOTIFICATION_LINK_TYPE.MY_TASKS)

    // 例外が投げられずに終了することを確認
    await expect(navigateByNotification(router, notification)).resolves.not.toThrow()
    expect(router.push).toHaveBeenCalledWith({ name: 'housework.tasks' })
  })
})
