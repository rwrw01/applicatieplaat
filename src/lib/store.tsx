"use client"
import { createContext, useContext, useState } from "react"
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
    { id: "v8", label: "Cluster",      sleutel: "cluster",      type: "tekst",  zichtbaar: false, maxLengte: 20 },
  ]
}

interface StoreContextType {
  applicaties: Applicatie[]
  setApplicaties: (apps: Applicatie[]) => void
  instellingen: Instellingen
  setInstellingen: (i: Instellingen) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [applicaties, setApplicaties] = useState<Applicatie[]>(standaardApplicaties)
  const [instellingen, setInstellingen] = useState<Instellingen>(defaultInstellingen)
  return (
    <StoreContext.Provider value={{ applicaties, setApplicaties, instellingen, setInstellingen }}>
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
    setInstellingen: () => {}
  }
  return ctx
}