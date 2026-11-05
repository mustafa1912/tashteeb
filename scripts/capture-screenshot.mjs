import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUTPUT_DIR = path.resolve('public/screenshots')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

let browserInstance = null

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }
  return browserInstance
}

/**
 * Capture a screenshot of a route using Puppeteer
 * @param {string} route 
 * @param {string} filename 
 * @param {number} width 
 * @param {number} height 
 */
export async function capture(route, filename, width = 1440, height = 900) {
  const url = `${BASE_URL}${route.startsWith('/') ? route : '/' + route}`
  const outPath = path.join(OUTPUT_DIR, filename)

  const browser = await getBrowser()
  const page = await browser.newPage()

  await page.setViewport({
    width,
    height,
    isMobile: width <= 768,
    hasTouch: width <= 768,
    deviceScaleFactor: 1
  })

  console.log(`Navigating to ${url} (${width}x${height})...`)
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

  // Small delay for any CSS animations or layout settling
  await new Promise(r => setTimeout(r, 800))

  await page.screenshot({ path: outPath, fullPage: false })
  console.log(`Saved screenshot to ${outPath}`)

  await page.close()
  return outPath
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}

// CLI usage
const args = process.argv.slice(2)
if (args.length > 0) {
  const [route, filename, width, height] = args
  capture(
    route,
    filename || 'screenshot.png',
    width ? Number(width) : 1440,
    height ? Number(height) : 900
  ).then(async () => {
    await closeBrowser()
    process.exit(0)
  }).catch(async (err) => {
    console.error(err)
    await closeBrowser()
    process.exit(1)
  })
}
