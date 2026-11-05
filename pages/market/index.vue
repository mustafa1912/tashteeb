<script setup>
import {
  Search,
  Star,
  LayoutGrid,
  Table2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Calculator,
  MapPin
} from 'lucide-vue-next'
import { CATEGORIES, GOVERNORATES } from '~/utils/calc/config.js'
import { formatCategoryLabel, formatNumber, formatCurrency, formatPercentChange, formatDateDisplay } from '~/utils/formatters.js'

definePageMeta({
  layout: 'public'
})

const { locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const marketStore = useMarketStore()
const wizardStore = useWizardStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

onMounted(() => {
  marketStore.hydrate()
  authStore.hydrate()
  marketStore.refreshFromApi()
})

const indexRange = ref('6M')
const searchQuery = ref('')
const activeCategory = ref('all')
const sortBy = ref('change_desc')
const viewMode = ref('table') // 'table' | 'cards'

const indexData = computed(() => marketStore.getIndexSeries(indexRange.value))

const govOptions = computed(() =>
  GOVERNORATES.map(g => ({
    value: g.code,
    label: locale.value === 'ar' ? g.label_ar : g.label_en
  }))
)

const sortOptions = computed(() => [
  { value: 'change_desc', label: locale.value === 'ar' ? 'الأعلى تغيراً (30 يوم)' : 'Biggest 30d move' },
  { value: 'price_desc', label: locale.value === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to low' },
  { value: 'price_asc', label: locale.value === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to high' },
  { value: 'name_asc', label: locale.value === 'ar' ? 'الاسم أبجدياً' : 'Material name (A–Z)' }
])

const categoryChips = computed(() => {
  const list = marketStore.adjustedMaterials
  const chips = [
    {
      key: 'all',
      label: locale.value === 'ar' ? 'كل الخامات' : 'All materials',
      count: list.length
    }
  ]

  for (const cat of CATEGORIES) {
    const cnt = list.filter(m => m.category === cat.key).length
    if (cnt > 0) {
      chips.push({
        key: cat.key,
        label: locale.value === 'ar' ? cat.label_ar : cat.label_en,
        count: cnt
      })
    }
  }

  const commodityCnt = list.filter(m => m.category === 'commodities').length
  if (commodityCnt > 0) {
    chips.push({
      key: 'commodities',
      label: locale.value === 'ar' ? 'مواد البناء الأساسية' : 'Raw commodities',
      count: commodityCnt
    })
  }

  return chips
})

const filteredMaterials = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return marketStore.adjustedMaterials
    .filter((mat) => {
      if (activeCategory.value !== 'all' && mat.category !== activeCategory.value) return false
      if (!q) return true
      return (
        mat.label_en.toLowerCase().includes(q) ||
        mat.label_ar.toLowerCase().includes(q) ||
        mat.brand?.toLowerCase().includes(q) ||
        mat.slug.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy.value === 'price_desc') return b.price - a.price
      if (sortBy.value === 'price_asc') return a.price - b.price
      if (sortBy.value === 'name_asc') {
        const na = locale.value === 'ar' ? a.label_ar : a.label_en
        const nb = locale.value === 'ar' ? b.label_ar : b.label_en
        return na.localeCompare(nb)
      }
      return Math.abs(b.change_30d) - Math.abs(a.change_30d)
    })
})

function handleToggleWatch(mat) {
  const added = marketStore.toggleWatchlist(mat.slug)
  $fetch('/api/watchlist/toggle', {
    method: 'POST',
    body: {
      slug: mat.slug,
      userId: authStore.user?.id || 'guest'
    }
  }).catch(() => {})

  uiStore.showToast({
    title: added
      ? (locale.value === 'ar' ? 'أضيفت لقائمة المتابعة' : 'Added to watchlist')
      : (locale.value === 'ar' ? 'أزيلت من قائمة المتابعة' : 'Removed from watchlist'),
    message: locale.value === 'ar' ? mat.label_ar : mat.label_en,
    type: 'info'
  })
}

function useInEstimate(mat) {
  wizardStore.prefillMaterialFromMarket(mat)
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم اختيار الخامة في الحاسبة' : 'Material pre-selected in Calculator',
    message: locale.value === 'ar' ? mat.label_ar : mat.label_en,
    type: 'success'
  })
  navigateTo(localePath('/calculator'))
}

function getCatLabel(catKey) {
  return formatCategoryLabel(catKey, locale.value)
}

