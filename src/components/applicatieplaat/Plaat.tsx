"use client"
import { useRef, useState, useEffect } from "react"
import { Save, Layers, Eye } from "lucide-react"
import { toPng, toJpeg, toSvg } from "html-to-image"
import { useStore } from "@/lib/store"
import { groupBySubniveau, groupByHoofdniveau } from "@/lib/csvParser"
import Cluster, { kleuren } from "./Cluster"
import Organisatie from "./Organisatie"
import Legenda from "./Legenda"
import FilterPanel, { getFilterWaarde } from "./FilterPanel"
import { BREEKPUNT_MOBIEL } from "@/lib/constants"

function maakStamp() {
  const nu = new Date()
  return (
    nu.getFullYear().toString() +
    String(nu.getMonth() + 1).padStart(2, "0") +
    String(nu.getDate()).padStart(2, "0") +
    String(nu.getHours()).padStart(2, "0") +
    String(nu.getMinutes()).padStart(2, "0")
  )
}

function maakBestandsnaam(ext: string) {
  return `applicatieplaat_${maakStamp()}.${ext}`
}

const knopStyle: React.CSSProperties = {
  padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 6,
  fontSize: 12, cursor: "pointer", backgroundColor: "white", color: "#374151",
}

const menuItemStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "8px 14px", textAlign: "left",
  fontSize: 13, color: "#374151", background: "none", border: "none",
  cursor: "pointer",
}

