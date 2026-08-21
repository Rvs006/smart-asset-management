---
version: alpha
name: Electracom Console (SAM)
description: The Smart Asset Management Tool design system, extracted from the shipped Smart Commissioning Tool v0.1.51 code so the two toolsets are visually identical. Warm cream + white surfaces + a single teal accent, system font, text-first (no icon pack), grouped stage tabs, validation shown as tinted status tokens. Light and dark themes. Token names follow the SCT codebase (not Material) so the CSS can be shared verbatim.
colors:
  bg: "#faf7f2"
  surface: "#ffffff"
  surface-2: "#fdf9f3"
  surface-3: "#eeebe5"
  border: "#e5dfd6"
  border-soft: "#eeebe5"
  ink: "#2c2a28"
  text: "#6b6560"
  muted: "#6f6963"
  accent: "#26718f"
  accent-hover: "#226986"
  accent-bg: "#e4f2f7"
  on-accent: "#ffffff"
  green: "#216f42"
  green-bg: "#e8f5ee"
  amber: "#865d0b"
  amber-bg: "#faf1df"
  red: "#c0392b"
  red-bg: "#fbeae7"
  purple: "#8b5c9b"
  purple-bg: "#f1e9f5"
  code: "#1e1e2e"
typography:
  page-title:
    fontFamily: system-ui
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
  hero-h2:
    fontFamily: system-ui
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.12
  section-h3:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.3
  brand-title:
    fontFamily: system-ui
    fontSize: 18px
    fontWeight: 760
  kpi-value:
    fontFamily: system-ui
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: system-ui
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  subtitle:
    fontFamily: system-ui
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
  field-label:
    fontFamily: system-ui
    fontSize: 12px
    fontWeight: 700
  eyebrow:
    fontFamily: mono
    fontSize: 11px
    fontWeight: 760
    letterSpacing: 0.04em
    textTransform: uppercase
  table-header:
    fontFamily: system-ui
    fontSize: 10px
    fontWeight: 760
    textTransform: uppercase
  status-token:
    fontFamily: system-ui
    fontSize: 10px
    fontWeight: 760
    textTransform: uppercase
rounded:
  none: 0
  sm: 8px
  md: 10px
  card: 10px
  full: 980px
spacing:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 24px
  xl: 60px
  card-gap: 14px
  page-padding: 24px
  content-width: 1180px
  control-height: 44px
  control-height-compact: 36px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.field-label}"
    rounded: "{rounded.sm}"
    padding: 8px 15px
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.muted}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: 8px 15px
    height: 44px
  button-secondary-hover:
    backgroundColor: "{colors.accent-bg}"
    textColor: "{colors.accent-hover}"
    border: "1px solid {colors.accent-hover}"
  button-destructive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.red}"
    border: "1px solid {colors.border}"
  link-button:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    fontSize: 11px
    fontWeight: 650
  header-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.full}"
    padding: 6px 13px
    height: 30px
    fontSize: 11px
    fontWeight: 650
  header-pill-subtle:
    backgroundColor: "{colors.accent-bg}"
    textColor: "{colors.accent}"
    border: none
  surface:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border-soft}"
    rounded: "{rounded.card}"
    padding: 24px
    boxShadow: "0 1px 2px rgba(44,42,40,0.05)"
  kpi-card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border-soft}"
    borderTop: "3px solid {colors.accent}"
    rounded: "{rounded.card}"
    padding: 15px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: 10px 12px
    height: 44px
  input-field-focus:
    border: "1px solid {colors.accent}"
  status-token-ready:
    backgroundColor: "{colors.green-bg}"
    textColor: "{colors.green}"
    rounded: "{rounded.full}"
    padding: 4px 8px
  status-token-running:
    backgroundColor: "{colors.accent-bg}"
    textColor: "{colors.accent}"
  status-token-queued:
    backgroundColor: "{colors.amber-bg}"
    textColor: "{colors.amber}"
  status-token-failed:
    backgroundColor: "{colors.red-bg}"
    textColor: "{colors.red}"
  chip:
    backgroundColor: "{colors.green-bg}"
    textColor: "{colors.green}"
    rounded: "{rounded.full}"
    padding: 5px 9px
    fontSize: 11px
  data-table-header:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.muted}"
    typography: "{typography.table-header}"
  data-table-cell:
    textColor: "{colors.text}"
    fontSize: 12px
    padding: 10px 12px
    borderBottom: "1px solid {colors.border-soft}"
  data-table-row-hover:
    backgroundColor: "{colors.accent-bg}"
  data-table-cell-error:
    backgroundColor: "{colors.red-bg}"
  data-table-cell-warning:
    backgroundColor: "{colors.amber-bg}"
  issue-card:
    backgroundColor: "{colors.surface}"
    borderLeft: "4px solid {colors.amber}"
    rounded: "{rounded.card}"
  issue-card-critical:
    borderLeft: "4px solid {colors.red}"
  app-tab-active:
    textColor: "{colors.accent}"
    borderBottom: "3px solid {colors.accent}"
    backgroundColor: "{colors.surface}"
