import * as cheerio from 'cheerio'

/**
 * ScraperProvider — Public Egyptian distributor price feed adapter.
 *
 * IMPORTANT LEGAL & ROBOTS COMPLIANCE:
 * 1. Only add public catalog URLs whose `robots.txt` and Terms of Service explicitly permit
 *    automated price indexing.
 * 2. Keep request concurrency = 1 with polite User-Agent identification (`TashteebPriceBot/1.0`).
 * 3. TODO: Populate `SCRAPE_TARGETS` with partner-approved public product URLs & CSS selectors
 *    before enabling live scraping in production.
 */
const SCRAPE_TARGETS = [
  // Example target template (disabled until approved URL is configured):
  // {
  //   slug: 'porcelain-60x60-cleopatra',
  //   url: 'https://approved-supplier.example.eg/products/porcelain-60x60',
  //   priceSelector: '[data-product-price]',
  //   unit: 'm²'
  // }
]

export const scraperProvider = {
  name: 'scraper',
  async fetchPrices() {
    if (!SCRAPE_TARGETS.length) return []

    const results = []
    for (const target of SCRAPE_TARGETS) {
      try {
        const html = await $fetch(target.url, {
          headers: {
            'User-Agent': 'TashteebPriceBot/1.0 (+https://tashteeb.eg/market#methodology)'
          },
          timeout: 8000
        })
        const $ = cheerio.load(String(html || ''))
        const rawText = $(target.priceSelector).first().text().replace(/[^\d.]/g, '')
        const parsedPrice = Number(rawText)
        if (Number.isFinite(parsedPrice) && parsedPrice > 0) {
          results.push({
            slug: target.slug,
            price: Math.round(parsedPrice),
            unit: target.unit,
            source: 'scraper',
            fetched_at: new Date().toISOString()
          })
        }
      } catch {
        // Individual target failures are isolated so the pipeline never crashes
      }
    }

    return results
  }
}
