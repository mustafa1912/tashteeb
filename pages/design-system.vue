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
  { name: 'Nile Navy (Anchor)', token: 'bg-navy text-surface', code: 'navy-500 (#12394A)' },
  { name: 'Nile Teal (Primary)', token: 'bg-teal text-surface', code: 'teal-500 (#0F5C6E)' },
  { name: 'Aswan Terracotta (Accent)', token: 'bg-terracotta text-surface', code: 'terracotta-500 (#D8572A)' },
  { name: 'Luxor Saffron', token: 'bg-saffron text-ink', code: 'saffron-500 (#F4B223)' },
  { name: 'Nile Blue Sky', token: 'bg-sky text-ink', code: 'sky-500 (#6FB1D9)' },
  { name: 'Siwa Sage', token: 'bg-sage text-ink', code: 'sage-500 (#7DBE9A)' },
  { name: 'Rosetta Rose Clay', token: 'bg-clay text-ink', code: 'clay-500 (#E8A598)' },
  { name: 'Dusk Lilac', token: 'bg-lilac text-surface', code: 'lilac-500 (#A58FD6)' },
  { name: 'Warm Cream Surface', token: 'bg-cream text-ink border border-border', code: 'cream (#FFF8EC)' },
  { name: 'Plaster Neutral', token: 'bg-plaster text-ink border border-border', code: 'plaster (#F6EFE3)' }
]

const sampleFanColor = ref('#7DBE9A')
const sampleTilePattern = ref('straight')
const samplePaintChip = ref('Siwa Sage 214')
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

    <!-- Visual Catalogue Components & Brush Masks -->
    <section class="space-y-6">
      <div class="border-b border-border pb-3">
        <h2 class="text-2xl font-display font-extrabold text-ink">
          8. Paint & Finishing Catalogue <span class="brush-highlight">Components</span>
        </h2>
        <p class="text-sm text-ink-secondary mt-1">
          Tactile swatch cards, FanDeck, TilePattern waste calculator, MaterialBoard collage, and brush stroke masks.
        </p>
      </div>

      <!-- Fan Deck & Material Board -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-5 card-surface p-5 space-y-3 flex flex-col items-center">
          <h3 class="text-sm font-bold text-ink self-start">Interactive Paint FanDeck</h3>
          <p class="text-xs text-ink-secondary self-start">Hover or tap to fan out swatches; click to select.</p>
          <FanDeck v-model="sampleFanColor" />
          <div class="flex items-center gap-2 pt-2 text-xs font-semibold text-ink">
            <span>Selected Color:</span>
            <span class="h-4 w-4 rounded-pill border border-border" :style="{ backgroundColor: sampleFanColor }" />
            <code>{{ sampleFanColor }}</code>
          </div>
        </div>

        <div class="lg:col-span-7">
          <MaterialBoard />
        </div>
      </div>

      <!-- Paint Chips & Swatches -->
      <div class="card-surface p-5 space-y-4">
        <h3 class="text-sm font-bold text-ink">Paint Swatch Chips & Circular Texture Swatches</h3>
        <div class="flex flex-wrap gap-4 items-center">
          <PaintChip
            name="Siwa Sage"
            name-ar="سيج سيوة"
            code="214"
            color-hex="#7DBE9A"
            price="1,850"
            :active="samplePaintChip === 'Siwa Sage 214'"
            @select="samplePaintChip = 'Siwa Sage 214'"
          />
          <PaintChip
            name="Luxor Saffron"
            name-ar="زعفران الأقصر"
            code="108"
            color-hex="#F4B223"
            price="2,100"
            :active="samplePaintChip === 'Luxor Saffron 108'"
            @select="samplePaintChip = 'Luxor Saffron 108'"
          />
          <PaintChip
            name="Aswan Clay"
            name-ar="طمي أسوان"
            code="405"
            color-hex="#D8572A"
            price="1,920"
            :active="samplePaintChip === 'Aswan Clay 405'"
            @select="samplePaintChip = 'Aswan Clay 405'"
          />
          <PaintChip
            name="Nile Navy"
            name-ar="كحلي النيل"
            code="901"
            color-hex="#12394A"
            price="2,450"
            :active="samplePaintChip === 'Nile Navy 901'"
            @select="samplePaintChip = 'Nile Navy 901'"
          />

          <!-- Texture Swatches -->
          <div class="flex items-center gap-3 ps-4 border-s border-border">
            <TextureSwatch src="/images/materials/porcelain-60x60.svg" alt="Porcelain" size="md" />
            <TextureSwatch src="/images/materials/parquet-hdf.svg" alt="Parquet" size="md" />
            <TextureSwatch src="/images/materials/marble-galala.svg" alt="Galala Marble" size="md" />
            <TextureSwatch color="#7DBE9A" alt="Siwa Sage" size="md" shape="circle" />
          </div>
        </div>
      </div>

      <!-- Tile Patterns & Waste % -->
      <div class="card-surface p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-ink">Tile Pattern Laying Styles & Waste Multipliers</h3>
          <span class="text-xs font-semibold text-primary">Selected: {{ sampleTilePattern }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TilePattern
            pattern="straight"
            label="Straight Joint"
            label-ar="رص مستقيم"
            :waste-pct="10"
            :active="sampleTilePattern === 'straight'"
            @select="sampleTilePattern = 'straight'"
          />
          <TilePattern
            pattern="diagonal"
            label="Diagonal 45°"
            label-ar="سمبوكسة مائلة 45°"
            :waste-pct="15"
            :active="sampleTilePattern === 'diagonal'"
            @select="sampleTilePattern = 'diagonal'"
          />
          <TilePattern
            pattern="herringbone"
            label="Herringbone"
            label-ar="عظمة سمكة (Herringbone)"
            :waste-pct="18"
            :active="sampleTilePattern === 'herringbone'"
            @select="sampleTilePattern = 'herringbone'"
          />
          <TilePattern
            pattern="subway"
            label="Subway Stagger"
            label-ar="بناء طوب متداخل"
            :waste-pct="12"
            :active="sampleTilePattern === 'subway'"
            @select="sampleTilePattern = 'subway'"
          />
        </div>
      </div>

      <!-- Brush Stroke Mask Previews -->
      <div class="card-surface p-5 space-y-4">
        <h3 class="text-sm font-bold text-ink">Organic Brush Stroke Masks</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p class="text-xs font-semibold text-ink-secondary mb-2">Mask 1: Wide Stroke</p>
            <div class="h-28 w-full bg-navy brush-mask-1 flex items-center justify-center text-surface font-bold text-sm">
              <span>Wide Brush Mask</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-ink-secondary mb-2">Mask 2: Painterly Dab</p>
            <div class="h-28 w-full bg-terracotta brush-mask-2 flex items-center justify-center text-surface font-bold text-sm">
              <span>Dab Mask</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-ink-secondary mb-2">Mask 3: Roller Stripe</p>
            <div class="h-28 w-full bg-saffron brush-mask-3 flex items-center justify-center text-ink font-bold text-sm">
              <span>Roller Stripe Mask</span>
            </div>
          </div>
        </div>
      </div>
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
