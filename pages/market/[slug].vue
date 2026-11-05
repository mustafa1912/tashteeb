<script setup>
import {
  ArrowLeft,
  Calculator,
  Star,
  Store,
  MapPin,
  Layers,
  AlertCircle
} from 'lucide-vue-next'
import { CATEGORIES, GOVERNORATES } from '~/utils/calc/config.js'

definePageMeta({
  layout: 'public'
})

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const marketStore = useMarketStore()
const wizardStore = useWizardStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const slug = computed(() => String(route.params.slug || ''))
const selectedRange = ref('6M')

onMounted(() => {
  marketStore.hydrate()
  authStore.hydrate()
})

const material = computed(() => marketStore.getBySlug(slug.value))

const historyPoints = computed(() => {
  if (!material.value) return []
  return marketStore.getHistory(material.value.slug, selectedRange.value)
})

const historyStats = computed(() => {
  const vals = historyPoints.value.map(p => p.value)
  if (!vals.length) return { low: 0, high: 0 }
  return {
    low: Math.min(...vals),
    high: Math.max(...vals)
  }
})

const categoryLabel = computed(() => {
  if (!material.value) return ''
  return formatCategoryLabel(material.value.category, locale.value)
})

const saleUnitPrice = computed(() => {
  if (!material.value) return 0
  return Math.round(material.value.price * (material.value.coverage_per_unit || 1))
})

const regionalBreakdown = computed(() => {
  if (!material.value) return []
  const featuredCodes = ['cairo', 'giza', 'alexandria', 'dakahlia', 'canal', 'red_sea']
  const list = GOVERNORATES.filter(g => featuredCodes.includes(g.code))
  const maxVal = Math.max(...list.map(g => Math.round(material.value.price * g.factor)))
  return list.map(g => {
    const regionalPrice = Math.round(material.value.price * g.factor)
    return {
      code: g.code,
      label: locale.value === 'ar' ? g.label_ar : g.label_en,
      factor: g.factor,
      price: regionalPrice,
      widthPct: maxVal > 0 ? Math.round((regionalPrice / maxVal) * 100) : 85
    }
  })
})

const categoryVariants = computed(() => {
  if (!material.value) return []
  return marketStore.materials.filter(m => m.category === material.value.category)
})

const relatedMaterials = computed(() => {
  if (!material.value) return []
  return marketStore.materials
    .filter(m => m.slug !== material.value.slug)
    .slice(0, 4)
})

const faqItems = computed(() => {
  if (!material.value) return []
  const nameEn = material.value.label_en
  const nameAr = material.value.label_ar
  const avgEn = formatCurrency(material.value.price, 'en')
  const avgAr = formatCurrency(material.value.price, 'ar')
  const wastePct = Math.round((material.value.waste_pct || 0) * 100)

  if (locale.value === 'ar') {
    return [
      {
        question: `كم سعر ${nameAr} في مصر اليوم؟`,
        answer: `يبلغ متوسط سعر ${nameAr} في السوق المصري اليوم حوالي ${avgAr} لكل ${material.value.unit_ar}، ويتراوح بين ${formatCurrency(material.value.min_price, 'ar')} و${formatCurrency(material.value.max_price, 'ar')} حسب المعرض والفرز والكمية.`
      },
      {
        question: `ما هي نسبة الهالك العملية عند شراء ${nameAr}؟`,
        answer: `يوصي مهندسو التنفيذ بإضافة نسبة هالك عملي قدرها ${wastePct}% مع تقريب الكمية لأعلى (ceil) لأقرب ${material.value.sale_unit_ar} كاملة لتفادي نقص التشغيلة أثناء التركيب.`
      },
      {
        question: 'هل يشمل هذا السعر مصنعية التركيب؟',
        answer:
          material.value.labour_price > 0
            ? `السعر المعروض (${avgAr}) هو سعر توريد الخامة فقط. تقدر متوسط مصنعية التركيب بحوالي ${formatCurrency(material.value.labour_price, 'ar')} لكل ${material.value.unit_ar} وتُحسب منفصلة في مقايسة تشطيب.`
            : 'هذا المؤشر يعبر عن سعر التوريد المرجعي في السوق المصري كما هو موضح في مواصفة البند.'
      }
    ]
  }

  return [
    {
      question: `What is the price of ${nameEn} in Egypt today?`,
      answer: `As of today, ${nameEn} averages ${avgEn} per ${material.value.unit} across Egyptian showrooms, with retail quotes ranging between ${formatCurrency(material.value.min_price, 'en')} and ${formatCurrency(material.value.max_price, 'en')}.`
    },
    {
      question: `How much site waste should I add when ordering ${nameEn}?`,
      answer: `Tashteeb’s calculation engine adds ${wastePct}% practical site waste and always rounds up (ceil) to whole ${material.value.sale_unit}s so you never run short mid-installation.`
    },
    {
      question: 'Does this market rate include installation labour?',
      answer:
        material.value.labour_price > 0
          ? `No — ${avgEn} is the material supply price. Average Egyptian workmanship for this item is ~${formatCurrency(material.value.labour_price, 'en')} per ${material.value.unit}, itemized separately in the calculator.`
          : 'This benchmark reflects the market supply rate as described in the specification.'
    }
  ]
})

