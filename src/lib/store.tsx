"use client"
import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { Applicatie, Instellingen } from "@/types"
import { standaardApplicaties } from "./standaardData"

const defaultInstellingen: Instellingen = {
  maxAppsPerRij: 6,
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
    return opgeslagen ? JSON.parse(opgeslagen) : standaard
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
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [applicaties, setApplicatiesState] = useState<Applicatie[]>(standaardApplicaties)
  const [instellingen, setInstellingenState] = useState<Instellingen>(defaultInstellingen)

  useEffect(() => {
    setApplicatiesState(laadUitStorage("applicaties", standaardApplicaties))
    setInstellingenState(laadUitStorage("instellingen", defaultInstellingen))
  }, [])

  function setApplicaties(apps: Applicatie[]) {
    setApplicatiesState(apps)
    slaOpInStorage("applicaties", apps)
  }

  function setInstellingen(i: Instellingen) {
    setInstellingenState(i)
    slaOpInStorage("instellingen", i)
  }

  function resetNaarStandaard() {
    setApplicaties(standaardApplicaties)
    setInstellingen(defaultInstellingen)
  }

  return (
    <StoreContext.Provider value={{ applicaties, setApplicaties, instellingen, setInstellingen, resetNaarStandaard }}>
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
    resetNaarStandaard: () => {}
  }
  return ctx
}