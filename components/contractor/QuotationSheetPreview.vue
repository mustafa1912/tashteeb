<script setup>
import { Download, Share2, Printer, EyeOff, Building2 } from 'lucide-vue-next'

const { locale } = useI18n()
const contractorStore = useContractorStore()

const quote = computed(() => contractorStore.quotation)
const company = computed(() => contractorStore.companyProfile)
const client = computed(() => contractorStore.clientInfo)
const terms = computed(() => contractorStore.terms)

const companyDisplayName = computed(() =>
  locale.value === 'ar'
    ? company.value.companyNameAr || company.value.companyName
    : company.value.companyName
)

const pdfDownloadUrl = computed(() => {
  const id = contractorStore.activeEstimateRecord?.id || 'ts-2408'
  const params = new URLSearchParams({
    lang: locale.value,
    ref: contractorStore.quoteRef,
    company: companyDisplayName.value,
    engineer: company.value.engineerName,
    phone: company.value.phone,
    tax: company.value.taxCard,
    client: client.value.clientName,
    address: client.value.unitAddress,
    overhead: String(contractorStore.pricing.overheadPct),
    markup: String(contractorStore.pricing.markupPct),
    vat: String(contractorStore.pricing.vatPct),
    customJson: JSON.stringify(contractorStore.customItems)
  })
  return `/api/pdf/quotation/${id}?${params.toString()}`
})

function handlePrint() {
  if (import.meta.client) window.print()
}

