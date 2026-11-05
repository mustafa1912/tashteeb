<script setup>
import { Home, HardHat, UserPlus, Eye, EyeOff, ArrowRight } from 'lucide-vue-next'
import { GOVERNORATES } from '~/utils/calc/config.js'

definePageMeta({
  layout: 'auth'
})

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { $supabase, $hasSupabase } = useNuxtApp()

const authStore = useAuthStore()
const wizardStore = useWizardStore()
const estimatesStore = useEstimatesStore()
const uiStore = useUiStore()

useHead(() => ({
  title: locale.value === 'ar' ? 'إنشاء حساب — تشطيب' : 'Create account — Tashteeb'
}))

const role = ref('homeowner') // 'homeowner' | 'contractor'
const fullName = ref('')
const companyName = ref('')
const email = ref('')
const phone = ref('')
const governorate = ref('cairo')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const govOptions = computed(() =>
  GOVERNORATES.map(g => ({
    value: g.code,
    label: locale.value === 'ar' ? g.label_ar : g.label_en
  }))
)

const passwordScore = computed(() => {
  const val = password.value || ''
  if (!val) return 0
  let score = 0
  if (val.length >= 8) score += 1
  if (/[A-Z]/.test(val) || /[0-9]/.test(val)) score += 1
  if (/[0-9]/.test(val) && /[a-zA-Z]/.test(val)) score += 1
  if (val.length >= 11 || /[^A-Za-z0-9]/.test(val)) score += 1
  return Math.min(4, Math.max(1, score))
})

const passwordStrengthLabel = computed(() => {
  const labelsEn = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const labelsAr = ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية']
  return locale.value === 'ar' ? labelsAr[passwordScore.value] : labelsEn[passwordScore.value]
})

