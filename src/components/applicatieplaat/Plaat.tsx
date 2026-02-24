"use client"
import { useRef, useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { groupBySubniveau, groupByHoofdniveau } from "@/lib/csvParser"
import Cluster, { kleuren } from "./Cluster"
import Organisatie from "./Organisatie"
import Legenda from "./Legenda"
import Toolbar from "./Toolbar"
import FilterPanel, { getFilterWaarde } from "./FilterPanel"
import { BREEKPUNT_MOBIEL } from "@/lib/constants"

export default function Plaat() {
  const { applicaties, instellingen, setInstellingen } = useStore()
  const plaatRef = useRef<HTMLDivElement>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [gridBreedte, setGridBreedte] = useState(0)

  useEffect(() => {
    const el = plaatRef.current
    if (!el) return
    const measure = () => setGridBreedte(el.clientWidth - 32)
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [applicaties.length > 0])

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < BREEKPUNT_MOBIEL) }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (applicaties.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "256px", color: "#9ca3af" }}>
        <p style={{ fontSize: "18px", fontWeight: "500" }}>Nog geen data</p>
        <p style={{ fontSize: "14px", marginTop: "4px" }}>Ga naar <strong>Data in/uitvoeren</strong> om applicaties toe te voegen.</p>
      </div>
    )
  }

  const { maxAppsPerRij, kaartBreedte = 160, kaartHoogte = 66, velden, subniveauSleutel, hoofdniveauSleutel } = instellingen
  const aantalActiefFilters = Object.values(filters).filter(a => a.length > 0).length

  const alleSleutels = Array.from(
    applicaties.reduce((map, a) => {
      for (const k of Object.keys(a)) {
        if (k !== "id" && !map.has(k.toLowerCase())) map.set(k.toLowerCase(), k)
      }
      return map
    }, new Map<string, string>()).values()
  ).sort()

  function handleInstellingenWijzig(nieuweInstellingen: typeof instellingen) {
    const niveauGewijzigd =
      nieuweInstellingen.subniveauSleutel !== instellingen.subniveauSleutel ||
      nieuweInstellingen.hoofdniveauSleutel !== instellingen.hoofdniveauSleutel
    setInstellingen(nieuweInstellingen)
    if (niveauGewijzigd) setFilters({})
  }

  const zichtbareApps = applicaties.filter(app =>
    Object.entries(filters).every(([sleutel, geselecteerd]) => {
      if (!geselecteerd.length) return true
      const veld = velden.find(v => v.sleutel === sleutel)
      return geselecteerd.includes(getFilterWaarde(sleutel, app, veld))
    })
  )

  function bouwPlaatInhoud(apps: typeof applicaties): React.ReactNode {
    const GAP = 8

    const totalKolommen = gridBreedte > 0
      ? Math.floor((gridBreedte + GAP) / (kaartBreedte + GAP))
      : maxAppsPerRij * 3

    function geschatteHoogte(clusterApps: typeof applicaties, maxKols: number): number {
      const kolommen = Math.min(clusterApps.length, maxKols)
      const kaartRijen = Math.ceil(clusterApps.length / kolommen)
      return 40 + kaartRijen * (kaartHoogte + GAP)
    }

    function clusterGrid(clusters: [string, typeof applicaties][], kleurOffset = 0) {
      if (clusters.length === 0) return null

      const kolommenPerClusterKolom = Math.min(maxAppsPerRij, Math.max(1, totalKolommen))
      const aantalClusterKolommen = Math.max(1, Math.floor(totalKolommen / kolommenPerClusterKolom))
      const clusterKolomBreedte = kolommenPerClusterKolom * kaartBreedte + (kolommenPerClusterKolom - 1) * GAP

      if (aantalClusterKolommen <= 1 || clusters.length === 1) {
        return (
          <div data-pdf-blok="cluster-kolom" style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
            {clusters.map(([naam, clusterApps], i) => (
              <Cluster key={naam} naam={naam} applicaties={clusterApps}
                kleur={kleuren[(kleurOffset + i) % kleuren.length]}
                maxPerRij={Math.min(clusterApps.length, maxAppsPerRij)} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
            ))}
          </div>
        )
      }

      type Entry = { naam: string; apps: typeof applicaties; origIdx: number }
      const kolomEntries: Entry[][] = Array.from({ length: aantalClusterKolommen }, () => [])
      const kolomHoogtes: number[] = new Array(aantalClusterKolommen).fill(0)

      // Eerste cluster altijd naar kolom 0
      kolomEntries[0].push({ naam: clusters[0][0], apps: clusters[0][1], origIdx: 0 })
      kolomHoogtes[0] = geschatteHoogte(clusters[0][1], kolommenPerClusterKolom)

      for (let i = 1; i < clusters.length; i++) {
        const [naam, clusterApps] = clusters[i]
        let kortsteIdx = 0
        for (let k = 1; k < aantalClusterKolommen; k++) {
          if (kolomHoogtes[k] < kolomHoogtes[kortsteIdx]) kortsteIdx = k
        }
        kolomEntries[kortsteIdx].push({ naam, apps: clusterApps, origIdx: i })
        kolomHoogtes[kortsteIdx] += geschatteHoogte(clusterApps, kolommenPerClusterKolom) + GAP
      }

      const gevuldeKolommen = kolomEntries.filter(k => k.length > 0)
      const gridTemplate = gevuldeKolommen.map(() => `${clusterKolomBreedte}px`).join(" ")

      return (
        <div data-pdf-blok="cluster-grid" style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: `${GAP}px`, alignItems: "start" }}>
          {gevuldeKolommen.map((entries, kolomIdx) => (
            <div key={kolomIdx} data-pdf-blok="cluster-kolom" style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
              {entries.map(({ naam, apps, origIdx }) => (
                <Cluster key={naam} naam={naam} applicaties={apps}
                  kleur={kleuren[(kleurOffset + origIdx) % kleuren.length]}
                  maxPerRij={kolommenPerClusterKolom} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
              ))}
            </div>
          ))}
        </div>
      )
    }

    if (hoofdniveauSleutel) {
      const groepen = groupByHoofdniveau(apps, subniveauSleutel, hoofdniveauSleutel)
      let kleurTeller = 0
      const entries = Object.entries(groepen)
      const losSubs = entries.filter(([hoofd]) => hoofd === "")
        .flatMap(([, subs]) => Object.entries(subs))
        .sort(([, a], [, b]) => b.length - a.length)
      const hoofdEntries = entries.filter(([hoofd]) => hoofd !== "")
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {losSubs.length > 0 && clusterGrid(losSubs, kleurTeller)}
          {hoofdEntries.map(([hoofdNaam, subs]) => {
            const startIdx = kleurTeller
            kleurTeller += Object.keys(subs).length
            return (
              <Organisatie key={hoofdNaam} naam={hoofdNaam} clusters={subs}
                velden={velden} maxAppsPerRij={maxAppsPerRij} kaartBreedte={kaartBreedte} kaartHoogte={kaartHoogte} startKleurIndex={startIdx} />
            )
          })}
        </div>
      )
    }

    const gesorteerd = Object.entries(groupBySubniveau(apps, subniveauSleutel))
      .sort(([, a], [, b]) => b.length - a.length)
    return clusterGrid(gesorteerd)
  }

  const filterPanel = (
    <FilterPanel
      velden={velden}
      applicaties={applicaties}
      filters={filters}
      onChange={setFilters}
      subniveauSleutel={subniveauSleutel}
      hoofdniveauSleutel={hoofdniveauSleutel}
      alleSleutels={alleSleutels}
      onSluit={() => setFilterOpen(false)}
    />
  )

  return (
    <div>
      <Toolbar
        instellingen={instellingen}
        applicaties={applicaties}
        alleSleutels={alleSleutels}
        filterOpen={filterOpen}
        aantalActiefFilters={aantalActiefFilters}
        plaatRef={plaatRef}
        onFilterToggle={() => setFilterOpen(o => !o)}
        onInstellingenWijzig={handleInstellingenWijzig}
      />

      {/* Mobiel: overlay */}
      {isMobile && filterOpen && (
        <>
          <div onClick={() => setFilterOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 40 }} />
          <div style={{ position: "fixed", top: 0, left: 0, width: "260px", height: "100vh", zIndex: 50 }}>
            {filterPanel}
          </div>
        </>
      )}

      {/* Desktop: inline links */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {!isMobile && filterOpen && (
          <div style={{ width: 220, flexShrink: 0, alignSelf: "stretch",
            position: "sticky", top: 0, maxHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column",
            borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            {filterPanel}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div ref={plaatRef} style={{ backgroundColor: "white", padding: 16 }}>
            {zichtbareApps.length === 0
              ? <p style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "32px 0" }}>
                  Geen applicaties voldoen aan de filters.
                </p>
              : bouwPlaatInhoud(zichtbareApps)
            }
            <Legenda velden={velden} />
          </div>
        </div>
      </div>
    </div>
  )
}
