<template>
  <RouterLink
    :to="to"
    class="block rounded-xl border bg-white p-4 shadow-sm hover:bg-hwhub-surface-subtle transition"
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
      <span class="text-hwhub-muted">›</span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  to: RouteLocationRaw
  icon: Component
  iconBgClass: string
  iconColorClass: string
  title: string
  subtitle: string
}>()
</script>
