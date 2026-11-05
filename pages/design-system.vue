<script setup>
definePageMeta({
  layout: 'public'
})

const { locale } = useI18n()
const uiStore = useUiStore()

const sampleArea = ref(120)
const sampleBedrooms = ref(3)
const sampleGov = ref('cairo')
const samplePkg = ref('standard')
const sampleStep = ref(2)
const sampleTab = ref('floors')
const sampleChip = ref('all')
const sampleRange = ref('6M')
const modalOpen = ref(false)

const sampleMaterial = {
  slug: 'porcelain-60x60-cleopatra',
  label_en: 'Porcelain 60×60 Cleopatra',
  label_ar: 'بورسلين 60×60 كليوباترا',
  brand: 'Cleopatra Group',
  price: 450,
  unit: 'm²',
  change_30d: 3.1,
  fetched_at: new Date().toISOString()
}

const donutSegments = [
  { key: 'floors', label: 'Floors & Porcelain', value: 112000 },
  { key: 'kitchen', label: 'Kitchen & Bathrooms', value: 98000 },
  { key: 'walls', label: 'Walls & Paint', value: 64000 },
  { key: 'mep', label: 'Electrical & Plumbing', value: 89000 },
  { key: 'doors', label: 'Doors & Ceilings', value: 64000 },
  { key: 'reserve', label: 'Contingency', value: 58200 }
]

const lineSeries = [
  { date: '2026-06-01', label: 'Jun', value: 410 },
  { date: '2026-07-01', label: 'Jul', value: 418 },
  { date: '2026-08-01', label: 'Aug', value: 425 },
  { date: '2026-09-01', label: 'Sep', value: 438 },
  { date: '2026-10-01', label: 'Oct', value: 436 },
  { date: '2026-11-01', label: 'Nov', value: 450 }
]

const ganttTasks = [
  { id: 't1', label: 'Demolition & site prep', startWeek: 1, endWeek: 2 },
  { id: 't2', label: 'Plumbing rough-in', startWeek: 3, endWeek: 5 },
  { id: 't3', label: 'Electrical first-fix', startWeek: 3, endWeek: 5 },
  { id: 't4', label: 'Plastering & ceilings', startWeek: 6, endWeek: 9 },
  { id: 't5', label: 'Flooring & tiling', startWeek: 10, endWeek: 12 },
  { id: 't6', label: 'Painting & fixtures', startWeek: 13, endWeek: 16 }
]

const swatches = [
  { name: 'Primary (Nile Teal)', token: 'bg-primary text-surface', code: 'primary' },
  { name: 'Primary Deep', token: 'bg-primary-deep text-surface', code: 'primary-deep' },
  { name: 'Primary Tint', token: 'bg-primary-tint text-ink', code: 'primary-tint' },
  { name: 'Accent (Terracotta)', token: 'bg-accent text-surface', code: 'accent' },
  { name: 'Accent Tint', token: 'bg-accent-tint text-ink', code: 'accent-tint' },
  { name: 'Warm Background', token: 'bg-bg text-ink border border-border', code: 'bg' },
  { name: 'Sand Surface', token: 'bg-sand text-ink border border-border', code: 'sand' },
  { name: 'Success', token: 'bg-success text-surface', code: 'success' },
  { name: 'Warning / Edited', token: 'bg-warning text-ink', code: 'warning' },
  { name: 'Danger', token: 'bg-danger text-surface', code: 'danger' }
]
</script>

