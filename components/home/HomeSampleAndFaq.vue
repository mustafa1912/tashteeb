<script setup>
import { CheckCircle2, ArrowRight, Pencil } from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()
const estimatesStore = useEstimatesStore()

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
        'كميات شراء مقربة لأعلى وحدة بيع صحيحة (كرتونة، بستلة، نقطة)',
        'فصل واضح بين تكلفة الخامات والمصنعيات واحتياطي الطوارئ',
        'توثيق أي سعر معدل يدوياً مقارنة بمتوسط السوق المصري',
        'جدول زمني بالأسابيع يوضح المراحل المتوازية والمتتابعة'
      ]
    : [
        'Purchase quantities rounded up to full cartons, buckets & points',
        'Clear separation of materials, labour workmanship, and contingency',
        'Auditable yellow badges whenever a market price is manually edited',
        'Week-by-week construction Gantt schedule with parallel MEP rough-in'
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
</script>

<template>
  <div>
    <!-- Sample Invoice Preview -->
    <section class="shell section-pad grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 space-y-6">
        <p class="kicker">{{ locale === 'ar' ? 'نموذج فاتورة تشطيب حقيقية' : 'TRANSPARENT ITEMIZED INVOICE' }}</p>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
          {{
            locale === 'ar'
              ? 'مقايسة واضحة تفهمها أنت والمهندس والصنايعي'
              : 'An invoice you, your spouse, and your contractor can all trust'
          }}
        </h2>
        <p class="text-base text-ink-secondary leading-relaxed">
          {{
            locale === 'ar'
              ? 'لا مزيد من الأرقام الإجمالية الغامضة. كل بند يوضح الكمية المطلوبة، نسبة الهالك، عدد وحدات الشراء، سعر الوحدة، والمصنعية.'
              : 'Every category shows net area, waste allowance, purchased units, market or edited unit prices, and workmanship.'
          }}
        </p>

        <ul class="space-y-3">
          <li
            v-for="(b, idx) in sampleBullets"
            :key="idx"
            class="flex items-start gap-2.5 text-sm font-medium text-ink"
          >
            <CheckCircle2 class="h-5 w-5 text-success shrink-0 mt-0.5" :stroke-width="1.5" />
            <span>{{ b }}</span>
          </li>
        </ul>

        <div class="pt-2">
          <BaseButton variant="primary" size="lg" :to="localePath('/estimate/ts-2408')">
            <span>{{ locale === 'ar' ? 'افتح المقايسة الكاملة #TS-2408' : 'Open full sample invoice #TS-2408' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          </BaseButton>
        </div>
      </div>

      <!-- Paper Invoice Preview Sheet -->
      <div class="lg:col-span-7">
        <div
          v-if="sampleRecord"
          class="rounded-card border border-border bg-surface p-6 sm:p-8 shadow-elevated space-y-5"
        >
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
              <p class="tabular-price text-3xl font-extrabold text-ink mt-1">
                {{ formatCurrency(sampleRecord.computed.grandTotal, locale) }}
              </p>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-pill bg-warning-tint px-3 py-1 text-xs font-semibold text-ink">
              <Pencil class="h-3.5 w-3.5 text-warning" :stroke-width="1.5" />
              <span>
                {{ sampleRecord.computed.editedCount }}
                {{ locale === 'ar' ? 'أسعار معدلة يدوياً' : 'prices edited' }}
              </span>
            </span>
          </div>

          <!-- Sample Line Items -->
          <div class="divide-y divide-border border-y border-border">
            <div
              v-for="item in sampleItems"
              :key="item.id"
              class="py-3 px-3 -mx-3 flex items-center justify-between gap-3 text-sm"
              :class="item.override ? 'bg-warning-tint/35 border-s-4 border-warning ps-3' : ''"
            >
              <div class="min-w-0 space-y-0.5">
                <p class="font-semibold text-ink truncate">
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
              <span class="tabular-price font-bold text-ink shrink-0">
                {{ formatCurrency(item.subtotal, locale) }}
              </span>
            </div>
          </div>

          <StackedBar
            :segments="sampleSegments"
            :total="sampleRecord.computed.grandTotal"
            height-class="h-3"
          />
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="bg-sand/55 border-t border-border section-pad">
      <div class="shell max-w-3xl space-y-8">
        <div class="text-center space-y-2">
          <p class="kicker">{{ locale === 'ar' ? 'أسئلة شائعة' : 'FREQUENTLY ASKED QUESTIONS' }}</p>
          <h2 class="text-2xl sm:text-3xl font-bold text-ink">
            {{ locale === 'ar' ? 'كل ما تريد معرفته قبل حساب تكلفة التشطيب' : 'Common questions about finishing estimates' }}
          </h2>
        </div>

        <BaseAccordion :items="faqItems" :default-open="0" />
      </div>
    </section>

    <!-- Final Dark-Teal CTA -->
    <section class="bg-primary text-surface py-16 sm:py-20">
      <div class="shell text-center max-w-2xl space-y-5">
        <p class="text-xs font-bold uppercase tracking-widest text-accent-dark">
          {{ locale === 'ar' ? 'ابدأ التخطيط بثقة' : 'READY WHEN YOU ARE' }}
        </p>
        <h2 class="text-2xl sm:text-4xl font-bold text-surface">
          {{
            locale === 'ar'
              ? 'احسب مقايسة تشطيب شقتك الآن مجاناً وبدون تسجيل'
              : 'Price your apartment finishing today — no sign-up required'
          }}
        </h2>
        <p class="text-base text-surface/85">
          {{
            locale === 'ar'
              ? 'يستغرق أقل من 3 دقائق، وتُحفظ بياناتك تلقائياً في متصفحك.'
              : 'Takes under 3 minutes, uses today’s Egyptian market rates, and saves automatically in your browser.'
          }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <BaseButton variant="light" size="lg" :to="localePath('/calculator')">
            <span>{{ locale === 'ar' ? 'ابدأ حساب التكلفة' : 'Calculate my estimate' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          </BaseButton>
          <BaseButton variant="accent" size="lg" :to="localePath('/budget')">
            <span>{{ locale === 'ar' ? 'خطط حسب الميزانية' : 'Plan by target budget' }}</span>
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>
