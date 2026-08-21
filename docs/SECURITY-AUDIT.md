# Security Audit — Smart Asset Management Tool (SAM)

> ProductOS `studio-develop-security-audit`, August 2026, against the built vertical slice (backend `app/`, frontend `src/`). Ordered by what actually burns founder apps: secrets → data access → routes → ownership → browser-exposed keys → injection/uploads → headers/CSRF.

## Verdict

**Acceptable for the intended Day-1 profile (local, single-user, 127.0.0.1), with the hardening below applied. NOT safe to expose on a network or host multi-user without adding authentication, per-project access control, and the transport hardening in the "Before hosted" section.**

No leaked credentials, no secrets in the client, SQL is parameterized. The real risks are all deferred-scope items that only bite once SAM leaves the loopback profile — which matches the PRD's explicit Day-1 boundary.

## Do this right now
Nothing to rotate — no live secrets exist in the codebase or history (the repo has no commits yet, and `.gitignore` now excludes `.env`, `*.db`, `.venv`, `node_modules`, `dist`).

## Fix plan (severity-ordered)

- [x] **P2 — Repo hygiene: secrets/data never committed.** `.gitignore` extended to exclude `backend/.venv/`, `**/__pycache__/`, `node_modules/`, `frontend/dist/`, `*.db`, `.env*`. Verify: `git status --short` shows no `.venv`, `.db`, or `node_modules` entries. **Done.**
- [x] **P2 — Upload size cap.** All three import paths (`references`, `schema`, `assets`) call `_guard_size(data)` (20 MB) before parsing, so a giant file can't exhaust memory. Verify: POST a >20 MB file → rejected with a size error, not an OOM. **Done.**
- [x] **P3 — Sensitive fields excluded from plain export.** `exporter.py` drops any field whose key contains `password`/`private_key`/`secret`/`default_password` unless `include_sensitive=true`. Verify: export a project with a `default_password` column → the column is absent from the CSV by default. **Done.**
- [ ] **P2 — Mask sensitive fields in the grid UI.** The Asset Management grid renders every metadata value as plain text; a "Default Password" column would show in clear. Fix: render `password`/`secret`/`key` fields masked with a reveal toggle (SCT's `secret-field` pattern). Verify: a password field shows `••••` until revealed. Files: `frontend/src/features/assets/AssetManagementPage.tsx`.
- [ ] **P3 — Encrypt-at-rest for secret columns (optional, local).** Secret values live in the SQLite `metadata` JSON in clear. For the local profile this matches SCT's threat model (the DB is on the engineer's own machine under `%LOCALAPPDATA%`); if registers routinely carry live device passwords, add field-level encryption like SCT's secret store. Verify: the raw `.db` shows ciphertext for secret fields. Files: `backend/app/db.py`, a small crypto helper.

## Before hosted / multi-user (currently out of Day-1 scope — do NOT expose without these)

- [ ] **P0 (if hosted) — Authentication + authorization.** Every `/api/v1/*` route is currently unauthenticated; the only control is the 127.0.0.1 bind. Before any network exposure, add auth (API keys/roles, SCT's `AUTH_MODE` model) and require it. Verify: an unauthenticated request to `/projects` is rejected off-loopback.
- [ ] **P0 (if hosted) — Per-project ownership checks (IDOR).** Any caller can read/write any `project_id`; there are no ownership checks (single-user local makes this a non-issue today). Before multi-tenant, scope every query to the caller's granted projects (SCT's project/site scopes). Verify: user A cannot read user B's project by id.
- [ ] **P1 (if hosted) — Transport + headers.** Add HTTPS, security headers (CSP, HSTS, X-Content-Type-Options), and CSRF protection if cookie auth is introduced. CORS is already restricted to the two localhost origins.

## What was checked and is clean
- **Secrets:** none in code or config; no `NEXT_PUBLIC_`/`VITE_`-style secret leakage (frontend ships no keys). ✓
- **SQL injection:** all queries parameterized. The one dynamic statement (`projects.py` PATCH) interpolates only column *names*, and those come from a closed Pydantic model (`ProjectPatch`), not user strings; values are bound parameters. ✓
- **DB rules:** SQLite single-file local profile; foreign keys ON; no public database surface. ✓ (Access control is an app-layer concern deferred with the hosted profile.)
- **Browser-reachable secrets:** none — the frontend calls a same-origin `/api` and holds no credentials. ✓
- **CORS:** limited to `http://localhost:5173` / `127.0.0.1:5173` (dev). ✓
- **File uploads:** parsed by `openpyxl`/`csv` (no formula/macro execution; `data_only=True`), now size-capped. ✓

## Notes on data sensitivity
SAM registers can hold IP addresses, MAC addresses, hostnames, GUIDs and a "Default Password" column. On the local profile these live only on the engineer's machine. The two open P2/P3 items (grid masking, optional at-rest encryption) close the residual exposure; both are required before any multi-user hosting.
