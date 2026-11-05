<script setup>
import {
  Mail,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
  HardHat,
  UserCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-vue-next'

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
  title: locale.value === 'ar' ? 'تسجيل الدخول — تشطيب' : 'Log in — Tashteeb'
}))

const authMethod = ref('email') // 'email' | 'otp'
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Phone OTP state
const phone = ref('100 482 9100')
const otpSent = ref(false)
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])
const resendCooldown = ref(0)
let cooldownTimer = null

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

function finalizeLogin(profile) {
  authStore.setSessionUser(profile)

  // If guest arrived from "Save & exit" on wizard, save their draft immediately
  if (route.query.saveWizard === '1') {
    wizardStore.hydrate()
    const saved = estimatesStore.createOrUpdateFromWizard(wizardStore, 'in_progress')
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم حفظ المقايسة في حسابك' : 'Estimate saved to your account',
      message: saved.refCode,
      type: 'success'
    })
    navigateTo(localePath(`/estimate/${saved.id}`))
    return
  }

  uiStore.showToast({
    title: locale.value === 'ar' ? `أهلاً بعودتك، ${profile.full_name}` : `Welcome back, ${profile.full_name}`,
    type: 'success'
  })

  const redirectTarget =
    typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : localePath('/my-estimates')

  navigateTo(redirectTarget)
}

async function handleEmailLogin() {
  errorMessage.value = ''
  if (!email.value.trim() || !password.value) {
    errorMessage.value =
      locale.value === 'ar'
        ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
        : 'Please enter both your email address and password.'
    return
  }

  loading.value = true
  try {
    if ($hasSupabase && $supabase) {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      })
      if (error) throw error
      if (data?.user) {
        finalizeLogin({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
          phone: data.user.phone || '+20 100 482 9100',
          governorate: data.user.user_metadata?.governorate || 'cairo',
          role: data.user.user_metadata?.role || 'homeowner',
          preferred_locale: locale.value
        })
        return
      }
    }

    // Seamless local auth mode when Supabase env vars are omitted
    const displayName = email.value
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())

    finalizeLogin({
      id: `usr-${email.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      email: email.value.trim(),
      full_name: displayName || 'Ahmed Hassan',
      phone: '+20 101 234 5678',
      governorate: 'cairo',
      role: email.value.toLowerCase().includes('contractor') ? 'contractor' : 'homeowner',
      preferred_locale: locale.value
    })
  } catch (err) {
    errorMessage.value = err?.message || (locale.value === 'ar' ? 'تعذر تسجيل الدخول.' : 'Unable to sign in.')
  } finally {
    loading.value = false
  }
}

async function sendPhoneOtp() {
  errorMessage.value = ''
  const cleanDigits = phone.value.replace(/\D/g, '')
  if (cleanDigits.length < 9) {
    errorMessage.value =
      locale.value === 'ar'
        ? 'يرجى إدخال رقم موبايل مصري صحيح.'
        : 'Please enter a valid Egyptian mobile number.'
    return
  }

  loading.value = true
  try {
    if ($hasSupabase && $supabase) {
      await $supabase.auth.signInWithOtp({
        phone: `+20${cleanDigits.replace(/^0/, '')}`
      })
    }
    otpSent.value = true
    otpDigits.value = ['4', '8', '2', '9', '1', '0']
    resendCooldown.value = 30
    if (cooldownTimer) clearInterval(cooldownTimer)
    cooldownTimer = setInterval(() => {
      if (resendCooldown.value > 0) resendCooldown.value -= 1
      else clearInterval(cooldownTimer)
    }, 1000)

    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم إرسال كود التحقق' : 'Verification code sent',
      message: locale.value === 'ar' ? 'تم ملء كود التجربة 482910 تلقائياً للتسهيل' : 'Demo OTP 482910 pre-filled for convenience',
      type: 'info'
    })
  } catch (err) {
    errorMessage.value = err?.message || 'Failed to send OTP'
  } finally {
    loading.value = false
  }
}

function onOtpInput(idx, event) {
  const val = String(event.target.value || '').replace(/\D/g, '').slice(-1)
  otpDigits.value[idx] = val
  if (val && idx < 5 && otpInputs.value[idx + 1]) {
    otpInputs.value[idx + 1].focus()
  }
}

function onOtpKeydown(idx, event) {
  if (event.key === 'Backspace' && !otpDigits.value[idx] && idx > 0 && otpInputs.value[idx - 1]) {
    otpInputs.value[idx - 1].focus()
  }
}

async function verifyPhoneOtp() {
  const code = otpDigits.value.join('')
  if (code.length < 6) {
    errorMessage.value =
      locale.value === 'ar' ? 'يرجى إدخال الـ 6 أرقام كاملة.' : 'Please enter all 6 digits.'
    return
  }

  loading.value = true
  try {
    const cleanDigits = phone.value.replace(/\D/g, '').replace(/^0/, '')
    if ($hasSupabase && $supabase) {
      const { data, error } = await $supabase.auth.verifyOtp({
        phone: `+20${cleanDigits}`,
        token: code,
        type: 'sms'
      })
      if (error) throw error
      if (data?.user) {
        finalizeLogin({
          id: data.user.id,
          email: data.user.email || '',
          full_name: 'Phone Verified User',
          phone: `+20 ${cleanDigits}`,
          governorate: 'cairo',
          role: 'homeowner',
          preferred_locale: locale.value
        })
        return
      }
    }

    finalizeLogin({
      id: `usr-phone-${cleanDigits}`,
      email: 'ahmed.hassan@tashteeb.eg',
      full_name: locale.value === 'ar' ? 'أحمد حسن' : 'Ahmed Hassan',
      phone: `+20 ${phone.value.trim()}`,
      governorate: 'cairo',
      role: 'homeowner',
      preferred_locale: locale.value
    })
  } catch (err) {
    errorMessage.value = err?.message || 'Invalid verification code'
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  if ($hasSupabase && $supabase) {
    await $supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${localePath('/my-estimates')}`
      }
    })
    return
  }

  finalizeLogin({
    id: 'usr-google-demo',
    email: 'nadia.mansour@gmail.com',
    full_name: locale.value === 'ar' ? 'نادية منصور' : 'Nadia Mansour',
    phone: '+20 114 820 3300',
    governorate: 'giza',
    role: 'homeowner',
    preferred_locale: locale.value
  })
}

