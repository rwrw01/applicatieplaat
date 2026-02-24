'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Download, Copy, Check, AlertCircle, ZoomIn, ZoomOut, Maximize, ChevronDown, ChevronRight, Code } from 'lucide-react'
import mermaid from 'mermaid'
import { useStore } from '@/lib/store'
import { genereerMermaidCode, genereerMermaidMarkdown, exporteerMermaid } from '@/lib/exportUtils'

let renderTeller = 0
let vorigeRender: Promise<unknown> = Promise.resolve()

/** Render mermaid met een tijdelijke circular-reference-safe JSON.stringify.
 *  Mermaid v11 probeert intern JSON.stringify op DOM-elementen die React fiber
 *  nodes bevatten, wat een "circular structure" fout geeft.
 *  Renders worden geserialiseerd zodat de JSON.stringify-patch nooit door een
 *  gelijktijdige render voortijdig wordt hersteld (StrictMode / navigatie). */
async function renderMermaidSafe(code: string): Promise<string> {
  const huidigeRender = vorigeRender.then(() => doeRender(code))
  vorigeRender = huidigeRender.catch(() => {})
  return huidigeRender
}

async function doeRender(code: string): Promise<string> {
  const id = `mermaid-d-${++renderTeller}`

  // Maak een geïsoleerde container buiten de React-tree
  const container = document.createElement('div')
  container.id = `d${id}`
  container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;'
  document.body.appendChild(container)

  // Patch JSON.stringify om circular references te negeren
  const origStringify = JSON.stringify
  JSON.stringify = function safePatch(value: unknown, replacer?: unknown, space?: unknown) {
    try {
      return origStringify.call(JSON, value, replacer as never, space as never)
    } catch {
      // Fallback: circular-safe stringify
      const seen = new WeakSet()
      return origStringify(value, (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return undefined
          seen.add(val)
        }
        return val
      }, space as never)
    }
  } as typeof JSON.stringify

  try {
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
    const { svg } = await mermaid.render(id, code, container)
    return svg
  } finally {
    JSON.stringify = origStringify
    container.remove()
  }
}

const ZOOM_STAP = 0.2
const ZOOM_MIN = 0.1
const ZOOM_MAX = 3

