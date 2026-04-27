# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev          # Vite frontend only (no API)
vercel dev           # Full stack with serverless functions
npm run build        # Production build → dist/
git push             # Triggers Vercel auto-deploy
```

No automated tests or linter configured. Manual QA with `vercel dev`.

## Architecture

React 18 + Vite SPA → Auth0 JWT ↔ Vercel Serverless Functions (Node.js) ↔ MongoDB Atlas

- `api/` — 11 serverless functions, each exported as `default async function handler(req, res)`
- `api/_auth.js` — JWT verification helper; called by every write endpoint (validates Bearer token against Auth0 `/userinfo`)
- `api/_db.js` — MongoDB connection cached globally to survive warm function invocations
- `src/hooks/useProde.js` — data-fetching hooks (usePartidos, usePosiciones, useRanking, useMisPredicciones)
- `src/App.jsx` — routing + group enforcement (users without a group are redirected to `UnirseGrupo` before accessing the app)

Admin protection uses a `x-admin-id` request header checked against `process.env.ADMIN_USER_ID`. The admin email is also hardcoded in the frontend to gate the `/admin` route.

## Data Models (MongoDB, no ORM)

**partidos** — match metadata: `local`, `visitante`, `fecha` (UTC ISO string), `estado` (`NS|1H|2H|HT|FT|AET|PEN`), `golesLocal/golesVisitante` (null until finished), `grupo` (A–L or `RO16/QF/SF/F`), `sede`, flag URLs.

**predicciones** — `userId` (Auth0 subject), `partidoId` (ObjectId), `golesLocal/golesVisitante`, `puntos` (3 = exact score, 1 = correct winner/draw, 0 = wrong, null = pending).

**usuarios** — `userId`, `nombre`, `email`, `foto`, `grupoId` (ObjectId or null), `grupoNombre`.

**grupos** — `nombre`, `codigo` (join code, compared case-insensitively).

## Key Business Logic

- **Match lock**: predictions blocked server-side when `estado !== "NS"` or `fecha <= Date.now()`.
- **Scoring** (in `api/admin/sincronizar.js`): calculated on sync from football-data.org; ranking sorted by `puntos → exactos → ganadores`.
- **Group isolation**: rankings query only users sharing the same `grupoId` via MongoDB aggregation.
- **No migrations**: schema changes are made in application code; bulk data fixes go in `api/admin/acciones.js`.

## Constraints

- Vercel Hobby plan caps at 12 serverless functions — adding more requires consolidating existing ones.
- football-data.org free tier: 10 req/min; sync is triggered manually from the admin panel.
- All dates stored and compared in UTC; browser local-time edge cases exist around match start.
