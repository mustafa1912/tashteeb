<script setup>
import { AlertTriangle, X } from 'lucide-vue-next'

const uiStore = useUiStore()
const { t, locale } = useI18n()

const formattedDate = computed(() => {
  if (!uiStore.priceFeedFallbackDate) return ''
  return formatDateDisplay(uiStore.priceFeedFallbackDate, locale.value)
})
</script>

<template>
  <div
    v-if="uiStore.priceFeedFallbackDate && !uiStore.priceBannerDismissed"
    role="status"
    class="bg-warning-tint border-b border-warning/40 text-ink"
  >
    <div class="shell py-2.5 flex items-center justify-between gap-3 text-sm">
      <div class="flex items-center gap-2.5 min-w-0">
        <AlertTriangle class="h-4 w-4 text-warning shrink-0" :stroke-width="1.5" />
        <p class="text-xs sm:text-sm text-ink">
          <strong class="font-semibold">{{ t('freshness.unavailableTitle') }}</strong>
          <span class="ms-1 text-ink-secondary">
            {{ t('freshness.unavailableBody', { date: formattedDate }) }}
          </span>
        </p>
      </div>
      <button
        type="button"
        class="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-control text-ink-secondary hover:bg-surface/60 hover:text-ink shrink-0"
        :aria-label="t('common.dismiss')"
        @click="uiStore.priceBannerDismissed = true"
      >
        <X class="h-4 w-4" :stroke-width="1.5" />
      </button>
    </div>
  </div>
</template>
