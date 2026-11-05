<script setup>
import { Building2, Home, Castle, Store, Info } from 'lucide-vue-next'
import { UNIT_TYPES, GOVERNORATES } from '~/utils/calc/config.js'

const wizardStore = useWizardStore()
const { locale } = useI18n()

const unitIcons = {
  apartment: Building2,
  duplex: Home,
  villa: Castle,
  shop: Store
}

const governorateOptions = computed(() =>
  GOVERNORATES.map(g => ({
    value: g.code,
    label: locale.value === 'ar'
      ? `${g.label_ar} (${g.factor.toFixed(2)}×)`
      : `${g.label_en} (${g.factor.toFixed(2)}×)`
  }))
)

const areas = computed(() => wizardStore.liveEstimate.areas)
</script>

<template>
  <div class="space-y-7">
    <div class="space-y-1.5">
      <p class="kicker">{{ locale === 'ar' ? 'الخطوة 1 من 5' : 'STEP 1 OF 5' }}</p>
      <h2 class="text-2xl font-bold text-ink">
        {{ locale === 'ar' ? 'تفاصيل ومساحة الوحدة' : 'Apartment details & rooms' }}
      </h2>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'نستخدم المساحة وعدد الغرف لحساب صافي حوائط الدهانات، فتحات الأبواب والشبابيك، ونقاط الكهرباء والسباكة.'
            : 'Room counts derive net paintable wall area, door/window openings, and electrical & plumbing rough-in points.'
        }}
      </p>
    </div>

    <!-- Project Title -->
    <BaseInput
      v-model="wizardStore.projectTitle"
      :label="locale === 'ar' ? 'اسم المشروع / الشقة' : 'Project name'"
      :placeholder="locale === 'ar' ? 'مثال: شقة التجمع الخامس' : 'e.g. New Cairo apartment'"
    />

    <!-- Unit Type Selector -->
    <div class="space-y-2">
      <span class="text-sm font-medium text-ink block">
        {{ locale === 'ar' ? 'نوع الوحدة' : 'Property type' }}
      </span>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup" aria-label="Property type">
        <button
          v-for="ut in UNIT_TYPES"
          :key="ut.code"
          type="button"
          role="radio"
          :aria-checked="wizardStore.apartment.unitType === ut.code"
          class="flex flex-col items-center justify-center gap-2 rounded-card border p-4 min-h-[84px] text-center transition-all"
          :class="
            wizardStore.apartment.unitType === ut.code
              ? 'border-2 border-primary bg-primary-tint/40 text-primary font-semibold'
              : 'border-border bg-surface text-ink-secondary hover:bg-sand/50 hover:text-ink'
          "
          @click="wizardStore.apartment.unitType = ut.code"
        >
          <component :is="unitIcons[ut.code]" class="h-5 w-5" :stroke-width="1.5" />
          <span class="text-xs sm:text-sm">{{ locale === 'ar' ? ut.label_ar : ut.label_en }}</span>
        </button>
      </div>
    </div>

    <!-- Area + Governorate -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <BaseInput
        v-model="wizardStore.apartment.area"
        type="number"
        :min="35"
        :max="1200"
        :label="locale === 'ar' ? 'صافي المساحة الداخلية' : 'Total indoor area'"
        :suffix="locale === 'ar' ? 'م²' : 'm²'"
        :hint="locale === 'ar' ? 'المساحة الفعلية للفرش بدون المناور ونسبة التحميل' : 'Net indoor floor area (excluding building share)'"
      />
      <SelectField
        v-model="wizardStore.apartment.governorate"
        :label="locale === 'ar' ? 'المحافظة' : 'Governorate'"
        :options="governorateOptions"
        :hint="locale === 'ar' ? 'يضبط تكاليف النقل والمصنعيات حسب المحافظة' : 'Adjusts transport & regional workmanship rates'"
      />
    </div>

    <!-- Room Steppers -->
    <div class="space-y-2.5">
      <span class="text-sm font-medium text-ink block">
        {{ locale === 'ar' ? 'توزيع الغرف والفراغات' : 'Room breakdown' }}
      </span>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <NumberStepper
          v-model="wizardStore.apartment.bedrooms"
          :min="0"
          :max="10"
          :label="locale === 'ar' ? 'غرف النوم' : 'Bedrooms'"
        />
        <NumberStepper
          v-model="wizardStore.apartment.bathrooms"
          :min="1"
          :max="8"
          :label="locale === 'ar' ? 'الحمامات' : 'Bathrooms'"
        />
        <NumberStepper
          v-model="wizardStore.apartment.kitchens"
          :min="0"
          :max="3"
          :label="locale === 'ar' ? 'المطابخ' : 'Kitchens'"
        />
        <NumberStepper
          v-model="wizardStore.apartment.reception"
          :min="1"
          :max="6"
          :label="locale === 'ar' ? 'قطع الريسبشن' : 'Reception pieces'"
        />
        <NumberStepper
          v-model="wizardStore.apartment.balconies"
          :min="0"
          :max="6"
          :label="locale === 'ar' ? 'البلكونات / التراس' : 'Balconies'"
        />
      </div>
    </div>

    <!-- Live Engineering Geometry Strip -->
    <div class="rounded-card border border-border bg-sand/70 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-secondary">
      <div class="flex items-center gap-2 font-semibold text-ink">
        <Info class="h-4 w-4 text-primary shrink-0" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'الكميات الهندسية المستنتجة تلقائياً:' : 'Derived site quantities:' }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-price">
        <span>
          {{ locale === 'ar' ? 'صافي الحوائط:' : 'Net walls:' }}
          <strong class="text-ink">{{ areas.wallArea }} {{ locale === 'ar' ? 'م²' : 'm²' }}</strong>
        </span>
        <span>
          {{ locale === 'ar' ? 'الأبواب:' : 'Doors:' }}
          <strong class="text-ink">{{ areas.doorsCount }}</strong>
        </span>
        <span>
          {{ locale === 'ar' ? 'نقاط الكهرباء:' : 'Electrical:' }}
          <strong class="text-ink">{{ areas.electricalPoints }} {{ locale === 'ar' ? 'نقطة' : 'pts' }}</strong>
        </span>
        <span>
          {{ locale === 'ar' ? 'نقاط السباكة:' : 'Plumbing:' }}
          <strong class="text-ink">{{ areas.plumbingPoints }} {{ locale === 'ar' ? 'نقطة' : 'pts' }}</strong>
        </span>
      </div>
    </div>
  </div>
</template>