function handleUseInEstimate() {
  if (!material.value) return
  wizardStore.prefillMaterialFromMarket(material.value)
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم إدراج الخامة في الحاسبة' : 'Material loaded into Calculator',
    type: 'success'
  })
  navigateTo(localePath('/calculator'))
}

function handleToggleTrack() {
  if (!material.value) return
  const watched = marketStore.toggleWatchlist(material.value.slug)
  $fetch('/api/watchlist/toggle', {
    method: 'POST',
    body: { slug: material.value.slug, userId: authStore.user?.id || 'guest' }
  }).catch(() => {})
  uiStore.showToast({
    title: watched
      ? (locale.value === 'ar' ? 'تم تفعيل متابعة السعر' : 'Tracking material in watchlist')
      : (locale.value === 'ar' ? 'تم إيقاف متابعة السعر' : 'Removed from watchlist'),
    type: 'info'
  })
}

useSeoSchema(() => {
  if (!material.value) {
    return {
      path: `/market/${slug.value}`,
      title: 'Material Not Found — Tashteeb'
    }
  }

  const m = material.value
  const siteUrl = (config.public?.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  const updatedStr = formatDateDisplay(m.fetched_at, locale.value)
  const name = locale.value === 'ar' ? m.label_ar : m.label_en

  return {
    path: `/market/${m.slug}`,
    ogType: 'product',
    title:
      locale.value === 'ar'
        ? `سعر ${m.label_ar} اليوم في مصر — تحديث ${updatedStr} | تشطيب`
        : `${m.label_en} Price in Egypt — Updated ${updatedStr} | Tashteeb`,
    description:
      locale.value === 'ar'
        ? `تعرف على سعر ${m.label_ar} (${m.brand}) اليوم: المتوسط ${m.price} ج.م/${m.unit_ar} مع منحنى تغير الأسعار لآخر 6 أشهر ومقارنة المحافظات.`
        : `Live ${m.label_en} (${m.brand}) price in Egypt: average ${m.price} EGP/${m.unit} (min ${m.min_price} – max ${m.max_price} EGP), 6-month chart & regional rates.`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Price Market', item: `${siteUrl}/market` },
          { '@type': 'ListItem', position: 3, name, item: `${siteUrl}/market/${m.slug}` }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        brand: { '@type': 'Brand', name: m.brand || 'Egyptian Market' },
        category: categoryLabel.value,
        description: m.store_tip_en || name,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'EGP',
          lowPrice: m.min_price,
          highPrice: m.max_price,
          offerCount: 6
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.value.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer
          }
        }))
      }
    ]
  }
})
</script>

