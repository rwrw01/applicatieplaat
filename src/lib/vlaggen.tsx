// Alleen de vlaggen die we daadwerkelijk gebruiken — inline SVG
export const VLAG_SVGS: Record<string, string> = {
  nl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6"><rect width="9" height="2" fill="#AE1C28"/><rect y="2" width="9" height="2" fill="#fff"/><rect y="4" width="9" height="2" fill="#21468B"/></svg>`,
  eu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="12" fill="#003399"/><g fill="#FFCC00"><text x="9" y="8.5" text-anchor="middle" font-size="7">★★★★★★★★★★★★</text></g></svg>`,
  us: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 100"><rect width="190" height="100" fill="#B22234"/><rect y="7.7" width="190" height="7.7" fill="#fff"/><rect y="15.4" width="190" height="7.7" fill="#B22234"/><rect y="23.1" width="190" height="7.7" fill="#fff"/><rect y="30.8" width="190" height="7.7" fill="#B22234"/><rect y="38.5" width="190" height="7.7" fill="#fff"/><rect y="46.2" width="190" height="7.7" fill="#B22234"/><rect y="53.9" width="190" height="7.7" fill="#fff"/><rect y="61.6" width="190" height="7.7" fill="#B22234"/><rect y="69.3" width="190" height="7.7" fill="#fff"/><rect y="77" width="190" height="7.7" fill="#B22234"/><rect y="84.7" width="190" height="7.7" fill="#fff"/><rect y="92.4" width="190" height="7.7" fill="#B22234"/><rect width="76" height="53.9" fill="#3C3B6E"/></svg>`,
  gb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V30 M0,15 H60" stroke="#fff" stroke-width="10"/><path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6"/></svg>`,
  de: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6"><rect width="9" height="2" fill="#000"/><rect y="2" width="9" height="2" fill="#DD0000"/><rect y="4" width="9" height="2" fill="#FFCE00"/></svg>`,
  fr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6"><rect width="3" height="6" fill="#002395"/><rect x="3" width="3" height="6" fill="#fff"/><rect x="6" width="3" height="6" fill="#ED2939"/></svg>`,
  be: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6"><rect width="3" height="6" fill="#000"/><rect x="3" width="3" height="6" fill="#FAE042"/><rect x="6" width="3" height="6" fill="#ED2939"/></svg>`,
  ch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#FF0000"/><rect x="13" y="6" width="6" height="20" fill="#fff"/><rect x="6" y="13" width="20" height="6" fill="#fff"/></svg>`,
  se: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"><rect width="16" height="10" fill="#006AA7"/><rect x="5" width="2" height="10" fill="#FECC02"/><rect y="4" width="16" height="2" fill="#FECC02"/></svg>`,
  no: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 16"><rect width="22" height="16" fill="#EF2B2D"/><rect x="6" width="4" height="16" fill="#fff"/><rect y="6" width="22" height="4" fill="#fff"/><rect x="7" width="2" height="16" fill="#002868"/><rect y="7" width="22" height="2" fill="#002868"/></svg>`,
  dk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 28"><rect width="37" height="28" fill="#C60C30"/><rect x="12" width="5" height="28" fill="#fff"/><rect y="11.5" width="37" height="5" fill="#fff"/></svg>`,
}

export function VlagIcoon({ code, size = 20 }: { code: string, size?: number }) {
  const svg = VLAG_SVGS[code.toLowerCase()]
  if (!svg) return <span style={{ fontSize: "12px", color: "#6b7280" }}>{code.toUpperCase()}</span>
  return (
    <span
      style={{ display: "inline-block", width: size * 1.5, height: size, borderRadius: "2px", overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}