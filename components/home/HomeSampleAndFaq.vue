<script setup>
import { CheckCircle2, ArrowRight, Pencil, ShieldCheck, FileText, ChevronRight } from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const estimatesStore = useEstimatesStore()

const ctaAreaInput = ref(120)

const sampleRecord = computed(() =>
  estimatesStore.getById('ts-2408') || estimatesStore.estimates[0]
)

const sampleItems = computed(() => {
  const items = sampleRecord.value?.computed?.items || []
  return items.slice(0, 4)
})

const sampleSegments = computed(() => {
  const c = sampleRecord.value?.computed
  if (!c) return []
  return [
    { key: 'mat', label: locale.value === 'ar' ? 'الخامات' : 'Materials', value: c.materialsTotal },
    { key: 'lab', label: locale.value === 'ar' ? 'المصنعيات' : 'Labour', value: c.labourTotal },
    { key: 'con', label: locale.value === 'ar' ? 'الطوارئ' : 'Contingency', value: c.contingencyAmount }
  ]
})

const sampleBullets = computed(() =>
  locale.value === 'ar'
    ? [
        'كميات شراء مقربة لأعلى وحدة بيع صحيحة (كرتونة، بستلة، نقطة) لحمايتك من عجز الموقع',
        'فصل شفاف بين تكلفة الخامات المادية والمصنعيات واحتياطي الطوارئ',
        'توثيق أي سعر معدل يدوياً بشارة كهرمانية وملاحظة واضحة في الفاتورة',
        'جدول زمني بالأسابيع يوضح تسلسل المراحل والتداخل بين بنود التأسيس'
      ]
    : [
        'Purchase quantities rounded up to full cartons, buckets & points to prevent site shortage',
        'Clear separation of materials, labour workmanship, and contingency reserve',
        'Auditable amber badges whenever a market rate is manually overridden',
        'Week-by-week construction Gantt schedule mapping parallel MEP rough-in phases'
      ]
)

const faqItems = computed(() =>
  locale.value === 'ar'
    ? [
        {
          question: 'من أين تأتي أسعار الخامات وكيف يتم تحديثها؟',
          answer: 'نعتمد على متوسطات أسعار استرشادية مبنية على معايير السوق المصري ومسوح دورية للمعارض والموزعين، مع نسب هالك عملية ومعاملات نقل لكل محافظة.'
        },
        {
          question: 'لماذا تحسبون الكميات بالكرتونة والبستلة وليس بالمتر الصافي فقط؟',
          answer: 'لأنك في الواقع تشتري كراتين سيراميك كاملة (مثلاً 1.44 م² للكرتونة + 10% هالك قص وتركيب). تسعير الكراتين الفعلية يحميك من عجز الميزانية أثناء التنفيذ.'
        },
        {
          question: 'هل يمكنني تعديل سعر بند حصلت فيه على عرض خاص؟',
          answer: 'نعم! اضغط على أيقونة القلم بجانب أي خامة، أدخل سعرك الفعلي، وسيُعاد حساب الإجمالي فوراً مع إظهار ملاحظة واضحة: "تم تعديل السعر من X إلى Y".'
        },
        {
          question: 'هل أحتاج إلى إنشاء حساب لاستخدام الحاسبة؟',
          answer: 'لا. يمكنك حساب شقتك بالكامل وتجربة كل الخطوات بدون تسجيل، ويتم حفظ تقدمك تلقائياً على متصفحك. تحتاج الحساب فقط لحفظ عدة مقايسات والرجوع إليها من أي جهاز.'
        },
        {
          question: 'هل تصلح المقايسة للمهندسين وشركات التشطيب؟',
          answer: 'بالتأكيد. يوفر "وضع المقاولين" إمكانية إضافة شعار شركتك، نسبة المصاريف الإدارية وهامش الربح، وتصدير عرض سعر رسمي للعميل يخفي تكلفة المقاول ويعرض سعر العميل النهائي.'
        }
      ]
    : [
        {
          question: 'Where do Tashteeb’s material prices come from?',
          answer: 'Estimated prices based on Egyptian market benchmarks, practical waste factors, and regional adjustments.'
        },
        {
          question: 'Why do you round quantities up to full cartons and buckets?',
          answer: 'Showrooms sell full cartons (e.g. 1.44 m²/carton) and 18L buckets — never fractions. Including practical site waste (5–12%) and ceiling to whole units prevents mid-project budget surprises.'
        },
        {
          question: 'Can I override a price if I already got a supplier quote?',
          answer: 'Yes. Click the pencil icon on any material card or invoice row to enter your exact price. Totals recalculate instantly and display an honest note: "Price edited from X to Y".'
        },
        {
          question: 'Do I have to sign up before calculating my apartment?',
          answer: 'No. The entire 5-step wizard works logged-out and persists in your browser. Create a free account whenever you want to save multiple apartments or share links across devices.'
        },
        {
          question: 'How does Contractor Mode work for engineers and finishing firms?',
          answer: 'Contractor Mode lets you load any estimate, add overhead %, markup %, optional VAT, custom scope lines, and your company logo to export a client-facing PDF quotation.'
        }
      ]
)

