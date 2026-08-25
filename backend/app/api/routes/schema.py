import csv
import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import PlainTextResponse

from ...db import get_conn
from ...importer import import_schema, normalize_key
from ...models import SchemaFieldIn, SchemaFieldPatch
from ... import validation

router = APIRouter()


@router.get("/projects/{pid}/schema")
def get_schema(pid: int):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM schema_field WHERE project_id=? ORDER BY export_order", (pid,)).fetchall()
        return [dict(r) for r in rows]


@router.post("/projects/{pid}/schema/import")
async def import_schema_route(pid: int, file: UploadFile = File(...)):
    data = await file.read()
    with get_conn() as conn:
        n = import_schema(conn, pid, data, file.filename or "schema.xlsx")
        validation.run(conn, pid)
    return {"parameters_detected": n}


@router.post("/projects/{pid}/schema/field", status_code=201)
def add_field(pid: int, body: SchemaFieldIn):
    key = body.field_key.strip() or normalize_key(body.display_name)
    with get_conn() as conn:
        if conn.execute("SELECT 1 FROM schema_field WHERE project_id=? AND field_key=?",
                        (pid, key)).fetchone():
            raise HTTPException(409, f"Parameter '{key}' already exists")
        nxt = conn.execute("SELECT COALESCE(MAX(export_order),0)+1 n FROM schema_field WHERE project_id=?",
                           (pid,)).fetchone()["n"]
        conn.execute(
            "INSERT INTO schema_field (project_id,field_key,display_name,grp,data_type,required,"
            "conditional_expr,validation_type,reference_kind,format_rule,responsibility,visible,"
            "export_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (pid, key, body.display_name, body.grp, body.data_type, body.required,
             body.conditional_expr, body.validation_type, body.reference_kind, body.format_rule,
             body.responsibility, 1 if body.visible else 0, nxt))
        validation.run(conn, pid)
    return {"field_key": key}


@router.patch("/projects/{pid}/schema/field/{fid}")
def patch_field(pid: int, fid: int, body: SchemaFieldPatch):
    fields = body.model_dump(exclude_none=True)
    if "visible" in fields:
        fields["visible"] = 1 if fields["visible"] else 0
    if not fields:
        return {"id": fid}
    sets = ", ".join(f"{k}=?" for k in fields)
    with get_conn() as conn:
        conn.execute(f"UPDATE schema_field SET {sets} WHERE id=? AND project_id=?",
                     (*fields.values(), fid, pid))
        validation.run(conn, pid)
    return {"id": fid}


@router.delete("/projects/{pid}/schema/field/{fid}")
def delete_field(pid: int, fid: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM schema_field WHERE id=? AND project_id=?", (fid, pid))
        validation.run(conn, pid)
    return {"deleted": fid}


@router.get("/projects/{pid}/schema/template", response_class=PlainTextResponse)
def schema_template(pid: int):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Field Key", "Display Name", "Group", "Data Type", "Required",
                "Conditional Required Expression", "Validation Type", "Reference List",
                "Unique Scope", "Format Rule", "Auto Generated", "Editable", "Visible",
                "Export Order"])
    w.writerow(["instance_name", "Instance Name", "Naming", "text", "no", "", "unique",
                "", "project", "", "Yes", "Yes", "Yes", "1"])
    return PlainTextResponse(buf.getvalue(), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=schema_template.csv"})