function sendProposalWhatsApp() {
  if (!import.meta.client) return
  const msgLines = [
    locale.value === 'ar'
      ? `📄 عرض سعر تشطيبات متكاملة — ${companyDisplayName.value}`
      : `📄 Turnkey Finishing Quotation — ${companyDisplayName.value}`,
    `${locale.value === 'ar' ? 'رقم العرض:' : 'Ref:'} ${contractorStore.quoteRef}`,
    `${locale.value === 'ar' ? 'مقدم إلى:' : 'Client:'} ${client.value.clientName}`,
    `${locale.value === 'ar' ? 'الوحدة:' : 'Unit:'} ${client.value.unitAddress}`,
    '',
    locale.value === 'ar'
      ? `💰 إجمالي قيمة التعاقد: ${formatCurrency(quote.value.clientGrandTotal, 'ar')}`
      : `💰 Total Turnkey Quotation: ${formatCurrency(quote.value.clientGrandTotal, 'en')}`,
    locale.value === 'ar'
      ? `صالح لمدة ${terms.value.validityDays} يوماً`
      : `Valid for ${terms.value.validityDays} days`
  ]
  window.open(`https://wa.me/?text=${encodeURIComponent(msgLines.join('\n'))}`, '_blank', 'noopener')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Top Client-Safe Privacy Indicator + Export Buttons -->
    <div class="flex flex-wrap items-center justify-between gap-3 no-print">
      <div class="inline-flex items-center gap-2 text-xs font-semibold text-success bg-success-tint px-3 py-1.5 rounded-pill">
        <EyeOff class="h-3.5 w-3.5" :stroke-width="1.6" />
        <span>
          {{
            locale === 'ar'
              ? 'معاينة العميل: التكلفة الخام ونسب الربح مخفية تماماً'
              : 'Client-safe sheet: raw costs & margin % are hidden'
          }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <BaseButton variant="secondary" size="sm" @click="handlePrint">
          <Printer class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'طباعة' : 'Print' }}</span>
        </BaseButton>

        <a
          :href="pdfDownloadUrl"
          target="_blank"
          class="inline-flex min-h-touch items-center justify-center gap-2 rounded-control bg-primary px-3.5 py-2 text-sm font-semibold text-surface hover:bg-primary-hover transition-colors"
        >
          <Download class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تصدير PDF للعميل' : 'Export Quotation PDF' }}</span>
        </a>

        <BaseButton variant="accent" size="sm" @click="sendProposalWhatsApp">
          <Share2 class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'إرسال واتساب' : 'Send WhatsApp' }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- Branded Quotation Paper Sheet -->
    <article class="rounded-card border border-border bg-surface p-6 sm:p-8 shadow-elevated space-y-6">
      <!-- Letterhead -->
      <header class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-primary pb-5">
        <div class="flex items-start gap-3.5">
          <img
            v-if="company.logoDataUrl"
            :src="company.logoDataUrl"
            alt="Company logo"
            class="h-12 w-12 rounded-control object-contain border border-border p-1 bg-surface shrink-0"
          >
          <div
            v-else
            class="h-12 w-12 rounded-control bg-primary-tint text-primary flex items-center justify-center shrink-0"
          >
            <Building2 class="h-6 w-6" :stroke-width="1.5" />
          </div>

          <div class="space-y-0.5">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">
              {{ locale === 'ar' ? 'عرض سعر توريد وتنفيذ تشطيبات' : 'TURNKEY FINISHING QUOTATION' }}
            </span>
            <h2 class="text-xl font-extrabold text-ink">{{ companyDisplayName }}</h2>
            <p class="text-xs text-ink-secondary">
              {{ company.engineerName }} · <bdi>{{ company.phone }}</bdi>
              <span v-if="company.taxCard"> · {{ locale === 'ar' ? 'ب.ض:' : 'Tax ID:' }} <bdi>{{ company.taxCard }}</bdi></span>
            </p>
          </div>
        </div>

        <div class="sm:text-end space-y-1">
          <span class="inline-block rounded-control bg-primary-deep text-surface px-3 py-1 text-sm font-bold tabular-price">
            <bdi>{{ contractorStore.quoteRef }}</bdi>
          </span>
          <p class="text-xs text-ink-secondary">
            {{
              locale === 'ar'
                ? `العرض سارٍ لمدة ${terms.validityDays} يوماً`
                : `Valid for ${terms.validityDays} days`
            }}
          </p>
        </div>
      </header>

      <!-- Client & Total Highlight Box -->
      <div class="rounded-card bg-sand/65 border border-border p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-ink-secondary">
            {{ locale === 'ar' ? 'مقدم إلى السيد / السيدة:' : 'Prepared for client:' }}
          </span>
          <p class="text-base font-bold text-ink">{{ client.clientName }}</p>
          <p class="text-xs text-ink-secondary">{{ client.unitAddress }}</p>
        </div>

        <div class="sm:text-end space-y-0.5">
          <span class="text-xs font-bold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'إجمالي قيمة العرض' : 'Total Turnkey Investment' }}
          </span>
          <p class="tabular-price text-2xl sm:text-3xl font-extrabold text-primary">
            {{ formatCurrency(quote.clientGrandTotal, locale) }}
          </p>
          <p class="text-xs text-ink-secondary tabular-price">
            {{ formatCurrency(quote.clientCostPerSqm, locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
          </p>
        </div>
      </div>

      <!-- Scope of Works Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm border border-border">
          <thead>
            <tr class="bg-sand border-b border-border text-xs uppercase font-bold text-ink-secondary">
              <th class="py-2.5 px-3.5 text-start">{{ locale === 'ar' ? 'البند والمواصفة الفنية المعتمدة' : 'Scope Category & Technical Spec' }}</th>
              <th class="py-2.5 px-3 text-end">{{ locale === 'ar' ? 'الكمية' : 'Qty' }}</th>
              <th class="py-2.5 px-3.5 text-end">{{ locale === 'ar' ? 'إجمالي التوريد والتنفيذ' : 'Supply & Install' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="cat in quote.clientCategories" :key="cat.key">
              <td class="py-3 px-3.5">
                <p class="font-bold text-ink">{{ locale === 'ar' ? cat.label_ar : cat.label_en }}</p>
                <p class="text-xs text-ink-secondary mt-0.5">{{ locale === 'ar' ? cat.scope_ar : cat.scope_en }}</p>
              </td>
              <td class="py-3 px-3 text-end tabular-price whitespace-nowrap text-xs text-ink-secondary">
                {{ formatNumber(cat.qty) }} {{ locale === 'ar' ? cat.sale_unit_ar : cat.sale_unit }}
              </td>
              <td class="py-3 px-3.5 text-end tabular-price whitespace-nowrap font-bold text-ink">
                {{ formatCurrency(cat.client_subtotal, locale) }}
              </td>
            </tr>

            <!-- Custom Contractor Items -->
            <tr v-for="cust in quote.customItems" :key="cust.id" class="bg-primary-tint/30">
              <td class="py-3 px-3.5">
                <p class="font-bold text-ink">{{ locale === 'ar' ? cust.label_ar : cust.label_en }}</p>
                <span class="text-xs text-primary font-semibold">
                  {{ locale === 'ar' ? 'بند هندسي / تصميم' : 'Engineering & custom scope' }}
                </span>
              </td>
              <td class="py-3 px-3 text-end tabular-price whitespace-nowrap text-xs text-ink-secondary">
                {{ cust.qty }} {{ locale === 'ar' ? cust.unit_ar : cust.unit }}
              </td>
              <td class="py-3 px-3.5 text-end tabular-price whitespace-nowrap font-bold text-ink">
                {{ formatCurrency(cust.client_subtotal, locale) }}
              </td>
            </tr>
          </tbody>
          <tfoot class="border-t-2 border-border font-bold">
            <tr v-if="quote.vatPct > 0" class="bg-sand/60 text-xs">
              <td colspan="2" class="py-2.5 px-3.5 text-end">
                {{ locale === 'ar' ? `ضريبة القيمة المضافة (${quote.vatPct}%)` : `Value Added Tax (${quote.vatPct}%)` }}
              </td>
              <td class="py-2.5 px-3.5 text-end tabular-price">{{ formatCurrency(quote.vatAmount, locale) }}</td>
            </tr>
            <tr class="bg-primary-deep text-surface text-base font-extrabold">
              <td colspan="2" class="py-3.5 px-3.5 text-end">
                {{ locale === 'ar' ? 'الإجمالي النهائي لعرض السعر' : 'TOTAL CLIENT QUOTATION' }}
              </td>
              <td class="py-3.5 px-3.5 text-end tabular-price">
                {{ formatCurrency(quote.clientGrandTotal, locale) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Terms & Milestones -->
      <footer class="rounded-control bg-sand/55 border border-border p-4 space-y-2 text-xs text-ink-secondary">
        <p>
          <strong class="text-ink">{{ locale === 'ar' ? 'جدول الدفعات:' : 'Payment schedule:' }}</strong>
          {{ locale === 'ar' ? terms.milestones_ar : terms.milestones_en }}
        </p>
        <p>
          <strong class="text-ink">{{ locale === 'ar' ? 'الضمان الهندسي:' : 'Warranty:' }}</strong>
          {{ locale === 'ar' ? terms.warranty_ar : terms.warranty_en }}
        </p>
      </footer>
    </article>
  </div>
</template>
