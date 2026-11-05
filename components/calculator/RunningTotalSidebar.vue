<script setup>
import { Clock, Ruler, Pencil, ChevronUp, ChevronDown, ArrowRight, Layers, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  estimate: {
    type: Object,
    required: true
  },
  isLastStep: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['next', 'finish'])
const { locale } = useI18n()
const mobileExpanded = ref(false)

// Smooth count-up for grand total in sidebar
const displayTotal = ref(props.estimate.grandTotal)
let animationFrame = null

watch(
  () => props.estimate.grandTotal,
  (newVal, oldVal) => {
    if (!import.meta.client) {
      displayTotal.value = newVal
      return
    }
    const start = oldVal || displayTotal.value || newVal
    const diff = newVal - start
    const duration = 300
    const startTime = performance.now()

    if (animationFrame) cancelAnimationFrame(animationFrame)

    function step(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      displayTotal.value = Math.round(start + diff * ease)
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        displayTotal.value = newVal
      }
    }
    animationFrame = requestAnimationFrame(step)
  }
)

// First 4 non-extras items for mini MaterialBoard preview in sidebar
const previewSwatches = computed(() => {
  const items = props.estimate.items || []
  return items.filter(i => i.category !== 'extras').slice(0, 4)
})
</script>

<template>
  <div>
    <!-- Desktop Sticky Card with Nile Navy Background -->
    <aside class="hidden lg:block sticky top-24 rounded-card bg-navy-900 text-surface p-6 shadow-elevated space-y-5 border border-navy-700/80">
      <div class="space-y-1">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-saffron-400">
            {{ locale === 'ar' ? 'الإجمالي اللحظي للمقايسة' : 'RUNNING ESTIMATE' }}
          </span>
          <span
            v-if="estimate.editedCount > 0"
            class="inline-flex items-center gap-1 rounded-pill bg-warning/20 px-2.5 py-0.5 text-xs font-semibold text-warning-tint border border-warning/30"
          >
            <Pencil class="h-3 w-3" :stroke-width="1.5" />
            <span>{{ estimate.editedCount }}</span>
          </span>
        </div>

        <p class="tabular-price text-3xl font-display font-extrabold text-surface pt-1">
          {{ formatCurrency(displayTotal, locale) }}
        </p>

        <p class="tabular-price text-xs text-surface/80">
          {{ locale === 'ar' ? 'النطاق المتوقع:' : 'Likely range:' }}
          {{ formatNumber(estimate.rangeMin) }} – {{ formatCurrency(estimate.rangeMax, locale) }}
        </p>
      </div>

      <!-- Area & Duration pills -->
      <div class="grid grid-cols-2 gap-2.5 pt-1">
        <div class="rounded-control bg-surface/10 px-3 py-2 flex items-center gap-2 text-xs text-surface/90 border border-surface/10">
          <Ruler class="h-4 w-4 text-saffron-300 shrink-0" :stroke-width="1.5" />
          <span class="tabular-price font-semibold">
            {{ estimate.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }}
          </span>
        </div>
        <div class="rounded-control bg-surface/10 px-3 py-2 flex items-center gap-2 text-xs text-surface/90 border border-surface/10">
          <Clock class="h-4 w-4 text-saffron-300 shrink-0" :stroke-width="1.5" />
          <span class="tabular-price font-semibold">
            ~{{ estimate.timeline.totalWeeks }} {{ locale === 'ar' ? 'أسبوع' : 'weeks' }}
          </span>
        </div>
      </div>

      <!-- Mini Swatch Preview Row -->
      <div v-if="previewSwatches.length > 0" class="pt-2 border-t border-surface/15">
        <span class="text-[11px] font-bold uppercase tracking-wider text-surface/70 block mb-2">
          {{ locale === 'ar' ? 'الخامات المختارة:' : 'Selected materials:' }}
        </span>
        <div class="flex items-center gap-2">
          <div
            v-for="sw in previewSwatches"
            :key="sw.id"
            class="h-8 w-8 rounded-control overflow-hidden border border-surface/20 bg-surface/10 shrink-0 shadow-subtle flex items-center justify-center"
            :title="locale === 'ar' ? sw.label_ar : sw.label_en"
          >
            <img
              v-if="sw.image_url"
              :src="sw.image_url"
              :alt="locale === 'ar' ? sw.label_ar : sw.label_en"
              class="h-full w-full object-cover"
            >
            <span
              v-else-if="sw.swatch_color"
              class="h-full w-full"
              :style="{ backgroundColor: sw.swatch_color }"
            />
            <Layers v-else class="h-4 w-4 text-saffron-300" :stroke-width="1.5" />
          </div>
        </div>
      </div>

      <!-- Breakdown lines -->
      <ul class="space-y-2.5 border-t border-surface/15 pt-4 text-sm">
        <li class="flex items-center justify-between gap-2">
          <span class="text-surface/85">{{ locale === 'ar' ? 'الخامات (شامل الهالك)' : 'Materials (incl. waste)' }}</span>
          <strong class="tabular-price font-semibold text-surface">
            {{ formatCurrency(estimate.materialsTotal, locale) }}
          </strong>
        </li>
        <li class="flex items-center justify-between gap-2">
          <span class="text-surface/85">{{ locale === 'ar' ? 'المصنعيات والتركيب' : 'Labour & workmanship' }}</span>
          <strong class="tabular-price font-semibold text-surface">
            {{ estimate.includeLabour ? formatCurrency(estimate.labourTotal, locale) : (locale === 'ar' ? 'مستبعد' : 'Excluded') }}
          </strong>
        </li>
        <li class="flex items-center justify-between gap-2">
          <span class="text-surface/85">
            {{ locale === 'ar' ? 'احتياطي الطوارئ' : 'Contingency' }}
            ({{ Math.round(estimate.contingencyPct * 100) }}%)
          </span>
          <strong class="tabular-price font-semibold text-surface">
            {{ formatCurrency(estimate.contingencyAmount, locale) }}
          </strong>
        </li>
        <li class="flex items-center justify-between gap-2 pt-2 border-t border-surface/10 text-xs text-surface/80">
          <span>{{ locale === 'ar' ? 'متوسط المتر المربع' : 'Average per m²' }}</span>
          <span class="tabular-price font-semibold text-saffron-300">
            {{ formatCurrency(estimate.costPerSqm, locale) }}/{{ locale === 'ar' ? 'م²' : 'm²' }}
          </span>
        </li>
      </ul>

      <FreshnessLabel inverse />
    </aside>

    <!-- Mobile Sticky Bottom Running Bar -->
    <div class="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-navy-900 text-surface border-t border-surface/20 shadow-elevated pb-[env(safe-area-inset-bottom)] no-print">
      <div v-if="mobileExpanded" class="px-4 pt-4 pb-3 border-b border-surface/15 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-surface/80">{{ locale === 'ar' ? 'الخامات:' : 'Materials:' }}</span>
          <span class="tabular-price font-semibold">{{ formatCurrency(estimate.materialsTotal, locale) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-surface/80">{{ locale === 'ar' ? 'المصنعيات:' : 'Labour:' }}</span>
          <span class="tabular-price font-semibold">{{ formatCurrency(estimate.labourTotal, locale) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-surface/80">
            {{ locale === 'ar' ? 'الطوارئ' : 'Contingency' }} ({{ Math.round(estimate.contingencyPct * 100) }}%):
          </span>
          <span class="tabular-price font-semibold">{{ formatCurrency(estimate.contingencyAmount, locale) }}</span>
        </div>
        <div class="pt-1">
          <FreshnessLabel inverse short />
        </div>
      </div>

      <div class="px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          class="text-start min-h-touch flex items-center gap-2"
          @click="mobileExpanded = !mobileExpanded"
        >
          <div>
            <p class="text-[11px] font-bold uppercase text-saffron-400">
              {{ locale === 'ar' ? 'الإجمالي اللحظي' : 'RUNNING TOTAL' }}
            </p>
            <p class="tabular-price text-lg font-extrabold text-surface leading-tight">
              {{ formatCurrency(displayTotal, locale) }}
            </p>
          </div>
          <ChevronDown v-if="mobileExpanded" class="h-4 w-4 text-surface/80" :stroke-width="1.5" />
          <ChevronUp v-else class="h-4 w-4 text-surface/80" :stroke-width="1.5" />
        </button>

        <BaseButton
          variant="accent"
          size="sm"
          @click="isLastStep ? emit('finish') : emit('next')"
        >
          <span>
            {{
              isLastStep
                ? (locale === 'ar' ? 'احسب المقايسة' : 'Calculate')
                : (locale === 'ar' ? 'التالي' : 'Continue')
            }}
          </span>
          <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
