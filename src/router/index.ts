import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'

// 認証
import LoginPage from '@/views/LoginPage.vue'
import SignupPage from '@/views/SignupPage.vue'
import InvitationPage from '@/views/InvitationPage.vue'
import SignupVerifyWaitPage from '@/views/SignupVerifyWaitPage.vue'
import EmailVerifyPage from '@/views/EmailVerifyPage.vue'
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

import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
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
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'home' } },

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
        meta: { titleKey: 'pageTitles.terms' },
      },
      {
        path: 'settings/app/privacy',
        name: 'settings.app.privacy',
        component: PrivacyPolicyPage,
        meta: { titleKey: 'pageTitles.privacy' },
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

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
