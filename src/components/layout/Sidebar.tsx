"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { navItems } from "@/lib/navigatie"

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside style={{
      display: "flex", flexDirection: "column",
      backgroundColor: "#111827", color: "white",
      width: open ? "224px" : "56px",
      transition: "width 0.2s ease", flexShrink: 0, overflow: "hidden"
    }}>
      {/* Hamburger toggle bovenaan */}
      <button onClick={onToggle} title="Menu" style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "16px 17px", borderBottom: "1px solid #374151",
        background: "none", border: "none", color: "#d1d5db",
        cursor: "pointer", whiteSpace: "nowrap", width: "100%",
      }}>
        <Menu size={20} style={{ flexShrink: 0 }} />
        {open && <span style={{ fontWeight: "600", fontSize: "14px" }}>Applicatieplaat</span>}
      </button>

      <nav style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} title={label} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px", borderRadius: "8px", fontSize: "14px",
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

      {/* Colofon */}
      <div style={{ padding: open ? "12px 16px" : "12px 8px", borderTop: "1px solid #1f2937" }}
        title="MIT-licentie — vrij te hergebruiken met bronvermelding">
        {open ? (
          <p style={{ fontSize: "10px", color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
            © {new Date().getFullYear()} Athide<br />
            Open source · MIT-licentie<br />
            Hergebruik met bronvermelding
          </p>
        ) : (
          <span style={{ fontSize: "10px", color: "#4b5563" }}>Licentie</span>
        )}
      </div>
    </aside>
  )
}
