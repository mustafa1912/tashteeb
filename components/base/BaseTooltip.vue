<script setup>
defineProps({
  text: {
    type: String,
    required: true
  }
})

const open = ref(false)
</script>

<template>
  <span
    class="relative inline-flex items-center"
    @mouseenter="open = true"
    @mouseleave="open = false"
    @focusin="open = true"
    @focusout="open = false"
  >
    <slot />
    <span
      v-if="open && text"
      role="tooltip"
      class="pointer-events-none absolute bottom-full start-1/2 z-40 mb-2 w-max max-w-[240px] -translate-x-1/2 rtl:translate-x-1/2 rounded-control bg-ink px-3 py-1.5 text-xs font-medium text-surface shadow-elevated"
    >
      {{ text }}
    </span>
  </span>
</template>
