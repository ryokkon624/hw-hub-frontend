<template>
  <div class="min-h-screen flex bg-hwhub-surface">
    <!-- サイドバー（PC） -->
    <aside class="hidden md:flex w-60 flex-col bg-hwhub-sidebar">
      <div class="h-16 flex items-center px-4 border-b border-hwhub-sidebar">
        <span class="font-bold text-lg text-hwhub-sidebar-logo">Housework Hub</span>
      </div>

      <!-- 世帯ブロック -->
      <div class="px-4 py-3 border-b border-hwhub-sidebar">
        <div class="text-xs font-semibold text-green-300 mb-1">
          {{ t('layout.sidebar.householdTitle') }}
        </div>

        <div
          v-if="currentHousehold"
          class="mb-2 rounded-md border border-hwhub-sidebar bg-hwhub-sidebar-active px-3 py-2"
        >
          <div class="text-sm font-medium text-white truncate">
            {{ currentHousehold.name }}
          </div>
          <div class="text-xs text-green-300">{{ currentHousehold.name }}</div>
        </div>
        <div v-else class="text-xs text-green-300">
          {{ t('layout.sidebar.noHouseholdSelected') }}
        </div>

        <!-- 切り替え候補（複数世帯がある場合） -->
        <div v-if="otherHouseholds.length > 0" class="mt-2 space-y-1">
          <div class="text-xs text-green-300">{{ t('layout.sidebar.otherHouseholdsLabel') }}</div>
          <button
            v-for="h in otherHouseholds"
            :key="h.householdId"
            type="button"
            class="w-full text-left text-xs rounded-md px-2 py-1 hover:bg-hwhub-sidebar-hover text-hwhub-sidebar-nav"
            :disabled="isEditingHousework"
            @click="changeHousehold(h.householdId)"
          >
            {{ h.name }}
          </button>
          <p v-if="isEditingHousework" class="mt-1 text-[11px] text-green-300">
            {{ t('layout.sidebar.editingWarning') }}
          </p>
        </div>
      </div>

      <!-- メインナビ -->
      <nav class="flex-1 px-2 py-3 space-y-1">
        <button
          v-for="item in mainNavItems"
          :key="item.name"
          type="button"
          class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-hwhub-sidebar-hover"
          :class="
            isActive(item.name)
              ? 'bg-hwhub-sidebar-active text-hwhub-sidebar-active hover:bg-hwhub-sidebar-hover'
              : 'text-hwhub-sidebar-nav'
          "
          @click="navigate(item.name)"
        >
          <component
            :is="item.icon"
            class="w-5 h-5"
            :class="isActive(item.name) ? 'text-green-400' : 'text-green-600'"
          />
          <span class="flex-1 text-left">{{ t(item.labelKey) }}</span>
        </button>

        <!-- 管理画面（ロールあり時のみ表示） -->
        <button
          v-if="canAccessAdmin"
          type="button"
          class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-hwhub-sidebar-hover"
          :class="
            isActive('admin')
              ? 'bg-hwhub-sidebar-active text-hwhub-sidebar-active hover:bg-hwhub-sidebar-hover'
              : 'text-hwhub-sidebar-nav'
          "
          @click="navigate('admin')"
        >
          <ShieldCheck
            class="w-5 h-5"
            :class="isActive('admin') ? 'text-green-400' : 'text-green-600'"
          />
          <span class="flex-1 text-left">{{ t('nav.admin') }}</span>
        </button>
      </nav>
    </aside>

    <!-- メイン領域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- ヘッダー -->
      <header class="h-16 flex items-center justify-between px-4 border-b bg-white">
        <!-- 左側：ページタイトル + 世帯 -->
        <div class="flex-1 min-w-0 flex flex-col justify-center pr-2 overflow-hidden">
          <!-- SP版：clamp によるフォントサイズ調整 + ellipsis -->
          <h1
            class="md:hidden font-semibold text-hwhub-heading whitespace-nowrap overflow-hidden text-ellipsis leading-tight w-full"
            style="font-size: clamp(0.875rem, 4vw, 1rem)"
          >
            {{ pageTitle }}
          </h1>
          <!-- PC版：従来スタイル -->
          <h1 class="hidden md:block font-semibold text-lg text-hwhub-heading truncate">
            {{ pageTitle }}
          </h1>
          <!-- SP時のみ現在の世帯をサブタイトル的に表示 -->
          <div v-if="currentHousehold" class="md:hidden text-[10px] text-hwhub-muted truncate">
            {{ t('layout.sidebar.mobileHouseholdPrefix') }}{{ currentHousehold.name }}
          </div>
        </div>

        <!-- 右側：言語切替 + ユーザメニュー -->
        <div class="shrink-0">
          <AppHeader />
        </div>
      </header>

      <!-- コンテンツ：SP ではタブバーぶん余白を確保 -->
      <main class="flex-1 p-4 pb-20 md:pb-4 overflow-x-hidden">
        <RouterView />
      </main>

      <!-- SP用タブバー -->
      <div class="fixed bottom-0 inset-x-0 z-40 md:hidden">
        <!-- タブバー -->
        <nav class="flex items-stretch justify-around bg-hwhub-sidebar text-xs">
          <button
            v-for="item in mainNavItems"
            :key="item.name"
            type="button"
            class="flex-1 flex flex-col items-center justify-center py-1.5"
            :class="isActive(item.name) ? 'text-green-400 font-semibold' : 'text-hwhub-sidebar-nav'"
            @click="navigate(item.name)"
          >
            <span
              class="block w-5 h-0.5 rounded-full mb-1 transition-all"
              :class="isActive(item.name) ? 'bg-green-400' : 'bg-transparent'"
            />
            <component :is="item.icon" class="w-5 h-5 mb-0.5" />
            <span class="leading-none">{{ t(item.labelKey) }}</span>
          </button>

          <!-- 管理ボタン（ロールあり時のみ） -->
          <button
            v-if="canAccessAdmin"
            type="button"
            class="flex-1 flex flex-col items-center justify-center py-1.5"
            :class="isActive('admin') ? 'text-green-400 font-semibold' : 'text-hwhub-sidebar-nav'"
            @click="navigate('admin')"
          >
            <span
              class="block w-5 h-0.5 rounded-full mb-1 transition-all"
              :class="isActive('admin') ? 'bg-green-400' : 'bg-transparent'"
            />
            <ShieldCheck class="w-5 h-5 mb-0.5" />
            <span class="leading-none">{{ t('nav.admin') }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- ここから共通 UI -->
    <LoadingOverlay />
    <AppToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, RouterView } from 'vue-router'