<template>
  <div class="shell section-pad space-y-14">
    <!-- Header -->
    <div class="space-y-3 max-w-2xl">
      <p class="kicker">TASHTEEB DESIGN SYSTEM</p>
      <h1 class="text-3xl sm:text-4xl font-bold text-ink">
        Tokens, Controls & Egyptian Market Components
      </h1>
      <p class="text-base text-ink-secondary">
        Built with semantic Tailwind tokens, Plus Jakarta Sans & IBM Plex Sans Arabic, tabular numerals, and full LTR / RTL parity.
      </p>
      <FreshnessLabel />
    </div>

    <!-- Color Swatches -->
    <section class="space-y-4">
      <h2 class="text-xl font-bold text-ink">1. Semantic Color Tokens</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          v-for="s in swatches"
          :key="s.code"
          class="rounded-card p-4 shadow-card flex flex-col justify-between min-h-[96px]"
          :class="s.token"
        >
          <span class="text-sm font-semibold">{{ s.name }}</span>
          <code class="text-xs opacity-80">{{ s.code }}</code>
        </div>
      </div>
    </section>

    <!-- Buttons & Badges -->
    <section class="card-surface p-6 space-y-6">
      <h2 class="text-xl font-bold text-ink">2. Buttons, Price Badges & Freshness</h2>
      <div class="flex flex-wrap items-center gap-3">
        <BaseButton variant="primary">Primary Action</BaseButton>
        <BaseButton variant="accent">Accent CTA</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
        <BaseButton variant="danger-outline">Reset</BaseButton>
        <BaseButton
          variant="secondary"
          @click="uiStore.showToast({ title: 'Price override saved', message: 'Porcelain updated to 520 EGP/m²' })"
        >
          Trigger Toast
        </BaseButton>
        <BaseButton variant="secondary" @click="modalOpen = true">
          Open Modal
        </BaseButton>
      </div>

      <div class="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
        <FreshnessLabel />
        <PriceBadge :change-pct="3.2" />
        <PriceBadge :change-pct="-1.8" />
        <PriceBadge :change-pct="0" />
        <EditedPriceBadge :original-price="450" :used-price="520" />
      </div>
    </section>

    <!-- Inputs & Steppers -->
    <section class="card-surface p-6 space-y-6">
      <h2 class="text-xl font-bold text-ink">3. Form Controls & Steppers</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <BaseInput
          v-model="sampleArea"
          type="number"
          label="Indoor apartment area"
          suffix="m²"
          hint="Typical Egyptian apartments: 75 – 280 m²"
        />
        <SelectField
          v-model="sampleGov"
          label="Governorate"
          :options="[
            { value: 'cairo', label: 'Cairo (1.00×)' },
            { value: 'giza', label: 'Giza (1.00×)' },
            { value: 'alexandria', label: 'Alexandria (0.97×)' }
          ]"
        />
        <NumberStepper
          v-model="sampleBedrooms"
          label="Bedrooms"
          :min="1"
          :max="8"
        />
      </div>

      <StepperBar
        v-model="sampleStep"
        :steps="[
          { key: 'apt', label: 'Apartment' },
          { key: 'pkg', label: 'Level' },
          { key: 'mat', label: 'Materials' },
          { key: 'ext', label: 'Extras' },
          { key: 'rev', label: 'Review' }
        ]"
      />

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <TabsBar
          v-model="sampleTab"
          :tabs="[
            { key: 'floors', label: 'Floors', count: 4 },
            { key: 'walls', label: 'Walls & Paint', count: 3 },
            { key: 'mep', label: 'Electrical & Plumbing', count: 6 }
          ]"
        />
        <FilterChips
          v-model="sampleChip"
          :items="[
            { key: 'all', label: 'All items', count: 24 },
            { key: 'edited', label: 'Edited prices', count: 3 }
          ]"
        />
      </div>
    </section>

    <!-- Domain Cards -->
    <section class="space-y-4">
      <h2 class="text-xl font-bold text-ink">4. Finishing Cards & Material Overrides</h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RadioCard
          :selected="samplePkg === 'standard'"
          badge="MOST CHOSEN"
          title="Standard Finishing"
          description="Porcelain reception, Jotun washable paint, El Sewedy wiring & gypsum ceilings."
          meta="Approx. 4,040 EGP / m²"
          @select="samplePkg = 'standard'"
        />
        <MaterialCard
          :material="sampleMaterial"
          :selected="true"
        />
        <MaterialCard
          :material="sampleMaterial"
          :selected="true"
          :override="{ is_overridden: true, original_price: 450, used_price: 520 }"
        />
      </div>
    </section>

    <!-- Data Visualization -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-surface p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-ink">5. Invoice Donut Breakdown</h2>
          <SparklineChart :values="[410, 418, 425, 438, 436, 450]" />
        </div>
        <DonutChart :segments="donutSegments" :total="485200" />
      </div>

      <div class="card-surface p-6 space-y-4">
        <h2 class="text-lg font-bold text-ink">6. 6-Month Material Trend</h2>
        <LineChart
          v-model:selected-range="sampleRange"
          :points="lineSeries"
          :ranges="['1M', '3M', '6M', '1Y']"
          :unit-label="`${currencySymbol(locale)}/m²`"
        />
      </div>
    </section>

    <section class="card-surface p-6 space-y-6">
      <h2 class="text-lg font-bold text-ink">7. Stacked Allocation & Construction Timeline</h2>
      <StackedBar :segments="donutSegments" :total="485200" />
      <GanttChart :tasks="ganttTasks" :total-weeks="16" />
    </section>

    <BaseModal
      :open="modalOpen"
      title="Sample Tashteeb Modal"
      description="Accessible dialog on desktop, bottom sheet on mobile."
      @close="modalOpen = false"
    >
      <p class="text-sm text-ink-secondary">
        Press Escape or click outside to dismiss. Focus is returned cleanly.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="modalOpen = false">Cancel</BaseButton>
        <BaseButton variant="primary" @click="modalOpen = false">Done</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
