import type { Applicatie, VeldDefinitie } from "@/types"
import AppKaart from "./AppKaart"

interface Props {
  naam: string
  applicaties: Applicatie[]
  kleur?: string
  maxPerRij?: number
  velden: VeldDefinitie[]
}

export const kleuren = [
  "#3b82f6","#22c55e","#a855f7",
  "#f97316","#14b8a6","#f43f5e",
  "#eab308","#6366f1","#ec4899",
]

export default function Cluster({ naam, applicaties, kleur, maxPerRij = 6, velden }: Props) {
  const borderColor = kleur ?? "#3b82f6"

  return (
    <div style={{
      border: `2px solid ${borderColor}`, borderRadius: "12px", padding: "16px",
      backgroundColor: "#f9fafb", display: "inline-block", width: "100%",
      breakInside: "avoid", marginBottom: "16px",
    }}>
      <h2 style={{ fontWeight: "700", fontSize: "12px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>
        {naam}
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${maxPerRij}, 160px)`,
        gap: "8px",
      }}>
        {applicaties.map(app => <AppKaart key={app.id} app={app} velden={velden} />)}
      </div>
    </div>
  )
}
