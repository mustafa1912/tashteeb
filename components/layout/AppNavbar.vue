<script setup>
import {
  Bell,
  Menu,
  X,
  FolderKanban,
  Settings,
  LogOut,
  Wallet,
  HardHat,
  ChevronDown
} from 'lucide-vue-next'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const notificationsOpen = ref(false)

onMounted(() => {
  authStore.hydrate()
})

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
    userMenuOpen.value = false
    notificationsOpen.value = false
  }
)

const navLinks = computed(() => {
  const base = [
    { to: localePath('/calculator'), label: t('nav.calculator'), match: '/calculator' },
    { to: localePath('/market'), label: t('nav.market'), match: '/market' },
    { to: localePath('/contractor'), label: t('nav.contractors'), match: '/contractor' }
  ]
  if (authStore.isAuthenticated) {
    base.push({ to: localePath('/my-estimates'), label: t('nav.myEstimates'), match: '/my-estimates' })
  }
  return base
})

function isLinkActive(matchPrefix) {
  const cleanPath = route.path.replace(/^\/ar(?=\/|$)/, '') || '/'
  return cleanPath === matchPrefix || cleanPath.startsWith(`${matchPrefix}/`)
}

function handleLogout() {
  authStore.logout()
  userMenuOpen.value = false
  uiStore.showToast({
    title: t('nav.logout'),
    type: 'info'
  })
  router.push(localePath('/'))
}

const sampleNotifications = [
  {
    id: 'n1',
    title: 'Porcelain 60×60 rose +3.1%',
    time: 'Today, 06:00'
  },
  {
    id: 'n2',
    title: 'El Sewedy 3mm wire dropped −1.2%',
    time: 'Yesterday'
  }
]
</script>

