"use client"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { getAppWaarde } from "@/lib/appUtils"
import type { Applicatie, VeldDefinitie } from "@/types"

function heeftSleutel(obj: Record<string, unknown>, sleutel: string): boolean {
  if (sleutel in obj) return true
  const lower = sleutel.toLowerCase()
  return Object.keys(obj).some(k => k.toLowerCase() === lower)
}

function legeRij(velden: VeldDefinitie[], subniveauSleutel: string, hoofdniveauSleutel?: string): Applicatie {
  const rij: Applicatie = { id: crypto.randomUUID(), cluster: "", naam: "" }
  ;(rij as Record<string, unknown>)[subniveauSleutel] = ""
  if (hoofdniveauSleutel) (rij as Record<string, unknown>)[hoofdniveauSleutel] = ""
  velden.forEach(v => {
    if (!heeftSleutel(rij, v.sleutel)) {
      const sl = v.sleutel.toLowerCase()
      ;(rij as Record<string, unknown>)[v.sleutel] = sl === "saas" ? false : ""
    }
  })
  return rij
}

function vulRijAan(rij: Applicatie, velden: VeldDefinitie[], subniveauSleutel: string, hoofdniveauSleutel?: string): Applicatie {
  const bijgewerkt = { ...rij }
  if (!heeftSleutel(bijgewerkt, subniveauSleutel)) (bijgewerkt as Record<string, unknown>)[subniveauSleutel] = ""
  if (hoofdniveauSleutel && !heeftSleutel(bijgewerkt, hoofdniveauSleutel)) (bijgewerkt as Record<string, unknown>)[hoofdniveauSleutel] = ""
  velden.forEach(v => {
    if (!heeftSleutel(bijgewerkt, v.sleutel)) {
      (bijgewerkt as Record<string, unknown>)[v.sleutel] = ""
    }
  })
  return bijgewerkt
}

