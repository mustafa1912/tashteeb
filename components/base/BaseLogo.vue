<script setup>
defineProps({
  inverse: {
    type: Boolean,
    default: false
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md'
  }
})
</script>

<template>
  <span
    dir="ltr"
    class="inline-flex items-center gap-2.5 select-none"
    :class="inverse ? 'text-surface' : 'text-primary'"
  >
    <svg
      :class="size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'"
      viewBox="0 0 40 40"
      role="img"
      aria-label="Tashteeb logo"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <path
        d="M9 9h10v10H9zM21 9h10v10H21zM9 21h10v10H9z"
        fill="none"
        class="stroke-surface"
        stroke-width="2"
      />
      <path d="M21 21h10v10H21z" class="fill-accent" />
      <path
        d="m24.3 26 2 2 3.4-4"
        fill="none"
        class="stroke-surface"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <span v-if="!iconOnly" class="grid leading-none text-start">
      <strong
        class="font-extrabold tracking-normal"
        :class="[
          size === 'sm' ? 'text-base' : 'text-lg',
          inverse ? 'text-surface' : 'text-ink'
        ]"
      >
        Tashteeb
      </strong>
      <span
        class="mt-1 font-arabic text-xs font-medium"
        :class="inverse ? 'text-surface/75' : 'text-ink-secondary'"
      >
        تشطيب
      </span>
    </span>
  </span>
</template>