function loginDemoHomeowner() {
  finalizeLogin({
    id: 'demo-homeowner-1',
    email: 'ahmed.hassan@tashteeb.eg',
    full_name: locale.value === 'ar' ? 'أحمد حسن' : 'Ahmed Hassan',
    phone: '+20 100 482 9100',
    governorate: 'cairo',
    role: 'homeowner',
    preferred_locale: locale.value
  })
}

function loginDemoContractor() {
  finalizeLogin({
    id: 'demo-contractor-1',
    email: 'quotes@elmasry-finishing.eg',
    full_name: locale.value === 'ar' ? 'م. كريم المصري' : 'Eng. Karim El Masry',
    phone: '+20 100 482 9100',
    governorate: 'cairo',
    role: 'contractor',
    company_name: 'El Masry Finishing & Architecture',
    preferred_locale: locale.value
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Heading -->
    <div class="space-y-1.5">
      <h1 class="text-2xl sm:text-3xl font-bold text-ink">
        {{ locale === 'ar' ? 'تسجيل الدخول إلى حسابك' : 'Log in to Tashteeb' }}
      </h1>
      <p class="text-sm text-ink-secondary">
        {{
          locale === 'ar'
            ? 'احفظ مقايساتك، قارن الباقات، وصدّر ملفات PDF في أي وقت.'
            : 'Save apartment estimates, track material prices, and export A4 PDFs.'
        }}
      </p>
    </div>

    <!-- Auth Method Switcher -->
    <div class="grid grid-cols-2 gap-1.5 rounded-control bg-sand p-1 border border-border">
      <button
        type="button"
        class="min-h-touch rounded-control px-3 py-2 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
        :class="authMethod === 'email' ? 'bg-surface text-primary shadow-card' : 'text-ink-secondary hover:text-ink'"
        @click="authMethod = 'email'; errorMessage = ''"
      >
        <Mail class="h-4 w-4 shrink-0" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email & password' }}</span>
      </button>

      <button
        type="button"
        class="min-h-touch rounded-control px-3 py-2 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
        :class="authMethod === 'otp' ? 'bg-surface text-primary shadow-card' : 'text-ink-secondary hover:text-ink'"
        @click="authMethod = 'otp'; errorMessage = ''"
      >
        <Smartphone class="h-4 w-4 shrink-0" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'رسالة موبايل OTP' : 'Phone OTP (+20)' }}</span>
      </button>
    </div>

    <!-- Error alert -->
    <div
      v-if="errorMessage"
      role="alert"
      class="rounded-control border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-xs sm:text-sm font-medium text-danger"
    >
      {{ errorMessage }}
    </div>

    <!-- EMAIL & PASSWORD FORM -->
    <form v-if="authMethod === 'email'" class="space-y-4" @submit.prevent="handleEmailLogin">
      <BaseInput
        v-model="email"
        type="email"
        :label="locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'"
        placeholder="ahmed@example.com"
        autocomplete="email"
        required
      />

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="block text-sm font-semibold text-ink">
            {{ locale === 'ar' ? 'كلمة المرور' : 'Password' }}
          </label>
          <NuxtLink
            :to="localePath('/forgot-password')"
            class="text-xs font-semibold text-primary hover:underline"
          >
            {{ locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?' }}
          </NuxtLink>
        </div>

        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
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
      </div>

      <BaseButton type="submit" variant="primary" class="w-full justify-center" :loading="loading">
        <Lock class="h-4 w-4" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'تسجيل الدخول' : 'Log in' }}</span>
      </BaseButton>
    </form>

    <!-- PHONE OTP FORM -->
    <div v-else class="space-y-4">
      <div v-if="!otpSent" class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-ink">
            {{ locale === 'ar' ? 'رقم الموبايل المصري' : 'Egyptian mobile number' }}
          </label>
          <div class="flex items-stretch gap-2" dir="ltr">
            <span class="inline-flex items-center rounded-control border border-border bg-sand px-3 text-sm font-semibold text-ink tabular-price">
              🇪🇬 +20
            </span>
            <input
              v-model="phone"
              type="tel"
              inputmode="tel"
              placeholder="100 482 9100"
              class="flex-1 min-h-touch rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink tabular-price focus:border-primary focus:outline-none"
            >
          </div>
          <p class="text-xs text-ink-secondary">
            {{ locale === 'ar' ? 'سنرسل كود تحقق مكون من 6 أرقام عبر رسالة قصيرة.' : 'We will text a 6-digit one-time verification code.' }}
          </p>
        </div>

        <BaseButton variant="primary" class="w-full justify-center" :loading="loading" @click="sendPhoneOtp">
          <Smartphone class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'إرسال كود التحقق' : 'Send 6-digit OTP' }}</span>
        </BaseButton>
      </div>

      <!-- 6-digit OTP Entry -->
      <div v-else class="space-y-4">
        <div class="rounded-control bg-primary-tint/50 border border-primary/20 px-3.5 py-2.5 flex items-center justify-between text-xs">
          <span class="text-ink">
            {{ locale === 'ar' ? 'تم الإرسال إلى' : 'Code sent to' }}
            <bdi class="font-bold text-primary ms-1">+20 {{ phone }}</bdi>
          </span>
          <button type="button" class="font-semibold text-primary hover:underline" @click="otpSent = false">
            {{ locale === 'ar' ? 'تغيير الرقم' : 'Change' }}
          </button>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-ink">
            {{ locale === 'ar' ? 'أدخل كود التحقق (6 أرقام)' : 'Enter 6-digit verification code' }}
          </label>
          <div class="grid grid-cols-6 gap-2" dir="ltr">
            <input
              v-for="(_, idx) in otpDigits"
              :key="idx"
              :ref="el => { if (el) otpInputs[idx] = el }"
              :value="otpDigits[idx]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              :aria-label="`Digit ${idx + 1}`"
              class="min-h-touch h-12 rounded-control border border-border bg-surface text-center text-lg font-bold text-ink tabular-price focus:border-primary focus:outline-none"
              @input="onOtpInput(idx, $event)"
              @keydown="onOtpKeydown(idx, $event)"
            >
          </div>
        </div>

        <BaseButton variant="primary" class="w-full justify-center" :loading="loading" @click="verifyPhoneOtp">
          <CheckCircle2 class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تأكيد الدخول' : 'Verify & log in' }}</span>
        </BaseButton>

        <div class="text-center text-xs text-ink-secondary">
          <span v-if="resendCooldown > 0">
            {{ locale === 'ar' ? `إعادة الإرسال متاحة خلال ${resendCooldown} ثانية` : `Resend code in ${resendCooldown}s` }}
          </span>
          <button v-else type="button" class="font-semibold text-primary hover:underline" @click="sendPhoneOtp">
            {{ locale === 'ar' ? 'إعادة إرسال الكود' : 'Resend OTP code' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="relative flex items-center py-1">
      <div class="flex-grow border-t border-border" />
      <span class="mx-3 shrink-0 text-xs font-medium text-ink-muted uppercase">
        {{ locale === 'ar' ? 'أو المتابعة عبر' : 'or continue with' }}
      </span>
      <div class="flex-grow border-t border-border" />
    </div>

    <!-- Google OAuth -->
    <button
      type="button"
      class="w-full min-h-touch rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sand transition-colors inline-flex items-center justify-center gap-2.5"
      @click="handleGoogleLogin"
    >
      <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
      </svg>
      <span>{{ locale === 'ar' ? 'المتابعة باستخدام Google' : 'Continue with Google' }}</span>
    </button>

    <!-- Instant Demo Access Card -->
    <div class="rounded-card border border-border bg-sand/70 p-4 space-y-3">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <Sparkles class="h-3.5 w-3.5 shrink-0" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'دخول تجريبي سريع بنقرة واحدة' : '1-Click Demo Accounts' }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          class="min-h-touch rounded-control border border-border bg-surface px-3 py-2 text-start hover:border-primary transition-colors flex items-center gap-2.5"
          @click="loginDemoHomeowner"
        >
          <UserCheck class="h-4 w-4 text-primary shrink-0" :stroke-width="1.5" />
          <div class="min-w-0">
            <p class="text-xs font-bold text-ink truncate">{{ locale === 'ar' ? 'مالك وحدة' : 'Homeowner' }}</p>
            <p class="text-xs text-ink-secondary truncate">{{ locale === 'ar' ? 'أحمد حسن (3 مقايسات)' : 'Ahmed (3 estimates)' }}</p>
          </div>
        </button>

        <button
          type="button"
          class="min-h-touch rounded-control border border-border bg-surface px-3 py-2 text-start hover:border-primary transition-colors flex items-center gap-2.5"
          @click="loginDemoContractor"
        >
          <HardHat class="h-4 w-4 text-accent shrink-0" :stroke-width="1.5" />
          <div class="min-w-0">
            <p class="text-xs font-bold text-ink truncate">{{ locale === 'ar' ? 'مهندس / مقاول' : 'Contractor' }}</p>
            <p class="text-xs text-ink-secondary truncate">{{ locale === 'ar' ? 'المصري للتشطيبات' : 'El Masry Finishing' }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Footer link -->
    <p class="text-center text-sm text-ink-secondary">
      {{ locale === 'ar' ? 'ليس لديك حساب بعد؟' : "Don't have an account?" }}
      <NuxtLink
        :to="localePath('/signup')"
        class="font-semibold text-primary hover:underline inline-flex items-center gap-1 ms-1"
      >
        <span>{{ locale === 'ar' ? 'إنشاء حساب مجاني' : 'Sign up free' }}</span>
        <ArrowRight class="h-3.5 w-3.5 rtl:-scale-x-100" :stroke-width="1.5" />
      </NuxtLink>
    </p>
  </div>
</template>
