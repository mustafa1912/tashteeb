<script setup>
import {
  Plus,
  Search,
  ArrowLeftRight,
  Pencil,
  Copy,
  Share2,
  Trash2,
  SlidersHorizontal,
  ExternalLink,
  Check,
  MapPin,
  Ruler
} from 'lucide-vue-next'
import { PACKAGES, GOVERNORATES } from '~/utils/calc/config.js'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const { locale } = useI18n()
const localePath = useLocalePath()

const authStore = useAuthStore()
const estimatesStore = useEstimatesStore()
const wizardStore = useWizardStore()
const uiStore = useUiStore()

useHead(() => ({
  title: locale.value === 'ar' ? 'مقايساتي المحفوظة — تشطيب' : 'My estimates — Tashteeb'
}))

const searchQuery = ref('')
const statusFilter = ref('all')
const sortKey = ref('recent')
const selectedIds = ref([])
const renamingId = ref(null)
const draftTitle = ref('')
const shareTarget = ref(null)

onMounted(() => {
  authStore.hydrate()
  estimatesStore.hydrate()
})

const statusChips = computed(() => {
  const all = estimatesStore.estimates
  return [
    { key: 'all', label: locale.value === 'ar' ? 'الكل' : 'All', count: all.length },
    {
      key: 'ready',
      label: locale.value === 'ar' ? 'مكتملة' : 'Ready',
      count: all.filter(e => e.status === 'ready').length
    },
    {
      key: 'in_progress',
      label: locale.value === 'ar' ? 'قيد التعديل' : 'In progress',
      count: all.filter(e => e.status === 'in_progress').length
    },
    {
      key: 'draft',
      label: locale.value === 'ar' ? 'مسودة' : 'Draft',
      count: all.filter(e => e.status === 'draft').length
    }
  ]
})

const sortOptions = computed(() => [
  { value: 'recent', label: locale.value === 'ar' ? 'الأحدث تعديلاً' : 'Recently updated' },
  { value: 'total_desc', label: locale.value === 'ar' ? 'الأعلى تكلفة' : 'Highest total' },
  { value: 'area_desc', label: locale.value === 'ar' ? 'الأكبر مساحة' : 'Largest area (m²)' }
])

const filteredEstimates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return estimatesStore.estimates
    .filter((est) => {
      if (statusFilter.value !== 'all' && est.status !== statusFilter.value) return false
      if (!q) return true
      return (
        est.title?.toLowerCase().includes(q) ||
        est.title_ar?.toLowerCase().includes(q) ||
        est.refCode?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortKey.value === 'total_desc') {
        return (b.computed?.grandTotal || 0) - (a.computed?.grandTotal || 0)
      }
      if (sortKey.value === 'area_desc') {
        return (b.input?.apartment?.area || 0) - (a.input?.apartment?.area || 0)
      }
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    })
})

const combinedTotal = computed(() =>
  estimatesStore.estimates.reduce((acc, e) => acc + (e.computed?.grandTotal || 0), 0)
)

const avgCostPerSqm = computed(() => {
  const totalArea = estimatesStore.estimates.reduce((acc, e) => acc + (e.input?.apartment?.area || 0), 0)
  if (!totalArea) return 0
  return Math.round(combinedTotal.value / totalArea)
})

function getPkgLabel(pkgKey) {
  const p = PACKAGES[pkgKey]
  return p ? (locale.value === 'ar' ? p.label_ar : p.label_en) : pkgKey
}

function getGovLabel(govCode) {
  const g = GOVERNORATES.find(item => item.code === govCode)
  return g ? (locale.value === 'ar' ? g.label_ar : g.label_en) : govCode
}

function getStatusBadge(status) {
  if (status === 'ready') {
    return {
      label: locale.value === 'ar' ? 'مكتملة' : 'Ready',
      classes: 'bg-success-tint text-success'
    }
  }
  if (status === 'in_progress') {
    return {
      label: locale.value === 'ar' ? 'قيد التعديل' : 'In progress',
      classes: 'bg-warning-tint text-ink'
    }
  }
  return {
    label: locale.value === 'ar' ? 'مسودة' : 'Draft',
    classes: 'bg-sand text-ink-secondary'
  }
}

