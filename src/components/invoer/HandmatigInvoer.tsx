"use client"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import type { Applicatie, VeldDefinitie } from "@/types"

function legeRij(): Applicatie {
  return {
    id: crypto.randomUUID(),
    cluster: "", naam: "", saas: false,
    complexiteit: "laag", afloopDatum: "",
    omgeving: "client", status: "groen", leverancier: "",
  }
}

function renderInvoercel(
  veld: VeldDefinitie,
  waarde: unknown,
  onChange: (waarde: unknown) => void,
  inputStyle: React.CSSProperties
) {
  const sleutel = veld.sleutel

  // Vaste velden met specifieke invoer
  if (sleutel === "saas") {
    return (
      <select style={inputStyle} value={waarde ? "ja" : "nee"} onChange={e => onChange(e.target.value === "ja")}>
        <option value="ja">Ja</option>
        <option value="nee">Nee</option>
      </select>
    )
  }
  if (sleutel === "complexiteit") {
    return (
      <select style={inputStyle} value={String(waarde ?? "laag")} onChange={e => onChange(e.target.value)}>
        <option value="laag">Laag</option>
        <option value="midden">Midden</option>
        <option value="hoog">Hoog</option>
      </select>
    )
  }
  if (sleutel === "omgeving") {
    return (
      <select style={inputStyle} value={String(waarde ?? "client")} onChange={e => onChange(e.target.value)}>
        <option value="client">Client</option>
        <option value="server">Server</option>
        <option value="beide">Beide</option>
      </select>
    )
  }
  if (sleutel === "status") {
    return (
      <select style={inputStyle} value={String(waarde ?? "groen")} onChange={e => onChange(e.target.value)}>
        <option value="groen">Groen</option>
        <option value="oranje">Oranje</option>
        <option value="rood">Rood</option>
      </select>
    )
  }
  if (sleutel === "afloopDatum" || veld.type === "datum") {
    return (
      <input style={inputStyle} type="date" value={String(waarde ?? "")}
        onChange={e => onChange(e.target.value)} />
    )
  }

  // Icoon veld — toon de mogelijke waarden als dropdown als mappings beschikbaar zijn
  if (veld.type === "icoon" && veld.icoonMappings && veld.icoonMappings.length > 0) {
    const opties = veld.icoonMappings.filter(m => m.waarde.trim() !== "")
    if (opties.length > 0) {
      return (
        <select style={inputStyle} value={String(waarde ?? "")} onChange={e => onChange(e.target.value)}>
          <option value="">-- kies --</option>
          {opties.map(m => (
            <option key={m.waarde} value={m.waarde}>{m.waarde}</option>
          ))}
        </select>
      )
    }
  }

  // Standaard: tekstveld voor alle custom velden
  return (
    <input style={inputStyle} type="text" value={String(waarde ?? "")}
      placeholder={veld.label}
      onChange={e => onChange(e.target.value)} />
  )
}

export default function HandmatigInvoer() {
  const { applicaties, setApplicaties, instellingen } = useStore()

  // Gebruik alle velden uit instellingen — ook niet-zichtbare zijn relevant voor data
  const zichtbareVelden = instellingen.velden.filter(v => v.zichtbaar)

  // Rijen initialiseren vanuit store, altijd synchroon met laatste applicaties
  const [rijen, setRijen] = useState<Applicatie[]>(() =>
    applicaties.length > 0 ? [...applicaties] : [legeRij()]
  )

  // Als instellingen veranderen: zorg dat bestaande rijen nieuwe velden kennen
  useEffect(() => {
    setRijen(prev => prev.map(rij => {
      const bijgewerkt = { ...rij }
      instellingen.velden.forEach(veld => {
        if (!(veld.sleutel in bijgewerkt)) {
          (bijgewerkt as Record<string, unknown>)[veld.sleutel] = ""
        }
      })
      return bijgewerkt
    }))
  }, [instellingen.velden])

  function updateRij(id: string, sleutel: string, waarde: unknown) {
    setRijen(prev => prev.map(r => r.id === id ? { ...r, [sleutel]: waarde } : r))
  }

  function opslaan() {
    setApplicaties(rijen.filter(r => r.naam.trim() !== ""))
    alert("Opgeslagen! Ga naar Applicatieplaat om het resultaat te zien.")
  }

  const tdStyle: React.CSSProperties = { border: "1px solid #e5e7eb", padding: "4px 8px" }
  const inputStyle: React.CSSProperties = { width: "100%", fontSize: "12px", border: "none", outline: "none", backgroundColor: "transparent", minWidth: "80px" }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
              {zichtbareVelden.map(v => (
                <th key={v.id} style={{ padding: "8px 12px", textAlign: "left", whiteSpace: "nowrap" }}>
                  {v.label}
                </th>
              ))}
              <th style={{ padding: "8px 12px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rijen.map(rij => (
              <tr key={rij.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                {zichtbareVelden.map(veld => (
                  <td key={veld.id} style={tdStyle}>
                    {renderInvoercel(
                      veld,
                      (rij as Record<string, unknown>)[veld.sleutel],
                      (waarde) => updateRij(rij.id, veld.sleutel, waarde),
                      inputStyle
                    )}
                  </td>
                ))}
                <td style={tdStyle}>
                  <button onClick={() => setRijen(prev => prev.filter(r => r.id !== rij.id))}
                    style={{ color: "#ef4444", cursor: "pointer", border: "none", background: "none", fontSize: "14px" }}>
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button onClick={() => setRijen(prev => [...prev, legeRij()])}
          style={{ padding: "8px 16px", backgroundColor: "#f3f4f6", borderRadius: "8px", fontSize: "14px", cursor: "pointer", border: "none" }}>
          + Rij toevoegen
        </button>
        <button onClick={opslaan}
          style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "white", borderRadius: "8px", fontSize: "14px", cursor: "pointer", border: "none" }}>
          Opslaan & bekijken
        </button>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
          {rijen.length} rijen · {zichtbareVelden.length} velden zichtbaar
        </span>
      </div>
    </div>
  )
}