<script setup>
import { Check, Hammer, ShieldAlert } from 'lucide-vue-next'
import { EXTRAS_CATALOG, getGovernorateFactor } from '~/utils/calc/config.js'

const wizardStore = useWizardStore()
const { locale } = useI18n()

const govFactor = computed(() => getGovernorateFactor(wizardStore.apartment.governorate))

const extraOptions = computed(() =>
  EXTRAS_CATALOG.map((ext) => {
    const qty = ext.qtyFromApartment(wizardStore.apartment)
    const matCost = qty * Math.round(ext.unit_price * govFactor.value)
    const labCost = wizardStore.includeLabour ? qty * Math.round(ext.labour_price * govFactor.value) : 0
    return {
      ...ext,
      qty,
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
      <p class="kicker">{{ locale === 'ar' ? 'الخطوة 4 من 5' : 'STEP 4 OF 5' }}</p>
      <h2 class="text-2xl font-bold text-ink">
        {{ locale === 'ar' ? 'الإضافات، المصنعيات واحتياطي الطوارئ' : 'Optional extras, labour & contingency' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'أضف البنود التكميلية مثل تأسيس التكييفات أو المطبخ الجاهز، واضبط نسبة احتياطي الطوارئ.'
            : 'Include common finishing add-ons, set your safety reserve (10–15% recommended), and toggle workmanship.'
        }}
      </p>
    </div>

    <!-- Optional Extras Checkboxes -->
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
            ? 'border-2 border-primary bg-primary-tint/35 shadow-sm'
            : 'border-border bg-surface hover:bg-sand/40'
        "
        @click="wizardStore.toggleExtra(ext.key)"
      >
        <div class="flex items-start gap-3 min-w-0">
          <span
            class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition-colors"
            :class="ext.selected ? 'border-primary bg-primary text-surface' : 'border-ink-muted bg-surface'"
          >
            <Check v-if="ext.selected" class="h-3.5 w-3.5" :stroke-width="2.2" />
          </span>
          <div class="space-y-0.5 min-w-0">
            <p class="text-sm sm:text-base font-semibold text-ink">
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
    <div class="rounded-card border border-border bg-sand/70 p-5 space-y-3">
      <div class="flex items-center justify-between gap-2">
        <label for="contingency-slider" class="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldAlert class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'احتياطي الطوارئ وفروق الأسعار' : 'Contingency safety reserve' }}</span>
        </label>
        <span class="tabular-price text-sm font-bold text-primary">
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
        class="w-full h-2 rounded-pill accent-primary cursor-pointer"
      >

      <div class="flex items-center justify-between text-xs text-ink-secondary tabular-price">
        <span>10% ({{ locale === 'ar' ? 'حد أدنى موصى به' : 'Minimum buffer' }})</span>
        <span>12% ({{ locale === 'ar' ? 'متوازن' : 'Standard' }})</span>
        <span>15% ({{ locale === 'ar' ? 'أمان مرتفع' : 'Extra cushion' }})</span>
      </div>
    </div>

    <!-- Separate Labour / Workmanship Toggle -->
    <button
      type="button"
      role="switch"
      :aria-checked="wizardStore.includeLabour"
      class="w-full flex items-center justify-between gap-4 rounded-card border border-border bg-surface p-4 text-start hover:bg-sand/30 transition-colors"
      @click="wizardStore.includeLabour = !wizardStore.includeLabour"
    >
      <div class="flex items-start gap-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
          <Hammer class="h-5 w-5" :stroke-width="1.5" />
        </span>
        <div>
          <p class="text-sm sm:text-base font-semibold text-ink">
            {{ locale === 'ar' ? 'تضمين تكلفة المصنعيات والتركيب' : 'Include labour & workmanship costs' }}
          </p>
          <p class="text-xs text-ink-secondary">
            {{
              locale === 'ar'
                ? 'افصلها إذا كنت تريد تسعير الخامات فقط (التوريد بدون مصنعيات).'
                : 'Turn off if you want a materials-only supply estimate.'
            }}
          </p>
        </div>
      </div>

      <span
        dir="ltr"
        class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors px-0.5"
        :class="wizardStore.includeLabour ? 'bg-primary' : 'bg-ink-muted/50'"
      >
        <span
          class="inline-block h-5 w-5 rounded-pill bg-surface shadow transition-transform"
          :class="wizardStore.includeLabour ? 'translate-x-5' : 'translate-x-0'"
        />
      </span>
    </button>
  </div>
</template>
