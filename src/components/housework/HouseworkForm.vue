<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import type { HouseworkFormModel } from '@/domain'
import type { HouseholdMember } from '@/domain'
import { houseworkFormTypedSchema, weeklyDaysMaskToCodes } from '@/domain'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkCodes } from '@/composables/useHouseworkCodes'
import { RECURRENCE_TYPE, CATEGORY } from '@/constants/code.constants'
import type { CategoryCode, RecurrenceTypeCode } from '@/constants/code.constants'
import { weeklyDaysMaskToLabel } from '@/utils/weeklyDaysLabel'
import { useHouseworkTemplateStore } from '@/stores/houseworkTemplateStore'
import type { HouseworkTemplateModel } from '@/domain'
import { useHouseworkTemplate } from '@/composables/useHouseworkTemplate'
import { LayoutTemplate, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: HouseworkFormModel
  isCreate?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: HouseworkFormModel): void
  (e: 'submit', value: HouseworkFormModel): void
  (e: 'cancel'): void
}>()

const { t, locale } = useI18n()
const householdStore = useHouseholdStore()
const {
  recurrenceTypeOptions,
  categoryOptions,
  weekdayOptions,
  nthWeekOptions,
  categoryLabel,
  recurrenceTypeLabel,
  weekdayLabel,
  nthWeekLabel,
} = useHouseworkCodes()
const { getLocalizedName, getLocalizedDescription, getLocalizedRecommendation } =
  useHouseworkTemplate()

onMounted(async () => {
  if (householdStore.currentHouseholdId) {
    await householdStore.fetchMembers(householdStore.currentHouseholdId)
  }
})

const templateStore = useHouseworkTemplateStore()
const showTemplateModal = ref(false)
const selectedRecommendation = ref<string | null>(null)
const templateFilterCategory = ref<string>('ALL')

const filteredTemplates = computed(() => {
  if (templateFilterCategory.value === 'ALL') return templateStore.templates
  return templateStore.templates.filter(
    (t: HouseworkTemplateModel) => t.category === templateFilterCategory.value,
  )
})

const closeTemplateModal = () => {
  showTemplateModal.value = false
  templateFilterCategory.value = 'ALL'
}

// useForm でフォーム状態＋バリデーションを管理
const { handleSubmit, values, setValues, setFieldValue } = useForm<HouseworkFormModel>({
  validationSchema: houseworkFormTypedSchema,
  initialValues: props.modelValue,
})

// 親 → 子 同期（編集画面での再読込などを想定）
watch(
  () => props.modelValue,
  (val) => {
    setValues(val, false)
  },
  { deep: true },
)

// 子 → 親 同期（v-model 用）
watch(
  values,
  (val) => {
    emits('update:modelValue', val as HouseworkFormModel)
  },
  { deep: true },
)

// テンプレートモーダルを開く
const openTemplateModal = async () => {
  await templateStore.loadAllIfNeeded()
  showTemplateModal.value = true
}

// テンプレート選択時の処理
const applyTemplate = (template: HouseworkTemplateModel) => {
  setFieldValue('name', getLocalizedName(template))
  setFieldValue('description', getLocalizedDescription(template) ?? '')

  setFieldValue('category', template.category as CategoryCode)
  setFieldValue('recurrenceType', template.recurrenceType as RecurrenceTypeCode)
  setFieldValue('weeklyDays', weeklyDaysMaskToCodes(template.weeklyDays ?? 0))
  setFieldValue('dayOfMonthOption', template.dayOfMonth)
  setFieldValue('nthWeek', template.nthWeek)
  setFieldValue('weekday', template.weekday)

  selectedRecommendation.value = getLocalizedRecommendation(template)

  closeTemplateModal()
}

// 周期タイプで表示制御
const isWeekly = computed(() => values.recurrenceType === RECURRENCE_TYPE.WEEKLY)
const isMonthly = computed(() => values.recurrenceType === RECURRENCE_TYPE.MONTHLY)
const isNthWeekday = computed(() => values.recurrenceType === RECURRENCE_TYPE.NTH_WEEKDAY)

// submit ハンドラ（バリデーション成功時のみ呼ばれる）
const onSubmitInternal = handleSubmit((formValues) => {
  emits('submit', formValues as HouseworkFormModel)
})

