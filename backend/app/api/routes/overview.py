import json
from collections import defaultdict

from fastapi import APIRouter

from ...db import get_conn

router = APIRouter()


def _applicable_required(field, meta):
    """Is this required field applicable to this asset (accounting for conditionals)?"""
    if field["required"] == "yes":
        return True
    if field["required"] == "conditional" and field["conditional_expr"]:
        k, _, v = field["conditional_expr"].partition("=")
        return str(meta.get(k.strip())).strip().upper() == v.strip().upper()
    return False


@router.get("/projects/{pid}/overview")
def overview(pid: int):
    with get_conn() as conn:
        fields = [dict(r) for r in conn.execute(
            "SELECT * FROM schema_field WHERE project_id=?", (pid,))]
        assets = [dict(r) for r in conn.execute(
            "SELECT a.*, t.code AS trade_code FROM asset a JOIN trade t ON t.id=a.trade_id "
            "WHERE a.project_id=?", (pid,))]
        trades = [dict(r) for r in conn.execute(
            "SELECT * FROM trade WHERE project_id=? ORDER BY code", (pid,))]
        issues = [dict(r) for r in conn.execute(
            "SELECT * FROM validation_issue WHERE project_id=? AND resolved=0", (pid,))]

    err_asset_ids = {i["asset_id"] for i in issues if i["severity"] == "error" and i["asset_id"]}
    missing_mandatory = sum(1 for i in issues if i["rule"] in ("missing_mandatory", "conditional_required"))

    # completeness per asset
    def completeness(a):
        meta = json.loads(a["metadata"] or "{}")
        req = [f for f in fields if _applicable_required(f, meta)]
        if not req:
            return 1.0
        filled = 0
        for f in req:
            val = a["instance_name"] if f["field_key"] == "instance_name" else meta.get(f["field_key"])
            if val not in (None, "") and str(val).strip():
                filled += 1
        return filled / len(req)

    per_trade = []
    by_trade = defaultdict(list)
    for a in assets:
        by_trade[a["trade_code"]].append(a)
    for t in trades:
        ta = by_trade.get(t["code"], [])
        t_issue_assets = {i["asset_id"] for i in issues
                          if i["severity"] == "error" and i["asset_id"] in {x["id"] for x in ta}}
        comp = round(100 * sum(completeness(a) for a in ta) / len(ta), 1) if ta else 0.0
        per_trade.append({"code": t["code"], "name": t["name"], "count": len(ta),
                          "completeness": comp, "issues": len(t_issue_assets)})

    # cross-trade duplicate instance names
    name_trades = defaultdict(set)
    for a in assets:
        nm = (a["instance_name"] or "").strip()
        if nm:
            name_trades[nm].add(a["trade_code"])
    cross = [{"instance_name": nm, "trades": sorted(ts)}
             for nm, ts in name_trades.items() if len(ts) > 1]

    qr_required = sum(1 for a in assets
                      if str(json.loads(a["metadata"] or "{}").get("qr_code_required", "")).strip().upper() == "YES")
    overall_comp = round(100 * sum(completeness(a) for a in assets) / len(assets), 1) if assets else 0.0
    naming_compliant = sum(1 for a in assets if (a["instance_name"] or "").strip()) - \
        sum(len(c["trades"]) for c in cross)
    last_update = max((a["updated_at"] for a in assets), default=None)

    return {
        "total_assets": len(assets),
        "metadata_completeness": overall_comp,
        "assets_with_errors": len(err_asset_ids),
        "duplicate_instance_names": len(cross),
        "cross_trade_duplicates": cross,
        "naming_compliant": max(naming_compliant, 0),
        "missing_mandatory": missing_mandatory,
        "qr_required": qr_required,
        "last_update": last_update,
        "trades": per_trade,
        "issue_total": len(issues),
    }
