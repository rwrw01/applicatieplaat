export type Complexiteit = "laag" | "midden" | "hoog"
export type Omgeving = "client" | "server" | "beide"
export type Status = "groen" | "oranje" | "rood"
export type VeldType = "tekst" | "datum" | "icoon" | "status"

export interface IcoonMapping {
  waarde: string
  icoon: string
  kleur: string
}

export interface VeldDefinitie {
  id: string
  label: string
  sleutel: string
  type: VeldType
  zichtbaar: boolean
  maxLengte?: number
  icoonMappings?: IcoonMapping[]
}

export interface Applicatie {
  id: string
  organisatie?: string
  cluster: string
  naam: string
  saas?: boolean
  complexiteit?: Complexiteit
  afloopDatum?: string
  omgeving?: Omgeving
  status?: Status
  leverancier?: string
  [key: string]: unknown
}

export interface Instellingen {
  maxAppsPerRij: number
  kaartBreedte: number
  kaartHoogte: number
  subniveauSleutel: string
  hoofdniveauSleutel?: string
  velden: VeldDefinitie[]
}