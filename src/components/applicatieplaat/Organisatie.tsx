"use client"
import { useRef, useState, useEffect } from "react"
import type { Applicatie, VeldDefinitie } from "@/types"
import Cluster, { kleuren } from "./Cluster"

interface Props {
  naam: string
  clusters: Record<string, Applicatie[]>
  velden: VeldDefinitie[]
  maxAppsPerRij: number
  kaartBreedte: number
  kaartHoogte: number
  startKleurIndex: number
}

export default function Organisatie({ naam, clusters, velden, maxAppsPerRij, kaartBreedte, kaartHoogte, startKleurIndex }: Props) {
  const gesorteerd = Object.entries(clusters).sort(([, a], [, b]) => b.length - a.length)
  const GAP = 8
  const contentRef = useRef<HTMLDivElement>(null)
  const [innerBreedte, setInnerBreedte] = useState(0)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const measure = () => setInnerBreedte(el.clientWidth)
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const totalKolommen = innerBreedte > 0
    ? Math.floor((innerBreedte + GAP) / (kaartBreedte + GAP))
    : maxAppsPerRij * 3

  function geschatteHoogte(clusterApps: Applicatie[], maxKols: number): number {
    const kolommen = Math.min(clusterApps.length, maxKols)
    const kaartRijen = Math.ceil(clusterApps.length / kolommen)
    return 40 + kaartRijen * (kaartHoogte + GAP)
  }

  const kolommenPerClusterKolom = Math.min(maxAppsPerRij, Math.max(1, totalKolommen))
  const aantalClusterKolommen = Math.max(1, Math.floor(totalKolommen / kolommenPerClusterKolom))
  const clusterKolomBreedte = kolommenPerClusterKolom * kaartBreedte + (kolommenPerClusterKolom - 1) * GAP

  const enkelKolom = aantalClusterKolommen <= 1 || gesorteerd.length <= 1

  // "Vul de kortste kolom" algoritme (N kolommen)
  type Entry = { naam: string; apps: Applicatie[]; origIdx: number }
  const kolomEntries: Entry[][] = Array.from({ length: aantalClusterKolommen }, () => [])
  const kolomHoogtes: number[] = new Array(aantalClusterKolommen).fill(0)

  if (!enkelKolom) {
    kolomEntries[0].push({ naam: gesorteerd[0][0], apps: gesorteerd[0][1], origIdx: 0 })
    kolomHoogtes[0] = geschatteHoogte(gesorteerd[0][1], kolommenPerClusterKolom)

    for (let i = 1; i < gesorteerd.length; i++) {
      const [clNaam, clApps] = gesorteerd[i]
      let kortsteIdx = 0
      for (let k = 1; k < aantalClusterKolommen; k++) {
        if (kolomHoogtes[k] < kolomHoogtes[kortsteIdx]) kortsteIdx = k
      }
      kolomEntries[kortsteIdx].push({ naam: clNaam, apps: clApps, origIdx: i })
      kolomHoogtes[kortsteIdx] += geschatteHoogte(clApps, kolommenPerClusterKolom) + GAP
    }
  }

  return (
    <div data-pdf-blok="organisatie" style={{
      border: "2px solid #cbd5e1", borderRadius: "16px", padding: "16px 20px",
      backgroundColor: "#f8fafc",
    }}>
      <h2 style={{
        fontWeight: "700", fontSize: "14px", color: "#1e293b",
        margin: "0 0 14px", letterSpacing: "0.02em",
      }}>
        {naam}
      </h2>
      <div ref={contentRef}>
        {enkelKolom ? (
          <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
            {gesorteerd.map(([clusterNaam, apps], i) => (
              <Cluster key={clusterNaam} naam={clusterNaam} applicaties={apps}
                kleur={kleuren[(startKleurIndex + i) % kleuren.length]}
                maxPerRij={Math.min(apps.length, maxAppsPerRij)} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
            ))}
          </div>
        ) : (() => {
          const gevuldeKolommen = kolomEntries.filter(k => k.length > 0)
          const gridTemplate = gevuldeKolommen.map(() => `${clusterKolomBreedte}px`).join(" ")
          return (
            <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: `${GAP}px`, alignItems: "start" }}>
              {gevuldeKolommen.map((entries, kolomIdx) => (
                <div key={kolomIdx} style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
                  {entries.map(({ naam: clNaam, apps, origIdx }) => (
                    <Cluster key={clNaam} naam={clNaam} applicaties={apps}
                      kleur={kleuren[(startKleurIndex + origIdx) % kleuren.length]}
                      maxPerRij={kolommenPerClusterKolom} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
                  ))}
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
