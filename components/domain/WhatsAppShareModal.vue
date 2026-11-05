<script setup>
import { Copy, Check, MessageCircle, ExternalLink } from 'lucide-vue-next'
import { PACKAGES } from '~/utils/calc/config.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const { locale } = useI18n()
const config = useRuntimeConfig()
const estimatesStore = useEstimatesStore()
const uiStore = useUiStore()
const copied = ref(false)

const shareUrl = computed(() => {
  if (!props.record) return ''
  const token = props.record.shareToken || estimatesStore.ensureShareToken(props.record.id)
  const origin = import.meta.client ? window.location.origin : config.public.siteUrl
  const prefix = locale.value === 'ar' ? '/ar' : ''
  return `${origin}${prefix}/s/${token}`
})

const pkgLabel = computed(() => {
  const p = PACKAGES[props.record?.input?.packageKey]
  if (!p) return ''
  return locale.value === 'ar' ? p.label_ar : p.label_en
})

const whatsappMessage = computed(() => {
  if (!props.record?.computed) return ''
  const c = props.record.computed
  const title = locale.value === 'ar' ? (props.record.title_ar || props.record.title) : props.record.title
  if (locale.value === 'ar') {
    return [
      `🏠 *مقايسة تشطيب — ${title}* (${props.record.refCode})`,
      `📐 المساحة: ${c.apartment.area} م² · المستوى: ${pkgLabel.value}`,
      `💰 الإجمالي التقديري: *${formatCurrency(c.grandTotal, 'ar')}*`,
      `   • الخامات: ${formatCurrency(c.materialsTotal, 'ar')}`,
      `   • المصنعيات: ${formatCurrency(c.labourTotal, 'ar')}`,
      `   • احتياطي الطوارئ: ${formatCurrency(c.contingencyAmount, 'ar')}`,
      `⏱ المدة المتوقعة: ~${c.timeline.totalWeeks} أسبوع`,
      ``,
      `📄 استعرض الفاتورة التفصيلية الكاملة:`,
      shareUrl.value
    ].join('\n')
  }
  return [
    `🏠 *Tashteeb Finishing Estimate — ${title}* (${props.record.refCode})`,
    `📐 Area: ${c.apartment.area} m² · Level: ${pkgLabel.value}`,
    `💰 Estimated Total: *${formatCurrency(c.grandTotal, 'en')}*`,
    `   • Materials: ${formatCurrency(c.materialsTotal, 'en')}`,
    `   • Labour: ${formatCurrency(c.labourTotal, 'en')}`,
    `   • Contingency: ${formatCurrency(c.contingencyAmount, 'en')}`,
    `⏱ Est. Timeline: ~${c.timeline.totalWeeks} weeks`,
    ``,
    `📄 View read-only itemized invoice:`,
    shareUrl.value
  ].join('\n')
})

const whatsappHref = computed(() =>
  `https://wa.me/?text=${encodeURIComponent(whatsappMessage.value)}`
)

async function copyShareLink() {
  if (!import.meta.client || !shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم نسخ رابط المشاركة' : 'Share link copied to clipboard',
      type: 'success'
    })
    setTimeout(() => {
      copied.value = false
    }, 2200)
  } catch {
    // ignore clipboard restrictions
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="locale === 'ar' ? 'مشاركة المقايسة عبر واتساب أو رابط عام' : 'Share estimate via WhatsApp'"
    :description="
      locale === 'ar'
        ? 'أي شخص لديه الرابط يمكنه استعراض الفاتورة للقراءة فقط بدون القدرة على التعديل.'
        : 'Anyone with this read-only link can view the itemized invoice without editing your prices.'
    "
    @close="emit('close')"
  >
    <div v-if="record" class="space-y-4">
      <!-- Read-only URL Copy Box -->
      <div class="space-y-1.5">
        <span class="text-xs font-bold uppercase text-ink-secondary">
          {{ locale === 'ar' ? 'رابط المعاينة العام (للقراءة فقط)' : 'Public read-only link' }}
        </span>
        <div class="flex items-center gap-2">
          <input
            dir="ltr"
            type="text"
            readonly
            :value="shareUrl"
            aria-label="Share URL"
            class="min-h-touch w-full rounded-control border border-border bg-sand px-3 text-xs text-ink font-mono"
          >
          <BaseButton variant="secondary" size="sm" class="shrink-0" @click="copyShareLink">
            <Check v-if="copied" class="h-4 w-4 text-success" :stroke-width="1.5" />
            <Copy v-else class="h-4 w-4" :stroke-width="1.5" />
            <span>{{ copied ? (locale === 'ar' ? 'تم النسخ' : 'Copied') : (locale === 'ar' ? 'نسخ' : 'Copy') }}</span>
          </BaseButton>
        </div>
      </div>

      <!-- Formatted WhatsApp Preview -->
      <div class="space-y-1.5">
        <span class="text-xs font-bold uppercase text-ink-secondary">
          {{ locale === 'ar' ? 'معاينة رسالة واتساب' : 'WhatsApp message preview' }}
        </span>
        <pre class="whitespace-pre-wrap rounded-card border border-success/25 bg-success-tint/50 p-3.5 text-xs text-ink font-sans leading-relaxed">{{ whatsappMessage }}</pre>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit('close')">
        {{ locale === 'ar' ? 'إغلاق' : 'Close' }}
      </BaseButton>
      <a
        :href="whatsappHref"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-touch items-center justify-center gap-2 rounded-control bg-success px-4 py-2 text-sm font-semibold text-surface hover:opacity-95 transition-opacity"
      >
        <MessageCircle class="h-4 w-4" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'إرسال عبر واتساب' : 'Send via WhatsApp' }}</span>
        <ExternalLink class="h-3.5 w-3.5" :stroke-width="1.5" />
      </a>
    </template>
  </BaseModal>
</template>
