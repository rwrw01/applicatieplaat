"use client"
import { useRef, useState, useEffect } from "react"
import { toPng, toJpeg, toSvg } from "html-to-image"
import { useStore } from "@/lib/store"
import { groupBySubniveau, groupByHoofdniveau } from "@/lib/csvParser"
import Cluster, { kleuren } from "./Cluster"
import Organisatie from "./Organisatie"
import Legenda from "./Legenda"
import FilterPanel, { getFilterWaarde } from "./FilterPanel"
import { BREEKPUNT_MOBIEL } from "@/lib/constants"

function maakBestandsnaam(ext: string) {
  const nu = new Date()
  const stamp =
    nu.getFullYear().toString() +
    String(nu.getMonth() + 1).padStart(2, "0") +
    String(nu.getDate()).padStart(2, "0") +
    String(nu.getHours()).padStart(2, "0") +
    String(nu.getMinutes()).padStart(2, "0")
  return `applicatieplaat_${stamp}.${ext}`
}

const knopStyle: React.CSSProperties = {
  padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 6,
  fontSize: 12, cursor: "pointer", backgroundColor: "white", color: "#374151",
}

export default function Plaat() {
  const { applicaties, instellingen } = useStore()
  const plaatRef = useRef<HTMLDivElement>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < BREEKPUNT_MOBIEL) }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  async function exporteer(formaat: "png" | "jpg" | "svg") {
    if (!plaatRef.current) return
    const pixelRatio = 300 / 96
    let dataUrl: string
    if (formaat === "png")      dataUrl = await toPng(plaatRef.current, { pixelRatio })
    else if (formaat === "jpg") dataUrl = await toJpeg(plaatRef.current, { pixelRatio, quality: 0.95 })
    else                        dataUrl = await toSvg(plaatRef.current)
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = maakBestandsnaam(formaat)
    a.click()
  }

  if (applicaties.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "256px", color: "#9ca3af" }}>
        <p style={{ fontSize: "18px", fontWeight: "500" }}>Nog geen data</p>
        <p style={{ fontSize: "14px", marginTop: "4px" }}>Ga naar <strong>Data invoeren</strong> om applicaties toe te voegen.</p>
      </div>
    )
  }

  const { maxAppsPerRij, velden, subniveauSleutel, hoofdniveauSleutel } = instellingen
  const columnWidth = `${maxAppsPerRij * 160 + (maxAppsPerRij - 1) * 8 + 32}px`
  const aantalActiefFilters = Object.values(filters).filter(a => a.length > 0).length

  // Gefilterde applicaties
  const zichtbareApps = applicaties.filter(app =>
    Object.entries(filters).every(([sleutel, geselecteerd]) => {
      if (!geselecteerd.length) return true
      const veld = velden.find(v => v.sleutel === sleutel)
      return geselecteerd.includes(getFilterWaarde(sleutel, app, veld))
    })
  )

  function bouwPlaatInhoud(apps: typeof applicaties): React.ReactNode {
    if (hoofdniveauSleutel) {
      const groepen = groupByHoofdniveau(apps, subniveauSleutel, hoofdniveauSleutel)
      let kleurTeller = 0
      const entries = Object.entries(groepen)
      const losEntries = entries.filter(([hoofd]) => hoofd === "")
      const hoofdEntries = entries.filter(([hoofd]) => hoofd !== "")
      const losSubs = losEntries.flatMap(([, subs]) => Object.entries(subs))
      return (
        <>
          {losSubs.length > 0 && (
            <div style={{ columnWidth, columnGap: "16px" }}>
              {losSubs.map(([naam, subApps]) => {
                const node = (
                  <Cluster key={naam} naam={naam} applicaties={subApps}
                    kleur={kleuren[kleurTeller % kleuren.length]}
                    maxPerRij={maxAppsPerRij} velden={velden} />
                )
                kleurTeller++
                return node
              })}
            </div>
          )}
          {hoofdEntries.map(([hoofdNaam, subs]) => {
            const startIdx = kleurTeller
            kleurTeller += Object.keys(subs).length
            return (
              <Organisatie key={hoofdNaam} naam={hoofdNaam} clusters={subs}
                velden={velden} maxAppsPerRij={maxAppsPerRij} startKleurIndex={startIdx} />
            )
          })}
        </>
      )
    }
    const subs = groupBySubniveau(apps, subniveauSleutel)
    return (
      <div style={{ columnWidth, columnGap: "16px" }}>
        {Object.entries(subs).map(([naam, subApps], index) => (
          <Cluster key={naam} naam={naam} applicaties={subApps}
            kleur={kleuren[index % kleuren.length]}
            maxPerRij={maxAppsPerRij} velden={velden} />
        ))}
      </div>
    )
  }

  const filterPanel = (
    <FilterPanel
      velden={velden}
      applicaties={applicaties}
      filters={filters}
      onChange={setFilters}
      subniveauSleutel={subniveauSleutel}
      hoofdniveauSleutel={hoofdniveauSleutel}
      onSluit={() => setFilterOpen(false)}
    />
  )

  const toolbar = (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <button onClick={() => setFilterOpen(!filterOpen)} style={{
        ...knopStyle,
        backgroundColor: filterOpen ? "#eff6ff" : "white",
        borderColor: filterOpen ? "#93c5fd" : "#e5e7eb",
        color: filterOpen ? "#1d4ed8" : "#374151",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        ⊞ Filter
        {aantalActiefFilters > 0 && (
          <span style={{ fontSize: 10, backgroundColor: "#2563eb", color: "white",
            borderRadius: 999, padding: "1px 6px", fontWeight: 700 }}>
            {aantalActiefFilters}
          </span>
        )}
      </button>
      <div style={{ display: "flex", gap: 8 }}>
        {(["png", "jpg", "svg"] as const).map(f => (
          <button key={f} onClick={() => exporteer(f)} style={knopStyle}>
            ↓ {f.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      {toolbar}

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
            <Legenda velden={velden} />
            {zichtbareApps.length === 0
              ? <p style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "32px 0" }}>
                  Geen applicaties voldoen aan de filters.
                </p>
              : bouwPlaatInhoud(zichtbareApps)
            }
          </div>
        </div>
      </div>
    </div>
  )
}
