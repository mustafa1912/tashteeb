<script setup>
import { CheckCircle2, Info, Pencil, Ruler, Layers, MapPin, Calculator, Sparkles } from 'lucide-vue-next'
import { PACKAGES, GOVERNORATES } from '~/utils/calc/config.js'

const emit = defineEmits(['jump-step', 'jump-category', 'calculate'])
const wizardStore = useWizardStore()
const { t, locale } = useI18n()

const est = computed(() => wizardStore.liveEstimate)

const govLabel = computed(() => {
  const g = GOVERNORATES.find(item => item.code === wizardStore.apartment.governorate)
  if (!g) return wizardStore.apartment.governorate
  return locale.value === 'ar' ? g.label_ar : g.label_en
})

const pkgLabel = computed(() => {
  const p = PACKAGES[wizardStore.packageKey]
  if (!p) return wizardStore.packageKey
  return locale.value === 'ar' ? p.label_ar : p.label_en
})

// Designer presentation board items
const materialBoardItems = computed(() =>
  est.value.items
    .filter(i => i.category !== 'extras')
    .map(i => ({
      category: i.category,
      categoryLabel: locale.value === 'ar' ? i.category_label_ar : i.category_label_en,
      label: locale.value === 'ar' ? i.label_ar : i.label_en,
      brand: i.brand,
      src: i.image_url,
      color: i.swatch_color,
      purchasedQty: i.purchased_qty,
      saleUnit: locale.value === 'ar' ? i.sale_unit_ar : i.sale_unit,
      subtotal: i.subtotal,
      override: i.override
    }))
)
</script>

<template>
  <div class="space-y-7">
    <div class="space-y-1.5">
      <p class="kicker text-primary">{{ locale === 'ar' ? 'الخطوة 5 من 5' : 'STEP 5 OF 5' }}</p>
      <h2 class="text-2xl font-display font-bold text-ink">
        {{ locale === 'ar' ? 'لوحة المراجعة الشاملة قبل إصدار الفاتورة' : 'Sample board & final review' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'تم تجميع مواصفات شقتك وعينات الخامات المختارة في لوحة تصميم واحدة قبل الانتقال للفاتورة الرسمية.'
            : 'Your apartment specs and selected swatches presented on a unified designer sample board.'
        }}
      </p>
    </div>

    <!-- Designer Sample Board Card -->
    <div class="rounded-card border-2 border-primary/40 bg-surface shadow-elevated overflow-hidden">
      <!-- Board Header -->
      <div class="bg-primary px-6 py-4 text-surface flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <Sparkles class="h-5 w-5 text-saffron-300" :stroke-width="2" />
          <h3 class="text-base font-bold font-display tracking-wide">
            {{ locale === 'ar' ? 'لوحة عينات التشطيب المقترحة' : 'Finishing Specification Board' }}
          </h3>
        </div>
        <span class="rounded-pill bg-surface/20 px-3 py-1 text-xs font-semibold text-surface">
          {{ pkgLabel }} · {{ wizardStore.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }}
        </span>
      </div>

      <!-- Quick Summary Stats Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-border border-b border-border bg-sand/40">
        <div class="p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'المساحة والغرف' : 'Area & layout' }}</p>
            <p class="text-sm font-bold text-ink tabular-price">
              {{ wizardStore.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }} · {{ wizardStore.apartment.bedrooms }} {{ locale === 'ar' ? 'غرف' : 'bed' }}
            </p>
          </div>
          <button
            type="button"
            class="text-xs text-primary font-bold hover:underline"
            @click="emit('jump-step', 0)"
          >
            {{ t('common.edit') }}
          </button>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'المحافظة' : 'Governorate' }}</p>
            <p class="text-sm font-bold text-ink">{{ govLabel }}</p>
          </div>
          <button
            type="button"
            class="text-xs text-primary font-bold hover:underline"
            @click="emit('jump-step', 0)"
          >
            {{ t('common.edit') }}
          </button>
        </div>

        <div class="p-4 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'مستوى التشطيب' : 'Finishing level' }}</p>
            <p class="text-sm font-bold text-ink">{{ pkgLabel }}</p>
          </div>
          <button
            type="button"
            class="text-xs text-primary font-bold hover:underline"
            @click="emit('jump-step', 1)"
          >
            {{ t('common.edit') }}
          </button>
        </div>
      </div>

      <!-- Visual Material Swatch Grid -->
      <div class="p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-primary">
            {{ locale === 'ar' ? 'الخامات والكميات المختارة' : 'Selected Materials & Quantities' }}
          </p>
          <button
            type="button"
            class="text-xs font-bold text-primary hover:underline"
            @click="emit('jump-step', 2)"
          >
            {{ locale === 'ar' ? 'تعديل الخامات' : 'Edit materials' }}
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            v-for="item in materialBoardItems"
            :key="item.category"
            class="rounded-control border border-border/80 bg-sand/30 p-3.5 flex items-start gap-3 hover:border-primary/50 transition-colors"
          >
            <TextureSwatch
              :src="item.src"
              :color="item.color"
              size="sm"
              :zoomable="false"
              :alt="item.label"
              class="shrink-0 shadow-subtle border border-border/80"
            />

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[11px] font-bold uppercase text-primary truncate">
                  {{ item.categoryLabel }}
                </span>
                <button
                  type="button"
                  class="text-[11px] text-ink-secondary hover:text-primary shrink-0"
                  @click="emit('jump-category', item.category)"
                >
                  <Pencil class="h-3 w-3" :stroke-width="1.5" />
                </button>
              </div>

              <p class="font-semibold text-xs sm:text-sm text-ink truncate mt-0.5">
                {{ item.label }}
              </p>

              <div class="flex items-center justify-between gap-2 mt-1 text-xs">
                <span class="text-ink-secondary tabular-price text-[11px]">
                  {{ item.purchasedQty }} {{ item.saleUnit }}
                </span>
                <span class="tabular-price font-bold text-ink">
                  {{ formatCurrency(item.subtotal, locale) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grand Total Footer -->
      <div class="bg-primary-tint/50 border-t border-border p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-primary">
            {{ locale === 'ar' ? 'الإجمالي التقديري للتشطيب' : 'ESTIMATED GRAND TOTAL' }}
          </span>
          <p class="tabular-price text-2xl sm:text-3xl font-display font-extrabold text-ink mt-0.5">
            {{ formatCurrency(est.grandTotal, locale) }}
          </p>
          <p class="tabular-price text-xs text-ink-secondary">
            ~{{ formatNumber(est.costPerSqm) }} {{ currencySymbol(locale) }}/{{ locale === 'ar' ? 'م²' : 'm²' }} · ~{{ est.timeline.totalWeeks }} {{ locale === 'ar' ? 'أسبوع' : 'weeks' }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-control bg-accent px-6 py-3 text-sm font-bold text-surface shadow-md hover:bg-accent-hover transition-colors min-h-touch"
          @click="emit('calculate')"
        >
          <span>{{ locale === 'ar' ? 'إصدار الفاتورة وجدول الكميات' : 'Generate Full Itemized Invoice' }}</span>
          <Calculator class="h-4 w-4" :stroke-width="2" />
        </button>
      </div>
    </div>
  </div>
</template>
