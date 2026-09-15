# Engineer feedback — round 1 (August 2026)

Initial comments on SAM (v0.1.2). Tracked here so nothing is lost and so Dhilen and Pete can react to a working build. Status updated as each is built.

| # | Page | Comment | Status (v0.1.3) |
|---|------|---------|-----------------|
| 1 | Configuration | Create the Asset Naming Convention manually or pick from previously-used conventions, not only via import. | Built — naming builder (add/edit segments) + preset picker + save-as-preset. |
| 2 | Configuration | System Owners (trades) and Reference Lists should be configurable from this page. | Built — add/rename/remove trades; add/remove reference values per kind. |
| 3 | Configuration | Register schema configurable without an import sheet: pick which parameters show in Asset Management, and add parameters not on the list. | Built — schema editor: per-field visible toggle + add-parameter form. |
| 4 | Configuration | Per parameter, define whether it's the trade's responsibility or ours, to track deliverable progress. | Built — per-field Responsibility (Trade / Us / Unset); feeds the new metrics. |
| 5 | Asset Management | Move between trades on the page, not via Overview. | Built — prominent trade tab row on the page (dropdown kept too). |
| 6 | Asset Management | More metrics: overall % complete, % of trade info populated, etc. | Built — trade completeness %, populated %, and split by responsibility. |
| 7 | Asset Management | Register panel expandable so more columns are visible without much scrolling. | Built — Expand button widens the grid to full width + taller. |
| 8 | Asset Management | Filter and order columns, Excel-like. | Built — click-to-sort on any column + per-column filter row. |

Requested next: input from Dhilen and Pete. Share the v0.1.3 build (release below) and add their comments as round 2 under this table.

## Round 2 (15 September 2026) — v0.1.3 notes

Source: "Smart Asset Management Tool v0.1.3 Notes.docx". Build tasks are Phase 5 in `docs/ROADMAP.md` (TASK-046 to TASK-061).

| # | Page | Comment | Kind | Task | Status (v0.1.4) |
|---|------|---------|------|------|-----------------|
| 1 | Asset Management | Hover tooltip on each column heading, text configurable by the MSI team. | Feature | TASK-050 | Planned |
| 2 | Asset Management | Expand button breaks the table: left side clipped, scrollbars gone, Collapse only visible at 175% zoom. | Bug | TASK-046 | Planned |
| 3 | Asset Management | Table should cover the whole width of the screen (registers have many columns). | Change | TASK-046 | Planned |
| 4 | Asset Management | Drag columns wider or narrower. | Feature | TASK-048 | Planned |
| 5 | Asset Management | Borders on the table; left-align the data. | Change | TASK-047 | Planned |
| 6 | Configuration / Asset Management | Column heading tinted light green when the trade is responsible, light red when MSI is. | Feature | TASK-051 | Planned |
| 7 | Asset Management | Duplicate the selected row(s). | Feature | TASK-053 | Planned |
| 8 | Asset Management | Undo / redo the last entry or deletion. | Feature | TASK-054 | Planned |
| 9 | Asset Management | Freeze columns while scrolling across. | Feature | TASK-049 | Planned |
| 10 | Asset Management | "All registers" option in the trade dropdown. | Feature | TASK-052 | Planned |
| 11 | Configuration | Regular expression per parameter (e.g. GUID `^[a-z]+://[-0-9a-zA-Z_$]+$`); `N/A` must not be flagged. | Feature | TASK-056 | Planned |
| 12 | Configuration | Expected number of characters per parameter (e.g. Base64 GUID = 22). | Feature | TASK-056 | Planned |
| 13 | Configuration | Choose whether a parameter is validated at all. | Feature | TASK-057 | Planned |
| 14 | Asset Management | Select all / deselect all in the Columns panel. | Feature | TASK-055 | Planned |
| 15 | Export | Let the user name the exported file instead of auto-downloading `register.xlsx`. | Change | TASK-058 | Planned |
| 16 | Export | Let the user set the register title inside the file, separate from the file name. | Change | TASK-058 | Planned |
| 17 | Export | Exported XLSX has no dropdowns, validation or duplicate highlighting — system owners fill it in. | Feature | TASK-059 | Planned |
| 18 | Asset Management | "Generate names" does nothing visible except writing `-0000000`. | Bug | TASK-060 | Planned |
