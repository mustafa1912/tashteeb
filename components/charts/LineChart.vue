<script setup>
const props = defineProps({
  points: {
    type: Array,
    default: () => [] // [{ date: '2026-06-01', label: 'Jun', value: 420 }]
  },
  height: {
    type: Number,
    default: 240
  },
  unitLabel: {
    type: String,
    default: ''
  },
  showMinMax: {
    type: Boolean,
    default: true
  },
  ranges: {
    type: Array,
    default: () => []
  },
  selectedRange: {
    type: String,
    default: '6M'
  }
})

const emit = defineEmits(['update:selectedRange'])
const { locale } = useI18n()
const uid = useId()
const hoveredIndex = ref(null)

const svgWidth = 680
const padLeft = 52
const padRight = 20
const padTop = 24
const padBottom = 34

const parsedPoints = computed(() =>
  props.points
    .map((p, idx) => ({
      index: idx,
      date: p.date || '',
      label: p.label || formatDateDisplay(p.date, locale.value),
      value: Number(p.value) || 0
    }))
    .filter(p => Number.isFinite(p.value))
)

const stats = computed(() => {
  const list = parsedPoints.value
  if (!list.length) {
    return { min: 0, max: 100, minIdx: 0, maxIdx: 0, ticks: [0, 50, 100] }
  }
  let min = Infinity
  let max = -Infinity
  let minIdx = 0
  let maxIdx = 0
  list.forEach((p, idx) => {
    if (p.value < min) {
      min = p.value
      minIdx = idx
    }
    if (p.value > max) {
      max = p.value
      maxIdx = idx
    }
  })
  const rawSpan = max - min || Math.max(10, max * 0.1)
  const floor = Math.max(0, Math.floor((min - rawSpan * 0.15) / 5) * 5)
  const ceil = Math.ceil((max + rawSpan * 0.15) / 5) * 5
  const mid = Math.round((floor + ceil) / 2)
  return {
    min,
    max,
    minIdx,
    maxIdx,
    floor,
    ceil,
    ticks: [ceil, mid, floor]
  }
})

const plotted = computed(() => {
  const list = parsedPoints.value
  if (!list.length) return []
  const innerW = svgWidth - padLeft - padRight
  const innerH = props.height - padTop - padBottom
  const span = (stats.value.ceil - stats.value.floor) || 1

  return list.map((p, idx) => {
    const x = list.length === 1
      ? padLeft + innerW / 2
      : padLeft + (idx / (list.length - 1)) * innerW
    const y = padTop + innerH - ((p.value - stats.value.floor) / span) * innerH
    return {
      ...p,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1))
    }
  })
})

const linePath = computed(() => {
  if (!plotted.value.length) return ''
  return plotted.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})

const areaPath = computed(() => {
  if (plotted.value.length < 2) return ''
  const bottomY = props.height - padBottom
  const first = plotted.value[0]
  const last = plotted.value[plotted.value.length - 1]
  return `${linePath.value} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`
})

const xAxisLabels = computed(() => {
  const list = plotted.value
  if (list.length <= 6) return list
  const count = 6
  const out = []
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (list.length - 1))
    out.push(list[idx])
  }
  return out
})

const activePoint = computed(() => {
  if (hoveredIndex.value === null || !plotted.value[hoveredIndex.value]) {
    return plotted.value[plotted.value.length - 1] || null
  }
  return plotted.value[hoveredIndex.value]
})

function handlePointerMove(event) {
  if (!plotted.value.length) return
  const rect = event.currentTarget.getBoundingClientRect()
  const relX = ((event.clientX - rect.left) / rect.width) * svgWidth
  let nearestIdx = 0
  let bestDist = Infinity
  plotted.value.forEach((p, idx) => {
    const dist = Math.abs(p.x - relX)
    if (dist < bestDist) {
      bestDist = dist
      nearestIdx = idx
    }
  })
  hoveredIndex.value = nearestIdx
}
</script>