function renderInvoercel(
  veld: VeldDefinitie,
  waarde: unknown,
  onChange: (waarde: unknown) => void,
  inputStyle: React.CSSProperties
) {
  const sl = veld.sleutel.toLowerCase()

  if (sl === "saas") {
    return (
      <select style={inputStyle} value={waarde ? "ja" : "nee"} onChange={e => onChange(e.target.value === "ja")}>
        <option value="ja">Ja</option>
        <option value="nee">Nee</option>
      </select>
    )
  }
  if (sl === "complexiteit") {
    return (
      <select style={inputStyle} value={String(waarde ?? "")} onChange={e => onChange(e.target.value)}>
        <option value="">-- kies --</option>
        <option value="laag">Laag</option>
        <option value="midden">Midden</option>
        <option value="hoog">Hoog</option>
      </select>
    )
  }
  if (sl === "omgeving") {
    return (
      <select style={inputStyle} value={String(waarde ?? "")} onChange={e => onChange(e.target.value)}>
        <option value="">-- kies --</option>
        <option value="client">Client</option>
        <option value="server">Server</option>
        <option value="beide">Beide</option>
      </select>
    )
  }
  if (sl === "status") {
    return (
      <select style={inputStyle} value={String(waarde ?? "")} onChange={e => onChange(e.target.value)}>
        <option value="">-- kies --</option>
        <option value="groen">Groen</option>
        <option value="oranje">Oranje</option>
        <option value="rood">Rood</option>
      </select>
    )
  }
  if (sl === "afloopdatum" || veld.type === "datum") {
    return (
      <input style={inputStyle} type="date" value={String(waarde ?? "")}
        onChange={e => onChange(e.target.value)} />
    )
  }
  if (veld.type === "icoon" && veld.icoonMappings) {
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
  return (
    <input style={inputStyle} type="text" value={String(waarde ?? "")}
      placeholder={veld.label}
      onChange={e => onChange(e.target.value)} />
  )
}

export default function HandmatigInvoer() {
  const { applicaties, setApplicaties, instellingen } = useStore()
  const { velden, subniveauSleutel, hoofdniveauSleutel } = instellingen
  const zichtbareVelden = velden.filter(v => v.zichtbaar)

  const [rijen, setRijen] = useState<Applicatie[]>(() =>
    applicaties.length > 0
      ? applicaties.map(r => vulRijAan(r, velden, subniveauSleutel, hoofdniveauSleutel))
      : [legeRij(velden, subniveauSleutel, hoofdniveauSleutel)]
  )
  const [gewijzigd, setGewijzigd] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(false)

  useEffect(() => {
    setRijen(prev => prev.map(r => vulRijAan(r, velden, subniveauSleutel, hoofdniveauSleutel)))
  }, [velden, subniveauSleutel, hoofdniveauSleutel])

  useEffect(() => {
    if (applicaties.length > 0) {
      setRijen(applicaties.map(r => vulRijAan(r, velden, subniveauSleutel, hoofdniveauSleutel)))
      setGewijzigd(false)
    }
  }, [applicaties])

  function updateRij(id: string, sleutel: string, waarde: unknown) {
    setRijen(prev => prev.map(r => r.id === id ? { ...r, [sleutel]: waarde } : r))
    setGewijzigd(true)
    setOpgeslagen(false)
  }

  function verwijderRij(id: string) {
    setRijen(prev => prev.filter(r => r.id !== id))
    setGewijzigd(true)
    setOpgeslagen(false)
  }

  function voegRijToe() {
    setRijen(prev => [...prev, legeRij(velden, subniveauSleutel, hoofdniveauSleutel)])
    setGewijzigd(true)
    setOpgeslagen(false)
  }

  function annuleren() {
    setRijen(applicaties.map(r => vulRijAan(r, velden, subniveauSleutel, hoofdniveauSleutel)))
    setGewijzigd(false)
  }

  function opslaan() {
    const geldig = rijen.filter(r => r.naam.trim() !== "")
    setApplicaties(geldig)
    setGewijzigd(false)
    setOpgeslagen(true)
    setTimeout(() => setOpgeslagen(false), 3000)
  }

  const tdStyle: React.CSSProperties = { border: "1px solid #e5e7eb", padding: "4px 6px" }
  const inputStyle: React.CSSProperties = {
    width: "100%", fontSize: "12px", border: "none", outline: "none",
    backgroundColor: "transparent", minWidth: "80px"
  }

  const aantalGeldig = rijen.filter(r => r.naam.trim() !== "").length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "80px" }}>
      <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
              {hoofdniveauSleutel && (
                <th style={{ padding: "8px 12px", textAlign: "left", whiteSpace: "nowrap" }}>{hoofdniveauSleutel}</th>
              )}
              <th style={{ padding: "8px 12px", textAlign: "left", whiteSpace: "nowrap" }}>{subniveauSleutel}</th>
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
                {hoofdniveauSleutel && (
                  <td style={tdStyle}>
                    <input style={inputStyle} type="text"
                      value={String(getAppWaarde(rij, hoofdniveauSleutel) ?? "")}
                      placeholder={hoofdniveauSleutel}
                      onChange={e => updateRij(rij.id, hoofdniveauSleutel, e.target.value)} />
                  </td>
                )}
                <td style={tdStyle}>
                  <input style={inputStyle} type="text"
                    value={String(getAppWaarde(rij, subniveauSleutel) ?? "")}
                    placeholder={subniveauSleutel}
                    onChange={e => updateRij(rij.id, subniveauSleutel, e.target.value)} />
                </td>
                {zichtbareVelden.map(veld => (
                  <td key={veld.id} style={tdStyle}>
                    {renderInvoercel(
                      veld,
                      getAppWaarde(rij, veld.sleutel),
                      (waarde) => updateRij(rij.id, veld.sleutel, waarde),
                      inputStyle
                    )}
                  </td>
                ))}
                <td style={tdStyle}>
                  <button onClick={() => verwijderRij(rij.id)}
                    style={{ color: "#ef4444", cursor: "pointer", border: "none", background: "none", fontSize: "14px" }}>
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={voegRijToe}
        style={{ alignSelf: "flex-start", padding: "8px 16px", backgroundColor: "#f3f4f6", borderRadius: "8px", fontSize: "14px", cursor: "pointer", border: "none" }}>
        + Rij toevoegen
      </button>

      {gewijzigd && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          display: "flex", gap: "8px", alignItems: "center",
          backgroundColor: "white", padding: "12px 16px",
          borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb", zIndex: 100
        }}>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            {aantalGeldig} applicaties · niet opgeslagen
          </span>
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
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          backgroundColor: "#16a34a", color: "white", padding: "12px 20px",
          borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontSize: "13px", fontWeight: "500", zIndex: 100
        }}>
          {aantalGeldig} applicaties opgeslagen
        </div>
      )}
    </div>
  )
}
