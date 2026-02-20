import type { Instellingen } from "@/types"

interface Props {
  maxAppsPerRij: number
  onChange: (w: Partial<Instellingen>) => void
}

export default function WeergaveSection({ maxAppsPerRij, onChange }: Props) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "24px" }}>
      <h2 style={{ fontWeight: "600", fontSize: "15px", color: "#374151", marginBottom: "16px" }}>Weergave</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px" }}>
        <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Maximum applicaties per rij</label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <input type="range" min={1} max={12} value={maxAppsPerRij}
            onChange={e => onChange({ maxAppsPerRij: Number(e.target.value) })}
            style={{ flex: 1 }} />
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb", minWidth: "32px", textAlign: "center" }}>
            {maxAppsPerRij}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[3, 4, 5, 6, 8, 10, 12].map(n => (
            <button key={n} onClick={() => onChange({ maxAppsPerRij: n })}
              style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", border: "none", fontWeight: "500",
                backgroundColor: maxAppsPerRij === n ? "#2563eb" : "#f3f4f6",
                color: maxAppsPerRij === n ? "white" : "#374151" }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