<template>
  <div class="w-full">
    <div v-if="ranges.length || activePoint" class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div v-if="activePoint" class="flex items-baseline gap-2">
        <span class="tabular-price text-lg font-bold text-ink">
          {{ Number.isInteger(activePoint.value) ? formatNumber(activePoint.value) : activePoint.value.toFixed(1) }}
          <span class="text-sm font-medium text-ink-secondary">
            {{ unitLabel || currencySymbol(locale) }}
          </span>
        </span>
        <span class="text-xs text-ink-secondary">
          {{ activePoint.date ? formatDateDisplay(activePoint.date, locale) : activePoint.label }}
        </span>
      </div>

      <div v-if="ranges.length" class="inline-flex rounded-control border border-border bg-sand p-0.5" role="tablist">
        <button
          v-for="range in ranges"
          :key="range"
          type="button"
          role="tab"
          :aria-selected="selectedRange === range"
          class="min-h-[34px] px-3 rounded-[8px] text-xs font-semibold transition-colors"
          :class="selectedRange === range ? 'bg-surface text-primary shadow-sm' : 'text-ink-secondary hover:text-ink'"
          @click="emit('update:selectedRange', range)"
        >
          {{ range }}
        </button>
      </div>
    </div>

    <div dir="ltr" class="relative w-full select-none">
      <svg
        :viewBox="`0 0 ${svgWidth} ${height}`"
        class="w-full h-auto overflow-visible"
        role="img"
        aria-label="Price trend chart"
        @pointermove="handlePointerMove"
        @pointerleave="hoveredIndex = null"
      >
        <defs>
          <linearGradient :id="`line-grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.20" />
            <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Grid lines + Y ticks -->
        <g v-for="(tick, tIdx) in stats.ticks" :key="tIdx">
          <line
            :x1="padLeft"
            :x2="svgWidth - padRight"
            :y1="padTop + (tIdx / (stats.ticks.length - 1)) * (height - padTop - padBottom)"
            :y2="padTop + (tIdx / (stats.ticks.length - 1)) * (height - padTop - padBottom)"
            class="stroke-border"
            stroke-dasharray="4 4"
            stroke-width="1"
          />
          <text
            :x="padLeft - 8"
            :y="padTop + (tIdx / (stats.ticks.length - 1)) * (height - padTop - padBottom) + 4"
            text-anchor="end"
            class="fill-ink-secondary text-[12px] tabular-price"
          >
            {{ formatNumber(tick) }}
          </text>
        </g>

        <!-- Area + Line -->
        <path v-if="areaPath" :d="areaPath" :fill="`url(#line-grad-${uid})`" />
        <path
          v-if="linePath"
          :d="linePath"
          fill="none"
          class="stroke-primary"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Min / Max markers -->
        <g v-if="showMinMax && plotted.length > 2">
          <circle
            :cx="plotted[stats.minIdx].x"
            :cy="plotted[stats.minIdx].y"
            r="4.5"
            class="fill-success stroke-surface"
            stroke-width="2"
          />
          <circle
            :cx="plotted[stats.maxIdx].x"
            :cy="plotted[stats.maxIdx].y"
            r="4.5"
            class="fill-accent stroke-surface"
            stroke-width="2"
          />
        </g>

        <!-- Hover scrubber -->
        <g v-if="activePoint && hoveredIndex !== null">
          <line
            :x1="activePoint.x"
            :x2="activePoint.x"
            :y1="padTop"
            :y2="height - padBottom"
            class="stroke-primary/40"
            stroke-width="1.5"
            stroke-dasharray="3 3"
          />
          <circle
            :cx="activePoint.x"
            :cy="activePoint.y"
            r="5.5"
            class="fill-primary stroke-surface"
            stroke-width="2"
          />
        </g>

        <!-- X axis labels -->
        <g>
          <text
            v-for="(pt, xIdx) in xAxisLabels"
            :key="xIdx"
            :x="pt.x"
            :y="height - 8"
            text-anchor="middle"
            class="fill-ink-secondary text-[12px]"
          >
            {{ pt.label }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>
