import MermaidPreview from '@/components/mermaid/MermaidPreview'

export default function MermaidPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>Mermaid preview</h1>
      <MermaidPreview />
    </div>
  )
}
