<template>
  <component
    :is="canAccess ? RouterLink : 'div'"
    v-bind="canAccess ? { to } : {}"
    class="block rounded-xl border p-4 shadow-sm transition"
    :class="canAccess
      ? 'bg-white hover:bg-hwhub-surface-subtle cursor-pointer'
      : 'bg-hwhub-surface cursor-not-allowed opacity-60'"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="rounded-lg p-2" :class="iconBgClass">
          <component :is="icon" class="w-5 h-5" :class="iconColorClass" />
        </div>
        <div>
          <div class="font-medium text-sm text-hwhub-heading">{{ title }}</div>
          <div class="text-xs text-hwhub-muted">{{ subtitle }}</div>
        </div>
      </div>
      <Lock v-if="!canAccess" class="w-4 h-4 text-hwhub-muted" />
      <span v-else class="text-hwhub-muted">›</span>
    </div>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Lock } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  canAccess: boolean
  to: RouteLocationRaw
  icon: Component
  iconBgClass: string
  iconColorClass: string
  title: string
  subtitle: string
}>()
</script>
