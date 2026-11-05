<script setup>
import { Compass, AlertTriangle, Home, Calculator, TrendingUp } from 'lucide-vue-next'

const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 404, message: '' })
  }
})

const { t } = useI18n()
const localePath = useLocalePath()
const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true
})

const statusCode = computed(() => Number(props.error?.statusCode || 500))
const isNotFound = computed(() => statusCode.value === 404)

useHead(() => ({
  title: `${statusCode.value} — ${t('brand.name')}`,
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang || 'en',
    dir: head.value.htmlAttrs?.dir || 'ltr'
  }
}))

function goTo(path) {
  clearError({ redirect: localePath(path) })
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg text-ink antialiased pb-14 md:pb-0">
    <AppNavbar />

    <main id="main-content" tabindex="-1" class="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
      <div class="w-full max-w-2xl rounded-card border border-border bg-surface p-8 sm:p-12 shadow-card text-center relative overflow-hidden">
        <!-- Subtle top accent bar -->
        <div
          class="absolute inset-x-0 top-0 h-1.5"
          :class="isNotFound ? 'bg-primary' : 'bg-accent'"
          aria-hidden="true"
        />

        <!-- Architectural Blueprint Motif -->
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-card border border-border bg-sand">
          <Compass
            v-if="isNotFound"
            class="h-10 w-10 text-primary"
            :stroke-width="1.5"
            aria-hidden="true"
          />
          <AlertTriangle
            v-else
            class="h-10 w-10 text-accent"
            :stroke-width="1.5"
            aria-hidden="true"
          />
        </div>

        <span
          class="inline-flex items-center gap-2 rounded-pill px-3.5 py-1 text-xs font-semibold tabular-price"
          :class="isNotFound ? 'bg-primary-tint text-primary' : 'bg-accent-tint text-accent'"
        >
          {{ isNotFound ? t('system.error404Badge') : t('system.error500Badge') }}
        </span>

        <h1 class="mt-4 text-2xl sm:text-3xl font-semibold text-ink">
          {{ isNotFound ? t('system.error404Title') : t('system.error500Title') }}
        </h1>

        <p class="mx-auto mt-3 max-w-lg text-base text-ink-secondary leading-relaxed">
          {{ isNotFound ? t('system.error404Body') : t('system.error500Body') }}
        </p>

        <!-- Primary & Secondary Recovery Actions -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <BaseButton variant="primary" size="lg" @click="goTo('/')">
            <Home class="h-4 w-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t('system.goHome') }}</span>
          </BaseButton>

          <BaseButton variant="secondary" size="lg" @click="goTo('/calculator')">
            <Calculator class="h-4 w-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t('system.openCalculator') }}</span>
          </BaseButton>
        </div>

        <div class="mt-6 pt-6 border-t border-border flex justify-center">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-control text-sm font-semibold text-primary hover:bg-primary-tint transition-colors"
            @click="goTo('/market')"
          >
            <TrendingUp class="h-4 w-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t('system.browseMarket') }}</span>
          </button>
        </div>
      </div>
    </main>

    <CompactFooter />
    <MobileBottomNav />
  </div>
</template>

