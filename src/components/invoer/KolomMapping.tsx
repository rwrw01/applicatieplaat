'use client'
import { useState } from 'react'
import type { VeldDefinitie, VeldType } from '@/types'
import type { CSVAnalyse, KolomConfig } from '@/lib/csvParser'
import { detecteerType } from '@/lib/csvParser'

const VELD_TYPES: VeldType[] = ['tekst', 'datum', 'icoon', 'status']

interface KolomState {
  header: string
  type: VeldType
  rol: 'hoofdniveau' | 'subniveau' | 'naam' | 'veld'
}

function initKolomStates(analyse: CSVAnalyse): KolomState[] {
  return analyse.headers.map(header => {
    const waarden = analyse.preview.map(r => r[header] ?? '')
    const type = detecteerType(waarden)
    const lc = header.toLowerCase()
    const rol: KolomState['rol'] =
      lc === 'organisatie' || lc === 'organization' || lc === 'organisation' || lc === 'hoofdniveau' ? 'hoofdniveau' :
      lc === 'cluster' || lc === 'subniveau' ? 'subniveau' :
      lc === 'naam' || lc === 'name' ? 'naam' : 'veld'
    return { header, type, rol }
  })
}

interface Props {
  analyse: CSVAnalyse
  onImporteer: (config: KolomConfig, velden: VeldDefinitie[], hoofdniveauSleutel?: string) => void
  onAnnuleer: () => void
}

export default function KolomMapping({ analyse, onImporteer, onAnnuleer }: Props) {
  const [kolommen, setKolommen] = useState<KolomState[]>(() => initKolomStates(analyse))
  const [fout, setFout] = useState<string | null>(null)

  function updateKolom(index: number, wijziging: Partial<KolomState>) {
    setKolommen(prev => {
      const nieuw = [...prev]
      if (wijziging.rol && wijziging.rol !== 'veld') {
        nieuw.forEach((k, i) => {
          if (i !== index && k.rol === wijziging.rol) nieuw[i] = { ...k, rol: 'veld' }
        })
      }
      nieuw[index] = { ...nieuw[index], ...wijziging }
      return nieuw
    })
    setFout(null)
  }

  function handleImporteer() {
    const hoofdniveauKolom = kolommen.find(k => k.rol === 'hoofdniveau')
    const subniveauKolom   = kolommen.find(k => k.rol === 'subniveau')
    const naamKolom        = kolommen.find(k => k.rol === 'naam')

    if (!subniveauKolom) {
      setFout('Wijs één kolom aan als Subniveau (voor de groepering op de plaat)')
      return
    }
    if (!naamKolom) {
      setFout('Wijs één kolom aan als Naam (de applicatienaam op de kaart)')
      return
    }

    const kolomTypes: Record<string, VeldType> = {}
    kolommen.forEach(k => { kolomTypes[k.header] = k.type })

    const config: KolomConfig = {
      subniveauSleutel: subniveauKolom.header,
      naamSleutel:      naamKolom.header,
      kolomTypes,
      ...(hoofdniveauKolom ? { hoofdniveauSleutel: hoofdniveauKolom.header } : {}),
    }

    const velden: VeldDefinitie[] = [
      { id: 'v-naam', label: naamKolom.header, sleutel: 'naam', type: 'tekst', zichtbaar: true, maxLengte: 20 },
      ...kolommen
        .filter(k => k.rol === 'veld')
        .map((k, i) => ({
          id: `v-import-${i}`,
          label: k.header,
          sleutel: k.header,
          type: k.type,
          zichtbaar: true,
          ...(k.type === 'tekst' ? { maxLengte: 20 } : {}),
        } as VeldDefinitie)),
    ]

    onImporteer(config, velden, hoofdniveauKolom?.header)
  }

  const selectStyle: React.CSSProperties = {
    padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 6,
    fontSize: 12, backgroundColor: 'white', cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 4px' }}>
          Kolommen koppelen
        </h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
          De typen zijn automatisch herkend. Controleer en wijs het Subniveau- en Naam-veld aan.
        </p>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 110px 230px', gap: 8,
          padding: '8px 12px', backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb', fontSize: 11, fontWeight: 600, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Kolomnaam</span>
          <span>Voorbeeldwaarden</span>
          <span>Type</span>
          <span>Rol</span>
        </div>

        {kolommen.map((kolom, i) => {
          const voorbeelden = analyse.preview
            .map(r => r[kolom.header])
            .filter(Boolean)
            .slice(0, 3)
            .join(', ')

          return (
            <div key={kolom.header}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 110px 230px', gap: 8,
                padding: '8px 12px', alignItems: 'center',
                borderBottom: i < kolommen.length - 1 ? '1px solid #f3f4f6' : 'none',
                backgroundColor: kolom.rol !== 'veld' ? '#eff6ff' : 'white' }}>

              <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{kolom.header}</span>

              <span style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={voorbeelden}>
                {voorbeelden || '—'}
              </span>

              <select style={selectStyle} value={kolom.type}
                disabled={kolom.rol !== 'veld' && kolom.rol !== 'naam'}
                onChange={e => updateKolom(i, { type: e.target.value as VeldType })}>
                {VELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {(['hoofdniveau', 'subniveau', 'naam', 'veld'] as const).map(rol => (
                  <label key={rol} style={{ display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: '#374151', cursor: 'pointer' }}>
                    <input type="radio" name={`rol-${kolom.header}`}
                      checked={kolom.rol === rol}
                      onChange={() => updateKolom(i, { rol })}
                      style={{ cursor: 'pointer' }} />
                    {rol === 'hoofdniveau' ? 'Hoofdniveau' : rol === 'subniveau' ? 'Subniveau' : rol === 'naam' ? 'Naam' : 'Veld'}
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {fout && (
        <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          {fout}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onAnnuleer}
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#374151' }}>
          Annuleren
        </button>
        <button onClick={handleImporteer}
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 500 }}>
          Importeren
        </button>
      </div>
    </div>
  )
}
