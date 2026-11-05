<script setup>
defineProps({
  items: {
    type: Array,
    required: true // [{ key, label, count? }]
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="chip in items"
      :key="chip.key"
      type="button"
      :aria-pressed="modelValue === chip.key"
      class="inline-flex min-h-[40px] items-center gap-1.5 rounded-pill border px-4 py-1.5 text-sm font-semibold transition-colors"
      :class="
        modelValue === chip.key
          ? 'border-primary bg-primary text-surface shadow-sm'
          : 'border-border bg-surface text-ink-secondary hover:border-primary/40 hover:text-ink'
      "
      @click="emit('update:modelValue', chip.key)"
    >
      <span>{{ chip.label }}</span>
      <span
        v-if="chip.count !== undefined"
        class="rounded-pill px-1.5 py-0.5 text-xs tabular-price"
        :class="modelValue === chip.key ? 'bg-surface/20 text-surface' : 'bg-sand text-ink-secondary'"
      >
        {{ chip.count }}
      </span>
    </button>
  </div>
</template>
