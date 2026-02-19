"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, ChevronLeft, ChevronRight, Building2, Settings } from "lucide-react"

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const navItems = [
  { href: "/",             label: "Applicatieplaat", icon: LayoutDashboard },
  { href: "/invoer",       label: "Data invoeren",   icon: PlusCircle },
  { href: "/instellingen", label: "Instellingen",    icon: Settings },
]

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside style={{
      display: "flex", flexDirection: "column",
      backgroundColor: "#111827", color: "white",
      width: open ? "224px" : "56px",
      transition: "width 0.3s", flexShrink: 0, overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 12px", borderBottom: "1px solid #374151" }}>
        <svg style={{ flexShrink: 0, color: "#60a5fa" }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        {open && <span style={{ fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap" }}>Applicatieplaat</span>}
      </div>
      <nav style={{ flex: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "8px", borderRadius: "8px", fontSize: "14px",
              textDecoration: "none", whiteSpace: "nowrap",
              backgroundColor: active ? "#2563eb" : "transparent",
              color: active ? "white" : "#d1d5db",
            }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {open && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>
      <button onClick={onToggle} style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "12px", borderTop: "1px solid #374151",
        background: "none", border: "none", color: "white", cursor: "pointer"
      }}>
        {open
          ? <ChevronLeft size={18} />
          : <ChevronRight size={18} />
        }
      </button>
    </aside>
  )
}
