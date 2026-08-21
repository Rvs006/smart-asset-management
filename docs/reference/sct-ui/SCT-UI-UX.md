# Smart Commissioning Tool (SCT) v0.1.51: UI and UX reference for SAM

Source of truth: `Smart_Commissioning_App_Windows_Portable.zip` (v0.1.51, `frontend/dist/assets/app-DCu_Mu2w.css`) and the matching source at `smart-commissioning-app/frontend/src` (same tag). Screens in `screens/` were captured from the v0.1.51 production bundle, light and dark, 1440 px wide.

Files beside this document:

- `sct-styles.css`: base component rules (shell, tabs, surfaces, tables, buttons, tokens, states). 3,479 lines.
- `sct-electracom-theme.css`: the Electracom token override (warm light palette, dark palette, header pills, logo). Layered after the base file, so its tokens win.
- `electracom-logo.png`: the brand mark used in the header (26 px tall).
- `screens/light-*.png`, `screens/dark-*.png`: every console page in both themes.

SAM must reproduce this language, not the SAM mockup in the Day 1 Developer Pack. That mockup (and spec item SAM-UI-001: "light grey background, blue primary accent") was built from the earlier SCT concept file (`Smart Commissioning Tool UI.txt`: Tailwind, lucide icons, Back/Home/Export/File pill buttons, avatar, `#0878e5` blue). The shipped SCT dropped all of that. What follows is what actually ships.

---

## 1. Design tokens

Copy these as CSS custom properties. Names are the SCT names; keep them so the two tools can share a stylesheet later.

### Light (default)

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#faf7f2` | Page background (warm cream, never grey) |
| `--surface` | `#ffffff` | Cards, header, tables |
| `--surface-2` | `#fdf9f3` | Secondary panels inside cards, table headers, step cards |
| `--surface-3` | `#eeebe5` | Disabled button fill |
| `--border` | `#e5dfd6` | Inputs, pills, table wrap |
| `--border-soft` | `#eeebe5` | Card borders, table row dividers |
| `--ink` | `#2c2a28` | Headings, values |
| `--text` | `#6b6560` | Body copy, table cells |
| `--muted` | `#6f6963` | Labels, table headers, notes |
| `--accent` | `#26718f` | Teal. Primary buttons, active tab, eyebrows, links, KPI top border |
| `--accent-hover` | `#226986` | Hover state of accent |
| `--accent-bg` | `#e4f2f7` | Accent tint: hover fills, running status, "subtle" pills, row hover |
| `--on-accent` | `#ffffff` | Text on accent |
| `--green` / `--green-bg` | `#216f42` / `#e8f5ee` | Ready, succeeded, success panels |
| `--amber` / `--amber-bg` | `#865d0b` / `#faf1df` | Queued, not checked, warnings |
| `--red` / `--red-bg` | `#c0392b` / `#fbeae7` | Failed, errors, danger KPI |
| `--purple` / `--purple-bg` | `#8b5c9b` / `#f1e9f5` | Spare category colour |
| `--code` | `#1e1e2e` | Code blocks |
| `--shadow` | `0 1px 2px rgba(44,42,40,.05)` | Cards |
| `--shadow-strong` | `0 4px 12px rgba(44,42,40,.08)` | Popovers |
| `--radius` / `--radius-sm` | `10px` / `8px` | Cards / buttons, inputs, step cards |
| `--control-height` | `44px` (compact `36px`) | Buttons, inputs |

### Dark (`<html data-theme="dark">`)

| Token | Value |
|---|---|
| `--bg` | `#1a1d24` |
| `--surface` / `--surface-2` / `--surface-3` | `#232730` / `#2b2f3a` / `#373c47` |
| `--border` / `--border-soft` | `#373c47` / `#2d313b` |
| `--ink` / `--text` / `--muted` | `#e8e6e0` / `#b8b2aa` / `#ada79f` |
| `--accent` / `--accent-hover` / `--on-accent` | `#58a6c8` / `#7bbcd8` / `#17232a` |
| `--accent-bg` | `rgba(42,123,155,.18)` |
| `--green` / `--green-bg` | `#5fc98a` / `rgba(45,139,85,.18)` |
| `--amber` / `--amber-bg` | `#e0b15a` / `rgba(184,134,42,.18)` |
| `--red` / `--red-bg` | `#e8786b` / `rgba(192,57,43,.2)` |
| `--shadow` | `0 1px 4px rgba(0,0,0,.3)` |
| `--logo-filter` | `brightness(1.7) contrast(1.05)` (applied to the logo img) |

