import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from ...db import get_conn

router = APIRouter()


def _bundle(conn, pid: int) -> dict:
    project = conn.execute("SELECT * FROM project WHERE id=?", (pid,)).fetchone()
    if not project:
        raise HTTPException(404, "Project not found")
    tables = {
        "trades": "SELECT code,name,system_owner,active FROM trade WHERE project_id=?",
        "references": "SELECT kind,code,label,abbreviation FROM reference_value WHERE project_id=?",
        "schema": "SELECT * FROM schema_field WHERE project_id=? ORDER BY export_order",
    }
    out = {"project": dict(project)}
    for key, q in tables.items():
        out[key] = [dict(r) for r in conn.execute(q, (pid,))]
    scheme = conn.execute("SELECT * FROM naming_scheme WHERE project_id=?", (pid,)).fetchone()
    if scheme:
        out["naming_scheme"] = dict(scheme)
        out["naming_segments"] = [dict(r) for r in conn.execute(
            "SELECT * FROM naming_segment WHERE scheme_id=? ORDER BY sequence", (scheme["id"],))]
    return out


@router.get("/projects/{pid}/config/export")
def export_config(pid: int):
    with get_conn() as conn:
        data = json.dumps(_bundle(conn, pid), indent=2, default=str)
    return Response(content=data, media_type="application/json",
                    headers={"Content-Disposition": "attachment; filename=project_config.json"})
