<script setup>
import {
  User,
  Sliders,
  HardHat,
  Bell,
  Shield,
  AlertTriangle,
  Upload,
  Check,
  LogOut
} from 'lucide-vue-next'
import { GOVERNORATES, PACKAGES } from '~/utils/calc/config.js'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const { locale, setLocale } = useI18n()
const localePath = useLocalePath()

const authStore = useAuthStore()
const contractorStore = useContractorStore()
const estimatesStore = useEstimatesStore()
const wizardStore = useWizardStore()
const uiStore = useUiStore()

useHead(() => ({
  title: locale.value === 'ar' ? 'الإعدادات — تشطيب' : 'Account settings — Tashteeb'
}))

// Profile fields
const fullName = ref('')
const email = ref('')
const phone = ref('')
const governorate = ref('cairo')

// Preferences
const preferredLang = ref(locale.value)
const defaultPackage = ref('standard')
const defaultContingency = ref(12)

// Notifications
const notifyDailyDigest = ref(true)
const notifyWatchlistSpikes = ref(true)
const notifyWhatsappQuotes = ref(false)

// Security
const currentPassword = ref('')
const newPassword = ref('')

onMounted(() => {
  authStore.hydrate()
  contractorStore.hydrate()
  if (authStore.user) {
    fullName.value = authStore.user.full_name || ''
    email.value = authStore.user.email || ''
    phone.value = authStore.user.phone || '+20 100 482 9100'
    governorate.value = authStore.user.governorate || 'cairo'
    preferredLang.value = authStore.user.preferred_locale || locale.value
  }
})

const govOptions = computed(() =>
  GOVERNORATES.map(g => ({
    value: g.code,
    label: locale.value === 'ar' ? g.label_ar : g.label_en
  }))
)

const pkgOptions = computed(() =>
  Object.values(PACKAGES).map(p => ({
    value: p.key,
    label: locale.value === 'ar' ? p.label_ar : p.label_en
  }))
)

function saveProfile() {
  authStore.updateProfile({
    full_name: fullName.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    governorate: governorate.value
  })
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم حفظ البيانات الشخصية' : 'Profile saved',
    type: 'success'
  })
}

async function savePreferences() {
  authStore.updateProfile({
    preferred_locale: preferredLang.value,
    default_package: defaultPackage.value,
    default_contingency: defaultContingency.value
  })
  wizardStore.contingencyPct = defaultContingency.value / 100
  if (preferredLang.value !== locale.value) {
    await setLocale(preferredLang.value)
  }
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم حفظ التفضيلات' : 'Preferences updated',
    type: 'success'
  })
}

function handleLogoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    contractorStore.companyProfile.logoDataUrl = String(reader.result || '')
    contractorStore.persist()
  }
  reader.readAsDataURL(file)
}

function saveContractorProfile() {
  contractorStore.persist()
  authStore.updateProfile({ role: 'contractor', company_name: contractorStore.companyProfile.companyName })
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم حفظ بيانات المكتب الهندسي' : 'Contractor profile saved',
    type: 'success'
  })
}

function saveNotifications() {
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم تحديث تفضيلات التنبيهات' : 'Notification settings saved',
    type: 'success'
  })
}

function saveSecurityPassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    uiStore.showToast({
      title: locale.value === 'ar' ? 'يرجى إدخال كلمة مرور من 6 أحرف على الأقل' : 'Password must be at least 6 characters',
      type: 'error'
    })
    return
  }
  currentPassword.value = ''
  newPassword.value = ''
  uiStore.showToast({
    title: locale.value === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated',
    type: 'success'
  })
}

function handleSignOut() {
  authStore.logout()
  navigateTo(localePath('/'))
}

async function handleDeleteAccount() {
  const confirmed = await uiStore.askConfirm({
    title: locale.value === 'ar' ? 'حذف الحساب وكافة المقايسات نهائياً' : 'Permanently delete your account',
    message:
      locale.value === 'ar'
        ? 'سيؤدي هذا الإجراء إلى مسح حسابك وجميع المقايسات المحفوظة وعروض الأسعار نهائياً. اكتب DELETE للتأكيد.'
        : 'This will permanently erase your account, saved estimates, watchlists, and contractor profile. Type DELETE below to confirm.',
    confirmText: locale.value === 'ar' ? 'حذف الحساب نهائياً' : 'Permanently delete account',
    cancelText: locale.value === 'ar' ? 'إلغاء' : 'Cancel',
    variant: 'danger',
    requireTypedText: 'DELETE'
  })

  if (confirmed) {
    if (import.meta.client) {
      localStorage.removeItem('tashteeb_saved_estimates_v1')
      localStorage.removeItem('tashteeb_wizard_v1')
      localStorage.removeItem('tashteeb_contractor_v1')
    }
    estimatesStore.hydrated = false
    authStore.logout()
    uiStore.showToast({
      title: locale.value === 'ar' ? 'تم حذف الحساب بنجاح' : 'Account deleted',
      type: 'info'
    })
    navigateTo(localePath('/'))
  }
}

