'use client'
import { useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { parseCSV, analyseCSV } from '@/lib/csvParser'
import type { CSVAnalyse, KolomConfig } from '@/lib/csvParser'
import { useStore } from '@/lib/store'
import type { VeldDefinitie } from '@/types'
import KolomMapping from './KolomMapping'

const BEKENDE_DEFAULTS: Record<string, string> = {
  cluster: 'Dienstverlening', naam: 'Applicatienaam', saas: 'ja',
  complexiteit: 'laag', afloopDatum: '2026-12-31', omgeving: 'client',
  status: 'groen', leverancier: 'Leverancier BV',
}

type Fase = 'idle' | 'mappen' | 'success' | 'error'

export default function CSVUpload() {
  const { setApplicaties, setInstellingen, instellingen } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fase, setFase] = useState<Fase>('idle')
  const [bericht, setBericht] = useState('')
  const [dragging, setDragging] = useState(false)
  const [analyse, setAnalyse] = useState<CSVAnalyse | null>(null)
  const [huidigBestand, setHuidigBestand] = useState<File | null>(null)

  async function verwerkBestand(file: File) {
    try {
      const resultaat = await analyseCSV(file)
      if (resultaat.headers.length === 0) {
        setFase('error')
        setBericht('Het bestand lijkt leeg of heeft geen kolomnamen in de eerste rij')
        return
      }
      setHuidigBestand(file)
      setAnalyse(resultaat)
      setFase('mappen')
    } catch (e) {
      setFase('error')
      setBericht(e instanceof Error ? e.message : 'Kon het bestand niet lezen. Controleer of het een geldig CSV-bestand is')
    }
  }

  async function handleImporteer(config: KolomConfig, velden: VeldDefinitie[]) {
    if (!huidigBestand) return
    try {
      const data = await parseCSV(huidigBestand, config)
      setInstellingen({ ...instellingen, velden })
      setApplicaties(data)
      setFase('success')
      setBericht(`${data.length} applicaties geladen en veldindeling bijgewerkt`)
    } catch (e) {
      setFase('error')
      setBericht(e instanceof Error ? e.message : 'Fout bij verwerken van het bestand')
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
    setAnalyse(null)
    setHuidigBestand(null)
    setBericht('')
  }

  function downloadTemplate() {
    const velden = instellingen.velden.filter(v => v.sleutel && v.sleutel !== 'cluster')
    const headers = ['cluster', ...velden.map(v => v.sleutel)]

    function sampleWaarde(sleutel: string): string {
      if (sleutel in BEKENDE_DEFAULTS) return BEKENDE_DEFAULTS[sleutel]
      const veld = velden.find(v => v.sleutel === sleutel)
      if (!veld) return ''
      if (veld.type === 'datum') return '2026-12-31'
      if (veld.type === 'status') return 'waarde1'
      if (veld.type === 'icoon') return veld.icoonMappings?.[0]?.waarde ?? 'waarde1'
      return veld.label
    }

    const rij1 = headers.map(h => sampleWaarde(h)).join(',')
    const rij2 = ['Bedrijfsvoering', ...velden.map(v => {
      if (v.sleutel === 'naam') return 'Tweede App'
      if (v.sleutel === 'saas') return 'nee'
      if (v.sleutel === 'complexiteit') return 'midden'
      if (v.sleutel === 'afloopDatum') return '2025-06-30'
      if (v.sleutel === 'omgeving') return 'server'
      if (v.sleutel === 'status') return 'oranje'
      if (v.sleutel === 'leverancier') return 'Andere BV'
      if (v.type === 'icoon') return v.icoonMappings?.[1]?.waarde ?? v.icoonMappings?.[0]?.waarde ?? 'waarde2'
      if (v.type === 'datum') return '2025-12-31'
      if (v.type === 'status') return 'waarde2'
      return v.label
    })].join(',')

    const variabeleVelden = velden.filter(v => v.type === 'icoon' || v.type === 'status')
    const infoRegels = variabeleVelden.length > 0 ? [
      '#',
      '# Geldige waarden per veld:',
      ...variabeleVelden.map(v => {
        const waarden = v.sleutel === 'saas' ? 'ja | nee'
          : v.sleutel === 'omgeving' ? 'client | server | beide'
          : v.sleutel === 'complexiteit' ? 'laag | midden | hoog'
          : v.sleutel === 'status' ? 'groen | oranje | rood'
          : v.icoonMappings?.map(m => m.waarde).filter(Boolean).join(' | ') ?? 'zie instellingen'
        return `# ${v.sleutel}: ${waarden}`
      }),
    ] : []

    const inhoud = [headers.join(','), rij1, rij2, ...infoRegels].join('\n')
    const blob = new Blob([inhoud], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'applicatieplaat-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (fase === 'mappen' && analyse) {
    return (
      <div style={{ maxWidth: 700 }}>
        <KolomMapping
          analyse={analyse}
          onImporteer={handleImporteer}
          onAnnuleer={reset}
        />
      </div>
    )
  }

  return (
    <div className="max-w-xl flex flex-col gap-4">

      {/* Template downloaden */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-sm font-medium text-blue-800">CSV template</p>
          <p className="text-xs text-blue-600 mt-0.5">Download en vul in met jouw applicaties</p>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <Download size={14} /> Download
        </button>
      </div>

      {/* Drop zone */}
      {fase !== 'success' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}>
          <Upload className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-sm font-medium text-gray-600">Sleep een CSV-bestand hierheen</p>
          <p className="text-xs text-gray-400 mt-1">of klik om te bladeren</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
        </div>
      )}

      {/* Status melding */}
      {(fase === 'success' || fase === 'error') && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          fase === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {fase === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {bericht}
        </div>
      )}

      {fase === 'success' && (
        <button onClick={reset}
          style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 8, fontSize: 13,
            border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', color: '#374151' }}>
          Nieuw bestand uploaden
        </button>
      )}
    </div>
  )
}
