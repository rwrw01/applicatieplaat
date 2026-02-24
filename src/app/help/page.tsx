"use client"
import { useState, useMemo } from "react"
import { Search } from "lucide-react"

interface Sectie {
  id: string
  titel: string
  zoekTekst: string
  inhoud: React.ReactNode
}

const imgStijl: React.CSSProperties = {
  display: "block", width: "100%", marginTop: 16,
  borderRadius: 8, border: "1px solid #e5e7eb",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
}

const secties: Sectie[] = [
  {
    id: "starten",
    titel: "Aan de slag",
    zoekTekst: "starten begin demo data eerste gebruik laden applicaties voorbeeld welkom",
    inhoud: (
      <div>
        <p>Bij het eerste gebruik verschijnt het welkomscherm. Kies hier hoe je wilt beginnen:</p>
        <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><strong>Standaardomgeving</strong> — laad een voorbeeldset van 40 gemeentelijke applicaties om de tool direct te verkennen</li>
          <li><strong>Laden vanuit JSON</strong> — herstel een eerder opgeslagen sessie door een JSON-bestand te slepen of te selecteren</li>
        </ul>
        <img src="/help/welkom.png" alt="Welkomscherm" style={imgStijl} />
        <p style={{ marginTop: 12 }}>Wil je daarna je eigen data laden? Ga dan naar <strong>Data in/uitvoeren</strong> in het menu.</p>
      </div>
    ),
  },
  {
    id: "csv-uploaden",
    titel: "CSV uploaden",
    zoekTekst: "csv uploaden bestand importeren drag drop slepen sleep template downloaden",
    inhoud: (
      <div>
        <p>Ga naar <strong>Data in/uitvoeren → CSV uploaden</strong>.</p>
        <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Sleep een CSV-bestand naar het uploadvlak, of klik om te bladeren</li>
          <li>Maximum bestandsgrootte: <strong>5 MB</strong></li>
          <li>Na het uploaden verschijnt de kolomkoppeling</li>
        </ul>
        <p style={{ marginTop: 12 }}>Heb je nog geen CSV? Download het <strong>CSV-template</strong> via de blauwe downloadknop. Het template is ingevuld met voorbeeldwaarden en bevat commentaarregels met de geldige waarden per veld.</p>
        <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#eff6ff", borderRadius: 8, borderLeft: "3px solid #3b82f6", fontSize: 13 }}>
          <strong>Tip:</strong> Het template past zich aan je huidige instellingen aan — als je al velden hebt geconfigureerd, staan die in het template.
        </div>
        <img src="/help/invoer-csv.png" alt="CSV upload scherm" style={imgStijl} />
      </div>
    ),
  },
  {
    id: "csv-vereisten",
    titel: "CSV-vereisten en veldtypen",
    zoekTekst: "csv vereisten format veldtypen kolommen headers codering utf-8 datum status tekst icoon ja nee groen oranje rood verplicht",
    inhoud: (
      <div>
        <p><strong>Bestandsformaat</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li>Codering: UTF-8 (standaard bij de meeste spreadsheetprogramma's)</li>
          <li>Scheidingsteken: komma (<code>,</code>) of puntkomma (<code>;</code>) — wordt automatisch herkend</li>
          <li>Eerste rij: kolomnamen (verplicht)</li>
          <li>Lege rijen worden overgeslagen</li>
        </ul>

        <p style={{ marginTop: 16 }}><strong>Verplichte kolommen</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>Naam</strong> — naam van de applicatie (unieke identifier)</li>
          <li><strong>Subniveau</strong> — cluster of groep (bijv. <em>Burgerzaken</em>)</li>
        </ul>

        <p style={{ marginTop: 16 }}><strong>Optionele kolommen</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>Hoofdniveau</strong> — bovenliggende organisatielaag (bijv. afdeling of domein)</li>
          <li>Alle overige kolommen worden als <em>veld</em> op de applicatiekaart getoond</li>
        </ul>

        <p style={{ marginTop: 16 }}><strong>Veldtypen</strong> — worden automatisch herkend:</p>
        <table style={{ marginTop: 8, width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "6px 10px", textAlign: "left", border: "1px solid #e5e7eb" }}>Type</th>
              <th style={{ padding: "6px 10px", textAlign: "left", border: "1px solid #e5e7eb" }}>Herkenning</th>
              <th style={{ padding: "6px 10px", textAlign: "left", border: "1px solid #e5e7eb" }}>Voorbeeldwaarden</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Tekst</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Standaard</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}><code>Microsoft, Centric, SAP</code></td>
            </tr>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Datum</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Datumnotatie herkend</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}><code>2026-12-31</code></td>
            </tr>
            <tr>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Ja/Nee</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Beperkt aantal unieke waarden</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}><code>ja, nee, true, false, 1, 0</code></td>
            </tr>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Icoon / Status</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>Beperkt aantal unieke waarden</td>
              <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}><code>groen, oranje, rood</code> — of eigen waarden</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "kolomkoppeling",
    titel: "Kolomkoppeling",
    zoekTekst: "kolomkoppeling mappen kolom rol subniveau hoofdniveau naam veld importmodus nieuw aanvullen",
    inhoud: (
      <div>
        <p>Na het uploaden van een CSV verschijnt de <strong>kolomkoppeling</strong>. Hier koppel je de kolommen uit je CSV aan de rollen binnen de applicatieplaat.</p>

        <p style={{ marginTop: 12 }}><strong>Rollen</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>Naam</strong> — de naam van de applicatie (verplicht, één kolom)</li>
          <li><strong>Subniveau</strong> — groeperingskolom voor clusters (verplicht, één kolom)</li>
          <li><strong>Hoofdniveau</strong> — bovenliggende groepering, bijv. domein of afdeling (optioneel)</li>
          <li><strong>Veld</strong> — overige kolommen die als veld op de kaart verschijnen</li>
          <li><strong>Negeren</strong> — kolommen die je niet wilt importeren</li>
        </ul>

        <p style={{ marginTop: 12 }}><strong>Importmodus</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>Nieuw</strong> — vervangt alle bestaande applicaties en past de veldindeling aan</li>
          <li><strong>Aanvullen</strong> — voegt alleen nieuwe applicaties toe (op basis van naam, geen duplicaten)</li>
        </ul>

        <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#eff6ff", borderRadius: 8, borderLeft: "3px solid #3b82f6", fontSize: 13 }}>
          <strong>Tip:</strong> Bekijk de voorbeeldwaarden in de tabel om te controleren of het veldtype correct is herkend. Je kunt het type handmatig aanpassen.
        </div>
      </div>
    ),
  },
  {
    id: "handmatig",
    titel: "Handmatig invoeren en sessies",
    zoekTekst: "handmatig invoeren formulier sessie exporteren importeren json opslaan laden",
    inhoud: (
      <div>
        <p><strong>Handmatig invoeren</strong><br />Via <em>Data in/uitvoeren → Handmatig</em> kun je één applicatie tegelijk toevoegen via een formulier. Handig voor kleine aanpassingen of aanvullingen.</p>

        <p style={{ marginTop: 14 }}><strong>Sessie exporteren en importeren</strong><br />Via <em>Data in/uitvoeren → Sessie</em> of via de exportknop op de applicatieplaat kun je de volledige sessie opslaan als JSON-bestand. Dit bestand bevat alle applicaties en instellingen.</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 6 }}>
          <li>Exporteer als JSON om de sessie op te slaan</li>
          <li>Importeer een sessie-JSON om verder te werken waar je gebleven was</li>
          <li>Handig om sessies te delen met collega's</li>
        </ul>
      </div>
    ),
  },
  {
    id: "applicatieplaat",
    titel: "De applicatieplaat",
    zoekTekst: "applicatieplaat kaarten clusters overzicht weergave groepen organisatie statuskleur groen oranje rood kaart toolbar niveau velden",
    inhoud: (
      <div>
        <p>De applicatieplaat toont alle applicaties als kaarten, gegroepeerd in <strong>clusters</strong> (subniveau). Optioneel kun je een <strong>hoofdniveau</strong> instellen voor een extra bovenliggende laag (bijv. per afdeling of domein).</p>

        <img src="/help/plaat.png" alt="Applicatieplaat overzicht" style={imgStijl} />

        <p style={{ marginTop: 16 }}><strong>Toolbar</strong><br />Boven de plaat vind je vier knoppen:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>Niveau</strong> — kies het subniveau (clustergroepering) en optioneel een hoofdniveau (organisatielaag)</li>
          <li><strong>Velden</strong> — schakel velden aan/uit op de applicatiekaart. Wijzigingen zijn direct zichtbaar</li>
          <li><strong>Filter</strong> — open het filterpaneel om applicaties te filteren op veldwaarden</li>
          <li><strong>Opslaan</strong> — exporteer als JSON-sessie, PNG, JPG of SVG</li>
        </ul>

        <img src="/help/plaat-toolbar.png" alt="Toolbar met Niveau en Velden menu" style={imgStijl} />

        <p style={{ marginTop: 16 }}><strong>Applicatiekaart</strong><br />Elke kaart toont:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li>De naam van de applicatie</li>
          <li>De ingestelde velden (maximaal 12)</li>
          <li>Een gekleurde stip voor de statuskleur (groen / oranje / rood) indien geconfigureerd</li>
        </ul>

        <p style={{ marginTop: 12 }}><strong>Clusters</strong><br />Clusters zijn de groepen op het subniveau. Elke cluster heeft een eigen kleur (automatisch toegewezen). Het aantal applicaties per rij is instelbaar via Instellingen.</p>
      </div>
    ),
  },
  {
    id: "filterbalk",
    titel: "Filter",
    zoekTekst: "filter filterbalk zoeken selectie checkboxes alles geen reset datum verlopen binnenkort actief badge tellen",
    inhoud: (
      <div>
        <p>Open het filterpaneel via de <strong>Filter</strong>-knop in de toolbar. Het getal op de knop toont hoeveel filters actief zijn.</p>

        <img src="/help/plaat-filter.png" alt="Applicatieplaat met open filterpaneel" style={imgStijl} />

        <p style={{ marginTop: 16 }}><strong>Hoe werkt filteren?</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li>Het filterpaneel toont alle velden met 2 of meer unieke waarden</li>
          <li>Gebruik de checkboxes om waarden aan of uit te zetten</li>
          <li>Klik <strong>Geen</strong> om alle opties voor een sectie te deselecteren, <strong>Alles</strong> om ze terug te zetten</li>
          <li>Meerdere filters combineren is mogelijk — alleen applicaties die aan alle filters voldoen worden getoond</li>
          <li>Klik op de sectietitel om een filtersectie in of uit te klappen</li>
        </ul>

        <p style={{ marginTop: 12 }}><strong>Datumvelden</strong><br />Datumkolommen worden automatisch omgezet naar drie filteropties:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>Verlopen</strong> — aflooptermijn is verstreken</li>
          <li><strong>Binnenkort</strong> — verloopt binnen 90 dagen</li>
          <li><strong>Actief</strong> — geldig voor meer dan 90 dagen</li>
        </ul>

        <p style={{ marginTop: 12 }}>Klik <strong>Reset</strong> bovenaan het filterpaneel om alle filters in één keer te wissen.</p>
      </div>
    ),
  },
  {
    id: "instellingen",
    titel: "Instellingen",
    zoekTekst: "instellingen velden configureren toevoegen verwijderen volgorde type tekst datum icoon status mappings icoonmapping max apps rij kaartbreedte kaarthoogte opslaan",
    inhoud: (
      <div>
        <p>Via <strong>Instellingen</strong> pas je de weergave en velddefinities aan.</p>

        <img src="/help/instellingen.png" alt="Instellingenpagina" style={imgStijl} />

        <p style={{ marginTop: 16 }}><strong>Weergave</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>Applicaties per rij</strong> — hoeveel kaarten naast elkaar per cluster (standaard: 6)</li>
          <li><strong>Kaartbreedte / Kaarthoogte</strong> — afmetingen van de applicatiekaart in pixels</li>
        </ul>

        <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#eff6ff", borderRadius: 8, borderLeft: "3px solid #3b82f6", fontSize: 13 }}>
          <strong>Let op:</strong> Subniveau en hoofdniveau stel je in via de <strong>Niveau</strong>-knop in de toolbar op de applicatieplaat, niet in Instellingen.
        </div>

        <p style={{ marginTop: 16 }}><strong>Velden op de applicatiekaart</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li>Maximaal 12 velden tegelijk</li>
          <li>Gebruik de checkbox om een veld zichtbaar te maken (ook snel aan te passen via <strong>Velden</strong> in de toolbar)</li>
          <li>Gebruik de pijlknoppen om de volgorde te wijzigen</li>
          <li>Stel per veld het <strong>type</strong> in: tekst, datum, icoon of status</li>
          <li>Bij type <em>tekst</em> kun je de maximale lengte instellen (tekst wordt afgekapt)</li>
        </ul>

        <p style={{ marginTop: 12 }}><strong>Icoon-mappings</strong><br />Voor velden van het type <em>icoon</em> kun je tot 3 waarden koppelen aan een icoon en kleur. Zo verschijnt er een visueel symbool op de kaart in plaats van platte tekst.</p>

        <p style={{ marginTop: 12 }}>Klik <strong>Opslaan</strong> om je wijzigingen door te voeren. Met <strong>Annuleren</strong> herstel je de vorige staat.</p>
      </div>
    ),
  },
  {
    id: "exporteren",
    titel: "Exporteren",
    zoekTekst: "exporteren export png jpg svg pdf json sessie papierformaat a4 a3 a2 a1 a0 oriëntatie liggend staand afbeelding",
    inhoud: (
      <div>
        <p>Via de <strong>exportknop</strong> rechtsboven op de applicatieplaat kun je de plaat opslaan in verschillende formaten.</p>

        <p style={{ marginTop: 12 }}><strong>Beschikbare formaten</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 4 }}>
          <li><strong>PNG</strong> — hoge kwaliteit afbeelding (300 DPI), geschikt voor presentaties</li>
          <li><strong>JPG</strong> — compacte afbeelding met witte achtergrond</li>
          <li><strong>SVG</strong> — vectorafbeelding, schaalbaar zonder kwaliteitsverlies</li>
          <li><strong>PDF</strong> — kies papierformaat (A0 t/m A4) en oriëntatie (liggend of staand)</li>
          <li><strong>JSON-sessie</strong> — slaat alle applicaties en instellingen op; te importeren via <em>Data in/uitvoeren → Sessie</em></li>
        </ul>

        <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#eff6ff", borderRadius: 8, borderLeft: "3px solid #3b82f6", fontSize: 13 }}>
          <strong>Tip:</strong> Voor grote applicatieplaten gebruik je bij PDF het formaat A1 of A0 voor de beste leesbaarheid.
        </div>
      </div>
    ),
  },
]

