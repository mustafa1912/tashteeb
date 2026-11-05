<script setup>
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => [] // [{ value, label }]
  },
  label: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const selectId = useId()
</script>

<template>
  <div class="grid gap-1.5">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-ink">
      {{ label }}
    </label>

    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        class="min-h-touch w-full appearance-none rounded-control border bg-surface py-2.5 ps-3.5 pe-10 text-base text-ink transition-colors hover:border-ink-muted focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        :class="error ? 'border-danger' : 'border-border'"
        @change="emit('update:modelValue', $event.target.value)"
      >
        <option
          v-for="opt in options"
          :key="typeof opt === 'object' ? opt.value : opt"
          :value="typeof opt === 'object' ? opt.value : opt"
        >
          {{ typeof opt === 'object' ? opt.label : opt }}
        </option>
      </select>

      <ChevronDown
        class="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
        :stroke-width="1.5"
        aria-hidden="true"
      />
    </div>

    <p v-if="error" class="text-xs font-medium text-danger" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-ink-secondary">
      {{ hint }}
    </p>
  </div>
</template>
