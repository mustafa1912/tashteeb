<script setup>
import { Check } from 'lucide-vue-next'

defineProps({
  steps: {
    type: Array,
    required: true // [{ key, label }]
  },
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <nav aria-label="Wizard steps" class="overflow-x-auto pb-1">
    <ol class="grid min-w-[540px] grid-cols-5 gap-2">
      <li v-for="(step, idx) in steps" :key="step.key || idx">
        <button
          type="button"
          :aria-current="idx === modelValue ? 'step' : undefined"
          class="flex min-h-touch w-full items-center gap-2.5 rounded-control border px-3 py-2.5 text-start transition-colors"
          :class="
            idx === modelValue
              ? 'border-primary bg-surface text-ink shadow-sm'
              : idx < modelValue
                ? 'border-border bg-surface/80 text-ink hover:bg-surface'
                : 'border-border/70 bg-sand/50 text-ink-secondary hover:bg-surface'
          "
          @click="emit('update:modelValue', idx)"
        >
          <span
            class="grid h-6 w-6 shrink-0 place-items-center rounded-pill text-xs font-bold tabular-price"
            :class="
              idx < modelValue
                ? 'bg-success text-surface'
                : idx === modelValue
                  ? 'bg-primary text-surface'
                  : 'bg-border text-ink-secondary'
            "
          >
            <Check v-if="idx < modelValue" class="h-3.5 w-3.5" :stroke-width="2" aria-hidden="true" />
            <template v-else>{{ idx + 1 }}</template>
          </span>

          <span class="truncate text-sm font-semibold">
            {{ step.label }}
          </span>
        </button>
      </li>
    </ol>
  </nav>
</template>
