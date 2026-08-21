import csv
import io

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import PlainTextResponse

from ...db import get_conn
from ...importer import import_schema

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
    return {"parameters_detected": n}


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
