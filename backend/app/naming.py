"""Naming engine — auto-generate BDNS-aligned Instance Names from segments.

Example (from the naming technical submittal):
  AHU  -  building 1  floor 02  zone 0  unique 013  ->  AHU-1020013
  FCU  -  building 1  floor 07  zone 1  unique 095  ->  FCU-1071095
"""
from __future__ import annotations

import json
import sqlite3
from typing import Callable


def _seg_value(seg: dict, get: Callable[[str], str]) -> str:
    st = seg["segment_type"]
    if st == "fixed":
        raw = seg.get("fixed_value", "")
    else:  # lookup | reference | number
        raw = get(seg.get("source_field", "")) or ""
    raw = str(raw).strip()
    length = int(seg.get("length") or 0)
    if length:
        pad = (seg.get("pad_char") or "0")[:1] or "0"
        if seg.get("pad_dir", "left") == "left":
            raw = raw.rjust(length, pad)[-length:]
        else:
            raw = raw.ljust(length, pad)[:length]
    return (seg.get("delimiter_before") or "") + raw


def generate_name(segments: list[dict], get: Callable[[str], str], case_mode: str = "upper") -> str:
    parts = [_seg_value(s, get) for s in sorted(segments, key=lambda x: x["sequence"])]
    name = "".join(parts)
    if case_mode == "upper":
        name = name.upper()
    elif case_mode == "lower":
        name = name.lower()
    return name


def _resolver(conn: sqlite3.Connection, project_id: int, meta: dict) -> Callable[[str], str]:
    # equipment-type abbreviation lookup for the 'abbreviation' source field
    abbr_by_type: dict[str, str] = {}
    for r in conn.execute(
        "SELECT code,label,abbreviation FROM reference_value "
        "WHERE project_id=? AND kind='equipment_type'", (project_id,)):
        if r["abbreviation"]:
            for tok in (r["code"], r["label"]):
                if tok:
                    abbr_by_type[str(tok).strip().upper()] = r["abbreviation"]

    def get(field: str) -> str:
        if field == "abbreviation":
            et = str(meta.get("bdns_equipment_type", "")).strip().upper()
            return abbr_by_type.get(et, "")
        return str(meta.get(field, "") or "")
    return get


def generate_for_project(conn: sqlite3.Connection, project_id: int,
                         trade_id: int | None = None, only_blank: bool = True) -> int:
    scheme = conn.execute(
        "SELECT * FROM naming_scheme WHERE project_id=?", (project_id,)).fetchone()
    if not scheme:
        return 0
    segments = [dict(r) for r in conn.execute(
        "SELECT * FROM naming_segment WHERE scheme_id=? ORDER BY sequence", (scheme["id"],))]
    if not segments:
        return 0
    q = "SELECT * FROM asset WHERE project_id=?"
    params: list = [project_id]
    if trade_id:
        q += " AND trade_id=?"
        params.append(trade_id)
    count = 0
    for a in conn.execute(q, params).fetchall():
        if only_blank and (a["instance_name"] or "").strip():
            continue
        meta = json.loads(a["metadata"] or "{}")
        name = generate_name(segments, _resolver(conn, project_id, meta), scheme["case_mode"])
        if name:
            conn.execute(
                "UPDATE asset SET instance_name=?, source='generated', "
                "updated_at=datetime('now') WHERE id=?", (name, a["id"]))
            count += 1
    return count


# The five-segment BDNS scheme used by the samples and the seed.
DEFAULT_SEGMENTS = [
    dict(sequence=1, name="Abbreviation", source_field="abbreviation",
         segment_type="lookup", fixed_value="", length=0, pad_char="0",
         pad_dir="left", delimiter_before=""),
    dict(sequence=2, name="Building", source_field="building_reference",
         segment_type="reference", fixed_value="", length=1, pad_char="0",
         pad_dir="left", delimiter_before="-"),
    dict(sequence=3, name="Floor", source_field="level", segment_type="reference",
         fixed_value="", length=2, pad_char="0", pad_dir="left", delimiter_before=""),
    dict(sequence=4, name="Zone", source_field="operational_zone_reference",
         segment_type="reference", fixed_value="", length=1, pad_char="0",
         pad_dir="left", delimiter_before=""),
    dict(sequence=5, name="Unique", source_field="unique_local_number",
         segment_type="number", fixed_value="", length=3, pad_char="0",
         pad_dir="left", delimiter_before=""),
]


def demo() -> None:
    vals1 = {"abbreviation": "AHU", "building_reference": "1", "level": "2",
             "operational_zone_reference": "0", "unique_local_number": "13"}
    vals2 = {"abbreviation": "FCU", "building_reference": "1", "level": "7",
             "operational_zone_reference": "1", "unique_local_number": "95"}
    n1 = generate_name(DEFAULT_SEGMENTS, lambda f: vals1.get(f, ""))
    n2 = generate_name(DEFAULT_SEGMENTS, lambda f: vals2.get(f, ""))
    assert n1 == "AHU-1020013", n1
    assert n2 == "FCU-1071095", n2
    print("naming.demo OK —", n1, n2)


if __name__ == "__main__":
    demo()
