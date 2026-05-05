<template>
  <div v-if="visibleAnnouncements.length > 0" class="w-full">
    <div
      v-for="announcement in visibleAnnouncements"
      :key="announcement.id"
      class="border-b"
      :class="bannerClass(announcement.severity)"
    >
      <!-- タイトル行 -->
      <div
        class="flex items-center px-4 py-2 cursor-pointer select-none"
        @click="announcementStore.toggleExpand(announcement.id)"
      >
        <!-- 重要度アイコン -->
        <component
          :is="severityIcon(announcement.severity)"
          class="w-4 h-4 mr-2 shrink-0"
          :class="severityIconClass(announcement.severity)"
        />

        <!-- タイトル -->
        <span class="flex-1 text-sm font-medium text-hwhub-heading truncate">
          {{ localizedTitle(announcement) }}
        </span>

        <!-- 開閉シェブロン | 閉じるボタン -->
        <div class="shrink-0 flex items-center gap-1 ml-2">
          <component
            :is="announcementStore.isExpanded(announcement.id) ? ChevronDown : ChevronRight"
            class="w-4 h-4 text-hwhub-muted"
          />
          <span class="text-hwhub-muted mx-1">|</span>
          <button
            type="button"
            class="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            :aria-label="t('announcement.close')"
            @click.stop="announcementStore.close(announcement.id)"
          >
            <X class="w-3 h-3 text-hwhub-muted" />
          </button>
        </div>
      </div>

      <!-- 本文（展開時のみ） -->
      <div
        v-if="announcementStore.isExpanded(announcement.id)"
        class="px-4 pb-3 text-sm text-hwhub-body"
      >
        {{ localizedBody(announcement) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Info, TriangleAlert, OctagonAlert, ChevronRight, ChevronDown, X } from 'lucide-vue-next'
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
      return 'bg-hwhub-danger-soft border-hwhub-danger'
    case ANNOUNCEMENT_SEVERITY.WARN:
      return 'bg-hwhub-accent-soft border-hwhub-border'
    default:
      return 'bg-hwhub-info-soft border-hwhub-border'
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
