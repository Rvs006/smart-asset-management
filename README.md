# Smart Asset Management Tool (SAM)

An Electracom internal tool that replaces the per-trade Excel "Smart Asset Registers" on smart-building projects with **one governed, validated database per project**. Define the naming convention and reference lists once, import the project's register template, populate each trade against validated dropdowns, and get continuous cell-level validation — including **cross-trade duplicate Instance Name detection** — plus import/export back to spreadsheet at any time.

Built in the same look, feel and stack as the Smart Commissioning Tool (SCT).

## Run the portable app (no install)

Download the latest release, unzip, and double-click **`SmartAssetManagement.exe`**. It opens your browser at `http://127.0.0.1:8000`. On the Home page click **Load sample project** to see the magic moment: a real register with cross-trade duplicates and invalid references flagged live. Data is stored under `%LOCALAPPDATA%\SmartAssetManagement` so it survives upgrades.

> Unsigned build — on first launch Windows SmartScreen may warn: **More info → Run anyway**, or approve `SmartAssetManagement.exe` by its SHA-256 for ThreatLocker/WDAC.

## Run from source (developers)

```bash
# backend
cd backend
py -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# frontend (separate terminal)
cd frontend
npm install
npm run dev            # http://localhost:5174, proxies /api -> :8000
```

Single process: `cd frontend && npm run build`, then run the backend — it serves the built app at `/` on `:8000`. Full detail in [docs/DEPLOY.md](docs/DEPLOY.md).

## What's inside

| Path | |
|---|---|
| `backend/` | FastAPI + SQLite API, the validation & naming engines, import/export |
| `frontend/` | React 19 + Vite UI in the SCT design language |
| `docs/` | PRODUCT, DESIGN (+ live style guide), PRD, ROADMAP, SECURITY-AUDIT, DEPLOY, review notes |
| `docs/reference/` | The SCT UI reference pack and the Day-1 spec/import templates |
| `mockup/` | The earlier Day-1 concept mockup (superseded style) |

## Status

Working vertical slice: the create → import → validate → grid + overview → export path is complete and verified (engine self-checks, a smoke test, a production build, and a live browser run with zero console errors). The remaining widening tasks are tracked in [docs/ROADMAP.md](docs/ROADMAP.md).

Security posture: safe for the **local, single-user (127.0.0.1) profile only**. Do not expose on a network without the auth/ownership/transport hardening in [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md).

## Tests

```bash
cd backend
.venv\Scripts\python -m app.validation      # validation engine self-check
.venv\Scripts\python -m app.naming          # naming engine self-check
.venv\Scripts\python -m tests.test_smoke    # end-to-end smoke
```