Theme is stored in `localStorage` (`sc.theme`), applied before first render via the `data-theme` attribute, toggled by a header pill that reads "Use dark theme" / "Use light theme". No sun/moon icon.

### Type

- Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif` (renders as Segoe UI on Windows). Mono for eyebrows and code: `"SF Mono", SFMono-Regular, Consolas, "Courier New", monospace`.
- Body 13 px, antialiased. Tables use `font-variant-numeric: tabular-nums`.
- Page title (h1) 32 px / 1.15, weight 700. Page subtitle 15 px / 1.55 in `--text`, max-width 680 px.
- Hero h2 28 px / 1.12. Section h3 16 px. Brand title 18 px / 760.
- Eyebrow: 11 px, weight 760, uppercase, mono, `--accent`. Sits above an h2/h3 inside a card.
- Field label 12 px bold in `--ink`; field note 12 px in `--muted`.
- Table header 10 px, weight 760, uppercase, `--muted`, on `--surface-2`. Cell 12 px in `--text`; secondary line inside a cell is a `span` in `--muted`.
- Status token 10 px, weight 760, uppercase.
- KPI value 24 px (`module-metrics strong`), KPI label 10-11 px uppercase.

### Shape rules

- Cards 10 px radius, 1 px `--border-soft`, `--shadow`. Never a heavy shadow, never a glow, never a hover lift.
- Buttons and inputs 8 px radius. Pills (980 px radius) are reserved for header utilities, status tokens, chips and the stepper.
- Transitions 150 ms ease on background, border-color and color only.

---

## 2. Application shell

Top to bottom, every page:

1. **Sticky header** (`.app-header`): `--surface` at 82% with `backdrop-filter: blur`, 1 px bottom border. Content constrained to 1180 px, 24 px side padding.
   - Left: Electracom logo (26 px) | 1 px vertical divider | "Smart Commissioning Tool" 18 px bold over a 10 px uppercase kind line ("COMMISSIONING WORKSPACE").
   - Right (`.app-header-meta`): a row of 30 px pills, 11 px / 650: version pill (accent tint, "0.1.51"), "Brief", "Learning", theme toggle, "API workspace" (accent tint), session badge ("Signed in as local admin" or username + role chip).
2. **Grouped tab nav** (`.app-tabs.grouped`): one row, groups separated by a 1 px vertical rule. Each group has a tiny uppercase mono label above its tabs (CONFIGURE, DISCOVER, VALIDATE, REPORT, OPERATE); "Home" stands alone first. Tab: 42 px min-height, 10/16 padding, 12-13 px bold, `--text`; hover `--surface-2`; active = `--accent` text + 3 px accent bottom border + `--surface` fill, top corners 8 px. Groups follow the order of the job, not alphabetical.
3. **Page title bar** (`.page-titlebar`): h1 + one-sentence subtitle, 26 px top padding, same 1180 px column. Every route has a fixed title and subtitle (UDMI Workbench is the one page that owns its own title inside a hero card).
4. **Page frame** (`.page-frame`): 1180 px column, 24 px padding, 60 px bottom. Content is a vertical stack of cards ("surfaces") with 14 px gaps.
5. A floating "Review Comments (0)" dark pill bottom-right. Review-build feature only (`VITE_REVIEW_COMMENTS`), not part of the product.

Routing is hash-based (`/#/configuration`). Brief and Learning are standalone marketing/training surfaces with their own header and are not part of the console pattern.

---

## 3. Component vocabulary

