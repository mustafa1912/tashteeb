<script setup>
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="border-t border-border bg-surface py-6 no-print">
    <div class="shell flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-ink-secondary">
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center">
          <BaseLogo size="sm" />
        </NuxtLink>
        <span class="text-border">|</span>
        <span>{{ t('brand.copyrightShort') }}</span>
        <span class="hidden sm:inline text-border">•</span>
        <span>{{ t('brand.disclaimer') }}</span>
      </div>
      <LanguageSwitcher />
    </div>
  </footer>
</template>
