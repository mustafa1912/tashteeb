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
  ArrowRight,
  Sparkles
} from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()

const trustItems = computed(() =>
  locale.value === 'ar'
    ? [
        {
          icon: Clock,
          title: 'تحديث يومي للأسعار',
          desc: 'رصد يومي لأسعار مواد البناء والتشطيب في السوق المصري'
        },
        {
          icon: PackageCheck,
          title: 'كميات شراء فعلية',
          desc: 'حساب دقيق بالكرتونة والبستلة مع هالك القص والتركيب'
        },
        {
          icon: PencilLine,
          title: 'شفافية كاملة',
          desc: 'إمكانية تعديل أي سعر يدوياً مع إظهار ملاحظة التعديل بالفاتورة'
        }
      ]
    : [
        {
          icon: Clock,
          title: 'Daily Market Update',
          desc: 'Live Egyptian finishing & construction material price benchmarks'
        },
        {
          icon: PackageCheck,
          title: 'True Purchase Quantities',
          desc: 'Exact cartons, buckets & meters with practical site waste'
        },
        {
          icon: PencilLine,
          title: 'Complete Transparency',
          desc: 'Override any price with auditable supplier notes on invoices'
        }
      ]
)

const steps = computed(() =>
  locale.value === 'ar'
    ? [
        {
          num: '01',
          icon: Ruler,
          color: 'bg-saffron-500 text-surface',
          badgeColor: 'text-saffron-700 bg-saffron-100',
          title: 'أدخل مواصفات الشقة',
          desc: 'المساحة بالمتر المربع، المحافظة، وعدد الغرف لحساب مساحات الحوائط ونقاط التأسيس بدقة هندسية.'
        },
        {
          num: '02',
          icon: Layers,
          color: 'bg-primary text-surface',
          badgeColor: 'text-primary bg-primary-tint',
          title: 'اختر مستوى التشطيب',
          desc: 'ابدأ بباقة جاهزة (اقتصادي، قياسي، أو سوبر لوكس) مع حرية تخصيص كل خامة وكل بند.'
        },
        {
          num: '03',
          icon: SlidersHorizontal,
          color: 'bg-accent text-surface',
          badgeColor: 'text-accent bg-accent-tint',
          title: 'عدّل الأسعار المعروضة',
          desc: 'معاك عرض سعر خاص أو ماركة معينة؟ عدّل سعر الوحدة فوراً وسيتم تحديث الإجمالي تلقائياً.'
        },
        {
          num: '04',
          icon: FileSpreadsheet,
          color: 'bg-sage-500 text-surface',
          badgeColor: 'text-sage-700 bg-sage-100',
          title: 'استلم المقايسة والجدول',
          desc: 'فاتورة تفصيلية جاهزة للطباعة والتحميل كـ PDF، قائمة مشتريات للتشوين، وجدول زمني للتنفيذ.'
        }
      ]
    : [
        {
          num: '01',
          icon: Ruler,
          color: 'bg-saffron-500 text-surface',
          badgeColor: 'text-saffron-700 bg-saffron-100',
          title: 'Apartment details',
          desc: 'Enter indoor area, governorate and rooms to calculate net wall plaster, paint and MEP points.'
        },
        {
          num: '02',
          icon: Layers,
          color: 'bg-primary text-surface',
          badgeColor: 'text-primary bg-primary-tint',
          title: 'Finishing package',
          desc: 'Select Economy, Standard, or Super Lux baselines, then fine-tune materials and brands.'
        },
        {
          num: '03',
          icon: SlidersHorizontal,
          color: 'bg-accent text-surface',
          badgeColor: 'text-accent bg-accent-tint',
          title: 'Custom price override',
          desc: 'Got a custom showroom deal? Override any line price and keep an honest audit note.'
        },
        {
          num: '04',
          icon: FileSpreadsheet,
          color: 'bg-sage-500 text-surface',
          badgeColor: 'text-sage-700 bg-sage-100',
          title: 'Instant BOQ & timeline',
          desc: 'Get a printable A4 invoice, store-ready shopping checklist, and week-by-week schedule.'
        }
      ]
)

