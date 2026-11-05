<script setup>
import { PACKAGES, GOVERNORATES } from '~/utils/calc/config.js'

definePageMeta({
  layout: 'print'
})

const route = useRoute()
const { locale } = useI18n()
const id = computed(() => String(route.params.id || 'ts-2408'))

const { data } = await useAsyncData(`print-est-${id.value}`, () =>
  $fetch(`/api/estimates/${id.value}`)
)

const record = computed(() => data.value?.record || null)
const est = computed(() => record.value?.computed || null)
const qrDataUrl = computed(() => data.value?.qrDataUrl || '')

const pkgLabel = computed(() => {
  if (!est.value) return ''
  const p = PACKAGES[est.value.packageKey]
  return p ? (locale.value === 'ar' ? p.label_ar : p.label_en) : est.value.packageKey
})

const govLabel = computed(() => {
  if (!est.value) return ''
  const g = GOVERNORATES.find(i => i.code === est.value.apartment.governorate)
  return g ? (locale.value === 'ar' ? g.label_ar : g.label_en) : est.value.apartment.governorate
})

useHead(() => ({
  title: record.value ? `${record.value.refCode} — Tashteeb Estimate PDF` : 'Tashteeb Estimate'
}))
</script>

<template>
  <div v-if="record && est" class="max-w-[790px] mx-auto px-6 py-6 space-y-5 text-ink bg-surface">
    <!-- Branded Letterhead + QR Code -->
    <header class="flex items-start justify-between gap-4 border-b-2 border-primary pb-4">
      <div class="space-y-1.5">
        <BaseLogo />
        <h1 class="text-xl font-extrabold text-ink pt-1">
          {{ locale === 'ar' ? record.title_ar || record.title : record.title }}
          <span class="text-primary font-bold ms-1.5"><bdi>{{ record.refCode }}</bdi></span>
        </h1>
        <p class="text-xs text-ink-secondary">
          {{ locale === 'ar' ? 'تاريخ الإصدار:' : 'Generated:' }}
          {{ formatDateDisplay(record.updatedAt, locale) }} ·
          {{ locale === 'ar' ? 'أسعار السوق المصري محدثة اليوم 06:00' : 'Egyptian market prices updated 06:00' }}
        </p>
      </div>

      <div class="flex items-center gap-3 text-end">
        <div class="text-xs space-y-0.5">
          <p class="font-bold text-primary uppercase">
            {{ locale === 'ar' ? 'نسخة تفاعلية عبر الرابط' : 'Scan to open live copy' }}
          </p>
          <p class="text-ink-secondary font-mono text-xs">
            <bdi>/s/{{ record.shareToken }}</bdi>
          </p>
        </div>
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QR code to shared estimate"
          class="h-16 w-16 rounded border border-border p-1 bg-surface"
        >
      </div>
    </header>

    <!-- Summary Strip + Grand Total Highlight -->
    <section class="grid grid-cols-12 gap-4 items-stretch avoid-break">
      <div class="col-span-7 rounded-card border border-border bg-sand/50 p-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span class="text-ink-secondary block">{{ locale === 'ar' ? 'المساحة والتقسيم' : 'Unit area & rooms' }}</span>
          <strong class="tabular-price text-sm text-ink">
            {{ est.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }}
            ({{
              locale === 'ar'
                ? `${est.apartment.bedrooms} غرف / ${est.apartment.bathrooms} حمام`
                : `${est.apartment.bedrooms}BR / ${est.apartment.bathrooms}BA`
            }})
          </strong>
        </div>
        <div>
          <span class="text-ink-secondary block">{{ locale === 'ar' ? 'مستوى التشطيب' : 'Finishing package' }}</span>
          <strong class="text-sm text-ink">{{ pkgLabel }}</strong>
        </div>
        <div>
          <span class="text-ink-secondary block">{{ locale === 'ar' ? 'المحافظة' : 'Governorate' }}</span>
          <strong class="text-sm text-ink">{{ govLabel }} ({{ est.governorateFactor.toFixed(2) }}×)</strong>
        </div>
        <div>
          <span class="text-ink-secondary block">{{ locale === 'ar' ? 'مدة التنفيذ التقديرية' : 'Estimated schedule' }}</span>
          <strong class="tabular-price text-sm text-ink">~{{ est.timeline.totalWeeks }} {{ locale === 'ar' ? 'أسبوع' : 'weeks' }}</strong>
        </div>
      </div>

      <div class="col-span-5 rounded-card bg-primary-deep text-surface p-4 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase text-accent-dark">
            {{ locale === 'ar' ? 'الإجمالي التقديري للتشطيب' : 'ESTIMATED GRAND TOTAL' }}
          </span>
          <p class="tabular-price text-2xl font-extrabold text-surface mt-0.5">
            {{ formatCurrency(est.grandTotal, locale) }}
          </p>
        </div>
        <div class="flex items-center justify-between text-xs text-surface/85 pt-2 border-t border-surface/15 tabular-price">
          <span>{{ locale === 'ar' ? 'سعر المتر:' : 'Per m²:' }} {{ formatCurrency(est.costPerSqm, locale) }}</span>
          <span>±8%: {{ formatCompactK(est.rangeMin) }}–{{ formatCompactK(est.rangeMax) }}</span>
        </div>
      </div>
    </section>

    <!-- Repeating Header Itemized BOQ Table -->
    <section>
      <table class="w-full text-xs border border-border">
        <thead>
          <tr class="bg-sand border-b border-border text-ink font-bold">
            <th class="py-2.5 px-3 text-start">{{ locale === 'ar' ? 'البند والخامة المختارة' : 'Category & Specification' }}</th>
            <th class="py-2.5 px-2 text-end">{{ locale === 'ar' ? 'كمية الشراء (بالهالك)' : 'Purchase Qty' }}</th>
            <th class="py-2.5 px-2 text-end">{{ locale === 'ar' ? 'سعر الوحدة' : 'Unit Price' }}</th>
            <th class="py-2.5 px-2 text-end">{{ locale === 'ar' ? 'المصنعية' : 'Labour' }}</th>
            <th class="py-2.5 px-3 text-end">{{ locale === 'ar' ? 'الإجمالي' : 'Subtotal' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <template v-for="cat in est.categories" :key="cat.key">
            <tr
              v-for="item in cat.items"
              :key="item.id"
              :class="item.override ? 'bg-warning-tint/45' : 'bg-surface'"
            >
              <td class="py-2 px-3">
                <p class="font-bold text-ink">
                  {{ locale === 'ar' ? cat.label_ar : cat.label_en }} —
                  <span class="font-medium">{{ locale === 'ar' ? item.label_ar : item.label_en }}</span>
                </p>
                <p v-if="item.override" class="text-xs font-semibold text-ink-secondary mt-0.5">
                  ✎
                  <bdi>
                    {{
                      locale === 'ar'
                        ? `تم تعديل السعر من ${formatCurrency(item.override.original_price, locale)} إلى ${formatCurrency(item.override.used_price, locale)}`
                        : `Price edited from ${formatCurrency(item.override.original_price, locale)} to ${formatCurrency(item.override.used_price, locale)}`
                    }}
                  </bdi>
                </p>
              </td>
              <td class="py-2 px-2 text-end tabular-price whitespace-nowrap">
                {{ formatNumber(item.purchased_qty) }} {{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}
                <span v-if="item.waste_pct > 0" class="block text-ink-secondary">
                  <bdi>(+{{ Math.round(item.waste_pct * 100) }}% {{ locale === 'ar' ? 'هالك' : 'waste' }})</bdi>
                </span>
              </td>
              <td class="py-2 px-2 text-end tabular-price whitespace-nowrap font-medium">
                {{ formatCurrency(item.unit_price, locale) }}
              </td>
              <td class="py-2 px-2 text-end tabular-price whitespace-nowrap">
                {{ formatCurrency(item.labour, locale) }}
              </td>
              <td class="py-2 px-3 text-end tabular-price whitespace-nowrap font-bold text-ink">
                {{ formatCurrency(item.subtotal, locale) }}
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot class="bg-sand/70 border-t-2 border-border font-semibold">
          <tr>
            <td colspan="4" class="py-2 px-3 text-end">{{ locale === 'ar' ? 'إجمالي الخامات (شامل الهالك)' : 'Materials subtotal (incl. waste)' }}</td>
            <td class="py-2 px-3 text-end tabular-price">{{ formatCurrency(est.materialsTotal, locale) }}</td>
          </tr>
          <tr>
            <td colspan="4" class="py-2 px-3 text-end">{{ locale === 'ar' ? 'إجمالي المصنعيات والتركيب' : 'Labour & workmanship subtotal' }}</td>
            <td class="py-2 px-3 text-end tabular-price">{{ formatCurrency(est.labourTotal, locale) }}</td>
          </tr>
          <tr>
            <td colspan="4" class="py-2 px-3 text-end">
              {{ locale === 'ar' ? 'احتياطي طوارئ' : 'Contingency reserve' }} ({{ Math.round(est.contingencyPct * 100) }}%)
            </td>
            <td class="py-2 px-3 text-end tabular-price">{{ formatCurrency(est.contingencyAmount, locale) }}</td>
          </tr>
          <tr class="bg-primary-tint text-primary font-extrabold text-sm">
            <td colspan="4" class="py-2.5 px-3 text-end">{{ locale === 'ar' ? 'الإجمالي الكلي التقديري' : 'Estimated Grand Total' }}</td>
            <td class="py-2.5 px-3 text-end tabular-price">{{ formatCurrency(est.grandTotal, locale) }}</td>
          </tr>
        </tfoot>
      </table>
    </section>

    <!-- Notes on Manually Edited Prices -->
    <section
      v-if="est.editedItems?.length"
      class="rounded-card border border-warning/50 bg-warning-tint/40 p-4 space-y-2 avoid-break"
    >
      <h2 class="text-xs font-bold uppercase text-ink">
        {{ locale === 'ar' ? 'ملاحظات الأسعار المعدلة يدوياً' : 'Notes on manually edited prices' }}
      </h2>
      <ul class="space-y-1 text-xs text-ink">
        <li v-for="ed in est.editedItems" :key="ed.id">
          • <strong>{{ locale === 'ar' ? ed.label_ar : ed.label_en }}:</strong>
          {{
            locale === 'ar'
              ? `تم تعديل سعر المرجع من ${formatCurrency(ed.override.original_price, locale)} إلى ${formatCurrency(ed.override.used_price, locale)}`
              : `Price edited from ${formatCurrency(ed.override.original_price, locale)} to ${formatCurrency(ed.override.used_price, locale)}`
          }}
          <span v-if="ed.override.reason" class="text-ink-secondary"> — "{{ ed.override.reason }}"</span>
        </li>
      </ul>
    </section>

    <!-- Simplified Print Gantt -->
    <section class="rounded-card border border-border p-4 space-y-2.5 avoid-break">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase text-ink">
          {{ locale === 'ar' ? 'الجدول الزمني التقديري للتنفيذ' : 'Estimated Construction Timeline' }}
        </h2>
        <span class="text-xs font-semibold text-primary tabular-price">
          {{ est.timeline.totalWeeks }} {{ locale === 'ar' ? 'أسبوع إجمالاً' : 'weeks total' }}
        </span>
      </div>

      <div class="space-y-1.5" dir="ltr">
        <div
          v-for="task in est.timeline.tasks"
          :key="task.key"
          class="grid grid-cols-12 items-center gap-2 text-xs"
        >
          <span class="col-span-4 truncate font-medium text-ink">
            {{ locale === 'ar' ? task.label_ar : task.label_en }}
          </span>
          <div class="col-span-6 h-3 rounded-pill bg-sand relative overflow-hidden">
            <div
              class="absolute top-0 bottom-0 rounded-pill bg-primary"
              :style="{
                left: `${((task.startWeek - 1) / est.timeline.totalWeeks) * 100}%`,
                width: `${((task.endWeek - task.startWeek + 1) / est.timeline.totalWeeks) * 100}%`
              }"
            />
          </div>
          <span class="col-span-2 text-end tabular-price text-ink-secondary">
            W{{ task.startWeek }}–W{{ task.endWeek }}
          </span>
        </div>
      </div>
    </section>

    <!-- Print Footer Disclaimer -->
    <footer class="border-t border-border pt-3 flex items-center justify-between gap-4 text-xs text-ink-secondary">
      <span>
        {{
          locale === 'ar'
            ? 'الأسعار مستمدة من بيانات السوق المصري. هذه المقايسة تقديرية وليست عرض سعر تعاقدي نهائي.'
            : 'Prices sourced from Egyptian market data. Estimates are not final quotations.'
        }}
      </span>
      <span class="font-semibold text-primary">tashteeb.eg</span>
    </footer>
  </div>
</template>
