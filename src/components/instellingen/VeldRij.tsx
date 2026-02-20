import type { VeldDefinitie, VeldType, IcoonMapping } from "@/types"
import IcoonKiezer from "@/components/ui/IcoonKiezer"
import { getIcoonOptie } from "@/lib/iconenBibliotheek"
import { VlagIcoon } from "@/lib/vlaggen"

const MAX_MAPPINGS = 3
const veldTypes: VeldType[] = ["tekst", "datum", "icoon", "status"]

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "4px 8px", border: "1px solid #e5e7eb",
  borderRadius: "6px", fontSize: "12px", outline: "none", boxSizing: "border-box",
}
const selectStyle: React.CSSProperties = {
  width: "100%", padding: "4px 8px", border: "1px solid #e5e7eb",
  borderRadius: "6px", fontSize: "12px", outline: "none", backgroundColor: "white",
}

function renderIcoonPreview(naam: string, kleur: string) {
  const optie = getIcoonOptie(naam)
  if (!optie) return null
  if (optie.type === "vlag" && optie.emoji) return <VlagIcoon code={optie.emoji} size={16} />
  if (optie.component) {
    const Icoon = optie.component
    return <Icoon size={16} color={kleur} />
  }
  return null
}

interface Props {
  veld: VeldDefinitie
  index: number
  totaal: number
  onUpdate: (id: string, w: Partial<VeldDefinitie>) => void
  onVerwijder: (id: string) => void
  onVerschuif: (id: string, richting: "omhoog" | "omlaag") => void
  onUpdateMapping: (veldId: string, i: number, w: Partial<IcoonMapping>) => void
  onInitMappings: (veldId: string) => void
}

export default function VeldRij({ veld, index, totaal, onUpdate, onVerwijder, onVerschuif, onUpdateMapping, onInitMappings }: Props) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: veld.zichtbaar ? "white" : "#fafafa" }}>
      <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 120px 100px 28px 40px", gap: "8px", padding: "10px 12px", alignItems: "center" }}>
        <input type="checkbox" checked={veld.zichtbaar}
          onChange={e => onUpdate(veld.id, { zichtbaar: e.target.checked })}
          style={{ width: "16px", height: "16px", cursor: "pointer" }} />
        <input style={inputStyle} value={veld.label} placeholder="Label"
          onChange={e => onUpdate(veld.id, { label: e.target.value })} />
        <input style={inputStyle} value={veld.sleutel} placeholder="Sleutel (bijv. naam)"
          onChange={e => onUpdate(veld.id, { sleutel: e.target.value })} />
        <select style={selectStyle} value={veld.type}
          onChange={e => {
            const type = e.target.value as VeldType
            onUpdate(veld.id, { type })
            if (type === "icoon") onInitMappings(veld.id)
          }}>
          {veldTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {veld.type === "tekst" ? (
          <input style={inputStyle} type="number" min={5} max={100}
            value={veld.maxLengte ?? 20} placeholder="Max lengte"
            onChange={e => onUpdate(veld.id, { maxLengte: Number(e.target.value) })} />
        ) : (
          <span style={{ fontSize: "11px", color: "#d1d5db", padding: "4px 8px" }}>n.v.t.</span>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <button onClick={() => onVerschuif(veld.id, "omhoog")} disabled={index === 0}
            style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer",
              color: index === 0 ? "#d1d5db" : "#6b7280", fontSize: "10px", padding: "1px", lineHeight: 1 }}>▲</button>
          <button onClick={() => onVerschuif(veld.id, "omlaag")} disabled={index === totaal - 1}
            style={{ background: "none", border: "none", cursor: index === totaal - 1 ? "default" : "pointer",
              color: index === totaal - 1 ? "#d1d5db" : "#6b7280", fontSize: "10px", padding: "1px", lineHeight: 1 }}>▼</button>
        </div>
        <button onClick={() => onVerwijder(veld.id)}
          style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>×</button>
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
                    onChange={e => onUpdateMapping(veld.id, i, { waarde: e.target.value })} />
                  <IcoonKiezer waarde={mapping.icoon} onChange={icoon => onUpdateMapping(veld.id, i, { icoon })} />
                  <input type="color" value={mapping.kleur}
                    onChange={e => onUpdateMapping(veld.id, i, { kleur: e.target.value })}
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
  )
}
