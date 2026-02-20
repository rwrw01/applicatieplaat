export const SESSIE_TTL_UREN = 96

const COOKIE_NAAM = "ap_sessie"
const SLEUTEL_PREFIX = "ap_"
const SLEUTEL_SUFFIXES = ["_applicaties", "_instellingen"]

export function leesSessieId(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find(r => r.startsWith(COOKIE_NAAM + "="))
  return match ? match.split("=")[1] : null
}

export function zetSessieCookie(id: string, ttlUren: number) {
  if (typeof document === "undefined") return
  const verloopt = new Date(Date.now() + ttlUren * 60 * 60 * 1000).toUTCString()
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_NAAM}=${id}; expires=${verloopt}; path=/; SameSite=Strict${secure}`
}

export function getOfMaakSessieId(): string {
  const bestaand = leesSessieId()
  if (bestaand) {
    zetSessieCookie(bestaand, SESSIE_TTL_UREN) // verleng TTL
    return bestaand
  }
  const nieuw = crypto.randomUUID()
  zetSessieCookie(nieuw, SESSIE_TTL_UREN)
  return nieuw
}

export function ruimOudeSessiesOp(activeSessieId: string) {
  if (typeof window === "undefined") return
  const teVerwijderen: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const sleutel = localStorage.key(i)
    if (!sleutel?.startsWith(SLEUTEL_PREFIX)) continue
    const isActief = SLEUTEL_SUFFIXES.some(
      suf => sleutel === `${SLEUTEL_PREFIX}${activeSessieId}${suf}`
    )
    if (!isActief) teVerwijderen.push(sleutel)
  }
  teVerwijderen.forEach(s => localStorage.removeItem(s))
}
