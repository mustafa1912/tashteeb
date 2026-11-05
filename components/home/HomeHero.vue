<script setup>
import {
  ArrowRight,
  Calculator,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  TrendingUp
} from 'lucide-vue-next'
import { PACKAGES, GOVERNORATES } from '~/utils/calc/config.js'
import { calculateEstimate } from '~/utils/calc/engine.js'

const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const wizardStore = useWizardStore()
const marketStore = useMarketStore()

const quickArea = ref(120)
const quickPackage = ref('standard')
const quickGov = ref('cairo')

const govOptions = computed(() =>
  GOVERNORATES.slice(0, 8).map(g => ({
    value: g.code,
    label: locale.value === 'ar' ? g.label_ar : g.label_en
  }))
)

const packagePills = computed(() => [
  {
    key: 'economy',
    label: locale.value === 'ar' ? 'اقتصادي' : 'Economy',
    colorClass: 'border-sage-500 text-sage-700 bg-sage-50',
    hoverClass: 'hover:border-sage-500 hover:bg-sage-50/50'
  },
  {
    key: 'standard',
    label: locale.value === 'ar' ? 'قياسي' : 'Standard',
    colorClass: 'border-saffron-500 text-saffron-700 bg-saffron-50',
    hoverClass: 'hover:border-saffron-500 hover:bg-saffron-50/50'
  },
  {
    key: 'super_lux',
    label: locale.value === 'ar' ? 'سوبر لوكس' : 'Super Lux',
    colorClass: 'border-navy-500 text-navy-800 bg-navy-50',
    hoverClass: 'hover:border-navy-500 hover:bg-navy-50/50'
  }
])

const quickEstimate = computed(() =>
  calculateEstimate({
    apartment: {
      unitType: 'apartment',
      area: Math.max(40, Math.min(600, Number(quickArea.value) || 120)),
      governorate: quickGov.value,
      bedrooms: 3,
      bathrooms: 2,
      kitchens: 1,
      reception: 2,
      balconies: 2
    },
    packageKey: quickPackage.value,
    contingencyPct: 0.12,
    materialsCatalog: marketStore.materials
  })
)

// Smooth reactive count-up for grand total
const displayTotal = ref(quickEstimate.value.grandTotal)
let animationFrame = null

watch(
  () => quickEstimate.value.grandTotal,
  (newVal, oldVal) => {
    if (!import.meta.client) {
      displayTotal.value = newVal
      return
    }
    const start = oldVal || displayTotal.value || newVal
    const diff = newVal - start
    const duration = 350
    const startTime = performance.now()

    if (animationFrame) cancelAnimationFrame(animationFrame)

    function step(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      displayTotal.value = Math.round(start + diff * ease)
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        displayTotal.value = newVal
      }
    }
    animationFrame = requestAnimationFrame(step)
  }
)

const featuredPorcelain = computed(() =>
  marketStore.getBySlug('porcelain-60x60-cleopatra')
)

function openInWizard() {
  wizardStore.hydrate()
  wizardStore.apartment.area = Math.max(40, Math.min(600, Number(quickArea.value) || 120))
  wizardStore.apartment.governorate = quickGov.value
  wizardStore.selectPackage(quickPackage.value)
  wizardStore.setStep(0)
  router.push(localePath('/calculator'))
}
</script>

