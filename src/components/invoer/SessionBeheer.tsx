'use client'
import { useRef, useState } from 'react'
import { Download, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { useStore } from '@/lib/store'
import { normaliseerApp } from '@/lib/appUtils'
import { exporteerMermaid } from '@/lib/exportUtils'
import type { Applicatie, Instellingen } from '@/types'

interface SessionBestand {
  versie: 1
  exportDatum: string
  instellingen: Instellingen
  applicaties: Applicatie[]
}

function maakBestandsnaam() {
  const nu = new Date()
  const stamp =
    nu.getFullYear().toString() +
    String(nu.getMonth() + 1).padStart(2, '0') +
    String(nu.getDate()).padStart(2, '0') +
    String(nu.getHours()).padStart(2, '0') +
    String(nu.getMinutes()).padStart(2, '0')
  return `applicatieplaat_sessie_${stamp}.json`
}

function valideerSession(data: unknown): data is SessionBestand {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return d.versie === 1 && typeof d.exportDatum === 'string' &&
    typeof d.instellingen === 'object' && Array.isArray(d.applicaties)
}

type LaadStatus = 'idle' | 'preview' | 'success' | 'error'

export default function SessionBeheer() {
  const { applicaties, instellingen, setApplicaties, setInstellingen, resetNaarStandaard } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [laadStatus, setLaadStatus] = useState<LaadStatus>('idle')
  const [fout, setFout] = useState('')
  const [preview, setPreview] = useState<SessionBestand | null>(null)
  const [modus, setModus] = useState<'vervangen' | 'aanvullen'>('vervangen')
  const [dragging, setDragging] = useState(false)

  function exporteer() {
    const sessie: SessionBestand = {
      versie: 1,
      exportDatum: new Date().toISOString(),
      instellingen,
      applicaties,
    }
    const blob = new Blob([JSON.stringify(sessie, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = maakBestandsnaam()
    a.click()
    URL.revokeObjectURL(url)
  }

  async function verwerkBestand(file: File) {
    try {
      const tekst = await file.text()
      const data = JSON.parse(tekst)
      if (!valideerSession(data)) {
        setFout('Ongeldig sessie-bestand. Controleer of het een geldig applicatieplaat JSON-bestand is.')
        setLaadStatus('error')
        return
      }
      setPreview(data)
      setLaadStatus('preview')
      setFout('')
    } catch {
      setFout('Kon het bestand niet lezen. Controleer of het een geldig JSON-bestand is.')
      setLaadStatus('error')
    }
  }

  function laden() {
    if (!preview) return
    if (modus === 'vervangen') {
      setInstellingen(preview.instellingen)
      setApplicaties(preview.applicaties.map(normaliseerApp))
    } else {
      const bestaandeNamen = new Set(applicaties.map(a => a.naam.toLowerCase()))
      const nieuw = preview.applicaties.map(normaliseerApp).filter(a => !bestaandeNamen.has(a.naam.toLowerCase()))
      setApplicaties([...applicaties, ...nieuw])
    }
    setLaadStatus('success')
    setPreview(null)
  }

  function reset() {
    setLaadStatus('idle')
    setPreview(null)
    setFout('')
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>

      {/* Exporteren */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 6px' }}>Sessie downloaden</h2>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>
          Slaat alle applicaties én instellingen op als JSON-bestand. Gebruik dit om later verder te gaan.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 12, color: '#374151' }}>
              {applicaties.length} applicaties · {instellingen.velden.length} velden
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => exporteerMermaid(instellingen, applicaties)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <FileText size={14} /> Mermaid (.md)
              </button>
              <button onClick={exporteer}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 7,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <Download size={14} /> Sessie (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Laden */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 6px' }}>Sessie laden</h2>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>
          Laad een eerder opgeslagen sessie-bestand (.json) om verder te gaan.
        </p>

        {laadStatus === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
            fontSize: 13, color: '#16a34a', marginBottom: 12 }}>
            <CheckCircle size={16} /> Sessie geladen.
            <button onClick={reset} style={{ marginLeft: 'auto', fontSize: 12, color: '#2563eb',
              background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Nieuw bestand laden
            </button>
          </div>
        )}

        {laadStatus === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            fontSize: 13, color: '#dc2626', marginBottom: 12 }}>
            <AlertCircle size={16} /> {fout}
            <button onClick={reset} style={{ marginLeft: 'auto', fontSize: 12, color: '#2563eb',
              background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Opnieuw
            </button>
          </div>
        )}

        {laadStatus !== 'success' && (
          <>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) verwerkBestand(f) }}
              style={{
                border: `2px dashed ${dragging ? '#60a5fa' : '#d1d5db'}`,
                borderRadius: 10, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                backgroundColor: dragging ? '#eff6ff' : '#f9fafb', marginBottom: 16,
              }}>
              <Upload size={24} style={{ color: '#9ca3af', margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Sleep een sessie-bestand (.json) hierheen</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>of klik om te bladeren</p>
              <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) verwerkBestand(f); e.target.value = '' }} />
            </div>

            {laadStatus === 'preview' && preview && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '10px 14px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                  fontSize: 12, color: '#6b7280' }}>
                  <strong style={{ color: '#374151' }}>Gevonden: </strong>
                  {preview.applicaties.length} applicaties · {preview.instellingen.velden.length} velden ·
                  opgeslagen {new Date(preview.exportDatum).toLocaleString('nl-NL')}
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(['vervangen', 'aanvullen'] as const).map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                      <input type="radio" name="modus" value={m} checked={modus === m}
                        onChange={() => setModus(m)} style={{ marginTop: 2, cursor: 'pointer' }} />
                      <span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                          {m === 'vervangen' ? 'Vervangen' : 'Aanvullen'}
                        </span>
                        <span style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>
                          {m === 'vervangen'
                            ? 'Overschrijft alle huidige applicaties en instellingen'
                            : 'Behoudt huidige instellingen; voegt alleen nieuwe applicaties toe (op naam)'}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <div style={{ padding: '10px 14px', borderTop: '1px solid #e5e7eb',
                  display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={reset}
                    style={{ padding: '7px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
                      border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#374151' }}>
                    Annuleren
                  </button>
                  <button onClick={laden}
                    style={{ padding: '7px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
                      border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 500 }}>
                    Laden
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reset */}
      <div style={{ ...cardStyle, borderColor: '#fecaca' }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Data beheer</h2>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>
          Reset alles naar de standaard voorbeelddata. Dit verwijdert alle wijzigingen.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Weet je het zeker? Alle data en instellingen worden gereset.')) {
              resetNaarStandaard()
            }
          }}
          style={{ padding: '7px 14px', backgroundColor: '#fef2f2', color: '#dc2626',
            borderRadius: 7, fontSize: 13, cursor: 'pointer', border: '1px solid #fecaca', fontWeight: 500 }}>
          Reset naar standaarddata
        </button>
      </div>
    </div>
  )
}
