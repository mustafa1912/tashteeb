<script setup>
import { HardHat, ShieldCheck, Percent, FileSpreadsheet, ArrowDown } from 'lucide-vue-next'

const { locale } = useI18n()
const contractorStore = useContractorStore()

const quote = computed(() => contractorStore.quotation)
const companyDisplay = computed(() =>
  locale.value === 'ar'
    ? contractorStore.companyProfile.companyNameAr || contractorStore.companyProfile.companyName
    : contractorStore.companyProfile.companyName
)

const pillars = computed(() =>
  locale.value === 'ar'
    ? [
        { icon: Percent, text: 'نسب إشراف وربح خاصة بك تُوزع تلقائياً دون ظهور التكلفة الخام للعميل' },
        { icon: ShieldCheck, text: 'شعار مكتبك الهندسي والبطاقة الضريبية وشروط الدفعات والضمان' },
        { icon: FileSpreadsheet, text: 'تصدير عرض سعر A4 PDF احترافي أو إرساله عبر واتساب في ثوانٍ' }
      ]
    : [
        { icon: Percent, text: 'Private overhead & profit sliders baked invisibly into client line items' },
        { icon: ShieldCheck, text: 'Your engineering office logo, tax ID, payment milestones & warranty' },
        { icon: FileSpreadsheet, text: 'Export client-ready A4 PDFs or send proposals via WhatsApp' }
      ]
)
</script>

<template>
  <section class="bg-primary-deep text-surface py-14 sm:py-20 border-b border-surface/10">
    <div class="shell grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <!-- Left Copy -->
      <div class="lg:col-span-7 space-y-6">
        <span class="inline-flex items-center gap-2 rounded-pill bg-surface/10 border border-surface/20 px-3.5 py-1 text-xs font-bold text-accent-dark">
          <HardHat class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'مساحة عمل المهندسين والمقاولين' : 'TASHTEEB FOR CONTRACTORS & ENGINEERS' }}</span>
        </span>

        <h1 class="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-surface leading-tight">
          {{
            locale === 'ar'
              ? 'حوّل مقايسة الخامات إلى عرض سعر رسمي باسم مكتبك في 60 ثانية.'
              : 'Turn raw finishing estimates into branded client quotations in 60 seconds.'
          }}
        </h1>

        <p class="text-base sm:text-lg text-surface/85 max-w-2xl leading-relaxed">
          {{
            locale === 'ar'
              ? 'اضبط مصاريف التشغيل ونسبة الإشراف الهندسي وأضف بنود التصميم ثلاثي الأبعاد، وسيقوم تشطيب بإصدار عرض سعر متكامل للعميل دون كشف تكلفة الخامات الخام.'
              : 'Add your site overhead, engineering fee, and 3D design packages on top of live Egyptian market estimates—without ever exposing raw contractor costs.'
          }}
        </p>

        <ul class="space-y-3 pt-1">
          <li
            v-for="(pillar, idx) in pillars"
            :key="idx"
            class="flex items-start gap-3 text-sm sm:text-base text-surface/90"
          >
            <component :is="pillar.icon" class="h-5 w-5 text-accent-dark shrink-0 mt-0.5" :stroke-width="1.5" />
            <span>{{ pillar.text }}</span>
          </li>
        </ul>

        <div class="pt-2 flex flex-wrap items-center gap-3">
          <a href="#quotation-builder">
            <BaseButton variant="accent" size="lg">
              <span>{{ locale === 'ar' ? 'ابدأ إعداد عرض السعر الآن' : 'Build client quotation' }}</span>
              <ArrowDown class="h-4 w-4" :stroke-width="1.6" />
            </BaseButton>
          </a>
        </div>
      </div>

      <!-- Right Floating Unified Quotation Preview Card -->
      <div class="lg:col-span-5">
        <div class="rounded-card bg-surface text-ink p-6 shadow-elevated space-y-5">
          <div class="flex items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-primary">
                {{ companyDisplay }}
              </p>
              <p class="text-base font-extrabold text-ink mt-0.5">
                {{ locale === 'ar' ? 'عرض سعر للعميل:' : 'Client:' }}
                {{ contractorStore.clientInfo.clientName }}
              </p>
              <p class="text-xs text-ink-secondary mt-0.5">
                <bdi>{{ contractorStore.clientInfo.unitAddress }}</bdi>
              </p>
            </div>

            <span class="rounded-control bg-primary-deep text-surface px-2.5 py-1 text-xs font-bold tabular-price shrink-0">
              <bdi>{{ contractorStore.quoteRef }}</bdi>
            </span>
          </div>

          <!-- Private Margin Breakdown Box -->
          <div class="rounded-control bg-sand/75 border border-border p-3.5 space-y-2 text-xs">
            <div class="flex items-center justify-between font-semibold text-ink-secondary">
              <span>{{ locale === 'ar' ? 'التكلفة الفعلية الأساسية (مخفية عن العميل)' : 'Base estimate cost (hidden from client)' }}</span>
              <span class="tabular-price text-ink">{{ formatCurrency(quote.rawCost, locale) }}</span>
            </div>
            <div class="flex items-center justify-between font-semibold text-ink-secondary">
              <span>
                {{ locale === 'ar' ? 'التشغيل والربح الهندسي' : 'Overhead + Profit margin' }}
                (<bdi>{{ contractorStore.pricing.overheadPct }}% + {{ contractorStore.pricing.markupPct }}%</bdi>)
              </span>
              <span class="tabular-price text-success font-bold">
                <span dir="ltr" class="inline-block">+{{ Math.round(quote.netMarginAmount).toLocaleString('en-US') }}</span>
                {{ locale === 'ar' ? 'ج.م' : 'EGP' }}
              </span>
            </div>
            <div v-if="quote.customItemsTotal > 0" class="flex items-center justify-between font-semibold text-ink-secondary">
              <span>{{ locale === 'ar' ? 'بنود إضافية وتصميم' : 'Custom scope items' }}</span>
              <span class="tabular-price text-ink">
                <span dir="ltr" class="inline-block">+{{ Math.round(quote.customItemsTotal).toLocaleString('en-US') }}</span>
                {{ locale === 'ar' ? 'ج.م' : 'EGP' }}
              </span>
            </div>
          </div>

          <!-- Identical Unified Client Grand Total -->
          <div class="border-t border-border pt-4 flex items-baseline justify-between gap-3">
            <div>
              <span class="text-xs font-bold uppercase text-ink-secondary block">
                {{ locale === 'ar' ? 'إجمالي عرض السعر للعميل' : 'CLIENT QUOTATION TOTAL' }}
              </span>
              <span class="text-xs text-ink-secondary tabular-price">
                {{ formatCurrency(quote.clientCostPerSqm, locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
              </span>
            </div>
            <strong class="tabular-price text-2xl sm:text-3xl font-extrabold text-primary">
              {{ formatCurrency(quote.clientGrandTotal, locale) }}
            </strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

