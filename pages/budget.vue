<script setup>
import {
  Wallet,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Check,
  SlidersHorizontal
} from 'lucide-vue-next'
import { CATEGORIES, GOVERNORATES, PACKAGES } from '~/utils/calc/config.js'
import { getCalculatorMaterials } from '~/utils/calc/catalog.js'
import { planTargetBudget } from '~/utils/calc/budget.js'

definePageMeta({
  layout: 'public'
})

const { locale } = useI18n()
const localePath = useLocalePath()

const marketStore = useMarketStore()
const wizardStore = useWizardStore()
const estimatesStore = useEstimatesStore()
const uiStore = useUiStore()

onMounted(() => {
  marketStore.hydrate()
  estimatesStore.hydrate()
})

useHead(() => ({
  title: locale.value === 'ar' ? 'مخطط الميزانية المستهدفة — تشطيب' : 'Target-Budget Planner — Tashteeb'
}))

const targetBudget = ref(480000)
const area = ref(120)
const governorate = ref('cairo')
const includeLabour = ref(true)
const contingencyPct = ref(0.10)
const priorityCategories = ref(['floors', 'kitchen'])
const lockedSelections = ref({})

const budgetPresets = [300000, 480000, 650000, 950000]

const govOptions = computed(() =>
  GOVERNORATES.map(g => ({
    value: g.code,
    label: locale.value === 'ar' ? g.label_ar : g.label_en
  }))
)

const apartmentSpec = computed(() => ({
  unitType: 'apartment',
  area: Math.max(35, Math.min(600, Number(area.value) || 120)),
  governorate: governorate.value,
  bedrooms: area.value >= 150 ? 3 : area.value >= 90 ? 2 : 1,
  bathrooms: area.value >= 110 ? 2 : 1,
  kitchens: 1,
  reception: 2,
  balconies: 1
}))

const planResult = computed(() =>
  planTargetBudget({
    targetBudget: targetBudget.value,
    apartment: apartmentSpec.value,
    priorityCategories: priorityCategories.value,
    lockedSelections: lockedSelections.value,
    includeLabour: includeLabour.value,
    contingencyPct: contingencyPct.value,
    materialsCatalog: marketStore.materials
  })
)

const calcCatalog = computed(() => getCalculatorMaterials(marketStore.materials))

function getMaterialsForCat(catKey) {
  return calcCatalog.value.filter(m => m.category === catKey)
}

function getTierBadge(tier) {
  if (tier === 'super_lux') {
    return {
      label: locale.value === 'ar' ? 'سوبر لوكس' : 'Super Lux',
      classes: 'bg-accent-tint text-accent'
    }
  }
  if (tier === 'standard') {
    return {
      label: locale.value === 'ar' ? 'قياسي' : 'Standard',
      classes: 'bg-primary-tint text-primary'
    }
  }
  return {
    label: locale.value === 'ar' ? 'اقتصادي' : 'Economy',
    classes: 'bg-sand text-ink-secondary'
  }
}

function togglePriority(catKey) {
  if (priorityCategories.value.includes(catKey)) {
    priorityCategories.value = priorityCategories.value.filter(k => k !== catKey)
  } else {
    priorityCategories.value = [...priorityCategories.value, catKey]
  }
}

function isLocked(catKey) {
  return Boolean(lockedSelections.value[catKey])
}

function toggleLockCategory(catKey) {
  const next = { ...lockedSelections.value }
  if (next[catKey]) {
    delete next[catKey]
  } else {
    next[catKey] = planResult.value.selections[catKey]
  }
  lockedSelections.value = next
}

function lockSpecificMaterial(catKey, slug) {
  lockedSelections.value = {
    ...lockedSelections.value,
    [catKey]: slug
  }
}

function applyTradeOff(trade) {
  const next = { ...lockedSelections.value }
  next[trade.downgradeCategory] = trade.toSlug
  if (trade.upgrade) {
    next[trade.upgrade.categoryKey] = trade.upgrade.toSlug
  }
  lockedSelections.value = next
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم تطبيق التبديل الذكي على الخطة' : 'Smart trade-off applied',
    type: 'success'
  })
}

const allocationSegments = computed(() =>
  planResult.value.estimate.categories.map((cat, idx) => ({
    key: cat.key,
    label: locale.value === 'ar' ? cat.label_ar : cat.label_en,
    value: cat.subtotal,
    colorIndex: idx % 7
  }))
)

function openPlanInCalculator() {
  wizardStore.loadFromInput({
    id: null,
    title: locale.value === 'ar' ? `خطة ميزانية ${formatNumber(targetBudget.value)} ج.م` : `${formatNumber(targetBudget.value)} EGP Budget Plan`,
    input: {
      apartment: apartmentSpec.value,
      packageKey: 'standard',
      selections: planResult.value.selections,
      overrides: {},
      extras: [],
      contingencyPct: contingencyPct.value,
      includeLabour: includeLabour.value
    }
  })
  wizardStore.setStep(2)
  navigateTo(localePath('/calculator'))
}