---

# Electracom Console (SAM)

## Brand & Style

This is the Smart Commissioning Tool's design language, extracted from its shipped v0.1.51 code and applied to the Smart Asset Management Tool so the two read as one product family. The personality is a calm engineering console: warm, quiet, and governed. Nothing shouts; the data and its validation state carry the screen. The aesthetic intent is "an instrument an engineer trusts" — restrained warm neutrals, a single teal accent used sparingly, tabular numbers, and a text-first interface with no decorative iconography. Emotional response: competence and control, the feeling of a well-set spec sheet rather than a marketing dashboard.

The system is deliberately **not** the earlier SAM concept mockup (grey background, blue `#0878e5`, icon pack, Back/Home/Export pill row, avatar). That mockup predates the shipped SCT. Follow this document and the reference pack in `docs/reference/sct-ui/` (which ships the real `sct-styles.css` and `sct-electracom-theme.css` — import those two files verbatim and reuse the class names rather than re-implementing).

## Colors

A warm-cream foundation, white surfaces, and one teal accent. Status is a four-colour set (green / amber / red, plus purple as a spare category) always shown as a tinted token with a text label — **never colour alone** (accessibility and print).

- **accent `#26718f`** (teal): the only brand accent — primary buttons, the active tab underline, eyebrows, links, KPI top borders, focus rings, running status. `accent-hover #226986`, tint `accent-bg #e4f2f7`.
- **bg `#faf7f2`** (warm cream): the page. Never a cool grey.
- **surface `#ffffff`** / **surface-2 `#fdf9f3`** / **surface-3 `#eeebe5`**: cards; secondary panels, table headers, step tiles; disabled fills.
- **ink `#2c2a28`** headings/values · **text `#6b6560`** body/cells · **muted `#6f6963`** labels/table headers.
- **border `#e5dfd6`** (controls) · **border-soft `#eeebe5`** (cards, row dividers).
- **Status:** green `#216f42`/`#e8f5ee` (Valid, Complete, Ready), amber `#865d0b`/`#faf1df` (Warning, Partial, Queued, "not checked"), red `#c0392b`/`#fbeae7` (Error, Missing, Failed, duplicate), purple `#8b5c9b`/`#f1e9f5` (spare).

**Dark theme** (`<html data-theme="dark">`, stored in `localStorage` `sam.theme`, applied before first paint): `bg #1a1d24`, `surface #232730`, `surface-2 #2b2f3a`, `surface-3 #373c47`, `border #373c47`, `border-soft #2d313b`, `ink #e8e6e0`, `text #b8b2aa`, `muted #ada79f`, `accent #58a6c8`, `accent-hover #7bbcd8`, `accent-bg rgba(42,123,155,.18)`, `on-accent #17232a`, `green #5fc98a`/`rgba(45,139,85,.18)`, `amber #e0b15a`/`rgba(184,134,42,.18)`, `red #e8786b`/`rgba(192,57,43,.2)`, `purple #b58fc8`/`rgba(139,92,155,.2)`. The logo gets `filter: brightness(1.7) contrast(1.05)` in dark.

## Typography

