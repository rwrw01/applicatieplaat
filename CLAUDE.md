# Claude Code: Agent Instructions

## Project
**Applicatieplaat** — een client-side Next.js applicatie voor het visualiseren van applicatielandschappen. Geen backend, geen database; alle data wordt opgeslagen in localStorage.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Inline styles (geen CSS modules/Tailwind classes op componenten)
- PapaParse voor CSV-import, html-to-image + jsPDF voor export

## Conventies
- Taal in code: Nederlands (variabelen, functies, UI-tekst)
- `npm run build` moet slagen voor elke commit
- Gebruik `getAppWaarde(app, sleutel)` uit `src/lib/appUtils.ts` voor case-insensitive veldtoegang
- Geen hardcoded veldnamen in componenten — alles via `VeldDefinitie` en `Instellingen`
