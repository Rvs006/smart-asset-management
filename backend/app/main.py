"""SAM backend — FastAPI app. Local-first: SQLite, jobs inline, loopback trust.

Serves the built frontend from / when frontend/dist exists (one process runs the
whole app, mirroring the Smart Commissioning Tool portable pattern).
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import CORS_ORIGINS, SERVICE, VERSION
from .db import init_db
from .seed import seed_demo
from .api.routes import (assets, audit, config, export, naming, overview,
                         projects, references, schema, trades, validation)

app = FastAPI(title="Smart Asset Management API", version=VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

API = "/api/v1"
for module in (projects, references, schema, trades, assets, validation,
               overview, export, naming, audit, config):
    app.include_router(module.router, prefix=API)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get(f"{API}/health")
def health():
    return {"status": "ok", "service": SERVICE, "version": VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post(f"{API}/seed-demo", status_code=201)
def seed_demo_route():
    pid = seed_demo()
    return {"project_id": pid}


# Serve the built frontend if present (production/portable). Dev uses Vite proxy.
# When frozen by PyInstaller, bundled data lives under sys._MEIPASS/frontend/dist.
if getattr(sys, "frozen", False):
    _dist = Path(getattr(sys, "_MEIPASS", ".")) / "frontend" / "dist"
else:
    _dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if (_dist / "index.html").exists():
    if (_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(_dist / "assets")), name="assets")

    from fastapi.responses import FileResponse

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        candidate = _dist / full_path
        if full_path and candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(_dist / "index.html"))
