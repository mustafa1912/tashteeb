<script setup>
import { Plus, Minus } from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    required: true // [{ question, answer }]
  },
  defaultOpen: {
    type: Number,
    default: 0
  }
})

const openIndex = ref(props.defaultOpen ?? 0)

function toggle(idx) {
  openIndex.value = openIndex.value === idx ? -1 : idx
}
</script>

<template>
  <div class="divide-y divide-border rounded-card border border-border bg-surface overflow-hidden">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="transition-colors"
      :class="openIndex === idx ? 'bg-sand/55' : 'bg-surface hover:bg-sand/25'"
    >
      <button
        type="button"
        :aria-expanded="openIndex === idx"
        class="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-start"
        @click="toggle(idx)"
      >
        <span class="text-base font-semibold text-ink">{{ item.question }}</span>
        <span
          class="grid h-7 w-7 shrink-0 place-items-center rounded-pill border border-border bg-surface text-ink-secondary"
          aria-hidden="true"
        >
          <Minus v-if="openIndex === idx" class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <Plus v-else class="h-4 w-4" :stroke-width="1.5" />
        </span>
      </button>

      <div
        v-show="openIndex === idx"
        :id="`faq-answer-${idx}`"
        class="px-5 pb-5 text-sm leading-relaxed text-ink-secondary"
      >
        {{ item.answer }}
      </div>
    </div>
  </div>
</template>
