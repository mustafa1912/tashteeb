<script setup>
defineProps({
  variant: {
    type: String,
    default: 'lines' // lines | card | table | chart | invoice
  },
  count: {
    type: Number,
    default: 4
  }
})
</script>

<template>
  <div aria-busy="true" aria-live="polite">
    <div v-if="variant === 'card'" class="card-surface p-5 space-y-3">
      <div class="h-4 w-28 rounded-pill roller-shimmer" />
      <div class="h-7 w-40 rounded-control roller-shimmer" />
      <div class="h-3 w-full rounded-pill roller-shimmer" />
      <div class="h-12 w-full rounded-control roller-shimmer" />
    </div>

    <div v-else-if="variant === 'table'" class="card-surface divide-y divide-border overflow-hidden">
      <div class="h-11 roller-shimmer" />
      <div v-for="i in count" :key="i" class="flex items-center justify-between gap-4 px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-control roller-shimmer shrink-0" />
          <div class="space-y-2">
            <div class="h-3.5 w-32 rounded-pill roller-shimmer" />
            <div class="h-3 w-20 rounded-pill roller-shimmer" />
          </div>
        </div>
        <div class="h-4 w-20 rounded-pill roller-shimmer" />
        <div class="h-5 w-16 rounded-pill roller-shimmer" />
      </div>
    </div>

    <div v-else-if="variant === 'chart'" class="card-surface p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="h-5 w-44 rounded-pill roller-shimmer" />
        <div class="h-8 w-28 rounded-control roller-shimmer" />
      </div>
      <div class="h-48 w-full rounded-card roller-shimmer" />
    </div>

    <div v-else-if="variant === 'invoice'" class="space-y-5">
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="n in 3" :key="n" class="card-surface p-5 space-y-3">
          <div class="h-3.5 w-24 rounded-pill roller-shimmer" />
          <div class="h-8 w-36 rounded-control roller-shimmer" />
          <div class="h-3 w-48 rounded-pill roller-shimmer" />
        </div>
      </div>
      <div class="card-surface p-5 space-y-3">
        <div v-for="n in 6" :key="n" class="h-10 w-full rounded-control roller-shimmer" />
      </div>
    </div>

    <div v-else class="space-y-2.5">
      <div
        v-for="i in count"
        :key="i"
        class="h-3.5 rounded-pill roller-shimmer"
        :class="i === count ? 'w-2/3' : 'w-full'"
      />
    </div>
  </div>
</template>
