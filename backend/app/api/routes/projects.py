from fastapi import APIRouter, HTTPException

from ...db import get_conn
from ...models import ProjectIn, ProjectPatch

router = APIRouter()


@router.get("/projects")
def list_projects():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT p.*, "
            "(SELECT COUNT(*) FROM asset a WHERE a.project_id=p.id) AS asset_count "
            "FROM project p ORDER BY p.created_at DESC").fetchall()
        return [dict(r) for r in rows]


@router.post("/projects", status_code=201)
def create_project(body: ProjectIn):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO project (name,site_reference,building_reference,name_mode,naming_standard) "
            "VALUES (?,?,?,?,?)",
            (body.name, body.site_reference, body.building_reference, body.name_mode,
             body.naming_standard))
        return dict(conn.execute("SELECT * FROM project WHERE id=?", (cur.lastrowid,)).fetchone())


@router.get("/projects/{pid}")
def get_project(pid: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM project WHERE id=?", (pid,)).fetchone()
        if not row:
            raise HTTPException(404, "Project not found")
        return dict(row)


@router.patch("/projects/{pid}")
def patch_project(pid: int, body: ProjectPatch):
    fields = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not fields:
        return get_project(pid)
    sets = ", ".join(f"{k}=?" for k in fields)
    with get_conn() as conn:
        if not conn.execute("SELECT 1 FROM project WHERE id=?", (pid,)).fetchone():
            raise HTTPException(404, "Project not found")
        conn.execute(f"UPDATE project SET {sets} WHERE id=?", (*fields.values(), pid))
        return dict(conn.execute("SELECT * FROM project WHERE id=?", (pid,)).fetchone())
