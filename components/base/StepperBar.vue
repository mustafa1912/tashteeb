<script setup>
import { Check, Paintbrush } from 'lucide-vue-next'

const props = defineProps({
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

const stepColors = [
  '#0F5C6E', // 0: Nile Teal (Apartment)
  '#F4B223', // 1: Luxor Saffron (Level)
  '#7DBE9A', // 2: Siwa Sage (Materials)
  '#E8A598', // 3: Rosetta Rose Clay (Extras)
  '#D8572A'  // 4: Aswan Terracotta (Review)
]

const currentColor = computed(() => stepColors[props.modelValue] || '#0F5C6E')
const progressPct = computed(() => {
  const total = Math.max(1, props.steps.length - 1)
  return Math.min(100, Math.round((props.modelValue / total) * 100))
})
</script>

<template>
  <nav aria-label="Wizard steps" class="space-y-3 pb-1 select-none">
    <!-- Paint Roller Progress Bar -->
    <div class="relative w-full h-2.5 bg-sand/90 rounded-pill overflow-hidden border border-border/80">
      <div
        class="h-full rounded-pill transition-all duration-500 ease-out"
        :style="{
          width: `${progressPct}%`,
          backgroundColor: currentColor
        }"
      />
    </div>

    <!-- Stepper Buttons -->
    <div class="overflow-x-auto pb-1">
      <ol class="grid min-w-[540px] grid-cols-5 gap-2">
        <li v-for="(step, idx) in steps" :key="step.key || idx">
          <button
            type="button"
            :aria-current="idx === modelValue ? 'step' : undefined"
            class="flex min-h-touch w-full items-center gap-2.5 rounded-control border px-3 py-2 text-start transition-all"
            :class="
              idx === modelValue
                ? 'border-2 border-primary bg-surface text-ink shadow-sm'
                : idx < modelValue
                  ? 'border-border bg-surface/90 text-ink hover:bg-surface'
                  : 'border-border/70 bg-sand/40 text-ink-secondary hover:bg-surface'
            "
            @click="emit('update:modelValue', idx)"
          >
            <span
              class="grid h-6 w-6 shrink-0 place-items-center rounded-pill text-xs font-bold tabular-price transition-colors"
              :class="
                idx < modelValue
                  ? 'bg-success text-surface'
                  : idx === modelValue
                    ? 'text-surface shadow-sm'
                    : 'bg-border text-ink-secondary'
              "
              :style="idx === modelValue ? { backgroundColor: currentColor } : {}"
            >
              <Check v-if="idx < modelValue" class="h-3.5 w-3.5" :stroke-width="2.2" aria-hidden="true" />
              <template v-else>{{ idx + 1 }}</template>
            </span>

            <span class="truncate text-xs sm:text-sm font-semibold">
              {{ step.label }}
            </span>
          </button>
        </li>
      </ol>
    </div>
  </nav>
</template>
