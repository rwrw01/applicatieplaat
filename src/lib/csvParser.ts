import Papa from 'papaparse'
import type { Applicatie } from '@/types'

export function parseCSV(file: File): Promise<Applicatie[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const applicaties: Applicatie[] = results.data.map((row, index) => ({
          id: `app-${index}`,
          cluster:      row['cluster']      ?? '',
          naam:         row['naam']         ?? '',
          saas:         row['saas']?.toLowerCase() === 'ja',
          complexiteit: (row['complexiteit'] ?? 'laag') as Applicatie['complexiteit'],
          afloopDatum:  row['afloopDatum']  ?? '',
          omgeving:     (row['omgeving']    ?? 'client') as Applicatie['omgeving'],
          status:       (row['status']      ?? 'groen') as Applicatie['status'],
          leverancier:  row['leverancier']  ?? '',
        }))
        resolve(applicaties)
      },
      error: reject,
    })
  })
}

export function groupByClusters(applicaties: Applicatie[]) {
  return applicaties.reduce((acc, app) => {
    if (!acc[app.cluster]) acc[app.cluster] = []
    acc[app.cluster].push(app)
    return acc
  }, {} as Record<string, Applicatie[]>)
}