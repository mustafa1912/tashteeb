<script setup>
import {
  Clock,
  PackageCheck,
  PencilLine,
  Ruler,
  Layers,
  SlidersHorizontal,
  FileSpreadsheet,
  TrendingUp,
  ArrowLeftRight,
  Wallet,
  CheckSquare,
  HardHat,
  ArrowRight
} from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()

const trustItems = computed(() =>
  locale.value === 'ar'
    ? [
        { icon: Clock, text: 'تحديث يومي لأسعار السوق المصري 06:00 صباحاً' },
        { icon: PackageCheck, text: 'حساب كميات الشراء الفعلية (كرتونة / بستلة) شاملة الهالك' },
        { icon: PencilLine, text: 'حرية تعديل أي سعر يدوياً مع توضيح الفارق بشفافية' }
      ]
    : [
        { icon: Clock, text: 'Egyptian market prices refreshed daily at 06:00' },
        { icon: PackageCheck, text: 'Real purchase cartons, buckets & points with waste' },
        { icon: PencilLine, text: 'Override any material price with transparent notes' }
      ]
)

const steps = computed(() =>
  locale.value === 'ar'
    ? [
        {
          num: '01',
          icon: Ruler,
          title: 'أدخل مواصفات الشقة',
          desc: 'المساحة بالمتر المربع، المحافظة، وعدد الغرف والحمامات لحساب مساحات المحارة والدهان ونقاط التأسيس.'
        },
        {
          num: '02',
          icon: Layers,
          title: 'اختر الباقة والخامات',
          desc: 'ابدأ بباقة جاهزة (اقتصادي / قياسي / سوبر لوكس) ثم خصص الأرضيات، الدهانات، السباكة والكهرباء.'
        },
        {
          num: '03',
          icon: SlidersHorizontal,
          title: 'عدّل أي سعر من المعرض',
          desc: 'حصلت على عرض سعر مختلف لبند معين؟ عدّله بضغطة واحدة وسيتم تحديث الإجمالي مع توثيق التعديل.'
        },
        {
          num: '04',
          icon: FileSpreadsheet,
          title: 'استلم المقايسة وقائمة الشراء',
          desc: 'حمّل ملف PDF منسق A4، قائمة مشتريات للتشوين، وجدول زمني للتنفيذ أو شاركها عبر واتساب.'
        }
      ]
    : [
        {
          num: '01',
          icon: Ruler,
          title: 'Enter apartment specs',
          desc: 'Indoor area, governorate, bedrooms and bathrooms derive net wall area, openings, and MEP points.'
        },
        {
          num: '02',
          icon: Layers,
          title: 'Pick level & materials',
          desc: 'Start from Economy, Standard, or Super Lux defaults, then fine-tune every category card.'
        },
        {
          num: '03',
          icon: SlidersHorizontal,
          title: 'Override any quote',
          desc: 'Got a showroom deal or custom brand quote? Edit any unit price and keep an honest audit note.'
        },
        {
          num: '04',
          icon: FileSpreadsheet,
          title: 'Export PDF & shopping list',
          desc: 'Download A4 invoices, check off store quantities, compare packages, or share via WhatsApp.'
        }
      ]
)

const features = computed(() => [
  {
    icon: TrendingUp,
    title: locale.value === 'ar' ? 'مؤشر الأسعار لـ 6 أشهر' : '6-month price trends',
    desc: locale.value === 'ar'
      ? 'تابع حركة أسعار البورسلين، الدهانات، السلوك والأسمنت خلال آخر 180 يوماً قبل الشراء.'
      : 'Track 180-day Egyptian price curves for porcelain, Jotun paint, El Sewedy wire, and cement.',
    cta: locale.value === 'ar' ? 'افتح بورصة الأسعار' : 'View price market',
    to: localePath('/market')
  },
  {
    icon: ArrowLeftRight,
    title: locale.value === 'ar' ? 'مقارنة الباقات جنباً إلى جنب' : 'Side-by-side comparison',
    desc: locale.value === 'ar'
      ? 'قارن بين القياسي والسوبر لوكس على نفس شقتك واعرف أين يتركز فارق التكلفة بالضبط.'
      : 'Compare Standard vs Super Lux on your exact floor plan and spot the biggest category gap.',
    cta: locale.value === 'ar' ? 'جرّب المقارنة' : 'Compare packages',
    to: localePath('/estimate/ts-2408/compare')
  },
  {
    icon: Wallet,
    title: locale.value === 'ar' ? 'مخطط الميزانية المستهدفة' : 'Target-budget planner',
    desc: locale.value === 'ar'
      ? 'حدد ميزانيتك القصوى وأولوياتك مع تثبيت الخامات المهمة لك، وسنقترح أفضل توزيع وبدائل التوفير.'
      : 'Enter your max EGP budget, lock must-have finishes, and get smart one-click trade-off suggestions.',
    cta: locale.value === 'ar' ? 'خطط بميزانيتك' : 'Plan by budget',
    to: localePath('/budget')
  },
  {
    icon: CheckSquare,
    title: locale.value === 'ar' ? 'قائمة مشتريات قابلة للطباعة' : 'Printable shopping list',
    desc: locale.value === 'ar'
      ? 'حوّل المقايسة إلى قائمة شراء بالكرتونة والبستلة والنقطة مع نصائح المتاجر المعتمدة.'
      : 'Turn your estimate into a store-ready checklist with exact cartons, buckets, waste %, and showroom tips.',
    cta: locale.value === 'ar' ? 'معاينة قائمة الشراء' : 'See shopping list',
    to: localePath('/estimate/ts-2408/shopping-list')
  },
  {
    icon: PencilLine,
    title: locale.value === 'ar' ? 'تعديل الأسعار بشفافية' : 'Manual price overrides',
    desc: locale.value === 'ar'
      ? 'عدّل أي سعر خامة مع تنبيه ذكي عند الانحراف الحاد وإظهار ملاحظة واضحة في الفاتورة.'
      : 'Override any material rate with smart deviation checks and visible "Price edited from X to Y" notes.',
    cta: locale.value === 'ar' ? 'جرّب في الحاسبة' : 'Try in calculator',
    to: localePath('/calculator')
  },
  {
    icon: HardHat,
    title: locale.value === 'ar' ? 'وضع المقاولين وعروض الأسعار' : 'Contractor quotation mode',
    desc: locale.value === 'ar'
      ? 'أضف شعار شركتك ونسبة الإشراف والمصاريف الإدارية وصدّر عرض سعر رسمي للعميل بصيغة PDF.'
      : 'Add your company logo, overhead & markup %, custom items, and export client-ready PDF quotations.',
    cta: locale.value === 'ar' ? 'مساحة عمل المقاولين' : 'For contractors',
    to: localePath('/contractor')
  }
])
</script>