const updatedShortDate = computed(() => formatDateDisplay(marketStore.lastUpdatedAt, locale.value))

useSeoSchema(() => {
  const siteUrl = (config.public?.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  return {
    path: '/market',
    title:
      locale.value === 'ar'
        ? `بورصة أسعار مواد التشطيب في مصر — تحديث ${updatedShortDate.value} | تشطيب`
        : `Egypt Finishing Material Prices — Updated ${updatedShortDate.value} | Tashteeb`,
    description:
      locale.value === 'ar'
        ? 'تابع أسعار السيراميك والبورسلين وسلك السويدي ودهانات جوتن والجبس بورد والأسمنت يومياً في السوق المصري مع مؤشر 6 شهور.'
        : 'Daily-updated Egyptian finishing material prices: porcelain, ceramic, El Sewedy wire, Jotun paint, Knauf gypsum board, sanitary ware & cement.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Price Market', item: `${siteUrl}/market` }
        ]
      }
    ]
  }
})
</script>

<template>
  <div class="shell py-10 sm:py-14 space-y-10">
    <!-- Hero Market Index Card -->
    <section class="rounded-card border border-border bg-surface p-6 sm:p-8 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <!-- Left: Index Value + Governorate Selector -->
      <div class="lg:col-span-5 space-y-5">
        <div class="flex flex-wrap items-center gap-2.5">
          <FreshnessLabel />
          <a href="#methodology" class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Info class="h-3.5 w-3.5" :stroke-width="1.5" />
            <span>{{ locale === 'ar' ? 'منهجية التسعير' : 'How we source prices' }}</span>
          </a>
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-ink">
            {{ locale === 'ar' ? 'بورصة أسعار خامات التشطيب في مصر' : 'Egyptian Finishing Price Market' }}
          </h1>
          <p class="text-sm text-ink-secondary leading-relaxed">
            {{
              locale === 'ar'
                ? 'متوسطات أسعار التجزئة والتوريد الفعلية في معارض القاهرة والمحافظات، شاملة حركة الـ 6 أشهر الأخيرة.'
                : 'Live retail & showroom price medians across Egypt for tiles, wiring, paint, sanitary ware, and raw building materials.'
            }}
          </p>
        </div>

        <!-- Composite Index Pill Box -->
        <div class="rounded-card bg-primary-deep text-surface p-5 flex items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase text-accent-dark block">
              {{ locale === 'ar' ? 'مؤشر تشطيب القياسي (يناير 2026 = 100)' : 'TASHTEEB BASKET INDEX (JAN 2026 = 100)' }}
            </span>
            <div class="flex items-baseline gap-3 mt-1">
              <strong class="tabular-price text-3xl font-extrabold text-surface">
                {{ indexData.currentValue.toFixed(1) }}
              </strong>
              <PriceBadge :change="indexData.change30d" />
            </div>
          </div>

          <div class="text-end text-xs text-surface/80 tabular-price">
            <span class="block">{{ locale === 'ar' ? 'تغير 6 شهور' : '6M drift' }}</span>
            <strong class="text-sm font-bold text-surface"><bdi>+{{ indexData.change6m }}%</bdi></strong>
          </div>
        </div>

        <!-- Governorate Factor Filter -->
        <div class="flex items-center gap-3 pt-1">
          <MapPin class="h-4 w-4 text-primary shrink-0" :stroke-width="1.5" />
          <div class="flex-1">
            <SelectField
              v-model="marketStore.selectedGovernorate"
              :label="locale === 'ar' ? 'عرض الأسعار حسب المحافظة' : 'Regional market pricing'"
              :options="govOptions"
            />
          </div>
        </div>
      </div>

      <!-- Right: 6-Month Composite Index LineChart -->
      <div class="lg:col-span-7 rounded-card border border-border bg-bg/60 p-4 sm:p-5">
        <LineChart
          :points="indexData.points"
          :ranges="['1M', '3M', '6M', '1Y']"
          :selected-range="indexRange"
          unit-label="pts"
          :height="230"
          @update:selected-range="val => (indexRange = val)"
        />
      </div>
    </section>

    <!-- Main 12-Col Market Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- LEFT 8 COLS: Filterable Material Table / Cards -->
      <div class="lg:col-span-8 space-y-5">
        <!-- Search + Sort + View Toggle -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1">
            <Search class="h-4 w-4 text-ink-secondary absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" :stroke-width="1.5" />
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="locale === 'ar' ? 'ابحث عن بورسلين، السويدي، جوتن، أسمنت...' : 'Search porcelain, El Sewedy, Jotun, cement...'"
              class="w-full min-h-touch rounded-control border border-border bg-surface ps-10 pe-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
          </div>

          <div class="flex items-center gap-2">
            <div class="min-w-[180px] flex-1 sm:flex-initial">
              <SelectField v-model="sortBy" :options="sortOptions" />
            </div>

            <div class="inline-flex rounded-control border border-border bg-surface p-1">
              <button
                type="button"
                class="min-h-[36px] px-2.5 rounded-[8px] transition-colors"
                :class="viewMode === 'table' ? 'bg-primary text-surface' : 'text-ink-secondary hover:text-ink'"
                :aria-label="locale === 'ar' ? 'عرض جدول' : 'Table view'"
                @click="viewMode = 'table'"
              >
                <Table2 class="h-4 w-4" :stroke-width="1.5" />
              </button>
              <button
                type="button"
                class="min-h-[36px] px-2.5 rounded-[8px] transition-colors"
                :class="viewMode === 'cards' ? 'bg-primary text-surface' : 'text-ink-secondary hover:text-ink'"
                :aria-label="locale === 'ar' ? 'عرض بطاقات' : 'Card view'"
                @click="viewMode = 'cards'"
              >
                <LayoutGrid class="h-4 w-4" :stroke-width="1.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Category Chips -->
        <FilterChips v-model="activeCategory" :items="categoryChips" />

        <!-- Empty Search State -->
        <EmptyState
          v-if="filteredMaterials.length === 0"
          :title="locale === 'ar' ? 'لا توجد خامات مطابقة للبحث' : 'No materials match your search'"
          :description="locale === 'ar' ? 'جرب مسح كلمة البحث أو اختيار قسم آخر.' : 'Try clearing your search keyword or switching categories.'"
        >
          <BaseButton variant="secondary" size="sm" @click="searchQuery = ''; activeCategory = 'all'">
            {{ locale === 'ar' ? 'عرض كل الخامات' : 'Reset filters' }}
          </BaseButton>
        </EmptyState>

        <!-- TABLE VIEW -->
        <div v-else-if="viewMode === 'table'" class="rounded-card border border-border bg-surface overflow-hidden shadow-card">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-sand/75 border-b border-border text-xs uppercase text-ink-secondary font-bold">
                  <th class="py-3 px-3 w-10 text-center">★</th>
                  <th class="py-3 px-3 text-start">{{ locale === 'ar' ? 'الخامة والعلامة التجارية' : 'Material & Brand' }}</th>
                  <th class="py-3 px-3 text-end">{{ locale === 'ar' ? 'متوسط السعر' : 'Avg Price' }}</th>
                  <th class="py-3 px-3 text-end">{{ locale === 'ar' ? '30 يوم' : '30d' }}</th>
                  <th class="py-3 px-3 text-center hidden sm:table-cell">{{ locale === 'ar' ? 'منحنى 6ش' : '6M Trend' }}</th>
                  <th class="py-3 px-3 text-end">{{ locale === 'ar' ? 'إجراء' : 'Action' }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="mat in filteredMaterials"
                  :key="mat.slug"
                  class="hover:bg-sand/35 transition-colors"
                >
                  <td class="py-3 px-3 text-center">
                    <button
                      type="button"
                      class="p-1.5 rounded-pill hover:bg-sand transition-colors"
                      :aria-label="locale === 'ar' ? 'متابعة الخامة' : 'Toggle watchlist'"
                      @click="handleToggleWatch(mat)"
                    >
                      <Star
                        class="h-4 w-4"
                        :class="marketStore.isWatched(mat.slug) ? 'fill-warning text-warning' : 'text-ink-muted'"
                        :stroke-width="1.6"
                      />
                    </button>
                  </td>

                  <td class="py-3 px-3">
                    <NuxtLink
                      :to="localePath(`/market/${mat.slug}`)"
                      class="font-bold text-ink hover:text-primary transition-colors block"
                    >
                      {{ locale === 'ar' ? mat.label_ar : mat.label_en }}
                    </NuxtLink>
                    <span class="text-xs text-ink-secondary">
                      {{ getCatLabel(mat.category) }} · {{ mat.brand }}
                    </span>
                  </td>

                  <td class="py-3 px-3 text-end whitespace-nowrap">
                    <p class="font-extrabold text-ink tabular-price">
                      {{ formatCurrency(mat.price, locale) }}
                      <span class="text-xs font-normal text-ink-secondary">/ {{ locale === 'ar' ? mat.unit_ar : mat.unit }}</span>
                    </p>
                    <p class="text-xs text-ink-secondary tabular-price">
                      {{ formatNumber(mat.min_price) }}–{{ formatNumber(mat.max_price) }}
                    </p>
                  </td>

                  <td class="py-3 px-3 text-end whitespace-nowrap">
                    <PriceBadge :change="mat.change_30d" />
                  </td>

                  <td class="py-3 px-3 hidden sm:table-cell">
                    <div class="flex justify-center">
                      <SparklineChart :values="mat.sparkline" :width="92" :height="28" />
                    </div>
                  </td>

                  <td class="py-3 px-3 text-end whitespace-nowrap">
                    <button
                      v-if="mat.is_calculator_item !== false"
                      type="button"
                      class="inline-flex min-h-[36px] items-center gap-1 rounded-control border border-primary/30 bg-primary-tint/50 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-surface transition-colors"
                      @click="useInEstimate(mat)"
                    >
                      <Calculator class="h-3.5 w-3.5" :stroke-width="1.5" />
                      <span>{{ locale === 'ar' ? 'استخدم' : 'Use' }}</span>
                    </button>
                    <NuxtLink
                      v-else
                      :to="localePath(`/market/${mat.slug}`)"
                      class="inline-flex min-h-[36px] items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <span>{{ locale === 'ar' ? 'التفاصيل' : 'Details' }}</span>
                      <ArrowRight class="h-3.5 w-3.5 rtl:-scale-x-100" :stroke-width="1.5" />
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CARD VIEW -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article
            v-for="mat in filteredMaterials"
            :key="mat.slug"
            class="rounded-card border border-border bg-surface p-5 shadow-card flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="rounded-pill bg-sand px-2.5 py-0.5 text-xs font-semibold text-ink-secondary">
                  {{ getCatLabel(mat.category) }}
                </span>
                <button
                  type="button"
                  class="p-1 rounded-pill hover:bg-sand"
                  :aria-label="locale === 'ar' ? 'متابعة الخامة' : 'Watch material'"
                  @click="handleToggleWatch(mat)"
                >
                  <Star
                    class="h-4 w-4"
                    :class="marketStore.isWatched(mat.slug) ? 'fill-warning text-warning' : 'text-ink-muted'"
                    :stroke-width="1.6"
                  />
                </button>
              </div>

              <NuxtLink :to="localePath(`/market/${mat.slug}`)" class="block">
                <h2 class="text-base font-bold text-ink hover:text-primary transition-colors">
                  {{ locale === 'ar' ? mat.label_ar : mat.label_en }}
                </h2>
              </NuxtLink>
              <p class="text-xs text-ink-secondary">{{ mat.brand }}</p>
            </div>

            <div class="flex items-end justify-between gap-3 pt-2 border-t border-border">
              <div>
                <p class="text-xl font-extrabold text-primary tabular-price">
                  {{ formatCurrency(mat.price, locale) }}
                  <span class="text-xs font-normal text-ink-secondary">/ {{ locale === 'ar' ? mat.unit_ar : mat.unit }}</span>
                </p>
                <PriceBadge :change="mat.change_30d" class="mt-1" />
              </div>

              <SparklineChart :values="mat.sparkline" :width="96" :height="32" />
            </div>
          </article>
        </div>
      </div>

      <!-- RIGHT 4 COLS: Watchlist + Biggest Movers -->
      <aside class="lg:col-span-4 space-y-6">
        <!-- Watchlist Card -->
        <section class="rounded-card border border-border bg-surface p-5 shadow-card space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Star class="h-4 w-4 fill-warning text-warning" :stroke-width="1.5" />
              <h2 class="text-base font-bold text-ink">
                {{ locale === 'ar' ? 'قائمة المتابعة الخاصة بك' : 'Your Watchlist' }}
              </h2>
            </div>
            <span class="rounded-pill bg-sand px-2 py-0.5 text-xs font-bold tabular-price text-ink-secondary">
              {{ marketStore.watchlistItems.length }}
            </span>
          </div>

          <p v-if="marketStore.watchlistItems.length === 0" class="text-xs text-ink-secondary py-3">
            {{
              locale === 'ar'
                ? 'اضغط على النجمة (★) بجوار أي خامة لمتابعة تحركات سعرها هنا.'
                : 'Click the star (★) next to any material to pin its live rate here.'
            }}
          </p>

          <ul v-else class="divide-y divide-border">
            <li
              v-for="item in marketStore.watchlistItems"
              :key="item.slug"
              class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <NuxtLink :to="localePath(`/market/${item.slug}`)" class="min-w-0 flex-1 hover:text-primary">
                <p class="text-xs font-bold text-ink truncate">
                  {{ locale === 'ar' ? item.label_ar : item.label_en }}
                </p>
                <p class="text-xs text-ink-secondary tabular-price">
                  {{ formatCurrency(item.price, locale) }} / {{ locale === 'ar' ? item.unit_ar : item.unit }}
                </p>
              </NuxtLink>
              <PriceBadge :change="item.change_30d" />
            </li>
          </ul>
        </section>

        <!-- Biggest Risers -->
        <section class="rounded-card border border-border bg-surface p-5 shadow-card space-y-3">
          <div class="flex items-center gap-2">
            <TrendingUp class="h-4 w-4 text-danger" :stroke-width="1.6" />
            <h2 class="text-base font-bold text-ink">
              {{ locale === 'ar' ? 'الأكثر ارتفاعاً (30 يوم)' : 'Top Risers (30 days)' }}
            </h2>
          </div>

          <ul class="divide-y divide-border">
            <li
              v-for="mat in marketStore.biggestRisers"
              :key="mat.slug"
              class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
            >
              <NuxtLink :to="localePath(`/market/${mat.slug}`)" class="text-xs font-semibold text-ink hover:text-primary truncate">
                {{ locale === 'ar' ? mat.label_ar : mat.label_en }}
              </NuxtLink>
              <PriceBadge :change="mat.change_30d" />
            </li>
          </ul>
        </section>

        <!-- Biggest Fallers -->
        <section class="rounded-card border border-border bg-surface p-5 shadow-card space-y-3">
          <div class="flex items-center gap-2">
            <TrendingDown class="h-4 w-4 text-success" :stroke-width="1.6" />
            <h2 class="text-base font-bold text-ink">
              {{ locale === 'ar' ? 'الأكثر انخفاضاً (فرص شراء)' : 'Recent Price Drops' }}
            </h2>
          </div>

          <ul class="divide-y divide-border">
            <li
              v-for="mat in marketStore.biggestFallers"
              :key="mat.slug"
              class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
            >
              <NuxtLink :to="localePath(`/market/${mat.slug}`)" class="text-xs font-semibold text-ink hover:text-primary truncate">
                {{ locale === 'ar' ? mat.label_ar : mat.label_en }}
              </NuxtLink>
              <PriceBadge :change="mat.change_30d" />
            </li>
          </ul>
        </section>
      </aside>
    </div>

    <!-- #methodology Strip -->
    <section id="methodology" class="rounded-card border border-border bg-sand/75 p-6 sm:p-8 space-y-3 scroll-mt-24">
      <h2 class="text-lg font-bold text-ink">
        {{ locale === 'ar' ? 'منهجية جمع ومراجعة أسعار السوق المصري' : 'Methodology & Price Honesty Policy' }}
      </h2>
      <p class="text-sm text-ink-secondary leading-relaxed max-w-4xl">
        {{
          locale === 'ar'
            ? 'يقوم محرك تشطيب بتحديث الأسعار يومياً الساعة 06:00 صباحاً عبر احتساب الوسيط السعري (Median) لقوائم الموزعين المعتمدين ومعارض القاهرة الكبرى والإسكندرية والدلتا. أي قفزة يومية تتجاوز 30% يتم تجميدها تلقائياً للمراجعة البشرية قبل اعتمادها في الحاسبة. تذكر دائماً أن الأسعار المعروضة استرشادية وتختلف باختلاف الفرز والخصومات التجارية وتكلفة المشال.'
            : 'Tashteeb refreshes material benchmarks daily at 06:00 Cairo time using the median across authorized distributor price lists and retail showrooms. Any single-day jump exceeding 30% is automatically quarantined (`flagged_for_review`) until verified. Always confirm batch availability and delivery charges directly with your supplier.'
        }}
      </p>
    </section>
  </div>
</template>
