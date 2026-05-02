# XIXA - Nightlife & Beach Club Discovery App

## Overview
XIXA is a React + Vite frontend application for discovering and booking the best nightlife and beach club experiences across Albania. It connects to an external backend API hosted on Azure.

## Project Structure
- `frontend/` — Main React + Vite SPA (the active frontend app)
- `riviera-mobile/` — React Native / Expo mobile app (separate, not run in this environment)
- `BlackBear-Services-main 2/` — Backend services reference (external, hosted on Azure)
- Numerous `.md` documentation files at the root level

## Tech Stack
- **Frontend:** React 19, Vite 7, Tailwind CSS, React Router DOM v7
- **State:** Zustand
- **Maps:** Mapbox GL, react-map-gl
- **Real-time:** Microsoft SignalR
- **PWA:** vite-plugin-pwa
- **Backend API:** External Azure Container Apps (`blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io`)

## Running the App
The frontend dev server runs via the "Start application" workflow:
```bash
cd frontend && npm run dev
```
Runs on port 5000 at `0.0.0.0`.

## Important Notes
- The backend API has CORS restrictions that only allow requests from the production domain (`xixa.app`). In development/Replit, API calls will fail with CORS errors — this is expected behavior.
- The app loads and renders correctly; it just cannot fetch live data from the backend outside of the production domain.

## Deployment
Configured as a **static** deployment:
- **Build:** `cd frontend && npm run build`
- **Public dir:** `frontend/dist`

## Environment Variables
The frontend may use environment variables (e.g. Mapbox token). Check `frontend/.env` or `frontend/ENV_SETUP_GUIDE.md` for details.
