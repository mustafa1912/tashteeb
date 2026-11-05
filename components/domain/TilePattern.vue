<script setup>
const props = defineProps({
  pattern: {
    type: String,
    default: 'straight' // 'straight', 'diagonal', 'herringbone', 'hexagon', 'subway', 'checker'
  },
  color: {
    type: String,
    default: '#D8572A'
  },
  wastePct: {
    type: Number,
    default: 10
  },
  active: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'Straight'
  },
  labelAr: {
    type: String,
    default: 'عدل مستقيم'
  }
})

defineEmits(['select'])

const { locale } = useI18n()
</script>

<template>
  <button
    type="button"
    class="flex flex-col items-center rounded-card border p-3 transition-all duration-200 outline-none select-none text-center bg-surface"
    :class="[
      active
        ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-cream shadow-elevated bg-sand/40 -translate-y-0.5'
        : 'border-border hover:border-ink-secondary hover:shadow-card hover:-translate-y-0.5'
    ]"
    @click="$emit('select')"
  >
    <!-- SVG Pattern Preview Box -->
    <div class="relative h-20 w-24 rounded-control overflow-hidden border border-border/80 bg-sand/50 flex items-center justify-center">
      <!-- Straight grid -->
      <svg v-if="pattern === 'straight'" viewBox="0 0 100 80" class="h-full w-full">
        <defs>
          <pattern id="pat_straight" width="25" height="25" patternUnits="userSpaceOnUse">
            <rect width="23" height="23" :fill="color" opacity="0.85" rx="1"/>
          </pattern>
        </defs>
        <rect width="100" height="80" fill="url(#pat_straight)"/>
      </svg>

      <!-- Diagonal 45 deg -->
      <svg v-else-if="pattern === 'diagonal'" viewBox="0 0 100 80" class="h-full w-full">
        <defs>
          <pattern id="pat_diag" width="28" height="28" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <rect width="25" height="25" :fill="color" opacity="0.85" rx="1"/>
          </pattern>
        </defs>
        <rect width="100" height="80" fill="url(#pat_diag)"/>
      </svg>

      <!-- Herringbone -->
      <svg v-else-if="pattern === 'herringbone'" viewBox="0 0 100 80" class="h-full w-full">
        <defs>
          <pattern id="pat_herring" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M0,0 L15,15 L0,30 M15,0 L30,15 L15,30" stroke="#FFF" stroke-width="2" fill="none"/>
            <rect width="15" height="30" :fill="color" opacity="0.75"/>
            <rect x="15" width="15" height="30" :fill="color" opacity="0.9"/>
          </pattern>
        </defs>
        <rect width="100" height="80" fill="url(#pat_herring)"/>
      </svg>

      <!-- Subway Stagger -->
      <svg v-else-if="pattern === 'subway'" viewBox="0 0 100 80" class="h-full w-full">
        <defs>
          <pattern id="pat_subway" width="36" height="18" patternUnits="userSpaceOnUse">
            <rect width="34" height="7" :fill="color" opacity="0.85" rx="1"/>
            <rect x="18" y="9" width="34" height="7" :fill="color" opacity="0.85" rx="1"/>
            <rect x="-18" y="9" width="34" height="7" :fill="color" opacity="0.85" rx="1"/>
          </pattern>
        </defs>
        <rect width="100" height="80" fill="url(#pat_subway)"/>
      </svg>

      <!-- Checkerboard / Hexagon Fallback -->
      <svg v-else viewBox="0 0 100 80" class="h-full w-full">
        <defs>
          <pattern id="pat_checker" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" :fill="color" opacity="0.9"/>
            <rect x="12" y="12" width="12" height="12" :fill="color" opacity="0.9"/>
            <rect x="12" width="12" height="12" fill="#FAF8F4"/>
            <rect y="12" width="12" height="12" fill="#FAF8F4"/>
          </pattern>
        </defs>
        <rect width="100" height="80" fill="url(#pat_checker)"/>
      </svg>
    </div>

    <!-- Label & Waste % Chip -->
    <div class="mt-2 text-center">
      <p class="text-xs font-bold text-ink">{{ locale === 'ar' ? labelAr : label }}</p>
      <span
        class="mt-1 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold tabular-price"
        :class="wastePct > 10 ? 'bg-accent/15 text-accent' : 'bg-success-tint text-success'"
      >
        <span>+{{ wastePct }}%</span>
        <span>{{ locale === 'ar' ? 'هالك' : 'waste' }}</span>
      </span>
    </div>
  </button>
</template>

