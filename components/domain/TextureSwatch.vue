<script setup>
import { ZoomIn } from 'lucide-vue-next'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Material swatch'
  },
  size: {
    type: String,
    default: 'md' // 'xs', 'sm', 'md', 'lg', 'xl'
  },
  shape: {
    type: String,
    default: 'rounded' // 'circle', 'rounded', 'square'
  },
  zoomable: {
    type: Boolean,
    default: true
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-7 h-7'
    case 'sm': return 'w-10 h-10'
    case 'lg': return 'w-18 h-18'
    case 'xl': return 'w-24 h-24'
    case 'md':
    default:
      return 'w-14 h-14'
  }
})

const shapeClasses = computed(() => {
  switch (props.shape) {
    case 'circle': return 'rounded-pill'
    case 'square': return 'rounded-none'
    case 'rounded':
    default:
      return 'rounded-control'
  }
})
</script>

<template>
  <div
    class="group relative shrink-0 overflow-hidden border border-border/80 shadow-xs transition-all duration-300 select-none bg-sand"
    :class="[
      sizeClasses,
      shapeClasses,
      zoomable ? 'hover:scale-110 hover:shadow-elevated hover:z-20 cursor-pointer' : ''
    ]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-125"
    />
    <div
      v-else-if="color"
      class="h-full w-full"
      :style="{ backgroundColor: color }"
    />

    <!-- Magnifying hover hint -->
    <div
      v-if="zoomable && src"
      class="absolute inset-0 flex items-center justify-center bg-ink/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    >
      <ZoomIn class="h-4 w-4 text-surface" :stroke-width="2" />
    </div>
  </div>
</template>

