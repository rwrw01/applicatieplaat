"use client"
import { useState } from "react"
import { useStore } from "@/lib/store"
import type { VeldDefinitie, IcoonMapping, Instellingen } from "@/types"
import WeergaveSection from "@/components/instellingen/WeergaveSection"
import DataBeheerSection from "@/components/instellingen/DataBeheerSection"
import VeldRij from "@/components/instellingen/VeldRij"
import OpslaanBalk from "@/components/instellingen/OpslaanBalk"

const MAX_VELDEN = 12
const STANDAARD_MAPPINGS: IcoonMapping[] = [
  { waarde: "", icoon: "", kleur: "#3b82f6" },
  { waarde: "", icoon: "", kleur: "#22c55e" },
  { waarde: "", icoon: "", kleur: "#ef4444" },
]

export default function InstellingenPage() {
  const { instellingen, setInstellingen, resetNaarStandaard } = useStore()
  const [lokaal, setLokaal] = useState<Instellingen>(instellingen)
  const [opgeslagen, setOpgeslagen] = useState(false)
  const [gewijzigd, setGewijzigd] = useState(false)

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

  function handleReset() {
    if (window.confirm("Weet je het zeker? Alle data en instellingen worden gereset.")) {
      resetNaarStandaard()
      setLokaal(instellingen)
      setGewijzigd(false)
    }
  }

  return (
    <div style={{ maxWidth: "960px", paddingBottom: "80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>Instellingen</h1>

      <WeergaveSection maxAppsPerRij={maxAppsPerRij} subniveauSleutel={lokaal.subniveauSleutel} hoofdniveauSleutel={lokaal.hoofdniveauSleutel} velden={velden} onChange={updateLokaal} />
      <DataBeheerSection onReset={handleReset} />

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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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