<script setup>
import { PACKAGES } from '~/utils/calc/config.js'
import { comparePackages, compareEstimates } from '~/utils/calc/compare.js'

definePageMeta({
  layout: 'print'
})

const route = useRoute()
const { locale } = useI18n()
const id = computed(() => String(route.params.id || 'ts-2408'))
const withId = computed(() => (route.query.with ? String(route.query.with) : ''))
const pkgA = computed(() => String(route.query.pkgA || 'standard'))
const pkgB = computed(() => String(route.query.pkgB || 'super_lux'))

const { data } = await useAsyncData(`print-cmp-${id.value}-${withId.value}`, async () => {
  const first = await $fetch(`/api/estimates/${id.value}`)
  let second = null
  if (withId.value) {
    try {
      second = await $fetch(`/api/estimates/${withId.value}`)
    } catch {
      second = null
    }
  }
  return { first, second }
})

const recordA = computed(() => data.value?.first?.record || null)
const recordB = computed(() => data.value?.second?.record || null)

const comparison = computed(() => {
  if (!recordA.value) return null
  if (recordB.value) {
    return compareEstimates(
      { ...recordA.value.computed, title: recordA.value.title, title_ar: recordA.value.title_ar },
      { ...recordB.value.computed, title: recordB.value.title, title_ar: recordB.value.title_ar },
      locale.value
    )
  }
  return comparePackages({
    apartment: recordA.value.input.apartment,
    packageA: pkgA.value,
    packageB: pkgB.value,
    extras: recordA.value.input.extras,
    contingencyPct: recordA.value.input.contingencyPct,
    includeLabour: recordA.value.input.includeLabour,
    locale: locale.value
  })
})

const labelA = computed(() =>
  recordB.value
    ? (locale.value === 'ar' ? recordA.value.title_ar || recordA.value.title : recordA.value.title)
    : (locale.value === 'ar' ? PACKAGES[pkgA.value]?.label_ar : PACKAGES[pkgA.value]?.label_en)
)

const labelB = computed(() =>
  recordB.value
    ? (locale.value === 'ar' ? recordB.value.title_ar || recordB.value.title : recordB.value.title)
    : (locale.value === 'ar' ? PACKAGES[pkgB.value]?.label_ar : PACKAGES[pkgB.value]?.label_en)
)
</script>

<template>
  <div v-if="recordA && comparison" class="max-w-[790px] mx-auto px-6 py-6 space-y-5 text-ink bg-surface">
    <header class="border-b-2 border-primary pb-4 flex items-start justify-between gap-4">
      <div>
        <BaseLogo />
        <h1 class="text-xl font-extrabold text-ink pt-1">
          {{ locale === 'ar' ? 'مقارنة تكلفة التشطيب:' : 'Finishing Comparison:' }}
          {{ labelA }} vs {{ labelB }}
        </h1>
      </div>
      <span class="text-xs font-bold text-primary"><bdi>{{ recordA.refCode }}</bdi></span>
    </header>

    <div class="rounded-card bg-primary-tint border border-primary/25 p-4 text-sm font-bold text-ink">
      {{ comparison.summarySentence }}
    </div>

    <table class="w-full text-xs border border-border">
      <thead>
        <tr class="bg-sand border-b border-border font-bold">
          <th class="py-2.5 px-3 text-start">{{ locale === 'ar' ? 'البند' : 'Category' }}</th>
          <th class="py-2.5 px-3 text-end">{{ labelA }}</th>
          <th class="py-2.5 px-3 text-end">{{ labelB }}</th>
          <th class="py-2.5 px-3 text-end">{{ locale === 'ar' ? 'الفارق' : 'Difference' }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr
          v-for="row in comparison.categoryDiffs"
          :key="row.key"
          :class="comparison.biggestGap?.key === row.key ? 'bg-accent-tint/50' : ''"
        >
          <td class="py-2 px-3 font-semibold">
            {{ locale === 'ar' ? row.label_ar : row.label_en }}
            <span v-if="comparison.biggestGap?.key === row.key" class="ms-1 text-accent font-bold">★</span>
          </td>
          <td class="py-2 px-3 text-end tabular-price">{{ formatCurrency(row.subtotalA, locale) }}</td>
          <td class="py-2 px-3 text-end tabular-price">{{ formatCurrency(row.subtotalB, locale) }}</td>
          <td class="py-2 px-3 text-end tabular-price font-bold">
            <bdi>{{ row.diffEgp >= 0 ? '+' : '' }}{{ formatCurrency(row.diffEgp, locale) }} ({{ row.diffPct >= 0 ? '+' : '' }}{{ row.diffPct }}%)</bdi>
          </td>
        </tr>
      </tbody>
      <tfoot class="bg-primary-deep text-surface font-extrabold text-sm">
        <tr>
          <td class="py-2.5 px-3">{{ locale === 'ar' ? 'الإجمالي الكلي' : 'Grand Total' }}</td>
          <td class="py-2.5 px-3 text-end tabular-price">{{ formatCurrency(comparison.estA.grandTotal, locale) }}</td>
          <td class="py-2.5 px-3 text-end tabular-price">{{ formatCurrency(comparison.estB.grandTotal, locale) }}</td>
          <td class="py-2.5 px-3 text-end tabular-price">
            <bdi>{{ comparison.totalDiffEgp >= 0 ? '+' : '' }}{{ formatCurrency(comparison.totalDiffEgp, locale) }}</bdi>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