- **Surface** (`.surface`): the card. Inside, a `.surface-heading` row: left = eyebrow + h3, right = a `.link-button` ("View full run history") or one or two `.secondary-button.compact` ("Export CSV", "Clear filters").
- **Section copy** (`.section-copy`): 13 px muted paragraph under a heading.
- **Primary button**: accent fill, white 12 px / 700 label, 44 px tall, 8 px radius, 8/15 padding. Hover = `--accent-hover`. Disabled = `--surface-3` fill with muted text (used a lot: "Upload and validate" is disabled until a file is chosen).
- **Secondary button**: `--surface` fill, 1 px `--border`, `--text` label. Hover = accent tint fill + accent text. `.selected` = same as hover (used as tab-like toggles). `.destructive` = red text, red tint on hover. `.compact` = 36 px.
- **Link button**: bare accent text, 11 px / 650.
- **Header / site pills**: 30 px, 980 px radius, 11 px / 650. `.subtle` = accent tint fill, no border.
- **Status token**: pill, 10 px uppercase: READY/SUCCEEDED green tint, RUNNING accent tint, QUEUED amber tint, FAILED red tint. Always text plus colour, never a bare dot.
- **Chip**: small pill for categorical labels (required/optional columns, "Loaded from API", "7 sections", "45 editable fields"): green tint by default, `.amber` amber tint; accent tint for column names.
- **Role chip**: 10 px uppercase pill in `--surface-2`.
- **KPI strip** (`.kpi-strip article`): white card with a 3 px top border in `--accent`; label 10-11 px uppercase above a 24-32 px number; `.danger` variant turns the border and the number red. Bare metrics (no card) also appear at the top of module pages: a big number over an uppercase label, several side by side.
- **Step cards** (`.brief-step`): `--surface-2` tiles with a 24 px numbered accent circle, bold label, small copy; hover = accent border + accent tint.
- **Stepper pill**: a white pill containing "1 Setup · 2 Run · 3 Results"; the active step is a smaller accent-tint pill with a filled circle, completed steps show a check circle.
- **Data table** (`.data-table` inside `.data-table-wrap`): wrap has border, 10 px radius, horizontal scroll; `.results-scroll` caps height at 60 vh with sticky headers. Headers 10 px uppercase muted on `--surface-2`, cells 10/12 padding, 1 px `--border-soft` dividers, row hover accent tint, first column often a checkbox, identifiers bold with a muted second line.
- **Issue card**: card with a 4 px left border (amber; `.critical` red): severity label, bold headline, detail, owner link.
- **Run card**: title + subtitle left, status token + thin accent progress bar + relative time right.
- **State panel**: inset card with bold title + hint. `.success` green tint, `.warning` amber tint, `.error` red tint. Loading and empty states use the same shape with neutral fill ("Loading runs... / Fetching run history.", "No users yet / Create the first named operator above.").
- **Forms**: label above control, two-column `.field-grid` (12 px gap), 44 px inputs with 8 px radius and `--border`; `.field-note` under a control in 12 px muted; secrets get a "Show" secondary button beside the input; file inputs are native ("Choose File / No file chosen").
- **Collapsible config section**: card with a 3 px top accent border, caret + title left, status chip right ("Not checked" amber, "Not configured" amber, "Manual only" amber, "Local file" green), description, then the field grid.
- **Live signal console**: card with a 4 px accent left border, eyebrow "LIVE SIGNAL", status token, three small stats, then accent-tint sub-panels with white tiles inside.
- **Register Import panel** (every module): import profile select, file input, disabled "Upload and validate", then a `--surface-2` "Default import template" box with "Download XLSX" and "Download CSV" secondary buttons, then "Required columns" / "Optional columns" chip rows.
- **Three-column explainer** ("Three Checks Operators Can Understand"): a card split into three columns, each with a thin accent top rule, mono "01/02/03", bold title, copy, small "Default templates" line.

Icons: effectively none. The shipped UI is text-first; the only glyphs are the stepper check circles, numbered circles, section carets and native form controls. No icon packs.

---

## 4. Page anatomies

**Homepage** (dashboard): hero surface (eyebrow, h2 "Commissioning console", one line, right-hand readiness panel with "API STATUS ok / 11 import profiles · 50 recorded runs"); "How this app is meant to be used" surface with copy left and four numbered step cards right; a primary + secondary action pair ("Continue UDMI validation" / "Review discovery"); KPI strip (Recorded runs, Active runs, Open issues in danger red, Evidence packs); "Recent runs" surface with run cards and a "View full run history" link; "Highest-priority issue" surface with one issue card; "Evidence" surface with a big count and a full-width secondary "Open reports" button.

