import { MATERIALS_CATALOG } from '~/utils/calc/catalog.js'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = (config.public?.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  const lastmod = '2026-11-04'

  const staticPaths = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/calculator', priority: '0.9', changefreq: 'weekly' },
    { path: '/market', priority: '0.9', changefreq: 'daily' },
    { path: '/budget', priority: '0.8', changefreq: 'weekly' },
    { path: '/contractor', priority: '0.8', changefreq: 'weekly' }
  ]

  const entries = []

  for (const item of staticPaths) {
    const enHref = `${siteUrl}${item.path}`
    const arHref = `${siteUrl}/ar${item.path === '/' ? '' : item.path}`
    entries.push({ loc: enHref, lastmod, changefreq: item.changefreq, priority: item.priority })
    entries.push({ loc: arHref, lastmod, changefreq: item.changefreq, priority: item.priority })
  }

  for (const mat of MATERIALS_CATALOG) {
    const updated = (mat.fetched_at || lastmod).slice(0, 10)
    entries.push({
      loc: `${siteUrl}/market/${mat.slug}`,
      lastmod: updated,
      changefreq: 'daily',
      priority: '0.85'
    })
    entries.push({
      loc: `${siteUrl}/ar/market/${mat.slug}`,
      lastmod: updated,
      changefreq: 'daily',
      priority: '0.85'
    })
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      e =>
        `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
    ),
    '</urlset>'
  ].join('\n')

  setResponseHeaders(event, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400'
  })

  return xml
})
