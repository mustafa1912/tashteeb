import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUTPUT_DIR = path.resolve('public/screenshots')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * Capture a screenshot of a route
 * @param {string} route 
 * @param {string} filename 
 * @param {number} width 
 * @param {number} height 
 */
export async function capture(route, filename, width = 1440, height = 900) {
  const url = `${BASE_URL}${route.startsWith('/') ? route : '/' + route}`
  const outPath = path.join(OUTPUT_DIR, filename)

  // Verify URL is responding
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`[WARN] ${url} returned status ${res.status}`)
    }
  } catch (err) {
    console.error(`[ERR] Failed to fetch ${url}:`, err.message)
    throw err
  }

  const args = [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    '--hide-scrollbars',
    `--screenshot=${outPath}`,
    url
  ]

  console.log(`Capturing ${url} (${width}x${height}) -> ${outPath}`)
  await execFileAsync(CHROME_PATH, args, { timeout: 30000 })
  console.log(`Captured: ${filename}`)
  return outPath
}

// If run directly from CLI
const args = process.argv.slice(2)
if (args.length > 0) {
  const [route, filename, width, height] = args
  capture(
    route,
    filename || 'screenshot.png',
    width ? Number(width) : 1440,
    height ? Number(height) : 900
  ).then(() => {
    console.log('Done')
    process.exit(0)
  }).catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