async function handleSignup() {
  errorMessage.value = ''
  if (!fullName.value.trim() || !email.value.trim() || password.value.length < 6) {
    errorMessage.value =
      locale.value === 'ar'
        ? 'يرجى استكمال الاسم والبريد وكلمة مرور لا تقل عن 6 أحرف.'
        : 'Please complete your name, email, and a password of at least 6 characters.'
    return
  }

  loading.value = true
  try {
    let userId = `usr-${Date.now()}`
    if ($hasSupabase && $supabase) {
      const { data, error } = await $supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: {
          data: {
            full_name: fullName.value.trim(),
            role: role.value,
            governorate: governorate.value,
            company_name: companyName.value.trim() || undefined
          }
        }
      })
      if (error) throw error
      if (data?.user?.id) userId = data.user.id
    }

    const profile = {
      id: userId,
      email: email.value.trim(),
      full_name: fullName.value.trim(),
      phone: phone.value.trim() ? `+20 ${phone.value.trim()}` : '+20 100 482 9100',
      governorate: governorate.value,
      role: role.value,
      company_name: role.value === 'contractor' ? companyName.value.trim() : '',
      preferred_locale: locale.value
    }

    authStore.setSessionUser(profile)

    if (route.query.saveWizard === '1') {
      wizardStore.hydrate()
      const saved = estimatesStore.createOrUpdateFromWizard(wizardStore, 'in_progress')
      uiStore.showToast({
        title: locale.value === 'ar' ? 'تم إنشاء الحساب وحفظ المقايسة' : 'Account created & estimate saved',
        message: saved.refCode,
        type: 'success'
      })
      navigateTo(localePath(`/estimate/${saved.id}`))
      return
    }

    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم إنشاء حسابك بنجاح!' : 'Account created!',
      type: 'success'
    })

    navigateTo(
      role.value === 'contractor'
        ? localePath('/contractor')
        : localePath('/my-estimates')
    )
  } catch (err) {
    errorMessage.value = err?.message || 'Could not create account'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1.5">
      <h1 class="text-2xl sm:text-3xl font-bold text-ink">
        {{ locale === 'ar' ? 'إنشاء حساب مجاني' : 'Create your free account' }}
      </h1>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'احفظ مقايسات الشقق، تابع تحركات أسعار الخامات، وشارك عروض الأسعار.'
            : 'Save estimates across devices, monitor market prices, and export PDFs.'
        }}
      </p>
    </div>

    <!-- Role Selector -->
    <div class="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        class="min-h-touch rounded-card border p-3 text-start transition-colors flex items-start gap-2.5"
        :class="role === 'homeowner' ? 'border-primary bg-primary-tint/50' : 'border-border bg-surface hover:bg-sand/50'"
        @click="role = 'homeowner'"
      >
        <Home class="h-5 w-5 text-primary shrink-0 mt-0.5" :stroke-width="1.5" />
        <div>
          <p class="text-sm font-bold text-ink">{{ locale === 'ar' ? 'مالك وحدة' : 'Home owner' }}</p>
          <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'أشطب شقتي أو فيلتي' : 'Finishing my unit' }}</p>
        </div>
      </button>

      <button
        type="button"
        class="min-h-touch rounded-card border p-3 text-start transition-colors flex items-start gap-2.5"
        :class="role === 'contractor' ? 'border-primary bg-primary-tint/50' : 'border-border bg-surface hover:bg-sand/50'"
        @click="role = 'contractor'"
      >
        <HardHat class="h-5 w-5 text-accent shrink-0 mt-0.5" :stroke-width="1.5" />
        <div>
          <p class="text-sm font-bold text-ink">{{ locale === 'ar' ? 'مهندس / مقاول' : 'Contractor' }}</p>
          <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'عروض أسعار للعملاء' : 'Client quotations' }}</p>
        </div>
      </button>
    </div>

    <div
      v-if="errorMessage"
      role="alert"
      class="rounded-control border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-xs sm:text-sm font-medium text-danger"
    >
      {{ errorMessage }}
    </div>

    <form class="space-y-4" @submit.prevent="handleSignup">
      <BaseInput
        v-model="fullName"
        :label="locale === 'ar' ? 'الاسم بالكامل' : 'Full name'"
        :placeholder="locale === 'ar' ? 'أحمد حسن' : 'Ahmed Hassan'"
        autocomplete="name"
        required
      />

      <BaseInput
        v-if="role === 'contractor'"
        v-model="companyName"
        :label="locale === 'ar' ? 'اسم المكتب الهندسي / شركة التشطيبات' : 'Company or engineering office name'"
        :placeholder="locale === 'ar' ? 'المصري للتشطيبات والعمارة' : 'El Masry Finishing & Architecture'"
      />

      <BaseInput
        v-model="email"
        type="email"
        :label="locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'"
        placeholder="ahmed@example.com"
        autocomplete="email"
        required
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-ink">
            {{ locale === 'ar' ? 'رقم الموبايل' : 'Mobile (+20)' }}
          </label>
          <div class="flex items-stretch gap-1.5" dir="ltr">
            <span class="inline-flex items-center rounded-control border border-border bg-sand px-2.5 text-xs font-semibold text-ink tabular-price">
              +20
            </span>
            <input
              v-model="phone"
              type="tel"
              placeholder="100 482 9100"
              class="w-full min-h-touch rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink tabular-price focus:border-primary focus:outline-none"
            >
          </div>
        </div>

        <SelectField
          v-model="governorate"
          :label="locale === 'ar' ? 'المحافظة' : 'Governorate'"
          :options="govOptions"
        />
      </div>

      <!-- Password + Strength Meter -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="block text-sm font-semibold text-ink">
            {{ locale === 'ar' ? 'كلمة المرور' : 'Password' }}
          </label>
          <span v-if="password" class="text-xs font-semibold text-ink-secondary">
            {{ passwordStrengthLabel }}
          </span>
        </div>

        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="••••••••"
            required
            class="w-full min-h-touch rounded-control border border-border bg-surface px-3.5 pe-11 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          >
          <button
            type="button"
            class="absolute inset-y-0 end-0 px-3 flex items-center text-ink-secondary hover:text-ink"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="h-4 w-4" :stroke-width="1.5" />
            <Eye v-else class="h-4 w-4" :stroke-width="1.5" />
          </button>
        </div>

        <!-- 4-step strength bar -->
        <div class="grid grid-cols-4 gap-1.5 pt-1" aria-hidden="true">
          <div
            v-for="step in 4"
            :key="step"
            class="h-1.5 rounded-pill transition-colors"
            :class="[
              passwordScore >= step
                ? passwordScore <= 1
                  ? 'bg-danger'
                  : passwordScore === 2
                    ? 'bg-warning'
                    : 'bg-success'
                : 'bg-border'
            ]"
          />
        </div>
      </div>

      <BaseButton type="submit" variant="primary" class="w-full justify-center" :loading="loading">
        <UserPlus class="h-4 w-4" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'إنشاء حسابي المجاني' : 'Create free account' }}</span>
      </BaseButton>
    </form>

    <p class="text-center text-sm text-ink-secondary">
      {{ locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?' }}
      <NuxtLink
        :to="localePath('/login')"
        class="font-semibold text-primary hover:underline inline-flex items-center gap-1 ms-1"
      >
        <span>{{ locale === 'ar' ? 'تسجيل الدخول' : 'Log in' }}</span>
        <ArrowRight class="h-3.5 w-3.5 rtl:-scale-x-100" :stroke-width="1.5" />
      </NuxtLink>
    </p>
  </div>
</template>