const navSections = computed(() => [
  { id: 'profile', icon: User, label: locale.value === 'ar' ? 'الملف الشخصي' : 'Profile' },
  { id: 'preferences', icon: Sliders, label: locale.value === 'ar' ? 'التفضيلات والحسابات' : 'Preferences' },
  { id: 'contractor', icon: HardHat, label: locale.value === 'ar' ? 'ملف المقاول / المكتب' : 'Contractor profile' },
  { id: 'notifications', icon: Bell, label: locale.value === 'ar' ? 'التنبيهات والأسعار' : 'Notifications' },
  { id: 'security', icon: Shield, label: locale.value === 'ar' ? 'الأمان والجلسات' : 'Security' },
  { id: 'danger', icon: AlertTriangle, label: locale.value === 'ar' ? 'منطقة الخطر' : 'Danger zone' }
])
</script>

<template>
  <div class="shell py-8 sm:py-12">
    <div v-if="!authStore.initialized" class="space-y-6">
      <SkeletonBlock class="h-10 w-56" />
      <SkeletonBlock class="h-64 rounded-card" />
    </div>

    <div v-else class="space-y-8">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink">
          {{ locale === 'ar' ? 'إعدادات الحساب' : 'Account settings' }}
        </h1>
        <p class="text-sm text-ink-secondary">
          {{
            locale === 'ar'
              ? 'إدارة بياناتك الشخصية، تفضيلات التسعير، وهوية مكتب التشطيبات لعروض الأسعار.'
              : 'Manage your profile, default calculation assumptions, price alerts, and contractor branding.'
          }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Sticky Sidebar Navigation -->
        <nav class="lg:col-span-3 lg:sticky lg:top-24 rounded-card border border-border bg-surface p-2 shadow-card flex lg:flex-col gap-1 overflow-x-auto">
          <a
            v-for="sec in navSections"
            :key="sec.id"
            :href="`#${sec.id}`"
            class="min-h-touch px-3.5 py-2 rounded-control text-sm font-semibold inline-flex items-center gap-2.5 whitespace-nowrap transition-colors"
            :class="sec.id === 'danger' ? 'text-danger hover:bg-danger-tint' : 'text-ink-secondary hover:bg-sand hover:text-ink'"
          >
            <component :is="sec.icon" class="h-4 w-4 shrink-0" :stroke-width="1.5" />
            <span>{{ sec.label }}</span>
          </a>
        </nav>

        <!-- Settings Sections -->
        <div class="lg:col-span-9 space-y-6">
          <!-- 1. PROFILE -->
          <section id="profile" class="rounded-card border border-border bg-surface p-6 shadow-card space-y-5 scroll-mt-24">
            <div class="border-b border-border pb-3">
              <h2 class="text-lg font-bold text-ink">{{ locale === 'ar' ? '1. البيانات الشخصية' : '1. Personal profile' }}</h2>
              <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'تظهر هذه البيانات على حسابك ومقايساتك الخاصة.' : 'Used across your saved estimates and shared links.' }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model="fullName" :label="locale === 'ar' ? 'الاسم بالكامل' : 'Full name'" />
              <BaseInput v-model="email" type="email" :label="locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'" />
              <BaseInput v-model="phone" :label="locale === 'ar' ? 'رقم الموبايل' : 'Mobile number'" ltr />
              <SelectField v-model="governorate" :label="locale === 'ar' ? 'المحافظة الافتراضية' : 'Default governorate'" :options="govOptions" />
            </div>

            <div class="flex justify-end">
              <BaseButton variant="primary" size="sm" @click="saveProfile">
                <Check class="h-4 w-4" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'حفظ البيانات' : 'Save profile' }}</span>
              </BaseButton>
            </div>
          </section>

          <!-- 2. PREFERENCES -->
          <section id="preferences" class="rounded-card border border-border bg-surface p-6 shadow-card space-y-5 scroll-mt-24">
            <div class="border-b border-border pb-3">
              <h2 class="text-lg font-bold text-ink">{{ locale === 'ar' ? '2. تفضيلات اللغة والحاسبة' : '2. Language & calculator defaults' }}</h2>
              <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'اضبط لغة الواجهة ونسبة الطوارئ الافتراضية للمقايسات الجديدة.' : 'Configure your default UI language, finishing tier, and contingency buffer.' }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField
                v-model="preferredLang"
                :label="locale === 'ar' ? 'لغة الواجهة' : 'Interface language'"
                :options="[
                  { value: 'en', label: 'English (LTR)' },
                  { value: 'ar', label: 'العربية (RTL)' }
                ]"
              />
              <SelectField
                v-model="defaultPackage"
                :label="locale === 'ar' ? 'الباقة الافتراضية' : 'Default package'"
                :options="pkgOptions"
              />
              <BaseInput
                v-model="defaultContingency"
                type="number"
                :min="10"
                :max="20"
                :label="locale === 'ar' ? 'نسبة الطوارئ' : 'Default contingency'"
                suffix="%"
              />
            </div>

            <div class="flex justify-end">
              <BaseButton variant="primary" size="sm" @click="savePreferences">
                <Check class="h-4 w-4" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'حفظ التفضيلات' : 'Save preferences' }}</span>
              </BaseButton>
            </div>
          </section>

          <!-- 3. CONTRACTOR PROFILE -->
          <section id="contractor" class="rounded-card border border-border bg-surface p-6 shadow-card space-y-5 scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h2 class="text-lg font-bold text-ink">{{ locale === 'ar' ? '3. هوية المكتب الهندسي / المقاول' : '3. Contractor & quotation branding' }}</h2>
                <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'تظهر تلقائياً على ترويسة عروض الأسعار للعملاء (PDF).' : 'Appears on the letterhead of client PDF quotations built in Contractor Mode.' }}</p>
              </div>
              <NuxtLink :to="localePath('/contractor')" class="text-xs font-semibold text-primary hover:underline">
                {{ locale === 'ar' ? 'فتح مساحة المقاول ←' : 'Open Contractor Workspace →' }}
              </NuxtLink>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput
                v-model="contractorStore.companyProfile.companyName"
                :label="locale === 'ar' ? 'اسم الشركة (بالإنجليزية)' : 'Company name (EN)'"
              />
              <BaseInput
                v-model="contractorStore.companyProfile.companyNameAr"
                :label="locale === 'ar' ? 'اسم الشركة (بالعربية)' : 'Company name (AR)'"
              />
              <BaseInput
                v-model="contractorStore.companyProfile.engineerName"
                :label="locale === 'ar' ? 'اسم المهندس المسؤول' : 'Lead engineer / signatory'"
              />
              <BaseInput
                v-model="contractorStore.companyProfile.taxCard"
                :label="locale === 'ar' ? 'رقم البطاقة الضريبية / السجل' : 'Tax card / CR number'"
                ltr
              />
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4 pt-1">
              <label class="inline-flex items-center gap-2.5 cursor-pointer rounded-control border border-border bg-sand/70 px-3.5 py-2 text-xs font-semibold text-ink hover:border-primary">
                <Upload class="h-4 w-4 text-primary" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'رفع شعار الشركة (PNG/SVG)' : 'Upload company logo (PNG/SVG)' }}</span>
                <input type="file" accept="image/*" class="sr-only" @change="handleLogoUpload">
              </label>

              <BaseButton variant="primary" size="sm" @click="saveContractorProfile">
                <Check class="h-4 w-4" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'حفظ هوية الشركة' : 'Save contractor branding' }}</span>
              </BaseButton>
            </div>
          </section>

          <!-- 4. NOTIFICATIONS -->
          <section id="notifications" class="rounded-card border border-border bg-surface p-6 shadow-card space-y-4 scroll-mt-24">
            <div class="border-b border-border pb-3">
              <h2 class="text-lg font-bold text-ink">{{ locale === 'ar' ? '4. تنبيهات حركة الأسعار' : '4. Market price notifications' }}</h2>
              <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'تحكم في إشعارات تغير أسعار خامات التشطيب التي تتابعها.' : 'Choose when we notify you about Egyptian building material price movements.' }}</p>
            </div>

            <label class="flex items-start justify-between gap-4 py-2 cursor-pointer">
              <div>
                <p class="text-sm font-semibold text-ink">{{ locale === 'ar' ? 'تنبيه القفزات السعرية لقائمة المتابعة (> 5%)' : 'Watchlist price spike alerts (> 5% move)' }}</p>
                <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'إشعار فوري عند تحرك سعر بورسلين أو سلك أو دهان تتابعه.' : 'Immediate email when any starred material moves more than 5%.' }}</p>
              </div>
              <input v-model="notifyWatchlistSpikes" type="checkbox" class="mt-1 h-5 w-5 accent-primary">
            </label>

            <label class="flex items-start justify-between gap-4 py-2 cursor-pointer border-t border-border">
              <div>
                <p class="text-sm font-semibold text-ink">{{ locale === 'ar' ? 'الملخص الأسبوعي لسوق الخامات' : 'Weekly Egyptian price market digest' }}</p>
                <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'ملخص كل أحد بأبرز الخامات المرتفعة والمنخفضة.' : 'Every Sunday morning summary of top risers & fallers.' }}</p>
              </div>
              <input v-model="notifyDailyDigest" type="checkbox" class="mt-1 h-5 w-5 accent-primary">
            </label>

            <label class="flex items-start justify-between gap-4 py-2 cursor-pointer border-t border-border">
              <div>
                <p class="text-sm font-semibold text-ink">{{ locale === 'ar' ? 'تأكيد فتح روابط العروض عبر واتساب' : 'Shared estimate & quotation view alerts' }}</p>
                <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'إشعار عند فتح العميل لرابط المقايسة المشترك.' : 'Notify when a client opens your shared /s/ estimate link.' }}</p>
              </div>
              <input v-model="notifyWhatsappQuotes" type="checkbox" class="mt-1 h-5 w-5 accent-primary">
            </label>

            <div class="flex justify-end pt-2">
              <BaseButton variant="secondary" size="sm" @click="saveNotifications">
                {{ locale === 'ar' ? 'حفظ التنبيهات' : 'Update notifications' }}
              </BaseButton>
            </div>
          </section>

          <!-- 5. SECURITY -->
          <section id="security" class="rounded-card border border-border bg-surface p-6 shadow-card space-y-5 scroll-mt-24">
            <div class="border-b border-border pb-3 flex items-center justify-between gap-2">
              <div>
                <h2 class="text-lg font-bold text-ink">{{ locale === 'ar' ? '5. الأمان وكلمة المرور' : '5. Security & active session' }}</h2>
                <p class="text-xs text-ink-secondary">{{ locale === 'ar' ? 'قم بتحديث كلمة المرور أو تسجيل الخروج من هذا الجهاز.' : 'Change your account password or sign out of this browser.' }}</p>
              </div>
              <span class="rounded-pill bg-success-tint px-2.5 py-1 text-xs font-semibold text-success">
                {{ locale === 'ar' ? 'جلسة نشطة' : 'Active session' }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput v-model="currentPassword" type="password" :label="locale === 'ar' ? 'كلمة المرور الحالية' : 'Current password'" placeholder="••••••••" />
              <BaseInput v-model="newPassword" type="password" :label="locale === 'ar' ? 'كلمة المرور الجديدة' : 'New password'" placeholder="••••••••" />
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <BaseButton variant="ghost" size="sm" @click="handleSignOut">
                <LogOut class="h-4 w-4" :stroke-width="1.5" />
                <span>{{ locale === 'ar' ? 'تسجيل الخروج' : 'Sign out' }}</span>
              </BaseButton>

              <BaseButton variant="secondary" size="sm" @click="saveSecurityPassword">
                {{ locale === 'ar' ? 'تحديث كلمة المرور' : 'Update password' }}
              </BaseButton>
            </div>
          </section>

          <!-- 6. DANGER ZONE -->
          <section id="danger" class="rounded-card border border-danger/40 bg-danger-tint/35 p-6 space-y-4 scroll-mt-24">
            <div>
              <h2 class="text-lg font-bold text-danger">
                {{ locale === 'ar' ? '6. منطقة الخطر — حذف الحساب' : '6. Danger zone' }}
              </h2>
              <p class="text-xs sm:text-sm text-ink-secondary mt-1">
                {{
                  locale === 'ar'
                    ? 'حذف حسابك سيؤدي إلى إزالة كافة المقايسات المحفوظة والروابط المشتركة نهائياً ولا يمكن التراجع عنه.'
                    : 'Permanently delete your account, saved apartment estimates, and shared links. This action cannot be undone.'
                }}
              </p>
            </div>

            <div>
              <BaseButton variant="danger" size="sm" @click="handleDeleteAccount">
                {{ locale === 'ar' ? 'حذف حسابي نهائياً...' : 'Delete account & data...' }}
              </BaseButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
