import json

from fastapi import APIRouter, HTTPException

from ...db import get_conn
from ...models import NamingSchemeIn, NamingPresetIn
from ... import naming

router = APIRouter()


@router.get("/projects/{pid}/naming")
def get_naming(pid: int):
    with get_conn() as conn:
        scheme = conn.execute("SELECT * FROM naming_scheme WHERE project_id=?", (pid,)).fetchone()
        if not scheme:
            return {"scheme": None, "segments": []}
        segs = conn.execute(
            "SELECT * FROM naming_segment WHERE scheme_id=? ORDER BY sequence",
            (scheme["id"],)).fetchall()
        return {"scheme": dict(scheme), "segments": [dict(s) for s in segs]}


@router.post("/projects/{pid}/naming")
def set_naming(pid: int, body: NamingSchemeIn):
    segs = [s.model_dump() for s in body.segments]
    with get_conn() as conn:
        naming.set_scheme(conn, pid, body.name, body.standard, body.mode, body.case_mode, segs)
    return {"ok": True, "segments": len(segs)}


@router.get("/projects/{pid}/naming/presets")
def list_presets(pid: int):
    builtins = [{"id": f"builtin:{i}", "name": p["name"], "standard": p["standard"],
                 "segments": p["segments"]} for i, p in enumerate(naming.BUILTIN_PRESETS)]
    with get_conn() as conn:
        saved = [{"id": r["id"], "name": r["name"], "standard": r["standard"],
                  "segments": json.loads(r["segments"])}
                 for r in conn.execute("SELECT * FROM naming_preset ORDER BY name")]
    return {"builtin": builtins, "saved": saved}


@router.post("/projects/{pid}/naming/presets", status_code=201)
def save_preset(pid: int, body: NamingPresetIn):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO naming_preset (name,standard,segments) VALUES (?,?,?)",
            (body.name, body.standard, json.dumps([s.model_dump() for s in body.segments])))
        return {"id": cur.lastrowid}


@router.post("/projects/{pid}/naming/apply-preset")
def apply_preset(pid: int, body: dict):
    preset_id = str(body.get("preset_id", ""))
    with get_conn() as conn:
        if preset_id.startswith("builtin:"):
            idx = int(preset_id.split(":", 1)[1])
            preset = naming.BUILTIN_PRESETS[idx]
            segs, name, standard = preset["segments"], preset["name"], preset["standard"]
        else:
            r = conn.execute("SELECT * FROM naming_preset WHERE id=?", (int(preset_id),)).fetchone()
            if not r:
                raise HTTPException(404, "Preset not found")
            segs, name, standard = json.loads(r["segments"]), r["name"], r["standard"]
        naming.set_scheme(conn, pid, name, standard, "auto", "upper", segs)
    return {"ok": True}
