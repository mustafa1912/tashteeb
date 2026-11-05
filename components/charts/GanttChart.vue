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

function barStyle(task) {
  const total = maxWeeks.value
  const start = Math.max(1, Number(task.startWeek) || 1)
  const end = Math.max(start, Number(task.endWeek) || start)
  const leftPct = ((start - 1) / total) * 100
  const widthPct = ((end - start + 1) / total) * 100
  return {
    left: `${leftPct}%`,
    width: `${widthPct}%`
  }
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <div class="min-w-[620px] space-y-2">
      <!-- Week header -->
      <div class="grid grid-cols-[190px_1fr] items-center gap-4 pb-2 border-b border-border">
        <span class="text-xs font-semibold uppercase text-ink-secondary">
          <slot name="stage-label">Stage</slot>
        </span>
        <div
          dir="ltr"
          class="grid text-center text-xs font-semibold text-ink-secondary tabular-price"
          :style="{ gridTemplateColumns: `repeat(${maxWeeks}, minmax(0, 1fr))` }"
        >
          <span v-for="w in weekTicks" :key="w">W{{ w }}</span>
        </div>
      </div>

      <!-- Task rows -->
      <div
        v-for="(task, idx) in tasks"
        :key="task.id || idx"
        class="grid grid-cols-[190px_1fr] items-center gap-4 py-1.5"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-ink">{{ task.label }}</p>
          <p class="text-xs text-ink-secondary tabular-price">
            W{{ task.startWeek }}–W{{ task.endWeek }}
          </p>
        </div>

        <!-- Always LTR time axis per Arabic RTL guidelines -->
        <div dir="ltr" class="relative h-8 rounded-control bg-sand/80 border border-border/60 overflow-hidden">
          <!-- Subtle vertical week guides -->
          <div
            class="absolute inset-0 grid pointer-events-none"
            :style="{ gridTemplateColumns: `repeat(${maxWeeks}, minmax(0, 1fr))` }"
          >
            <span
              v-for="w in weekTicks"
              :key="w"
              class="border-r border-border/50 last:border-r-0"
            />
          </div>

          <!-- Task bar -->
          <div
            class="absolute top-1.5 bottom-1.5 rounded-[6px] flex items-center justify-center px-2 text-xs font-semibold text-surface shadow-sm transition-all"
            :class="idx % 2 === 0 ? 'bg-primary' : 'bg-accent'"
            :style="barStyle(task)"
          >
            <span class="truncate tabular-price">
              {{ task.endWeek - task.startWeek + 1 }}w
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
