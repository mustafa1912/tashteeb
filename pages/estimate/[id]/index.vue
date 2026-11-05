<script setup>
definePageMeta({
  layout: 'app'
})

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const localePath = useLocalePath()

const estimatesStore = useEstimatesStore()
const wizardStore = useWizardStore()
const marketStore = useMarketStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const priceModalState = ref({ open: false, item: null, material: null })
const shareModalOpen = ref(false)
const guestSaveOpen = ref(false)

onMounted(() => {
  marketStore.hydrate()
  estimatesStore.hydrate()
  authStore.hydrate()
})

const estimateId = computed(() => String(route.params.id || 'ts-2408'))
const record = computed(() => estimatesStore.getById(estimateId.value))

function openPriceEdit(lineItem) {
  const catalogMat = marketStore.getBySlug(lineItem.slug) || {
    slug: lineItem.slug,
    label_en: lineItem.label_en,
    label_ar: lineItem.label_ar,
    unit: lineItem.unit,
    unit_ar: lineItem.unit_ar,
    price: lineItem.market_base_price,
    market_base_price: lineItem.market_base_price,
    min_price: lineItem.min_price,
    max_price: lineItem.max_price,
    coverage_per_unit: lineItem.coverage_per_unit,
    fetched_at: lineItem.fetched_at
  }

  priceModalState.value = {
    open: true,
    item: lineItem,
    material: {
      ...catalogMat,
      market_base_price: lineItem.market_base_price
    }
  }
}

function handleSavePrice({ slug, used_price, reason }) {
  if (!record.value) return
  estimatesStore.updateOverrideOnEstimate(record.value.id, slug, used_price, reason)
  priceModalState.value.open = false
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم تحديث سعر البند وإعادة حساب الفاتورة' : 'Price updated & invoice recalculated',
    type: 'success'
  })
}

function handleResetPrice(slug) {
  if (!record.value) return
  estimatesStore.updateOverrideOnEstimate(record.value.id, slug, null)
  priceModalState.value.open = false
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تمت استعادة سعر السوق للبند' : 'Restored market price',
    type: 'info'
  })
}

function handleRename(newTitle) {
  if (!record.value) return
  estimatesStore.renameEstimate(record.value.id, newTitle)
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم تحديث اسم المقايسة' : 'Estimate renamed',
    type: 'success'
  })
}

function handleDuplicate() {
  if (!record.value) return
  const copy = estimatesStore.duplicateEstimate(record.value.id)
  if (copy) {
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم نسخ المقايسة' : 'Estimate duplicated',
      message: copy.refCode,
      type: 'success'
    })
    router.push(localePath(`/estimate/${copy.id}`))
  }
}

function handleSaveAccount() {
  if (!authStore.isAuthenticated) {
    guestSaveOpen.value = true
    return
  }
  uiStore.showToast({
    title: locale.value === 'ar' ? 'المقايسة محفوظة في حسابك' : 'Estimate saved to your account',
    message: record.value?.refCode,
    type: 'success'
  })
}

function handleEditInWizard() {
  if (!record.value) return
  wizardStore.loadFromInput({
    id: record.value.id,
    title: record.value.title,
    input: record.value.input
  })
  router.push(localePath('/calculator'))
}
</script>

<template>
  <div>
    <EstimateInvoiceView
      v-if="record"
      :record="record"
      @edit-price="openPriceEdit"
      @reset-price="handleResetPrice"
      @rename="handleRename"
      @duplicate="handleDuplicate"
      @save-account="handleSaveAccount"
      @open-share="shareModalOpen = true"
      @edit-wizard="handleEditInWizard"
    />

    <div v-else class="shell section-pad">
      <EmptyState
        :title="locale === 'ar' ? 'لم يتم العثور على هذه المقايسة' : 'Estimate not found'"
        :description="
          locale === 'ar'
            ? 'قد تكون هذه المقايسة حُذفت أو أن الرابط غير صحيح.'
            : 'This estimate may have been deleted or only saved on another device.'
        "
      >
        <BaseButton variant="primary" :to="localePath('/calculator')">
          {{ locale === 'ar' ? 'إنشاء مقايسة جديدة' : 'Create new estimate' }}
        </BaseButton>
      </EmptyState>
    </div>

    <PriceEditModal
      :open="priceModalState.open"
      :material="priceModalState.material"
      :purchased-qty="priceModalState.item?.purchased_qty || 1"
      :current-override="priceModalState.item?.override"
      @close="priceModalState.open = false"
      @save="handleSavePrice"
      @reset="handleResetPrice"
    />

    <WhatsAppShareModal
      :open="shareModalOpen"
      :record="record"
      @close="shareModalOpen = false"
    />

    <GuestSaveModal
      :open="guestSaveOpen"
      :redirect-path="`/estimate/${estimateId}`"
      @close="guestSaveOpen = false"
    />
  </div>
</template>
