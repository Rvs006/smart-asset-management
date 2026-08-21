from fastapi import APIRouter

from ...db import get_conn

router = APIRouter()


@router.get("/projects/{pid}/audit")
def list_audit(pid: int, asset: int | None = None, limit: int = 100):
    with get_conn() as conn:
        q = "SELECT * FROM audit_event WHERE project_id=?"
        params: list = [pid]
        if asset:
            q += " AND asset_id=?"
            params.append(asset)
        q += " ORDER BY id DESC LIMIT ?"
        params.append(limit)
        return [dict(r) for r in conn.execute(q, params).fetchall()]
