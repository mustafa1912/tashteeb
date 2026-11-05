<script setup>
import { Home, Calculator, TrendingUp, FolderKanban } from 'lucide-vue-next'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const hideOnWizard = computed(() => {
  const clean = route.path.replace(/^\/ar(?=\/|$)/, '') || '/'
  return clean.startsWith('/calculator')
})

const tabs = computed(() => [
  { to: localePath('/'), label: t('nav.home'), icon: Home, exact: true, match: '/' },
  { to: localePath('/calculator'), label: t('nav.estimate'), icon: Calculator, exact: false, match: '/calculator' },
  { to: localePath('/market'), label: t('nav.market'), icon: TrendingUp, exact: false, match: '/market' },
  { to: localePath('/my-estimates'), label: t('nav.saved'), icon: FolderKanban, exact: false, match: '/my-estimates' }
])

function isActive(tab) {
  const clean = route.path.replace(/^\/ar(?=\/|$)/, '') || '/'
  if (tab.exact) return clean === '/'
  return clean === tab.match || clean.startsWith(`${tab.match}/`)
}
</script>

<template>
  <nav
    v-if="!hideOnWizard"
    aria-label="Mobile bottom navigation"
    class="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)] no-print"
  >
    <div class="grid grid-cols-4">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center justify-center min-h-[56px] py-1.5 text-xs font-semibold transition-colors"
        :class="isActive(tab) ? 'text-primary' : 'text-ink-secondary hover:text-ink'"
      >
        <component
          :is="tab.icon"
          class="h-5 w-5 mb-0.5"
          :class="isActive(tab) ? 'text-accent' : ''"
          :stroke-width="1.5"
        />
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