// Distinctly themed feature tiles
const features = computed(() => [
  {
    icon: TrendingUp,
    theme: 'bg-saffron-50/60 border-saffron-300 text-ink',
    iconBg: 'bg-saffron-500 text-surface',
    linkClass: 'text-saffron-700 hover:text-saffron-800',
    title: locale.value === 'ar' ? 'مؤشر أسعار 6 أشهر' : '6-Month Price Trends',
    desc: locale.value === 'ar'
      ? 'تابع منحنيات حركة الأسعار للبضاعة (سيراميك، كابلات، أسمنت) لاختيار توقيت الشراء الأنسب.'
      : 'Track 180-day price curves for porcelain, Jotun paint, El Sewedy copper wire and cement.',
    cta: locale.value === 'ar' ? 'تصفح بورصة الأسعار' : 'Explore market trends',
    to: localePath('/market')
  },
  {
    icon: PackageCheck,
    theme: 'bg-sage-50/60 border-sage-300 text-ink',
    iconBg: 'bg-sage-500 text-surface',
    linkClass: 'text-sage-700 hover:text-sage-800',
    title: locale.value === 'ar' ? 'معادلات الهالك الهندسي' : 'Practical Site Waste Math',
    desc: locale.value === 'ar'
      ? 'الكرتونة لا تُجزأ! نحسب هالك القص والتركيب 5% إلى 12% ونقرب للكرتونة والبستلة الكاملة.'
      : 'Showrooms sell whole cartons and buckets. We add 5-12% site waste and round up to whole units.',
    cta: locale.value === 'ar' ? 'شاهد معادلة المقايسة' : 'View BOQ waste formulas',
    to: localePath('/estimate/ts-2408')
  },
  {
    icon: PencilLine,
    theme: 'bg-roseclay-50/60 border-roseclay-300 text-ink',
    iconBg: 'bg-roseclay-500 text-surface',
    linkClass: 'text-roseclay-700 hover:text-roseclay-800',
    title: locale.value === 'ar' ? 'تعديل الأسعار وتوثيقها' : 'Transparent Price Overrides',
    desc: locale.value === 'ar'
      ? 'لكل خامة قلم تعديل سريع، مع تنبيه ذكي إذا كان سعرك بعيداً عن السوق وملاحظة بالفاتورة.'
      : 'Edit any rate with instant deviation checks and auditable "Price edited from X to Y" notes.',
    cta: locale.value === 'ar' ? 'جرّب التعديل في الحاسبة' : 'Try in wizard',
    to: localePath('/calculator')
  },
  {
    icon: HardHat,
    theme: 'bg-navy-900 border-navy-700 text-surface shadow-elevated',
    iconBg: 'bg-saffron-500 text-navy-950 font-bold',
    linkClass: 'text-saffron-300 hover:text-saffron-200',
    isDark: true,
    title: locale.value === 'ar' ? 'وضع المقاولين وعروض الأسعار' : 'Contractor Quotation Mode',
    desc: locale.value === 'ar'
      ? 'أضف نسبة الإشراف والربح وشعار مكتبك، وصدّر عرض سعر رسمي للعميل يخفي تكاليفك الخاصة.'
      : 'Add overhead markup %, company branding, custom items, and export clean client PDF proposals.',
    cta: locale.value === 'ar' ? 'افتح مساحة المقاول' : 'Open contractor mode',
    to: localePath('/contractor')
  },
  {
    icon: ArrowLeftRight,
    theme: 'bg-sky-50/60 border-sky-300 text-ink',
    iconBg: 'bg-sky-500 text-surface',
    linkClass: 'text-sky-700 hover:text-sky-800',
    title: locale.value === 'ar' ? 'مقارنة الباقات جنباً إلى جنب' : 'Side-by-Side Comparison',
    desc: locale.value === 'ar'
      ? 'قارن بين الاقتصادي، القياسي، والسوبر لوكس على نفس مساحة شقتك واعرف الفرق بنداً ببند.'
      : 'Compare Economy, Standard, and Super Lux for your floor plan and identify exact category gaps.',
    cta: locale.value === 'ar' ? 'قارن الباقات' : 'Compare packages',
    to: localePath('/estimate/ts-2408/compare')
  },
  {
    icon: CheckSquare,
    theme: 'bg-terracotta-50/60 border-terracotta-300 text-ink',
    iconBg: 'bg-terracotta-500 text-surface',
    linkClass: 'text-terracotta-700 hover:text-terracotta-800',
    title: locale.value === 'ar' ? 'قائمة مشتريات للتشوين' : 'Printable Shopping Checklist',
    desc: locale.value === 'ar'
      ? 'حوّل المقايسة إلى قائمة شراء بالكرتونة والبستلة، مع شطب البنود المشحونة ونصائح الشراء.'
      : 'Turn your estimate into an on-site store checklist with units, checked states, and showroom tips.',
    cta: locale.value === 'ar' ? 'استعرض قائمة الشراء' : 'Open shopping checklist',
    to: localePath('/estimate/ts-2408/shopping-list')
  }
])
</script>

