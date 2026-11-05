<script setup>
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Check,
  ShoppingBag,
  Store,
  EyeOff,
  Eye
} from 'lucide-vue-next'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const estimatesStore = useEstimatesStore()
const id = computed(() => String(route.params.id || 'ts-2408'))

onMounted(() => {
  estimatesStore.hydrate()
})

const record = computed(() => estimatesStore.getById(id.value) || estimatesStore.estimates[0])
const est = computed(() => record.value?.computed || null)

useHead(() => ({
  title: record.value
    ? `${locale.value === 'ar' ? 'قائمة مشتريات' : 'Shopping list'} ${record.value.refCode} — Tashteeb`
    : 'Shopping list — Tashteeb'
}))

const selectedCategory = ref('all')
const hidePurchased = ref(false)

const purchasedSet = computed(() => new Set(record.value?.purchasedItemIds || []))

const allItems = computed(() => {
  if (!est.value) return []
  return est.value.categories.flatMap(c => c.items)
})

const totalItemCount = computed(() => allItems.value.length)

const boughtCount = computed(() =>
  allItems.value.filter(item => purchasedSet.value.has(item.id)).length
)

const progressPct = computed(() =>
  totalItemCount.value > 0 ? Math.round((boughtCount.value / totalItemCount.value) * 100) : 0
)

const spentMaterialsTotal = computed(() =>
  allItems.value
    .filter(item => purchasedSet.value.has(item.id))
    .reduce((sum, item) => sum + (item.material_cost || 0), 0)
)

const remainingMaterialsTotal = computed(() =>
  Math.max(0, (est.value?.materialsTotal || 0) - spentMaterialsTotal.value)
)

const categoryChips = computed(() => {
  if (!est.value) return []
  return [
    {
      key: 'all',
      label: locale.value === 'ar' ? 'كل الخامات' : 'All categories',
      count: totalItemCount.value
    },
    ...est.value.categories.map(cat => ({
      key: cat.key,
      label: locale.value === 'ar' ? cat.label_ar : cat.label_en,
      count: cat.items.length
    }))
  ]
})

const visibleCategories = computed(() => {
  if (!est.value) return []
  return est.value.categories
    .filter(cat => selectedCategory.value === 'all' || cat.key === selectedCategory.value)
    .map(cat => ({
      ...cat,
      items: hidePurchased.value
        ? cat.items.filter(item => !purchasedSet.value.has(item.id))
        : cat.items
    }))
    .filter(cat => cat.items.length > 0)
})

function togglePurchased(itemId) {
  if (!record.value) return
  estimatesStore.toggleShoppingPurchased(record.value.id, itemId)
}

function handlePrint() {
  if (import.meta.client) window.print()
}

function shareChecklistWhatsApp() {
  if (!record.value || !est.value || !import.meta.client) return
  const lines = [
    locale.value === 'ar'
      ? `📋 قائمة مشتريات تشطيب — ${record.value.title_ar || record.value.title} (${record.value.refCode})`
      : `📋 Tashteeb Material Shopping List — ${record.value.title} (${record.value.refCode})`,
    ''
  ]
  for (const item of allItems.value) {
    const done = purchasedSet.value.has(item.id) ? '✅' : '⬜'
    const name = locale.value === 'ar' ? item.label_ar : item.label_en
    const unit = locale.value === 'ar' ? item.sale_unit_ar : item.sale_unit
    lines.push(`${done} ${name}: ${item.purchased_qty} ${unit} (~${formatCurrency(item.material_cost, locale.value)})`)
  }
  lines.push('')
  lines.push(
    locale.value === 'ar'
      ? `إجمالي الخامات: ${formatCurrency(est.value.materialsTotal, 'ar')}`
      : `Total Materials Est.: ${formatCurrency(est.value.materialsTotal, 'en')}`
  )
  window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
}
</script>

