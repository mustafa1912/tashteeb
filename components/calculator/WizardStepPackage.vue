<script setup>
import { Check } from 'lucide-vue-next'
import { PACKAGES } from '~/utils/calc/config.js'
import { calculateEstimate } from '~/utils/calc/engine.js'

const wizardStore = useWizardStore()
const marketStore = useMarketStore()
const { locale } = useI18n()

const packageOptions = computed(() => {
  const photos = {
    economy: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=400&q=75',
    standard: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=75',
    super_lux: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=75'
  }

  return ['economy', 'standard', 'super_lux'].map((key) => {
    const meta = PACKAGES[key]
    const preview = calculateEstimate({
      apartment: wizardStore.apartment,
      packageKey: key,
      extras: wizardStore.extras,
      contingencyPct: wizardStore.contingencyPct,
      includeLabour: wizardStore.includeLabour,
      materialsCatalog: marketStore.materials
    })

    return {
      key,
      photo: photos[key],
      title: locale.value === 'ar' ? meta.label_ar : meta.label_en,
      badge: key === 'standard' ? (locale.value === 'ar' ? meta.badge_ar : meta.badge_en) : '',
      desc: locale.value === 'ar' ? meta.desc_ar : meta.desc_en,
      costPerSqm: preview.costPerSqm,
      total: preview.grandTotal
    }
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1.5">
      <p class="kicker">{{ locale === 'ar' ? 'الخطوة 2 من 5' : 'STEP 2 OF 5' }}</p>
      <h2 class="text-2xl font-bold text-ink">
        {{ locale === 'ar' ? 'اختر مستوى التشطيب الأساسي' : 'Choose your finishing baseline' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'اختيار الباقة يضبط الخامات الافتراضية لكل بند — وفي الخطوة التالية يمكنك تغيير أي خامة أو تعديل سعرها بحرية.'
            : 'Selecting a level pre-fills sensible Egyptian materials for every room. You can swap any material in Step 3.'
        }}
      </p>
    </div>

    <div class="space-y-4" role="radiogroup" aria-label="Finishing level">
      <RadioCard
        v-for="pkg in packageOptions"
        :key="pkg.key"
        :selected="wizardStore.packageKey === pkg.key"
        :badge="pkg.badge"
        :title="pkg.title"
        :description="pkg.desc"
        @select="wizardStore.selectPackage(pkg.key)"
      >
        <template #media>
          <img
            :src="pkg.photo"
            :alt="pkg.title"
            width="112"
            height="96"
            loading="lazy"
            class="hidden sm:block h-24 w-28 shrink-0 rounded-control object-cover border border-border bg-sand"
          >
        </template>

        <template #price>
          <div class="text-end tabular-price">
            <span class="text-lg font-extrabold text-primary">
              {{ formatCurrency(pkg.total, locale) }}
            </span>
            <span class="block text-xs text-ink-secondary">
              ~{{ formatNumber(pkg.costPerSqm) }} {{ currencySymbol(locale) }}/{{ locale === 'ar' ? 'م²' : 'm²' }}
            </span>
          </div>
        </template>

        <div class="mt-2.5 flex items-center gap-2 text-xs text-success font-medium">
          <Check class="h-3.5 w-3.5 shrink-0" :stroke-width="2" />
          <span>
            {{
              locale === 'ar'
                ? 'شامل الهالك العملي والمصنعيات في جميع البنود الثمانية'
                : 'Includes practical waste & workmanship across all 8 categories'
            }}
          </span>
        </div>
      </RadioCard>
    </div>
  </div>
</template>
