'use client'
import { useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, FileCode } from 'lucide-react'
import { analyseArchiMate, converteerNaarApplicaties } from '@/lib/archimateParser'
import type { ArchiMateModel, ArchiMateImportConfig } from '@/lib/archimateParser'
import { useStore } from '@/lib/store'
import ArchiMateMapping from './ArchiMateMapping'
import type { ImportModus } from './ArchiMateMapping'

type Fase = 'idle' | 'mappen' | 'success' | 'error'

export default function ArchiMateUpload() {
  const { applicaties, setApplicaties, setInstellingen, instellingen } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fase, setFase] = useState<Fase>('idle')
  const [bericht, setBericht] = useState('')
  const [dragging, setDragging] = useState(false)
  const [model, setModel] = useState<ArchiMateModel | null>(null)

  async function verwerkBestand(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setFase('error')
      setBericht('Bestand is te groot (max 10 MB)')
      return
    }
    try {
      const resultaat = await analyseArchiMate(file)
      if (resultaat.elementen.length === 0) {
        setFase('error')
        setBericht('Het ArchiMate-model bevat geen elementen')
        return
      }
      setModel(resultaat)
      setFase('mappen')
    } catch {
      setFase('error')
      setBericht('Kon het ArchiMate-bestand niet lezen. Controleer of het een geldig .archimate of XML-bestand is')
    }
  }

  function handleImporteer(config: ArchiMateImportConfig, modus: ImportModus) {
    if (!model) return
    try {
      const { applicaties: data, velden } = converteerNaarApplicaties(model, config)
      if (modus === 'nieuw') {
        setInstellingen({
          ...instellingen,
          velden,
          subniveauSleutel: 'cluster',
          hoofdniveauSleutel: config.organisatieStrategie !== 'geen' ? 'organisatie' : undefined,
        })
        setApplicaties(data)
        setBericht(`${data.length} applicaties geladen uit ArchiMate-model "${model.naam}"`)
      } else {
        const bestaandeNamen = new Set(applicaties.map(a => a.naam.toLowerCase()))
        const nieuw = data.filter(a => !bestaandeNamen.has(a.naam.toLowerCase()))
        setApplicaties([...applicaties, ...nieuw])
        setBericht(`${nieuw.length} nieuwe applicaties toegevoegd (${data.length - nieuw.length} overgeslagen)`)
      }
      setFase('success')
    } catch {
      setFase('error')
      setBericht('Fout bij verwerken van het ArchiMate-model')
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) verwerkBestand(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) verwerkBestand(file)
  }

  function reset() {
    setFase('idle')
    setModel(null)
    setBericht('')
  }

  if (fase === 'mappen' && model) {
    return (
      <div style={{ maxWidth: 700 }}>
        <ArchiMateMapping
          model={model}
          onImporteer={handleImporteer}
          onAnnuleer={reset}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: 16, backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe',
      }}>
        <FileCode size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
            ArchiMate-import
          </p>
          <p style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>
            Upload een .archimate bestand uit Archi om applicaties te importeren
          </p>
        </div>
      </div>

      {/* Drop zone */}
      {fase !== 'success' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? '#60a5fa' : '#d1d5db'}`,
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragging ? '#eff6ff' : '#f9fafb',
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <Upload size={32} style={{ margin: '0 auto 12px', color: '#9ca3af' }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: '#4b5563' }}>
            Sleep een .archimate bestand hierheen
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            of klik om te bladeren
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".archimate,.xml"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>
      )}

      {/* Status melding */}
      {(fase === 'success' || fase === 'error') && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: 12, borderRadius: 8, fontSize: 13,
          backgroundColor: fase === 'success' ? '#f0fdf4' : '#fef2f2',
          color: fase === 'success' ? '#15803d' : '#b91c1c',
          border: `1px solid ${fase === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {fase === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {bericht}
        </div>
      )}

      {fase === 'success' && (
        <button
          onClick={reset}
          style={{
            alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 8, fontSize: 13,
            border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', color: '#374151',
          }}
        >
          Nieuw bestand uploaden
        </button>
      )}
    </div>
  )
}
