import { jsPDF } from "jspdf"
import { toPng } from "html-to-image"
import { maakBestandsnaam } from "./exportUtils"

/* ── Types ── */

export type PapierFormaat = "a4" | "a3"
export type Orientatie = "staand" | "liggend"

interface PaginaSlice {
  yStart: number
  yEind: number
}

/* ── Constanten ── */

const PAPIER_MM: Record<string, { b: number; h: number }> = {
  a4_staand: { b: 210, h: 297 },
  a4_liggend: { b: 297, h: 210 },
  a3_staand: { b: 297, h: 420 },
  a3_liggend: { b: 420, h: 297 },
}

const MARGE_MM = 10
const PIXEL_RATIO = 2

/* ── Hoofdfunctie ── */

export async function exporteerPdf(
  plaatElement: HTMLDivElement,
  formaat: PapierFormaat = "a4",
  orientatie: Orientatie = "liggend",
): Promise<void> {
  const papierSleutel = `${formaat}_${orientatie}`
  const papier = PAPIER_MM[papierSleutel]
  const beschikB = papier.b - 2 * MARGE_MM
  const beschikH = papier.h - 2 * MARGE_MM

  // Schaalfactor: plaat-pixels → PDF-millimeters
  const plaatBreedte = plaatElement.getBoundingClientRect().width
  const schaal = beschikB / plaatBreedte
  const maxHoogtePx = beschikH / schaal

  // 1. Meet alle ondeelbare zones uit de DOM
  const zones = verzamelZones(plaatElement)

  // 2. Merge overlappende zones (2-kolom clusters naast elkaar)
  const gemerged = mergeZones(zones)

  // 3. Bereken veilige knippunten (gaten tussen merged zones)
  const safeBreaks = berekenSafeBreaks(gemerged)

  // 4. Bepaal pagina-slices
  const totaalHoogte = plaatElement.getBoundingClientRect().height
  const slices = berekenPaginaSlices(totaalHoogte, maxHoogtePx, safeBreaks)

  // 5. Render de hele plaat als één grote PNG
  const volledigeDataUrl = await toPng(plaatElement, {
    pixelRatio: PIXEL_RATIO,
    backgroundColor: "white",
  })
  const volledigeAfbeelding = await laadAfbeelding(volledigeDataUrl)

  // 6. Genereer PDF met één slice per pagina
  const pdf = new jsPDF({
    orientation: orientatie === "liggend" ? "landscape" : "portrait",
    unit: "mm",
    format: formaat,
  })

  for (let i = 0; i < slices.length; i++) {
    if (i > 0) pdf.addPage()
    const slice = slices[i]
    const sliceHoogte = slice.yEind - slice.yStart

    const canvas = document.createElement("canvas")
    canvas.width = volledigeAfbeelding.width
    canvas.height = Math.round(sliceHoogte * PIXEL_RATIO)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context niet beschikbaar")

    ctx.drawImage(
      volledigeAfbeelding,
      0,
      Math.round(slice.yStart * PIXEL_RATIO),
      volledigeAfbeelding.width,
      Math.round(sliceHoogte * PIXEL_RATIO),
      0,
      0,
      canvas.width,
      canvas.height,
    )

    const sliceDataUrl = canvas.toDataURL("image/png")
    const hoogteMm = sliceHoogte * schaal
    pdf.addImage(sliceDataUrl, "PNG", MARGE_MM, MARGE_MM, beschikB, hoogteMm)
  }

  pdf.save(maakBestandsnaam("pdf"))
}

/* ── Zone-identificatie ── */

function verzamelZones(plaatElement: HTMLDivElement): [number, number][] {
  const plaatTop = plaatElement.getBoundingClientRect().top
  const zones: [number, number][] = []

  // Legenda
  const legenda = plaatElement.querySelector<HTMLElement>('[data-pdf-blok="legenda"]')
  if (legenda) {
    const r = legenda.getBoundingClientRect()
    zones.push([r.top - plaatTop, r.bottom - plaatTop])
  }

  // Alle individuele clusters (in beide kolommen, in alle organisaties)
  const clusters = plaatElement.querySelectorAll<HTMLElement>('[data-pdf-blok="cluster"]')
  clusters.forEach((cl) => {
    const r = cl.getBoundingClientRect()
    zones.push([r.top - plaatTop, r.bottom - plaatTop])
  })

  // Org-headers: merge met eerstvolgende cluster zodat de header nooit los komt
  const orgs = plaatElement.querySelectorAll<HTMLElement>('[data-pdf-blok="organisatie"]')
  orgs.forEach((org) => {
    const orgRect = org.getBoundingClientRect()
    const eersteCluster = org.querySelector<HTMLElement>('[data-pdf-blok="cluster"]')
    if (eersteCluster) {
      const clRect = eersteCluster.getBoundingClientRect()
      zones.push([orgRect.top - plaatTop, clRect.bottom - plaatTop])
    }
  })

  return zones
}

/* ── Zone-merging ── */

function mergeZones(zones: [number, number][]): [number, number][] {
  if (zones.length === 0) return []

  // Sorteer op start-positie
  const gesorteerd = [...zones].sort((a, b) => a[0] - b[0])
  const gemerged: [number, number][] = [[gesorteerd[0][0], gesorteerd[0][1]]]

  for (let i = 1; i < gesorteerd.length; i++) {
    const vorige = gemerged[gemerged.length - 1]
    const huidige = gesorteerd[i]

    if (huidige[0] <= vorige[1]) {
      // Overlapt of raakt → merge
      vorige[1] = Math.max(vorige[1], huidige[1])
    } else {
      // Nieuw gat → nieuwe zone
      gemerged.push([huidige[0], huidige[1]])
    }
  }

  return gemerged
}

/* ── Safe breaks ── */

function berekenSafeBreaks(gemerged: [number, number][]): number[] {
  const safeBreaks: number[] = []
  for (let i = 0; i < gemerged.length - 1; i++) {
    const gapStart = gemerged[i][1]
    const gapEind = gemerged[i + 1][0]
    safeBreaks.push((gapStart + gapEind) / 2)
  }
  return safeBreaks
}

/* ── Paginering ── */

function berekenPaginaSlices(
  totaalHoogte: number,
  maxHoogte: number,
  safeBreaks: number[],
): PaginaSlice[] {
  const slices: PaginaSlice[] = []
  let paginaStart = 0

  while (paginaStart < totaalHoogte) {
    const doelEind = paginaStart + maxHoogte

    if (doelEind >= totaalHoogte) {
      slices.push({ yStart: paginaStart, yEind: totaalHoogte })
      break
    }

    // Zoek het LAATSTE veilige punt ≤ doelEind (en > paginaStart)
    const kandidaten = safeBreaks.filter((sb) => sb > paginaStart && sb <= doelEind)

    let besteBreak: number
    if (kandidaten.length > 0) {
      besteBreak = Math.max(...kandidaten)
    } else {
      // Geen veilig punt binnen pagina → force-cut op paginagrens
      // (dit snijdt door een cluster, maar de merged zone past niet op 1 pagina)
      besteBreak = doelEind
    }

    slices.push({ yStart: paginaStart, yEind: besteBreak })
    paginaStart = besteBreak
  }

  return slices
}

/* ── Helpers ── */

function laadAfbeelding(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Afbeelding laden mislukt"))
    img.src = dataUrl
  })
}