const onCancel = () => {
  emits('cancel')
}

const members = computed<HouseholdMember[]>(() => householdStore.currentMembers)

const categoryColorClass = (category: string | null | undefined): string => {
  switch (category) {
    case CATEGORY.CLEAN:
      return 'bg-blue-50 text-blue-600'
    case CATEGORY.KITCHEN:
      return 'bg-orange-50 text-orange-600'
    case CATEGORY.GARDEN:
      return 'bg-cyan-50 text-cyan-600'
    case CATEGORY.GARBAGE:
      return 'bg-emerald-50 text-emerald-600'
    case CATEGORY.PET:
      return 'bg-purple-50 text-purple-600'
    default:
      return 'bg-hwhub-surface-subtle text-hwhub-muted'
  }
}

const buildTemplateSummary = (tmpl: HouseworkTemplateModel): string => {
  const type = tmpl.recurrenceType

  if (type === RECURRENCE_TYPE.WEEKLY) {
    const days = tmpl.weeklyDays != null ? weeklyDaysMaskToLabel(tmpl.weeklyDays, locale.value) : ''
    if (!days) return t('housework.recurrence.weekly')
    return t('housework.recurrence.weeklyWithDays', { days })
  }

  if (type === RECURRENCE_TYPE.MONTHLY) {
    if (tmpl.dayOfMonth === 31) return t('housework.recurrence.monthlyLastDay')
    if (tmpl.dayOfMonth != null)
      return t('housework.recurrence.monthlyWithDay', { day: tmpl.dayOfMonth })
    return t('housework.recurrence.monthly')
  }

  if (type === RECURRENCE_TYPE.NTH_WEEKDAY) {
    const nth = nthWeekLabel(tmpl.nthWeek)
    const wd = weekdayLabel(tmpl.weekday)
    if (nth && wd) return t('housework.recurrence.nthWeekday', { nth, weekday: wd })
    return t('housework.recurrence.nthWeekdayPlain')
  }

  return recurrenceTypeLabel(type)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmitInternal">
    <!-- テンプレート選択ボタン（新規作成時のみ） -->
    <template v-if="props.isCreate">
      <!-- PC版 -->
      <div class="hidden sm:flex justify-end">
        <button
          type="button"
          class="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition"
          @click="openTemplateModal"
        >
          <LayoutTemplate class="w-3.5 h-3.5" />
          {{ t('housework.form.templateSelectButton') }}
        </button>
      </div>
      <!-- SP版 -->
      <div class="sm:hidden">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          @click="openTemplateModal"
        >
          <LayoutTemplate class="w-3.5 h-3.5" />
          {{ t('housework.form.templateSelectButton') }}
        </button>
      </div>
    </template>

    <!-- ① 基本情報カード -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div>
        <h2 class="text-sm font-semibold mb-1 text-hwhub-heading">
          {{ t('housework.form.sections.basic.title') }}
        </h2>
        <p class="text-xs text-hwhub-muted">
          {{ t('housework.form.sections.basic.description') }}
        </p>
      </div>

      <!-- 家事名 -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.name') }}
          <span class="text-red-500">*</span>
        </label>
        <Field name="name" v-slot="{ field }">
          <input
            v-bind="field"
            type="text"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
        </Field>
        <ErrorMessage name="name" v-slot="{ message }">
          <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>

      <!-- 説明 -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.description') }}
        </label>
        <Field name="description" v-slot="{ field }">
          <textarea
            v-bind="field"
            rows="3"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
        </Field>
      </div>

      <!-- カテゴリ -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.category') }}
        </label>
        <Field name="category" v-slot="{ field }">
          <select
            v-bind="field"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option :value="null" disabled>
              {{ t('common.selectPlaceholder') }}
            </option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </Field>
        <ErrorMessage name="category" v-slot="{ message }">
          <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>
    </section>

    <!-- recommendation バナー（テンプレート選択後に表示） -->
    <div
      v-if="selectedRecommendation"
      class="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-start justify-between gap-2"
    >
      <div class="flex items-start gap-2">
        <span class="text-amber-500 text-xs mt-0.5">💡</span>
        <p class="text-xs text-amber-700">{{ selectedRecommendation }}</p>
      </div>
      <button
        type="button"
        class="text-amber-400 hover:text-amber-600 shrink-0"
        @click="selectedRecommendation = null"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- ② 周期設定カード -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div>
        <h2 class="text-sm font-semibold mb-1 text-hwhub-heading">
          {{ t('housework.form.sections.recurrence.title') }}
        </h2>
        <p class="text-xs text-hwhub-muted">
          {{ t('housework.form.sections.recurrence.description') }}
        </p>
      </div>

      <!-- 周期タイプ -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.recurrenceType') }}
        </label>
        <Field name="recurrenceType" v-slot="{ field }">
          <select
            v-bind="field"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option v-for="opt in recurrenceTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </Field>
        <ErrorMessage name="recurrenceType" v-slot="{ message }">
          <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>

      <!-- Weekly: 曜日(複数) -->
      <div v-show="isWeekly">
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.weeklyDays') }}
        </label>
        <div class="flex flex-wrap gap-2">
          <Field
            v-for="opt in weekdayOptions"
            :key="opt.value"
            name="weeklyDays"
            type="checkbox"
            :value="opt.value"
            v-slot="{ field }"
          >
            <label
              class="inline-flex items-center gap-1 rounded-full border border-hwhub-border px-2 py-0.5 text-xs text-hwhub-heading bg-hwhub-surface-subtle"
            >
              <input type="checkbox" v-bind="field" class="rounded border-hwhub-border" />
              <span>{{ opt.label }}</span>
            </label>
          </Field>
        </div>
        <ErrorMessage name="weeklyDays" v-slot="{ message }">
          <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>

      <!-- Monthly: 日付 -->
      <div v-show="isMonthly">
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.dayOfMonth') }}
        </label>
        <Field name="dayOfMonthOption" v-slot="{ field }">
          <select
            v-bind="field"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option :value="null" disabled>
              {{ t('common.selectPlaceholder') }}
            </option>
            <option v-for="d in 30" :key="d" :value="String(d)">
              {{ d }}
            </option>
            <option value="31">
              {{ t('housework.form.fields.lastDayOfMonth') }}
            </option>
          </select>
        </Field>
        <ErrorMessage name="dayOfMonthOption" v-slot="{ message }">
          <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
        </ErrorMessage>
      </div>

      <!-- NthWeekday: 第n週 + 曜日 -->
      <div v-show="isNthWeekday" class="space-y-3">
        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('housework.form.fields.nthWeek') }}
          </label>
          <Field name="nthWeek" v-slot="{ field }">
            <select
              v-bind="field"
              class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            >
              <option :value="null" disabled>
                {{ t('common.selectPlaceholder') }}
              </option>
              <option v-for="opt in nthWeekOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </Field>
          <ErrorMessage name="nthWeek" v-slot="{ message }">
            <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
          </ErrorMessage>
        </div>

        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('housework.form.fields.weekday') }}
          </label>
          <Field name="weekday" v-slot="{ field }">
            <select
              v-bind="field"
              class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            >
              <option :value="null" disabled>
                {{ t('common.selectPlaceholder') }}
              </option>
              <option v-for="opt in weekdayOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </Field>
          <ErrorMessage name="weekday" v-slot="{ message }">
            <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
          </ErrorMessage>
        </div>
      </div>
    </section>

    <!-- ③ 担当者・有効期間カード -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div>
        <h2 class="text-sm font-semibold mb-1 text-hwhub-heading">
          {{ t('housework.form.sections.assigneeAndPeriod.title') }}
        </h2>
        <p class="text-xs text-hwhub-muted">
          {{ t('housework.form.sections.assigneeAndPeriod.description') }}
        </p>
      </div>

      <!-- デフォルト担当者 -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.defaultAssigneeUserId') }}
        </label>
        <Field name="defaultAssigneeUserId" v-slot="{ field }">
          <select
            v-bind="field"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option value="">
              {{ t('housework.form.fields.defaultAssigneePlaceholder') }}
            </option>
            <option v-for="member in members" :key="member.userId" :value="member.userId">
              {{ member.nickname }}
            </option>
          </select>
        </Field>
      </div>

      <!-- 有効期間 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('housework.form.fields.startDate') }}
          </label>
          <Field name="startDate" v-slot="{ field }">
            <input
              v-bind="field"
              type="date"
              class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            />
          </Field>
          <ErrorMessage name="startDate" v-slot="{ message }">
            <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
          </ErrorMessage>
        </div>
        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('housework.form.fields.endDate') }}
          </label>
          <Field name="endDate" v-slot="{ field }">
            <input
              v-bind="field"
              type="date"
              class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            />
          </Field>
          <ErrorMessage name="endDate" v-slot="{ message }">
            <p class="mt-1 text-xs text-red-600">{{ t(message as string) }}</p>
          </ErrorMessage>
        </div>
      </div>
    </section>

    <!-- ボタン -->
    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        class="px-4 py-2 rounded-md border border-hwhub-border text-xs md:text-sm text-hwhub-muted hover:bg-hwhub-surface-subtle"
        @click="onCancel"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="submit"
        class="px-4 py-2 rounded-md text-xs md:text-sm font-semibold text-white bg-hwhub-primary hover:bg-hwhub-primary"
      >
        {{ t('common.save') }}
      </button>
    </div>
  </form>

  <!-- テンプレート選択モーダル -->
  <Teleport to="body">
    <div
      v-if="showTemplateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="closeTemplateModal"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
      >
        <!-- ヘッダー -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-hwhub-border">
          <h3 class="text-sm font-semibold text-hwhub-heading">
            {{ t('housework.form.templateModal.title') }}
          </h3>
          <button type="button" @click="closeTemplateModal">
            <X class="w-4 h-4 text-hwhub-muted" />
          </button>
        </div>

        <!-- カテゴリフィルター -->
        <div class="px-4 py-2 border-b border-hwhub-border bg-hwhub-surface-subtle">
          <div class="flex flex-wrap gap-1.5">
            <button
              type="button"
              class="rounded-full px-2.5 py-0.5 text-[11px] font-medium transition"
              :class="
                templateFilterCategory === 'ALL'
                  ? 'bg-hwhub-primary text-white'
                  : 'bg-white border border-hwhub-border text-hwhub-muted hover:bg-hwhub-surface'
              "
              @click="templateFilterCategory = 'ALL'"
            >
              {{ t('housework.form.templateModal.filterAll') }}
            </button>
            <button
              v-for="opt in categoryOptions"
              :key="opt.value"
              type="button"
              class="rounded-full px-2.5 py-0.5 text-[11px] font-medium transition"
              :class="
                templateFilterCategory === opt.value
                  ? 'bg-hwhub-primary text-white'
                  : 'bg-white border border-hwhub-border text-hwhub-muted hover:bg-hwhub-surface'
              "
              @click="templateFilterCategory = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- ローディング -->
        <div v-if="templateStore.isLoading" class="p-6 text-center text-xs text-hwhub-muted">
          {{ t('common.loading') }}
        </div>

        <!-- テンプレート一覧 -->
        <ul v-else class="overflow-y-auto divide-y divide-hwhub-border">
          <li
            v-if="filteredTemplates.length === 0"
            class="px-4 py-6 text-center text-xs text-hwhub-muted"
          >
            {{ t('housework.form.templateModal.empty') }}
          </li>
          <li
            v-for="tmpl in filteredTemplates"
            :key="tmpl.houseworkTemplateId"
            class="px-4 py-3 hover:bg-hwhub-surface-subtle cursor-pointer transition"
            @click="applyTemplate(tmpl)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-hwhub-heading truncate">
                  {{ getLocalizedName(tmpl) }}
                </p>
                <!-- recurrence サマリー -->
                <p class="mt-0.5 text-xs text-hwhub-muted">
                  {{ buildTemplateSummary(tmpl) }}
                </p>
                <!-- recommendation プレビュー -->
                <p
                  v-if="getLocalizedRecommendation(tmpl)"
                  class="mt-1 text-xs text-amber-600 flex items-center gap-1"
                >
                  <span>💡</span>
                  <span class="line-clamp-1">{{ getLocalizedRecommendation(tmpl) }}</span>
                </p>
              </div>
              <!-- カテゴリバッジ -->
              <span
                class="shrink-0 text-[10px] rounded-full px-2 py-0.5"
                :class="categoryColorClass(tmpl.category)"
              >
                {{ categoryLabel(tmpl.category) }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>
