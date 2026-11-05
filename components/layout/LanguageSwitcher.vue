<script setup>
defineProps({
  inverse: {
    type: Boolean,
    default: false
  }
})

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const enPath = computed(() => switchLocalePath('en') || '/')
const arPath = computed(() => switchLocalePath('ar') || '/ar')
</script>

<template>
  <div
    dir="ltr"
    class="inline-flex items-center rounded-pill p-0.5 text-xs font-semibold border transition-colors"
    :class="
      inverse
        ? 'border-surface/25 bg-surface/10 text-surface'
        : 'border-border bg-sand text-ink'
    "
    role="group"
    aria-label="Language switcher"
  >
    <NuxtLink
      :to="enPath"
      class="min-h-[32px] inline-flex items-center px-2.5 rounded-pill transition-colors"
      :class="
        locale === 'en'
          ? inverse
            ? 'bg-surface text-primary-deep font-bold'
            : 'bg-surface text-primary shadow-sm font-bold'
          : inverse
            ? 'text-surface/80 hover:text-surface'
            : 'text-ink-secondary hover:text-ink'
      "
      :aria-current="locale === 'en' ? 'true' : undefined"
    >
      EN
    </NuxtLink>
    <NuxtLink
      :to="arPath"
      class="min-h-[32px] inline-flex items-center px-2.5 rounded-pill font-arabic transition-colors"
      :class="
        locale === 'ar'
          ? inverse
            ? 'bg-surface text-primary-deep font-bold'
            : 'bg-surface text-primary shadow-sm font-bold'
          : inverse
            ? 'text-surface/80 hover:text-surface'
            : 'text-ink-secondary hover:text-ink'
      "
      :aria-current="locale === 'ar' ? 'true' : undefined"
    >
      AR · العربية
    </NuxtLink>
  </div>
</template>