<template>
  <div>
    <!-- Trust Strip with Paper / Plaster Feel -->
    <section class="border-b border-border bg-surface">
      <div class="shell grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-border">
        <div
          v-for="(item, idx) in trustItems"
          :key="idx"
          class="flex items-start gap-4 py-5 md:px-6 first:md:ps-0 last:md:pe-0"
        >
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-primary-tint text-primary shadow-subtle">
            <component :is="item.icon" class="h-5 w-5" :stroke-width="1.5" />
          </span>
          <div class="space-y-0.5">
            <h3 class="text-sm font-bold text-ink">{{ item.title }}</h3>
            <p class="text-xs text-ink-secondary leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works (4 Connected Steps) -->
    <section class="shell section-pad relative">
      <div class="max-w-2xl mx-auto text-center space-y-2 mb-14">
        <p class="kicker text-primary">{{ locale === 'ar' ? 'كيف يعمل تشطيب' : 'HOW IT WORKS' }}</p>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink">
          {{
            locale === 'ar'
              ? 'من شقة على المحارة إلى مقايسة تفصيلية في 3 دقائق'
              : 'From red-brick shell to itemized budget in 3 minutes'
          }}
        </h2>
        <p class="text-base text-ink-secondary">
          {{
            locale === 'ar'
              ? 'بدون جداول إكسيل معقدة أو أرقام جزافية — كل بند محسوب بمعادلات هندسية وكميات سوق واقعية.'
              : 'No guesswork or vague per-meter estimates — every item uses real Egyptian site formulas.'
          }}
        </p>
      </div>

      <!-- 4 Step Cards connected by visual flow -->
      <div class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <article
          v-for="step in steps"
          :key="step.num"
          class="card-surface p-6 relative flex flex-col justify-between gap-5 border border-border/90 hover:border-primary hover:shadow-card transition-all group"
        >
          <!-- Big Watermark Step Number -->
          <span class="tabular-price absolute top-4 end-5 font-display text-4xl sm:text-5xl font-extrabold text-border/70 select-none group-hover:text-primary/20 transition-colors">
            {{ step.num }}
          </span>

          <div class="space-y-4">
            <span
              class="grid h-12 w-12 place-items-center rounded-control shadow-sm"
              :class="step.color"
            >
              <component :is="step.icon" class="h-6 w-6" :stroke-width="1.8" />
            </span>
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill inline-block mb-1.5" :class="step.badgeColor">
                {{ locale === 'ar' ? `المرحلة ${step.num}` : `Step ${step.num}` }}
              </span>
              <h3 class="text-lg font-bold text-ink">{{ step.title }}</h3>
            </div>
            <p class="text-xs sm:text-sm text-ink-secondary leading-relaxed">{{ step.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- Vibrant 6-Tile Feature Grid (Replaced single dark-teal block with rich paint palette cards) -->
    <section class="bg-plaster border-y border-border section-pad relative">
      <div class="shell space-y-10">
        <div class="max-w-2xl space-y-2">
          <p class="kicker text-accent">
            {{ locale === 'ar' ? 'أدوات متكاملة للتخطيط والتنفيذ' : 'BUILT FOR REAL RENOVATION DECISIONS' }}
          </p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink">
            {{
              locale === 'ar'
                ? 'أكثر من مجرد حاسبة — منصة ذكية لإدارة مصاريف التشطيب'
                : 'Everything you need before paying a single deposit'
            }}
          </h2>
          <p class="text-sm text-ink-secondary">
            {{
              locale === 'ar'
                ? 'صُممت لتجعل قرارات الشراء والتفاوض مع الصنايعية والمقاولين سهلة ومبنية على أرقام حقيقية.'
                : 'Designed to make buying and negotiating with tradesmen clear, grounded in honest Egyptian data.'
            }}
          </p>
        </div>

        <!-- 6 Saturated Tint Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <article
            v-for="(feat, idx) in features"
            :key="idx"
            class="rounded-card border p-7 sm:p-8 flex flex-col justify-between gap-6 transition-all hover:-translate-y-1 hover:shadow-card"
            :class="feat.theme"
          >
            <div class="space-y-4">
              <span
                class="grid h-12 w-12 place-items-center rounded-control shadow-sm"
                :class="feat.iconBg"
              >
                <component :is="feat.icon" class="h-6 w-6" :stroke-width="1.8" />
              </span>
              <h3
                class="text-xl font-bold font-display"
                :class="feat.isDark ? 'text-surface' : 'text-ink'"
              >
                {{ feat.title }}
              </h3>
              <p
                class="text-sm leading-relaxed"
                :class="feat.isDark ? 'text-surface/85' : 'text-ink-secondary'"
              >
                {{ feat.desc }}
              </p>
            </div>

            <NuxtLink
              :to="feat.to"
              class="inline-flex items-center gap-2 min-h-touch text-sm font-bold transition-colors group"
              :class="feat.linkClass"
            >
              <span>{{ feat.cta }}</span>
              <ArrowRight class="h-4 w-4 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" :stroke-width="2" />
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