function generateInvoiceFromPlan() {
  wizardStore.loadFromInput({
    id: null,
    title: locale.value === 'ar' ? `مقايسة بميزانية ${formatNumber(targetBudget.value)} ج.م` : `${formatNumber(targetBudget.value)} EGP Planned Apartment`,
    input: {
      apartment: apartmentSpec.value,
      packageKey: 'standard',
      selections: planResult.value.selections,
      overrides: {},
      extras: [],
      contingencyPct: contingencyPct.value,
      includeLabour: includeLabour.value
    }
  })
  const created = estimatesStore.createOrUpdateFromWizard(wizardStore, 'ready')
  navigateTo(localePath(`/estimate/${created.id}`))
}
</script>

<template>
  <div class="shell py-10 sm:py-14 space-y-8">
    <!-- Hero Heading -->
    <div class="max-w-3xl space-y-2">
      <div class="inline-flex items-center gap-2 rounded-pill bg-primary-tint px-3 py-1 text-xs font-bold text-primary">
        <Wallet class="h-3.5 w-3.5" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'توزيع ذكي للميزانية المتاحة' : 'SMART BUDGET ALLOCATOR' }}</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-ink">
        {{ locale === 'ar' ? 'مخطط الميزانية المستهدفة للتشطيب' : 'Plan finishing around your exact budget' }}
      </h1>
      <p class="text-base text-ink-secondary">
        {{
          locale === 'ar'
            ? 'أدخل ميزانيتك الإجمالية ومساحة الشقة وحدد البنود ذات الأولوية، وسنختار أفضل توليفة خامات تناسب ميزانيتك.'
            : 'Enter your total budget, apartment size, and priority rooms. We allocate weights, pick optimal material tiers, and suggest smart trade-offs.'
        }}
      </p>
    </div>

    <!-- Top Controls Panel -->
    <section class="rounded-card border border-border bg-surface p-6 shadow-card space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <!-- Budget Input -->
        <div class="md:col-span-5">
          <BaseInput
            v-model="targetBudget"
            type="number"
            :min="100000"
            :step="10000"
            :label="locale === 'ar' ? 'الميزانية الإجمالية المستهدفة' : 'Your target total budget'"
            :suffix="currencySymbol(locale)"
          />
        </div>

        <!-- Area -->
        <div class="md:col-span-3">
          <BaseInput
            v-model="area"
            type="number"
            :min="40"
            :max="500"
            :label="locale === 'ar' ? 'مساحة الوحدة الصافية' : 'Indoor area'"
            :suffix="locale === 'ar' ? 'م²' : 'm²'"
          />
        </div>

        <!-- Governorate -->
        <div class="md:col-span-4">
          <SelectField
            v-model="governorate"
            :label="locale === 'ar' ? 'المحافظة' : 'Governorate'"
            :options="govOptions"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-1.5 -mt-2">
        <span class="text-xs text-ink-secondary me-1">{{ locale === 'ar' ? 'ميزانيات سريعة:' : 'Quick budgets:' }}</span>
        <button
          v-for="preset in budgetPresets"
          :key="preset"
          type="button"
          class="rounded-pill border px-3 py-1 text-xs font-semibold tabular-price transition-colors"
          :class="Number(targetBudget) === preset ? 'border-primary bg-primary text-surface' : 'border-border bg-sand/70 text-ink hover:border-primary'"
          @click="targetBudget = preset"
        >
          {{ formatCompactK(preset) }}
        </button>
      </div>

      <!-- Priority Category Chips -->
      <div class="border-t border-border pt-5 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-bold text-ink">
            {{ locale === 'ar' ? 'ما هي البنود الأكثر أهمية لك؟ (تأخذ أولوية الترقية)' : 'Which categories matter most to you? (Upgraded first)' }}
          </p>
          <button
            v-if="Object.keys(lockedSelections).length > 0"
            type="button"
            class="text-xs font-semibold text-primary hover:underline"
            @click="lockedSelections = {}"
          >
            {{ locale === 'ar' ? 'إلغاء تثبيت جميع البنود المقفلة' : 'Unlock all pinned categories' }}
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.key"
            type="button"
            :aria-pressed="priorityCategories.includes(cat.key)"
            class="min-h-[40px] rounded-pill border px-3.5 py-1.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
            :class="priorityCategories.includes(cat.key) ? 'border-primary bg-primary text-surface' : 'border-border bg-sand/50 text-ink-secondary hover:text-ink'"
            @click="togglePriority(cat.key)"
          >
            <Check v-if="priorityCategories.includes(cat.key)" class="h-3.5 w-3.5" :stroke-width="2" />
            <span>{{ locale === 'ar' ? cat.label_ar : cat.label_en }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- "Budget Too Low" Honest Fallback Banner -->
    <div
      v-if="planResult.isBelowMinimum"
      role="alert"
      class="rounded-card border border-warning bg-warning-tint p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="flex items-start gap-3">
        <AlertTriangle class="h-5 w-5 text-warning shrink-0 mt-0.5" :stroke-width="1.8" />
        <div class="space-y-1">
          <p class="text-sm font-bold text-ink">
            {{
              locale === 'ar'
                ? 'الميزانية المدخلة أقل من الحد الأدنى للتشطيب الاقتصادي الكامل في السوق حالياً'
                : 'Target budget is below the realistic Economy baseline for this area'
            }}
          </p>
          <p class="text-xs sm:text-sm text-ink-secondary">
            {{
              locale === 'ar'
                ? `أقل خطة تشطيب اقتصادي كاملة (شاملة الهالك والطوارئ) تحتاج حوالي ${formatCurrency(planResult.minimumEconomyTotal, 'ar')}. نعرض لك أدناه أقرب خطة اقتصادية واقعية.`
                : `A complete Economy finish for ${area} m² starts around ${formatCurrency(planResult.minimumEconomyTotal, 'en')}. Showing the closest realistic Economy plan below.`
            }}
          </p>
        </div>
      </div>

      <BaseButton variant="secondary" size="sm" class="shrink-0" @click="targetBudget = planResult.minimumEconomyTotal">
        {{ locale === 'ar' ? 'ضبط على الحد الاقتصادي' : 'Match Economy minimum' }}
      </BaseButton>
    </div>

    <!-- 3 Dark-Teal Balance Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="rounded-card bg-primary-deep text-surface p-5 space-y-1">
        <span class="text-xs font-semibold uppercase text-surface/75">
          {{ locale === 'ar' ? 'ميزانيتك المستهدفة' : 'Target Budget' }}
        </span>
        <p class="tabular-price text-2xl sm:text-3xl font-extrabold text-surface">
          {{ formatCurrency(planResult.targetBudget, locale) }}
        </p>
      </div>

      <div class="rounded-card bg-primary-deep text-surface p-5 space-y-1">
        <span class="text-xs font-semibold uppercase text-surface/75">
          {{ locale === 'ar' ? 'إجمالي الخطة المقترحة' : 'Planned Estimate' }}
        </span>
        <p class="tabular-price text-2xl sm:text-3xl font-extrabold text-accent-dark">
          {{ formatCurrency(planResult.plannedTotal, locale) }}
        </p>
        <p class="text-xs text-surface/75 tabular-price">
          {{ formatCurrency(planResult.estimate.costPerSqm, locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
        </p>
      </div>

      <div class="rounded-card border-2 p-5 space-y-1" :class="planResult.remainingBudget >= 0 ? 'border-success/40 bg-success-tint/50' : 'border-danger/40 bg-danger-tint/50'">
        <span class="text-xs font-bold uppercase" :class="planResult.remainingBudget >= 0 ? 'text-success' : 'text-danger'">
          {{
            planResult.remainingBudget >= 0
              ? (locale === 'ar' ? 'فائض متبقي للأمان' : 'Remaining cushion')
              : (locale === 'ar' ? 'عجز عن الميزانية' : 'Over target budget by')
          }}
        </span>
        <p class="tabular-price text-2xl sm:text-3xl font-extrabold" :class="planResult.remainingBudget >= 0 ? 'text-success' : 'text-danger'">
          <bdi>{{ planResult.remainingBudget >= 0 ? '+' : '−' }}{{ formatCurrency(Math.abs(planResult.remainingBudget), locale) }}</bdi>
        </p>
      </div>
    </div>

    <!-- Category Share StackedBar -->
    <section class="rounded-card border border-border bg-surface p-5 sm:p-6 shadow-card space-y-3">
      <h2 class="text-base font-bold text-ink">
        {{ locale === 'ar' ? 'توزيع الميزانية على البنود (8 أقسام)' : 'Budget allocation across categories' }}
      </h2>
      <StackedBar :segments="allocationSegments" />
    </section>

    <!-- Smart Trade-off Suggestions -->
    <section v-if="planResult.tradeOffs.length > 0" class="space-y-3">
      <div class="flex items-center gap-2">
        <Sparkles class="h-5 w-5 text-accent" :stroke-width="1.5" />
        <h2 class="text-lg font-bold text-ink">
          {{ locale === 'ar' ? 'مقترحات تبديل ذكية لتحسين التوليفة' : 'Smart trade-off suggestions' }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="trade in planResult.tradeOffs"
          :key="trade.id"
          class="rounded-card border border-border bg-surface p-5 shadow-card flex flex-col justify-between gap-4"
        >
          <p class="text-sm font-medium text-ink leading-relaxed">
            {{ locale === 'ar' ? trade.message_ar : trade.message_en }}
          </p>

          <BaseButton variant="secondary" size="sm" class="self-start" @click="applyTradeOff(trade)">
            <span>{{ locale === 'ar' ? 'تطبيق هذا التبديل' : 'Apply trade-off' }}</span>
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- 8 Category Allocation Cards with Lock/Pin Controls -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">
          {{ locale === 'ar' ? 'الخامات المختارة لكل بند (يمكنك قفل أي خامة)' : 'Allocated materials per category (Lock any choice to pin it)' }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="cat in planResult.estimate.categories"
          :key="cat.key"
          class="rounded-card border p-5 bg-surface shadow-card space-y-3 transition-colors"
          :class="isLocked(cat.key) ? 'border-primary ring-1 ring-primary/25' : 'border-border'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <TextureSwatch
                v-if="cat.items[0]"
                :src="cat.items[0].image_url"
                :color="cat.items[0].swatch_color"
                size="sm"
                :zoomable="false"
                :alt="locale === 'ar' ? cat.items[0].label_ar : cat.items[0].label_en"
                class="shrink-0 mt-0.5 shadow-subtle border border-border/80"
              />
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-ink">
                    {{ locale === 'ar' ? cat.label_ar : cat.label_en }}
                  </h3>
                  <span
                    v-if="cat.items[0]"
                    class="rounded-pill px-2.5 py-0.5 text-xs font-bold"
                    :class="getTierBadge(cat.items[0].tier).classes"
                  >
                    {{ getTierBadge(cat.items[0].tier).label }}
                  </span>
                </div>
                <p v-if="cat.items[0]" class="text-xs text-ink-secondary mt-1">
                  {{ locale === 'ar' ? cat.items[0].label_ar : cat.items[0].label_en }}
                </p>
              </div>
            </div>

            <div class="text-end shrink-0">
              <p class="tabular-price text-base font-extrabold text-primary">
                {{ formatCurrency(cat.subtotal, locale) }}
              </p>
              <button
                type="button"
                class="mt-1 inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold transition-colors"
                :class="isLocked(cat.key) ? 'bg-primary text-surface' : 'bg-sand text-ink-secondary hover:text-ink'"
                @click="toggleLockCategory(cat.key)"
              >
                <Lock v-if="isLocked(cat.key)" class="h-3 w-3" :stroke-width="1.8" />
                <Unlock v-else class="h-3 w-3" :stroke-width="1.8" />
                <span>{{ isLocked(cat.key) ? (locale === 'ar' ? 'مثبت' : 'Locked') : (locale === 'ar' ? 'تثبيت' : 'Lock') }}</span>
              </button>
            </div>
          </div>

          <!-- Quick Tier Override Selector (auto-locks) -->
          <div class="pt-2 border-t border-border flex flex-wrap items-center gap-1.5">
            <button
              v-for="mat in getMaterialsForCat(cat.key)"
              :key="mat.slug"
              type="button"
              class="rounded-control px-2.5 py-1 text-xs font-semibold transition-colors"
              :class="planResult.selections[cat.key] === mat.slug ? 'bg-primary-tint text-primary border border-primary/30' : 'bg-sand/60 text-ink-secondary hover:text-ink'"
              @click="lockSpecificMaterial(cat.key, mat.slug)"
            >
              {{ getTierBadge(mat.tier).label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA Bar -->
    <section class="rounded-card bg-sand border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="space-y-1 text-center sm:text-start">
        <h2 class="text-lg font-bold text-ink">
          {{ locale === 'ar' ? 'هل تناسبك هذه الخطة؟ حوّلها إلى فاتورة تفصيلية الآن' : 'Happy with this allocation? Turn it into a full itemized invoice' }}
        </h2>
        <p class="text-xs sm:text-sm text-ink-secondary">
          {{
            locale === 'ar'
              ? 'ستحصل على كميات الشراء بالهالك، جدول التنفيذ الزمني، وقائمة مشتريات جاهزة للطباعة.'
              : 'Get exact carton/bucket quantities, Gantt construction timeline, and a printable shopping list.'
          }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 shrink-0">
        <BaseButton variant="secondary" @click="openPlanInCalculator">
          <SlidersHorizontal class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تخصيص في الحاسبة' : 'Edit in Calculator' }}</span>
        </BaseButton>
        <BaseButton variant="accent" @click="generateInvoiceFromPlan">
          <span>{{ locale === 'ar' ? 'إصدار الفاتورة التفصيلية' : 'Generate full invoice' }}</span>
          <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
        </BaseButton>
      </div>
    </section>
  </div>
</template>
