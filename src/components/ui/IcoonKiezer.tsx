"use client"
import { useState } from "react"
import { zoekIconen, type IcoonOptie } from "@/lib/iconenBibliotheek"
import { VlagIcoon } from "@/lib/vlaggen"

interface Props {
  waarde: string
  onChange: (naam: string) => void
}

function renderIcoonPreview(optie: IcoonOptie, size = 16, kleur = "currentColor") {
  if (optie.type === "vlag" && optie.emoji) {
    return <VlagIcoon code={optie.emoji} size={size} />
  }
  if (optie.component) {
    const Icoon = optie.component
    return <Icoon size={size} color={kleur} />
  }
  return null
}

export default function IcoonKiezer({ waarde, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [zoekterm, setZoekterm] = useState("")
  const resultaten = zoekIconen(zoekterm)
  const geselecteerd = zoekIconen("").find(i => i.naam === waarde)

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px",
          border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "white",
          cursor: "pointer", fontSize: "12px", color: "#374151", minWidth: "120px" }}>
        {geselecteerd
          ? <>{renderIcoonPreview(geselecteerd, 14)} {geselecteerd.naam}</>
          : <span style={{ color: "#9ca3af" }}>Kies icoon...</span>
        }
      </button>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, marginTop: "4px",
          backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", width: "280px" }}>
          <div style={{ padding: "8px" }}>
            <input autoFocus type="text" placeholder="Zoek icoon..." value={zoekterm}
              onChange={e => setZoekterm(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #e5e7eb",
                borderRadius: "6px", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ maxHeight: "240px", overflowY: "auto", padding: "4px 8px 8px" }}>
            {(() => {
              const categorieen = [...new Set(resultaten.map(i => i.categorie))]
              return categorieen.map(cat => (
                <div key={cat}>
                  <p style={{ fontSize: "10px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase",
                    margin: "8px 0 4px", letterSpacing: "0.05em" }}>
                    {cat}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {resultaten.filter(i => i.categorie === cat).map(optie => (
                      <button key={optie.naam} type="button" title={optie.naam}
                        onClick={() => { onChange(optie.naam); setOpen(false); setZoekterm("") }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center",
                          width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", border: "none",
                          backgroundColor: waarde === optie.naam ? "#eff6ff" : "#f9fafb",
                          outline: waarde === optie.naam ? "2px solid #2563eb" : "none" }}>
                        {renderIcoonPreview(optie, 16, waarde === optie.naam ? "#2563eb" : "#4b5563")}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            })()}
            {resultaten.length === 0 && (
              <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", padding: "16px" }}>
                Geen iconen gevonden
              </p>
            )}
          </div>
        </div>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
      )}
    </div>
  )
}