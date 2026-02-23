import type { Applicatie, VeldDefinitie } from '@/types'
import { normaliseerApp } from './appUtils'
import { detecteerType } from './csvParser'

export interface ArchiMateElement {
  id: string
  naam: string
  type: string
  laag: string
  eigenschappen: Record<string, string>
}

export interface ArchiMateRelatie {
  id: string
  type: string
  bronId: string
  doelId: string
}

export interface ArchiMateModel {
  naam: string
  versie: string
  elementen: ArchiMateElement[]
  relaties: ArchiMateRelatie[]
  elementenPerType: Record<string, ArchiMateElement[]>
  beschikbareTypen: string[]
  eigenschapSleutels: string[]
}

export interface ArchiMateImportConfig {
  geselecteerdeTypen: string[]
  clusterStrategie: 'compositie' | 'eigenschap' | 'elementtype' | 'geen'
  clusterEigenschapSleutel?: string
  organisatieStrategie: 'serving' | 'eigenschap' | 'geen'
  organisatieEigenschapSleutel?: string
}

const LAAG_MAP: Record<string, string> = {
  strategy: 'strategy',
  business: 'business',
  application: 'application',
  technology: 'technology',
  motivation: 'motivation',
  implementation_migration: 'implementation_migration',
  other: 'other',
}

const VERBODEN_SLEUTELS = new Set(['__proto__', 'constructor', 'prototype'])

export function parseArchiMateXML(xmlTekst: string): ArchiMateModel {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlTekst, 'application/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Ongeldig XML-bestand: kon het ArchiMate-model niet lezen')
  }

  const root = doc.documentElement
  const naam = root.getAttribute('name') ?? 'Onbekend model'
  const versie = root.getAttribute('version') ?? ''

  const elementen: ArchiMateElement[] = []
  const relaties: ArchiMateRelatie[] = []
  const eigenschapSleutelsSet = new Set<string>()

  function verwerkFolder(folder: Element, laag: string) {
    for (const child of Array.from(folder.children)) {
      if (child.tagName === 'folder') {
        const subType = child.getAttribute('type')
        verwerkFolder(child, subType ? (LAAG_MAP[subType] ?? laag) : laag)
      } else if (child.tagName === 'element') {
        const xsiType = child.getAttribute('xsi:type') ?? ''
        const id = child.getAttribute('id') ?? ''
        const elementNaam = child.getAttribute('name') ?? ''
        const type = xsiType.replace('archimate:', '')

        if (laag === 'relations' || type.endsWith('Relationship')) {
          relaties.push({
            id,
            type,
            bronId: child.getAttribute('source') ?? '',
            doelId: child.getAttribute('target') ?? '',
          })
        } else {
          const eigenschappen: Record<string, string> = {}
          for (const prop of Array.from(child.children)) {
            if (prop.tagName !== 'property') continue
            const key = prop.getAttribute('key') ?? ''
            const value = prop.getAttribute('value') ?? ''
            if (key && !VERBODEN_SLEUTELS.has(key)) {
              eigenschappen[key] = value
              eigenschapSleutelsSet.add(key)
            }
          }
          elementen.push({ id, naam: elementNaam, type, laag, eigenschappen })
        }
      }
    }
  }

  for (const folder of Array.from(root.children)) {
    if (folder.tagName === 'folder') {
      const type = folder.getAttribute('type') ?? ''
      verwerkFolder(folder, LAAG_MAP[type] ?? type)
    }
  }

  const elementenPerType: Record<string, ArchiMateElement[]> = {}
  for (const el of elementen) {
    if (!elementenPerType[el.type]) elementenPerType[el.type] = []
    elementenPerType[el.type].push(el)
  }

  return {
    naam,
    versie,
    elementen,
    relaties,
    elementenPerType,
    beschikbareTypen: Object.keys(elementenPerType).sort(),
    eigenschapSleutels: [...eigenschapSleutelsSet].sort(),
  }
}

export async function analyseArchiMate(file: File): Promise<ArchiMateModel> {
  const tekst = await file.text()
  return parseArchiMateXML(tekst)
}

