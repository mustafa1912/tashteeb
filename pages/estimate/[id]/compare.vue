<script setup>
import {
  ArrowLeft,
  ArrowLeftRight,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  TrendingUp
} from 'lucide-vue-next'
import { PACKAGES } from '~/utils/calc/config.js'
import { comparePackages, compareEstimates } from '~/utils/calc/compare.js'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const estimatesStore = useEstimatesStore()
const marketStore = useMarketStore()
const wizardStore = useWizardStore()
const uiStore = useUiStore()

const id = computed(() => String(route.params.id || 'ts-2408'))

onMounted(() => {
  estimatesStore.hydrate()
  marketStore.hydrate()
})

const compareMode = ref(route.query.with ? 'estimates' : 'packages') // 'packages' | 'estimates'
const pkgA = ref('standard')
const pkgB = ref('super_lux')
const secondEstimateId = ref(String(route.query.with || 'ts-2409'))

const recordA = computed(() => estimatesStore.getById(id.value) || estimatesStore.estimates[0])

watch(
  recordA,
  (rec) => {
    if (rec && !route.query.with) {
      pkgA.value = rec.input.packageKey || 'standard'
      pkgB.value = pkgA.value === 'super_lux' ? 'standard' : 'super_lux'
    }
  },
  { immediate: true }
)

const recordB = computed(() => {
  const candidate = estimatesStore.getById(secondEstimateId.value)
  if (candidate && candidate.id !== recordA.value?.id) return candidate
  return estimatesStore.estimates.find(e => e.id !== recordA.value?.id) || recordA.value
})

const packageOptions = computed(() =>
  Object.values(PACKAGES).map(p => ({
    value: p.key,
    label: locale.value === 'ar' ? p.label_ar : p.label_en
  }))
)

const estimateOptions = computed(() =>
  estimatesStore.estimates
    .filter(e => e.id !== recordA.value?.id)
    .map(e => ({
      value: e.id,
      label: `${e.refCode} · ${locale.value === 'ar' ? e.title_ar || e.title : e.title}`
    }))
)

const comparison = computed(() => {
  if (!recordA.value) return null

  if (compareMode.value === 'estimates' && recordB.value) {
    return compareEstimates(
      {
        ...recordA.value.computed,
        title: recordA.value.title,
        title_ar: recordA.value.title_ar
      },
      {
        ...recordB.value.computed,
        title: recordB.value.title,
        title_ar: recordB.value.title_ar
      },
      locale.value
    )
  }

  return comparePackages({
    apartment: recordA.value.input.apartment,
    packageA: pkgA.value,
    packageB: pkgB.value,
    overrides: recordA.value.input.overrides,
    extras: recordA.value.input.extras,
    contingencyPct: recordA.value.input.contingencyPct,
    includeLabour: recordA.value.input.includeLabour,
    materialsCatalog: marketStore.materials,
    locale: locale.value
  })
})

const labelA = computed(() => {
  if (compareMode.value === 'estimates' && recordA.value) {
    return locale.value === 'ar' ? recordA.value.title_ar || recordA.value.title : recordA.value.title
  }
  const p = PACKAGES[pkgA.value]
  return p ? (locale.value === 'ar' ? p.label_ar : p.label_en) : pkgA.value
})

const labelB = computed(() => {
  if (compareMode.value === 'estimates' && recordB.value) {
    return locale.value === 'ar' ? recordB.value.title_ar || recordB.value.title : recordB.value.title
  }
  const p = PACKAGES[pkgB.value]
  return p ? (locale.value === 'ar' ? p.label_ar : p.label_en) : pkgB.value
})

const pdfHref = computed(() => {
  if (!recordA.value) return '#'
  if (compareMode.value === 'estimates' && recordB.value) {
    return `/api/pdf/compare/${recordA.value.id}?with=${recordB.value.id}&lang=${locale.value}`
  }
  return `/api/pdf/compare/${recordA.value.id}?pkgA=${pkgA.value}&pkgB=${pkgB.value}&lang=${locale.value}`
})

function buildSegments(estObj) {
  return [
    { key: 'mat', label: locale.value === 'ar' ? 'الخامات' : 'Materials', value: estObj.materialsTotal, colorIndex: 0 },
    { key: 'lab', label: locale.value === 'ar' ? 'المصنعيات' : 'Labour', value: estObj.labourTotal, colorIndex: 1 },
    { key: 'con', label: locale.value === 'ar' ? 'الطوارئ' : 'Contingency', value: estObj.contingencyAmount, colorIndex: 2 }
  ]
}

