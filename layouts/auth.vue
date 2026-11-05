<script setup>
import { ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import { buildSeedEstimates } from '~/utils/calc/seed-projects.js'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const sampleRecord = computed(() => buildSeedEstimates()[0])
const sampleCalc = computed(() => sampleRecord.value.computed)

const trustBullets = computed(() =>
  locale.value === 'ar'
    ? [
        'أسعار خامات السوق المصري تتحدث يومياً الساعة 06:00 صباحاً',
        'حساب الكميات الفعلية شاملاً نسبة الهالك العملية لكل بند',
        'تعديل أي سعر يدوياً ومشاركة المقايسة بصيغة PDF أو واتساب'
      ]
    : [
        'Egyptian material prices refreshed daily at 06:00',
        'Real purchase quantities with practical waste included',
        'Override any market price & export clean A4 PDFs or WhatsApp links'
      ]
)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg text-ink">
    <!-- Minimal auth navbar -->
    <header class="border-b border-border bg-surface">
      <div class="shell h-[72px] flex items-center justify-between gap-4">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center min-h-touch">
          <BaseLogo />
        </NuxtLink>

        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <NuxtLink
            :to="localePath('/')"
            class="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-control text-sm font-semibold text-ink-secondary hover:bg-sand hover:text-ink transition-colors"
          >
            <ArrowLeft class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
            <span class="hidden sm:inline">{{ t('nav.backHome') }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Split content -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12">
      <!-- Form side -->
      <main id="main-content" tabindex="-1" class="lg:col-span-7 flex items-center justify-center px-4 py-10 sm:px-8 lg:px-14 outline-none">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </main>

      <!-- Dark-teal preview panel -->
      <aside class="hidden lg:flex lg:col-span-5 flex-col justify-between bg-primary-deep text-surface p-10 xl:p-14">
        <div class="space-y-6">
          <span class="inline-flex items-center gap-2 rounded-pill bg-surface/10 border border-surface/20 px-3 py-1 text-xs font-semibold text-accent-dark">
            {{ locale === 'ar' ? 'معاينة مقايسة حقيقية' : 'SAMPLE FINISHING ESTIMATE' }}
          </span>

          <h2 class="text-2xl xl:text-3xl font-display font-bold text-surface leading-snug">
            {{
              locale === 'ar'
                ? 'اعرف تكلفة تشطيب شقتك بالجنيه قبل ما تبدأ'
                : 'Know every carton, bucket and pound before work begins.'
            }}
          </h2>

          <!-- Visual Material Swatch Collage -->
          <div class="flex items-center gap-2.5">
            <TextureSwatch
              src="/images/materials/porcelain-tile.svg"
              size="sm"
              :zoomable="false"
              alt="Porcelain"
              class="shrink-0 shadow-subtle border border-surface/30"
            />
            <span class="h-10 w-10 rounded-control overflow-hidden border border-surface/30 bg-saffron-500 shadow-subtle shrink-0" />
            <TextureSwatch
              src="/images/materials/doors-wood.svg"
              size="sm"
              :zoomable="false"
              alt="Doors"
              class="shrink-0 shadow-subtle border border-surface/30"
            />
            <span class="h-10 w-10 rounded-control overflow-hidden border border-surface/30 bg-sage-500 shadow-subtle shrink-0" />
            <TextureSwatch
              src="/images/materials/electrical-wire.svg"
              size="sm"
              :zoomable="false"
              alt="Wire"
              class="shrink-0 shadow-subtle border border-surface/30"
            />
          </div>

          <!-- Mini Invoice Preview Card -->
          <div class="rounded-card bg-surface text-ink p-5 shadow-elevated space-y-4">
            <div class="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p class="text-xs font-semibold text-primary">
                  <bdi>#TS-2408</bdi> · Standard
                </p>
                <p class="text-base font-bold text-ink">
                  {{ locale === 'ar' ? 'شقة التجمع الخامس · 120 م²' : 'New Cairo apartment · 120 m²' }}
                </p>
              </div>
              <span class="rounded-pill bg-success-tint px-2.5 py-1 text-xs font-semibold text-success">
                {{ locale === 'ar' ? 'محدث اليوم' : 'Live prices' }}
              </span>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-ink-secondary">{{ locale === 'ar' ? 'الخامات (شامل الهالك)' : 'Materials (incl. waste)' }}</span>
                <span class="tabular-price font-semibold">{{ formatCurrency(sampleCalc.materialsTotal, locale) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-secondary">{{ locale === 'ar' ? 'المصنعيات والتركيب' : 'Labour & workmanship' }}</span>
                <span class="tabular-price font-semibold">{{ formatCurrency(sampleCalc.labourTotal, locale) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-secondary">{{ locale === 'ar' ? 'احتياطي طوارئ (12%)' : 'Contingency reserve (12%)' }}</span>
                <span class="tabular-price font-semibold">{{ formatCurrency(sampleCalc.contingencyAmount, locale) }}</span>
              </div>
            </div>

            <div class="border-t border-border pt-3 flex items-baseline justify-between">
              <span class="text-xs font-bold uppercase text-ink-secondary">
                {{ locale === 'ar' ? 'الإجمالي التقديري' : 'Estimated Grand Total' }}
              </span>
              <span class="tabular-price text-xl font-extrabold text-primary">
                {{ formatCurrency(sampleCalc.grandTotal, locale) }}
              </span>
            </div>
          </div>

          <!-- Trust bullets -->
          <ul class="space-y-3 pt-2">
            <li
              v-for="(bullet, idx) in trustBullets"
              :key="idx"
              class="flex items-start gap-2.5 text-sm text-surface/90"
            >
              <CheckCircle2 class="h-5 w-5 text-accent-dark shrink-0 mt-0.5" :stroke-width="1.5" />
              <span>{{ bullet }}</span>
            </li>
          </ul>
        </div>

        <p class="text-xs text-surface/75 pt-8">
          {{ t('brand.disclaimer') }}
        </p>
      </aside>
    </div>
  </div>
</template>
