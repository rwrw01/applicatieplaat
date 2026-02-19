"use client"
import { useRef, useState } from "react"
import { parseCSV } from "@/lib/csvParser"
import { useStore } from "@/lib/store"

export default function CSVUpload() {
  const { setApplicaties } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [bericht, setBericht] = useState("")

  async function verwerkBestand(file: File) {
    try {
      const data = await parseCSV(file)
      setApplicaties(data)
      setStatus("success")
      setBericht(`${data.length} applicaties geladen uit ${file.name}`)
    } catch {
      setStatus("error")
      setBericht("Fout bij verwerken van het bestand.")
    }
  }

  function downloadTemplate() {
    const inhoud = [
      "cluster,naam,saas,complexiteit,afloopDatum,omgeving,status,leverancier",
      "Klant Contact Centrum,Balie App,ja,hoog,2026-12-31,client,groen,ACME BV",
      "Financien,Betaalsysteem,ja,laag,2027-03-01,beide,groen,FinTech NV",
    ].join("\n")
    const blob = new Blob([inhoud], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: "500px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
        <div>
          <p style={{ fontWeight: "500", color: "#1e40af", fontSize: "14px" }}>CSV template</p>
          <p style={{ color: "#3b82f6", fontSize: "12px" }}>Download en vul in met jouw applicaties</p>
        </div>
        <button onClick={downloadTemplate} style={{ padding: "8px 12px", backgroundColor: "#2563eb", color: "white", borderRadius: "8px", fontSize: "14px", cursor: "pointer", border: "none" }}>
          Download
        </button>
      </div>
      <div onClick={() => inputRef.current?.click()} style={{ border: "2px dashed #d1d5db", borderRadius: "12px", padding: "40px", textAlign: "center", cursor: "pointer", backgroundColor: "#f9fafb" }}>
        <p style={{ fontSize: "14px", color: "#4b5563" }}>Sleep een CSV-bestand hierheen of klik om te bladeren</p>
        <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) verwerkBestand(f) }} />
      </div>
      {status !== "idle" && (
        <div style={{ padding: "12px", borderRadius: "8px", fontSize: "14px", backgroundColor: status === "success" ? "#f0fdf4" : "#fef2f2", color: status === "success" ? "#15803d" : "#dc2626", border: `1px solid ${status === "success" ? "#bbf7d0" : "#fecaca"}` }}>
          {bericht}
        </div>
      )}
    </div>
  )
}
