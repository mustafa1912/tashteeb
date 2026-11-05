<script setup>
import { Check, ArrowRight, Layers, Sparkles } from 'lucide-vue-next'
import { PACKAGES } from '~/utils/calc/config.js'
import { calculateEstimate } from '~/utils/calc/engine.js'

const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const marketStore = useMarketStore()
const wizardStore = useWizardStore()

const activeMarketCat = ref('all')

const packageCards = computed(() => {
  const specs = [
    {
      key: 'economy',
      badgeClass: 'bg-sage-100 text-sage-800 border border-sage-300',
      borderClass: 'border-sage-400 hover:border-sage-500',
      cardBg: 'bg-surface',
      themeColor: '#7DBE9A',
      image: '/images/rooms/room-economy.svg',
      previewItems: [
        { label: 'سيراميك 45×45', label_en: 'Ceramic 45×45', src: '/images/materials/ceramic-45x45.svg' },
        { label: 'دهان GLC داي تون', label_en: 'GLC Day-Tone', color: '#ECE8DF' },
        { label: 'سلوك السويدي 2 مم', label_en: 'El Sewedy 2mm', src: '/images/materials/wire-elsewedy.svg' },
        { label: 'صحي ليسيكو', label_en: 'Lecico Bath', src: '/images/materials/sanitary-duravit.svg' }
      ],
      bullets_en: [
        'Cleopatra Grade-A ceramic tiles (45×45)',
        'GLC Day-Tone matte emulsion (2 coats)',
        'El Sewedy copper wiring + SAS switches',
        'Lecico sanitary ware + Ideal Standard mixers'
      ],
      bullets_ar: [
        'سيراميك كليوباترا فرز أول 45×45',
        'دهان بلاستيك مطفي GLC داي تون',
        'تأسيس سلوك السويدي + مفاتيح ساس',
        'أطقم صحي ليسيكو وخلاطات أيديال ستاندرد'
      ]
    },
    {
      key: 'standard',
      featured: true,
      badgeClass: 'bg-saffron-500 text-navy-950 font-bold shadow-sm',
      borderClass: 'border-saffron-500 shadow-elevated lg:-translate-y-2',
      cardBg: 'bg-surface',
      themeColor: '#F4B223',
      image: '/images/rooms/room-standard.svg',
      previewItems: [
        { label: 'بورسلين 60×60', label_en: 'Porcelain 60×60', src: '/images/materials/porcelain-60x60.svg' },
        { label: 'جوتن فينوماستيك', label_en: 'Jotun Fenomastic', color: '#E8E1D3' },
        { label: 'جبس كناوف', label_en: 'Knauf Gypsum', src: '/images/materials/gypsum-ceiling.svg' },
        { label: 'أبواب قشرة', label_en: 'Veneer Doors', src: '/images/materials/door-wood-veneer.svg' }
      ],
      bullets_en: [
        'Cleopatra 60×60 laser-cut porcelain',
        'Jotun Fenomastic washable silk/matt paint',
        'Knauf gypsum board + shadow gap & ABB DB',
        'Engineered veneer doors + Duravit & Grohe'
      ],
      bullets_ar: [
        'بورسلين كليوباترا 60×60 قطع ليزر',
        'دهانات جوتن فينوماستيك قابلة للغسيل',
        'جبس بورد كناوف بشادو جاب ولوحة ABB',
        'أبواب قشرة هندسية وحمامات ديورافيت وجروهي'
      ]
    },
    {
      key: 'super_lux',
      isDark: true,
      badgeClass: 'bg-saffron-400 text-navy-950 font-bold shadow-sm',
      borderClass: 'border-saffron-500/50 shadow-elevated',
      cardBg: 'bg-navy-900 text-surface',
      themeColor: '#12394A',
      image: '/images/rooms/room-superlux.svg',
      previewItems: [
        { label: 'رخام جلالة مصقول', label_en: 'Galala Marble', src: '/images/materials/marble-galala.svg' },
        { label: 'جوتن وندروول', label_en: 'Wonderwall Lux', color: '#D9C8B4' },
        { label: 'إضاءة ماجنتيك', label_en: 'Magnetic Track', src: '/images/materials/wire-elsewedy.svg' },
        { label: 'خلاطات جروهي دفن', label_en: 'Grohe Concealed', src: '/images/materials/pipes-banninger.svg' }
      ],
      bullets_en: [
        'Polished Galala/Crema marble slabs',
        'Jotun Wonderwall Lux antimicrobial finish',
        'Full suspended Knauf + magnetic track prep',
        'Natural oak doors + Grohe concealed cisterns'
      ],
      bullets_ar: [
        'رخام ألواح مصقول جلالة إكسترا / كريما',
        'دهان جوتن وندروول لوكس مخملي',
        'أسقف معلقة كناوف مع مسارات ماجنتيك',
        'أبواب أرو طبيعي وصناديق دفن جروهي'
      ]
    }
  ]

  return specs.map((item) => {
    const meta = PACKAGES[item.key]
    const est = calculateEstimate({
      apartment: { area: 120, governorate: 'cairo', bedrooms: 3, bathrooms: 2, kitchens: 1, reception: 2, balconies: 2 },
      packageKey: item.key,
      contingencyPct: 0.12,
      materialsCatalog: marketStore.materials
    })
    return {
      ...item,
      title: locale.value === 'ar' ? meta.label_ar : meta.label_en,
      badge: locale.value === 'ar' ? meta.badge_ar : meta.badge_en,
      desc: locale.value === 'ar' ? meta.desc_ar : meta.desc_en,
      bullets: locale.value === 'ar' ? item.bullets_ar : item.bullets_en,
      costPerSqm: est.costPerSqm,
      total120: est.grandTotal
    }
  })
})

