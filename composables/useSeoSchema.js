export function useSeoSchema(options) {
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  const resolved = computed(() => (typeof options === 'function' ? options() : unref(options)))

  useHead(() => {
    const opts = resolved.value || {}
    const siteUrl = (config.public?.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
    const cleanPath = (opts.path || '/').startsWith('/') ? opts.path : `/${opts.path}`
    const enUrl = `${siteUrl}${cleanPath}`
    const arUrl = `${siteUrl}/ar${cleanPath === '/' ? '' : cleanPath}`
    const canonicalUrl = locale.value === 'ar' ? arUrl : enUrl

    const schemas = Array.isArray(opts.jsonLd)
      ? opts.jsonLd.filter(Boolean)
      : opts.jsonLd
        ? [opts.jsonLd]
        : []

    return {
      title: opts.title,
      link: [
        { rel: 'canonical', href: canonicalUrl },
        { rel: 'alternate', hreflang: 'en-EG', href: enUrl },
        { rel: 'alternate', hreflang: 'ar-EG', href: arUrl },
        { rel: 'alternate', hreflang: 'x-default', href: enUrl }
      ],
      meta: [
        { name: 'description', content: opts.description || '' },
        { property: 'og:title', content: opts.title || 'Tashteeb' },
        { property: 'og:description', content: opts.description || '' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:type', content: opts.ogType || 'website' },
        { property: 'og:site_name', content: 'Tashteeb (تشطيب)' },
        { property: 'og:locale', content: locale.value === 'ar' ? 'ar_EG' : 'en_EG' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: opts.title || 'Tashteeb' },
        { name: 'twitter:description', content: opts.description || '' }
      ],
      script: schemas.map((schemaObj, idx) => ({
        key: `jsonld-${idx}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schemaObj)
      }))
    }
  })
}
