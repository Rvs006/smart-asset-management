from fastapi import APIRouter

from ...db import get_conn
from ...models import TradeIn

router = APIRouter()


@router.get("/projects/{pid}/trades")
def list_trades(pid: int):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT t.*, (SELECT COUNT(*) FROM asset a WHERE a.trade_id=t.id) AS asset_count "
            "FROM trade t WHERE t.project_id=? ORDER BY t.code", (pid,)).fetchall()
        return [dict(r) for r in rows]


@router.post("/projects/{pid}/trades", status_code=201)
def add_trade(pid: int, body: TradeIn):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO trade (project_id,code,name,system_owner) VALUES (?,?,?,?)",
            (pid, body.code, body.name, body.system_owner))
        return dict(conn.execute("SELECT * FROM trade WHERE id=?", (cur.lastrowid,)).fetchone())
