"use client"
import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { Applicatie, Instellingen } from "@/types"
import { standaardApplicaties } from "./standaardData"
import { getOfMaakSessieId, ruimOudeSessiesOp } from "./sessie"

const sessieId = typeof window !== "undefined" ? getOfMaakSessieId() : ""
const STORAGE_KEYS = {
  applicaties: `ap_${sessieId}_applicaties`,
  instellingen: `ap_${sessieId}_instellingen`,
}

const defaultInstellingen: Instellingen = {
  maxAppsPerRij: 3,
  kaartBreedte: 160,
  kaartHoogte: 66,
  subniveauSleutel: "cluster",
  velden: [
    { id: "v1", label: "Naam",         sleutel: "naam",         type: "tekst",  zichtbaar: true,  maxLengte: 20 },
    { id: "v2", label: "SaaS",         sleutel: "saas",         type: "icoon",  zichtbaar: true  },
    { id: "v3", label: "Complexiteit", sleutel: "complexiteit", type: "status", zichtbaar: true  },
    { id: "v4", label: "Omgeving",     sleutel: "omgeving",     type: "icoon",  zichtbaar: true  },
    { id: "v5", label: "Afloop datum", sleutel: "afloopDatum",  type: "datum",  zichtbaar: true  },
    { id: "v6", label: "Status",       sleutel: "status",       type: "status", zichtbaar: true  },
    { id: "v7", label: "Leverancier",  sleutel: "leverancier",  type: "tekst",  zichtbaar: true,  maxLengte: 15 },
  ]
}

function laadUitStorage<T>(sleutel: string, standaard: T): T {
  if (typeof window === "undefined") return standaard
  try {
    const opgeslagen = localStorage.getItem(sleutel)
    if (!opgeslagen) return standaard
    const parsed = JSON.parse(opgeslagen)
    // Basisvalidatie: zelfde type als standaard (array vs object)
    if (Array.isArray(standaard) !== Array.isArray(parsed)) return standaard
    if (typeof parsed !== typeof standaard) return standaard
    return parsed as T
  } catch {
    return standaard
  }
}

function slaOpInStorage<T>(sleutel: string, waarde: T) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(sleutel, JSON.stringify(waarde))
  } catch {
    console.warn("localStorage opslaan mislukt")
  }
}

interface StoreContextType {
  applicaties: Applicatie[]
  setApplicaties: (apps: Applicatie[]) => void
  instellingen: Instellingen
  setInstellingen: (i: Instellingen) => void
  resetNaarStandaard: () => void
  nieuweSessie: boolean
  bevestigSessie: () => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [applicaties, setApplicatiesState] = useState<Applicatie[]>(standaardApplicaties)
  const [instellingen, setInstellingenState] = useState<Instellingen>(defaultInstellingen)
  const [nieuweSessie, setNieuweSessie] = useState(false)

  useEffect(() => {
    // Eenmalige migratie: oude vaste sleutels → namespace
    if (!localStorage.getItem(STORAGE_KEYS.applicaties)) {
      const oudeApps = localStorage.getItem("applicaties")
      if (oudeApps) {
        localStorage.setItem(STORAGE_KEYS.applicaties, oudeApps)
        localStorage.removeItem("applicaties")
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.instellingen)) {
      const oudeInst = localStorage.getItem("instellingen")
      if (oudeInst) {
        localStorage.setItem(STORAGE_KEYS.instellingen, oudeInst)
        localStorage.removeItem("instellingen")
      }
    }
    ruimOudeSessiesOp(sessieId)

    const heeftData = !!localStorage.getItem(STORAGE_KEYS.applicaties)
    if (!heeftData) {
      setNieuweSessie(true)
      return
    }

    setApplicatiesState(laadUitStorage(STORAGE_KEYS.applicaties, standaardApplicaties))
    const opgeslagenInst = laadUitStorage(STORAGE_KEYS.instellingen, defaultInstellingen)
    const inst: Instellingen & Record<string, unknown> = { ...defaultInstellingen, ...opgeslagenInst }
    // Migreer oud formaat: organisatieEnabled → hoofdniveauSleutel
    if ("organisatieEnabled" in inst) {
      if (inst.organisatieEnabled) inst.hoofdniveauSleutel = "organisatie"
      delete inst.organisatieEnabled
    }
    setInstellingenState(inst as Instellingen)
  }, [])

  function setApplicaties(apps: Applicatie[]) {
    setApplicatiesState(apps)
    slaOpInStorage(STORAGE_KEYS.applicaties, apps)
  }

  function setInstellingen(i: Instellingen) {
    setInstellingenState(i)
    slaOpInStorage(STORAGE_KEYS.instellingen, i)
  }

  function resetNaarStandaard() {
    setApplicaties(standaardApplicaties)
    setInstellingen(defaultInstellingen)
  }

  function bevestigSessie() {
    setNieuweSessie(false)
  }

  return (
    <StoreContext.Provider value={{ applicaties, setApplicaties, instellingen, setInstellingen, resetNaarStandaard, nieuweSessie, bevestigSessie }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) return {
    applicaties: standaardApplicaties,
    setApplicaties: () => {},
    instellingen: defaultInstellingen,
    setInstellingen: () => {},
    resetNaarStandaard: () => {},
    nieuweSessie: false,
    bevestigSessie: () => {},
  }
  return ctx
}