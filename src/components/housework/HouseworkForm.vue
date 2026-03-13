<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import type { HouseworkFormModel } from '@/domain'
import type { HouseholdMember } from '@/domain'
import { houseworkFormTypedSchema } from '@/domain'
import { useHouseholdStore } from '@/stores/householdStore'
import { useHouseworkCodes } from '@/composables/useHouseworkCodes'
import { RECURRENCE_TYPE } from '@/constants/code.constants'

const props = defineProps<{
  modelValue: HouseworkFormModel
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: HouseworkFormModel): void
  (e: 'submit', value: HouseworkFormModel): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()
const householdStore = useHouseholdStore()
const { recurrenceTypeOptions, categoryOptions, weekdayOptions, nthWeekOptions } =
  useHouseworkCodes()

onMounted(async () => {
  if (householdStore.currentHouseholdId) {
    await householdStore.fetchMembers(householdStore.currentHouseholdId)
  }
})

// useForm でフォーム状態＋バリデーションを管理
const { handleSubmit, values, setValues } = useForm<HouseworkFormModel>({
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
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmitInternal">
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
</template>
