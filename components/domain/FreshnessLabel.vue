<script setup>
const props = defineProps({
  fetchedAt: {
    type: [String, Date],
    default: null
  },
  asOfDate: {
    type: String,
    default: ''
  },
  short: {
    type: Boolean,
    default: false
  },
  inverse: {
    type: Boolean,
    default: false
  }
})

const { locale, t } = useI18n()

const staleDays = computed(() => {
  if (!props.fetchedAt) return 0
  const date = new Date(props.fetchedAt)
  if (Number.isNaN(date.getTime())) return 0
  const diffMs = Date.now() - date.getTime()
  const days = Math.floor(diffMs / 86_400_000)
  return days > 1 ? days : 0
})

const isStale = computed(() => staleDays.value >= 2)

const labelText = computed(() => {
  if (props.asOfDate) {
    return t('freshness.pricesAsOf', { date: formatDateDisplay(props.asOfDate, locale.value) })
  }
  if (isStale.value) {
    return t('freshness.updatedDaysAgo', { days: staleDays.value })
  }
  return props.short ? t('freshness.updatedTodayShort') : t('freshness.updatedToday')
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2 text-xs font-medium"
    :class="
      isStale
        ? inverse
          ? 'rounded-pill bg-warning/20 px-2.5 py-0.5 text-warning-tint'
          : 'rounded-pill bg-warning-tint px-2.5 py-0.5 text-ink'
        : inverse
          ? 'text-surface/85'
          : 'text-ink-secondary'
    "
  >
    <span
      class="h-2 w-2 shrink-0 rounded-pill"
      :class="
        isStale
          ? 'bg-warning ring-2 ring-warning/25'
          : 'bg-success ring-4 ring-success/15'
      "
      aria-hidden="true"
    />
    <span>{{ labelText }}</span>
  </span>
</template>
