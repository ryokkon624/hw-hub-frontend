<template>
  <div v-if="visibleAnnouncements.length > 0" class="w-full flex flex-col gap-px bg-hwhub-border">
    <div
      v-for="announcement in visibleAnnouncements"
      :key="announcement.id"
      class="relative overflow-hidden transition-all duration-200"
      :class="bannerClass(announcement.severity)"
    >
      <!-- 左側の重要度インジケーター -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1"
        :class="indicatorClass(announcement.severity)"
      />

      <!-- タイトル行（クリックで展開） -->
      <div
        class="flex items-center pl-5 pr-3 py-3 cursor-pointer select-none group hover:bg-black/2 dark:hover:bg-white/2 transition-colors"
        @click="announcementStore.toggleExpand(announcement.id)"
      >
        <!-- 重要度アイコン -->
        <component
          :is="severityIcon(announcement.severity)"
          class="w-4 h-4 mr-3 shrink-0"
          :class="severityIconClass(announcement.severity)"
        />

        <!-- タイトル -->
        <span class="flex-1 text-sm font-semibold text-hwhub-heading truncate">
          {{ localizedTitle(announcement) }}
        </span>

        <!-- アクションエリア -->
        <div class="shrink-0 flex items-center gap-3 ml-2">
          <!-- 展開インジケーター（回転アニメーション） -->
          <ChevronRight
            class="w-4 h-4 text-hwhub-muted transition-transform duration-300"
            :class="{ 'rotate-90': announcementStore.isExpanded(announcement.id) }"
          />

          <!-- 閉じるボタン（独立したアクション） -->
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            :aria-label="t('announcement.close')"
            @click.stop="announcementStore.close(announcement.id)"
          >
            <X class="w-4 h-4 text-hwhub-muted" />
          </button>
        </div>
      </div>

      <!-- 本文（展開アニメーション付き） -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[500px] opacity-100"
        leave-from-class="max-h-[500px] opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="announcementStore.isExpanded(announcement.id)" class="overflow-hidden">
          <div class="pl-12 pr-12 pb-4 text-sm text-hwhub-body leading-relaxed whitespace-pre-wrap">
            {{ localizedBody(announcement) }}
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Info, TriangleAlert, OctagonAlert, ChevronRight, X } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { Announcement } from '@/domain'
import { ANNOUNCEMENT_SEVERITY } from '@/constants/code.constants'
import type { AnnouncementSeverityCode } from '@/constants/code.constants'
import { useAnnouncementStore } from '@/stores/announcementStore'

const route = useRoute()
const { t, locale } = useI18n()
const announcementStore = useAnnouncementStore()

const visibleAnnouncements = computed(() =>
  announcementStore.visibleForRoute(route.name as string, route.meta.featureScope),
)

function localizedTitle(announcement: Announcement): string {
  if (locale.value === 'ja') return announcement.titleJa
  if (locale.value === 'es') return announcement.titleEs
  return announcement.titleEn
}

function localizedBody(announcement: Announcement): string {
  if (locale.value === 'ja') return announcement.bodyJa
  if (locale.value === 'es') return announcement.bodyEs
  return announcement.bodyEn
}

function bannerClass(severity: AnnouncementSeverityCode): string {
  switch (severity) {
    case ANNOUNCEMENT_SEVERITY.ERROR:
      return 'bg-hwhub-danger-soft'
    case ANNOUNCEMENT_SEVERITY.WARN:
      return 'bg-hwhub-accent-soft'
    default:
      return 'bg-hwhub-info-soft'
  }
}

function indicatorClass(severity: AnnouncementSeverityCode): string {
  switch (severity) {
    case ANNOUNCEMENT_SEVERITY.ERROR:
      return 'bg-hwhub-danger'
    case ANNOUNCEMENT_SEVERITY.WARN:
      return 'bg-hwhub-warning'
    default:
      return 'bg-hwhub-info'
  }
}

function severityIcon(severity: AnnouncementSeverityCode): Component {
  switch (severity) {
    case ANNOUNCEMENT_SEVERITY.ERROR:
      return OctagonAlert
    case ANNOUNCEMENT_SEVERITY.WARN:
      return TriangleAlert
    default:
      return Info
  }
}

function severityIconClass(severity: AnnouncementSeverityCode): string {
  switch (severity) {
    case ANNOUNCEMENT_SEVERITY.ERROR:
      return 'text-rose-500'
    case ANNOUNCEMENT_SEVERITY.WARN:
      return 'text-amber-500'
    default:
      return 'text-blue-500'
  }
}
</script>
