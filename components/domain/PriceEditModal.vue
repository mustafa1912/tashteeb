<script setup>
import { AlertTriangle, RotateCcw, TrendingUp } from 'lucide-vue-next'
import { checkPriceDeviation } from '~/utils/calc/engine.js'
import { getSparklineSeries } from '~/utils/calc/history.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  material: {
    type: Object,
    default: null
  },
  currentOverride: {
    type: Object,
    default: null // { used_price, reason }
  },
  purchasedQty: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['close', 'save', 'reset'])
const { locale } = useI18n()

const inputPrice = ref('')
const reason = ref('')
const confirmedExtreme = ref(false)

watch(
  () => [props.open, props.material, props.currentOverride],
  () => {
    if (!props.open || !props.material) return
    const initial = props.currentOverride?.used_price ?? props.material.market_base_price ?? props.material.price
    inputPrice.value = initial
    reason.value = props.currentOverride?.reason || ''
    confirmedExtreme.value = false
  },
  { immediate: true }
)

const marketPrice = computed(() =>
  Number(props.material?.market_base_price ?? props.material?.price) || 0
)

const numericInput = computed(() => Number(inputPrice.value) || 0)

const deviation = computed(() => checkPriceDeviation(marketPrice.value, numericInput.value))

const unitCoverage = computed(() => {
  if (!props.material) return 1
  if (props.material.calc_mode === 'paint_buckets') return 1
  return Number(props.material.coverage_per_unit) || 1
})

const totalImpactEgp = computed(() => {
  if (!props.material || numericInput.value <= 0) return 0
  const oldUnitPackPrice = Math.round(marketPrice.value * unitCoverage.value)
  const newUnitPackPrice = Math.round(numericInput.value * unitCoverage.value)
  return (newUnitPackPrice - oldUnitPackPrice) * (props.purchasedQty || 1)
})

const sparklineValues = computed(() => {
  if (!props.material) return []
  return getSparklineSeries(props.material, 12)
})

const displayName = computed(() => {
  if (!props.material) return ''
  return locale.value === 'ar'
    ? props.material.label_ar || props.material.label_en
    : props.material.label_en
})

const displayUnit = computed(() => {
  if (!props.material) return ''
  return locale.value === 'ar'
    ? props.material.unit_ar || props.material.unit
    : props.material.unit
})

function handleSave() {
  if (numericInput.value <= 0) return
  if (deviation.value.hasWarning && !confirmedExtreme.value) {
    confirmedExtreme.value = true
    return
  }
  emit('save', {
    slug: props.material.slug,
    used_price: Math.round(numericInput.value),
    reason: reason.value.trim()
  })
}

