<script setup>
import { calculateContractorQuotation } from '~/utils/calc/contractor.js'

definePageMeta({
  layout: 'print'
})

const route = useRoute()
const { locale } = useI18n()
const id = computed(() => String(route.params.id || 'ts-2408'))

const { data } = await useAsyncData(`print-quote-${id.value}`, () =>
  $fetch(`/api/estimates/${id.value}`)
)

const record = computed(() => data.value?.record || null)

const companyName = computed(() =>
  String(
    route.query.company ||
      (locale.value === 'ar'
        ? 'المصري للتشطيبات والعمارة الداخلية'
        : 'El Masry Finishing & Architecture')
  )
)
const engineerName = computed(() => String(route.query.engineer || 'Eng. Karim El Masry'))
const companyPhone = computed(() => String(route.query.phone || '+20 100 482 9100'))
const taxCard = computed(() => String(route.query.tax || '418-902-771'))
const clientName = computed(() => String(route.query.client || 'Mahmoud Adel'))
const unitAddress = computed(() => String(route.query.address || 'Hyde Park, New Cairo · Apt 304 (120 m²)'))
const quoteRef = computed(() => String(route.query.ref || '#Q-1042'))

const overheadPct = computed(() => Number(route.query.overhead ?? 7))
const markupPct = computed(() => Number(route.query.markup ?? 18))
const vatPct = computed(() => Number(route.query.vat ?? 0))

const defaultCustomItems = [
  {
    id: 'cust-1',
    label_en: '3D interior renders & site engineering supervision',
    label_ar: 'تصميم ثلاثي الأبعاد وإشراف هندسي كامل على التنفيذ',
    unit: 'package',
    unit_ar: 'مقطوعية',
    qty: 1,
    unit_price: 18000
  }
]

const resolvedCustomItems = computed(() => {
  if (route.query.customJson) {
    try {
      const parsed = JSON.parse(String(route.query.customJson))
      if (Array.isArray(parsed)) return parsed
    } catch {
      // fallback to default
    }
  }
  return defaultCustomItems
})

const quotation = computed(() => {
  if (!record.value?.computed) return null
  return calculateContractorQuotation({
    baseEstimate: record.value.computed,
    overheadPct: overheadPct.value,
    markupPct: markupPct.value,
    vatPct: vatPct.value,
    customItems: resolvedCustomItems.value
  })
})

useHead(() => ({
  title: `${quoteRef.value} — Client Quotation PDF`
}))
</script>

