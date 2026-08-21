from fastapi import APIRouter

from ...db import get_conn
from ... import validation as engine

router = APIRouter()


@router.post("/projects/{pid}/validate")
def validate(pid: int):
    with get_conn() as conn:
        return engine.run(conn, pid)


@router.get("/projects/{pid}/issues")
def list_issues(pid: int, trade: str | None = None, severity: str | None = None):
    with get_conn() as conn:
        q = ("SELECT vi.*, a.instance_name, t.code AS trade_code FROM validation_issue vi "
             "LEFT JOIN asset a ON a.id=vi.asset_id "
             "LEFT JOIN trade t ON t.id=a.trade_id "
             "WHERE vi.project_id=? AND vi.resolved=0")
        params: list = [pid]
        if trade:
            q += " AND t.code=?"
            params.append(trade)
        if severity:
            q += " AND vi.severity=?"
            params.append(severity)
        q += " ORDER BY CASE vi.severity WHEN 'error' THEN 0 ELSE 1 END, vi.rule"
        return [dict(r) for r in conn.execute(q, params).fetchall()]
