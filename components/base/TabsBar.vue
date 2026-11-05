<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true // [{ key, label, count? }]
  },
  modelValue: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'segmented' // segmented | underline
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div
    role="tablist"
    class="flex items-center gap-1.5 overflow-x-auto"
    :class="
      variant === 'segmented'
        ? 'rounded-control border border-border bg-sand p-1'
        : 'border-b border-border pb-px'
    "
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.key"
      class="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold transition-colors"
      :class="
        variant === 'segmented'
          ? modelValue === tab.key
            ? 'rounded-[8px] bg-surface text-ink shadow-sm'
            : 'rounded-[8px] text-ink-secondary hover:text-ink'
          : modelValue === tab.key
            ? 'border-b-2 border-accent text-ink -mb-px'
            : 'text-ink-secondary hover:text-ink'
      "
      @click="emit('update:modelValue', tab.key)"
    >
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.count !== undefined"
        class="rounded-pill px-1.5 py-0.5 text-xs tabular-price"
        :class="modelValue === tab.key ? 'bg-primary-tint text-primary' : 'bg-border/70 text-ink-secondary'"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>
