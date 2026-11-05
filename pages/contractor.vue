<script setup>
import {
  Plus,
  Trash2,
  Upload,
  Percent,
  Building2,
  User,
  FileCheck2
} from 'lucide-vue-next'

definePageMeta({
  layout: 'public'
})

const { locale } = useI18n()
const contractorStore = useContractorStore()
const estimatesStore = useEstimatesStore()
const uiStore = useUiStore()

onMounted(() => {
  estimatesStore.hydrate()
  contractorStore.hydrate()
})

useSeoSchema(() => ({
  path: '/contractor',
  title:
    locale.value === 'ar'
      ? 'وضع المقاولين والمكاتب الهندسية — إعداد عروض أسعار التشطيب | تشطيب'
      : 'Contractor Quotation Builder — Overhead, Markup & Branded PDF | Tashteeb',
  description:
    locale.value === 'ar'
      ? 'أداة مجانية للمهندسين وشركات التشطيب في مصر لتحويل مقايسات الشقق إلى عروض أسعار معتمدة بشعار المكتب دون كشف التكلفة الخام.'
      : 'Turn apartment finishing estimates into branded client PDF quotations with private overhead & profit sliders.'
}))

const newItemLabel = ref('')
const newItemQty = ref(1)
const newItemPrice = ref(8500)

const estimateOptions = computed(() =>
  estimatesStore.estimates.map(e => ({
    value: e.id,
    label: `${e.refCode} · ${locale.value === 'ar' ? e.title_ar || e.title : e.title} (${formatCurrency(e.computed?.grandTotal || 0, locale.value)})`
  }))
)

function handleAddCustom() {
  if (!newItemLabel.value.trim()) return
  contractorStore.addCustomItem({
    label_en: newItemLabel.value.trim(),
    label_ar: newItemLabel.value.trim(),
    qty: Number(newItemQty.value) || 1,
    unit_price: Number(newItemPrice.value) || 0
  })
  newItemLabel.value = ''
  newItemQty.value = 1
  newItemPrice.value = 8500
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تمت إضافة البند لعرض السعر' : 'Custom item added to quotation',
    type: 'success'
  })
}

function handleLogoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    contractorStore.companyProfile.logoDataUrl = String(reader.result || '')
    contractorStore.persist()
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div>
    <!-- Full-Bleed Dark-Teal Hero (shares unified contractorStore.quotation) -->
    <ContractorHero />

    <!-- Quotation Builder Workspace -->
    <section id="quotation-builder" class="shell py-12 sm:py-16 space-y-8 scroll-mt-20">
      <div class="max-w-2xl space-y-1.5">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-ink">
          {{ locale === 'ar' ? 'مُعِد عروض الأسعار التفاعلي' : 'Interactive Client Quotation Builder' }}
        </h2>
        <p class="text-sm text-ink-secondary">
          {{
            locale === 'ar'
              ? 'أي تعديل على النسب أو بيانات العميل ينعكس لحظياً على وثيقة العرض على اليسار.'
              : 'Adjust your internal overhead, markup, and branding on the left—the client sheet updates live.'
          }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT 5 COLS: Contractor Controls -->
        <div class="lg:col-span-5 space-y-5 no-print">
          <!-- 1. Source Estimate & Quote Reference -->
          <div class="rounded-card border border-border bg-surface p-5 shadow-card space-y-4">
            <div class="flex items-center gap-2">
              <FileCheck2 class="h-4 w-4 text-primary" :stroke-width="1.5" />
              <h3 class="text-base font-bold text-ink">
                {{ locale === 'ar' ? '1. المقايسة الأساسية ورقم العرض' : '1. Base estimate & quote ref' }}
              </h3>
            </div>

            <SelectField
              v-model="contractorStore.selectedEstimateId"
              :label="locale === 'ar' ? 'اختر مقايسة الشقة' : 'Source apartment estimate'"
              :options="estimateOptions"
            />

            <BaseInput
              v-model="contractorStore.quoteRef"
              :label="locale === 'ar' ? 'رقم عرض السعر' : 'Quotation reference'"
              ltr
            />
          </div>

          <!-- 2. Overhead, Profit Markup & VAT -->
          <div class="rounded-card border border-border bg-surface p-5 shadow-card space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Percent class="h-4 w-4 text-primary" :stroke-width="1.5" />
                <h3 class="text-base font-bold text-ink">
                  {{ locale === 'ar' ? '2. نسب التشغيل والربح (سري للمقاول)' : '2. Overhead, markup & VAT (Private)' }}
                </h3>
              </div>
            </div>

            <!-- Overhead slider -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-ink">{{ locale === 'ar' ? 'مصاريف تشغيل ونقل وإدارة موقع' : 'Site overhead & logistics' }}</span>
                <span class="tabular-price text-primary font-bold">
                  {{ contractorStore.pricing.overheadPct }}% ({{ formatCurrency(contractorStore.quotation.overheadAmount, locale) }})
                </span>
              </div>
              <input
                v-model.number="contractorStore.pricing.overheadPct"
                type="range"
                min="0"
                max="25"
                step="1"
                class="w-full accent-primary"
              >
            </div>

            <!-- Markup slider -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-ink">{{ locale === 'ar' ? 'أتعاب الإشراف الهندسي وهامش الربح' : 'Engineering fee & profit markup' }}</span>
                <span class="tabular-price text-success font-bold">
                  {{ contractorStore.pricing.markupPct }}% ({{ formatCurrency(contractorStore.quotation.markupAmount, locale) }})
                </span>
              </div>
              <input
                v-model.number="contractorStore.pricing.markupPct"
                type="range"
                min="0"
                max="45"
                step="1"
                class="w-full accent-primary"
              >
            </div>

            <!-- VAT quick buttons -->
            <div class="pt-2 border-t border-border flex items-center justify-between gap-2">
              <span class="text-xs font-semibold text-ink">
                {{ locale === 'ar' ? 'ضريبة القيمة المضافة (اختياري)' : 'Value Added Tax (VAT)' }}
              </span>
              <div class="inline-flex rounded-control border border-border bg-sand p-0.5">
                <button
                  type="button"
                  class="px-3 py-1 rounded-[8px] text-xs font-bold tabular-price"
                  :class="contractorStore.pricing.vatPct === 0 ? 'bg-surface text-primary shadow-sm' : 'text-ink-secondary'"
                  @click="contractorStore.pricing.vatPct = 0"
                >
                  0%
                </button>
                <button
                  type="button"
                  class="px-3 py-1 rounded-[8px] text-xs font-bold tabular-price"
                  :class="contractorStore.pricing.vatPct === 14 ? 'bg-surface text-primary shadow-sm' : 'text-ink-secondary'"
                  @click="contractorStore.pricing.vatPct = 14"
                >
                  14%
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Custom Line Items -->
          <div class="rounded-card border border-border bg-surface p-5 shadow-card space-y-4">
            <h3 class="text-base font-bold text-ink">
              {{ locale === 'ar' ? '3. بنود إضافية (تصميم 3D / تعديلات معمارية)' : '3. Custom engineering & design items' }}
            </h3>

            <ul v-if="contractorStore.customItems.length" class="divide-y divide-border">
              <li
                v-for="item in contractorStore.customItems"
                :key="item.id"
                class="py-2.5 first:pt-0 flex items-center justify-between gap-2 text-xs"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-ink truncate">
                    {{ locale === 'ar' ? item.label_ar || item.label_en : item.label_en }}
                  </p>
                  <p class="text-ink-secondary tabular-price">
                    {{ item.qty }} × {{ formatCurrency(item.unit_price, locale) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="p-1.5 rounded-control text-danger hover:bg-danger-tint"
                  :aria-label="locale === 'ar' ? 'حذف البند' : 'Remove item'"
                  @click="contractorStore.removeCustomItem(item.id)"
                >
                  <Trash2 class="h-4 w-4" :stroke-width="1.5" />
                </button>
              </li>
            </ul>

            <form class="space-y-3 pt-2 border-t border-border" @submit.prevent="handleAddCustom">
              <BaseInput
                v-model="newItemLabel"
                :label="locale === 'ar' ? 'وصف البند الإضافي' : 'New line item description'"
                :placeholder="locale === 'ar' ? 'مثال: تعديل حوائط مباني وتأسيس تكييف كونسيلد' : 'e.g. Masonry modification & shop drawings'"
              />
              <div class="grid grid-cols-2 gap-3">
                <BaseInput
                  v-model="newItemQty"
                  type="number"
                  :min="1"
                  :label="locale === 'ar' ? 'الكمية' : 'Qty'"
                />
                <BaseInput
                  v-model="newItemPrice"
                  type="number"
                  :min="0"
                  :label="locale === 'ar' ? 'سعر الوحدة' : 'Price'"
                  :suffix="currencySymbol(locale)"
                />
              </div>
              <BaseButton type="submit" variant="secondary" size="sm" class="w-full justify-center">
                <Plus class="h-4 w-4" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'إضافة للعرض' : 'Add custom item' }}</span>
              </BaseButton>
            </form>
          </div>

          <!-- 4. Company Branding & Client Info -->
          <div class="rounded-card border border-border bg-surface p-5 shadow-card space-y-4">
            <div class="flex items-center gap-2">
              <Building2 class="h-4 w-4 text-primary" :stroke-width="1.5" />
              <h3 class="text-base font-bold text-ink">
                {{ locale === 'ar' ? '4. بيانات المكتب الهندسي والعميل' : '4. Office branding & client details' }}
              </h3>
            </div>

            <BaseInput
              v-if="locale === 'ar'"
              v-model="contractorStore.companyProfile.companyNameAr"
              label="اسم الشركة / المكتب الهندسي"
            />
            <BaseInput
              v-else
              v-model="contractorStore.companyProfile.companyName"
              label="Company / Engineering office"
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BaseInput
                v-model="contractorStore.companyProfile.engineerName"
                :label="locale === 'ar' ? 'المهندس المسؤول' : 'Engineer name'"
              />
              <BaseInput
                v-model="contractorStore.companyProfile.taxCard"
                :label="locale === 'ar' ? 'البطاقة الضريبية' : 'Tax ID'"
                ltr
              />
            </div>

            <label class="inline-flex items-center gap-2 cursor-pointer rounded-control border border-border bg-sand/70 px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
              <Upload class="h-4 w-4 text-primary" :stroke-width="1.5" />
              <span>{{ locale === 'ar' ? 'تغيير شعار المكتب' : 'Upload office logo' }}</span>
              <input type="file" accept="image/*" class="sr-only" @change="handleLogoUpload">
            </label>

            <div class="pt-3 border-t border-border space-y-3">
              <div class="flex items-center gap-2 text-xs font-bold uppercase text-ink-secondary">
                <User class="h-3.5 w-3.5" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'بيانات العميل' : 'Client block' }}</span>
              </div>

              <BaseInput
                v-model="contractorStore.clientInfo.clientName"
                :label="locale === 'ar' ? 'اسم العميل' : 'Client name'"
              />
              <BaseInput
                v-model="contractorStore.clientInfo.unitAddress"
                :label="locale === 'ar' ? 'عنوان ومواصفة الوحدة' : 'Unit address & area'"
              />
              <BaseInput
                v-model="contractorStore.terms.validityDays"
                type="number"
                :min="3"
                :max="90"
                :label="locale === 'ar' ? 'صلاحية عرض السعر (أيام)' : 'Quotation validity (days)'"
              />
            </div>
          </div>
        </div>

        <!-- RIGHT 7 COLS: Sticky Live Client Quotation Sheet -->
        <div class="lg:col-span-7 lg:sticky lg:top-24">
          <QuotationSheetPreview />
        </div>
      </div>
    </section>
  </div>
</template>
