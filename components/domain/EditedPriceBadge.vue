<script setup>
import { Pencil } from 'lucide-vue-next'

const props = defineProps({
  originalPrice: {
    type: Number,
    default: null
  },
  usedPrice: {
    type: Number,
    default: null
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const { locale, t } = useI18n()

const tooltipText = computed(() => {
  if (props.originalPrice == null || props.usedPrice == null) return ''
  return t('common.editedFromTo', {
    from: formatCurrency(props.originalPrice, locale.value),
    to: formatCurrency(props.usedPrice, locale.value)
  })
})
</script>

<template>
  <BaseTooltip :text="tooltipText">
    <span
      class="inline-flex items-center gap-1.5 rounded-pill border border-warning/40 bg-warning-tint px-2.5 py-0.5 text-xs font-semibold text-ink tabular-price"
    >
      <Pencil class="h-3 w-3 shrink-0 text-warning" :stroke-width="1.8" aria-hidden="true" />
      <span v-if="compact || originalPrice == null || usedPrice == null">
        {{ $t('common.priceEdited') }}
      </span>
      <span v-else>
        <bdi>{{ $t('common.editedFromTo', { from: formatNumber(originalPrice), to: formatNumber(usedPrice) }) }}</bdi>
      </span>
    </span>
  </BaseTooltip>
</template>
