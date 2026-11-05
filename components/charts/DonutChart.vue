<script setup>
const props = defineProps({
  segments: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: null
  },
  size: {
    type: Number,
    default: 156
  },
  strokeWidth: {
    type: Number,
    default: 20
  },
  centerLabel: {
    type: String,
    default: ''
  },
  centerSubtext: {
    type: String,
    default: 'TOTAL'
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const { locale } = useI18n()

const strokeClasses = [
  'stroke-chart-1',
  'stroke-chart-2',
  'stroke-chart-3',
  'stroke-chart-4',
  'stroke-chart-5',
  'stroke-chart-6',
  'stroke-chart-7'
]

const dotClasses = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-chart-6',
  'bg-chart-7'
]

const sumTotal = computed(() => {
  if (Number.isFinite(props.total) && props.total > 0) return props.total
  return props.segments.reduce((acc, s) => acc + (Number(s.value) || 0), 0)
})

const displayCenter = computed(() => {
  if (props.centerLabel) return props.centerLabel
  return formatCompactK(sumTotal.value)
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const arcs = computed(() => {
  const totalVal = props.segments.reduce((acc, s) => acc + Math.max(0, Number(s.value) || 0), 0)
  if (totalVal <= 0) return []

  let cumulativeFraction = 0
  return props.segments
    .filter(s => Number(s.value) > 0)
    .map((segment, index) => {
      const val = Number(segment.value) || 0
      const fraction = val / totalVal
      const dashLength = Math.max(0, fraction * circumference.value - 1.5)
      const dashOffset = -cumulativeFraction * circumference.value
      cumulativeFraction += fraction
      const colorIdx = (segment.colorIndex ?? index) % 7

      return {
        ...segment,
        pct: Math.round(fraction * 100),
        dashArray: `${dashLength} ${circumference.value}`,
        dashOffset,
        strokeClass: strokeClasses[colorIdx],
        dotClass: dotClasses[colorIdx]
      }
    })
})
</script>

<template>
  <div :class="compact ? 'inline-flex items-center' : 'flex flex-col sm:flex-row items-center gap-5'">
    <div
      class="relative shrink-0 inline-flex items-center justify-center"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        class="-rotate-90"
        role="img"
        :aria-label="`${centerSubtext}: ${displayCenter}`"
      >
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          class="stroke-sand"
          :stroke-width="strokeWidth"
        />
        <circle
          v-for="(arc, idx) in arcs"
          :key="arc.key || arc.label || idx"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :class="arc.strokeClass"
          :stroke-width="strokeWidth"
          :stroke-dasharray="arc.dashArray"
          :stroke-dashoffset="arc.dashOffset"
          stroke-linecap="butt"
        />
      </svg>

      <div v-if="!compact" class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
        <span class="tabular-price text-lg font-bold text-ink leading-tight">
          {{ displayCenter }}
        </span>
        <span v-if="centerSubtext" class="text-xs font-medium uppercase text-ink-secondary">
          {{ centerSubtext }}
        </span>
      </div>
    </div>

    <ul v-if="showLegend && !compact && arcs.length" class="w-full space-y-2 text-sm">
      <li
        v-for="(arc, idx) in arcs"
        :key="arc.key || arc.label || idx"
        class="flex items-center justify-between gap-3"
      >
        <span class="flex items-center gap-2 min-w-0">
          <span class="h-2.5 w-2.5 rounded-pill shrink-0" :class="arc.dotClass" />
          <span class="truncate text-ink">{{ arc.label }}</span>
        </span>
        <span class="tabular-price font-semibold text-ink shrink-0">
          {{ formatCurrency(arc.value, locale) }}
          <span class="text-xs font-normal text-ink-secondary ms-1">({{ arc.pct }}%)</span>
        </span>
      </li>
    </ul>
  </div>
</template>
