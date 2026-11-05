<script setup>
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth'
})

const { locale } = useI18n()
const localePath = useLocalePath()
const { $supabase, $hasSupabase } = useNuxtApp()

useHead(() => ({
  title: locale.value === 'ar' ? 'استعادة كلمة المرور — تشطيب' : 'Reset password — Tashteeb'
}))

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorMessage = ref('')

async function handleResetRequest() {
  errorMessage.value = ''
  if (!email.value.trim()) {
    errorMessage.value =
      locale.value === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email address.'
    return
  }

  loading.value = true
  try {
    if ($hasSupabase && $supabase) {
      const { error } = await $supabase.auth.resetPasswordForEmail(email.value.trim())
      if (error) throw error
    }
    sent.value = true
  } catch (err) {
    errorMessage.value = err?.message || 'Unable to send reset email.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="!sent" class="space-y-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">
          {{ locale === 'ar' ? 'استعادة كلمة المرور' : 'Reset your password' }}
        </h1>
        <p class="text-sm text-ink-secondary">
          {{
            locale === 'ar'
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور.'
              : 'Enter the email address linked to your account and we will send a secure reset link.'
          }}
        </p>
      </div>

      <div
        v-if="errorMessage"
        role="alert"
        class="rounded-control border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-xs sm:text-sm font-medium text-danger"
      >
        {{ errorMessage }}
      </div>

      <form class="space-y-4" @submit.prevent="handleResetRequest">
        <BaseInput
          v-model="email"
          type="email"
          :label="locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'"
          placeholder="ahmed@example.com"
          required
        />

        <BaseButton type="submit" variant="primary" class="w-full justify-center" :loading="loading">
          <Mail class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'إرسال رابط الاستعادة' : 'Send reset instructions' }}</span>
        </BaseButton>
      </form>
    </div>

    <!-- Confirmation State -->
    <div v-else class="rounded-card border border-success/30 bg-success-tint/50 p-6 space-y-4">
      <div class="h-11 w-11 rounded-pill bg-success/15 text-success flex items-center justify-center">
        <CheckCircle2 class="h-6 w-6" :stroke-width="1.5" />
      </div>
      <div class="space-y-1.5">
        <h2 class="text-xl font-bold text-ink">
          {{ locale === 'ar' ? 'راجع بريدك الإلكتروني' : 'Check your inbox' }}
        </h2>
        <p class="text-sm text-ink-secondary">
          {{
            locale === 'ar'
              ? `أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}.`
              : `We sent a password reset link to ${email}.`
          }}
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" @click="sent = false">
        {{ locale === 'ar' ? 'إرسال إلى بريد آخر' : 'Try a different email' }}
      </BaseButton>
    </div>

    <div class="pt-2">
      <NuxtLink
        :to="localePath('/login')"
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft class="h-4 w-4 rtl:-scale-x-100" :stroke-width="1.5" />
        <span>{{ locale === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to log in' }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
