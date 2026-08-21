"""Validation engine — the heart of the magic moment.

Pure over a sqlite connection: reads assets + schema + reference lists for a
project, returns a list of issue dicts, and (optionally) persists them.

Rules:
  A. duplicate_instance_name  — same Instance Name on >1 asset, PROJECT-WIDE
                                (the thing Excel cannot see across tabs).
  B. invalid_reference        — a reference-typed field whose value isn't in the
                                project's controlled list for that kind.
  C. missing_mandatory        — required='yes' and the value is blank.
  D. conditional_required     — required='conditional' and the trigger matches,
                                but the value is blank (e.g. QR Size when QR=Yes).
  E. format                   — validation_type='format' and the value fails its
                                shape (digits:N, ipv4, mac).
"""
from __future__ import annotations

import json
import re
import sqlite3
from collections import defaultdict
from typing import Any

_IPV4 = re.compile(r"^(?:\d{1,3}\.){3}\d{1,3}$")
_MAC = re.compile(r"^(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$")


def _blank(v: Any) -> bool:
    return v is None or str(v).strip() == "" or str(v).strip().upper() in ("N/A", "NA")


def _format_ok(value: str, rule: str) -> bool:
    rule = (rule or "").strip().lower()
    v = str(value).strip()
    if rule.startswith("digits:"):
        try:
            n = int(rule.split(":", 1)[1])
        except ValueError:
            return True
        return v.isdigit() and len(v) == n
    if rule == "ipv4":
        if not _IPV4.match(v):
            return False
        return all(0 <= int(p) <= 255 for p in v.split("."))
    if rule == "mac":
        return bool(_MAC.match(v))
    return True


def _reference_index(conn: sqlite3.Connection, project_id: int) -> dict[str, set[str]]:
    """kind -> set of acceptable tokens (code/label/abbreviation), upper-cased."""
    idx: dict[str, set[str]] = defaultdict(set)
    for r in conn.execute(
        "SELECT kind, code, label, abbreviation FROM reference_value "
        "WHERE project_id=? AND active=1",
        (project_id,),
    ):
        for tok in (r["code"], r["label"], r["abbreviation"]):
            if tok:
                idx[r["kind"]].add(str(tok).strip().upper())
    return idx


def validate_project(conn: sqlite3.Connection, project_id: int) -> list[dict]:
    fields = [dict(r) for r in conn.execute(
        "SELECT * FROM schema_field WHERE project_id=?", (project_id,)
    )]
    assets = [dict(r) for r in conn.execute(
        "SELECT a.*, t.code AS trade_code FROM asset a "
        "JOIN trade t ON t.id=a.trade_id WHERE a.project_id=?",
        (project_id,),
    )]
    refs = _reference_index(conn, project_id)
    issues: list[dict] = []

    # A. cross-trade duplicate Instance Names (project-wide)
    by_name: dict[str, list[dict]] = defaultdict(list)
    for a in assets:
        nm = (a["instance_name"] or "").strip()
        if nm:
            by_name[nm.upper()].append(a)
    for nm_up, group in by_name.items():
        if len(group) > 1:
            trades = sorted({g["trade_code"] for g in group})
            for a in group:
                others = ", ".join(t for t in trades if t != a["trade_code"]) or "another trade"
                issues.append(_issue(
                    a["id"], "instance_name", "error", "duplicate_instance_name",
                    f"Duplicate Instance Name '{a['instance_name']}' — also in {others}.",
                    "unique across the whole project",
                ))

    # B–E. per-field, per-asset
    for a in assets:
        meta = json.loads(a["metadata"] or "{}")
        for f in fields:
            key = f["field_key"]
            val = a["instance_name"] if key == "instance_name" else meta.get(key)
            # C. missing mandatory
            if f["required"] == "yes" and _blank(val):
                issues.append(_issue(a["id"], key, "error", "missing_mandatory",
                                     f"{f['display_name']} is required but blank.",
                                     "a value"))
                continue
            # D. conditional required
            if f["required"] == "conditional" and f["conditional_expr"]:
                trig_key, _, trig_val = f["conditional_expr"].partition("=")
                trig_actual = meta.get(trig_key.strip())
                if str(trig_actual).strip().upper() == trig_val.strip().upper() and _blank(val):
                    issues.append(_issue(a["id"], key, "error", "conditional_required",
                                         f"{f['display_name']} is required when "
                                         f"{trig_key.strip()} = {trig_val.strip()}.",
                                         "a value"))
                    continue
            if _blank(val):
                continue
            # B. reference validity
            if f["validation_type"] == "reference" and f["reference_kind"]:
                allowed = refs.get(f["reference_kind"], set())
                if allowed and str(val).strip().upper() not in allowed:
                    issues.append(_issue(a["id"], key, "error", "invalid_reference",
                                         f"{val} is not in the project's "
                                         f"{f['reference_kind']} reference list.",
                                         f"a value from the {f['reference_kind']} list"))
            # E. format
            elif f["validation_type"] == "format" and f["format_rule"]:
                if not _format_ok(val, f["format_rule"]):
                    issues.append(_issue(a["id"], key, "warning", "format",
                                         f"{f['display_name']} '{val}' does not match "
                                         f"the expected format ({f['format_rule']}).",
                                         f["format_rule"]))
    return issues