System font only: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif` (renders as Segoe UI on the team's Windows machines). Mono `"SF Mono", SFMono-Regular, Consolas, "Courier New", monospace` for eyebrows and code. No web fonts — deliberate (offline, portable, fast).

- **Page title** 32px/700, **subtitle** 15px in `text` (max-width 680px).
- **Hero h2** 28px/700 · **section h3** 16px/700 · **brand title** 18px/760.
- **Body** 13px/1.5 · **field label** 12px/700 in `ink` · **field note** 12px in `muted`.
- **Eyebrow** 11px/760 uppercase mono in `accent` (sits above an h2/h3 in a card).
- **Table header** 10px/760 uppercase `muted`; **cell** 12px `text`. Tables use `font-variant-numeric: tabular-nums`.
- **KPI value** 24px/700 · **status token** 10px/760 uppercase.

## Layout & Spacing

- **Content width:** one 1180px column, `page-padding` 24px each side. No sidebar — navigation is the header tab row.
- **Vertical rhythm:** pages are a vertical stack of cards with `card-gap` 14px; card interior padding 24px; 60px bottom padding.
- **Controls:** 44px tall (compact 36px), 8px radius. Two-column form grids (`field-grid`) at 12px gap.
- **Tables:** full page width, header row on `surface-2`, cells wrap; wide grids scroll inside a bordered `overflow-x:auto` wrap with sticky headers (`.results-scroll`, max-height ~60vh). The page body itself never scrolls sideways.

## Elevation & Depth

Depth from tone and hairline borders, not shadow. Cards get a 1px `border-soft` edge and a barely-there `box-shadow: 0 1px 2px rgba(44,42,40,.05)`; popovers use `0 4px 12px rgba(44,42,40,.08)`. **No hover lift, no glow, no gradient anywhere.** KPI cards and collapsible config sections get a 3px accent top border for structure; issue cards a 4px coloured left border. That coloured edge is the only "accent bar" the system uses.

## Shapes

- **Cards / panels / KPI / table wrap:** `card` 10px.
- **Buttons / inputs / step tiles:** `sm` 8px.
- **Pills** (`full` 980px): header utilities, status tokens, chips, the 1·2·3 stepper — the pill marks a distinct category, exactly as chips do in the reference. Everything else is rectangular.

## Components

### Buttons
`button-primary` = solid accent, white 12px/700 label, 44px, 8px radius; hover `accent-hover`; disabled = `surface-3` fill + muted text (used constantly — e.g. "Upload and validate" stays disabled until a file is chosen). `button-secondary` = white fill, 1px border, `text` label; hover = accent-tint fill + accent text; `.selected` = same as hover (used as tab-like toggles); `.destructive` = red text, red-tint hover; `.compact` = 36px. `link-button` = bare accent text, 11px/650. **Never** pair a filled and an outlined button as the default action row's whole story — SCT uses one clear primary plus quiet secondaries.

### Inputs & Forms
Label-above; 44px inputs, 8px radius, `border`, focus swaps to `accent`. Field note below in 12px `muted`. Secrets get a "Show" secondary beside the input. Selects are native. File inputs are native ("Choose File / No file chosen"). Invalid field = `red` border + a note in `red`; warning = `amber`.

### Cards, Surfaces & Lists
A card is `.surface`: 10px radius, 1px `border-soft`, faint shadow, 24px padding. Its header (`.surface-heading`) is a row: left = eyebrow + h3, right = a `link-button` or one/two compact secondaries. List/table rows are borderless with `border-soft` dividers; row hover = `accent-bg`.

### Chips & Status tokens
`chip` = `full` pill, green-tint by default (`.amber` variant), used for categorical labels (required/optional columns, "Loaded from API", counts) — never as a button. `status-token` = `full` pill, 10px uppercase, always text+colour: READY/VALID green, RUNNING/IN-PROGRESS accent, QUEUED/PARTIAL amber, FAILED/ERROR red.

### KPI cards & Issue cards
`kpi-card` = white card, 3px accent top border, uppercase label over a 24px number; `.danger` turns border+number red. `issue-card` = card with a 4px left border (amber; `.critical` red): severity label, bold headline, detail, an owner/trade line, and an "Open asset" `link-button`.

### Data table
`.data-table` inside `.data-table-wrap`. Header 10px uppercase `muted` on `surface-2`; cell 10/12 padding, `border-soft` dividers, `tabular-nums`, row hover accent-tint. First column often a checkbox; identifier column bold with a `muted` second line. **Validation on the grid:** an invalid cell fills `red-bg`, a warning cell fills `amber-bg`, and the row carries a status token — this is the Asset Management page's core surface.

### Navigation & stepper
Header: translucent `surface`, logo | divider | brand title over kind line, right-side 30px pills. Tab row grouped by stage with tiny uppercase mono group labels; active tab = accent text + 3px accent underline + `surface` fill. Multi-step flows use a pill stepper ("1 Setup · 2 Run · 3 Results") with the active step an accent-tint pill and completed steps a check circle.

### Typography Application
Eyebrow (11px uppercase mono accent) opens a card section. Page title 32px opens a page. Numbers everywhere are tabular. The `label-sm`-equivalent uppercase treatment is for eyebrows, table headers, KPI labels and status tokens — never body copy.

## Do's and Don'ts

- **Do** import `docs/reference/sct-ui/sct-styles.css` and `sct-electracom-theme.css` verbatim and reuse the class names; add only the register-grid rules SAM needs.
- **Do** reserve teal as the single accent. No second brand colour; status greens/ambers/reds are for state, not decoration.
- **Do** show every state as text **and** colour (Valid/Warning/Error, Complete/Partial/Missing, Active/Archived) — never colour alone.
- **Do** keep the warm cream background. **Don't** revert to the concept mockup's cool grey `#f5f6f9` or blue `#0878e5`.
- **Don't** add an icon pack. The interface is text-first; the only glyphs are stepper checks, numbered circles, section carets and native controls.
- **Don't** use drop shadows, hover lift, or glows for hierarchy. Tone and hairline borders carry depth; a coloured left/top border carries structure.
- **Don't** let the page scroll horizontally. Wide asset grids scroll inside their own bordered wrap with sticky headers.
- **Do** keep both light and dark themes correct, warm not blue-grey, toggled from a header pill (text label, no sun/moon icon).
