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
  ChevronRight,
} from 'lucide-vue-next'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()

const features = computed(() => [
  {
    icon: Users,
    title: t('landing.features.items.share.title'),
    desc: t('landing.features.items.share.desc'),
    image: '/images/feature_share.png',
  },
  {
    icon: ClipboardList,
    title: t('landing.features.items.template.title'),
    desc: t('landing.features.items.template.desc'),
    image: '/images/feature_template.png',
  },
  {
    icon: ShoppingCart,
    title: t('landing.features.items.shopping.title'),
    desc: t('landing.features.items.shopping.desc'),
    image: '/images/feature_shopping.png',
  },
  {
    icon: Sparkles,
    title: t('landing.features.items.ai.title'),
    desc: t('landing.features.items.ai.desc'),
    image: '/images/feature_ai.png',
  },
  {
    icon: Monitor,
    title: t('landing.features.items.browser.title'),
    desc: t('landing.features.items.browser.desc'),
    image: '/images/feature_browser.png',
  },
])

const targets = computed(() => [
  {
    icon: Heart,
    title: t('landing.targets.items.couple.title'),
    desc: t('landing.targets.items.couple.desc'),
    image: '/images/target_couple.png',
  },
  {
    icon: Home,
    title: t('landing.targets.items.sharehouse.title'),
    desc: t('landing.targets.items.sharehouse.desc'),
    image: '/images/target_sharehouse.png',
  },
  {
    icon: Building2,
    title: t('landing.targets.items.operator.title'),
    desc: t('landing.targets.items.operator.desc'),
    image: '/images/target_operator.png',
  },
])
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans selection:bg-hwhub-primary selection:text-white">
    <!-- Header -->
    <header
      class="fixed top-0 inset-x-0 z-50 bg-[#1a2e1a]/85 backdrop-blur-lg border-b border-white/10 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <span
          class="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-200 tracking-tight"
          >HwHub</span
        >

        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-green-100">
          <a
            href="#features"
            class="hover:text-white transition-colors relative after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-white after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            {{ t('landing.nav.features') }}
          </a>
          <a
            href="#targets"
            class="hover:text-white transition-colors relative after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-white after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
          >
            {{ t('landing.nav.targets') }}
          </a>
        </nav>

        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <RouterLink
            to="/login"
            class="text-sm font-medium text-green-100 hover:text-white transition-colors hidden sm:block px-2"
          >
            {{ t('landing.header.login') }}
          </RouterLink>
          <RouterLink
            to="/signup"
            class="text-sm font-bold bg-white text-[#1a2e1a] rounded-full px-5 py-2 transition-all hover:bg-green-50 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            {{ t('landing.header.signup') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section
      class="relative py-32 md:py-48 px-4 text-center min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 animate-[zoomIn_20s_ease-out_infinite_alternate]"
        style="background-image: url('/images/hero_bg.png')"
      ></div>

      <!-- Gradient Overlays -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-[#1a2e1a]/95 via-[#1a2e1a]/80 to-[#1a2e1a]/90 backdrop-blur-[2px]"
      ></div>

      <div class="relative max-w-4xl mx-auto space-y-8 z-10">
        <div
          class="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-sm font-medium text-emerald-300 shadow-xl shadow-emerald-900/20 animate-fade-in-up"
        >
          <Sparkles class="w-4 h-4" />
          {{ t('landing.hero.badge') }}
        </div>

        <h1
          class="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] animate-fade-in-up"
          style="animation-delay: 100ms"
        >
          {{ t('landing.hero.title') }}
        </h1>

        <p
          class="text-lg md:text-xl text-green-100 leading-relaxed max-w-2xl mx-auto font-medium animate-fade-in-up opacity-90"
          style="animation-delay: 200ms"
        >
          {{ t('landing.hero.description') }}
        </p>

        <div
          class="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up"
          style="animation-delay: 300ms"
        >
          <RouterLink
            to="/signup"
            class="group inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold rounded-full px-8 py-4 text-lg transition-all hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0"
          >
            {{ t('landing.hero.ctaStart') }}
            <ChevronRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </RouterLink>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full px-8 py-4 text-lg transition-all hover:bg-white/20 hover:shadow-lg active:scale-95"
          >
            {{ t('landing.hero.ctaLogin') }}
          </RouterLink>
        </div>
      </div>

      <!-- Decorative bottom curve -->
      <div
        class="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-hwhub-surface to-transparent"
      ></div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 px-4 bg-hwhub-surface relative">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
            {{ t('landing.features.title') }}
          </h2>
          <p class="text-lg text-slate-500 max-w-2xl mx-auto">
            {{ t('landing.features.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(feature, idx) in features"
            :key="feature.title"
            class="group flex flex-col bg-white rounded-[2rem] border border-slate-100/80 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
          >
            <div class="p-8 flex-grow">
              <div
                class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-500"
              >
                <component
                  :is="feature.icon"
                  class="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-500"
                />
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3">{{ feature.title }}</h3>
              <p class="text-slate-500 leading-relaxed">{{ feature.desc }}</p>
            </div>

            <div class="px-8 pt-6 pb-0 mt-auto bg-gradient-to-t from-slate-50 to-white/0">
              <div
                class="rounded-t-2xl border border-slate-200 shadow-xl overflow-hidden transform origin-bottom group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              >
                <img
                  :src="feature.image"
                  :alt="feature.title"
                  class="w-full h-48 md:h-56 object-cover object-top border-b border-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Targets Section -->
    <section id="targets" class="py-24 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
            {{ t('landing.targets.title') }}
          </h2>
          <p class="text-lg text-slate-500 max-w-2xl mx-auto">
            {{ t('landing.targets.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="target in targets"
            :key="target.title"
            class="group rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div class="h-64 overflow-hidden relative">
              <img
                :src="target.image"
                :alt="target.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"
              ></div>

              <div class="absolute bottom-6 left-6 right-6 flex items-end gap-4">
                <div
                  class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0"
                >
                  <component :is="target.icon" class="w-6 h-6 text-white" />
                </div>
                <h3 class="font-bold text-2xl text-white tracking-wide pb-1">{{ target.title }}</h3>
              </div>
            </div>

            <div class="p-8 bg-white text-center">
              <p class="text-slate-600 leading-relaxed">{{ target.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-28 px-4 text-center overflow-hidden">
      <!-- Background Image Reused -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('/images/hero_bg.png')"
      ></div>
      <div class="absolute inset-0 bg-[#1a2e1a]/95 backdrop-blur-sm"></div>

      <div class="relative max-w-3xl mx-auto space-y-8 z-10">
        <Sparkles class="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          {{ t('landing.cta.title') }}
        </h2>
        <p class="text-xl text-green-100 max-w-xl mx-auto">{{ t('landing.cta.subtitle') }}</p>

        <div class="pt-6">
          <RouterLink
            to="/signup"
            class="group inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold rounded-full px-10 py-5 text-xl transition-all hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0"
          >
            {{ t('landing.cta.button') }}
            <ChevronRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-[#122212] border-t border-white/5 py-12 px-4 relative z-10">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <span class="font-extrabold text-2xl text-emerald-400 tracking-tight">HwHub</span>
        </div>

        <div class="flex items-center gap-8">
          <RouterLink
            to="/settings/app/terms"
            class="text-sm font-medium text-green-200/80 hover:text-white transition-colors"
          >
            {{ t('landing.footer.terms') }}
          </RouterLink>
          <RouterLink
            to="/settings/app/privacy"
            class="text-sm font-medium text-green-200/80 hover:text-white transition-colors"
          >
            {{ t('landing.footer.privacy') }}
          </RouterLink>
        </div>

        <span class="text-sm font-medium text-green-500/50">
          {{ t('landing.footer.copyright') }}
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes zoomIn {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}
</style>