def _issue(asset_id, field_key, severity, rule, message, expected) -> dict:
    return {"asset_id": asset_id, "field_key": field_key, "severity": severity,
            "rule": rule, "message": message, "expected": expected}


def persist(conn: sqlite3.Connection, project_id: int, issues: list[dict]) -> None:
    conn.execute("DELETE FROM validation_issue WHERE project_id=? AND resolved=0",
                 (project_id,))
    conn.executemany(
        "INSERT INTO validation_issue "
        "(project_id, asset_id, field_key, severity, rule, message, expected) "
        "VALUES (?,?,?,?,?,?,?)",
        [(project_id, i["asset_id"], i["field_key"], i["severity"], i["rule"],
          i["message"], i["expected"]) for i in issues],
    )


def run(conn: sqlite3.Connection, project_id: int) -> dict:
    issues = validate_project(conn, project_id)
    persist(conn, project_id, issues)
    errors = sum(1 for i in issues if i["severity"] == "error")
    return {"issue_count": len(issues), "error_count": errors,
            "warning_count": len(issues) - errors}


def demo() -> None:
    """Self-check: a planted dataset must surface exactly the expected faults."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    from .db import SCHEMA
    conn.executescript(SCHEMA)
    conn.execute("INSERT INTO project (id,name) VALUES (1,'T')")
    conn.execute("INSERT INTO trade (id,project_id,code) VALUES (1,1,'BMS'),(2,1,'MECH')")
    conn.executemany(
        "INSERT INTO reference_value (project_id,kind,code) VALUES (1,'level',?)",
        [("L04",), ("B02",)],
    )
    fields = [
        ("instance_name", "Instance Name", "unique", "", "project", "", "yes"),
        ("level", "Level", "reference", "level", "", "", "yes"),
        ("qr_code_required", "QR Required", "none", "", "", "", "no"),
        ("qr_label_size", "QR Size", "none", "", "", "", "conditional"),
        ("unique_local_number", "Unique Local No.", "format", "", "", "digits:3", "no"),
    ]
    for k, dn, vt, rk, us, fr, req in fields:
        cond = "qr_code_required=Yes" if k == "qr_label_size" else ""
        conn.execute(
            "INSERT INTO schema_field (project_id,field_key,display_name,validation_type,"
            "reference_kind,unique_scope,format_rule,required,conditional_expr) "
            "VALUES (1,?,?,?,?,?,?,?,?)", (k, dn, vt, rk, us, fr, req, cond))
    # asset 1 (BMS): valid. asset 2 (MECH): duplicate name of asset1.
    # asset 3 (BMS): invalid level LXX + QR required but size blank + bad unique no.
    conn.execute("INSERT INTO asset (project_id,trade_id,instance_name,metadata) VALUES "
                 "(1,1,'AHU-1',?)", (json.dumps({"level": "L04", "unique_local_number": "001"}),))
    conn.execute("INSERT INTO asset (project_id,trade_id,instance_name,metadata) VALUES "
                 "(1,2,'AHU-1',?)", (json.dumps({"level": "B02", "unique_local_number": "002"}),))
    conn.execute("INSERT INTO asset (project_id,trade_id,instance_name,metadata) VALUES "
                 "(1,1,'FCU-9',?)", (json.dumps({"level": "LXX", "qr_code_required": "Yes",
                                                 "qr_label_size": "", "unique_local_number": "7"}),))
    issues = validate_project(conn, 1)
    rules = [i["rule"] for i in issues]
    assert rules.count("duplicate_instance_name") == 2, rules
    assert "invalid_reference" in rules, rules
    assert "conditional_required" in rules, rules
    assert "format" in rules, rules
    print("validation.demo OK —", len(issues), "issues:", sorted(set(rules)))


if __name__ == "__main__":
    demo()
