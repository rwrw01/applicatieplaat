interface Props {
  onReset: () => void
}

export default function DataBeheerSection({ onReset }: Props) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "24px" }}>
      <h2 style={{ fontWeight: "600", fontSize: "15px", color: "#374151", marginBottom: "8px" }}>Data beheer</h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
        Reset alles naar de standaard voorbeelddata. Dit verwijdert alle wijzigingen.
      </p>
      <button onClick={onReset}
        style={{ padding: "8px 16px", backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "13px", cursor: "pointer", border: "1px solid #fecaca", fontWeight: "500" }}>
        Reset naar standaarddata
      </button>
    </div>
  )
}
