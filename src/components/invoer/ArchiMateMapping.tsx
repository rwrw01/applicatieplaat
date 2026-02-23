'use client'
import { useState, useMemo } from 'react'
import type { ArchiMateModel, ArchiMateImportConfig } from '@/lib/archimateParser'
import { converteerNaarApplicaties } from '@/lib/archimateParser'

type ClusterStrategie = ArchiMateImportConfig['clusterStrategie']
type OrganisatieStrategie = ArchiMateImportConfig['organisatieStrategie']
export type ImportModus = 'nieuw' | 'aanvullen'

interface Props {
  model: ArchiMateModel
  onImporteer: (config: ArchiMateImportConfig, modus: ImportModus) => void
  onAnnuleer: () => void
}

const TYPE_LABELS: Record<string, string> = {
  ApplicationComponent: 'Applicatiecomponent',
  ApplicationFunction: 'Applicatiefunctie',
  ApplicationService: 'Applicatieservice',
  BusinessActor: 'Bedrijfsactor',
  BusinessProcess: 'Bedrijfsproces',
  BusinessRole: 'Bedrijfsrol',
  BusinessService: 'Bedrijfsservice',
  Capability: 'Capability',
  Device: 'Apparaat',
  Driver: 'Drijfveer',
  Goal: 'Doel',
  Grouping: 'Groepering',
  Node: 'Node',
  Representation: 'Representatie',
  Requirement: 'Vereiste',
  WorkPackage: 'Werkpakket',
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type
}

const stijlen = {
  sectie: {
    marginBottom: 24,
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  } as React.CSSProperties,
  sectieKop: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 12,
  } as React.CSSProperties,
  checkboxRij: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
    fontSize: 13,
    color: '#374151',
  } as React.CSSProperties,
  badge: {
    fontSize: 11,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: '1px 8px',
  } as React.CSSProperties,
  radioGroep: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    marginBottom: 12,
  } as React.CSSProperties,
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
  } as React.CSSProperties,
  select: {
    padding: '4px 8px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
    marginLeft: 8,
  } as React.CSSProperties,
  tabel: {
    width: '100%',
    fontSize: 12,
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '6px 10px',
    borderBottom: '2px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  td: {
    padding: '6px 10px',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  knopPrimair: {
    padding: '8px 20px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    cursor: 'pointer',
  } as React.CSSProperties,
  knopSecundair: {
    padding: '8px 20px',
    borderRadius: 8,
    fontSize: 13,
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
  } as React.CSSProperties,
  modusGroep: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  } as React.CSSProperties,
}

