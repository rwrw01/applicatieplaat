import Papa from 'papaparse'
import type { Applicatie, VeldType } from '@/types'
import { BOOL_WAAR } from './constants'
import { normaliseerApp, getAppWaarde } from './appUtils'

export interface CSVAnalyse {
  headers: string[]
  preview: Record<string, string>[]
}

export function analyseCSV(file: File): Promise<CSVAnalyse> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        const headers = results.meta.fields ?? []
        if (headers.length === 0) {
          reject(new Error('Het bestand lijkt leeg of heeft geen kolomnamen in de eerste rij'))
          return
        }
        resolve({ headers, preview: results.data })
      },
      error: () => reject(new Error('Kon het bestand niet lezen. Controleer of het een geldig CSV-bestand is')),
    })
  })
}

export function detecteerType(waarden: string[]): VeldType {
  const gevuld = waarden.filter(Boolean).map(v => v.trim().toLowerCase())
  if (gevuld.length === 0) return 'tekst'
  const boolWaarden = new Set(['ja', 'nee', 'true', 'false', '1', '0', 'yes', 'no'])
  if (gevuld.every(v => boolWaarden.has(v))) return 'icoon'
  const statusWaarden = new Set(['groen', 'oranje', 'rood', 'laag', 'midden', 'hoog'])
  if (gevuld.every(v => statusWaarden.has(v))) return 'status'
  const datumRegex = /^\d{4}-\d{2}-\d{2}$/
  if (gevuld.every(v => datumRegex.test(v))) return 'datum'
  return 'tekst'
}

export interface KolomConfig {
  subniveauSleutel: string
  naamSleutel: string
  kolomTypes: Record<string, VeldType>
  hoofdniveauSleutel?: string
}

const STANDAARD_CONFIG: KolomConfig = {
  subniveauSleutel: 'cluster',
  naamSleutel: 'naam',
  kolomTypes: {
    saas: 'icoon', complexiteit: 'status', afloopDatum: 'datum',
    omgeving: 'icoon', status: 'status', leverancier: 'tekst',
  },
}

function parseWaarde(waarde: string, sleutel: string): unknown {
  const w = waarde.trim().toLowerCase()
  // Alleen 'saas' wordt als boolean opgeslagen; andere ja/nee-velden blijven string
  if (sleutel === 'saas') return BOOL_WAAR.has(w)
  return waarde.trim()
}

// Case-insensitive lookup: vind de waarde van een CSV-kolom ongeacht hoofd/kleine letters
function rijWaarde(row: Record<string, string>, sleutel: string): string | undefined {
  if (sleutel in row) return row[sleutel]
  const lower = sleutel.toLowerCase()
  const key = Object.keys(row).find(k => k.toLowerCase() === lower)
  return key ? row[key] : undefined
}

// Ingebouwde velden van Applicatie (lowercase sleutelnamen)
export const INGEBOUWDE_SLEUTELS = new Set(['saas', 'complexiteit', 'afloopDatum', 'omgeving', 'status', 'leverancier'])
const INGEBOUWDE_SLEUTELS_LOWER = new Set([...INGEBOUWDE_SLEUTELS].map(s => s.toLowerCase()))

export function parseCSV(file: File, config: KolomConfig = STANDAARD_CONFIG): Promise<Applicatie[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { subniveauSleutel, naamSleutel, kolomTypes, hoofdniveauSleutel } = config
        const applicaties: Applicatie[] = results.data
          .filter(row => !String(row[subniveauSleutel] ?? '').startsWith('#'))
          .map((row, index) => {
            const app: Applicatie = {
              id: `app-${index}`,
              cluster:      rijWaarde(row, subniveauSleutel) ?? '',
              naam:         rijWaarde(row, naamSleutel)      ?? '',
            }
            // Ingebouwde velden alleen toewijzen als ze daadwerkelijk in de CSV staan
            const saasVal = rijWaarde(row, 'saas')
            if (saasVal !== undefined) app.saas = BOOL_WAAR.has(saasVal.toLowerCase())
            const compVal = rijWaarde(row, 'complexiteit')
            if (compVal !== undefined) app.complexiteit = compVal as Applicatie['complexiteit']
            const datumVal = rijWaarde(row, 'afloopDatum')
            if (datumVal !== undefined) app.afloopDatum = datumVal
            const omgVal = rijWaarde(row, 'omgeving')
            if (omgVal !== undefined) app.omgeving = omgVal as Applicatie['omgeving']
            const statusVal = rijWaarde(row, 'status')
            if (statusVal !== undefined) app.status = statusVal as Applicatie['status']
            const levVal = rijWaarde(row, 'leverancier')
            if (levVal !== undefined) app.leverancier = levVal
            if (hoofdniveauSleutel) app[hoofdniveauSleutel] = rijWaarde(row, hoofdniveauSleutel) ?? ''
            const VERBODEN_SLEUTELS = new Set(['__proto__', 'constructor', 'prototype'])
            for (const key of Object.keys(row)) {
              if (VERBODEN_SLEUTELS.has(key)) continue
              if (key === subniveauSleutel || key === naamSleutel) continue
              if (hoofdniveauSleutel && key === hoofdniveauSleutel) continue
              // Sla kolommen over die (case-insensitive) een ingebouwd veld zijn
              if (INGEBOUWDE_SLEUTELS_LOWER.has(key.toLowerCase())) continue
              if (key in app && !kolomTypes[key]) continue
              app[key] = parseWaarde(row[key] ?? '', key)
            }
            return normaliseerApp(app)
          })
        resolve(applicaties)
      },
      error: () => reject(new Error('Kon het bestand niet lezen. Controleer of het een geldig CSV-bestand is')),
    })
  })
}

export function groupBySubniveau(applicaties: Applicatie[], sleutel: string) {
  return applicaties.reduce((acc, app) => {
    const val = String(getAppWaarde(app, sleutel) ?? '')
    if (!acc[val]) acc[val] = []
    acc[val].push(app)
    return acc
  }, {} as Record<string, Applicatie[]>)
}

export function groupByHoofdniveau(applicaties: Applicatie[], subniveauSleutel: string, hoofdniveauSleutel: string) {
  return applicaties.reduce((acc, app) => {
    const hoofd = String(getAppWaarde(app, hoofdniveauSleutel) ?? '')
    const sub   = String(getAppWaarde(app, subniveauSleutel)   ?? '')
    if (!acc[hoofd]) acc[hoofd] = {}
    if (!acc[hoofd][sub]) acc[hoofd][sub] = []
    acc[hoofd][sub].push(app)
    return acc
  }, {} as Record<string, Record<string, Applicatie[]>>)
}