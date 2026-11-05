<script setup>
import { ArrowRight, Calculator, Layers } from 'lucide-vue-next'
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
  GOVERNORATES.slice(0, 7).map(g => ({
    value: g.code,
    label: locale.value === 'ar' ? g.label_ar : g.label_en
  }))
)

const packagePills = computed(() => [
  { key: 'economy', label: locale.value === 'ar' ? 'اقتصادي' : 'Economy' },
  { key: 'standard', label: locale.value === 'ar' ? 'قياسي' : 'Standard' },
  { key: 'super_lux', label: locale.value === 'ar' ? 'سوبر لوكس' : 'Super Lux' }
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
  <section class="blueprint-bg border-b border-border py-12 sm:py-16 lg:py-24 overflow-hidden">
    <div class="shell grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
      <!-- Left Copy -->
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center rounded-pill border border-border bg-surface/90 px-3.5 py-1.5 shadow-sm">
          <FreshnessLabel />
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
          <template v-if="locale === 'ar'">
            اعرف التكلفة الفعلية لتشطيب شقتك في مصر
            <span class="text-primary">بأسعار السوق اليوم.</span>
          </template>
          <template v-else>
            Know the real cost of finishing your apartment in
            <span class="text-primary">Egypt.</span>
          </template>
        </h1>

        <p class="text-base sm:text-lg text-ink-secondary max-w-2xl leading-relaxed">
          {{
            locale === 'ar'
              ? 'أدخل مساحة شقتك ومستوى التشطيب واحصل فوراً على مقايسة مفصلة بكميات الشراء الفعلية (شاملة الهالك)، المصنعيات، والجدول الزمني للتنفيذ.'
              : 'Enter your apartment size, finishing level and materials to get an itemized invoice with purchase quantities (waste included), labour costs, and a week-by-week timeline.'
          }}
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-1">
          <BaseButton variant="accent" size="lg" :to="localePath('/calculator')">
            <span>{{ locale === 'ar' ? 'احسب تكلفة شقتك مجاناً' : 'Start free estimate' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          </BaseButton>
          <BaseButton variant="secondary" size="lg" :to="localePath('/market')">
            <span>{{ locale === 'ar' ? 'استعرض بورصة الأسعار' : 'Explore price market' }}</span>
          </BaseButton>
        </div>

        <!-- Social Proof -->
        <div class="flex items-center gap-4 pt-3">
          <div class="flex items-center -space-x-2 rtl:space-x-reverse">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-pill border-2 border-bg bg-primary-tint text-xs font-bold text-primary">
              MK
            </span>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-pill border-2 border-bg bg-accent-tint text-xs font-bold text-accent">
              NH
            </span>
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-pill border-2 border-bg bg-warning-tint text-xs font-bold text-ink">
              SA
            </span>
          </div>
          <div class="text-xs sm:text-sm text-ink-secondary">
            <p class="font-bold text-ink">
              {{
                locale === 'ar'
                  ? 'تقدير تكلفة شفاف ومفصل بأسعار السوق المصري'
                  : 'Transparent finishing cost estimates based on real Egyptian market data'
              }}
            </p>
            <p class="text-xs text-ink-secondary mt-0.5">
              <span>
                {{ locale === 'ar' ? '15 محافظة مصرية · كميات الشراء شاملة الهالك · بدون تسجيل' : '15 governorates · Full purchase quantities with waste · No login required' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Right Interactive Quick Estimate Card -->
      <div class="lg:col-span-5 relative pb-8 sm:pb-10 lg:pb-6">
        <div class="rounded-card border border-border bg-surface p-6 sm:p-7 shadow-elevated space-y-5 relative z-10">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="kicker">{{ locale === 'ar' ? 'حاسبة فورية' : 'QUICK ESTIMATE' }}</p>
              <h2 class="mt-1 text-xl font-bold text-ink">
                {{ locale === 'ar' ? 'معاينة سريعة للتكلفة' : 'Instant cost preview' }}
              </h2>
            </div>
            <span class="grid h-11 w-11 place-items-center rounded-control bg-primary-tint text-primary shrink-0">
              <Calculator class="h-5 w-5" :stroke-width="1.5" />
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BaseInput
              v-model="quickArea"
              type="number"
              :min="40"
              :max="600"
              :label="locale === 'ar' ? 'المساحة الداخلية' : 'Apartment area'"
              :suffix="locale === 'ar' ? 'م²' : 'm²'"
            />
            <SelectField
              v-model="quickGov"
              :label="locale === 'ar' ? 'المحافظة' : 'Governorate'"
              :options="govOptions"
            />
          </div>

          <div class="space-y-1.5">
            <span class="text-sm font-medium text-ink">
              {{ locale === 'ar' ? 'مستوى التشطيب' : 'Finishing level' }}
            </span>
            <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Finishing level">
              <button
                v-for="pkg in packagePills"
                :key="pkg.key"
                type="button"
                role="radio"
                :aria-checked="quickPackage === pkg.key"
                class="min-h-touch rounded-control border px-2 py-2 text-xs sm:text-sm font-semibold transition-all"
                :class="
                  quickPackage === pkg.key
                    ? 'border-2 border-primary bg-primary-tint/50 text-primary'
                    : 'border-border bg-surface text-ink-secondary hover:bg-sand'
                "
                @click="quickPackage = pkg.key"
              >
                {{ pkg.label }}
              </button>
            </div>
          </div>

          <!-- Computed Total Box -->
          <div class="rounded-card bg-sand p-4 space-y-1.5 border border-border/60">
            <div class="flex items-center justify-between text-xs font-bold uppercase text-ink-secondary">
              <span>{{ locale === 'ar' ? 'التكلفة التقديرية الإجمالية' : 'ESTIMATED TOTAL' }}</span>
              <span class="tabular-price text-primary">
                ~{{ formatNumber(quickEstimate.costPerSqm) }} {{ currencySymbol(locale) }}/{{ locale === 'ar' ? 'م²' : 'm²' }}
              </span>
            </div>
            <p class="tabular-price text-2xl sm:text-3xl font-extrabold text-ink">
              {{ formatCurrency(quickEstimate.grandTotal, locale) }}
            </p>
            <p class="tabular-price text-xs text-ink-secondary">
              {{ locale === 'ar' ? 'النطاق المتوقع:' : 'Likely range:' }}
              {{ formatNumber(quickEstimate.rangeMin) }} – {{ formatCurrency(quickEstimate.rangeMax, locale) }}
              · {{ quickEstimate.timeline.totalWeeks }} {{ locale === 'ar' ? 'أسبوع' : 'weeks' }}
            </p>
          </div>

          <BaseButton variant="primary" size="lg" block @click="openInWizard">
            <span>{{ locale === 'ar' ? 'تفصيل البنود والخامات في الحاسبة' : 'Customize materials in full calculator' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          </BaseButton>
        </div>

        <!-- Floating Live Material Ticker Card -->
        <NuxtLink
          v-if="featuredPorcelain"
          :to="localePath(`/market/${featuredPorcelain.slug}`)"
          class="mt-3 sm:mt-0 sm:absolute sm:-bottom-4 sm:-end-3 z-20 flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-elevated hover:border-primary transition-colors"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="grid h-10 w-10 place-items-center rounded-control bg-primary-tint text-primary shrink-0">
              <Layers class="h-5 w-5" :stroke-width="1.5" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-ink">
                {{ locale === 'ar' ? 'بورسلين كليوباترا 60×60' : 'Porcelain 60×60 Cleopatra' }}
              </p>
              <p class="tabular-price text-sm font-bold text-primary">
                {{ formatNumber(featuredPorcelain.price) }} {{ currencySymbol(locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
              </p>
            </div>
          </div>
          <PriceBadge :change-pct="featuredPorcelain.change_30d" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
