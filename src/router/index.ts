import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'
import { PERMISSION, type PermissionCode } from '@/constants/code.constants'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
    requiresPermission?: PermissionCode
    titleKey?: string
    title?: string
    public?: boolean
  }
}

// Landing Page
import LandingPage from '@/views/LandingPage.vue'
// 認証
import LoginPage from '@/views/LoginPage.vue'
import SignupPage from '@/views/SignupPage.vue'
import InvitationPage from '@/views/InvitationPage.vue'
import SignupVerifyWaitPage from '@/views/SignupVerifyWaitPage.vue'
import EmailVerifyPage from '@/views/EmailVerifyPage.vue'
import PasswordForgotPage from '@/views/PasswordForgotPage.vue'
import PasswordResetSentPage from '@/views/PasswordResetSentPage.vue'
import PasswordResetPage from '@/views/PasswordResetPage.vue'
import AuthActionResultPage from '@/views/AuthActionResultPage.vue'
import OAuthResultPage from '@/views/auth/OAuthResultPage.vue'
// 共通レイアウト
import AppLayout from '@/layouts/AppLayout.vue'
// Home
import HomePage from '@/views/home/HomePage.vue'
// Housework Assignment / Tasks
import HouseworkAssignmentPage from '@/views/housework/assignment/HouseworkAssignmentPage.vue'
import MyTasksPage from '@/views/housework/tasks/MyTasksPage.vue'
// Settings/Housework
import HouseworkSettingsPage from '@/views/housework/settings/HouseworkSettingsPage.vue'
import HouseworkCreatePage from '@/views/housework/settings/HouseworkCreatePage.vue'
import HouseworkEditPage from '@/views/housework/settings/HouseworkEditPage.vue'
// Shopping
import ShoppingListPage from '@/views/shopping/ShoppingListPage.vue'
import ShoppingItemCreatePage from '@/views/shopping/ShoppingItemCreatePage.vue'
import ShoppingItemDetailPage from '@/views/shopping/ShoppingItemDetailPage.vue'
// Settings
import SettingsTopPage from '@/views/settings/SettingsTopPage.vue'
import AccountSettingsPage from '@/views/settings/AccountSettingsPage.vue'
import HouseholdSettingsPage from '@/views/settings/HouseholdSettingsPage.vue'
import AppInfoPage from '@/views/settings/AppInfoPage.vue'
import TermsPage from '@/views/settings/TermsPage.vue'
import PrivacyPolicyPage from '@/views/settings/PrivacyPolicyPage.vue'
import NotificationCenterPage from '@/views/notifications/NotificationCenterPage.vue'
// Inquiry
import InquiryListPage from '@/views/settings/inquiry/InquiryListPage.vue'
import InquiryCreatePage from '@/views/settings/inquiry/InquiryCreatePage.vue'
import InquiryDetailPage from '@/views/settings/inquiry/InquiryDetailPage.vue'
import AdminInquiryListPage from '@/views/admin/AdminInquiriesPage.vue'
import AdminInquiryDetailPage from '@/views/admin/AdminInquiryDetailPage.vue'
// Admin
import AdminTopPage from '@/views/admin/AdminTopPage.vue'
import AdminRolesPage from '@/views/admin/AdminRolesPage.vue'
import AdminUsersPage from '@/views/admin/AdminUsersPage.vue'
import AdminHouseworkTemplatesPage from '@/views/admin/AdminHouseworkTemplatesPage.vue'
import AdminHouseworkTemplateFormPage from '@/views/admin/AdminHouseworkTemplateFormPage.vue'

import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useRoleStore } from '@/stores/roleStore'

