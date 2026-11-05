<script setup>
const props = defineProps({
  values: {
    type: Array,
    default: () => []
  },
  variant: {
    type: String,
    default: 'auto' // 'auto' | 'up' | 'down' | 'primary'
  },
  width: {
    type: Number,
    default: 112
  },
  height: {
    type: Number,
    default: 34
  },
  showArea: {
    type: Boolean,
    default: true
  }
})

const uid = useId()

const resolvedVariant = computed(() => {
  if (props.variant !== 'auto') return props.variant
  if (props.values.length < 2) return 'primary'
  const first = Number(props.values[0]) || 0
  const last = Number(props.values[props.values.length - 1]) || 0
  if (last > first) return 'up'
  if (last < first) return 'down'
  return 'primary'
})

const strokeClass = computed(() => {
  if (resolvedVariant.value === 'up') return 'stroke-danger'
  if (resolvedVariant.value === 'down') return 'stroke-success'
  return 'stroke-primary'
})

const stopColorVar = computed(() => {
  if (resolvedVariant.value === 'up') return 'var(--color-danger)'
  if (resolvedVariant.value === 'down') return 'var(--color-success)'
  return 'var(--color-primary)'
})

const geometry = computed(() => {
  const nums = props.values.map(v => Number(v)).filter(v => Number.isFinite(v))
  if (nums.length < 2) {
    const mid = props.height / 2
    return {
      line: `M 2 ${mid} L ${props.width - 2} ${mid}`,
      area: '',
      lastPoint: { x: props.width - 2, y: mid }
    }
  }
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  const span = max - min || 1
  const padX = 3
  const padY = 4
  const innerW = props.width - padX * 2
  const innerH = props.height - padY * 2

  const pts = nums.map((val, idx) => {
    const x = padX + (idx / (nums.length - 1)) * innerW
    const y = padY + innerH - ((val - min) / span) * innerH
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) }
  })

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${pts[pts.length - 1].x} ${props.height - 1} L ${pts[0].x} ${props.height - 1} Z`

  return {
    line,
    area,
    lastPoint: pts[pts.length - 1]
  }
})
</script>

<template>
  <svg
    dir="ltr"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="overflow-visible shrink-0"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`spark-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="stopColorVar" stop-opacity="0.22" />
        <stop offset="100%" :stop-color="stopColorVar" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path
      v-if="showArea && geometry.area"
      :d="geometry.area"
      :fill="`url(#spark-${uid})`"
    />
    <path
      :d="geometry.line"
      fill="none"
      :class="strokeClass"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle
      :cx="geometry.lastPoint.x"
      :cy="geometry.lastPoint.y"
      r="2.5"
      :style="{ fill: stopColorVar }"
    />
  </svg>
</template>
