// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  typescript: {
    strict: false,
    typeCheck: false
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image'
  ],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js'
  },

  css: [
    '~/assets/css/print.css'
  ],

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Tashteeb (تشطيب) — Apartment Finishing Cost Estimator in Egypt',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;700;800&family=El+Messiri:wght@600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
        }
      ]
    }
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    bundle: {
      optimizeTranslationDirective: false
    },
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales',
    locales: [
      {
        code: 'en',
        language: 'en-EG',
        name: 'English',
        dir: 'ltr',
        file: 'en.json'
      },
      {
        code: 'ar',
        language: 'ar-EG',
        name: 'العربية',
        dir: 'rtl',
        file: 'ar.json'
      }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tashteeb_locale',
      redirectOn: 'root'
    }
  },

  image: {
    domains: ['images.unsplash.com'],
    quality: 82
  },

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    cronSecret: process.env.CRON_SECRET || 'tashteeb-local-cron-secret-change-me',
    priceCsvUrl: process.env.PRICE_CSV_URL || '',
    puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    }
  },

  routeRules: {
    '/market': { swr: 86400 },
    '/market/**': { swr: 86400 },
    '/ar/market': { swr: 86400 },
    '/ar/market/**': { swr: 86400 }
  },

  nitro: {
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      '0 6 * * *': ['prices:daily']
    }
  }
})
