<script setup>
const props = defineProps({
  segments: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  heightClass: {
    type: String,
    default: 'h-4'
  }
})

const { locale } = useI18n()

const bgClasses = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-chart-6',
  'bg-chart-7'
]

const normalized = computed(() => {
  const sum = props.total > 0
    ? props.total
    : props.segments.reduce((acc, s) => acc + Math.max(0, Number(s.value) || 0), 0)

  if (sum <= 0) return []

  return props.segments
    .filter(s => Number(s.value) > 0)
    .map((s, idx) => {
      const val = Number(s.value) || 0
      const pct = (val / sum) * 100
      return {
        ...s,
        pct,
        pctDisplay: Math.round(pct),
        bgClass: bgClasses[(s.colorIndex ?? idx) % 7]
      }
    })
})
</script>

<template>
  <div class="w-full space-y-3">
    <div
      class="flex w-full overflow-hidden rounded-pill bg-sand border border-border/60"
      :class="heightClass"
      role="img"
      aria-label="Category allocation breakdown"
    >
      <div
        v-for="(seg, idx) in normalized"
        :key="seg.key || seg.label || idx"
        :class="seg.bgClass"
        :style="{ width: `${Math.max(seg.pct, 1.5)}%` }"
        :title="`${seg.label}: ${formatCurrency(seg.value, locale)} (${seg.pctDisplay}%)`"
        class="h-full transition-all duration-300 border-e border-surface/40 last:border-e-0"
      />
    </div>

    <div v-if="showLegend && normalized.length" class="flex flex-wrap gap-x-5 gap-y-2 text-xs">
      <div
        v-for="(seg, idx) in normalized"
        :key="seg.key || seg.label || idx"
        class="inline-flex items-center gap-2"
      >
        <span class="h-2.5 w-2.5 rounded-pill shrink-0" :class="seg.bgClass" />
        <span class="font-medium text-ink">{{ seg.label }}</span>
        <span class="tabular-price text-ink-secondary">
          {{ formatCurrency(seg.value, locale) }} ({{ seg.pctDisplay }}%)
        </span>
      </div>
    </div>
  </div>
</template>
