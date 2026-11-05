<script setup>
import { Pencil, Layers, Check } from 'lucide-vue-next'

const props = defineProps({
  material: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  override: {
    type: Object,
    default: null // { original_price, used_price, is_overridden }
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select', 'edit-price'])
const { locale } = useI18n()

const displayTitle = computed(() =>
  locale.value === 'ar' ? (props.material.label_ar || props.material.label_en) : props.material.label_en
)

const activePrice = computed(() =>
  props.override?.is_overridden ? props.override.used_price : props.material.price
)

const wastePercent = computed(() => {
  const w = props.material.waste_factor || props.material.waste_pct
  if (!w) return null
  return Math.round((w > 1 ? w - 1 : w) * 100)
})
</script>

<template>
  <div
    role="radio"
    tabindex="0"
    :aria-checked="selected"
    class="group relative flex flex-col justify-between gap-3 rounded-card border p-4 text-start transition-all duration-150 cursor-pointer"
    :class="
      override?.is_overridden && selected
        ? 'border-2 border-primary bg-warning-tint/45 shadow-card'
        : selected
          ? 'border-2 border-primary bg-primary-tint/30 shadow-card'
          : override?.is_overridden
            ? 'border-warning/60 bg-warning-tint/30 hover:border-primary/50'
            : 'border-border bg-surface hover:border-primary/40 hover:bg-sand/35'
    "
    @click="emit('select', material)"
    @keydown.enter.prevent="emit('select', material)"
    @keydown.space.prevent="emit('select', material)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <TextureSwatch
          :src="material.image_url"
          :color="material.swatch_color"
          size="md"
          :zoomable="false"
          :alt="displayTitle"
          class="shrink-0 shadow-subtle border border-border/80 group-hover:scale-105 transition-transform"
        />

        <div class="min-w-0">
          <h3 class="truncate text-base font-semibold text-ink group-hover:text-primary transition-colors">
            {{ displayTitle }}
          </h3>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span v-if="material.brand" class="truncate text-xs text-ink-secondary">
              {{ material.brand }}
            </span>
            <span
              v-if="wastePercent"
              class="inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-pill bg-sand text-ink-secondary border border-border"
            >
              +{{ wastePercent }}% {{ locale === 'ar' ? 'هالك' : 'waste' }}
            </span>
          </div>
        </div>
      </div>

      <span
        class="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-pill border transition-colors"
        :class="selected ? 'border-primary bg-primary text-surface' : 'border-ink-muted bg-surface'"
        aria-hidden="true"
      >
        <Check v-if="selected" class="h-3.5 w-3.5" :stroke-width="2.5" />
      </span>
    </div>

    <div class="flex flex-wrap items-baseline justify-between gap-2 pt-1">
      <div class="flex items-baseline gap-1 tabular-price">
        <strong class="text-lg font-bold text-ink">
          {{ formatNumber(activePrice) }}
        </strong>
        <span class="text-xs font-medium text-ink-secondary">
          {{ currencySymbol(locale) }} / {{ locale === 'ar' ? (material.unit_ar || material.unit) : material.unit }}
        </span>
      </div>

      <PriceBadge
        v-if="material.change_30d !== undefined"
        :change-pct="material.change_30d"
      />
    </div>

    <div class="flex items-center justify-between gap-2 border-t border-border/70 pt-2.5">
      <EditedPriceBadge
        v-if="override?.is_overridden"
        :original-price="override.original_price"
        :used-price="override.used_price"
      />
      <FreshnessLabel
        v-else
        :fetched-at="material.fetched_at"
        short
      />

      <button
        v-if="editable"
        type="button"
        :aria-label="`${$t('common.edit')} ${displayTitle}`"
        class="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-border bg-surface text-ink-secondary transition-colors hover:border-primary hover:text-primary shadow-subtle"
        @click.stop="emit('edit-price', material)"
      >
        <Pencil class="h-4 w-4" :stroke-width="1.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
