"use client"
import { useState } from "react"
import { useStore } from "@/lib/store"
import type { VeldDefinitie, VeldType, IcoonMapping, Instellingen } from "@/types"
import IcoonKiezer from "@/components/ui/IcoonKiezer"
import { getIcoonOptie } from "@/lib/iconenBibliotheek"
import { VlagIcoon } from "@/lib/vlaggen"

const MAX_VELDEN = 12
const MAX_MAPPINGS = 3
const veldTypes: VeldType[] = ["tekst", "datum", "icoon", "status"]

function renderIcoonPreview(naam: string, kleur: string) {
  const optie = getIcoonOptie(naam)
  if (!optie) return null
  if (optie.type === "vlag" && optie.emoji) {
    return <VlagIcoon code={optie.emoji} size={16} />
  }
  if (optie.component) {
    const Icoon = optie.component
    return <Icoon size={16} color={kleur} />
  }
  return null
}

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
    const mappings = [...(veld.icoonMappings ?? [
      { waarde: "", icoon: "", kleur: "#3b82f6" },
      { waarde: "", icoon: "", kleur: "#22c55e" },
      { waarde: "", icoon: "", kleur: "#ef4444" }
    ])]
    mappings[index] = { ...mappings[index], ...wijziging }
    updateVeld(veldId, { icoonMappings: mappings })
  }

  function initMappings(veldId: string) {
    const veld = velden.find(v => v.id === veldId)
    if (!veld?.icoonMappings) {
      updateVeld(veldId, {
        icoonMappings: [
          { waarde: "", icoon: "", kleur: "#3b82f6" },
          { waarde: "", icoon: "", kleur: "#22c55e" },
          { waarde: "", icoon: "", kleur: "#ef4444" },
        ]
      })
    }
  }

  function opslaan() {
    setInstellingen(lokaal)
    setGewijzigd(false)
    setOpgeslagen(true)
    setTimeout(() => setOpgeslagen(false), 3000)
  }

  function annuleren() {
    setLokaal(instellingen)
    setGewijzigd(false)
  }

  function handleReset() {
    if (window.confirm("Weet je het zeker? Alle data en instellingen worden gereset.")) {
      resetNaarStandaard()
      setLokaal(instellingen)
      setGewijzigd(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "4px 8px", border: "1px solid #e5e7eb",
    borderRadius: "6px", fontSize: "12px", outline: "none", boxSizing: "border-box"
  }
  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "4px 8px", border: "1px solid #e5e7eb",
    borderRadius: "6px", fontSize: "12px", outline: "none", backgroundColor: "white"
  }

  return (
    <div style={{ maxWidth: "960px", paddingBottom: "80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>Instellingen</h1>

      {/* Weergave */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "600", fontSize: "15px", color: "#374151", marginBottom: "16px" }}>Weergave</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px" }}>
          <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Maximum applicaties per rij</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input type="range" min={1} max={12} value={maxAppsPerRij}
              onChange={e => updateLokaal({ maxAppsPerRij: Number(e.target.value) })}
              style={{ flex: 1 }} />
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb", minWidth: "32px", textAlign: "center" }}>
              {maxAppsPerRij}
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[3,4,5,6,8,10,12].map(n => (
              <button key={n} onClick={() => updateLokaal({ maxAppsPerRij: n })}
                style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", border: "none", fontWeight: "500",
                  backgroundColor: maxAppsPerRij === n ? "#2563eb" : "#f3f4f6",
                  color: maxAppsPerRij === n ? "white" : "#374151" }}>
                {n}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Data beheer */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "600", fontSize: "15px", color: "#374151", marginBottom: "8px" }}>Data beheer</h2>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
          Reset alles naar de standaard voorbeelddata. Dit verwijdert alle wijzigingen.
        </p>
        <button onClick={handleReset}
          style={{ padding: "8px 16px", backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "1px solid #fecaca", fontWeight: "500" }}>
          Reset naar standaarddata
        </button>
      </div>

      {/* Velden */}
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
          {velden.map(veld => (
            <div key={veld.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: veld.zichtbaar ? "white" : "#fafafa" }}>
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 120px 100px 28px 40px", gap: "8px", padding: "10px 12px", alignItems: "center" }}>
                <input type="checkbox" checked={veld.zichtbaar}
                  onChange={e => updateVeld(veld.id, { zichtbaar: e.target.checked })}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                <input style={inputStyle} value={veld.label} placeholder="Label"
                  onChange={e => updateVeld(veld.id, { label: e.target.value })} />
                <input style={inputStyle} value={veld.sleutel} placeholder="Sleutel (bijv. naam)"
                  onChange={e => updateVeld(veld.id, { sleutel: e.target.value })} />
                <select style={selectStyle} value={veld.type}
                  onChange={e => {
                    const type = e.target.value as VeldType
                    updateVeld(veld.id, { type })
                    if (type === "icoon") initMappings(veld.id)
                  }}>
                  {veldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {veld.type === "tekst" ? (
                  <input style={inputStyle} type="number" min={5} max={100}
                    value={veld.maxLengte ?? 20} placeholder="Max lengte"
                    onChange={e => updateVeld(veld.id, { maxLengte: Number(e.target.value) })} />
                ) : (
                  <span style={{ fontSize: "11px", color: "#d1d5db", padding: "4px 8px" }}>n.v.t.</span>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <button onClick={() => verschuifVeld(veld.id, "omhoog")} disabled={velden.indexOf(veld) === 0}
                    style={{ background: "none", border: "none", cursor: velden.indexOf(veld) === 0 ? "default" : "pointer",
                      color: velden.indexOf(veld) === 0 ? "#d1d5db" : "#6b7280", fontSize: "10px", padding: "1px", lineHeight: 1 }}>
                    ▲
                  </button>
                  <button onClick={() => verschuifVeld(veld.id, "omlaag")} disabled={velden.indexOf(veld) === velden.length - 1}
                    style={{ background: "none", border: "none", cursor: velden.indexOf(veld) === velden.length - 1 ? "default" : "pointer",
                      color: velden.indexOf(veld) === velden.length - 1 ? "#d1d5db" : "#6b7280", fontSize: "10px", padding: "1px", lineHeight: 1 }}>
                    ▼
                  </button>
                </div>
                <button onClick={() => verwijderVeld(veld.id)}
                  style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>
                  ×
                </button>
              </div>

              {veld.type === "icoon" && (
                <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 16px", backgroundColor: "#f9fafb", borderRadius: "0 0 8px 8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                    Icoon mapping (max {MAX_MAPPINGS} waarden)
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {Array.from({ length: MAX_MAPPINGS }).map((_, i) => {
                      const mapping = veld.icoonMappings?.[i] ?? { waarde: "", icoon: "", kleur: "#3b82f6" }
                      return (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 50px 28px", gap: "8px", alignItems: "center" }}>
                          <input style={inputStyle} value={mapping.waarde}
                            placeholder={`Waarde ${i + 1} (bijv. NL)`}
                            onChange={e => updateMapping(veld.id, i, { waarde: e.target.value })} />
                          <IcoonKiezer
                            waarde={mapping.icoon}
                            onChange={icoon => updateMapping(veld.id, i, { icoon })} />
                          <input type="color" value={mapping.kleur}
                            onChange={e => updateMapping(veld.id, i, { kleur: e.target.value })}
                            style={{ width: "40px", height: "28px", border: "1px solid #e5e7eb", borderRadius: "4px", cursor: "pointer", padding: "1px" }} />
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {mapping.icoon && renderIcoonPreview(mapping.icoon, mapping.kleur)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {gewijzigd && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", gap: "8px", alignItems: "center",
          backgroundColor: "white", padding: "12px 16px", borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb", zIndex: 100 }}>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>Niet-opgeslagen wijzigingen</span>
          <button onClick={annuleren}
            style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", border: "1px solid #e5e7eb", backgroundColor: "white" }}>
            Annuleren
          </button>
          <button onClick={opslaan}
            style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: "500" }}>
            Opslaan
          </button>
        </div>
      )}

      {opgeslagen && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", backgroundColor: "#16a34a", color: "white",
          padding: "12px 20px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontSize: "13px", fontWeight: "500", zIndex: 100 }}>
          Instellingen opgeslagen
        </div>
      )}
    </div>
  )
}