function handleReset() {
  if (!props.material) return
  emit('reset', props.material.slug)
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="locale === 'ar' ? 'تعديل سعر الخامة يدوياً' : 'Override market price'"
    :description="displayName"
    @close="emit('close')"
  >
    <div v-if="material" class="space-y-4">
      <!-- Market reference card -->
      <div class="rounded-card border border-border bg-sand/60 p-3.5 flex items-center justify-between gap-3">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'متوسط سعر السوق اليوم' : 'Current Egyptian market avg' }}
          </p>
          <p class="tabular-price text-lg font-bold text-ink">
            {{ formatNumber(marketPrice) }}
            <span class="text-xs font-medium text-ink-secondary">
              {{ currencySymbol(locale) }} / {{ displayUnit }}
            </span>
          </p>
          <FreshnessLabel :fetched-at="material.fetched_at" short />
        </div>

        <div class="flex flex-col items-end gap-1">
          <SparklineChart :values="sparklineValues" :width="96" :height="30" />
          <span class="text-xs text-ink-secondary tabular-price">
            {{ locale === 'ar' ? 'النطاق المعتاد:' : 'Typical:' }}
            {{ formatNumber(material.min_price || marketPrice * 0.9) }}–{{ formatNumber(material.max_price || marketPrice * 1.12) }}
          </span>
        </div>
      </div>

      <!-- Custom price input -->
      <BaseInput
        v-model="inputPrice"
        type="number"
        :min="1"
        :label="locale === 'ar' ? 'سعرك الفعلي من المورد أو المعرض' : 'Your supplier / showroom price'"
        :suffix="`${currencySymbol(locale)} / ${displayUnit}`"
        @update:model-value="confirmedExtreme = false"
      />

      <!-- Live diff & impact strip -->
      <div
        v-if="numericInput > 0 && numericInput !== marketPrice"
        class="rounded-control border border-border bg-surface p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
      >
        <div class="flex items-center gap-2">
          <TrendingUp class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <span class="font-medium text-ink-secondary">
            {{ locale === 'ar' ? 'الفرق عن السوق:' : 'Difference vs market:' }}
          </span>
          <span
            class="tabular-price rounded-pill px-2 py-0.5 font-semibold"
            :class="deviation.absDiff > 0 ? 'bg-warning-tint text-ink' : 'bg-success-tint text-success'"
          >
            {{ deviation.absDiff > 0 ? `+${formatNumber(deviation.absDiff)}` : formatNumber(deviation.absDiff) }}
            {{ currencySymbol(locale) }}
            ({{ deviation.pctDiff > 0 ? `+${deviation.pctDiff}%` : `${deviation.pctDiff}%` }})
          </span>
        </div>

        <div v-if="purchasedQty > 0" class="tabular-price font-semibold text-ink">
          {{ locale === 'ar' ? 'الأثر على الإجمالي:' : 'Total impact:' }}
          <span :class="totalImpactEgp > 0 ? 'text-accent' : 'text-success'">
            {{ totalImpactEgp > 0 ? `+${formatCurrency(totalImpactEgp, locale)}` : formatCurrency(totalImpactEgp, locale) }}
          </span>
        </div>
      </div>

      <!-- Optional note/reason -->
      <BaseInput
        v-model="reason"
        type="text"
        :label="locale === 'ar' ? 'سبب التعديل / اسم المعرض (اختياري)' : 'Supplier or note (optional)'"
        :placeholder="locale === 'ar' ? 'مثال: عرض سعر خاص من معرض السلاب' : 'e.g. Confirmed showroom quote from El Sallab'"
      />

      <!-- Extreme price warning (<50% or >200%) -->
      <div
        v-if="deviation.hasWarning && numericInput > 0"
        role="alert"
        class="rounded-card border border-warning bg-warning-tint p-3.5 flex items-start gap-3"
      >
        <AlertTriangle class="h-5 w-5 text-warning shrink-0 mt-0.5" :stroke-width="1.5" />
        <div class="space-y-1 text-xs">
          <p class="font-bold text-ink">
            {{
              deviation.isExtremeLow
                ? (locale === 'ar' ? 'السعر أقل من 50% من متوسط السوق' : 'Price is less than 50% of market average')
                : (locale === 'ar' ? 'السعر أعلى من 200% من متوسط السوق' : 'Price is over 200% of market average')
            }}
          </p>
          <p class="text-ink-secondary leading-relaxed">
            {{
              locale === 'ar'
                ? 'تأكد من أن السعر لنفس الوحدة (مثلاً للمتر المربع وليس للكرتونة). اضغط "تطبيق على أي حال" للتأكيد.'
                : 'Please double-check you entered the price per unit shown above. Click "Apply anyway" to confirm.'
            }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <button
          v-if="currentOverride?.is_overridden || currentOverride?.used_price"
          type="button"
          class="inline-flex min-h-touch items-center gap-1.5 px-2 text-xs font-semibold text-primary hover:underline"
          @click="handleReset"
        >
          <RotateCcw class="h-3.5 w-3.5" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'استعادة سعر السوق' : 'Reset to market price' }}</span>
        </button>
        <span v-else />

        <div class="flex items-center gap-2">
          <BaseButton
            v-if="deviation.hasWarning && !confirmedExtreme"
            variant="secondary"
            size="sm"
            @click="inputPrice = marketPrice"
          >
            {{ locale === 'ar' ? 'تصحيح السعر' : 'Fix price' }}
          </BaseButton>
          <BaseButton variant="secondary" size="sm" @click="emit('close')">
            {{ locale === 'ar' ? 'إلغاء' : 'Cancel' }}
          </BaseButton>
          <BaseButton
            :variant="deviation.hasWarning ? 'accent' : 'primary'"
            size="sm"
            :disabled="numericInput <= 0"
            @click="handleSave"
          >
            {{
              deviation.hasWarning && !confirmedExtreme
                ? (locale === 'ar' ? 'تطبيق على أي حال' : 'Apply anyway')
                : (locale === 'ar' ? 'حفظ السعر' : 'Apply price')
            }}
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