**Configuration**: title bar; hero surface (h2, two lines of copy, three chips) beside an "Actions" side card (full-width "Validate Snapshot" secondary, full-width "Save Configuration" primary, "Export JSON" / "Import JSON" pair, explanatory notes under each); then a two-column grid of collapsible config sections (Network Basics, BACnet Discovery, MQTT Settings, Certificates & Keys, Time & NTP, Backup & Restore, Logging & Diagnostics), each with its status chip.

**Discovery / validation modules** (IP, BACnet, MQTT, UDMI, BACnet to MQTT): title bar; bare metrics or metric cards ("NO RUN YET" dash, or "0% Overall compliance" / "35 Issues" cards with coloured top borders); stepper pill; two-column body: "Register Import" left, "Run Controls" right (checkbox rows such as "Dry run" and an authorisation acknowledgement, then action rows "Run IP Discovery" with a Run button, a run monitor with status token and progress bar, the live signal console, stat tiles, "Download raw JSON", report product/format selects and "Generate report from this run"); further full-width surfaces below (schema sets, payload JSON editors in a 2x2 grid, explainer columns).

**Reports / Run History / Hub**: title bar; bare metrics ("100 Reports ready", "130 Runs in view"); a "Filters" surface (label-over-control grid; Hub also echoes the scope in a sentence); a table surface with "Export CSV" / "Export selected" / "Delete selected" top-right and a checkbox select column.

**Users**: title bar; a stack of surfaces: access summary (green state panel), readiness (amber state panel), "Create a user" inline form (input, select, disabled primary), "Project and site access" grant form, "Users" list with an empty state.

**Reports (printed PDF)**: "ELECTRACOM" wordmark top-left, report name top-right, a thin blue rule under the header; tables with a dark slate header row, alternating pale rows, centred text; footer "ELECTRACOM · Page n of m · run id".

---

## 5. How SAM maps onto this

Use the shell unchanged. Only the words and the groups change.

- Brand title "Smart Asset Management Tool", kind line "ASSET WORKSPACE". Right-hand pills: version, theme toggle, active project pill (accent tint, e.g. "171 Victoria Street"), session badge. Drop Back/Home/Export/File/Guided Tour/avatar from the mockup.
- Nav groups: Home | CONFIGURE: Configuration | REVIEW: Overview | MANAGE: Asset Management | (later) OPERATE: Imports, Reports.
- **Configuration** = the SCT Configuration anatomy. Hero surface with chips ("Loaded from API", "5 sections", "n reference lists"), Actions side card ("Validate project setup" secondary, "Save Configuration" primary, "Export configuration" / "Import configuration"), then collapsible sections with status chips: Project, Asset Naming Convention (with the name preview inside), Trades / System Owners, Reference Lists (Buildings, Levels, Spaces, Systems, Zones, Equipment Types), Register Schema. Imports use the Register Import panel verbatim (profile, file, disabled "Upload and validate", Default import template box with Download XLSX/CSV, required/optional column chips).
- **Overview** = the Homepage anatomy. Hero with a project readiness panel; KPI strip (Total assets, Metadata completeness, Assets with errors in danger red, Duplicate instance names in danger red); "Trade registers" surface with one run-card per trade (name, asset count, status token, completeness progress bar, "n issues"); "Cross-trade duplicates" and "Data quality rules" as issue cards / a small table; "Exports" surface with full-width secondary buttons.
- **Asset Management** = the module anatomy with the table as the centre. Bare metrics for the selected trade; filters surface (trade select, search, column picker, status); the register as a `.data-table` in `.results-scroll` with sticky headers, checkbox column, bold Instance Name with muted description line, invalid cells filled with `--red-bg` / `--amber-bg` plus a status token per row; the asset detail below the table as a surface with `surface-heading` and Details / Validation / History as `.secondary-button.selected` toggles; the faults list as an issue-card stack or table with "Open asset" link buttons.
- Status language stays text plus colour: Valid / Warning / Error, Complete / Partial / Missing, Active / Archived.

Everything above is already expressed in `sct-styles.css` and `sct-electracom-theme.css`. The shortest path for the SAM frontend is to import those two files and reuse the class names, then add only the register-grid rules SAM needs.
