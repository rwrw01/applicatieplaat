import Papa from 'papaparse'
import type { Applicatie, VeldType } from '@/types'
import { BOOL_WAAR } from './constants'

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
              cluster:      row[subniveauSleutel] ?? '',
              naam:         row[naamSleutel]      ?? '',
              saas:         BOOL_WAAR.has(row['saas']?.toLowerCase() ?? ''),
              complexiteit: (row['complexiteit'] ?? 'laag') as Applicatie['complexiteit'],
              afloopDatum:  row['afloopDatum']  ?? '',
              omgeving:     (row['omgeving']    ?? 'client') as Applicatie['omgeving'],
              status:       (row['status']      ?? 'groen') as Applicatie['status'],
              leverancier:  row['leverancier']  ?? '',
            }
            if (hoofdniveauSleutel) app[hoofdniveauSleutel] = row[hoofdniveauSleutel] ?? ''
            const VERBODEN_SLEUTELS = new Set(['__proto__', 'constructor', 'prototype'])
            for (const key of Object.keys(row)) {
              if (VERBODEN_SLEUTELS.has(key)) continue
              if (key === subniveauSleutel || key === naamSleutel) continue
              if (hoofdniveauSleutel && key === hoofdniveauSleutel) continue
              if (key in app && !kolomTypes[key]) continue
              app[key] = parseWaarde(row[key] ?? '', key)
            }
            return app
          })
        resolve(applicaties)
      },
      error: () => reject(new Error('Kon het bestand niet lezen. Controleer of het een geldig CSV-bestand is')),
    })
  })
}

export function groupBySubniveau(applicaties: Applicatie[], sleutel: string) {
  return applicaties.reduce((acc, app) => {
    const val = String((app as Record<string, unknown>)[sleutel] ?? '')
    if (!acc[val]) acc[val] = []
    acc[val].push(app)
    return acc
  }, {} as Record<string, Applicatie[]>)
}

export function groupByHoofdniveau(applicaties: Applicatie[], subniveauSleutel: string, hoofdniveauSleutel: string) {
  return applicaties.reduce((acc, app) => {
    const hoofd = String((app as Record<string, unknown>)[hoofdniveauSleutel] ?? '')
    const sub   = String((app as Record<string, unknown>)[subniveauSleutel]   ?? '')
    if (!acc[hoofd]) acc[hoofd] = {}
    if (!acc[hoofd][sub]) acc[hoofd][sub] = []
    acc[hoofd][sub].push(app)
    return acc
  }, {} as Record<string, Record<string, Applicatie[]>>)
}