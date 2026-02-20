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

  const linksKolommen = Math.min(maxAppsPerRij, Math.max(1, totalKolommen))
  const rechtsKolommen = Math.max(0, totalKolommen - linksKolommen)
  const rechtsMaxPerRij = Math.min(rechtsKolommen, maxAppsPerRij)
  const linksKolBreedte = linksKolommen * kaartBreedte + (linksKolommen - 1) * GAP
  const rechtsKolBreedte = rechtsMaxPerRij * kaartBreedte + Math.max(0, rechtsMaxPerRij - 1) * GAP

  const enkelKolom = rechtsMaxPerRij <= 0 || gesorteerd.length <= 1

  // "Vul de kortste kolom" algoritme
  type Entry = { naam: string; apps: Applicatie[]; origIdx: number }
  let linksEntries: Entry[] = []
  let rechtsEntries: Entry[] = []

  if (!enkelKolom) {
    let linksHoogte = geschatteHoogte(gesorteerd[0][1], linksKolommen)
    let rechtsHoogte = 0
    linksEntries = [{ naam: gesorteerd[0][0], apps: gesorteerd[0][1], origIdx: 0 }]

    for (let i = 1; i < gesorteerd.length; i++) {
      const [clNaam, clApps] = gesorteerd[i]
      if (rechtsHoogte <= linksHoogte) {
        rechtsEntries.push({ naam: clNaam, apps: clApps, origIdx: i })
        rechtsHoogte += geschatteHoogte(clApps, rechtsMaxPerRij) + GAP
      } else {
        linksEntries.push({ naam: clNaam, apps: clApps, origIdx: i })
        linksHoogte += geschatteHoogte(clApps, linksKolommen) + GAP
      }
    }
  }

  return (
    <div style={{
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
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `${linksKolBreedte}px ${rechtsKolBreedte}px`, gap: `${GAP}px`, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
              {linksEntries.map(({ naam: clNaam, apps, origIdx }) => (
                <Cluster key={clNaam} naam={clNaam} applicaties={apps}
                  kleur={kleuren[(startKleurIndex + origIdx) % kleuren.length]}
                  maxPerRij={linksKolommen} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
              {rechtsEntries.map(({ naam: clNaam, apps, origIdx }) => (
                <Cluster key={clNaam} naam={clNaam} applicaties={apps}
                  kleur={kleuren[(startKleurIndex + origIdx) % kleuren.length]}
                  maxPerRij={rechtsMaxPerRij} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
