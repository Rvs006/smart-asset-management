import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ...db import get_conn
from ...importer import import_assets
from ...models import AssetIn, AssetPatch, GenerateNamesIn
from ... import naming, validation

router = APIRouter()


def _issues_by_asset(conn, pid):
    out: dict[int, list] = {}
    for r in conn.execute(
        "SELECT asset_id, field_key, severity, rule, message, expected FROM validation_issue "
        "WHERE project_id=? AND resolved=0 AND asset_id IS NOT NULL", (pid,)):
        out.setdefault(r["asset_id"], []).append(dict(r))
    return out


def _serialize(row, issues):
    return {
        "id": row["id"], "trade_id": row["trade_id"], "trade_code": row["trade_code"],
        "instance_name": row["instance_name"], "source": row["source"],
        "metadata": json.loads(row["metadata"] or "{}"),
        "issues": issues.get(row["id"], []),
    }


@router.get("/projects/{pid}/assets")
def list_assets(pid: int, trade: str | None = None, search: str | None = None):
    with get_conn() as conn:
        q = ("SELECT a.*, t.code AS trade_code FROM asset a JOIN trade t ON t.id=a.trade_id "
             "WHERE a.project_id=?")
        params: list = [pid]
        if trade:
            q += " AND t.code=?"
            params.append(trade)
        q += " ORDER BY a.instance_name"
        rows = conn.execute(q, params).fetchall()
        issues = _issues_by_asset(conn, pid)
        items = [_serialize(r, issues) for r in rows]
        if search:
            s = search.lower()
            items = [it for it in items
                     if s in json.dumps(it, default=str).lower()]
        return items


@router.post("/projects/{pid}/assets", status_code=201)
def create_asset(pid: int, body: AssetIn):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO asset (project_id,trade_id,instance_name,metadata,source) "
            "VALUES (?,?,?,?, 'manual')",
            (pid, body.trade_id, body.instance_name, json.dumps(body.metadata)))
        aid = cur.lastrowid
        validation.persist(conn, pid, validation.validate_project(conn, pid))
    return {"id": aid}


@router.patch("/projects/{pid}/assets/{aid}")
def patch_asset(pid: int, aid: int, body: AssetPatch):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM asset WHERE id=? AND project_id=?", (aid, pid)).fetchone()
        if not row:
            raise HTTPException(404, "Asset not found")
        before = {"instance_name": row["instance_name"], "metadata": row["metadata"]}
        meta = json.loads(row["metadata"] or "{}")
        if body.metadata is not None:
            meta.update(body.metadata)
        instance = body.instance_name if body.instance_name is not None else row["instance_name"]
        conn.execute("UPDATE asset SET instance_name=?, metadata=?, updated_at=datetime('now') "
                     "WHERE id=?", (instance, json.dumps(meta), aid))
        conn.execute("INSERT INTO audit_event (project_id,asset_id,action,before,after) "
                     "VALUES (?,?,?,?,?)", (pid, aid, "edit", json.dumps(before),
                                            json.dumps({"instance_name": instance, "metadata": meta})))
        validation.persist(conn, pid, validation.validate_project(conn, pid))
    return {"id": aid}


@router.delete("/projects/{pid}/assets/{aid}")
def delete_asset(pid: int, aid: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM asset WHERE id=? AND project_id=?", (aid, pid))
        validation.persist(conn, pid, validation.validate_project(conn, pid))
    return {"deleted": aid}


@router.post("/projects/{pid}/assets/import")
async def import_assets_route(pid: int, trade_id: int = Form(...), mode: str = Form("create"),
                              file: UploadFile = File(...)):
    data = await file.read()
    with get_conn() as conn:
        result = import_assets(conn, pid, trade_id, data, file.filename or "assets.xlsx", mode)
        summary = validation.run(conn, pid)
    return {**result, "validation": summary}


@router.post("/projects/{pid}/assets/generate-names")
def generate_names(pid: int, body: GenerateNamesIn):
    with get_conn() as conn:
        n = naming.generate_for_project(conn, pid, body.trade_id, body.only_blank)
        summary = validation.run(conn, pid)
    return {"generated": n, "validation": summary}
