<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'default' // 'compact', 'default', 'hero'
  }
})

const { locale } = useI18n()

// Default fallback sample palette if no items are selected yet
const defaultSamples = [
  {
    category: 'floors',
    label_en: 'Porcelain 60×60 Cleopatra',
    label_ar: 'بورسلين 60×60 كليوباترا',
    image: '/images/materials/porcelain-60x60.svg',
    color: '#D8572A'
  },
  {
    category: 'walls',
    label_en: 'Jotun Fenomastic Rich Matt',
    label_ar: 'جوتن فينوماستيك ريتش مات',
    image: '/images/materials/paint-jotun.svg',
    color: '#F4B223'
  },
  {
    category: 'doors',
    label_en: 'Oak Wood Veneer Door',
    label_ar: 'باب قشرة أرو هندسي',
    image: '/images/materials/door-wood-veneer.svg',
    color: '#E8A598'
  },
  {
    category: 'bathrooms',
    label_en: 'Duravit Wall-hung Sanitary',
    label_ar: 'صحي ديورافيت معلق',
    image: '/images/materials/sanitary-duravit.svg',
    color: '#12394A'
  }
]

const displayItems = computed(() => {
  if (props.items && props.items.length) {
    return props.items.slice(0, 4)
  }
  return defaultSamples
})
</script>

<template>
  <div
    class="relative rounded-card border border-border/80 bg-sand/60 p-3.5 shadow-sm transition-all"
    :class="[
      size === 'compact' ? 'p-2.5' : size === 'hero' ? 'p-6 bg-plaster-grain shadow-elevated' : 'p-4'
    ]"
  >
    <!-- Designer pin / masking tape accent -->
    <div
      class="absolute -top-2.5 start-6 h-4 w-12 rounded-[2px] bg-saffron/40 border border-saffron/60 rotate-2 shadow-xs"
      aria-hidden="true"
    />

    <!-- Header bar -->
    <div class="mb-2.5 flex items-center justify-between">
      <span class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-pill bg-terracotta" />
        <span>{{ title || (locale === 'ar' ? 'لوحة عينات المواد والتشطيب' : 'Material Sample Board') }}</span>
      </span>
      <span class="text-[11px] font-semibold text-ink-muted tabular-price">
        {{ displayItems.length }} {{ locale === 'ar' ? 'عينات مختارة' : 'swatches' }}
      </span>
    </div>

    <!-- Swatch Collage Grid -->
    <div
      class="grid gap-2"
      :class="[
        size === 'compact' ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'
      ]"
    >
      <div
        v-for="(item, idx) in displayItems"
        :key="idx"
        class="group relative flex flex-col rounded-control border border-border bg-surface p-1.5 shadow-xs transition-transform hover:-translate-y-0.5 hover:shadow-card"
      >
        <!-- Swatch Texture / Image -->
        <div
          class="relative w-full rounded-[6px] overflow-hidden bg-sand/70"
          :class="size === 'compact' ? 'h-12' : size === 'hero' ? 'h-24' : 'h-16'"
        >
          <img
            v-if="item.image || item.image_url"
            :src="item.image || item.image_url"
            :alt="locale === 'ar' ? (item.label_ar || item.label) : (item.label_en || item.label)"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div
            v-else
            class="h-full w-full"
            :style="{ backgroundColor: item.color || item.swatch_color || '#0F5C6E' }"
          />

          <!-- Category color dot -->
          <span
            class="absolute bottom-1 end-1 h-2.5 w-2.5 rounded-pill border border-surface shadow-xs"
            :style="{ backgroundColor: item.color || item.swatch_color || '#D8572A' }"
          />
        </div>

        <!-- Title -->
        <p class="mt-1.5 text-[11px] font-bold text-ink truncate leading-tight">
          {{ locale === 'ar' ? (item.label_ar || item.label_en || item.name) : (item.label_en || item.label_ar || item.name) }}
        </p>
      </div>
    </div>
  </div>
</template>