<template>
  <section class="relative bg-plaster-grain border-b border-border/80 py-12 sm:py-16 lg:py-20 overflow-hidden">
    <!-- Ambient paint glow spots in the background -->
    <div class="pointer-events-none absolute -top-24 -start-24 w-96 h-96 rounded-full bg-saffron-100/40 blur-3xl" />
    <div class="pointer-events-none absolute top-1/2 -end-24 w-96 h-96 rounded-full bg-sky-100/40 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-24 start-1/3 w-96 h-96 rounded-full bg-terracotta-100/30 blur-3xl" />

    <div class="shell relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-w-0">
      <!-- Left Copy + Visual Swatch Board -->
      <div class="lg:col-span-7 space-y-6 min-w-0">
        <!-- Freshness chip -->
        <div class="inline-flex items-center gap-2 rounded-pill border border-border/90 bg-surface/90 px-3.5 py-1.5 shadow-subtle backdrop-blur">
          <FreshnessLabel />
        </div>

        <!-- Headline with Paint Brush Highlight -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold text-ink leading-[1.2] tracking-tight">
          <template v-if="locale === 'ar'">
            اعرف التكلفة
            <span class="brush-highlight">الحقيقية</span>
            لتشطيب شقتك في مصر قبل ما تدفع قرش.
          </template>
          <template v-else>
            Know what finishing
            <span class="brush-highlight">really</span>
            costs in Egypt before you pay a piastre.
          </template>
        </h1>

        <!-- Subheading -->
        <p class="text-base sm:text-lg text-ink-secondary max-w-2xl leading-relaxed">
          {{
            locale === 'ar'
              ? 'أدخل مساحة شقتك ومستوى التشطيب واحصل فوراً على مقايسة مفصلة بكميات الشراء الفعلية (شاملة الهالك)، المصنعيات، والجدول الزمني للتنفيذ بأسعار السوق المصري اليوم.'
              : 'Enter your apartment size and finishing level to get an itemized invoice with true purchase quantities (waste included), labour rates, and a week-by-week timeline.'
          }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <BaseButton variant="accent" size="lg" :to="localePath('/calculator')" class="shadow-md hover:shadow-elevated justify-center">
            <span>{{ locale === 'ar' ? 'احسب تكلفة شقتك مجاناً' : 'Start free estimate' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="2" />
          </BaseButton>
          <BaseButton variant="secondary" size="lg" :to="localePath('/market')" class="justify-center">
            <span>{{ locale === 'ar' ? 'استعرض بورصة الأسعار' : 'Explore price market' }}</span>
          </BaseButton>
        </div>

        <!-- Floating Tactile Paint Chips Strip -->
        <div class="pt-4 flex items-center gap-3 overflow-x-auto sm:overflow-visible pb-1 max-w-full flex-nowrap sm:flex-wrap">
          <PaintChip
            name="Super White"
            name-ar="أبيض ناصع"
            code="01"
            finish="Matt"
            price="1,450 ج.م"
            color-hex="#FAF7F2"
            class="scale-90 sm:scale-95 origin-start"
          />
          <PaintChip
            name="Siwa Sage"
            name-ar="ميرمية سيوة"
            code="02"
            finish="Silk"
            price="1,680 ج.م"
            color-hex="#7DBE9A"
            class="scale-90 sm:scale-95 origin-start"
          />
          <PaintChip
            name="Aswan Terracotta"
            name-ar="طمي أسوان"
            code="03"
            finish="Velvet"
            price="1,820 ج.م"
            color-hex="#D8572A"
            class="scale-90 sm:scale-95 origin-start"
          />
        </div>

        <!-- Trust Strip -->
        <div class="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-ink-secondary border-t border-border/80">
          <div class="flex items-center gap-2">
            <CheckCircle2 class="h-4 w-4 text-success shrink-0" :stroke-width="2" />
            <span>{{ locale === 'ar' ? '15 محافظة مصرية بمعاملات نقل واقعية' : '15 governorates with real transport factors' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle2 class="h-4 w-4 text-success shrink-0" :stroke-width="2" />
            <span>{{ locale === 'ar' ? 'كميات شراء فعلية شاملة الهالك' : 'Full purchase quantities + waste' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle2 class="h-4 w-4 text-success shrink-0" :stroke-width="2" />
            <span>{{ locale === 'ar' ? 'مجاني بالكامل بدون تسجيل' : '100% free with no login required' }}</span>
          </div>
        </div>
      </div>

      <!-- Right Interactive Quick Estimate Card -->
      <div class="lg:col-span-5 relative pb-8 sm:pb-10 lg:pb-6 min-w-0">
        <!-- Card Container with Tactile Finish -->
        <div class="rounded-card border border-border/90 bg-surface p-6 sm:p-7 shadow-elevated space-y-5 relative z-10">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="kicker text-primary">{{ locale === 'ar' ? 'حاسبة فورية' : 'QUICK ESTIMATE' }}</p>
              <h2 class="mt-1 text-xl font-display font-bold text-ink">
                {{ locale === 'ar' ? 'معاينة سريعة للتكلفة' : 'Instant cost preview' }}
              </h2>
            </div>
            <span class="grid h-11 w-11 place-items-center rounded-control bg-primary-tint text-primary shrink-0 shadow-subtle">
              <Calculator class="h-5 w-5" :stroke-width="1.5" />
            </span>
          </div>

          <!-- Area Slider + Input Synchronized -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold text-ink">
              <label for="quick-area-slider" class="text-ink-secondary">
                {{ locale === 'ar' ? 'مساحة الشقة (المتر المربع):' : 'Apartment area (sqm):' }}
              </label>
              <span class="tabular-price text-sm font-bold text-primary px-2 py-0.5 rounded-control bg-primary-tint">
                {{ quickArea }} {{ locale === 'ar' ? 'م²' : 'm²' }}
              </span>
            </div>
            <input
              id="quick-area-slider"
              v-model.number="quickArea"
              type="range"
              min="50"
              max="350"
              step="5"
              class="w-full accent-primary cursor-pointer h-2 bg-sand rounded-pill"
            >
            <div class="flex justify-between text-[11px] text-ink-muted">
              <span>50 {{ locale === 'ar' ? 'م²' : 'm²' }}</span>
              <span>120 {{ locale === 'ar' ? 'م² (متوسط)' : 'm² (Avg)' }}</span>
              <span>200 {{ locale === 'ar' ? 'م²' : 'm²' }}</span>
              <span>350 {{ locale === 'ar' ? 'م²' : 'm²' }}</span>
            </div>
          </div>

          <!-- Governorate Selector -->
          <SelectField
            v-model="quickGov"
            :label="locale === 'ar' ? 'المحافظة' : 'Governorate'"
            :options="govOptions"
          />

          <!-- Package Pills with Distinctive Paint Palette Tints -->
          <div class="space-y-1.5">
            <span class="text-xs font-semibold text-ink-secondary">
              {{ locale === 'ar' ? 'مستوى التشطيب:' : 'Finishing level:' }}
            </span>
            <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Finishing level">
              <button
                v-for="pkg in packagePills"
                :key="pkg.key"
                type="button"
                role="radio"
                :aria-checked="quickPackage === pkg.key"
                class="min-h-touch rounded-control border px-2 py-2.5 text-xs sm:text-sm font-semibold transition-all text-center flex flex-col items-center justify-center gap-0.5"
                :class="
                  quickPackage === pkg.key
                    ? `border-2 shadow-sm ${pkg.colorClass}`
                    : `border-border bg-surface text-ink-secondary hover:bg-sand ${pkg.hoverClass}`
                "
                @click="quickPackage = pkg.key"
              >
                <span>{{ pkg.label }}</span>
              </button>
            </div>
          </div>

          <!-- Computed Total Box with Smooth Count-Up -->
          <div class="rounded-card bg-cream p-5 space-y-1.5 border border-border/80 shadow-subtle">
            <div class="flex items-center justify-between text-xs font-bold uppercase text-ink-secondary">
              <span>{{ locale === 'ar' ? 'التكلفة التقديرية الإجمالية' : 'ESTIMATED TOTAL' }}</span>
              <span class="tabular-price text-primary font-bold">
                ~{{ formatNumber(quickEstimate.costPerSqm) }} {{ currencySymbol(locale) }}/{{ locale === 'ar' ? 'م²' : 'م²' }}
              </span>
            </div>
            <p class="tabular-price text-2xl sm:text-3xl font-extrabold text-ink">
              {{ formatCurrency(displayTotal, locale) }}
            </p>
            <p class="tabular-price text-xs text-ink-secondary">
              {{ locale === 'ar' ? 'النطاق المتوقع:' : 'Likely range:' }}
              {{ formatNumber(quickEstimate.rangeMin) }} – {{ formatCurrency(quickEstimate.rangeMax, locale) }}
              · ~{{ quickEstimate.timeline.totalWeeks }} {{ locale === 'ar' ? 'أسبوع تنفيذ' : 'weeks duration' }}
            </p>
          </div>

          <!-- Big Action Button -->
          <BaseButton variant="accent" size="lg" block @click="openInWizard" class="shadow-md hover:shadow-elevated">
            <span>{{ locale === 'ar' ? 'عرض الفاتورة وتخصيص الخامات' : 'Get itemized invoice & customize' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="2" />
          </BaseButton>
        </div>

        <!-- Floating Live Material Ticker Card -->
        <NuxtLink
          v-if="featuredPorcelain"
          :to="localePath(`/market/${featuredPorcelain.slug}`)"
          class="mt-4 sm:mt-0 sm:absolute sm:-bottom-5 sm:end-4 z-20 flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-2.5 shadow-elevated hover:border-primary transition-all group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-10 w-10 rounded-control overflow-hidden border border-border/80 shrink-0">
              <img
                v-if="featuredPorcelain.image_url"
                :src="featuredPorcelain.image_url"
                :alt="locale === 'ar' ? featuredPorcelain.label_ar : featuredPorcelain.label_en"
                class="h-full w-full object-cover group-hover:scale-105 transition-transform"
              >
              <span
                v-else
                class="grid h-full w-full place-items-center bg-primary-tint text-primary"
              >
                <Layers class="h-5 w-5" :stroke-width="1.5" />
              </span>
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-ink group-hover:text-primary transition-colors">
                {{ locale === 'ar' ? 'بورسلين كليوباترا 60×60' : 'Porcelain 60×60 Cleopatra' }}
              </p>
              <p class="tabular-price text-sm font-bold text-primary">
                {{ formatNumber(featuredPorcelain.price) }} <bdi>{{ currencySymbol(locale) }} / م²</bdi>
              </p>
            </div>
          </div>
          <PriceBadge :change-pct="featuredPorcelain.change_30d" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
