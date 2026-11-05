<script setup>
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary' // primary | secondary | accent | ghost | danger | danger-outline | light
  },
  size: {
    type: String,
    default: 'md' // sm | md | lg
  },
  to: {
    type: [String, Object],
    default: null
  },
  type: {
    type: String,
    default: 'button'
  },
  block: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'border border-border bg-surface text-ink hover:bg-sand active:bg-border/60'
    case 'accent':
      return 'bg-accent text-surface hover:bg-accent-hover active:bg-accent-hover shadow-sm'
    case 'light':
      return 'bg-surface text-primary hover:bg-sand active:bg-primary-tint shadow-sm'
    case 'ghost':
      return 'bg-transparent text-ink-secondary hover:bg-sand hover:text-ink'
    case 'danger':
      return 'bg-danger text-surface hover:opacity-95 active:opacity-90'
    case 'danger-outline':
      return 'border border-danger/40 bg-surface text-danger hover:bg-danger-tint'
    default:
      return 'bg-primary text-surface hover:bg-primary-hover active:bg-primary-pressed shadow-sm'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'min-h-touch px-3.5 py-2 text-sm'
    case 'lg':
      return 'min-h-[48px] px-6 py-3 text-base'
    default:
      return 'min-h-touch px-4 py-2.5 text-sm'
  }
})
</script>

<template>
  <NuxtLink
    v-if="to && !disabled"
    :to="to"
    class="inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 select-none"
    :class="[variantClasses, sizeClasses, block ? 'w-full' : '']"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 select-none disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variantClasses, sizeClasses, block ? 'w-full' : '']"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" :stroke-width="1.5" aria-hidden="true" />
    <slot />
  </button>
</template>
