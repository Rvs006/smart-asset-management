"""SQLite layer: connection helper + schema init. Parameterized queries only."""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from typing import Iterator

from .config import db_path

SCHEMA = """
CREATE TABLE IF NOT EXISTS project (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  site_reference TEXT DEFAULT '',
  building_reference TEXT DEFAULT '',
  name_mode TEXT NOT NULL DEFAULT 'auto',          -- 'auto' | 'import'
  naming_standard TEXT NOT NULL DEFAULT 'BDNS',
  status TEXT NOT NULL DEFAULT 'active',            -- 'active' | 'archived'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trade (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  system_owner TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS reference_value (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,          -- building|level|space|system|zone|equipment_type
  code TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  parent_ref TEXT DEFAULT '',
  abbreviation TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS schema_field (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  grp TEXT DEFAULT '',
  data_type TEXT NOT NULL DEFAULT 'text',
  required TEXT NOT NULL DEFAULT 'no',              -- yes|no|conditional
  conditional_expr TEXT DEFAULT '',                -- e.g. "QR Required=Yes"
  validation_type TEXT NOT NULL DEFAULT 'none',    -- reference|unique|format|none
  reference_kind TEXT DEFAULT '',
  unique_scope TEXT DEFAULT '',                    -- project|trade
  format_rule TEXT DEFAULT '',                     -- e.g. digits:3, ipv4, mac
  auto_generated INTEGER NOT NULL DEFAULT 0,
  editable INTEGER NOT NULL DEFAULT 1,
  visible INTEGER NOT NULL DEFAULT 1,
  export_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS naming_scheme (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Project naming',
  standard TEXT NOT NULL DEFAULT 'BDNS',
  mode TEXT NOT NULL DEFAULT 'auto',
  uniqueness_scope TEXT NOT NULL DEFAULT 'project',
  case_mode TEXT NOT NULL DEFAULT 'upper',
  site_ref_separate INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS naming_segment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scheme_id INTEGER NOT NULL REFERENCES naming_scheme(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  name TEXT NOT NULL,
  source_field TEXT DEFAULT '',
  segment_type TEXT NOT NULL DEFAULT 'reference',  -- lookup|reference|fixed|number
  fixed_value TEXT DEFAULT '',
  length INTEGER DEFAULT 0,
  pad_char TEXT DEFAULT '0',
  pad_dir TEXT DEFAULT 'left',
  delimiter_before TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS asset (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  trade_id INTEGER NOT NULL REFERENCES trade(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',             -- JSON: field_key -> value
  source TEXT NOT NULL DEFAULT 'manual',           -- manual|import|generated
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS validation_issue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  asset_id INTEGER REFERENCES asset(id) ON DELETE CASCADE,
  field_key TEXT DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'error',          -- error|warning
  rule TEXT NOT NULL,
  message TEXT NOT NULL,
  expected TEXT DEFAULT '',
  resolved INTEGER NOT NULL DEFAULT 0,
  detected_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  asset_id INTEGER,
  actor TEXT NOT NULL DEFAULT 'local',
  action TEXT NOT NULL,
  before TEXT DEFAULT '',
  after TEXT DEFAULT '',
  at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS ix_asset_name  ON asset(project_id, instance_name);
CREATE INDEX IF NOT EXISTS ix_asset_trade ON asset(project_id, trade_id);
CREATE INDEX IF NOT EXISTS ix_ref         ON reference_value(project_id, kind, code);
CREATE INDEX IF NOT EXISTS ix_issue       ON validation_issue(project_id, resolved);
CREATE INDEX IF NOT EXISTS ix_field_order ON schema_field(project_id, export_order);
"""


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def get_conn() -> Iterator[sqlite3.Connection]:
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(SCHEMA)


if __name__ == "__main__":
    init_db()
    print("initialised", db_path())
