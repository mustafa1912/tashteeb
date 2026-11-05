<script setup>
import { CheckCircle2, Info, Pencil } from 'lucide-vue-next'
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
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1.5">
      <p class="kicker">{{ locale === 'ar' ? 'الخطوة 5 من 5' : 'STEP 5 OF 5' }}</p>
      <h2 class="text-2xl font-bold text-ink">
        {{ locale === 'ar' ? 'مراجعة المقايسة قبل إصدار الفاتورة' : 'Review your specifications' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'راجع اختياراتك أو اضغط "تعديل" للرجوع لأي خطوة بدون فقدان أي بيانات.'
            : 'Verify your apartment details and chosen finishes. Going back never loses your progress.'
        }}
      </p>
    </div>

    <!-- Summary Sections -->
    <div class="divide-y divide-border rounded-card border border-border bg-surface overflow-hidden">
      <!-- Apartment row -->
      <div class="p-4 flex items-center justify-between gap-4">
        <div class="space-y-0.5">
          <p class="text-xs font-bold uppercase text-primary">
            {{ locale === 'ar' ? 'تفاصيل الوحدة' : 'Apartment' }}
          </p>
          <p class="text-sm sm:text-base font-semibold text-ink">
            {{ wizardStore.projectTitle }} · {{ wizardStore.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }} · {{ govLabel }}
          </p>
          <p class="text-xs text-ink-secondary">
            {{ wizardStore.apartment.bedrooms }} {{ locale === 'ar' ? 'غرف' : 'bed' }} ·
            {{ wizardStore.apartment.bathrooms }} {{ locale === 'ar' ? 'حمام' : 'bath' }} ·
            {{ wizardStore.apartment.kitchens }} {{ locale === 'ar' ? 'مطبخ' : 'kitchen' }} ·
            {{ wizardStore.apartment.reception }} {{ locale === 'ar' ? 'ريسبشن' : 'reception' }}
          </p>
        </div>
        <button
          type="button"
          class="min-h-touch px-3 text-xs font-bold text-primary hover:underline shrink-0"
          @click="emit('jump-step', 0)"
        >
          {{ t('common.edit') }}
        </button>
      </div>

      <!-- Package row -->
      <div class="p-4 flex items-center justify-between gap-4">
        <div class="space-y-0.5">
          <p class="text-xs font-bold uppercase text-primary">
            {{ locale === 'ar' ? 'مستوى التشطيب' : 'Finishing level' }}
          </p>
          <p class="text-sm sm:text-base font-semibold text-ink">{{ pkgLabel }}</p>
        </div>
        <button
          type="button"
          class="min-h-touch px-3 text-xs font-bold text-primary hover:underline shrink-0"
          @click="emit('jump-step', 1)"
        >
          {{ t('common.edit') }}
        </button>
      </div>

      <!-- 8 Category selections -->
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold uppercase text-primary">
            {{ locale === 'ar' ? 'الخامات المختارة والكميات' : 'Selected materials & purchase quantities' }}
          </p>
          <button
            type="button"
            class="text-xs font-bold text-primary hover:underline"
            @click="emit('jump-step', 2)"
          >
            {{ locale === 'ar' ? 'تعديل الخامات' : 'Edit materials' }}
          </button>
        </div>

        <div class="divide-y divide-border/70">
          <div
            v-for="item in est.items.filter(i => i.category !== 'extras')"
            :key="item.id"
            class="py-2.5 flex items-center justify-between gap-3 text-sm"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-ink-secondary">
                  {{ locale === 'ar' ? item.category_label_ar : item.category_label_en }}:
                </span>
                <button
                  type="button"
                  class="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  @click="emit('jump-category', item.category)"
                >
                  <Pencil class="h-3 w-3" :stroke-width="1.5" />
                  <span>{{ t('common.edit') }}</span>
                </button>
              </div>
              <p class="font-medium text-ink truncate">
                {{ locale === 'ar' ? item.label_ar : item.label_en }}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-0.5">
                <span class="text-xs text-ink-secondary tabular-price">
                  {{ item.purchased_qty }} {{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}
                </span>
                <EditedPriceBadge
                  v-if="item.override"
                  :original-price="item.override.original_price"
                  :used-price="item.override.used_price"
                />
              </div>
            </div>
            <span class="tabular-price font-semibold text-ink shrink-0">
              {{ formatCurrency(item.subtotal, locale) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Extras & Reserve -->
      <div class="p-4 flex items-center justify-between gap-4">
        <div class="space-y-0.5">
          <p class="text-xs font-bold uppercase text-primary">
            {{ locale === 'ar' ? 'الإضافات والطوارئ' : 'Extras, labour & contingency' }}
          </p>
          <p class="text-sm text-ink">
            {{ wizardStore.extras.length }} {{ locale === 'ar' ? 'إضافات مختارة' : 'extras selected' }} ·
            {{ locale === 'ar' ? 'طوارئ' : 'Contingency' }} {{ Math.round(wizardStore.contingencyPct * 100) }}% ·
            {{ wizardStore.includeLabour ? (locale === 'ar' ? 'شامل المصنعيات' : 'Labour included') : (locale === 'ar' ? 'توريد خامات فقط' : 'Materials only') }}
          </p>
        </div>
        <button
          type="button"
          class="min-h-touch px-3 text-xs font-bold text-primary hover:underline shrink-0"
          @click="emit('jump-step', 3)"
        >
          {{ t('common.edit') }}
        </button>
      </div>
    </div>

    <!-- Honest Market Disclaimer -->
    <div class="rounded-card border border-info/30 bg-info-tint/60 p-4 flex items-start gap-3 text-xs text-ink-secondary">
      <Info class="h-4 w-4 text-info shrink-0 mt-0.5" :stroke-width="1.5" />
      <p class="leading-relaxed">
        {{ t('brand.estimateDisclaimer') }}
      </p>
    </div>

    <div class="pt-1">
      <BaseButton variant="accent" size="lg" block @click="emit('calculate')">
        <CheckCircle2 class="h-5 w-5" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'احسب المقايسة وأصدر الفاتورة التفصيلية' : 'Calculate my itemized estimate' }}</span>
      </BaseButton>
    </div>
  </div>
</template>