function getSegments(record) {
  const c = record.computed || {}
  return [
    { key: 'materials', value: c.materialsTotal || 0, colorIndex: 0 },
    { key: 'labour', value: c.labourTotal || 0, colorIndex: 1 },
    { key: 'contingency', value: c.contingencyAmount || 0, colorIndex: 2 }
  ]
}

function toggleSelection(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
    return
  }
  if (selectedIds.value.length >= 2) {
    selectedIds.value = [selectedIds.value[1], id]
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function compareSelected() {
  if (selectedIds.value.length !== 2) return
  const [first, second] = selectedIds.value
  navigateTo(localePath(`/estimate/${first}/compare?with=${second}`))
}

function startNewEstimate() {
  wizardStore.resetWizard()
  navigateTo(localePath('/calculator'))
}

function openInWizard(record) {
  wizardStore.loadFromInput({
    id: record.id,
    title: locale.value === 'ar' ? record.title_ar || record.title : record.title,
    input: record.input
  })
  navigateTo(localePath('/calculator'))
}

function startRename(record) {
  renamingId.value = record.id
  draftTitle.value = locale.value === 'ar' ? record.title_ar || record.title : record.title
}

function saveRename(record) {
  if (draftTitle.value.trim()) {
    estimatesStore.renameEstimate(record.id, draftTitle.value.trim())
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم تحديث اسم المقايسة' : 'Estimate renamed',
      type: 'success'
    })
  }
  renamingId.value = null
}

function handleDuplicate(record) {
  const copy = estimatesStore.duplicateEstimate(record.id)
  if (copy) {
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم إنشاء نسخة جديدة' : 'Estimate duplicated',
      message: copy.refCode,
      type: 'success'
    })
  }
}

async function handleDelete(record) {
  const confirmed = await uiStore.askConfirm({
    title: locale.value === 'ar' ? 'حذف المقايسة نهائياً؟' : 'Delete this estimate?',
    message:
      locale.value === 'ar'
        ? `سيتم حذف "${record.title_ar || record.title}" (${record.refCode}) ولا يمكن التراجع عن هذا الإجراء.`
        : `"${record.title}" (${record.refCode}) will be permanently removed from your saved estimates.`,
    confirmText: locale.value === 'ar' ? 'نعم، احذف المقايسة' : 'Delete estimate',
    cancelText: locale.value === 'ar' ? 'إلغاء' : 'Cancel',
    variant: 'danger'
  })

  if (confirmed) {
    estimatesStore.deleteEstimate(record.id)
    selectedIds.value = selectedIds.value.filter(id => id !== record.id)
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم حذف المقايسة' : 'Estimate deleted',
      type: 'info'
    })
  }
}

function openShareModal(record) {
  estimatesStore.ensureShareToken(record.id)
  shareTarget.value = estimatesStore.getById(record.id)
}
</script>

