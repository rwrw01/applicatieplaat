import type { Instellingen, VeldDefinitie, Applicatie } from "@/types"
import AppKaart from "@/components/applicatieplaat/AppKaart"

const VOORBEELD_WAARDEN: Record<string, string> = {
  tekst: "Voorbeeldtekst",
  datum: "2026-12-31",
  status: "groen",
  icoon: "ja",
}

function maakVoorbeeldApp(velden: VeldDefinitie[]): Applicatie {
  const app: Applicatie = {
    id: "voorbeeld",
    cluster: "Voorbeeld",
    naam: "Voorbeeld App",
    saas: true,
    complexiteit: "midden",
    afloopDatum: "2026-12-31",
    omgeving: "beide",
    status: "groen",
    leverancier: "Leverancier BV",
    organisatie: "Organisatie",
  }
  for (const veld of velden) {
    if (!(veld.sleutel in app) && veld.zichtbaar) {
      app[veld.sleutel] = VOORBEELD_WAARDEN[veld.type] ?? veld.label
    }
  }
  return app
}

interface Props {
  maxAppsPerRij: number
  kaartBreedte: number
  kaartHoogte: number
  subniveauSleutel: string
  hoofdniveauSleutel?: string
  velden: VeldDefinitie[]
  onChange: (w: Partial<Instellingen>) => void
}

export default function WeergaveSection({ maxAppsPerRij, kaartBreedte, kaartHoogte, subniveauSleutel, hoofdniveauSleutel, velden, onChange }: Props) {
  const opties = [
    "cluster",
    ...velden.filter(v => v.sleutel && v.sleutel !== "naam").map(v => v.sleutel),
  ].filter((s, i, arr) => arr.indexOf(s) === i) // uniek

  const selectStyle: React.CSSProperties = {
    padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db",
    fontSize: "13px", backgroundColor: "white", cursor: "pointer", minWidth: "160px",
  }

  return (
    <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "24px" }}>
      <h2 style={{ fontWeight: "600", fontSize: "15px", color: "#374151", marginBottom: "16px" }}>Weergave</h2>
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: "1 1 320px", maxWidth: "480px" }}>

        {/* Max apps per rij */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

        {/* Kaartbreedte */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Breedte applicatiekaart</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input type="range" min={120} max={240} step={10} value={kaartBreedte}
              onChange={e => onChange({ kaartBreedte: Number(e.target.value) })}
              style={{ flex: 1 }} />
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb", minWidth: "48px", textAlign: "center" }}>
              {kaartBreedte}px
            </span>
          </div>
        </div>

        {/* Kaarthoogte */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Minimale hoogte applicatiekaart</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input type="range" min={50} max={120} step={5} value={kaartHoogte}
              onChange={e => onChange({ kaartHoogte: Number(e.target.value) })}
              style={{ flex: 1 }} />
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb", minWidth: "48px", textAlign: "center" }}>
              {kaartHoogte}px
            </span>
          </div>
        </div>

        {/* Subniveau */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Subniveau (binnenste kader)</label>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Veld dat de groepering binnen de plaat bepaalt</p>
          <select value={subniveauSleutel} style={selectStyle}
            onChange={e => onChange({ subniveauSleutel: e.target.value })}>
            {opties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Hoofdniveau */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Hoofdniveau (buitenste kader)</label>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Optioneel: groepeert subniveaus per overkoepelend veld</p>
          <select value={hoofdniveauSleutel ?? ""} style={selectStyle}
            onChange={e => onChange({ hoofdniveauSleutel: e.target.value || undefined })}>
            <option value="">— geen —</option>
            {opties.filter(s => s !== subniveauSleutel).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Live preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, position: "sticky", top: "24px", alignSelf: "flex-start" }}>
        <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Voorbeeld kaart</label>
        <div style={{ width: kaartBreedte, transition: "width 0.1s" }}>
          <AppKaart app={maakVoorbeeldApp(velden)} velden={velden} kaartHoogte={kaartHoogte} />
        </div>
        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{kaartBreedte} × {kaartHoogte}px</p>
      </div>

      </div>
    </div>
  )
}
