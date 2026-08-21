# Electracom Smart Asset Management Tool — Day 1 UI Mockup

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Mocked pages

- Configuration
  - Project selection / creation
  - BDNS-aligned or custom naming convention
  - Auto-generated versus imported/manual Instance Names
  - Trades / system owners
  - Floor, room/space, system and operational-zone reference imports
  - Dynamic Asset Register template schema based on the CONTRACTOR ASSET worksheet
  - Project-specific optional fields, including QR code requirements
- Overview
  - Project and trade-level asset counts
  - Metadata completeness
  - Validation errors
  - Cross-trade duplicate Instance Names
  - Naming compliance
  - Missing mandatory fields
  - QR requirements and recent update information
- Asset Management
  - Trade selection
  - Editable metadata grid
  - Search/filter/import/export controls
  - Cell-level validation highlighting
  - Asset inspector
  - Fault list with navigation back to affected assets

## Important

This is a frontend interaction mockup. Import/export, persistence, spreadsheet parsing and validation are represented in the UI but are not connected to production backend services.
