import type { Applicatie, VeldDefinitie } from "@/types"
import { getIcoonOptie } from "@/lib/iconenBibliotheek"
import { Cloud, Server, Monitor, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface Props {
  app: Applicatie
  velden: VeldDefinitie[]
}

const statusKleur: Record<string, string> = {
  groen: "#22c55e", oranje: "#fb923c", rood: "#ef4444",
  laag: "#22c55e",  midden: "#fb923c", hoog: "#ef4444",
}

const statusBg: Record<string, string> = {
  groen: "#f0fdf4", oranje: "#fff7ed", rood: "#fef2f2",
  laag: "#f0fdf4",  midden: "#fff7ed", hoog: "#fef2f2",
}

const statusTextKleur: Record<string, string> = {
  groen: "#16a34a", oranje: "#ea580c", rood: "#dc2626",
  laag: "#16a34a",  midden: "#ea580c", hoog: "#dc2626",
}

// Standaard icoon mapping voor saas/omgeving
function getStandaardIcoon(waardeStr: string) {
  switch (waardeStr.toLowerCase()) {
    case "true":   return { icoon: <Cloud size={11} />,     label: "SaaS",    kleur: "#2563eb", bg: "#eff6ff" }
    case "false":  return { icoon: <Server size={11} />,    label: "On-prem", kleur: "#4b5563", bg: "#f3f4f6" }
    case "client": return { icoon: <Monitor size={11} />,   label: "Client",  kleur: "#7e22ce", bg: "#faf5ff" }
    case "server": return { icoon: <Server size={11} />,    label: "Server",  kleur: "#1e40af", bg: "#eff6ff" }
    case "beide":  return { icoon: <RefreshCw size={11} />, label: "Beide",   kleur: "#065f46", bg: "#f0fdf4" }
    default: return null
  }
}

function renderIcoonUitBibliotheek(naam: string, kleur: string, size = 11) {
  const optie = getIcoonOptie(naam)
  if (!optie) return null
  if (optie.type === "emoji") return <span style={{ fontSize: size + 2 }}>{optie.emoji}</span>
  if (optie.component) {
    const Icoon = optie.component
    return <Icoon size={size} color={kleur} />
  }
  return null
}

function renderVeld(veld: VeldDefinitie, app: Applicatie) {
  const waarde = app[veld.sleutel]
  if (waarde === undefined || waarde === null || waarde === "") return null
  const waardeStr = String(waarde)

  if (veld.type === "tekst") {
    const tekst = veld.maxLengte && waardeStr.length > veld.maxLengte
      ? waardeStr.slice(0, veld.maxLengte) + "..."
      : waardeStr
    return (
      <span key={veld.id} style={{ fontSize: "11px", color: "#6b7280" }} title={waardeStr}>
        {tekst}
      </span>
    )
  }

  if (veld.type === "datum") {
    const datum = new Date(waardeStr)
    const verlopen = datum < new Date()
    const binnenkort = !verlopen && datum < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    return (
      <span key={veld.id} style={{
        display: "flex", alignItems: "center", gap: "3px",
        fontSize: "11px", padding: "2px 6px", borderRadius: "4px",
        backgroundColor: verlopen ? "#fef2f2" : binnenkort ? "#fff7ed" : "#f9fafb",
        color: verlopen ? "#dc2626" : binnenkort ? "#ea580c" : "#6b7280"
      }}>
        {verlopen ? <XCircle size={10} /> : binnenkort ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
        {waardeStr}
      </span>
    )
  }

  if (veld.type === "status") {
    const key = waardeStr.toLowerCase()
    return (
      <span key={veld.id} style={{
        display: "flex", alignItems: "center", gap: "3px",
        fontSize: "11px", padding: "2px 6px", borderRadius: "999px",
        backgroundColor: statusBg[key] ?? "#f3f4f6",
        color: statusTextKleur[key] ?? "#374151", fontWeight: "500"
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusKleur[key] ?? "#9ca3af", flexShrink: 0 }} />
        {waardeStr}
      </span>
    )
  }

  if (veld.type === "icoon") {
    // Eerst custom mapping proberen
    const customMapping = veld.icoonMappings?.find(m => m.waarde.toLowerCase() === waardeStr.toLowerCase())
    if (customMapping?.icoon) {
      return (
        <span key={veld.id} style={{
          display: "flex", alignItems: "center", gap: "3px",
          fontSize: "11px", padding: "2px 6px", borderRadius: "999px",
          backgroundColor: customMapping.kleur + "20",
          color: customMapping.kleur, fontWeight: "500"
        }} title={`${veld.label}: ${waardeStr}`}>
          {renderIcoonUitBibliotheek(customMapping.icoon, customMapping.kleur)}
          {waardeStr}
        </span>
      )
    }

    // Daarna standaard mapping proberen
    const standaard = getStandaardIcoon(waardeStr)
    if (standaard) {
      return (
        <span key={veld.id} style={{
          display: "flex", alignItems: "center", gap: "3px",
          fontSize: "11px", padding: "2px 6px", borderRadius: "999px",
          backgroundColor: standaard.bg, color: standaard.kleur, fontWeight: "500"
        }}>
          {standaard.icoon} {standaard.label}
        </span>
      )
    }

    // Fallback
    return (
      <span key={veld.id} style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "999px", backgroundColor: "#f3f4f6", color: "#374151" }}>
        {waardeStr}
      </span>
    )
  }

  return null
}

export default function AppKaart({ app, velden }: Props) {
  const zichtbareVelden = velden.filter(v => v.zichtbaar && v.sleutel !== "naam" && v.sleutel !== "status")
  const naamVeld = velden.find(v => v.sleutel === "naam")
  const statusVeld = velden.find(v => v.sleutel === "status" && v.zichtbaar)

  const naamTekst = naamVeld?.maxLengte && app.naam.length > naamVeld.maxLengte
    ? app.naam.slice(0, naamVeld.maxLengte) + "..."
    : app.naam

  return (
    <div style={{
      backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb",
      padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px",
      minWidth: "140px", maxWidth: "200px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
        <span style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937", lineHeight: "1.3" }} title={app.naam}>
          {naamTekst}
        </span>
        {statusVeld && (
          <span style={{
            width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
            backgroundColor: statusKleur[app.status] ?? "#9ca3af"
          }} title={`Status: ${app.status}`} />
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {zichtbareVelden.map(veld => renderVeld(veld, app))}
      </div>
    </div>
  )
}