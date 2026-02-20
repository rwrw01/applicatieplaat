"use client"
import { useState } from "react"
import type { Applicatie, VeldDefinitie } from "@/types"
import { getAppWaarde } from "@/lib/appUtils"

export function getFilterWaarde(sleutel: string, app: Applicatie, veld?: VeldDefinitie): string {
  const raw = getAppWaarde(app, sleutel)
  if (typeof raw === "boolean") return raw ? "Ja" : "Nee"
  if (veld?.type === "datum" && raw) {
    const datum = new Date(String(raw))
    const nu = new Date()
    if (datum < nu) return "Verlopen"
    if (datum < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) return "Binnenkort"
    return "Actief"
  }
  return String(raw ?? "")
}

function uniekeWaarden(apps: Applicatie[], sleutel: string, veld?: VeldDefinitie): string[] {
  const set = new Set(apps.map(app => getFilterWaarde(sleutel, app, veld)))
  return Array.from(set).filter(Boolean).sort()
}

interface FilterSectieProps {
  label: string
  waarden: string[]
  geselecteerd: string[]
  onChange: (geselecteerd: string[]) => void
}

function FilterSectie({ label, waarden, geselecteerd, onChange }: FilterSectieProps) {
  const [ingeklapt, setIngeklapt] = useState(false)
  const actief = geselecteerd.length > 0 && geselecteerd.length < waarden.length

  return (
    <div style={{ borderBottom: "1px solid #f3f4f6" }}>
      <div
        onClick={() => setIngeklapt(!ingeklapt)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", cursor: "pointer", userSelect: "none",
          backgroundColor: actief ? "#eff6ff" : "transparent" }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: actief ? "#1d4ed8" : "#374151" }}>
          {label}
          {actief && (
            <span style={{ marginLeft: 6, fontSize: 10, backgroundColor: "#2563eb", color: "white",
              borderRadius: 999, padding: "1px 6px", fontWeight: 700 }}>
              {geselecteerd.length}
            </span>
          )}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{ingeklapt ? "▶" : "▼"}</span>
      </div>

      {!ingeklapt && (
        <div style={{ padding: "4px 12px 10px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <button onClick={() => onChange([])}
              style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, border: "1px solid #e5e7eb",
                backgroundColor: geselecteerd.length === 0 ? "#f3f4f6" : "white",
                color: "#374151", cursor: "pointer", fontWeight: geselecteerd.length === 0 ? 600 : 400 }}>
              Alles
            </button>
            <button onClick={() => onChange(waarden)}
              style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, border: "1px solid #e5e7eb",
                backgroundColor: geselecteerd.length === waarden.length ? "#f3f4f6" : "white",
                color: "#374151", cursor: "pointer", fontWeight: geselecteerd.length === waarden.length ? 600 : 400 }}>
              Geen
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {waarden.map(waarde => {
              const checked = geselecteerd.length === 0 || geselecteerd.includes(waarde)
              return (
                <label key={waarde}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={checked}
                    onChange={() => {
                      if (geselecteerd.length === 0) {
                        // Alles was geselecteerd, nu één uitzetten
                        onChange(waarden.filter(w => w !== waarde))
                      } else if (checked) {
                        const nieuw = geselecteerd.filter(w => w !== waarde)
                        onChange(nieuw.length === waarden.length ? [] : nieuw)
                      } else {
                        const nieuw = [...geselecteerd, waarde]
                        onChange(nieuw.length === waarden.length ? [] : nieuw)
                      }
                    }}
                    style={{ cursor: "pointer", width: 14, height: 14, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#374151" }}>{waarde}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


interface Props {
  velden: VeldDefinitie[]
  applicaties: Applicatie[]
  filters: Record<string, string[]>
  onChange: (f: Record<string, string[]>) => void
  subniveauSleutel: string
  hoofdniveauSleutel?: string
  alleSleutels: string[]
  onSluit: () => void
}

export default function FilterPanel({ velden, applicaties, filters, onChange, subniveauSleutel, hoofdniveauSleutel, alleSleutels, onSluit }: Props) {
  const filterVelden: { sleutel: string; label: string; veld?: VeldDefinitie }[] = []

  const uitgesloten = new Set(["naam", "id", subniveauSleutel, hoofdniveauSleutel].filter(Boolean) as string[])
  alleSleutels.filter(k => !uitgesloten.has(k)).forEach(k => {
    const veld = velden.find(v => v.sleutel === k)
    filterVelden.push({ sleutel: k, label: veld?.label ?? k, veld })
  })

  const aantalActief = Object.values(filters).filter(a => a.length > 0).length

  function labelVoorSleutel(sleutel: string) {
    return velden.find(v => v.sleutel === sleutel)?.label ?? sleutel
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%",
      backgroundColor: "white", borderRight: "1px solid #e5e7eb" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 12px 10px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
          Filter
          {aantalActief > 0 && (
            <span style={{ marginLeft: 6, fontSize: 10, backgroundColor: "#2563eb", color: "white",
              borderRadius: 999, padding: "1px 6px", fontWeight: 700 }}>
              {aantalActief}
            </span>
          )}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {aantalActief > 0 && (
            <button onClick={() => onChange({})}
              style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none",
                cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              Reset
            </button>
          )}
          <button onClick={onSluit}
            style={{ background: "none", border: "none", cursor: "pointer",
              color: "#6b7280", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>
            ×
          </button>
        </div>
      </div>

      {/* Filter secties */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {filterVelden.length > 0 && (
          <div style={{ padding: "8px 12px 4px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em" }}>FILTER</div>
          </div>
        )}
        {filterVelden.map(({ sleutel, label, veld }) => {
          const waarden = uniekeWaarden(applicaties, sleutel, veld)
          if (waarden.length <= 1) return null
          return (
            <FilterSectie key={sleutel} label={label} waarden={waarden}
              geselecteerd={filters[sleutel] ?? []}
              onChange={geselecteerd => {
                const nieuw = { ...filters }
                if (geselecteerd.length === 0) delete nieuw[sleutel]
                else nieuw[sleutel] = geselecteerd
                onChange(nieuw)
              }} />
          )
        })}
      </div>
    </div>
  )
}
