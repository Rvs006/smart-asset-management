from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from ...db import get_conn
from ...exporter import export_register_csv, export_issues_csv

router = APIRouter()


@router.get("/projects/{pid}/export")
def export_register(pid: int, trade: int | None = None, format: str = "csv",
                    include_sensitive: bool = False):
    with get_conn() as conn:
        text = export_register_csv(conn, pid, trade, include_sensitive)
    return PlainTextResponse(text, media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=register.csv"})


@router.get("/projects/{pid}/export/issues")
def export_issues(pid: int):
    with get_conn() as conn:
        text = export_issues_csv(conn, pid)
    return PlainTextResponse(text, media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=validation_issues.csv"})
