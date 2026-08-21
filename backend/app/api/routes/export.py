from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, Response

from ...db import get_conn
from ...exporter import (export_issues_csv, export_issues_xlsx,
                         export_overview_report_xlsx, export_register_csv,
                         export_register_xlsx)

router = APIRouter()

_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _xlsx(data: bytes, filename: str) -> Response:
    return Response(content=data, media_type=_XLSX,
                    headers={"Content-Disposition": f"attachment; filename={filename}"})


@router.get("/projects/{pid}/export")
def export_register(pid: int, trade: int | None = None, format: str = "csv",
                    include_sensitive: bool = False):
    with get_conn() as conn:
        if format == "xlsx":
            return _xlsx(export_register_xlsx(conn, pid, trade, include_sensitive), "register.xlsx")
        text = export_register_csv(conn, pid, trade, include_sensitive)
    return PlainTextResponse(text, media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=register.csv"})


@router.get("/projects/{pid}/export/issues")
def export_issues(pid: int, format: str = "csv"):
    with get_conn() as conn:
        if format == "xlsx":
            return _xlsx(export_issues_xlsx(conn, pid), "validation_issues.xlsx")
        text = export_issues_csv(conn, pid)
    return PlainTextResponse(text, media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=validation_issues.csv"})


@router.get("/projects/{pid}/export/report")
def export_report(pid: int):
    # Reuse the overview computation for the report figures.
    from .overview import overview as _overview
    ov = _overview(pid)
    with get_conn() as conn:
        return _xlsx(export_overview_report_xlsx(conn, pid, ov), "progress_report.xlsx")
