<script setup>
import { Layers } from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()
const marketStore = useMarketStore()

// Duplicate the list so it scrolls seamlessly in an infinite loop
const marqueeMaterials = computed(() => {
  const list = marketStore.adjustedMaterials.slice(0, 12)
  return [...list, ...list]
})
</script>

<template>
  <div class="relative w-full overflow-hidden bg-sand/80 border-y border-border/80 py-3 select-none">
    <!-- Left & Right gradient fades for smooth edge bleed -->
    <div class="pointer-events-none absolute inset-y-0 start-0 w-16 sm:w-24 bg-gradient-to-r from-sand to-transparent z-10 rtl:bg-gradient-to-l" />
    <div class="pointer-events-none absolute inset-y-0 end-0 w-16 sm:w-24 bg-gradient-to-l from-sand to-transparent z-10 rtl:bg-gradient-to-r" />

    <div class="flex items-center">
      <div class="flex items-center gap-6 animate-marquee hover:[animation-play-state:paused] rtl:animate-marquee-rtl shrink-0">
        <NuxtLink
          v-for="(item, idx) in marqueeMaterials"
          :key="`${item.slug}-${idx}`"
          :to="localePath(`/market/${item.slug}`)"
          class="inline-flex items-center gap-2.5 rounded-pill border border-border/80 bg-surface px-3.5 py-1.5 shadow-subtle hover:border-primary hover:shadow-card transition-all shrink-0 group"
        >
          <div class="h-6 w-6 rounded-pill overflow-hidden shrink-0 border border-border/60 bg-plaster flex items-center justify-center">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="locale === 'ar' ? item.label_ar : item.label_en"
              class="h-full w-full object-cover"
              loading="lazy"
            >
            <span
              v-else-if="item.swatch_color"
              class="h-full w-full"
              :style="{ backgroundColor: item.swatch_color }"
            />
            <Layers v-else class="h-3.5 w-3.5 text-primary" :stroke-width="1.5" />
          </div>

          <span class="text-xs font-semibold text-ink group-hover:text-primary transition-colors max-w-[280px] truncate">
            {{ locale === 'ar' ? item.label_ar : item.label_en }}
          </span>

          <span class="tabular-price text-xs font-bold text-ink">
            {{ formatNumber(item.price) }} <span class="text-[10px] text-ink-secondary">{{ currencySymbol(locale) }}</span>
          </span>

          <PriceBadge :change-pct="item.change_30d" class="text-[10px] px-1.5 py-0.2" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marqueeRtl {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(50%);
  }
}

.animate-marquee {
  animation: marquee 35s linear infinite;
}

.rtl\:animate-marquee-rtl:dir(rtl),
[dir="rtl"] .rtl\:animate-marquee-rtl {
  animation: marqueeRtl 35s linear infinite;
}
</style>

