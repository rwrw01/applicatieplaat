'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {children}
      </main>
    </div>
  )
}