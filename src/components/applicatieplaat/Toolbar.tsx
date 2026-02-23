"use client"
import { Save, Layers, Eye } from "lucide-react"
import DropdownMenu from "@/components/ui/DropdownMenu"
import { exporteerSessie, exporteerAfbeelding } from "@/lib/exportUtils"
import type { VeldDefinitie, Instellingen, Applicatie } from "@/types"

interface ToolbarProps {
  instellingen: Instellingen
  applicaties: Applicatie[]
  alleSleutels: string[]
  filterOpen: boolean
  aantalActiefFilters: number
  plaatRef: React.RefObject<HTMLDivElement | null>
  onFilterToggle: () => void
  onInstellingenWijzig: (instellingen: Instellingen) => void
}

const selectStijl: React.CSSProperties = {
  width: "100%", padding: "4px 6px", borderRadius: 5, border: "1px solid #d1d5db",
  fontSize: 12, color: "#1f2937", backgroundColor: "white", cursor: "pointer",
}

const menuItemStijl: React.CSSProperties = {
  display: "block", width: "100%", padding: "8px 14px", textAlign: "left",
  fontSize: 13, color: "#374151", background: "none", border: "none",
  cursor: "pointer",
}

function labelVoorSleutel(velden: VeldDefinitie[], sleutel: string): string {
  return velden.find(v => v.sleutel === sleutel)?.label ?? sleutel
}

export default function Toolbar({
  instellingen, applicaties, alleSleutels,
  filterOpen, aantalActiefFilters, plaatRef,
  onFilterToggle, onInstellingenWijzig,
}: ToolbarProps) {
  const { velden, subniveauSleutel, hoofdniveauSleutel } = instellingen
  const aantalZichtbaar = velden.filter(v => v.zichtbaar).length

  function wijzigSubniveau(sleutel: string) {
    onInstellingenWijzig({ ...instellingen, subniveauSleutel: sleutel })
  }

  function wijzigHoofdniveau(sleutel: string | undefined) {
    onInstellingenWijzig({ ...instellingen, hoofdniveauSleutel: sleutel })
  }

  function toggleVeldZichtbaar(veldId: string) {
    const nieuweVelden = velden.map(v => v.id === veldId ? { ...v, zichtbaar: !v.zichtbaar } : v)
    onInstellingenWijzig({ ...instellingen, velden: nieuweVelden })
  }

  /* ── Toolbar-items configuratie ── */

  const niveauInhoud = (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
      <div>
        <label style={{ fontSize: 11, color: "#374151", display: "block", marginBottom: 3 }}>Subniveau</label>
        <select value={subniveauSleutel} onChange={e => wijzigSubniveau(e.target.value)} style={selectStijl}>
          {alleSleutels.map(k => (
            <option key={k} value={k}>{labelVoorSleutel(velden, k)}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 11, color: "#374151", display: "block", marginBottom: 3 }}>Hoofdniveau</label>
        <select value={hoofdniveauSleutel ?? ""} onChange={e => wijzigHoofdniveau(e.target.value || undefined)} style={selectStijl}>
          <option value="">— geen —</option>
          {alleSleutels.map(k => (
            <option key={k} value={k}>{labelVoorSleutel(velden, k)}</option>
          ))}
        </select>
      </div>
    </div>
  )

  const veldenInhoud = (
    <div style={{ padding: "8px 0", maxHeight: 300, overflowY: "auto" }}>
      {velden.map(v => (
        <label key={v.id}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px",
            cursor: "pointer", userSelect: "none", fontSize: 12, color: "#374151" }}>
          <input type="checkbox" checked={v.zichtbaar}
            onChange={() => toggleVeldZichtbaar(v.id)}
            style={{ cursor: "pointer", width: 14, height: 14, flexShrink: 0 }} />
          {v.label}
        </label>
      ))}
    </div>
  )

  const opslaanInhoud = (sluit: () => void) => (
    <>
      <button onClick={() => { exporteerSessie(instellingen, applicaties); sluit() }} style={menuItemStijl}>
        Sessie (JSON)
      </button>
      <hr style={{ margin: 0, border: "none", borderTop: "1px solid #f3f4f6" }} />
      {(["png", "jpg", "svg"] as const).map(f => (
        <button key={f} onClick={() => { if (plaatRef.current) exporteerAfbeelding(plaatRef.current, f); sluit() }} style={menuItemStijl}>
          {f.toUpperCase()}
        </button>
      ))}
    </>
  )

  const filterKnopStijl: React.CSSProperties = {
    padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 6,
    fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    backgroundColor: filterOpen ? "#eff6ff" : "white",
    borderColor: filterOpen ? "#93c5fd" : "#e5e7eb",
    color: filterOpen ? "#1d4ed8" : "#374151",
  }

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Niveau */}
        <DropdownMenu trigger={<><Layers size={13} /> Niveau ▾</>}>
          {niveauInhoud}
        </DropdownMenu>

        {/* Velden */}
        <DropdownMenu trigger={<><Eye size={13} /> Velden <span style={{ fontSize: 10, color: "#6b7280" }}>{aantalZichtbaar}/{velden.length}</span> ▾</>}>
          {veldenInhoud}
        </DropdownMenu>

        {/* Filter (directe knop, geen dropdown) */}
        <button onClick={onFilterToggle} style={filterKnopStijl}>
          ⊞ Filter
          {aantalActiefFilters > 0 && (
            <span style={{ fontSize: 10, backgroundColor: "#2563eb", color: "white",
              borderRadius: 999, padding: "1px 6px", fontWeight: 700 }}>
              {aantalActiefFilters}
            </span>
          )}
        </button>
      </div>

      {/* Opslaan */}
      <DropdownMenu trigger={<><Save size={13} /> Opslaan ▾</>} align="right" variant="primair">
        {opslaanInhoud}
      </DropdownMenu>
    </div>
  )
}
