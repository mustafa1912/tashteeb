<script setup>
import { Check, Sparkles } from 'lucide-vue-next'
import { PACKAGES } from '~/utils/calc/config.js'
import { calculateEstimate } from '~/utils/calc/engine.js'

const wizardStore = useWizardStore()
const marketStore = useMarketStore()
const { locale } = useI18n()

const packageOptions = computed(() => {
  const metaConfig = {
    economy: {
      colorTheme: 'sage',
      badgeClass: 'bg-sage-100 text-sage-800 border border-sage-300',
      activeBorder: 'border-sage-500 bg-sage-50/30 ring-2 ring-sage-400',
      image: '/images/rooms/room-economy.svg',
      previewItems: [
        { label: 'سيراميك 45×45', label_en: 'Ceramic 45×45', src: '/images/materials/ceramic-45x45.svg' },
        { label: 'دهان GLC مطفي', label_en: 'GLC Day-Tone', color: '#ECE8DF' },
        { label: 'سلوك السويدي', label_en: 'El Sewedy Wire', src: '/images/materials/wire-elsewedy.svg' },
        { label: 'صحي ليسيكو', label_en: 'Lecico Bath', src: '/images/materials/sanitary-duravit.svg' }
      ]
    },
    standard: {
      colorTheme: 'saffron',
      badgeClass: 'bg-saffron-500 text-navy-950 font-bold shadow-sm',
      activeBorder: 'border-saffron-500 bg-saffron-50/30 ring-2 ring-saffron-400',
      image: '/images/rooms/room-standard.svg',
      previewItems: [
        { label: 'بورسلين 60×60', label_en: 'Porcelain 60×60', src: '/images/materials/porcelain-60x60.svg' },
        { label: 'جوتن فينوماستيك', label_en: 'Jotun Fenomastic', color: '#E8E1D3' },
        { label: 'جبس كناوف', label_en: 'Knauf Gypsum', src: '/images/materials/gypsum-ceiling.svg' },
        { label: 'أبواب قشرة', label_en: 'Veneer Doors', src: '/images/materials/door-wood-veneer.svg' }
      ]
    },
    super_lux: {
      colorTheme: 'navy',
      badgeClass: 'bg-saffron-400 text-navy-950 font-bold shadow-sm',
      activeBorder: 'border-navy-900 bg-navy-50/40 ring-2 ring-navy-700',
      image: '/images/rooms/room-superlux.svg',
      previewItems: [
        { label: 'رخام جلالة مصقول', label_en: 'Galala Marble', src: '/images/materials/marble-galala.svg' },
        { label: 'جوتن وندروول', label_en: 'Wonderwall Lux', color: '#D9C8B4' },
        { label: 'إضاءة ماجنتيك', label_en: 'Magnetic Track', src: '/images/materials/wire-elsewedy.svg' },
        { label: 'خلاطات جروهي دفن', label_en: 'Grohe Concealed', src: '/images/materials/pipes-banninger.svg' }
      ]
    }
  }

  return ['economy', 'standard', 'super_lux'].map((key) => {
    const meta = PACKAGES[key]
    const cfg = metaConfig[key]
    const preview = calculateEstimate({
      apartment: wizardStore.apartment,
      packageKey: key,
      extras: wizardStore.extras,
      contingencyPct: wizardStore.contingencyPct,
      includeLabour: wizardStore.includeLabour,
      materialsCatalog: marketStore.materials
    })

    return {
      key,
      ...cfg,
      title: locale.value === 'ar' ? meta.label_ar : meta.label_en,
      badge: locale.value === 'ar' ? meta.badge_ar : meta.badge_en,
      desc: locale.value === 'ar' ? meta.desc_ar : meta.desc_en,
      costPerSqm: preview.costPerSqm,
      total: preview.grandTotal
    }
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1.5">
      <p class="kicker text-primary">{{ locale === 'ar' ? 'الخطوة 2 من 5' : 'STEP 2 OF 5' }}</p>
      <h2 class="text-2xl font-display font-bold text-ink">
        {{ locale === 'ar' ? 'اختر مستوى التشطيب الأساسي' : 'Choose your finishing baseline' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'اختيار الباقة يضبط الخامات الافتراضية لكل بند — وفي الخطوة التالية يمكنك تغيير أي خامة أو تعديل سعرها بحرية.'
            : 'Selecting a level pre-fills sensible Egyptian materials for every room. You can swap any material in Step 3.'
        }}
      </p>
    </div>

    <!-- 3 Large Visual Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5" role="radiogroup" aria-label="Finishing level">
      <div
        v-for="pkg in packageOptions"
        :key="pkg.key"
        role="radio"
        :aria-checked="wizardStore.packageKey === pkg.key"
        tabindex="0"
        class="rounded-card border bg-surface overflow-hidden cursor-pointer transition-all flex flex-col justify-between"
        :class="
          wizardStore.packageKey === pkg.key
            ? `${pkg.activeBorder} shadow-card`
            : 'border-border hover:border-primary/50 hover:shadow-subtle'
        "
        @click="wizardStore.selectPackage(pkg.key)"
        @keydown.space.prevent="wizardStore.selectPackage(pkg.key)"
        @keydown.enter.prevent="wizardStore.selectPackage(pkg.key)"
      >
        <div>
          <!-- Room Header Photo -->
          <div class="relative aspect-[16/10] bg-sand overflow-hidden">
            <img
              :src="pkg.image"
              :alt="pkg.title"
              width="400"
              height="250"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-300"
              :class="wizardStore.packageKey === pkg.key ? 'scale-105' : ''"
            >
            <span
              class="absolute top-2.5 start-2.5 rounded-pill px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider shadow-sm"
              :class="pkg.badgeClass"
            >
              {{ pkg.badge }}
            </span>
          </div>

          <!-- Mini MaterialBoard Preview Row -->
          <div class="px-4 py-2.5 border-b border-border/80 bg-sand/50 flex items-center justify-between gap-2 text-xs">
            <span class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
              {{ locale === 'ar' ? 'العينة:' : 'Swatches:' }}
            </span>
            <div class="flex items-center gap-1.5">
              <span
                v-for="(item, iIdx) in pkg.previewItems"
                :key="iIdx"
                class="h-6 w-6 rounded-control overflow-hidden border border-border/90 bg-surface shrink-0 flex items-center justify-center shadow-subtle"
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

          <!-- Card Body -->
          <div class="p-5 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-lg font-display font-bold text-ink">{{ pkg.title }}</h3>
              <span
                v-if="wizardStore.packageKey === pkg.key"
                class="h-5 w-5 rounded-pill bg-primary text-surface grid place-items-center text-xs"
              >
                ✓
              </span>
            </div>

            <p class="text-xs text-ink-secondary leading-relaxed line-clamp-3">
              {{ pkg.desc }}
            </p>

            <div class="pt-3 border-t border-border">
              <p class="tabular-price text-xl font-extrabold text-ink">
                {{ formatCurrency(pkg.total, locale) }}
              </p>
              <p class="tabular-price text-xs text-ink-secondary mt-0.5">
                ~{{ formatNumber(pkg.costPerSqm) }} {{ currencySymbol(locale) }}/{{ locale === 'ar' ? 'م²' : 'm²' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 pt-0">
          <button
            type="button"
            class="w-full min-h-touch rounded-control text-xs font-bold py-2 px-3 border transition-all"
            :class="
              wizardStore.packageKey === pkg.key
                ? 'bg-primary text-surface border-primary shadow-sm'
                : 'bg-surface text-ink-secondary border-border hover:bg-sand hover:text-ink'
            "
          >
            {{ wizardStore.packageKey === pkg.key ? (locale === 'ar' ? 'المستوى المختار ✓' : 'Selected level ✓') : (locale === 'ar' ? 'اختيار هذا المستوى' : 'Select this level') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