const marketTabs = computed(() => [
  { key: 'all', label: locale.value === 'ar' ? 'أبرز الخامات' : 'Featured' },
  { key: 'floors', label: locale.value === 'ar' ? 'الأرضيات' : 'Floors' },
  { key: 'walls', label: locale.value === 'ar' ? 'الدهانات' : 'Paint & Walls' },
  { key: 'electrical', label: locale.value === 'ar' ? 'الكهرباء والأسمنت' : 'MEP & Cement' }
])

const displayedMarketCards = computed(() => {
  const all = marketStore.adjustedMaterials
  if (activeMarketCat.value === 'all') {
    const featuredSlugs = [
      'porcelain-60x60-cleopatra',
      'jotun-fenomastic-my-home-rich-matt-18l',
      'elsewedy-copper-wire-3mm-meter',
      'portland-cement-cem-i-42-5n-ton',
      'knauf-regular-gypsum-board-12-5mm',
      'pvc-drainage-pipe-3-inch-4m'
    ]
    return featuredSlugs
      .map(slug => all.find(m => m.slug === slug))
      .filter(Boolean)
  }
  if (activeMarketCat.value === 'electrical') {
    return all.filter(m => m.category === 'electrical' || m.category === 'raw_materials').slice(0, 6)
  }
  return all.filter(m => m.category === activeMarketCat.value).slice(0, 6)
})

function startWithPackage(pkgKey) {
  wizardStore.hydrate()
  wizardStore.selectPackage(pkgKey)
  wizardStore.setStep(2)
  router.push(localePath('/calculator'))
}
</script>

