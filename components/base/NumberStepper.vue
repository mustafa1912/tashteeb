<script setup>
import { Minus, Plus } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 20
  },
  step: {
    type: Number,
    default: 1
  },
  label: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

function decrement() {
  const next = Math.max(props.min, Number(props.modelValue || 0) - props.step)
  emit('update:modelValue', next)
}

function increment() {
  const next = Math.min(props.max, Number(props.modelValue || 0) + props.step)
  emit('update:modelValue', next)
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3"
    :class="compact ? '' : 'flex-col sm:flex-row'"
  >
    <span v-if="label" class="text-sm font-medium text-ink">
      {{ label }}
    </span>

    <div class="inline-flex items-center gap-2" dir="ltr">
      <button
        type="button"
        :disabled="modelValue <= min"
        :aria-label="label ? `Decrease ${label}` : 'Decrease'"
        class="grid h-11 w-11 place-items-center rounded-control border border-border bg-bg text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
        @click="decrement"
      >
        <Minus class="h-4 w-4" :stroke-width="1.5" aria-hidden="true" />
      </button>

      <output class="min-w-[2.5rem] text-center text-base font-semibold text-ink tabular-price">
        {{ modelValue }}<span v-if="unit" class="ms-1 text-xs font-normal text-ink-secondary">{{ unit }}</span>
      </output>

      <button
        type="button"
        :disabled="modelValue >= max"
        :aria-label="label ? `Increase ${label}` : 'Increase'"
        class="grid h-11 w-11 place-items-center rounded-control border border-border bg-bg text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
        @click="increment"
      >
        <Plus class="h-4 w-4" :stroke-width="1.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
