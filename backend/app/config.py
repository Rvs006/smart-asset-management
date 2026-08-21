"""Runtime config. Local-first profile, mirroring the Smart Commissioning Tool.

The SQLite file lives under %LOCALAPPDATA%\\SmartAssetManagement so it survives
upgrading to a new release folder (SCT does the same). Falls back to ./sam.db.
"""
from __future__ import annotations

import os
from pathlib import Path

from . import __version__

VERSION = __version__
SERVICE = "smart-asset-api"

# ponytail: one env override is enough; no config framework needed.
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def data_dir() -> Path:
    override = os.environ.get("SAM_DATA_DIR")
    if override:
        d = Path(override)
    else:
        base = os.environ.get("LOCALAPPDATA")
        d = Path(base) / "SmartAssetManagement" if base else Path.cwd()
    d.mkdir(parents=True, exist_ok=True)
    return d


def db_path() -> str:
    return str(data_dir() / "sam.db")
