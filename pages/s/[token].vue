<script setup>
import { AlertCircle, Calculator } from 'lucide-vue-next'

definePageMeta({
  layout: 'public'
})

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

const estimatesStore = useEstimatesStore()
const wizardStore = useWizardStore()
const uiStore = useUiStore()

const token = computed(() => String(route.params.token || ''))

const { data: serverShare, pending } = await useAsyncData(
  () => `share-${token.value}`,
  async () => {
    try {
      const res = await $fetch(`/api/share/${token.value}`)
      return res?.record || null
    } catch {
      return null
    }
  }
)

const clientFallbackRecord = ref(null)
const shareModalOpen = ref(false)

onMounted(() => {
  estimatesStore.hydrate()
  const local = estimatesStore.getByShareToken(token.value)
  if (local) {
    clientFallbackRecord.value = local
  }
})

const sharedRecord = computed(() => serverShare.value || clientFallbackRecord.value)

useHead(() => ({
  title: sharedRecord.value
    ? `${locale.value === 'ar' ? sharedRecord.value.title_ar || sharedRecord.value.title : sharedRecord.value.title} (${sharedRecord.value.refCode}) — Tashteeb`
    : 'Shared Estimate — Tashteeb',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
}))

function handleMakeCopy() {
  if (!sharedRecord.value) return
  wizardStore.loadFromInput({
    id: null,
    title: `${sharedRecord.value.title} (My Copy)`,
    input: sharedRecord.value.input
  })
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم نسخ المقايسة إلى الحاسبة' : 'Loaded copy into Calculator',
    message: locale.value === 'ar' ? 'يمكنك الآن تعديل المساحة والخامات بحرية.' : 'Customize dimensions and materials freely.',
    type: 'success'
  })
  navigateTo(localePath('/calculator'))
}
</script>

<template>
  <div>
    <div v-if="pending && !sharedRecord" class="shell py-12 space-y-6">
      <SkeletonBlock class="h-12 w-72" />
      <SkeletonBlock class="h-52 rounded-card" />
      <SkeletonBlock class="h-96 rounded-card" />
    </div>

    <EstimateInvoiceView
      v-else-if="sharedRecord"
      :record="sharedRecord"
      :readonly="true"
      @duplicate="handleMakeCopy"
      @open-share="shareModalOpen = true"
    />

    <div v-else class="shell py-16">
      <EmptyState
        :title="locale === 'ar' ? 'رابط المقايسة غير صالح أو منتهي' : 'Shared estimate link not found'"
        :description="locale === 'ar' ? 'ربما قام صاحب المقايسة بإلغاء الرابط المشترك. يمكنك حساب تكلفة تشطيب شقتك مجاناً الآن.' : 'The owner may have revoked this link or it has expired. You can build your own apartment finishing estimate in 2 minutes.'"
      >
        <template #icon>
          <AlertCircle class="h-8 w-8 text-warning" :stroke-width="1.5" />
        </template>
        <NuxtLink :to="localePath('/calculator')">
          <BaseButton variant="primary">
            <Calculator class="h-4 w-4" :stroke-width="1.5" />
            <span>{{ locale === 'ar' ? 'احسب تكلفة شقتك' : 'Calculate my apartment' }}</span>
          </BaseButton>
        </NuxtLink>
      </EmptyState>
    </div>

    <WhatsAppShareModal
      v-if="sharedRecord"
      v-model="shareModalOpen"
      :record="sharedRecord"
    />
  </div>
</template>
