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

/* ── Constanten ── */

const LAAG_MAP: Record<string, string> = {
  strategy: 'strategy',
  business: 'business',
  application: 'application',
  technology: 'technology',
  motivation: 'motivation',
  implementation_migration: 'implementation_migration',
  other: 'other',
}

const TYPE_LAAG_MAP: Record<string, string> = {
  // Application
  ApplicationComponent: 'application', ApplicationCollaboration: 'application',
  ApplicationFunction: 'application', ApplicationInteraction: 'application',
  ApplicationInterface: 'application', ApplicationProcess: 'application',
  ApplicationService: 'application', ApplicationEvent: 'application',
  DataObject: 'application',
  // Business
  BusinessActor: 'business', BusinessCollaboration: 'business',
  BusinessEvent: 'business', BusinessFunction: 'business',
  BusinessInteraction: 'business', BusinessInterface: 'business',
  BusinessObject: 'business', BusinessProcess: 'business',
  BusinessRole: 'business', BusinessService: 'business',
  Contract: 'business', Product: 'business', Representation: 'business',
  // Technology
  Artifact: 'technology', CommunicationNetwork: 'technology',
  Device: 'technology', Node: 'technology',
  Path: 'technology', SystemSoftware: 'technology',
  TechnologyCollaboration: 'technology', TechnologyEvent: 'technology',
  TechnologyFunction: 'technology', TechnologyInteraction: 'technology',
  TechnologyInterface: 'technology', TechnologyProcess: 'technology',
  TechnologyService: 'technology',
  // Physical
  DistributionNetwork: 'technology', Equipment: 'technology',
  Facility: 'technology', Material: 'technology',
  // Strategy
  Capability: 'strategy', CourseOfAction: 'strategy',
  Resource: 'strategy', ValueStream: 'strategy',
  // Motivation
  Assessment: 'motivation', Constraint: 'motivation',
  Driver: 'motivation', Goal: 'motivation',
  Meaning: 'motivation', Outcome: 'motivation',
  Principle: 'motivation', Requirement: 'motivation',
  Stakeholder: 'motivation', Value: 'motivation',
  // Implementation & Migration
  Deliverable: 'implementation_migration', Gap: 'implementation_migration',
  ImplementationEvent: 'implementation_migration', Plateau: 'implementation_migration',
  WorkPackage: 'implementation_migration',
  // Composite
  Grouping: 'other', Location: 'other',
}

const VERBODEN_SLEUTELS = new Set(['__proto__', 'constructor', 'prototype'])

/* ── Helpers ── */

function normaliseerRelatieType(type: string): string {
  if (!type.endsWith('Relationship')) return type + 'Relationship'
  return type
}

function bepaalLaag(type: string): string {
  return TYPE_LAAG_MAP[type] ?? 'other'
}

function eersteChildTekst(parent: Element, tagNaam: string, ns?: string): string {
  const child = ns
    ? parent.getElementsByTagNameNS(ns, tagNaam)[0]
    : parent.getElementsByTagName(tagNaam)[0]
  return child?.textContent?.trim() ?? ''
}

function bouwModel(
  naam: string,
  versie: string,
  elementen: ArchiMateElement[],
  relaties: ArchiMateRelatie[],
  eigenschapSleutelsSet: Set<string>,
): ArchiMateModel {
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

/* ── Archi Native Format Parser (.archimate bestanden) ── */

function parseNativeFormat(doc: Document): ArchiMateModel {
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
            type: normaliseerRelatieType(type),
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

  return bouwModel(naam, versie, elementen, relaties, eigenschapSleutelsSet)
}

/* ── Open Group Exchange Format Parser ── */

function parseExchangeFormat(doc: Document): ArchiMateModel {
  const root = doc.documentElement
  const ns = root.namespaceURI ?? ''

  // Model-naam uit <name> child-element
  const naam = eersteChildTekst(root, 'name', ns) || 'Onbekend model'
  // Exchange format heeft geen version attribuut op root
  const versie = ''

  // Property definitions resolven: identifier → naam
  const propDefMap = new Map<string, string>()
  const propDefsContainer = root.getElementsByTagNameNS(ns, 'propertyDefinitions')[0]
  if (propDefsContainer) {
    for (const propDef of Array.from(propDefsContainer.getElementsByTagNameNS(ns, 'propertyDefinition'))) {
      const id = propDef.getAttribute('identifier') ?? ''
      const defNaam = eersteChildTekst(propDef, 'name', ns)
      if (id && defNaam) propDefMap.set(id, defNaam)
    }
  }

  const elementen: ArchiMateElement[] = []
  const relaties: ArchiMateRelatie[] = []
  const eigenschapSleutelsSet = new Set<string>()

  // Elementen uitlezen
  const elemContainer = root.getElementsByTagNameNS(ns, 'elements')[0]
  if (elemContainer) {
    for (const el of Array.from(elemContainer.getElementsByTagNameNS(ns, 'element'))) {
      const id = el.getAttribute('identifier') ?? ''
      const elementNaam = eersteChildTekst(el, 'name', ns)
      const xsiType = el.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'type') ?? ''
      // Type kan prefix bevatten (bijv. "archimate:ApplicationComponent" of gewoon "ApplicationComponent")
      const type = xsiType.includes(':') ? xsiType.split(':').pop()! : xsiType

      const eigenschappen: Record<string, string> = {}
      // Properties via propertyDefinitionRef
      const propElements = el.getElementsByTagNameNS(ns, 'property')
      for (const prop of Array.from(propElements)) {
        const defRef = prop.getAttribute('propertyDefinitionRef') ?? ''
        const key = propDefMap.get(defRef) ?? defRef
        const value = eersteChildTekst(prop, 'value', ns)
        if (key && !VERBODEN_SLEUTELS.has(key)) {
          eigenschappen[key] = value
          eigenschapSleutelsSet.add(key)
        }
      }

      elementen.push({
        id,
        naam: elementNaam,
        type,
        laag: bepaalLaag(type),
        eigenschappen,
      })
    }
  }

  // Relaties uitlezen
  const relContainer = root.getElementsByTagNameNS(ns, 'relationships')[0]
  if (relContainer) {
    for (const rel of Array.from(relContainer.getElementsByTagNameNS(ns, 'relationship'))) {
      const id = rel.getAttribute('identifier') ?? ''
      const xsiType = rel.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'type') ?? ''
      const type = xsiType.includes(':') ? xsiType.split(':').pop()! : xsiType

      relaties.push({
        id,
        type: normaliseerRelatieType(type),
        bronId: rel.getAttribute('source') ?? '',
        doelId: rel.getAttribute('target') ?? '',
      })
    }
  }

  return bouwModel(naam, versie, elementen, relaties, eigenschapSleutelsSet)
}

/* ── Publieke API ── */

export function parseArchiMateXML(xmlTekst: string): ArchiMateModel {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlTekst, 'application/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Ongeldig XML-bestand: kon het ArchiMate-model niet lezen')
  }

  const root = doc.documentElement

  // Formaat detectie: Open Group Exchange Format vs. Archi Native
  const isExchangeFormat =
    root.namespaceURI?.includes('opengroup.org/xsd/archimate') === true ||
    (root.localName === 'model' && !root.getAttribute('name'))

  return isExchangeFormat
    ? parseExchangeFormat(doc)
    : parseNativeFormat(doc)
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
