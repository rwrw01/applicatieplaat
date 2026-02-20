interface Props {
  gewijzigd: boolean
  opgeslagen: boolean
  onOpslaan: () => void
  onAnnuleren: () => void
}

export default function OpslaanBalk({ gewijzigd, opgeslagen, onOpslaan, onAnnuleren }: Props) {
  if (opgeslagen) {
    return (
      <div style={{ position: "fixed", bottom: "24px", right: "24px", backgroundColor: "#16a34a", color: "white",
        padding: "12px 20px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        fontSize: "13px", fontWeight: "500", zIndex: 100 }}>
        Instellingen opgeslagen
      </div>
    )
  }
  if (!gewijzigd) return null
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", gap: "8px", alignItems: "center",
      backgroundColor: "white", padding: "12px 16px", borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb", zIndex: 100 }}>
      <span style={{ fontSize: "13px", color: "#6b7280" }}>Niet-opgeslagen wijzigingen</span>
      <button onClick={onAnnuleren}
        style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", border: "1px solid #e5e7eb", backgroundColor: "white" }}>
        Annuleren
      </button>
      <button onClick={onOpslaan}
        style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: "500" }}>
        Opslaan
      </button>
    </div>
  )
}
