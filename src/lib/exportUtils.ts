import { toPng, toJpeg, toSvg } from "html-to-image"
import type { Instellingen, Applicatie } from "@/types"

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
