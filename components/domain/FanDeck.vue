<script setup>
const props = defineProps({
  colors: {
    type: Array,
    default: () => [
      { name: 'Nile Navy', nameAr: 'كحلي نيلي', code: 'N-500', hex: '#12394A' },
      { name: 'Nile Teal', nameAr: 'تيل النيل', code: 'T-500', hex: '#0F5C6E' },
      { name: 'Siwa Sage', nameAr: 'سيج سيوة', code: 'S-500', hex: '#7DBE9A' },
      { name: 'Luxor Saffron', nameAr: 'زعفران الأقصر', code: 'L-500', hex: '#F4B223' },
      { name: 'Aswan Terracotta', nameAr: 'طمي أسوان', code: 'A-500', hex: '#D8572A' },
      { name: 'Rosetta Clay', nameAr: 'طمي رشيد', code: 'R-500', hex: '#E8A598' }
    ]
  },
  modelValue: {
    type: String,
    default: '#7DBE9A'
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isFanned = ref(false)
const { locale } = useI18n()

function selectColor(color) {
  emit('update:modelValue', color.hex)
  emit('change', color)
}

function getRotation(index, total) {
  // Center is 0 deg; spreads between -25deg and +25deg
  const mid = (total - 1) / 2
  const step = 45 / Math.max(total - 1, 1)
  const angle = (index - mid) * step
  return locale.value === 'ar' ? -angle : angle
}
</script>

<template>
  <div
    class="relative h-44 w-72 sm:w-80 flex items-end justify-center select-none py-2"
    @mouseenter="isFanned = true"
    @mouseleave="isFanned = false"
  >
    <!-- Deck pivot pin -->
    <div
      class="absolute bottom-2 z-30 h-4 w-4 rounded-pill border-2 border-surface bg-ink shadow-md"
      aria-hidden="true"
    />

    <!-- Overlapping fanning chips -->
    <div
      v-for="(c, idx) in colors"
      :key="c.code"
      class="absolute bottom-2 origin-bottom transition-all duration-300 ease-out cursor-pointer"
      :style="{
        transform: isFanned
          ? `rotate(${getRotation(idx, colors.length)}deg) translateY(${modelValue === c.hex ? '-14px' : '0px'})`
          : `rotate(${getRotation(idx, colors.length) * 0.3}deg) translateY(${modelValue === c.hex ? '-8px' : '0px'})`,
        zIndex: modelValue === c.hex ? 25 : 10 + idx
      }"
      @click="selectColor(c)"
    >
      <div
        class="w-20 h-32 rounded-control border p-1.5 shadow-card transition-shadow duration-200"
        :class="[
          modelValue === c.hex
            ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-cream bg-surface'
            : 'border-border bg-surface hover:shadow-elevated'
        ]"
      >
        <!-- Color Block -->
        <div
          class="h-20 w-full rounded-[4px] shadow-inner"
          :style="{ backgroundColor: c.hex }"
        />
        <!-- Chip Name & Code -->
        <div class="mt-1 text-center">
          <p class="text-[10px] font-bold text-ink truncate leading-tight">
            {{ locale === 'ar' && c.nameAr ? c.nameAr : c.name }}
          </p>
          <p class="text-[9px] font-semibold text-ink-muted tabular-price">{{ c.code }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

