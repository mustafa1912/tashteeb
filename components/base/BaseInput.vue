<script setup>
import { AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  suffix: {
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
  min: {
    type: [Number, String],
    default: undefined
  },
  max: {
    type: [Number, String],
    default: undefined
  },
  step: {
    type: [Number, String],
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  ltr: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur'])
const autoId = useId()
const inputId = computed(() => props.id || autoId)

function onInput(event) {
  const raw = event.target.value
  emit('update:modelValue', props.type === 'number' && raw !== '' ? Number(raw) : raw)
}
</script>

<template>
  <div class="grid gap-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium text-ink"
    >
      {{ label }}
    </label>

    <div
      class="flex min-h-touch items-center rounded-control border bg-surface transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      :class="[
        error ? 'border-danger bg-danger-tint/20' : 'border-border hover:border-ink-muted',
        disabled ? 'opacity-60 cursor-not-allowed bg-sand' : ''
      ]"
    >
      <span v-if="$slots.prefix" class="ps-3 text-ink-secondary">
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :required="required"
        :dir="ltr ? 'ltr' : undefined"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined"
        class="w-full min-h-touch bg-transparent px-3.5 py-2 text-base text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-0"
        :class="[
          type === 'number' ? 'tabular-price' : '',
          ltr ? 'text-start' : ''
        ]"
        @input="onInput"
        @blur="emit('blur', $event)"
      >

      <span
        v-if="suffix"
        class="shrink-0 pe-3.5 ps-2 text-sm font-medium text-ink-secondary select-none"
      >
        <bdi>{{ suffix }}</bdi>
      </span>
    </div>

    <p
      v-if="error"
      :id="`${inputId}-err`"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-danger"
      role="alert"
    >
      <AlertCircle class="h-3.5 w-3.5 shrink-0" :stroke-width="1.5" aria-hidden="true" />
      <span>{{ error }}</span>
    </p>
    <p
      v-else-if="hint"
      :id="`${inputId}-hint`"
      class="text-xs text-ink-secondary"
    >
      {{ hint }}
    </p>
  </div>
</template>
