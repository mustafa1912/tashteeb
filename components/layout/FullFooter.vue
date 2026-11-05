<script setup>
import { ArrowRight } from 'lucide-vue-next'

const { t } = useI18n()
const localePath = useLocalePath()
const uiStore = useUiStore()
const authStore = useAuthStore()
const isDev = import.meta.dev
const newsletterEmail = ref('')

function handleSubscribe() {
  if (!newsletterEmail.value || !newsletterEmail.value.includes('@')) return
  uiStore.showToast({
    title: t('footer.subscribedToast'),
    message: newsletterEmail.value,
    type: 'success'
  })
  newsletterEmail.value = ''
}
</script>

<template>
  <footer class="relative bg-navy text-surface no-print">
    <!-- Torn Paint Edge Divider -->
    <div class="brush-divider -mt-9 text-navy" aria-hidden="true" />

    <div class="shell py-14 lg:py-16">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
        <!-- Brand column -->
        <div class="lg:col-span-4 space-y-4">
          <NuxtLink :to="localePath('/')" class="inline-flex">
            <BaseLogo inverse />
          </NuxtLink>
          <p class="text-sm text-surface/85 max-w-xs leading-relaxed">
            {{ t('brand.tagline') }} {{ t('brand.subTagline') }}
          </p>
        </div>

        <!-- Product links -->
        <div class="lg:col-span-2 space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-saffron">
            {{ t('footer.product') }}
          </h2>
          <ul class="space-y-2.5 text-sm">
            <li>
              <NuxtLink :to="localePath('/calculator')" class="text-surface/85 hover:text-surface transition-colors">
                {{ t('footer.costEstimator') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/market')" class="text-surface/85 hover:text-surface transition-colors">
                {{ t('footer.priceMarket') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/estimate/ts-2408/compare')" class="text-surface/85 hover:text-surface transition-colors">
                {{ t('footer.packageComparison') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/budget')" class="text-surface/85 hover:text-surface transition-colors">
                {{ t('footer.budgetPlanner') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Resources links -->
        <div class="lg:col-span-3 space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-saffron">
            {{ t('footer.resources') }}
          </h2>
          <ul class="space-y-2.5 text-sm">
            <li>
              <NuxtLink :to="localePath('/contractor')" class="text-surface/85 hover:text-surface transition-colors">
                {{ t('footer.forContractors') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/market#methodology')" class="text-surface/85 hover:text-surface transition-colors">
                {{ t('footer.methodology') }}
              </NuxtLink>
            </li>
            <li v-if="authStore.isAuthenticated">
              <NuxtLink :to="localePath('/my-estimates')" class="text-surface/85 hover:text-surface transition-colors">
                {{ t('footer.savedEstimates') }}
              </NuxtLink>
            </li>
            <li v-if="isDev">
              <NuxtLink :to="localePath('/design-system')" class="text-surface/85 hover:text-surface transition-colors">
                Design system
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div class="lg:col-span-3 space-y-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-accent-dark">
            {{ t('footer.staySmart') }}
          </h2>
          <p class="text-sm text-surface/85">
            {{ t('footer.newsletterDesc') }}
          </p>
          <form class="flex items-center gap-2 pt-1" @submit.prevent="handleSubscribe">
            <label for="footer-newsletter" class="sr-only">{{ t('footer.emailPlaceholder') }}</label>
            <input
              id="footer-newsletter"
              v-model="newsletterEmail"
              type="email"
              required
              :placeholder="t('footer.emailPlaceholder')"
              class="min-h-touch w-full rounded-control border border-surface/25 bg-surface/10 px-3.5 text-sm text-surface placeholder:text-surface/60 focus:border-accent-dark"
            />
            <button
              type="submit"
              class="inline-flex h-touch w-touch shrink-0 items-center justify-center rounded-control bg-accent text-surface hover:bg-accent-hover transition-colors"
              :aria-label="t('common.apply')"
            >
              <ArrowRight class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
            </button>
          </form>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-12 pt-6 border-t border-surface/15 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs text-surface/80">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span>{{ t('brand.copyright') }}</span>
          <span class="hidden sm:inline text-surface/40">•</span>
          <span>{{ t('brand.disclaimer') }}</span>
        </div>
        <LanguageSwitcher inverse />
      </div>
    </div>
  </footer>
</template>
