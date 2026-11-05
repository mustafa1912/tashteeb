<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Finishing material texture'
  },
  aspect: {
    type: String,
    default: 'aspect-square'
  },
  brushMask: {
    type: [Number, Boolean],
    default: false
  },
  zoom: {
    type: Boolean,
    default: true
  },
  rounded: {
    type: String,
    default: 'rounded-card'
  },
  thumb: {
    type: Boolean,
    default: false
  }
})

const loaded = ref(false)
const error = ref(false)

const maskClass = computed(() => {
  if (!props.brushMask) return ''
  const maskNum = typeof props.brushMask === 'number' ? props.brushMask : 1
  return `brush-mask-${maskNum}`
})
</script>

<template>
  <div
    class="relative overflow-hidden bg-sand/80 select-none"
    :class="[aspect, rounded, maskClass, thumb ? 'w-11 h-11 shrink-0' : 'w-full']"
  >
    <!-- Shimmer skeleton while loading -->
    <div
      v-if="!loaded && !error"
      class="absolute inset-0 roller-shimmer"
      aria-hidden="true"
    />

    <!-- Fallback if image fails -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-sand text-ink-muted text-xs p-2 text-center"
    >
      <span>{{ alt }}</span>
    </div>

    <!-- Image -->
    <img
      v-show="!error"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="h-full w-full object-cover transition-transform duration-500 ease-out"
      :class="[
        zoom ? 'group-hover:scale-105' : '',
        loaded ? 'opacity-100' : 'opacity-0'
      ]"
      @load="loaded = true"
      @error="error = true"
    />
  </div>
</template>

