from fastapi import APIRouter, File, Form, UploadFile

from ...db import get_conn
from ...importer import import_reference_sheet, REF_COLUMNS
from ...models import ReferenceIn
from ... import validation

router = APIRouter()


@router.get("/projects/{pid}/references")
def list_references(pid: int, kind: str | None = None):
    with get_conn() as conn:
        if kind:
            rows = conn.execute(
                "SELECT * FROM reference_value WHERE project_id=? AND kind=? ORDER BY code",
                (pid, kind)).fetchall()
            return [dict(r) for r in rows]
        # summary counts per kind
        rows = conn.execute(
            "SELECT kind, COUNT(*) AS count FROM reference_value WHERE project_id=? "
            "GROUP BY kind", (pid,)).fetchall()
        return {"counts": {r["kind"]: r["count"] for r in rows},
                "kinds": list(REF_COLUMNS.keys())}


@router.post("/projects/{pid}/references/import")
async def import_references(pid: int, kind: str = Form(...), file: UploadFile = File(...)):
    data = await file.read()
    with get_conn() as conn:
        n = import_reference_sheet(conn, pid, kind, data, file.filename or "upload.xlsx")
        validation.run(conn, pid)
    return {"kind": kind, "imported": n}


@router.post("/projects/{pid}/references", status_code=201)
def add_reference(pid: int, body: ReferenceIn):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO reference_value (project_id,kind,code,label,abbreviation) VALUES (?,?,?,?,?)",
            (pid, body.kind, body.code.strip(), body.label.strip(), body.abbreviation.strip()))
        validation.run(conn, pid)
        return {"id": cur.lastrowid}


@router.delete("/projects/{pid}/references/{rid}")
def delete_reference(pid: int, rid: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM reference_value WHERE id=? AND project_id=?", (rid, pid))
        validation.run(conn, pid)
    return {"deleted": rid}
