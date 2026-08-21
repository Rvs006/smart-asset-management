from fastapi import APIRouter

from ...db import get_conn

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
