<script setup>
const props = defineProps({
  changePct: {
    type: Number,
    default: null
  },
  change: {
    type: Number,
    default: null
  },
  suffix: {
    type: String,
    default: ''
  }
})

const resolvedVal = computed(() => {
  if (props.changePct !== null && props.changePct !== undefined) return Number(props.changePct) || 0
  if (props.change !== null && props.change !== undefined) return Number(props.change) || 0
  return 0
})

const isUp = computed(() => resolvedVal.value > 0)
const isDown = computed(() => resolvedVal.value < 0)
const formatted = computed(() => `${Math.abs(resolvedVal.value).toFixed(1)}%`)
</script>

<template>
  <span
    dir="ltr"
    class="inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold tabular-price"
    :class="
      isUp
        ? 'bg-danger-tint text-danger'
        : isDown
          ? 'bg-success-tint text-success'
          : 'bg-sand text-ink-secondary'
    "
  >
    <span v-if="isUp" aria-hidden="true">▲</span>
    <span v-else-if="isDown" aria-hidden="true">▼</span>
    <span>{{ formatted }}</span>
    <span v-if="suffix" class="font-medium">{{ suffix }}</span>
  </span>
</template>
