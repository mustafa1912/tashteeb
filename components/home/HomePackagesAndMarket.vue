<script setup>
import { Check, ArrowRight, Layers } from 'lucide-vue-next'
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
      photo: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=700&q=80',
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
      photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
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
      photo: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=80',
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
      'portland-cement-cem-i-42-5n-ton'
    ]
    return featuredSlugs
      .map(slug => all.find(m => m.slug === slug))
      .filter(Boolean)
  }
  if (activeMarketCat.value === 'electrical') {
    return all.filter(m => m.category === 'electrical' || m.category === 'raw_materials').slice(0, 4)
  }
  return all.filter(m => m.category === activeMarketCat.value).slice(0, 4)
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
    <!-- 3 Finishing Packages -->
    <section class="shell section-pad">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div class="space-y-2 max-w-2xl">
          <p class="kicker">{{ locale === 'ar' ? 'مستويات التشطيب' : 'FINISHING PACKAGES' }}</p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink">
            {{
              locale === 'ar'
                ? 'ثلاث مستويات تشطيب واضحة — قابلة للتخصيص بالكامل'
                : 'Three practical starting baselines — customize every item'
            }}
          </h2>
        </div>
        <BaseButton variant="secondary" :to="localePath('/estimate/ts-2408/compare')">
          <span>{{ locale === 'ar' ? 'قارن الباقات بالتفصيل' : 'Compare packages side by side' }}</span>
        </BaseButton>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <article
          v-for="pkg in packageCards"
          :key="pkg.key"
          class="rounded-card bg-surface overflow-hidden flex flex-col justify-between transition-shadow"
          :class="
            pkg.featured
              ? 'border-2 border-primary shadow-elevated lg:-translate-y-1.5'
              : 'border border-border shadow-card'
          "
        >
          <div>
            <div class="relative aspect-[16/10] bg-sand overflow-hidden">
              <img
                :src="pkg.photo"
                :alt="pkg.title"
                width="640"
                height="400"
                loading="lazy"
                class="h-full w-full object-cover"
              >
              <span
                class="absolute top-3 start-3 rounded-pill px-3 py-1 text-xs font-bold uppercase shadow-sm"
                :class="pkg.featured ? 'bg-accent text-surface' : 'bg-surface/95 text-primary'"
              >
                {{ pkg.badge }}
              </span>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <h3 class="text-xl font-bold text-ink">{{ pkg.title }}</h3>
                <p class="mt-1.5 text-sm text-ink-secondary leading-relaxed">{{ pkg.desc }}</p>
              </div>

              <div class="pt-2 border-t border-border">
                <p class="tabular-price text-2xl font-extrabold text-ink">
                  ~{{ formatNumber(pkg.costPerSqm) }}
                  <span class="text-sm font-medium text-ink-secondary">
                    {{ currencySymbol(locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
                  </span>
                </p>
                <p class="tabular-price text-xs text-ink-secondary mt-0.5">
                  {{ locale === 'ar' ? 'لشقة 120 م²:' : 'For 120 m²:' }}
                  {{ formatCurrency(pkg.total120, locale) }}
                </p>
              </div>

              <ul class="space-y-2.5 pt-2 border-t border-border text-sm text-ink-secondary">
                <li v-for="(bullet, bIdx) in pkg.bullets" :key="bIdx" class="flex items-start gap-2.5">
                  <Check class="h-4 w-4 text-success shrink-0 mt-0.5" :stroke-width="2" />
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="px-6 pb-6">
            <BaseButton
              :variant="pkg.featured ? 'primary' : 'secondary'"
              block
              @click="startWithPackage(pkg.key)"
            >
              <span>
                {{
                  locale === 'ar'
                    ? `ابدأ بهذا المستوى`
                    : `Customize ${pkg.title}`
                }}
              </span>
              <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
            </BaseButton>
          </div>
        </article>
      </div>
    </section>

    <!-- Live Egyptian Price Market Ticker -->
    <section class="bg-sand border-y border-border section-pad">
      <div class="shell space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="space-y-2">
            <p class="kicker">{{ locale === 'ar' ? 'بورصة أسعار الخامات' : 'LIVE EGYPTIAN PRICE MARKET' }}</p>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink">
              {{
                locale === 'ar'
                  ? 'أسعار الخامات اليوم في السوق المصري'
                  : 'Today’s material prices across Egypt'
              }}
            </h2>
          </div>
          <FilterChips v-model="activeMarketCat" :items="marketTabs" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="mat in displayedMarketCards"
            :key="mat.slug"
            :to="localePath(`/market/${mat.slug}`)"
            class="card-surface p-5 flex flex-col justify-between gap-4 hover:border-primary transition-colors group"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-medium text-ink-secondary truncate">{{ mat.brand }}</p>
                <h3 class="mt-0.5 text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-2">
                  {{ locale === 'ar' ? mat.label_ar : mat.label_en }}
                </h3>
              </div>
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
                <Layers class="h-4 w-4" :stroke-width="1.5" />
              </span>
            </div>

            <div class="space-y-3">
              <div class="flex items-baseline justify-between gap-2">
                <p class="tabular-price text-2xl font-extrabold text-ink">
                  {{ formatNumber(mat.price) }}
                  <span class="text-xs font-medium text-ink-secondary">
                    {{ currencySymbol(locale) }}/{{ locale === 'ar' ? mat.unit_ar : mat.unit }}
                  </span>
                </p>
                <PriceBadge :change-pct="mat.change_30d" />
              </div>

              <SparklineChart :values="mat.sparkline" :width="210" :height="38" class="w-full" />

              <FreshnessLabel :fetched-at="mat.fetched_at" short />
            </div>
          </NuxtLink>
        </div>

        <div class="flex justify-center pt-2">
          <BaseButton variant="secondary" size="lg" :to="localePath('/market')">
            <span>{{ locale === 'ar' ? 'تصفح جميع أسعار الخامات ومؤشر الـ 6 أشهر' : 'Browse all materials & 6-month charts' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>
