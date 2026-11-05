import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const VALID_TYPES = new Set(['estimate', 'shopping-list', 'quotation', 'compare'])

const CANDIDATE_BROWSERS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium'
]

function resolveBrowserExecutable(configuredPath) {
  if (configuredPath && fs.existsSync(configuredPath)) return configuredPath
  return CANDIDATE_BROWSERS.find(p => fs.existsSync(p)) || null
}

export default defineEventHandler(async (event) => {
  const type = getRouterParam(event, 'type')
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!VALID_TYPES.has(type) || !id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid PDF document type or ID' })
  }

  const config = useRuntimeConfig(event)
  const executablePath = resolveBrowserExecutable(config.puppeteerExecutablePath)

  if (!executablePath) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Chromium executable not found. Set PUPPETEER_EXECUTABLE_PATH in .env.'
    })
  }

  const reqHost = getRequestHost(event) || 'localhost:3000'
  const protocol = getRequestProtocol(event) || 'http'
  const origin = `${protocol}://${reqHost}`
  const langPrefix = query.lang === 'ar' ? '/ar' : ''

  const forwardParams = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (k !== 'lang' && v !== undefined && v !== null) {
      forwardParams.set(k, String(v))
    }
  }
  const qs = forwardParams.toString()
  const printUrl = `${origin}${langPrefix}/print/${type}/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`

  let browser = null
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 960, height: 1200 })
    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '10mm',
        bottom: '12mm',
        left: '10mm'
      }
    })

    const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '')
    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tashteeb-${type}-${safeId}.pdf"`,
      'Cache-Control': 'no-store'
    })

    return Buffer.from(pdfBytes)
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
    }
  }
})