function handleCtaStart() {
  const area = Math.max(40, Math.min(600, Number(ctaAreaInput.value) || 120))
  const wizardStore = useWizardStore()
  wizardStore.hydrate()
  wizardStore.apartment.area = area
  router.push(localePath('/calculator'))
}
</script>

<template>
  <div>
    <!-- Sample Invoice Preview -->
    <section class="shell section-pad grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 space-y-6">
        <p class="kicker text-primary">{{ locale === 'ar' ? 'نموذج فاتورة تشطيب حقيقية' : 'TRANSPARENT ITEMIZED INVOICE' }}</p>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink leading-tight">
          {{
            locale === 'ar'
              ? 'مقايسة واضحة تفهمها أنت والمهندس والصنايعي'
              : 'An invoice you, your architect, and your tradesmen can all trust'
          }}
        </h2>
        <p class="text-base text-ink-secondary leading-relaxed">
          {{
            locale === 'ar'
              ? 'لا مزيد من الأرقام الإجمالية الغامضة. كل بند يوضح كمية الشراء الفعلية (شاملة الهالك)، سعر الوحدة، والمصنعية مع تدقيق فوري للمجموع.'
              : 'Every category clearly distinguishes net area, site waste allowance, purchased units, material rates, and workmanship.'
          }}
        </p>

        <ul class="space-y-3">
          <li
            v-for="(b, idx) in sampleBullets"
            :key="idx"
            class="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-ink"
          >
            <CheckCircle2 class="h-4 w-4 text-success shrink-0 mt-0.5" :stroke-width="2" />
            <span>{{ b }}</span>
          </li>
        </ul>

        <div class="pt-2">
          <BaseButton variant="primary" size="lg" :to="localePath('/estimate/ts-2408')" class="shadow-sm">
            <span>{{ locale === 'ar' ? 'افتح المقايسة الكاملة #TS-2408' : 'Open full sample invoice #TS-2408' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.8" />
          </BaseButton>
        </div>
      </div>

      <!-- Paper Invoice Preview Sheet -->
      <div class="lg:col-span-7">
        <div
          v-if="sampleRecord"
          class="rounded-card border border-border/90 bg-surface p-6 sm:p-8 shadow-elevated space-y-5 relative overflow-hidden"
        >
          <!-- Corner Stamp -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-4">
            <BaseLogo size="sm" />
            <div class="text-end">
              <p class="text-xs font-bold text-primary">
                <bdi>{{ sampleRecord.refCode }}</bdi> · STANDARD
              </p>
              <p class="text-xs text-ink-secondary">
                {{ locale === 'ar' ? sampleRecord.title_ar : sampleRecord.title }} · 120 {{ locale === 'ar' ? 'م²' : 'm²' }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase text-ink-secondary">
                {{ locale === 'ar' ? 'الإجمالي التقديري للمقايسة' : 'ESTIMATED GRAND TOTAL' }}
              </p>
              <p class="tabular-price text-3xl font-display font-extrabold text-ink mt-1">
                {{ formatCurrency(sampleRecord.computed.grandTotal, locale) }}
              </p>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-pill bg-warning-tint px-3 py-1 text-xs font-semibold text-ink border border-warning/30">
              <Pencil class="h-3.5 w-3.5 text-warning" :stroke-width="1.5" />
              <span>
                {{ sampleRecord.computed.editedCount }}
                {{ locale === 'ar' ? 'أسعار معدلة يدوياً' : 'prices edited' }}
              </span>
            </span>
          </div>

          <!-- Sample Line Items with Texture Swatch -->
          <div class="divide-y divide-border border-y border-border">
            <div
              v-for="item in sampleItems"
              :key="item.id"
              class="py-3 px-3 -mx-3 flex items-center justify-between gap-3 text-sm hover:bg-sand/30 transition-colors"
              :class="item.override ? 'bg-warning-tint/35 border-s-4 border-warning ps-3' : ''"
            >
              <div class="flex items-center gap-3 min-w-0">
                <TextureSwatch
                  :src="item.image_url"
                  :color="item.swatch_color"
                  size="xs"
                  :zoomable="false"
                  :alt="locale === 'ar' ? item.label_ar : item.label_en"
                  class="shrink-0 shadow-subtle border border-border/80"
                />
                <div class="min-w-0 space-y-0.5">
                  <p class="font-semibold text-ink truncate text-xs sm:text-sm">
                    {{ locale === 'ar' ? item.label_ar : item.label_en }}
                  </p>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-ink-secondary tabular-price">
                    <span>
                      {{ item.purchased_qty }} {{ locale === 'ar' ? item.sale_unit_ar : item.sale_unit }}
                      × {{ formatNumber(item.unit_price) }}
                    </span>
                    <EditedPriceBadge
                      v-if="item.override"
                      :original-price="item.override.original_price"
                      :used-price="item.override.used_price"
                    />
                  </div>
                </div>
              </div>

              <div class="text-end shrink-0">
                <span class="tabular-price font-bold text-ink block text-xs sm:text-sm">
                  {{ formatCurrency(item.subtotal, locale) }}
                </span>
                <span class="text-[10px] text-ink-muted block font-sans">
                  ({{ formatNumber(item.purchased_qty * item.unit_price) }} + {{ formatNumber(item.labour) }})
                </span>
              </div>
            </div>
          </div>

          <StackedBar
            :segments="sampleSegments"
            :total="sampleRecord.computed.grandTotal"
            height-class="h-3.5"
          />
        </div>
      </div>
    </section>

    <!-- FAQ Section on Plaster Grain Background -->
    <section class="bg-plaster-grain border-t border-border section-pad relative">
      <div class="shell max-w-3xl space-y-8">
        <div class="text-center space-y-2">
          <p class="kicker text-primary">{{ locale === 'ar' ? 'أسئلة شائعة' : 'FREQUENTLY ASKED QUESTIONS' }}</p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink">
            {{ locale === 'ar' ? 'كل ما تريد معرفته قبل حساب تكلفة التشطيب' : 'Common questions about finishing estimates' }}
          </h2>
          <p class="text-sm text-ink-secondary">
            {{ locale === 'ar' ? 'إجابات واضحة ومباشرة عن مصادر الأسعار، الهالك، وطريقة التعديل.' : 'Clear answers on price sources, waste multipliers, and contractor exports.' }}
          </p>
        </div>

        <BaseAccordion :items="faqItems" :default-open="0" />
      </div>
    </section>

    <!-- Final Painted CTA Band with Organic Roller / Divider Header -->
    <section class="relative bg-navy-900 text-surface py-16 sm:py-20 overflow-hidden">
      <!-- Ambient paint glows -->
      <div class="pointer-events-none absolute -top-24 -end-24 w-96 h-96 rounded-full bg-saffron-500/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-24 -start-24 w-96 h-96 rounded-full bg-terracotta-500/15 blur-3xl" />

      <div class="shell relative z-10 text-center max-w-2xl mx-auto space-y-6">
        <p class="text-xs font-bold uppercase tracking-widest text-saffron-400">
          {{ locale === 'ar' ? 'ابدأ التخطيط لشقتك اليوم' : 'READY TO ESTIMATE YOUR APARTMENT?' }}
        </p>

        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-surface leading-tight">
          {{
            locale === 'ar'
              ? 'احسب تكلفة تشطيب شقتك بالجنيه المصري مجاناً'
              : 'Calculate your exact finishing budget in minutes'
          }}
        </h2>

        <p class="text-sm sm:text-base text-surface/85 leading-relaxed">
          {{
            locale === 'ar'
              ? 'أدخل مساحة شقتك لتحصل فوراً على مقايسة كاملة بكميات الشراء والمصنعيات بأسعار اليوم وبدون الحاجة لتسجيل.'
              : 'Enter your apartment size to generate an itemized invoice with true market quantities. No sign-up required.'
          }}
        </p>

        <!-- Quick size input + CTA button -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <div class="relative w-full sm:w-44">
            <input
              v-model.number="ctaAreaInput"
              type="number"
              min="40"
              max="600"
              class="w-full rounded-control border border-surface/30 bg-surface/10 px-4 py-3 text-sm font-semibold text-surface placeholder:text-surface/50 focus:border-saffron-400 focus:outline-none"
              :placeholder="locale === 'ar' ? 'المساحة م²' : 'Area sqm'"
            >
            <span class="pointer-events-none absolute end-3 top-3 text-xs text-surface/70">
              {{ locale === 'ar' ? 'م²' : 'm²' }}
            </span>
          </div>

          <button
            type="button"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-control bg-accent px-6 py-3 text-sm font-bold text-surface shadow-md hover:bg-accent-hover transition-colors whitespace-nowrap min-h-touch"
            @click="handleCtaStart"
          >
            <span>{{ locale === 'ar' ? 'ابدأ حساب التكلفة' : 'Calculate my estimate' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="2" />
          </button>
        </div>

        <div class="pt-2 flex items-center justify-center gap-5 text-xs text-surface/70">
          <span>✓ {{ locale === 'ar' ? 'تحديث الأسعار يومياً' : 'Daily price updates' }}</span>
          <span>✓ {{ locale === 'ar' ? '100% مجاناً' : '100% Free' }}</span>
          <span>✓ {{ locale === 'ar' ? 'بدون تسجيل' : 'No sign-up' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
