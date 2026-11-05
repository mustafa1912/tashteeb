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
  <div aria-busy="true" aria-live="polite" class="animate-pulse">
    <div v-if="variant === 'card'" class="card-surface p-5 space-y-3">
      <div class="h-4 w-28 rounded-pill bg-sand" />
      <div class="h-7 w-40 rounded-control bg-border/80" />
      <div class="h-3 w-full rounded-pill bg-sand" />
      <div class="h-12 w-full rounded-control bg-sand" />
    </div>

    <div v-else-if="variant === 'table'" class="card-surface divide-y divide-border overflow-hidden">
      <div class="h-11 bg-sand/70" />
      <div v-for="i in count" :key="i" class="flex items-center justify-between gap-4 px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-control bg-sand" />
          <div class="space-y-2">
            <div class="h-3.5 w-32 rounded-pill bg-border/80" />
            <div class="h-3 w-20 rounded-pill bg-sand" />
          </div>
        </div>
        <div class="h-4 w-20 rounded-pill bg-sand" />
        <div class="h-5 w-16 rounded-pill bg-border/70" />
      </div>
    </div>

    <div v-else-if="variant === 'chart'" class="card-surface p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="h-5 w-44 rounded-pill bg-border/80" />
        <div class="h-8 w-28 rounded-control bg-sand" />
      </div>
      <div class="h-48 w-full rounded-card bg-sand" />
    </div>

    <div v-else-if="variant === 'invoice'" class="space-y-5">
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="n in 3" :key="n" class="card-surface p-5 space-y-3">
          <div class="h-3.5 w-24 rounded-pill bg-sand" />
          <div class="h-8 w-36 rounded-control bg-border/80" />
          <div class="h-3 w-48 rounded-pill bg-sand" />
        </div>
      </div>
      <div class="card-surface p-5 space-y-3">
        <div v-for="n in 6" :key="n" class="h-10 w-full rounded-control bg-sand" />
      </div>
    </div>

    <div v-else class="space-y-2.5">
      <div
        v-for="i in count"
        :key="i"
        class="h-3.5 rounded-pill bg-sand"
        :class="i === count ? 'w-2/3' : 'w-full'"
      />
    </div>
  </div>
</template>