<template>
  <header class="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border no-print">
    <SystemBanner />

    <div class="shell h-[70px] sm:h-[76px] flex items-center justify-between gap-2 sm:gap-4">
      <!-- Brand Logo -->
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center min-h-touch py-1 shrink-0 rounded-control"
      >
        <BaseLogo />
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-7" aria-label="Main navigation">
        <NuxtLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          class="relative inline-flex items-center min-h-touch text-sm font-semibold transition-colors"
          :class="
            isLinkActive(item.match)
              ? 'text-primary'
              : 'text-ink-secondary hover:text-ink'
          "
        >
          <span>{{ item.label }}</span>
          <span
            v-if="isLinkActive(item.match)"
            class="absolute inset-x-0 -bottom-[15px] h-[2px] rounded-pill bg-accent"
          />
        </NuxtLink>
      </nav>

      <!-- Right Controls -->
      <div class="hidden lg:flex items-center gap-3">
        <LanguageSwitcher />

        <template v-if="!authStore.isAuthenticated">
          <BaseButton
            variant="ghost"
            size="sm"
            :to="localePath('/login')"
          >
            {{ t('nav.login') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            :to="localePath('/signup')"
          >
            {{ t('nav.signup') }}
          </BaseButton>
        </template>

        <template v-else>
          <!-- Notification Bell -->
          <div class="relative">
            <button
              type="button"
              class="relative inline-flex h-touch w-touch items-center justify-center rounded-control border border-border bg-surface text-ink-secondary hover:bg-sand hover:text-ink transition-colors"
              :aria-label="t('nav.notifications')"
              @click="notificationsOpen = !notificationsOpen; userMenuOpen = false"
            >
              <Bell class="h-5 w-5" :stroke-width="1.5" />
              <span class="absolute top-2.5 end-2.5 h-2 w-2 rounded-pill bg-accent" />
            </button>

            <div
              v-if="notificationsOpen"
              class="absolute end-0 mt-2 w-80 rounded-card border border-border bg-surface p-3 shadow-elevated z-50"
            >
              <p class="px-2 py-1 text-xs font-bold uppercase text-ink-secondary">
                {{ t('nav.notifications') }}
              </p>
              <ul class="mt-1 divide-y divide-border">
                <li
                  v-for="note in sampleNotifications"
                  :key="note.id"
                  class="px-2 py-2.5 text-xs"
                >
                  <p class="font-semibold text-ink">{{ note.title }}</p>
                  <p class="mt-0.5 text-ink-secondary">{{ note.time }}</p>
                </li>
              </ul>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="relative">
            <button
              type="button"
              class="inline-flex min-h-touch items-center gap-2.5 rounded-control border border-border bg-surface ps-2 pe-3 py-1.5 text-sm font-semibold text-ink hover:bg-sand transition-colors"
              @click="userMenuOpen = !userMenuOpen; notificationsOpen = false"
            >
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-primary text-xs font-bold text-surface">
                {{ authStore.initials }}
              </span>
              <span class="max-w-[130px] truncate">{{ authStore.user?.full_name }}</span>
              <ChevronDown class="h-4 w-4 text-ink-secondary" :stroke-width="1.5" />
            </button>

            <div
              v-if="userMenuOpen"
              class="absolute end-0 mt-2 w-60 rounded-card border border-border bg-surface p-2 shadow-elevated z-50"
            >
              <div class="px-3 py-2 border-b border-border mb-1">
                <p class="text-sm font-semibold text-ink truncate">{{ authStore.user?.full_name }}</p>
                <p class="text-xs text-ink-secondary truncate">{{ authStore.user?.email }}</p>
              </div>

              <NuxtLink
                :to="localePath('/my-estimates')"
                class="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm text-ink hover:bg-sand"
              >
                <FolderKanban class="h-4 w-4 text-primary" :stroke-width="1.5" />
                <span>{{ t('nav.myEstimates') }}</span>
              </NuxtLink>

              <NuxtLink
                :to="localePath('/budget')"
                class="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm text-ink hover:bg-sand"
              >
                <Wallet class="h-4 w-4 text-primary" :stroke-width="1.5" />
                <span>{{ t('nav.budget') }}</span>
              </NuxtLink>

              <NuxtLink
                :to="localePath('/contractor')"
                class="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm text-ink hover:bg-sand"
              >
                <HardHat class="h-4 w-4 text-primary" :stroke-width="1.5" />
                <span>{{ t('nav.contractors') }}</span>
              </NuxtLink>

              <NuxtLink
                :to="localePath('/settings')"
                class="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm text-ink hover:bg-sand"
              >
                <Settings class="h-4 w-4 text-primary" :stroke-width="1.5" />
                <span>{{ t('nav.settings') }}</span>
              </NuxtLink>

              <button
                type="button"
                class="mt-1 flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium text-danger hover:bg-danger-tint"
                @click="handleLogout"
              >
                <LogOut class="h-4 w-4" :stroke-width="1.5" />
                <span>{{ t('nav.logout') }}</span>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Mobile Actions -->
      <div class="flex lg:hidden items-center gap-2">
        <LanguageSwitcher />
        <button
          type="button"
          class="inline-flex h-touch w-touch items-center justify-center rounded-control border border-border bg-surface text-ink hover:bg-sand"
          :aria-label="mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" class="h-5 w-5" :stroke-width="1.5" />
          <Menu v-else class="h-5 w-5" :stroke-width="1.5" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden border-t border-border bg-surface px-4 py-4 shadow-elevated space-y-3"
    >
      <nav class="flex flex-col gap-1" aria-label="Mobile navigation">
        <NuxtLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between min-h-touch rounded-control px-3 py-2.5 text-base font-semibold"
          :class="
            isLinkActive(item.match)
              ? 'bg-primary-tint text-primary'
              : 'text-ink hover:bg-sand'
          "
        >
          <span>{{ item.label }}</span>
          <span v-if="isLinkActive(item.match)" class="h-2 w-2 rounded-pill bg-accent" />
        </NuxtLink>

        <NuxtLink
          :to="localePath('/budget')"
          class="flex items-center min-h-touch rounded-control px-3 py-2.5 text-base font-semibold text-ink hover:bg-sand"
        >
          {{ t('nav.budget') }}
        </NuxtLink>
      </nav>

      <div class="pt-3 border-t border-border flex flex-col sm:flex-row gap-2.5">
        <template v-if="!authStore.isAuthenticated">
          <BaseButton
            variant="secondary"
            block
            :to="localePath('/login')"
          >
            {{ t('nav.login') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            block
            :to="localePath('/signup')"
          >
            {{ t('nav.signup') }}
          </BaseButton>
        </template>
        <template v-else>
          <BaseButton
            variant="secondary"
            block
            :to="localePath('/settings')"
          >
            {{ t('nav.settings') }}
          </BaseButton>
          <BaseButton
            variant="danger"
            block
            @click="handleLogout"
          >
            {{ t('nav.logout') }}
          </BaseButton>
        </template>
      </div>
    </div>
  </header>
</template>
