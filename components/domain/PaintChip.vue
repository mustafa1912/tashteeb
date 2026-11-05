<script setup>
import { Check } from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  nameAr: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: '01'
  },
  colorHex: {
    type: String,
    required: true
  },
  price: {
    type: [Number, String],
    default: null
  },
  unit: {
    type: String,
    default: 'bucket'
  },
  active: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg'
  }
})

defineEmits(['select'])

const { locale } = useI18n()
const displayName = computed(() => {
  return locale.value === 'ar' && props.nameAr ? props.nameAr : props.name
})
</script>

<template>
  <button
    type="button"
    class="group relative flex flex-col rounded-control border text-start transition-all duration-200 outline-none select-none bg-surface p-2 shadow-sm"
    :class="[
      active
        ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-cream shadow-elevated -translate-y-0.5'
        : 'border-border hover:border-ink-secondary hover:shadow-card hover:-translate-y-0.5',
      size === 'sm' ? 'w-24 text-xs' : size === 'lg' ? 'w-44 text-sm' : 'w-32 text-xs'
    ]"
    @click="$emit('select')"
  >
    <!-- Paint Color Swatch Rect -->
    <div
      class="relative w-full rounded-[6px] overflow-hidden transition-transform duration-200"
      :class="size === 'sm' ? 'h-14' : size === 'lg' ? 'h-24' : 'h-20'"
      :style="{ backgroundColor: colorHex }"
    >
      <!-- Active checkmark badge -->
      <div
        v-if="active"
        class="absolute top-1.5 end-1.5 flex h-5 w-5 items-center justify-center rounded-pill bg-surface text-ink shadow-sm"
      >
        <Check class="h-3.5 w-3.5 text-primary" :stroke-width="2.5" />
      </div>

      <!-- Subtle paper sheen line -->
      <div class="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />
    </div>

    <!-- Swatch Metadata (Catalogue Style) -->
    <div class="mt-2 flex flex-col justify-between flex-1">
      <div class="flex items-baseline justify-between gap-1">
        <span class="font-bold text-ink truncate leading-tight">{{ displayName }}</span>
        <span class="text-[10px] font-semibold text-ink-muted tabular-price shrink-0"><bdi>{{ code }}</bdi></span>
      </div>

      <div v-if="price" class="mt-1 flex items-center justify-between text-[11px] text-ink-secondary">
        <span class="tabular-price font-extrabold text-primary">
          {{ typeof price === 'number' ? price.toLocaleString('en-US') : price }}
          {{ locale === 'ar' ? 'ج.م' : 'EGP' }}
        </span>
      </div>
    </div>
  </button>
</template>