export default function MermaidPreview() {
  const { applicaties, instellingen } = useStore()
  const diagramRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [gekopieerd, setGekopieerd] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [laden, setLaden] = useState(false)
  const [codeOpen, setCodeOpen] = useState(true)

  // Zoom & pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const slepenRef = useRef(false)
  const sleepStartRef = useRef({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })

  const mermaidCode = applicaties.length > 0
    ? genereerMermaidCode(instellingen, applicaties)
    : ''
  const markdown = applicaties.length > 0
    ? genereerMermaidMarkdown(instellingen, applicaties)
    : ''

  useEffect(() => {
    if (!diagramRef.current || !mermaidCode) return
    const el = diagramRef.current

    let cancelled = false
    setLaden(true)

    async function render() {
      try {
        const svg = await renderMermaidSafe(mermaidCode)
        if (!cancelled) {
          el.innerHTML = svg
          // SVG afmetingen uit viewBox halen zodat het niet 0x0 wordt
          const svgEl = el.querySelector('svg')
          if (svgEl) {
            const vb = svgEl.viewBox?.baseVal
            if (vb && vb.width && vb.height) {
              svgEl.setAttribute('width', String(Math.ceil(vb.width)))
              svgEl.setAttribute('height', String(Math.ceil(vb.height)))
            }
            svgEl.style.maxWidth = 'none'
          }
          setFout(null)
        }
      } catch (e) {
        if (cancelled) return
        el.innerHTML = ''
        setFout(e instanceof Error ? e.message : 'Onbekende renderfout')
      } finally {
        if (!cancelled) setLaden(false)
      }
    }

    render()
    return () => { cancelled = true }
  }, [mermaidCode])

  // Reset zoom/pan bij nieuwe code
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [mermaidCode])

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + ZOOM_STAP, ZOOM_MAX)), [])
  const zoomUit = useCallback(() => setZoom(z => Math.max(z - ZOOM_STAP, ZOOM_MIN)), [])
  const zoomReset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [])

  // Muiswiel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => {
      const nieuw = z + (e.deltaY < 0 ? ZOOM_STAP : -ZOOM_STAP)
      return Math.min(Math.max(nieuw, ZOOM_MIN), ZOOM_MAX)
    })
  }, [])

  // Drag-pannen
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    slepenRef.current = true
    sleepStartRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { ...pan }
    e.preventDefault()
  }, [pan])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!slepenRef.current) return
    setPan({
      x: panStartRef.current.x + (e.clientX - sleepStartRef.current.x),
      y: panStartRef.current.y + (e.clientY - sleepStartRef.current.y),
    })
  }, [])

  const onMouseUp = useCallback(() => { slepenRef.current = false }, [])

  async function kopieer() {
    await navigator.clipboard.writeText(markdown)
    setGekopieerd(true)
    setTimeout(() => setGekopieerd(false), 2000)
  }

  if (applicaties.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 256, color: '#9ca3af' }}>
        <p style={{ fontSize: 18, fontWeight: 500 }}>Nog geen data</p>
        <p style={{ fontSize: 14, marginTop: 4 }}>Ga naar <strong>Data in/uitvoeren</strong> om applicaties toe te voegen.</p>
      </div>
    )
  }

  const zoomKnopStijl: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6,
    backgroundColor: 'white', cursor: 'pointer', color: '#374151',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Knoppen */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={kopieer}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7,
            fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          {gekopieerd ? <><Check size={14} /> Gekopieerd</> : <><Copy size={14} /> Kopieer markdown</>}
        </button>
        <button onClick={() => exporteerMermaid(instellingen, applicaties)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 7,
            fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Download size={14} /> Download .md
        </button>
      </div>

      {/* Panelen */}
      <div style={{ display: 'grid', gridTemplateColumns: codeOpen ? '1fr 1fr' : '1fr', gap: 16, minHeight: 500 }}>
        {/* Links: raw mermaid code (inklapbaar) */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={() => setCodeOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: codeOpen ? '12px 16px' : '10px 14px',
              background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            {codeOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Code size={12} />
            Mermaid code
          </button>
          {codeOpen && (
            <div style={{ padding: '0 16px 16px', overflow: 'auto', flex: 1 }}>
              <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: '#e5e7eb', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                {mermaidCode}
              </pre>
            </div>
          )}
        </div>

        {/* Rechts: gerenderd diagram met zoom/pan */}
        <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header + zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Preview
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={zoomUit} style={zoomKnopStijl} title="Zoom uit"><ZoomOut size={14} /></button>
              <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40, textAlign: 'center', userSelect: 'none' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={zoomIn} style={zoomKnopStijl} title="Zoom in"><ZoomIn size={14} /></button>
              <button onClick={zoomReset} style={zoomKnopStijl} title="Reset"><Maximize size={14} /></button>
            </div>
          </div>

          {/* Diagram viewport */}
          {laden && !fout && (
            <p style={{ fontSize: 13, color: '#9ca3af', padding: '16px' }}>Diagram laden...</p>
          )}
          <div
            ref={viewportRef}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
              flex: 1, overflow: 'hidden', cursor: slepenRef.current ? 'grabbing' : 'grab',
              position: 'relative', userSelect: 'none',
            }}
          >
            <div
              ref={diagramRef}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                display: fout ? 'none' : 'inline-block',
                padding: 16,
              }}
            />
          </div>

          {fout && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', margin: 16,
              backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Renderfout</strong>
                <pre style={{ margin: '6px 0 0', fontSize: 11, whiteSpace: 'pre-wrap', color: '#991b1b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                  {fout}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