<template>
  <div v-if="record && est" class="shell py-8 sm:py-10 pb-28 md:pb-12 space-y-6">
    <!-- Back link -->
    <div>
      <NuxtLink
        :to="localePath(`/estimate/${record.id}`)"
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline no-print"
      >
        <ArrowLeft class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
        <span>
          {{ locale === 'ar' ? 'العودة إلى الفاتورة التفصيلية' : 'Back to itemized invoice' }}
          (<bdi>{{ record.refCode }}</bdi>)
        </span>
      </NuxtLink>
    </div>

    <!-- Header & Export Actions -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-pill bg-primary-tint px-2.5 py-0.5 text-xs font-bold text-primary">
            <bdi>{{ record.refCode }}</bdi>
          </span>
          <FreshnessLabel compact />
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">
          {{ locale === 'ar' ? 'قائمة مشتريات الخامات' : 'Material shopping list' }}
        </h1>
        <p class="text-sm text-ink-secondary">
          {{
            locale === 'ar'
              ? 'جميع الكميات مقربة لأعلى (ceil) وشاملة نسبة الهالك العملية للشراء المباشر من المعارض.'
              : 'Every quantity is rounded up to whole purchase units (cartons, buckets, rolls) with site waste included.'
          }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 no-print">
        <BaseButton variant="secondary" size="sm" @click="handlePrint">
          <Printer class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'طباعة' : 'Print' }}</span>
        </BaseButton>

        <a
          :href="`/api/pdf/shopping-list/${record.id}?lang=${locale}`"
          target="_blank"
          class="inline-flex min-h-touch items-center justify-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:bg-sand transition-colors"
        >
          <Download class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تحميل PDF' : 'Download PDF' }}</span>
        </a>

        <BaseButton variant="accent" size="sm" @click="shareChecklistWhatsApp">
          <Share2 class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'إرسال للتاجر واتساب' : 'Send via WhatsApp' }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- Purchasing Progress Summary Card -->
    <section class="rounded-card border border-border bg-surface p-5 sm:p-6 shadow-card space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'تقدم شراء الخامات' : 'Purchasing progress' }}
          </p>
          <p class="text-xl font-extrabold text-ink tabular-price">
            {{
              locale === 'ar'
                ? `تم شراء ${boughtCount} من ${totalItemCount} بنود (${progressPct}%)`
                : `Bought ${boughtCount} of ${totalItemCount} items (${progressPct}%)`
            }}
          </p>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'قيمة ما تم شراؤه' : 'Purchased so far' }}
          </p>
          <p class="text-lg font-bold text-success tabular-price">
            {{ formatCurrency(spentMaterialsTotal, locale) }}
          </p>
        </div>

        <div class="space-y-1 md:text-end">
          <p class="text-xs font-semibold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'متبقي من ميزانية الخامات' : 'Remaining materials budget' }}
          </p>
          <p class="text-lg font-bold text-primary tabular-price">
            {{ formatCurrency(remainingMaterialsTotal, locale) }}
          </p>
        </div>
      </div>

      <div class="h-3 w-full rounded-pill bg-sand overflow-hidden">
        <div
          class="h-full rounded-pill bg-success transition-all duration-300"
          :style="{ width: `${progressPct}%` }"
        />
      </div>
    </section>

    <!-- Filter Chips + Hide Purchased Toggle -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 no-print">
      <FilterChips v-model="selectedCategory" :items="categoryChips" />

      <button
        type="button"
        class="self-start shrink-0 whitespace-nowrap inline-flex min-h-touch items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-ink hover:bg-sand transition-colors"
        @click="hidePurchased = !hidePurchased"
      >
        <EyeOff v-if="!hidePurchased" class="h-4 w-4 text-ink-secondary" :stroke-width="1.5" />
        <Eye v-else class="h-4 w-4 text-primary" :stroke-width="1.5" />
        <span>
          {{
            hidePurchased
              ? (locale === 'ar' ? 'إظهار البنود المشتراة' : 'Show purchased items')
              : (locale === 'ar' ? 'إخفاء ما تم شراؤه' : 'Hide purchased')
          }}
        </span>
      </button>
    </div>

    <!-- Empty Filtered State -->
    <EmptyState
      v-if="visibleCategories.length === 0"
      :title="locale === 'ar' ? 'تم شراء جميع بنود هذا القسم!' : 'All items in this view are purchased!'"
      :description="locale === 'ar' ? 'يمكنك إظهار البنود المكتملة لمراجعة الكميات والأسعار.' : 'Toggle “Show purchased items” to review completed material quantities.'"
    >
      <BaseButton variant="secondary" @click="hidePurchased = false; selectedCategory = 'all'">
        {{ locale === 'ar' ? 'عرض كل القائمة' : 'Show full checklist' }}
      </BaseButton>
    </EmptyState>

    <!-- Category Checklist Cards -->
    <div v-else class="space-y-5">
      <section
        v-for="cat in visibleCategories"
        :key="cat.key"
        class="rounded-card border border-border bg-surface overflow-hidden shadow-card"
      >
        <header class="bg-sand/65 px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <ShoppingBag class="h-4 w-4 text-primary" :stroke-width="1.5" />
            <h2 class="text-base font-bold text-ink">
              {{ locale === 'ar' ? cat.label_ar : cat.label_en }}
            </h2>
          </div>
          <span class="text-xs font-bold text-ink-secondary tabular-price">
            {{ formatCurrency(cat.materials_subtotal, locale) }}
          </span>
        </header>

        <div class="divide-y divide-border">
          <div
            v-for="item in cat.items"
            :key="item.id"
            class="p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            :class="purchasedSet.has(item.id) ? 'bg-success-tint/25' : 'bg-surface'"
          >
            <!-- Checkbox + Material Info + Store Tip -->
            <div class="flex items-start gap-3.5 flex-1 min-w-0">
              <button
                type="button"
                class="min-h-touch min-w-[44px] -m-1.5 p-1.5 flex items-center justify-center shrink-0"
                :aria-label="locale === 'ar' ? 'تحديد كمشتراة' : 'Mark item purchased'"
                @click="togglePurchased(item.id)"
              >
                <span
                  class="h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors"
                  :class="purchasedSet.has(item.id) ? 'border-success bg-success text-surface' : 'border-border bg-surface hover:border-primary'"
                >
                  <Check v-if="purchasedSet.has(item.id)" class="h-4 w-4" :stroke-width="2.2" />
                </span>
              </button>

              <div class="space-y-1.5 min-w-0 flex-1">
                <div class="flex items-start gap-3">
                  <TextureSwatch
                    :src="item.image_url"
                    :color="item.swatch_color"
                    size="sm"
                    :zoomable="false"
                    :alt="locale === 'ar' ? item.label_ar : item.label_en"
                    class="shrink-0 shadow-subtle border border-border/80 mt-0.5"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p
                        class="text-base font-bold text-ink transition-all"
                        :class="purchasedSet.has(item.id) ? 'line-through text-ink-muted' : ''"
                      >
                        {{ locale === 'ar' ? item.label_ar : item.label_en }}
                      </p>
                      <span
                        v-if="purchasedSet.has(item.id)"
                        class="inline-flex items-center gap-1 rounded-pill bg-success-tint px-2 py-0.5 text-[11px] font-bold text-success border border-success/30"
                      >
                        ✓ {{ locale === 'ar' ? 'تم الشراء' : 'Purchased' }}
                      </span>
                      <EditedPriceBadge
                        v-if="item.override"
                        :original-price="item.override.original_price"
                        :used-price="item.override.used_price"
                      />
                    </div>

                    <p class="text-xs text-ink-secondary tabular-price mt-0.5">
                      {{ locale === 'ar' ? 'صافي القياس:' : 'Net measured:' }}
                      <strong>{{ formatNumber(item.needed_qty) }} {{ locale === 'ar' ? item.unit_ar : item.unit }}</strong>
                      <span v-if="item.waste_pct > 0">
                        · <bdi>+{{ Math.round(item.waste_pct * 100) }}% {{ locale === 'ar' ? 'هالك عملي' : 'site waste' }}</bdi>
                      </span>
                    </p>
                  </div>
                </div>

                <!-- Showroom / Supplier Tip -->
                <div
                  v-if="item.store_tip_en || item.store_tip_ar"
                  class="inline-flex items-start gap-2 rounded-control bg-sand/80 px-3 py-1.5 text-xs text-ink-secondary"
                >
                  <Store class="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" :stroke-width="1.5" />
                  <span>{{ locale === 'ar' ? item.store_tip_ar || item.store_tip_en : item.store_tip_en }}</span>
                </div>
              </div>
            </div>

            <!-- Right Purchase Quantity Box + Material Price -->
            <div class="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 ps-10 lg:ps-0">
              <div class="rounded-control border border-primary/25 bg-primary-tint/55 px-4 py-2 text-center min-w-[132px]">
                <span class="block text-xs font-semibold text-primary">
                  {{ locale === 'ar' ? 'اشترِ بالضبط' : 'Buy quantity' }}
                </span>
                <strong class="tabular-price text-lg font-extrabold text-ink">
                  {{ formatNumber(item.purchased_qty) }}
                  <span class="text-xs font-semibold">{{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}</span>
                </strong>
              </div>

              <div class="text-end min-w-[125px]">
                <p class="text-xs text-ink-secondary tabular-price">
                  {{ formatCurrency(item.unit_price, locale) }} / {{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}
                </p>
                <p class="text-base font-extrabold text-ink tabular-price">
                  {{ formatCurrency(item.material_cost, locale) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Mobile Sticky Bottom Progress Bar -->
    <div class="md:hidden fixed bottom-14 inset-x-0 z-30 border-t border-border bg-primary-deep text-surface px-4 py-2.5 flex items-center justify-between text-xs no-print">
      <span class="font-semibold">
        {{ locale === 'ar' ? `تم شراء ${boughtCount}/${totalItemCount}` : `Bought ${boughtCount}/${totalItemCount}` }}
      </span>
      <span class="tabular-price font-bold text-accent-dark">
        {{ locale === 'ar' ? 'متبقي:' : 'Left:' }} {{ formatCurrency(remainingMaterialsTotal, locale) }}
      </span>
    </div>
  </div>
</template>
