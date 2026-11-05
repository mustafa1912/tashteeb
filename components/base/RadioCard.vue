<script setup>
defineProps({
  selected: {
    type: Boolean,
    default: false
  },
  badge: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  meta: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    class="group relative flex w-full items-start gap-4 rounded-card border p-4 text-start transition-all duration-150"
    :class="
      selected
        ? 'border-2 border-primary bg-primary-tint/35 shadow-card'
        : 'border-border bg-surface hover:border-primary/50 hover:bg-sand/40'
    "
    @click="emit('select')"
  >
    <slot name="media" />

    <div class="min-w-0 flex-1">
      <span
        v-if="badge"
        class="mb-1.5 inline-block rounded-pill bg-primary px-2.5 py-0.5 text-xs font-semibold text-surface"
      >
        {{ badge }}
      </span>
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <strong class="text-base font-semibold text-ink">{{ title }}</strong>
        <slot name="price" />
      </div>
      <p v-if="description" class="mt-1 text-sm text-ink-secondary">
        {{ description }}
      </p>
      <p v-if="meta" class="mt-1.5 text-xs font-medium text-ink-muted">
        {{ meta }}
      </p>
      <slot />
    </div>

    <span
      class="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-pill border transition-colors"
      :class="selected ? 'border-primary bg-primary' : 'border-ink-muted bg-surface'"
      aria-hidden="true"
    >
      <span v-if="selected" class="h-2 w-2 rounded-pill bg-surface" />
    </span>
  </button>
</template>
