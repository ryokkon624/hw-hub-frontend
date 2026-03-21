import type { Router } from 'vue-router'
import type { NotificationModel } from '@/domain'
import { NOTIFICATION_LINK_TYPE } from '@/constants/code.constants'

export async function navigateByNotification(router: Router, n: NotificationModel) {
  switch (n.linkType) {
    case NOTIFICATION_LINK_TYPE.NONE:
      return

    case NOTIFICATION_LINK_TYPE.MY_TASKS:
      await router.push({ name: 'housework.tasks' }).catch(() => {})
      return

    case NOTIFICATION_LINK_TYPE.HOUSEHOLD:
      await router.push({ name: 'settings.household' }).catch(() => {})
      return

    case NOTIFICATION_LINK_TYPE.SETTINGS:
      await router.push({ name: 'settings.account' }).catch(() => {})
      return

    case NOTIFICATION_LINK_TYPE.INVITATION:
      await router.push({ name: 'settings.household' }).catch(() => {})
      return

    case NOTIFICATION_LINK_TYPE.INQUIRY:
      await router
        .push({ name: 'settings.inquiry.detail', params: { inquiryId: String(n.linkId) } })
        .catch(() => {})
      return

    default:
      return
  }
}