<template>
  <div v-if="record && quotation" class="max-w-[790px] mx-auto px-6 py-6 space-y-5 text-ink bg-surface">
    <!-- Contractor Branded Header -->
    <header class="flex items-start justify-between gap-4 border-b-2 border-primary pb-4">
      <div class="space-y-1">
        <p class="text-xs font-bold uppercase tracking-wider text-primary">
          {{ locale === 'ar' ? 'عرض سعر تشطيبات متكاملة' : 'CLIENT FINISHING QUOTATION' }}
        </p>
        <h1 class="text-2xl font-extrabold text-ink">{{ companyName }}</h1>
        <p class="text-xs text-ink-secondary">
          {{ engineerName }} · <bdi>{{ companyPhone }}</bdi> ·
          {{ locale === 'ar' ? 'بطاقة ضريبية:' : 'Tax ID:' }} <bdi>{{ taxCard }}</bdi>
        </p>
      </div>

      <div class="text-end space-y-1">
        <span class="inline-block rounded-control bg-primary-deep text-surface px-3 py-1 text-sm font-bold tabular-price">
          <bdi>{{ quoteRef }}</bdi>
        </span>
        <p class="text-xs text-ink-secondary">
          {{ locale === 'ar' ? 'صالح لمدة 14 يوماً' : 'Valid for 14 days' }}
        </p>
      </div>
    </header>

    <!-- Client Info Strip -->
    <section class="rounded-card border border-border bg-sand/60 p-4 grid grid-cols-2 gap-4 text-xs avoid-break">
      <div>
        <span class="text-ink-secondary block">{{ locale === 'ar' ? 'مقدم إلى العميل:' : 'Prepared for client:' }}</span>
        <strong class="text-sm text-ink">{{ clientName }}</strong>
        <p class="text-ink-secondary mt-0.5">{{ unitAddress }}</p>
      </div>
      <div class="text-end">
        <span class="text-ink-secondary block">{{ locale === 'ar' ? 'إجمالي قيمة التعاقد:' : 'Total Quotation Value:' }}</span>
        <strong class="tabular-price text-xl font-extrabold text-primary">
          {{ formatCurrency(quotation.clientGrandTotal, locale) }}
        </strong>
        <p class="text-ink-secondary tabular-price">
          {{ formatCurrency(quotation.clientCostPerSqm, locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
        </p>
      </div>
    </section>

    <!-- Client-Facing Scope of Works (Margin Baked In, Raw Costs Never Shown) -->
    <table class="w-full text-xs border border-border">
      <thead>
        <tr class="bg-sand border-b border-border font-bold">
          <th class="py-2.5 px-3 text-start">{{ locale === 'ar' ? 'بند الأعمال والمواصفات الفنية' : 'Scope of Works & Technical Specification' }}</th>
          <th class="py-2.5 px-3 text-end">{{ locale === 'ar' ? 'الكمية / الوحدة' : 'Qty / Unit' }}</th>
          <th class="py-2.5 px-3 text-end">{{ locale === 'ar' ? 'قيمة البند شاملة التوريد والتنفيذ' : 'Turnkey Supply & Install' }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr v-for="cat in quotation.clientCategories" :key="cat.key">
          <td class="py-2.5 px-3">
            <p class="font-bold text-ink">{{ locale === 'ar' ? cat.label_ar : cat.label_en }}</p>
            <p class="text-ink-secondary">{{ locale === 'ar' ? cat.scope_ar : cat.scope_en }}</p>
          </td>
          <td class="py-2.5 px-3 text-end tabular-price whitespace-nowrap">
            {{ formatNumber(cat.qty) }} {{ locale === 'ar' ? cat.sale_unit_ar : cat.sale_unit }}
          </td>
          <td class="py-2.5 px-3 text-end tabular-price whitespace-nowrap font-bold">
            {{ formatCurrency(cat.client_subtotal, locale) }}
          </td>
        </tr>

        <tr v-for="cust in quotation.customItems" :key="cust.id" class="bg-primary-tint/25">
          <td class="py-2.5 px-3">
            <p class="font-bold text-ink">{{ locale === 'ar' ? cust.label_ar : cust.label_en }}</p>
          </td>
          <td class="py-2.5 px-3 text-end tabular-price whitespace-nowrap">
            {{ cust.qty }} {{ locale === 'ar' ? cust.unit_ar : cust.unit }}
          </td>
          <td class="py-2.5 px-3 text-end tabular-price whitespace-nowrap font-bold">
            {{ formatCurrency(cust.client_subtotal, locale) }}
          </td>
        </tr>
      </tbody>
      <tfoot class="bg-sand/70 border-t-2 border-border font-bold">
        <tr v-if="quotation.vatPct > 0">
          <td colspan="2" class="py-2 px-3 text-end">VAT ({{ quotation.vatPct }}%)</td>
          <td class="py-2 px-3 text-end tabular-price">{{ formatCurrency(quotation.vatAmount, locale) }}</td>
        </tr>
        <tr class="bg-primary-deep text-surface text-sm font-extrabold">
          <td colspan="2" class="py-3 px-3 text-end">
            {{ locale === 'ar' ? 'الإجمالي النهائي لعرض السعر' : 'TOTAL CLIENT QUOTATION' }}
          </td>
          <td class="py-3 px-3 text-end tabular-price">{{ formatCurrency(quotation.clientGrandTotal, locale) }}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Terms & Sign-off -->
    <section class="rounded-card border border-border p-4 space-y-2 text-xs avoid-break">
      <p>
        <strong>{{ locale === 'ar' ? 'دفعات التعاقد:' : 'Payment milestones:' }}</strong>
        {{
          locale === 'ar'
            ? '40% دفعة تعاقد وتأسيس · 35% سيراميك وأسقف · 20% دهانات ونجارة · 5% عند التسليم النهائي.'
            : '40% mobilization & rough-in · 35% tiling & ceilings · 20% paint & carpentry · 5% final handover.'
        }}
      </p>
      <p>
        <strong>{{ locale === 'ar' ? 'الضمان الهندسي:' : 'Warranty:' }}</strong>
        {{
          locale === 'ar'
            ? 'ضمان هندسي لمدة 24 شهراً على كافة أعمال التأسيس والعزل والتشطيبات.'
            : '24-month workmanship warranty on all concealed MEP & waterproofing works.'
        }}
      </p>

      <div class="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-border">
        <div>
          <p class="text-ink-secondary">{{ locale === 'ar' ? 'توقيع المكتب الهندسي / المقاول' : 'Contractor signature' }}</p>
          <div class="h-8 border-b border-dashed border-ink-secondary mt-2" />
        </div>
        <div>
          <p class="text-ink-secondary">{{ locale === 'ar' ? 'اعتماد العميل' : 'Client acceptance' }}</p>
          <div class="h-8 border-b border-dashed border-ink-secondary mt-2" />
        </div>
      </div>
    </section>
  </div>
</template>
