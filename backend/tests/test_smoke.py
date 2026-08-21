"""Phase-1 smoke test: seed -> validate -> the planted faults exist -> export works.

Run: python -m tests.test_smoke   (from backend/, with a temp SAM_DATA_DIR)
or:  pytest
"""
import os
import tempfile

os.environ.setdefault("SAM_DATA_DIR", tempfile.mkdtemp(prefix="sam_test_"))

from app.db import get_conn          # noqa: E402
from app.seed import seed_demo        # noqa: E402
from app.exporter import export_register_csv, export_issues_csv  # noqa: E402
from app import validation            # noqa: E402


def test_seed_validates_and_exports():
    pid = seed_demo("Test Project")
    with get_conn() as conn:
        summary = validation.run(conn, pid)
        rules = [r["rule"] for r in conn.execute(
            "SELECT rule FROM validation_issue WHERE project_id=? AND resolved=0", (pid,))]
        reg = export_register_csv(conn, pid)
        iss = export_issues_csv(conn, pid)

    assert summary["error_count"] >= 3, summary
    assert "duplicate_instance_name" in rules, rules
    assert "invalid_reference" in rules, rules
    assert "conditional_required" in rules, rules
    assert "missing_mandatory" in rules, rules
    # register has a header + at least a dozen rows
    assert len(reg.strip().splitlines()) >= 12, "register rows"
    assert "Instance Name" in reg.splitlines()[0]
    assert len(iss.strip().splitlines()) >= 4, "issue rows"
    print("smoke OK — errors:", summary["error_count"], "rules:", sorted(set(rules)))


if __name__ == "__main__":
    test_seed_validates_and_exports()