<template>
  <div class="shell py-8 sm:py-12 space-y-8">
    <!-- Hydration skeleton before client auth resolves -->
    <div v-if="!authStore.initialized" class="space-y-6">
      <SkeletonBlock class="h-10 w-64" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonBlock v-for="n in 3" :key="n" class="h-24 rounded-card" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SkeletonBlock v-for="n in 2" :key="n" class="h-56 rounded-card" />
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <h1 class="text-2xl sm:text-3xl font-bold text-ink">
            {{ locale === 'ar' ? 'مقايساتي المحفوظة' : 'My saved estimates' }}
          </h1>
          <p class="text-sm text-ink-secondary">
            {{
              locale === 'ar'
                ? 'حدد أي مقايساتين للمقارنة جنباً إلى جنب، أو افتح أي مقايسة لتحديث أسعارها.'
                : 'Select any 2 estimates to compare side-by-side, or reopen in the wizard to adjust rooms & materials.'
            }}
          </p>
        </div>

        <BaseButton variant="primary" @click="startNewEstimate">
          <Plus class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'مقايسة جديدة' : 'Start new estimate' }}</span>
        </BaseButton>
      </div>

      <!-- 3-Card Stats Strip -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="rounded-card border border-border bg-surface p-5 shadow-card">
          <p class="text-xs font-semibold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'إجمالي المقايسات' : 'Saved estimates' }}
          </p>
          <p class="mt-1.5 text-2xl font-extrabold text-ink tabular-price">
            {{ formatNumber(estimatesStore.estimates.length, locale) }}
          </p>
        </div>

        <div class="rounded-card border border-border bg-surface p-5 shadow-card">
          <p class="text-xs font-semibold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'مجموع الميزانيات المحفوظة' : 'Combined estimated value' }}
          </p>
          <p class="mt-1.5 text-2xl font-extrabold text-primary tabular-price">
            {{ formatCurrency(combinedTotal, locale) }}
          </p>
        </div>

        <div class="rounded-card border border-border bg-surface p-5 shadow-card">
          <p class="text-xs font-semibold uppercase text-ink-secondary">
            {{ locale === 'ar' ? 'متوسط تكلفة المتر المربع' : 'Average cost / m²' }}
          </p>
          <p class="mt-1.5 text-2xl font-extrabold text-ink tabular-price">
            {{ formatCurrency(avgCostPerSqm, locale) }}<span class="text-sm font-medium text-ink-secondary"> / {{ locale === 'ar' ? 'م²' : 'm²' }}</span>
          </p>
        </div>
      </div>

      <!-- Compare Selection Action Bar -->
      <div
        v-if="selectedIds.length > 0"
        class="rounded-card bg-primary-deep text-surface px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-elevated"
      >
        <div class="flex items-center gap-2.5 text-sm font-semibold">
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-pill bg-accent text-surface text-xs font-bold tabular-price">
            {{ selectedIds.length }}
          </span>
          <span>
            {{
              selectedIds.length === 1
                ? (locale === 'ar' ? 'اختر مقايسة ثانية للمقارنة بينهما' : 'Select 1 more estimate to compare side-by-side')
                : (locale === 'ar' ? 'تم اختيار مقايساتين للمقارنة' : '2 estimates ready for side-by-side comparison')
            }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            variant="ghost"
            size="sm"
            class="!text-surface/85 hover:!bg-surface/10"
            @click="selectedIds = []"
          >
            {{ locale === 'ar' ? 'إلغاء التحديد' : 'Clear' }}
          </BaseButton>
          <BaseButton
            variant="accent"
            size="sm"
            :disabled="selectedIds.length !== 2"
            @click="compareSelected"
          >
            <ArrowLeftRight class="h-4 w-4" :stroke-width="1.5" />
            <span>{{ locale === 'ar' ? 'قارن المقايساتين' : 'Compare 2 selected' }}</span>
          </BaseButton>
        </div>
      </div>

      <!-- Controls Toolbar: Search + Status Chips + Sort -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <FilterChips v-model="statusFilter" :items="statusChips" />

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="relative min-w-[230px]">
            <Search class="h-4 w-4 text-ink-secondary absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" :stroke-width="1.5" />
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="locale === 'ar' ? 'ابحث بالاسم أو الكود #TS...' : 'Search title or #TS code...'"
              class="w-full min-h-touch rounded-control border border-border bg-surface ps-10 pe-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
          </div>

          <div class="min-w-[185px]">
            <SelectField v-model="sortKey" :options="sortOptions" />
          </div>
        </div>
      </div>

      <!-- Empty search/filter state -->
      <EmptyState
        v-if="filteredEstimates.length === 0"
        :title="locale === 'ar' ? 'لا توجد مقايسات مطابقة للبحث' : 'No matching estimates found'"
        :description="locale === 'ar' ? 'جرب تغيير الفلتر أو ابدأ مقايسة شقة جديدة في أقل من دقيقتين.' : 'Try clearing your search filter or start a fresh apartment finishing estimate.'"
      >
        <BaseButton variant="primary" @click="statusFilter = 'all'; searchQuery = ''">
          {{ locale === 'ar' ? 'عرض جميع المقايسات' : 'Show all estimates' }}
        </BaseButton>
      </EmptyState>

      <!-- Estimate Cards Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article
          v-for="record in filteredEstimates"
          :key="record.id"
          class="rounded-card border bg-surface p-5 sm:p-6 shadow-card transition-all flex flex-col justify-between gap-5"
          :class="selectedIds.includes(record.id) ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'"
        >
          <!-- Top row: Compare checkbox + RefCode + Status + Mini Donut -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3 min-w-0 flex-1">
              <button
                type="button"
                class="mt-1 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors"
                :class="selectedIds.includes(record.id) ? 'border-primary bg-primary text-surface' : 'border-border bg-surface hover:border-primary'"
                :aria-label="locale === 'ar' ? 'تحديد للمقارنة' : 'Select estimate to compare'"
                @click="toggleSelection(record.id)"
              >
                <Check v-if="selectedIds.includes(record.id)" class="h-3.5 w-3.5" :stroke-width="2" />
              </button>

              <div class="min-w-0 flex-1 space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-bold text-primary">
                    <bdi>{{ record.refCode }}</bdi>
                  </span>
                  <span
                    class="rounded-pill px-2.5 py-0.5 text-xs font-semibold"
                    :class="getStatusBadge(record.status).classes"
                  >
                    {{ getStatusBadge(record.status).label }}
                  </span>
                  <span
                    v-if="record.computed?.editedItems?.length"
                    class="inline-flex items-center gap-1 rounded-pill border border-warning/40 bg-warning-tint px-2.5 py-0.5 text-xs font-semibold text-ink tabular-price"
                  >
                    <Pencil class="h-3 w-3 text-warning shrink-0" :stroke-width="1.5" />
                    <span>
                      {{
                        locale === 'ar'
                          ? `${record.computed.editedItems.length} أسعار معدلة`
                          : `${record.computed.editedItems.length} edited`
                      }}
                    </span>
                  </span>
                </div>

                <!-- Inline Rename or Title -->
                <div v-if="renamingId === record.id" class="flex items-center gap-2 pt-1">
                  <input
                    v-model="draftTitle"
                    type="text"
                    class="min-h-[38px] flex-1 rounded-control border border-primary bg-surface px-3 py-1 text-sm font-semibold text-ink focus:outline-none"
                    @keyup.enter="saveRename(record)"
                  >
                  <BaseButton size="sm" variant="primary" @click="saveRename(record)">
                    {{ locale === 'ar' ? 'حفظ' : 'Save' }}
                  </BaseButton>
                </div>
                <div v-else class="flex items-center gap-2">
                  <NuxtLink
                    :to="localePath(`/estimate/${record.id}`)"
                    class="text-lg font-bold text-ink hover:text-primary transition-colors truncate"
                  >
                    {{ locale === 'ar' ? record.title_ar || record.title : record.title }}
                  </NuxtLink>
                  <button
                    type="button"
                    class="p-1.5 rounded-control text-ink-secondary hover:bg-sand hover:text-ink"
                    :aria-label="locale === 'ar' ? 'تعديل الاسم' : 'Rename estimate'"
                    @click="startRename(record)"
                  >
                    <Pencil class="h-3.5 w-3.5" :stroke-width="1.5" />
                  </button>
                </div>

                <!-- Spec pills -->
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
                  <span class="inline-flex items-center gap-1">
                    <Ruler class="h-3.5 w-3.5" :stroke-width="1.5" />
                    <span class="tabular-price font-medium">{{ record.input.apartment.area }} {{ locale === 'ar' ? 'م²' : 'm²' }}</span>
                  </span>
                  <span>·</span>
                  <span>{{ getPkgLabel(record.input.packageKey) }}</span>
                  <span>·</span>
                  <span class="inline-flex items-center gap-1">
                    <MapPin class="h-3.5 w-3.5" :stroke-width="1.5" />
                    <span>{{ getGovLabel(record.input.apartment.governorate) }}</span>
                  </span>
                </div>

                <!-- Mini Swatches Preview -->
                <div v-if="record.computed?.items" class="pt-1.5 flex items-center gap-1.5">
                  <TextureSwatch
                    v-for="item in record.computed.items.filter(i => i.category !== 'extras').slice(0, 4)"
                    :key="item.id"
                    :src="item.image_url"
                    :color="item.swatch_color"
                    size="xs"
                    :zoomable="false"
                    :alt="locale === 'ar' ? item.label_ar : item.label_en"
                    class="shrink-0 shadow-subtle border border-border/80"
                  />
                </div>
              </div>
            </div>

            <!-- Mini Donut -->
            <DonutChart
              :segments="getSegments(record)"
              :size="64"
              :stroke-width="9"
              :compact="true"
              :show-legend="false"
            />
          </div>

          <!-- Middle Price Band -->
          <div class="rounded-control bg-sand/65 px-4 py-3 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p class="text-xs text-ink-secondary">
                {{ locale === 'ar' ? 'الإجمالي التقديري' : 'Estimated Grand Total' }}
              </p>
              <p class="text-xl font-extrabold text-primary tabular-price">
                {{ formatCurrency(record.computed.grandTotal, locale) }}
              </p>
            </div>

            <div class="text-end">
              <p class="text-xs text-ink-secondary">
                {{ locale === 'ar' ? 'سعر المتر' : 'Per m²' }}
              </p>
              <p class="text-sm font-bold text-ink tabular-price">
                {{ formatCurrency(record.computed.costPerSqm, locale) }} / {{ locale === 'ar' ? 'م²' : 'm²' }}
              </p>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border">
            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink :to="localePath(`/estimate/${record.id}`)">
                <BaseButton size="sm" variant="primary">
                  <span>{{ locale === 'ar' ? 'فتح المقايسة' : 'Open invoice' }}</span>
                  <ExternalLink class="h-3.5 w-3.5" :stroke-width="1.5" />
                </BaseButton>
              </NuxtLink>

              <BaseButton size="sm" variant="secondary" @click="openInWizard(record)">
                <SlidersHorizontal class="h-3.5 w-3.5" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'تعديل' : 'Edit' }}</span>
              </BaseButton>
            </div>

            <div class="flex items-center gap-1">
              <button
                type="button"
                class="min-h-touch min-w-[40px] px-2.5 rounded-control text-ink-secondary hover:bg-sand hover:text-ink inline-flex items-center justify-center"
                :title="locale === 'ar' ? 'نسخ المقايسة' : 'Duplicate'"
                :aria-label="locale === 'ar' ? 'نسخ المقايسة' : 'Duplicate'"
                @click="handleDuplicate(record)"
              >
                <Copy class="h-4 w-4" :stroke-width="1.5" />
              </button>

              <button
                type="button"
                class="min-h-touch min-w-[40px] px-2.5 rounded-control text-ink-secondary hover:bg-sand hover:text-ink inline-flex items-center justify-center"
                :title="locale === 'ar' ? 'مشاركة' : 'Share'"
                :aria-label="locale === 'ar' ? 'مشاركة' : 'Share'"
                @click="openShareModal(record)"
              >
                <Share2 class="h-4 w-4" :stroke-width="1.5" />
              </button>

              <button
                type="button"
                class="min-h-touch min-w-[40px] px-2.5 rounded-control text-danger hover:bg-danger-tint inline-flex items-center justify-center"
                :title="locale === 'ar' ? 'حذف' : 'Delete'"
                :aria-label="locale === 'ar' ? 'حذف' : 'Delete'"
                @click="handleDelete(record)"
              >
                <Trash2 class="h-4 w-4" :stroke-width="1.5" />
              </button>
            </div>
          </div>
        </article>

        <!-- + Start New Estimate Card -->
        <button
          type="button"
          class="rounded-card border-2 border-dashed border-border hover:border-primary bg-surface/50 hover:bg-primary-tint/30 p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[240px] transition-colors"
          @click="startNewEstimate"
        >
          <span class="h-12 w-12 rounded-pill bg-primary-tint text-primary flex items-center justify-center">
            <Plus class="h-6 w-6" :stroke-width="1.5" />
          </span>
          <div class="space-y-1">
            <p class="text-base font-bold text-ink">
              {{ locale === 'ar' ? '+ بدء مقايسة تشطيب جديدة' : '+ Start a new finishing estimate' }}
            </p>
            <p class="text-xs text-ink-secondary max-w-xs">
              {{
                locale === 'ar'
                  ? 'أدخل مساحة الشقة واختر الباقة والخامات بأسعار السوق المحدثة اليوم.'
                  : 'Enter unit size, rooms, and materials with live Egyptian market prices.'
              }}
            </p>
          </div>
        </button>
      </div>
    </template>

    <!-- Share Modal -->
    <WhatsAppShareModal
      v-if="shareTarget"
      :model-value="Boolean(shareTarget)"
      :record="shareTarget"
      @update:model-value="val => { if (!val) shareTarget = null }"
    />
  </div>
</template>