function highlight(tekst: string, zoekterm: string): React.ReactNode {
  if (!zoekterm) return tekst
  const regex = new RegExp(`(${zoekterm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const delen = tekst.split(regex)
  return delen.map((deel, i) =>
    regex.test(deel) ? <mark key={i} style={{ backgroundColor: "#fef08a", borderRadius: 2 }}>{deel}</mark> : deel
  )
}

export default function HelpPage() {
  const [zoekterm, setZoekterm] = useState("")

  const zichtbareSectiesIds = useMemo(() => {
    if (!zoekterm.trim()) return secties.map(s => s.id)
    const term = zoekterm.toLowerCase()
    return secties
      .filter(s => s.titel.toLowerCase().includes(term) || s.zoekTekst.toLowerCase().includes(term))
      .map(s => s.id)
  }, [zoekterm])

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", marginBottom: 8 }}>Help</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Uitleg over alle functies van de applicatieplaat.</p>

      {/* Zoekbalk */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
        <input
          type="text"
          placeholder="Zoek in de help..."
          value={zoekterm}
          onChange={e => setZoekterm(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8,
            border: "1px solid #d1d5db", fontSize: 14, outline: "none",
            boxSizing: "border-box", color: "#1f2937", backgroundColor: "white",
          }}
        />
      </div>

      {/* Ankerlinks */}
      {!zoekterm && (
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginBottom: 28 }}>
          {secties.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}>
              {s.titel}
            </a>
          ))}
        </nav>
      )}

      {/* Geen resultaten */}
      {zichtbareSectiesIds.length === 0 && (
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Geen resultaten gevonden voor <em>"{zoekterm}"</em>.</p>
      )}

      {/* Secties */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {secties
          .filter(s => zichtbareSectiesIds.includes(s.id))
          .map(s => (
            <div key={s.id} id={s.id} style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 12 }}>
                {highlight(s.titel, zoekterm)}
              </h2>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                {s.inhoud}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
