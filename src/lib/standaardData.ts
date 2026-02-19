import type { Applicatie } from "@/types"

export const standaardApplicaties: Applicatie[] = [
  // Cluster 1: Dienstverlening & Klantcontact
  { id: "1",  cluster: "Dienstverlening", naam: "iBabs",              saas: true,  complexiteit: "midden", afloopDatum: "2026-03-01", omgeving: "client", status: "groen",  leverancier: "iBabs BV" },
  { id: "2",  cluster: "Dienstverlening", naam: "Decos JOIN",         saas: false, complexiteit: "hoog",   afloopDatum: "2025-06-30", omgeving: "server", status: "oranje", leverancier: "Decos" },
  { id: "3",  cluster: "Dienstverlening", naam: "KCC Telefonie",      saas: true,  complexiteit: "laag",   afloopDatum: "2027-01-01", omgeving: "beide",  status: "groen",  leverancier: "ENGIE" },
  { id: "4",  cluster: "Dienstverlening", naam: "MijnGemeente app",   saas: true,  complexiteit: "midden", afloopDatum: "2026-08-01", omgeving: "client", status: "groen",  leverancier: "PinkRoccade" },
  { id: "5",  cluster: "Dienstverlening", naam: "Melding Openbare Ruimte", saas: true, complexiteit: "laag", afloopDatum: "2027-03-01", omgeving: "client", status: "groen", leverancier: "Sigmax" },
  { id: "6",  cluster: "Dienstverlening", naam: "Zaaksysteem",        saas: false, complexiteit: "hoog",   afloopDatum: "2025-12-31", omgeving: "server", status: "oranje", leverancier: "Rx.Mission" },
  { id: "7",  cluster: "Dienstverlening", naam: "DigiD Aansluiting",  saas: true,  complexiteit: "midden", afloopDatum: "2026-06-01", omgeving: "beide",  status: "groen",  leverancier: "Logius" },
  { id: "8",  cluster: "Dienstverlening", naam: "E-formulieren",      saas: true,  complexiteit: "laag",   afloopDatum: "2027-01-01", omgeving: "client", status: "groen",  leverancier: "ESuit" },

  // Cluster 2: Burgerzaken & Basisregistraties
  { id: "9",  cluster: "Burgerzaken", naam: "BRP Bevragingen",        saas: false, complexiteit: "hoog",   afloopDatum: "2026-01-01", omgeving: "server", status: "groen",  leverancier: "PinkRoccade" },
  { id: "10", cluster: "Burgerzaken", naam: "PIVA",                   saas: false, complexiteit: "hoog",   afloopDatum: "2025-09-30", omgeving: "server", status: "rood",   leverancier: "Centric" },
  { id: "11", cluster: "Burgerzaken", naam: "Suwinet Inkijk",         saas: true,  complexiteit: "laag",   afloopDatum: "2027-06-01", omgeving: "client", status: "groen",  leverancier: "BKWI" },
  { id: "12", cluster: "Burgerzaken", naam: "BAG Beheer",             saas: false, complexiteit: "midden", afloopDatum: "2026-04-01", omgeving: "server", status: "groen",  leverancier: "Cyclomedia" },
  { id: "13", cluster: "Burgerzaken", naam: "BGT Inwinning",          saas: true,  complexiteit: "midden", afloopDatum: "2026-12-01", omgeving: "beide",  status: "groen",  leverancier: "Esri" },
  { id: "14", cluster: "Burgerzaken", naam: "Reisdocumenten",         saas: false, complexiteit: "hoog",   afloopDatum: "2026-07-01", omgeving: "client", status: "oranje", leverancier: "Morpho" },
  { id: "15", cluster: "Burgerzaken", naam: "Rijbewijzen",            saas: false, complexiteit: "midden", afloopDatum: "2026-07-01", omgeving: "client", status: "oranje", leverancier: "RDW" },
  { id: "16", cluster: "Burgerzaken", naam: "GBA-V Online",           saas: true,  complexiteit: "laag",   afloopDatum: "2027-01-01", omgeving: "client", status: "groen",  leverancier: "RvIG" },

  // Cluster 3: Sociaal Domein
  { id: "17", cluster: "Sociaal Domein", naam: "Suite4Sociaal",       saas: false, complexiteit: "hoog",   afloopDatum: "2026-06-30", omgeving: "server", status: "oranje", leverancier: "Centric" },
  { id: "18", cluster: "Sociaal Domein", naam: "Mens Centraal",       saas: true,  complexiteit: "midden", afloopDatum: "2027-01-01", omgeving: "beide",  status: "groen",  leverancier: "Stipter" },
  { id: "19", cluster: "Sociaal Domein", naam: "Schuldhulp Matching", saas: true,  complexiteit: "laag",   afloopDatum: "2026-09-01", omgeving: "client", status: "groen",  leverancier: "NVVK" },
  { id: "20", cluster: "Sociaal Domein", naam: "Jeugdzorg portaal",   saas: true,  complexiteit: "midden", afloopDatum: "2026-03-01", omgeving: "client", status: "groen",  leverancier: "Youforce" },
  { id: "21", cluster: "Sociaal Domein", naam: "WMO Aanvragen",       saas: false, complexiteit: "hoog",   afloopDatum: "2025-12-01", omgeving: "server", status: "rood",   leverancier: "Centric" },
  { id: "22", cluster: "Sociaal Domein", naam: "Participatiewet",     saas: false, complexiteit: "hoog",   afloopDatum: "2026-01-31", omgeving: "server", status: "oranje", leverancier: "PinkRoccade" },
  { id: "23", cluster: "Sociaal Domein", naam: "Leerlingenvervoer",   saas: true,  complexiteit: "laag",   afloopDatum: "2027-05-01", omgeving: "client", status: "groen",  leverancier: "OV-Regio" },
  { id: "24", cluster: "Sociaal Domein", naam: "Bijzondere Bijstand", saas: false, complexiteit: "midden", afloopDatum: "2026-08-01", omgeving: "server", status: "groen",  leverancier: "Stipter" },

  // Cluster 4: Ruimte & Omgeving
  { id: "25", cluster: "Ruimte & Omgeving", naam: "DSO Aansluiting",  saas: true,  complexiteit: "hoog",   afloopDatum: "2026-10-01", omgeving: "beide",  status: "groen",  leverancier: "Kadaster" },
  { id: "26", cluster: "Ruimte & Omgeving", naam: "Vergunningen (VTH)", saas: false, complexiteit: "hoog", afloopDatum: "2025-11-30", omgeving: "server", status: "rood",   leverancier: "Rx.Mission" },
  { id: "27", cluster: "Ruimte & Omgeving", naam: "GIS Viewer",       saas: true,  complexiteit: "midden", afloopDatum: "2027-02-01", omgeving: "client", status: "groen",  leverancier: "Esri" },
  { id: "28", cluster: "Ruimte & Omgeving", naam: "Planon FMIS",      saas: false, complexiteit: "hoog",   afloopDatum: "2026-05-01", omgeving: "server", status: "oranje", leverancier: "Planon" },
  { id: "29", cluster: "Ruimte & Omgeving", naam: "OpenWave",         saas: false, complexiteit: "hoog",   afloopDatum: "2026-03-01", omgeving: "server", status: "oranje", leverancier: "Roxit" },
  { id: "30", cluster: "Ruimte & Omgeving", naam: "Toezicht & Handhaving", saas: true, complexiteit: "midden", afloopDatum: "2027-01-01", omgeving: "beide", status: "groen", leverancier: "Sigmax" },
  { id: "31", cluster: "Ruimte & Omgeving", naam: "Begraafplaatsen",  saas: true,  complexiteit: "laag",   afloopDatum: "2027-06-01", omgeving: "client", status: "groen",  leverancier: "Infodrome" },
  { id: "32", cluster: "Ruimte & Omgeving", naam: "Kabels & Leidingen", saas: true, complexiteit: "laag",  afloopDatum: "2026-11-01", omgeving: "client", status: "groen",  leverancier: "KLIC" },

  // Cluster 5: Bedrijfsvoering & ICT
  { id: "33", cluster: "Bedrijfsvoering", naam: "SAP HR",             saas: false, complexiteit: "hoog",   afloopDatum: "2026-12-31", omgeving: "server", status: "groen",  leverancier: "SAP" },
  { id: "34", cluster: "Bedrijfsvoering", naam: "AFAS Finance",       saas: true,  complexiteit: "hoog",   afloopDatum: "2027-01-01", omgeving: "beide",  status: "groen",  leverancier: "AFAS" },
  { id: "35", cluster: "Bedrijfsvoering", naam: "TOPdesk",            saas: true,  complexiteit: "midden", afloopDatum: "2026-06-01", omgeving: "client", status: "groen",  leverancier: "TOPdesk" },
  { id: "36", cluster: "Bedrijfsvoering", naam: "Microsoft 365",      saas: true,  complexiteit: "laag",   afloopDatum: "2027-03-01", omgeving: "beide",  status: "groen",  leverancier: "Microsoft" },
  { id: "37", cluster: "Bedrijfsvoering", naam: "OpenText DMS",       saas: false, complexiteit: "hoog",   afloopDatum: "2025-10-31", omgeving: "server", status: "rood",   leverancier: "OpenText" },
  { id: "38", cluster: "Bedrijfsvoering", naam: "Topicus KeyHub",     saas: true,  complexiteit: "midden", afloopDatum: "2026-09-01", omgeving: "beide",  status: "groen",  leverancier: "Topicus" },
  { id: "39", cluster: "Bedrijfsvoering", naam: "Integraal Beheer",   saas: false, complexiteit: "midden", afloopDatum: "2026-04-01", omgeving: "server", status: "oranje", leverancier: "PinkRoccade" },
  { id: "40", cluster: "Bedrijfsvoering", naam: "BI Dashboard",       saas: true,  complexiteit: "midden", afloopDatum: "2027-02-01", omgeving: "client", status: "groen",  leverancier: "Qlik" },
]