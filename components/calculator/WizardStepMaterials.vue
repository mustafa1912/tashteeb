<script setup>
import {
  CATEGORIES,
  CATEGORY_COLORS,
  getGovernorateFactor
} from '~/utils/calc/config.js'

const props = defineProps({
  activeCategory: {
    type: String,
    default: 'floors'
  }
})

const emit = defineEmits(['update:activeCategory', 'edit-price'])
const wizardStore = useWizardStore()
const marketStore = useMarketStore()
const { locale } = useI18n()

const govFactor = computed(() => getGovernorateFactor(wizardStore.apartment.governorate))

const categoryTabs = computed(() =>
  CATEGORIES.map(c => ({
    key: c.key,
    label: locale.value === 'ar' ? c.label_ar : c.label_en,
    color: CATEGORY_COLORS[c.key] || '#0F5C6E'
  }))
)

const categoryMaterials = computed(() =>
  marketStore.calculatorMaterials
    .filter(m => m.category === props.activeCategory)
    .map(m => ({
      ...m,
      price: Math.round(m.price * govFactor.value),
      market_base_price: Math.round(m.price * govFactor.value),
      min_price: Math.round((m.min_price || m.price * 0.9) * govFactor.value),
      max_price: Math.round((m.max_price || m.price * 1.12) * govFactor.value)
    }))
)

const activeCategoryLine = computed(() =>
  wizardStore.liveEstimate.items.find(i => i.category === props.activeCategory)
)

function resolveOverrideForCard(mat) {
  const ov = wizardStore.overrides[mat.slug]
  if (!ov || !ov.used_price) return null
  if (Math.round(Number(ov.used_price)) === mat.price) return null
  return {
    is_overridden: true,
    original_price: mat.price,
    used_price: Math.round(Number(ov.used_price)),
    reason: ov.reason || ''
  }
}

// Interactive FanDeck color picker state for wall paint
const selectedWallColor = ref('#ECE8DF')
const curatedWallColors = [
  { name: 'Warm White', nameAr: 'أبيض دافئ', code: 'W-100', hex: '#FAF7F2' },
  { name: 'Jasmine Cream', nameAr: 'كريمي ياسمين', code: 'C-102', hex: '#F6EFE3' },
  { name: 'Desert Sand', nameAr: 'رمل صحراوي', code: 'S-205', hex: '#EADBC8' },
  { name: 'Siwa Sage', nameAr: 'سيج سيوة', code: 'S-402', hex: '#7DBE9A' },
  { name: 'Aswan Terracotta', nameAr: 'طمي أسوان', code: 'T-108', hex: '#D8572A' },
  { name: 'Nile Sky', nameAr: 'سماء النيل', code: 'N-301', hex: '#6FB1D9' },
  { name: 'Rosetta Clay', nameAr: 'طمي رشيد', code: 'R-204', hex: '#E8A598' },
  { name: 'Luxor Saffron', nameAr: 'زعفران الأقصر', code: 'L-501', hex: '#F4B223' }
]

function handleFanDeckColorSelect(colorObj) {
  selectedWallColor.value = colorObj.hex
}

