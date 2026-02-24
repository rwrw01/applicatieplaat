"use client"
import { useState } from "react"
import type { VeldDefinitie } from "@/types"
import { Cloud, Monitor, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"

const SAMPLE: Record<string, string> = {
  naam: "Applicatienaam",
  saas: "true",
  complexiteit: "laag",
  omgeving: "client",
  afloopDatum: "2026-12-31",
  status: "groen",
  leverancier: "Leverancier BV",
}

function SampleVeld({ veld, isHeader }: { veld: VeldDefinitie; isHeader?: boolean }) {
  // Naam in header: vette tekst
  if (veld.sleutel === "naam" && isHeader) {
    return <span style={{ fontWeight: 600, fontSize: 12, color: "#1f2937" }}>Applicatienaam</span>
  }
  // Status in header: gekleurde stip
  if (veld.sleutel === "status" && isHeader) {
    return <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", flexShrink: 0, marginTop: 2 }} />
  }

  if (veld.type === "tekst") {
    const tekst = SAMPLE[veld.sleutel] ?? veld.label
    return <span style={{ fontSize: 11, color: "#6b7280" }}>{tekst.slice(0, veld.maxLengte ?? 20)}</span>
  }

  if (veld.type === "datum") {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, padding: "2px 6px",
        borderRadius: 4, backgroundColor: "#f9fafb", color: "#6b7280" }}>
        <CheckCircle size={10} />2026-12-31
      </span>
    )
  }

  if (veld.type === "status") {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, padding: "2px 6px",
        borderRadius: 999, backgroundColor: "#f0fdf4", color: "#16a34a", fontWeight: 500 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e", flexShrink: 0 }} />
        Laag
      </span>
    )
  }

  if (veld.type === "icoon") {
    if (veld.sleutel === "saas") {
      return (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 4, backgroundColor: "#eff6ff" }}
          title="SaaS (Cloud)">
          <Cloud size={11} color="#2563eb" />
        </span>
      )
    }
    if (veld.sleutel === "omgeving") {
      return (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 4, backgroundColor: "#faf5ff" }}
          title="Omgeving (Client)">
          <Monitor size={11} color="#7e22ce" />
        </span>
      )
    }
    const kleur = veld.icoonMappings?.[0]?.kleur ?? "#3b82f6"
    return (
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center",
        width: 22, height: 22, borderRadius: 4, backgroundColor: kleur + "22", fontSize: 11, color: kleur }}>
        ◆
      </span>
    )
  }

  return null
}

export default function Legenda({ velden }: { velden: VeldDefinitie[] }) {
  const [ingeklapt, setIngeklapt] = useState(false)

  const zichtbaar = velden.filter(v => v.zichtbaar)
  const naamVeld   = zichtbaar.find(v => v.sleutel === "naam")
  const statusVeld = zichtbaar.find(v => v.sleutel === "status")
  const andereVelden = zichtbaar.filter(v => v.sleutel !== "naam" && v.sleutel !== "status")

  // Volgorde in legenda = visuele volgorde op de kaart: naam, status, dan de rest
  const legendaVolgorde = [
    ...(naamVeld ? [naamVeld] : []),
    ...(statusVeld ? [statusVeld] : []),
    ...andereVelden,
  ]

  return (
    <div data-pdf-blok="legenda" style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: 10,
      marginBottom: 20, overflow: "hidden" }}>

      {/* Header / toggle */}
      <div onClick={() => setIngeklapt(!ingeklapt)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", cursor: "pointer", userSelect: "none",
          borderBottom: ingeklapt ? "none" : "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Legenda applicatiekaart</span>
        {ingeklapt
          ? <ChevronDown size={15} color="#9ca3af" />
          : <ChevronUp size={15} color="#9ca3af" />}
      </div>

      {!ingeklapt && (
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>

          {/* Voorbeeld-kaart */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase",
              letterSpacing: "0.05em", marginBottom: 6 }}>Voorbeeld</p>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #d1d5db",
              padding: "10px 12px", minWidth: 150, maxWidth: 200,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              {/* Naam + status */}
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", gap: 4, marginBottom: 6 }}>
                {naamVeld && <SampleVeld veld={naamVeld} isHeader />}
                {statusVeld && <SampleVeld veld={statusVeld} isHeader />}
              </div>
              {/* Overige velden */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {andereVelden.map(v => <SampleVeld key={v.id} veld={v} />)}
              </div>
            </div>
          </div>

          {/* Genummerde legenda */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase",
              letterSpacing: "0.05em", marginBottom: 6 }}>Velden</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {legendaVolgorde.map((veld, i) => (
                <div key={veld.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#d1d5db", fontWeight: 500,
                    minWidth: 18, textAlign: "right" }}>{i + 1}.</span>
                  <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{veld.label}</span>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center",
                    minWidth: 26 }}>
                    <SampleVeld veld={veld} isHeader={veld.sleutel === "naam" || veld.sleutel === "status"} />
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
