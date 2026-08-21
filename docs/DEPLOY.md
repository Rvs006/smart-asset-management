# Deploy — Smart Asset Management Tool (SAM)

> ProductOS `studio-develop-golive`, August 2026. Local-first, mirroring the Smart Commissioning Tool portable model. Each step is marked 🧑 you · 🤖 agent · 🤝 together. Work top to bottom; you're live when the final smoke test reaches the magic moment as a real user.

## What "live" means here
SAM is an internal tool. "Live" = a commissioning engineer can run it on their own Windows laptop, offline, and manage a real project's register. No cloud, no server, no network required (127.0.0.1, SQLite, jobs inline). Data lives under `%LOCALAPPDATA%\SmartAssetManagement\sam.db` so it survives upgrading to a new build.

## A. Run from source (developer / today)
Already working in this repo.

1. 🤖 **Backend deps** — `cd backend && py -m venv .venv && .venv\Scripts\python -m pip install -r requirements.txt`.
2. 🤖 **Frontend deps** — `cd frontend && npm install`.
3. 🧑 **Start the backend** — from `backend/`:
   ```
   .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
4. 🧑 **Start the frontend** — from `frontend/`: `npm run dev` → open http://localhost:5174 (it proxies `/api` to :8000).
5. 🤝 **Smoke** — click "Load sample project" → land on Asset Management → confirm invalid cells are tinted and the fault list shows the cross-trade duplicate. That's the magic moment.

Verify: `cd backend && .venv\Scripts\python -m tests.test_smoke` prints `smoke OK`.

## B. Single-process local build (one app, no dev servers)
The backend serves the built frontend, so users run ONE thing.

1. 🤖 **Build the frontend** — `cd frontend && npm run build` → produces `frontend/dist/`.
2. 🤖 **Confirm the backend picks it up** — `app/main.py` mounts `/assets` and serves `dist/index.html` at `/` when `frontend/dist/index.html` exists.
3. 🧑 **Run** — `cd backend && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` → open http://127.0.0.1:8000 (no Vite needed).
4. 🤝 **Smoke** — same magic-moment check as A5, but against :8000.

Verify: with Vite stopped, http://127.0.0.1:8000 renders the full app and "Load sample project" works.

## C. Windows portable (distribute to engineers) — the SCT pattern
Package a double-click `.exe` that starts the backend, opens the browser, and needs no install. This mirrors `Smart_Commissioning_App_Windows_Portable`.

1. 🤖 **Add a launcher** — a small `run_app.py` that starts uvicorn on 127.0.0.1 and opens the browser at the printed URL; keep the console open, Ctrl+C to stop.
2. 🤖 **Freeze with PyInstaller** — bundle the backend + `frontend/dist/` + the Python runtime into `SmartAssetManagement.exe`. Ship `APP_VERSION.txt`, `README_FIRST.txt`, and `SHA256SUMS.txt` alongside (copy SCT's layout).
3. 🧑 **Sign the exe** (or document the SmartScreen "More info → Run anyway" step, and provide the SHA-256 for ThreatLocker/WDAC approval — same as SCT's tester builds).
4. 🧑 **Distribute** the zip; the DB is created under `%LOCALAPPDATA%\SmartAssetManagement` on first run, so upgrades drop in a new folder without losing data.
5. 🤝 **Field smoke** — on a clean laptop: unzip → double-click → browser opens → Load sample project → magic moment. Then import a *real* register and confirm genuine faults surface (this is also the beta-invite bar, launch #3).

> Not in this build (deferred with the hosted profile): multi-user hosting, Postgres, background workers, and the auth/ownership/transport hardening in `docs/SECURITY-AUDIT.md` § "Before hosted". Do not expose SAM on a network until those are done.

## Pre-flight checklist (before you hand a build to anyone)
- [ ] `tests/test_smoke.py` passes.
- [ ] `npm run build` succeeds and `dist/` is served at `/` by the backend.
- [ ] Security audit P2 items done; the two open items (grid masking, optional at-rest encryption) noted to the user if the target project carries live device passwords.
- [ ] `.gitignore` excludes `.venv`, `node_modules`, `dist`, `*.db`, `.env` (done).
- [ ] Version stamped in `backend/app/__init__.py` and shown in the header pill.
