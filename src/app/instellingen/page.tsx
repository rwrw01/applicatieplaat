"use client"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import type { VeldDefinitie, IcoonMapping, Instellingen } from "@/types"
import WeergaveSection from "@/components/instellingen/WeergaveSection"
import VeldRij from "@/components/instellingen/VeldRij"
import OpslaanBalk from "@/components/instellingen/OpslaanBalk"

const MAX_VELDEN = 12
const STANDAARD_MAPPINGS: IcoonMapping[] = [
  { waarde: "", icoon: "", kleur: "#3b82f6" },
  { waarde: "", icoon: "", kleur: "#22c55e" },
  { waarde: "", icoon: "", kleur: "#ef4444" },
]

function kapitaliseer(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const vergrendeldRijStijl: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "40px 1fr 1fr 120px 100px 28px 40px",
  gap: "8px", padding: "10px 12px", alignItems: "center",
  border: "1px solid #e5e7eb", borderRadius: "8px",
  backgroundColor: "#f3f4f6",
}

const vergrendeldTekstStijl: React.CSSProperties = {
  fontSize: "12px", color: "#9ca3af", padding: "4px 0",
}

export default function InstellingenPage() {
  const { instellingen, setInstellingen, applicaties } = useStore()

  const [lokaal, setLokaal] = useState<Instellingen>(() => {
    const bestaandeSleutelsLower = new Set(instellingen.velden.map(v => v.sleutel.toLowerCase()))
    const uitgesloten = new Set(["id"])
    const gezien = new Set<string>()
    const extraVelden: VeldDefinitie[] = applicaties
      .flatMap(a => Object.keys(a))
      .filter(k => {
        const lower = k.toLowerCase()
        if (uitgesloten.has(lower)) return false
        if (bestaandeSleutelsLower.has(lower)) return false
        if (gezien.has(lower)) return false
        gezien.add(lower)
        return true
      })
      .sort()
      .map(sleutel => ({
        id: `auto_${sleutel}`,
        label: kapitaliseer(sleutel),
        sleutel,
        type: "tekst" as const,
        zichtbaar: false,
        maxLengte: 20,
      }))
    return { ...instellingen, velden: [...instellingen.velden, ...extraVelden] }
  })

  // Hercan velden wanneer applicaties veranderen (bijv. na laden uit localStorage of CSV-upload)
  useEffect(() => {
    if (applicaties.length === 0) return
    setLokaal(prev => {
      const bestaandeSleutelsLower = new Set(prev.velden.map(v => v.sleutel.toLowerCase()))
      const gezien = new Set<string>()
      const extraVelden: VeldDefinitie[] = applicaties
        .flatMap(a => Object.keys(a))
        .filter(k => {
          const lower = k.toLowerCase()
          if (lower === "id") return false
          if (bestaandeSleutelsLower.has(lower)) return false
          if (gezien.has(lower)) return false
          gezien.add(lower)
          return true
        })
        .sort()
        .map(sleutel => ({
          id: `auto_${sleutel}`,
          label: kapitaliseer(sleutel),
          sleutel,
          type: "tekst" as const,
          zichtbaar: false,
          maxLengte: 20,
        }))
      if (extraVelden.length === 0) return prev
      return { ...prev, velden: [...prev.velden, ...extraVelden] }
    })
  }, [applicaties])

  const [opgeslagen, setOpgeslagen] = useState(false)
  const [gewijzigd, setGewijzigd] = useState(false)
  const [dataPreviewOpen, setDataPreviewOpen] = useState(false)

  // Sync lokaal met store wanneer instellingen veranderen (bijv. na laden uit localStorage)
  useEffect(() => {
    if (gewijzigd) return
    setLokaal(prev => {
      const opgeslagenSleutels = new Set(instellingen.velden.map(v => v.sleutel.toLowerCase()))
      const extraVelden = prev.velden.filter(v => !opgeslagenSleutels.has(v.sleutel.toLowerCase()))
      return { ...instellingen, velden: [...instellingen.velden, ...extraVelden] }
    })
  }, [instellingen, gewijzigd])

  const { velden, maxAppsPerRij } = lokaal

  function updateLokaal(wijziging: Partial<Instellingen>) {
    setLokaal(prev => ({ ...prev, ...wijziging }))
    setGewijzigd(true)
    setOpgeslagen(false)
  }

  function updateVeld(id: string, wijziging: Partial<VeldDefinitie>) {
    updateLokaal({ velden: velden.map(v => v.id === id ? { ...v, ...wijziging } : v) })
  }

  function verwijderVeld(id: string) {
    updateLokaal({ velden: velden.filter(v => v.id !== id) })
  }

  function verschuifVeld(id: string, richting: "omhoog" | "omlaag") {
    const index = velden.findIndex(v => v.id === id)
    if (index === -1) return
    if (richting === "omhoog" && index === 0) return
    if (richting === "omlaag" && index === velden.length - 1) return
    const nieuw = [...velden]
    const doel = richting === "omhoog" ? index - 1 : index + 1
    ;[nieuw[index], nieuw[doel]] = [nieuw[doel], nieuw[index]]
    updateLokaal({ velden: nieuw })
  }

  function voegVeldToe() {
    if (velden.length >= MAX_VELDEN) return
    const nieuw: VeldDefinitie = {
      id: `v${Date.now()}`, label: "Nieuw veld", sleutel: "", type: "tekst", zichtbaar: true, maxLengte: 20
    }
    updateLokaal({ velden: [...velden, nieuw] })
  }

  function updateMapping(veldId: string, index: number, wijziging: Partial<IcoonMapping>) {
    const veld = velden.find(v => v.id === veldId)
    if (!veld) return
    const mappings = [...(veld.icoonMappings ?? STANDAARD_MAPPINGS)]
    mappings[index] = { ...mappings[index], ...wijziging }
    updateVeld(veldId, { icoonMappings: mappings })
  }

  function initMappings(veldId: string) {
    const veld = velden.find(v => v.id === veldId)
    if (!veld?.icoonMappings) updateVeld(veldId, { icoonMappings: [...STANDAARD_MAPPINGS] })
  }

  function opslaan() {
    setInstellingen(lokaal)
    setGewijzigd(false)
    setOpgeslagen(true)
    setTimeout(() => setOpgeslagen(false), 3000)
  }

  return (
    <div style={{ maxWidth: "960px", paddingBottom: "80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>Instellingen</h1>

      <WeergaveSection maxAppsPerRij={maxAppsPerRij} kaartBreedte={lokaal.kaartBreedte} kaartHoogte={lokaal.kaartHoogte} subniveauSleutel={lokaal.subniveauSleutel} hoofdniveauSleutel={lokaal.hoofdniveauSleutel} velden={velden} onChange={updateLokaal} />

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontWeight: "600", fontSize: "15px", color: "#374151", margin: 0 }}>Velden op applicatiekaart</h2>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
              {velden.filter(v => v.zichtbaar).length} zichtbaar - maximum {MAX_VELDEN} velden
            </p>
          </div>
          <button onClick={voegVeldToe} disabled={velden.length >= MAX_VELDEN}
            style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", border: "none",
              cursor: velden.length >= MAX_VELDEN ? "not-allowed" : "pointer",
              backgroundColor: velden.length >= MAX_VELDEN ? "#e5e7eb" : "#2563eb",
              color: velden.length >= MAX_VELDEN ? "#9ca3af" : "white" }}>
            + Veld toevoegen
          </button>
        </div>

        {applicaties.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <button onClick={() => setDataPreviewOpen(o => !o)}
              style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none",
                cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {dataPreviewOpen ? "Verberg" : "Toon"} voorbeeldrecord uit data
            </button>
            {dataPreviewOpen && (() => {
              const voorbeeld = applicaties[0]
              const entries = Object.entries(voorbeeld).filter(([k]) => k !== "id")
              return (
                <div style={{ marginTop: "8px", border: "1px solid #e5e7eb", borderRadius: "8px",
                  overflow: "hidden", maxHeight: "240px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb", position: "sticky", top: 0 }}>
                        <th style={{ padding: "6px 12px", textAlign: "left", color: "#6b7280",
                          fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Sleutel</th>
                        <th style={{ padding: "6px 12px", textAlign: "left", color: "#6b7280",
                          fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Waarde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(([sleutel, waarde]) => (
                        <tr key={sleutel} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "4px 12px", color: "#374151", fontFamily: "monospace",
                            whiteSpace: "nowrap" }}>{sleutel}</td>
                          <td style={{ padding: "4px 12px", color: "#6b7280",
                            overflow: "hidden", textOverflow: "ellipsis", maxWidth: "400px" }}>
                            {String(waarde ?? "")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Vergrendeld subniveauveld */}
          <div style={vergrendeldRijStijl} title="Subniveaukolom — aanpasbaar via Weergave-instellingen">
            <input type="checkbox" checked disabled
              style={{ width: "16px", height: "16px", cursor: "not-allowed", opacity: 0.5 }} />
            <span style={vergrendeldTekstStijl}>{kapitaliseer(lokaal.subniveauSleutel)}</span>
            <span style={vergrendeldTekstStijl}>{lokaal.subniveauSleutel}</span>
            <span style={vergrendeldTekstStijl}>subniveau</span>
            <span style={{ ...vergrendeldTekstStijl, fontSize: "11px" }}>n.v.t.</span>
            <span />
            <span style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>🔒</span>
          </div>

          {velden.map((veld, i) => (
            <VeldRij key={veld.id} veld={veld} index={i} totaal={velden.length}
              onUpdate={updateVeld} onVerwijder={verwijderVeld} onVerschuif={verschuifVeld}
              onUpdateMapping={updateMapping} onInitMappings={initMappings} />
          ))}
        </div>
      </div>

      <OpslaanBalk gewijzigd={gewijzigd} opgeslagen={opgeslagen} onOpslaan={opslaan}
        onAnnuleren={() => { setLokaal(instellingen); setGewijzigd(false) }} />
    </div>
  )
}
