import type { Applicatie } from "@/types"

/** Case-insensitive veldwaarde ophalen uit een Applicatie-object.
 *  Probeert eerst exact match (snel), dan case-insensitive fallback. */
export function getAppWaarde(app: Applicatie, sleutel: string): unknown {
  const exact = app[sleutel]
  if (exact !== undefined && exact !== null && exact !== "") return exact
  const lower = sleutel.toLowerCase()
  for (const key of Object.keys(app)) {
    if (key === sleutel) continue
    if (key.toLowerCase() === lower) {
      const val = app[key]
      if (val !== undefined && val !== null && val !== "") return val
    }
  }
  return exact
}

function isLeeg(val: unknown): boolean {
  return val === undefined || val === null || val === ""
}

/** Normaliseer een Applicatie-object: verwijder dubbele keys die alleen in casing
 *  verschillen. Behoudt de key die als eerste voorkomt, maar kiest de niet-lege waarde. */
export function normaliseerApp(app: Applicatie): Applicatie {
  const result: Record<string, unknown> = {}
  const gezien = new Map<string, string>() // lowercase → canonical key
  for (const key of Object.keys(app)) {
    const lower = key.toLowerCase()
    const bestaand = gezien.get(lower)
    if (bestaand) {
      // Bewaar de waarde die niet leeg is
      const oudeWaarde = result[bestaand]
      const nieuweWaarde = app[key]
      if (isLeeg(oudeWaarde) && !isLeeg(nieuweWaarde)) {
        result[bestaand] = nieuweWaarde
      }
    } else {
      gezien.set(lower, key)
      result[key] = app[key]
    }
  }
  return result as Applicatie
}
