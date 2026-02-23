import { toPng, toJpeg, toSvg } from "html-to-image"
import type { Instellingen, Applicatie } from "@/types"
import { getAppWaarde } from "./appUtils"

function maakStamp(): string {
  const nu = new Date()
  return (
    nu.getFullYear().toString() +
    String(nu.getMonth() + 1).padStart(2, "0") +
    String(nu.getDate()).padStart(2, "0") +
    String(nu.getHours()).padStart(2, "0") +
    String(nu.getMinutes()).padStart(2, "0")
  )
}

function maakBestandsnaam(ext: string): string {
  return `applicatieplaat_${maakStamp()}.${ext}`
}

export function exporteerSessie(instellingen: Instellingen, applicaties: Applicatie[]): void {
  const sessie = { versie: 1, exportDatum: new Date().toISOString(), instellingen, applicaties }
  const blob = new Blob([JSON.stringify(sessie, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `applicatieplaat_sessie_${maakStamp()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Mermaid Markdown export ── */

function sanitizeMermaidId(tekst: string): string {
  return tekst.replace(/[^a-zA-Z0-9_\u00C0-\u024F]/g, '_')
}

function sanitizeMermaidLabel(tekst: string): string {
  return tekst.replace(/"/g, '#quot;')
}

export function genereerMermaidMarkdown(instellingen: Instellingen, applicaties: Applicatie[]): string {
  const { subniveauSleutel, hoofdniveauSleutel } = instellingen
  const regels: string[] = [
    '# Applicatieplaat',
    '',
    `> Geëxporteerd op ${new Date().toLocaleDateString('nl-NL')} — ${applicaties.length} applicaties`,
    '',
    '```mermaid',
    'block-beta',
  ]

  // Groepeer per subniveau
  const clusters: Record<string, Applicatie[]> = {}
  for (const app of applicaties) {
    const sub = String(getAppWaarde(app, subniveauSleutel) ?? 'Overig')
    if (!clusters[sub]) clusters[sub] = []
    clusters[sub].push(app)
  }

  if (hoofdniveauSleutel) {
    // 2-niveau: hoofdniveau → subniveau → apps
    const hoofdgroepen: Record<string, Record<string, Applicatie[]>> = {}
    for (const app of applicaties) {
      const hoofd = String(getAppWaarde(app, hoofdniveauSleutel) ?? 'Overig')
      const sub = String(getAppWaarde(app, subniveauSleutel) ?? 'Overig')
      if (!hoofdgroepen[hoofd]) hoofdgroepen[hoofd] = {}
      if (!hoofdgroepen[hoofd][sub]) hoofdgroepen[hoofd][sub] = []
      hoofdgroepen[hoofd][sub].push(app)
    }

    for (const [hoofdNaam, subs] of Object.entries(hoofdgroepen).sort(([a], [b]) => a.localeCompare(b))) {
      const hoofdId = sanitizeMermaidId(hoofdNaam)
      regels.push(`  block:${hoofdId}`)
      regels.push(`    columns 1`)
      regels.push(`    ${hoofdId}_label["${sanitizeMermaidLabel(hoofdNaam)}"]`)
      for (const [subNaam, apps] of Object.entries(subs).sort(([a], [b]) => a.localeCompare(b))) {
        const subId = sanitizeMermaidId(`${hoofdNaam}_${subNaam}`)
        regels.push(`    block:${subId}`)
        regels.push(`      columns ${Math.min(apps.length, 4)}`)
        regels.push(`      ${subId}_label["${sanitizeMermaidLabel(subNaam)}"]`)
        for (const app of apps) {
          const appId = sanitizeMermaidId(`app_${app.id}`)
          regels.push(`      ${appId}["${sanitizeMermaidLabel(app.naam)}"]`)
        }
        regels.push(`    end`)
      }
      regels.push(`  end`)
    }
  } else {
    // 1-niveau: subniveau → apps
    for (const [subNaam, apps] of Object.entries(clusters).sort(([, a], [, b]) => b.length - a.length)) {
      const subId = sanitizeMermaidId(subNaam)
      regels.push(`  block:${subId}`)
      regels.push(`    columns ${Math.min(apps.length, 4)}`)
      regels.push(`    ${subId}_label["${sanitizeMermaidLabel(subNaam)}"]`)
      for (const app of apps) {
        const appId = sanitizeMermaidId(`app_${app.id}`)
        regels.push(`    ${appId}["${sanitizeMermaidLabel(app.naam)}"]`)
      }
      regels.push(`  end`)
    }
  }

  regels.push('```')
  regels.push('')

  return regels.join('\n')
}

export function exporteerMermaid(instellingen: Instellingen, applicaties: Applicatie[]): void {
  const inhoud = genereerMermaidMarkdown(instellingen, applicaties)
  const blob = new Blob([inhoud], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = maakBestandsnaam("md")
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Afbeelding export ── */

export async function exporteerAfbeelding(element: HTMLElement, formaat: "png" | "jpg" | "svg"): Promise<void> {
  const pixelRatio = 300 / 96
  let dataUrl: string
  if (formaat === "png")      dataUrl = await toPng(element, { pixelRatio })
  else if (formaat === "jpg") dataUrl = await toJpeg(element, { pixelRatio, quality: 0.95 })
  else                        dataUrl = await toSvg(element)
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = maakBestandsnaam(formaat)
  a.click()
}