<template>
  <div>
    <!-- 3 Finishing Packages (Color themed with MaterialBoard preview) -->
    <section class="shell section-pad">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div class="space-y-2 max-w-2xl">
          <p class="kicker text-primary">{{ locale === 'ar' ? 'مستويات التشطيب' : 'FINISHING PACKAGES' }}</p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink">
            {{
              locale === 'ar'
                ? 'ثلاث باقات واضحة — قابلة للتخصيص بالكامل بنداً ببند'
                : 'Three transparent starting packages — customize every item'
            }}
          </h2>
          <p class="text-sm text-ink-secondary">
            {{
              locale === 'ar'
                ? 'اختر باقة تناسب ميزانيتك، ثم افتح الحاسبة لتغيير أي خامة أو إضافة أي بند.'
                : 'Choose a package matching your budget, then open the wizard to tweak individual materials.'
            }}
          </p>
        </div>
        <BaseButton variant="secondary" :to="localePath('/estimate/ts-2408/compare')">
          <span>{{ locale === 'ar' ? 'مقارنة الباقات جنباً إلى جنب' : 'Compare packages side by side' }}</span>
        </BaseButton>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <article
          v-for="pkg in packageCards"
          :key="pkg.key"
          class="rounded-card overflow-hidden flex flex-col justify-between transition-all border"
          :class="[pkg.borderClass, pkg.cardBg]"
        >
          <div>
            <!-- Header Image with Badge -->
            <div class="relative aspect-[16/9] bg-sand overflow-hidden">
              <img
                :src="pkg.image"
                :alt="pkg.title"
                width="640"
                height="360"
                loading="lazy"
                class="h-full w-full object-cover"
              >
              <span
                class="absolute top-3 start-3 rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wider"
                :class="pkg.badgeClass"
              >
                {{ pkg.badge }}
              </span>
            </div>

            <!-- Mini MaterialBoard Preview Row -->
            <div
              class="px-5 py-3 border-b flex items-center justify-between gap-2 text-xs"
              :class="pkg.isDark ? 'border-navy-700/80 bg-navy-950/60' : 'border-border/80 bg-sand/60'"
            >
              <span class="text-[11px] font-bold uppercase tracking-wider" :class="pkg.isDark ? 'text-surface/70' : 'text-ink-secondary'">
                {{ locale === 'ar' ? 'عينة الخامات:' : 'Material board:' }}
              </span>
              <div class="flex items-center gap-1.5">
                <span
                  v-for="(item, iIdx) in pkg.previewItems"
                  :key="iIdx"
                  class="h-7 w-7 rounded-control overflow-hidden border shrink-0 flex items-center justify-center shadow-subtle"
                  :class="pkg.isDark ? 'border-navy-700' : 'border-border/90 bg-surface'"
                  :title="locale === 'ar' ? item.label : item.label_en"
                >
                  <img
                    v-if="item.src"
                    :src="item.src"
                    :alt="locale === 'ar' ? item.label : item.label_en"
                    class="h-full w-full object-cover"
                  >
                  <span
                    v-else-if="item.color"
                    class="h-full w-full"
                    :style="{ backgroundColor: item.color }"
                  />
                </span>
              </div>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <h3 class="text-xl font-bold font-display" :class="pkg.isDark ? 'text-surface' : 'text-ink'">
                  {{ pkg.title }}
                </h3>
                <p
                  class="mt-1.5 text-xs sm:text-sm leading-relaxed"
                  :class="pkg.isDark ? 'text-surface/80' : 'text-ink-secondary'"
                >
                  {{ pkg.desc }}
                </p>
              </div>

              <!-- Pricing Readout -->
              <div class="pt-3 border-t" :class="pkg.isDark ? 'border-navy-800' : 'border-border'">
                <p class="tabular-price text-2xl font-extrabold" :class="pkg.isDark ? 'text-saffron-300' : 'text-ink'">
                  ~{{ formatNumber(pkg.costPerSqm) }}
                  <span class="text-xs font-normal" :class="pkg.isDark ? 'text-surface/75' : 'text-ink-secondary'">
                    {{ currencySymbol(locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
                  </span>
                </p>
                <p class="tabular-price text-xs mt-0.5" :class="pkg.isDark ? 'text-surface/70' : 'text-ink-secondary'">
                  {{ locale === 'ar' ? 'لشقة 120 م²:' : 'For 120 m² apartment:' }}
                  <strong :class="pkg.isDark ? 'text-surface font-bold' : 'text-ink font-bold'">
                    {{ formatCurrency(pkg.total120, locale) }}
                  </strong>
                </p>
              </div>

              <!-- Feature Bullets -->
              <ul
                class="space-y-2.5 pt-3 border-t text-xs sm:text-sm"
                :class="pkg.isDark ? 'border-navy-800 text-surface/85' : 'border-border text-ink-secondary'"
              >
                <li v-for="(bullet, bIdx) in pkg.bullets" :key="bIdx" class="flex items-start gap-2.5">
                  <Check
                    class="h-4 w-4 shrink-0 mt-0.5"
                    :class="pkg.isDark ? 'text-saffron-400' : 'text-success'"
                    :stroke-width="2"
                  />
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="px-6 pb-6 pt-2">
            <BaseButton
              :variant="pkg.featured ? 'primary' : (pkg.isDark ? 'light' : 'secondary')"
              block
              @click="startWithPackage(pkg.key)"
            >
              <span>
                {{
                  locale === 'ar'
                    ? `اختر مستوى ${pkg.title}`
                    : `Customize ${pkg.title}`
                }}
              </span>
              <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.8" />
            </BaseButton>
          </div>
        </article>
      </div>
    </section>

    <!-- Live Egyptian Price Market Cards (Redesigned as tactile sample boards) -->
    <section class="bg-sand/70 border-y border-border section-pad relative">
      <div class="shell space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="space-y-2">
            <p class="kicker text-accent">{{ locale === 'ar' ? 'بورصة أسعار الخامات' : 'LIVE EGYPTIAN PRICE MARKET' }}</p>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink">
              {{
                locale === 'ar'
                  ? 'أسعار مواد البناء والتشطيب اليوم في مصر'
                  : 'Today’s material prices across Egypt'
              }}
            </h2>
            <p class="text-xs sm:text-sm text-ink-secondary">
              {{ locale === 'ar' ? 'أسعار استرشادية لمتوسط السوق مع نسب التغير لآخر 30 يوماً ورسوم بيانية.' : 'Market price benchmarks with 30-day change indicators and trend sparklines.' }}
            </p>
          </div>
          <FilterChips v-model="activeMarketCat" :items="marketTabs" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <NuxtLink
            v-for="mat in displayedMarketCards"
            :key="mat.slug"
            :to="localePath(`/market/${mat.slug}`)"
            class="card-surface p-5 flex flex-col justify-between gap-4 border border-border/90 hover:border-primary hover:shadow-card transition-all group rounded-card"
          >
            <!-- Top Swatch + Brand + Title -->
            <div class="flex items-start gap-3.5">
              <TextureSwatch
                :src="mat.image_url"
                :color="mat.swatch_color"
                size="md"
                :zoomable="false"
                :alt="locale === 'ar' ? mat.label_ar : mat.label_en"
                class="shrink-0 group-hover:scale-105 transition-transform shadow-subtle border border-border/80"
              />
              <div class="min-w-0">
                <p class="text-xs font-semibold text-ink-secondary truncate">{{ mat.brand }}</p>
                <h3 class="mt-0.5 text-sm sm:text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-2">
                  {{ locale === 'ar' ? mat.label_ar : mat.label_en }}
                </h3>
                <span class="text-[11px] text-ink-muted">
                  {{ formatCategoryLabel(mat.category, locale) }}
                </span>
              </div>
            </div>

            <!-- Price & Sparkline -->
            <div class="space-y-3 pt-2 border-t border-border/70">
              <div class="flex items-baseline justify-between gap-2">
                <p class="tabular-price text-2xl font-extrabold text-ink">
                  {{ formatNumber(mat.price) }}
                  <span class="text-xs font-medium text-ink-secondary">
                    {{ currencySymbol(locale) }}/{{ locale === 'ar' ? mat.unit_ar : mat.unit }}
                  </span>
                </p>
                <PriceBadge :change-pct="mat.change_30d" />
              </div>

              <SparklineChart :values="mat.sparkline" :width="240" :height="42" class="w-full" />

              <div class="flex items-center justify-between text-xs pt-1 text-ink-secondary">
                <FreshnessLabel :fetched-at="mat.fetched_at" short />
                <span class="text-primary font-semibold group-hover:underline">
                  {{ locale === 'ar' ? 'عرض المؤشر ←' : 'View trend →' }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div class="flex justify-center pt-3">
          <BaseButton variant="secondary" size="lg" :to="localePath('/market')">
            <span>{{ locale === 'ar' ? 'تصفح جميع الخامات والرسوم البيانية لـ 6 أشهر' : 'Browse all materials & 6-month curves' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.8" />
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>
