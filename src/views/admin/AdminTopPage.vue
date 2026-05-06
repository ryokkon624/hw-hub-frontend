<template>
  <div class="space-y-4">
    <h2 class="sr-only">{{ t('admin.pageTitle') }}</h2>
    <p class="text-sm text-hwhub-muted">{{ t('admin.description') }}</p>

    <InquiryStatusSummaryCard />
    <DailyInquiryStatusCard />
    <DailyInquiryMessageCard />

    <div class="mt-4 space-y-3">
      <AdminCard
        :can-access="canManageUser"
        :to="'/admin/users'"
        :icon="Users"
        icon-bg-class="bg-hwhub-palette-blue-soft"
        icon-color-class="text-hwhub-palette-blue"
        :title="t('admin.sections.users.title')"
        :subtitle="t('admin.sections.users.subtitle')"
      />

      <AdminCard
        :can-access="canManageRole"
        :to="{ name: 'admin.roles' }"
        :icon="ShieldCheck"
        icon-bg-class="bg-hwhub-palette-rose-soft"
        icon-color-class="text-hwhub-palette-rose"
        :title="t('admin.sections.roles.title')"
        :subtitle="t('admin.sections.roles.subtitle')"
      />

      <AdminCard
        :can-access="canReplyInquiry"
        :to="{ name: 'admin.inquiries' }"
        :icon="MessageCircleQuestion"
        icon-bg-class="bg-hwhub-palette-violet-soft"
        icon-color-class="text-hwhub-palette-violet"
        :title="t('admin.sections.inquiries.title')"
        :subtitle="t('admin.sections.inquiries.subtitle')"
      />

      <AdminCard
        :can-access="canManageSysTemplate"
        :to="{ name: 'admin.houseworkTemplates' }"
        :icon="LayoutTemplate"
        icon-bg-class="bg-hwhub-palette-amber-soft"
        icon-color-class="text-hwhub-palette-amber"
        :title="t('admin.sections.houseworkTemplate.title')"
        :subtitle="t('admin.sections.houseworkTemplate.subtitle')"
      />

      <AdminCard
        :can-access="canManageAnnouncement"
        :to="{ name: 'admin.announcements' }"
        :icon="Megaphone"
        icon-bg-class="bg-cyan-50"
        icon-color-class="text-cyan-500"
        :title="t('admin.sections.announcement.title')"
        :subtitle="t('admin.sections.announcement.subtitle')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutTemplate,
  ShieldCheck,
  MessageCircleQuestion,
  Users,
  Megaphone,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRole } from '@/composables/useRole'
import AdminCard from '@/components/admin/AdminCard.vue'
import InquiryStatusSummaryCard from '@/components/admin/InquiryStatusSummaryCard.vue'
import DailyInquiryStatusCard from '@/components/admin/DailyInquiryStatusCard.vue'
import DailyInquiryMessageCard from '@/components/admin/DailyInquiryMessageCard.vue'

const { t } = useI18n()
const {
  canManageUser,
  canManageRole,
  canReplyInquiry,
  canManageSysTemplate,
  canManageAnnouncement,
} = useRole()
</script>
