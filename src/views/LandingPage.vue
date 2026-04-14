<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Users,
  ClipboardList,
  ShoppingCart,
  Sparkles,
  Monitor,
  Heart,
  Home,
  Building2,
} from 'lucide-vue-next'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()

const features = computed(() => [
  {
    icon: Users,
    title: t('landing.features.items.share.title'),
    desc: t('landing.features.items.share.desc'),
  },
  {
    icon: ClipboardList,
    title: t('landing.features.items.template.title'),
    desc: t('landing.features.items.template.desc'),
  },
  {
    icon: ShoppingCart,
    title: t('landing.features.items.shopping.title'),
    desc: t('landing.features.items.shopping.desc'),
  },
  {
    icon: Sparkles,
    title: t('landing.features.items.ai.title'),
    desc: t('landing.features.items.ai.desc'),
  },
  {
    icon: Monitor,
    title: t('landing.features.items.browser.title'),
    desc: t('landing.features.items.browser.desc'),
  },
])

const targets = computed(() => [
  {
    icon: Heart,
    title: t('landing.targets.items.couple.title'),
    desc: t('landing.targets.items.couple.desc'),
  },
  {
    icon: Home,
    title: t('landing.targets.items.sharehouse.title'),
    desc: t('landing.targets.items.sharehouse.desc'),
  },
  {
    icon: Building2,
    title: t('landing.targets.items.operator.title'),
    desc: t('landing.targets.items.operator.desc'),
  },
])
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header (AC1) -->
    <header class="sticky top-0 z-50 bg-[#1a2e1a] border-b border-white/10">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span class="font-bold text-xl text-green-300 tracking-tight">HwHub</span>

        <nav class="hidden md:flex items-center gap-6 text-sm text-green-200">
          <a href="#features" class="hover:text-white transition">{{
            t('landing.nav.features')
          }}</a>
          <a href="#targets" class="hover:text-white transition">{{ t('landing.nav.targets') }}</a>
        </nav>

        <!-- LanguageSwitcher + ログイン・サインアップ (AC1, AC8) -->
        <div class="flex items-center gap-2">
          <!-- PBI-003: LanguageSwitcher（ログインボタンの左） -->
          <LanguageSwitcher />
          <RouterLink
            to="/login"
            class="text-sm text-green-200 hover:text-white transition px-3 py-1.5 rounded-full"
          >
            {{ t('landing.header.login') }}
          </RouterLink>
          <RouterLink
            to="/signup"
            class="text-sm font-semibold bg-hwhub-primary text-white rounded-full px-4 py-1.5 transition hover:opacity-90"
          >
            {{ t('landing.header.signup') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Hero Section (AC2) -->
    <section class="bg-[#1a2e1a] py-24 px-4 text-center">
      <div class="max-w-3xl mx-auto space-y-6">
        <div
          class="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm text-green-300"
        >
          {{ t('landing.hero.badge') }}
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          {{ t('landing.hero.title') }}
        </h1>
        <p class="text-lg text-green-200 leading-relaxed">
          {{ t('landing.hero.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <!-- サインアップ CTA (AC2, AC8) -->
          <RouterLink
            to="/signup"
            class="inline-flex items-center justify-center gap-2 bg-hwhub-primary text-white font-semibold rounded-full px-8 py-3 text-base transition hover:opacity-90 shadow-lg"
          >
            {{ t('landing.hero.ctaStart') }}
          </RouterLink>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center gap-2 border border-white/30 text-green-200 hover:bg-white/10 font-medium rounded-full px-6 py-3 text-base transition"
          >
            {{ t('landing.hero.ctaLogin') }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features Section (AC3) -->
    <section id="features" class="py-20 px-4 bg-hwhub-surface">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-hwhub-heading">{{ t('landing.features.title') }}</h2>
          <p class="text-hwhub-muted mt-2">{{ t('landing.features.subtitle') }}</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition"
          >
            <div
              class="w-10 h-10 rounded-xl bg-hwhub-surface-subtle flex items-center justify-center mb-4"
            >
              <component :is="feature.icon" class="w-5 h-5 text-hwhub-primary" />
            </div>
            <h3 class="font-semibold text-hwhub-heading mb-1">{{ feature.title }}</h3>
            <p class="text-sm text-hwhub-muted leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Targets Section (AC4) -->
    <section id="targets" class="py-20 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-hwhub-heading">{{ t('landing.targets.title') }}</h2>
          <p class="text-hwhub-muted mt-2">{{ t('landing.targets.subtitle') }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="target in targets"
            :key="target.title"
            class="text-center space-y-3 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-hwhub-surface-subtle transition"
          >
            <div
              class="w-14 h-14 rounded-full bg-hwhub-surface-subtle mx-auto flex items-center justify-center"
            >
              <component :is="target.icon" class="w-7 h-7 text-hwhub-primary" />
            </div>
            <h3 class="font-semibold text-hwhub-heading">{{ target.title }}</h3>
            <p class="text-sm text-hwhub-muted leading-relaxed">{{ target.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-[#1a2e1a] text-center">
      <div class="max-w-2xl mx-auto space-y-4">
        <h2 class="text-3xl font-bold text-white">{{ t('landing.cta.title') }}</h2>
        <p class="text-green-200">{{ t('landing.cta.subtitle') }}</p>
        <div class="pt-2">
          <RouterLink
            to="/signup"
            class="inline-flex items-center justify-center gap-2 bg-hwhub-primary text-white font-semibold rounded-full px-8 py-3 text-base transition hover:opacity-90 shadow-lg"
          >
            {{ t('landing.cta.button') }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Footer (AC5) -->
    <footer class="bg-[#1a2e1a] border-t border-white/10 py-6 px-4">
      <div
        class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
      >
        <span class="font-bold text-green-300">HwHub</span>
        <div class="flex items-center gap-6">
          <RouterLink to="/settings/app/terms" class="text-green-300 hover:text-white transition">
            {{ t('landing.footer.terms') }}
          </RouterLink>
          <RouterLink to="/settings/app/privacy" class="text-green-300 hover:text-white transition">
            {{ t('landing.footer.privacy') }}
          </RouterLink>
        </div>
        <span class="text-xs text-green-500">{{ t('landing.footer.copyright') }}</span>
      </div>
    </footer>
  </div>
</template>