// Floor Tile Pattern Picker
const selectedTilePattern = ref('straight')
const tilePatterns = [
  { key: 'straight', wastePct: 10, label: 'Straight', labelAr: 'عدل مستقيم' },
  { key: 'diagonal', wastePct: 15, label: 'Diagonal 45°', labelAr: 'سمبكسة مائل' },
  { key: 'herringbone', wastePct: 18, label: 'Herringbone', labelAr: 'سبعة في ثمانية' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1.5">
      <p class="kicker text-primary">{{ locale === 'ar' ? 'الخطوة 3 من 5' : 'STEP 3 OF 5' }}</p>
      <h2 class="text-2xl font-display font-bold text-ink">
        {{ locale === 'ar' ? 'تخصيص الخامات ومراجعة الأسعار' : 'Select materials & customize prices' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'اختر الخامة المناسبة لكل بند، أو اضغط على القلم لتعديل السعر يدوياً لحساب التكلفة بدقة.'
            : 'Choose your preferred finish per category, or click the pencil icon to enter custom showroom quotes.'
        }}
      </p>
    </div>

    <!-- Category Tabs with Visual Color Dots -->
    <div class="overflow-x-auto pb-1">
      <div class="flex items-center gap-2 min-w-max border-b border-border">
        <button
          v-for="cat in categoryTabs"
          :key="cat.key"
          type="button"
          class="relative flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px"
          :class="
            activeCategory === cat.key
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-ink-secondary hover:text-ink'
          "
          @click="emit('update:activeCategory', cat.key)"
        >
          <span
            class="h-2.5 w-2.5 rounded-pill shrink-0"
            :style="{ backgroundColor: cat.color }"
          />
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <!-- Active Category Quantity Context Strip -->
    <div
      v-if="activeCategoryLine"
      class="rounded-control border border-border bg-sand/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div class="space-y-0.5">
        <span class="text-ink-secondary">
          {{ locale === 'ar' ? 'الكمية المحسوبة لهذا البند (شاملة الهالك):' : 'Calculated purchase quantity (incl. waste):' }}
        </span>
        <div class="font-bold text-ink text-sm tabular-price">
          {{ activeCategoryLine.purchased_qty }}
          {{ locale === 'ar' ? activeCategoryLine.sale_unit_ar : activeCategoryLine.sale_unit }}
          <span class="text-ink-secondary text-xs font-normal">
            ({{ activeCategoryLine.needed_qty }} {{ locale === 'ar' ? activeCategoryLine.unit_ar : activeCategoryLine.unit }} + {{ Math.round(activeCategoryLine.waste_pct * 100) }}% {{ locale === 'ar' ? 'هالك' : 'waste' }})
          </span>
        </div>
      </div>

      <div class="text-end">
        <span class="text-xs text-ink-secondary block">
          {{ locale === 'ar' ? 'إجمالي البند الحالي:' : 'Category subtotal:' }}
        </span>
        <span class="tabular-price text-sm sm:text-base font-extrabold text-primary">
          {{ formatCurrency(activeCategoryLine.subtotal, locale) }}
        </span>
      </div>
    </div>

    <!-- Interactive Fan-Deck for Wall Paint -->
    <div
      v-if="activeCategory === 'walls'"
      class="rounded-card border border-border/80 bg-cream p-5 space-y-4 shadow-subtle"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-accent">
            {{ locale === 'ar' ? 'لوحة درجات الدهان المصرية' : 'EGYPTIAN WALL PAINT FAN-DECK' }}
          </span>
          <h3 class="text-base font-bold font-display text-ink mt-0.5">
            {{ locale === 'ar' ? 'مرر الماوس واستكشف الألوان المعتمدة' : 'Hover to fan out and choose a wall shade' }}
          </h3>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="h-4 w-4 rounded-pill border border-border shadow-sm shrink-0" :style="{ backgroundColor: selectedWallColor }" />
          <span class="font-bold text-ink">{{ selectedWallColor }}</span>
        </div>
      </div>

      <div class="flex justify-center py-2">
        <FanDeck
          :colors="curatedWallColors"
          :model-value="selectedWallColor"
          @change="handleFanDeckColorSelect"
        />
      </div>
    </div>

    <!-- Interactive Tile Pattern Picker for Floors -->
    <div
      v-if="activeCategory === 'floors'"
      class="rounded-card border border-border/80 bg-sand/40 p-5 space-y-3"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-primary">
            {{ locale === 'ar' ? 'طريقة رص وبلاط الأرضيات' : 'TILE LAYOUT PATTERN & WASTE' }}
          </span>
          <h3 class="text-base font-bold font-display text-ink mt-0.5">
            {{ locale === 'ar' ? 'نمط التركيب ونسبة الهالك الإضافي' : 'Pattern layout affects cutting waste' }}
          </h3>
        </div>
        <span class="text-xs text-ink-secondary">
          {{ locale === 'ar' ? 'يؤثر على حساب عدد الكراتين' : 'Adjusts carton requirements' }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-3 pt-1">
        <TilePattern
          v-for="p in tilePatterns"
          :key="p.key"
          :pattern="p.key"
          :label="p.label"
          :label-ar="p.labelAr"
          :waste-pct="p.wastePct"
          :active="selectedTilePattern === p.key"
          @select="selectedTilePattern = p.key"
        />
      </div>
    </div>

    <!-- Material Cards Grid (Visual only, no text-only cards) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" :aria-label="activeCategory">
      <MaterialCard
        v-for="mat in categoryMaterials"
        :key="mat.slug"
        :material="mat"
        :selected="wizardStore.selections[activeCategory] === mat.slug"
        :override="resolveOverrideForCard(mat)"
        @select="wizardStore.selectMaterial(activeCategory, mat.slug)"
        @edit-price="emit('edit-price', { material: mat, purchasedQty: activeCategoryLine?.purchased_qty || 1 })"
      />
    </div>
  </div>
</template>
