"use client"
import { useStore } from "@/lib/store"
import { groupByClusters } from "@/lib/csvParser"
import Cluster, { kleuren } from "./Cluster"

export default function Plaat() {
  const { applicaties, instellingen } = useStore()

  if (applicaties.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "256px", color: "#9ca3af" }}>
        <p style={{ fontSize: "18px", fontWeight: "500" }}>Nog geen data</p>
        <p style={{ fontSize: "14px", marginTop: "4px" }}>Ga naar <strong>Data invoeren</strong> om applicaties toe te voegen.</p>
      </div>
    )
  }

  const clusters = groupByClusters(applicaties)

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
      {Object.entries(clusters).map(([naam, apps], index) => (
        <Cluster
          key={naam}
          naam={naam}
          applicaties={apps}
          kleur={kleuren[index % kleuren.length]}
          maxPerRij={instellingen.maxAppsPerRij}
          velden={instellingen.velden}
        />
      ))}
    </div>
  )
}
