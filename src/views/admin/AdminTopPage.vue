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
        icon-bg-class="bg-blue-100"
        icon-color-class="text-blue-600"
        :title="t('admin.sections.users.title')"
        :subtitle="t('admin.sections.users.subtitle')"
      />

      <AdminCard
        :can-access="canManageRole"
        :to="{ name: 'admin.roles' }"
        :icon="ShieldCheck"
        icon-bg-class="bg-rose-100"
        icon-color-class="text-rose-600"
        :title="t('admin.sections.roles.title')"
        :subtitle="t('admin.sections.roles.subtitle')"
      />

      <AdminCard
        :can-access="canReplyInquiry"
        :to="{ name: 'admin.inquiries' }"
        :icon="MessageCircleQuestion"
        icon-bg-class="bg-violet-100"
        icon-color-class="text-violet-600"
        :title="t('admin.sections.inquiries.title')"
        :subtitle="t('admin.sections.inquiries.subtitle')"
      />

      <AdminCard
        :can-access="canManageSysTemplate"
        :to="{ name: 'admin.houseworkTemplates' }"
        :icon="LayoutTemplate"
        icon-bg-class="bg-amber-100"
        icon-color-class="text-amber-600"
        :title="t('admin.sections.houseworkTemplate.title')"
        :subtitle="t('admin.sections.houseworkTemplate.subtitle')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { LayoutTemplate, ShieldCheck, MessageCircleQuestion, Users } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRole } from '@/composables/useRole'
import AdminCard from '@/components/admin/AdminCard.vue'
import InquiryStatusSummaryCard from '@/components/admin/InquiryStatusSummaryCard.vue'
import DailyInquiryStatusCard from '@/components/admin/DailyInquiryStatusCard.vue'
import DailyInquiryMessageCard from '@/components/admin/DailyInquiryMessageCard.vue'

const { t } = useI18n()
const { canManageUser, canManageRole, canReplyInquiry, canManageSysTemplate } = useRole()
</script>
