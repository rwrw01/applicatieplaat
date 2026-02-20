'use client'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { BREEKPUNT_MOBIEL } from '@/lib/constants'
import { useStore } from '@/lib/store'
import WelkomScherm from '@/components/WelkomScherm'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { nieuweSessie } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < BREEKPUNT_MOBIEL
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          />
        )}
        <div style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
        }}>
          <Sidebar open={true} onToggle={() => setSidebarOpen(false)} />
        </div>

        <header style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', backgroundColor: '#111827', color: 'white',
          borderBottom: '1px solid #1f2937', flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', display: 'flex' }}
            title="Menu"
          >
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Applicatieplaat</span>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {children}
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {nieuweSessie && <WelkomScherm />}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {children}
      </main>
    </div>
  )
}