export default function Plaat() {
  const { applicaties, instellingen, setInstellingen } = useStore()
  const plaatRef = useRef<HTMLDivElement>(null)
  const opslaanRef = useRef<HTMLDivElement>(null)
  const niveauRef = useRef<HTMLDivElement>(null)
  const veldenRef = useRef<HTMLDivElement>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [niveauOpen, setNiveauOpen] = useState(false)
  const [veldenOpen, setVeldenOpen] = useState(false)
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

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node
      if (opslaanRef.current && !opslaanRef.current.contains(target)) setMenuOpen(false)
      if (niveauRef.current && !niveauRef.current.contains(target)) setNiveauOpen(false)
      if (veldenRef.current && !veldenRef.current.contains(target)) setVeldenOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function exporteerSessie() {
    const sessie = { versie: 1, exportDatum: new Date().toISOString(), instellingen, applicaties }
    const blob = new Blob([JSON.stringify(sessie, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `applicatieplaat_sessie_${maakStamp()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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

  function wijzigSubniveau(sleutel: string) {
    setInstellingen({ ...instellingen, subniveauSleutel: sleutel })
    setFilters({})
  }

  function wijzigHoofdniveau(sleutel: string | undefined) {
    setInstellingen({ ...instellingen, hoofdniveauSleutel: sleutel })
    setFilters({})
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

    // Hoeveel kolommen passen er in de container?
    const totalKolommen = gridBreedte > 0
      ? Math.floor((gridBreedte + GAP) / (kaartBreedte + GAP))
      : maxAppsPerRij * 3

    // Schat de pixelhoogte van een cluster op basis van het aantal apps en kolommen
    function geschatteHoogte(clusterApps: typeof applicaties, maxKols: number): number {
      const kolommen = Math.min(clusterApps.length, maxKols)
      const kaartRijen = Math.ceil(clusterApps.length / kolommen)
      return 40 + kaartRijen * (kaartHoogte + GAP)  // overhead (header + padding) + rijen × (kaartje + gap)
    }

    function clusterGrid(clusters: [string, typeof applicaties][], kleurOffset = 0) {
      if (clusters.length === 0) return null

      const linksKolommen = Math.min(maxAppsPerRij, Math.max(1, totalKolommen))
      const rechtsKolommen = Math.max(0, totalKolommen - linksKolommen)
      const rechtsMaxPerRij = Math.min(rechtsKolommen, maxAppsPerRij)
      const linksKolBreedte = linksKolommen * kaartBreedte + (linksKolommen - 1) * GAP
      const rechtsKolBreedte = rechtsMaxPerRij * kaartBreedte + Math.max(0, rechtsMaxPerRij - 1) * GAP

      // Geen rechts ruimte of maar één cluster: alles verticaal stapelen
      if (rechtsMaxPerRij <= 0 || clusters.length === 1) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
            {clusters.map(([naam, clusterApps], i) => (
              <Cluster key={naam} naam={naam} applicaties={clusterApps}
                kleur={kleuren[(kleurOffset + i) % kleuren.length]}
                maxPerRij={Math.min(clusterApps.length, maxAppsPerRij)} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
            ))}
          </div>
        )
      }

      // "Vul de kortste kolom" algoritme:
      // Links start met IDA's hoogte, rechts op 0 → rechts wordt gevuld zolang het korter is.
      // Zodra rechts langer is dan links → vul links (onder IDA). Wisselt dynamisch.
      let linksHoogte = geschatteHoogte(clusters[0][1], linksKolommen)
      let rechtsHoogte = 0

      type Entry = { naam: string; apps: typeof applicaties; origIdx: number }
      const links: Entry[] = [{ naam: clusters[0][0], apps: clusters[0][1], origIdx: 0 }]
      const rechts: Entry[] = []

      for (let i = 1; i < clusters.length; i++) {
        const [naam, clusterApps] = clusters[i]
        if (rechtsHoogte <= linksHoogte) {
          rechts.push({ naam, apps: clusterApps, origIdx: i })
          rechtsHoogte += geschatteHoogte(clusterApps, rechtsMaxPerRij) + GAP
        } else {
          links.push({ naam, apps: clusterApps, origIdx: i })
          linksHoogte += geschatteHoogte(clusterApps, linksKolommen) + GAP
        }
      }

      return (
        <div style={{ display: "grid", gridTemplateColumns: `${linksKolBreedte}px ${rechtsKolBreedte}px`, gap: `${GAP}px`, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
            {links.map(({ naam, apps, origIdx }) => (
              <Cluster key={naam} naam={naam} applicaties={apps}
                kleur={kleuren[(kleurOffset + origIdx) % kleuren.length]}
                maxPerRij={linksKolommen} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
            {rechts.map(({ naam, apps, origIdx }) => (
              <Cluster key={naam} naam={naam} applicaties={apps}
                kleur={kleuren[(kleurOffset + origIdx) % kleuren.length]}
                maxPerRij={rechtsMaxPerRij} velden={velden} kaartHoogte={kaartHoogte} kaartBreedte={kaartBreedte} />
            ))}
          </div>
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

  function toggleVeldZichtbaar(veldId: string) {
    const nieuweVelden = velden.map(v => v.id === veldId ? { ...v, zichtbaar: !v.zichtbaar } : v)
    setInstellingen({ ...instellingen, velden: nieuweVelden })
  }

  function labelVoorSleutel(sleutel: string) {
    return velden.find(v => v.sleutel === sleutel)?.label ?? sleutel
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

  const selectStijl: React.CSSProperties = {
    width: "100%", padding: "4px 6px", borderRadius: 5, border: "1px solid #d1d5db",
    fontSize: 12, color: "#1f2937", backgroundColor: "white", cursor: "pointer",
  }

  const dropdownStijl: React.CSSProperties = {
    position: "absolute", left: 0, top: "calc(100% + 4px)",
    backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, minWidth: 200,
  }

  const aantalZichtbaar = velden.filter(v => v.zichtbaar).length

  const toolbar = (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Niveau menu */}
        <div ref={niveauRef} style={{ position: "relative" }}>
          <button onClick={() => { setNiveauOpen(o => !o); setVeldenOpen(false); setMenuOpen(false) }}
            style={{ ...knopStyle, display: "flex", alignItems: "center", gap: 5,
              backgroundColor: niveauOpen ? "#eff6ff" : "white",
              borderColor: niveauOpen ? "#93c5fd" : "#e5e7eb",
              color: niveauOpen ? "#1d4ed8" : "#374151" }}>
            <Layers size={13} /> Niveau ▾
          </button>
          {niveauOpen && (
            <div style={dropdownStijl}>
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#374151", display: "block", marginBottom: 3 }}>Subniveau</label>
                  <select value={subniveauSleutel} onChange={e => wijzigSubniveau(e.target.value)} style={selectStijl}>
                    {alleSleutels.map(k => (
                      <option key={k} value={k}>{labelVoorSleutel(k)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#374151", display: "block", marginBottom: 3 }}>Hoofdniveau</label>
                  <select value={hoofdniveauSleutel ?? ""} onChange={e => wijzigHoofdniveau(e.target.value || undefined)} style={selectStijl}>
                    <option value="">— geen —</option>
                    {alleSleutels.map(k => (
                      <option key={k} value={k}>{labelVoorSleutel(k)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Velden menu */}
        <div ref={veldenRef} style={{ position: "relative" }}>
          <button onClick={() => { setVeldenOpen(o => !o); setNiveauOpen(false); setMenuOpen(false) }}
            style={{ ...knopStyle, display: "flex", alignItems: "center", gap: 5,
              backgroundColor: veldenOpen ? "#eff6ff" : "white",
              borderColor: veldenOpen ? "#93c5fd" : "#e5e7eb",
              color: veldenOpen ? "#1d4ed8" : "#374151" }}>
            <Eye size={13} /> Velden
            <span style={{ fontSize: 10, color: "#6b7280" }}>{aantalZichtbaar}/{velden.length}</span>
            ▾
          </button>
          {veldenOpen && (
            <div style={dropdownStijl}>
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
            </div>
          )}
        </div>

        {/* Filter button */}
        <button onClick={() => { setFilterOpen(!filterOpen); setNiveauOpen(false); setVeldenOpen(false); setMenuOpen(false) }} style={{
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
      </div>

      <div ref={opslaanRef} style={{ position: "relative" }}>
        <button
          onClick={() => { setMenuOpen(o => !o); setNiveauOpen(false); setVeldenOpen(false) }}
          style={{ ...knopStyle, backgroundColor: "#2563eb", color: "white", borderColor: "#2563eb",
            display: "flex", alignItems: "center", gap: 5 }}>
          <Save size={13} /> Opslaan ▾
        </button>

        {menuOpen && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)",
            backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, minWidth: 160 }}>

            <button onClick={() => { exporteerSessie(); setMenuOpen(false) }} style={menuItemStyle}>
              Sessie (JSON)
            </button>
            <hr style={{ margin: 0, border: "none", borderTop: "1px solid #f3f4f6" }} />
            {(["png", "jpg", "svg"] as const).map(f => (
              <button key={f} onClick={() => { exporteer(f); setMenuOpen(false) }} style={menuItemStyle}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        )}
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