function applyOptionBInWizard() {
  if (!recordA.value) return
  if (compareMode.value === 'estimates' && recordB.value) {
    navigateTo(localePath(`/estimate/${recordB.value.id}`))
    return
  }
  wizardStore.loadFromInput({
    id: recordA.value.id,
    title: recordA.value.title,
    input: {
      ...recordA.value.input,
      packageKey: pkgB.value,
      selections: {}
    }
  })
  uiStore.showToast({
    title: locale.value === 'ar' ? `تم التبديل إلى باقة ${labelB.value}` : `Switched package to ${labelB.value}`,
    type: 'success'
  })
  navigateTo(localePath('/calculator'))
}

function handlePrint() {
  if (import.meta.client) window.print()
}

useHead(() => ({
  title: locale.value === 'ar' ? 'مقارنة الباقات والمقايسات — تشطيب' : 'Compare finishing options — Tashteeb'
}))
</script>

<template>
  <div v-if="recordA && comparison" class="shell py-8 sm:py-10 space-y-6">
    <!-- Back link -->
    <div>
      <NuxtLink
        :to="localePath(`/estimate/${recordA.id}`)"
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline no-print"
      >
        <ArrowLeft class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
        <span>
          {{ locale === 'ar' ? 'العودة إلى الفاتورة' : 'Back to invoice' }}
          (<bdi>{{ recordA.refCode }}</bdi>)
        </span>
      </NuxtLink>
    </div>

    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">
          {{ locale === 'ar' ? 'مقارنة تكلفة التشطيب جنباً إلى جنب' : 'Side-by-side finishing comparison' }}
        </h1>
        <p class="text-sm text-ink-secondary">
          {{
            locale === 'ar'
              ? 'اكتشف أين يتركز فارق التكلفة بالضبط بين مستويات التشطيب أو المقايسات المحفوظة.'
              : 'See exact EGP & percentage differences per category on the same apartment dimensions.'
          }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 no-print">
        <BaseButton variant="secondary" size="sm" @click="handlePrint">
          <Printer class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'طباعة' : 'Print' }}</span>
        </BaseButton>
        <a
          :href="pdfHref"
          target="_blank"
          class="inline-flex min-h-touch items-center justify-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:bg-sand transition-colors"
        >
          <Download class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تحميل مقارنة PDF' : 'Export PDF' }}</span>
        </a>
      </div>
    </div>

    <!-- Mode Switcher + Option Selectors -->
    <section class="rounded-card border border-border bg-surface p-5 shadow-card space-y-4 no-print">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex rounded-control bg-sand p-1 border border-border">
          <button
            type="button"
            class="min-h-[38px] px-4 rounded-control text-xs sm:text-sm font-semibold transition-colors"
            :class="compareMode === 'packages' ? 'bg-surface text-primary shadow-card' : 'text-ink-secondary hover:text-ink'"
            @click="compareMode = 'packages'"
          >
            {{ locale === 'ar' ? 'مقارنة باقتين لنفس الشقة' : 'Compare 2 packages' }}
          </button>
          <button
            v-if="estimatesStore.estimates.length >= 2"
            type="button"
            class="min-h-[38px] px-4 rounded-control text-xs sm:text-sm font-semibold transition-colors"
            :class="compareMode === 'estimates' ? 'bg-surface text-primary shadow-card' : 'text-ink-secondary hover:text-ink'"
            @click="compareMode = 'estimates'"
          >
            {{ locale === 'ar' ? 'مقارنة مقايساتين محفوظتين' : 'Compare 2 saved estimates' }}
          </button>
        </div>

        <span class="text-xs text-ink-secondary tabular-price">
          {{ recordA.input.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }} ·
          {{ recordA.input.apartment.bedrooms }} {{ locale === 'ar' ? 'غرف' : 'BR' }}
        </span>
      </div>

      <div v-if="compareMode === 'packages'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          v-model="pkgA"
          :label="locale === 'ar' ? 'الباقة الأولى (الأساس)' : 'Baseline package (Option A)'"
          :options="packageOptions"
        />
        <SelectField
          v-model="pkgB"
          :label="locale === 'ar' ? 'الباقة الثانية (المقارنة)' : 'Compared package (Option B)'"
          :options="packageOptions"
        />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <span class="block text-sm font-semibold text-ink">
            {{ locale === 'ar' ? 'المقايسة الأولى' : 'Estimate A' }}
          </span>
          <div class="min-h-touch rounded-control border border-border bg-sand/60 px-3.5 py-2.5 text-sm font-semibold text-ink">
            <bdi>{{ recordA.refCode }}</bdi> · {{ labelA }}
          </div>
        </div>

        <SelectField
          v-model="secondEstimateId"
          :label="locale === 'ar' ? 'المقايسة الثانية' : 'Estimate B'"
          :options="estimateOptions"
        />
      </div>
    </section>

    <!-- Key Insight Sentence Banner -->
    <section class="rounded-card bg-primary-deep text-surface p-6 shadow-elevated flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div class="space-y-2">
        <span class="inline-flex items-center gap-1.5 rounded-pill bg-surface/10 border border-surface/20 px-3 py-1 text-xs font-bold text-accent-dark">
          <Sparkles class="h-3.5 w-3.5" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'ملخص الفارق الرئيسي' : 'KEY COST INSIGHT' }}</span>
        </span>
        <p class="text-lg sm:text-xl font-bold text-surface leading-snug">
          {{ comparison.summarySentence }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-6 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-surface/15">
        <div>
          <span class="block text-xs text-surface/75">{{ locale === 'ar' ? 'فارق الإجمالي' : 'Total difference' }}</span>
          <strong class="tabular-price text-xl font-extrabold text-accent-dark">
            <bdi>{{ comparison.totalDiffEgp >= 0 ? '+' : '' }}{{ formatCurrency(comparison.totalDiffEgp, locale) }}</bdi>
          </strong>
        </div>
        <div>
          <span class="block text-xs text-surface/75">{{ locale === 'ar' ? 'فارق المتر المربع' : 'Per m² diff' }}</span>
          <strong class="tabular-price text-xl font-extrabold text-surface">
            <bdi>{{ comparison.costPerSqmDiff >= 0 ? '+' : '' }}{{ formatCurrency(comparison.costPerSqmDiff, locale) }}</bdi>
          </strong>
        </div>
      </div>
    </section>

    <!-- Dual Summary Cards + StackedBar -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="rounded-card border border-border bg-surface p-5 sm:p-6 shadow-card space-y-4">
        <div class="flex items-baseline justify-between gap-2">
          <div>
            <span class="text-xs font-bold uppercase text-ink-secondary">Option A</span>
            <h2 class="text-xl font-bold text-ink">{{ labelA }}</h2>
          </div>
          <div class="text-end">
            <p class="text-2xl font-extrabold text-primary tabular-price">
              {{ formatCurrency(comparison.estA.grandTotal, locale) }}
            </p>
            <p class="text-xs text-ink-secondary tabular-price">
              {{ formatCurrency(comparison.estA.costPerSqm, locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
            </p>
          </div>
        </div>

        <StackedBar :segments="buildSegments(comparison.estA)" />
      </div>

      <div class="rounded-card border-2 border-primary bg-surface p-5 sm:p-6 shadow-card space-y-4">
        <div class="flex items-baseline justify-between gap-2">
          <div>
            <span class="text-xs font-bold uppercase text-primary">Option B</span>
            <h2 class="text-xl font-bold text-ink">{{ labelB }}</h2>
          </div>
          <div class="text-end">
            <p class="text-2xl font-extrabold text-primary tabular-price">
              {{ formatCurrency(comparison.estB.grandTotal, locale) }}
            </p>
            <p class="text-xs text-ink-secondary tabular-price">
              {{ formatCurrency(comparison.estB.costPerSqm, locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
            </p>
          </div>
        </div>

        <StackedBar :segments="buildSegments(comparison.estB)" />
      </div>
    </div>

    <!-- Category-by-Category Comparison Table -->
    <section class="rounded-card border border-border bg-surface overflow-hidden shadow-card">
      <div class="p-5 border-b border-border flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <ArrowLeftRight class="h-5 w-5 text-primary" :stroke-width="1.5" />
          <h2 class="text-lg font-bold text-ink">
            {{ locale === 'ar' ? 'تفاصيل الفروق حسب البند' : 'Category-by-category breakdown' }}
          </h2>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-sand/75 border-b border-border text-xs uppercase text-ink-secondary font-bold">
              <th class="py-3 px-4 text-start">{{ locale === 'ar' ? 'البند' : 'Category' }}</th>
              <th class="py-3 px-4 text-start">{{ labelA }}</th>
              <th class="py-3 px-4 text-start">{{ labelB }}</th>
              <th class="py-3 px-4 text-end">{{ locale === 'ar' ? 'الفارق (ج.م و %)' : 'Diff (EGP & %)' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="row in comparison.categoryDiffs"
              :key="row.key"
              :class="comparison.biggestGap?.key === row.key ? 'bg-accent-tint/45' : 'hover:bg-sand/30'"
            >
              <td class="py-3.5 px-4 align-top">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-ink">{{ locale === 'ar' ? row.label_ar : row.label_en }}</span>
                  <span
                    v-if="comparison.biggestGap?.key === row.key && row.diffEgp !== 0"
                    class="inline-flex items-center gap-1 rounded-pill bg-accent text-surface px-2.5 py-0.5 text-xs font-bold"
                  >
                    <TrendingUp class="h-3 w-3" :stroke-width="2" />
                    <span>{{ locale === 'ar' ? 'الفارق الأكبر' : 'BIGGEST GAP' }}</span>
                  </span>
                </div>
              </td>

              <td class="py-3.5 px-4 align-top">
                <p class="font-bold text-ink tabular-price">{{ formatCurrency(row.subtotalA, locale) }}</p>
                <p v-if="row.itemA" class="text-xs text-ink-secondary mt-0.5 max-w-[230px]">
                  {{ locale === 'ar' ? row.itemA.label_ar : row.itemA.label_en }}
                </p>
              </td>

              <td class="py-3.5 px-4 align-top">
                <p class="font-bold text-ink tabular-price">{{ formatCurrency(row.subtotalB, locale) }}</p>
                <p v-if="row.itemB" class="text-xs text-ink-secondary mt-0.5 max-w-[230px]">
                  {{ locale === 'ar' ? row.itemB.label_ar : row.itemB.label_en }}
                </p>
              </td>

              <td class="py-3.5 px-4 align-top text-end whitespace-nowrap">
                <p
                  class="font-extrabold tabular-price"
                  :class="row.diffEgp > 0 ? 'text-danger' : row.diffEgp < 0 ? 'text-success' : 'text-ink-secondary'"
                >
                  <bdi>{{ row.diffEgp > 0 ? '+' : '' }}{{ formatCurrency(row.diffEgp, locale) }}</bdi>
                </p>
                <p class="text-xs text-ink-secondary tabular-price">
                  <bdi>({{ row.diffPct > 0 ? '+' : '' }}{{ row.diffPct }}%)</bdi>
                </p>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-sand/80 border-t-2 border-border font-extrabold">
            <tr>
              <td class="py-3.5 px-4 text-ink">{{ locale === 'ar' ? 'الإجمالي التقديري الكلي' : 'Estimated Grand Total' }}</td>
              <td class="py-3.5 px-4 tabular-price text-ink">{{ formatCurrency(comparison.estA.grandTotal, locale) }}</td>
              <td class="py-3.5 px-4 tabular-price text-primary">{{ formatCurrency(comparison.estB.grandTotal, locale) }}</td>
              <td class="py-3.5 px-4 text-end tabular-price" :class="comparison.totalDiffEgp > 0 ? 'text-danger' : 'text-success'">
                <bdi>{{ comparison.totalDiffEgp > 0 ? '+' : '' }}{{ formatCurrency(comparison.totalDiffEgp, locale) }} ({{ comparison.totalDiffPct > 0 ? '+' : '' }}{{ comparison.totalDiffPct }}%)</bdi>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- Bottom Switch Action -->
    <div class="flex justify-end no-print">
      <BaseButton variant="primary" @click="applyOptionBInWizard">
        <CheckCircle2 class="h-4 w-4" :stroke-width="1.5" />
        <span>
          {{
            compareMode === 'estimates'
              ? (locale === 'ar' ? `فتح المقايسة الثانية (${labelB})` : `Open ${labelB}`)
              : (locale === 'ar' ? `اعتماد باقة ${labelB} في الحاسبة` : `Customize with ${labelB} in Calculator`)
          }}
        </span>
      </BaseButton>
    </div>
  </div>
</template>
