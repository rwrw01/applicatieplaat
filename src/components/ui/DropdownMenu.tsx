"use client"
import { useRef, useState, useEffect, useCallback } from "react"

interface DropdownMenuProps {
  /** Inhoud van de triggerknop (icoon + label) */
  trigger: React.ReactNode
  /** Dropdown-inhoud — of render-functie die `sluit` ontvangt */
  children: React.ReactNode | ((sluit: () => void) => React.ReactNode)
  /** Uitlijning van de dropdown t.o.v. de trigger */
  align?: "left" | "right"
  /** Visuele variant */
  variant?: "standaard" | "primair"
  /** Callback wanneer dropdown sluit */
  onSluit?: () => void
}

const dropdownStijl: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 4px)",
  backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, minWidth: 160,
}

const knopBasisStijl: React.CSSProperties = {
  padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 6,
  fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
}

export default function DropdownMenu({ trigger, children, align = "left", variant = "standaard", onSluit }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const sluit = useCallback(() => {
    setOpen(false)
    onSluit?.()
  }, [onSluit])

  useEffect(() => {
    function handleClickBuiten(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) sluit()
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") sluit()
    }
    document.addEventListener("mousedown", handleClickBuiten)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickBuiten)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [sluit])

  const isPrimair = variant === "primair"
  const knopStijl: React.CSSProperties = {
    ...knopBasisStijl,
    backgroundColor: isPrimair ? "#2563eb" : open ? "#eff6ff" : "white",
    borderColor: isPrimair ? "#2563eb" : open ? "#93c5fd" : "#e5e7eb",
    color: isPrimair ? "white" : open ? "#1d4ed8" : "#374151",
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={knopStijl}>
        {trigger}
      </button>
      {open && (
        <div style={{ ...dropdownStijl, [align === "right" ? "right" : "left"]: 0 }}>
          {typeof children === "function" ? (children as (sluit: () => void) => React.ReactNode)(sluit) : children}
        </div>
      )}
    </div>
  )
}

export { knopBasisStijl }
