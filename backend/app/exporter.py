"""Export a register or the validation issues to CSV.

Sensitive fields (passwords, keys) are excluded from a plain export by default —
the register can hold a "Default Password" column and secret keys.
"""
from __future__ import annotations

import csv
import io
import json
import sqlite3

SENSITIVE = ("password", "private_key", "secret", "default_password")


def _is_sensitive(field_key: str) -> bool:
    fk = field_key.lower()
    return any(s in fk for s in SENSITIVE)


def export_register_csv(conn: sqlite3.Connection, project_id: int,
                        trade_id: int | None = None,
                        include_sensitive: bool = False) -> str:
    fields = [dict(r) for r in conn.execute(
        "SELECT field_key, display_name FROM schema_field "
        "WHERE project_id=? AND visible=1 AND field_key!='instance_name' "
        "ORDER BY export_order", (project_id,))]
    if not include_sensitive:
        fields = [f for f in fields if not _is_sensitive(f["field_key"])]
    cols = ["Trade", "Instance Name"] + [f["display_name"] for f in fields]

    q = ("SELECT a.instance_name, a.metadata, t.code AS trade_code FROM asset a "
         "JOIN trade t ON t.id=a.trade_id WHERE a.project_id=?")
    params: list = [project_id]
    if trade_id:
        q += " AND a.trade_id=?"
        params.append(trade_id)
    q += " ORDER BY t.code, a.instance_name"

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(cols)
    for a in conn.execute(q, params):
        meta = json.loads(a["metadata"] or "{}")
        row = [a["trade_code"], a["instance_name"]]
        row += [meta.get(f["field_key"], "") for f in fields]
        w.writerow(row)
    return buf.getvalue()


def export_issues_csv(conn: sqlite3.Connection, project_id: int) -> str:
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Severity", "Rule", "Trade", "Instance Name", "Field", "Message", "Expected"])
    rows = conn.execute(
        "SELECT vi.severity, vi.rule, vi.field_key, vi.message, vi.expected, "
        "a.instance_name, t.code AS trade_code "
        "FROM validation_issue vi "
        "LEFT JOIN asset a ON a.id=vi.asset_id "
        "LEFT JOIN trade t ON t.id=a.trade_id "
        "WHERE vi.project_id=? AND vi.resolved=0 "
        "ORDER BY vi.severity, vi.rule", (project_id,))
    for r in rows:
        w.writerow([r["severity"], r["rule"], r["trade_code"] or "", r["instance_name"] or "",
                    r["field_key"] or "", r["message"], r["expected"]])
    return buf.getvalue()
