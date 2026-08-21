# Review notes — SAM vertical slice (August 2026)

Condensed output of three ProductOS Develop passes over the built slice:
`studio-develop-code-review`, `studio-develop-design-review`, `studio-develop-cro-audit`.
The security pass has its own file: `docs/SECURITY-AUDIT.md`.

## Code review (studio-develop-code-review)

**Verdict: ready to commit.** No must-fix correctness bugs. The slice was built and verified end to end (engine self-checks, `pytest` smoke, live HTTP + browser run with zero console errors).

Confirmed:
- Validation engine is a pure function with an assert-based self-check; every rule surfaces on the right asset/field (verified against the seed and the smoke test).
- Naming engine reproduces the submittal examples exactly (`AHU-1020013`, `FCU-1071095`) via its self-check.
- SQL parameterized throughout; the one dynamic `UPDATE` uses a Pydantic column allowlist (see security audit).
- Writes re-validate the project inline, so the grid/fault list/overview stay consistent after every edit/import.

Consider (non-blocking, logged for the next build-loop pass):
- `@app.on_event("startup")` is deprecated in FastAPI 0.141 — works, but migrate to the `lifespan` handler. `ponytail:` deprecation, not a defect.
- Full-project re-validation on every single asset write is O(n) per edit — fine at register scale (a few thousand rows) on the local profile; batch or scope it if it ever measurably drags. `ponytail:` known ceiling.
- Grid cell inputs are uncontrolled (`defaultValue` + `onBlur`); if the server normalizes a value the cell won't visually update until refetch/remount. Acceptable for the slice; make controlled if server-side normalization is added.

## Design review (studio-develop-design-review)

**Verdict: adherent to `docs/DESIGN.md`.** The frontend imports SCT's `sct-styles.css` + `sct-electracom-theme.css` verbatim and reuses the class names, so tokens, type, spacing and components match the Smart Commissioning Tool by construction. Verified visually in light and dark:
- Warm cream `#faf7f2` page, teal `#26718f` accent, system font, grouped stage tabs with the teal active underline, KPI cards with the 3px accent top border (red `.danger`), status tokens as text+colour, data grid with tinted invalid cells. No icon pack, no hover lift, no glow.
- Only SAM-specific CSS added (`sam.css`): the register grid's `cell-bad`/`cell-warn` tints, inline cell inputs, detail grid, fault rows, reference boxes, name preview. All built from existing tokens.

Only drift to watch: the register grid's inline `<select>`/`<input>` cells are a SAM addition with no SCT precedent — they're styled to disappear into the cell (transparent, accent focus ring), which reads correctly, but re-check them when SCT ships its own editable-grid pattern so the two stay aligned.

## Conversion / activation audit (studio-develop-cro-audit)

The relevant "conversion" for an internal tool is **activation**: how fast a new user reaches the magic moment.

Strong:
- **One-click to value.** "Load sample project" seeds a real 171-Victoria-Street register and drops the user straight onto the Asset Management grid with genuine faults already surfaced — time-to-aha is a single click, well under the <60s target.
- **The faults are the user's own data story**, not a demo abstraction: a real cross-trade duplicate (`FCU-1041007` in BMS ↔ Mechanical) and real invalid references (`LXX`, `B2.01`).
- Empty states and the "how it works" four-step card set the path when there's no project yet.

Improvements (prioritised, for the next pass):
1. **Guided first-run for a user's OWN sheet.** Today the fast aha uses the sample; the real activation is importing *their* register. Add a short "import your register" call-to-action on Home/Configuration that walks project → references → schema → asset import (the onboarding flow already specifies this). Highest activation lever.
2. **Surface the fix, not just the fault.** The fault list links to the asset; add an inline "fix" affordance (jump to the exact cell with the dropdown open) so the loop from "see fault" to "cleared" is one click.
3. **Show the win.** After a validation run, a small "N issues found that Excel would have missed" line converts the aha into a remembered value moment (feeds the launch signal).