export function converteerNaarApplicaties(
  model: ArchiMateModel,
  config: ArchiMateImportConfig
): { applicaties: Applicatie[]; velden: VeldDefinitie[] } {
  const geselecteerd = model.elementen.filter(el =>
    config.geselecteerdeTypen.includes(el.type)
  )

  const elementMap = new Map(model.elementen.map(el => [el.id, el]))

  // Composition: target is child, source is parent
  const compositieOuders = new Map<string, string>()
  for (const rel of model.relaties) {
    if (rel.type === 'CompositionRelationship') {
      compositieOuders.set(rel.doelId, rel.bronId)
    }
  }

  // Serving: source serves target
  const servingDoelen = new Map<string, string[]>()
  for (const rel of model.relaties) {
    if (rel.type === 'ServingRelationship') {
      const bestaand = servingDoelen.get(rel.bronId) ?? []
      bestaand.push(rel.doelId)
      servingDoelen.set(rel.bronId, bestaand)
    }
  }

  function bepaalCluster(el: ArchiMateElement): string {
    switch (config.clusterStrategie) {
      case 'compositie': {
        const ouderId = compositieOuders.get(el.id)
        if (ouderId) {
          const ouder = elementMap.get(ouderId)
          return ouder?.naam ?? 'Overig'
        }
        return 'Overig'
      }
      case 'eigenschap':
        return config.clusterEigenschapSleutel
          ? (el.eigenschappen[config.clusterEigenschapSleutel] ?? 'Overig')
          : 'Overig'
      case 'elementtype':
        return el.type
      case 'geen':
      default:
        return 'Overig'
    }
  }

  function bepaalOrganisatie(el: ArchiMateElement): string | undefined {
    switch (config.organisatieStrategie) {
      case 'serving': {
        const doelen = servingDoelen.get(el.id) ?? []
        for (const doelId of doelen) {
          const doel = elementMap.get(doelId)
          if (doel && (doel.type === 'BusinessActor' || doel.type === 'BusinessRole')) {
            return doel.naam
          }
        }
        return undefined
      }
      case 'eigenschap':
        return config.organisatieEigenschapSleutel
          ? (el.eigenschappen[config.organisatieEigenschapSleutel] || undefined)
          : undefined
      case 'geen':
      default:
        return undefined
    }
  }

  // Verzamel alle property keys van geselecteerde elementen
  const gebruikteSleutels = new Set<string>()
  const eigenSchapWaarden: Record<string, string[]> = {}
  for (const el of geselecteerd) {
    for (const [key, value] of Object.entries(el.eigenschappen)) {
      gebruikteSleutels.add(key)
      if (!eigenSchapWaarden[key]) eigenSchapWaarden[key] = []
      eigenSchapWaarden[key].push(value)
    }
  }

  const applicaties: Applicatie[] = geselecteerd.map((el, index) => {
    const app: Applicatie = {
      id: `archimate-${index}`,
      naam: el.naam,
      cluster: bepaalCluster(el),
    }

    const org = bepaalOrganisatie(el)
    if (org) app.organisatie = org

    for (const [key, value] of Object.entries(el.eigenschappen)) {
      if (!VERBODEN_SLEUTELS.has(key)) {
        ;(app as Record<string, unknown>)[key] = value
      }
    }

    ;(app as Record<string, unknown>)['archiMateType'] = el.type

    return normaliseerApp(app)
  })

  // VeldDefinities opbouwen
  const velden: VeldDefinitie[] = [
    { id: 'v-naam', label: 'Naam', sleutel: 'naam', type: 'tekst', zichtbaar: true, maxLengte: 20 },
    { id: 'v-archimate-type', label: 'ArchiMate Type', sleutel: 'archiMateType', type: 'tekst', zichtbaar: false },
    ...[...gebruikteSleutels].map((key, i) => ({
      id: `v-prop-${i}`,
      label: key,
      sleutel: key,
      type: detecteerType(eigenSchapWaarden[key] ?? []),
      zichtbaar: true,
    } as VeldDefinitie)),
  ]

  return { applicaties, velden }
}
