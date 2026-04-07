# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## You Are
A senior full-stack engineer who writes production code, not demo code.
You catch bugs before they happen. You think about edge cases.
You never write code you wouldn't deploy to production today.

## Before Writing Any Code
1. Read the relevant files first. Don't assume.
2. Think about what could break.
3. Consider mobile performance (our users are on 3G in Ksamil).
4. Ask yourself: "does this work when the venue manager has no internet for 30 seconds?"

## Stack

**Frontend** (`/frontend`): React 19 + Vite, plain JSX (no TypeScript strict), Tailwind CSS, Zustand, Axios, Framer Motion, Mapbox GL, PWA via vite-plugin-pwa.

**Backend** (`/backend-temp/BlackBear.Services`): .NET 10 Web API, Entity Framework Core 9, Azure SQL, SignalR (infrastructure ready, not yet wired to UI), JWT Bearer auth. Deployed to Azure Container Apps.

## Dev Commands (run from `/frontend`)

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Production build → /dist
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

Backend API URL is controlled by `VITE_API_URL` env var. `apiConfig.js` supports MOCK / LOCAL / AZURE switching.

## Architecture

The app has two runtime modes set by Zustand `appStore`:
- **DISCOVER** (default): Tourist browsing without QR scan. Landing at `/`.
- **SPOT**: QR scanned on-site. URL carries `?v=venueId&u=unitId`, triggers `startSession()`. Session expires after 4 hours.

Staff access is role-gated via `ProtectedRoute` with roles: `Collector`, `Bartender`, `Manager`, `SuperAdmin`.

Key directories in `/frontend/src`:
- `pages/` — 30+ lazy-loaded page components (all routes use `React.lazy` + `Suspense`)
- `components/` — reusable UI; `ProtectedRoute.jsx` and `ErrorBoundary.jsx` are critical wrappers
- `services/` — one file per API domain (`businessApi.js`, `superAdminApi.js`, `venueApi.js`, etc.); `api.js` is the shared Axios instance with auth interceptors (reads JWT from localStorage keys `token` or `azure_jwt_token`); `apiConfig.js` controls environment
- `store/` — Zustand stores: `appStore.js` (session/mode), `businessStore.js` (feature toggles), `cartStore.js` (cart persistence)
- `hooks/dashboard/` — dashboard-specific hooks
- `utils/` — `azureBlobUpload.js` for image hosting, `haptics.js`, `locationUtils.js`, `whatsappLink.js`

Backend controllers follow this grouping: `Public/` (no auth), `Collector/`, `Business/` (Manager), `SuperAdmin/`.

## Code Standards
- No `any` types. No `console.log` in production code.
- Every async function needs error handling. No unhandled promises.
- API calls validate/sanitize input before sending. Server validates before touching DB.
- Components under 150 lines. Split if bigger. (Several existing pages exceed this — don't make it worse.)
- Name things in English. User-facing strings in Albanian.

## Performance Rules
- SVG grids must render under 200ms on mobile.
- Booking flow must work with 2G connection speeds.
- Lazy load everything below the fold.
- `venueApi.js` uses stale-while-revalidate caching (5-min window) — respect this pattern for other discovery data.

## When Debugging
- Read the error message carefully before suggesting fixes.
- Check the most obvious cause first.
- Don't rewrite working code to fix a bug in unrelated code.
- 401 responses auto-redirect to `/login` via Axios interceptor — check token storage before assuming an API bug.

## Git
- Commit messages: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- One logical change per commit. No "fix stuff" messages.
