'use client'
import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Applicatie, Instellingen } from '@/types'
import { standaardApplicaties } from '@/lib/standaardData'

interface SessionBestand {
  versie: 1
  exportDatum: string
  instellingen: Instellingen
  applicaties: Applicatie[]
}

function valideerSession(data: unknown): data is SessionBestand {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return d.versie === 1 && typeof d.exportDatum === 'string' &&
    typeof d.instellingen === 'object' && Array.isArray(d.applicaties)
}

export default function WelkomScherm() {
  const { setApplicaties, setInstellingen, bevestigSessie } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fout, setFout] = useState('')
  const [dragging, setDragging] = useState(false)

  function startStandaard() {
    setApplicaties(standaardApplicaties)
    bevestigSessie()
  }

  async function verwerkBestand(file: File) {
    try {
      const data = JSON.parse(await file.text())
      if (!valideerSession(data)) {
        setFout('Ongeldig sessie-bestand.')
        return
      }
      setInstellingen(data.instellingen)
      setApplicaties(data.applicaties)
      bevestigSessie()
    } catch {
      setFout('Kon het bestand niet lezen.')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: '#f9fafb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24,
    }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center' }}>
          Welkom bij de Applicatieplaat
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>
          Kies hoe je wilt beginnen.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Standaardomgeving */}
          <button
            onClick={startStandaard}
            style={{
              padding: '28px 20px', borderRadius: 12, border: '2px solid #e5e7eb',
              backgroundColor: 'white', cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563eb')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
          >
            <span style={{ fontSize: 32 }}>🗺️</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
              Standaardomgeving
            </span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Start met een voorbeeldset van applicaties.
            </span>
          </button>

          {/* JSON laden */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false)
              const f = e.dataTransfer.files?.[0]
              if (f) verwerkBestand(f)
            }}
            style={{
              padding: '28px 20px', borderRadius: 12,
              border: `2px dashed ${dragging ? '#2563eb' : '#d1d5db'}`,
              backgroundColor: dragging ? '#eff6ff' : 'white',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            <Upload size={32} style={{ color: '#9ca3af' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
              Laden vanuit JSON
            </span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Sleep een sessie-bestand (.json) of klik om te bladeren.
            </span>
            <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) verwerkBestand(f); e.target.value = '' }} />
          </div>

        </div>

        {fout && (
          <p style={{ marginTop: 16, fontSize: 13, color: '#dc2626', textAlign: 'center' }}>{fout}</p>
        )}
      </div>
    </div>
  )
}
