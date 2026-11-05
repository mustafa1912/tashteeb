<script setup>
const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
    // [{ id, label, startWeek, endWeek, durationWeeks, parallel }]
  },
  totalWeeks: {
    type: Number,
    default: 0
  }
})

const maxWeeks = computed(() => {
  if (props.totalWeeks > 0) return props.totalWeeks
  const maxEnd = props.tasks.reduce((acc, t) => Math.max(acc, Number(t.endWeek) || 0), 0)
  return Math.max(maxEnd, 12)
})

const weekTicks = computed(() => {
  const total = maxWeeks.value
  return Array.from({ length: total }, (_, i) => i + 1)
})

const rollerColors = [
  '#0F5C6E', // Nile Teal
  '#F4B223', // Saffron
  '#7DBE9A', // Sage
  '#D8572A', // Terracotta
  '#6FB1D9', // Sky
  '#E8A598', // Rose Clay
  '#12394A', // Nile Navy
  '#2E8B57'  // Success Green
]

function getTaskColor(task, idx) {
  if (task.color) return task.color
  return rollerColors[idx % rollerColors.length]
}

function barStyle(task, idx) {
  const total = maxWeeks.value
  const start = Math.max(1, Number(task.startWeek) || 1)
  const end = Math.max(start, Number(task.endWeek) || start)
  const leftPct = ((start - 1) / total) * 100
  const widthPct = ((end - start + 1) / total) * 100
  return {
    left: `${leftPct}%`,
    width: `${widthPct}%`,
    backgroundColor: getTaskColor(task, idx)
  }
}
</script>

<template>
  <div class="w-full overflow-x-auto select-none">
    <div class="min-w-[620px] space-y-2.5">
      <!-- Week header -->
      <div class="grid grid-cols-[200px_1fr] items-center gap-4 pb-2 border-b border-border/80">
        <span class="text-xs font-bold uppercase tracking-wider text-ink-secondary">
          <slot name="stage-label">Stage & Trade</slot>
        </span>
        <div
          dir="ltr"
          class="grid text-center text-xs font-bold text-ink-secondary tabular-price"
          :style="{ gridTemplateColumns: `repeat(${maxWeeks}, minmax(0, 1fr))` }"
        >
          <span v-for="w in weekTicks" :key="w">W{{ w }}</span>
        </div>
      </div>

      <!-- Task rows -->
      <div
        v-for="(task, idx) in tasks"
        :key="task.id || idx"
        class="grid grid-cols-[200px_1fr] items-center gap-4 py-1.5 hover:bg-sand/30 rounded-control transition-colors px-1"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-ink">{{ task.label }}</p>
          <p class="text-[11px] text-ink-secondary tabular-price font-medium">
            W{{ task.startWeek }}–W{{ task.endWeek }} ({{ task.endWeek - task.startWeek + 1 }}w)
          </p>
        </div>

        <!-- Always LTR time axis per Arabic RTL guidelines -->
        <div dir="ltr" class="relative h-9 rounded-pill bg-sand/70 border border-border/70 overflow-hidden shadow-inner">
          <!-- Subtle vertical week guides -->
          <div
            class="absolute inset-0 grid pointer-events-none"
            :style="{ gridTemplateColumns: `repeat(${maxWeeks}, minmax(0, 1fr))` }"
          >
            <span
              v-for="w in weekTicks"
              :key="w"
              class="border-r border-border/40 last:border-r-0"
            />
          </div>

          <!-- Paint roller styled task stroke -->
          <div
            class="absolute top-1 bottom-1 rounded-pill flex items-center justify-between px-3 text-xs font-bold text-surface shadow-subtle transition-all duration-300"
            :style="barStyle(task, idx)"
          >
            <span class="truncate text-[11px] tabular-price font-sans">
              {{ task.label }}
            </span>
            <span class="text-[10px] opacity-90 tabular-price ms-1 shrink-0">
              {{ task.endWeek - task.startWeek + 1 }}w
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
