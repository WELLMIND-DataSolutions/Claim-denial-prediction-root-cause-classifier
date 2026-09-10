# Claim Denial Intelligence — Frontend (Vite + React)

React/Vite recreation of the Streamlit dashboard (`step13_Dashboard.py`). Calls the
existing FastAPI backend (`step12_Fastapi.py`) at `POST /predict/full`.

## Local development

```bash
npm install
cp .env.example .env
# edit .env — set VITE_API_URL to your running FastAPI backend
npm run dev
```

## Deploying on Vercel

1. Push this `frontend/` folder to a GitHub repo (or the root of its own repo).
2. On vercel.com → **New Project** → import the repo.
   - Framework preset: **Vite** (auto-detected)
   - Build command: `npm run build` (default)
   - Output directory: `dist` (default)
3. In **Environment Variables**, add:
   - `VITE_API_URL` = the public URL of your deployed FastAPI backend
     (e.g. `https://wellmind-api.onrender.com`)
4. Deploy.

## Backend

This frontend is API-only — it does not run any Python. The FastAPI backend
(`step12_Fastapi.py`) still needs to be hosted somewhere that can run a long-lived
Python process (Render, Railway, Fly.io, etc.), since Vercel does not run
FastAPI/uvicorn servers. Make sure the backend's CORS settings allow requests from
your Vercel domain (the existing `step12_Fastapi.py` already allows `*`).
