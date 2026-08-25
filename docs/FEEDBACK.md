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
