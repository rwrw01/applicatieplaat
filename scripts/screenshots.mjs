import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'help')
const BASE = 'http://localhost:3000'
const VIEWPORT = { width: 1440, height: 900 }

async function wacht(ms) {
  return new Promise(r => setTimeout(r, ms))
}

const browser = await chromium.launch({ headless: true })

async function pagina(url, naam, acties = []) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
  await wacht(600)

  // Voer acties uit
  for (const actie of acties) {
    await actie(page)
    await wacht(500)
  }

  await page.screenshot({ path: path.join(outDir, naam), fullPage: false })
  console.log(`✓ ${naam}`)
  await ctx.close()
}

// 1. Welkomscherm
await pagina('/', 'welkom.png')

// Maak een context met standaard data (klik "Standaardomgeving")
async function metStandaardData(url, naam, acties = []) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await wacht(400)

  // Klik "Standaardomgeving" knop op welkomscherm
  const standaardKnop = page.locator('button:has-text("Standaardomgeving")')
  if (await standaardKnop.isVisible()) {
    await standaardKnop.click()
    await wacht(800)
  }

  if (url !== '/') {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
    await wacht(600)
  }

  for (const actie of acties) {
    await actie(page)
    await wacht(600)
  }

  await page.screenshot({ path: path.join(outDir, naam), fullPage: false })
  console.log(`✓ ${naam}`)
  await ctx.close()
}

// 2. Applicatieplaat (hoofdpagina met demo data)
await metStandaardData('/', 'plaat.png')

// 3. Applicatieplaat met open filterpaneel
await metStandaardData('/', 'plaat-filter.png', [
  async (page) => {
    const filterBtn = page.locator('button').filter({ hasText: /filter/i }).first()
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
    }
  }
])

// 4. Toolbar met Niveau dropdown open
await metStandaardData('/', 'plaat-toolbar.png', [
  async (page) => {
    const niveauBtn = page.locator('button').filter({ hasText: /niveau/i }).first()
    if (await niveauBtn.isVisible()) {
      await niveauBtn.click()
    }
  }
])

// 5. Data invoeren - CSV upload
await metStandaardData('/invoer', 'invoer-csv.png')

// 6. Instellingen
await metStandaardData('/instellingen', 'instellingen.png')

// 7. Help pagina
await metStandaardData('/help', 'help.png')

await browser.close()
console.log('\nKlaar! Screenshots opgeslagen in public/help/')
