<script setup>
definePageMeta({
  layout: 'print'
})

const route = useRoute()
const { locale } = useI18n()
const id = computed(() => String(route.params.id || 'ts-2408'))

const { data } = await useAsyncData(`print-shop-${id.value}`, () =>
  $fetch(`/api/estimates/${id.value}`)
)

const record = computed(() => data.value?.record || null)
const est = computed(() => record.value?.computed || null)
const qrDataUrl = computed(() => data.value?.qrDataUrl || '')

useHead(() => ({
  title: record.value ? `${record.value.refCode} — Shopping List PDF` : 'Tashteeb Shopping List'
}))
</script>

<template>
  <div v-if="record && est" class="max-w-[790px] mx-auto px-6 py-6 space-y-5 text-ink bg-surface">
    <header class="flex items-start justify-between gap-4 border-b-2 border-primary pb-4">
      <div class="space-y-1">
        <BaseLogo />
        <h1 class="text-xl font-extrabold text-ink pt-1">
          {{ locale === 'ar' ? 'قائمة مشتريات الخامات — ' : 'Material Shopping Checklist — ' }}
          <span>{{ locale === 'ar' ? record.title_ar || record.title : record.title }}</span>
          <span class="text-primary ms-1.5"><bdi>{{ record.refCode }}</bdi></span>
        </h1>
        <p class="text-xs text-ink-secondary">
          {{
            locale === 'ar'
              ? 'الكميات مقربة لأعلى شاملة نسبة الهالك العملية للشراء المباشر من المعارض والتجار.'
              : 'All purchase quantities are rounded up (ceil) with practical site waste included.'
          }}
        </p>
      </div>

      <img
        v-if="qrDataUrl"
        :src="qrDataUrl"
        alt="QR code"
        class="h-16 w-16 rounded border border-border p-1 bg-surface"
      >
    </header>

    <table class="w-full text-xs border border-border">
      <thead>
        <tr class="bg-sand border-b border-border font-bold">
          <th class="py-2.5 px-2.5 text-center w-10">✓</th>
          <th class="py-2.5 px-3 text-start">{{ locale === 'ar' ? 'الخامة ونصيحة التوريد' : 'Material & Supplier Tip' }}</th>
          <th class="py-2.5 px-2 text-end">{{ locale === 'ar' ? 'صافي المساحة' : 'Net Needed' }}</th>
          <th class="py-2.5 px-2 text-end">{{ locale === 'ar' ? 'كمية الشراء' : 'Buy Qty (incl. waste)' }}</th>
          <th class="py-2.5 px-2 text-end">{{ locale === 'ar' ? 'سعر الوحدة' : 'Unit Price' }}</th>
          <th class="py-2.5 px-3 text-end">{{ locale === 'ar' ? 'إجمالي الخامة' : 'Material Est.' }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <template v-for="cat in est.categories" :key="cat.key">
          <tr v-for="item in cat.items" :key="item.id">
            <td class="py-2.5 px-2.5 text-center">
              <span class="inline-block h-4 w-4 rounded border border-ink-secondary" />
            </td>
            <td class="py-2.5 px-3">
              <p class="font-bold text-ink">
                [{{ locale === 'ar' ? cat.label_ar : cat.label_en }}]
                {{ locale === 'ar' ? item.label_ar : item.label_en }}
              </p>
              <p v-if="item.store_tip_en || item.store_tip_ar" class="text-ink-secondary mt-0.5">
                {{ locale === 'ar' ? item.store_tip_ar || item.store_tip_en : item.store_tip_en }}
              </p>
            </td>
            <td class="py-2.5 px-2 text-end tabular-price whitespace-nowrap text-ink-secondary">
              {{ formatNumber(item.needed_qty) }} {{ locale === 'ar' ? item.unit_ar : item.unit }}
            </td>
            <td class="py-2.5 px-2 text-end tabular-price whitespace-nowrap font-bold text-primary">
              {{ formatNumber(item.purchased_qty) }} {{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}
              <span v-if="item.waste_pct > 0" class="block text-ink-secondary font-normal">+{{ Math.round(item.waste_pct * 100) }}%</span>
            </td>
            <td class="py-2.5 px-2 text-end tabular-price whitespace-nowrap">
              {{ formatCurrency(item.unit_price, locale) }}
            </td>
            <td class="py-2.5 px-3 text-end tabular-price whitespace-nowrap font-bold">
              {{ formatCurrency(item.material_cost, locale) }}
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot class="bg-primary-tint font-extrabold text-primary border-t-2 border-border">
        <tr>
          <td colspan="5" class="py-2.5 px-3 text-end">
            {{ locale === 'ar' ? 'إجمالي ميزانية شراء الخامات (بدون المصنعيات)' : 'Total Materials Purchase Budget (excl. labour)' }}
          </td>
          <td class="py-2.5 px-3 text-end tabular-price">{{ formatCurrency(est.materialsTotal, locale) }}</td>
        </tr>
      </tfoot>
    </table>

    <footer class="border-t border-border pt-3 flex items-center justify-between text-xs text-ink-secondary">
      <span>{{ locale === 'ar' ? 'تأكد من تطابق رقم التشغيلة (التون) عند استلام السيراميك والبورسلين.' : 'Verify matching batch/shade codes across all ceramic & porcelain cartons upon delivery.' }}</span>
      <span class="font-semibold text-primary">tashteeb.eg</span>
    </footer>
  </div>
</template>
