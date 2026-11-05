<script setup>
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-vue-next'

const ui = useUiStore()

function iconFor(type) {
  switch (type) {
    case 'error':
    case 'danger':
      return XCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return CheckCircle2
  }
}

function badgeClasses(type) {
  switch (type) {
    case 'error':
    case 'danger':
      return 'bg-danger-tint text-danger border-danger/30'
    case 'warning':
      return 'bg-warning-tint text-warning border-warning/40'
    case 'info':
      return 'bg-info-tint text-info border-info/30'
    default:
      return 'bg-success-tint text-success border-success/30'
  }
}
</script>

<template>
  <div
    aria-live="polite"
    class="toast-container pointer-events-none fixed bottom-20 end-4 z-50 flex w-full max-w-sm flex-col gap-2.5 sm:bottom-6"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-card border border-border bg-surface p-3.5 shadow-elevated"
        role="status"
      >
        <span
          class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-pill border"
          :class="badgeClasses(toast.type)"
        >
          <component :is="iconFor(toast.type)" class="h-4 w-4" :stroke-width="1.5" aria-hidden="true" />
        </span>

        <div class="min-w-0 flex-1">
          <strong class="block text-sm font-semibold text-ink">{{ toast.title }}</strong>
          <p v-if="toast.message" class="mt-0.5 text-xs text-ink-secondary">{{ toast.message }}</p>
        </div>

        <button
          type="button"
          :aria-label="$t('common.dismiss')"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-control text-ink-secondary hover:bg-sand hover:text-ink"
          @click="ui.dismissToast(toast.id)"
        >
          <X class="h-4 w-4" :stroke-width="1.5" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
