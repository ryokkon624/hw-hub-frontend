<script setup lang="ts">
import { RouterLink } from 'vue-router'
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

const features = [
  {
    icon: Users,
    title: '家族・シェアメンバーで家事を分担',
    desc: '複数メンバーで家事タスクを共有・管理。誰が何を担当するか一目でわかります。',
  },
  {
    icon: ClipboardList,
    title: 'テンプレート・定期実行・担当割当',
    desc: 'よく使う家事はテンプレート化。定期スケジュールと担当者を設定して自動化できます。',
  },
  {
    icon: ShoppingCart,
    title: '買い物リストの共有',
    desc: '家族やルームメイトと買い物リストをリアルタイムで共有。買い忘れゼロへ。',
  },
  {
    icon: Sparkles,
    title: 'AIによるサポート',
    desc: 'お困りのことはAIが一次対応。すばやく問い合わせのサポートを受けられます。',
  },
  {
    icon: Monitor,
    title: 'PCでもスマホでもブラウザで利用',
    desc: 'インストール不要、ブラウザからいつでもどこでもアクセス可能。アプリ化も予定しています。',
  },
]

const targets = [
  {
    icon: Heart,
    title: '共働き夫婦',
    desc: '家事の分担が見える化されるから、「やった・やってない」の言い合いがなくなります。',
  },
  {
    icon: Home,
    title: 'シェアハウス住民',
    desc: 'メンバー全員でタスクを共有。掃除当番やゴミ出しの管理がスムーズになります。',
  },
  {
    icon: Building2,
    title: 'シェアハウス運営者',
    desc: '複数世帯・複数ハウスをまとめて管理。現場の状況を一元把握できます。',
  },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header (AC1) -->
    <header class="sticky top-0 z-50 bg-[#1a2e1a] border-b border-white/10">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span class="font-bold text-xl text-green-300 tracking-tight">HwHub</span>

        <nav class="hidden md:flex items-center gap-6 text-sm text-green-200">
          <a href="#features" class="hover:text-white transition">機能</a>
          <a href="#targets" class="hover:text-white transition">こんな方に</a>
        </nav>

        <!-- ログイン・サインアップ (AC1, AC8) -->
        <div class="flex items-center gap-2">
          <RouterLink
            to="/login"
            class="text-sm text-green-200 hover:text-white transition px-3 py-1.5 rounded-full"
          >
            ログイン
          </RouterLink>
          <RouterLink
            to="/signup"
            class="text-sm font-semibold bg-hwhub-primary text-white rounded-full px-4 py-1.5 transition hover:opacity-90"
          >
            サインアップ
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
          家事シェアアプリ
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          家事を、チームで。
        </h1>
        <p class="text-lg text-green-200 leading-relaxed">
          役割分担からタスク管理まで、<br class="hidden sm:inline" />
          家族やルームメイトと一緒にスマートに暮らす。
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <!-- サインアップ CTA (AC2, AC8) -->
          <RouterLink
            to="/signup"
            class="inline-flex items-center justify-center gap-2 bg-hwhub-primary text-white font-semibold rounded-full px-8 py-3 text-base transition hover:opacity-90 shadow-lg"
          >
            無料で始める →
          </RouterLink>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center gap-2 border border-white/30 text-green-200 hover:bg-white/10 font-medium rounded-full px-6 py-3 text-base transition"
          >
            ログインはこちら
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features Section (AC3) -->
    <section id="features" class="py-20 px-4 bg-hwhub-surface">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-hwhub-heading">HwHub でできること</h2>
          <p class="text-hwhub-muted mt-2">チームの家事を、もっとスマートに。</p>
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
          <h2 class="text-3xl font-bold text-hwhub-heading">こんな方におすすめ</h2>
          <p class="text-hwhub-muted mt-2">あなたの暮らしのスタイルに合わせて使えます。</p>
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
        <h2 class="text-3xl font-bold text-white">今すぐ始めよう</h2>
        <p class="text-green-200">アカウント登録は無料です。</p>
        <div class="pt-2">
          <RouterLink
            to="/signup"
            class="inline-flex items-center justify-center gap-2 bg-hwhub-primary text-white font-semibold rounded-full px-8 py-3 text-base transition hover:opacity-90 shadow-lg"
          >
            無料で始める →
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
            利用規約
          </RouterLink>
          <RouterLink
            to="/settings/app/privacy"
            class="text-green-300 hover:text-white transition"
          >
            プライバシーポリシー
          </RouterLink>
        </div>
        <span class="text-xs text-green-500">© 2026 HwHub</span>
      </div>
    </footer>
  </div>
</template>