export default function ArchiMateMapping({ model, onImporteer, onAnnuleer }: Props) {
  const [geselecteerdeTypen, setGeselecteerdeTypen] = useState<Set<string>>(() => {
    const standaard = new Set<string>()
    if (model.elementenPerType['ApplicationComponent']) standaard.add('ApplicationComponent')
    return standaard
  })
  const [clusterStrategie, setClusterStrategie] = useState<ClusterStrategie>('compositie')
  const [clusterEigenschap, setClusterEigenschap] = useState('')
  const [organisatieStrategie, setOrganisatieStrategie] = useState<OrganisatieStrategie>('geen')
  const [organisatieEigenschap, setOrganisatieEigenschap] = useState('')
  const [modus, setModus] = useState<ImportModus>('nieuw')

  const config: ArchiMateImportConfig = useMemo(() => ({
    geselecteerdeTypen: [...geselecteerdeTypen],
    clusterStrategie,
    clusterEigenschapSleutel: clusterEigenschap || undefined,
    organisatieStrategie,
    organisatieEigenschapSleutel: organisatieEigenschap || undefined,
  }), [geselecteerdeTypen, clusterStrategie, clusterEigenschap, organisatieStrategie, organisatieEigenschap])

  const preview = useMemo(() => {
    if (geselecteerdeTypen.size === 0) return { applicaties: [], velden: [] }
    return converteerNaarApplicaties(model, config)
  }, [model, config, geselecteerdeTypen])

  function toggleType(type: string) {
    setGeselecteerdeTypen(prev => {
      const nieuw = new Set(prev)
      if (nieuw.has(type)) nieuw.delete(type)
      else nieuw.add(type)
      return nieuw
    })
  }

  // Tel relaties
  const aantalCompositie = model.relaties.filter(r => r.type === 'CompositionRelationship').length
  const aantalServing = model.relaties.filter(r => r.type === 'ServingRelationship').length

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
          ArchiMate-model: {model.naam}
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          {model.elementen.length} elementen, {model.relaties.length} relaties
          {model.versie && ` \u2022 versie ${model.versie}`}
        </p>
      </div>

      {/* Sectie 1: Elementtypen */}
      <div style={stijlen.sectie}>
        <div style={stijlen.sectieKop}>1. Elementtypen selecteren</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {model.beschikbareTypen.map(type => (
            <label key={type} style={stijlen.checkboxRij}>
              <input
                type="checkbox"
                checked={geselecteerdeTypen.has(type)}
                onChange={() => toggleType(type)}
              />
              <span>{typeLabel(type)}</span>
              <span style={stijlen.badge}>
                {model.elementenPerType[type]?.length ?? 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sectie 2: Groepering */}
      <div style={stijlen.sectie}>
        <div style={stijlen.sectieKop}>2. Groepering</div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Subniveau (cluster)
          </div>
          <div style={stijlen.radioGroep}>
            <label style={stijlen.radioLabel}>
              <input
                type="radio" name="cluster"
                checked={clusterStrategie === 'compositie'}
                onChange={() => setClusterStrategie('compositie')}
                disabled={aantalCompositie === 0}
              />
              Via compositie-relaties (parent element)
              {aantalCompositie === 0 && <span style={{ color: '#9ca3af', fontSize: 11 }}>(geen gevonden)</span>}
            </label>
            <label style={stijlen.radioLabel}>
              <input
                type="radio" name="cluster"
                checked={clusterStrategie === 'eigenschap'}
                onChange={() => setClusterStrategie('eigenschap')}
                disabled={model.eigenschapSleutels.length === 0}
              />
              Via eigenschap
              {clusterStrategie === 'eigenschap' && model.eigenschapSleutels.length > 0 && (
                <select
                  style={stijlen.select}
                  value={clusterEigenschap}
                  onChange={e => setClusterEigenschap(e.target.value)}
                >
                  <option value="">— kies —</option>
                  {model.eigenschapSleutels.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </label>
            <label style={stijlen.radioLabel}>
              <input
                type="radio" name="cluster"
                checked={clusterStrategie === 'elementtype'}
                onChange={() => setClusterStrategie('elementtype')}
              />
              Via elementtype
            </label>
            <label style={stijlen.radioLabel}>
              <input
                type="radio" name="cluster"
                checked={clusterStrategie === 'geen'}
                onChange={() => setClusterStrategie('geen')}
              />
              Geen groepering
            </label>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Hoofdniveau (organisatie)
          </div>
          <div style={stijlen.radioGroep}>
            <label style={stijlen.radioLabel}>
              <input
                type="radio" name="organisatie"
                checked={organisatieStrategie === 'serving'}
                onChange={() => setOrganisatieStrategie('serving')}
                disabled={aantalServing === 0}
              />
              Via serving-relaties (BusinessActor)
              {aantalServing === 0 && <span style={{ color: '#9ca3af', fontSize: 11 }}>(geen gevonden)</span>}
            </label>
            <label style={stijlen.radioLabel}>
              <input
                type="radio" name="organisatie"
                checked={organisatieStrategie === 'eigenschap'}
                onChange={() => setOrganisatieStrategie('eigenschap')}
                disabled={model.eigenschapSleutels.length === 0}
              />
              Via eigenschap
              {organisatieStrategie === 'eigenschap' && model.eigenschapSleutels.length > 0 && (
                <select
                  style={stijlen.select}
                  value={organisatieEigenschap}
                  onChange={e => setOrganisatieEigenschap(e.target.value)}
                >
                  <option value="">— kies —</option>
                  {model.eigenschapSleutels.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </label>
            <label style={stijlen.radioLabel}>
              <input
                type="radio" name="organisatie"
                checked={organisatieStrategie === 'geen'}
                onChange={() => setOrganisatieStrategie('geen')}
              />
              Niet gebruiken
            </label>
          </div>
        </div>
      </div>

      {/* Sectie 3: Preview + Import */}
      <div style={stijlen.sectie}>
        <div style={stijlen.sectieKop}>
          3. Voorbeeld
          {preview.applicaties.length > 0 && (
            <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
              ({preview.applicaties.length} applicaties)
            </span>
          )}
        </div>

        {geselecteerdeTypen.size === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
            Selecteer minimaal \u00e9\u00e9n elementtype
          </p>
        ) : preview.applicaties.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
            Geen elementen gevonden voor de geselecteerde typen
          </p>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: 300 }}>
            <table style={stijlen.tabel}>
              <thead>
                <tr>
                  <th style={stijlen.th}>Naam</th>
                  <th style={stijlen.th}>Cluster</th>
                  {organisatieStrategie !== 'geen' && <th style={stijlen.th}>Organisatie</th>}
                  <th style={stijlen.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                {preview.applicaties.slice(0, 10).map((app, i) => (
                  <tr key={i}>
                    <td style={stijlen.td}>{app.naam}</td>
                    <td style={stijlen.td}>{app.cluster}</td>
                    {organisatieStrategie !== 'geen' && (
                      <td style={stijlen.td}>{app.organisatie ?? '—'}</td>
                    )}
                    <td style={{ ...stijlen.td, fontSize: 11, color: '#9ca3af' }}>
                      {String(app.archiMateType ?? '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.applicaties.length > 10 && (
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
                ... en {preview.applicaties.length - 10} meer
              </p>
            )}
          </div>
        )}
      </div>

      {/* Import modus + knoppen */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#374151' }}>
        Import modus
      </div>
      <div style={stijlen.modusGroep}>
        <label style={stijlen.radioLabel}>
          <input
            type="radio" name="modus"
            checked={modus === 'nieuw'}
            onChange={() => setModus('nieuw')}
          />
          Nieuw — overschrijft alles
        </label>
        <label style={stijlen.radioLabel}>
          <input
            type="radio" name="modus"
            checked={modus === 'aanvullen'}
            onChange={() => setModus('aanvullen')}
          />
          Aanvullen — behoudt huidige data
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button style={stijlen.knopSecundair} onClick={onAnnuleer}>
          Annuleren
        </button>
        <button
          style={{
            ...stijlen.knopPrimair,
            ...(geselecteerdeTypen.size === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          }}
          disabled={geselecteerdeTypen.size === 0}
          onClick={() => onImporteer(config, modus)}
        >
          Importeren ({preview.applicaties.length})
        </button>
      </div>
    </div>
  )
}
