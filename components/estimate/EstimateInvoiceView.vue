<script setup>
import {
  Download,
  Printer,
  Share2,
  ArrowLeftRight,
  CheckSquare,
  Copy,
  Pencil,
  Bookmark,
  Ruler,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  HardHat,
  SlidersHorizontal
} from 'lucide-vue-next'
import { PACKAGES, GOVERNORATES } from '~/utils/calc/config.js'

const props = defineProps({
  record: {
    type: Object,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit-price', 'reset-price', 'rename', 'duplicate', 'save-account', 'open-share', 'edit-wizard'])
const { t, locale } = useI18n()
const localePath = useLocalePath()

const filterMode = ref('all') // 'all' | 'edited'
const renaming = ref(false)
const draftTitle = ref('')

const est = computed(() => props.record.computed)

const displayTitle = computed(() =>
  locale.value === 'ar'
    ? props.record.title_ar || props.record.title
    : props.record.title
)

const pkgLabel = computed(() => {
  const p = PACKAGES[est.value.packageKey]
  return p ? (locale.value === 'ar' ? p.label_ar : p.label_en) : est.value.packageKey
})

const govLabel = computed(() => {
  const g = GOVERNORATES.find(item => item.code === est.value.apartment.governorate)
  return g ? (locale.value === 'ar' ? g.label_ar : g.label_en) : est.value.apartment.governorate
})

const localizedDonutSegments = computed(() => [
  {
    key: 'materials',
    label: locale.value === 'ar' ? 'الخامات' : 'Materials',
    value: est.value.materialsTotal,
    colorIndex: 0
  },
  {
    key: 'labour',
    label: locale.value === 'ar' ? 'المصنعيات' : 'Labour',
    value: est.value.labourTotal,
    colorIndex: 1
  },
  {
    key: 'contingency',
    label: locale.value === 'ar' ? 'الطوارئ' : 'Contingency',
    value: est.value.contingencyAmount,
    colorIndex: 2
  }
])

const localizedTimelineTasks = computed(() =>
  est.value.timeline.tasks.map(task => ({
    ...task,
    label: locale.value === 'ar' ? task.label_ar : task.label_en
  }))
)

const filteredCategories = computed(() => {
  if (filterMode.value !== 'edited') return est.value.categories
  return est.value.categories
    .map(cat => ({
      ...cat,
      items: cat.items.filter(i => Boolean(i.override))
    }))
    .filter(cat => cat.items.length > 0)
})

function startRename() {
  draftTitle.value = displayTitle.value
  renaming.value = true
}

function commitRename() {
  if (draftTitle.value.trim()) {
    emit('rename', draftTitle.value.trim())
  }
  renaming.value = false
}

function handlePrint() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <div class="shell py-8 sm:py-10 space-y-6">
    <!-- Breadcrumb & Shared Banner -->
    <div v-if="readonly" class="rounded-card border border-primary/30 bg-primary-tint/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
      <div class="flex items-center gap-2 font-medium text-ink">
        <ShieldCheck class="h-4 w-4 text-primary shrink-0" :stroke-width="1.5" />
        <span>
          {{
            locale === 'ar'
              ? 'نسخة مشاركة للقراءة فقط — يمكنك إنشاء نسختك الخاصة وتعديلها مجاناً.'
              : 'Shared read-only estimate — start your own copy to customize materials or prices.'
          }}
        </span>
      </div>
      <BaseButton variant="primary" size="sm" :to="localePath('/calculator')">
        {{ locale === 'ar' ? 'احسب شقتك الآن' : 'Create my own estimate' }}
      </BaseButton>
    </div>

    <!-- Header Row -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex flex-wrap items-center gap-2.5 text-xs">
          <span class="rounded-pill bg-primary-tint px-2.5 py-0.5 font-bold text-primary">
            <bdi>{{ record.refCode }}</bdi>
          </span>
          <span class="text-ink-secondary">
            {{ locale === 'ar' ? 'تاريخ الإنشاء:' : 'Created' }}
            {{ formatDateDisplay(record.createdAt, locale) }}
          </span>
          <FreshnessLabel short />
        </div>

        <div v-if="!renaming" class="flex items-center gap-2">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink">
            {{ displayTitle }}
          </h1>
          <button
            v-if="!readonly"
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-control text-ink-secondary hover:bg-sand hover:text-primary no-print"
            :aria-label="t('common.rename')"
            @click="startRename"
          >
            <Pencil class="h-4 w-4" :stroke-width="1.5" />
          </button>
        </div>

        <form v-else class="flex items-center gap-2 max-w-md no-print" @submit.prevent="commitRename">
          <BaseInput v-model="draftTitle" />
          <BaseButton type="submit" size="sm" variant="primary">{{ t('common.save') }}</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="renaming = false">{{ t('common.cancel') }}</BaseButton>
        </form>
      </div>

      <!-- Top CTA Group -->
      <div class="flex flex-wrap items-center gap-2 no-print">
        <BaseButton v-if="!readonly" variant="secondary" size="sm" @click="emit('edit-wizard')">
          <SlidersHorizontal class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تعديل المدخلات' : 'Edit in wizard' }}</span>
        </BaseButton>
        <BaseButton v-else variant="secondary" size="sm" @click="emit('duplicate')">
          <Copy class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'انسخ وعدّل نسختي' : 'Customize my copy' }}</span>
        </BaseButton>
        <a
          :href="`/api/pdf/estimate/${record.id}?lang=${locale}`"
          target="_blank"
          class="inline-flex min-h-touch items-center justify-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:bg-sand transition-colors"
        >
          <Download class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تحميل PDF' : 'Download PDF' }}</span>
        </a>
        <BaseButton variant="accent" size="sm" @click="emit('open-share')">
          <Share2 class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'مشاركة واتساب' : 'Share WhatsApp' }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- 4-Cell Metadata Strip -->
    <div class="card-surface grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-border">
      <div class="p-4 flex items-center gap-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
          <Ruler class="h-5 w-5" :stroke-width="1.5" />
        </span>
        <div>
          <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'المساحة والغرف' : 'Area & layout' }}</p>
          <p class="text-sm font-bold text-ink tabular-price">
            {{ est.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }} ·
            {{ est.apartment.bedrooms }} {{ locale === 'ar' ? 'غرف' : 'BR' }},
            {{ est.apartment.bathrooms }} {{ locale === 'ar' ? 'حمام' : 'BA' }}
          </p>
        </div>
      </div>

      <div class="p-4 flex items-center gap-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
          <Layers class="h-5 w-5" :stroke-width="1.5" />
        </span>
        <div>
          <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'مستوى التشطيب' : 'Finishing level' }}</p>
          <p class="text-sm font-bold text-ink">{{ pkgLabel }}</p>
        </div>
      </div>

      <div class="p-4 flex items-center gap-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
          <MapPin class="h-5 w-5" :stroke-width="1.5" />
        </span>
        <div>
          <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'المحافظة' : 'Governorate' }}</p>
          <p class="text-sm font-bold text-ink">
            {{ govLabel }} ({{ est.governorateFactor.toFixed(2) }}×)
          </p>
        </div>
      </div>

      <div class="p-4 flex items-center gap-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
          <Clock class="h-5 w-5" :stroke-width="1.5" />
        </span>
        <div>
          <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'مدة التنفيذ التقديرية' : 'Est. duration' }}</p>
          <p class="text-sm font-bold text-ink tabular-price">
            ~{{ est.timeline.totalWeeks }} {{ locale === 'ar' ? 'أسبوع' : 'weeks' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 3-Card Overview Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- 1. Grand Total Card -->
      <div class="lg:col-span-5 card-surface p-6 flex flex-col justify-between gap-4">
        <div class="space-y-1.5">
          <span class="text-xs font-bold uppercase tracking-wider text-primary">
            {{ locale === 'ar' ? 'الإجمالي التقديري للتشطيب' : 'ESTIMATED GRAND TOTAL' }}
          </span>
          <p class="tabular-price text-3xl sm:text-4xl font-extrabold text-ink">
            {{ formatCurrency(est.grandTotal, locale) }}
          </p>
          <p class="tabular-price text-xs sm:text-sm text-ink-secondary">
            {{ locale === 'ar' ? 'النطاق المتوقع:' : 'Likely range:' }}
            {{ formatNumber(est.rangeMin) }} – {{ formatCurrency(est.rangeMax, locale) }}
            · ~{{ formatNumber(est.costPerSqm) }} {{ currencySymbol(locale) }}/{{ locale === 'ar' ? 'م²' : 'm²' }}
          </p>
        </div>

        <div class="pt-3 border-t border-border grid grid-cols-3 gap-2 text-xs">
          <div>
            <span class="text-ink-secondary block">{{ locale === 'ar' ? 'الخامات' : 'Materials' }}</span>
            <strong class="tabular-price text-sm text-ink">{{ formatCompactK(est.materialsTotal) }}</strong>
          </div>
          <div>
            <span class="text-ink-secondary block">{{ locale === 'ar' ? 'المصنعيات' : 'Labour' }}</span>
            <strong class="tabular-price text-sm text-ink">{{ formatCompactK(est.labourTotal) }}</strong>
          </div>
          <div>
            <span class="text-ink-secondary block">
              {{ locale === 'ar' ? 'الطوارئ' : 'Contingency' }} ({{ Math.round(est.contingencyPct * 100) }}%)
            </span>
            <strong class="tabular-price text-sm text-ink">{{ formatCompactK(est.contingencyAmount) }}</strong>
          </div>
        </div>
      </div>

      <!-- 2. Donut Breakdown Card (center K matches grandTotal) -->
      <div class="lg:col-span-4 card-surface p-6 flex items-center">
        <DonutChart
          :segments="localizedDonutSegments"
          :total="est.grandTotal"
          :size="136"
          :stroke-width="18"
          :center-subtext="locale === 'ar' ? 'الإجمالي' : 'TOTAL'"
        />
      </div>

      <!-- 3. Market Insight & Contractor Handoff Card -->
      <div class="lg:col-span-3 card-surface p-6 flex flex-col justify-between gap-4">
        <div class="space-y-2.5">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-control bg-success-tint text-success">
            <ShieldCheck class="h-5 w-5" :stroke-width="1.5" />
          </span>
          <h2 class="text-base font-bold text-ink">
            {{ locale === 'ar' ? 'حالة التسعير والشفافية' : 'Price feed & audit' }}
          </h2>
          <p class="text-xs text-ink-secondary leading-relaxed">
            {{
              est.editedCount > 0
                ? (locale === 'ar'
                    ? `تتضمن هذه الفاتورة ${est.editedCount} بنود معدلة يدوياً وموضحة باللون الكهرماني بالأسفل.`
                    : `Includes ${est.editedCount} manually edited supplier prices highlighted in amber below.`)
                : (locale === 'ar'
                    ? 'جميع البنود مسعرة بمتوسط السوق المصري المحدث اليوم بدون تعديلات يدوية.'
                    : 'All items use today’s live Egyptian market averages with zero manual overrides.')
            }}
          </p>
        </div>

        <NuxtLink
          v-if="!readonly"
          :to="localePath('/contractor')"
          class="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline no-print"
        >
          <HardHat class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'حوّل إلى عرض سعر مقاول' : 'Open in Contractor Mode' }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Secondary Action Toolbar -->
    <div v-if="!readonly" class="flex flex-wrap items-center justify-between gap-3 no-print">
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton variant="secondary" size="sm" @click="emit('save-account')">
          <Bookmark class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'حفظ في حسابي' : 'Save' }}</span>
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="handlePrint">
          <Printer class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'طباعة' : 'Print' }}</span>
        </BaseButton>
        <BaseButton variant="secondary" size="sm" :to="localePath(`/estimate/${record.id}/compare`)">
          <ArrowLeftRight class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'مقارنة الباقات' : 'Compare packages' }}</span>
        </BaseButton>
        <BaseButton variant="secondary" size="sm" :to="localePath(`/estimate/${record.id}/shopping-list`)">
          <CheckSquare class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'قائمة المشتريات' : 'Shopping list' }}</span>
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="emit('duplicate')">
          <Copy class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ t('common.duplicate') }}</span>
        </BaseButton>
      </div>

      <FilterChips
        v-if="est.editedCount > 0"
        v-model="filterMode"
        :items="[
          { key: 'all', label: locale === 'ar' ? 'كل البنود' : 'All items', count: est.items.length },
          { key: 'edited', label: locale === 'ar' ? 'أسعار معدلة' : 'Prices edited', count: est.editedCount }
        ]"
      />
    </div>

    <!-- Itemized Invoice Table Grouped by Category -->
    <section class="card-surface overflow-hidden">
      <div class="p-5 sm:p-6 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-ink">
            {{ locale === 'ar' ? 'جدول الكميات والأسعار التفصيلي (BOQ)' : 'Itemized Bill of Quantities & Pricing' }}
          </h2>
          <p class="text-xs text-ink-secondary">
            {{
              locale === 'ar'
                ? 'المعادلة لكل صف: (كمية الشراء المقربة لأعلى × سعر وحدة البيع) + المصنعية = إجمالي البند'
                : 'Every row satisfies: (Purchased units × Unit price) + Labour = Row subtotal'
            }}
          </p>
        </div>
        <FreshnessLabel short />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-sm border-collapse">
          <thead>
            <tr class="bg-sand border-b border-border text-xs font-bold uppercase text-ink-secondary text-start">
              <th class="py-3 px-5 text-start">{{ locale === 'ar' ? 'البند والخامة' : 'Category & material' }}</th>
              <th class="py-3 px-3 text-start">{{ locale === 'ar' ? 'الصافي + الهالك' : 'Net + waste' }}</th>
              <th class="py-3 px-3 text-end">{{ locale === 'ar' ? 'كمية الشراء' : 'Purchase qty' }}</th>
              <th class="py-3 px-3 text-end">{{ locale === 'ar' ? 'سعر الوحدة' : 'Unit price' }}</th>
              <th class="py-3 px-3 text-end">{{ locale === 'ar' ? 'المصنعية' : 'Labour' }}</th>
              <th class="py-3 px-5 text-end">{{ locale === 'ar' ? 'الإجمالي' : 'Subtotal' }}</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-border">
            <template v-for="cat in filteredCategories" :key="cat.key">
              <tr
                v-for="item in cat.items"
                :key="item.id"
                class="transition-colors"
                :class="item.override ? 'bg-warning-tint/35' : 'hover:bg-sand/30'"
              >
                <td
                  class="py-4 px-5 align-top"
                  :class="item.override ? 'border-s-4 border-warning' : ''"
                >
                  <div class="flex items-start gap-3">
                    <TextureSwatch
                      :src="item.image_url"
                      :color="item.swatch_color"
                      size="sm"
                      :zoomable="false"
                      :alt="locale === 'ar' ? item.label_ar : item.label_en"
                      class="shrink-0 mt-0.5 shadow-subtle border border-border/80"
                    />
                    <div class="min-w-0">
                      <p class="text-xs font-bold uppercase text-primary">
                        {{ locale === 'ar' ? cat.label_ar : cat.label_en }}
                      </p>
                      <p class="font-semibold text-ink mt-0.5">
                        {{ locale === 'ar' ? item.label_ar : item.label_en }}
                      </p>
                      <div class="mt-1 flex flex-wrap items-center gap-2">
                        <span class="text-xs text-ink-secondary">{{ item.brand }}</span>
                        <BaseTooltip
                          v-if="item.override"
                          :text="locale === 'ar' ? item.override.note_ar : item.override.note_en"
                        >
                          <EditedPriceBadge
                            :original-price="item.override.original_price"
                            :used-price="item.override.used_price"
                          />
                        </BaseTooltip>
                      </div>
                    </div>
                  </div>
                </td>

                <td class="py-4 px-3 align-top tabular-price text-xs text-ink-secondary">
                  <span class="font-medium text-ink block">
                    {{ item.needed_qty }} {{ locale === 'ar' ? item.unit_ar : item.unit }}
                  </span>
                  <span v-if="item.waste_pct > 0" class="block text-[11px] text-ink-secondary mt-0.5">
                    +{{ Math.round(item.waste_pct * 100) }}% {{ locale === 'ar' ? 'هالك' : 'waste' }}
                    <span class="text-ink-muted">({{ Math.round(item.needed_qty * (1 + item.waste_pct) * 10) / 10 }})</span>
                  </span>
                  <span v-if="item.coverage_per_unit && item.coverage_per_unit !== 1" class="block text-[10px] text-ink-muted mt-0.5">
                    {{ item.coverage_per_unit }} {{ locale === 'ar' ? item.unit_ar : item.unit }}/{{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}
                  </span>
                </td>

                <td class="py-4 px-3 align-top text-end tabular-price">
                  <strong class="font-bold text-ink">{{ formatNumber(item.purchased_qty) }}</strong>
                  <span class="block text-xs text-ink-secondary">
                    {{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}
                  </span>
                </td>

                <td class="py-4 px-3 align-top text-end tabular-price">
                  <div class="inline-flex items-center justify-end gap-1.5">
                    <span class="font-semibold text-ink">
                      {{ formatNumber(item.unit_price) }} {{ currencySymbol(locale) }}
                    </span>
                    <button
                      v-if="!readonly && item.category !== 'extras'"
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded-control border border-border bg-surface text-ink-secondary hover:border-primary hover:text-primary no-print"
                      :aria-label="`${t('common.edit')} ${item.label_en}`"
                      @click="emit('edit-price', item)"
                    >
                      <Pencil class="h-3.5 w-3.5" :stroke-width="1.5" />
                    </button>
                  </div>
                  <span v-if="item.coverage_per_unit !== 1 && item.unit !== item.sale_unit" class="block text-xs text-ink-secondary">
                    ({{ formatNumber(item.used_base_price) }}/{{ locale === 'ar' ? item.unit_ar : item.unit }})
                  </span>
                </td>

                <td class="py-4 px-3 align-top text-end tabular-price text-ink">
                  {{ formatCurrency(item.labour, locale) }}
                </td>

                <td class="py-4 px-5 align-top text-end tabular-price">
                  <span class="font-bold text-ink block">
                    {{ formatCurrency(item.subtotal, locale) }}
                  </span>
                  <span
                    class="block text-[11px] text-ink-muted font-normal mt-0.5 font-sans"
                    :title="locale === 'ar' ? 'خامات + مصنعية' : 'Materials + Labour'"
                  >
                    (<span class="tabular-price">{{ formatNumber(item.purchased_qty * item.unit_price) }}</span> + <span class="tabular-price">{{ formatNumber(item.labour) }}</span>)
                  </span>
                </td>
              </tr>
            </template>
          </tbody>

          <tfoot class="bg-sand/70 border-t-2 border-border text-sm">
            <tr>
              <td colspan="4" class="py-3 px-5 text-end font-medium text-ink-secondary">
                {{ locale === 'ar' ? 'إجمالي الخامات + المصنعيات:' : 'Materials + Labour subtotal:' }}
              </td>
              <td colspan="2" class="py-3 px-5 text-end tabular-price font-bold text-ink">
                {{ formatCurrency(est.baseCost, locale) }}
              </td>
            </tr>
            <tr>
              <td colspan="4" class="py-2.5 px-5 text-end font-medium text-ink-secondary">
                {{ locale === 'ar' ? 'احتياطي الطوارئ وفروق الأسعار' : 'Contingency reserve' }}
                ({{ Math.round(est.contingencyPct * 100) }}%):
              </td>
              <td colspan="2" class="py-2.5 px-5 text-end tabular-price font-semibold text-ink">
                {{ formatCurrency(est.contingencyAmount, locale) }}
              </td>
            </tr>
            <tr class="border-t border-border bg-primary-tint/40">
              <td colspan="4" class="py-4 px-5 text-end text-base font-bold text-ink">
                {{ locale === 'ar' ? 'الإجمالي التقديري النهائي:' : 'Estimated Grand Total:' }}
              </td>
              <td colspan="2" class="py-4 px-5 text-end tabular-price text-xl font-extrabold text-primary">
                {{ formatCurrency(est.grandTotal, locale) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- Notes on Edited Prices Block -->
    <section
      v-if="est.editedItems.length > 0"
      class="rounded-card border border-warning/60 bg-warning-tint/45 p-5 sm:p-6 space-y-4"
    >
      <div class="flex items-start gap-3">
        <Pencil class="h-5 w-5 text-warning shrink-0 mt-0.5" :stroke-width="1.5" />
        <div>
          <h2 class="text-base font-bold text-ink">
            {{ locale === 'ar' ? 'ملاحظات الأسعار المعدلة يدوياً' : 'Notes on manually edited prices' }}
          </h2>
          <p class="text-xs text-ink-secondary">
            {{
              locale === 'ar'
                ? 'تم استبدال متوسطات السوق للبنود التالية بأسعار مدخلة يدوياً:'
                : 'Market averages for the items below were overridden with custom supplier prices:'
            }}
          </p>
        </div>
      </div>

      <div class="divide-y divide-warning/30 border-t border-warning/30">
        <div
          v-for="item in est.editedItems"
          :key="item.id"
          class="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
        >
          <div class="space-y-0.5">
            <p class="font-semibold text-ink">
              {{ locale === 'ar' ? item.label_ar : item.label_en }}
            </p>
            <p v-if="item.override.reason" class="text-xs text-ink-secondary">
              "{{ item.override.reason }}"
            </p>
          </div>

          <div class="flex items-center gap-3 tabular-price">
            <span class="text-xs text-ink-secondary">
              <s class="text-ink-muted">{{ formatNumber(item.override.original_price) }}</s>
              →
              <strong class="text-ink font-bold">
                {{ formatNumber(item.override.used_price) }} {{ currencySymbol(locale) }}/{{ locale === 'ar' ? item.unit_ar : item.unit }}
              </strong>
            </span>
            <button
              v-if="!readonly"
              type="button"
              class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline no-print"
              @click="emit('reset-price', item.slug)"
            >
              <RotateCcw class="h-3.5 w-3.5" :stroke-width="1.5" />
              <span>{{ locale === 'ar' ? 'استعادة السوق' : 'Reset' }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Construction Timeline Gantt -->
    <section class="card-surface p-5 sm:p-6 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="kicker">{{ locale === 'ar' ? 'الجدول الزمني للتنفيذ' : 'CONSTRUCTION SCHEDULE' }}</p>
          <h2 class="text-lg sm:text-xl font-bold text-ink">
            {{
              locale === 'ar'
                ? `مخطط مراحل التشطيب (~${est.timeline.totalWeeks} أسبوع)`
                : `Estimated construction timeline (~${est.timeline.totalWeeks} weeks)`
            }}
          </h2>
        </div>
        <span class="text-xs text-ink-secondary">
          {{ locale === 'ar' ? 'السباكة والكهرباء تعملان بالتوازي لتوفير الوقت' : 'Plumbing & electrical rough-in run in parallel' }}
        </span>
      </div>

      <GanttChart :tasks="localizedTimelineTasks" :total-weeks="est.timeline.totalWeeks">
        <template #stage-label>
          {{ locale === 'ar' ? 'المرحلة' : 'Stage' }}
        </template>
      </GanttChart>
    </section>

    <!-- Honest Planning Disclaimer -->
    <div class="rounded-card border border-border bg-surface p-4 flex items-start gap-3 text-xs text-ink-secondary">
      <AlertCircle class="h-4 w-4 text-ink-secondary shrink-0 mt-0.5" :stroke-width="1.5" />
      <p class="leading-relaxed">
        {{ t('brand.estimateDisclaimer') }}
      </p>
    </div>
  </div>
</template>
