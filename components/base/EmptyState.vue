<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  actionLabel: {
    type: String,
    default: ''
  },
  actionTo: {
    type: [String, Object],
    default: null
  }
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="card-surface flex flex-col items-center justify-center px-6 py-12 text-center">
    <div
      v-if="$slots.icon"
      class="mb-4 grid h-14 w-14 place-items-center rounded-pill bg-sand text-primary"
    >
      <slot name="icon" />
    </div>

    <h3 class="text-lg font-semibold text-ink">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-md text-sm text-ink-secondary">
      {{ description }}
    </p>

    <div v-if="actionLabel || $slots.action" class="mt-5">
      <slot name="action">
        <BaseButton
          variant="primary"
          :to="actionTo"
          @click="!actionTo && emit('action')"
        >
          {{ actionLabel }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>
