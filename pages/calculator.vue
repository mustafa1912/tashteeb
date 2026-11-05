<script setup>
import { Bookmark, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'app'
})

const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const wizardStore = useWizardStore()
const estimatesStore = useEstimatesStore()
const marketStore = useMarketStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeMaterialCategory = ref('floors')
const priceModalState = ref({ open: false, material: null, purchasedQty: 1 })
const guestSaveOpen = ref(false)

onMounted(() => {
  marketStore.hydrate()
  wizardStore.hydrate()
  estimatesStore.hydrate()
  authStore.hydrate()
})

const steps = computed(() =>
  locale.value === 'ar'
    ? [
        { key: 'apartment', label: 'تفاصيل الشقة' },
        { key: 'package', label: 'مستوى التشطيب' },
        { key: 'materials', label: 'الخامات' },
        { key: 'extras', label: 'الإضافات' },
        { key: 'review', label: 'المراجعة' }
      ]
    : [
        { key: 'apartment', label: 'Apartment' },
        { key: 'package', label: 'Level' },
        { key: 'materials', label: 'Materials' },
        { key: 'extras', label: 'Extras' },
        { key: 'review', label: 'Review' }
      ]
)

function goNext() {
  if (wizardStore.currentStep < 4) {
    wizardStore.setStep(wizardStore.currentStep + 1)
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    finalizeEstimate()
  }
}

function goBack() {
  if (wizardStore.currentStep > 0) {
    wizardStore.setStep(wizardStore.currentStep - 1)
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function jumpToCategory(catKey) {
  activeMaterialCategory.value = catKey
  wizardStore.setStep(2)
}

function openPriceModal({ material, purchasedQty }) {
  priceModalState.value = {
    open: true,
    material,
    purchasedQty: purchasedQty || 1
  }
}

function handlePriceOverrideSave({ slug, used_price, reason }) {
  wizardStore.setPriceOverride(slug, used_price, reason)
  priceModalState.value.open = false
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم تحديث سعر الخامة' : 'Material price updated',
    message: `${formatCurrency(used_price, locale.value)}`,
    type: 'success'
  })
}

function handlePriceOverrideReset(slug) {
  wizardStore.resetPriceOverride(slug)
  priceModalState.value.open = false
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تمت استعادة سعر السوق' : 'Reset to market price',
    type: 'info'
  })
}

function handleSaveAndExit() {
  if (!authStore.isAuthenticated) {
    guestSaveOpen.value = true
    return
  }
  const saved = estimatesStore.createOrUpdateFromWizard(wizardStore, 'draft')
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم حفظ المسودة في حسابك' : 'Draft saved to My Estimates',
    message: saved.refCode,
    type: 'success'
  })
  router.push(localePath('/my-estimates'))
}

async function handleResetWizard() {
  const confirmed = await uiStore.askConfirm({
    title: locale.value === 'ar' ? 'إعادة ضبط الحاسبة؟' : 'Reset calculator inputs?',
    message: locale.value === 'ar'
      ? 'سيتم إرجاع المساحة والخامات والأسعار المعدلة إلى الإعدادات الافتراضية.'
      : 'This will restore default apartment specs, Standard materials, and clear price overrides.',
    confirmText: locale.value === 'ar' ? 'نعم، إعادة ضبط' : 'Reset calculator',
    cancelText: locale.value === 'ar' ? 'إلغاء' : 'Cancel',
    variant: 'danger'
  })
  if (confirmed) {
    wizardStore.resetWizard()
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تمت إعادة ضبط الحاسبة' : 'Calculator reset to defaults',
      type: 'info'
    })
  }
}

function finalizeEstimate() {
  const record = estimatesStore.createOrUpdateFromWizard(wizardStore, 'ready')
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم إصدار مقايسة التشطيب بنجاح' : 'Estimate generated',
    message: `${record.refCode} · ${formatCurrency(record.computed.grandTotal, locale.value)}`,
    type: 'success'
  })
  router.push(localePath(`/estimate/${record.id}`))
}
</script>

<template>
  <div class="shell py-8 sm:py-10 pb-28 lg:pb-14 space-y-6">
    <!-- Top Header + Save & Exit -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-1">
        <FreshnessLabel short />
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">
          {{ locale === 'ar' ? 'حاسبة تكلفة التشطيب التفصيلية' : 'Apartment Finishing Cost Calculator' }}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton variant="ghost" size="sm" @click="handleResetWizard">
          <RotateCcw class="h-4 w-4" :stroke-width="1.5" />
          <span class="hidden sm:inline">{{ locale === 'ar' ? 'إعادة ضبط' : 'Reset' }}</span>
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="handleSaveAndExit">
          <Bookmark class="h-4 w-4 text-primary" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'حفظ وخروج' : 'Save & exit' }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- Clickable 5-Step Stepper -->
    <StepperBar
      :model-value="wizardStore.currentStep"
      :steps="steps"
      @update:model-value="wizardStore.setStep($event)"
    />

    <!-- Main 2-Column Wizard Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-8 card-surface p-5 sm:p-7 space-y-8">
        <WizardStepApartment v-if="wizardStore.currentStep === 0" />
        <WizardStepPackage v-else-if="wizardStore.currentStep === 1" />
        <WizardStepMaterials
          v-else-if="wizardStore.currentStep === 2"
          v-model:active-category="activeMaterialCategory"
          @edit-price="openPriceModal"
        />
        <WizardStepExtras v-else-if="wizardStore.currentStep === 3" />
        <WizardStepReview
          v-else
          @jump-step="wizardStore.setStep($event)"
          @jump-category="jumpToCategory"
          @calculate="finalizeEstimate"
        />

        <!-- Step Footer Controls -->
        <div class="pt-5 border-t border-border flex items-center justify-between gap-3">
          <BaseButton
            variant="secondary"
            :disabled="wizardStore.currentStep === 0"
            @click="goBack"
          >
            <ArrowLeft class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
            <span>{{ locale === 'ar' ? 'السابق' : 'Back' }}</span>
          </BaseButton>

          <BaseButton
            v-if="wizardStore.currentStep < 4"
            variant="primary"
            @click="goNext"
          >
            <span>{{ locale === 'ar' ? 'حفظ والمتابعة' : 'Continue' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          </BaseButton>

          <BaseButton
            v-else
            variant="accent"
            @click="finalizeEstimate"
          >
            <span>{{ locale === 'ar' ? 'احسب المقايسة' : 'Calculate my estimate' }}</span>
            <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
          </BaseButton>
        </div>
      </div>

      <div class="lg:col-span-4">
        <RunningTotalSidebar
          :estimate="wizardStore.liveEstimate"
          :is-last-step="wizardStore.currentStep === 4"
          @next="goNext"
          @finish="finalizeEstimate"
        />
      </div>
    </div>

    <!-- Price Override Modal -->
    <PriceEditModal
      :open="priceModalState.open"
      :material="priceModalState.material"
      :purchased-qty="priceModalState.purchasedQty"
      :current-override="priceModalState.material ? wizardStore.overrides[priceModalState.material.slug] : null"
      @close="priceModalState.open = false"
      @save="handlePriceOverrideSave"
      @reset="handlePriceOverrideReset"
    />

    <!-- Guest Save & Exit Modal -->
    <GuestSaveModal
      :open="guestSaveOpen"
      redirect-path="/calculator"
      @close="guestSaveOpen = false"
    />
  </div>
</template>