<template>
  <div class="shell py-10 sm:py-12 space-y-8">
    <!-- Missing slug fallback -->
    <EmptyState
      v-if="!material"
      :title="locale === 'ar' ? 'لم يتم العثور على هذه الخامة' : 'Material not found in Price Market'"
      :description="locale === 'ar' ? 'تصفح فهرس بورصة الأسعار الكامل للاطلاع على أحدث أسعار الخامات.' : 'Browse the full Egyptian finishing price index to inspect daily-updated materials.'"
    >
      <template #icon>
        <AlertCircle class="h-8 w-8 text-warning" :stroke-width="1.5" />
      </template>
      <NuxtLink :to="localePath('/market')">
        <BaseButton variant="primary">
          {{ locale === 'ar' ? 'العودة إلى بورصة الأسعار' : 'Browse Price Market' }}
        </BaseButton>
      </NuxtLink>
    </EmptyState>

    <template v-else>
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-ink-secondary">
        <NuxtLink :to="localePath('/market')" class="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'بورصة الأسعار' : 'Price Market' }}</span>
        </NuxtLink>
        <span>/</span>
        <span>{{ categoryLabel }}</span>
        <span>/</span>
        <span class="font-medium text-ink truncate max-w-xs">
          {{ locale === 'ar' ? material.label_ar : material.label_en }}
        </span>
      </nav>

      <!-- Hero MIN / AVG / MAX Card -->
      <section class="rounded-card border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div class="space-y-2 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="rounded-pill bg-primary-tint px-3 py-0.5 text-xs font-bold text-primary">
                {{ material.brand }}
              </span>
              <FreshnessLabel />
              <PriceBadge :change="material.change_30d" />
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-ink">
              {{ locale === 'ar' ? material.label_ar : material.label_en }}
            </h1>

            <p v-if="material.coverage_per_unit && material.coverage_per_unit !== 1" class="text-sm text-ink-secondary tabular-price">
              {{
                locale === 'ar'
                  ? `تُباع بالـ ${material.sale_unit_ar} (تغطي ${material.coverage_per_unit} ${material.unit_ar}) ≈ ${formatCurrency(saleUnitPrice, 'ar')} للـ ${material.sale_unit_ar}`
                  : `Sold per ${material.sale_unit} (covers ${material.coverage_per_unit} ${material.unit}) ≈ ${formatCurrency(saleUnitPrice, 'en')} / ${material.sale_unit}`
              }}
            </p>
          </div>

          <!-- Primary CTAs -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <BaseButton
              variant="secondary"
              @click="handleToggleTrack"
            >
              <Star
                class="h-4 w-4"
                :class="marketStore.isWatched(material.slug) ? 'fill-warning text-warning' : ''"
                :stroke-width="1.6"
              />
              <span>
                {{
                  marketStore.isWatched(material.slug)
                    ? (locale === 'ar' ? 'متابَع في قائمتك' : 'Tracking')
                    : (locale === 'ar' ? 'متابعة السعر' : 'Track material')
                }}
              </span>
            </BaseButton>

            <BaseButton
              v-if="material.is_calculator_item !== false"
              variant="accent"
              @click="handleUseInEstimate"
            >
              <Calculator class="h-4 w-4" :stroke-width="1.5" />
              <span>{{ locale === 'ar' ? 'استخدم هذا السعر في مقايسة شقتي' : 'Use this price in my estimate' }}</span>
            </BaseButton>
          </div>
        </div>

        <!-- 3-Column MIN / MARKET AVG / MAX -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="rounded-card border border-border bg-sand/55 p-5">
            <span class="text-xs font-bold uppercase text-ink-secondary">
              {{ locale === 'ar' ? 'أقل سعر رُصد (التجاري)' : 'Minimum retail quote' }}
            </span>
            <p class="mt-1 text-2xl font-extrabold text-success tabular-price">
              {{ formatCurrency(material.min_price, locale) }}
              <span class="text-xs font-medium text-ink-secondary">/ {{ locale === 'ar' ? material.unit_ar : material.unit }}</span>
            </p>
          </div>

          <div class="rounded-card bg-primary-deep text-surface p-5">
            <span class="text-xs font-bold uppercase text-accent-dark">
              {{ locale === 'ar' ? 'متوسط السوق المعتمد اليوم' : 'Egyptian Market Average' }}
            </span>
            <p class="mt-1 text-3xl font-extrabold text-surface tabular-price">
              {{ formatCurrency(material.price, locale) }}
              <span class="text-xs font-medium text-surface/75">/ {{ locale === 'ar' ? material.unit_ar : material.unit }}</span>
            </p>
          </div>

          <div class="rounded-card border border-border bg-sand/55 p-5">
            <span class="text-xs font-bold uppercase text-ink-secondary">
              {{ locale === 'ar' ? 'أعلى سعر معارض كبرى' : 'Upper showroom quote' }}
            </span>
            <p class="mt-1 text-2xl font-extrabold text-ink tabular-price">
              {{ formatCurrency(material.max_price, locale) }}
              <span class="text-xs font-medium text-ink-secondary">/ {{ locale === 'ar' ? material.unit_ar : material.unit }}</span>
            </p>
          </div>
        </div>

        <!-- Showroom Buying Tip -->
        <div
          v-if="material.store_tip_en || material.store_tip_ar"
          class="rounded-control bg-primary-tint/50 border border-primary/20 px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-ink"
        >
          <Store class="h-4 w-4 text-primary shrink-0 mt-0.5" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? material.store_tip_ar || material.store_tip_en : material.store_tip_en }}</span>
        </div>
      </section>

      <!-- Interactive Historical Chart + 4 Stat Cards -->
      <section class="rounded-card border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-ink">
            {{ locale === 'ar' ? 'منحنى تغير السعر التاريخي' : 'Historical price trend' }}
          </h2>
          <p class="text-xs sm:text-sm text-ink-secondary">
            {{
              locale === 'ar'
                ? 'مرر المؤشر فوق الرسم البياني لمعاينة السعر اليومي المسجل.'
                : 'Hover or scrub across the chart to inspect daily Egyptian market snapshots.'
            }}
          </p>
        </div>

        <LineChart
          :points="historyPoints"
          :ranges="['1M', '3M', '6M', '1Y']"
          :selected-range="selectedRange"
          :unit-label="`${currencySymbol(locale)}/${locale === 'ar' ? material.unit_ar : material.unit}`"
          :height="260"
          @update:selected-range="val => (selectedRange = val)"
        />

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-border">
          <div>
            <span class="text-xs text-ink-secondary block">{{ locale === 'ar' ? 'أدنى سعر في الفترة' : 'Period low' }}</span>
            <strong class="tabular-price text-base font-bold text-success">{{ formatCurrency(historyStats.low, locale) }}</strong>
          </div>
          <div>
            <span class="text-xs text-ink-secondary block">{{ locale === 'ar' ? 'أعلى سعر في الفترة' : 'Period high' }}</span>
            <strong class="tabular-price text-base font-bold text-ink">{{ formatCurrency(historyStats.high, locale) }}</strong>
          </div>
          <div>
            <span class="text-xs text-ink-secondary block">{{ locale === 'ar' ? 'تغير آخر 30 يوم' : '30-day change' }}</span>
            <PriceBadge :change="material.change_30d" class="mt-0.5" />
          </div>
          <div>
            <span class="text-xs text-ink-secondary block">{{ locale === 'ar' ? 'نسبة الهالك المعتمدة' : 'Standard site waste' }}</span>
            <strong class="tabular-price text-base font-bold text-ink">
              <bdi>+{{ Math.round((material.waste_pct || 0) * 100) }}%</bdi>
            </strong>
          </div>
        </div>
      </section>

      <!-- Governorate Comparison + Alternatives -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Regional Bars -->
        <section class="lg:col-span-6 rounded-card border border-border bg-surface p-6 shadow-card space-y-4">
          <div class="flex items-center gap-2">
            <MapPin class="h-5 w-5 text-primary" :stroke-width="1.5" />
            <h2 class="text-lg font-bold text-ink">
              {{ locale === 'ar' ? 'مقارنة السعر حسب المحافظة' : 'Average price by governorate' }}
            </h2>
          </div>

          <div class="space-y-3">
            <div v-for="reg in regionalBreakdown" :key="reg.code" class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-ink">{{ reg.label }} ({{ reg.factor.toFixed(2) }}×)</span>
                <span class="tabular-price font-bold text-primary">{{ formatCurrency(reg.price, locale) }}</span>
              </div>
              <div class="h-2.5 rounded-pill bg-sand overflow-hidden">
                <div class="h-full rounded-pill bg-primary" :style="{ width: `${reg.widthPct}%` }" />
              </div>
            </div>
          </div>
        </section>

        <!-- Category Grade Comparison Table -->
        <section class="lg:col-span-6 rounded-card border border-border bg-surface p-6 shadow-card space-y-4">
          <div class="flex items-center gap-2">
            <Layers class="h-5 w-5 text-primary" :stroke-width="1.5" />
            <h2 class="text-lg font-bold text-ink">
              {{ locale === 'ar' ? 'مقارنة الفئات والبدائل في نفس القسم' : 'Grade & brand alternatives' }}
            </h2>
          </div>

          <div class="divide-y divide-border">
            <NuxtLink
              v-for="alt in categoryVariants"
              :key="alt.slug"
              :to="localePath(`/market/${alt.slug}`)"
              class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:text-primary transition-colors"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold truncate" :class="alt.slug === material.slug ? 'text-primary' : 'text-ink'">
                  {{ locale === 'ar' ? alt.label_ar : alt.label_en }}
                </p>
                <p class="text-xs text-ink-secondary">{{ alt.brand }}</p>
              </div>
              <div class="text-end shrink-0">
                <p class="tabular-price text-sm font-extrabold text-ink">
                  {{ formatCurrency(alt.price, locale) }}
                </p>
                <PriceBadge :change="alt.change_30d" />
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>

      <!-- SEO FAQ Section -->
      <section class="space-y-4">
        <h2 class="text-xl font-bold text-ink">
          {{ locale === 'ar' ? 'أسئلة شائعة حول السعر والتوريد' : 'Frequently asked pricing questions' }}
        </h2>
        <BaseAccordion :items="faqItems" />
      </section>

      <!-- Related Materials -->
      <section class="space-y-4">
        <h2 class="text-lg font-bold text-ink">
          {{ locale === 'ar' ? 'خامات أخرى يتابعها المقبلون على التشطيب' : 'Other tracked finishing materials' }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="rel in relatedMaterials"
            :key="rel.slug"
            :to="localePath(`/market/${rel.slug}`)"
            class="rounded-card border border-border bg-surface p-4 shadow-card hover:border-primary transition-colors space-y-2"
          >
            <p class="text-xs font-semibold text-ink-secondary">{{ rel.brand }}</p>
            <p class="text-sm font-bold text-ink line-clamp-2">
              {{ locale === 'ar' ? rel.label_ar : rel.label_en }}
            </p>
            <div class="flex items-center justify-between pt-1">
              <strong class="tabular-price text-sm font-extrabold text-primary">
                {{ formatCurrency(rel.price, locale) }}
              </strong>
              <PriceBadge :change="rel.change_30d" />
            </div>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>