import { computed } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  House,
  ClipboardList,
  CheckSquare,
  ShoppingCart,
  Settings,
  ShieldCheck,
} from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import AppToastContainer from '@/components/AppToastContainer.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { useHouseholdStore } from '@/stores/householdStore'
import { useRole } from '@/composables/useRole'

const route = useRoute()
const router = useRouter()
const householdStore = useHouseholdStore()
const { t } = useI18n()
const { canAccessAdmin } = useRole()

type MainNavItem = {
  name: string
  labelKey: string
  icon: Component
}

const mainNavItems: MainNavItem[] = [
  { name: 'home', labelKey: 'pageTitles.home', icon: House },
  { name: 'housework.assign', labelKey: 'pageTitles.houseworkAssign', icon: ClipboardList },
  { name: 'housework.tasks', labelKey: 'pageTitles.myTasks', icon: CheckSquare },
  { name: 'shopping', labelKey: 'pageTitles.shopping', icon: ShoppingCart },
  { name: 'settings', labelKey: 'pageTitles.settings', icon: Settings },
]

const pageTitle = computed(() => {
  const key = route.meta.titleKey as string | undefined
  return key ? t(key) : 'Housework Hub'
})

const isActive = (name: string) => route.name === name

const navigate = (name: string) => {
  if (route.name === name) return
  router.push({ name })
}

// ── 世帯まわり ──────────────────────────────
const currentHousehold = computed(
  () =>
    householdStore.households.find((h) => h.householdId === householdStore.currentHouseholdId) ??
    null,
)

const otherHouseholds = computed(() =>
  householdStore.households.filter((h) => h.householdId !== householdStore.currentHouseholdId),
)

// 編集画面中かどうか
const isEditingHousework = computed(() =>
  [
    'settings.housework.new',
    'settings.housework.edit',
    'shopping.new',
    'shopping.item.detail',
  ].includes(route.name as string),
)

const changeHousehold = async (householdId: number) => {
  if (householdId === householdStore.currentHouseholdId) return

  // 編集画面中なら確認してから
  if (isEditingHousework.value) {
    const ok = window.confirm(t('layout.sidebar.confirmChangeHousehold'))
    if (!ok) return
    // 一旦家事一覧に戻す想定
    await router.push({ name: 'houseworks' })
  }

  householdStore.setCurrentHousehold(householdId)
}
</script>