<template>
  <div>
    <!-- Trust Strip -->
    <section class="border-b border-border bg-surface">
      <div class="shell grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-border">
        <div
          v-for="(item, idx) in trustItems"
          :key="idx"
          class="flex items-center gap-3.5 py-5 md:px-6 first:md:ps-0 last:md:pe-0"
        >
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-accent-tint text-accent">
            <component :is="item.icon" class="h-5 w-5" :stroke-width="1.5" />
          </span>
          <span class="text-sm font-semibold text-ink leading-snug">{{ item.text }}</span>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="shell section-pad">
      <div class="max-w-2xl mx-auto text-center space-y-2 mb-12">
        <p class="kicker">{{ locale === 'ar' ? 'كيف يعمل تشطيب' : 'HOW IT WORKS' }}</p>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink">
          {{
            locale === 'ar'
              ? 'من مساحة الشقة على المحارة إلى مقايسة كاملة في 3 دقائق'
              : 'From red-brick shell to itemized budget in 3 minutes'
          }}
        </h2>
        <p class="text-base text-ink-secondary">
          {{
            locale === 'ar'
              ? 'بدون جداول إكسيل معقدة أو أرقام جزافية — كل بند محسوب بمعادلات هندسية واقعية.'
              : 'No messy spreadsheets or vague per-meter guesses — every line item uses practical Egyptian site formulas.'
          }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <article
          v-for="step in steps"
          :key="step.num"
          class="card-surface p-6 relative flex flex-col justify-between gap-4"
        >
          <span class="tabular-price absolute top-5 end-5 text-3xl font-extrabold text-border select-none">
            {{ step.num }}
          </span>
          <div class="space-y-4">
            <span class="grid h-12 w-12 place-items-center rounded-pill bg-primary-tint text-primary">
              <component :is="step.icon" class="h-6 w-6" :stroke-width="1.5" />
            </span>
            <h3 class="text-lg font-bold text-ink">{{ step.title }}</h3>
            <p class="text-sm text-ink-secondary leading-relaxed">{{ step.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- Dark-Teal Feature Band (WCAG AA contrast enforced) -->
    <section class="bg-primary-deep text-surface section-pad">
      <div class="shell space-y-10">
        <div class="max-w-2xl space-y-2">
          <p class="text-xs font-bold uppercase tracking-widest text-accent-dark">
            {{ locale === 'ar' ? 'أدوات متكاملة للتخطيط والتنفيذ' : 'BUILT FOR REAL RENOVATION DECISIONS' }}
          </p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface">
            {{
              locale === 'ar'
                ? 'أكثر من مجرد حاسبة — منصة متكاملة لإدارة ميزانية التشطيب'
                : 'Everything you need before paying a single deposit'
            }}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded-card border border-surface/20 overflow-hidden divide-y md:divide-y-0 bg-primary-deep">
          <article
            v-for="(feat, idx) in features"
            :key="idx"
            class="p-7 sm:p-8 flex flex-col justify-between gap-6 border-surface/15 md:border-b md:border-e hover:bg-surface/5 transition-colors"
          >
            <div class="space-y-4">
              <span class="grid h-12 w-12 place-items-center rounded-control bg-surface/10 text-accent-dark">
                <component :is="feat.icon" class="h-6 w-6" :stroke-width="1.5" />
              </span>
              <h3 class="text-xl font-bold text-surface">{{ feat.title }}</h3>
              <p class="text-sm text-surface/85 leading-relaxed">{{ feat.desc }}</p>
            </div>

            <NuxtLink
              :to="feat.to"
              class="inline-flex items-center gap-2 min-h-touch text-sm font-semibold text-accent-dark hover:underline"
            >
              <span>{{ feat.cta }}</span>
              <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
