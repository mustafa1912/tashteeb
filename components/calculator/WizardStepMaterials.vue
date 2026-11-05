<script setup>
import { CATEGORIES, getGovernorateFactor } from '~/utils/calc/config.js'

const props = defineProps({
  activeCategory: {
    type: String,
    default: 'floors'
  }
})

const emit = defineEmits(['update:activeCategory', 'edit-price'])
const wizardStore = useWizardStore()
const marketStore = useMarketStore()
const { locale } = useI18n()

const govFactor = computed(() => getGovernorateFactor(wizardStore.apartment.governorate))

const categoryTabs = computed(() =>
  CATEGORIES.map(c => ({
    key: c.key,
    label: locale.value === 'ar' ? c.label_ar : c.label_en
  }))
)

const categoryMaterials = computed(() =>
  marketStore.calculatorMaterials
    .filter(m => m.category === props.activeCategory)
    .map(m => ({
      ...m,
      price: Math.round(m.price * govFactor.value),
      market_base_price: Math.round(m.price * govFactor.value),
      min_price: Math.round((m.min_price || m.price * 0.9) * govFactor.value),
      max_price: Math.round((m.max_price || m.price * 1.12) * govFactor.value)
    }))
)

const activeCategoryLine = computed(() =>
  wizardStore.liveEstimate.items.find(i => i.category === props.activeCategory)
)

function resolveOverrideForCard(mat) {
  const ov = wizardStore.overrides[mat.slug]
  if (!ov || !ov.used_price) return null
  if (Math.round(Number(ov.used_price)) === mat.price) return null
  return {
    is_overridden: true,
    original_price: mat.price,
    used_price: Math.round(Number(ov.used_price)),
    reason: ov.reason || ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1.5">
      <p class="kicker">{{ locale === 'ar' ? 'الخطوة 3 من 5' : 'STEP 3 OF 5' }}</p>
      <h2 class="text-2xl font-bold text-ink">
        {{ locale === 'ar' ? 'تخصيص الخامات لكل بند' : 'Select materials per category' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'اختر الخامة المناسبة لكل بند أو اضغط على أيقونة القلم لتعديل السعر يدوياً حسب عرض المعرض لديك.'
            : 'Choose your preferred finish per category, or click the pencil icon on any card to enter your own supplier price.'
        }}
      </p>
    </div>

    <!-- Category Tabs -->
    <TabsBar
      :model-value="activeCategory"
      :tabs="categoryTabs"
      variant="underline"
      @update:model-value="emit('update:activeCategory', $event)"
    />

    <!-- Active Category Quantity Context -->
    <div
      v-if="activeCategoryLine"
      class="rounded-control border border-border bg-sand/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
    >
      <span class="text-ink-secondary">
        {{ locale === 'ar' ? 'الكمية المحسوبة لهذا البند (شاملة الهالك):' : 'Calculated purchase quantity (incl. waste):' }}
        <strong class="tabular-price text-ink ms-1">
          {{ activeCategoryLine.purchased_qty }}
          {{ locale === 'ar' ? activeCategoryLine.sale_unit_ar : activeCategoryLine.sale_unit }}
        </strong>
      </span>
      <span class="tabular-price font-semibold text-primary">
        {{ locale === 'ar' ? 'إجمالي البند الحالي:' : 'Category subtotal:' }}
        {{ formatCurrency(activeCategoryLine.subtotal, locale) }}
      </span>
    </div>

    <!-- Material Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" :aria-label="activeCategory">
      <MaterialCard
        v-for="mat in categoryMaterials"
        :key="mat.slug"
        :material="mat"
        :selected="wizardStore.selections[activeCategory] === mat.slug"
        :override="resolveOverrideForCard(mat)"
        @select="wizardStore.selectMaterial(activeCategory, mat.slug)"
        @edit-price="emit('edit-price', { material: mat, purchasedQty: activeCategoryLine?.purchased_qty || 1 })"
      />
    </div>
  </div>
</template>
