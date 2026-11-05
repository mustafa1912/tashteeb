<script setup>
import { Check, ShieldAlert, Wind, Sparkles, Lightbulb, VolumeX } from 'lucide-vue-next'
import { EXTRAS_CATALOG, getGovernorateFactor } from '~/utils/calc/config.js'

const wizardStore = useWizardStore()
const { locale } = useI18n()

const govFactor = computed(() => getGovernorateFactor(wizardStore.apartment.governorate))

const extraIcons = {
  ac_prep: Wind,
  gypsum_board_simple: Lightbulb,
  smart_prep: Sparkles,
  sound_isolation: VolumeX
}

const extraOptions = computed(() =>
  EXTRAS_CATALOG.map((ext) => {
    const qty = ext.qtyFromApartment(wizardStore.apartment)
    const matCost = qty * Math.round(ext.unit_price * govFactor.value)
    const labCost = wizardStore.includeLabour ? qty * Math.round(ext.labour_price * govFactor.value) : 0
    return {
      ...ext,
      qty,
      icon: extraIcons[ext.key] || Sparkles,
      estimatedCost: matCost + labCost,
      selected: wizardStore.extras.includes(ext.key)
    }
  })
)

const contingencyPctInt = computed({
  get: () => Math.round(wizardStore.contingencyPct * 100),
  set: (val) => {
    wizardStore.contingencyPct = Math.max(0.05, Math.min(0.25, Number(val) / 100))
  }
})
</script>

<template>
  <div class="space-y-7">
    <div class="space-y-1.5">
      <p class="kicker text-primary">{{ locale === 'ar' ? 'الخطوة 4 من 5' : 'STEP 4 OF 5' }}</p>
      <h2 class="text-2xl font-display font-bold text-ink">
        {{ locale === 'ar' ? 'الإضافات، المصنعيات واحتياطي الطوارئ' : 'Optional extras, labour & contingency' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'أضف البنود التكميلية مثل تأسيس التكييفات أو الإضاءة المخفية، واضبط نسبة احتياطي الطوارئ الموصى بها.'
            : 'Include practical finishing add-ons, set your safety reserve (10–15% recommended), and toggle workmanship.'
        }}
      </p>
    </div>

    <!-- Optional Extras Visual Cards -->
    <div class="space-y-3">
      <button
        v-for="ext in extraOptions"
        :key="ext.key"
        type="button"
        role="checkbox"
        :aria-checked="ext.selected"
        class="w-full flex items-start justify-between gap-4 rounded-card border p-4 text-start transition-all"
        :class="
          ext.selected
            ? 'border-2 border-primary bg-primary-tint/35 shadow-card'
            : 'border-border bg-surface hover:bg-sand/40 hover:border-border/90'
        "
        @click="wizardStore.toggleExtra(ext.key)"
      >
        <div class="flex items-start gap-3.5 min-w-0">
          <!-- Checkbox box -->
          <span
            class="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-control border transition-colors"
            :class="ext.selected ? 'border-primary bg-primary text-surface' : 'border-ink-muted bg-surface'"
          >
            <Check v-if="ext.selected" class="h-3.5 w-3.5" :stroke-width="2.5" />
          </span>

          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary-tint text-primary shadow-subtle">
            <component :is="ext.icon" class="h-5 w-5" :stroke-width="1.8" />
          </span>

          <div class="space-y-0.5 min-w-0">
            <p class="text-sm sm:text-base font-bold text-ink">
              {{ locale === 'ar' ? ext.label_ar : ext.label_en }}
            </p>
            <p class="text-xs text-ink-secondary leading-relaxed">
              {{ locale === 'ar' ? ext.desc_ar : ext.desc_en }}
            </p>
          </div>
        </div>

        <div class="text-end shrink-0 tabular-price">
          <p class="text-sm sm:text-base font-bold text-ink">
            +{{ formatCurrency(ext.estimatedCost, locale) }}
          </p>
          <p class="text-xs text-ink-secondary">
            {{ ext.qty }} {{ locale === 'ar' ? ext.sale_unit_ar : ext.sale_unit }}
          </p>
        </div>
      </button>
    </div>

    <!-- Contingency Reserve Slider (10% - 15% core range) -->
    <div class="rounded-card border border-border bg-cream p-5 space-y-3 shadow-subtle">
      <div class="flex items-center justify-between gap-2">
        <label for="contingency-slider" class="flex items-center gap-2 text-sm font-bold text-ink">
          <ShieldAlert class="h-4 w-4 text-accent" :stroke-width="2" />
          <span>{{ locale === 'ar' ? 'احتياطي الطوارئ وفروق الأسعار في الموقع' : 'Contingency safety reserve' }}</span>
        </label>
        <span class="tabular-price text-sm font-bold text-primary px-2.5 py-0.5 rounded-control bg-primary-tint">
          {{ contingencyPctInt }}% ({{ formatCurrency(wizardStore.liveEstimate.contingencyAmount, locale) }})
        </span>
      </div>

      <input
        id="contingency-slider"
        v-model="contingencyPctInt"
        type="range"
        min="10"
        max="15"
        step="1"
        class="w-full h-2 rounded-pill accent-primary cursor-pointer bg-sand"
      >

      <div class="flex items-center justify-between text-xs text-ink-secondary tabular-price">
        <span>10% ({{ locale === 'ar' ? 'الحد الأدنى' : 'Minimum buffer' }})</span>
        <span>12% ({{ locale === 'ar' ? 'الموصى به' : 'Recommended' }})</span>
        <span>15% ({{ locale === 'ar' ? 'أمان أعلى' : 'Extra cushion' }})</span>
      </div>
    </div>
  </div>
</template>
