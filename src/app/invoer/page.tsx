"use client"
import { useState } from "react"
import { Upload, Table } from "lucide-react"
import CSVUpload from "@/components/invoer/CSVUpload"
import HandmatigInvoer from "@/components/invoer/HandmatigInvoer"

type Tab = "csv" | "handmatig"

export default function InvoerPage() {
  const [actieveTab, setActieveTab] = useState<Tab>("csv")

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Data invoeren</h1>
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
        <button
          onClick={() => setActieveTab("csv")}
          style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "500", borderBottom: actieveTab === "csv" ? "2px solid #2563eb" : "2px solid transparent", color: actieveTab === "csv" ? "#2563eb" : "#6b7280", background: "none", cursor: "pointer" }}
        >
          CSV uploaden
        </button>
        <button
          onClick={() => setActieveTab("handmatig")}
          style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "500", borderBottom: actieveTab === "handmatig" ? "2px solid #2563eb" : "2px solid transparent", color: actieveTab === "handmatig" ? "#2563eb" : "#6b7280", background: "none", cursor: "pointer" }}
        >
          Handmatig invoeren
        </button>
      </div>
      {actieveTab === "csv" ? <CSVUpload /> : <HandmatigInvoer />}
    </div>
  )
}