const routes: RouteRecordRaw[] = [
  // Landing Page (AC6: 認証不要)
  {
    path: '/landing',
    name: 'landing',
    component: LandingPage,
    meta: { title: 'HwHub - 家族みんなで家事を分担', public: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { title: 'ログイン', public: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupPage,
    meta: { title: 'Signup', public: true },
  },
  {
    path: '/signup/verify-wait',
    name: 'signup.verify-wait',
    component: SignupVerifyWaitPage,
    meta: { titleKey: 'pageTitles.signupVerifyWait', public: true },
  },
  {
    path: '/email-verify',
    name: 'email-verify',
    component: EmailVerifyPage,
    meta: { titleKey: 'pageTitles.emailVerify', public: true },
  },
  {
    path: '/invite/:token',
    name: 'invitation',
    component: InvitationPage,
    meta: { title: 'Invitation', public: true },
  },
  {
    path: '/password/forgot',
    name: 'password.forgot',
    component: PasswordForgotPage,
    meta: { titleKey: 'pageTitles.passwordForgot', public: true },
  },
  {
    path: '/password/reset-sent',
    name: 'password.reset-sent',
    component: PasswordResetSentPage,
    meta: { titleKey: 'pageTitles.passwordResetSent', public: true },
  },
  {
    path: '/password/reset',
    name: 'password.reset',
    component: PasswordResetPage,
    meta: { titleKey: 'pageTitles.passwordReset', public: true },
  },
  {
    path: '/auth/result',
    name: 'auth.result',
    component: AuthActionResultPage,
    meta: { titleKey: 'pageTitles.authResult', public: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: () => {
          const authStore = useAuthStore()
          if (!authStore.accessToken) authStore.initFromStorage()
          return authStore.isAuthenticated ? { name: 'home' } : { name: 'landing' }
        },
      },

      // ---- OAuth Result ----
      {
        path: 'oauth/result',
        name: 'oauth.result',
        component: OAuthResultPage,
        meta: { titleKey: 'pageTitles.oauthResult' },
      },

      // ---- Home ----
      {
        path: 'home',
        name: 'home',
        component: HomePage,
        meta: { titleKey: 'pageTitles.home' },
      },

      // ---- Housework ----
      {
        path: 'housework/assign',
        name: 'housework.assign',
        component: HouseworkAssignmentPage,
        meta: { titleKey: 'pageTitles.houseworkAssign' },
      },
      {
        path: 'housework/tasks',
        name: 'housework.tasks',
        component: MyTasksPage,
        meta: { titleKey: 'pageTitles.myTasks' },
      },

      // ---- Housework Settings ----
      {
        path: 'settings/housework',
        name: 'settings.housework',
        component: HouseworkSettingsPage,
        meta: { titleKey: 'pageTitles.houseworkSettings' },
      },
      {
        path: 'settings/housework/new',
        name: 'settings.housework.new',
        component: HouseworkCreatePage,
        meta: { titleKey: 'pageTitles.houseworkCreate' },
      },
      {
        path: 'settings/housework/:houseworkId/edit',
        name: 'settings.housework.edit',
        component: HouseworkEditPage,
        props: true,
        meta: { titleKey: 'pageTitles.houseworkEdit' },
      },

      // ---- Shopping ----
      {
        path: 'shopping',
        name: 'shopping',
        component: ShoppingListPage,
        meta: { titleKey: 'pageTitles.shopping' },
      },
      {
        path: 'shopping/new',
        name: 'shopping.new',
        component: ShoppingItemCreatePage,
        meta: { titleKey: 'pageTitles.shoppingCreate' },
      },
      {
        path: 'shopping/items/:itemId',
        name: 'shopping.item.detail',
        component: ShoppingItemDetailPage,
        props: true,
        meta: { titleKey: 'pageTitles.shoppingEdit' },
      },

      // ---- Settings ----
      {
        path: 'settings',
        name: 'settings',
        component: SettingsTopPage,
        meta: { titleKey: 'pageTitles.settings' },
      },
      {
        path: 'settings/account',
        name: 'settings.account',
        component: AccountSettingsPage,
        meta: { titleKey: 'pageTitles.accountSettings' },
      },
      {
        path: 'settings/household',
        name: 'settings.household',
        component: HouseholdSettingsPage,
        meta: { titleKey: 'pageTitles.householdSettings' },
      },
      {
        path: 'settings/app',
        name: 'settings.app',
        component: AppInfoPage,
        meta: { titleKey: 'pageTitles.app' },
      },
      {
        path: 'settings/app/terms',
        name: 'settings.app.terms',
        component: TermsPage,
        // requiresAuth: false で親の requiresAuth: true をオーバーライド（Landing Pageフッターから認証不要アクセスを許可）
        meta: { titleKey: 'pageTitles.terms', requiresAuth: false },
      },
      {
        path: 'settings/app/privacy',
        name: 'settings.app.privacy',
        component: PrivacyPolicyPage,
        // requiresAuth: false で親の requiresAuth: true をオーバーライド（Landing Pageフッターから認証不要アクセスを許可）
        meta: { titleKey: 'pageTitles.privacy', requiresAuth: false },
      },
      // ---- Notifications ----
      {
        path: 'notifications',
        name: 'notifications',
        component: NotificationCenterPage,
        meta: { titleKey: 'pageTitles.notifications' },
      },

      // ---- Admin ----
      {
        path: 'admin',
        meta: { requiresAdmin: true },
        children: [
          {
            path: '',
            name: 'admin',
            component: AdminTopPage,
            meta: { titleKey: 'pageTitles.admin', requiresAuth: true, requiresAdmin: true },
          },
          {
            path: 'users',
            name: 'admin.users',
            component: AdminUsersPage,
            meta: {
              titleKey: 'pageTitles.adminUsers',
              requiresAuth: true,
              requiresPermission: PERMISSION.USER_LIST_VIEW,
            },
          },
          {
            path: 'roles',
            name: 'admin.roles',
            component: AdminRolesPage,
            meta: {
              titleKey: 'pageTitles.adminRoles',
              requiresAuth: true,
              requiresPermission: PERMISSION.ROLE_MANAGE,
            },
          },
          {
            path: 'inquiries',
            name: 'admin.inquiries',
            component: AdminInquiryListPage,
            meta: {
              titleKey: 'pageTitles.adminInquiries',
              requiresAuth: true,
              requiresPermission: PERMISSION.INQUIRY_REPLY,
            },
          },
          {
            path: 'inquiries/:inquiryId',
            name: 'admin.inquiries.detail',
            component: AdminInquiryDetailPage,
            meta: {
              titleKey: 'pageTitles.adminInquiryDetail',
              requiresAuth: true,
              requiresPermission: PERMISSION.INQUIRY_REPLY,
            },
          },
          {
            path: 'housework-templates',
            name: 'admin.houseworkTemplates',
            component: AdminHouseworkTemplatesPage,
            meta: {
              titleKey: 'pageTitles.adminHouseworkTemplates',
              requiresAuth: true,
              requiresPermission: PERMISSION.SYS_TEMPLATE_MNG,
            },
          },
          {
            path: 'housework-templates/new',
            name: 'admin.houseworkTemplates.new',
            component: AdminHouseworkTemplateFormPage,
            meta: {
              titleKey: 'pageTitles.adminHouseworkTemplateNew',
              requiresAuth: true,
              requiresPermission: PERMISSION.SYS_TEMPLATE_MNG,
            },
          },
          {
            path: 'housework-templates/:id/edit',
            name: 'admin.houseworkTemplates.edit',
            component: AdminHouseworkTemplateFormPage,
            props: (route) => ({ id: Number(route.params.id) }),
            meta: {
              titleKey: 'pageTitles.adminHouseworkTemplateEdit',
              requiresAuth: true,
              requiresPermission: PERMISSION.SYS_TEMPLATE_MNG,
            },
          },
        ],
      },

      // ---- Inquiry ----
      {
        path: 'settings/inquiry',
        name: 'settings.inquiry',
        component: InquiryListPage,
        meta: { titleKey: 'pageTitles.inquiry' },
      },
      {
        path: 'settings/inquiry/new',
        name: 'settings.inquiry.new',
        component: InquiryCreatePage,
        meta: { titleKey: 'pageTitles.inquiryCreate' },
      },
      {
        path: 'settings/inquiry/:inquiryId',
        name: 'settings.inquiry.detail',
        component: InquiryDetailPage,
        meta: { titleKey: 'pageTitles.inquiryDetail' },
      },
    ],
  },
]

// ---- 認証チェック ----
export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  if (!authStore.accessToken) authStore.initFromStorage()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    uiStore.setRedirectAfterLogin(to.fullPath)
    return { name: 'login' }
  }

  if (to.meta.requiresAdmin) {
    const roleStore = useRoleStore()
    if (!roleStore.hasAnyRole) {
      return { name: 'home' }
    }
  }

  if (to.meta.requiresPermission) {
    const roleStore = useRoleStore()
    const permission = to.meta.requiresPermission
    if (!roleStore.permissions.includes(permission)) {
      return { name: 'home' }
    }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

router.afterEach((to) => {
  if (!to.meta.requiresAuth) return

  const authStore = useAuthStore()
  if (authStore.isAuthenticated && authStore.currentUser?.notificationEnabled) {
    const notifStore = useNotificationStore()
    notifStore.refreshUnreadCount()
  }
})

export default router
