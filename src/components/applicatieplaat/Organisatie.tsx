import type { Applicatie, VeldDefinitie } from "@/types"
import Cluster, { kleuren } from "./Cluster"

interface Props {
  naam: string
  clusters: Record<string, Applicatie[]>
  velden: VeldDefinitie[]
  maxAppsPerRij: number
  startKleurIndex: number
}

export default function Organisatie({ naam, clusters, velden, maxAppsPerRij, startKleurIndex }: Props) {
  const clusterEntries = Object.entries(clusters)
  const columnWidth = maxAppsPerRij * 160 + (maxAppsPerRij - 1) * 8 + 32

  return (
    <div style={{
      border: "2px solid #cbd5e1", borderRadius: "16px", padding: "16px 20px",
      backgroundColor: "#f8fafc", marginBottom: "20px",
    }}>
      <h2 style={{
        fontWeight: "700", fontSize: "14px", color: "#1e293b",
        margin: "0 0 14px", letterSpacing: "0.02em",
      }}>
        {naam}
      </h2>
      <div style={{ columnWidth: `${columnWidth}px`, columnGap: "16px" }}>
        {clusterEntries.map(([clusterNaam, apps], i) => (
          <Cluster
            key={clusterNaam}
            naam={clusterNaam}
            applicaties={apps}
            kleur={kleuren[(startKleurIndex + i) % kleuren.length]}
            maxPerRij={maxAppsPerRij}
            velden={velden}
          />
        ))}
      </div>
    </div>
  )
}
